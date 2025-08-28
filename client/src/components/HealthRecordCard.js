"use client"

import { useState } from "react"

const HealthRecordCard = ({ record, userRole, onRecordUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getHemoglobinStatus = (level) => {
    if (level < 12) return { status: "Low", color: "text-red-600 bg-red-100" }
    if (level > 15.5) return { status: "High", color: "text-orange-600 bg-orange-100" }
    return { status: "Normal", color: "text-green-600 bg-green-100" }
  }

  const hemoglobinStatus = getHemoglobinStatus(record.hemoglobinLevel)

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${record.isEmergency ? "border-red-500" : "border-blue-500"}`}
    >
      {record.isEmergency && (
        <div className="mb-4">
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">EMERGENCY RECORD</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Health Record - {formatDate(record.recordDate)}</h3>
          <p className="text-sm text-gray-600">Patient: {record.patient?.name || "Unknown"}</p>
          {record.doctor && <p className="text-sm text-gray-600">Doctor: {record.doctor.name}</p>}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </button>
      </div>

      {/* Hemoglobin Level */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Hemoglobin:</span>
          <span className="text-lg font-semibold">{record.hemoglobinLevel} g/dL</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${hemoglobinStatus.color}`}>
            {hemoglobinStatus.status}
          </span>
        </div>
      </div>

      {/* Vital Signs */}
      {record.vitalSigns && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vital Signs:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {record.vitalSigns.bloodPressure?.systolic && (
              <div>
                <span className="text-gray-600">BP:</span> {record.vitalSigns.bloodPressure.systolic}/
                {record.vitalSigns.bloodPressure.diastolic} mmHg
              </div>
            )}
            {record.vitalSigns.heartRate && (
              <div>
                <span className="text-gray-600">HR:</span> {record.vitalSigns.heartRate} bpm
              </div>
            )}
            {record.vitalSigns.temperature && (
              <div>
                <span className="text-gray-600">Temp:</span> {record.vitalSigns.temperature}°F
              </div>
            )}
            {record.vitalSigns.weight && (
              <div>
                <span className="text-gray-600">Weight:</span> {record.vitalSigns.weight} lbs
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {record.symptoms && record.symptoms.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Symptoms:</h4>
          <div className="flex flex-wrap gap-1">
            {record.symptoms.map((symptom, index) => (
              <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Doctor Notes */}
          {record.doctorNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Doctor Notes:</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{record.doctorNotes}</p>
            </div>
          )}

          {/* Medicines */}
          {record.medicines && record.medicines.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Medicines:</h4>
              <div className="space-y-2">
                {record.medicines.map((medicine, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-md text-sm">
                    <div className="font-medium">{medicine.name}</div>
                    <div className="text-gray-600">
                      {medicine.dosage} - {medicine.frequency}
                    </div>
                    {medicine.prescribedBy && (
                      <div className="text-gray-500">Prescribed by: {medicine.prescribedBy}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfusion History */}
          {record.transfusionHistory && record.transfusionHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transfusions:</h4>
              <div className="space-y-2">
                {record.transfusionHistory.map((transfusion, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{transfusion.hospital}</div>
                        <div className="text-gray-600">
                          {transfusion.bloodType} - {transfusion.unitsReceived} units
                        </div>
                        <div className="text-gray-500">{formatDate(transfusion.date)}</div>
                      </div>
                    </div>
                    {transfusion.notes && <div className="mt-2 text-gray-600">{transfusion.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HealthRecordCard
