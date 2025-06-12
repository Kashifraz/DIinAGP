import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Settings,
  Trash2,
  Plus,
  Mail,
  Shield,
  Calendar,
  Tag,
  Save,
  Loader2,
  UserPlus,
  UserMinus,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProjectMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

interface ProjectTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const ProjectSettings: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'tags' | 'danger'>('general');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // Fetch project data
  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId!),
    enabled: !!projectId,
  });

  // Fetch all users for invite suggestions
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
  });

  const project = projectData?.data?.data;
  const users = usersData?.data?.data || [];

  // Add projects property if it doesn't exist (for compatibility)
  if (project && !project.projects) {
    project.projects = [];
  }

  // Check if current user is project owner or admin
  const currentUserRole = project?.members?.find(
    (member: ProjectMember) => member.user.id === user?.id
  )?.role;
  const canManageTeam = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  const isOwner = currentUserRole === 'OWNER';

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => projectsAPI.update(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Project updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      projectsAPI.inviteMember(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setShowInviteModal(false);
      setInviteEmail('');
      toast.success('Invitation sent successfully!');
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsAPI.removeMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      toast.success('Member removed successfully!');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      projectsAPI.createTag(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      setNewTagName('');
      setNewTagColor('#3B82F6');
      toast.success('Tag created successfully!');
    },
    onError: () => {
      toast.error('Failed to create tag');
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsAPI.delete(projectId!),
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleUpdateProject = (formData: any) => {
    updateProjectMutation.mutate(formData);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      createTagMutation.mutate({ name: newTagName, color: newTagColor });
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
          <p className="text-gray-600 mt-1">{project.name}</p>
        </div>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="btn-secondary"
        >
          Back to Project
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Team
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="h-4 w-4 inline mr-2" />
            Tags
          </button>
          {isOwner && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'danger'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Danger Zone
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Project Information</h3>
              </div>
              <div className="card-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateProject({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                  });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={project.name}
                        className="input mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        defaultValue={project.description || ''}
                        rows={3}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        defaultValue={project.startDate?.split('T')[0] || ''}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        defaultValue={project.endDate?.split('T')[0] || ''}
                        className="input mt-1"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={updateProjectMutation.isPending}
                      className="btn-primary flex items-center"
                    >
                      {updateProjectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Team Management */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  {canManageTeam && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="btn-primary flex items-center"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {project.members?.map((member: ProjectMember) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        {canManageTeam && member.user.id !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove member"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags Management */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Project Tags</h3>
                  {canManageTeam && (
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="btn-primary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tag
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.tags?.map((tag: ProjectTag) => (
                    <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      {canManageTeam && (
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && isOwner && (
          <div className="space-y-6">
            <div className="card border-red-200">
              <div className="card-header">
                <h3 className="text-lg font-medium text-red-900">Danger Zone</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">Delete Project</h4>
                      <p className="text-sm text-red-700">
                        Once you delete a project, there is no going back. Please be certain.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn-danger"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Team Member</h3>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input mt-1"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'MEMBER' | 'VIEWER')}
                    className="input mt-1"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteMemberMutation.isPending}
                    className="btn-primary flex items-center"
                  >
                    {inviteMemberMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-red-900 mb-4">Delete Project</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{project.name}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleteProjectMutation.isPending}
                  className="btn-danger flex items-center"
                >
                  {deleteProjectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSettings; 