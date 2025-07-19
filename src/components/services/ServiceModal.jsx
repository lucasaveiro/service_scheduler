import React, { useState, useEffect } from 'react'
import { FormModal } from '../shared/Modal'

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  service = null, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: '',
    category: '',
    isActive: true,
    location: 'client_location', // client_location, business_location, remote
    requiresDeposit: false,
    depositAmount: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 60,
        price: service.price || '',
        category: service.category || '',
        isActive: service.isActive !== false,
        location: service.location || 'client_location',
        requiresDeposit: service.requiresDeposit || false,
        depositAmount: service.depositAmount || '',
        notes: service.notes || ''
      })
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: '',
        category: '',
        isActive: true,
        location: 'client_location',
        requiresDeposit: false,
        depositAmount: '',
        notes: ''
      })
    }
    setErrors({})
  }, [service, isOpen])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required'
    }

    if (formData.requiresDeposit && (!formData.depositAmount || isNaN(formData.depositAmount) || parseFloat(formData.depositAmount) <= 0)) {
      newErrors.depositAmount = 'Valid deposit amount is required when deposit is enabled'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const serviceData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      depositAmount: formData.requiresDeposit ? parseFloat(formData.depositAmount) : null,
      id: service?.id // Include ID for updates
    }

    await onSave(serviceData)
  }

  const categories = [
    'Cleaning',
    'Maintenance',
    'Repair',
    'Installation',
    'Consultation',
    'Beauty & Wellness',
    'Pet Services',
    'Other'
  ]

  const locations = [
    { value: 'client_location', label: 'At Client Location' },
    { value: 'business_location', label: 'At Business Location' },
    { value: 'remote', label: 'Remote/Virtual' }
  ]

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' }
  ]

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={service ? 'Edit Service' : 'Add New Service'}
      isSubmitting={isLoading}
      size="lg"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., House Cleaning"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what this service includes..."
            />
          </div>
        </div>

        {/* Pricing & Duration */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Pricing & Duration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.duration ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
          </div>
        </div>

        {/* Location & Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Service Settings</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {locations.map(location => (
                <option key={location.value} value={location.value}>{location.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Service is active and available for booking
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresDeposit"
                name="requiresDeposit"
                checked={formData.requiresDeposit}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresDeposit" className="ml-2 block text-sm text-gray-700">
                Require deposit for booking
              </label>
            </div>

            {formData.requiresDeposit && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount ($) *
                </label>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-32 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.depositAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.depositAmount && <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Internal Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Internal notes (not visible to clients)..."
          />
        </div>
      </div>
    </FormModal>
  )
}

export default ServiceModal