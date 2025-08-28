const twilio = require("twilio")
const nodemailer = require("nodemailer")

// Initialize Twilio client
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

// Initialize email transporter
const emailTransporter =
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : null

// Send SMS notification
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log("Twilio not configured. SMS not sent:", message)
    return { success: false, error: "Twilio not configured" }
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })

    console.log("SMS sent successfully:", result.sid)
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("Error sending SMS:", error.message)
    return { success: false, error: error.message }
  }
}

// Send WhatsApp notification
const sendWhatsApp = async (to, message) => {
  if (!twilioClient) {
    console.log("Twilio not configured. WhatsApp not sent:", message)
    return { success: false, error: "Twilio not configured" }
  }

  try {
    // Format phone number for WhatsApp (must include country code)
    const whatsappNumber = to.startsWith("+") ? `whatsapp:${to}` : `whatsapp:+1${to}`

    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: whatsappNumber,
    })

    console.log("WhatsApp sent successfully:", result.sid)
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error("Error sending WhatsApp:", error.message)
    return { success: false, error: error.message }
  }
}

// Send email notification
const sendEmail = async (to, subject, htmlContent, textContent = null) => {
  if (!emailTransporter) {
    console.log("Email not configured. Email not sent:", subject)
    return { success: false, error: "Email not configured" }
  }

  try {
    const mailOptions = {
      from: `"ThalAI Guardian" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      html: htmlContent,
    }

    const result = await emailTransporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending email:", error.message)
    return { success: false, error: error.message }
  }
}

// Notify donors about critical blood requests
const notifyDonorsForCriticalRequest = async (bloodRequest, donors) => {
  const message = `🚨 CRITICAL BLOOD REQUEST 🚨
Blood Type: ${bloodRequest.bloodGroup}
Hospital: ${bloodRequest.hospitalName}
Location: ${bloodRequest.location}
Units Needed: ${bloodRequest.unitsNeeded}
Date Needed: ${new Date(bloodRequest.dateNeeded).toLocaleDateString()}

This is an urgent request. Please consider donating if you're eligible.
Reply STOP to opt out.`

  const results = []

  for (const donor of donors) {
    if (donor.phone) {
      // Try WhatsApp first, fallback to SMS
      let result = await sendWhatsApp(donor.phone, message)
      if (!result.success) {
        result = await sendSMS(donor.phone, message)
      }

      results.push({
        donor: donor._id,
        phone: donor.phone,
        method: result.success ? (result.messageId.includes("whatsapp") ? "whatsapp" : "sms") : "failed",
        success: result.success,
        error: result.error,
      })
    }
  }

  return results
}

// Notify doctors about emergency health records
const notifyDoctorsForEmergencyRecord = async (healthRecord, doctors) => {
  const patient = healthRecord.patient
  const subject = `🚨 Emergency Health Record - ${patient.name}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🚨 EMERGENCY HEALTH RECORD</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937;">Patient Information</h2>
        <p><strong>Name:</strong> ${patient.name}</p>
        <p><strong>Email:</strong> ${patient.email}</p>
        <p><strong>Record Date:</strong> ${new Date(healthRecord.recordDate).toLocaleString()}</p>
        
        <h2 style="color: #1f2937;">Health Details</h2>
        <p><strong>Hemoglobin Level:</strong> ${healthRecord.hemoglobinLevel} g/dL</p>
        
        ${
          healthRecord.vitalSigns
            ? `
        <h3 style="color: #374151;">Vital Signs</h3>
        <ul>
          ${healthRecord.vitalSigns.bloodPressure?.systolic ? `<li>Blood Pressure: ${healthRecord.vitalSigns.bloodPressure.systolic}/${healthRecord.vitalSigns.bloodPressure.diastolic} mmHg</li>` : ""}
          ${healthRecord.vitalSigns.heartRate ? `<li>Heart Rate: ${healthRecord.vitalSigns.heartRate} bpm</li>` : ""}
          ${healthRecord.vitalSigns.temperature ? `<li>Temperature: ${healthRecord.vitalSigns.temperature}°F</li>` : ""}
          ${healthRecord.vitalSigns.weight ? `<li>Weight: ${healthRecord.vitalSigns.weight} lbs</li>` : ""}
        </ul>
        `
            : ""
        }
        
        ${
          healthRecord.symptoms && healthRecord.symptoms.length > 0
            ? `
        <h3 style="color: #374151;">Symptoms</h3>
        <ul>
          ${healthRecord.symptoms.map((symptom) => `<li>${symptom}</li>`).join("")}
        </ul>
        `
            : ""
        }
        
        ${
          healthRecord.doctorNotes
            ? `
        <h3 style="color: #374151;">Notes</h3>
        <p style="background-color: white; padding: 15px; border-left: 4px solid #dc2626;">${healthRecord.doctorNotes}</p>
        `
            : ""
        }
        
        <div style="margin-top: 30px; padding: 20px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
          <p style="margin: 0; color: #991b1b;"><strong>This is an emergency record that requires immediate attention.</strong></p>
        </div>
      </div>
      
      <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
        <p style="margin: 0;">ThalAI Guardian - Emergency Notification System</p>
      </div>
    </div>
  `

  const results = []

  for (const doctor of doctors) {
    if (doctor.email) {
      const result = await sendEmail(doctor.email, subject, htmlContent)

      results.push({
        doctor: doctor._id,
        email: doctor.email,
        success: result.success,
        error: result.error,
      })
    }
  }

  return results
}

// Notify patient about blood request status update
const notifyPatientStatusUpdate = async (bloodRequest, status) => {
  const patient = bloodRequest.patient

  if (!patient.email) {
    return { success: false, error: "Patient email not available" }
  }

  const statusMessages = {
    accepted: "Your blood request has been accepted by a donor!",
    completed: "Your blood request has been completed successfully.",
    cancelled: "Your blood request has been cancelled.",
  }

  const subject = `Blood Request Update - ${statusMessages[status] || "Status Updated"}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🩸 Blood Request Update</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937;">Hello ${patient.name},</h2>
        <p style="font-size: 16px; color: #374151;">${statusMessages[status] || "Your blood request status has been updated."}</p>
        
        <h3 style="color: #374151;">Request Details</h3>
        <ul style="color: #4b5563;">
          <li><strong>Blood Type:</strong> ${bloodRequest.bloodGroup}</li>
          <li><strong>Hospital:</strong> ${bloodRequest.hospitalName}</li>
          <li><strong>Location:</strong> ${bloodRequest.location}</li>
          <li><strong>Units Needed:</strong> ${bloodRequest.unitsNeeded}</li>
          <li><strong>Date Needed:</strong> ${new Date(bloodRequest.dateNeeded).toLocaleDateString()}</li>
          <li><strong>Status:</strong> ${status.toUpperCase()}</li>
        </ul>
        
        ${
          bloodRequest.donor
            ? `
        <h3 style="color: #374151;">Donor Information</h3>
        <p style="color: #4b5563;"><strong>Donor:</strong> ${bloodRequest.donor.name}</p>
        `
            : ""
        }
        
        <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
          <p style="margin: 0; color: #0c4a6e;">Thank you for using ThalAI Guardian. We're here to help connect patients with life-saving blood donations.</p>
        </div>
      </div>
      
      <div style="background-color: #374151; color: white; padding: 15px; text-align: center;">
        <p style="margin: 0;">ThalAI Guardian - Connecting Lives Through Blood Donation</p>
      </div>
    </div>
  `

  return await sendEmail(patient.email, subject, htmlContent)
}

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendEmail,
  notifyDonorsForCriticalRequest,
  notifyDoctorsForEmergencyRecord,
  notifyPatientStatusUpdate,
}
