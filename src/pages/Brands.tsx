import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';

// Sample data for brands
const sampleBrands = [
  { 
    id: 1, 
    name: 'Organic Valley', 
    description: 'Organic dairy products and more',
    logo: 'https://images.unsplash.com/photo-1607006483201-b7d5ff5c9bd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    website: 'https://organicvalley.com',
    contactName: 'Jane Smith',
    contactEmail: 'jane@organicvalley.com',
    contactPhone: '555-123-4567',
    active: true,
    itemCount: 42
  },
  { 
    id: 2, 
    name: 'Nature\'s Best', 
    description: 'Natural and organic food products',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    website: 'https://naturesbest.com',
    contactName: 'John Doe',
    contactEmail: 'john@naturesbest.com',
    contactPhone: '555-987-6543',
    active: true,
    itemCount: 37
  },
  { 
    id: 3, 
    name: 'Wholesome Foods', 
    description: 'Whole grain and natural ingredients',
    logo: 'https://images.unsplash.com/photo-1587411768515-eeac0647deed?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    website: 'https://wholesomefoods.com',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@wholesomefoods.com',
    contactPhone: '555-456-7890',
    active: true,
    itemCount: 28
  },
  { 
    id: 4, 
    name: 'Green Farms', 
    description: 'Locally sourced produce and dairy',
    logo: 'https://images.unsplash.com/photo-1595351298020-038700609878?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    website: 'https://greenfarms.com',
    contactName: 'Michael Brown',
    contactEmail: 'michael@greenfarms.com',
    contactPhone: '555-789-0123',
    active: false,
    itemCount: 15
  },
  { 
    id: 5, 
    name: 'Pure Harvest', 
    description: 'Organic fruits and vegetables',
    logo: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    website: 'https://pureharvest.com',
    contactName: 'Emily Wilson',
    contactEmail: 'emily@pureharvest.com',
    contactPhone: '555-234-5678',
    active: true,
    itemCount: 31
  }
];

const Brands: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); 
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter brands based on search term
  const filteredBrands = sampleBrands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  // Handle brand selection
  const toggleBrandSelection = (id: number) => {
    if (selectedBrands.includes(id)) {
      setSelectedBrands(selectedBrands.filter(brandId => brandId !== id));
    } else {
      setSelectedBrands([...selectedBrands, id]);
    }
  };

  // Select all brands on current page
  const selectAllOnPage = () => {
    if (currentBrands.every(brand => selectedBrands.includes(brand.id))) {
      // If all are selected, deselect all
      setSelectedBrands(selectedBrands.filter(id => 
        !currentBrands.some(brand => brand.id === id)
      ));
    } else {
      // Select all that aren't already selected
      const newSelections = currentBrands
        .filter(brand => !selectedBrands.includes(brand.id))
        .map(brand => brand.id);
      setSelectedBrands([...selectedBrands, ...newSelections]);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-end mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Brand
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
            placeholder="Search brands..."
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
          <h3 className="font-medium text-gray-700 mb-2">Filter Brands</h3>
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
                  <button onClick={selectAllOnPage} className="mr-2">
                    {currentBrands.length > 0 && currentBrands.every(brand => selectedBrands.includes(brand.id)) 
                      ? <CheckSquare className="h-5 w-5 text-indigo-600" /> 
                      : <Square className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  Brand
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBrands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <button onClick={() => toggleBrandSelection(brand.id)} className="mr-2">
                        {selectedBrands.includes(brand.id) 
                          ? <CheckSquare className="h-5 w-5 text-indigo-600" /> 
                          : <Square className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                    <div className="flex-shrink-0 h-10 w-10 mr-4">
                      <img className="h-10 w-10 rounded-full object-cover" src={brand.logo} alt={brand.name} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                      <div className="text-sm text-gray-500">{brand.website}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{brand.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{brand.contactName}</div>
                  <div className="text-sm text-gray-500">{brand.contactEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    brand.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {brand.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {brand.itemCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredBrands.length)}
              </span>{' '}
              of <span className="font-medium">{filteredBrands.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;