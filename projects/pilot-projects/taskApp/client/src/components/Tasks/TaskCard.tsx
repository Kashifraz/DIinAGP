import React from 'react';
import { Calendar, User, MessageSquare, Paperclip, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-3">
      {/* Title */}
      <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
      
      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((tagItem) => (
            <span
              key={tagItem.tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${tagItem.tag.color}20`,
                color: tagItem.tag.color,
              }}
            >
              {tagItem.tag.name}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Priority */}
      <div className="flex items-center justify-between">
        <span className={`badge ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center text-xs ${
            isOverdue ? 'text-red-600' : 'text-gray-500'
          }`}>
            <Calendar className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-3 w-3 mr-1" />
          <span className="truncate">
            {task.assignee.firstName} {task.assignee.lastName}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {task._count.comments > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {task._count.comments}
            </div>
          )}
          {task._count.attachments > 0 && (
            <div className="flex items-center">
              <Paperclip className="h-3 w-3 mr-1" />
              {task._count.attachments}
            </div>
          )}
        </div>
        
        {/* Created by */}
        <div className="flex items-center">
          <span className="truncate">
            by {task.createdBy.firstName} {task.createdBy.lastName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 