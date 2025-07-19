import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Edit3,
  Trash2,
  MessageSquare,
  UserPlus,
  SortAsc,
  SortDesc,
  Grid3X3,
  List
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import ClientModal from './ClientModal';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDate, formatDateRelative } from '../../utils/dateUtils';

const ClientList = () => {
  const { user } = useAuth();
  const { 
    clients, 
    loading, 
    error, 
    deleteClient, 
    fetchClients,
    clientStats 
  } = useClients();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fetch clients on component mount
  useEffect(() => {
    if (user?.id) {
      fetchClients();
    }
  }, [user?.id, fetchClients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.includes(term) ||
        client.address?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(client => {
        switch (filterBy) {
          case 'active':
            return client.status === 'active';
          case 'inactive':
            return client.status === 'inactive';
          case 'vip':
            return client.is_vip;
          case 'recent':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return new Date(client.created_at) >= oneMonthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'lastBooking':
          aValue = a.last_booking_date ? new Date(a.last_booking_date) : new Date(0);
          bValue = b.last_booking_date ? new Date(b.last_booking_date) : new Date(0);
          break;
        case 'totalBookings':
          aValue = a.total_bookings || 0;
          bValue = b.total_bookings || 0;
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, sortBy, sortOrder, filterBy]);

  // Handle client actions
  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteClient = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      try {
        await deleteClient(client.id);
        setActiveDropdown(null);
      } catch (error) {
        console.error('Error deleting client:', error);
        // You might want to show a toast notification here
      }
    }
  };

  const handleContactClient = (client) => {
    if (client.email) {
      const subject = `Hello from ${user?.user_metadata?.business_name || 'Your Service Provider'}`;
      const body = `Hi ${client.name},\n\nI hope this message finds you well.\n\nBest regards,\n${user?.user_metadata?.business_name || 'Your Service Provider'}`;
      window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    setActiveDropdown(null);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    if (selectedClients.length === filteredAndSortedClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredAndSortedClients.map(client => client.id));
    }
  };

  // Render client card
  const renderClientCard = (client) => (
    <div key={client.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selectedClients.includes(client.id)}
              onChange={() => toggleClientSelection(client.id)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {client.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            
            {/* Client Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {client.name}
                </h3>
                {client.is_vip && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {client.status && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Client since {formatDate(client.created_at)}
              </p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === client.id ? null : client.id);
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {activeDropdown === client.id && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleEditClient(client)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Client
                  </button>
                  <button
                    onClick={() => handleContactClient(client)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    disabled={!client.email}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Client
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{client.phone}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{client.address}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {client.total_bookings || 0}
            </div>
            <div className="text-xs text-gray-500">Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              ${(client.total_spent || 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">Spent</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {client.last_booking_date ? formatDateRelative(client.last_booking_date) : 'Never'}
            </div>
            <div className="text-xs text-gray-500">Last Visit</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render client row for list view
  const renderClientRow = (client) => (
    <tr key={client.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedClients.includes(client.id)}
          onChange={() => toggleClientSelection(client.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {client.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-900">{client.name}</div>
              {client.is_vip && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
            </div>
            <div className="text-sm text-gray-500">{client.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {client.phone || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.total_bookings || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${(client.total_spent || 0).toFixed(0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {client.last_booking_date ? formatDateRelative(client.last_booking_date) : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          client.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {client.status || 'active'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === client.id ? null : client.id);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {activeDropdown === client.id && (
            <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-1">
                <button
                  onClick={() => handleEditClient(client)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Client
                </button>
                <button
                  onClick={() => handleContactClient(client)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={!client.email}
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </button>
                <button
                  onClick={() => handleDeleteClient(client)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Client
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <LoadingSpinner text="Loading clients..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Error loading clients</div>
        <button 
          onClick={fetchClients}
          className="text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client database and relationships
          </p>
        </div>
        <button
          onClick={handleAddClient}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      {clientStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-gray-900">{clientStats.total}</div>
            <div className="text-sm text-gray-500">Total Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-green-600">{clientStats.active}</div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-yellow-600">{clientStats.vip}</div>
            <div className="text-sm text-gray-500">VIP Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-2xl font-bold text-blue-600">{clientStats.newThisMonth}</div>
            <div className="text-sm text-gray-500">New This Month</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              showFilters ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700'
            } hover:bg-gray-50`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Clients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="vip">VIP Clients</option>
                <option value="recent">New Clients (30 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="created">Date Added</option>
                <option value="lastBooking">Last Booking</option>
                <option value="totalBookings">Total Bookings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedClients.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm font-medium text-blue-700 hover:text-blue-800">
                Export
              </button>
              <button className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-800">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List */}
      {filteredAndSortedClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterBy !== 'all' ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first client'
            }
          </p>
          {(!searchTerm && filterBy === 'all') && (
            <button
              onClick={handleAddClient}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredAndSortedClients.length} of {clients?.length || 0} clients
            </div>
            {viewMode === 'grid' && (
              <button
                onClick={selectAllClients}
                className="text-blue-600 hover:text-blue-800"
              >
                {selectedClients.length === filteredAndSortedClients.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedClients.map(renderClientCard)}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedClients.length === filteredAndSortedClients.length}
                        onChange={selectAllClients}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Client
                      {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 inline ml-1" /> : <SortDesc className="w-3 h-3 inline ml-1" />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalBookings')}
                    >
                      Bookings
                      {sortBy === 'totalBookings' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 inline ml-1" /> : <SortDesc className="w-3 h-3 inline ml-1" />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('lastBooking')}
                    >
                      Last Visit
                      {sortBy === 'lastBooking' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 inline ml-1" /> : <SortDesc className="w-3 h-3 inline ml-1" />)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedClients.map(renderClientRow)}
                </tbody>
                </table>
            </div>
            )}
            </>
            )}
            {/* Client Modal */}
            <ClientModal
              isOpen={isClientModalOpen}
              onClose={handleCloseModal}
              client={editingClient}
              onSave={() => {
                fetchClients();
                handleCloseModal();
              }}
                onDelete={handleDeleteClient}
                />
        </div>
        </div>
    );
};
export default ClientList;
