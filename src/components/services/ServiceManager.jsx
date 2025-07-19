import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import ServiceList from './ServiceList';
import ServiceModal from './ServiceModal';
import LoadingSpinner from '../shared/LoadingSpinner';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleToggleServiceStatus = async (service) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ isActive: !service.isActive })
        .eq('id', service.id)
        .select()
        .single();

      if (error) throw error;

      setServices(services.map(s => 
        s.id === service.id ? data : s
      ));
    } catch (error) {
      console.error('Error updating service status:', error);
      // You might want to show a toast notification here
    }
  };

  const handleSaveService = async (serviceData) => {
    try {
      setIsSaving(true);
      
      // Format the data for the database
      const formattedData = {
        name: serviceData.name,
        description: serviceData.description,
        duration: serviceData.duration,
        price: serviceData.price,
        category: serviceData.category,
        is_active: serviceData.isActive,
        location: serviceData.location,
        requires_deposit: serviceData.requiresDeposit,
        deposit_amount: serviceData.requiresDeposit ? serviceData.depositAmount : null,
        notes: serviceData.notes
      };

      if (serviceData.id) {
        // Update existing service
        const { data, error } = await supabase
          .from('services')
          .update(formattedData)
          .eq('id', serviceData.id)
          .select()
          .single();

        if (error) throw error;

        setServices(services.map(service => 
          service.id === data.id ? data : service
        ));
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('services')
          .insert(formattedData)
          .select()
          .single();

        if (error) throw error;

        setServices([data, ...services]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your service offerings, pricing, and availability.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </button>
        </div>
      </div>

      <ServiceList
        services={services}
        onEditService={handleEditService}
        onToggleServiceStatus={handleToggleServiceStatus}
      />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        service={selectedService}
        isLoading={isSaving}
      />
    </div>
  );
};

export default ServiceManager;
