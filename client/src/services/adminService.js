import axios from 'axios';

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

// Admin Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const response = await createAuthInstance().get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch dashboard stats' };
  }
};

// Pending Articles
export const getPendingArticles = async (params = {}) => {
  try {
    const response = await createAuthInstance().get('/admin/pending-articles', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch pending articles' };
  }
};

// Approved Articles
export const getApprovedArticles = async (params = {}) => {
  try {
    const response = await createAuthInstance().get('/admin/approved-articles', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch approved articles' };
  }
};

// Rejected Articles
export const getRejectedArticles = async (params = {}) => {
  try {
    const response = await createAuthInstance().get('/admin/rejected-articles', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch rejected articles' };
  }
};

// Approve Article
export const approveArticle = async (articleId) => {
  try {
    const response = await createAuthInstance().patch(`/admin/articles/${articleId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to approve article' };
  }
};

// Reject Article
export const rejectArticle = async (articleId, reason) => {
  try {
    const response = await createAuthInstance().patch(`/admin/articles/${articleId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to reject article' };
  }
};

// Send Article for Review
export const sendArticleForReview = async (articleId) => {
  try {
    const response = await createAuthInstance().patch(`/admin/articles/${articleId}/review`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to send article for review' };
  }
};

// Get Users
export const getUsers = async (params = {}) => {
  try {
    const response = await createAuthInstance().get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch users' };
  }
};

// Verify User
export const verifyUser = async (userId) => {
  try {
    const response = await createAuthInstance().patch(`/admin/users/${userId}/verify`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to verify user' };
  }
};

// Update User Role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await createAuthInstance().patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update user role' };
  }
};

// Toggle User Status
export const toggleUserStatus = async (userId) => {
  try {
    const response = await createAuthInstance().patch(`/admin/users/${userId}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update user status' };
  }
};

// Delete User
export const deleteUser = async (userId) => {
  try {
    const response = await createAuthInstance().delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete user' };
  }
};

// Get Analytics
export const getAnalytics = async (period = 30) => {
  try {
    const response = await createAuthInstance().get('/admin/analytics', { 
      params: { period } 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch analytics' };
  }
};

// Bulk Actions
export const bulkApproveArticles = async (articleIds) => {
  try {
    const promises = articleIds.map(id => approveArticle(id));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      success: true,
      message: `Successfully approved ${successful} articles${failed > 0 ? `, ${failed} failed` : ''}`,
      successful,
      failed
    };
  } catch (error) {
    throw { success: false, message: 'Failed to perform bulk approval' };
  }
};

export const bulkRejectArticles = async (articleIds, reason) => {
  try {
    const promises = articleIds.map(id => rejectArticle(id, reason));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      success: true,
      message: `Successfully rejected ${successful} articles${failed > 0 ? `, ${failed} failed` : ''}`,
      successful,
      failed
    };
  } catch (error) {
    throw { success: false, message: 'Failed to perform bulk rejection' };
  }
};

// Get All Articles (for admin review)
export const getAllArticlesForAdmin = async (params = {}) => {
  try {
    const response = await createAuthInstance().get('/admin/all-articles', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch all articles' };
  }
};

// Export all functions
export default {
  getDashboardStats,
  getPendingArticles,
  getApprovedArticles,
  getRejectedArticles,
  approveArticle,
  rejectArticle,
  sendArticleForReview,
  getUsers,
  verifyUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAnalytics,
  bulkApproveArticles,
  bulkRejectArticles,
  getAllArticlesForAdmin
}; 