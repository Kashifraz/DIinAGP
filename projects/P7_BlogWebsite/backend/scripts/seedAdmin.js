import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blogplatform.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@blogplatform.com',
      password: 'Admin123!', // Will be hashed by pre-save hook
      name: 'Admin User',
      role: 'admin',
      bio: 'System administrator'
    });

    console.log('Admin user created successfully:');
    console.log({
      email: admin.email,
      name: admin.name,
      role: admin.role,
      _id: admin._id
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run seed function
seedAdmin();

