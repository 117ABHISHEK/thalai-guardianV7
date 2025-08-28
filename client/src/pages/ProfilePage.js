"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/profile")
      setProfile(response.data)
    } catch (error) {
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedData) => {
    try {
      await axios.put("/api/profile", updatedData)
      setSuccess("Profile updated successfully")
      setEditing(false)
      fetchProfile()
    } catch (error) {
      setError("Failed to update profile")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderProfileInfo = () => {
    if (!profile) return null

    const { user: userData, profile: roleProfile } = profile

    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <button onClick={() => setEditing(!editing)} className="text-blue-600 hover:text-blue-800 font-medium">
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{userData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{userData.phone || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-gray-900">
                {userData.dob ? new Date(userData.dob).toLocaleDateString() : "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-gray-900 capitalize">{userData.gender || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-gray-900 capitalize">{userData.role}</p>
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {roleProfile && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Information
            </h3>
            {renderRoleSpecificInfo(roleProfile, userData.role)}
          </div>
        )}
      </div>
    )
  }

  const renderRoleSpecificInfo = (roleProfile, role) => {
    switch (role) {
      case "patient":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <p className="mt-1 text-gray-900">{roleProfile.bloodGroup}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical History</label>
              <p className="mt-1 text-gray-900">{roleProfile.medicalHistory || "None"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Current Medication</label>
              <p className="mt-1 text-gray-900">{roleProfile.currentMedication || "None"}</p>
            </div>
          </div>
        )

      case "donor":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <p className="mt-1 text-gray-900">{roleProfile.bloodGroup}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Donation</label>
              <p className="mt-1 text-gray-900">
                {roleProfile.lastDonationDate
                  ? new Date(roleProfile.lastDonationDate).toLocaleDateString()
                  : "Never donated"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Availability</label>
              <p className="mt-1 text-gray-900">{roleProfile.availableForEmergency ? "Available" : "Not Available"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Donations</label>
              <p className="mt-1 text-gray-900">{roleProfile.donationHistory?.length || 0}</p>
            </div>
          </div>
        )

      case "doctor":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <p className="mt-1 text-gray-900">{roleProfile.specialization}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License ID</label>
              <p className="mt-1 text-gray-900">{roleProfile.licenseId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital</label>
              <p className="mt-1 text-gray-900">{roleProfile.hospital}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <p className="mt-1 text-gray-900">{roleProfile.experience || 0} years</p>
            </div>
          </div>
        )

      case "hospital":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
              <p className="mt-1 text-gray-900">{roleProfile.hospitalName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <p className="mt-1 text-gray-900">{roleProfile.registrationNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <p className="mt-1 text-gray-900">{roleProfile.contactPerson?.name || "Not provided"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Stock</label>
              <p className="mt-1 text-gray-900">{roleProfile.bloodStock?.length || 0} blood types available</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>
      )}

      {renderProfileInfo()}
    </div>
  )
}

export default ProfilePage
