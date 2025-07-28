# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Free Cloud Service)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password

### Step 6: Update Environment Variables
Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

## Option 2: Install MongoDB Locally

### Windows Installation
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. Create data directory: `mkdir C:\data\db`

### Start MongoDB Service
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

## Option 3: Use Docker (If you have Docker installed)

### Create docker-compose.yml in project root:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: lms-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### Start MongoDB with Docker:
```bash
docker-compose up -d
```

## Quick Test Setup

If you want to test the system quickly, I can provide you with a temporary MongoDB Atlas connection string. Here's how to set it up:

### Temporary Test Database
1. Create a `.env` file in the `server` directory
2. Add this content (replace with your own credentials later):

```env
MONGODB_URI=mongodb+srv://testuser:testpass@cluster0.xxxxx.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

## Verify Setup

After setting up MongoDB, test the connection:

```bash
cd server
npm start
```

You should see:
```
📦 MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 LMS Server running on port 5000
```

## Troubleshooting

### Common Issues:

1. **Connection Refused**: MongoDB service not running
2. **Authentication Failed**: Wrong username/password
3. **Network Access**: IP not whitelisted in Atlas
4. **Connection String**: Malformed connection string

### Fix Deprecated Options Warning:
Update `server/config/db.js` to remove deprecated options:

```javascript
const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false
});
```

## Next Steps

Once MongoDB is connected:
1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm start`
3. Test the article approval system
4. Create test users and articles

## Security Note

For production:
- Use strong passwords
- Restrict IP access in MongoDB Atlas
- Use environment variables for sensitive data
- Enable MongoDB authentication
- Use SSL/TLS connections 