const mongoose = require('mongoose');
require('dotenv').config();
const { seedTemplates } = require('./seeders/templateSeeder');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    console.log('Starting template seeding...');
    await connectDB();
    await seedTemplates();
    console.log('Template seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Template seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
