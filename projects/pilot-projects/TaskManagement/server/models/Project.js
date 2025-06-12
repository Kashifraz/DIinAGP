const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Column name is required'],
    trim: true,
    maxlength: [50, 'Column name cannot exceed 50 characters']
  },
  order: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#1976d2'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  permissions: {
    canEditProject: {
      type: Boolean,
      default: false
    },
    canDeleteProject: {
      type: Boolean,
      default: false
    },
    canManageMembers: {
      type: Boolean,
      default: false
    },
    canCreateTasks: {
      type: Boolean,
      default: true
    },
    canEditTasks: {
      type: Boolean,
      default: true
    },
    canDeleteTasks: {
      type: Boolean,
      default: false
    }
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  columns: [columnSchema],
  settings: {
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    archiveAfterDays: {
      type: Number,
      default: 30
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Indexes for performance
projectSchema.index({ createdBy: 1, isActive: 1 });
projectSchema.index({ 'members.user': 1, isActive: 1 });
projectSchema.index({ name: 'text', description: 'text' });

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for task count (will be populated)
projectSchema.virtual('taskCount').get(function() {
  return 0; // This will be calculated when needed
});

// Pre-save middleware to set default columns
projectSchema.pre('save', function(next) {
  if (this.isNew && this.columns.length === 0) {
    this.columns = [
      { name: 'To Do', order: 0, isDefault: true, color: '#1976d2' },
      { name: 'In Progress', order: 1, isDefault: true, color: '#ff9800' },
      { name: 'Done', order: 2, isDefault: true, color: '#4caf50' }
    ].map(col => this.columns.create(col));
  }
  next();
});

// Method to add member to project
projectSchema.methods.addMember = function(userId, role = 'member', permissions = {}) {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (existingMember) {
    throw new Error('User is already a member of this project');
  }
  
  this.members.push({
    user: userId,
    role,
    permissions: {
      canEditProject: role === 'owner' || role === 'admin',
      canDeleteProject: role === 'owner',
      canManageMembers: role === 'owner' || role === 'admin',
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: role === 'owner' || role === 'admin',
      ...permissions
    }
  });
  
  return this.save();
};

// Method to remove member from project
projectSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  return this.save();
};

// Method to update member role
projectSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this project');
  }
  
  member.role = newRole;
  member.permissions = {
    canEditProject: newRole === 'owner' || newRole === 'admin',
    canDeleteProject: newRole === 'owner',
    canManageMembers: newRole === 'owner' || newRole === 'admin',
    canCreateTasks: true,
    canEditTasks: true,
    canDeleteTasks: newRole === 'owner' || newRole === 'admin'
  };
  
  return this.save();
};

// Method to check if user has permission
projectSchema.methods.userHasPermission = function(userId, permission) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;
  
  return member.permissions[permission] || false;
};

// Method to get user's role in project
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Method to add column
projectSchema.methods.addColumn = function(columnData) {
  const maxOrder = Math.max(...this.columns.map(c => c.order), -1);
  this.columns.push({
    ...columnData,
    order: maxOrder + 1
  });
  return this.save();
};

// Method to update column order
projectSchema.methods.updateColumnOrder = function(columnId, newOrder) {
  const column = this.columns.id(columnId);
  if (!column) {
    throw new Error('Column not found');
  }
  
  // Reorder columns
  const columns = this.columns.filter(c => c._id.toString() !== columnId.toString());
  columns.splice(newOrder, 0, column);
  
  // Update order values
  this.columns = columns.map((col, index) => {
    col.order = index;
    return col;
  });
  
  return this.save();
};

// Method to archive project
projectSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Method to unarchive project
projectSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId, includeArchived = false) {
  const query = {
    $or: [
      { createdBy: userId },
      { 'members.user': userId }
    ]
  };
  
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  return this.find(query).populate('members.user', 'firstName lastName email avatar');
};

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({ isActive: true, isArchived: false });
};

module.exports = mongoose.model('Project', projectSchema); 