import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateUtils';

const BookingConfirmation = () => {
  const location = useLocation();
  const { booking, service } = location.state || {};

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Information Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            Please try making your booking again
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Booking Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mt-1">
            Thank you for your booking. We'll see you soon!
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 my-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Date</div>
                <div className="text-sm text-gray-600">
                  {formatDate(booking.booking_date)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Time</div>
                <div className="text-sm text-gray-600">
                  {formatTime(booking.booking_time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Service</div>
                <div className="text-sm text-gray-600">
                  {service?.name} ({service?.duration} minutes)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">Price</div>
                <div className="text-sm text-gray-600">
                  ${booking.total_amount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-6">
          <p>
            A confirmation email has been sent to {booking.client_email}.
            Please check your email for detailed information about your booking.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/booking"
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Book Another Appointment
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Print Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
