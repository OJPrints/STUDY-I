# Article Approval System Documentation

## Overview

The LMS now includes a comprehensive article approval system that ensures content quality and proper distribution across different user roles. This system allows instructors to submit articles, admins to review and approve them, and students to access only approved content.

## System Architecture

### User Roles and Permissions

1. **Students**
   - Can view only approved articles
   - Can download approved articles (if downloads are enabled)
   - Cannot create or edit articles

2. **Instructors**
   - Can create and submit articles
   - Can view their own articles (all statuses)
   - Can edit their own articles
   - Cannot approve articles

3. **Admins**
   - Can view all articles (pending, approved, rejected)
   - Can approve or reject articles
   - Can manage all content
   - Can view detailed analytics

## Article Status Flow

```
Draft → Pending → Approved/Rejected
```

1. **Draft**: Article is being worked on (not implemented in current version)
2. **Pending**: Article submitted, waiting for admin approval
3. **Approved**: Article approved and available to students
4. **Rejected**: Article rejected with reason

## API Endpoints

### Article Management

#### Create Article
```
POST /api/articles
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- title (required)
- description (required)
- content (required)
- department (required)
- category (required)
- tags (optional)
- pdf (required) - PDF file
- cover (optional) - Cover image
```

#### Get Approved Articles (for students)
```
GET /api/articles/approved
Authorization: Bearer <token>
```

#### Get My Articles (for instructors)
```
GET /api/articles/my-articles
Authorization: Bearer <token>
```

#### Download Article
```
GET /api/articles/:id/download
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get Pending Articles
```
GET /api/admin/pending-articles
Authorization: Bearer <token>
Query params: page, limit, search, department, category
```

#### Get Approved Articles
```
GET /api/admin/approved-articles
Authorization: Bearer <token>
Query params: page, limit, search, department, category
```

#### Get Rejected Articles
```
GET /api/admin/rejected-articles
Authorization: Bearer <token>
Query params: page, limit, search, department, category
```

#### Approve Article
```
PATCH /api/admin/articles/:id/approve
Authorization: Bearer <token>
```

#### Reject Article
```
PATCH /api/admin/articles/:id/reject
Authorization: Bearer <token>
Body: { reason: "Rejection reason" }
```

## Database Schema

### Article Model

```javascript
{
  title: String (required),
  description: String (required),
  content: String (required),
  author: ObjectId (ref: User, required),
  department: String (required, enum),
  category: String (required, enum),
  tags: [String],
  fileUrl: String (required),
  coverUrl: String (optional),
  fileName: String (required),
  fileSize: Number (required),
  fileType: String (required, enum),
  status: String (enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending'),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  rejectionReason: String,
  isPublic: Boolean (default: true),
  isFeatured: Boolean (default: false),
  stats: {
    views: Number (default: 0),
    downloads: Number (default: 0),
    likes: Number (default: 0),
    shares: Number (default: 0),
    rating: Number (default: 0),
    ratingCount: Number (default: 0)
  },
  ratings: [RatingSchema],
  comments: [CommentSchema],
  relatedArticles: [ObjectId],
  seo: {
    keywords: [String],
    metaDescription: String
  }
}
```

## Frontend Components

### ArticleManager Component
- **Location**: `client/src/components/articles/ArticleManager.js`
- **Purpose**: Main interface for article management
- **Features**:
  - Create new articles with file upload
  - Edit existing articles
  - View articles based on user role
  - Bulk actions for admins
  - Search and filter functionality

### AdminPanel Component
- **Location**: `client/src/components/admin/AdminPanel.js`
- **Purpose**: Admin interface for article approval
- **Features**:
  - View pending articles
  - Approve/reject articles
  - View approved and rejected articles
  - Dashboard statistics

### Dashboard Component
- **Location**: `client/src/components/dashboard/Dashboard.js`
- **Purpose**: Student view of approved articles
- **Features**:
  - Display approved articles only
  - Download functionality
  - Article metadata display

## File Upload System

### Supported File Types
- **PDF**: Primary document format
- **Images**: Cover images (JPEG, PNG, GIF)

### File Storage
- Files are stored in `server/uploads/` directory
- Files are served statically via `/uploads/` endpoint
- File names include timestamps to prevent conflicts

### Security
- File uploads are restricted to authenticated users
- File types are validated on both client and server
- File size limits are enforced

## Usage Examples

### Creating an Article (Instructor)

1. Navigate to Article Manager
2. Click "Create Article"
3. Fill in required fields:
   - Title
   - Description
   - Content
   - Department
   - Category
4. Upload PDF file
5. Optionally upload cover image
6. Submit

### Approving an Article (Admin)

1. Navigate to Admin Panel
2. Go to "Review Approvals" tab
3. View pending articles
4. Click "Approve" or "Reject"
5. If rejecting, provide reason

### Accessing Articles (Student)

1. Navigate to Dashboard
2. Go to "Articles" tab
3. Browse approved articles
4. Click download button to get PDF

## Error Handling

### Common Errors

1. **401 Unauthorized**: User not authenticated
2. **403 Forbidden**: User doesn't have required permissions
3. **404 Not Found**: Article doesn't exist
4. **400 Bad Request**: Missing required fields or invalid data
5. **413 Payload Too Large**: File too large
6. **415 Unsupported Media Type**: Invalid file type

### Error Responses

```javascript
{
  success: false,
  message: "Error description",
  errors: ["Detailed error messages"] // Optional
}
```

## Testing

Run the test script to verify the system:

```bash
node test-article-system.js
```

This will test:
- User registration
- Article creation
- Article approval flow
- Download functionality

## Configuration

### Environment Variables

```env
# Server configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-secret-key

# File upload limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt
```

### File Upload Configuration

```javascript
// Multer configuration in server/routes/articles.js
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + '-' + Date.now() + ext);
  }
});
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control
3. **File Validation**: File type and size validation
4. **Input Sanitization**: MongoDB injection prevention
5. **Rate Limiting**: API rate limiting to prevent abuse
6. **CORS**: Proper CORS configuration

## Performance Optimizations

1. **Database Indexing**: Indexes on frequently queried fields
2. **File Compression**: Static file compression
3. **Pagination**: Large result sets are paginated
4. **Caching**: Consider implementing Redis for caching
5. **CDN**: Consider using CDN for file delivery

## Future Enhancements

1. **Draft System**: Allow saving articles as drafts
2. **Version Control**: Track article versions
3. **Collaborative Editing**: Multiple authors per article
4. **Advanced Search**: Full-text search with filters
5. **Analytics**: Detailed usage analytics
6. **Notifications**: Email notifications for approvals
7. **Bulk Operations**: Bulk import/export functionality
8. **API Rate Limiting**: Per-user rate limiting
9. **File Preview**: PDF preview in browser
10. **Mobile Optimization**: Better mobile experience

## Troubleshooting

### Common Issues

1. **Files not uploading**: Check file size and type restrictions
2. **Articles not appearing**: Verify user role and article status
3. **Download not working**: Check file path and permissions
4. **Approval not working**: Verify admin privileges

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed error messages and request logs.

## Support

For issues or questions about the article approval system, please check:
1. Server logs for error details
2. Database connection status
3. File permissions on uploads directory
4. User authentication and role assignments 