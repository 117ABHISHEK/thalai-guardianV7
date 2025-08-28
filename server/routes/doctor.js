const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")

const router = express.Router()

// Doctor dashboard data
router.get("/dashboard", authMiddleware, roleMiddleware(["doctor"]), (req, res) => {
  res.json({
    message: "Doctor dashboard data",
    data: {
      patientRecords: [
        { id: 1, name: "John Doe", condition: "Thalassemia Major", lastVisit: "2024-01-20" },
        { id: 2, name: "Jane Smith", condition: "Thalassemia Minor", lastVisit: "2024-01-18" },
        { id: 3, name: "Mike Johnson", condition: "Beta Thalassemia", lastVisit: "2024-01-15" },
      ],
      appointments: [
        { id: 1, patient: "John Doe", time: "10:00 AM", date: "2024-01-25" },
        { id: 2, patient: "Jane Smith", time: "2:00 PM", date: "2024-01-25" },
      ],
    },
  })
})

module.exports = router
