const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    appointmentDate: {
      type: Date,
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
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    sessionType: {
      type: String,
      enum: ["video", "phone", "in-person"],
      default: "video",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      patient: {
        type: String,
        trim: true,
      },
      counselor: {
        type: String,
        trim: true,
      },
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: 1 })
appointmentSchema.index({ counselor: 1, appointmentDate: 1 })
appointmentSchema.index({ status: 1 })

module.exports = mongoose.model("Appointment", appointmentSchema)
