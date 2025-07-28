import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserShield, 
  FaBook, 
  FaUsers, 
  FaCheckCircle, 
  FaTimes, 
  FaEye,
  FaEdit,
  FaSearch,
  FaChartLine,
  FaCog,
  FaBell,
  FaClock,
  FaFileAlt,
  FaUserGraduate,
  FaUserTie,
  FaExclamationTriangle,
  FaCalendar,
  FaDollarSign,
  FaDownload,
  FaUndo,
  FaBan,
  FaShieldAlt,
  FaStar,
  FaCheck,
  FaSyncAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../Footer';
import * as adminService from '../../services/adminService';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('review');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [rejectedItems, setRejectedItems] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingArticles: 0,
    approvedArticles: 0,
    rejectedArticles: 0,
    totalInstructors: 0,
    totalStudents: 0,
    monthlyGrowth: 0
  });

  // Load all articles for review
  const [allArticles, setAllArticles] = useState([]);
  const loadAllArticles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllArticlesForAdmin();
      setAllArticles(response.articles);
    } catch (error) {
      setError('Failed to load articles for review');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setPlatformStats(response.stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Load pending articles
  const loadPendingArticles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingArticles();
      setPendingApprovals(response.articles);
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
      const response = await adminService.getApprovedArticles();
      setApprovedItems(response.articles);
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
      const response = await adminService.getRejectedArticles();
      setRejectedItems(response.articles);
    } catch (error) {
      console.error('Error loading rejected articles:', error);
      setError('Failed to load rejected articles');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardStats();
    loadPendingArticles();
    loadAllArticles();
  }, []);

  const handleApproval = async (itemId, action) => {
    try {
      if (action === 'approve') {
        await adminService.approveArticle(itemId);
      } else if (action === 'reject') {
        await adminService.rejectArticle(itemId, 'Content does not meet platform standards.');
      }
      
      // Refresh data
      loadPendingArticles();
      loadDashboardStats();
      setError(null);
    } catch (error) {
      console.error('Error handling approval:', error);
      setError(error.message || 'Failed to process approval');
    }
  };

  const handleDeleteApproved = (itemId) => {
    setApprovedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--gray-500)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApprovals = pendingApprovals.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'approved': return <FaCheckCircle />;
      case 'rejected': return <FaTimes />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Add this function to refresh all data
  const refreshAllData = () => {
    loadDashboardStats();
    loadPendingArticles();
    loadApprovedArticles();
    loadRejectedArticles();
    loadAllArticles();
  };

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Hello, OJ!! Great you are Back!!</h1>
            <p>Terry you got much work here; approve content, and oversee user activities</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <FaUsers />
              <span>{platformStats.totalUsers} Users</span>
            </div>
            <div className="stat-item">
              <FaBook />
              <span>{platformStats.totalArticles} Articles</span>
            </div>
            <div className="stat-item">
              <FaClock />
              <span>{platformStats.pendingArticles} Pending</span>
            </div>
            <div className="stat-item">
              <FaChartLine />
              <span>{platformStats.monthlyGrowth} New</span>
            </div>
            {/* Refresh Button */}
            <button
              className="refresh-btn"
              title="Refresh Data"
              onClick={refreshAllData}
              style={{ marginLeft: 16, padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <FaSyncAlt style={{ marginRight: 4 }} /> Refresh
            </button>
          </div>
        </div>
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

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        {user && user.role === 'admin' && (
          <button 
            className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            <FaCheckCircle />
            Review Approvals ({platformStats.pendingArticles})
          </button>
        )}
        <button 
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <FaCheckCircle />
          Approved ({platformStats.approvedArticles})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <FaTimes />
          Rejected ({platformStats.rejectedArticles})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine />
          Analytics
        </button>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* All content sections below use a single full-width grid */}
        {activeTab === 'review' && (
          <motion.div className="approvals-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="articles-grid full-width">
              {allArticles.map((article) => (
                <motion.div key={article._id} className={`article-card ${getStatusColor(article.status)}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="article-header">
                    <div className="article-status">
                      {getStatusIcon(article.status)}
                      <span>{article.status === 'pending' ? 'Pending' : article.status.charAt(0).toUpperCase() + article.status.slice(1)}</span>
                    </div>
                  </div>
                  <div className="article-content">
                    <h3>{article.title}</h3>
                    <p className="author">by {article.author?.firstName} {article.author?.lastName}</p>
                    <p className="description">{article.description}</p>
                    <div className="article-meta">
                      <div className="meta-item"><FaCalendar /> <span>Submitted: {formatDate(article.createdAt)}</span></div>
                      <div className="meta-item"><FaFileAlt /> <span>Category: {article.category}</span></div>
                      <div className="meta-item"><FaUserGraduate /> <span>Department: {article.department}</span></div>
                      <div className="meta-item"><FaDownload /> <span>Size: {(article.fileSize / 1024 / 1024).toFixed(2)} MB</span></div>
                    </div>
                  </div>
                  <div className="article-actions">
                    {article.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproval(article._id, 'approve')}><FaCheck /> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleApproval(article._id, 'reject')}><FaTimes /> Reject</button>
                      </>
                    )}
                    {article.status === 'approved' && (
                      <span className="status-badge success">Approved</span>
                    )}
                    {article.status === 'rejected' && (
                      <span className="status-badge error">Rejected</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'approved' && (
          <motion.div 
            className="approved-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>Approved Content</h2>
              <p>Content that has been approved and is available on the platform</p>
            </div>
            <div className="approved-list full-width">
              {approvedItems.map((item) => (
                <div key={item._id} className="approved-card">
                  <div className="approved-info">
                    <h3>{item.title}</h3>
                    <p className="author">by {item.author?.firstName} {item.author?.lastName}</p>
                    <p className="description">{item.description}</p>
                    <div className="approved-meta">
                      <span className="approved-date">Approved: {formatDate(item.approvedAt)}</span>
                      <span className="category">{item.category}</span>
                      <span className="department">{item.department}</span>
                    </div>
                  </div>
                  <div className="approved-actions">
                    <button className="btn btn-outline btn-sm">
                      <FaEye />
                      View
                    </button>
                    <button className="btn btn-outline btn-sm">
                      <FaEdit />
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteApproved(item.id)}>
                      <FaTimes />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'rejected' && (
          <motion.div 
            className="rejected-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>Rejected Content</h2>
              <p>Content that has been rejected and requires revision</p>
            </div>
            <div className="rejected-list full-width">
              {rejectedItems.map((item) => (
                <div key={item._id} className="rejected-card">
                  <div className="rejected-info">
                    <h3>{item.title}</h3>
                    <p className="author">by {item.author?.firstName} {item.author?.lastName}</p>
                    <p className="description">{item.description}</p>
                    <div className="rejected-meta">
                      <span className="rejected-date">Rejected: {formatDate(item.approvedAt)}</span>
                      <span className="category">{item.category}</span>
                      <span className="department">{item.department}</span>
                    </div>
                    <div className="rejection-reason">
                      <strong>Reason:</strong> {item.rejectionReason}
                    </div>
                  </div>
                  <div className="rejected-actions">
                    <button className="btn btn-outline btn-sm">
                      <FaEye />
                      View
                    </button>
                    <button className="btn btn-primary btn-sm">
                      <FaEdit />
                      Request Revision
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div 
            className="analytics-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <h2>Platform Analytics</h2>
              <p>Comprehensive overview of platform performance and user engagement</p>
            </div>
            <div className="analytics-grid full-width">
              <div className="analytics-card">
                <div className="analytics-icon">
                  <FaUsers />
                </div>
                <div className="analytics-content">
                  <h3>User Growth</h3>
                  <div className="analytics-value">{platformStats.totalUsers}</div>
                  <div className="analytics-change positive">
                    +{platformStats.monthlyGrowth}% this month
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-icon">
                  <FaBook />
                </div>
                <div className="analytics-content">
                  <h3>Published Articles</h3>
                  <div className="analytics-value">{platformStats.totalArticles}</div>
                  <div className="analytics-change positive">
                    +{platformStats.monthlyGrowth} this month
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-icon">
                  <FaUserTie />
                </div>
                <div className="analytics-content">
                  <h3>Active Instructors</h3>
                  <div className="analytics-value">{platformStats.totalInstructors}</div>
                  <div className="analytics-change positive">
                    Active contributors
                  </div>
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-icon">
                  <FaClock />
                </div>
                <div className="analytics-content">
                  <h3>Pending Approvals</h3>
                  <div className="analytics-value">{platformStats.pendingArticles}</div>
                  <div className="analytics-change neutral">
                    Awaiting review
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminPanel; 