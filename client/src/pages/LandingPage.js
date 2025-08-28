"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">ThalAI Guardian</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Advanced Thalassemia Management & Blood Donation Platform
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-3xl mx-auto">
              Empowering patients, connecting donors, and supporting healthcare professionals in the fight against
              Thalassemia through intelligent technology.
            </p>
            {!user && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ThalAI Guardian bridges the gap between Thalassemia patients, blood donors, and healthcare professionals
              through intelligent matching and comprehensive care management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Patients</h3>
              <p className="text-gray-600">
                Track your health, find compatible donors, and manage your treatment journey.
              </p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🩸</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Donors</h3>
              <p className="text-gray-600">Connect with patients in need and make a life-saving difference.</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Doctors</h3>
              <p className="text-gray-600">
                Access patient records, track treatments, and coordinate care effectively.
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">For Admins</h3>
              <p className="text-gray-600">Manage the platform, oversee users, and ensure smooth operations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the ThalAI Guardian Community</h2>
          <p className="text-lg text-gray-600 mb-8">
            Together, we can make Thalassemia management more effective and accessible.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Register Now
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandingPage
