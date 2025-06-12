const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [attachmentSchema],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, { 
  timestamps: true,
  _id: true 
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'review', 'completed', 'cancelled'],
    default: 'open'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: null
  },
  actualHours: {
    type: Number,
    min: 0,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  attachments: [attachmentSchema],
  comments: [commentSchema],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related'],
      default: 'blocks'
    }
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and search
taskSchema.index({ project: 1, column: 1, order: 1 });
taskSchema.index({ assignees: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  'comments.content': 'text'
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  
  const statusProgress = {
    'open': 0,
    'in_progress': 50,
    'review': 75,
    'completed': 100,
    'cancelled': 0
  };
  
  return statusProgress[this.status] || 0;
});

// Virtual for assignee names
taskSchema.virtual('assigneeNames').get(function() {
  if (!this.populated('assignees')) return [];
  return this.assignees.map(user => user.fullName || `${user.firstName} ${user.lastName}`);
});

// Method to add assignee
taskSchema.methods.addAssignee = function(userId) {
  if (!this.assignees.includes(userId)) {
    this.assignees.push(userId);
  }
  return this.save();
};

// Method to remove assignee
taskSchema.methods.removeAssignee = function(userId) {
  this.assignees = this.assignees.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to add attachment
taskSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

// Method to remove attachment
taskSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments = this.attachments.filter(att => att._id.toString() !== attachmentId.toString());
  return this.save();
};

// Method to move task to different column
taskSchema.methods.moveToColumn = function(columnId, newOrder = null) {
  this.column = columnId;
  if (newOrder !== null) {
    this.order = newOrder;
  }
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else {
    this.completedAt = null;
  }
  return this.save();
};

// Method to add watcher
taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this.save();
};

// Method to remove watcher
taskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Method to add dependency
taskSchema.methods.addDependency = function(taskId, type = 'blocks') {
  const existingDep = this.dependencies.find(dep => dep.task.toString() === taskId.toString());
  if (!existingDep) {
    this.dependencies.push({ task: taskId, type });
  }
  return this.save();
};

// Method to remove dependency
taskSchema.methods.removeDependency = function(taskId) {
  this.dependencies = this.dependencies.filter(dep => dep.task.toString() !== taskId.toString());
  return this.save();
};

// Method to archive task
taskSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Method to unarchive task
taskSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

// Static method to find tasks by project
taskSchema.statics.findByProject = function(projectId, includeArchived = false) {
  const query = { project: projectId };
  if (!includeArchived) {
    query.isArchived = false;
  }
  return this.find(query)
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('comments.author', 'firstName lastName email avatar')
    .populate('comments.mentions', 'firstName lastName email avatar')
    .populate('watchers', 'firstName lastName email avatar')
    .sort({ order: 1, createdAt: -1 });
};

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function(userId, includeArchived = false) {
  const query = { assignees: userId };
  if (!includeArchived) {
    query.isArchived = false;
  }
  return this.find(query)
    .populate('project', 'name')
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .sort({ dueDate: 1, createdAt: -1 });
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false
  })
  .populate('project', 'name')
  .populate('assignees', 'firstName lastName email avatar')
  .populate('createdBy', 'firstName lastName email avatar');
};

// Static method to search tasks
taskSchema.statics.search = function(searchTerm, projectId = null) {
  const query = {
    $text: { $search: searchTerm },
    isArchived: false
  };
  
  if (projectId) {
    query.project = projectId;
  }
  
  return this.find(query)
    .populate('project', 'name')
    .populate('assignees', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Task', taskSchema); 