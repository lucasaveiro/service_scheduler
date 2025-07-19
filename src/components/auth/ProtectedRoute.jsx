import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import LoadingSpinner from '../shared/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Authenticated and authorized
  return children
}

export default ProtectedRoute
