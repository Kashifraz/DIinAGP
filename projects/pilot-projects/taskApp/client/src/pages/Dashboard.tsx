import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  FolderOpen,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CreateProjectModal from '../components/Projects/CreateProjectModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { user } = useAuth();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll(),
  });

  const projectData = projects?.data?.data || [];

  // Calculate analytics
  const totalProjects = projectData.length;
  const totalTasks = projectData.reduce((acc: number, project: any) => acc + (project._count?.tasks || 0), 0);
  const totalMembers = projectData.reduce((acc: number, project: any) => acc + (project._count?.members || 0), 0);
  
  // Task status distribution
  const taskStatusData = [
    { name: 'To Do', value: 25, color: '#6B7280' },
    { name: 'In Progress', value: 30, color: '#3B82F6' },
    { name: 'Review', value: 20, color: '#F59E0B' },
    { name: 'Done', value: 25, color: '#10B981' },
  ];

  // Weekly progress data
  const weeklyProgressData = [
    { week: 'Week 1', completed: 12, total: 20 },
    { week: 'Week 2', completed: 18, total: 25 },
    { week: 'Week 3', completed: 22, total: 30 },
    { week: 'Week 4', completed: 28, total: 35 },
  ];

  // Project activity data
  const projectActivityData = projectData.slice(0, 5).map((project: any) => ({
    name: project.name,
    tasks: project._count?.tasks || 0,
    members: project._count?.members || 0,
  }));

  const stats = [
    {
      name: 'Total Projects',
      value: totalProjects,
      icon: FolderOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Tasks',
      value: totalTasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Active Projects',
      value: projectData.filter((p: any) => p.isActive).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>
        <button
          onClick={() => setShowCreateProject(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Task Status Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Weekly Progress</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Completed Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6B7280"
                  strokeWidth={2}
                  name="Total Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Project Activity</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#3B82F6" name="Tasks" />
              <Bar dataKey="members" fill="#10B981" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
        </div>
        <div className="card-body">
          {projectData.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No projects yet. Create your first project to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectData.slice(0, 6).map((project: any) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {project._count?.members || 0}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {project._count?.tasks || 0}
                        </div>
                      </div>
                    </div>
                    {!project.isActive && (
                      <span className="badge-warning text-xs">Inactive</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
    </div>
  );
};

export default Dashboard; 