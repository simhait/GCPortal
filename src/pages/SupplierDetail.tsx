import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Package, 
  Calendar, 
  DollarSign,
  Truck,
  FileText,
  Users
} from 'lucide-react';

// Sample data for suppliers
const sampleSuppliers = [
  {
    id: "1",
    name: "Global Foods Distribution",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29tcGFueSUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&q=60",
    description: "Major distributor of international food products",
    contactName: "Sarah Johnson",
    email: "sarah@globalfoods.com",
    phone: "(555) 123-4567",
    address: "123 Distribution Way, Portland, OR 97201",
    website: "www.globalfoodsdist.com",
    status: "active",
    itemCount: 342,
    rating: 4.8,
    lastOrder: "2023-09-15",
    paymentTerms: "Net 30",
    accountManager: "Michael Roberts",
    taxId: "12-3456789",
    notes: "Preferred distributor for international specialty items. Offers volume discounts for orders over $5,000.",
    categories: ["Grains", "Spices", "International Foods", "Oils & Vinegars"],
    certifications: ["Organic Certified", "Fair Trade", "Non-GMO Verified"],
    orderHistory: [
      { id: "ORD-2023-09-15", date: "2023-09-15", amount: 4250.75, status: "Delivered" },
      { id: "ORD-2023-08-22", date: "2023-08-22", amount: 3120.50, status: "Delivered" },
      { id: "ORD-2023-07-30", date: "2023-07-30", amount: 5680.25, status: "Delivered" }
    ]
  },
  {
    id: "2",
    name: "Farm Fresh Produce",
    logo: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZhcm0lMjBsb2dvfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60",
    description: "Local supplier of organic fruits and vegetables",
    contactName: "Michael Chen",
    email: "michael@farmfresh.com",
    phone: "(555) 987-6543",
    address: "456 Organic Lane, Eugene, OR 97401",
    website: "www.farmfreshproduce.com",
    status: "active",
    itemCount: 128,
    rating: 4.9,
    lastOrder: "2023-09-20",
    paymentTerms: "Net 15",
    accountManager: "Lisa Wong",
    taxId: "98-7654321",
    notes: "Local farm collective with twice-weekly deliveries. Seasonal availability varies.",
    categories: ["Fruits", "Vegetables", "Herbs", "Organic"],
    certifications: ["USDA Organic", "Local Farm Certified", "Sustainable Agriculture"],
    orderHistory: [
      { id: "ORD-2023-09-20", date: "2023-09-20", amount: 1250.75, status: "Delivered" },
      { id: "ORD-2023-09-13", date: "2023-09-13", amount: 980.50, status: "Delivered" },
      { id: "ORD-2023-09-06", date: "2023-09-06", amount: 1120.25, status: "Delivered" }
    ]
  },
  {
    id: "3",
    name: "Quality Meats Inc.",
    logo: "https://images.unsplash.com/photo-1565066874669-d5f4fdc48329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVhdCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&q=60",
    description: "Premium meat supplier for restaurants and institutions",
    contactName: "Robert Williams",
    email: "robert@qualitymeats.com",
    phone: "(555) 456-7890",
    address: "789 Butcher Blvd, Seattle, WA 98101",
    website: "www.qualitymeats.com",
    status: "active",
    itemCount: 95,
    rating: 4.6,
    lastOrder: "2023-09-18",
    paymentTerms: "Net 30",
    accountManager: "James Thompson",
    taxId: "45-6789123",
    notes: "Premium meat supplier with specialty cuts available upon request. 48-hour notice required for special orders.",
    categories: ["Beef", "Poultry", "Pork", "Lamb", "Game"],
    certifications: ["USDA Inspected", "Humane Certified", "Antibiotic Free"],
    orderHistory: [
      { id: "ORD-2023-09-18", date: "2023-09-18", amount: 3450.75, status: "Delivered" },
      { id: "ORD-2023-09-04", date: "2023-09-04", amount: 2980.50, status: "Delivered" },
      { id: "ORD-2023-08-21", date: "2023-08-21", amount: 3120.25, status: "Delivered" }
    ]
  },
  {
    id: "4",
    name: "Seaside Seafood",
    logo: "https://images.unsplash.com/photo-1533745848184-3db07256e163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VhZm9vZCUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&q=60",
    description: "Fresh seafood delivered daily from the coast",
    contactName: "Emily Rodriguez",
    email: "emily@seasideseafood.com",
    phone: "(555) 789-0123",
    address: "321 Harbor Drive, San Francisco, CA 94111",
    website: "www.seasideseafood.com",
    status: "active",
    itemCount: 87,
    rating: 4.7,
    lastOrder: "2023-09-19",
    paymentTerms: "Net 15",
    accountManager: "David Kim",
    taxId: "78-9123456",
    notes: "Daily fresh catch deliveries. Special orders available with 24-hour notice. Sustainable fishing practices.",
    categories: ["Fish", "Shellfish", "Specialty Seafood", "Frozen Seafood"],
    certifications: ["Sustainable Seafood Certified", "Ocean Friendly", "MSC Certified"],
    orderHistory: [
      { id: "ORD-2023-09-19", date: "2023-09-19", amount: 2150.75, status: "Delivered" },
      { id: "ORD-2023-09-12", date: "2023-09-12", amount: 1980.50, status: "Delivered" },
      { id: "ORD-2023-09-05", date: "2023-09-05", amount: 2320.25, status: "Delivered" }
    ]
  },
  {
    id: "5",
    name: "Artisan Bakery Supply",
    logo: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJha2VyeSUyMGxvZ298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&q=60",
    description: "Specialty flours, grains, and baking ingredients",
    contactName: "David Thompson",
    email: "david@artisanbakery.com",
    phone: "(555) 234-5678",
    address: "567 Flour Mill Road, Denver, CO 80202",
    website: "www.artisanbakerysupply.com",
    status: "inactive",
    itemCount: 156,
    rating: 4.5,
    lastOrder: "2023-08-30",
    paymentTerms: "Net 30",
    accountManager: "Sarah Miller",
    taxId: "23-4567891",
    notes: "Specialty baking ingredients and equipment. Bulk discounts available. Currently undergoing warehouse renovation until October 2023.",
    categories: ["Flours", "Grains", "Baking Ingredients", "Baking Tools"],
    certifications: ["Kosher Certified", "Organic Options", "Allergen Control Certified"],
    orderHistory: [
      { id: "ORD-2023-08-30", date: "2023-08-30", amount: 1850.75, status: "Delivered" },
      { id: "ORD-2023-08-15", date: "2023-08-15", amount: 2180.50, status: "Delivered" },
      { id: "ORD-2023-07-28", date: "2023-07-28", amount: 1920.25, status: "Delivered" }
    ]
  },
  {
    id: "6",
    name: "Dairy Delights",
    logo: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZGFpcnklMjBsb2dvfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60",
    description: "Premium dairy products from local farms",
    contactName: "Jessica Miller",
    email: "jessica@dairydelights.com",
    phone: "(555) 345-6789",
    address: "890 Milk Way, Madison, WI 53703",
    website: "www.dairydelights.com",
    status: "active",
    itemCount: 73,
    rating: 4.4,
    lastOrder: "2023-09-17",
    paymentTerms: "Net 15",
    accountManager: "Thomas Anderson",
    taxId: "34-5678912",
    notes: "Local dairy cooperative with premium products. Delivery available Monday, Wednesday, and Friday.",
    categories: ["Milk", "Cheese", "Yogurt", "Butter", "Cream"],
    certifications: ["Hormone-Free", "Animal Welfare Approved", "Local Farm Certified"],
    orderHistory: [
      { id: "ORD-2023-09-17", date: "2023-09-17", amount: 950.75, status: "Delivered" },
      { id: "ORD-2023-09-10", date: "2023-09-10", amount: 880.50, status: "Delivered" },
      { id: "ORD-2023-09-03", date: "2023-09-03", amount: 920.25, status: "Delivered" }
    ]
  }
];

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find the supplier with the matching ID
  const supplier = sampleSuppliers.find(s => s.id === id);
  
  const handleBack = () => {
    navigate('/management');
  };

  if (!supplier) {
    return (
      <div className="container mx-auto px-6 py-8">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Vendors
        </button>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vendor Not Found</h2>
          <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Vendors List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <button 
        onClick={handleBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Vendors
      </button>
      
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex justify-center md:justify-start mb-6 md:mb-0">
            <div className="w-32 h-32 rounded-lg overflow-hidden">
              <img 
                src={supplier.logo} 
                alt={supplier.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/4 md:pl-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{supplier.name}</h1>
                <p className="text-gray-600 mb-4">{supplier.description}</p>
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    supplier.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center ml-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-700 font-medium">{supplier.rating} Rating</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-600">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-gray-600">{supplier.address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Website</p>
                  <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{supplier.website}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 text-indigo-600 mr-2" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Primary Contact</span>
              <span className="font-medium">{supplier.contactName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Account Manager</span>
              <span className="font-medium">{supplier.accountManager}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Tax ID</span>
              <span className="font-medium">{supplier.taxId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-600">Payment Terms</span>
              <span className="font-medium">{supplier.paymentTerms}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 text-indigo-600 mr-2" />
            Inventory Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{supplier.itemCount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Last Order</p>
              <p className="text-2xl font-semibold text-gray-900">{supplier.lastOrder}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{supplier.categories.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Certifications</p>
              <p className="text-2xl font-semibold text-gray-900">{supplier.certifications.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories & Certifications */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories & Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Product Categories</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.categories.map((category, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.certifications.map((cert, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-indigo-600 mr-2" />
          Recent Order History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplier.orderHistory.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Notes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-indigo-600 mr-2" />
          Notes
        </h2>
        <p className="text-gray-600">{supplier.notes}</p>
      </div>
    </div>
  );
};

export default SupplierDetail;