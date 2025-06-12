import React, { useState } from 'react';
import { 
  TagIcon, 
  CubeIcon, 
  ShoppingCartIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import CategoryManagement from '../components/admin/CategoryManagement';
import ProductManagement from '../components/admin/ProductManagement';
import AdminOrders from './AdminOrders';

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType | null;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs: Tab[] = [
    { id: 'categories', name: 'Categories', icon: TagIcon, component: CategoryManagement },
    { id: 'products', name: 'Products', icon: CubeIcon, component: ProductManagement },
    { id: 'orders', name: 'Orders', icon: ShoppingCartIcon, component: AdminOrders }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cog6ToothIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your e-commerce store operations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`h-5 w-5 transition-transform duration-200 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span>{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
              {(() => {
                const currentTab = tabs.find(tab => tab.id === activeTab);
                if (currentTab) {
                  const IconComponent = currentTab.icon;
                  return <IconComponent className="h-16 w-16" />;
                }
                return null;
              })()}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name} Management
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              This feature is coming soon. Currently working on Categories, Products, and Orders management.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveTab('categories')}
                className="inline-flex items-center space-x-2 px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <TagIcon className="h-4 w-4" />
                <span>Go to Categories</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className="inline-flex items-center space-x-2 px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <CubeIcon className="h-4 w-4" />
                <span>Go to Products</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="inline-flex items-center space-x-2 px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span>Go to Orders</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
