require('dotenv').config();
const mongoose = require('mongoose');
const seedCategoriesHierarchy = require('../seeders/seedCategoriesHierarchy');
const createAdminUser = require('../seeders/seedAdmin');
const seedJobs = require('../seeders/seedJobs');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('📦 Connected to database');
    
    // Seed categories with hierarchy
    await seedCategoriesHierarchy.seedCategories();
    
    // Create admin user
    await createAdminUser();
    
    // Seed job postings
    await seedJobs();
    
    console.log('🎉 Database seeding completed successfully');
    
  } catch (error) {
    console.error('💥 Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
