const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const PatientProfile = require("../models/PatientProfile")
const DoctorProfile = require("../models/DoctorProfile")
const DonorProfile = require("../models/DonorProfile")

const router = express.Router()

// Assign primary doctor to patient
router.post("/patient/primary-doctor", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id
    const { doctorId } = req.body

    const patientProfile = await PatientProfile.findOne({ userId: patientId })
    if (!patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" })
    }

    // Update patient's primary doctor
    patientProfile.primaryDoctor = doctorId
    await patientProfile.save()

    // Add patient to doctor's regular patients if not already present
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId })
    if (!doctorProfile.regularPatients.some(p => p.patient.toString() === patientId)) {
      doctorProfile.regularPatients.push({
        patient: patientId,
        since: new Date(),
        status: "active"
      })
      await doctorProfile.save()
    }

    res.json({ message: "Primary doctor assigned successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add regular donor to patient
router.post("/patient/regular-donor", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id
    const { donorId } = req.body

    const patientProfile = await PatientProfile.findOne({ userId: patientId })
    if (!patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" })
    }

    // Add donor to patient's regular donors if not already present
    if (!patientProfile.regularDonors.some(d => d.donor.toString() === donorId)) {
      patientProfile.regularDonors.push({
        donor: donorId,
        since: new Date(),
        status: "active"
      })
      await patientProfile.save()
    }

    // Add patient to donor's regular patients
    const donorProfile = await DonorProfile.findOne({ userId: donorId })
    if (!donorProfile.regularPatients.some(p => p.patient.toString() === patientId)) {
      donorProfile.regularPatients.push({
        patient: patientId,
        since: new Date(),
        status: "active",
        assignedDoctor: patientProfile.primaryDoctor
      })
      await donorProfile.save()
    }

    res.json({ message: "Regular donor added successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get doctor's regular patients
router.get("/doctor/regular-patients", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.user.id

    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId })
      .populate({
        path: 'regularPatients.patient',
        select: 'name email'
      })

    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" })
    }

    res.json(doctorProfile.regularPatients)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get patient's regular donors
router.get("/patient/regular-donors", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.id

    const patientProfile = await PatientProfile.findOne({ userId: patientId })
      .populate({
        path: 'regularDonors.donor',
        select: 'name email'
      })

    if (!patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" })
    }

    res.json(patientProfile.regularDonors)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get donor's regular patients
router.get("/donor/regular-patients", authMiddleware, async (req, res) => {
  try {
    const donorId = req.user.id

    const donorProfile = await DonorProfile.findOne({ userId: donorId })
      .populate({
        path: 'regularPatients.patient',
        select: 'name email'
      })
      .populate({
        path: 'regularPatients.assignedDoctor',
        select: 'name email'
      })

    if (!donorProfile) {
      return res.status(404).json({ message: "Donor profile not found" })
    }

    res.json(donorProfile.regularPatients)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update relationship status (active/inactive)
router.put("/relationship-status", authMiddleware, async (req, res) => {
  try {
    const { type, targetId, status } = req.body
    const userId = req.user.id

    switch (type) {
      case "doctor-patient":
        await DoctorProfile.updateOne(
          { userId, "regularPatients.patient": targetId },
          { $set: { "regularPatients.$.status": status } }
        )
        break
      case "patient-donor":
        await PatientProfile.updateOne(
          { userId, "regularDonors.donor": targetId },
          { $set: { "regularDonors.$.status": status } }
        )
        await DonorProfile.updateOne(
          { userId: targetId, "regularPatients.patient": userId },
          { $set: { "regularPatients.$.status": status } }
        )
        break
      default:
        return res.status(400).json({ message: "Invalid relationship type" })
    }

    res.json({ message: "Relationship status updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router