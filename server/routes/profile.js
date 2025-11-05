const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const User = require("../models/User")
const PatientProfile = require("../models/PatientProfile")
const DonorProfile = require("../models/DonorProfile")
const DoctorProfile = require("../models/DoctorProfile")
const HospitalProfile = require("../models/HospitalProfile")

const router = express.Router()

// Get user profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Only allow users to view their own profile
    const userId = req.user._id
    
    if (userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view your own profile" })
    }

    const user = await User.findById(userId).select("-password")
    let profile = null

    // Get role-specific profile
    switch (user.role) {
      case "patient":
        profile = await PatientProfile.findOne({ userId: user._id })
        break
      case "donor":
        profile = await DonorProfile.findOne({ userId: user._id })
        break
      case "doctor":
        profile = await DoctorProfile.findOne({ userId: user._id })
        break
      case "hospital":
        profile = await HospitalProfile.findOne({ userId: user._id })
        break
    }

    res.json({ user, profile })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Complete profile
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const { basicInfo, roleSpecificData } = req.body
    const userId = req.user._id

    // Only allow users to complete their own profile
    if (userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only complete your own profile" })
    }

    // Update basic user info
    await User.findByIdAndUpdate(userId, {
      ...basicInfo,
      isProfileComplete: true,
    })

    // Create role-specific profile
    let profile
    switch (req.user.role) {
      case "patient":
        profile = new PatientProfile({ userId, ...roleSpecificData })
        break
      case "donor":
        profile = new DonorProfile({ userId, ...roleSpecificData })
        break
      case "doctor":
        profile = new DoctorProfile({ userId, ...roleSpecificData })
        break
      case "hospital":
        profile = new HospitalProfile({ userId, ...roleSpecificData })
        break
    }

    if (profile) {
      await profile.save()
    }

    res.json({ message: "Profile completed successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { basicInfo, roleSpecificData } = req.body
    const userId = req.user._id

    // Only allow users to update their own profile
    if (userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own profile" })
    }

    // Update basic user info
    if (basicInfo) {
      await User.findByIdAndUpdate(userId, basicInfo)
    }

    // Update role-specific profile
    if (roleSpecificData) {
      switch (req.user.role) {
        case "patient":
          await PatientProfile.findOneAndUpdate({ userId }, roleSpecificData, { upsert: true })
          break
        case "donor":
          await DonorProfile.findOneAndUpdate({ userId }, roleSpecificData, { upsert: true })
          break
        case "doctor":
          await DoctorProfile.findOneAndUpdate({ userId }, roleSpecificData, { upsert: true })
          break
        case "hospital":
          await HospitalProfile.findOneAndUpdate({ userId }, roleSpecificData, { upsert: true })
          break
      }
    }

    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
