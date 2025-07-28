require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 Your Public IP should be: 129.0.205.120');
console.log('📍 Connection String:', process.env.MONGODB_URI ? 'Found' : 'Missing');

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect to MongoDB Atlas...');
    console.log('⏰ Timeout set to 15 seconds...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferCommands: false
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔌 Ready State:', conn.connection.readyState);

    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);

    await mongoose.connection.close();
    console.log('🔒 Connection closed successfully');
    console.log('\n🎉 SUCCESS! Your MongoDB connection is working!');
    console.log('🔄 Now restart your main server with: npm start');

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('📝 Error message:', error.message);
    console.error('🔍 Error code:', error.code);

    if (error.message.includes('timed out') || error.message.includes('timeout')) {
      console.log('\n🔧 IP WHITELIST ISSUE:');
      console.log('Your IP 129.0.205.120 is likely not whitelisted yet.');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Network Access → Add IP Address');
      console.log('3. Enter: 129.0.205.120 OR click "Add Current IP Address"');
      console.log('4. Wait 3-5 minutes for changes to propagate');
      console.log('5. Try this test again');
    }

    if (error.message.includes('authentication')) {
      console.log('\n🔧 AUTHENTICATION ISSUE:');
      console.log('1. Check your username and password in .env file');
      console.log('2. Make sure the database user exists in MongoDB Atlas');
    }

    console.log('\n⚡ QUICK FIX: Try adding 0.0.0.0/0 to Network Access (temporarily)');
  }
}

testConnection();
