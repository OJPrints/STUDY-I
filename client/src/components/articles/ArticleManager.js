import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaDownload, 
  FaSearch, 
  FaFileUpload,
  FaSave,
  FaTimes,
  FaCheck,
  FaClock,
  FaStar,
  FaUsers,
  FaBook,
  FaTag
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ArticleManager.css';

const ArticleManager = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    department: '',
    category: '',
    tags: [],
    isPublic: true,
    allowComments: true,
    allowDownloads: true,
    pdf: null,
    cover: null
  });

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Create axios instance with auth token
  const createAuthInstance = () => {
    const token = localStorage.getItem('token');
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  };

  // Fetch articles based on user role
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const authInstance = createAuthInstance();
      
      let endpoint = '/articles/approved';
      if (user.role === 'admin') {
        // Admin sees ALL articles for management
        endpoint = '/admin/all-articles';
      } else if (user.role === 'instructor') {
        endpoint = '/articles/my-articles';
      }
      
      const response = await authInstance.get(endpoint);
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add validation
    if (!formData.title || !formData.description || !formData.content || !formData.department || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!formData.pdf && !editingArticle) {
      setError('Please upload a PDF file');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('isPublic', formData.isPublic);
      formDataToSend.append('allowComments', formData.allowComments);
      formDataToSend.append('allowDownloads', formData.allowDownloads);
      
      // Add files
      if (formData.pdf) {
        formDataToSend.append('pdf', formData.pdf);
      }
      if (formData.cover) {
        formDataToSend.append('cover', formData.cover);
      }

      console.log('Submitting form data:', {
        title: formData.title,
        department: formData.department,
        category: formData.category,
        hasPdf: !!formData.pdf,
        hasCover: !!formData.cover
      });

      let response;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingArticle) {
        response = await axios.patch(`${API_BASE_URL}/articles/${editingArticle._id}`, formDataToSend, config);
      } else {
        response = await axios.post(`${API_BASE_URL}/articles`, formDataToSend, config);
      }
      
      console.log('Article saved successfully:', response.data);
      
      // Success actions
      await fetchArticles();
      setShowCreateForm(false);
      resetForm();
      setEditingArticle(null);
      setError(null);
      
    } catch (error) {
      console.error('Error saving article:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 413) {
        setError('File too large. Please upload a smaller file.');
      } else {
        setError(error.response?.data?.message || 'Failed to save article. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      department: '',
      category: '',
      tags: [],
      isPublic: true,
      allowComments: true,
      allowDownloads: true,
      pdf: null,
      cover: null
    });
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      department: article.department,
      category: article.category,
      tags: article.tags || [],
      isPublic: article.isPublic,
      allowComments: article.allowComments,
      allowDownloads: article.allowDownloads,
      pdf: null,
      cover: null
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const authInstance = createAuthInstance();
        await authInstance.delete(`/articles/${articleId}`);
        await fetchArticles();
      } catch (error) {
        console.error('Error deleting article:', error);
        setError('Failed to delete article');
      }
    }
  };

  const handleDownload = async (article) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.get(`/articles/${article._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', article.fileName || 'article.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading article:', error);
      setError('Failed to download article');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedArticles.length === 0) return;

    try {
      const authInstance = createAuthInstance();
      
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) {
            await Promise.all(selectedArticles.map(id => 
              authInstance.delete(`/articles/${id}`)
            ));
            await fetchArticles();
            setSelectedArticles([]);
            setShowBulkActions(false);
          }
          break;
        case 'approve':
          await Promise.all(selectedArticles.map(id => 
            authInstance.patch(`/articles/${id}/approve`)
          ));
          await fetchArticles();
          setSelectedArticles([]);
          setShowBulkActions(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  const toggleArticleSelection = (articleId) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  // Add approval handlers
  const handleApprove = async (articleId) => {
    try {
      const authInstance = createAuthInstance();
      await authInstance.patch(`/admin/articles/${articleId}/approve`);
      await fetchArticles();
      setError(null);
    } catch (error) {
      console.error('Error approving article:', error);
      setError('Failed to approve article');
    }
  };

  const handleReject = async (articleId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const authInstance = createAuthInstance();
      await authInstance.patch(`/admin/articles/${articleId}/reject`, { reason });
      await fetchArticles();
      setError(null);
    } catch (error) {
      console.error('Error rejecting article:', error);
      setError('Failed to reject article');
    }
  };

  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'views':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
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

  return (
    <div className="article-manager">
      {error && (
        <div className="error-banner" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      {loading && (
        <div className="loading-spinner" style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          Loading articles...
        </div>
      )}
      
      {/* Header */}
      <header className="article-manager-header">
        <div className="header-content">
          <h1>Article Manager</h1>
          <p>Create, edit, and manage your articles and publications</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingArticle(null);
              resetForm();
              setShowCreateForm(true);
            }}
          >
            <FaPlus />
            Create Article
          </button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="article-filters">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Date Created</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedArticles.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedArticles.length} articles selected</span>
          <div className="bulk-action-buttons">
            {user.role === 'admin' && (
              <button 
                className="btn btn-success btn-sm"
                onClick={() => handleBulkAction('approve')}
              >
                <FaCheck />
                Approve Selected
              </button>
            )}
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => handleBulkAction('delete')}
            >
              <FaTrash />
              Delete Selected
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedArticles([]);
                setShowBulkActions(false);
              }}
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="articles-grid">
        {filteredArticles.map((article) => (
          <motion.div
            key={article._id}
            className="article-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="article-card-header">
              <div className="article-status">
                <span className={`status-badge ${getStatusColor(article.status)}`}>
                  {article.status}
                </span>
              </div>
              
              <div className="article-actions">
                <input
                  type="checkbox"
                  checked={selectedArticles.includes(article._id)}
                  onChange={() => {
                    toggleArticleSelection(article._id);
                    setShowBulkActions(true);
                  }}
                  className="article-checkbox"
                />
                
                {/* Admin approval actions */}
                {user.role === 'admin' && article.status === 'pending' && (
                  <>
                    <button 
                      className="btn-icon approve"
                      onClick={() => handleApprove(article._id)}
                      title="Approve"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      className="btn-icon reject"
                      onClick={() => handleReject(article._id)}
                      title="Reject"
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
                
                {article.status === 'approved' && article.allowDownloads && (
                  <button 
                    className="btn-icon"
                    onClick={() => handleDownload(article)}
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                )}
                <button 
                  className="btn-icon"
                  onClick={() => handleEdit(article)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => handleDelete(article._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="article-card-content">
              <h3 className="article-title">{article.title}</h3>
              <p className="article-excerpt">
                {article.description && article.description.length > 150 
                  ? `${article.description.substring(0, 150)}...` 
                  : article.description || 'No description available'
                }
              </p>
              
              <div className="article-tags">
                {article.tags && article.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <FaTag />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="article-meta">
                <div className="meta-item">
                  <FaBook />
                  <span>{article.department}</span>
                </div>
                <div className="meta-item">
                  <FaEye />
                  <span>{article.stats?.views || 0} views</span>
                </div>
                <div className="meta-item">
                  <FaDownload />
                  <span>{article.stats?.downloads || 0} downloads</span>
                </div>
                <div className="meta-item">
                  <FaStar />
                  <span>{article.stats?.rating || 0} rating</span>
                </div>
                <div className="meta-item">
                  <FaUsers />
                  <span>{article.comments?.length || 0} comments</span>
                </div>
              </div>

              {article.fileName && (
                <div className="article-file">
                  <FaFileUpload />
                  <span>{article.fileName}</span>
                  <span className="file-size">({article.formattedFileSize || article.fileSize})</span>
                </div>
              )}
            </div>

            <div className="article-card-footer">
              <div className="article-dates">
                <div className="date-item">
                  <FaClock />
                  <span>Created: {formatDate(article.createdAt)}</span>
                </div>
                {article.approvedAt && (
                  <div className="date-item">
                    <FaCheck />
                    <span>Approved: {formatDate(article.approvedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingArticle ? 'Edit Article' : 'Create New Article'}</h2>
              <button 
                className="btn-icon"
                onClick={() => setShowCreateForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="article-form">
              {error && (
                <div className="error-message" style={{ 
                  color: '#dc3545', 
                  backgroundColor: '#f8d7da', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginBottom: '20px',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter article title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Enter article description..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="8"
                  placeholder="Write your article content..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business</option>
                  <option value="arts">Arts</option>
                  <option value="science">Science</option>
                  <option value="medicine">Medicine</option>
                  <option value="law">Law</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="research-paper">Research Paper</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="case-study">Case Study</option>
                  <option value="review">Review</option>
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input-container">
                  <input
                    type="text"
                    id="tags"
                    placeholder="Type tag and press Enter"
                    onKeyPress={handleTagInput}
                  />
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pdf">Upload PDF File *</label>
                <input
                  type="file"
                  id="pdf"
                  name="pdf"
                  onChange={handleInputChange}
                  accept=".pdf"
                  required
                />
                {formData.pdf && (
                  <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                    <FaFileUpload style={{ marginRight: 4 }} />
                    {formData.pdf.name} ({(formData.pdf.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cover">Upload Cover Image (Optional)</label>
                <input
                  type="file"
                  id="cover"
                  name="cover"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                {formData.cover && (
                  <div style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                    <FaFileUpload style={{ marginRight: 4 }} />
                    {formData.cover.name} ({(formData.cover.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span>Make article public</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleInputChange}
                  />
                  <span>Allow comments</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowDownloads"
                    checked={formData.allowDownloads}
                    onChange={handleInputChange}
                  />
                  <span>Allow downloads</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <FaSave />
                  {loading ? 'Saving...' : (editingArticle ? 'Update Article' : 'Create Article')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <FaBook className="empty-icon" />
            <h3>No articles found</h3>
            <p>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first article to get started'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingArticle(null);
                  resetForm();
                  setShowCreateForm(true);
                }}
              >
                <FaPlus />
                Create Your First Article
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManager; 


















