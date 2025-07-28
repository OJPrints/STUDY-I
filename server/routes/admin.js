const express = require('express');
const Article = require('../models/Article');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalArticles,
      pendingArticles,
      approvedArticles,
      rejectedArticles,
      totalInstructors,
      totalStudents,
      recentArticles
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Article.countDocuments(),
      Article.countDocuments({ status: 'pending' }),
      Article.countDocuments({ status: 'approved' }),
      Article.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'instructor', isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      Article.find({ status: 'approved' })
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate monthly growth (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthArticles = await Article.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    const stats = {
      totalUsers,
      totalArticles,
      pendingArticles,
      approvedArticles,
      rejectedArticles,
      totalInstructors,
      totalStudents,
      monthlyGrowth: lastMonthArticles,
      recentArticles
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching dashboard statistics' 
    });
  }
});

// GET /api/admin/pending-articles - Get all pending articles for approval
router.get('/pending-articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', category = '' } = req.query;
    
    const query = { status: 'pending' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'firstName lastName email department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + articles.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching pending articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching pending articles' 
    });
  }
});

// GET /api/admin/approved-articles - Get all approved articles
router.get('/approved-articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', category = '' } = req.query;
    
    const query = { status: 'approved' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'firstName lastName email department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ approvedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + articles.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching approved articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching approved articles' 
    });
  }
});

// GET /api/admin/rejected-articles - Get all rejected articles
router.get('/rejected-articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', category = '' } = req.query;
    
    const query = { status: 'rejected' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'firstName lastName email department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ approvedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + articles.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching rejected articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching rejected articles' 
    });
  }
});

// PATCH /api/admin/articles/:id/approve - Approve an article
router.patch('/articles/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    if (article.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Article is not in pending status' 
      });
    }

    await article.approve(req.user._id);

    // Populate author and approver info for response
    await article.populate('author', 'firstName lastName email');
    await article.populate('approvedBy', 'firstName lastName');

    res.json({ 
      success: true, 
      message: 'Article approved successfully',
      article 
    });
  } catch (error) {
    console.error('Error approving article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error approving article' 
    });
  }
});

// PATCH /api/admin/articles/:id/reject - Reject an article
router.patch('/articles/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    if (article.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Article is not in pending status' 
      });
    }

    await article.reject(req.user._id, reason.trim());

    // Populate author and approver info for response
    await article.populate('author', 'firstName lastName email');
    await article.populate('approvedBy', 'firstName lastName');

    res.json({ 
      success: true, 
      message: 'Article rejected successfully',
      article 
    });
  } catch (error) {
    console.error('Error rejecting article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error rejecting article' 
    });
  }
});

// PATCH /api/admin/articles/:id/review - Change article status back to pending for review
router.patch('/articles/:id/review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    if (article.status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Article is already in pending status' 
      });
    }

    article.status = 'pending';
    article.approvedBy = undefined;
    article.approvedAt = undefined;
    article.rejectionReason = undefined;
    await article.save();

    // Populate author info for response
    await article.populate('author', 'firstName lastName email');

    res.json({ 
      success: true, 
      message: 'Article sent back for review',
      article 
    });
  } catch (error) {
    console.error('Error sending article for review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error sending article for review' 
    });
  }
});

// GET /api/admin/all-articles - Get all articles for admin review
router.get('/all-articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', department = '', category = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'firstName lastName email department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + articles.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching all articles' 
    });
  }
});

// GET /api/admin/users - Get all users with filtering and pagination
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      department = '', 
      status = '' 
    } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching users' 
    });
  }
});

// PATCH /api/admin/users/:id/verify - Verify a user account
router.patch('/users/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'User verified successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error verifying user' 
    });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be student, instructor, or admin' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot change your own role' 
      });
    }

    user.role = role;
    await user.save();

    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating user role' 
    });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user active status
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot deactivate your own account' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating user status' 
    });
  }
});

// DELETE /api/admin/users/:id - Delete a user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      newUsers,
      newArticles,
      approvedArticles,
      rejectedArticles,
      totalViews,
      totalDownloads
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: daysAgo } }),
      Article.countDocuments({ createdAt: { $gte: daysAgo } }),
      Article.countDocuments({ 
        status: 'approved', 
        approvedAt: { $gte: daysAgo } 
      }),
      Article.countDocuments({ 
        status: 'rejected', 
        approvedAt: { $gte: daysAgo } 
      }),
      Article.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: null, total: { $sum: '$stats.views' } } }
      ]),
      Article.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: null, total: { $sum: '$stats.downloads' } } }
      ])
    ]);

    const analytics = {
      period: parseInt(period),
      newUsers,
      newArticles,
      approvedArticles,
      rejectedArticles,
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      approvalRate: newArticles > 0 ? (approvedArticles / newArticles * 100).toFixed(1) : 0
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching analytics' 
    });
  }
});

// GET /api/admin/all-articles - Get all articles for admin management
router.get('/all-articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', category = '', status = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = department;
    if (category) query.category = category;
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'firstName lastName email department')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + articles.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching all articles' 
    });
  }
});

module.exports = router; 

