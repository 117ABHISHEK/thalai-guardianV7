const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const DoctorProfile = require("../models/DoctorProfile")
const User = require("../models/User")

const router = express.Router()

// Get all available medical professionals (both doctors and counselors)
router.get("/counselors", authMiddleware, async (req, res) => {
  try {
    // Get all doctor profiles with populated user data
    const doctorProfiles = await DoctorProfile.find({
      isAcceptingAppointments: true
    }).populate('userId', 'name')

    const professionals = doctorProfiles.map(profile => ({
      _id: profile.userId._id,
      name: profile.userId.name,
      specialization: profile.specialization,
      specializations: [profile.specialization], // For compatibility with existing UI
      doctorType: profile.doctorType,
      experience: profile.experience,
      hospital: profile.hospital,
      bio: `${profile.specialization} specialist with ${profile.experience} years of experience`,
      availableHours: profile.availableHours,
      availableDays: profile.availableDays
    }))

    res.json(professionals)
  } catch (error) {
    console.error("Error fetching medical professionals:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get available slots for a medical professional
router.get("/counselors/:counselorId/availability", authMiddleware, async (req, res) => {
  try {
    const { counselorId } = req.params
    const { date } = req.query

    const doctor = await DoctorProfile.findOne({
      userId: counselorId,
      isAcceptingAppointments: true
    })

    if (!doctor) {
      return res.status(404).json({ message: "Medical professional not found or not accepting appointments" })
    }

    // Generate time slots based on doctor's schedule
    const availableSlots = generateTimeSlots(doctor, date)
    
    res.json({ availableSlots })
  } catch (error) {
    console.error("Error fetching availability:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper function to generate time slots
function generateTimeSlots(doctor, date) {
  const slots = []
  const [startHour] = doctor.availableHours.start.split(":").map(Number)
  const [endHour] = doctor.availableHours.end.split(":").map(Number)
  const duration = doctor.appointmentDuration || 30 // minutes

  // Convert date string to Date object to get day of week
  const appointmentDate = new Date(date)
  const dayOfWeek = appointmentDate.getDay()
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  // Check if doctor works on this day
  if (!doctor.availableDays.includes(days[dayOfWeek])) {
    return slots
  }

  // Generate slots for the day
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const endTimeDate = new Date(appointmentDate)
      endTimeDate.setHours(hour)
      endTimeDate.setMinutes(minute + duration)
      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${endTimeDate.getMinutes().toString().padStart(2, "0")}`

      slots.push({ startTime, endTime })
    }
  }

  return slots.slice(0, doctor.maxDailyAppointments || 20) // Limit by max daily appointments
}

module.exports = router