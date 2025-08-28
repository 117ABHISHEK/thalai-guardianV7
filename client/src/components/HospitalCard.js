"use client"

import { useState } from "react"

const HospitalCard = ({ hospital, userRole, onRegisterForCamp }) => {
  const [showInventory, setShowInventory] = useState(false)
  const [showCamps, setShowCamps] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getBloodAvailability = () => {
    if (!hospital.bloodInventory || hospital.bloodInventory.length === 0) {
      return "No blood inventory data"
    }

    const availableTypes = hospital.bloodInventory
      .filter((item) => item.unitsAvailable > 0 && new Date(item.expiryDate) > new Date())
      .map((item) => `${item.bloodType} (${item.unitsAvailable})`)

    return availableTypes.length > 0 ? availableTypes.join(", ") : "No blood currently available"
  }

  const getUpcomingCamps = () => {
    if (!hospital.donationCamps || hospital.donationCamps.length === 0) {
      return []
    }

    return hospital.donationCamps
      .filter((camp) => camp.isActive && new Date(camp.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const upcomingCamps = getUpcomingCamps()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            {hospital.name}
            {hospital.isVerified && (
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                VERIFIED
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            {hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)} Hospital
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{hospital.phone}</p>
          <p className="text-sm text-gray-600">{hospital.email}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Address:</span> {hospital.address.street}, {hospital.address.city},{" "}
          {hospital.address.state} {hospital.address.zipCode}
        </p>
      </div>

      {hospital.specialties && hospital.specialties.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {hospital.specialties.map((specialty, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          {showInventory ? "Hide" : "Show"} Blood Availability
        </button>
        {showInventory && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{getBloodAvailability()}</p>
            {hospital.bloodInventory && hospital.bloodInventory.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {hospital.bloodInventory.map((item, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{item.bloodType}:</span> {item.unitsAvailable} units
                    {new Date(item.expiryDate) <= new Date() && <span className="text-red-500 ml-1">(Expired)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {upcomingCamps.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCamps(!showCamps)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            {showCamps ? "Hide" : "Show"} Upcoming Donation Camps ({upcomingCamps.length})
          </button>
          {showCamps && (
            <div className="mt-2 space-y-2">
              {upcomingCamps.map((camp, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{camp.title}</h4>
                      <p className="text-sm text-gray-600">{camp.description}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {formatDate(camp.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span> {formatTime(camp.startTime)} -{" "}
                        {formatTime(camp.endTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {camp.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Registered:</span> {camp.registeredDonors.length}/{camp.maxDonors}
                      </p>
                    </div>
                    {userRole === "donor" && (
                      <button
                        onClick={() => onRegisterForCamp && onRegisterForCamp(hospital._id, camp._id)}
                        disabled={camp.registeredDonors.length >= camp.maxDonors}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
                      >
                        {camp.registeredDonors.length >= camp.maxDonors ? "Full" : "Register"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500">Registered: {formatDate(hospital.createdAt)}</div>
    </div>
  )
}

export default HospitalCard
