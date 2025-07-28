const fs = require('fs');
const path = require('path');

console.log('🔧 LMS Environment Setup\n');

// Check if .env file already exists
const envPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists in server directory');
  console.log('   If you want to create a new one, delete the existing file first.\n');
} else {
  // Create .env file with default values
  const envContent = `# MongoDB Connection String
# Replace with your MongoDB Atlas connection string or local MongoDB URI
MONGODB_URI=mongodb://localhost:27017/lms

# JWT Secret Key (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt

# Example MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lms?retryWrites=true&w=majority
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created server/.env file with default values');
  console.log('   Please update MONGODB_URI with your MongoDB connection string\n');
}

console.log('📋 Next Steps:');
console.log('1. Set up MongoDB (see MONGODB_SETUP.md for options)');
console.log('2. Update server/.env with your MongoDB connection string');
console.log('3. Start the server: cd server && npm start');
console.log('4. Start the client: cd client && npm start');
console.log('5. Test the article approval system\n');

console.log('🚀 Quick MongoDB Atlas Setup:');
console.log('1. Go to https://www.mongodb.com/atlas');
console.log('2. Create free account and cluster');
console.log('3. Get connection string and update MONGODB_URI in server/.env');
console.log('4. Start the application\n');

console.log('📖 For detailed setup instructions, see MONGODB_SETUP.md'); 