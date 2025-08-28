const mongoose = require("mongoose")

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    hemoglobinLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 25, // g/dL
    },
    transfusionHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        hospital: {
          type: String,
          required: true,
          trim: true,
        },
        bloodType: {
          type: String,
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          required: true,
        },
        unitsReceived: {
          type: Number,
          required: true,
          min: 1,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    doctorNotes: {
      type: String,
      trim: true,
    },
    medicines: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        dosage: {
          type: String,
          required: true,
          trim: true,
        },
        frequency: {
          type: String,
          required: true,
          trim: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        prescribedBy: {
          type: String,
          trim: true,
        },
      },
    ],
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    vitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number,
      },
      heartRate: Number,
      temperature: Number,
      weight: Number,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
healthRecordSchema.index({ patient: 1, recordDate: -1 })
healthRecordSchema.index({ doctor: 1 })
healthRecordSchema.index({ isEmergency: 1 })

module.exports = mongoose.model("HealthRecord", healthRecordSchema)
