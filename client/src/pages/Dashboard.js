"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import RelationshipsSection from '../components/RelationshipsSection'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const endpoint = `/api/${user.role}/dashboard`
      const response = await axios.get(endpoint)
      setDashboardData(response.data.data)
    } catch (error) {
      setError("Failed to load dashboard data")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Health Tracking</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Last Checkup</p>
            <p className="font-medium">{dashboardData.healthTracking.lastCheckup}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Appointment</p>
            <p className="font-medium">{dashboardData.healthTracking.nextAppointment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Blood Type</p>
            <p className="font-medium">{dashboardData.healthTracking.bloodType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium text-green-600">{dashboardData.healthTracking.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Available Donors</h3>
        <div className="space-y-3">
          {dashboardData.donorRequests.map((request) => (
            <div key={request.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Blood Type: {request.bloodType}</p>
                  <p className="text-sm text-gray-600">{request.location}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    request.urgency === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDonorDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Donation History</h3>
        <div className="space-y-3">
          {dashboardData.donationHistory.map((donation, index) => (
            <div key={index} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{donation.location}</p>
                  <p className="text-sm text-gray-600">{donation.date}</p>
                </div>
                <p className="font-medium">{donation.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Blood Requests</h3>
        <div className="space-y-3">
          {dashboardData.bloodRequests.map((request) => (
            <div key={request.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Blood Type: {request.bloodType}</p>
                  <p className="text-sm text-gray-600">{request.hospital}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    request.urgency === "Critical"
                      ? "bg-red-100 text-red-800"
                      : request.urgency === "High"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDoctorDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Patient Records</h3>
        <div className="space-y-3">
          {dashboardData.patientRecords.map((patient) => (
            <div key={patient.id} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.condition}</p>
                </div>
                <p className="text-sm text-gray-500">Last visit: {patient.lastVisit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {dashboardData.appointments.map((appointment) => (
            <div key={appointment.id} className="border rounded p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.date}</p>
                </div>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderHospitalDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Hospital Dashboard</h3>
        <p className="text-sm text-gray-600">Hospital-specific dashboard data will appear here.</p>
      </div>
    </div>
  )

  const renderDashboard = () => {
    switch (user.role) {
      case "patient":
        return renderPatientDashboard()
      case "donor":
        return renderDonorDashboard()
      case "doctor":
        return renderDoctorDashboard()
      case "hospital":
        return renderHospitalDashboard()
      default:
        return <div>Invalid role</div>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {renderDashboard()}
    </div>
  )
}

export default Dashboard
