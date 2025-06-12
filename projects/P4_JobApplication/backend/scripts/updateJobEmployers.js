const mongoose = require('mongoose');
require('dotenv').config();
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

const updateJobEmployers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('📦 Connected to database');
    
    // Find all job postings without employer field
    const jobsWithoutEmployer = await JobPosting.find({ employer: { $exists: false } });
    
    console.log(`Found ${jobsWithoutEmployer.length} jobs without employer field`);
    
    if (jobsWithoutEmployer.length === 0) {
      console.log('✅ All jobs already have employer field');
      await mongoose.connection.close();
      return;
    }
    
    // For each job, try to find the employer
    for (const job of jobsWithoutEmployer) {
      console.log(`Processing job: ${job._id} - ${job.title}`);
      
      // Try to find employer by looking at users
      // This is a fallback if we can't determine the employer
      // You may need to manually set the employer for these jobs
      
      // Set employer to null for now, user will need to fix manually
      job.employer = null;
      await job.save();
      
      console.log(`⚠️  Job ${job._id} has no employer - needs manual assignment`);
    }
    
    // Now find all jobs that are listed in /my/jobs but don't have employer set
    // This happens when the employer field wasn't set at creation
    const allJobs = await JobPosting.find({});
    console.log(`Total jobs in database: ${allJobs.length}`);
    
    for (const job of allJobs) {
      if (!job.employer) {
        console.log(`Job ${job._id} (${job.title}) needs employer to be set manually`);
      }
    }
    
    console.log('✅ Update complete');
    
  } catch (error) {
    console.error('❌ Error updating job employers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  updateJobEmployers();
}

module.exports = updateJobEmployers;
