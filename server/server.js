const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const patientRoutes = require("./routes/patient")
const donorRoutes = require("./routes/donor")
const doctorRoutes = require("./routes/doctor")
const requestRoutes = require("./routes/requests")
const healthRoutes = require("./routes/health")
const hospitalRoutes = require("./routes/hospitals")
const mentalHealthRoutes = require("./routes/mentalHealth")
const profileRoutes = require("./routes/profile")

const app = express()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

const doctorsRoutes = require("./routes/doctors")

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/patient", patientRoutes)
app.use("/api/donor", donorRoutes)
app.use("/api/doctor", doctorRoutes)
app.use("/api/doctors", doctorsRoutes) // New route for doctor appointments
app.use("/api/requests", requestRoutes)
app.use("/api/health", healthRoutes)
app.use("/api/hospitals", hospitalRoutes)
app.use("/api/mental-health", mentalHealthRoutes)
app.use("/api/profile", profileRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
