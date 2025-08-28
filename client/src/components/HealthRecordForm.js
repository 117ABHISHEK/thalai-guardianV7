"use client"

import { useState } from "react"
import axios from "axios"

const HealthRecordForm = ({ onRecordCreated, selectedPatient = null }) => {
  const [formData, setFormData] = useState({
    hemoglobinLevel: "",
    doctorNotes: "",
    symptoms: [],
    medicines: [],
    transfusionHistory: [],
    vitalSigns: {
      bloodPressure: { systolic: "", diastolic: "" },
      heartRate: "",
      temperature: "",
      weight: "",
    },
    isEmergency: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [newSymptom, setNewSymptom] = useState("")
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    prescribedBy: "",
  })
  const [newTransfusion, setNewTransfusion] = useState({
    date: "",
    hospital: "",
    bloodType: "",
    unitsReceived: "",
    notes: "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.includes(".")) {
      const [parent, child, grandchild] = name.split(".")
      if (grandchild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: type === "checkbox" ? checked : value,
            },
          },
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === "checkbox" ? checked : value,
          },
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setFormData((prev) => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()],
      }))
      setNewSymptom("")
    }
  }

  const removeSymptom = (index) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index),
    }))
  }

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.frequency) {
      setFormData((prev) => ({
        ...prev,
        medicines: [...prev.medicines, { ...newMedicine }],
      }))
      setNewMedicine({
        name: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        prescribedBy: "",
      })
    }
  }

  const removeMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }))
  }

  const addTransfusion = () => {
    if (newTransfusion.date && newTransfusion.hospital && newTransfusion.bloodType && newTransfusion.unitsReceived) {
      setFormData((prev) => ({
        ...prev,
        transfusionHistory: [
          ...prev.transfusionHistory,
          { ...newTransfusion, unitsReceived: Number(newTransfusion.unitsReceived) },
        ],
      }))
      setNewTransfusion({
        date: "",
        hospital: "",
        bloodType: "",
        unitsReceived: "",
        notes: "",
      })
    }
  }

  const removeTransfusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      transfusionHistory: prev.transfusionHistory.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        hemoglobinLevel: Number.parseFloat(formData.hemoglobinLevel),
        vitalSigns: {
          bloodPressure: {
            systolic: formData.vitalSigns.bloodPressure.systolic
              ? Number.parseInt(formData.vitalSigns.bloodPressure.systolic)
              : undefined,
            diastolic: formData.vitalSigns.bloodPressure.diastolic
              ? Number.parseInt(formData.vitalSigns.bloodPressure.diastolic)
              : undefined,
          },
          heartRate: formData.vitalSigns.heartRate ? Number.parseInt(formData.vitalSigns.heartRate) : undefined,
          temperature: formData.vitalSigns.temperature ? Number.parseFloat(formData.vitalSigns.temperature) : undefined,
          weight: formData.vitalSigns.weight ? Number.parseFloat(formData.vitalSigns.weight) : undefined,
        },
      }

      if (selectedPatient) {
        submitData.patient = selectedPatient
      }

      const response = await axios.post("/api/health/records", submitData, {
        withCredentials: true,
      })

      if (onRecordCreated) {
        onRecordCreated(response.data)
      }

      // Reset form
      setFormData({
        hemoglobinLevel: "",
        doctorNotes: "",
        symptoms: [],
        medicines: [],
        transfusionHistory: [],
        vitalSigns: {
          bloodPressure: { systolic: "", diastolic: "" },
          heartRate: "",
          temperature: "",
          weight: "",
        },
        isEmergency: false,
      })
    } catch (error) {
      setError(error.response?.data?.message || "Error creating health record")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">Add Health Record</h3>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emergency Flag */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isEmergency"
            checked={formData.isEmergency}
            onChange={handleChange}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Mark as Emergency Record</label>
        </div>

        {/* Hemoglobin Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin Level (g/dL) *</label>
          <input
            type="number"
            name="hemoglobinLevel"
            value={formData.hemoglobinLevel}
            onChange={handleChange}
            required
            step="0.1"
            min="0"
            max="25"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 12.5"
          />
        </div>

        {/* Vital Signs */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Vital Signs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="vitalSigns.bloodPressure.systolic"
                  value={formData.vitalSigns.bloodPressure.systolic}
                  onChange={handleChange}
                  placeholder="Systolic"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center">/</span>
                <input
                  type="number"
                  name="vitalSigns.bloodPressure.diastolic"
                  value={formData.vitalSigns.bloodPressure.diastolic}
                  onChange={handleChange}
                  placeholder="Diastolic"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                name="vitalSigns.heartRate"
                value={formData.vitalSigns.heartRate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
              <input
                type="number"
                name="vitalSigns.temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 98.6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                name="vitalSigns.weight"
                value={formData.vitalSigns.weight}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150"
              />
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">Symptoms</h4>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newSymptom}
              onChange={(e) => setNewSymptom(e.target.value)}
              placeholder="Add symptom"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addSymptom}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.symptoms.map((symptom, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                {symptom}
                <button
                  type="button"
                  onClick={() => removeSymptom(index)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Doctor Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Notes</label>
          <textarea
            name="doctorNotes"
            value={formData.doctorNotes}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Medical observations, recommendations, etc."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Creating Record..." : "Create Health Record"}
        </button>
      </form>
    </div>
  )
}

export default HealthRecordForm
