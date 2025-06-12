import React from 'react';
import { 
  TagIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { Category } from '../../services/categoryService';

interface CategoryStatsProps {
  categories: Category[];
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories }) => {
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const inactiveCategories = totalCategories - activeCategories;
  const categoriesWithImages = categories.filter(cat => cat.imageUrl).length;
  const categoriesWithoutImages = totalCategories - categoriesWithImages;

  const stats = [
    {
      name: 'Total Categories',
      value: totalCategories,
      icon: TagIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Active Categories',
      value: activeCategories,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Inactive Categories',
      value: inactiveCategories,
      icon: XCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'With Images',
      value: categoriesWithImages,
      icon: ClockIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const topCategories = [...categories]
    .sort((a, b) => b.sortOrder - a.sortOrder)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Category Statistics</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-md ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className={`text-2xl font-semibold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Categories by Sort Order */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Categories by Priority</h4>
        <div className="space-y-2">
          {topCategories.map((category, index) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {category.name}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Priority: {category.sortOrder}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Insights</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {Math.round((activeCategories / totalCategories) * 100)}% of categories are active</li>
            <li>• {Math.round((categoriesWithImages / totalCategories) * 100)}% have images</li>
            <li>• Average sort order: {Math.round(categories.reduce((sum, cat) => sum + cat.sortOrder, 0) / totalCategories)}</li>
          </ul>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">Recommendations</h4>
          <ul className="text-sm text-green-800 space-y-1">
            {categoriesWithoutImages > 0 && (
              <li>• Add images to {categoriesWithoutImages} categories</li>
            )}
            {inactiveCategories > 0 && (
              <li>• Review {inactiveCategories} inactive categories</li>
            )}
            {totalCategories < 10 && (
              <li>• Consider adding more categories for better organization</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;
