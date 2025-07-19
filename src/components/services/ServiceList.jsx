import React from 'react';
import { Clock, DollarSign, MapPin } from 'lucide-react';

const ServiceList = ({ services, onEditService, onToggleServiceStatus }) => {
  const getLocationLabel = (location) => {
    const labels = {
      client_location: 'At Client Location',
      business_location: 'At Business Location',
      remote: 'Remote/Virtual'
    };
    return labels[location] || location;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (!services?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No services found. Add your first service to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div 
          key={service.id}
          className={`relative bg-white rounded-lg shadow-sm border ${
            service.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
          } overflow-hidden hover:shadow-md transition-shadow duration-200`}
        >
          {/* Service Status Badge */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => onToggleServiceStatus(service)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                service.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {service.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="p-6">
            {/* Service Header */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {service.name}
              </h3>
              {service.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {service.category}
                </span>
              )}
            </div>

            {/* Service Details */}
            <div className="space-y-3 mb-4">
              {service.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatDuration(service.duration)}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>${service.price.toFixed(2)}</span>
                {service.requiresDeposit && (
                  <span className="ml-2 text-xs text-gray-500">
                    (${service.depositAmount} deposit required)
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{getLocationLabel(service.location)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => onEditService(service)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Service
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
