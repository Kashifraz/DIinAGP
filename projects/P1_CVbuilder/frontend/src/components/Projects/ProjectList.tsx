import React from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, ExternalLink, Code, Calendar, Github } from 'lucide-react';
import { Project } from '../../services/projectService';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isReordering?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects = [],
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering = false
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Added</h3>
        <p className="text-gray-500">Start building your project portfolio by adding your first project.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.completed;
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      planning: 'Planning',
      in_progress: 'In Progress',
      completed: 'Completed',
      on_hold: 'On Hold',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div
          key={project._id || index}
          className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
            project.isActive ? '' : 'opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Name and Status */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
                {!project.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={`tech-${idx}-${tech}`}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                {/* Dates */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {formatDate(project.startDate)}
                    {project.endDate && ` - ${formatDate(project.endDate)}`}
                    {!project.endDate && project.status === 'in_progress' && ' - Present'}
                  </span>
                </div>

                {/* Project Type */}
                <div className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  <span className="capitalize">
                    {project.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* URLs */}
              <div className="flex items-center space-x-4 text-sm mb-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Project
                  </a>
                )}
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <Github className="w-4 h-4 mr-1" />
                    View Code
                  </a>
                )}
              </div>

              {/* Achievements */}
              {project.achievements && project.achievements.length > 0 && (
                <div className="bg-gray-50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {project.achievements.map((achievement, idx) => (
                      <li key={`achievement-${idx}-${achievement}`} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onMoveUp(project._id)}
                  disabled={index === 0 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveDown(project._id)}
                  disabled={index === projects.length - 1 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Edit project"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
