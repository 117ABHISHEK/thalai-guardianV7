const profileCheckMiddleware = (req, res, next) => {
  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      message: "Profile completion required",
      redirectTo: "/complete-profile",
    })
  }
  next()
}

module.exports = { profileCheckMiddleware }
