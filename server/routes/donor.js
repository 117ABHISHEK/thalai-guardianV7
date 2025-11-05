const express = require("express")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const DonorProfile = require("../models/DonorProfile")
const BloodRequest = require("../models/BloodRequest")

const router = express.Router()

// Donor dashboard data - load from DB
router.get("/dashboard", authMiddleware, roleMiddleware(["donor"]), async (req, res) => {
  try {
    const userId = req.user._id

    const donorProfile = await DonorProfile.findOne({ userId })

    // Recent pending blood requests
    const bloodRequests = await BloodRequest.find({ status: "pending" }).sort({ dateNeeded: 1 }).limit(10)

    res.json({
      message: "Donor dashboard data",
      data: {
        donationHistory: (donorProfile?.donationHistory || []).map((d) => ({
          date: d.date ? d.date.toISOString().split("T")[0] : null,
          location: d.hospitalId || "Unknown",
          amount: d.units ? `${d.units} unit(s)` : "1 unit",
        })),
        bloodRequests: bloodRequests.map((r) => ({
          id: r._id,
          bloodType: r.bloodGroup,
          urgency: r.urgencyLevel ? r.urgencyLevel.charAt(0).toUpperCase() + r.urgencyLevel.slice(1) : "Medium",
          hospital: r.hospitalName || r.location,
        })),
      },
    })
  } catch (error) {
    console.error("Donor dashboard error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
