const mongoose = require("mongoose")

const bloodRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    dateNeeded: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
bloodRequestSchema.index({ bloodGroup: 1, location: 1, status: 1 })
bloodRequestSchema.index({ patient: 1 })
bloodRequestSchema.index({ donor: 1 })

module.exports = mongoose.model("BloodRequest", bloodRequestSchema)
