import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaFileAlt, 
  FaComments, 
  FaArrowRight,
  FaPlay,
  FaStar,
  FaBook,
  FaShoppingCart,
  FaEye,
  FaTimes,
  FaUserGraduate,
  FaUserTie,
  FaUserShield
} from 'react-icons/fa';
import Footer from './Footer';
import './LandingPage.css';

const LandingPage = ({ onShowAuth }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [authModalShown, setAuthModalShown] = useState(false);
  const navigate = useNavigate();
  const [dashboardBooks, setDashboardBooks] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Scroll-triggered auth modal (only show once)
    const handleScroll = () => {
      if (window.scrollY > 300 && !authModalShown) {
        setShowAuthModal(true);
        setAuthModalShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [authModalShown]);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Simulate fetching approved books from localStorage (to be replaced with backend call)
    const books = JSON.parse(localStorage.getItem('approvedBooks') || '[]');
    setDashboardBooks(books);
  }, []);

  const handleAuthAction = (action) => {
    setShowAuthModal(false);
    if (action === 'login') {
      navigate('/login');
    } else if (action === 'register') {
      navigate('/register');
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const features = [
    {
      icon: <FaGraduationCap />,
      title: "Personalized Learning",
      description: "Get content recommendations based on your interests and past interactions"
    },
    {
      icon: <FaUsers />,
      title: "Department Discussions",
      description: "Connect with peers and instructors in your department through real-time chat"
    },
    {
      icon: <FaFileAlt />,
      title: "Content Publishing",
      description: "Submit and share articles, PDFs, and course materials with approval workflow"
    },
    {
      icon: <FaComments />,
      title: "Interactive Learning",
      description: "Engage in meaningful discussions and collaborative learning experiences"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "5k+", label: "Instructors" },
    { number: "5k+", label: "Departments" },
    { number: "10k+", label: "Published Articles" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "The personalized dashboard has completely transformed how I discover and engage with learning materials.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Engineering Instructor",
      content: "The real-time discussion features make it easy to connect with students and foster collaborative learning.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Business Student",
      content: "I love how easy it is to submit and access course materials. The approval system ensures quality content.",
      rating: 5
    }
  ];

  const featuredBooks = [
    {
      id: 1,
      title: "Advanced Mathematics for Engineering",
      author: "Dr. Robert Wilson",
      publisher: "TechBooks Publishing",
      price: "54,000 FCFA",
      rating: 4.8,
      image: "/images/Advanced Mathematics for Engineering.png",
      category: "Engineering",
      description: "Comprehensive guide to advanced mathematical concepts for engineering students."
    },
    {
      id: 2,
      title: "Computer Science Fundamentals",
      author: "Prof. Lisa Chen",
      publisher: "CodePress",
      price: "45,300 FCFA",
      rating: 4.9,
      image: "/images/Computer Science Fundamentals.png",
      category: "Computer Science",
      description: "Essential concepts and practical applications in computer science."
    },
    {
      id: 3,
      title: "Business Strategy & Management",
      author: "Dr. James Rodriguez",
      publisher: "BusinessWise",
      price: "39,000 FCFA",
      rating: 4.7,
      image: "/images/Business Strategy & Management.png",
      category: "Business",
      description: "Modern business strategies and management principles for success."
    },
    {
      id: 4,
      title: "Medical Research Methods",
      author: "Dr. Sarah Thompson",
      publisher: "MedBooks",
      price: "57,000 FCFA",
      rating: 4.6,
      image: "/images/Medical Research Methods.png",
      category: "Medicine",
      description: "Comprehensive guide to medical research methodologies and practices."
    }
  ];

  // Merge static and dashboard-uploaded books
  const allFeaturedBooks = [...dashboardBooks, ...featuredBooks];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${hasScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-content">
            <div className="nav-logo">
              <img src="/STUDYI.png" alt="STUDY-i" />
              <span>STUDY-i</span>
            </div>
            
            <div className="nav-menu">
              <Link to="#features" className="nav-link">Features</Link>
              <Link to="#books" className="nav-link">Books</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="#contact" className="nav-link">Contact</Link>
            </div>
            
            <div className="nav-actions">
              <button 
                className="btn btn-outline"
                onClick={() => handleAuthAction('login')}
              >
                Sign In
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleAuthAction('register')}
              >
                Get Started
              </button>
            </div>
            
            <button 
              className="nav-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div className={`nav-menu-mobile ${showMobileMenu ? 'active' : ''}`}>
          <button 
            className="close-btn"
            onClick={() => setShowMobileMenu(false)}
            aria-label="Close navigation menu"
          >
            <FaTimes />
          </button>
          <Link to="#features" className="nav-link" onClick={() => setShowMobileMenu(false)}>Features</Link>
          <Link to="#books" className="nav-link" onClick={() => setShowMobileMenu(false)}>Books</Link>
          <Link to="/about" className="nav-link" onClick={() => setShowMobileMenu(false)}>About</Link>
          <Link to="#contact" className="nav-link" onClick={() => setShowMobileMenu(false)}>Contact</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Transform Your Learning Experience
            </h1>
            <p className="hero-subtitle">
              Connect, collaborate, and grow with our comprehensive Learning Management System. 
              Personalized content, real-time discussions, and seamless content sharing.
            </p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => handleAuthAction('register')}
              >
                Start Learning Free
                <FaArrowRight />
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => navigate('/dashboard')}
              >
                <FaPlay />
                Try Demo
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-image">
              <div className="floating-card card-1">
                <FaGraduationCap />
                <span>Learning Dashboard</span>
              </div>
              <div className="floating-card card-2">
                <FaComments />
                <span>Real-time Chat</span>
              </div>
              <div className="floating-card card-3">
                <FaFileAlt />
                <span>Content Library</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose Our LMS?</h2>
            <p>Discover the features that make learning more engaging and effective</p>
          </motion.div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section id="books" className="featured-books">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Featured Books from Top Publishers</h2>
            <p>Discover quality educational content from leading publishers and authors</p>
          </motion.div>
          
          <div className="books-grid">
            {allFeaturedBooks.map((book, index) => (
              <motion.div 
                key={book.id || index}
                className="book-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="book-image">
                  <img
                    src={book.coverUrl || book.image}
                    alt={book.title}
                    onError={(e) => {
                      // Try different image formats before falling back to placeholder
                      const currentSrc = e.target.src;
                      const basePath = `/images/${book.title}`;

                      if (currentSrc.includes('.png')) {
                        e.target.src = `${basePath}.jpg`;
                      } else if (currentSrc.includes('.jpg')) {
                        e.target.src = `${basePath}.jpeg`;
                      } else if (currentSrc.includes('.jpeg')) {
                        e.target.src = `${basePath}.webp`;
                      } else {
                        // Final fallback to placeholder
                        e.target.src = `https://via.placeholder.com/200x280/8B4513/FFFFFF?text=${encodeURIComponent(book.title.split(' ')[0])}`;
                      }
                    }}
                  />
                </div>
                <div className="book-category">{book.category}</div>
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-publisher">{book.publisher}</p>
                <p className="book-description">{book.description}</p>
                <div className="book-meta">
                  {book.rating && (
                    <div className="book-rating">
                      <FaStar />
                      <span>{book.rating}</span>
                    </div>
                  )}
                  {book.price && <div className="book-price">{book.price}</div>}
                  {book.contact && <div className="book-contact"><strong>Contact:</strong> {book.contact}</div>}
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="books-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <button 
              className="btn btn-primary btn-large"
              onClick={() => handleAuthAction('register')}
            >
              <FaBook />
              Browse All Books
            </button>
          </motion.div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Choose Your Learning Path</h2>
            <p>Different dashboards for different learning needs</p>
          </motion.div>
          
          <div className="user-types-grid">
            <motion.div 
              className="user-type-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="user-type-icon">
                <FaUserGraduate />
              </div>
              <h3>Student Dashboard</h3>
              <p>Access course materials, participate in discussions, and track your learning progress</p>
              <ul>
                <li>Personalized learning recommendations</li>
                <li>Real-time chat with peers</li>
                <li>Progress tracking and analytics</li>
                <li>Access to approved content library</li>
              </ul>
              <button 
                className="btn btn-primary"
                onClick={() => handleAuthAction('register')}
              >
                Start Learning
              </button>
            </motion.div>

            <motion.div 
              className="user-type-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="user-type-icon">
                <FaUserTie />
              </div>
              <h3>Lecturer/Publisher Dashboard</h3>
              <p>Publish content, manage courses, and engage with students</p>
              <ul>
                <li>Content creation and publishing</li>
                <li>Admin approval workflow</li>
                <li>Student engagement analytics</li>
                <li>Course management tools</li>
              </ul>
              <button 
                className="btn btn-primary"
                onClick={() => handleAuthAction('register')}
              >
                Start Publishing
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>What Our Users Say</h2>
            <p>Hear from students, instructors, and administrators</p>
          </motion.div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Learning?</h2>
            <p>Join thousands of students and instructors already using STUDY-i</p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => handleAuthAction('register')}
              >
                Get Started Free
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => handleAuthAction('login')}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Scroll-triggered Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="auth-modal-close" 
              onClick={() => setShowAuthModal(false)}
            >
              <FaTimes />
            </button>
            <div className="auth-modal-content">
              <div className="auth-modal-logo">
                <img src="/STUDYI.png" alt="STUDY-i" />
                <span>STUDY-i</span>
              </div>
              <h2>Join STUDY-i Learning Community</h2>
              <p>Sign in or create an account to access personalized learning content and features</p>
              <div className="auth-modal-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAuthAction('login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleAuthAction('register')}
                >
                  Create Account
                </button>
              </div>
              <p className="auth-modal-note">
                Continue browsing to explore our platform features
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 