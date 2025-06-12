import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, AtSign, Paperclip, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { tasksAPI, filesAPI, projectsAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface CommentSectionProps {
  taskId: string;
  projectId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId, projectId }) => {
  const [comment, setComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const { user } = useAuth();
  const { emitCommentAdd } = useSocket();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => tasksAPI.getById(taskId),
    select: (data) => data.data.data.comments || [],
  });

  // Fetch project members for mentions
  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getById(projectId),
  });

  const comments = commentsData || [];
  const members = projectData?.data?.data?.members || [];

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => tasksAPI.addComment(taskId, { content }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['comments', taskId]);
      emitCommentAdd(projectId, response.data.data);
      setComment('');
      toast.success('Comment added successfully!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  // Handle textarea change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    setCursorPosition(e.target.selectionStart);

    // Check for @ symbol
    const lastAtSymbol = value.lastIndexOf('@', e.target.selectionStart - 1);
    if (lastAtSymbol !== -1) {
      const searchTerm = value.slice(lastAtSymbol + 1, e.target.selectionStart);
      setMentionSearch(searchTerm);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (member: any) => {
    const beforeMention = comment.slice(0, comment.lastIndexOf('@'));
    const afterMention = comment.slice(cursorPosition);
    const newComment = `${beforeMention}@${member.user.firstName} ${member.user.lastName} ${afterMention}`;
    setComment(newComment);
    setShowMentions(false);
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newPosition = beforeMention.length + member.user.firstName.length + member.user.lastName.length + 2;
      textareaRef.current.setSelectionRange(newPosition, newPosition);
    }
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  // Filter members for mentions
  const filteredMembers = members.filter((member: any) =>
    `${member.user.firstName} ${member.user.lastName}`
      .toLowerCase()
      .includes(mentionSearch.toLowerCase())
  );

  // Process comment content for mentions
  const processCommentContent = (content: string) => {
    return content.replace(
      /@(\w+ \w+)/g,
      '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>'
    );
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {comment.user.firstName.charAt(0)}{comment.user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={handleCommentChange}
            onFocus={(e) => setCursorPosition(e.target.selectionStart)}
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart || 0)}
            placeholder="Add a comment... Use @ to mention team members"
            rows={3}
            className="input resize-none"
          />
          
          {/* Mentions Dropdown */}
          {showMentions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="max-h-48 overflow-y-auto">
                {filteredMembers.map((member: any) => (
                  <button
                    key={member.user.id}
                    type="button"
                    onClick={() => handleMentionSelect(member)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Use @ to mention team members</span>
            <AtSign className="h-4 w-4" />
          </div>
          
          <button
            type="submit"
            disabled={!comment.trim() || addCommentMutation.isPending}
            className="btn-primary flex items-center"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection; 