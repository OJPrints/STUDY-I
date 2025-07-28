# Learning Management System (LMS)

A comprehensive Learning Management System built with React, Node.js, and MongoDB, featuring real-time chat, article management, and role-based access control.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - Role-based access (Admin, Instructor, Student)
  - JWT-based authentication
  - Password reset functionality
  - Profile management

- **Article Management**
  - Create, edit, and publish articles
  - File upload support (PDF, DOC, DOCX, TXT)
  - Admin approval workflow
  - Article ratings and comments
  - Search and filtering

- **Real-time Chat & Discussions**
  - Department-based chat rooms
  - File sharing in conversations
  - Message reactions and replies
  - User presence indicators
  - Real-time notifications

- **Dashboard & Analytics**
  - Personalized user dashboards
  - System statistics for admins
  - Activity tracking
  - Progress monitoring

- **Admin Panel**
  - User management
  - Article approval workflow
  - Department management
  - System settings
  - Analytics and reporting

### Technical Features
- **Frontend**: React with modern hooks and context
- **Backend**: Node.js/Express with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live chat and notifications
- **Security**: Helmet, rate limiting, input sanitization
- **UI/UX**: Responsive design with brown color palette
- **File Handling**: Multer for file uploads

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lms
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/lms
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Email Configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📁 Project Structure

```
lms/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/
│   │   │   ├── admin/     # Admin panel components
│   │   │   ├── articles/  # Article management
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── chat/      # Real-time chat
│   │   │   └── dashboard/ # User dashboard
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── socket/            # Socket.IO handlers
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management (create, edit, suspend)
- Article approval/rejection
- Department management
- System settings and analytics

### Instructor
- Create and edit articles
- Manage own articles
- Participate in department discussions
- View student progress (if applicable)

### Student
- View approved articles
- Participate in discussions
- Download articles (if allowed)
- Access personalized dashboard

## 🎨 Design System

The application uses a consistent brown color palette:

```css
--primary-brown: #8B4513;
--secondary-brown: #A0522D;
--light-brown: #DEB887;
--tan: #D2B48C;
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/reset-password` - Password reset

### Articles
- `GET /api/articles` - Get articles
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/approve` - Approve article
- `POST /api/articles/:id/reject` - Reject article

### Chat
- `GET /api/chat` - Get chat rooms
- `POST /api/chat` - Create chat room
- `GET /api/chat/:id/messages` - Get messages
- `POST /api/chat/:id/messages` - Send message

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/suspend` - Suspend user

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
```

### Backend Deployment
```bash
cd server
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a production MongoDB instance
- Configure proper JWT secrets
- Set up email service credentials
- Configure CORS for production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
- Update dependencies regularly
- Monitor MongoDB performance
- Review and rotate JWT secrets
- Backup database regularly
- Monitor system logs

### Security Considerations
- Keep all dependencies updated
- Use environment variables for sensitive data
- Implement proper input validation
- Monitor for security vulnerabilities
- Regular security audits

---

**Built with ❤️ using React, Node.js, and MongoDB** 