<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">ChartMaker</h1>
        <p class="hero-subtitle">Transform Your Data into Beautiful Charts</p>
        <p class="hero-description">
          Upload CSV or Excel files, customize your charts, and export professional PDFs in minutes.
          No coding required.
        </p>
        <div class="hero-actions">
          <router-link to="/signup" class="btn btn-primary btn-large">
            Get Started Free
          </router-link>
          <router-link to="/login" class="btn btn-secondary btn-large">
            Sign In
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Why Choose ChartMaker?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <ChartBarIcon class="feature-icon" />
            <h3>Easy Data Import</h3>
            <p>Upload CSV or Excel files with drag-and-drop. Our intelligent parser automatically detects your data structure.</p>
          </div>
          <div class="feature-card">
            <PencilIcon class="feature-icon" />
            <h3>Edit Your Data</h3>
            <p>Make changes directly in the grid. Edit cells, fix errors, and see your updates instantly.</p>
          </div>
          <div class="feature-card">
            <ChartUpIcon class="feature-icon" />
            <h3>Multiple Chart Types</h3>
            <p>Create bar, line, area, pie, and scatter charts. Choose the perfect visualization for your data.</p>
          </div>
          <div class="feature-card">
            <PaintBrushIcon class="feature-icon" />
            <h3>Customize Everything</h3>
            <p>Customize colors, labels, legends, and more. Make your charts match your brand or style.</p>
          </div>
          <div class="feature-card">
            <EyeIcon class="feature-icon" />
            <h3>Live Preview</h3>
            <p>See your chart update in real-time as you make changes. No guessing, no waiting.</p>
          </div>
          <div class="feature-card">
            <DocumentArrowDownIcon class="feature-icon" />
            <h3>Export to PDF</h3>
            <p>Export your charts as high-quality PDFs. Perfect for reports, presentations, and sharing.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Upload Your Data</h3>
            <p>Upload CSV or Excel files containing your data. We'll automatically parse and validate it.</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Edit & Review</h3>
            <p>Review your data in an editable grid. Fix any errors or make adjustments as needed.</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Configure Chart</h3>
            <p>Select columns for your chart, choose chart type, and customize styling options.</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Export & Share</h3>
            <p>Export your chart as a high-quality PDF or view it in the browser. Share with your team.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Create Beautiful Charts?</h2>
        <p>Join thousands of users creating professional charts from their data.</p>
        <router-link to="/signup" class="btn btn-primary btn-large">
          Start Creating Now
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ChartBarIcon,
  PencilIcon,
  ChartBarIcon as ChartUpIcon,
  PaintBrushIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/vue/24/outline";
// Note: Authentication redirect is handled by router guard
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Section */
.hero-section {
  padding: 120px 20px 80px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 400;
  margin: 0 0 20px 0;
  opacity: 0.95;
}

.hero-description {
  font-size: 1.25rem;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-large {
  padding: 16px 40px;
  font-size: 1.1rem;
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 60px 0;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  color: #667eea;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.feature-card p {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 20px;
  background: #f8f9fa;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-top: 40px;
}

.step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.step p {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* CTA Section */
.cta-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  color: white;
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.cta-section p {
  font-size: 1.25rem;
  margin: 0 0 40px 0;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-large {
    width: 100%;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .steps {
    grid-template-columns: 1fr;
  }

  .cta-section h2 {
    font-size: 2rem;
  }
}
</style>

