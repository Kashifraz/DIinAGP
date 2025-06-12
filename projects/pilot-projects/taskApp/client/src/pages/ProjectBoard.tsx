import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MoreVertical,
  Users,
  Calendar,
  Tag,
  MessageSquare,
  Paperclip,
  Filter,
  Search,
} from 'lucide-react';
import { projectsAPI, tasksAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskModal from '../components/Tasks/TaskModal';
import TaskCard from '../components/Tasks/TaskCard';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  _count: {
    comments: number;
    attachments: number;
  };
}

const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { user } = useAuth();
  const { joinProject, leaveProject, emitTaskUpdate } = useSocket();
  const queryClient = useQueryClient();

  // Fetch project data
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId!),
    enabled: !!projectId,
  });

  // Fetch tasks data
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksAPI.getByProject(projectId!),
    enabled: !!projectId,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      tasksAPI.update(taskId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      emitTaskUpdate(projectId!, data.data.data);
      toast.success('Task updated successfully');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  // Join project room on mount
  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
      return () => leaveProject(projectId);
    }
  }, [projectId, joinProject, leaveProject]);

  const project = projectData?.data?.data;
  const tasks = tasksData?.data?.data || [];

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAssignee = filterAssignee === 'all' || 
                           task.assignee?.id === filterAssignee ||
                           (filterAssignee === 'unassigned' && !task.assignee);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesAssignee && matchesPriority;
  });

  // Group tasks by status
  const groupedTasks = {
    TODO: filteredTasks.filter((task: Task) => task.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter((task: Task) => task.status === 'IN_PROGRESS'),
    REVIEW: filteredTasks.filter((task: Task) => task.status === 'REVIEW'),
    DONE: filteredTasks.filter((task: Task) => task.status === 'DONE'),
  };

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'REVIEW', title: 'Review', color: 'bg-yellow-100' },
    { id: 'DONE', title: 'Done', color: 'bg-green-100' },
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    const task = tasks.find((t: Task) => t.id === draggableId);

    if (task && task.status !== newStatus) {
      updateTaskMutation.mutate({
        taskId: draggableId,
        data: { status: newStatus },
      });
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  if (projectLoading || tasksLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={handleCreateTask}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-lg font-semibold text-gray-900">
                  {project._count?.members || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-lg font-semibold text-gray-900">
                  {project._count?.tasks || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tasks.reduce((acc: number, task: Task) => acc + task._count.comments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Paperclip className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Attachments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tasks.reduce((acc: number, task: Task) => acc + task._count.attachments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="input"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {project.members?.map((member: any) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.firstName} {member.user.lastName}
                  </option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input"
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span className="badge-gray">
                  {groupedTasks[column.id as keyof typeof groupedTasks]?.length || 0}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-gray-200' : ''
                    }`}
                  >
                    {groupedTasks[column.id as keyof typeof groupedTasks]?.map((task: Task, index: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            onClick={() => handleEditTask(task)}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={selectedTask}
        projectId={projectId!}
        project={project}
      />
    </div>
  );
};

export default ProjectBoard; 