"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import Chatbot from "../components/Chatbot"
import AppointmentBooking from "../components/AppointmentBooking"
import axios from "axios"

const MentalHealthPage = () => {
  const { user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")

  useEffect(() => {
    if (user?.role === "patient") {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("/api/mental-health/appointments", {
        withCredentials: true,
      })
      setAppointments(response.data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentBooked = (newAppointment) => {
    setAppointments([newAppointment, ...appointments])
    setActiveTab("appointments")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (user?.role !== "patient") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mental Health Support</h1>
          <p className="text-gray-600">This section is only available for patients.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mental Health Support</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "chat" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Support Chat
        </button>
        <button
          onClick={() => setActiveTab("book")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "book" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Book Appointment
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "appointments" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Appointments
        </button>
      </div>

      {/* Support Chat Tab */}
      {activeTab === "chat" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Mental Health Support</h2>
            <p className="text-gray-600">
              Chat with our AI assistant for immediate emotional support and guidance. This is a safe space to express
              your feelings and get helpful resources.
            </p>
          </div>
          <Chatbot />
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Resources</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                <strong>Crisis Support:</strong> Call 988 (Suicide & Crisis Lifeline) - Available 24/7
              </p>
              <p>
                <strong>Crisis Text Line:</strong> Text "HELLO" to 741741
              </p>
              <p>
                <strong>Emergency:</strong> Call 911 or go to your nearest emergency room
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Tab */}
      {activeTab === "book" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Counselor Appointment</h2>
            <p className="text-gray-600">
              Schedule a one-on-one session with one of our trained volunteer counselors who specialize in supporting
              people with chronic health conditions.
            </p>
          </div>
          <AppointmentBooking onAppointmentBooked={handleAppointmentBooked} />
        </div>
      )}

      {/* My Appointments Tab */}
      {activeTab === "appointments" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Appointments</h2>
            <p className="text-gray-600">View and manage your counselor appointments.</p>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't booked any appointments yet.</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Session with {appointment.counselor.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.counselor.specializations.join(", ")}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span> {formatTime(appointment.startTime)} -{" "}
                        {formatTime(appointment.endTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Session Type:</span> {appointment.sessionType}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    </div>
                  </div>

                  {appointment.notes?.patient && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Your Notes:</span> {appointment.notes.patient}
                      </p>
                    </div>
                  )}

                  {appointment.meetingLink && (
                    <div className="mb-4">
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Join Meeting →
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">Booked: {formatDate(appointment.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MentalHealthPage
