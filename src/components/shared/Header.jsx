import React from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { 
  BellIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline'

const Header = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">ServiceScheduler</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <Cog6ToothIcon className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.user_metadata?.business_name || 'Business Name'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.email}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header