const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters'],
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: {
      values: [
        'technical',
        'programming',
        'framework',
        'database',
        'cloud',
        'devops',
        'design',
        'language',
        'soft',
        'certification',
        'tool',
        'other'
      ],
      message: 'Invalid skill category'
    },
  },
  proficiency: {
    type: String,
    required: [true, 'Proficiency level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Invalid proficiency level'
    },
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  certifications: [{
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Certification name cannot exceed 200 characters'],
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters'],
    },
    dateObtained: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters'],
    },
    credentialUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Credential URL cannot exceed 500 characters'],
    },
  }],
  projects: [{
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Project description cannot exceed 500 characters'],
    },
    url: {
      type: String,
      trim: true,
      maxlength: [500, 'Project URL cannot exceed 500 characters'],
    },
    technologies: [{
      type: String,
      trim: true,
      maxlength: [50, 'Technology name cannot exceed 50 characters'],
    }],
  }],
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for proficiency percentage
skillSchema.virtual('proficiencyPercentage').get(function() {
  const proficiencyMap = {
    'beginner': 25,
    'intermediate': 50,
    'advanced': 75,
    'expert': 100
  };
  return proficiencyMap[this.proficiency] || 0;
});

// Virtual for experience level
skillSchema.virtual('experienceLevel').get(function() {
  if (!this.yearsOfExperience) return 'Not specified';
  
  if (this.yearsOfExperience < 1) return 'Less than 1 year';
  if (this.yearsOfExperience < 3) return '1-2 years';
  if (this.yearsOfExperience < 5) return '3-4 years';
  if (this.yearsOfExperience < 10) return '5-9 years';
  return '10+ years';
});

// Virtual for active certifications count
skillSchema.virtual('activeCertificationsCount').get(function() {
  if (!this.certifications || this.certifications.length === 0) return 0;
  
  const now = new Date();
  return this.certifications.filter(cert => 
    !cert.expiryDate || cert.expiryDate > now
  ).length;
});

// Virtual for total projects count
skillSchema.virtual('totalProjectsCount').get(function() {
  return this.projects ? this.projects.length : 0;
});

// Pre-save hook to set the order
skillSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastSkill = await this.constructor.findOne(
      { user: this.user, isActive: true },
      {},
      { sort: { order: -1 } }
    );
    this.order = lastSkill ? lastSkill.order + 1 : 1;
  }
  next();
});

// Static method to reorder skills
skillSchema.statics.reorderSkills = async function(userId, skillIds) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const skills = await this.find({ user: userId, _id: { $in: skillIds }, isActive: true }).session(session);
    if (skills.length !== skillIds.length) {
      throw new Error('One or more skills not found or do not belong to the user.');
    }

    const updates = skillIds.map((id, index) =>
      this.updateOne({ _id: id, user: userId }, { $set: { order: index + 1 } }, { session })
    );
    await Promise.all(updates);

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Static method to get all active skills for a user, sorted by order
skillSchema.statics.getUserSkills = async function(userId) {
  return this.find({ user: userId, isActive: true }).sort('order');
};

// Static method to get skills by category
skillSchema.statics.getSkillsByCategory = async function(userId, category) {
  return this.find({ user: userId, category, isActive: true }).sort('order');
};

// Static method to get skills statistics
skillSchema.statics.getSkillsStats = async function(userId) {
  const pipeline = [
    { $match: { user: mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        totalSkills: { $sum: 1 },
        highlightedSkills: { $sum: { $cond: ['$isHighlighted', 1, 0] } },
        categories: { $addToSet: '$category' },
        proficiencyLevels: { $addToSet: '$proficiency' },
        totalCertifications: { $sum: { $size: { $ifNull: ['$certifications', []] } } },
        totalProjects: { $sum: { $size: { $ifNull: ['$projects', []] } } },
        averageExperience: { $avg: '$yearsOfExperience' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSkills: 1,
        highlightedSkills: 1,
        uniqueCategories: { $size: '$categories' },
        categories: 1,
        proficiencyLevels: 1,
        totalCertifications: 1,
        totalProjects: 1,
        averageExperience: { $round: ['$averageExperience', 1] }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSkills: 0,
    highlightedSkills: 0,
    uniqueCategories: 0,
    categories: [],
    proficiencyLevels: [],
    totalCertifications: 0,
    totalProjects: 0,
    averageExperience: 0
  };
};

// Instance method to move a skill up in order
skillSchema.methods.moveUp = async function() {
  const prevSkill = await this.constructor.findOne({
    user: this.user,
    order: { $lt: this.order },
    isActive: true
  }).sort({ order: -1 });

  if (prevSkill) {
    const tempOrder = this.order;
    this.order = prevSkill.order;
    prevSkill.order = tempOrder;

    await Promise.all([this.save(), prevSkill.save()]);
  }
};

// Instance method to move a skill down in order
skillSchema.methods.moveDown = async function() {
  const nextSkill = await this.constructor.findOne({
    user: this.user,
    order: { $gt: this.order },
    isActive: true
  }).sort({ order: 1 });

  if (nextSkill) {
    const tempOrder = this.order;
    this.order = nextSkill.order;
    nextSkill.order = tempOrder;

    await Promise.all([this.save(), nextSkill.save()]);
  }
};

// Index for better query performance
skillSchema.index({ user: 1, category: 1, isActive: 1 });
skillSchema.index({ user: 1, order: 1, isActive: 1 });
skillSchema.index({ user: 1, isHighlighted: 1, isActive: 1 });

module.exports = mongoose.model('Skill', skillSchema);
