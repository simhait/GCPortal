import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Tag,
  ShoppingBag,
  AlertTriangle,
  Apple
} from 'lucide-react';

// Sample food items data
const foodItems = [
  {
    id: '1',
    name: 'Organic Quinoa',
    description: 'Premium organic white quinoa, high in protein and fiber',
    sku: 'GRN-QN-001',
    upc: '890123456789',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Grains',
    brand: 'Nature\'s Harvest',
    supplier: 'Organic Farms Co.',
    price: 5.99,
    inventory: 120,
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher']
  },
  {
    id: '2',
    name: 'Almond Milk',
    description: 'Unsweetened almond milk, perfect for smoothies and cereal',
    sku: 'DRY-AM-002',
    upc: '890123456790',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1600788907416-456578634209?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Dairy Alternatives',
    brand: 'Pure Blends',
    supplier: 'Natural Beverages Inc.',
    price: 3.49,
    inventory: 85,
    allergens: ['Tree Nuts (Almonds)'],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Soy-Free']
  },
  {
    id: '3',
    name: 'Wild Caught Salmon',
    description: 'Premium wild-caught Alaskan salmon fillets',
    sku: 'SEA-SLM-003',
    upc: '890123456791',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Seafood',
    brand: 'Ocean\'s Best',
    supplier: 'Sustainable Seafood Co.',
    price: 15.99,
    inventory: 45,
    allergens: ['Fish (Salmon)'],
    dietaryRestrictions: ['Gluten-Free', 'Dairy-Free', 'Paleo', 'Keto']
  },
  {
    id: '4',
    name: 'Organic Baby Spinach',
    description: 'Fresh organic baby spinach leaves',
    sku: 'PRD-SPN-004',
    upc: '890123456792',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Produce',
    brand: 'Green Fields',
    supplier: 'Farm Fresh Produce',
    price: 3.99,
    inventory: 60,
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Keto', 'Paleo']
  },
  {
    id: '5',
    name: 'Whole Grain Bread',
    description: 'Hearty whole grain bread with seeds',
    sku: 'BKD-BRD-005',
    upc: '890123456793',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Bakery',
    brand: 'Artisan Bakers',
    supplier: 'Wholesome Bakery',
    price: 4.49,
    inventory: 35,
    allergens: ['Wheat'],
    dietaryRestrictions: ['Vegetarian']
  },
  {
    id: '6',
    name: 'Greek Yogurt',
    description: 'Plain, non-fat Greek yogurt',
    sku: 'DRY-YGT-006',
    upc: '890123456794',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Dairy',
    brand: 'Creamy Delights',
    supplier: 'Dairy Farms Inc.',
    price: 2.29,
    inventory: 75,
    allergens: ['Milk'],
    dietaryRestrictions: ['Vegetarian', 'Gluten-Free']
  },
  {
    id: '7',
    name: 'Organic Honey',
    description: 'Raw, unfiltered organic wildflower honey',
    sku: 'SWE-HNY-007',
    upc: '890123456795',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Sweeteners',
    brand: 'Nature\'s Nectar',
    supplier: 'Beekeepers Collective',
    price: 8.99,
    inventory: 40,
    allergens: [],
    dietaryRestrictions: ['Gluten-Free', 'Dairy-Free']
  },
  {
    id: '8',
    name: 'Organic Brown Rice',
    description: 'Long grain organic brown rice',
    sku: 'GRN-RCE-008',
    upc: '890123456796',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Grains',
    brand: 'Earth\'s Harvest',
    supplier: 'Organic Farms Co.',
    price: 4.99,
    inventory: 90,
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher']
  },
  {
    id: '9',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed extra virgin olive oil from Spain',
    sku: 'OIL-OLV-009',
    upc: '890123456797',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Oils & Vinegars',
    brand: 'Mediterranean Gold',
    supplier: 'Global Foods Distribution',
    price: 16.99,
    inventory: 55,
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher', 'Paleo', 'Keto']
  },
  {
    id: '10',
    name: 'Organic Black Beans',
    description: 'Organic dried black beans',
    sku: 'LEG-BLB-010',
    upc: '890123456798',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    category: 'Legumes',
    brand: 'Bean Basics',
    supplier: 'Organic Farms Co.',
    price: 3.29,
    inventory: 110,
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher']
  }
];

const FoodItems: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [allergenFilter, setAllergenFilter] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');
  const [gtinFilter, setGtinFilter] = useState<string>('');
  const [cyberCodeFilter, setCyberCodeFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');

  // Get unique categories, brands, allergens, and dietary restrictions for filters
  const categories = Array.from(new Set(foodItems.map(item => item.category)));
  const brands = Array.from(new Set(foodItems.map(item => item.brand)));
  const allergens = Array.from(new Set(foodItems.flatMap(item => item.allergens)));
  const dietaryRestrictions = Array.from(new Set(foodItems.flatMap(item => item.dietaryRestrictions)));
  // Sample manufacturers (using brands as placeholder)
  const manufacturers = Array.from(new Set(foodItems.map(item => item.brand)));
  // Sample vendors (using suppliers as placeholder)
  const vendors = Array.from(new Set(foodItems.map(item => item.supplier)));
  // US States for state filter
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ];

  // Filter food items based on search term and filters
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.upc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gtinFilter && item.upc.toLowerCase().includes(gtinFilter.toLowerCase())) ||
      (cyberCodeFilter && item.sku.toLowerCase().includes(cyberCodeFilter.toLowerCase()));
    
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesBrand = brandFilter ? item.brand === brandFilter : true;
    const matchesManufacturer = manufacturerFilter ? item.brand === manufacturerFilter : true; // Using brand as placeholder
    const matchesVendor = vendorFilter ? item.supplier === vendorFilter : true;
    const matchesAllergen = allergenFilter ? item.allergens.includes(allergenFilter) : true;
    const matchesDietary = dietaryFilter ? item.dietaryRestrictions.includes(dietaryFilter) : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesState = stateFilter ? true : true; // Placeholder for state matching logic
    
    return matchesSearch && matchesCategory && matchesBrand && matchesAllergen && 
           matchesDietary && matchesStatus && matchesManufacturer && matchesVendor && matchesState;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Select all items on current page
  const selectAllOnPage = () => {
    if (currentItems.every(item => selectedItems.includes(item.id))) {
      setSelectedItems(selectedItems.filter(id => !currentItems.some(item => item.id === id)));
    } else {
      const newSelectedItems = [...selectedItems];
      currentItems.forEach(item => {
        if (!newSelectedItems.includes(item.id)) {
          newSelectedItems.push(item.id);
        }
      });
      setSelectedItems(newSelectedItems);
    }
  };

  // Handle item selection
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle view item details
  const handleViewItem = (id: string) => {
    navigate(`/food-items/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Items</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search food items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <div className="flex space-x-4">
            <button 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 mr-2 text-gray-500" />
              Filters
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-5 h-5 mr-2 text-gray-500" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-5 h-5 mr-2 text-gray-500" />
              Import
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-lg mb-4">
            <h3 className="font-medium text-gray-700 mb-3">Filter Food Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, index) => (
                    <option key={index} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={manufacturerFilter}
                  onChange={(e) => setManufacturerFilter(e.target.value)}
                >
                  <option value="">All Manufacturers</option>
                  {manufacturers.map((manufacturer, index) => (
                    <option key={index} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor, index) => (
                    <option key={index} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GTIN</label>
                <input
                  type="text"
                  placeholder="Enter GTIN..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={gtinFilter}
                  onChange={(e) => setGtinFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cybersoft Code</label>
                <input
                  type="text"
                  placeholder="Enter Cybersoft Code..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={cyberCodeFilter}
                  onChange={(e) => setCyberCodeFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="">All States</option>
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergen</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={allergenFilter}
                  onChange={(e) => setAllergenFilter(e.target.value)}
                >
                  <option value="">All Allergens</option>
                  <option value="">Allergen Free</option>
                  {allergens.map((allergen, index) => (
                    <option key={index} value={allergen}>{allergen}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                onClick={() => {
                  setCategoryFilter('');
                  setBrandFilter('');
                  setAllergenFilter('');
                  setDietaryFilter('');
                  setStatusFilter('');
                  setManufacturerFilter('');
                  setVendorFilter('');
                  setGtinFilter('');
                  setCyberCodeFilter('');
                  setStateFilter('');
                }}
              >
                Reset
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <button onClick={selectAllOnPage} className="mr-2">
                      {currentItems.length > 0 && currentItems.every(item => selectedItems.includes(item.id)) ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    Item
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inventory
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allergens
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleItemSelection(item.id)}
                        className="mr-2"
                      >
                        {selectedItems.includes(item.id) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <img className="h-10 w-10 rounded-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{item.brand}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.inventory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.allergens.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {allergen}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700" 
                        onClick={() => handleViewItem(item.id)}>
                        View
                      </button>

                      {/*
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleViewItem(item.id)}
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      */}
                    </div>
                  </td>
                </tr>
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
                currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
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
                  {Math.min(indexOfLastItem, filteredItems.length)}
                </span>{' '}
                of <span className="font-medium">{filteredItems.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    currentPage === 1
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  } focus:z-20 focus:outline-offset-0`}
                >
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
                      ? 'text-gray-300'
                      : 'text-gray-500 hover:bg-gray-50'
                  } focus:z-20 focus:outline-offset-0`}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
  );
};

export default FoodItems;