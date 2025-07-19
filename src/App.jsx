import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoadingSpinner from './components/shared/LoadingSpinner'

// Lazy load components
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'))
const Login = React.lazy(() => import('./components/auth/Login'))
const Register = React.lazy(() => import('./components/auth/Register'))
const PublicBookingPage = React.lazy(() => import('./components/booking/PublicBookingPage'))
const BookingConfirmation = React.lazy(() => import('./components/booking/BookingConfirmation'))
const ServiceManager = React.lazy(() => import('./components/services/ServiceManager'))

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return !user ? children : <Navigate to="/dashboard" />
}

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/book/:businessId" 
              element={<PublicBookingPage />} 
            />
            <Route path="/booking/confirmation" element={
              <Suspense fallback={<LoadingSpinner />}>
                <BookingConfirmation />
              </Suspense>
            } />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/services" 
              element={
                <ProtectedRoute>
                  <ServiceManager />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

function App() {
  console.log('App component rendered');
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App;