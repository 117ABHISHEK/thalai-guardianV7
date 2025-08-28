"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import BloodRequestForm from "../components/BloodRequestForm"
import BloodRequestCard from "../components/BloodRequestCard"
import axios from "axios"

const BloodRequestsPage = () => {
  const { user } = useContext(AuthContext)
  const [requests, setRequests] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(user?.role === "patient" ? "create" : "browse")
  const [filters, setFilters] = useState({
    bloodGroup: "",
    location: "",
    urgencyLevel: "",
  })

  useEffect(() => {
    fetchRequests()
    fetchMyRequests()
  }, [filters])

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.bloodGroup) params.append("bloodGroup", filters.bloodGroup)
      if (filters.location) params.append("location", filters.location)
      if (filters.urgencyLevel) params.append("urgencyLevel", filters.urgencyLevel)

      const response = await axios.get(`/api/requests?${params.toString()}`, {
        withCredentials: true,
      })
      setRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get("/api/requests/my-requests", {
        withCredentials: true,
      })
      setMyRequests(response.data)
    } catch (error) {
      console.error("Error fetching my requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestCreated = (newRequest) => {
    setMyRequests([newRequest, ...myRequests])
    setActiveTab("my-requests")
  }

  const handleRequestUpdate = (updatedRequest) => {
    setRequests(requests.map((req) => (req._id === updatedRequest._id ? updatedRequest : req)))
    setMyRequests(myRequests.map((req) => (req._id === updatedRequest._id ? updatedRequest : req)))
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blood Requests</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {user?.role === "patient" && (
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "create" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Request
          </button>
        )}
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "browse" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Browse Requests
        </button>
        <button
          onClick={() => setActiveTab("my-requests")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "my-requests" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Requests
        </button>
      </div>

      {/* Create Request Tab */}
      {activeTab === "create" && user?.role === "patient" && (
        <BloodRequestForm onRequestCreated={handleRequestCreated} />
      )}

      {/* Browse Requests Tab */}
      {activeTab === "browse" && (
        <div>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Requests</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Blood Groups</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter city/area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                <select
                  name="urgencyLevel"
                  value={filters.urgencyLevel}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Urgency Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No blood requests found matching your criteria.</p>
              </div>
            ) : (
              requests.map((request) => (
                <BloodRequestCard
                  key={request._id}
                  request={request}
                  userRole={user?.role}
                  onRequestUpdate={handleRequestUpdate}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === "my-requests" && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {user?.role === "patient"
                  ? "You haven't created any blood requests yet."
                  : "You haven't accepted any blood requests yet."}
              </p>
            </div>
          ) : (
            myRequests.map((request) => (
              <BloodRequestCard
                key={request._id}
                request={request}
                userRole={user?.role}
                onRequestUpdate={handleRequestUpdate}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default BloodRequestsPage
