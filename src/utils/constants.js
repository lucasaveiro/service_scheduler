// Auth-related constants
export const USER_ROLES = {
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
  STAFF: 'staff'
};

export const BUSINESS_TYPES = {
  HOUSEKEEPING: 'housekeeping',
  LANDSCAPING: 'landscaping',
  PERSONAL_CARE: 'personal_care',
  PROFESSIONAL_SERVICES: 'professional_services',
  OTHER: 'other'
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid login credentials',
  EMAIL_IN_USE: 'Email already registered',
  WEAK_PASSWORD: 'Password is too weak',
  INVALID_EMAIL: 'Invalid email format',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN: 'An unknown error occurred'
};

// Time and date formatting functions
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isSameDay, isToday, isTomorrow, isYesterday } from 'date-fns'

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  return format(new Date(date), formatStr)
}

export const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export const getWeekRange = (date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 })
  }
}

export const getDayRange = (date = new Date()) => {
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  }
}

export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const formatDateRelative = (date) => {
  const dateObj = new Date(date)
  
  if (isToday(dateObj)) return 'Today'
  if (isTomorrow(dateObj)) return 'Tomorrow'
  if (isYesterday(dateObj)) return 'Yesterday'
  
  return format(dateObj, 'MMM dd')
}

export const combineDateAndTime = (date, time) => {
  const dateStr = format(new Date(date), 'yyyy-MM-dd')
  return new Date(`${dateStr}T${time}`)
}

export const getAvailableTimeSlots = (startTime, endTime, duration = 60, bookedSlots = []) => {
  const slots = []
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  
  let current = start
  
  while (current < end) {
    const timeStr = format(current, 'HH:mm')
    
    if (!bookedSlots.includes(timeStr)) {
      slots.push({
        time: timeStr,
        display: formatTime(timeStr)
      })
    }
    
    current = new Date(current.getTime() + duration * 60000)
  }
  
  return slots
}