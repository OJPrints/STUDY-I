import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaGlobe, 
  FaMobile, 
  FaShieldAlt,
  FaBook,
  FaComments,
  FaChartLine,
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaExternalLinkAlt
} from 'react-icons/fa';
import Footer from './Footer';
import './AboutUs.css';

const AboutUs = () => {
  const features = [
    {
      icon: <FaGraduationCap />,
      title: "Smart Dashboard",
      description: "Personalized student/instructor dashboard based on department, interests, and courses"
    },
    {
      icon: <FaComments />,
      title: "Real-time Discussion Chats",
      description: "Interactive chatrooms for course discussions within departments"
    },
    {
      icon: <FaShieldAlt />,
      title: "Admin-Controlled Article Management",
      description: "All uploads are reviewed for academic relevance before publishing"
    },
    {
      icon: <FaBook />,
      title: "Digital Book Repository",
      description: "Curated content aligned with Ministry of Higher Education curricula"
    },
    {
      icon: <FaGlobe />,
      title: "Multilingual Support",
      description: "Support for English, French, and German languages"
    },
    {
      icon: <FaMobile />,
      title: "Mobile-Optimized",
      description: "Seamless experience for on-the-go learners"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "500+", label: "Instructors" },
    { number: "50+", label: "Departments" },
    { number: "1000+", label: "Published Articles" }
  ];

  const team = [
    {
      name: "OJ Terry",
      role: "Founder & Lead Developer",
      description: "Passionate about transforming education through technology",
      contact: "ojterry339@gmail.com"
    }
  ];

  const values = [
    {
      icon: <FaHeart />,
      title: "Accessibility",
      description: "Ensuring every user has equal access to tools that drive academic success"
    },
    {
      icon: <FaGlobe />,
      title: "Inclusivity",
      description: "Building a platform that serves diverse learning communities across Cameroon"
    },
    {
      icon: <FaStar />,
      title: "Excellence",
      description: "Promoting African academic excellence through modern digital tools"
    },
    {
      icon: <FaChartLine />,
      title: "Innovation",
      description: "Continuously evolving to meet the changing needs of education"
    }
  ];

  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>About Study LMS</h1>
            <p className="hero-subtitle">
              A home-grown Cameroonian EdTech solution designed to digitalize and democratize education. 
              Built with passion by local developers, educators, and students.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <motion.div 
            className="mission-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Mission</h2>
            <p>
              Study-I is a dynamic and inclusive Learning Management System designed for institutions, 
              instructors, and learners across Cameroon. We aim to transform education through digital 
              innovation, ensuring every user has equal access to tools that drive academic success.
            </p>
            <div className="mission-highlights">
              <div className="highlight">
                <FaGraduationCap />
                <span>Encourages independent and collaborative learning</span>
              </div>
              <div className="highlight">
                <FaGlobe />
                <span>Bridges the tech gap in under-resourced areas</span>
              </div>
              <div className="highlight">
                <FaStar />
                <span>Promotes African academic excellence through modern tools</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Platform Features</h2>
            <p>Study-I is packed with powerful and intuitive features tailored for Cameroonian learners and institutions</p>
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
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
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

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Values</h2>
            <p>The principles that guide our mission to revolutionize education in Africa</p>
          </motion.div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Founder</h2>
            <p>The passionate individual behind Study-I</p>
          </motion.div>
          
          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div 
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="member-avatar">
                  <img src="/profile.jpg" alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
                <div className="member-contact">
                  <FaEnvelope />
                  <a href={`mailto:${member.contact}`}>{member.contact}</a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Partners</h2>
            <p>Collaborating with leading institutions to enhance educational opportunities</p>
          </motion.div>
          
          <motion.div 
            className="partner-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="partner-header">
              <h3>Konsul Institut</h3>
              <span className="partner-badge">Official Partner</span>
            </div>
            <div className="partner-content">
              <div className="partner-info">
                <p>
                  We proudly partner with Konsul Institut, a leading language and academic preparation 
                  center for German language learning and international education preparation.
                </p>
                <div className="partner-services">
                  <h4>Services Offered:</h4>
                  <ul>
                    <li>German language learning (A1 to C1 levels)</li>
                    <li>Visa interview preparation</li>
                    <li>Integration support for students relocating to Germany</li>
                    <li>Academic preparation for international studies</li>
                  </ul>
                </div>
                <div className="partner-highlight">
                  <strong>High success rate for Cameroonian students aiming for international education.</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <motion.div 
            className="contact-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Get in Touch</h2>
            <p>Ready to transform education together? We'd love to hear from you!</p>
            
            <div className="contact-info">
              <div className="contact-item">
                <FaPhone />
                <div>
                  <h4>Phone/WhatsApp</h4>
                  <p>+237 674 988 276</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FaEnvelope />
                <div>
                  <h4>Email</h4>
                  <p>ojterry339@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FaMapMarkerAlt />
                <div>
                  <h4>Location</h4>
                  <p>Yaoundé, Cameroon</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FaExternalLinkAlt />
                <div>
                  <h4>Portfolio</h4>
                  <a href="https://ojterry.netlify.app" target="_blank" rel="noopener noreferrer">
                    OJterry.netlify.app
                  </a>
                </div>
              </div>
            </div>
            
            <div className="service-hours">
              <h4>Service Hours</h4>
              <p>Monday – Friday, 8 AM – 6 PM (WAT)</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs; 