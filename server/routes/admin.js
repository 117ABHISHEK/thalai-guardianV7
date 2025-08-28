const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

// Admin dashboard - get all users
router.get("/dashboard", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password")
    const stats = {
      totalUsers: users.length,
      patients: users.filter((u) => u.role === "patient").length,
      donors: users.filter((u) => u.role === "donor").length,
      doctors: users.filter((u) => u.role === "doctor").length,
      admins: users.filter((u) => u.role === "admin").length,
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
        })),
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
