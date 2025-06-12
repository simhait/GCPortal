import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star
} from 'lucide-react';

// Sample data for suppliers
const sampleSuppliers = [
  {
    id: 1,
    name: "Global Foods Distribution",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29tcGFueSUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=50&q=60",
    description: "Major distributor of international food products",
    contactName: "Sarah Johnson",
    email: "sarah@globalfoods.com",
    phone: "(555) 123-4567",
    address: "123 Distribution Way, Portland, OR 97201",
    website: "www.globalfoodsdist.com",
    status: "active",
    itemCount: 342,
    rating: 4.8,
    lastOrder: "2023-09-15"
  },
  {
    id: 2,
    name: "Farm Fresh Produce",
    logo: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZhcm0lMjBsb2dvfGVufDB8fDB8fHww&auto=format&fit=crop&w=50&q=60",
    description: "Local supplier of organic fruits and vegetables",
    contactName: "Michael Chen",
    email: "michael@farmfresh.com",
    phone: "(555) 987-6543",
    address: "456 Organic Lane, Eugene, OR 97401",
    website: "www.farmfreshproduce.com",
    status: "active",
    itemCount: 128,
    rating: 4.9,
    lastOrder: "2023-09-20"
  },
  {
    id: 3,
    name: "Quality Meats Inc.",
    logo: "https://images.unsplash.com/photo-1565066874669-d5f4fdc48329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVhdCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=50&q=60",
    description: "Premium meat supplier for restaurants and institutions",
    contactName: "Robert Williams",
    email: "robert@qualitymeats.com",
    phone: "(555) 456-7890",
    address: "789 Butcher Blvd, Seattle, WA 98101",
    website: "www.qualitymeats.com",
    status: "active",
    itemCount: 95,
    rating: 4.6,
    lastOrder: "2023-09-18"
  },
  {
    id: 4,
    name: "Seaside Seafood",
    logo: "https://images.unsplash.com/photo-1533745848184-3db07256e163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VhZm9vZCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=50&q=60",
    description: "Fresh seafood delivered daily from the coast",
    contactName: "Emily Rodriguez",
    email: "emily@seasideseafood.com",
    phone: "(555) 789-0123",
    address: "321 Harbor Drive, San Francisco, CA 94111",
    website: "www.seasideseafood.com",
    status: "active",
    itemCount: 87,
    rating: 4.7,
    lastOrder: "2023-09-19"
  },
  {
    id: 5,
    name: "Artisan Bakery Supply",
    logo: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJha2VyeSUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=50&q=60",
    description: "Specialty flours, grains, and baking ingredients",
    contactName: "David Thompson",
    email: "david@artisanbakery.com",
    phone: "(555) 234-5678",
    address: "567 Flour Mill Road, Denver, CO 80202",
    website: "www.artisanbakerysupply.com",
    status: "inactive",
    itemCount: 156,
    rating: 4.5,
    lastOrder: "2023-08-30"
  },
  {
    id: 6,
    name: "Dairy Delights",
    logo: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZGFpcnklMjBsb2dvfGVufDB8fDB8fHww&auto=format&fit=crop&w=50&q=60",
    description: "Premium dairy products from local farms",
    contactName: "Jessica Miller",
    email: "jessica@dairydelights.com",
    phone: "(555) 345-6789",
    address: "890 Milk Way, Madison, WI 53703",
    website: "www.dairydelights.com",
    status: "active",
    itemCount: 73,
    rating: 4.4,
    lastOrder: "2023-09-17"
  }
];

const Suppliers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false); 
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter suppliers based on search term and filters
  const filteredSuppliers = sampleSuppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      supplier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (a[sortField as keyof typeof a] < b[sortField as keyof typeof b]) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (a[sortField as keyof typeof a] > b[sortField as keyof typeof b]) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = sortedSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedSuppliers.length === currentSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(currentSuppliers.map(supplier => supplier.id));
    }
  };

  const handleSelectSupplier = (id: number) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter(supplierId => supplierId !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewSupplier = (id: number) => {
    navigate(`/management/suppliers/${id}`);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-end mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Supplier
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 border rounded-md flex items-center ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>

          {/*
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Import
            </button>
          */}
          
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Filter Vendors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Items Count</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">Any</option>
                <option value="0">No items</option>
                <option value="1-10">1-10 items</option>
                <option value="11-50">11-50 items</option>
                <option value="50+">50+ items</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="name">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="items">Item Count (High-Low)</option>
                <option value="items-asc">Item Count (Low-High)</option>
              </select>
            </div>
          </div>
        </div>
      )}
        
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedSuppliers.length === currentSuppliers.length && currentSuppliers.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Supplier
                  {sortField === 'name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('contactName')}
              >
                <div className="flex items-center">
                  Contact
                  {sortField === 'contactName' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('itemCount')}
              >
                <div className="flex items-center">
                  Items
                  {sortField === 'itemCount' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center">
                  Rating
                  {sortField === 'rating' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={() => handleSelectSupplier(supplier.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={supplier.logo} alt={supplier.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.contactName}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {supplier.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {supplier.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.itemCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    supplier.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1">{supplier.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleViewSupplier(supplier.id)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
          <span className="font-medium">
            {indexOfLastItem > filteredSuppliers.length ? filteredSuppliers.length : indexOfLastItem}
          </span>{' '}
          of <span className="font-medium">{filteredSuppliers.length}</span> suppliers
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/*
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">(555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">contact@globalfoods.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600">123 Distribution Way, Portland, OR 97201</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Website</p>
                  <p className="text-sm text-indigo-600 hover:underline">www.globalfoodsdist.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Supplier Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">342</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900 mr-2">4.8</p>
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Last Order</p>
                <p className="text-2xl font-semibold text-gray-900">15 Sep</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-semibold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}
      
    </div>
  );
};

export default Suppliers;