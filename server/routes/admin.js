const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const User = require("../models/User")
const DoctorProfile = require("../models/DoctorProfile")
const BloodRequest = require("../models/BloodRequest")
const Appointment = require("../models/Appointment")

const router = express.Router()

// Admin dashboard - get all users and system stats
router.get("/dashboard", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const [users, doctors, bloodRequests, appointments] = await Promise.all([
      User.find().select("-password"),
      DoctorProfile.find(),
      BloodRequest.find(),
      Appointment.find()
    ])

    const stats = {
      totalUsers: users.length,
      patients: users.filter((u) => u.role === "patient").length,
      donors: users.filter((u) => u.role === "donor").length,
      doctors: users.filter((u) => u.role === "doctor").length,
      admins: users.filter((u) => u.role === "admin").length,
      activeBloodRequests: bloodRequests.filter(r => r.status === "pending").length,
      completedDonations: bloodRequests.filter(r => r.status === "completed").length,
      scheduledAppointments: appointments.filter(a => a.status === "scheduled").length
    }

    res.json({
      message: "Admin dashboard data",
      data: {
        stats,
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          isProfileComplete: user.isProfileComplete
        })),
      },
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update doctor profile type or availability
router.put("/doctors/:doctorId", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { doctorId } = req.params
    const updates = req.body

    const doctorProfile = await DoctorProfile.findOneAndUpdate(
      { userId: doctorId },
      { $set: updates },
      { new: true }
    )

    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" })
    }

    res.json(doctorProfile)
  } catch (error) {
    console.error("Error updating doctor profile:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
