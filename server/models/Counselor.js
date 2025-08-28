const mongoose = require("mongoose")

const counselorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    qualifications: [
      {
        degree: {
          type: String,
          required: true,
          trim: true,
        },
        institution: {
          type: String,
          required: true,
          trim: true,
        },
        year: {
          type: Number,
          required: true,
        },
      },
    ],
    experience: {
      type: Number, // years of experience
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    availability: [
      {
        dayOfWeek: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
counselorSchema.index({ specializations: 1 })
counselorSchema.index({ isActive: 1, isVerified: 1 })

module.exports = mongoose.model("Counselor", counselorSchema)
