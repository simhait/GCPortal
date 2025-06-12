import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Tag, 
  ShoppingBag, 
  Truck, 
  DollarSign, 
  Package, 
  Clock, 
  Utensils, 
  Leaf, 
  Award, 
  Info,
  AlertTriangle,
  Image,
  Upload,
  FileText,
  Star
} from 'lucide-react';

// Sample food items data (same as in FoodItems.tsx)
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
    price: {
      cost: 3.25,
      retail: 5.99,
      margin: 45.7
    },
    inventory: {
      quantity: 120,
      unit: 'lb',
      packageSize: '25 lb',
      minOrderQuantity: 25,
      reorderPoint: 30
    },
    nutrition: {
      servingSize: '1/4 cup (45g)',
      servingsPerContainer: 10,
      calories: 170,
      totalFat: 2.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 10,
      totalCarbohydrate: 30,
      dietaryFiber: 3,
      sugars: 1,
      protein: 6,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 2,
      iron: 8
    },
    ingredients: 'Organic white quinoa',
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher'],
    nutritionalClaims: ['High Protein', 'Good Source of Fiber', 'Low Sodium'],
    certifications: ['USDA Organic', 'Non-GMO Project Verified'],
    countryOfOrigin: 'Peru',
    packaging: {
      type: 'Paper bag',
      recyclable: true,
      material: 'Kraft paper',
      dimensions: '10" x 6" x 3"',
      weight: '25.5 lb'
    },
    preparation: 'Rinse thoroughly before cooking. Combine 1 part quinoa with 2 parts water. Bring to a boil, then simmer for 15-20 minutes until water is absorbed.',
    shelfLife: '18 months',
    storageInstructions: 'Store in a cool, dry place. Once opened, store in an airtight container.',
    dateAdded: '2023-06-15',
    lastUpdated: '2023-09-20'
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
    price: {
      cost: 1.75,
      retail: 3.49,
      margin: 49.9
    },
    inventory: {
      quantity: 85,
      unit: 'carton',
      packageSize: '32 fl oz',
      minOrderQuantity: 12,
      reorderPoint: 24
    },
    nutrition: {
      servingSize: '1 cup (240ml)',
      servingsPerContainer: 4,
      calories: 30,
      totalFat: 2.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 150,
      totalCarbohydrate: 1,
      dietaryFiber: 1,
      sugars: 0,
      protein: 1,
      vitaminA: 10,
      vitaminC: 0,
      calcium: 45,
      iron: 2
    },
    ingredients: 'Filtered water, almonds (2%), calcium carbonate, sea salt, potassium citrate, sunflower lecithin, gellan gum, vitamin A palmitate, vitamin D2, vitamin E',
    allergens: ['Tree Nuts (Almonds)'],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Dairy-Free', 'Soy-Free'],
    nutritionalClaims: ['Low Calorie', 'Unsweetened', 'No Added Sugar'],
    certifications: ['Non-GMO Project Verified', 'Kosher'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Carton',
      recyclable: true,
      material: 'Tetra Pak',
      dimensions: '3.5" x 3.5" x 7.5"',
      weight: '2.1 lb'
    },
    preparation: 'Shake well before use. Refrigerate after opening and consume within 7-10 days.',
    shelfLife: '9 months unopened',
    storageInstructions: 'Keep refrigerated after opening.',
    dateAdded: '2023-05-10',
    lastUpdated: '2023-09-15'
  },
  // Additional items would be here
];

const FoodItemEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [nutritionalClaims, setNutritionalClaims] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [activeTagType, setActiveTagType] = useState<'allergens' | 'dietaryRestrictions' | 'nutritionalClaims' | 'certifications' | null>(null);
  const [resources, setResources] = useState<Array<{
    id: string;
    type: 'image' | 'document';
    name: string;
    url: string;
    isPrimary?: boolean;
    size?: string;
    lastModified?: string;
  }>>([]);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<'image' | 'document'>('image');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate API call to fetch food item details
    setLoading(true);
    setTimeout(() => {
      const foundItem = foodItems.find(item => item.id === id);
      if (foundItem) {
        setFormData(foundItem);
        setAllergens(foundItem.allergens || []);
        setDietaryRestrictions(foundItem.dietaryRestrictions || []);
        setNutritionalClaims(foundItem.nutritionalClaims || []);
        setCertifications(foundItem.certifications || []);
        
        // Initialize resources with the main image
        if (foundItem.image) {
          setResources([
            {
              id: '1',
              type: 'image',
              name: 'Main Product Image',
              url: foundItem.image,
              isPrimary: true,
              lastModified: foundItem.lastUpdated
            }
          ]);
        }
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: parseFloat(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked
      });
    }
  };

  const handleTagAdd = () => {
    if (!newTag.trim() || !activeTagType) return;
    
    switch (activeTagType) {
      case 'allergens':
        if (!allergens.includes(newTag)) {
          setAllergens([...allergens, newTag]);
        }
        break;
      case 'dietaryRestrictions':
        if (!dietaryRestrictions.includes(newTag)) {
          setDietaryRestrictions([...dietaryRestrictions, newTag]);
        }
        break;
      case 'nutritionalClaims':
        if (!nutritionalClaims.includes(newTag)) {
          setNutritionalClaims([...nutritionalClaims, newTag]);
        }
        break;
      case 'certifications':
        if (!certifications.includes(newTag)) {
          setCertifications([...certifications, newTag]);
        }
        break;
    }
    
    setNewTag('');
  };

  const handleTagRemove = (tag: string, type: 'allergens' | 'dietaryRestrictions' | 'nutritionalClaims' | 'certifications') => {
    switch (type) {
      case 'allergens':
        setAllergens(allergens.filter(t => t !== tag));
        break;
      case 'dietaryRestrictions':
        setDietaryRestrictions(dietaryRestrictions.filter(t => t !== tag));
        break;
      case 'nutritionalClaims':
        setNutritionalClaims(nutritionalClaims.filter(t => t !== tag));
        break;
      case 'certifications':
        setCertifications(certifications.filter(t => t !== tag));
        break;
    }
  };

  const handleAddResource = () => {
    if (!newResourceUrl.trim() || !newResourceName.trim()) return;
    
    const newResource = {
      id: Date.now().toString(),
      type: newResourceType,
      name: newResourceName,
      url: newResourceUrl,
      isPrimary: resources.length === 0,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setResources([...resources, newResource]);
    setNewResourceUrl('');
    setNewResourceName('');
  };

  const handleRemoveResource = (id: string) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    
    // If we removed the primary image, set the first remaining image as primary (if any)
    if (resources.find(r => r.id === id)?.isPrimary) {
      const firstImage = updatedResources.find(r => r.type === 'image');
      if (firstImage) {
        firstImage.isPrimary = true;
      }
    }
    
    setResources(updatedResources);
  };

  const handleSetPrimary = (id: string) => {
    setResources(resources.map(resource => ({
      ...resource,
      isPrimary: resource.id === id
    })));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const isImage = file.type.startsWith('image/');
    
    // In a real app, you would upload the file to a server here
    // For this prototype, we'll create a fake URL
    const fakeUrl = isImage 
      ? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      : 'https://example.com/document.pdf';
    
    const newResource = {
      id: Date.now().toString(),
      type: isImage ? 'image' as const : 'document' as const,
      name: file.name,
      url: fakeUrl,
      isPrimary: isImage && resources.filter(r => r.type === 'image').length === 0,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setResources([...resources, newResource]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would save the data here
    // For this prototype, we'll just navigate back to the detail page
    navigate(`/food-items/${id}`);
  };

  const handleCancel = () => {
    navigate(`/food-items/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button 
          onClick={() => navigate('/food-items')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Food Items
        </button>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Food Item Not Found</h2>
          <p className="text-gray-600">The food item you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleCancel}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Details
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPC
              </label>
              <input
                type="text"
                name="upc"
                value={formData.upc}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 text-indigo-600 mr-2" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price.cost"
                    value={formData.price.cost}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price.retail"
                    value={formData.price.retail}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="price.margin"
                    value={formData.price.margin}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 text-indigo-600 mr-2" />
                Inventory Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="inventory.quantity"
                    value={formData.inventory.quantity}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="inventory.unit"
                    value={formData.inventory.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Size
                  </label>
                  <input
                    type="text"
                    name="inventory.packageSize"
                    value={formData.inventory.packageSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="inventory.minOrderQuantity"
                    value={formData.inventory.minOrderQuantity}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="inventory.reorderPoint"
                    value={formData.inventory.reorderPoint}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Nutrition Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">Nutrition Facts</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    name="nutrition.servingSize"
                    value={formData.nutrition.servingSize}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servings Per Container
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.servingsPerContainer"
                    value={formData.nutrition.servingsPerContainer}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.calories"
                    value={formData.nutrition.calories}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.totalFat"
                    value={formData.nutrition.totalFat}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saturated Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.saturatedFat"
                    value={formData.nutrition.saturatedFat}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trans Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.transFat"
                    value={formData.nutrition.transFat}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cholesterol (mg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.cholesterol"
                    value={formData.nutrition.cholesterol}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.sodium"
                    value={formData.nutrition.sodium}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Carbohydrate (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.totalCarbohydrate"
                    value={formData.nutrition.totalCarbohydrate}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Fiber (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.dietaryFiber"
                    value={formData.nutrition.dietaryFiber}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sugars (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.sugars"
                    value={formData.nutrition.sugars}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="nutrition.protein"
                    value={formData.nutrition.protein}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin A (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.vitaminA"
                    value={formData.nutrition.vitaminA}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin C (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.vitaminC"
                    value={formData.nutrition.vitaminC}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calcium (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.calcium"
                    value={formData.nutrition.calcium}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Iron (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nutrition.iron"
                    value={formData.nutrition.iron}
                    onChange={handleNumberInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Utensils className="w-5 h-5 text-indigo-600 mr-2" />
                  Ingredients
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients List
                  </label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Leaf className="w-5 h-5 text-indigo-600 mr-2" />
                  Dietary Information
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {allergens.map((allergen, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full flex items-center">
                        {allergen}
                        <button 
                          type="button"
                          onClick={() => handleTagRemove(allergen, 'allergens')}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={activeTagType === 'allergens' ? newTag : ''}
                      onChange={(e) => setNewTag(e.target.value)}
                      onFocus={() => setActiveTagType('allergens')}
                      placeholder="Add allergen..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Restrictions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dietaryRestrictions.map((restriction, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                        {restriction}
                        <button 
                          type="button"
                          onClick={() => handleTagRemove(restriction, 'dietaryRestrictions')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={activeTagType === 'dietaryRestrictions' ? newTag : ''}
                      onChange={(e) => setNewTag(e.target.value)}
                      onFocus={() => setActiveTagType('dietaryRestrictions')}
                      placeholder="Add dietary restriction..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nutritional Claims
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {nutritionalClaims.map((claim, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                        {claim}
                        <button 
                          type="button"
                          onClick={() => handleTagRemove(claim, 'nutritionalClaims')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={activeTagType === 'nutritionalClaims' ? newTag : ''}
                      onChange={(e) => setNewTag(e.target.value)}
                      onFocus={() => setActiveTagType('nutritionalClaims')}
                      placeholder="Add nutritional claim..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 text-indigo-600 mr-2" />
                Certifications & Origin
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {certifications.map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center">
                      {cert}
                      <button 
                        type="button"
                        onClick={() => handleTagRemove(cert, 'certifications')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={activeTagType === 'certifications' ? newTag : ''}
                    onChange={(e) => setNewTag(e.target.value)}
                    onFocus={() => setActiveTagType('certifications')}
                    placeholder="Add certification..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Info className="w-5 h-5 text-indigo-600 mr-2" />
                Preparation Instructions
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation
                </label>
                <textarea
                  name="preparation"
                  value={formData.preparation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Packaging & Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 text-indigo-600 mr-2" />
                Packaging Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    name="packaging.type"
                    value={formData.packaging.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    name="packaging.material"
                    value={formData.packaging.material}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    name="packaging.dimensions"
                    value={formData.packaging.dimensions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="packaging.weight"
                    value={formData.packaging.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="packaging.recyclable"
                      checked={formData.packaging.recyclable}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recyclable</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                Storage & Shelf Life
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf Life
                  </label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={formData.shelfLife}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Instructions
                  </label>
                  <textarea
                    name="storageInstructions"
                    value={formData.storageInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resources</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Image className="w-5 h-5 text-indigo-600 mr-2" />
              Images & Documents
            </h3>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="border rounded-lg overflow-hidden bg-white">
                    {resource.type === 'image' ? (
                      <div className="relative h-40">
                        <img 
                          src={resource.url} 
                          alt={resource.name} 
                          className="w-full h-full object-cover"
                        />
                        {resource.isPrimary && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Primary
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-gray-100">
                        <FileText className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{resource.name}</h4>
                          {resource.size && (
                            <p className="text-gray-500 text-xs">{resource.size}</p>
                          )}
                          <p className="text-gray-500 text-xs">Added: {resource.lastModified}</p>
                        </div>
                        <div className="flex space-x-1">
                          {resource.type === 'image' && !resource.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(resource.id)}
                              className="p-1 text-gray-500 hover:text-yellow-500"
                              title="Set as primary image"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveResource(resource.id)}
                            className="p-1 text-gray-500 hover:text-red-500"
                            title="Remove resource"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Add New Resource</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        No file chosen
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Supported formats: JPG, PNG, PDF, DOC, XLS
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Or Add by URL
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="text"
                          value={newResourceName}
                          onChange={(e) => setNewResourceName(e.target.value)}
                          placeholder="Resource name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <select
                          value={newResourceType}
                          onChange={(e) => setNewResourceType(e.target.value as 'image' | 'document')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="image">Image</option>
                          <option value="document">Document</option>
                        </select>
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={newResourceUrl}
                          onChange={(e) => setNewResourceUrl(e.target.value)}
                          placeholder="URL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddResource}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodItemEdit;