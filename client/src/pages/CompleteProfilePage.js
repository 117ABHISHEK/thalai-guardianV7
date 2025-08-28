"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const CompleteProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [basicInfo, setBasicInfo] = useState({
    phone: "",
    dob: "",
    gender: "",
    profilePicture: "",
  })

  const [roleSpecificData, setRoleSpecificData] = useState({})

  const handleBasicInfoChange = (e) => {
    setBasicInfo({
      ...basicInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handleRoleSpecificChange = (e) => {
    setRoleSpecificData({
      ...roleSpecificData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddressChange = (field, value) => {
    setRoleSpecificData({
      ...roleSpecificData,
      address: {
        ...roleSpecificData.address,
        [field]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/api/profile/complete", {
        basicInfo,
        roleSpecificData,
      })

      await refreshUser()
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to complete profile")
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSpecificFields = () => {
    switch (user?.role) {
      case "patient":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group *</label>
              <select
                name="bloodGroup"
                required
                value={roleSpecificData.bloodGroup || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical History</label>
              <textarea
                name="medicalHistory"
                value={roleSpecificData.medicalHistory || ""}
                onChange={handleRoleSpecificChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any relevant medical history..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Medication</label>
              <textarea
                name="currentMedication"
                value={roleSpecificData.currentMedication || ""}
                onChange={handleRoleSpecificChange}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Current medications..."
              />
            </div>
          </>
        )

      case "donor":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group *</label>
              <select
                name="bloodGroup"
                required
                value={roleSpecificData.bloodGroup || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Donation Date</label>
              <input
                type="date"
                name="lastDonationDate"
                value={roleSpecificData.lastDonationDate || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="availableForEmergency"
                  checked={roleSpecificData.availableForEmergency || false}
                  onChange={(e) =>
                    setRoleSpecificData({ ...roleSpecificData, availableForEmergency: e.target.checked })
                  }
                  className="mr-2"
                />
                Available for Emergency Donations
              </label>
            </div>
          </>
        )

      case "doctor":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization *</label>
              <input
                type="text"
                name="specialization"
                required
                value={roleSpecificData.specialization || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Hematology, Internal Medicine"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License ID *</label>
              <input
                type="text"
                name="licenseId"
                required
                value={roleSpecificData.licenseId || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Medical license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital/Clinic *</label>
              <input
                type="text"
                name="hospital"
                required
                value={roleSpecificData.hospital || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Hospital or clinic name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={roleSpecificData.experience || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Years of experience"
              />
            </div>
          </>
        )

      case "hospital":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital Name *</label>
              <input
                type="text"
                name="hospitalName"
                required
                value={roleSpecificData.hospitalName || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Official hospital name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number *</label>
              <input
                type="text"
                name="registrationNumber"
                required
                value={roleSpecificData.registrationNumber || ""}
                onChange={handleRoleSpecificChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Hospital registration number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person Name</label>
              <input
                type="text"
                name="contactPersonName"
                value={roleSpecificData.contactPersonName || ""}
                onChange={(e) =>
                  setRoleSpecificData({
                    ...roleSpecificData,
                    contactPerson: { ...roleSpecificData.contactPerson, name: e.target.value },
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact person name"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600 mt-2">
              Please complete your profile to access all features of ThalAI Guardian.
            </p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={basicInfo.phone}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={basicInfo.dob}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender *</label>
                  <select
                    name="gender"
                    required
                    value={basicInfo.gender}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={roleSpecificData.address?.street || ""}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={roleSpecificData.address?.city || ""}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={roleSpecificData.address?.state || ""}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Information
              </h3>
              <div className="space-y-4">{renderRoleSpecificFields()}</div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? "Completing Profile..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfilePage
