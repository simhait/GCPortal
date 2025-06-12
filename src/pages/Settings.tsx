import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Check,
  Loader2,
  Copy,
  Server,
  Database,
  Moon,
  Sun
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from '../components/common/Toast';
import { generateToken, getCurrentToken, saveToken, getTokenExpiration } from '../lib/api/tokenService';

const Settings: React.FC = () => {
  const darkMode = useStore((state) => state.darkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const [activeTab, setActiveTab] = useState('general');
  const [token, setToken] = useState(getCurrentToken() || '');
  const [showToken, setShowToken] = useState(false);
  const [showUsdaKey, setShowUsdaKey] = useState(false);
  const [showNutritionixKeys, setShowNutritionixKeys] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'PETest007@1234.com',
    password: 'P@$$w0rd'
  });
  const [apiEndpoints, setApiEndpoints] = useState({
    tokenUrl: 'https://apitests.primeroedge.co/GCAPIs/Token',
    searchUrl: 'https://apitests.primeroedge.co/GCQAAPIS/api/GDSNConnect/GetAllMartData',
    downloadUrl: 'https://apitests.primeroedge.co/GCQAAPIS/api/GDSNConnect/GetAllMartDataExcel'
  });
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(getTokenExpiration(token));

  // Function to generate a new token
  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const response = await generateToken(
        credentials.username,
        credentials.password,
        apiEndpoints.tokenUrl
      );

      if (response && response.access_token) {
        setToken(response.access_token);
        saveToken(response.access_token);
        
        // Get token expiration
        const expiration = getTokenExpiration(response.access_token);
        setTokenExpiration(expiration);
        
        toast.success('Token generated successfully');
      } else {
        toast.error('Failed to generate token: Invalid response format');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate token. Please check your credentials.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Function to save settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('apiEndpoints', JSON.stringify(apiEndpoints));
    localStorage.setItem('credentials', JSON.stringify({
      username: credentials.username,
      // Don't store actual password, just a placeholder
      password: credentials.password ? '********' : ''
    }));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 500);
  };

  // Function to copy token to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center mb-6">
        <SettingsIcon className="w-6 h-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'api'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              API Configuration
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'tokens'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              API Tokens
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {darkMode ? (
                        <Moon className="w-5 h-5 text-gray-400 mr-3" />
                      ) : (
                        <Sun className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Configuration Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Configuration</h2>
              
              {/* Cybersoft API Configuration */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cybersoft API Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Endpoint:</span>
                          <span className="text-lg text-gray-900 dark:text-white">
                            https://apitests.primeroedge.co/GCAPIs/Token
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Username:</span>
                          <span className="text-lg text-gray-900 dark:text-white">
                            PETest007@1234.com
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Password:</span>
                          <span className="text-lg text-gray-900 dark:text-white">
                            P@$$w0rd
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* USDA Branded Foods API Configuration */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">USDA Branded Foods API Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Search API:</span>
                          <span className="text-lg text-gray-900 dark:text-white break-all">
                            https://api.nal.usda.gov/fdc/v1/foods/search?api_key=7iomEr7fDHyOyGED4qKXR7XucQZYB4cUgWeIwNur
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Portal API:</span>
                          <span className="text-lg text-gray-900 dark:text-white">
                            https://fdc.nal.usda.gov/portal-data/external/search
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">API Key:</span>
                          <div className="flex items-center">
                            <input
                              type={showUsdaKey ? "text" : "password"} 
                              value="7iomEr7fDHyOyGED4qKXR7XucQZYB4cUgWeIwNur"
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={() => setShowUsdaKey(!showUsdaKey)}
                              className="p-2 ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              {showUsdaKey ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard("7iomEr7fDHyOyGED4qKXR7XucQZYB4cUgWeIwNur")}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Nutritionix API Configuration */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Nutritionix API Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Endpoint:</span>
                          <span className="text-lg text-gray-900 dark:text-white break-all">
                            https://trackapi.nutritionix.com/v2/search/item/?upc=023700011176
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">App ID:</span>
                          <div className="flex items-center">
                            <input
                              type={showNutritionixKeys ? "text" : "password"} 
                              value="22bca1c"
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={() => copyToClipboard("22bca1c")}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">App Key:</span>
                          <div className="flex items-center">
                            <input
                              type={showNutritionixKeys ? "text" : "password"} 
                              value="9aeb724f4580bd7337f0c701b4c20939"
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              onClick={() => setShowNutritionixKeys(!showNutritionixKeys)}
                              className="p-2 ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              {showNutritionixKeys ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard("9aeb724f4580bd7337f0c701b4c20939")}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* UPC Item DB API Configuration */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">UPC Item DB API Configuration</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Lookup API:</span>
                          <span className="text-lg text-gray-900 dark:text-white break-all">
                            https://api.upcitemdb.com/prod/trial/lookup?upc=23700040183
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-300 w-32">Search API:</span>
                          <span className="text-lg text-gray-900 dark:text-white break-all">
                            https://api.upcitemdb.com/prod/trial/search?s=HONEY BBQ SEASONED CHICKEN WINGS
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Note: UPC Item DB is using the trial API which has limited requests per day.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Response</h3>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Access Token:</h4>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200 whitespace-normal break-all">
                      eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzkyMDI0MDAsImlzcyI6Imh0dHBzOi8vYXBpdGVzdHMucHJpbWVyb2VkZ2UuY28vR0NBUElzL1Rva2VuIiwiYXVkIjoiaHR0cHM6Ly9hcGl0ZXN0cy5wcmltZXJvZWRnZS5jby9HQ0FQSXMvVG9rZW4ifQ.bdo87WqS1Lk6YyCZVPA8FEEi1c07H8rPpAsZEx6xZaY
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">API Tokens</h2>
                <button
                  onClick={handleGenerateToken}
                  disabled={isGeneratingToken}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isGeneratingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New Token
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Key className="w-5 h-5 text-indigo-600 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Food Database API Token</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {showToken ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(token)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <input
                        type={showToken ? "text" : "password"} 
                        value={token}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    {tokenExpiration && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {tokenExpiration > new Date() 
                          ? `Valid until ${tokenExpiration.toLocaleString()}`
                          : 'Token has expired. Please generate a new one.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Token details */}
                {token && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Token Details</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Header:</span>
                        <code className="ml-2 text-xs text-gray-800 dark:text-gray-200">
                          {token.split('.')[0]}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Payload:</span>
                        <code className="ml-2 text-xs text-gray-800 dark:text-gray-200">
                          {token.split('.')[1]}
                        </code>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Signature:</span>
                        <code className="ml-2 text-xs text-gray-800 dark:text-gray-200">
                          {token.split('.')[2]}
                        </code>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Decoded Payload</h4>
                      <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-gray-800 dark:text-gray-200">
                        {(() => {
                          try {
                            const payload = token.split('.')[1];
                            const decodedPayload = JSON.parse(atob(payload));
                            return JSON.stringify(decodedPayload, null, 2);
                          } catch (e) {
                            return "Could not decode payload";
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;