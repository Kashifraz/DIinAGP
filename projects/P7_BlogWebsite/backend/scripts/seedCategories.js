import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

const categories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Articles about technology, programming, and software development'
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Tutorials and guides for web development, frontend, and backend'
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design, graphic design, and design principles'
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business strategies, entrepreneurship, and industry insights'
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Personal development, productivity, and lifestyle tips'
  },
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step guides and how-to articles'
  },
  {
    name: 'News',
    slug: 'news',
    description: 'Latest news and updates from the tech and business world'
  },
  {
    name: 'Reviews',
    slug: 'reviews',
    description: 'Product reviews, tool comparisons, and recommendations'
  }
];

const seedCategories = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting category seeding...\n');

    let created = 0;
    let skipped = 0;

    for (const categoryData of categories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ 
        $or: [
          { name: categoryData.name },
          { slug: categoryData.slug }
        ]
      });
      
      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create category
      const category = await Category.create(categoryData);
      created++;
      console.log(`✓ Created category: ${category.name} (${category.slug})`);
    }

    console.log(`\nSeeding completed!`);
    console.log(`Created: ${created} categories`);
    console.log(`Skipped: ${skipped} categories (already exist)`);
    console.log(`Total: ${categories.length} categories\n`);

    // List all categories
    const allCategories = await Category.find().sort({ name: 1 });
    console.log('All categories in database:');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

// Run seed function
seedCategories();

