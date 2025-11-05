const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const HealthRecord = require("../models/HealthRecord")
const BloodRequest = require("../models/BloodRequest")
const PatientProfile = require("../models/PatientProfile")

const router = express.Router()

// Patient dashboard data - load from DB
router.get("/dashboard", authMiddleware, roleMiddleware(["patient"]), async (req, res) => {
  try {
    const userId = req.user._id

    // Latest health record for the patient
    const latestRecord = await HealthRecord.findOne({ patient: userId }).sort({ recordDate: -1 })

    // Patient profile (to get blood group etc.)
    const profile = await PatientProfile.findOne({ userId })

    // Recent pending blood requests (showing for awareness)
    const donorRequests = await BloodRequest.find({ status: "pending" })
      .sort({ dateNeeded: 1 })
      .limit(10)

    const healthTracking = {
      lastCheckup: latestRecord ? latestRecord.recordDate.toISOString().split("T")[0] : null,
      nextAppointment: null, // Appointment model not wired here; left null if not available
      bloodType: profile ? profile.bloodGroup : null,
      status: latestRecord && latestRecord.isEmergency ? "Emergency" : "Stable",
    }

    res.json({
      message: "Patient dashboard data",
      data: {
        healthTracking,
        donorRequests: donorRequests.map((r) => ({
          id: r._id,
          bloodType: r.bloodGroup,
          urgency: r.urgencyLevel ? r.urgencyLevel.charAt(0).toUpperCase() + r.urgencyLevel.slice(1) : "Medium",
          location: r.hospitalName || r.location,
        })),
      },
    })
  } catch (error) {
    console.error("Patient dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
