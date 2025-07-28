# 🚀 LMS Deployment Guide for Render

## Prerequisites
- GitHub account
- MongoDB Atlas account (already set up)
- Render account (free)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 2: MongoDB Atlas Configuration

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Network Access** → **Add IP Address**
3. **Enter**: `0.0.0.0/0` (Allow all IPs)
4. **Comment**: "Render Deployment"
5. **Confirm**

## Step 3: Deploy Backend on Render

1. **Go to Render**: https://render.com/
2. **Sign up/Login** with GitHub
3. **New** → **Web Service**
4. **Connect your GitHub repository**
5. **Configure**:
   - **Name**: `lms-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

6. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://ojterry339:ojterry@cluster0.rzqbn1p.mongodb.net/lms?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-very-secure
   CLIENT_URL=https://your-frontend-url.onrender.com
   ```

7. **Deploy**

## Step 4: Deploy Frontend on Render

1. **New** → **Static Site**
2. **Connect same GitHub repository**
3. **Configure**:
   - **Name**: `lms-frontend`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy**

## Step 5: Update CORS Settings

After deployment, update your backend's CORS settings with the frontend URL.

## Step 6: Test Your Deployment

1. **Visit your frontend URL**
2. **Login with**: ojterry@gmail.com / terry2000
3. **Test all features**:
   - Article upload/download
   - Course creation
   - Calendar events
   - User management

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **Database connection**: Verify MongoDB Atlas IP whitelist
3. **CORS errors**: Update CLIENT_URL in backend environment
4. **File uploads**: Render has ephemeral storage, consider cloud storage for production

### Logs:
- Check Render dashboard for build and runtime logs
- Use `console.log` for debugging

## Production Considerations

1. **File Storage**: Consider AWS S3 or Cloudinary for file uploads
2. **Environment Secrets**: Use Render's secret management
3. **Custom Domain**: Add your own domain in Render settings
4. **SSL**: Automatically provided by Render
5. **Monitoring**: Set up health checks and alerts

## Your Admin Credentials

- **Email**: ojterry@gmail.com
- **Password**: terry2000
- **Role**: Admin (Full Access)

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Check CORS settings
