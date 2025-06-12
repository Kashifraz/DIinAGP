import React from 'react';
import { SkillStats as SkillStatsType } from '../../services/skillService';
import { Award, Star, Tag, Briefcase, FileText, Clock } from 'lucide-react';

interface SkillStatsProps {
  stats: SkillStatsType | null;
  loading?: boolean;
}

const SkillStats: React.FC<SkillStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
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
      label: 'Total Skills',
      value: stats.totalSkills,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Highlighted Skills',
      value: stats.highlightedSkills,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Categories',
      value: stats.uniqueCategories,
      icon: Tag,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Certifications',
      value: stats.totalCertifications,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Projects',
      value: stats.totalProjects,
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Avg Experience',
      value: `${stats.averageExperience} years`,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Statistics</h3>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`stat-${index}-${item.label}`} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories Breakdown */}
      {stats.categories && stats.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((category, index) => (
              <span
                key={`category-${index}-${category}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Proficiency Levels */}
      {stats.proficiencyLevels && stats.proficiencyLevels.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Proficiency Levels</h4>
          <div className="flex flex-wrap gap-2">
            {stats.proficiencyLevels.map((level, index) => (
              <span
                key={`proficiency-${index}-${level}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillStats;
