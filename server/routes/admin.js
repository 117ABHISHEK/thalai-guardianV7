// Deprecated admin routes
// The 'admin' role has been removed from the project. This route file is retained as a
// compatibility stub. Please migrate admin responsibilities to hospital owners or
// designated verifier accounts as appropriate and remove references to /api/admin.

const express = require("express")
const router = express.Router()

// Respond with a 410 Gone for all admin endpoints to indicate removal
router.use((req, res) => {
  res.status(410).json({ message: "Admin endpoints removed. Use hospital/role-specific endpoints instead." })
})

module.exports = router
