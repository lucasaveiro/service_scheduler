import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Calendar, Clock, DollarSign, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { db } from '../../utils/supabase';
import LoadingSpinner from '../shared/LoadingSpinner';
import BookingCalendar from './BookingCalendar';

const BookingForm = ({ 
  initialService = null,
  initialDate = null,
  onSubmit,
  onCancel,
  isModal = false 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch available services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data: servicesData, error } = await db.getServices(user?.id);
        if (error) throw error;
        
        const activeServices = servicesData.filter(service => service.isActive);
        setServices(activeServices);
        
        if (!selectedService && activeServices.length > 0) {
          setSelectedService(activeServices[0]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user?.id, selectedService]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedService) newErrors.service = 'Please select a service';
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedTime) newErrors.time = 'Please select a time';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = 'Either email or phone is required';
    }
    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const bookingData = {
        service_id: selectedService.id,
        booking_date: formatDate(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        client_address: formData.address,
        notes: formData.notes,
        total_amount: selectedService.price,
        status: 'pending',
        duration: selectedService.duration,
        created_by: user?.id
      };

      if (onSubmit) {
        await onSubmit(bookingData);
      } else {
        const { error } = await db.createBooking(bookingData);
        if (error) throw error;
        
        navigate('/booking/confirmation', { 
          state: { 
            booking: bookingData,
            service: selectedService
          }
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create booking. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading booking form..." />;
  }

  return (
    <div className={`${isModal ? '' : 'max-w-3xl mx-auto p-6'}`}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedService?.id === service.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${service.price}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration} mins
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.location === 'client_location' ? 'At your location' : 'At business'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.service && (
            <p className="mt-2 text-sm text-red-600">{errors.service}</p>
          )}
        </div>

        {/* Calendar */}
        {selectedService && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date & Time</h3>
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              serviceDuration={selectedService.duration}
              businessHours={{ start: '09:00', end: '17:00' }}
            />
            {(errors.date || errors.time) && (
              <p className="mt-2 text-sm text-red-600">{errors.date || errors.time}</p>
            )}
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {errors.contact && (
            <p className="mt-2 text-sm text-red-600">{errors.contact}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special requests or information..."
          />
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
