import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, Briefcase, Settings } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'services', label: 'Services', icon: Briefcase, path: '/services' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/bookings' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
  ]
  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800">ServiceScheduler</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your business</p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon 
                  className={`mr-3 h-5 w-5 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Additional Navigation Section (if needed) */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </div>
          
          {/* Settings/Profile placeholder - can be extended */}
          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg 
              className="mr-3 h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">U</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">User Account</p>
            <p className="text-xs text-gray-500">Business Owner</p>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation