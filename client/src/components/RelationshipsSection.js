import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const RelationshipsSection = () => {
  const { user } = useAuth()
  const [relationships, setRelationships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRelationships()
  }, [user?.role])

  const fetchRelationships = async () => {
    try {
      let endpoint = ""
      switch (user?.role) {
        case "patient":
          endpoint = "/api/relationships/patient/regular-donors"
          break
        case "donor":
          endpoint = "/api/relationships/donor/regular-patients"
          break
        case "doctor":
          endpoint = "/api/relationships/doctor/regular-patients"
          break
        default:
          return
      }

      const response = await axios.get(endpoint)
      setRelationships(response.data)
    } catch (error) {
      setError("Failed to load relationships")
      console.error("Error fetching relationships:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRelationshipStatus = async (targetId, status, type) => {
    try {
      await axios.put("/api/relationships/relationship-status", {
        type,
        targetId,
        status
      })
      await fetchRelationships()
    } catch (error) {
      setError("Failed to update relationship status")
      console.error("Error updating relationship:", error)
    }
  }

  const renderPatientRelationships = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">My Regular Donors</h4>
      {relationships.map((rel) => (
        <div key={rel.donor._id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{rel.donor.name}</p>
            <p className="text-sm text-gray-600">Since: {new Date(rel.since).toLocaleDateString()}</p>
            {rel.lastDonation && (
              <p className="text-sm text-gray-600">
                Last Donation: {new Date(rel.lastDonation).toLocaleDateString()}
              </p>
            )}
          </div>
          <select
            value={rel.status}
            onChange={(e) => updateRelationshipStatus(rel.donor._id, e.target.value, "patient-donor")}
            className="border rounded px-2 py-1"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      ))}
    </div>
  )

  const renderDonorRelationships = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">My Regular Patients</h4>
      {relationships.map((rel) => (
        <div key={rel.patient._id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{rel.patient.name}</p>
              <p className="text-sm text-gray-600">Since: {new Date(rel.since).toLocaleDateString()}</p>
              {rel.lastDonation && (
                <p className="text-sm text-gray-600">
                  Last Donation: {new Date(rel.lastDonation).toLocaleDateString()}
                </p>
              )}
            </div>
            <select
              value={rel.status}
              onChange={(e) => updateRelationshipStatus(rel.patient._id, e.target.value, "patient-donor")}
              className="border rounded px-2 py-1"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {rel.assignedDoctor && (
            <div className="text-sm text-gray-600">
              <p>Assigned Doctor: {rel.assignedDoctor.name}</p>
            </div>
          )}
          {rel.donationCount > 0 && (
            <p className="text-sm text-gray-600">Total Donations: {rel.donationCount}</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderDoctorRelationships = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">My Regular Patients</h4>
      {relationships.map((rel) => (
        <div key={rel.patient._id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{rel.patient.name}</p>
            <p className="text-sm text-gray-600">Since: {new Date(rel.since).toLocaleDateString()}</p>
            {rel.lastVisit && (
              <p className="text-sm text-gray-600">
                Last Visit: {new Date(rel.lastVisit).toLocaleDateString()}
              </p>
            )}
            {rel.notes && <p className="text-sm text-gray-600 mt-1">{rel.notes}</p>}
          </div>
          <select
            value={rel.status}
            onChange={(e) => updateRelationshipStatus(rel.patient._id, e.target.value, "doctor-patient")}
            className="border rounded px-2 py-1"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!relationships.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded">
        No active relationships found.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {user?.role === "patient" && renderPatientRelationships()}
      {user?.role === "donor" && renderDonorRelationships()}
      {user?.role === "doctor" && renderDoctorRelationships()}
    </div>
  )
}

export default RelationshipsSection