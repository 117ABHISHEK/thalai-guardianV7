"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AppointmentBooking = ({ onAppointmentBooked }) => {
  const [counselors, setCounselors] = useState([])
  const [selectedCounselor, setSelectedCounselor] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [formData, setFormData] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    sessionType: "video",
    reason: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCounselors()
  }, [])

  useEffect(() => {
    if (selectedCounselor && formData.appointmentDate) {
      fetchAvailableSlots()
    }
  }, [selectedCounselor, formData.appointmentDate])

  const fetchCounselors = async () => {
    try {
      const response = await axios.get("/api/mental-health/counselors", {
        withCredentials: true,
      })
      setCounselors(response.data)
    } catch (error) {
      console.error("Error fetching counselors:", error)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `/api/mental-health/counselors/${selectedCounselor}/availability?date=${formData.appointmentDate}`,
        { withCredentials: true },
      )
      setAvailableSlots(response.data.availableSlots)
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableSlots([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "startTime") {
      // Auto-set end time to 1 hour later
      const startHour = Number.parseInt(value.split(":")[0])
      const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`
      setFormData((prev) => ({
        ...prev,
        endTime,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "/api/mental-health/appointments",
        {
          counselor: selectedCounselor,
          ...formData,
        },
        {
          withCredentials: true,
        },
      )

      if (onAppointmentBooked) {
        onAppointmentBooked(response.data)
      }

      // Reset form
      setFormData({
        appointmentDate: "",
        startTime: "",
        endTime: "",
        sessionType: "video",
        reason: "",
        notes: "",
      })
      setSelectedCounselor("")
      setAvailableSlots([])
    } catch (error) {
      setError(error.response?.data?.message || "Error booking appointment")
    } finally {
      setLoading(false)
    }
  }

  const selectedCounselorData = counselors.find((c) => c._id === selectedCounselor)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Book Counselor Appointment</h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Counselor *</label>
          <select
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Choose a counselor...</option>
            {counselors.map((counselor) => (
              <option key={counselor._id} value={counselor._id}>
                {counselor.name} - {counselor.specializations.join(", ")}
              </option>
            ))}
          </select>
        </div>

        {selectedCounselorData && (
          <div className="bg-purple-50 p-4 rounded-md">
            <h4 className="font-medium text-purple-900">{selectedCounselorData.name}</h4>
            <p className="text-sm text-purple-700 mt-1">{selectedCounselorData.bio}</p>
            <div className="mt-2">
              <p className="text-sm text-purple-700">
                <span className="font-medium">Experience:</span> {selectedCounselorData.experience} years
              </p>
              <p className="text-sm text-purple-700">
                <span className="font-medium">Specializations:</span> {selectedCounselorData.specializations.join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Type *</label>
            <select
              name="sessionType"
              value={formData.sessionType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>

        {availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                    }))
                  }}
                  className={`p-2 text-sm border rounded-md transition-colors ${
                    formData.startTime === slot.startTime
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
                  }`}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Appointment *</label>
          <select
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select a reason...</option>
            <option value="anxiety">Anxiety and Stress Management</option>
            <option value="depression">Depression and Mood Support</option>
            <option value="coping">Coping with Chronic Illness</option>
            <option value="family">Family and Relationship Issues</option>
            <option value="grief">Grief and Loss</option>
            <option value="general">General Mental Health Support</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Any additional information you'd like to share with your counselor..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedCounselor || !formData.appointmentDate || !formData.startTime}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? "Booking Appointment..." : "Book Appointment"}
        </button>
      </form>
    </div>
  )
}

export default AppointmentBooking
