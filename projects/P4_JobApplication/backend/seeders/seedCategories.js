const Category = require('../models/Category');

const categories = [
  {
    name: 'Software Development',
    description: 'Jobs related to software development, programming, and technical roles'
  },
  {
    name: 'Marketing',
    description: 'Marketing, advertising, and promotional roles'
  },
  {
    name: 'Sales',
    description: 'Sales, business development, and customer acquisition roles'
  },
  {
    name: 'Human Resources',
    description: 'HR, recruitment, and people management roles'
  },
  {
    name: 'Finance',
    description: 'Financial analysis, accounting, and financial management roles'
  },
  {
    name: 'Design',
    description: 'Graphic design, UI/UX design, and creative roles'
  },
  {
    name: 'Operations',
    description: 'Operations management, logistics, and administrative roles'
  },
  {
    name: 'Customer Service',
    description: 'Customer support, service, and client relations roles'
  },
  {
    name: 'Healthcare',
    description: 'Medical, healthcare, and wellness industry roles'
  },
  {
    name: 'Education',
    description: 'Teaching, training, and educational roles'
  }
];

const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    
    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    
    console.log(`✅ Seeded ${createdCategories.length} categories successfully`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;
