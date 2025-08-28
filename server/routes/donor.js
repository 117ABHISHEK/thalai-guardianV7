const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")

const router = express.Router()

// Donor dashboard data
router.get("/dashboard", authMiddleware, roleMiddleware(["donor"]), (req, res) => {
  res.json({
    message: "Donor dashboard data",
    data: {
      donationHistory: [
        { date: "2024-01-10", location: "City Hospital", amount: "450ml" },
        { date: "2023-11-15", location: "Blood Bank", amount: "450ml" },
      ],
      bloodRequests: [
        { id: 1, bloodType: "O+", urgency: "Critical", hospital: "Emergency Hospital" },
        { id: 2, bloodType: "O+", urgency: "High", hospital: "City Hospital" },
        { id: 3, bloodType: "O+", urgency: "Medium", hospital: "General Hospital" },
      ],
    },
  })
})

module.exports = router
