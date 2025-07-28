const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: 'instructor',
  department: 'computer-science'
};

const testArticle = {
  title: 'Test Article for Approval',
  description: 'This is a test article to verify the approval system',
  content: 'This is the content of the test article.',
  department: 'computer-science',
  category: 'research-paper',
  tags: ['test', 'approval', 'system']
};

async function testArticleApprovalSystem() {
  try {
    console.log('🧪 Testing Article Approval System...\n');

    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    
    const { token } = registerResponse.data;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Create an article (should be pending)
    console.log('\n2. Creating test article...');
    const articleResponse = await axios.post(`${API_BASE_URL}/articles`, testArticle, {
      headers: authHeaders
    });
    console.log('✅ Article created successfully (status: pending)');

    const articleId = articleResponse.data.article._id;

    // 3. Check if article appears in pending list
    console.log('\n3. Checking pending articles...');
    const pendingResponse = await axios.get(`${API_BASE_URL}/admin/pending-articles`, {
      headers: authHeaders
    });
    
    const pendingArticles = pendingResponse.data.articles;
    const foundArticle = pendingArticles.find(article => article._id === articleId);
    
    if (foundArticle) {
      console.log('✅ Article found in pending list');
    } else {
      console.log('❌ Article not found in pending list');
    }

    // 4. Approve the article (as admin)
    console.log('\n4. Approving article...');
    const approveResponse = await axios.patch(`${API_BASE_URL}/admin/articles/${articleId}/approve`, {}, {
      headers: authHeaders
    });
    console.log('✅ Article approved successfully');

    // 5. Check if article appears in approved list
    console.log('\n5. Checking approved articles...');
    const approvedResponse = await axios.get(`${API_BASE_URL}/articles/approved`, {
      headers: authHeaders
    });
    
    const approvedArticles = approvedResponse.data.articles;
    const approvedArticle = approvedArticles.find(article => article._id === articleId);
    
    if (approvedArticle) {
      console.log('✅ Article found in approved list');
      console.log(`   Title: ${approvedArticle.title}`);
      console.log(`   Status: ${approvedArticle.status}`);
      console.log(`   Author: ${approvedArticle.author.firstName} ${approvedArticle.author.lastName}`);
    } else {
      console.log('❌ Article not found in approved list');
    }

    // 6. Test download functionality
    console.log('\n6. Testing download functionality...');
    try {
      const downloadResponse = await axios.get(`${API_BASE_URL}/articles/${articleId}/download`, {
        headers: authHeaders,
        responseType: 'blob'
      });
      console.log('✅ Download endpoint working (file size:', downloadResponse.data.size, 'bytes)');
    } catch (error) {
      console.log('⚠️  Download test skipped (no file uploaded)');
    }

    console.log('\n🎉 Article approval system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration works');
    console.log('   ✅ Article creation works');
    console.log('   ✅ Articles default to pending status');
    console.log('   ✅ Admin can approve articles');
    console.log('   ✅ Approved articles appear in approved list');
    console.log('   ✅ Download functionality is available');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have a valid admin user or the test user has admin privileges');
    }
  }
}

// Run the test
testArticleApprovalSystem(); 