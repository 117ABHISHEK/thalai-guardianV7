const express = require("express")
const HealthRecord = require("../models/HealthRecord")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const { notifyDoctorsForEmergencyRecord } = require("../services/notificationService")
const router = express.Router()

// Get patient's health records
router.get("/records/:patientId?", authMiddleware, async (req, res) => {
  try {
    let patientId = req.params.patientId

    // If no patientId provided and user is patient, use their own ID
    if (!patientId && req.user.role === "patient") {
      patientId = req.user.id
    }

    // Check permissions
    if (req.user.role === "patient" && patientId !== req.user.id) {
      return res.status(403).json({ message: "Patients can only view their own records" })
    }

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" })
    }

    const records = await HealthRecord.find({ patient: patientId })
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ recordDate: -1 })

    res.json(records)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get hemoglobin trends for charts
router.get("/trends/:patientId?", authMiddleware, async (req, res) => {
  try {
    let patientId = req.params.patientId

    if (!patientId && req.user.role === "patient") {
      patientId = req.user.id
    }

    // Check permissions
    if (req.user.role === "patient" && patientId !== req.user.id) {
      return res.status(403).json({ message: "Patients can only view their own trends" })
    }

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" })
    }

    const records = await HealthRecord.find({
      patient: patientId,
      hemoglobinLevel: { $exists: true },
    })
      .select("hemoglobinLevel recordDate")
      .sort({ recordDate: 1 })
      .limit(50) // Last 50 records for performance

    const trends = records.map((record) => ({
      date: record.recordDate.toISOString().split("T")[0],
      hemoglobin: record.hemoglobinLevel,
    }))

    res.json(trends)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create health record
router.post("/records", authMiddleware, async (req, res) => {
  try {
    const {
      patient: patientId,
      hemoglobinLevel,
      transfusionHistory,
      doctorNotes,
      medicines,
      symptoms,
      vitalSigns,
      isEmergency,
    } = req.body

    let finalPatientId = patientId

    // If user is patient, use their own ID
    if (req.user.role === "patient") {
      finalPatientId = req.user.id
    }

    // Validate patient exists
    const patient = await User.findById(finalPatientId)
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" })
    }

    // Check permissions
    if (req.user.role === "patient" && finalPatientId !== req.user.id) {
      return res.status(403).json({ message: "Patients can only create their own records" })
    }

    const healthRecord = new HealthRecord({
      patient: finalPatientId,
      doctor: req.user.role === "doctor" ? req.user.id : null,
      hemoglobinLevel,
      transfusionHistory: transfusionHistory || [],
      doctorNotes,
      medicines: medicines || [],
      symptoms: symptoms || [],
      vitalSigns,
      isEmergency: isEmergency || false,
    })

    await healthRecord.save()
    await healthRecord.populate(["patient", "doctor"], "name email")

    if (isEmergency) {
      try {
        // Find all doctors to notify
        const doctors = await User.find({
          role: "doctor",
          email: { $exists: true, $ne: "" },
        })

        if (doctors.length > 0) {
          const notificationResults = await notifyDoctorsForEmergencyRecord(healthRecord, doctors)
          console.log("Emergency health record notifications sent:", notificationResults)
        }
      } catch (notificationError) {
        console.error("Error sending emergency health record notifications:", notificationError)
        // Don't fail the record creation if notifications fail
      }
    }

    res.status(201).json(healthRecord)
  } catch (error) {
    res.status(400).json({ message: "Error creating health record", error: error.message })
  }
})

// Update health record (doctors only)
router.put("/records/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update health records" })
    }

    const healthRecord = await HealthRecord.findById(req.params.id)
    if (!healthRecord) {
      return res.status(404).json({ message: "Health record not found" })
    }

    const { hemoglobinLevel, transfusionHistory, doctorNotes, medicines, symptoms, vitalSigns, isEmergency } = req.body

    // Update fields
    if (hemoglobinLevel !== undefined) healthRecord.hemoglobinLevel = hemoglobinLevel
    if (transfusionHistory !== undefined) healthRecord.transfusionHistory = transfusionHistory
    if (doctorNotes !== undefined) healthRecord.doctorNotes = doctorNotes
    if (medicines !== undefined) healthRecord.medicines = medicines
    if (symptoms !== undefined) healthRecord.symptoms = symptoms
    if (vitalSigns !== undefined) healthRecord.vitalSigns = vitalSigns
    if (isEmergency !== undefined) healthRecord.isEmergency = isEmergency

    // Set doctor if not already set
    if (!healthRecord.doctor && req.user.role === "doctor") {
      healthRecord.doctor = req.user.id
    }

    await healthRecord.save()
    await healthRecord.populate(["patient", "doctor"], "name email")

    res.json(healthRecord)
  } catch (error) {
    res.status(400).json({ message: "Error updating health record", error: error.message })
  }
})

// Get all patients for doctors
router.get("/patients", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view patient list" })
    }

    const patients = await User.find({ role: "patient" }).select("name email createdAt").sort({ name: 1 })

    res.json(patients)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get emergency records (for doctors only)
router.get("/emergency", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view emergency records" })
    }

    const emergencyRecords = await HealthRecord.find({ isEmergency: true })
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(emergencyRecords)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
