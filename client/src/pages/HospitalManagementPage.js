"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import HospitalRegistrationForm from "../components/HospitalRegistrationForm"
import HospitalCard from "../components/HospitalCard"
import axios from "axios"

const HospitalManagementPage = () => {
  const { user } = useContext(AuthContext)
  const [hospitals, setHospitals] = useState([])
  const [upcomingCamps, setUpcomingCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("browse")
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    bloodType: "",
  })

  useEffect(() => {
    fetchHospitals()
    fetchUpcomingCamps()
  }, [filters])

  const fetchHospitals = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append("city", filters.city)
      if (filters.state) params.append("state", filters.state)
      if (filters.bloodType) params.append("bloodType", filters.bloodType)

      const response = await axios.get(`/api/hospitals?${params.toString()}`)
      setHospitals(response.data)
    } catch (error) {
      console.error("Error fetching hospitals:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingCamps = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append("city", filters.city)
      if (filters.state) params.append("state", filters.state)

      const response = await axios.get(`/api/hospitals/camps/upcoming?${params.toString()}`)
      setUpcomingCamps(response.data)
    } catch (error) {
      console.error("Error fetching upcoming camps:", error)
    }
  }

  const handleHospitalRegistered = (newHospital) => {
    setHospitals([newHospital, ...hospitals])
    setActiveTab("browse")
  }

  const handleRegisterForCamp = async (hospitalId, campId) => {
    try {
      await axios.post(
        `/api/hospitals/${hospitalId}/camps/${campId}/register`,
        {},
        {
          withCredentials: true,
        },
      )

      // Refresh data
      fetchHospitals()
      fetchUpcomingCamps()

      alert("Successfully registered for donation camp!")
    } catch (error) {
      alert(error.response?.data?.message || "Error registering for camp")
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hospital Network</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "browse" ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Browse Hospitals
        </button>
        <button
          onClick={() => setActiveTab("camps")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "camps" ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Donation Camps
        </button>
  {(user?.role === "hospital" || user?.role === "doctor") && (
          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "register" ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Register Hospital
          </button>
        )}
      </div>

      {/* Browse Hospitals Tab */}
      {activeTab === "browse" && (
        <div>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Hospitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="Enter state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Available</label>
                <select
                  name="bloodType"
                  value={filters.bloodType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Blood Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="space-y-4">
            {hospitals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hospitals found matching your criteria.</p>
              </div>
            ) : (
              hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  userRole={user?.role}
                  onRegisterForCamp={handleRegisterForCamp}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Donation Camps Tab */}
      {activeTab === "camps" && (
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Donation Camps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="Enter state"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingCamps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming donation camps found.</p>
              </div>
            ) : (
              upcomingCamps.map((camp, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{camp.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{camp.description}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Hospital:</span> {camp.hospital.name}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(camp.date).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {camp.startTime} - {camp.endTime}
                        </p>
                        <p>
                          <span className="font-medium">Location:</span> {camp.location}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span> {camp.hospital.address.street},{" "}
                          {camp.hospital.address.city}, {camp.hospital.address.state}
                        </p>
                        <p>
                          <span className="font-medium">Contact:</span> {camp.hospital.phone}
                        </p>
                        <p>
                          <span className="font-medium">Registered:</span> {camp.registeredDonors.length}/
                          {camp.maxDonors}
                        </p>
                      </div>
                    </div>
                    {user?.role === "donor" && (
                      <button
                        onClick={() => handleRegisterForCamp(camp.hospital._id, camp._id)}
                        disabled={camp.registeredDonors.length >= camp.maxDonors}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {camp.registeredDonors.length >= camp.maxDonors ? "Full" : "Register"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Register Hospital Tab */}
      {activeTab === "register" && (user?.role === "hospital" || user?.role === "doctor") && (
        <HospitalRegistrationForm onHospitalRegistered={handleHospitalRegistered} />
      )}
    </div>
  )
}

export default HospitalManagementPage
