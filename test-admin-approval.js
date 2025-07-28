// Test script for Admin Approval Functionality
// This script tests the admin approval API endpoints

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testAdmin = {
  email: 'admin@test.com',
  password: 'admin123456'
};

const testArticle = {
  title: 'Test Article for Approval',
  description: 'This is a test article to verify the approval functionality',
  content: 'Test content for the article...',
  department: 'computer-science',
  category: 'research-paper',
  tags: ['test', 'approval'],
  fileUrl: 'test-file.pdf',
  fileName: 'test-file.pdf',
  fileSize: 1024000,
  fileType: 'pdf'
};

let adminToken = null;
let testArticleId = null;

// Helper function to make authenticated requests
const makeAuthRequest = (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testAdmin);
    adminToken = response.data.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateTestArticle() {
  console.log('📝 Creating test article...');
  try {
    const response = await makeAuthRequest('POST', '/articles', testArticle);
    testArticleId = response.data.article._id;
    console.log('✅ Test article created:', testArticleId);
    return true;
  } catch (error) {
    console.error('❌ Failed to create test article:', error.response?.data || error.message);
    return false;
  }
}

async function testGetDashboardStats() {
  console.log('📊 Testing dashboard stats...');
  try {
    const response = await makeAuthRequest('GET', '/admin/dashboard');
    console.log('✅ Dashboard stats:', response.data.stats);
    return true;
  } catch (error) {
    console.error('❌ Failed to get dashboard stats:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPendingArticles() {
  console.log('⏳ Testing pending articles...');
  try {
    const response = await makeAuthRequest('GET', '/admin/pending-articles');
    console.log('✅ Pending articles count:', response.data.articles.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to get pending articles:', error.response?.data || error.message);
    return false;
  }
}

async function testApproveArticle() {
  console.log('✅ Testing article approval...');
  try {
    const response = await makeAuthRequest('PATCH', `/admin/articles/${testArticleId}/approve`);
    console.log('✅ Article approved successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to approve article:', error.response?.data || error.message);
    return false;
  }
}

async function testGetApprovedArticles() {
  console.log('✅ Testing approved articles...');
  try {
    const response = await makeAuthRequest('GET', '/admin/approved-articles');
    console.log('✅ Approved articles count:', response.data.articles.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to get approved articles:', error.response?.data || error.message);
    return false;
  }
}

async function testRejectArticle() {
  console.log('❌ Testing article rejection...');
  try {
    // First create another test article
    const response = await makeAuthRequest('POST', '/articles', {
      ...testArticle,
      title: 'Test Article for Rejection'
    });
    const rejectArticleId = response.data.article._id;
    
    // Then reject it
    await makeAuthRequest('PATCH', `/admin/articles/${rejectArticleId}/reject`, {
      reason: 'Test rejection - content does not meet standards'
    });
    console.log('✅ Article rejected successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reject article:', error.response?.data || error.message);
    return false;
  }
}

async function testGetRejectedArticles() {
  console.log('❌ Testing rejected articles...');
  try {
    const response = await makeAuthRequest('GET', '/admin/rejected-articles');
    console.log('✅ Rejected articles count:', response.data.articles.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to get rejected articles:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUsers() {
  console.log('👥 Testing users endpoint...');
  try {
    const response = await makeAuthRequest('GET', '/admin/users');
    console.log('✅ Users count:', response.data.users.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to get users:', error.response?.data || error.message);
    return false;
  }
}

async function testAnalytics() {
  console.log('📈 Testing analytics...');
  try {
    const response = await makeAuthRequest('GET', '/admin/analytics');
    console.log('✅ Analytics data:', response.data.analytics);
    return true;
  } catch (error) {
    console.error('❌ Failed to get analytics:', error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Admin Approval Functionality Tests\n');
  
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Create Test Article', fn: testCreateTestArticle },
    { name: 'Dashboard Stats', fn: testGetDashboardStats },
    { name: 'Pending Articles', fn: testGetPendingArticles },
    { name: 'Approve Article', fn: testApproveArticle },
    { name: 'Approved Articles', fn: testGetApprovedArticles },
    { name: 'Reject Article', fn: testRejectArticle },
    { name: 'Rejected Articles', fn: testGetRejectedArticles },
    { name: 'Get Users', fn: testGetUsers },
    { name: 'Analytics', fn: testAnalytics }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📋 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin approval functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testAdminLogin,
  testCreateTestArticle,
  testGetDashboardStats,
  testGetPendingArticles,
  testApproveArticle,
  testGetApprovedArticles,
  testRejectArticle,
  testGetRejectedArticles,
  testGetUsers,
  testAnalytics
}; 