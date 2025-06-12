import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Loader2,
  User,
  Calendar,
  Tag,
  Paperclip,
  Send,
  Plus,
  Trash2,
} from 'lucide-react';
import { tasksAPI, filesAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assigneeId?: string;
  tagIds?: string[];
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projectId: string;
  project: any;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projectId,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const { emitTaskCreate, emitTaskUpdate } = useSocket();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      tagIds: [],
    },
  });

  // Set form values when task changes
  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
      setValue('assigneeId', task.assigneeId || '');
      setValue('tagIds', task.tags.map(t => t.tag.id));
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => tasksAPI.create({ ...data, projectId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      emitTaskCreate(projectId, response.data.data);
      toast.success('Task created successfully!');
      onClose();
      reset();
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormData }) =>
      tasksAPI.update(taskId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['tasks', projectId]);
      emitTaskUpdate(projectId, response.data.data);
      toast.success('Task updated successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadPromises = files.map(file => filesAPI.upload(file, task?.id));
      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      setSelectedFiles([]);
      toast.success('Files uploaded successfully!');
    },
    onError: () => {
      toast.error('Failed to upload files');
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    if (task) {
      updateTaskMutation.mutate({ taskId: task.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploadingFiles(true);
    try {
      await uploadFilesMutation.mutateAsync(selectedFiles);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const watchedTagIds = watch('tagIds') || [];

  const toggleTag = (tagId: string) => {
    const currentTags = watchedTagIds;
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    setValue('tagIds', newTags);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              {task && (
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'comments'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Comments
                </button>
              )}
            </nav>
          </div>

          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="input mt-1"
                  placeholder="Enter task title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input mt-1"
                  placeholder="Enter task description"
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select {...register('priority')} className="input mt-1">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    {...register('dueDate')}
                    type="date"
                    className="input mt-1"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                  Assignee
                </label>
                <select {...register('assigneeId')} className="input mt-1">
                  <option value="">Unassigned</option>
                  {project.members?.map((member: any) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.firstName} {member.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: any) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          watchedTagIds.includes(tag.id)
                            ? 'border-transparent'
                            : 'border-gray-300'
                        }`}
                        style={{
                          backgroundColor: watchedTagIds.includes(tag.id) ? tag.color : 'transparent',
                          color: watchedTagIds.includes(tag.id) ? 'white' : tag.color,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                
                {/* File Input */}
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-secondary cursor-pointer flex items-center"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Select Files
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={uploadingFiles}
                      className="btn-primary flex items-center"
                    >
                      {uploadingFiles ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Upload
                    </button>
                  )}
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  className="btn-primary flex items-center"
                >
                  {(createTaskMutation.isPending || updateTaskMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          ) : (
            <CommentSection taskId={task!.id} projectId={projectId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 