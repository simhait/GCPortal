import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Check, 
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
  Info
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
    price: {
      cost: 8.99,
      retail: 15.99,
      margin: 43.8
    },
    inventory: {
      quantity: 45,
      unit: 'lb',
      packageSize: '6 oz fillet',
      minOrderQuantity: 10,
      reorderPoint: 15
    },
    nutrition: {
      servingSize: '4 oz (113g)',
      servingsPerContainer: 1.5,
      calories: 180,
      totalFat: 9,
      saturatedFat: 2,
      transFat: 0,
      cholesterol: 60,
      sodium: 60,
      totalCarbohydrate: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 23,
      vitaminA: 2,
      vitaminC: 0,
      calcium: 0,
      iron: 2
    },
    ingredients: 'Wild caught Alaskan salmon',
    allergens: ['Fish (Salmon)'],
    dietaryRestrictions: ['Gluten-Free', 'Dairy-Free', 'Paleo', 'Keto'],
    nutritionalClaims: ['High Protein', 'Low Carb', 'Good Source of Omega-3'],
    certifications: ['MSC Certified Sustainable', 'Wild Caught'],
    countryOfOrigin: 'USA (Alaska)',
    packaging: {
      type: 'Vacuum sealed',
      recyclable: true,
      material: 'Plastic',
      dimensions: '8" x 5" x 1"',
      weight: '6.5 oz'
    },
    preparation: 'Thaw in refrigerator overnight. Cook to an internal temperature of 145°F.',
    shelfLife: '12 months frozen',
    storageInstructions: 'Keep frozen until ready to use. Once thawed, use within 2 days.',
    dateAdded: '2023-07-05',
    lastUpdated: '2023-09-18'
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
    price: {
      cost: 2.25,
      retail: 3.99,
      margin: 43.6
    },
    inventory: {
      quantity: 60,
      unit: 'package',
      packageSize: '5 oz',
      minOrderQuantity: 10,
      reorderPoint: 20
    },
    nutrition: {
      servingSize: '3 cups (85g)',
      servingsPerContainer: 2,
      calories: 20,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 65,
      totalCarbohydrate: 3,
      dietaryFiber: 2,
      sugars: 0,
      protein: 2,
      vitaminA: 100,
      vitaminC: 30,
      calcium: 4,
      iron: 15
    },
    ingredients: 'Organic baby spinach',
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Keto', 'Paleo'],
    nutritionalClaims: ['Low Calorie', 'Good Source of Iron', 'High in Vitamin A'],
    certifications: ['USDA Organic', 'Non-GMO Project Verified'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Plastic container',
      recyclable: true,
      material: 'PET plastic',
      dimensions: '7" x 5" x 3"',
      weight: '5.2 oz'
    },
    preparation: 'Wash before use.',
    shelfLife: '7 days refrigerated',
    storageInstructions: 'Keep refrigerated at 34-40°F.',
    dateAdded: '2023-08-01',
    lastUpdated: '2023-09-10'
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
    price: {
      cost: 2.50,
      retail: 4.49,
      margin: 44.3
    },
    inventory: {
      quantity: 35,
      unit: 'loaf',
      packageSize: '24 oz loaf',
      minOrderQuantity: 6,
      reorderPoint: 12
    },
    nutrition: {
      servingSize: '1 slice (45g)',
      servingsPerContainer: 16,
      calories: 120,
      totalFat: 2,
      saturatedFat: 0.5,
      transFat: 0,
      cholesterol: 0,
      sodium: 180,
      totalCarbohydrate: 22,
      dietaryFiber: 3,
      sugars: 2,
      protein: 5,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 4,
      iron: 6
    },
    ingredients: 'Whole wheat flour, water, sunflower seeds, flax seeds, honey, yeast, salt',
    allergens: ['Wheat'],
    dietaryRestrictions: ['Vegetarian'],
    nutritionalClaims: ['Good Source of Fiber', 'Low Fat', 'No Artificial Preservatives'],
    certifications: ['Non-GMO Project Verified'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Plastic bag',
      recyclable: true,
      material: 'LDPE plastic',
      dimensions: '12" x 5" x 3"',
      weight: '1.5 lb'
    },
    preparation: 'Ready to eat. Toast for best flavor.',
    shelfLife: '7 days at room temperature',
    storageInstructions: 'Store at room temperature or freeze for longer shelf life.',
    dateAdded: '2023-06-20',
    lastUpdated: '2023-09-05'
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
    price: {
      cost: 1.20,
      retail: 2.29,
      margin: 47.6
    },
    inventory: {
      quantity: 75,
      unit: 'container',
      packageSize: '6 oz',
      minOrderQuantity: 24,
      reorderPoint: 30
    },
    nutrition: {
      servingSize: '3/4 cup (170g)',
      servingsPerContainer: 1,
      calories: 100,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 10,
      sodium: 65,
      totalCarbohydrate: 6,
      dietaryFiber: 0,
      sugars: 6,
      protein: 18,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 20,
      iron: 0
    },
    ingredients: 'Cultured pasteurized nonfat milk, live active yogurt cultures (L. Bulgaricus, S. Thermophilus, L. Acidophilus, Bifidus, L. Casei)',
    allergens: ['Milk'],
    dietaryRestrictions: ['Vegetarian', 'Gluten-Free'],
    nutritionalClaims: ['High Protein', 'Fat Free', 'Good Source of Calcium'],
    certifications: ['Grade A', 'Kosher'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Plastic container',
      recyclable: true,
      material: 'Polypropylene',
      dimensions: '3" x 3" x 3.5"',
      weight: '6.5 oz'
    },
    preparation: 'Ready to eat. Keep refrigerated.',
    shelfLife: '45 days unopened',
    storageInstructions: 'Keep refrigerated at 34-40°F.',
    dateAdded: '2023-07-10',
    lastUpdated: '2023-09-12'
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
    price: {
      cost: 4.50,
      retail: 8.99,
      margin: 49.9
    },
    inventory: {
      quantity: 40,
      unit: 'jar',
      packageSize: '12 oz',
      minOrderQuantity: 12,
      reorderPoint: 15
    },
    nutrition: {
      servingSize: '1 tbsp (21g)',
      servingsPerContainer: 16,
      calories: 60,
      totalFat: 0,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbohydrate: 17,
      dietaryFiber: 0,
      sugars: 17,
      protein: 0,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0
    },
    ingredients: '100% raw organic wildflower honey',
    allergens: [],
    dietaryRestrictions: ['Gluten-Free', 'Dairy-Free'],
    nutritionalClaims: ['No Added Sugar', 'All Natural'],
    certifications: ['USDA Organic', 'True Source Certified'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Glass jar',
      recyclable: true,
      material: 'Glass with metal lid',
      dimensions: '3" diameter x 4" height',
      weight: '13 oz'
    },
    preparation: 'Ready to use.',
    shelfLife: '24 months',
    storageInstructions: 'Store at room temperature. Honey may crystallize over time; gently warm to restore liquid state.',
    dateAdded: '2023-05-15',
    lastUpdated: '2023-09-01'
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
    price: {
      cost: 2.75,
      retail: 4.99,
      margin: 44.9
    },
    inventory: {
      quantity: 90,
      unit: 'bag',
      packageSize: '2 lb',
      minOrderQuantity: 12,
      reorderPoint: 20
    },
    nutrition: {
      servingSize: '1/4 cup dry (45g)',
      servingsPerContainer: 20,
      calories: 150,
      totalFat: 1.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbohydrate: 32,
      dietaryFiber: 2,
      sugars: 0,
      protein: 3,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 4
    },
    ingredients: 'Organic long grain brown rice',
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher'],
    nutritionalClaims: ['Whole Grain', 'Good Source of Fiber', 'Low Fat'],
    certifications: ['USDA Organic', 'Non-GMO Project Verified'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Paper bag',
      recyclable: true,
      material: 'Kraft paper',
      dimensions: '8" x 5" x 3"',
      weight: '2.1 lb'
    },
    preparation: 'Rinse before cooking. Combine 1 cup rice with 2 cups water. Bring to a boil, then simmer covered for 45-50 minutes.',
    shelfLife: '24 months',
    storageInstructions: 'Store in a cool, dry place. Once opened, store in an airtight container.',
    dateAdded: '2023-04-20',
    lastUpdated: '2023-08-25'
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
    price: {
      cost: 9.50,
      retail: 16.99,
      margin: 44.1
    },
    inventory: {
      quantity: 55,
      unit: 'bottle',
      packageSize: '500 ml',
      minOrderQuantity: 6,
      reorderPoint: 12
    },
    nutrition: {
      servingSize: '1 tbsp (15ml)',
      servingsPerContainer: 33,
      calories: 120,
      totalFat: 14,
      saturatedFat: 2,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbohydrate: 0,
      dietaryFiber: 0,
      sugars: 0,
      protein: 0,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0
    },
    ingredients: '100% extra virgin olive oil',
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher', 'Paleo', 'Keto'],
    nutritionalClaims: ['Heart Healthy', 'Good Source of Monounsaturated Fats'],
    certifications: ['Protected Designation of Origin (PDO)'],
    countryOfOrigin: 'Spain',
    packaging: {
      type: 'Glass bottle',
      recyclable: true,
      material: 'Dark glass with metal cap',
      dimensions: '3" diameter x 10" height',
      weight: '1.3 lb'
    },
    preparation: 'Ready to use.',
    shelfLife: '24 months unopened',
    storageInstructions: 'Store in a cool, dark place away from direct sunlight.',
    dateAdded: '2023-03-10',
    lastUpdated: '2023-08-15'
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
    price: {
      cost: 1.80,
      retail: 3.29,
      margin: 45.3
    },
    inventory: {
      quantity: 110,
      unit: 'bag',
      packageSize: '1 lb',
      minOrderQuantity: 24,
      reorderPoint: 30
    },
    nutrition: {
      servingSize: '1/4 cup dry (45g)',
      servingsPerContainer: 10,
      calories: 150,
      totalFat: 0.5,
      saturatedFat: 0,
      transFat: 0,
      cholesterol: 0,
      sodium: 0,
      totalCarbohydrate: 27,
      dietaryFiber: 7,
      sugars: 0,
      protein: 9,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 2,
      iron: 10
    },
    ingredients: 'Organic black beans',
    allergens: [],
    dietaryRestrictions: ['Vegan', 'Gluten-Free', 'Kosher'],
    nutritionalClaims: ['High Fiber', 'High Protein', 'Low Fat'],
    certifications: ['USDA Organic', 'Non-GMO Project Verified'],
    countryOfOrigin: 'USA',
    packaging: {
      type: 'Paper bag',
      recyclable: true,
      material: 'Kraft paper',
      dimensions: '6" x 3" x 9"',
      weight: '1.1 lb'
    },
    preparation: 'Sort and rinse beans. Soak overnight. Drain and rinse. Add fresh water and simmer for 60-90 minutes until tender.',
    shelfLife: '24 months',
    storageInstructions: 'Store in a cool, dry place. Once opened, store in an airtight container.',
    dateAdded: '2023-02-15',
    lastUpdated: '2023-08-10'
  }
];

const FoodItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch food item details
    setLoading(true);
    setTimeout(() => {
      const foundItem = foodItems.find(item => item.id === id);
      setItem(foundItem || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate('/food-items');
  };
  
  const handleEdit = () => {
    navigate(`/food-items/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Items
        </button>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Item Not Found</h2>
          <p className="text-gray-600">The item you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Items
          </button>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              <span onClick={handleEdit}>Edit Item</span>
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row mb-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-2/3 md:pl-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                <p className="text-gray-600 mb-4">{item.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-medium">{item.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">UPC</p>
                <p className="font-medium">{item.upc}</p>
              </div>
              <div className="flex items-center">
                <Tag className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ShoppingBag className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">{item.brand}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Truck className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium">{item.supplier}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{item.lastUpdated}</p>
                </div>
              </div>
            </div>
            
            {/* Dietary Restrictions & Allergens */}
            <div className="mb-4">
              {item.allergens.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Allergens:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.allergens.map((allergen: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.dietaryRestrictions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Dietary Restrictions:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.dietaryRestrictions.map((restriction: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for detailed information */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <a href="#pricing" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Pricing & Inventory
            </a>
            <a href="#nutrition" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Nutrition Facts
            </a>
            <a href="#details" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Product Details
            </a>
            <a href="#packaging" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Packaging & Storage
            </a>
          </nav>
        </div>

        {/* Pricing & Inventory Section */}
        <div id="pricing" className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 text-indigo-600 mr-2" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cost Price</p>
                  <p className="text-xl font-semibold text-gray-900">${item.price.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Retail Price</p>
                  <p className="text-xl font-semibold text-gray-900">${item.price.retail.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Margin</p>
                  <p className="text-xl font-semibold text-gray-900">{item.price.margin}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className="text-xl font-semibold text-gray-900">${(item.price.retail - item.price.cost).toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 text-indigo-600 mr-2" />
                Inventory Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className="text-xl font-semibold text-gray-900">{item.inventory.quantity} {item.inventory.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package Size</p>
                  <p className="text-xl font-semibold text-gray-900">{item.inventory.packageSize}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Min Order Quantity</p>
                  <p className="text-xl font-semibold text-gray-900">{item.inventory.minOrderQuantity} {item.inventory.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reorder Point</p>
                  <p className="text-xl font-semibold text-gray-900">{item.inventory.reorderPoint} {item.inventory.unit}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Stock Status</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${
                      item.inventory.quantity > item.inventory.reorderPoint * 2 
                        ? 'bg-green-600' 
                        : item.inventory.quantity > item.inventory.reorderPoint 
                          ? 'bg-yellow-400' 
                          : 'bg-red-600'
                    }`} 
                    style={{ width: `${Math.min(100, (item.inventory.quantity / (item.inventory.reorderPoint * 3)) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-gray-600">
                  {item.inventory.quantity <= item.inventory.reorderPoint 
                    ? 'Reorder needed' 
                    : item.inventory.quantity <= item.inventory.reorderPoint * 2 
                      ? 'Stock getting low' 
                      : 'Well stocked'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Facts Section */}
        <div id="nutrition" className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nutrition Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">Nutrition Facts</h3>
              <p className="text-sm mb-2">Serving Size: {item.nutrition.servingSize}</p>
              <p className="text-sm mb-4 border-b border-gray-300 pb-1">Servings Per Container: {item.nutrition.servingsPerContainer}</p>
              
              <div className="border-b border-gray-300 pb-2 mb-2">
                <div className="flex justify-between font-bold">
                  <span>Calories</span>
                  <span>{item.nutrition.calories}</span>
                </div>
              </div>
              
              <div className="border-b border-gray-300 pb-1 mb-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total Fat</span>
                  <span>{item.nutrition.totalFat}g</span>
                </div>
                <div className="flex justify-between text-sm pl-4">
                  <span>Saturated Fat</span>
                  <span>{item.nutrition.saturatedFat}g</span>
                </div>
                <div className="flex justify-between text-sm pl-4">
                  <span>Trans Fat</span>
                  <span>{item.nutrition.transFat}g</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                <span className="font-bold">Cholesterol</span>
                <span>{item.nutrition.cholesterol}mg</span>
              </div>
              
              <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                <span className="font-bold">Sodium</span>
                <span>{item.nutrition.sodium}mg</span>
              </div>
              
              <div className="border-b border-gray-300 pb-1 mb-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Total Carbohydrate</span>
                  <span>{item.nutrition.totalCarbohydrate}g</span>
                </div>
                <div className="flex justify-between text-sm pl-4">
                  <span>Dietary Fiber</span>
                  <span>{item.nutrition.dietaryFiber}g</span>
                </div>
                <div className="flex justify-between text-sm pl-4">
                  <span>Sugars</span>
                  <span>{item.nutrition.sugars}g</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                <span className="font-bold">Protein</span>
                <span>{item.nutrition.protein}g</span>
              </div>
              
              <div className="flex justify-between text-sm py-1">
                <span>Vitamin A</span>
                <span>{item.nutrition.vitaminA}%</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span>Vitamin C</span>
                <span>{item.nutrition.vitaminC}%</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span>Calcium</span>
                <span>{item.nutrition.calcium}%</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span>Iron</span>
                <span>{item.nutrition.iron}%</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Utensils className="w-5 h-5 text-indigo-600 mr-2" />
                  Ingredients
                </h3>
                <p className="text-gray-700">{item.ingredients}</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Leaf className="w-5 h-5 text-indigo-600 mr-2" />
                  Dietary Information
                </h3>
                
                {item.allergens.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Allergens:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map((allergen: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.allergens.length === 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Allergens:</p>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center inline-block">
                      <Check className="w-4 h-4 mr-1" />
                      No allergens
                    </span>
                  </div>
                )}
                
                {item.dietaryRestrictions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Suitable for:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.dietaryRestrictions.map((restriction: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.nutritionalClaims.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Nutritional Claims:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.nutritionalClaims.map((claim: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {claim}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div id="details" className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 text-indigo-600 mr-2" />
                Certifications & Origin
              </h3>
              
              {item.certifications.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.certifications.map((cert: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Country of Origin:</p>
                <p className="text-gray-900">{item.countryOfOrigin}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Info className="w-5 h-5 text-indigo-600 mr-2" />
                Preparation Instructions
              </h3>
              <p className="text-gray-700 mb-4">{item.preparation}</p>
            </div>
          </div>
        </div>

        {/* Packaging & Storage Section */}
        <div id="packaging" className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Packaging & Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 text-indigo-600 mr-2" />
                Packaging Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{item.packaging.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium">{item.packaging.material}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dimensions</p>
                  <p className="font-medium">{item.packaging.dimensions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{item.packaging.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recyclable</p>
                  <p className="font-medium flex items-center">
                    {item.packaging.recyclable ? (
                      <>
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                        Yes
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-500 mr-1" />
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                Storage & Shelf Life
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Shelf Life</p>
                  <p className="font-medium">{item.shelfLife}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Storage Instructions</p>
                  <p className="font-medium">{item.storageInstructions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItemDetail;