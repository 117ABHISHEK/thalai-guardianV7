const mongoose = require("mongoose")

const donorProfileSchema = new mongoose.Schema(
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
    lastDonationDate: {
      type: Date,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    availableForEmergency: {
      type: Boolean,
      default: true,
    },
    donationHistory: [
      {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["completed", "scheduled", "cancelled"],
          default: "completed",
        },
        units: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("DonorProfile", donorProfileSchema)
