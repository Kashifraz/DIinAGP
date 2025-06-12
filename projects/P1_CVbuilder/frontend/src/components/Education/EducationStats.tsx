import React from 'react';
import { GraduationCap, Award, Building, TrendingUp } from 'lucide-react';
import { EducationStats as EducationStatsType } from '../../services/educationService';

interface EducationStatsProps {
  stats: EducationStatsType | null;
  loading?: boolean;
}

const EducationStats: React.FC<EducationStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Total Entries',
      value: stats.totalEntries,
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Current Education',
      value: stats.currentEducation,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Completed',
      value: stats.completedEducation,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Institutions',
      value: stats.uniqueInstitutions,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.bgColor} mb-2`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          );
        })}
      </div>

      {stats.averageGPA !== null && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-600">Average GPA:</span>
            <span className="text-lg font-semibold text-gray-900">{stats.averageGPA.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationStats;
