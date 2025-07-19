import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import Header from '../shared/Header'
import Navigation from '../shared/Navigation'
import StatsCards from './StatsCards'
import JobCard from './JobCard'
import BookingCalendar from '../booking/BookingCalendar'
import { CalendarIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { formatDate, formatDateRelative } from '../../utils/dateUtils'
import { db } from '../../utils/supabase'
import LoadingSpinner from '../shared/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekBookings: 0,
    totalClients: 0,
    monthlyRevenue: 0
  })
  const [upcomingJobs, setUpcomingJobs] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        // Fetch bookings for stats and upcoming jobs
        const today = new Date()
        const weekFromNow = new Date()
        weekFromNow.setDate(today.getDate() + 7)

        const { data: bookings, error: bookingsError } = await db.getBookings(
          user.id,
          today.toISOString().split('T')[0],
          weekFromNow.toISOString().split('T')[0]
        )

        if (bookingsError) throw bookingsError

        // Get clients
        const { data: clientsData } = await db.getClients(user.id)
        setClients(clientsData || [])

        // Get services
        const { data: servicesData } = await db.getServices(user.id)
        setServices(servicesData || [])

        // Calculate stats
        const todayBookings = bookings?.filter(booking => {
          return new Date(booking.booking_date).toDateString() === today.toDateString()
        }).length || 0

        const monthlyRevenue = bookings?.reduce((sum, booking) => {
          const bookingDate = new Date(booking.booking_date)
          if (bookingDate.getMonth() === today.getMonth() && 
              bookingDate.getFullYear() === today.getFullYear() &&
              booking.payment_status === 'succeeded') {
            return sum + parseFloat(booking.total_amount || 0)
          }
          return sum
        }, 0) || 0

        setStats({
          todayBookings,
          weekBookings: bookings?.length || 0,
          totalClients: clients?.length || 0,
          monthlyRevenue
        })

        // Set upcoming jobs (next 7 days) and transform data for JobCard
        const upcoming = bookings?.filter(booking => {
          const bookingDate = new Date(booking.booking_date)
          return bookingDate >= today && booking.status !== 'cancelled'
        }).slice(0, 5).map(booking => ({
          // Transform booking data to match JobCard expected format
          id: booking.id,
          serviceName: booking.services?.name || 'Service',
          clientName: booking.clients?.name || 'Unknown Client',
          clientPhone: booking.clients?.phone || '',
          clientEmail: booking.clients?.email || '',
          scheduledDate: `${booking.booking_date}T${booking.booking_time || '09:00'}:00`,
          status: booking.status || 'pending',
          price: booking.total_amount || 0,
          description: booking.notes || '',
          location: booking.clients?.address || '',
          duration: booking.services?.duration || 60,
          priority: booking.priority || 'medium'
        })) || []

        setUpcomingJobs(upcoming)

        // Create recent activity
        const activity = bookings?.map(booking => ({
          id: booking.id,
          type: 'booking',
          title: `${booking.services?.name || 'Service'} appointment`,
          client: booking.clients?.name || 'Unknown Client',
          date: booking.booking_date,
          time: booking.booking_time,
          status: booking.status
        })).slice(0, 10) || []

        setRecentActivity(activity)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  // Handler functions for JobCard actions
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      // Update booking status in database
      const { error } = await db.updateBookingStatus(jobId, newStatus)
      if (error) throw error

      // Update local state
      setUpcomingJobs(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      )

      // Refresh dashboard data to update stats
      const today = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)

      const { data: bookings } = await db.getBookings(
        user.id,
        today.toISOString().split('T')[0],
        weekFromNow.toISOString().split('T')[0]
      )

      // Update upcoming jobs list
      const upcoming = bookings?.filter(booking => {
        const bookingDate = new Date(booking.booking_date)
        return bookingDate >= today && booking.status !== 'cancelled'
      }).slice(0, 5).map(booking => ({
        id: booking.id,
        serviceName: booking.services?.name || 'Service',
        clientName: booking.clients?.name || 'Unknown Client',
        clientPhone: booking.clients?.phone || '',
        clientEmail: booking.clients?.email || '',
        scheduledDate: `${booking.booking_date}T${booking.booking_time || '09:00'}:00`,
        status: booking.status || 'pending',
        price: booking.total_amount || 0,
        description: booking.notes || '',
        location: booking.clients?.address || '',
        duration: booking.services?.duration || 60,
        priority: booking.priority || 'medium'
      })) || []

      setUpcomingJobs(upcoming)

    } catch (error) {
      console.error('Error updating job status:', error)
      // You might want to show a toast notification here
    }
  }

  const handleEditJob = (job) => {
    // Navigate to edit form or open modal
    console.log('Edit job:', job)
    // You can implement this based on your routing/modal system
    // For example: navigate(`/bookings/${job.id}/edit`)
  }

  const handleDeleteJob = async (job) => {
    if (window.confirm(`Are you sure you want to delete the ${job.serviceName} appointment for ${job.clientName}?`)) {
      try {
        const { error } = await db.deleteBooking(job.id)
        if (error) throw error

        // Remove from local state
        setUpcomingJobs(prev => prev.filter(j => j.id !== job.id))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          weekBookings: Math.max(0, prev.weekBookings - 1)
        }))

      } catch (error) {
        console.error('Error deleting job:', error)
        // Show error notification
      }
    }
  }

  const handleContactClient = (job) => {
    // Create a more sophisticated contact method
    if (job.clientEmail) {
      const subject = `Regarding your ${job.serviceName} appointment`
      const body = `Hi ${job.clientName},\n\nI hope this message finds you well. I'm reaching out regarding your upcoming ${job.serviceName} appointment scheduled for ${formatDate(job.scheduledDate)}.\n\nBest regards,\n${user?.user_metadata?.business_name || 'Your Service Provider'}`
      
      window.location.href = `mailto:${job.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    } else if (job.clientPhone) {
      // For mobile devices, you could open SMS
      window.location.href = `tel:${job.clientPhone}`
    } else {
      alert('No contact information available for this client.')
    }
  }

  // Booking calendar handler
  const handleScheduleDateSelect = (date) => {
    setSelectedScheduleDate(date);
    setIsBookingModalOpen(true);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CalendarIcon },
    { id: 'schedule', name: 'Schedule', icon: ClockIcon },
    { id: 'clients', name: 'Clients', icon: UserGroupIcon },
    { id: 'services', name: 'Services', icon: CurrencyDollarIcon }
  ]

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.user_metadata?.business_name || 'there'}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your business today.
                </p>
              </div>

              {/* Stats Cards */}
              <StatsCards stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Jobs - MODIFIED SECTION */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-medium text-gray-900">Upcoming Jobs</h2>
                  </div>
                  <div className="p-6">
                    {upcomingJobs.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingJobs.map((job) => (
                          <JobCard 
                            key={job.id} 
                            job={job}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                            onContactClient={handleContactClient}
                            className="mb-4"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming jobs</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Your schedule is clear for the next week.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="p-6">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {activity.client} • {formatDateRelative(activity.date)}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                activity.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : activity.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Activity will appear here as you manage bookings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('services')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add Service
                  </button>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Add Client
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Schedule
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Schedule</h2>
                    <p className="text-sm text-gray-500">Manage your appointments and availability</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/booking'}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Public Booking Page
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <BookingCalendar
                      availableDates={[...Array(90)].map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() + i)
                        return date.toISOString().split('T')[0]
                      })}
                      selectedDate={selectedScheduleDate}
                      selectedTime={selectedScheduleTime}
                      onDateSelect={handleScheduleDateSelect}
                      onTimeSelect={handleScheduleTimeSelect}
                      bookedSlots={upcomingJobs.map(job => ({
                        date: job.scheduledDate.split('T')[0],
                        time: job.scheduledDate.split('T')[1].substring(0, 5)
                      }))}
                      className="h-full"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">New Booking</h3>
                    {selectedScheduleDate && selectedScheduleTime ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Selected Time</p>
                          <p className="text-lg text-gray-900">
                            {formatDate(selectedScheduleDate)} at {formatTime(selectedScheduleTime)}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsBookingModalOpen(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Create Booking
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Select a date and time to create a new booking
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs */}
          {activeTab !== 'overview' && activeTab !== 'schedule' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-gray-500">
                This section is coming soon! The {activeTab} feature will be implemented here.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Create New Booking</h2>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <BookingForm
                initialDate={selectedScheduleDate}
                onSubmit={async (bookingData) => {
                  try {
                    const { error } = await db.createBooking(bookingData);
                    if (error) throw error;
                    setIsBookingModalOpen(false);
                    fetchDashboardData();
                  } catch (error) {
                    console.error('Error creating booking:', error);
                    alert('Failed to create booking. Please try again.');
                  }
                }}
                onCancel={() => setIsBookingModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard