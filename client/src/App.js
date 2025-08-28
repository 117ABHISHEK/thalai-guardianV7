import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import ProfileCompletionRoute from "./components/ProfileCompletionRoute"
import CompleteProfilePage from "./pages/CompleteProfilePage"
import ProfilePage from "./pages/ProfilePage"
import BloodRequestsPage from "./pages/BloodRequestsPage"
import HealthTrackingPage from "./pages/HealthTrackingPage"
import HospitalManagementPage from "./pages/HospitalManagementPage"
import MentalHealthPage from "./pages/MentalHealthPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProfileCompletionRoute>
                  <Dashboard />
                </ProfileCompletionRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProfileCompletionRoute>
                  <ProfilePage />
                </ProfileCompletionRoute>
              }
            />
            <Route
              path="/blood-requests"
              element={
                <ProfileCompletionRoute>
                  <BloodRequestsPage />
                </ProfileCompletionRoute>
              }
            />
            <Route
              path="/health-tracking"
              element={
                <ProfileCompletionRoute>
                  <HealthTrackingPage />
                </ProfileCompletionRoute>
              }
            />
            <Route
              path="/hospitals"
              element={
                <ProfileCompletionRoute>
                  <HospitalManagementPage />
                </ProfileCompletionRoute>
              }
            />
            <Route
              path="/mental-health"
              element={
                <ProfileCompletionRoute>
                  <MentalHealthPage />
                </ProfileCompletionRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
