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
    doctorType: {
      type: String,
      enum: ["medical", "counselor"],
      required: true,
      default: "medical",
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
    availableDays: {
      type: [String],
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    appointmentDuration: {
      type: Number, // minutes
      default: 30,
    },
    maxDailyAppointments: {
      type: Number,
      default: 20,
    },
    isAcceptingAppointments: {
      type: Boolean,
      default: true,
    },
    regularPatients: [{
      patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      since: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
      },
      lastVisit: Date,
      notes: String
    }],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema)
