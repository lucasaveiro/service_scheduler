import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { db } from '../../utils/supabase';
import BookingForm from './BookingForm';
import LoadingSpinner from '../shared/LoadingSpinner';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const preSelectedServiceId = searchParams.get('service');

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Fetch business details
        const { data: businessData, error: businessError } = await db.getBusinessProfile(businessId);
        if (businessError) throw businessError;
        
        if (!businessData) {
          setError('Business not found');
          return;
        }
        
        setBusiness(businessData);

        // Fetch active services
        const { data: servicesData, error: servicesError } = await db.getServices(businessId);
        if (servicesError) throw servicesError;
        
        const activeServices = servicesData.filter(service => service.isActive);
        setServices(activeServices);

      } catch (error) {
        console.error('Error fetching business data:', error);
        setError('Failed to load business information');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusinessData();
    }
  }, [businessId]);

  if (loading) {
    return <LoadingSpinner text="Loading booking page..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error}
          </h1>
          <p className="text-gray-600">
            Please check the URL and try again
          </p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-600">
            The business you're looking for doesn't exist or is no longer available
          </p>
        </div>
      </div>
    );
  }

  // Find pre-selected service if specified in URL
  const preSelectedService = preSelectedServiceId 
    ? services.find(s => s.id === preSelectedServiceId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {business.business_name}
              </h1>
              {business.tagline && (
                <p className="mt-1 text-gray-600">{business.tagline}</p>
              )}
            </div>
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt={`${business.business_name} logo`}
                className="h-12 w-12 rounded-full"
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Business Information
              </h2>
              <div className="space-y-4">
                {business.description && (
                  <p className="text-gray-600">
                    {business.description}
                  </p>
                )}
                {business.business_hours && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Business Hours</div>
                      <div className="text-gray-600 whitespace-pre-line">
                        {business.business_hours}
                      </div>
                    </div>
                  </div>
                )}
                {business.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Location</div>
                      <div className="text-gray-600">
                        {business.location}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Our Services
              </h2>
              <div className="space-y-4">
                {services.map(service => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between p-3 rounded-lg border hover:border-blue-300 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} mins
                        </div>
                        {service.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {service.location === 'client_location' ? 'At your location' : 'At business'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${service.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Summary */}
            {business.rating && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(business.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {business.rating} out of 5 ({business.review_count} reviews)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Book an Appointment
              </h2>
              <BookingForm
                initialService={preSelectedService}
                businessId={businessId}
                businessHours={business.business_hours}
                services={services}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicBookingPage;
