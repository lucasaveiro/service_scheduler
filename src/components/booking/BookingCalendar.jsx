import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import { 
  formatDate, 
  formatTime, 
  getWeekDays, 
  getAvailableTimeSlots 
} from '../../utils/dateUtils';

const BookingCalendar = ({ 
  availableDates = [], 
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  businessHours = { start: '09:00', end: '17:00' },
  serviceDuration = 60,
  bookedSlots = [],
  minDate = new Date(),
  maxDate = addMonths(new Date(), 3),
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  // Get days in current month
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Get week day names
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Navigate months
  const previousMonth = () => {
    const newDate = subMonths(currentMonth, 1);
    if (newDate >= minDate) {
      setCurrentMonth(newDate);
    }
  };

  const nextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    if (newDate <= maxDate) {
      setCurrentMonth(newDate);
    }
  };

  // Update time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      const slots = getAvailableTimeSlots(
        businessHours.start,
        businessHours.end,
        serviceDuration,
        bookedSlots.filter(slot => 
          isSameDay(parseISO(slot.date), selectedDate)
        ).map(slot => slot.time)
      );
      setTimeSlots(slots);
    }
  }, [selectedDate, businessHours, serviceDuration, bookedSlots]);

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date >= minDate && date <= maxDate) {
      setSelectedSlot(null);
      onDateSelect(date);
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedSlot(time);
    onTimeSelect(time);
  };

  // Check if a date is available
  const isDateAvailable = (date) => {
    return availableDates.some(availableDate => 
      isSameDay(parseISO(availableDate), date)
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              disabled={subMonths(currentMonth, 1) < minDate}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              disabled={addMonths(currentMonth, 1) > maxDate}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(day => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isAvailable = isDateAvailable(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isPast = day < minDate;
            const isFuture = day > maxDate;

            return (
              <button
                key={day.toString()}
                onClick={() => isAvailable && handleDateSelect(day)}
                disabled={!isAvailable || isPast || isFuture}
                className={`
                  aspect-square p-2 rounded-md relative
                  ${!isCurrentMonth && 'opacity-30'}
                  ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-900'}
                  ${isAvailable && !isSelected ? 'hover:bg-blue-50' : ''}
                  ${!isAvailable || isPast || isFuture ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'cursor-pointer'}
                  ${isToday(day) && !isSelected ? 'border-2 border-blue-600' : ''}
                `}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-sm">
                  {format(day, 'd')}
                </time>
                {isAvailable && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Available Times
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map(time => {
              const isTimeSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`
                    flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm
                    ${isTimeSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  {formatTime(time)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && timeSlots.length === 0 && (
        <div className="p-4 border-t text-center text-sm text-gray-500">
          No available time slots for this date
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
