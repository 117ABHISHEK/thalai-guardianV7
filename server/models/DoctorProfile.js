const mongoose = require("mongoose")

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    licenseId: {
      type: String,
      required: true,
      unique: true,
    },
    hospital: {
      type: String,
      required: true,
    },
    experience: {
      type: Number, // years of experience
      default: 0,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    availableHours: {
      start: String, // "09:00"
      end: String, // "17:00"
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema)
