const express = require("express")
const Hospital = require("../models/Hospital")
const User = require("../models/User")
const { authMiddleware, roleMiddleware } = require("../middleware/auth")
const router = express.Router()

// Get all hospitals with optional filters
router.get("/", async (req, res) => {
  try {
    const { city, state, bloodType, verified = "true" } = req.query

    const filter = { isVerified: verified === "true" }

    if (city) filter["address.city"] = { $regex: city, $options: "i" }
    if (state) filter["address.state"] = { $regex: state, $options: "i" }

    let hospitals = await Hospital.find(filter).populate("registeredBy", "name email").sort({ name: 1 })

    // Filter by blood availability if bloodType is specified
    if (bloodType) {
      hospitals = hospitals.filter((hospital) =>
        hospital.bloodInventory.some(
          (inventory) =>
            inventory.bloodType === bloodType &&
            inventory.unitsAvailable > 0 &&
            new Date(inventory.expiryDate) > new Date(),
        ),
      )
    }

    res.json(hospitals)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single hospital
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate("registeredBy", "name email")
      .populate("donationCamps.registeredDonors.donor", "name email")

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    res.json(hospital)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Register new hospital
router.post("/register", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address, coordinates, licenseNumber, type, specialties } = req.body

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({
      $or: [{ email }, { licenseNumber }],
    })

    if (existingHospital) {
      return res.status(400).json({
        message: "Hospital with this email or license number already exists",
      })
    }

    const hospital = new Hospital({
      name,
      email,
      phone,
      address,
      coordinates,
      licenseNumber,
      type,
      specialties: specialties || [],
      registeredBy: req.user.id,
      bloodInventory: [],
      donationCamps: [],
    })

    await hospital.save()
    await hospital.populate("registeredBy", "name email")

    res.status(201).json(hospital)
  } catch (error) {
    res.status(400).json({ message: "Error registering hospital", error: error.message })
  }
})

// Update hospital (only by registeredBy user)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    // Check permissions: only hospital owner (registeredBy) may update
    if (hospital.registeredBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this hospital" })
    }

    const { name, email, phone, address, coordinates, type, specialties } = req.body

    // Update fields
    if (name) hospital.name = name
    if (email) hospital.email = email
    if (phone) hospital.phone = phone
    if (address) hospital.address = address
    if (coordinates) hospital.coordinates = coordinates
    if (type) hospital.type = type
    if (specialties) hospital.specialties = specialties

    await hospital.save()
    await hospital.populate("registeredBy", "name email")

    res.json(hospital)
  } catch (error) {
    res.status(400).json({ message: "Error updating hospital", error: error.message })
  }
})

// Update blood inventory
router.put("/:id/inventory", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    // Check permissions: only hospital owner (registeredBy) may update inventory
    if (hospital.registeredBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update inventory" })
    }

    const { bloodInventory } = req.body

    // Validate blood inventory
    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    for (const item of bloodInventory) {
      if (!validBloodTypes.includes(item.bloodType)) {
        return res.status(400).json({ message: `Invalid blood type: ${item.bloodType}` })
      }
      if (item.unitsAvailable < 0) {
        return res.status(400).json({ message: "Units available cannot be negative" })
      }
    }

    hospital.bloodInventory = bloodInventory.map((item) => ({
      ...item,
      lastUpdated: new Date(),
    }))

    await hospital.save()
    res.json(hospital)
  } catch (error) {
    res.status(400).json({ message: "Error updating inventory", error: error.message })
  }
})

// Add donation camp
router.post("/:id/camps", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    // Check permissions: only hospital owner (registeredBy) may add donation camps
    if (hospital.registeredBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to add donation camps" })
    }

    const { title, description, date, startTime, endTime, location, maxDonors } = req.body

    const newCamp = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      maxDonors: maxDonors || 50,
      registeredDonors: [],
    }

    hospital.donationCamps.push(newCamp)
    await hospital.save()

    res.status(201).json(hospital.donationCamps[hospital.donationCamps.length - 1])
  } catch (error) {
    res.status(400).json({ message: "Error adding donation camp", error: error.message })
  }
})

// Register for donation camp
router.post("/:hospitalId/camps/:campId/register", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can register for donation camps" })
    }

    const hospital = await Hospital.findById(req.params.hospitalId)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    const camp = hospital.donationCamps.id(req.params.campId)

    if (!camp) {
      return res.status(404).json({ message: "Donation camp not found" })
    }

    if (!camp.isActive) {
      return res.status(400).json({ message: "This donation camp is no longer active" })
    }

    if (new Date(camp.date) < new Date()) {
      return res.status(400).json({ message: "Cannot register for past donation camps" })
    }

    // Check if already registered
    const alreadyRegistered = camp.registeredDonors.some(
      (registration) => registration.donor.toString() === req.user.id,
    )

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered for this donation camp" })
    }

    // Check capacity
    if (camp.registeredDonors.length >= camp.maxDonors) {
      return res.status(400).json({ message: "Donation camp is full" })
    }

    camp.registeredDonors.push({
      donor: req.user.id,
      registrationDate: new Date(),
    })

    await hospital.save()
    await hospital.populate("donationCamps.registeredDonors.donor", "name email")

    res.json(camp)
  } catch (error) {
    res.status(400).json({ message: "Error registering for donation camp", error: error.message })
  }
})

// Get upcoming donation camps
router.get("/camps/upcoming", async (req, res) => {
  try {
    const { city, state } = req.query

    const filter = { isVerified: true }

    if (city) filter["address.city"] = { $regex: city, $options: "i" }
    if (state) filter["address.state"] = { $regex: state, $options: "i" }

    const hospitals = await Hospital.find(filter).populate("donationCamps.registeredDonors.donor", "name email")

    const upcomingCamps = []

    hospitals.forEach((hospital) => {
      hospital.donationCamps.forEach((camp) => {
        if (camp.isActive && new Date(camp.date) >= new Date()) {
          upcomingCamps.push({
            ...camp.toObject(),
            hospital: {
              _id: hospital._id,
              name: hospital.name,
              address: hospital.address,
              phone: hospital.phone,
            },
          })
        }
      })
    })

    // Sort by date
    upcomingCamps.sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json(upcomingCamps)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Verify hospital (hospital owner only)
router.put("/:id/verify", authMiddleware, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" })
    }

    // Only hospital owner can mark their hospital as verified
    if (hospital.registeredBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to verify this hospital" })
    }

    hospital.isVerified = true
    await hospital.save()

    res.json({ message: "Hospital verified successfully", hospital })
  } catch (error) {
    res.status(400).json({ message: "Error verifying hospital", error: error.message })
  }
})

module.exports = router
