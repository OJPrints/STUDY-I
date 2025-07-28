#!/bin/bash

# Build script for LMS deployment

echo "🚀 Building LMS for production..."

# Build backend
echo "📦 Installing backend dependencies..."
cd server
npm install --production
cd ..

# Build frontend
echo "🎨 Building frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Build complete!"
echo "📁 Frontend build files are in: client/build/"
echo "🔧 Backend is ready in: server/"
echo ""
echo "🌐 Ready for deployment to Render!"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
