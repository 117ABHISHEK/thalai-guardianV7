const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const HealthRecord = require("../models/HealthRecord")
const Appointment = require("../models/Appointment")

const router = express.Router()

// Doctor dashboard data - load from DB
router.get("/dashboard", authMiddleware, roleMiddleware(["doctor"]), async (req, res) => {
  try {
    const userId = req.user._id

    // Patient records where this doctor is assigned or recent records if none assigned
    let patientRecords = await HealthRecord.find({ doctor: userId }).populate("patient", "name")

    if (!patientRecords || patientRecords.length === 0) {
      // fallback: recent health records across patients
      patientRecords = await HealthRecord.find().sort({ recordDate: -1 }).limit(10).populate("patient", "name")
    }

    // Appointments (if any) - many apps use a different appointment model; use generic Appointment model
    const appointments = await Appointment.find({}).sort({ appointmentDate: 1 }).limit(10).populate("patient", "name")

    res.json({
      message: "Doctor dashboard data",
      data: {
        patientRecords: patientRecords.map((p) => ({
          id: p._id,
          name: p.patient?.name || "Unknown",
          condition: p.doctorNotes || "N/A",
          lastVisit: p.recordDate ? p.recordDate.toISOString().split("T")[0] : null,
        })),
        appointments: appointments.map((a) => ({
          id: a._id,
          patient: a.patient?.name || "Unknown",
          time: a.startTime,
          date: a.appointmentDate ? a.appointmentDate.toISOString().split("T")[0] : null,
        })),
      },
    })
  } catch (error) {
    console.error("Doctor dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
