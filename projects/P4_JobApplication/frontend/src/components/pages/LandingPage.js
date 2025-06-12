import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Find Your Dream Job or 
                <span className="gradient-text"> Perfect Candidate</span>
              </h1>
              <p className="hero-subtitle">
                Connect talented professionals with amazing opportunities. 
                Streamline your hiring process or discover your next career move.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  Sign In
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Active Jobs</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Professionals</span>
                </div>
                <div className="stat">
                  <span className="stat-number">1K+</span>
                  <span className="stat-label">Companies</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-cards">
                <div className="card card-1">
                  <div className="card-icon">💼</div>
                  <div className="card-content">
                    <h4>Software Engineer</h4>
                    <p>Remote • $80k-120k</p>
                  </div>
                </div>
                <div className="card card-2">
                  <div className="card-icon">🎨</div>
                  <div className="card-content">
                    <h4>UX Designer</h4>
                    <p>San Francisco • $70k-100k</p>
                  </div>
                </div>
                <div className="card card-3">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h4>Data Analyst</h4>
                    <p>New York • $60k-90k</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose JobFlow?</h2>
            <p>Powerful features designed to make job hunting and hiring effortless</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Smart Matching</h3>
              <p>Our AI-powered algorithm matches candidates with the perfect job opportunities based on skills, experience, and preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Access your dashboard, apply for jobs, or manage applications from anywhere with our responsive mobile interface.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Verified</h3>
              <p>All profiles and companies are verified to ensure authenticity and build trust in the hiring process.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Analytics Dashboard</h3>
              <p>Track your application progress, view hiring statistics, and get insights to improve your success rate.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications about application status, new job matches, and important updates via email.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Targeted Search</h3>
              <p>Advanced filtering options help you find exactly what you're looking for, whether you're hiring or job hunting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to get started on your career journey</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Sign up and build your professional profile with your skills, experience, and career preferences.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Discover Opportunities</h3>
                <p>Browse through thousands of job listings or post your job requirements to find the perfect match.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Apply & Connect</h3>
                <p>Submit applications with ease and connect directly with employers or candidates through our platform.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Track Progress</h3>
                <p>Monitor your application status, receive updates, and manage your entire hiring process from one dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of professionals who have found their dream jobs through JobFlow</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Your Journey
              </Link>
              <Link to="/jobs" className="btn btn-outline btn-large">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
