import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit3,
  Trash2,
  MessageSquare
} from 'lucide-react';

const JobCard = ({ 
  job, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  onContactClient,
  className = "" 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status configuration
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertCircle,
      label: 'Pending'
    },
    confirmed: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    'in-progress': {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Clock,
      label: 'In Progress'
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const currentStatus = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  // Priority configuration
  const priorityConfig = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const { date, time } = formatDateTime(job.scheduledDate);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (isUpdating || !onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(job.id, newStatus);
    } catch (error) {
      console.error('Failed to update job status:', error);
    } finally {
      setIsUpdating(false);
      setShowActions(false);
    }
  };

  // Get next logical status
  const getNextStatus = () => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'in-progress',
      'in-progress': 'completed'
    };
    return statusFlow[job.status];
  };

  const nextStatus = getNextStatus();

  return (
    <div className={`bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {job.serviceName || 'Service'}
              </h3>
              {job.priority && (
                <span className={`text-xs font-medium ${priorityConfig[job.priority]}`}>
                  {job.priority.toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${currentStatus.color}`}>
              <StatusIcon className="w-3 h-3" />
              {currentStatus.label}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isUpdating}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(job);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Job
                    </button>
                  )}
                  
                  {onContactClient && (
                    <button
                      onClick={() => {
                        onContactClient(job);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Client
                    </button>
                  )}
                  
                  {onDelete && job.status === 'pending' && (
                    <button
                      onClick={() => {
                        onDelete(job);
                        setShowActions(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Job
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date and Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{time}</span>
          </div>
        </div>

        {/* Client Information */}
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span className="text-sm">{job.clientName}</span>
        </div>

        {/* Location */}
        {job.location && (
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{job.location}</span>
          </div>
        )}

        {/* Contact Information */}
        <div className="flex items-center gap-4">
          {job.clientPhone && (
            <div className="flex items-center gap-1 text-gray-600">
              <Phone className="w-3 h-3" />
              <span className="text-xs">{job.clientPhone}</span>
            </div>
          )}
          {job.clientEmail && (
            <div className="flex items-center gap-1 text-gray-600">
              <Mail className="w-3 h-3" />
              <span className="text-xs">{job.clientEmail}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {job.price && (
          <div className="flex items-center gap-2 text-gray-900">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">
              ${typeof job.price === 'number' ? job.price.toFixed(2) : job.price}
            </span>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
            <p className="line-clamp-2">{job.description}</p>
          </div>
        )}

        {/* Duration */}
        {job.duration && (
          <div className="text-xs text-gray-500">
            Duration: {job.duration} minutes
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {nextStatus && job.status !== 'completed' && job.status !== 'cancelled' && (
        <div className="px-4 pb-4">
          <button
            onClick={() => handleStatusChange(nextStatus)}
            disabled={isUpdating}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isUpdating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              `Mark as ${statusConfig[nextStatus]?.label || 'Next Status'}`
            )}
          </button>
        </div>
      )}

      {/* Completed/Cancelled State */}
      {(job.status === 'completed' || job.status === 'cancelled') && (
        <div className="px-4 pb-4">
          <div className={`text-center py-2 rounded-md text-sm font-medium ${
            job.status === 'completed' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {job.status === 'completed' ? '✅ Job Completed' : '❌ Job Cancelled'}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;