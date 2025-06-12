const JobPosting = require('../models/JobPosting');
const Category = require('../models/Category');
const User = require('../models/User');

const seedJobs = async () => {
  try {
    console.log('Seeding job postings...');

    // Get categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('No categories found. Please seed categories first.');
      return;
    }

    // Get employers
    const employers = await User.find({ role: 'employer' });
    if (employers.length === 0) {
      console.log('No employers found. Please create employer accounts first.');
      return;
    }

    // Sample job data
    const jobData = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
        requirements: 'Bachelor\'s degree in Computer Science or related field. 5+ years of experience with React, Node.js, and MongoDB. Strong problem-solving skills and attention to detail.',
        responsibilities: 'Develop and maintain web applications. Collaborate with cross-functional teams. Write clean, maintainable code. Participate in code reviews and technical discussions.',
        location: 'San Francisco, CA',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryRange: {
          min: 120000,
          max: 180000,
          currency: 'USD'
        },
        category: categories[0]._id,
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
        company: {
          name: 'TechCorp Inc.',
          website: 'https://techcorp.com',
          description: 'A leading technology company focused on innovation and growth.'
        },
        isRemote: true,
        isUrgent: false,
        maxApplications: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        postedBy: employers[0]._id
      },
      {
        title: 'Marketing Manager',
        description: 'Join our marketing team to drive growth and brand awareness. You will lead marketing campaigns and work with various teams to achieve business objectives.',
        requirements: 'Bachelor\'s degree in Marketing or related field. 3+ years of marketing experience. Strong analytical and communication skills.',
        responsibilities: 'Develop and execute marketing strategies. Manage social media presence. Analyze campaign performance. Coordinate with sales and product teams.',
        location: 'New York, NY',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: {
          min: 70000,
          max: 95000,
          currency: 'USD'
        },
        category: categories[1] ? categories[1]._id : categories[0]._id,
        skills: ['Digital Marketing', 'Social Media', 'Analytics', 'Content Creation'],
        company: {
          name: 'Marketing Solutions LLC',
          website: 'https://marketingsolutions.com',
          description: 'A full-service marketing agency helping businesses grow.'
        },
        isRemote: false,
        isUrgent: true,
        maxApplications: 30,
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        postedBy: employers[0]._id
      },
      {
        title: 'Frontend Developer Intern',
        description: 'Great opportunity for students to gain real-world experience in frontend development. Work on exciting projects and learn from experienced developers.',
        requirements: 'Currently enrolled in Computer Science or related program. Basic knowledge of HTML, CSS, and JavaScript. Eager to learn and grow.',
        responsibilities: 'Assist in developing user interfaces. Learn modern frontend frameworks. Participate in team meetings and code reviews.',
        location: 'Austin, TX',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryRange: {
          min: 20,
          max: 25,
          currency: 'USD'
        },
        category: categories[0]._id,
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        company: {
          name: 'StartupXYZ',
          website: 'https://startupxyz.com',
          description: 'An innovative startup building the future of technology.'
        },
        isRemote: false,
        isUrgent: false,
        maxApplications: 20,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        postedBy: employers[1] ? employers[1]._id : employers[0]._id
      },
      {
        title: 'DevOps Engineer',
        description: 'We need a DevOps engineer to help us scale our infrastructure and improve our deployment processes. You will work with cloud technologies and automation tools.',
        requirements: 'Bachelor\'s degree in Computer Science or related field. 3+ years of DevOps experience. Experience with AWS, Docker, and Kubernetes.',
        responsibilities: 'Manage cloud infrastructure. Automate deployment processes. Monitor system performance. Ensure system reliability and security.',
        location: 'Seattle, WA',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: {
          min: 100000,
          max: 140000,
          currency: 'USD'
        },
        category: categories[0]._id,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
        company: {
          name: 'CloudTech Solutions',
          website: 'https://cloudtech.com',
          description: 'Leading provider of cloud infrastructure solutions.'
        },
        isRemote: true,
        isUrgent: false,
        maxApplications: 40,
        expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        postedBy: employers[0]._id
      },
      {
        title: 'UX/UI Designer',
        description: 'Join our design team to create beautiful and functional user experiences. You will work on various projects and collaborate with developers and product managers.',
        requirements: 'Bachelor\'s degree in Design or related field. 2+ years of UX/UI design experience. Proficiency in Figma, Sketch, or Adobe Creative Suite.',
        responsibilities: 'Design user interfaces and experiences. Create wireframes and prototypes. Conduct user research and testing. Collaborate with cross-functional teams.',
        location: 'Los Angeles, CA',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: {
          min: 75000,
          max: 105000,
          currency: 'USD'
        },
        category: categories[2] ? categories[2]._id : categories[0]._id,
        skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
        company: {
          name: 'Design Studio Pro',
          website: 'https://designstudiopro.com',
          description: 'A creative design studio specializing in digital experiences.'
        },
        isRemote: true,
        isUrgent: false,
        maxApplications: 25,
        expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        postedBy: employers[1] ? employers[1]._id : employers[0]._id
      }
    ];

    // Clear existing jobs
    await JobPosting.deleteMany({});

    // Create jobs
    const jobs = await JobPosting.insertMany(jobData);

    console.log(`✅ Created ${jobs.length} job postings`);
    console.log('Job postings seeded successfully!');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};

module.exports = seedJobs;

