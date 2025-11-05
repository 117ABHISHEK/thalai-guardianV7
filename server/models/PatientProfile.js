const mongoose = require("mongoose")

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    medicalHistory: {
      type: String,
      default: "",
    },
    currentMedication: {
      type: String,
      default: "",
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    healthLogs: [
      {
        hemoglobin: Number,
        date: { type: Date, default: Date.now },
        notes: String,
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    primaryDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    regularDonors: [{
      donor: {
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
      lastDonation: Date
    }],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("PatientProfile", patientProfileSchema)
