import React from 'react';
import { CalendarIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const cardConfig = [
  {
    key: 'todayBookings',
    label: "Today's Bookings",
    icon: CalendarIcon,
    color: 'bg-blue-50 text-blue-900',
  },
  {
    key: 'weekBookings',
    label: 'This Week',
    icon: ClockIcon,
    color: 'bg-purple-50 text-purple-900',
  },
  {
    key: 'totalClients',
    label: 'Clients',
    icon: UserGroupIcon,
    color: 'bg-green-50 text-green-900',
  },
  {
    key: 'monthlyRevenue',
    label: 'Revenue (Month)',
    icon: CurrencyDollarIcon,
    color: 'bg-yellow-50 text-yellow-900',
    format: (v) => `$${v.toLocaleString()}`,
  },
];

const StatsCards = ({ stats = {} }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {cardConfig.map(({ key, label, icon: Icon, color, format }) => (
      <div key={key} className={`bg-white rounded-lg shadow-sm border p-6 flex items-center gap-4`}>
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {format ? format(stats[key] || 0) : stats[key] || 0}
          </div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    ))}
  </div>
);

export default StatsCards;
