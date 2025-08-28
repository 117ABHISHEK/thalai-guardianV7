const mongoose = require("mongoose")

const hospitalSchema = new mongoose.Schema(
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
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    bloodInventory: [
      {
        bloodType: {
          type: String,
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          required: true,
        },
        unitsAvailable: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
        expiryDate: {
          type: Date,
          required: true,
        },
      },
    ],
    donationCamps: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        date: {
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
        location: {
          type: String,
          required: true,
          trim: true,
        },
        maxDonors: {
          type: Number,
          default: 50,
        },
        registeredDonors: [
          {
            donor: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            registrationDate: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["government", "private", "charitable"],
      required: true,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
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
hospitalSchema.index({ "address.city": 1, "address.state": 1 })
hospitalSchema.index({ "bloodInventory.bloodType": 1, "bloodInventory.unitsAvailable": 1 })
hospitalSchema.index({ isVerified: 1 })
hospitalSchema.index({ coordinates: "2dsphere" })

module.exports = mongoose.model("Hospital", hospitalSchema)
