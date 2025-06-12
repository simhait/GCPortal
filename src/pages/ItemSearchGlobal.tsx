import React, { useState } from 'react';
import { 
  Search as SearchIcon, 
  Barcode, 
  Filter, 
  AlertCircle, 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Info,
  Tag,
  ShoppingBag,
  Package
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../components/common/Toast';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  name: string;
  brand?: string;
  upc?: string;
  ean?: string;
  image?: string;
  description?: string;
  category?: string;
  source: 'upcitemdb' | 'nutritionix';
  rawData: any;
}

const ItemSearchGlobal: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [upcCode, setUpcCode] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'upc'>('search');
  const [searchSource, setSearchSource] = useState<'all' | 'upcitemdb' | 'nutritionix'>('all');

  const itemsPerPage = 10;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.warning('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      let combinedResults: SearchResult[] = [];
      
      // Search UPC Item DB if selected
      if (searchSource === 'all' || searchSource === 'upcitemdb') {
        try {
          const upcResponse = await axios.get(`https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(searchTerm)}`);
          
          if (upcResponse.data && upcResponse.data.items) {
            const upcResults = upcResponse.data.items.map((item: any) => ({
              id: item.upc || item.ean || String(Math.random()),
              name: item.title || 'Unknown Item',
              brand: item.brand || 'Unknown Brand',
              upc: item.upc || '',
              ean: item.ean || '',
              image: item.images && item.images.length > 0 ? item.images[0] : undefined,
              description: item.description || '',
              category: item.category || 'Unknown Category',
              source: 'upcitemdb' as const,
              rawData: item
            }));
            
            combinedResults = [...combinedResults, ...upcResults];
          }
        } catch (err) {
          console.warn('UPC Item DB search failed:', err);
          // Continue with other sources even if this one fails
        }
      }
      
      // Search Nutritionix if selected
      if (searchSource === 'all' || searchSource === 'nutritionix') {
        try {
          const nutritionixResponse = await axios.get(`https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(searchTerm)}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-app-id': '22bca1c',
              'x-app-key': '9aeb724f4580bd7337f0c701b4c20939'
            }
          });
          
          if (nutritionixResponse.data) {
            // Process branded items
            const brandedResults = nutritionixResponse.data.branded?.map((item: any) => ({
              id: item.nix_item_id || String(Math.random()),
              name: item.food_name || 'Unknown Item',
              brand: item.brand_name || 'Unknown Brand',
              upc: item.upc || '',
              image: item.photo?.thumb || undefined,
              description: '',
              category: item.food_category || 'Unknown Category',
              source: 'nutritionix' as const,
              rawData: item
            })) || [];
            
            // Process common items
            const commonResults = nutritionixResponse.data.common?.map((item: any) => ({
              id: item.food_name || String(Math.random()),
              name: item.food_name || 'Unknown Item',
              brand: 'Generic',
              image: item.photo?.thumb || undefined,
              description: '',
              category: item.tag_name || 'Unknown Category',
              source: 'nutritionix' as const,
              rawData: item
            })) || [];
            
            combinedResults = [...combinedResults, ...brandedResults, ...commonResults];
          }
        } catch (err) {
          console.warn('Nutritionix search failed:', err);
          // Continue with other sources even if this one fails
        }
      }
      
      // Update state with results
      setResults(combinedResults);
      setTotalPages(Math.ceil(combinedResults.length / itemsPerPage));
      
      if (combinedResults.length === 0) {
        toast.info('No results found. Try a different search term or data source.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpcLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!upcCode.trim()) {
      toast.warning('Please enter a UPC code');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      let foundItem: SearchResult | null = null;
      
      // Try UPC Item DB first
      try {
        const upcResponse = await axios.get(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upcCode.trim()}`);
        
        if (upcResponse.data && upcResponse.data.items && upcResponse.data.items.length > 0) {
          const item = upcResponse.data.items[0];
          foundItem = {
            id: item.upc || item.ean || String(Math.random()),
            name: item.title || 'Unknown Item',
            brand: item.brand || 'Unknown Brand',
            upc: item.upc || '',
            ean: item.ean || '',
            image: item.images && item.images.length > 0 ? item.images[0] : undefined,
            description: item.description || '',
            category: item.category || 'Unknown Category',
            source: 'upcitemdb',
            rawData: item
          };
        }
      } catch (err) {
        console.warn('UPC Item DB lookup failed:', err);
        // Continue with Nutritionix if UPC Item DB fails
      }
      
      // If not found in UPC Item DB, try Nutritionix
      if (!foundItem) {
        try {
          const nutritionixResponse = await axios.get(`https://trackapi.nutritionix.com/v2/search/item/?upc=${upcCode.trim()}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'x-app-id': '22bca1c',
              'x-app-key': '9aeb724f4580bd7337f0c701b4c20939'
            }
          });
          
          if (nutritionixResponse.data && nutritionixResponse.data.foods && nutritionixResponse.data.foods.length > 0) {
            const item = nutritionixResponse.data.foods[0];
            foundItem = {
              id: item.nix_item_id || String(Math.random()),
              name: item.food_name || 'Unknown Item',
              brand: item.brand_name || 'Unknown Brand',
              upc: item.upc || '',
              image: item.photo?.thumb || undefined,
              description: '',
              category: item.food_category || 'Unknown Category',
              source: 'nutritionix',
              rawData: item
            };
          }
        } catch (err) {
          console.warn('Nutritionix lookup failed:', err);
        }
      }
      
      if (foundItem) {
        setResults([foundItem]);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setResults([]);
        toast.info('No item found with this UPC code.');
      }
    } catch (error) {
      console.error('UPC lookup error:', error);
      setError('An error occurred while looking up the UPC code. Please try again.');
      toast.error('UPC lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (item: SearchResult) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleCloseDetails = () => {
    setShowItemDetails(false);
    setSelectedItem(null);
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  };

  const renderNutritionixDetails = (item: any) => {
    if (!item) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {item.rawData.photo?.thumb && (
            <div className="md:w-1/4">
              <img 
                src={item.rawData.photo.thumb} 
                alt={item.name} 
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}
          <div className="md:w-3/4">
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.brand}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">UPC</p>
                <p className="font-medium">{item.upc || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium">{item.category || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {item.rawData.nf_calories && (
          <div>
            <h3 className="text-lg font-medium mb-3">Nutrition Facts</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">
                <div className="flex justify-between font-bold">
                  <span>Calories</span>
                  <span>{item.rawData.nf_calories}</span>
                </div>
              </div>
              
              <div className="border-b border-gray-300 dark:border-gray-600 pb-1 mb-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total Fat</span>
                  <span>{item.rawData.nf_total_fat}g</span>
                </div>
                {item.rawData.nf_saturated_fat !== undefined && (
                  <div className="flex justify-between text-sm pl-4">
                    <span>Saturated Fat</span>
                    <span>{item.rawData.nf_saturated_fat}g</span>
                  </div>
                )}
              </div>
              
              {item.rawData.nf_cholesterol !== undefined && (
                <div className="flex justify-between text-sm border-b border-gray-300 dark:border-gray-600 py-1">
                  <span className="font-bold">Cholesterol</span>
                  <span>{item.rawData.nf_cholesterol}mg</span>
                </div>
              )}
              
              {item.rawData.nf_sodium !== undefined && (
                <div className="flex justify-between text-sm border-b border-gray-300 dark:border-gray-600 py-1">
                  <span className="font-bold">Sodium</span>
                  <span>{item.rawData.nf_sodium}mg</span>
                </div>
              )}
              
              <div className="border-b border-gray-300 dark:border-gray-600 pb-1 mb-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total Carbohydrate</span>
                  <span>{item.rawData.nf_total_carbohydrate}g</span>
                </div>
                {item.rawData.nf_dietary_fiber !== undefined && (
                  <div className="flex justify-between text-sm pl-4">
                    <span>Dietary Fiber</span>
                    <span>{item.rawData.nf_dietary_fiber}g</span>
                  </div>
                )}
                {item.rawData.nf_sugars !== undefined && (
                  <div className="flex justify-between text-sm pl-4">
                    <span>Sugars</span>
                    <span>{item.rawData.nf_sugars}g</span>
                  </div>
                )}
              </div>
              
              {item.rawData.nf_protein !== undefined && (
                <div className="flex justify-between text-sm border-b border-gray-300 dark:border-gray-600 py-1">
                  <span className="font-bold">Protein</span>
                  <span>{item.rawData.nf_protein}g</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {item.rawData.full_nutrients && item.rawData.full_nutrients.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Additional Nutrients</h3>
            <div className="grid grid-cols-2 gap-2">
              {item.rawData.full_nutrients.map((nutrient: any) => (
                <div key={nutrient.attr_id} className="flex justify-between text-sm">
                  <span>{getNutrientName(nutrient.attr_id)}</span>
                  <span>{nutrient.value} {getNutrientUnit(nutrient.attr_id)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data source: Nutritionix API
          </p>
        </div>
      </div>
    );
  };

  const renderUpcItemDbDetails = (item: any) => {
    if (!item) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {item.image && (
            <div className="md:w-1/4">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}
          <div className="md:w-3/4">
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</p>
                <p className="font-medium">{item.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium">{item.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">UPC</p>
                <p className="font-medium">{item.upc || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">EAN</p>
                <p className="font-medium">{item.ean || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {item.rawData.offers && item.rawData.offers.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Available From</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.rawData.offers.map((offer: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-medium">{offer.merchant || 'Unknown Merchant'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Price: {offer.price ? `$${offer.price}` : 'N/A'}
                  </p>
                  {offer.link && (
                    <a 
                      href={offer.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm flex items-center mt-2"
                    >
                      View Offer <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data source: UPC Item DB
          </p>
        </div>
      </div>
    );
  };

  // Helper function to get nutrient names
  const getNutrientName = (attrId: number): string => {
    const nutrientMap: Record<number, string> = {
      203: 'Protein',
      204: 'Total Fat',
      205: 'Carbohydrates',
      208: 'Calories',
      269: 'Sugars',
      291: 'Fiber',
      301: 'Calcium',
      303: 'Iron',
      307: 'Sodium',
      318: 'Vitamin A',
      401: 'Vitamin C',
      // Add more as needed
    };
    
    return nutrientMap[attrId] || `Nutrient (${attrId})`;
  };

  // Helper function to get nutrient units
  const getNutrientUnit = (attrId: number): string => {
    const unitMap: Record<number, string> = {
      203: 'g',
      204: 'g',
      205: 'g',
      208: 'kcal',
      269: 'g',
      291: 'g',
      301: 'mg',
      303: 'mg',
      307: 'mg',
      318: 'IU',
      401: 'mg',
      // Add more as needed
    };
    
    return unitMap[attrId] || '';
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Global Item Search</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('search')}
          >
            Search by Name
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upc'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('upc')}
          >
            UPC Lookup
          </button>
        </div>

        {activeTab === 'search' ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for food items..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <select
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
                >
                  <option value="all">All Sources</option>
                  <option value="upcitemdb">UPC Item DB</option>
                  <option value="nutritionix">Nutritionix</option>
                </select>
              </div>
              <div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <SearchIcon className="w-5 h-5 mr-2" />
                  )}
                  Search
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpcLookup} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text"
                    value={upcCode}
                    onChange={(e) => setUpcCode(e.target.value)}
                    placeholder="Enter UPC code..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Barcode className="w-5 h-5 mr-2" />
                  )}
                  Lookup
                </button>
              </div>
            </div>
          </form>
        )}
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">Searching...</span>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search Results
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {results.length} items found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Brand
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      UPC/EAN
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getCurrentPageItems().map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {result.image ? (
                            <img 
                              src={result.image} 
                              alt={result.name} 
                              className="h-10 w-10 rounded-full object-cover mr-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                              <Package className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div 
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                            onClick={() => handleViewItem(result)}
                          >
                            {result.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {result.brand || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Barcode className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {result.upc || result.ean || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {result.category || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.source === 'upcitemdb' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {result.source === 'upcitemdb' ? 'UPC Item DB' : 'Nutritionix'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewItem(result)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, results.length)}
                    </span>{' '}
                    of <span className="font-medium">{results.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                          onClick={() => setCurrentPage(pageNumber)}
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
          )}
        </>
      ) : (
        !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              {activeTab === 'search' 
                ? 'Search for food items by name'
                : 'Enter a UPC code to look up an item'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'search'
                ? 'Enter a search term above to find food items from multiple data sources.'
                : 'Enter a UPC code above to find detailed information about a specific product.'
              }
            </p>
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
              onClick={handleCloseDetails} 
              aria-hidden="true"
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Info className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Item Details
                  </h3>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                {selectedItem.source === 'nutritionix' 
                  ? renderNutritionixDetails(selectedItem)
                  : renderUpcItemDbDetails(selectedItem)
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSearchGlobal;