const express = require("express")
const BloodRequest = require("../models/BloodRequest")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const { notifyDonorsForCriticalRequest, notifyPatientStatusUpdate } = require("../services/notificationService")
const router = express.Router()

// Get all blood requests (for donors to view)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { bloodGroup, location, urgencyLevel, status = "pending" } = req.query

    const filter = { status }

    if (bloodGroup) filter.bloodGroup = bloodGroup
    if (location) filter.location = { $regex: location, $options: "i" }
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel

    const requests = await BloodRequest.find(filter)
      .populate("patient", "name email")
      .populate("donor", "name email")
      .sort({ urgencyLevel: -1, createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user's blood requests
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const filter = {}

    if (req.user.role === "patient") {
      filter.patient = req.user.id
    } else if (req.user.role === "donor") {
      filter.donor = req.user.id
    }

    const requests = await BloodRequest.find(filter)
      .populate("patient", "name email")
      .populate("donor", "name email")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create blood request (patients only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can create blood requests" })
    }

    const { bloodGroup, urgencyLevel, hospitalName, location, dateNeeded, notes, unitsNeeded } = req.body

    const bloodRequest = new BloodRequest({
      patient: req.user.id,
      bloodGroup,
      urgencyLevel,
      hospitalName,
      location,
      dateNeeded,
      notes,
      unitsNeeded,
    })

    await bloodRequest.save()
    await bloodRequest.populate("patient", "name email")

    if (urgencyLevel === "critical") {
      try {
        // Find eligible donors (same blood group or universal donors)
        const compatibleBloodTypes = getCompatibleDonorTypes(bloodGroup)
        const donors = await User.find({
          role: "donor",
          phone: { $exists: true, $ne: "" },
        }).limit(50) // Limit to prevent spam

        if (donors.length > 0) {
          const notificationResults = await notifyDonorsForCriticalRequest(bloodRequest, donors)
          console.log("Critical blood request notifications sent:", notificationResults)
        }
      } catch (notificationError) {
        console.error("Error sending critical blood request notifications:", notificationError)
        // Don't fail the request creation if notifications fail
      }
    }

    res.status(201).json(bloodRequest)
  } catch (error) {
    res.status(400).json({ message: "Error creating blood request", error: error.message })
  }
})

// Accept blood request (donors only)
router.put("/:id/accept", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can accept blood requests" })
    }

    const bloodRequest = await BloodRequest.findById(req.params.id)

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" })
    }

    if (bloodRequest.status !== "pending") {
      return res.status(400).json({ message: "Blood request is no longer available" })
    }

    bloodRequest.status = "accepted"
    bloodRequest.donor = req.user.id

    await bloodRequest.save()
    await bloodRequest.populate(["patient", "donor"], "name email")

    res.json(bloodRequest)
  } catch (error) {
    res.status(400).json({ message: "Error accepting blood request", error: error.message })
  }
})

// Update blood request status
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate("patient", "name email")
      .populate("donor", "name email")

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" })
    }

    // Check permissions
    const isPatient = req.user.role === "patient" && bloodRequest.patient._id.toString() === req.user.id
    const isDonor = req.user.role === "donor" && bloodRequest.donor && bloodRequest.donor._id.toString() === req.user.id
    const isDoctor = req.user.role === "doctor"

    if (!isPatient && !isDonor && !isDoctor) {
      return res.status(403).json({ message: "Not authorized to update this request" })
    }

    const oldStatus = bloodRequest.status
    bloodRequest.status = status
    await bloodRequest.save()

    if (oldStatus !== status && ["accepted", "completed", "cancelled"].includes(status)) {
      try {
        await notifyPatientStatusUpdate(bloodRequest, status)
        console.log(`Status update notification sent to patient for request ${bloodRequest._id}`)
      } catch (notificationError) {
        console.error("Error sending status update notification:", notificationError)
        // Don't fail the status update if notification fails
      }
    }

    res.json(bloodRequest)
  } catch (error) {
    res.status(400).json({ message: "Error updating blood request", error: error.message })
  }
})

// Delete blood request
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found" })
    }

    // Only patient who created it can delete
    if (bloodRequest.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this request" })
    }

    await BloodRequest.findByIdAndDelete(req.params.id)
    res.json({ message: "Blood request deleted successfully" })
  } catch (error) {
    res.status(400).json({ message: "Error deleting blood request", error: error.message })
  }
})

// Helper function to get compatible donor blood types
function getCompatibleDonorTypes(recipientBloodType) {
  const compatibility = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  }

  return compatibility[recipientBloodType] || []
}

module.exports = router
