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
  Square,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building
} from 'lucide-react';

// Sample data for manufacturers
const sampleManufacturers = [
  { 
    id: 1, 
    name: 'Tyson Foods', 
    description: 'Leading producer of chicken, beef, and pork products',
    logo: 'https://images.unsplash.com/photo-1563302905-4c4b5578e2d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Michael Johnson',
    contactEmail: 'michael@tysonfoods.com',
    contactPhone: '555-123-4567',
    address: '2200 W Don Tyson Pkwy, Springdale, AR 72762',
    website: 'www.tysonfoods.com',
    active: true,
    itemCount: 156,
    yearFounded: 1935,
    certifications: ['USDA Certified', 'Global Food Safety Initiative']
  },
  { 
    id: 2, 
    name: 'General Mills', 
    description: 'Multinational manufacturer of consumer foods',
    logo: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Sarah Williams',
    contactEmail: 'sarah@generalmills.com',
    contactPhone: '555-987-6543',
    address: '1 General Mills Blvd, Minneapolis, MN 55426',
    website: 'www.generalmills.com',
    active: true,
    itemCount: 203,
    yearFounded: 1866,
    certifications: ['Non-GMO Project Verified', 'Organic Certified']
  },
  { 
    id: 3, 
    name: 'Kellogg Company', 
    description: 'Multinational food manufacturing company',
    logo: 'https://images.unsplash.com/photo-1607800910307-bb759481c9f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Robert Davis',
    contactEmail: 'robert@kelloggs.com',
    contactPhone: '555-456-7890',
    address: '1 Kellogg Square, Battle Creek, MI 49016',
    website: 'www.kelloggcompany.com',
    active: true,
    itemCount: 178,
    yearFounded: 1906,
    certifications: ['Rainforest Alliance Certified', 'Fair Trade']
  },
  { 
    id: 4, 
    name: 'Nestlé', 
    description: 'Largest food company in the world',
    logo: 'https://images.unsplash.com/photo-1607613009821-11b2d4b9f6e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Jennifer Smith',
    contactEmail: 'jennifer@nestle.com',
    contactPhone: '555-789-0123',
    address: '800 N Brand Blvd, Glendale, CA 91203',
    website: 'www.nestle.com',
    active: true,
    itemCount: 245,
    yearFounded: 1866,
    certifications: ['ISO 22000', 'B Corp Certified']
  },
  { 
    id: 5, 
    name: 'Kraft Heinz', 
    description: 'American food company formed by the merger of Kraft Foods and Heinz',
    logo: 'https://images.unsplash.com/photo-1607613009822-f8a5a7f74566?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'David Brown',
    contactEmail: 'david@kraftheinz.com',
    contactPhone: '555-234-5678',
    address: '200 E Randolph St, Chicago, IL 60601',
    website: 'www.kraftheinzcompany.com',
    active: false,
    itemCount: 189,
    yearFounded: 2015,
    certifications: ['GFSI Certified', 'SQF Certified']
  },
  { 
    id: 6, 
    name: 'Conagra Brands', 
    description: 'American packaged foods company',
    logo: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Lisa Miller',
    contactEmail: 'lisa@conagra.com',
    contactPhone: '555-345-6789',
    address: '222 W Merchandise Mart Plaza, Chicago, IL 60654',
    website: 'www.conagrabrands.com',
    active: true,
    itemCount: 142,
    yearFounded: 1919,
    certifications: ['USDA Organic', 'Non-GMO Project Verified']
  },
  { 
    id: 7, 
    name: 'PepsiCo', 
    description: 'Multinational food, snack, and beverage corporation',
    logo: 'https://images.unsplash.com/photo-1629203432180-71e9b18d33e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Thomas Wilson',
    contactEmail: 'thomas@pepsico.com',
    contactPhone: '555-456-7890',
    address: '700 Anderson Hill Rd, Purchase, NY 10577',
    website: 'www.pepsico.com',
    active: true,
    itemCount: 198,
    yearFounded: 1965,
    certifications: ['ISO 14001', 'Energy Star Partner']
  },
  { 
    id: 8, 
    name: 'Mondelēz International', 
    description: 'Multinational confectionery, food, and beverage company',
    logo: 'https://images.unsplash.com/photo-1607613009821-11b2d4b9f6e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    contactName: 'Emily Johnson',
    contactEmail: 'emily@mondelez.com',
    contactPhone: '555-567-8901',
    address: '905 W Fulton Market, Chicago, IL 60607',
    website: 'www.mondelezinternational.com',
    active: true,
    itemCount: 167,
    yearFounded: 2012,
    certifications: ['Rainforest Alliance', 'UTZ Certified']
  }
];

const Manufacturers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false); 
  const [selectedManufacturers, setSelectedManufacturers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [certificationFilter, setcertificationFilter] = useState<string>('');

  // Filter manufacturers based on search term and filters
  const filteredManufacturers = sampleManufacturers.filter(manufacturer => {
    const matchesSearch = 
      manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && manufacturer.active) ||
      (statusFilter === 'inactive' && !manufacturer.active);
    
    const matchesCertification = 
      !certificationFilter || 
      manufacturer.certifications.some(cert => 
        cert.toLowerCase().includes(certificationFilter.toLowerCase())
      );
    
    return matchesSearch && matchesStatus && matchesCertification;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManufacturers = filteredManufacturers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredManufacturers.length / itemsPerPage);

  // Handle manufacturer selection
  const toggleManufacturerSelection = (id: number) => {
    if (selectedManufacturers.includes(id)) {
      setSelectedManufacturers(selectedManufacturers.filter(manufacturerId => manufacturerId !== id));
    } else {
      setSelectedManufacturers([...selectedManufacturers, id]);
    }
  };

  // Select all manufacturers on current page
  const selectAllOnPage = () => {
    if (currentManufacturers.every(manufacturer => selectedManufacturers.includes(manufacturer.id))) {
      setSelectedManufacturers(selectedManufacturers.filter(id => 
        !currentManufacturers.some(manufacturer => manufacturer.id === id)
      ));
    } else {
      const newSelections = currentManufacturers
        .filter(manufacturer => !selectedManufacturers.includes(manufacturer.id))
        .map(manufacturer => manufacturer.id);
      setSelectedManufacturers([...selectedManufacturers, ...newSelections]);
    }
  };

  // Toggle details view
  const toggleDetails = (id: number) => {
    setShowDetails(showDetails === id ? null : id);
    setEditMode(null);
  };

  // Start editing a manufacturer
  const startEdit = (manufacturer: any) => {
    setEditMode(manufacturer.id);
    setEditData({...manufacturer});
    setShowDetails(null);
  };

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData({...editData, [name]: value});
  };

  // Save edited manufacturer
  const saveEdit = () => {
    // In a real app, this would update the database
    // For this demo, we'll just log the changes
    console.log('Saving changes:', editData);
    setEditMode(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditMode(null);
    setEditData(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-end mb-6">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Manufacturer
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
            placeholder="Search manufacturers..."
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
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-medium text-gray-700 mb-2">Filter Manufacturers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certification</label>
              <select 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={certificationFilter}
                onChange={(e) => setcertificationFilter(e.target.value)}
              >
                <option value="">Any</option>
                <option value="USDA">USDA Certified</option>
                <option value="Organic">Organic Certified</option>
                <option value="Non-GMO">Non-GMO Project Verified</option>
                <option value="Fair Trade">Fair Trade</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Items Count</label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">Any</option>
                <option value="0-50">0-50 items</option>
                <option value="51-100">51-100 items</option>
                <option value="101-200">101-200 items</option>
                <option value="200+">200+ items</option>
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
                    {currentManufacturers.length > 0 && currentManufacturers.every(manufacturer => selectedManufacturers.includes(manufacturer.id)) 
                      ? <CheckSquare className="h-5 w-5 text-indigo-600" /> 
                      : <Square className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  Manufacturer
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year Founded
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentManufacturers.map((manufacturer) => (
              <React.Fragment key={manufacturer.id}>
                <tr className={`hover:bg-gray-50 ${showDetails === manufacturer.id ? 'bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <button onClick={() => toggleManufacturerSelection(manufacturer.id)} className="mr-2">
                          {selectedManufacturers.includes(manufacturer.id) 
                            ? <CheckSquare className="h-5 w-5 text-indigo-600" /> 
                            : <Square className="h-5 w-5 text-gray-400" />
                          }
                        </button>
                      </div>
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <img className="h-10 w-10 rounded-full object-cover" src={manufacturer.logo} alt={manufacturer.name} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{manufacturer.name}</div>
                        <div className="text-sm text-gray-500">{manufacturer.website}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{manufacturer.contactName}</div>
                    <div className="text-sm text-gray-500">{manufacturer.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{manufacturer.itemCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      manufacturer.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {manufacturer.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {manufacturer.yearFounded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => toggleDetails(manufacturer.id)}
                      >
                        {showDetails === manufacturer.id ? 'Hide' : 'View'}
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => startEdit(manufacturer)}
                      >
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
                {showDetails === manufacturer.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Building className="w-5 h-5 text-indigo-600 mr-2" />
                            Company Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Description</p>
                              <p className="text-sm text-gray-900">{manufacturer.description}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Year Founded</p>
                              <p className="text-sm text-gray-900">{manufacturer.yearFounded}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Certifications</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {manufacturer.certifications.map((cert: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Mail className="w-5 h-5 text-indigo-600 mr-2" />
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-sm text-gray-900">{manufacturer.contactPhone}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-sm text-gray-900">{manufacturer.contactEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Address</p>
                                <p className="text-sm text-gray-900">{manufacturer.address}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Globe className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-500">Website</p>
                                <a href={`https://${manufacturer.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                  {manufacturer.website}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {editMode === manufacturer.id && editData && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Edit Manufacturer</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              name="name"
                              value={editData.name}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                              type="text"
                              name="description"
                              value={editData.description}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                            <input
                              type="text"
                              name="contactName"
                              value={editData.contactName}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <input
                              type="email"
                              name="contactEmail"
                              value={editData.contactEmail}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                            <input
                              type="text"
                              name="contactPhone"
                              value={editData.contactPhone}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Website</label>
                            <input
                              type="text"
                              name="website"
                              value={editData.website}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                              type="text"
                              name="address"
                              value={editData.address}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Year Founded</label>
                            <input
                              type="number"
                              name="yearFounded"
                              value={editData.yearFounded}
                              onChange={handleEditChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                              name="active"
                              value={editData.active ? 'active' : 'inactive'}
                              onChange={(e) => setEditData({...editData, active: e.target.value === 'active'})}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
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
                {Math.min(indexOfLastItem, filteredManufacturers.length)}
              </span>{' '}
              of <span className="font-medium">{filteredManufacturers.length}</span> results
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
                } focus:z-20 focus:outline-offset-0`}
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
                      ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
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
                } focus:z-20 focus:outline-offset-0`}
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

export default Manufacturers;