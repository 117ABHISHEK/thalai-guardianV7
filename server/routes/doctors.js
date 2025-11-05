const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const DoctorProfile = require("../models/DoctorProfile")
const Appointment = require("../models/Appointment")

const router = express.Router()

// Get available medical doctors
router.get("/available", authMiddleware, async (req, res) => {
  try {
    const doctors = await DoctorProfile.find({
      doctorType: "medical",
      isAcceptingAppointments: true,
    }).populate("userId", "name")

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor.userId._id,
      name: doctor.userId.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      hospital: doctor.hospital,
      availableHours: doctor.availableHours,
      availableDays: doctor.availableDays,
    }))

    res.json(formattedDoctors)
  } catch (error) {
    console.error("Error fetching doctors:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get doctor's available slots for a specific date
router.get("/:doctorId/availability", authMiddleware, async (req, res) => {
  try {
    const { doctorId } = req.params
    const { date } = req.query

    const doctor = await DoctorProfile.findOne({
      userId: doctorId,
      isAcceptingAppointments: true,
    })

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found or not accepting appointments" })
    }

    // Get existing appointments for the date (appointments reference doctor)
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: new Date(date),
      status: { $nin: ["cancelled"] },
    })

    // Generate available slots based on doctor's schedule and existing appointments
    const slots = generateAvailableSlots(doctor, existingAppointments, date)
    
    res.json({ availableSlots: slots })
  } catch (error) {
    console.error("Error fetching availability:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Book an appointment with a doctor
router.post("/appointments", authMiddleware, async (req, res) => {
  try {
  const { doctorId, appointmentDate, startTime, endTime, reason, notes } = req.body
    const patientId = req.user._id

    // Verify doctor exists and is accepting appointments
    const doctor = await DoctorProfile.findOne({
      userId: doctorId,
      isAcceptingAppointments: true,
    })

    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found or not accepting appointments" })
    }

    // Check if slot is still available
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate,
      startTime,
      status: { $nin: ["cancelled"] },
    })

    if (conflictingAppointment) {
      return res.status(400).json({ message: "This time slot is no longer available" })
    }

    // Create appointment (store doctor reference)
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      appointmentDate,
      startTime,
      endTime,
      reason,
      notes: { patient: notes },
      sessionType: "in-person", // Default for medical appointments
      status: "scheduled",
    })

    await appointment.save()

    res.status(201).json(appointment)
  } catch (error) {
    console.error("Error booking appointment:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Helper function to generate available time slots
function generateAvailableSlots(doctor, existingAppointments, date) {
  const slots = []
  const [startHour] = doctor.availableHours.start.split(":").map(Number)
  const [endHour] = doctor.availableHours.end.split(":").map(Number)
  const duration = doctor.appointmentDuration || 30 // minutes

  // Convert date string to Date object
  const appointmentDate = new Date(date)
  const dayOfWeek = appointmentDate.getDay()
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

  // Check if doctor works on this day
  if (!doctor.availableDays.includes(days[dayOfWeek])) {
    return slots
  }

  // Generate all possible slots
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const endTimeDate = new Date(appointmentDate)
      endTimeDate.setHours(hour)
      endTimeDate.setMinutes(minute + duration)
      const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${endTimeDate.getMinutes().toString().padStart(2, "0")}`

      // Check if slot conflicts with existing appointments
      const isSlotTaken = existingAppointments.some(apt => 
        apt.startTime === startTime || 
        (apt.startTime < startTime && apt.endTime > startTime)
      )

      if (!isSlotTaken) {
        slots.push({ startTime, endTime })
      }

      // Stop if we've hit the max daily appointments
      if (slots.length >= (doctor.maxDailyAppointments || 20)) {
        break
      }
    }
  }

  return slots
}

module.exports = router