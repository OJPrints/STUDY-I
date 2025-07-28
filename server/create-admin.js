require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdminAccount() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'ojterry@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔑 Role:', existingAdmin.role);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated role to admin');
      }
    } else {
      // Create new admin account
      console.log('🆕 Creating new admin account...');
      
      const adminUser = new User({
        firstName: 'OJ',
        lastName: 'Terry',
        email: 'ojterry@gmail.com',
        password: 'terry2000', // This will be hashed automatically by the User model
        department: 'computer-science',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email: ojterry@gmail.com');
      console.log('🔑 Password: terry2000');
      console.log('👤 Role: admin');
    }

    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    console.log('\n🎉 You can now login with:');
    console.log('📧 Email: ojterry@gmail.com');
    console.log('🔑 Password: terry2000');
    console.log('🚀 Role: Admin (Full Access)');

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    
    if (error.code === 11000) {
      console.log('⚠️  Account with this email already exists');
    }
    
    process.exit(1);
  }
}

console.log('🔧 Creating Admin Account for Production...');
console.log('📧 Email: ojterry@gmail.com');
console.log('🔑 Password: terry2000');
console.log('👤 Role: admin');
console.log('');

createAdminAccount();
