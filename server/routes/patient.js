const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")

const router = express.Router()

// Patient dashboard data
router.get("/dashboard", authMiddleware, roleMiddleware(["patient"]), (req, res) => {
  res.json({
    message: "Patient dashboard data",
    data: {
      healthTracking: {
        lastCheckup: "2024-01-15",
        nextAppointment: "2024-02-15",
        bloodType: "O+",
        status: "Stable",
      },
      donorRequests: [
        { id: 1, bloodType: "O+", urgency: "High", location: "City Hospital" },
        { id: 2, bloodType: "O+", urgency: "Medium", location: "General Hospital" },
      ],
    },
  })
})

module.exports = router
