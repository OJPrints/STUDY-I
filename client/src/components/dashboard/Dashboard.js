import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaComments, 
  FaFileAlt, 
  FaChartLine,
  FaBell,
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBook,
  FaUsers,
  FaCalendar,
  FaStar,
  FaEye,
  FaDownload,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaUserGraduate,
  FaUserTie,
  FaUserShield,
  FaShieldAlt,
  FaArrowRight,
  FaUpload,
  FaSync,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../Footer';
import './Dashboard.css';
import Jitsi from 'react-jitsi';

const Dashboard = () => {
  const { user, logout, userCount } = useAuth();
  const [activeTab, setActiveTab] = useState('articles');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [myArticles, setMyArticles] = useState([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    description: '',
    content: '',
    department: user?.department || '',
    category: '',
    cover: null,
    coverPreview: '',
    pdf: null,
    pdfName: ''
  });

  // Mock data based on user role
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentActivity: [],
    pendingItems: [],
    quickActions: []
  });

  // Add state for students management
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Add state for admin book approvals
  const [pendingApprovals, setPendingApprovals] = useState(12); // initial mock value
  const [publishedBooks, setPublishedBooks] = useState(156); // initial mock value

  // Add state for articles and courses
  const [articles, setArticles] = useState([]);
  const [pendingArticlesForReview, setPendingArticlesForReview] = useState([]);

  // Shared demo articles state (persists across demo users)
  const [sharedDemoArticles, setSharedDemoArticles] = useState(() => {
    const saved = localStorage.getItem('demoArticles');
    return saved ? JSON.parse(saved) : [
      {
        _id: 'demo-existing-1',
        title: 'Introduction to Machine Learning',
        description: 'A comprehensive guide to machine learning fundamentals',
        content: 'This article covers the basics of machine learning algorithms, data preprocessing, and model evaluation techniques...',
        department: 'computer-science',
        category: 'tutorial',
        author: { firstName: 'Dr. Sarah', lastName: 'Johnson', email: 'instructor@demo.com' },
        status: 'pending',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];
  });

  const [courses, setCourses] = useState([
    { title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, and JavaScript basics', category: 'Web Development', schedule: { date: '2024-02-15', time: '2:00 PM' }, instructor: 'Dr. Sarah Johnson', progress: '75%', modules: 12 },
    { title: 'Database Systems', description: 'Introduction to SQL and database design', category: 'Database', schedule: { date: '2024-02-18', time: '10:00 AM' }, instructor: 'Prof. Michael Brown', progress: '45%', modules: 8 },
    { title: 'Advanced Mathematics', description: 'Calculus and linear algebra for engineering', category: 'Mathematics', schedule: { date: '2024-02-20', time: '11:00 AM' }, instructor: 'Dr. Robert Wilson', progress: '90%', modules: 15 }
  ]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    courseCode: '',
    credits: 3,
    duration: '1 semester',
    level: 'beginner',
    prerequisites: '',
    syllabus: '',
    objectives: '',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    schedule: {
      days: [],
      time: '',
      location: ''
    },
    tags: ''
  });

  // Add state for course enrollment and calls
  const [enrolledCourses, setEnrolledCourses] = useState([]); // course titles student is enrolled in
  const [activeCalls, setActiveCalls] = useState({}); // { courseTitle: true/false }

  const [callModalOpen, setCallModalOpen] = useState(false);
  const [currentCallCourse, setCurrentCallCourse] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const notificationTimeouts = useRef([]);

  const [copySuccess, setCopySuccess] = useState('');

  // Add state for users (mock data)
  const [users, setUsers] = useState([
    // Student user with details
    { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@email.com', role: 'student', department: 'Web Development',
      enrolledCourses: ['Web Development Fundamentals', 'Database Systems'], teachingCourses: [],
      phone: '555-111-2222', joined: '2023-09-10', lastActive: '2024-06-01', status: 'Active',
      bio: 'Enthusiastic web development student. Loves JavaScript and React.'
    },
    // Instructor user with details
    { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@email.com', role: 'instructor', department: 'Mathematics',
      enrolledCourses: [], teachingCourses: ['Advanced Mathematics'],
      phone: '555-333-4444', joined: '2021-03-22', lastActive: '2024-05-30', status: 'Active',
      bio: 'Mathematics instructor with a passion for teaching and research.'
    }
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add state for available books and course enrollment
  const [availableBooks] = useState([
    { title: 'Advanced Mathematics for Engineering', author: 'Dr. Robert Wilson', description: 'Comprehensive guide to mathematical concepts', category: 'Mathematics', price: '$89.99', rating: 4.8 },
    { title: 'Computer Science Fundamentals', author: 'Prof. Lisa Chen', description: 'Essential concepts and practical applications', category: 'Computer Science', price: '$75.50', rating: 4.9 },
    { title: 'Web Development Guide', author: 'Dr. Sarah Johnson', description: 'Complete web development course', category: 'Web Development', price: '$65.00', rating: 4.7 }
  ]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [pendingBooks, setPendingBooks] = useState([
    { title: 'Engineering Physics', author: 'Dr. James Wilson', priority: 'high', status: 'pending' },
    { title: 'Business Strategy Guide', author: 'Prof. Maria Garcia', priority: 'medium', status: 'pending' },
    { title: 'Database Design', author: 'Dr. Alex Brown', priority: 'low', status: 'pending' }
  ]);

  // Add state for assignments and submit assignment modal
  const [assignments] = useState([
    { id: 1, title: 'Web Development Project', course: 'Web Development Fundamentals', dueDate: '2024-02-15', status: 'pending' },
    { id: 2, title: 'Database Systems Quiz', course: 'Database Systems', dueDate: '2024-02-18', status: 'pending' },
    { id: 3, title: 'Business Strategy Chapter 5', course: 'Business Strategy', dueDate: '2024-02-20', status: 'pending' }
  ]);
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    course: '', 
    lecturer: '', 
    lecturerId: null,
    description: '', 
    file: null, 
    filePreview: '' 
  });

  // Add mock lecturers data
  const [lecturers] = useState([
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@email.com', department: 'Computer Science', courses: ['Web Development Fundamentals'] },
    { id: 2, name: 'Prof. Michael Brown', email: 'michael.brown@email.com', department: 'Database', courses: ['Database Systems'] },
    { id: 3, name: 'Dr. Robert Wilson', email: 'robert.wilson@email.com', department: 'Mathematics', courses: ['Advanced Mathematics'] },
    { id: 4, name: 'Prof. Lisa Chen', email: 'lisa.chen@email.com', department: 'Computer Science', courses: ['Computer Science Fundamentals'] },
    { id: 5, name: 'Dr. James Anderson', email: 'james.anderson@email.com', department: 'Physics', courses: ['Engineering Physics'] }
  ]);
  const [showLecturerSearch, setShowLecturerSearch] = useState(false);
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState('');
  const [filteredLecturers, setFilteredLecturers] = useState([]);

  // Add state for calendar events
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    courseTitle: '',
    description: '',
    information: '',
    instructor: user ? `${user.firstName} ${user.lastName}` : ''
  });
  const [events, setEvents] = useState([]);

  const loadDashboardData = useCallback(() => {
    if (user.role === 'student') {
      setDashboardData({
        stats: [
          { label: 'Relevant', value: 'Articles', icon: <FaBook />, color: 'primary' },
          { label: '7j/7j', value: '24/24', icon: <FaClock />, color: 'warning' },
          { label: 'Numerous', value: '28', icon: <FaComments />, color: 'info' },
          { label: 'Learning Hours', value: 'Flexible', icon: <FaClock />, color: 'success' }
        ],
        recentActivity: [
          { type: 'assignment', title: 'Math Assignment #3', status: 'submitted', time: '2 hours ago' },
          { type: 'discussion', title: 'Computer Science Discussion', status: 'participated', time: '1 day ago' },
          { type: 'course', title: 'Advanced Physics Course', status: 'enrolled', time: '3 days ago' },
          { type: 'book', title: 'Engineering Mathematics', status: 'purchased', time: '1 week ago' }
        ],
        pendingItems: [
          { type: 'assignment', title: 'Web Development Project', dueDate: '2024-02-15', priority: 'high' },
          { type: 'quiz', title: 'Database Systems Quiz', dueDate: '2024-02-18', priority: 'medium' },
          { type: 'reading', title: 'Business Strategy Chapter 5', dueDate: '2024-02-20', priority: 'low' }
        ],
        quickActions: [
          { label: 'Join Discussion', icon: <FaComments />, action: () => setActiveTab('discussions') },
          { label: 'Submit Assignment', icon: <FaUpload />, action: () => setShowSubmitAssignmentModal(true) }
        ]
      });
    } else if (user.role === 'instructor') {
      setDashboardData({
        stats: [
          { label: 'Published Books', value: 'Easy to', icon: <FaBook />, color: 'primary' },
          { label: ' Aproval', value: 'Quick and accurate', icon: <FaClock />, color: 'warning' },
          { label: 'Users', value: 'Dynamic', icon: <FaUsers />, color: 'info' },
          { label: 'Improvements', value: 'Rapid', icon: <FaChartLine />, color: 'success' }
        ],
        recentActivity: [
          { type: 'book', title: 'Advanced Mathematics Book', status: 'pending_approval', time: '1 day ago' },
          { type: 'book', title: 'Computer Science Fundamentals', status: 'approved', time: '3 days ago' },
          { type: 'student', title: 'New student enrolled', status: 'enrolled', time: '1 week ago' },
          { type: 'revenue', title: 'Book sales revenue', status: 'earned', time: '1 week ago' }
        ],
        pendingItems: [
          { type: 'approval', title: 'Advanced Mathematics Book', status: 'pending', priority: 'high' },
          { type: 'approval', title: 'Business Strategy Guide', status: 'pending', priority: 'medium' },
          { type: 'approval', title: 'Engineering Physics', status: 'pending', priority: 'low' }
        ],
        quickActions: [
          { label: 'Publish New Article', icon: <FaPlus />, action: () => setShowArticleModal(true) },
          { label: 'Check Approvals', icon: <FaCheckCircle />, action: () => setShowApprovalModal(true) },
          { label: 'View Analytics', icon: <FaChartLine />, action: () => setActiveTab('analytics') },
          { label: 'Manage Students', icon: <FaUsers />, action: () => setActiveTab('students') }
        ]
      });
    } else if (user.role === 'admin') {
      setDashboardData({
        stats: [
          { label: 'Total Users', value: userCount.toLocaleString(), icon: <FaUsers />, color: 'primary' },
          { label: 'Pending Approvals', value: pendingApprovals.toLocaleString(), icon: <FaClock />, color: 'warning' },
          { label: 'Published Books', value: publishedBooks.toLocaleString(), icon: <FaBook />, color: 'info' }
        ],
        recentActivity: [
          { type: 'approval', title: 'Advanced Mathematics Book', status: 'approved', time: '2 hours ago' },
          { type: 'user', title: 'New instructor registered', status: 'registered', time: '1 day ago' },
          { type: 'book', title: 'Business Strategy Guide', status: 'rejected', time: '2 days ago' },
          { type: 'system', title: 'System maintenance', status: 'completed', time: '1 week ago' }
        ],
        pendingItems: pendingBooks.map(book => ({
          type: 'approval',
          title: book.title,
          status: book.status,
          priority: book.priority
        })),
        quickActions: [
          { label: 'Publish New Article', icon: <FaPlus />, action: () => setShowArticleModal(true) },
          { label: 'Check Approvals', icon: <FaCheckCircle />, action: () => setShowApprovalModal(true) },
          { label: 'Review Approvals', icon: <FaCheckCircle />, action: () => setActiveTab('manageusers') },
          { label: 'Manage Users', icon: <FaUsers />, action: () => setActiveTab('manageusers') },
          { label: 'System Settings', icon: <FaCog />, action: () => console.log('System settings') },
          { label: 'View Reports', icon: <FaChartLine />, action: () => console.log('View reports') }
        ]
      });
    }
  }, [user.role, userCount, pendingApprovals, publishedBooks, pendingBooks]);

  useEffect(() => {
    // Load dashboard data based on user role
    loadDashboardData();
  }, [loadDashboardData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (showNavMenu && !event.target.closest('.dashboard-nav-menu')) {
        setShowNavMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showNavMenu]);

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'student':
        return <FaUserGraduate />;
      case 'instructor':
        return <FaUserTie />;
      case 'admin':
        return <FaUserShield />;
      default:
        return <FaUserGraduate />;
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'student':
        return 'Student Dashboard';
      case 'instructor':
        return (<span>Lecturer <br/>Publisher Dashboard</span>);
      case 'admin':
        return 'Hello, OJ!! Great you are Back!!';
      default:
        return 'Dashboard';
    }
  };

  const getRoleDescription = () => {
    switch (user.role) {
      case 'student':
        return 'Track your learning progress, access course materials, and engage with your peers';
      case 'instructor':
        return 'Manage your published content, track student engagement, and monitor revenue';
      case 'admin':
        return 'Terry you got much work here; approve content, and oversee user activities';
      default:
        return 'Welcome to your dashboard';
    }
  };

  // Handle article form input
  const handleArticleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'cover' && files && files[0]) {
      setNewArticle(prev => ({
        ...prev,
        cover: files[0],
        coverPreview: URL.createObjectURL(files[0])
      }));
    } else if (name === 'pdf' && files && files[0]) {
      setNewArticle(prev => ({
        ...prev,
        pdf: files[0],
        pdfName: files[0].name
      }));
    } else {
      setNewArticle(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle article form submit
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.description || !newArticle.content || !newArticle.department || !newArticle.category || !newArticle.pdf) {
      alert('Please fill in all required fields and upload a PDF file');
      return;
    }

    const token = localStorage.getItem('token');

    // Check if user is using demo account
    if (token === 'demo-token') {
      // For demo users, simulate successful submission
      const demoArticle = {
        _id: Date.now().toString(),
        title: newArticle.title,
        description: newArticle.description,
        content: newArticle.content,
        department: newArticle.department,
        category: newArticle.category,
        author: user,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Add to shared demo state so admin can see it
      const updatedDemoArticles = [demoArticle, ...sharedDemoArticles];
      setSharedDemoArticles(updatedDemoArticles);
      localStorage.setItem('demoArticles', JSON.stringify(updatedDemoArticles));

      // Also add to local state for instructor view
      setMyArticles(prev => [demoArticle, ...prev]);

      alert('Article submitted for approval! (Demo Mode)');
      setShowArticleModal(false);
      setNewArticle({
        title: '',
        description: '',
        content: '',
        department: user?.department || '',
        category: '',
        cover: null,
        coverPreview: '',
        pdf: null,
        pdfName: ''
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newArticle.title);
      formData.append('description', newArticle.description);
      formData.append('content', newArticle.content);
      formData.append('department', newArticle.department);
      formData.append('category', newArticle.category);
      formData.append('pdf', newArticle.pdf);
      if (newArticle.cover) {
        formData.append('cover', newArticle.cover);
      }

      const response = await fetch('http://localhost:5000/api/articles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('Article submitted for approval!');
        setShowArticleModal(false);
        setNewArticle({
          title: '',
          description: '',
          content: '',
          department: user?.department || '',
          category: '',
          cover: null,
          coverPreview: '',
          pdf: null,
          pdfName: ''
        });
        // Refresh the articles list
        loadMyArticles();
      } else {
        alert('Error submitting article: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Error submitting article. Please try again.');
    }
  };

  // Load my articles function
  const loadMyArticles = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // For demo users, load from shared localStorage
      if (token === 'demo-token') {
        const demoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
        // Filter articles by current user (for demo, we'll show all articles created by demo instructor)
        const userArticles = demoArticles.filter(article =>
          article.author?.email === user?.email ||
          article.author?.firstName === user?.firstName
        );
        setMyArticles(userArticles);
        return;
      }

      const response = await fetch('http://localhost:5000/api/articles/my-articles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMyArticles(data.articles);
      }
    } catch (error) {
      console.error('Error loading my articles:', error);
    }
  }, [user]);

  // Load pending articles for admin review
  const loadPendingArticlesForReview = useCallback(async () => {
    const token = localStorage.getItem('token');

    // For demo users, show shared demo pending articles
    if (token === 'demo-token') {
      // Get current shared demo articles and filter for pending ones
      const currentDemoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
      const pendingDemoArticles = [...sharedDemoArticles, ...currentDemoArticles]
        .filter(article => article.status === 'pending')
        .filter((article, index, self) =>
          index === self.findIndex(a => a._id === article._id)
        ); // Remove duplicates

      setPendingArticlesForReview(pendingDemoArticles);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/articles/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingArticlesForReview(data.articles);
      }
    } catch (error) {
      console.error('Error loading pending articles:', error);
    }
  }, [sharedDemoArticles]);

  // Approve article function
  const handleApproveArticle = async (articleId) => {
    const token = localStorage.getItem('token');

    if (token === 'demo-token') {
      // Demo mode - update shared state
      const currentDemoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
      const updatedArticles = currentDemoArticles.map(article =>
        article._id === articleId
          ? { ...article, status: 'approved' }
          : article
      );

      // Update shared state
      setSharedDemoArticles(updatedArticles);
      localStorage.setItem('demoArticles', JSON.stringify(updatedArticles));

      // Remove from pending list and add to general articles
      const approvedArticle = pendingArticlesForReview.find(article => article._id === articleId);
      if (approvedArticle) {
        const updatedApprovedArticle = { ...approvedArticle, status: 'approved' };
        setArticles(prev => [updatedApprovedArticle, ...prev]);

        // Also update the shared demo articles in localStorage
        const currentDemoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
        const updatedDemoArticles = currentDemoArticles.map(article =>
          article._id === articleId ? updatedApprovedArticle : article
        );
        localStorage.setItem('demoArticles', JSON.stringify(updatedDemoArticles));

        // Update the instructor's myArticles list if they're viewing it
        setMyArticles(prev => prev.map(article =>
          article._id === articleId ? updatedApprovedArticle : article
        ));

        // Also update sharedDemoArticles state to trigger re-renders
        setSharedDemoArticles(updatedDemoArticles);
      }
      setPendingArticlesForReview(prev => prev.filter(article => article._id !== articleId));

      // Refresh all relevant lists
      if (window.refreshApprovedArticles) {
        window.refreshApprovedArticles();
      }

      // Force refresh of instructor's articles by calling loadMyArticles directly
      setTimeout(() => {
        loadMyArticles();
      }, 100);

      alert('Article approved successfully! (Demo Mode)');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Remove from pending list
        setPendingArticlesForReview(prev => prev.filter(article => article._id !== articleId));

        // Refresh the approved articles list to include the newly approved article
        const response = await fetch('http://localhost:5000/api/articles/approved');
        const articlesData = await response.json();
        if (articlesData.success) {
          setArticles(articlesData.articles);
        }

        // Also refresh instructor's articles list if available
        if (window.refreshMyArticles) {
          window.refreshMyArticles();
        }

        alert('Article approved successfully!');
      } else {
        alert('Error approving article: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Error approving article. Please try again.');
    }
  };

  // Reject article function
  const handleRejectArticle = async (articleId, reason) => {
    const token = localStorage.getItem('token');

    if (token === 'demo-token') {
      // Demo mode - update shared state
      const currentDemoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
      const updatedArticles = currentDemoArticles.map(article =>
        article._id === articleId
          ? { ...article, status: 'rejected', rejectionReason: reason }
          : article
      );

      // Update shared state
      setSharedDemoArticles(updatedArticles);
      localStorage.setItem('demoArticles', JSON.stringify(updatedArticles));

      // Remove from pending list
      setPendingArticlesForReview(prev => prev.filter(article => article._id !== articleId));
      alert('Article rejected successfully! (Demo Mode)');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (data.success) {
        // Remove from pending list
        setPendingArticlesForReview(prev => prev.filter(article => article._id !== articleId));
        alert('Article rejected successfully!');
      } else {
        alert('Error rejecting article: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Error rejecting article. Please try again.');
    }
  };

  // Course modal handlers
  const handleCourseInput = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };
  const handleCreateCourse = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newCourse.title || !newCourse.description || !newCourse.courseCode || !newCourse.startDate || !newCourse.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const token = localStorage.getItem('token');

    // For demo users, use local state
    if (token === 'demo-token') {
      const demoCourse = {
        _id: Date.now().toString(),
        ...newCourse,
        instructor: user,
        instructorName: user ? `${user.firstName} ${user.lastName}` : '',
        department: user?.department || 'computer-science',
        status: 'active',
        enrolledStudents: [],
        createdAt: new Date().toISOString(),
        prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map(p => p.trim()) : [],
        objectives: newCourse.objectives ? newCourse.objectives.split(',').map(o => o.trim()) : [],
        tags: newCourse.tags ? newCourse.tags.split(',').map(t => t.trim()) : []
      };

      setCourses(prev => [demoCourse, ...prev]);
      setShowCreateCourseModal(false);
      resetCourseForm();
      alert('Course created successfully! (Demo Mode)');
      return;
    }

    // For real users, use API
    try {
      const courseData = {
        ...newCourse,
        prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map(p => p.trim()) : [],
        objectives: newCourse.objectives ? newCourse.objectives.split(',').map(o => o.trim()) : [],
        tags: newCourse.tags ? newCourse.tags.split(',').map(t => t.trim()) : []
      };

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      const data = await response.json();
      if (data.success) {
        // Refresh courses list
        loadCourses();
        setShowCreateCourseModal(false);
        resetCourseForm();
        alert('Course created successfully!');
      } else {
        alert('Error creating course: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    }
  };

  // Load courses from API
  const loadCourses = async () => {
    const token = localStorage.getItem('token');

    // For demo users, use mock data
    if (token === 'demo-token') {
      const demoCourses = [
        {
          _id: 'demo-course-1',
          title: 'Web Development Fundamentals',
          description: 'Learn HTML, CSS, and JavaScript basics',
          courseCode: 'CS101',
          credits: 3,
          duration: '1 semester',
          level: 'beginner',
          instructor: { firstName: 'Dr. Sarah', lastName: 'Johnson' },
          instructorName: 'Dr. Sarah Johnson',
          department: 'computer-science',
          status: 'active',
          startDate: '2024-02-15',
          endDate: '2024-06-15',
          maxStudents: 30,
          enrolledStudents: [],
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: 'demo-course-2',
          title: 'Database Systems',
          description: 'Introduction to SQL and database design',
          courseCode: 'CS201',
          credits: 4,
          duration: '1 semester',
          level: 'intermediate',
          instructor: { firstName: 'Prof. Michael', lastName: 'Brown' },
          instructorName: 'Prof. Michael Brown',
          department: 'computer-science',
          status: 'active',
          startDate: '2024-02-18',
          endDate: '2024-06-18',
          maxStudents: 25,
          enrolledStudents: [],
          createdAt: '2024-01-10T14:30:00Z'
        }
      ];
      setCourses(demoCourses);
      return;
    }

    // For real users, fetch from API
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to empty array
      setCourses([]);
    }
  };

  // Helper function to reset course form
  const resetCourseForm = () => {
    setNewCourse({
      title: '',
      description: '',
      courseCode: '',
      credits: 3,
      duration: '1 semester',
      level: 'beginner',
      prerequisites: '',
      syllabus: '',
      objectives: '',
      maxStudents: 30,
      startDate: '',
      endDate: '',
      schedule: {
        days: [],
        time: '',
        location: ''
      },
      tags: ''
    });
  };

  // Enroll handler for students
  const handleEnroll = (course) => {
    if (!enrolledCourses.includes(course.title)) {
      setEnrolledCourses(prev => [...prev, course.title]);
    }
  };

  // Helper to sanitize room name
  const getRoomName = (course) => course.title.replace(/[^a-zA-Z0-9]/g, '') + '_LMS';

  // Helper to get Jitsi room URL
  const getRoomUrl = (course) => `https://meet.jit.si/${getRoomName(course)}`;

  // Update handlers to open modal
  const handleStartCall = (course) => {
    setActiveCalls(prev => ({ ...prev, [course.title]: true }));
    setCurrentCallCourse(course);
    setCallModalOpen(true);
  };
  const handleJoinCall = (course) => {
    setCurrentCallCourse(course);
    setCallModalOpen(true);
  };
  const handleEndCall = (course) => {
    setActiveCalls(prev => ({ ...prev, [course.title]: false }));
    setCallModalOpen(false);
    setCurrentCallCourse(null);
  };
  const handleCloseCallModal = () => {
    setCallModalOpen(false);
    setCurrentCallCourse(null);
  };

  const handleCopyInvite = () => {
    if (currentCallCourse) {
      navigator.clipboard.writeText(getRoomUrl(currentCallCourse));
      setCopySuccess('Invite link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  // Notification logic
  useEffect(() => {
    // Clear previous timeouts
    notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    notificationTimeouts.current = [];
    const now = new Date();
    let notifs = [];
    courses.forEach(course => {
      if (!course.schedule || !course.schedule.date || !course.schedule.time) return;
      const courseDateTime = new Date(`${course.schedule.date}T${course.schedule.time}`);
      const diffMs = courseDateTime - now;
      // Only notify for future courses within 10 minutes
      if (diffMs > 0 && diffMs <= 10 * 60 * 1000) {
        // Student: enrolled, Lecturer: created
        if ((user.role === 'student' && enrolledCourses.includes(course.title)) ||
            (user.role !== 'student' && course.instructor === `${user.firstName} ${user.lastName}`)) {
          notifs.push({
            id: course.title + course.schedule.date + course.schedule.time,
            message: `Course "${course.title}" is starting at ${course.schedule.time}`
          });
        }
      }
      // Schedule a timeout for future notification
      if (diffMs > 10 * 60 * 1000) {
        const timeout = setTimeout(() => {
          setNotifications(prev => ([
            ...prev,
            {
              id: course.title + course.schedule.date + course.schedule.time,
              message: `Course "${course.title}" is starting at ${course.schedule.time}`
            }
          ]));
        }, diffMs - 10 * 60 * 1000);
        notificationTimeouts.current.push(timeout);
      }
    });
    setNotifications(notifs);
    return () => notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
  }, [courses, enrolledCourses, user]);

  // Assignment submission handler
  const handleAssignmentInput = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files && files[0]) {
      setNewAssignment(prev => ({
        ...prev,
        file: files[0],
        filePreview: files[0].name
      }));
    } else {
      setNewAssignment(prev => ({ ...prev, [name]: value }));
    }
  };

  // Lecturer search functionality
  const handleLecturerSearch = (query) => {
    setLecturerSearchQuery(query);
    if (query.length > 0) {
      const filtered = lecturers.filter(lecturer => 
        lecturer.name.toLowerCase().includes(query.toLowerCase()) ||
        lecturer.email.toLowerCase().includes(query.toLowerCase()) ||
        lecturer.department.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLecturers(filtered);
      setShowLecturerSearch(true);
    } else {
      setFilteredLecturers([]);
      setShowLecturerSearch(false);
    }
  };

  const selectLecturer = (lecturer) => {
    setNewAssignment(prev => ({
      ...prev,
      lecturer: lecturer.name,
      lecturerId: lecturer.id
    }));
    setLecturerSearchQuery(lecturer.name);
    setShowLecturerSearch(false);
  };

  // Update assignment submission handler
  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.course || !newAssignment.lecturer || !newAssignment.description || !newAssignment.file) return;
    
    // Here you would typically send the assignment to the backend
    console.log('Submitting assignment:', newAssignment);
    
    setShowSubmitAssignmentModal(false);
    setNewAssignment({ 
      title: '', 
      course: '', 
      lecturer: '', 
      lecturerId: null,
      description: '', 
      file: null, 
      filePreview: '' 
    });
  };

  useEffect(() => {
    // Fetch approved books/articles for all users
    const fetchApprovedBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/articles/approved', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Error fetching approved books:', error);
      }
    };

    // Fetch approved articles for display
    const fetchApprovedArticles = async () => {
      try {
        const token = localStorage.getItem('token');

        // For demo mode, load approved articles from localStorage
        if (token === 'demo-token') {
          const demoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
          const approvedDemoArticles = demoArticles.filter(article => article.status === 'approved');
          setArticles(approvedDemoArticles);
          return;
        }

        const response = await fetch('http://localhost:5000/api/articles/approved', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Error fetching approved articles:', error);
        // Fallback to empty array if API fails
        setArticles([]);
      }
    };

    fetchApprovedBooks();
    fetchApprovedArticles();
    loadCalendarEvents();
    loadCourses();

    // Load students for instructors and admins
    if (user && (user.role === 'instructor' || user.role === 'admin')) {
      loadStudents();
    }

    // Store the fetchApprovedArticles function for later use
    window.refreshApprovedArticles = fetchApprovedArticles;

    // Load my articles if user is instructor or admin
    if (user && (user.role === 'instructor' || user.role === 'admin')) {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        // Set demo articles for demo users
        const demoArticles = [
          {
            _id: 'demo1',
            title: 'Introduction to Machine Learning',
            description: 'A comprehensive guide to machine learning fundamentals',
            content: 'This article covers the basics of machine learning...',
            department: 'computer-science',
            category: 'tutorial',
            author: user,
            status: 'approved',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            _id: 'demo2',
            title: 'Advanced Database Design',
            description: 'Best practices for designing scalable databases',
            content: 'Database design is crucial for application performance...',
            department: 'computer-science',
            category: 'research-paper',
            author: user,
            status: 'pending',
            createdAt: '2024-01-20T14:30:00Z'
          }
        ];
        setMyArticles(demoArticles);
      } else {
        loadMyArticles();
      }

      // Make loadMyArticles available globally for refreshing after approval
      window.refreshMyArticles = loadMyArticles;
    }

    // Load pending articles for admin review
    if (user && user.role === 'admin') {
      loadPendingArticlesForReview();
    }
  }, [user, loadPendingArticlesForReview, sharedDemoArticles, loadMyArticles]);

  // Auto-refresh instructor's articles when shared demo articles change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token === 'demo-token' && user && (user.role === 'instructor' || user.role === 'admin')) {
      loadMyArticles();
    }
  }, [sharedDemoArticles, user, loadMyArticles]);

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowUserModal(false);
      setSelectedUser(null);
    }
  };

  // Event handlers for calendar functionality
  const handleEventInput = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Load students from API
  const loadStudents = async () => {
    const token = localStorage.getItem('token');

    // For demo users, use mock data
    if (token === 'demo-token') {
      const demoStudents = [
        {
          _id: 'demo-student-1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@email.com',
          department: 'computer-science',
          enrolledCourses: ['Web Development', 'Database Systems'],
          status: 'enrolled',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: 'demo-student-2',
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@email.com',
          department: 'computer-science',
          enrolledCourses: ['Advanced Mathematics'],
          status: 'enrolled',
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          _id: 'demo-student-3',
          firstName: 'Carol',
          lastName: 'Lee',
          email: 'carol.lee@email.com',
          department: 'computer-science',
          enrolledCourses: ['Business Strategy'],
          status: 'not-enrolled',
          createdAt: '2024-01-05T09:15:00Z'
        }
      ];
      setStudents(demoStudents);
      return;
    }

    // For real users, fetch from API
    try {
      const response = await fetch('http://localhost:5000/api/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback to empty array
      setStudents([]);
    }
  };

  // Load calendar events from API
  const loadCalendarEvents = async () => {
    const token = localStorage.getItem('token');

    // For demo users, use shared localStorage
    if (token === 'demo-token') {
      // Get existing demo events from localStorage
      const existingDemoEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]');

      // Default demo events if none exist
      const defaultDemoEvents = [
        {
          id: 'demo-event-1',
          title: 'Web Development Lecture',
          date: '2024-02-15',
          time: '10:00 AM',
          courseTitle: 'Web Development Fundamentals',
          description: 'Introduction to HTML, CSS, and JavaScript',
          information: 'Bring your laptops',
          instructor: 'Dr. Sarah Johnson',
          instructorName: 'Dr. Sarah Johnson'
        },
        {
          id: 'demo-event-2',
          title: 'Database Systems Quiz',
          date: '2024-02-18',
          time: '2:00 PM',
          courseTitle: 'Database Systems',
          description: 'Quiz on SQL and database design',
          information: 'Closed book exam',
          instructor: 'Prof. Michael Brown',
          instructorName: 'Prof. Michael Brown'
        }
      ];

      // Combine existing and default events, removing duplicates
      const allDemoEvents = [...defaultDemoEvents, ...existingDemoEvents]
        .filter((event, index, self) =>
          index === self.findIndex(e => e.id === event.id)
        );

      setEvents(allDemoEvents);
      return;
    }

    // For real users, fetch from API
    try {
      const response = await fetch('http://localhost:5000/api/calendar/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
      // Fallback to empty array
      setEvents([]);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.courseTitle || !newEvent.description) {
      alert('Please fill in all required fields');
      return;
    }

    const token = localStorage.getItem('token');

    // For demo users, use shared localStorage
    if (token === 'demo-token') {
      const event = {
        id: Date.now().toString(),
        ...newEvent,
        instructor: user ? `${user.firstName} ${user.lastName}` : newEvent.instructor,
        instructorName: user ? `${user.firstName} ${user.lastName}` : newEvent.instructor
      };

      // Add to local state
      setEvents(prev => [...prev, event]);

      // Save to shared localStorage so students can see it
      const existingDemoEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]');
      const updatedDemoEvents = [...existingDemoEvents, event];
      localStorage.setItem('demoEvents', JSON.stringify(updatedDemoEvents));

      setShowAddEventModal(false);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        courseTitle: '',
        description: '',
        information: '',
        instructor: user ? `${user.firstName} ${user.lastName}` : ''
      });
      alert('Event added successfully! (Demo Mode)');
      return;
    }

    // For real users, use API
    try {
      const response = await fetch('http://localhost:5000/api/calendar/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newEvent,
          instructorName: user ? `${user.firstName} ${user.lastName}` : newEvent.instructor
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh events list
        loadCalendarEvents();
        setShowAddEventModal(false);
        setNewEvent({
          title: '',
          date: '',
          time: '',
          courseTitle: '',
          description: '',
          information: '',
          instructor: user ? `${user.firstName} ${user.lastName}` : ''
        });
        alert('Event added successfully!');
      } else {
        alert('Error adding event: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    }
  };

  // Handle article download
  const handleDownloadArticle = async (article) => {
    const token = localStorage.getItem('token');

    // For demo users, simulate download
    if (token === 'demo-token') {
      // Create a demo PDF blob for demonstration
      const demoContent = `Demo Article: ${article.title}\n\nThis is a demonstration of the PDF download functionality.\n\nIn the full version, this would download the actual PDF file uploaded by the instructor.\n\nArticle Details:\n- Title: ${article.title}\n- Author: ${article.author?.firstName} ${article.author?.lastName}\n- Department: ${article.department}\n- Category: ${article.category}\n- Description: ${article.description}`;

      const blob = new Blob([demoContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_demo.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Demo file downloaded! In the full version, this would be the actual PDF.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/articles/${article._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', article.fileName || 'article.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download article');
        alert('Failed to download article');
      }
    } catch (error) {
      console.error('Error downloading article:', error);
      alert('Error downloading article');
    }
  };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo">
              <img src="/STUDYI.png" alt="STUDY-i" />
              <span>STUDY-i</span>
            </div>
          </div>
          
          <div className="nav-center">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search articles, discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="nav-right">
            <button className="btn-icon">
              <FaBell />
            </button>
            
            <div className="dashboard-nav-menu">
              <button 
                className="btn-icon"
                onClick={() => setShowNavMenu(!showNavMenu)}
                aria-label="Navigation menu"
              >
                <FaCog />
              </button>
              
              {showNavMenu && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <h4>Navigation</h4>
                  </div>
                  <div className="nav-dropdown-items">
                    <Link to="/dashboard" className="nav-dropdown-item">
                      <FaUserGraduate />
                      Dashboard
                    </Link>
                    <Link to="/chat" className="nav-dropdown-item">
                      <FaComments />
                      Chat
                    </Link>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <Link to="/articles" className="nav-dropdown-item">
                        <FaBook />
                        Article Manager
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <span>{user.firstName.charAt(0)}</span>
                )}
              </button>
              
              {showUserMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <span className="user-role">
                        {getRoleIcon()}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-items">
                    <button className="dropdown-item">
                      <FaCog />
                      Settings
                    </button>
                    <button className="dropdown-item">
                      <FaUserGraduate />
                      Profile
                    </button>
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaArrowRight />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="header-left">
              <h1>{getRoleTitle()}</h1>
              <p>{getRoleDescription()}</p>
            </div>
            <div className="header-right">
              <div className="header-logo">
                <img src="/BLACK-BG-LOGO.png" alt="STUDY-i" />
              </div>
            </div>
          </div>

          {/* Article Upload Modal */}
          {showArticleModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Publish New Article</h2>
                <form onSubmit={handleArticleSubmit} encType="multipart/form-data">
                  <div className="form-group">
                    <label>Article Title *</label>
                    <input type="text" name="title" value={newArticle.title} onChange={handleArticleInput} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select name="department" value={newArticle.department} onChange={handleArticleInput} required>
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
                      <label>Category *</label>
                      <select name="category" value={newArticle.category} onChange={handleArticleInput} required>
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
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea name="description" value={newArticle.description} onChange={handleArticleInput} rows="3" required />
                  </div>

                  <div className="form-group">
                    <label>Content *</label>
                    <textarea name="content" value={newArticle.content} onChange={handleArticleInput} rows="6" required />
                  </div>

                  <div className="form-group">
                    <label>Cover Image (Optional)</label>
                    <input type="file" name="cover" accept="image/*" onChange={handleArticleInput} />
                    {newArticle.coverPreview && (
                      <img src={newArticle.coverPreview} alt="Cover Preview" style={{ width: 120, marginTop: 8, borderRadius: 8 }} />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Article PDF *</label>
                    <input type="file" name="pdf" accept="application/pdf" onChange={handleArticleInput} required />
                    {newArticle.pdfName && (
                      <div style={{ marginTop: 8, color: '#555' }}>Selected: {newArticle.pdfName}</div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Submit for Approval</button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowArticleModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Approval Modal */}
          {showApprovalModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Article Approval Status</h2>
                <div className="approval-list">
                  {myArticles.length === 0 ? (
                    <p>No articles submitted yet.</p>
                  ) : (
                    myArticles.map(article => (
                      <div key={article._id || article.id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{article.title}</div>
                          <div style={{ color: '#888', fontSize: 14 }}>
                            {article.author?.firstName && article.author?.lastName
                              ? `${article.author.firstName} ${article.author.lastName}`
                              : article.author || 'Unknown Author'} | {article.department}
                          </div>
                          <div style={{ fontSize: 13, color: '#555' }}>Category: {article.category}</div>
                          <div style={{ fontSize: 13, color: '#555' }}>
                            Status: <span style={{
                              color: article.status === 'approved' ? 'green' :
                                     article.status === 'rejected' ? 'red' : '#bfa600'
                            }}>
                              {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
                            </span>
                          </div>
                          {article.status === 'rejected' && article.rejectionReason && (
                            <div style={{ color: 'red', fontSize: 13 }}>Reason: {article.rejectionReason}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {article.status === 'approved' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleDownloadArticle(article)}>
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="form-actions" style={{ marginTop: 16 }}>
                  <button className="btn btn-outline" onClick={() => setShowApprovalModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="stats-grid">
            {dashboardData.stats.map((stat, index) => {
              // For admin, animate the 'Total Users' stat card
              if (user.role === 'admin' && stat.label === 'Total Users') {
                return (
                  <motion.div 
                    key={index}
                    className={`stat-card stat-${stat.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {stat.value}
                      </div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              }
              // Default for other stat cards
              return (
                <motion.div 
                  key={index}
                  className={`stat-card stat-${stat.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="mobile-nav-toggle">
            <button 
              className="mobile-nav-btn"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
              Navigation
            </button>
          </div>

          {/* Sidebar - Hidden on mobile, shown after toggle */}
          <aside className={`dashboard-sidebar ${showMobileNav ? 'mobile-active' : ''}`}>
            <nav className="sidebar-nav">
              {/* Remove Overview tab for all roles */}
              {/* <button className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><FaChartLine /> Overview</button> */}
              <button className={`sidebar-item ${activeTab === 'discussions' ? 'active' : ''}`} onClick={() => setActiveTab('discussions')}><FaComments /> Discussions</button>
              <button className={`sidebar-item ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}><FaFileAlt /> Articles</button>
              <button className={`sidebar-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}><FaBook /> Courses</button>
              {(user.role === 'instructor' || user.role === 'admin') && (
                <button className={`sidebar-item ${activeTab === 'mybooks' ? 'active' : ''}`} onClick={() => setActiveTab('mybooks')}><FaFileAlt /> Article Manager</button>
              )}
              <button className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><FaCalendar /> Calendar</button>
              {user.role === 'admin' && (
                <>
                  <button className={`sidebar-item ${activeTab === 'manageusers' ? 'active' : ''}`} onClick={() => setActiveTab('manageusers')}><FaUsers /> Manage Users</button>
                  <button className={`sidebar-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}><FaCheckCircle /> Review Approvals</button>
                  <a href="/admin" className="sidebar-item admin-link"><FaShieldAlt /> Admin Panel</a>
                  <a href="/admin-approval" className="sidebar-item admin-link"><FaCheckCircle /> Admin Approval Panel</a>
                </>
              )}
              {user.role === 'instructor' && (
                <button className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><FaUsers /> Manage Students</button>
              )}
            </nav>
          </aside>

          {/* Main Content Grid - always full width for all roles */}
          <div className="dashboard-grid">
            {/* Remove Overview tab content for all roles */}
            {/* {activeTab === 'overview' && user.role !== 'admin' && ( ... )} */}

            {activeTab === 'discussions' && (
              <motion.div 
                className="dashboard-card discussions-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-header">
                  <h3>Discussions</h3>
                  <button className="btn btn-primary btn-sm">
                    <FaPlus />
                    New Discussion
                  </button>
                </div>
                <div className="discussions-content">
                  <div className="discussion-filters">
                    <h4>Choose Your Course Discussion:</h4>
                    <div className="course-filters">
                      <button className="course-filter active">All Courses</button>
                      <button className="course-filter">Web Development</button>
                      <button className="course-filter">Database Systems</button>
                      <button className="course-filter">Advanced Mathematics</button>
                    </div>
                  </div>
                  <div className="discussion-item">
                    <div className="discussion-icon">
                      <FaComments />
                    </div>
                    <div className="discussion-content">
                      <h4>Computer Science Department Discussion</h4>
                      <p>Latest updates and announcements for CS students</p>
                      <div className="discussion-meta">
                        <span>Course: Web Development</span>
                        <span>• 45 participants</span>
                        <span>• 12 new messages</span>
                        <span>• 2 hours ago</span>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm">Join</button>
                  </div>
                  <div className="discussion-item">
                    <div className="discussion-icon">
                      <FaComments />
                    </div>
                    <div className="discussion-content">
                      <h4>Web Development Team</h4>
                      <p>Collaboration space for web development projects</p>
                      <div className="discussion-meta">
                        <span>Course: Web Development</span>
                        <span>• 12 participants</span>
                        <span>• 3 new messages</span>
                        <span>• 1 day ago</span>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm">Join</button>
                  </div>
                  <div className="discussion-item">
                    <div className="discussion-icon">
                      <FaComments />
                    </div>
                    <div className="discussion-content">
                      <h4>Database Design Questions</h4>
                      <p>Help and support for database systems course</p>
                      <div className="discussion-meta">
                        <span>Course: Database Systems</span>
                        <span>• 28 participants</span>
                        <span>• 8 new messages</span>
                        <span>• 3 hours ago</span>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm">Join</button>
                  </div>
                  <div className="discussion-item">
                    <div className="discussion-icon">
                      <FaComments />
                    </div>
                    <div className="discussion-content">
                      <h4>Math Problem Solving</h4>
                      <p>Advanced mathematics problem discussions</p>
                      <div className="discussion-meta">
                        <span>Course: Advanced Mathematics</span>
                        <span>• 35 participants</span>
                        <span>• 5 new messages</span>
                        <span>• 5 hours ago</span>
                      </div>
                    </div>
                    <button className="btn btn-outline btn-sm">Join</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'articles' && (
              <motion.div 
                className="dashboard-card articles-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-header">
                  <h3>Articles & Books</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      const token = localStorage.getItem('token');
                      if (token === 'demo-token') {
                        // For demo mode, refresh from localStorage
                        const demoArticles = JSON.parse(localStorage.getItem('demoArticles') || '[]');
                        const approvedDemoArticles = demoArticles.filter(article => article.status === 'approved');
                        setArticles(approvedDemoArticles);
                      } else {
                        // For real mode, refresh from API
                        if (window.refreshApprovedArticles) {
                          window.refreshApprovedArticles();
                        }
                      }
                    }}>
                      <FaSync /> Refresh
                    </button>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowArticleModal(true)}>
                        <FaPlus />
                        Add Article
                      </button>
                    )}
                  </div>
                </div>

                {articles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No approved articles available yet.</p>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Be the first to publish an article!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
                    {articles.map((article, idx) => (
                      <div key={article._id || idx} className="article-card" style={{
                        background: 'var(--white)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease-in-out'
                      }}>
                        {article.coverUrl && (
                          <img
                            src={article.coverUrl}
                            alt={article.title}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '0.5rem',
                              marginBottom: '1rem'
                            }}
                          />
                        )}
                        <h4 style={{
                          margin: '0 0 0.75rem 0',
                          color: 'var(--gray-800)',
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          lineHeight: '1.4'
                        }}>
                          {article.title}
                        </h4>
                        <p style={{
                          color: 'var(--gray-600)',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {article.description}
                        </p>
                        <div className="article-meta" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          marginBottom: '1rem',
                          fontSize: '0.75rem',
                          color: 'var(--gray-500)'
                        }}>
                          <div><strong>Author:</strong> {article.author?.firstName} {article.author?.lastName}</div>
                          <div><strong>Category:</strong> {article.category}</div>
                          <div><strong>Department:</strong> {article.department?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          {article.createdAt && (
                            <div><strong>Published:</strong> {new Date(article.createdAt).toLocaleDateString()}</div>
                          )}
                          {article.fileName && (
                            <div><strong>File:</strong> {article.fileName}</div>
                          )}
                          {article.stats?.downloads > 0 && (
                            <div><strong>Downloads:</strong> {article.stats.downloads}</div>
                          )}
                        </div>
                        <div className="article-actions" style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleDownloadArticle(article)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: '1px solid #10b981'
                            }}
                          >
                            <FaDownload /> Download PDF
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              // Show article preview modal or expand content
                              alert(`Viewing: ${article.title}\n\n${article.content || article.description}`);
                            }}
                          >
                            <FaEye /> View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div 
                className="dashboard-card calendar-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-header">
                  <h3>Calendar</h3>
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddEventModal(true)}>
                      <FaPlus />
                      Add Event
                    </button>
                  )}
                </div>
                <div className="calendar-content">
                  {/* Display courses */}
                  {courses.filter(course =>
                    user.role === 'student' ? enrolledCourses.includes(course.title) : true
                  ).map((course, idx) => (
                    <div className="calendar-event" key={`course-${idx}`}>
                      <div className="event-date">
                        <span className="event-day">{course.schedule ? new Date(course.schedule.date).getDate() : ''}</span>
                        <span className="event-month">{course.schedule ? new Date(course.schedule.date).toLocaleString('default', { month: 'short' }) : ''}</span>
                      </div>
                      <div className="event-content">
                        <h4>{course.title}</h4>
                        <p>{course.plan || course.description}</p>
                        <span className="event-time">{course.schedule ? course.schedule.time : ''}</span>
                        <span className="event-instructor">Instructor: {course.instructor}</span>
                      </div>
                    </div>
                  ))}

                  {/* Display custom events */}
                  {events.map((event, idx) => (
                    <div className="calendar-event" key={`event-${idx}`}>
                      <div className="event-date">
                        <span className="event-day">{event.date ? new Date(event.date).getDate() : ''}</span>
                        <span className="event-month">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : ''}</span>
                      </div>
                      <div className="event-content">
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                        <span className="event-time">{event.time}</span>
                        <span className="event-instructor">Course: {event.courseTitle}</span>
                        <span className="event-instructor">
                          Instructor: {
                            event.instructorName ||
                            (event.instructor && typeof event.instructor === 'object'
                              ? `${event.instructor.firstName} ${event.instructor.lastName}`
                              : event.instructor || 'Unknown Instructor'
                            )
                          }
                        </span>
                        {event.information && <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>{event.information}</p>}
                      </div>
                    </div>
                  ))}

                  {courses.filter(course =>
                    user.role === 'student' ? enrolledCourses.includes(course.title) : true
                  ).length === 0 && events.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No events scheduled</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div 
                className="dashboard-card courses-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-header">
                  <h3>Courses</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={loadCourses}>
                      <FaSync /> Refresh
                    </button>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowCreateCourseModal(true)}>
                        <FaPlus />
                        Create Course
                      </button>
                    )}
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <FaBook size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No courses available yet.</p>
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Create the first course to get started!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
                    {courses.map((course, idx) => (
                      <div key={course._id || idx} className="course-card" style={{
                        background: 'var(--white)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s ease-in-out'
                      }}>
                        <div className="course-header" style={{ marginBottom: '1rem' }}>
                          <h4 style={{
                            margin: '0 0 0.5rem 0',
                            color: 'var(--gray-800)',
                            fontSize: '1.25rem',
                            fontWeight: '600'
                          }}>
                            {course.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{
                              background: 'var(--primary-brown)',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {course.courseCode}
                            </span>
                            <span style={{
                              background: course.level === 'beginner' ? '#10b981' :
                                         course.level === 'intermediate' ? '#f59e0b' : '#ef4444',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                            </span>
                            <span style={{
                              background: 'var(--gray-100)',
                              color: 'var(--gray-700)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem'
                            }}>
                              {course.credits} Credits
                            </span>
                          </div>
                        </div>

                        <p style={{
                          color: 'var(--gray-600)',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {course.description}
                        </p>

                        <div className="course-meta" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          marginBottom: '1rem',
                          fontSize: '0.75rem',
                          color: 'var(--gray-500)'
                        }}>
                          <div><strong>Instructor:</strong> {course.instructorName || course.instructor}</div>
                          <div><strong>Duration:</strong> {course.duration}</div>
                          <div><strong>Department:</strong> {course.department?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                          {course.startDate && (
                            <div><strong>Starts:</strong> {new Date(course.startDate).toLocaleDateString()}</div>
                          )}
                          {course.maxStudents && (
                            <div><strong>Max Students:</strong> {course.maxStudents}</div>
                          )}
                          {course.enrolledStudents && (
                            <div><strong>Enrolled:</strong> {course.enrolledStudents.length || 0} students</div>
                          )}
                        </div>

                        <div className="course-actions" style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'flex-end'
                        }}>
                          {user.role === 'student' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleEnroll(course)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <FaPlus /> Enroll
                            </button>
                          )}
                          {(user.role === 'instructor' || user.role === 'admin') && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                alert(`Course Details:\n\nTitle: ${course.title}\nCode: ${course.courseCode}\nDescription: ${course.description}\nInstructor: ${course.instructorName}\nCredits: ${course.credits}\nLevel: ${course.level}\nDuration: ${course.duration}\nMax Students: ${course.maxStudents}\nEnrolled: ${course.enrolledStudents?.length || 0}`);
                              }}
                            >
                              <FaEye /> View Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Course Enrollment Modal for Students */}
                {showEnrollModal && user.role === 'student' && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h2>Available Courses</h2>
                      <div className="courses-content">
                        {courses.filter(course => !enrolledCourses.includes(course.title)).map((course, idx) => (
                          <div className="course-item" key={idx}>
                            <div className="course-icon">
                              <FaBook />
                            </div>
                            <div className="course-content">
                              <h4>{course.title}</h4>
                              <p>{course.description}</p>
                              <div className="course-meta">
                                <span>Instructor: {course.instructor}</span>
                                <span>• {course.modules ? `Modules: ${course.modules}` : ''}</span>
                                <span>• {course.schedule ? `${course.schedule.date} ${course.schedule.time}` : ''}</span>
                              </div>
                              {course.plan && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}><strong>Plan:</strong> {course.plan}</div>}
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => { handleEnroll(course); setShowEnrollModal(false); }}>Enroll</button>
                          </div>
                        ))}
                      </div>
                      <div className="form-actions">
                        <button className="btn btn-outline" onClick={() => setShowEnrollModal(false)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Create Course Modal */}
                {showCreateCourseModal && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h2>Create New Course</h2>
                      <form onSubmit={handleCreateCourse} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label>Course Title *</label>
                            <input type="text" name="title" value={newCourse.title} onChange={handleCourseInput} required />
                          </div>
                          <div className="form-group">
                            <label>Course Code *</label>
                            <input
                              type="text"
                              name="courseCode"
                              value={newCourse.courseCode}
                              onChange={handleCourseInput}
                              placeholder="e.g., CS101"
                              style={{ textTransform: 'uppercase' }}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Description *</label>
                          <textarea
                            name="description"
                            value={newCourse.description}
                            onChange={handleCourseInput}
                            rows="3"
                            required
                          />
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label>Credits *</label>
                            <select name="credits" value={newCourse.credits} onChange={handleCourseInput} required>
                              <option value={1}>1 Credit</option>
                              <option value={2}>2 Credits</option>
                              <option value={3}>3 Credits</option>
                              <option value={4}>4 Credits</option>
                              <option value={5}>5 Credits</option>
                              <option value={6}>6 Credits</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Duration *</label>
                            <select name="duration" value={newCourse.duration} onChange={handleCourseInput} required>
                              <option value="1 semester">1 Semester</option>
                              <option value="2 semesters">2 Semesters</option>
                              <option value="1 year">1 Year</option>
                              <option value="2 years">2 Years</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Level *</label>
                            <select name="level" value={newCourse.level} onChange={handleCourseInput} required>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label>Start Date *</label>
                            <input type="date" name="startDate" value={newCourse.startDate} onChange={handleCourseInput} required />
                          </div>
                          <div className="form-group">
                            <label>End Date *</label>
                            <input type="date" name="endDate" value={newCourse.endDate} onChange={handleCourseInput} required />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Max Students</label>
                          <input
                            type="number"
                            name="maxStudents"
                            value={newCourse.maxStudents}
                            onChange={handleCourseInput}
                            min="1"
                            max="100"
                          />
                        </div>

                        <div className="form-group">
                          <label>Prerequisites</label>
                          <input
                            type="text"
                            name="prerequisites"
                            value={newCourse.prerequisites}
                            onChange={handleCourseInput}
                            placeholder="Separate multiple prerequisites with commas"
                          />
                        </div>

                        <div className="form-group">
                          <label>Course Objectives</label>
                          <textarea
                            name="objectives"
                            value={newCourse.objectives}
                            onChange={handleCourseInput}
                            rows="2"
                            placeholder="Separate multiple objectives with commas"
                          />
                        </div>

                        <div className="form-group">
                          <label>Syllabus</label>
                          <textarea
                            name="syllabus"
                            value={newCourse.syllabus}
                            onChange={handleCourseInput}
                            rows="3"
                            placeholder="Course syllabus and topics covered"
                          />
                        </div>

                        <div className="form-group">
                          <label>Tags</label>
                          <input
                            type="text"
                            name="tags"
                            value={newCourse.tags}
                            onChange={handleCourseInput}
                            placeholder="Separate tags with commas (e.g., programming, web, frontend)"
                          />
                        </div>

                        <div className="form-actions">
                          <button type="submit" className="btn btn-primary">Create Course</button>
                          <button type="button" className="btn btn-outline" onClick={() => setShowCreateCourseModal(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'mybooks' && (
              <motion.div className="dashboard-card my-articles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="card-header">
                  <h3>Article Manager</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={loadMyArticles}>
                      <FaSync /> Refresh
                    </button>
                    {/* Only show publish button for instructors */}
                    {(user.role === 'instructor' || user.role === 'admin') && (
                      <button className="btn btn-primary btn-sm" onClick={() => setShowArticleModal(true)}>
                        <FaPlus /> Publish New Article
                      </button>
                    )}
                  </div>
                </div>
                <div className="articles-grid">
                  {myArticles.length === 0 ? (
                    <p>No articles published yet.</p>
                  ) : (
                    myArticles.map(article => (
                      <div key={article._id || article.id} className="article-card">
                        {article.coverUrl && (
                          <img src={article.coverUrl} alt={article.title} style={{ width: '100%', borderRadius: 8 }} />
                        )}
                        <h4>{article.title}</h4>
                        <p>{article.description}</p>
                        <div className="article-meta">
                          <span>Status: <strong style={{
                            color: article.status === 'approved' ? 'green' :
                                   article.status === 'rejected' ? 'red' : '#bfa600'
                          }}>
                            {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
                          </strong></span>
                          <span>Category: {article.category}</span>
                        </div>
                        {article.status === 'approved' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleDownloadArticle(article)}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <FaDownload /> Download PDF
                            </button>
                            {article.fileName && (
                              <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                                File: {article.fileName}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && user.role === 'instructor' && (
              <motion.div className="dashboard-card manage-students" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="card-header">
                  <h3>Manage Students</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={loadStudents}>
                      <FaSync /> Refresh
                    </button>
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #ccc' }}
                    />
                  </div>
                </div>
                <div className="students-list">
                  {students.filter(s => {
                    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                    const searchTerm = studentSearch.toLowerCase();
                    return fullName.includes(searchTerm) || s.email.toLowerCase().includes(searchTerm);
                  }).length === 0 ? (
                    <p>No students found.</p>
                  ) : (
                    students.filter(s => {
                      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                      const searchTerm = studentSearch.toLowerCase();
                      return fullName.includes(searchTerm) || s.email.toLowerCase().includes(searchTerm);
                    }).map(student => (
                      <div key={student._id} className="student-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                          <div style={{ color: '#888', fontSize: 14 }}>{student.email}</div>
                          <div style={{ fontSize: 13, color: '#555' }}>
                            Department: {student.department?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div style={{ fontSize: 13, color: '#555' }}>
                            Courses: {student.enrolledCourses?.length > 0 ? student.enrolledCourses.join(', ') : 'No courses enrolled'}
                          </div>
                          <div style={{ fontSize: 13, color: student.status === 'enrolled' ? 'green' : '#888' }}>
                            Status: {student.status === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}
                          </div>
                          <div style={{ fontSize: 12, color: '#999' }}>
                            Joined: {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => alert(`Viewing profile for ${student.firstName} ${student.lastName}`)}
                          >
                            View Profile
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => alert(`Sending message to ${student.firstName} ${student.lastName}`)}
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'manageusers' && user.role === 'admin' && (
              <motion.div className="dashboard-card manage-users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="card-header"><h3>Manage Users</h3></div>
                <div className="users-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td>{u.firstName} {u.lastName}</td>
                          <td>{u.email}</td>
                          <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                          <td>{u.department}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedUser(u); setShowUserModal(true); }}>View More</button>
                            {u.id !== user.id && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)} style={{ marginLeft: 8 }}>
                                <FaTrash /> Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* User Details Modal */}
                {showUserModal && selectedUser && (
                  <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 500 }}>
                      <h2>User Details</h2>
                      <div style={{ marginBottom: 12 }}><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                      <div style={{ marginBottom: 12 }}><strong>Email:</strong> {selectedUser.email}</div>
                      <div style={{ marginBottom: 12 }}><strong>Role:</strong> {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</div>
                      <div style={{ marginBottom: 12 }}><strong>Department:</strong> {selectedUser.department}</div>
                      {selectedUser.phone && <div style={{ marginBottom: 12 }}><strong>Phone:</strong> {selectedUser.phone}</div>}
                      {selectedUser.joined && <div style={{ marginBottom: 12 }}><strong>Joined:</strong> {selectedUser.joined}</div>}
                      {selectedUser.lastActive && <div style={{ marginBottom: 12 }}><strong>Last Active:</strong> {selectedUser.lastActive}</div>}
                      {selectedUser.status && <div style={{ marginBottom: 12 }}><strong>Status:</strong> {selectedUser.status}</div>}
                      {selectedUser.bio && <div style={{ marginBottom: 12 }}><strong>Bio:</strong> {selectedUser.bio}</div>}
                      {selectedUser.role === 'student' && selectedUser.enrolledCourses && selectedUser.enrolledCourses.length > 0 && (
                        <div style={{ marginBottom: 12 }}><strong>Enrolled Courses:</strong> <ul>{selectedUser.enrolledCourses.map(c => <li key={c}>{c}</li>)}</ul></div>
                      )}
                      {selectedUser.role === 'instructor' && selectedUser.teachingCourses && selectedUser.teachingCourses.length > 0 && (
                        <div style={{ marginBottom: 12 }}><strong>Teaching Courses:</strong> <ul>{selectedUser.teachingCourses.map(c => <li key={c}>{c}</li>)}</ul></div>
                      )}
                      <div className="form-actions">
                        <button className="btn btn-outline" onClick={() => setShowUserModal(false)}>Close</button>
                        {selectedUser.id !== user.id && (
                          <button className="btn btn-danger" onClick={() => handleDeleteUser(selectedUser.id)} style={{ marginLeft: 8 }}>
                            <FaTrash /> Delete User
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Review Approvals Section - Admin Only */}
            {activeTab === 'review' && user.role === 'admin' && (
              <motion.div className="dashboard-card review-approvals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="card-header">
                  <h3>Review Article Approvals</h3>
                  <button className="btn btn-primary btn-sm" onClick={loadPendingArticlesForReview}>
                    <FaSync /> Refresh
                  </button>
                </div>

                <div className="pending-articles-list">
                  {pendingArticlesForReview.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No articles pending approval</p>
                    </div>
                  ) : (
                    pendingArticlesForReview.map(article => (
                      <div key={article._id} className="pending-article-card">
                        <div className="article-info">
                          <h4>{article.title}</h4>
                          <p className="article-description">{article.description}</p>
                          <div className="article-meta">
                            <span><strong>Author:</strong> {article.author.firstName} {article.author.lastName} ({article.author.email})</span>
                            <span><strong>Department:</strong> {article.department}</span>
                            <span><strong>Category:</strong> {article.category}</span>
                            <span><strong>Submitted:</strong> {new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="article-content-preview">
                            <strong>Content Preview:</strong>
                            <p>{article.content.substring(0, 200)}...</p>
                          </div>
                        </div>

                        <div className="article-actions">
                          <button
                            className="btn btn-success"
                            onClick={() => handleApproveArticle(article._id)}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection (optional):');
                              if (reason !== null) { // User didn't cancel
                                handleRejectArticle(article._id, reason || 'Content does not meet platform standards');
                              }
                            }}
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Jitsi Modal */}
      {callModalOpen && currentCallCourse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90vw', height: '80vh', maxWidth: 900, maxHeight: 600, position: 'relative' }}>
            <h2 style={{ marginBottom: 8 }}>{currentCallCourse.title} Live Session</h2>
            <div style={{ marginBottom: 12, color: '#555', fontSize: 15 }}>
              Use the chat and screen sharing features in the toolbar below. Share this invite link for others to join:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input type="text" value={getRoomUrl(currentCallCourse)} readOnly style={{ width: '70%', padding: 4, borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }} />
              <button className="btn btn-outline btn-sm" onClick={handleCopyInvite}>Copy Invite Link</button>
              {copySuccess && <span style={{ color: 'green', fontWeight: 500 }}>{copySuccess}</span>}
            </div>
            <button className="btn btn-outline" style={{ position: 'absolute', top: 16, right: 16 }} onClick={handleCloseCallModal}>Close</button>
            <div style={{ width: '100%', height: '75%' }}>
              <Jitsi
                roomName={getRoomName(currentCallCourse)}
                displayName={user.firstName + ' ' + user.lastName}
                containerStyle={{ width: '100%', height: '100%' }}
                config={{
                  prejoinPageEnabled: false,
                  disableTileView: true,
                  toolbarButtons: [
                    'microphone', 'camera', 'desktop', 'chat', 'hangup', 'settings', 'videoquality', 'fullscreen', 'fodeviceselection', 'profile', 'shortcuts', 'tileview', 'select-background', 'mute-everyone', 'security'
                  ]
                }}
                interfaceConfig={{
                  TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop', 'chat', 'hangup', 'settings', 'videoquality', 'fullscreen', 'fodeviceselection', 'profile', 'shortcuts', 'tileview', 'select-background', 'mute-everyone', 'security'
                  ]
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="dashboard-notifications" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, background: '#fffbe6', borderBottom: '1px solid #ffe58f', padding: '0.5rem 2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{ color: '#ad8b00', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaBell /> {n.message}
              <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ad8b00', cursor: 'pointer' }} onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label>Assignment Title</label>
                <input type="text" name="title" value={newAssignment.title} onChange={handleAssignmentInput} required />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select name="course" value={newAssignment.course} onChange={handleAssignmentInput} required>
                  <option value="">Select Course</option>
                  {enrolledCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lecturer</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search lecturer by name, email, or department..."
                    value={lecturerSearchQuery}
                    onChange={(e) => handleLecturerSearch(e.target.value)}
                    required
                  />
                  {showLecturerSearch && filteredLecturers.length > 0 && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      background: 'white', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      maxHeight: '200px', 
                      overflowY: 'auto', 
                      zIndex: 1000 
                    }}>
                      {filteredLecturers.map(lecturer => (
                        <div 
                          key={lecturer.id} 
                          style={{ 
                            padding: '8px 12px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid #eee',
                            fontSize: '14px'
                          }}
                          onClick={() => selectLecturer(lecturer)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: 'bold' }}>{lecturer.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {lecturer.email} • {lecturer.department}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={newAssignment.description} onChange={handleAssignmentInput} required />
              </div>
              <div className="form-group">
                <label>Assignment File</label>
                <input type="file" name="file" accept=".pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleAssignmentInput} required />
                {newAssignment.filePreview && (
                  <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
                    Selected: {newAssignment.filePreview}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Submit Assignment</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowSubmitAssignmentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Event</h2>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventInput}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleEventInput}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={newEvent.time}
                    onChange={handleEventInput}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  name="courseTitle"
                  value={newEvent.courseTitle}
                  onChange={handleEventInput}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventInput}
                  placeholder="Enter event description"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  name="information"
                  value={newEvent.information}
                  onChange={handleEventInput}
                  placeholder="Enter any additional information (optional)"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Instructor Name</label>
                <input
                  type="text"
                  name="instructor"
                  value={newEvent.instructor}
                  onChange={handleEventInput}
                  placeholder="Instructor name"
                  readOnly={user && (user.role === 'instructor')}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Event</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddEventModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
  };

export default Dashboard;