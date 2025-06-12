import React, { useState } from 'react';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../services/api';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AnalyticsData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamMembers: number;
  productivityScore: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  projects?: any[];
  tasks?: any[];
}

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange, selectedProject],
    queryFn: async () => {
      const [projectsRes, tasksRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll(),
      ]);
      
      const projects = projectsRes.data.data;
      const tasks = tasksRes.data.data;
      
      // Filter by date range
      const startDate = subDays(new Date(), parseInt(dateRange));
      const filteredTasks = tasks.filter((task: any) => 
        new Date(task.createdAt) >= startDate
      );
      
      // Calculate metrics
      const completedTasks = filteredTasks.filter((task: any) => task.status === 'DONE');
      const overdueTasks = filteredTasks.filter((task: any) => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      );
      
      return {
        totalProjects: projects.length,
        totalTasks: filteredTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        teamMembers: projects.reduce((acc: number, project: any) => 
          acc + (project._count?.members || 0), 0
        ),
        productivityScore: Math.round((completedTasks.length / filteredTasks.length) * 100) || 0,
        taskCompletionRate: Math.round((completedTasks.length / filteredTasks.length) * 100) || 0,
        averageTaskDuration: 5.2, // Mock data
        projects,
        tasks: filteredTasks,
      };
    },
  });

  // Generate chart data
  const generateTaskStatusData = () => {
    if (!analyticsData?.tasks) return [];
    
    const statusCounts = analyticsData.tasks.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));
  };

  const generateTaskTrendData = () => {
    const days = parseInt(dateRange);
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = analyticsData?.tasks?.filter((task: any) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startOfDay(date) && taskDate <= endOfDay(date);
      }) || [];
      
      data.push({
        date: format(date, 'MMM dd'),
        created: dayTasks.length,
        completed: dayTasks.filter((task: any) => task.status === 'DONE').length,
      });
    }
    
    return data;
  };

  const generatePriorityData = () => {
    if (!analyticsData?.tasks) return [];
    
    const priorityCounts = analyticsData.tasks.reduce((acc: any, task: any) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  const data = analyticsData || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    teamMembers: 0,
    productivityScore: 0,
    taskCompletionRate: 0,
    averageTaskDuration: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your team's productivity and project progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="input"
          >
            <option value="all">All Projects</option>
            {analyticsData?.projects?.map((project: any) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalProjects}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data.completedTasks}</p>
                <p className="text-sm text-green-600">
                  {data.taskCompletionRate}% completion rate
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{data.overdueTasks}</p>
                <p className="text-sm text-yellow-600">
                  {data.totalTasks > 0 ? Math.round((data.overdueTasks / data.totalTasks) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{data.teamMembers}</p>
                <p className="text-sm text-purple-600">Active contributors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
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
                  data={generateTaskStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {generateTaskStatusData().map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Task Activity Trend</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateTaskTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Task Priority Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generatePriorityData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Productivity Metrics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">{data.taskCompletionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${data.taskCompletionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Productivity Score</span>
                  <span className="text-sm font-medium text-gray-900">{data.productivityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${data.productivityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Task Duration</span>
                  <span className="text-sm font-medium text-gray-900">{data.averageTaskDuration} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((data.averageTaskDuration / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {analyticsData?.tasks?.slice(0, 10).map((task: any) => (
              <div key={task.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {task.createdBy.firstName.charAt(0)}{task.createdBy.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Created by {task.createdBy.firstName} {task.createdBy.lastName} • {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${
                    task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 