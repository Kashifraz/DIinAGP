import React from 'react';
import { useQuery } from '@tanstack/react-query';
import categoryService from '../../services/categoryService';

const CategoryStats = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['categoryStats'],
    queryFn: categoryService.getCategoryStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="stats-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-message">
          <h3>Error Loading Statistics</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const stats = statsData?.data || [];
  const totalJobs = stats.reduce((sum, stat) => sum + stat.jobCount, 0);
  const totalActiveJobs = stats.reduce((sum, stat) => sum + stat.activeJobs, 0);

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2>Category Statistics</h2>
        <p>Overview of job distribution across categories</p>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{totalActiveJobs}</h3>
            <p>Active Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <h3>{stats.length}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      <div className="stats-table-container">
        <h3>Jobs by Category</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Level</th>
              <th>Total Jobs</th>
              <th>Active Jobs</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => {
              const utilization = totalJobs > 0 ? ((stat.jobCount / totalJobs) * 100).toFixed(1) : 0;
              return (
                <tr key={stat._id}>
                  <td>
                    <div className="category-info">
                      <span className="category-name">{stat.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="level-badge level-{stat.level}">
                      Level {stat.level}
                    </span>
                  </td>
                  <td>
                    <span className="job-count">{stat.jobCount}</span>
                  </td>
                  <td>
                    <span className="active-count">{stat.activeJobs}</span>
                  </td>
                  <td>
                    <div className="utilization-bar">
                      <div 
                        className="utilization-fill" 
                        style={{ width: `${utilization}%` }}
                      ></div>
                      <span className="utilization-text">{utilization}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stats.length === 0 && (
        <div className="no-stats">
          <div className="no-stats-content">
            <h3>No Statistics Available</h3>
            <p>Statistics will appear once categories have job postings</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryStats;
