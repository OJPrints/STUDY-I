const express = require('express');
const Article = require('../models/Article');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer storage config
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

const upload = multer({ storage });

// GET /api/articles/approved - Get approved articles (public)
router.get('/approved', async (req, res) => {
  try {
    const approvedArticles = await Article.find({
      status: 'approved',
      isPublic: true
    })
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json({ success: true, articles: approvedArticles });
  } catch (error) {
    console.error('Error fetching approved articles:', error);

    // Return empty array if database is not available
    res.json({ success: true, articles: [] });
  }
});

// GET /api/articles/my-articles - Get articles by the current user
router.get('/my-articles', authenticateToken, async (req, res) => {
  try {
    const myArticles = await Article.find({ author: req.user._id })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, articles: myArticles });
  } catch (error) {
    console.error('Error fetching my articles:', error);
    res.status(500).json({ success: false, message: 'Server error fetching my articles' });
  }
});

// GET /api/articles/:id/download - Download article file
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Check if user can download (approved articles only)
    if (article.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Article not available for download' });
    }

    // Increment download count
    article.stats.downloads += 1;
    await article.save();

    // Send file
    const filePath = path.join(__dirname, '..', article.fileUrl);
    res.download(filePath, article.fileName);
  } catch (error) {
    console.error('Error downloading article:', error);
    res.status(500).json({ success: false, message: 'Server error downloading article' });
  }
});

// POST /api/articles - Upload a new book/article with cover and PDF
router.post('/', authenticateToken, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, content, department, category } = req.body;
    const author = req.user._id;
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    if (!title || !description || !content || !department || !category || !pdfFile) {
      return res.status(400).json({ success: false, message: 'Missing required fields or files.' });
    }

    const newArticle = new Article({
      title,
      description,
      content,
      author,
      department,
      category,
      fileUrl: `/uploads/${pdfFile.filename}`,
      coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '',
      fileName: pdfFile.originalname,
      fileSize: pdfFile.size,
      fileType: 'pdf',
      status: 'pending'
    });
    await newArticle.save();
    res.status(201).json({ success: true, article: newArticle });
  } catch (error) {
    console.error('Error uploading article:', error);
    res.status(500).json({ success: false, message: 'Server error uploading article.' });
  }
});

// PATCH /api/articles/:id/approve - Approve an article/book
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can approve articles' });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    article.status = 'approved';
    article.approvedBy = req.user._id;
    article.approvedAt = new Date();
    await article.save();

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error approving article:', error);
    res.status(500).json({ success: false, message: 'Server error approving article' });
  }
});

// PATCH /api/articles/:id/reject - Reject an article/book
router.patch('/:id/reject', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can reject articles' });
    }

    const { reason } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    article.status = 'rejected';
    article.rejectionReason = reason || 'Content does not meet platform standards';
    await article.save();

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error rejecting article:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting article' });
  }
});

// GET /api/articles/pending - Get all pending articles for admin approval
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can view pending articles' });
    }

    const pendingArticles = await Article.find({ status: 'pending' })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, articles: pendingArticles });
  } catch (error) {
    console.error('Error fetching pending articles:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pending articles' });
  }
});

module.exports = router; 



