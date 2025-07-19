import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

// Database helpers
export const db = {
  // Services
  getServices: async (userId) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createService: async (serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
    return { data, error }
  },

  updateService: async (id, updates) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteService: async (id) => {
    const { data, error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Bookings
  getBookings: async (userId, startDate, endDate) => {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services(*),
        clients(*)
      `)
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('booking_date', startDate)
    }
    if (endDate) {
      query = query.lte('booking_date', endDate)
    }

    const { data, error } = await query.order('booking_date', { ascending: true })
    return { data, error }
  },

  createBooking: async (bookingData) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
    return { data, error }
  },

  updateBookingStatus: async (bookingId, newStatus) => {
  return await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
  },

  deleteBooking: async (bookingId) => {
  return await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
  },

  // Clients
  getClients: async (userId) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    return { data, error }
  },

  createClient: async (clientData) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
    return { data, error }
  }
}