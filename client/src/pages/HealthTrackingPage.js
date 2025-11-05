"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import HealthRecordForm from "../components/HealthRecordForm"
import HealthRecordCard from "../components/HealthRecordCard"
import HemoglobinChart from "../components/HemoglobinChart"
import axios from "axios"

const HealthTrackingPage = () => {
  const { user } = useContext(AuthContext)
  const [records, setRecords] = useState([])
  const [hemoglobinTrends, setHemoglobinTrends] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(user?.role === "patient" ? "add-record" : "view-records")

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchPatients()
    }
    fetchRecords()
    fetchHemoglobinTrends()
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      const response = await axios.get("/api/health/patients", {
        withCredentials: true,
      })
      setPatients(response.data)
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  const fetchRecords = async () => {
    try {
      const url = selectedPatient ? `/api/health/records/${selectedPatient}` : "/api/health/records"

      const response = await axios.get(url, {
        withCredentials: true,
      })
      setRecords(response.data)
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHemoglobinTrends = async () => {
    try {
      const url = selectedPatient ? `/api/health/trends/${selectedPatient}` : "/api/health/trends"

      const response = await axios.get(url, {
        withCredentials: true,
      })
      setHemoglobinTrends(response.data)
    } catch (error) {
      console.error("Error fetching hemoglobin trends:", error)
    }
  }

  const handleRecordCreated = (newRecord) => {
    setRecords([newRecord, ...records])
    fetchHemoglobinTrends() // Refresh chart data
    setActiveTab("view-records")
  }

  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Health Tracking</h1>

      {/* Patient Selection for Doctors */}
      {(user?.role === "doctor") && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient:</label>
          <select
            value={selectedPatient}
            onChange={handlePatientChange}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a patient...</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name} ({patient.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("add-record")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "add-record" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Add Record
        </button>
        <button
          onClick={() => setActiveTab("view-records")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "view-records" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Health Records
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "trends" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Hemoglobin Trends
        </button>
      </div>

      {/* Add Record Tab */}
      {activeTab === "add-record" && (
        <HealthRecordForm onRecordCreated={handleRecordCreated} selectedPatient={selectedPatient} />
      )}

      {/* View Records Tab */}
      {activeTab === "view-records" && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedPatient || user?.role === "patient"
                  ? "No health records found."
                  : "Select a patient to view their health records."}
              </p>
            </div>
          ) : (
            records.map((record) => <HealthRecordCard key={record._id} record={record} userRole={user?.role} />)
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <div>
          {selectedPatient || user?.role === "patient" ? (
            <HemoglobinChart data={hemoglobinTrends} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">Select a patient to view hemoglobin trends.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HealthTrackingPage
