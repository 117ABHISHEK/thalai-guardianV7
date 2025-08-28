"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const getRoleBasedNavItems = () => {
    if (!user) return []

    const commonItems = [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/profile", label: "Profile" },
    ]

    switch (user.role) {
      case "patient":
        return [
          ...commonItems,
          { path: "/blood-requests", label: "Blood Requests" },
          { path: "/health-tracking", label: "Health Tracking" },
          { path: "/mental-health", label: "Mental Health" },
          { path: "/hospitals", label: "Find Hospitals" },
        ]
      case "donor":
        return [
          ...commonItems,
          { path: "/blood-requests", label: "Blood Requests" },
          { path: "/mental-health", label: "Wellness Support" },
          { path: "/hospitals", label: "Donation Camps" },
        ]
      case "doctor":
        return [
          ...commonItems,
          { path: "/health-tracking", label: "Patient Records" },
          { path: "/mental-health", label: "Appointments" },
        ]
      case "hospital":
        return [
          ...commonItems,
          { path: "/hospitals", label: "Manage Hospital" },
          { path: "/blood-requests", label: "Blood Requests" },
        ]
      case "admin":
        return [
          ...commonItems,
          { path: "/blood-requests", label: "All Requests" },
          { path: "/health-tracking", label: "All Records" },
          { path: "/hospitals", label: "All Hospitals" },
          { path: "/mental-health", label: "All Sessions" },
        ]
      default:
        return commonItems
    }
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              ThalAI Guardian
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {getRoleBasedNavItems().map((item) => (
                  <Link key={item.path} to={item.path} className="hover:text-blue-200 transition-colors text-sm">
                    {item.label}
                  </Link>
                ))}

                <div className="flex items-center space-x-2">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-blue-200 text-xs capitalize">{user.role}</div>
                  </div>
                </div>

                {!user.isProfileComplete && (
                  <Link
                    to="/complete-profile"
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Complete Profile
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
