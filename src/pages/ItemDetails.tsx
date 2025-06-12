import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  AlertCircle, 
  Tag, 
  ShoppingBag, 
  Package,
  Server,
  Info,
  Utensils,
  AlertTriangle,
  Download,
  Search
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../components/common/Toast';

interface ApiCallInfo {
  endpoint: string;
  requestData: any;
  responseData: any;
}

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiCallInfo, setApiCallInfo] = useState<ApiCallInfo | null>(null);
  const [showApiDetails, setShowApiDetails] = useState(false);
  const [gtinInput, setGtinInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // API configuration
  const API_URL = '/api/api/GDSNConnect/GetAllMartData';
  const API_TOKEN = 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTAyNzEzODgsImlzcyI6IlByaW1lcm9lZGdlLmNvbSIsImF1ZCI6IioifQ.2am9g84jCRHXpmuM4ypY_WWZNVjmGHp5WMJ15RL0flE';

  const fetchItemDetails = async (itemIdentifier: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Determine if the identifier is a GTIN or a key/id
      const isGtin = /^\d+$/.test(itemIdentifier);
      
      // Prepare search parameters based on identifier type
      const searchData = {
        gtinNos: isGtin ? [itemIdentifier.trim()] : [''],
        itemNames: [''],
        manufacturerNames: [''],
        brandNames: [''],
        itemCategories: [''],
        vendornames: [''],
        pageNumber: 1,
        pageSize: 20,
        selectedrows: !isGtin ? [itemIdentifier.trim()] : ['', '']
      };
      
      // Store API request info
      setApiCallInfo({
        endpoint: 'https://apitests.primeroedge.co/GCQAAPIS/api/GDSNConnect/GetAllMartData',
        requestData: searchData,
        responseData: null
      });
      
      // Make API call
      const response = await axios.post(API_URL, searchData, {
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      
      console.log('Item details response:', response.data);

      // Store the complete API response for display
      setApiCallInfo(prev => prev ? {
        ...prev,
        responseData: response.data
      } : null);
      
      // Process response data
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setItem(response.data[0]);
      } else if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setItem(response.data.data[0]);
      } else if (response.data && typeof response.data === 'object') {
        setItem(response.data);
      } else {
        setError('Item not found');
        toast.error('Item not found');
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('Failed to fetch item details');
      toast.error('Failed to fetch item details');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchItemDetails(id);
    }
  }, [id]);

  const handleGtinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gtinInput.trim()) {
      toast.warning('Please enter a GTIN number');
      return;
    }
    setIsSearching(true);
    fetchItemDetails(gtinInput);
  };

  const handleBack = () => {
    navigate('/search');
  };

  // Helper function to render object properties
  const renderObjectProperties = (obj: any) => {
    if (!obj) return null;
    
    return Object.entries(obj).map(([key, value]) => {
      // Skip rendering if value is null, undefined, or empty string
      if (value === null || value === undefined || value === '') return null;
      
      // Skip rendering if value is an empty array
      if (Array.isArray(value) && value.length === 0) return null;
      
      // Format the key for display
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
      
      return (
        <div key={key} className="py-3 border-b border-gray-200 dark:border-gray-700">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{formattedKey}</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {typeof value === 'object' ? (
              <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              String(value)
            )}
          </dd>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-6 py-8">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Search
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Item Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The item you're looking for doesn't exist or couldn't be retrieved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <button 
        onClick={handleBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Search
      </button>

      {/* GTIN Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">GTIN Lookup</h2>
        <form onSubmit={handleGtinSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text"
                value={gtinInput}
                onChange={(e) => setGtinInput(e.target.value)}
                placeholder="Enter GTIN number..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Lookup
          </button>
        </form>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-3/4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.ingredientname || item.itemName || item.item_name || 'Unknown Item'}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(item.brandname || item.brandName || item.brand_name) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {item.brandname || item.brandName || item.brand_name}
                    </span>
                  )}
                  {(item.itemcategory_description || item.itemCategory || item.item_category) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <Tag className="w-3 h-3 mr-1" />
                      {item.itemcategory_description || item.itemCategory || item.item_category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manufacturer</p>
                <p className="font-medium">{item.manufacturer || item.manufacturerName || item.manufacturer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">GTIN</p>
                <p className="font-medium">{item.gtin || item.gtinNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vendor</p>
                <p className="font-medium">{item.vendorname || item.vendorName || item.vendor_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Item ID</p>
                <p className="font-medium">{item.id || item.key || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {item ? 'All Item Attributes' : 'Enter a GTIN number to view item details'}
          </h2>
          <button
            onClick={() => setShowApiDetails(!showApiDetails)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <Server className="w-5 h-5 mr-2" />
            {showApiDetails ? 'Hide API Details' : 'Show API Details'}
          </button>
        </div>
        
        {/* API Call Information */}
        {showApiDetails && apiCallInfo && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">API Details</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint:</h4>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                <code className="text-sm text-gray-800 dark:text-gray-200">{apiCallInfo.endpoint}</code>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Data:</h4>
              <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                {JSON.stringify(apiCallInfo.requestData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Data:</h4>
              <pre className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto text-sm text-gray-800 dark:text-gray-200 max-h-96">
                {JSON.stringify(apiCallInfo.responseData, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
              <Info className="w-5 h-5 text-indigo-600 mr-2" />
              Item Details
            </h3>
            <div className="overflow-y-auto max-h-[70vh]">
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                {renderObjectProperties(item)}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;