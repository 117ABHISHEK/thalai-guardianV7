"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AppointmentBooking = ({ onAppointmentBooked }) => {
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [formData, setFormData] = useState({
    appointmentDate: "",
    startTime: "",
    endTime: "",
    sessionType: "in-person",
    reason: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor && formData.appointmentDate) {
      fetchAvailableSlots()
    }
  }, [selectedDoctor, formData.appointmentDate])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/api/doctors/available", { withCredentials: true })
      setDoctors(response.data)

      // extract unique hospitals
      const uniqueHospitals = [...new Set(response.data.map((d) => d.hospital).filter(Boolean))]
      setHospitals(uniqueHospitals)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setError("Failed to load doctors. Please try again.")
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `/api/doctors/${selectedDoctor}/availability?date=${formData.appointmentDate}`,
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
      const payload = {
        doctorId: selectedDoctor,
        ...formData,
      }

      const response = await axios.post("/api/doctors/appointments", payload, {
        withCredentials: true,
      })

      if (onAppointmentBooked) {
        onAppointmentBooked(response.data)
      }

      // Reset form
      setFormData({
        appointmentDate: "",
        startTime: "",
        endTime: "",
        reason: "",
        notes: "",
      })
      setSelectedDoctor("")
      setAvailableSlots([])
    } catch (error) {
      setError(error.response?.data?.message || "Error booking appointment")
    } finally {
      setLoading(false)
    }
  }

  const filteredDoctors = selectedHospital ? doctors.filter((d) => d.hospital === selectedHospital) : doctors
  const selectedDoctorData = doctors.find((d) => d._id === selectedDoctor)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-purple-600">Book Doctor Appointment</h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Hospital *</label>
          <select
            value={selectedHospital}
            onChange={(e) => {
              setSelectedHospital(e.target.value)
              setSelectedDoctor("")
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Choose a hospital...</option>
            {hospitals.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {selectedHospital && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a doctor...</option>
              {filteredDoctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedDoctorData && (
          <div className="bg-purple-50 p-4 rounded-md">
            <h4 className="font-medium text-purple-900">Dr. {selectedDoctorData.name}</h4>
            <div className="mt-2">
              <p className="text-sm text-purple-700">
                <span className="font-medium">Specialization:</span> {selectedDoctorData.specialization}
              </p>
              <p className="text-sm text-purple-700">
                <span className="font-medium">Experience:</span> {selectedDoctorData.experience} years
              </p>
              {selectedDoctorData.hospital && (
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Hospital:</span> {selectedDoctorData.hospital}
                </p>
              )}
              <p className="text-sm text-purple-700">
                <span className="font-medium">Consultation Hours:</span> {selectedDoctorData.availableHours?.start} - {selectedDoctorData.availableHours?.end}
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
            <option value="consultation">General Consultation</option>
            <option value="followup">Follow-up Visit</option>
            <option value="testresults">Discuss Test Results</option>
            <option value="prescription">Prescription/Medication</option>
            <option value="emergency">Emergency</option>
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
            placeholder="Any specific symptoms or concerns you'd like to mention..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || !selectedDoctor || !formData.appointmentDate || !formData.startTime}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? "Booking Appointment..." : "Book Appointment"}
        </button>
      </form>
    </div>
  )
}

export default AppointmentBooking
