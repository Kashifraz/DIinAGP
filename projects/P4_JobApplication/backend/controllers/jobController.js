const JobPosting = require('../models/JobPosting');
const Category = require('../models/Category');

// Create a new job posting
const createJob = async (req, res) => {
  try {
  const jobData = {
    ...req.body,
    employer: req.user.id
  };

    // Check if category exists
    const category = await Category.findById(jobData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    const job = new JobPosting(jobData);
    await job.save();

    // Populate category and employer fields
    await job.populate([
      { path: 'category', select: 'name description' },
      { path: 'employer', select: 'email profile.firstName profile.lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job posting',
      error: error.message
    });
  }
};

// Get all jobs with filtering and pagination
const getJobs = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      employmentType,
      experienceLevel,
      isRemote,
      minSalary,
      maxSalary,
      currency = 'USD',
      sortBy = 'postedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Employment type filter
    if (employmentType) {
      filter.employmentType = employmentType;
    }

    // Experience level filter
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Remote work filter
    if (isRemote !== undefined) {
      filter.isRemote = isRemote === 'true';
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      filter['salaryRange.currency'] = currency;
      if (minSalary && maxSalary) {
        filter.$or = [
          { 'salaryRange.min': { $gte: parseInt(minSalary) } },
          { 'salaryRange.max': { $lte: parseInt(maxSalary) } }
        ];
      } else if (minSalary) {
        filter['salaryRange.min'] = { $gte: parseInt(minSalary) };
      } else if (maxSalary) {
        filter['salaryRange.max'] = { $lte: parseInt(maxSalary) };
      }
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'salary') {
      sort['salaryRange.min'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const jobs = await JobPosting.find(filter)
      .populate('category', 'name description')
      .populate('employer', 'email profile.firstName profile.lastName profile.organization verificationBadge')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalJobs = await JobPosting.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get a specific job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findById(id)
      .populate('category', 'name description')
      .populate('employer', 'email profile.firstName profile.lastName profile.organization verificationBadge');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Increment view count
    await job.incrementViews();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// Update a job posting
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if job exists and user owns it
    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check ownership (only job owner or admin can update)
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // If category is being updated, verify it exists
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected'
        });
      }
    }

    const updatedJob = await JobPosting.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name description' },
      { path: 'employer', select: 'email profile.firstName profile.lastName' }
    ]);

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job posting',
      error: error.message
    });
  }
};

// Delete a job posting
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and user owns it
    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check ownership (only job owner or admin can delete)
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await JobPosting.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job posting',
      error: error.message
    });
  }
};

// Get jobs posted by current user
const getMyJobs = async (req, res) => {
  try {
    const {
      status,
      sortBy = 'postedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter
    const filter = { employer: req.user.id };
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await JobPosting.find(filter)
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalJobs = await JobPosting.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your jobs',
      error: error.message
    });
  }
};

// Update job status
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check ownership
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job.status = status;
    await job.save();

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      data: { job }
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  updateJobStatus
};
