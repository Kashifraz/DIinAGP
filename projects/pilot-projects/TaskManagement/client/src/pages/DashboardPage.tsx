import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewKanban,
  Assignment,
  Group,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Project {
  _id: string;
  name: string;
  description: string;
  members: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    role: string;
  }>;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isArchived: boolean;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  dueDate?: string;
  project: {
    _id: string;
    name: string;
  };
  assignees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks?limit=5'),
        ]);
        setProjects(projectsRes.data.data.projects);
        setRecentTasks(tasksRes.data.data.tasks);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.firstName}!
        </Typography>
        {user?.role !== 'member' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Create Project
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Left column */}
        <Box flexGrow={1} flexBasis={{ xs: '100%', md: '66%' }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  My Projects
                </Typography>
                <Button size="small" onClick={() => navigate('/projects')}>
                  View All
                </Button>
              </Box>
              {projects.length === 0 ? (
                <Typography color="text.secondary">
                  No projects found. {user?.role !== 'member' && 'Create your first project!'}
                </Typography>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {projects.slice(0, 6).map((project) => (
                    <Box key={project._id} flexBasis={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                      <Card variant="outlined" sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate(`/projects/${project._id}`)}>
                        <CardContent>
                          <Typography variant="h6" noWrap>
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                            {project.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                              {project.members.map((member) => (
                                <Avatar key={member.user._id} src={member.user.avatar}>
                                  {member.user.firstName.charAt(0)}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                            <Chip
                              size="small"
                              label={project.isArchived ? 'Archived' : 'Active'}
                              color={project.isArchived ? 'default' : 'success'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right column */}
        <Box flexGrow={1} flexBasis={{ xs: '100%', md: '33%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" mb={2}>
                Quick Stats
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ViewKanban color="primary" />
                  <Box>
                    <Typography variant="h6">{projects.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Projects</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Assignment color="secondary" />
                  <Box>
                    <Typography variant="h6">{recentTasks.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Recent Tasks</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Group color="info" />
                  <Box>
                    <Typography variant="h6">
                      {projects.reduce((acc, p) => acc + p.members.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Team Members</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Tasks */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Recent Tasks
              </Typography>
              <Button size="small" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </Box>
            {recentTasks.length === 0 ? (
              <Typography color="text.secondary">
                No tasks found.
              </Typography>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={2}>
                {recentTasks.map((task) => (
                  <Box key={task._id} flexBasis={{ xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 11px)' }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {task.project.name}
                        </Typography>
                        <Box display="flex" gap={1} mb={1}>
                          <Chip
                            size="small"
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                          />
                          <Chip
                            size="small"
                            label={task.status.replace('_', ' ')}
                            color={getStatusColor(task.status)}
                          />
                        </Box>
                        {task.dueDate && (
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage; 