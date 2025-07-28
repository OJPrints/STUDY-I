import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimes, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaSort,
  FaDownload,
  FaUser,
  FaBook,
  FaClock,
  FaExclamationTriangle,
  FaCheck,
  FaBan,
  FaUndo,
  FaTrash,
  FaEdit,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBell,
  FaCalendar,
  FaFileAlt,
  FaUserGraduate,
  FaUserTie,
  FaDollarSign,
  FaStar,
  FaEyeSlash,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../Footer';
import * as adminService from '../../services/adminService';
import './AdminApprovalPanel.css';

const AdminApprovalPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setDashboardStats(response.stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Load pending articles
  const loadPendingArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        department: filterDepartment,
        category: filterCategory
      };
      const response = await adminService.getPendingArticles(params);
      setPendingArticles(response.articles);
    } catch (error) {
      console.error('Error loading pending articles:', error);
      setError('Failed to load pending articles');
    } finally {
      setLoading(false);
    }
  };

  // Load approved articles
  const loadApprovedArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        department: filterDepartment,
        category: filterCategory
      };
      const response = await adminService.getApprovedArticles(params);
      setApprovedArticles(response.articles);
    } catch (error) {
      console.error('Error loading approved articles:', error);
      setError('Failed to load approved articles');
    } finally {
      setLoading(false);
    }
  };

  // Load rejected articles
  const loadRejectedArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        department: filterDepartment,
        category: filterCategory
      };
      const response = await adminService.getRejectedArticles(params);
      setRejectedArticles(response.articles);
    } catch (error) {
      console.error('Error loading rejected articles:', error);
      setError('Failed to load rejected articles');
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        role: filterRole,
        department: filterDepartment
      };
      const response = await adminService.getUsers(params);
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const response = await adminService.getAnalytics(30);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics');
    }
  };

  // Handle article approval
  const handleApprove = async (articleId) => {
    try {
      await adminService.approveArticle(articleId);
      // Refresh the current tab data
      if (activeTab === 'pending') {
        loadPendingArticles();
      }
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error approving article:', error);
      setError(error.message || 'Failed to approve article');
    }
  };

  // Handle article rejection
  const handleReject = async (articleId, reason) => {
    try {
      await adminService.rejectArticle(articleId, reason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
      // Refresh the current tab data
      if (activeTab === 'pending') {
        loadPendingArticles();
      }
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error rejecting article:', error);
      setError(error.message || 'Failed to reject article');
    }
  };

  // Handle send for review
  const handleSendForReview = async (articleId) => {
    try {
      await adminService.sendArticleForReview(articleId);
      // Refresh the current tab data
      if (activeTab === 'approved' || activeTab === 'rejected') {
        if (activeTab === 'approved') loadApprovedArticles();
        else loadRejectedArticles();
      }
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error sending article for review:', error);
      setError(error.message || 'Failed to send article for review');
    }
  };

  // Handle user verification
  const handleVerifyUser = async (userId) => {
    try {
      await adminService.verifyUser(userId);
      loadUsers();
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error verifying user:', error);
      setError(error.message || 'Failed to verify user');
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      loadUsers();
      setError(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(error.message || 'Failed to update user role');
    }
  };

  // Handle user status toggle
  const handleStatusToggle = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      loadUsers();
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError(error.message || 'Failed to update user status');
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    try {
      const result = await adminService.bulkApproveArticles(selectedItems);
      setSelectedItems([]);
      setShowBulkActions(false);
      loadPendingArticles();
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error bulk approving articles:', error);
      setError(error.message || 'Failed to bulk approve articles');
    }
  };

  const handleBulkReject = async () => {
    try {
      const result = await adminService.bulkRejectArticles(selectedItems, rejectReason);
      setSelectedItems([]);
      setShowBulkActions(false);
      setShowRejectModal(false);
      setRejectReason('');
      loadPendingArticles();
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error bulk rejecting articles:', error);
      setError(error.message || 'Failed to bulk reject articles');
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setFilterDepartment('');
    setFilterCategory('');
    setFilterRole('');
    setSelectedItems([]);
    setShowBulkActions(false);
    setError(null);
  };

  // Add this handler inside AdminApprovalPanel
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        loadUsers();
        setShowUserModal(false);
        setSelectedUser(null);
        setError(null);
      } catch (error) {
        setError(error.message || 'Failed to delete user');
      }
    }
  };

  // Load data based on active tab
  useEffect(() => {
    loadDashboardStats();
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingArticles();
    } else if (activeTab === 'approved') {
      loadApprovedArticles();
    } else if (activeTab === 'rejected') {
      loadRejectedArticles();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, currentPage, searchQuery, filterDepartment, filterCategory, filterRole]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'rejected': return <FaTimes />;
      default: return <FaClock />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-approval-panel">
        <div className="access-denied">
          <FaShieldAlt />
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-approval-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Hello, OJ!! Great you are Back!!</h1>
            <p>Terry you got much work here; approve content, and oversee user activities</p>
          </div>
          {dashboardStats && (
            <div className="header-stats">
              <div className="stat-item">
                <FaUsers />
                <span>{dashboardStats.totalUsers} Users</span>
              </div>
              <div className="stat-item">
                <FaBook />
                <span>{dashboardStats.totalArticles} Articles</span>
              </div>
              <div className="stat-item">
                <FaClock />
                <span>{dashboardStats.pendingArticles} Pending</span>
              </div>
              <div className="stat-item">
                <FaChartLine />
                <span>{dashboardStats.monthlyGrowth} New</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          <FaClock />
          Pending ({dashboardStats?.pendingArticles || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => handleTabChange('approved')}
        >
          <FaCheckCircle />
          Approved ({dashboardStats?.approvedArticles || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => handleTabChange('rejected')}
        >
          <FaTimes />
          Rejected ({dashboardStats?.rejectedArticles || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <FaUsers />
          Users ({dashboardStats?.totalUsers || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
        >
          <FaChartLine />
          Analytics
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FaExclamationTriangle />
          {error}
          <button onClick={() => setError(null)}>×</button>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="admin-content">
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            {activeTab !== 'users' && activeTab !== 'analytics' && (
              <>
                <select 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="arts">Arts</option>
                  <option value="science">Science</option>
                  <option value="medicine">Medicine</option>
                  <option value="law">Law</option>
                  <option value="education">Education</option>
                </select>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="research-paper">Research Paper</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="case-study">Case Study</option>
                  <option value="review">Review</option>
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="other">Other</option>
                </select>
              </>
            )}
            {activeTab === 'users' && (
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <motion.div 
            className="bulk-actions"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>{selectedItems.length} items selected</span>
            <div className="bulk-action-buttons">
              {activeTab === 'pending' && (
                <>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={handleBulkApprove}
                  >
                    <FaCheck />
                    Approve Selected
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <FaTimes />
                    Reject Selected
                  </button>
                </>
              )}
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedItems([]);
                  setShowBulkActions(false);
                }}
              >
                <FaTimes />
                Clear Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div 
              key="pending"
              className="content-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="articles-grid">
                {pendingArticles.map((article) => (
                  <motion.div 
                    key={article._id}
                    className={`article-card ${getStatusColor(article.status)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="article-header">
                      <div className="article-status">
                        {getStatusIcon(article.status)}
                        <span>Pending Approval</span>
                      </div>
                      <div className="article-actions">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(article._id)}
                          onChange={() => toggleItemSelection(article._id)}
                        />
                      </div>
                    </div>
                    
                    <div className="article-content">
                      <h3>{article.title}</h3>
                      <p className="author">by {article.author.firstName} {article.author.lastName}</p>
                      <p className="description">{article.description}</p>
                      
                      <div className="article-meta">
                        <div className="meta-item">
                          <FaCalendar />
                          <span>Submitted: {formatDate(article.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FaFileAlt />
                          <span>Category: {article.category}</span>
                        </div>
                        <div className="meta-item">
                          <FaUserGraduate />
                          <span>Department: {article.department}</span>
                        </div>
                        <div className="meta-item">
                          <FaDownload />
                          <span>Size: {(article.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="article-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedItem(article);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FaEye />
                        View Details
                      </button>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(article._id)}
                      >
                        <FaCheck />
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setSelectedItem(article);
                          setShowRejectModal(true);
                        }}
                      >
                        <FaTimes />
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'approved' && (
            <motion.div 
              key="approved"
              className="content-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="articles-grid">
                {approvedArticles.map((article) => (
                  <motion.div 
                    key={article._id}
                    className={`article-card ${getStatusColor(article.status)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="article-header">
                      <div className="article-status">
                        {getStatusIcon(article.status)}
                        <span>Approved</span>
                      </div>
                    </div>
                    
                    <div className="article-content">
                      <h3>{article.title}</h3>
                      <p className="author">by {article.author.firstName} {article.author.lastName}</p>
                      <p className="description">{article.description}</p>
                      
                      <div className="article-meta">
                        <div className="meta-item">
                          <FaCalendar />
                          <span>Approved: {formatDate(article.approvedAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FaUserTie />
                          <span>By: {article.approvedBy?.firstName} {article.approvedBy?.lastName}</span>
                        </div>
                        <div className="meta-item">
                          <FaFileAlt />
                          <span>Category: {article.category}</span>
                        </div>
                        <div className="meta-item">
                          <FaUserGraduate />
                          <span>Department: {article.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="article-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedItem(article);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FaEye />
                        View Details
                      </button>
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleSendForReview(article._id)}
                      >
                        <FaUndo />
                        Send for Review
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'rejected' && (
            <motion.div 
              key="rejected"
              className="content-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="articles-grid">
                {rejectedArticles.map((article) => (
                  <motion.div 
                    key={article._id}
                    className={`article-card ${getStatusColor(article.status)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="article-header">
                      <div className="article-status">
                        {getStatusIcon(article.status)}
                        <span>Rejected</span>
                      </div>
                    </div>
                    
                    <div className="article-content">
                      <h3>{article.title}</h3>
                      <p className="author">by {article.author.firstName} {article.author.lastName}</p>
                      <p className="description">{article.description}</p>
                      
                      <div className="article-meta">
                        <div className="meta-item">
                          <FaCalendar />
                          <span>Rejected: {formatDate(article.approvedAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FaUserTie />
                          <span>By: {article.approvedBy?.firstName} {article.approvedBy?.lastName}</span>
                        </div>
                        <div className="meta-item">
                          <FaExclamationTriangle />
                          <span>Reason: {article.rejectionReason}</span>
                        </div>
                        <div className="meta-item">
                          <FaFileAlt />
                          <span>Category: {article.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="article-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedItem(article);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FaEye />
                        View Details
                      </button>
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleSendForReview(article._id)}
                      >
                        <FaUndo />
                        Send for Review
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              className="content-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="users-grid">
                {users.map((user) => (
                  <motion.div 
                    key={user._id}
                    className={`user-card ${user.isActive ? 'active' : 'inactive'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="user-header">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.fullName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.initials}
                          </div>
                        )}
                      </div>
                      <div className="user-status">
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.isVerified && (
                          <span className="verified-badge">
                            <FaCheckCircle />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="user-content">
                      <h3>{user.fullName}</h3>
                      <p className="email">{user.email}</p>
                      <p className="role">{user.role}</p>
                      <p className="department">{user.department}</p>
                      
                      <div className="user-meta">
                        <div className="meta-item">
                          <FaCalendar />
                          <span>Joined: {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FaClock />
                          <span>Last Active: {formatDate(user.lastLogin)}</span>
                        </div>
                        {user.bio && (
                          <div className="meta-item">
                            <FaUser />
                            <span>{user.bio}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="user-actions">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                      >
                        <FaEye />
                        View Details
                      </button>
                      {!user.isVerified && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleVerifyUser(user._id)}
                        >
                          <FaCheck />
                          Verify
                        </button>
                      )}
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleStatusToggle(user._id)}
                      >
                        {user.isActive ? <FaBan /> : <FaCheck />}
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      {user._id !== user?.currentUserId && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              className="content-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {analytics && (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Platform Overview</h3>
                    <div className="analytics-stats">
                      <div className="stat-item">
                        <FaUsers />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.newUsers}</span>
                          <span className="stat-label">New Users ({analytics.period} days)</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaBook />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.newArticles}</span>
                          <span className="stat-label">New Articles ({analytics.period} days)</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaCheckCircle />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.approvedArticles}</span>
                          <span className="stat-label">Approved Articles</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaTimes />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.rejectedArticles}</span>
                          <span className="stat-label">Rejected Articles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>Engagement Metrics</h3>
                    <div className="analytics-stats">
                      <div className="stat-item">
                        <FaEye />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.totalViews}</span>
                          <span className="stat-label">Total Views</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaDownload />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.totalDownloads}</span>
                          <span className="stat-label">Total Downloads</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <FaStar />
                        <div className="stat-info">
                          <span className="stat-value">{analytics.approvalRate}%</span>
                          <span className="stat-label">Approval Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reject Article</h3>
              <button onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Please provide a reason for rejecting this article:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  if (selectedItems.length > 0) {
                    handleBulkReject();
                  } else if (selectedItem) {
                    handleReject(selectedItem._id, rejectReason);
                  }
                }}
                disabled={!rejectReason.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Article Details</h3>
              <button onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="article-details">
                <h2>{selectedItem.title}</h2>
                <p className="author">by {selectedItem.author.firstName} {selectedItem.author.lastName}</p>
                <p className="description">{selectedItem.description}</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status ${getStatusColor(selectedItem.status)}`}>
                      {getStatusIcon(selectedItem.status)}
                      {selectedItem.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Category:</strong>
                    <span>{selectedItem.category}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Department:</strong>
                    <span>{selectedItem.department}</span>
                  </div>
                  <div className="detail-item">
                    <strong>File Size:</strong>
                    <span>{(selectedItem.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="detail-item">
                    <strong>Submitted:</strong>
                    <span>{formatDate(selectedItem.createdAt)}</span>
                  </div>
                  {selectedItem.approvedAt && (
                    <div className="detail-item">
                      <strong>{selectedItem.status === 'approved' ? 'Approved' : 'Rejected'}:</strong>
                      <span>{formatDate(selectedItem.approvedAt)}</span>
                    </div>
                  )}
                  {selectedItem.rejectionReason && (
                    <div className="detail-item">
                      <strong>Rejection Reason:</strong>
                      <span>{selectedItem.rejectionReason}</span>
                    </div>
                  )}
                </div>
                
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="tags-section">
                    <strong>Tags:</strong>
                    <div className="tags">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              {selectedItem.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleApprove(selectedItem._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>User Details</h3>
              <button onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="user-details">
                <div className="user-header">
                  <div className="user-avatar large">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.fullName} />
                    ) : (
                      <div className="avatar-placeholder large">
                        {selectedUser.initials}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h2>{selectedUser.fullName}</h2>
                    <p className="email">{selectedUser.email}</p>
                    <div className="user-badges">
                      <span className={`role-badge ${selectedUser.role}`}>
                        {selectedUser.role}
                      </span>
                      <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {selectedUser.isVerified && (
                        <span className="verified-badge">
                          <FaCheckCircle />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Department:</strong>
                    <span>{selectedUser.department}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Joined:</strong>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Active:</strong>
                    <span>{formatDate(selectedUser.lastLogin)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Articles Read:</strong>
                    <span>{selectedUser.stats?.articlesRead || 0}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Articles Published:</strong>
                    <span>{selectedUser.stats?.articlesPublished || 0}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Hours Studied:</strong>
                    <span>{selectedUser.stats?.hoursStudied || 0}</span>
                  </div>
                </div>
                
                {selectedUser.bio && (
                  <div className="bio-section">
                    <strong>Bio:</strong>
                    <p>{selectedUser.bio}</p>
                  </div>
                )}
                
                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div className="interests-section">
                    <strong>Interests:</strong>
                    <div className="interests">
                      {selectedUser.interests.map((interest, index) => (
                        <span key={index} className="interest">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
              {!selectedUser.isVerified && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    handleVerifyUser(selectedUser._id);
                    setShowUserModal(false);
                  }}
                >
                  Verify User
                </button>
              )}
              {selectedUser._id !== user._id && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser(selectedUser._id)}
                >
                  <FaTrash />
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminApprovalPanel; 