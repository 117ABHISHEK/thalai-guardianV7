const express = require("express")
const Counselor = require("../models/Counselor")
const Appointment = require("../models/Appointment")
const ChatSession = require("../models/ChatSession")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const chatbotService = require("../services/chatbotService")
const router = express.Router()

// Chatbot endpoints

// Get or create chat session
router.get("/chat/session", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can access mental health chat" })
    }

    let session = await ChatSession.findOne({
      patient: req.user.id,
      isActive: true,
    }).sort({ lastActivity: -1 })

    if (!session) {
      session = new ChatSession({
        patient: req.user.id,
        messages: [
          {
            sender: "bot",
            message:
              "Hello! I'm your mental health support assistant. I'm here to listen and provide emotional support. How are you feeling today?",
            timestamp: new Date(),
            intent: "greeting",
          },
        ],
      })
      await session.save()
    }

    res.json(session)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Send message to chatbot
router.post("/chat/message", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can access mental health chat" })
    }

    const { message, sessionId } = req.body

    if (!message || !sessionId) {
      return res.status(400).json({ message: "Message and session ID are required" })
    }

    const session = await ChatSession.findById(sessionId)
    if (!session || session.patient.toString() !== req.user.id) {
      return res.status(404).json({ message: "Chat session not found" })
    }

    // Add patient message
    session.messages.push({
      sender: "patient",
      message: message.trim(),
      timestamp: new Date(),
    })

    // Process message with chatbot
    const botResponse = chatbotService.processMessage(message)

    // Add bot response
    session.messages.push({
      sender: "bot",
      message: botResponse.response,
      timestamp: new Date(),
      intent: botResponse.intent,
    })

    session.lastActivity = new Date()
    await session.save()

    res.json({
      botMessage: {
        sender: "bot",
        message: botResponse.response,
        timestamp: new Date(),
        intent: botResponse.intent,
      },
      suggestions: botResponse.suggestions,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// End chat session
router.put("/chat/session/:id/end", authMiddleware, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id)

    if (!session || session.patient.toString() !== req.user.id) {
      return res.status(404).json({ message: "Chat session not found" })
    }

    session.isActive = false
    await session.save()

    res.json({ message: "Chat session ended" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Counselor endpoints

// Get all counselors
router.get("/counselors", authMiddleware, async (req, res) => {
  try {
    const { specialization } = req.query

    const filter = { isActive: true, isVerified: true }

    if (specialization) {
      filter.specializations = { $in: [specialization] }
    }

    const counselors = await Counselor.find(filter).select("-registeredBy").sort({ name: 1 })

    res.json(counselors)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single counselor
router.get("/counselors/:id", authMiddleware, async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id).select("-registeredBy")

    if (!counselor || !counselor.isActive || !counselor.isVerified) {
      return res.status(404).json({ message: "Counselor not found" })
    }

    res.json(counselor)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Register new counselor (admin only)
router.post("/counselors", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can register counselors" })
    }

    const { name, email, phone, specializations, qualifications, experience, bio, availability } = req.body

    // Check if counselor already exists
    const existingCounselor = await Counselor.findOne({ email })
    if (existingCounselor) {
      return res.status(400).json({ message: "Counselor with this email already exists" })
    }

    const counselor = new Counselor({
      name,
      email,
      phone,
      specializations: specializations || [],
      qualifications: qualifications || [],
      experience,
      bio,
      availability: availability || [],
      registeredBy: req.user.id,
    })

    await counselor.save()
    res.status(201).json(counselor)
  } catch (error) {
    res.status(400).json({ message: "Error registering counselor", error: error.message })
  }
})

// Appointment endpoints

// Get patient's appointments
router.get("/appointments", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can view appointments" })
    }

    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("counselor", "name email phone specializations")
      .sort({ appointmentDate: -1 })

    res.json(appointments)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Book appointment
router.post("/appointments", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" })
    }

    const { counselor: counselorId, appointmentDate, startTime, endTime, sessionType, reason, notes } = req.body

    // Validate counselor exists and is available
    const counselor = await Counselor.findById(counselorId)
    if (!counselor || !counselor.isActive || !counselor.isVerified) {
      return res.status(404).json({ message: "Counselor not found or not available" })
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      counselor: counselorId,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ["scheduled", "confirmed"] },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
      ],
    })

    if (conflictingAppointment) {
      return res.status(400).json({ message: "Time slot is not available" })
    }

    const appointment = new Appointment({
      patient: req.user.id,
      counselor: counselorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      sessionType: sessionType || "video",
      reason,
      notes: {
        patient: notes || "",
      },
    })

    await appointment.save()
    await appointment.populate("counselor", "name email phone specializations")

    res.status(201).json(appointment)
  } catch (error) {
    res.status(400).json({ message: "Error booking appointment", error: error.message })
  }
})

// Update appointment status
router.put("/appointments/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check permissions
    const isPatient = req.user.role === "patient" && appointment.patient.toString() === req.user.id
    const isAdmin = req.user.role === "admin"

    if (!isPatient && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this appointment" })
    }

    appointment.status = status
    await appointment.save()
    await appointment.populate("counselor", "name email phone specializations")

    res.json(appointment)
  } catch (error) {
    res.status(400).json({ message: "Error updating appointment", error: error.message })
  }
})

// Get available time slots for a counselor
router.get("/counselors/:id/availability", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ message: "Date is required" })
    }

    const counselor = await Counselor.findById(req.params.id)
    if (!counselor || !counselor.isActive || !counselor.isVerified) {
      return res.status(404).json({ message: "Counselor not found" })
    }

    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

    // Find counselor's availability for the day
    const dayAvailability = counselor.availability.find((avail) => avail.dayOfWeek === dayOfWeek)

    if (!dayAvailability) {
      return res.json({ availableSlots: [] })
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      counselor: req.params.id,
      appointmentDate: requestedDate,
      status: { $in: ["scheduled", "confirmed"] },
    })

    // Generate available time slots (1-hour slots)
    const availableSlots = []
    const startHour = Number.parseInt(dayAvailability.startTime.split(":")[0])
    const endHour = Number.parseInt(dayAvailability.endTime.split(":")[0])

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, "0")}:00`
      const slotEnd = `${(hour + 1).toString().padStart(2, "0")}:00`

      // Check if slot is available
      const isBooked = existingAppointments.some((apt) => apt.startTime <= slotStart && apt.endTime > slotStart)

      if (!isBooked) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd,
        })
      }
    }

    res.json({ availableSlots })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
