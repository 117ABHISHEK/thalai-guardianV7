"use client"

import { useState } from "react"
import axios from "axios"

const BloodRequestCard = ({ request, userRole, onRequestUpdate }) => {
  const [loading, setLoading] = useState(false)

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAcceptRequest = async () => {
    setLoading(true)
    try {
      // Get donor's blood group first
      const profileResponse = await axios.get("/api/donor/profile", { withCredentials: true })
      const donorBloodGroup = profileResponse.data.bloodGroup

      // Check blood group compatibility
      if (!isBloodCompatible(donorBloodGroup, request.bloodGroup)) {
        alert("Your blood type is not compatible with this request")
        return
      }

      const response = await axios.put(
        `/api/requests/${request._id}/accept`,
        {},
        {
          withCredentials: true,
        },
      )
      if (onRequestUpdate) {
        onRequestUpdate(response.data)
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error accepting request")
    } finally {
      setLoading(false)
    }
  }

  // Helper function to check blood type compatibility
  const isBloodCompatible = (donorType, recipientType) => {
    const compatibility = {
      "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"]
    }
    return compatibility[donorType]?.includes(recipientType) || false
  }

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true)
    try {
      const response = await axios.put(
        `/api/requests/${request._id}/status`,
        { status: newStatus },
        { withCredentials: true },
      )
      if (onRequestUpdate) {
        onRequestUpdate(response.data)
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blood Group: {request.bloodGroup}</h3>
          <p className="text-sm text-gray-600">Patient: {request.patient?.name || "Unknown"}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgencyLevel)}`}
          >
            {request.urgencyLevel.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Hospital:</span> {request.hospitalName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {request.location}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date Needed:</span> {formatDate(request.dateNeeded)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Units:</span> {request.unitsNeeded}
          </p>
        </div>
      </div>

      {request.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {request.notes}
          </p>
        </div>
      )}

      {request.donor && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Donor:</span> {request.donor.name}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {userRole === "donor" && request.status === "pending" && (
          <button
            onClick={handleAcceptRequest}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
          >
            {loading ? "Accepting..." : "Accept Request"}
          </button>
        )}

        {userRole === "donor" && request.status === "accepted" && request.donor?._id && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          >
            Mark as Completed
          </button>
        )}

        {userRole === "patient" && request.status === "accepted" && (
          <button
            onClick={() => handleStatusUpdate("completed")}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          >
            Confirm Received
          </button>
        )}

        {(userRole === "doctor" || userRole === "hospital") && (
          <div className="flex gap-2">
            {request.status !== "completed" && (
              <button
                onClick={() => handleStatusUpdate("completed")}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
              >
                Mark Completed
              </button>
            )}
            {request.status !== "cancelled" && (
              <button
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 text-sm"
              >
                Cancel Request
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">Created: {formatDate(request.createdAt)}</div>
    </div>
  )
}

export default BloodRequestCard
