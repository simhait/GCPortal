import React, { useState } from 'react';
import { 
  Search as SearchIcon, 
  Filter, 
  Download, 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Server
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../components/common/Toast';

interface SearchResult {
  id: string;
  itemName: string;
  brandName: string;
  manufacturerName: string;
  gtin: string;
  itemCategory: string;
  vendorName: string;
  servingSize: string;
  ingredients: string;
  allergens: string;
  nutritionFacts: string;
}

interface ApiCallInfo {
  endpoint: string;
  requestData: any;
  responseData: any;
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    itemName: '',
    brandName: '',
    manufacturerName: '',
    gtin: '',
    itemCategory: '',
    vendorName: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [apiCallInfo, setApiCallInfo] = useState<ApiCallInfo | null>(null);

  // API configuration with proxy
  const API_URL = '/api/api/GDSNConnect/GetAllMartData';
  const API_TOKEN = 'eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTAyNzEzODgsImlzcyI6IlByaW1lcm9lZGdlLmNvbSIsImF1ZCI6IioifQ.2am9g84jCRHXpmuM4ypY_WWZNVjmGHp5WMJ15RL0flE';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validate that at least one search field has a value
    const hasSearchCriteria = Object.values(searchParams).some(value => value.trim() !== '');
    if (!hasSearchCriteria) {
      toast.warning('Please enter at least one search criteria');
      return;
    }
    
    // Reset state
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Prepare search parameters
      const searchData = {
        gtinNos: searchParams.gtin ? [searchParams.gtin] : [''],
        itemNames: searchParams.itemName ? [searchParams.itemName] : [''],
        manufacturerNames: searchParams.manufacturerName ? [searchParams.manufacturerName] : [''],
        brandNames: searchParams.brandName ? [searchParams.brandName] : [''],
        itemCategories: searchParams.itemCategory ? [searchParams.itemCategory] : [''],
        vendornames: searchParams.vendorName ? [searchParams.vendorName] : [''],
        pageNumber: currentPage,
        pageSize: 20,
        selectedrows: ['', '']
      };
      
      console.log('Searching with params:', searchData);
      
      // Make direct API call with the provided token
      const response = await axios.post(API_URL, searchData, {
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      
      console.log('Search response:', response.data);
      
      // Initialize with empty values
      let processedResults: SearchResult[] = [];
      let totalCount = 0;
      let totalPageCount = 1;
      
      if (response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          processedResults = response.data.map((item: any) => ({
            id: String(item.id || item.gtin || Math.random()),
            itemName: item.ingredientname || item.itemName || item.item_name || '',
            brandName: item.brandname || item.brandName || item.brand_name || '',
            manufacturerName: item.manufacturer || item.manufacturerName || item.manufacturer_name || '',
            gtin: String(item.gtin || item.gtinNo || ''),
            itemCategory: item.itemcategory_description || item.itemCategory || item.item_category || '',
            vendorName: item.vendorname || item.vendorName || item.vendor_name || '',
            servingSize: item.servingSize || item.serving_size || '',
            ingredients: item.ingredients || '',
            allergens: item.allergens || '',
            nutritionFacts: item.nutritionFacts || item.nutrition_facts || ''
          }));
          totalCount = response.data.length;
          totalPageCount = Math.ceil(response.data.length / 20);
        }
        // Check if response.data has a data property that is an array
        else if (response.data.data && Array.isArray(response.data.data)) {
          processedResults = response.data.data.map((item: any) => ({
            id: String(item.id || item.gtin || Math.random()),
            itemName: item.ingredientname || item.itemName || item.item_name || '',
            brandName: item.brandname || item.brandName || item.brand_name || '',
            manufacturerName: item.manufacturer || item.manufacturerName || item.manufacturer_name || '',
            gtin: String(item.gtin || item.gtinNo || ''),
            itemCategory: item.itemcategory_description || item.itemCategory || item.item_category || '',
            vendorName: item.vendorname || item.vendorName || item.vendor_name || '',
            servingSize: item.servingSize || item.serving_size || '',
            ingredients: item.ingredients || '',
            allergens: item.allergens || '',
            nutritionFacts: item.nutritionFacts || item.nutrition_facts || ''
          }));
          totalCount = response.data.totalCount || response.data.data.length;
          totalPageCount = response.data.totalPages || Math.ceil(response.data.data.length / 20);
        }
        // Handle direct object response (single item)
        else if (typeof response.data === 'object') {
          const item = response.data;
          processedResults = [{
            id: String(item.id || item.gtin || Math.random()),
            itemName: item.ingredientname || item.itemName || item.item_name || '',
            brandName: item.brandname || item.brandName || item.brand_name || '',
            manufacturerName: item.manufacturer || item.manufacturerName || item.manufacturer_name || '',
            gtin: String(item.gtin || item.gtinNo || ''),
            itemCategory: item.itemcategory_description || item.itemCategory || item.item_category || '',
            vendorName: item.vendorname || item.vendorName || item.vendor_name || '',
            servingSize: item.servingSize || item.serving_size || '',
            ingredients: item.ingredients || '',
            allergens: item.allergens || '',
            nutritionFacts: item.nutritionFacts || item.nutrition_facts || ''
          }];
          totalCount = 1;
          totalPageCount = 1;
        }
      }
      
      // Update state with processed results
      setResults(processedResults);
      setTotalPages(totalPageCount);
      setTotalResults(totalCount);
      
      // Show message if no results
      if (processedResults.length === 0) {
        toast.info('No results found for your search criteria');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while searching';
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setError('Authentication error: The API token may have expired. Please contact support.');
          toast.error('Authentication error: The API token may have expired. Please contact support.');
        } else {
          setError(`API error: ${error.response.status} ${error.response.statusText}`);
          toast.error(`API error: ${error.response.status} ${error.response.statusText}`);
        }
      } else {
        setError(`${errorMessage}. Please try again.`);
        toast.error(`${errorMessage}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleSearch();
  };

  const handleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === results.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(results.map(result => result.id));
    }
  };

  const handleDownload = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one item to download');
      return;
    }
    
    setDownloading(true);
    
    try {
      const downloadData = {
        gtinNos: [''],
        itemNames: [''],
        manufacturerNames: [''],
        brandNames: [''],
        itemCategories: [''],
        vendornames: [''],
        pageNumber: 1,
        pageSize: 0,
        selectedrows: selectedRows
      };
      
      // Create a form to submit the download request
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/api/GDSNConnect/GetAllMartDataExcel';
      form.target = '_blank';
      
      // Add the token as a hidden field
      const tokenField = document.createElement('input');
      tokenField.type = 'hidden';
      tokenField.name = 'Authorization';
      tokenField.value = `Bearer ${API_TOKEN}`;
      form.appendChild(tokenField);
      
      // Add the data as a hidden field
      const dataField = document.createElement('input');
      dataField.type = 'hidden';
      dataField.name = 'data';
      dataField.value = JSON.stringify(downloadData);
      form.appendChild(dataField);
      
      // Submit the form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      toast.success('Download initiated');
    } catch (error) {
      console.error('Download error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to download data';
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      itemName: '',
      brandName: '',
      manufacturerName: '',
      gtin: '',
      itemCategory: '',
      vendorName: ''
    });
    setResults([]);
    setSelectedRows([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  const handleViewItem = async (result: SearchResult) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare search parameters based on the selected item
      const searchData = {
        gtinNos: [''],
        itemNames: [result.itemName || ''],
        manufacturerNames: [''],
        brandNames: [''],
        itemCategories: [''],
        vendornames: [''],
        pageNumber: 1,
        pageSize: 20,
        selectedrows: [result.id, '']
      };
      
      console.log('View item request:', searchData);
      
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
        setSelectedItem(response.data[0]);
        setShowItemDetails(true);
      } else if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setSelectedItem(response.data.data[0]);
        setShowItemDetails(true);
      } else if (response.data && typeof response.data === 'object') {
        setSelectedItem(response.data);
        setShowItemDetails(true);
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
    }
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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Food Database Search</h1>
        <div className="flex space-x-2">
          {selectedRows.length > 0 && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              Download Selected ({selectedRows.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text"
                  name="itemName"
                  value={searchParams.itemName}
                  onChange={handleInputChange}
                  placeholder="Search by item name..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                type="button"
                className={`px-4 py-2 border rounded-md flex items-center ${
                  showFilters 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' 
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <SearchIcon className="w-5 h-5 mr-2" />
                )}
                Search
              </button>
              {(searchParams.itemName || searchParams.brandName || searchParams.manufacturerName || 
                searchParams.gtin || searchParams.itemCategory || searchParams.vendorName) && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center hover:bg-gray-700 disabled:opacity-50 min-w-[100px] justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input
                  type="text"
                  name="brandName"
                  value={searchParams.brandName}
                  onChange={handleInputChange}
                  placeholder="Enter brand name..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturerName"
                  value={searchParams.manufacturerName}
                  onChange={handleInputChange}
                  placeholder="Enter manufacturer name..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GTIN</label>
                <input
                  type="text"
                  name="gtin"
                  value={searchParams.gtin}
                  onChange={handleInputChange}
                  placeholder="Enter GTIN number..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  name="itemCategory"
                  value={searchParams.itemCategory}
                  onChange={handleInputChange}
                  placeholder="Enter item category..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                <input
                  type="text"
                  name="vendorName"
                  value={searchParams.vendorName}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search Results
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalResults} items found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedRows.length === results.length && results.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Brand
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Manufacturer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      GTIN
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedRows.includes(result.id)}
                          onChange={() => handleRowSelection(result.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                          onClick={() => handleViewItem(result)}
                        >
                          {result.itemName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {result.brandName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {result.manufacturerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {result.gtin || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {result.itemCategory || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {result.vendorName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewItem(result)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-300 dark:text-gray-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-300 dark:text-gray-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, totalResults)}
                  </span>{' '}
                  of <span className="font-medium">{totalResults}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-200'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      ) : (
        !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            {Object.values(searchParams).some(value => value.trim() !== '') ? (
              <>
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </>
            ) : (
              <>
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Search the food database</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter search criteria above to find food items.
                </p>
              </>
            )}
          </div>
        )
      )}

      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowItemDetails(false)} 
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Server className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Item Details
                  </h3>
                </div>
                <button
                  onClick={() => setShowItemDetails(false)}
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Endpoint:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">{apiCallInfo?.endpoint}</code>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Data:</h4>
                  <pre className="bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                    {JSON.stringify(apiCallInfo?.requestData, null, 2)}
                  </pre>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Details:</h4>
                  <div className="overflow-y-auto max-h-[60vh]">
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                      {renderObjectProperties(selectedItem)}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;