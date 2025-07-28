import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section main-section">
            <div className="footer-logo">
              <img src="/STUDYI.png" alt="Study" />
              <span>Study</span>
            </div>
            <p className="footer-description">
              A dynamic and inclusive Learning Management System designed for institutions, instructors, and learners across Cameroon. 
              Built using modern technologies, our platform supports seamless department-based navigation, role-based content access, 
              multilingual content support, and mobile-optimized experience for on-the-go learners.
            </p>
            <div className="footer-contact">
              <p><strong>Contact:</strong></p>
              <p>📞 +237 674 988 276</p>
              <p>📧 ojterry339@gmail.com</p>
              <p>🌐 <a href="https://ojterry.netlify.app" target="_blank" rel="noopener noreferrer">OJterry.netlify.app</a></p>
              <p>📍 Yaoundé, Cameroon</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 onClick={() => toggleSection('platform')} className="expandable-header">
              Platform <span className="expand-icon">{expandedSection === 'platform' ? '−' : '+'}</span>
            </h4>
            <div className={`expandable-content ${expandedSection === 'platform' ? 'expanded' : ''}`}>
              <ul>
                <li><Link to="/dashboard">Smart Dashboard</Link></li>
                <li><Link to="/chat">Real-time Discussion Chats</Link></li>
                <li><Link to="/articles">Article Management</Link></li>
                <li><Link to="#notifications">Interactive Notifications</Link></li>
                <li><Link to="#offline">Offline Access (Beta)</Link></li>
                <li><Link to="#gamification">Gamified Learning Paths</Link></li>
                <li><Link to="#customization">Theme Customization</Link></li>
              </ul>
              <div className="section-details">
                <p>Role-based content access (Student, Instructor, Administrator)</p>
                <p>Multilingual support (English, French, German)</p>
                <p>Mobile-optimized experience</p>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 onClick={() => toggleSection('books')} className="expandable-header">
              Books <span className="expand-icon">{expandedSection === 'books' ? '−' : '+'}</span>
            </h4>
            <div className={`expandable-content ${expandedSection === 'books' ? 'expanded' : ''}`}>
              <ul>
                <li><Link to="#computer-science">Computer Science & Engineering</Link></li>
                <li><Link to="#business">Business & Finance</Link></li>
                <li><Link to="#languages">Language & Literature</Link></li>
                <li><Link to="#health">Health & Biomedical Sciences</Link></li>
                <li><Link to="#law">Law & Social Sciences</Link></li>
                <li><Link to="#gce">GCE Preparation</Link></li>
                <li><Link to="#bts">BTS & HND Resources</Link></li>
              </ul>
              <div className="section-details">
                <p>Aligned with Ministry of Higher Education curricula</p>
                <p>National and international exam preparation</p>
                <p>Preview, download, bookmark, and comment features</p>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 onClick={() => toggleSection('support')} className="expandable-header">
              Support <span className="expand-icon">{expandedSection === 'support' ? '−' : '+'}</span>
            </h4>
            <div className={`expandable-content ${expandedSection === 'support' ? 'expanded' : ''}`}>
              <ul>
                <li><Link to="#help-center">Help Center</Link></li>
                <li><Link to="#contact">Contact Us</Link></li>
                <li><Link to="#privacy">Privacy Policy</Link></li>
                <li><Link to="#terms">Terms of Service</Link></li>
                <li><Link to="#login-help">Login Issues</Link></li>
                <li><Link to="#content-access">Content Access</Link></li>
                <li><Link to="#instructor-onboarding">Instructor Onboarding</Link></li>
              </ul>
              <div className="section-details">
                <p>Response time: 24–48 hours (working days)</p>
                <p>Support in English and French</p>
                <p>Service hours: Monday – Friday, 8 AM – 6 PM (WAT)</p>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 onClick={() => toggleSection('connect')} className="expandable-header">
              Connect <span className="expand-icon">{expandedSection === 'connect' ? '−' : '+'}</span>
            </h4>
            <div className={`expandable-content ${expandedSection === 'connect' ? 'expanded' : ''}`}>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="#blog">Blog</Link></li>
                <li><Link to="#careers">Careers</Link></li>
                <li><Link to="#partners">Partners</Link></li>
                <li><a href="#facebook" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="#tiktok" target="_blank" rel="noopener noreferrer">TikTok</a></li>
                <li><a href="#instagram" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              </ul>
              <div className="section-details">
                <p>Building a connected learning community across Africa</p>
                <p>Real stories from users and institutions</p>
                <p>Tech trends in education across Cameroon</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-partners">
          <h4>Our Partners</h4>
          <div className="partner-info">
            <div className="partner-logo">
              <h5>Konsul Institut</h5>
            </div>
            <div className="partner-details">
              <p>Leading language and academic preparation center for:</p>
              <ul>
                <li>German language learning (A1 to C1)</li>
                <li>Visa interview preparation</li>
                <li>Integration support for students relocating to Germany</li>
              </ul>
              <p><strong>High success rate for Cameroonian students aiming for international education.</strong></p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} STUDY-I. All rights reserved. | Built with ❤️ in Cameroon By OJterry</p>
          <p>Transforming education through digital innovation across Africa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 