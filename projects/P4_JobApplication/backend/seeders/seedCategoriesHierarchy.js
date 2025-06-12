const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    console.log('Starting category seeding...');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Define hierarchical categories
    const categoriesData = [
      // Level 0 - Main Categories
      {
        name: 'Technology',
        description: 'Software development, IT services, and technology-related positions',
        level: 0,
        sortOrder: 1,
        icon: 'laptop-code',
        color: '#007bff',
        metadata: {
          keywords: ['software', 'development', 'programming', 'IT'],
          tags: ['tech', 'coding', 'digital']
        }
      },
      {
        name: 'Healthcare',
        description: 'Medical, pharmaceutical, and healthcare services',
        level: 0,
        sortOrder: 2,
        icon: 'heart-pulse',
        color: '#dc3545',
        metadata: {
          keywords: ['medical', 'health', 'pharmacy', 'nursing'],
          tags: ['health', 'medical', 'care']
        }
      },
      {
        name: 'Finance',
        description: 'Banking, investment, accounting, and financial services',
        level: 0,
        sortOrder: 3,
        icon: 'chart-line',
        color: '#28a745',
        metadata: {
          keywords: ['banking', 'finance', 'accounting', 'investment'],
          tags: ['money', 'finance', 'banking']
        }
      },
      {
        name: 'Education',
        description: 'Teaching, training, and educational services',
        level: 0,
        sortOrder: 4,
        icon: 'graduation-cap',
        color: '#ffc107',
        metadata: {
          keywords: ['teaching', 'education', 'training', 'academic'],
          tags: ['education', 'teaching', 'learning']
        }
      },
      {
        name: 'Marketing',
        description: 'Digital marketing, advertising, and brand management',
        level: 0,
        sortOrder: 5,
        icon: 'bullhorn',
        color: '#fd7e14',
        metadata: {
          keywords: ['marketing', 'advertising', 'brand', 'digital'],
          tags: ['marketing', 'advertising', 'promotion']
        }
      },
      {
        name: 'Sales',
        description: 'Sales, business development, and customer relations',
        level: 0,
        sortOrder: 6,
        icon: 'handshake',
        color: '#6f42c1',
        metadata: {
          keywords: ['sales', 'business', 'customer', 'revenue'],
          tags: ['sales', 'business', 'customer']
        }
      },
      {
        name: 'Human Resources',
        description: 'HR, recruitment, and people management',
        level: 0,
        sortOrder: 7,
        icon: 'users',
        color: '#20c997',
        metadata: {
          keywords: ['HR', 'recruitment', 'people', 'management'],
          tags: ['HR', 'people', 'recruitment']
        }
      },
      {
        name: 'Operations',
        description: 'Operations management, logistics, and supply chain',
        level: 0,
        sortOrder: 8,
        icon: 'cogs',
        color: '#6c757d',
        metadata: {
          keywords: ['operations', 'logistics', 'supply', 'management'],
          tags: ['operations', 'logistics', 'management']
        }
      }
    ];

    // Create main categories
    const mainCategories = await Category.insertMany(categoriesData);
    console.log(`Created ${mainCategories.length} main categories`);

    // Level 1 - Subcategories
    const subcategoriesData = [
      // Technology subcategories
      {
        name: 'Software Development',
        description: 'Frontend, backend, full-stack development positions',
        parentCategory: mainCategories[0]._id,
        level: 1,
        sortOrder: 1,
        icon: 'code',
        color: '#007bff',
        metadata: {
          keywords: ['frontend', 'backend', 'fullstack', 'programming'],
          tags: ['development', 'coding', 'software']
        }
      },
      {
        name: 'Data Science',
        description: 'Data analysis, machine learning, and AI positions',
        parentCategory: mainCategories[0]._id,
        level: 1,
        sortOrder: 2,
        icon: 'chart-bar',
        color: '#007bff',
        metadata: {
          keywords: ['data', 'analytics', 'machine learning', 'AI'],
          tags: ['data', 'analytics', 'AI']
        }
      },
      {
        name: 'DevOps',
        description: 'Infrastructure, deployment, and system administration',
        parentCategory: mainCategories[0]._id,
        level: 1,
        sortOrder: 3,
        icon: 'server',
        color: '#007bff',
        metadata: {
          keywords: ['devops', 'infrastructure', 'deployment', 'cloud'],
          tags: ['devops', 'infrastructure', 'cloud']
        }
      },
      {
        name: 'Cybersecurity',
        description: 'Information security and network protection',
        parentCategory: mainCategories[0]._id,
        level: 1,
        sortOrder: 4,
        icon: 'shield-alt',
        color: '#007bff',
        metadata: {
          keywords: ['security', 'cybersecurity', 'network', 'protection'],
          tags: ['security', 'cybersecurity', 'protection']
        }
      },

      // Healthcare subcategories
      {
        name: 'Nursing',
        description: 'Registered nurses, nurse practitioners, and nursing assistants',
        parentCategory: mainCategories[1]._id,
        level: 1,
        sortOrder: 1,
        icon: 'user-nurse',
        color: '#dc3545',
        metadata: {
          keywords: ['nursing', 'RN', 'nurse practitioner', 'healthcare'],
          tags: ['nursing', 'healthcare', 'medical']
        }
      },
      {
        name: 'Physician',
        description: 'Doctors, specialists, and medical practitioners',
        parentCategory: mainCategories[1]._id,
        level: 1,
        sortOrder: 2,
        icon: 'user-md',
        color: '#dc3545',
        metadata: {
          keywords: ['doctor', 'physician', 'specialist', 'medical'],
          tags: ['doctor', 'medical', 'healthcare']
        }
      },
      {
        name: 'Pharmacy',
        description: 'Pharmacists and pharmacy technicians',
        parentCategory: mainCategories[1]._id,
        level: 1,
        sortOrder: 3,
        icon: 'pills',
        color: '#dc3545',
        metadata: {
          keywords: ['pharmacy', 'pharmacist', 'medication', 'drugs'],
          tags: ['pharmacy', 'medication', 'healthcare']
        }
      },

      // Finance subcategories
      {
        name: 'Banking',
        description: 'Commercial banking, investment banking, and financial services',
        parentCategory: mainCategories[2]._id,
        level: 1,
        sortOrder: 1,
        icon: 'university',
        color: '#28a745',
        metadata: {
          keywords: ['banking', 'financial services', 'investment', 'commercial'],
          tags: ['banking', 'finance', 'investment']
        }
      },
      {
        name: 'Accounting',
        description: 'Financial accounting, auditing, and bookkeeping',
        parentCategory: mainCategories[2]._id,
        level: 1,
        sortOrder: 2,
        icon: 'calculator',
        color: '#28a745',
        metadata: {
          keywords: ['accounting', 'auditing', 'bookkeeping', 'financial'],
          tags: ['accounting', 'finance', 'auditing']
        }
      },
      {
        name: 'Insurance',
        description: 'Insurance sales, underwriting, and claims management',
        parentCategory: mainCategories[2]._id,
        level: 1,
        sortOrder: 3,
        icon: 'umbrella',
        color: '#28a745',
        metadata: {
          keywords: ['insurance', 'underwriting', 'claims', 'risk'],
          tags: ['insurance', 'risk', 'claims']
        }
      }
    ];

    // Create subcategories
    const subcategories = await Category.insertMany(subcategoriesData);
    console.log(`Created ${subcategories.length} subcategories`);

    // Level 2 - Specialized categories
    const specializedData = [
      // Software Development specializations
      {
        name: 'Frontend Development',
        description: 'React, Vue, Angular, and UI/UX development',
        parentCategory: subcategories[0]._id,
        level: 2,
        sortOrder: 1,
        icon: 'desktop',
        color: '#007bff',
        metadata: {
          keywords: ['react', 'vue', 'angular', 'javascript', 'css'],
          tags: ['frontend', 'UI', 'UX', 'web']
        }
      },
      {
        name: 'Backend Development',
        description: 'Node.js, Python, Java, and server-side development',
        parentCategory: subcategories[0]._id,
        level: 2,
        sortOrder: 2,
        icon: 'database',
        color: '#007bff',
        metadata: {
          keywords: ['nodejs', 'python', 'java', 'api', 'server'],
          tags: ['backend', 'API', 'server', 'database']
        }
      },
      {
        name: 'Mobile Development',
        description: 'iOS, Android, and cross-platform mobile apps',
        parentCategory: subcategories[0]._id,
        level: 2,
        sortOrder: 3,
        icon: 'mobile-alt',
        color: '#007bff',
        metadata: {
          keywords: ['ios', 'android', 'react native', 'flutter', 'mobile'],
          tags: ['mobile', 'ios', 'android', 'apps']
        }
      },

      // Data Science specializations
      {
        name: 'Machine Learning',
        description: 'ML algorithms, model development, and AI implementation',
        parentCategory: subcategories[1]._id,
        level: 2,
        sortOrder: 1,
        icon: 'brain',
        color: '#007bff',
        metadata: {
          keywords: ['machine learning', 'AI', 'algorithms', 'models'],
          tags: ['ML', 'AI', 'algorithms', 'models']
        }
      },
      {
        name: 'Data Analytics',
        description: 'Business intelligence, reporting, and data visualization',
        parentCategory: subcategories[1]._id,
        level: 2,
        sortOrder: 2,
        icon: 'chart-pie',
        color: '#007bff',
        metadata: {
          keywords: ['analytics', 'BI', 'reporting', 'visualization'],
          tags: ['analytics', 'BI', 'reporting', 'data']
        }
      }
    ];

    // Create specialized categories
    const specialized = await Category.insertMany(specializedData);
    console.log(`Created ${specialized.length} specialized categories`);

    console.log('Category seeding completed successfully!');
    console.log(`Total categories created: ${mainCategories.length + subcategories.length + specialized.length}`);
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

const runSeeder = async () => {
  try {
    await connectDB();
    await seedCategories();
    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = { seedCategories };
