import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import FoodItems from './pages/FoodItems';
import FoodItemDetail from './pages/FoodItemDetail';
import FoodItemEdit from './pages/FoodItemEdit';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Suppliers from './pages/Suppliers';
import Management from './pages/Management';
import Search from './pages/Search';
import Search_V1 from './pages/Search_V1';
import ItemSearchGlobal from './pages/ItemSearchGlobal';
import ItemDetails from './pages/ItemDetails';
import SupplierDetail from './pages/SupplierDetail';
import ImportExport from './pages/ImportExport';
import Settings from './pages/Settings';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import Layout from './components/layout/Layout';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import OfflinePage from './pages/OfflinePage';

import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Preferences from './pages/Preferences';

import Accountability from './pages/modules/Accountability';
import POS from './pages/modules/POS';
import Eligibility from './pages/modules/Eligibility';
import AccountManagement from './pages/modules/AccountManagement';
import ItemManagement from './pages/modules/ItemManagement';
import MenuPlanning from './pages/modules/MenuPlanning';
import Production from './pages/modules/Production';
import Inventory from './pages/modules/Inventory';
import Operations from './pages/modules/Operations';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return <LoadingOverlay isVisible message="Initializing application..." />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="food-items" element={<FoodItems />} />
            <Route path="food-items/:id" element={<FoodItemDetail />} />
            <Route path="food-items/:id/edit" element={<FoodItemEdit />} />
            <Route path="categories" element={<Categories />} />
            <Route path="management" element={<Management />} />
            <Route path="search" element={<Search />} />
            <Route path="search-v1" element={<Search_V1 />} />
            <Route path="item-search-global" element={<ItemSearchGlobal />} />
            <Route path="item-details/:id" element={<ItemDetails />} />
            <Route path="management/suppliers/:id" element={<SupplierDetail />} />
            <Route path="import-export" element={<ImportExport />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;