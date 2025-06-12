const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@jobapp.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@jobapp.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      verificationBadge: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890'
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@jobapp.com');
    console.log('🔑 Password: admin123');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

module.exports = createAdminUser;

