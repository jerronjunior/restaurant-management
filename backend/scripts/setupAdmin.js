const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const setupAdmin = async () => {
  const apiUrl = process.env.API_URL || 'http://localhost:5000/api/auth/setup-admin';
  const setupKey = process.env.ADMIN_SETUP_KEY || 'admin-setup-2024';

  // Admin credentials to be created
  const adminData = {
    name: 'Restaurant Admin',
    email: 'admin@restaurant.com',
    password: 'Admin@123456',
    setupKey: setupKey
  };

  console.log('🔐 Creating Admin Account...');
  console.log('─'.repeat(50));
  console.log(`📧 Email: ${adminData.email}`);
  console.log(`👤 Name: ${adminData.name}`);
  console.log(`🔑 Password: ${adminData.password}`);
  console.log('─'.repeat(50));

  try {
    const response = await axios.post(apiUrl, adminData);

    if (response.data.success) {
      console.log('\n✅ Admin account created successfully!');
      console.log('─'.repeat(50));
      console.log('Admin Details:');
      console.log(`  ID: ${response.data.user.id}`);
      console.log(`  Name: ${response.data.user.name}`);
      console.log(`  Email: ${response.data.user.email}`);
      console.log(`  Role: ${response.data.user.role}`);
      console.log('─'.repeat(50));
      console.log('\n✨ You can now log in with these credentials at /admin/login');
    } else {
      console.log('\n❌ Failed to create admin account');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    if (error.response?.data?.message) {
      console.log('\n⚠️  ' + error.response.data.message);
      console.log('(Admin account may already exist)');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ Error: Cannot connect to backend server');
      console.log('Make sure the backend is running on http://localhost:5000');
    } else {
      console.log('\n❌ Error creating admin:', error.message);
    }
    process.exit(1);
  }
};

setupAdmin();
