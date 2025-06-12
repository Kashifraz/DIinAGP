const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Generate PDF from CV data
const generatePDF = async (req, res) => {
  try {
    const cvData = req.body;

    if (!cvData || !cvData.name) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required'
      });
    }

    // Generate template-specific HTML content
    const htmlContent = generateTemplateHTML(cvData);

    // Launch Puppeteer with different configuration
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ 
        width: 800, 
        height: 600,
        deviceScaleFactor: 1
      });
      
      // Set content
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate PDF with explicit options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        displayHeaderFooter: false,
        preferCSSPageSize: false,
        scale: 1
      });

      await browser.close();

      // Basic validation
      if (pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      // Set proper headers for PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cvData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      // Send the PDF buffer directly
      res.end(pdfBuffer);

    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      throw puppeteerError;
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Generate simple HTML
const generateTemplateHTML = (cvData) => {
  const user = cvData.user || {};
  const sections = cvData.sections || [];
  const template = cvData.template || {};
  
  console.log('=== TEMPLATE HTML GENERATION ===');
  console.log('Template:', template.name);
  console.log('User:', user.fullName);
  console.log('Sections count:', sections.length);
  
  // Get visible sections in order
  const visibleSections = sections
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);
    
  console.log('Visible sections:', visibleSections.map(s => s.name));

  // Use template-specific HTML generation based on template name
  switch (template.name) {
    case 'Professional Classic':
      return generateProfessionalClassicHTML(cvData, user, visibleSections);
    case 'Modern Minimal':
      return generateModernMinimalHTML(cvData, user, visibleSections);
    case 'Creative Portfolio':
      return generateCreativePortfolioHTML(cvData, user, visibleSections);
    case 'Classic Executive':
      return generateClassicExecutiveHTML(cvData, user, visibleSections);
    case 'Minimal Clean':
      return generateMinimalCleanHTML(cvData, user, visibleSections);
    default:
      return generateProfessionalClassicHTML(cvData, user, visibleSections);
  }

};

// Template-specific HTML generators
const generateProfessionalClassicHTML = (cvData, user, visibleSections) => {
  const sectionsHTML = visibleSections.map(section => generateSectionHTML(section, user)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Source Sans Pro', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: #f8f9fa;
        }
        .cv-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem 2.5rem;
            text-align: center;
            position: relative;
        }
        .header-section::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        }
        .name {
            font-family: 'Playfair Display', serif;
            font-size: 2.4rem;
            font-weight: 700;
            margin-bottom: 0.6rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .title {
            font-size: 1.1rem;
            font-weight: 300;
            margin-bottom: 1.2rem;
            opacity: 0.9;
        }
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .contact-item {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.1);
            padding: 0.8rem;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        .contact-item strong {
            margin-right: 0.5rem;
            font-weight: 600;
        }
        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            min-height: 600px;
        }
        .sidebar {
            background: #2c3e50;
            color: white;
            padding: 2.5rem 2rem;
        }
        .sidebar h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #ecf0f1;
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        .sidebar p {
            color: #bdc3c7;
            line-height: 1.7;
            margin-bottom: 2rem;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
        }
        .skill-tag {
            background: #3498db;
            color: white;
            padding: 0.6rem 1rem;
            border-radius: 20px;
            text-align: center;
            font-size: 0.85rem;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .content-area {
            padding: 2.5rem;
            background: white;
        }
        .content-area h2 {
            font-family: 'Playfair Display', serif;
            font-size: 1.6rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1.5rem;
            position: relative;
            padding-bottom: 0.5rem;
        }
        .content-area h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .experience-item, .education-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            transition: transform 0.2s ease;
        }
        .experience-item:hover, .education-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.8rem;
        }
        .item-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.3rem;
        }
        .item-company {
            color: #7f8c8d;
            font-size: 1rem;
            font-weight: 500;
        }
        .item-date {
            background: #3498db;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .item-description {
            color: #555;
            line-height: 1.6;
            margin-top: 0.8rem;
        }
        .section-divider {
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            margin: 2rem 0;
            border-radius: 1px;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <header class="header-section">
            <h1 class="name">${user.fullName || 'Your Name'}</h1>
            <div class="title">Senior Software Engineer</div>
            <div class="contact-grid">
                <div class="contact-item">
                    <strong>Email:</strong> ${user.email || 'your.email@example.com'}
                </div>
                <div class="contact-item">
                    <strong>Phone:</strong> ${user.phone || '+1 (555) 123-4567'}
                </div>
                <div class="contact-item">
                    <strong>Location:</strong> ${user.location || 'New York, NY'}
                </div>
            </div>
        </header>
        
        <div class="main-content">
            <div class="sidebar">
                <h2>Profile</h2>
                <p>Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.</p>
                
                <h2>Skills</h2>
                <div class="skills-grid">
                    <div class="skill-tag">JavaScript</div>
                    <div class="skill-tag">React</div>
                    <div class="skill-tag">Node.js</div>
                    <div class="skill-tag">Python</div>
                    <div class="skill-tag">AWS</div>
                    <div class="skill-tag">Docker</div>
                </div>
            </div>
            
            <div class="content-area">
                ${visibleSections.filter(s => !['Profile', 'Skills', 'Languages'].includes(s.name)).map(section => generateSectionHTML(section, user)).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
};

const generateModernMinimalHTML = (cvData, user, visibleSections) => {
  const sectionsHTML = visibleSections.map(section => generateSectionHTML(section, user)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Space Grotesk', sans-serif;
            line-height: 1.4;
            color: #0a0a0a;
            background: #fafafa;
        }
        .cv-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            position: relative;
        }
        .header-bar {
            height: 8px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
        }
        .main-header {
            padding: 4rem 3rem 2rem;
            border-bottom: 1px solid #e8e8e8;
            position: relative;
        }
        .name {
            font-size: 4rem;
            font-weight: 300;
            color: #0a0a0a;
            margin-bottom: 0.5rem;
            letter-spacing: -2px;
            line-height: 0.9;
        }
        .title {
            font-size: 1.1rem;
            color: #666;
            font-weight: 400;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .contact-strip {
            display: flex;
            gap: 3rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: #888;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .contact-item::before {
            content: "▸";
            color: #ff6b6b;
            font-weight: bold;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            min-height: 600px;
        }
        .left-panel {
            background: #f8f9fa;
            padding: 3rem 2rem;
            border-right: 1px solid #e8e8e8;
        }
        .right-panel {
            padding: 3rem;
        }
        .section {
            margin-bottom: 3rem;
        }
        .section-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 2rem;
            position: relative;
        }
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 30px;
            height: 2px;
            background: #ff6b6b;
        }
        .profile-text {
            color: #555;
            line-height: 1.6;
            font-size: 0.95rem;
            margin-bottom: 2.5rem;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .skill-chip {
            background: #0a0a0a;
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 2px;
            font-size: 0.75rem;
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
        }
        .experience-item {
            margin-bottom: 2.5rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #f0f0f0;
        }
        .experience-item:last-child {
            border-bottom: none;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.8rem;
        }
        .item-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0a0a0a;
            margin-bottom: 0.3rem;
        }
        .item-company {
            color: #666;
            font-size: 0.9rem;
            font-weight: 400;
        }
        .item-date {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #888;
            background: #f5f5f5;
            padding: 0.3rem 0.6rem;
            border-radius: 2px;
        }
        .item-description {
            color: #555;
            line-height: 1.5;
            font-size: 0.9rem;
            margin-top: 0.8rem;
        }
        .education-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #fafafa;
            border-left: 3px solid #4ecdc4;
        }
        .education-title {
            font-size: 1rem;
            font-weight: 600;
            color: #0a0a0a;
            margin-bottom: 0.3rem;
        }
        .education-school {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        .education-date {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #888;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
            margin: 2rem 0;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="header-bar"></div>
        
        <header class="main-header">
            <h1 class="name">${user.fullName || 'Your Name'}</h1>
            <div class="title">Software Engineer</div>
            <div class="contact-strip">
                <div class="contact-item">${user.email || 'email@example.com'}</div>
                <div class="contact-item">${user.phone || '+1 (555) 123-4567'}</div>
                <div class="contact-item">${user.location || 'San Francisco, CA'}</div>
            </div>
        </header>
        
        <div class="content-grid">
            <div class="left-panel">
                <div class="section">
                    <h2 class="section-title">About</h2>
                    <p class="profile-text">Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.</p>
                </div>
                
                <div class="section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-container">
                        <div class="skill-chip">JavaScript</div>
                        <div class="skill-chip">React</div>
                        <div class="skill-chip">Node.js</div>
                        <div class="skill-chip">Python</div>
                        <div class="skill-chip">AWS</div>
                        <div class="skill-chip">Docker</div>
                    </div>
                </div>
            </div>
            
            <div class="right-panel">
                ${visibleSections.filter(s => !['Profile', 'Skills', 'Languages'].includes(s.name)).map(section => generateSectionHTML(section, user)).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
};

const generateCreativePortfolioHTML = (cvData, user, visibleSections) => {
  const sectionsHTML = visibleSections.map(section => generateSectionHTML(section, user)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Open Sans', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
            min-height: 100vh;
        }
        .cv-container {
            max-width: 900px;
            margin: 2rem auto;
            background: white;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            border-radius: 20px;
            overflow: hidden;
            position: relative;
        }
        .cv-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff6b6b);
        }
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4rem 3rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .hero-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        .name {
            font-family: 'Montserrat', sans-serif;
            font-size: 2.6rem;
            font-weight: 800;
            margin-bottom: 0.8rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        .title {
            font-size: 1.2rem;
            font-weight: 300;
            margin-bottom: 1.5rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-top: 2rem;
            position: relative;
            z-index: 1;
        }
        .contact-card {
            background: rgba(255,255,255,0.15);
            padding: 1.5rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }
        .contact-card:hover {
            transform: translateY(-5px);
        }
        .contact-icon {
            font-size: 2rem;
            margin-bottom: 0.8rem;
            display: block;
        }
        .contact-label {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .contact-value {
            font-size: 1rem;
            opacity: 0.9;
        }
        .main-content {
            padding: 4rem 3rem;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
        }
        .left-column {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 2.5rem;
            border-radius: 15px;
            border: 2px solid #e9ecef;
        }
        .right-column {
            padding-left: 1rem;
        }
        .section {
            margin-bottom: 3rem;
        }
        .section-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 1.8rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 2rem;
            position: relative;
            padding-bottom: 0.8rem;
        }
        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 4px;
            background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
            border-radius: 2px;
        }
        .profile-text {
            color: #555;
            line-height: 1.7;
            font-size: 1rem;
            margin-bottom: 2.5rem;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .skill-badge {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem;
            border-radius: 20px;
            text-align: center;
            font-weight: 600;
            font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: transform 0.3s ease;
        }
        .skill-badge:hover {
            transform: scale(1.05);
        }
        .experience-item {
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            border-radius: 15px;
            border-left: 5px solid #ff6b6b;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        .experience-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        .item-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        .item-company {
            color: #7f8c8d;
            font-size: 1.1rem;
            font-weight: 500;
        }
        .item-date {
            background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .item-description {
            color: #555;
            line-height: 1.7;
            font-size: 1rem;
            margin-top: 1rem;
        }
        .education-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 12px;
            border-left: 4px solid #2196f3;
        }
        .education-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        .education-school {
            color: #666;
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }
        .education-date {
            color: #2196f3;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .divider {
            height: 3px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            margin: 3rem 0;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="hero-section">
            <h1 class="name">${user.fullName || 'Your Name'}</h1>
            <div class="title">Creative Software Engineer</div>
            <div class="contact-grid">
                <div class="contact-card">
                    <span class="contact-icon">📧</span>
                    <div class="contact-label">Email</div>
                    <div class="contact-value">${user.email || 'email@example.com'}</div>
                </div>
                <div class="contact-card">
                    <span class="contact-icon">📱</span>
                    <div class="contact-label">Phone</div>
                    <div class="contact-value">${user.phone || '+1 (555) 123-4567'}</div>
                </div>
                <div class="contact-card">
                    <span class="contact-icon">📍</span>
                    <div class="contact-label">Location</div>
                    <div class="contact-value">${user.location || 'Los Angeles, CA'}</div>
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="content-grid">
                <div class="left-column">
                    <div class="section">
                        <h2 class="section-title">About Me</h2>
                        <p class="profile-text">Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.</p>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Skills</h2>
                        <div class="skills-grid">
                            <div class="skill-badge">JavaScript</div>
                            <div class="skill-badge">React</div>
                            <div class="skill-badge">Node.js</div>
                            <div class="skill-badge">Python</div>
                            <div class="skill-badge">AWS</div>
                            <div class="skill-badge">Docker</div>
                        </div>
                    </div>
                </div>
                
                <div class="right-column">
                    ${visibleSections.filter(s => !['Profile', 'Skills', 'Languages'].includes(s.name)).map(section => generateSectionHTML(section, user)).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const generateClassicExecutiveHTML = (cvData, user, visibleSections) => {
  const sectionsHTML = visibleSections.map(section => generateSectionHTML(section, user)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Source Sans Pro', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f5f5f5;
        }
        .cv-container {
            max-width: 800px;
            margin: 2rem auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        .header-section {
            background: #1a1a1a;
            color: white;
            padding: 3rem 3rem 2rem;
            position: relative;
        }
        .header-section::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #c9a96e, #d4af37, #c9a96e);
        }
        .name {
            font-family: 'Crimson Text', serif;
            font-size: 3rem;
            font-weight: 700;
            color: #c9a96e;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-align: center;
        }
        .title {
            font-size: 1.2rem;
            font-weight: 300;
            text-align: center;
            margin-bottom: 2rem;
            color: #e0e0e0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .contact-row {
            display: flex;
            justify-content: center;
            gap: 3rem;
            font-size: 1rem;
            color: #e0e0e0;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .contact-item::before {
            content: "◆";
            color: #c9a96e;
            font-weight: bold;
        }
        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            min-height: 600px;
        }
        .sidebar {
            background: #f8f9fa;
            padding: 3rem 2rem;
            border-right: 2px solid #e9ecef;
        }
        .sidebar h2 {
            font-family: 'Crimson Text', serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #c9a96e;
            padding-bottom: 0.5rem;
        }
        .sidebar p {
            color: #555;
            line-height: 1.7;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }
        .skills-list {
            list-style: none;
            padding: 0;
        }
        .skills-list li {
            margin-bottom: 0.8rem;
            padding-left: 1.5rem;
            position: relative;
            color: #555;
            font-size: 0.95rem;
        }
        .skills-list li::before {
            content: "▶";
            color: #c9a96e;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .content-area {
            padding: 3rem;
        }
        .content-area h2 {
            font-family: 'Crimson Text', serif;
            font-size: 1.6rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            padding-bottom: 0.8rem;
        }
        .content-area h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, #c9a96e, #d4af37);
        }
        .experience-item {
            margin-bottom: 2.5rem;
            padding: 2rem;
            background: #fafafa;
            border-left: 4px solid #c9a96e;
            border-radius: 0 8px 8px 0;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        .item-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.3rem;
        }
        .item-company {
            color: #666;
            font-size: 1rem;
            font-weight: 500;
            font-style: italic;
        }
        .item-date {
            background: #1a1a1a;
            color: #c9a96e;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .item-description {
            color: #555;
            line-height: 1.7;
            font-size: 0.95rem;
            margin-top: 1rem;
        }
        .education-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }
        .education-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
        }
        .education-school {
            color: #666;
            font-size: 1rem;
            margin-bottom: 0.5rem;
            font-style: italic;
        }
        .education-date {
            color: #c9a96e;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .section-divider {
            height: 2px;
            background: linear-gradient(90deg, #c9a96e, #d4af37, #c9a96e);
            margin: 3rem 0;
            border-radius: 1px;
        }
        .achievement-list {
            list-style: none;
            padding: 0;
        }
        .achievement-list li {
            margin-bottom: 0.8rem;
            padding-left: 1.5rem;
            position: relative;
            color: #555;
            line-height: 1.6;
        }
        .achievement-list li::before {
            content: "★";
            color: #c9a96e;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <header class="header-section">
            <h1 class="name">${user.fullName || 'Your Name'}</h1>
            <div class="title">Executive Software Engineer</div>
            <div class="contact-row">
                <div class="contact-item">${user.email || 'email@example.com'}</div>
                <div class="contact-item">${user.phone || '+1 (555) 123-4567'}</div>
                <div class="contact-item">${user.location || 'New York, NY'}</div>
            </div>
        </header>
        
        <div class="main-content">
            <div class="sidebar">
                <h2>Executive Summary</h2>
                <p>Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.</p>
                
                <h2>Core Competencies</h2>
                <ul class="skills-list">
                    <li>JavaScript & TypeScript</li>
                    <li>React & Node.js</li>
                    <li>Python & Django</li>
                    <li>AWS & Cloud Architecture</li>
                    <li>Docker & Kubernetes</li>
                    <li>Team Leadership</li>
                </ul>
            </div>
            
            <div class="content-area">
                ${visibleSections.filter(s => !['Profile', 'Skills', 'Languages'].includes(s.name)).map(section => generateSectionHTML(section, user)).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
};

const generateMinimalCleanHTML = (cvData, user, visibleSections) => {
  const sectionsHTML = visibleSections.map(section => generateSectionHTML(section, user)).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            background: #fafafa;
        }
        .cv-container {
            max-width: 700px;
            margin: 3rem auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header-section {
            background: white;
            padding: 4rem 3rem 2rem;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
        }
        .name {
            font-size: 2.6rem;
            font-weight: 200;
            color: #1a1a1a;
            margin-bottom: 0.4rem;
            letter-spacing: -1px;
        }
        .title {
            font-size: 1.1rem;
            font-weight: 300;
            color: #666;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: #888;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .contact-item::before {
            content: "→";
            color: #1a1a1a;
            font-weight: 500;
        }
        .main-content {
            padding: 3rem;
        }
        .section {
            margin-bottom: 3rem;
        }
        .section-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            position: relative;
        }
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 40px;
            height: 1px;
            background: #1a1a1a;
        }
        .profile-text {
            color: #555;
            line-height: 1.7;
            font-size: 1rem;
            margin-bottom: 2.5rem;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem;
        }
        .skill-tag {
            background: #f5f5f5;
            color: #1a1a1a;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 400;
            border: 1px solid #e0e0e0;
        }
        .experience-item {
            margin-bottom: 2.5rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #f0f0f0;
        }
        .experience-item:last-child {
            border-bottom: none;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.8rem;
        }
        .item-title {
            font-size: 1.1rem;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 0.3rem;
        }
        .item-company {
            color: #666;
            font-size: 0.95rem;
            font-weight: 400;
        }
        .item-date {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #888;
            background: #f5f5f5;
            padding: 0.3rem 0.6rem;
            border-radius: 3px;
        }
        .item-description {
            color: #555;
            line-height: 1.6;
            font-size: 0.95rem;
            margin-top: 0.8rem;
        }
        .education-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #fafafa;
            border-radius: 6px;
            border-left: 3px solid #1a1a1a;
        }
        .education-title {
            font-size: 1rem;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 0.3rem;
        }
        .education-school {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        .education-date {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #888;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
            margin: 2.5rem 0;
        }
        .achievement-list {
            list-style: none;
            padding: 0;
        }
        .achievement-list li {
            margin-bottom: 0.6rem;
            padding-left: 1.2rem;
            position: relative;
            color: #555;
            line-height: 1.6;
        }
        .achievement-list li::before {
            content: "•";
            color: #1a1a1a;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }
        .left-column {
            background: #fafafa;
            padding: 2rem;
            border-radius: 6px;
        }
        .right-column {
            padding-left: 1rem;
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <header class="header-section">
            <h1 class="name">${user.fullName || 'Your Name'}</h1>
            <div class="title">Software Engineer</div>
            <div class="contact-info">
                <div class="contact-item">${user.email || 'email@example.com'}</div>
                <div class="contact-item">${user.phone || '+1 (555) 123-4567'}</div>
                <div class="contact-item">${user.location || 'Seattle, WA'}</div>
            </div>
        </header>
        
        <div class="main-content">
            <div class="two-column">
                <div class="left-column">
                    <div class="section">
                        <h2 class="section-title">About</h2>
                        <p class="profile-text">Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.</p>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Skills</h2>
                        <div class="skills-container">
                            <div class="skill-tag">JavaScript</div>
                            <div class="skill-tag">React</div>
                            <div class="skill-tag">Node.js</div>
                            <div class="skill-tag">Python</div>
                            <div class="skill-tag">AWS</div>
                            <div class="skill-tag">Docker</div>
                        </div>
                    </div>
                </div>
                
                <div class="right-column">
                    ${visibleSections.filter(s => !['Profile', 'Skills', 'Languages'].includes(s.name)).map(section => generateSectionHTML(section, user)).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};

// Generate HTML for individual sections
const generateSectionHTML = (section, user) => {
  const sectionData = section.data || {};
  
  console.log(`Processing section: ${section.name}`);
  console.log(`Section data keys:`, Object.keys(sectionData));
  
  switch (section.name) {
    case 'Profile':
      const summary = sectionData.summary || sectionData.bio || (user && user.bio) || 'Professional summary goes here';
      return `
        <div class="section">
          <h2>Professional Summary</h2>
          <div class="description">${summary}</div>
        </div>
      `;
      
    case 'Experience':
      const experiences = sectionData.experiences || sectionData.experience || [];
      console.log(`Experience entries: ${experiences.length}`);
      
      if (!experiences.length) return '';
      
      const experienceHTML = experiences.map(exp => `
        <div class="item">
          <h3>${exp.position || exp.title || 'Job Title'}</h3>
          <div class="company">${exp.company || 'Company Name'}</div>
          <div class="date">${formatDate(exp.startDate)} - ${exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</div>
          <div class="description">${exp.description || 'Job description'}</div>
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>Experience</h2>
          ${experienceHTML}
        </div>
      `;
      
    case 'Education':
      const educations = sectionData.educations || sectionData.education || [];
      console.log(`Education entries: ${educations.length}`);
      
      if (!educations.length) return '';
      
      const educationHTML = educations.map(edu => `
        <div class="item">
          <h3>${edu.degree || 'Degree'}</h3>
          <div class="company">${edu.institution || 'Institution'}</div>
          <div class="date">${formatDate(edu.startDate)} - ${edu.isCurrent ? 'Present' : formatDate(edu.endDate)}</div>
          ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>Education</h2>
          ${educationHTML}
        </div>
      `;
      
    case 'Skills':
      const technical = sectionData.technical || [];
      const soft = sectionData.soft || [];
      const allSkills = [...technical, ...soft];
      console.log(`Skills: technical=${technical.length}, soft=${soft.length}, total=${allSkills.length}`);
      
      if (!allSkills.length) return '';
      
      const skillsHTML = allSkills.map(skill => 
        `<span class="skill">${skill}</span>`
      ).join('');
      
      return `
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">${skillsHTML}</div>
        </div>
      `;
      
    case 'Languages':
      const languages = sectionData.languages || [];
      console.log(`Languages: ${languages.length}`);
      
      if (!languages.length) return '';
      
      const languagesHTML = languages.map(lang => `
        <div class="item">
          <h3>${lang.name || 'Language'}</h3>
          <div class="description">${lang.level || 'Proficient'}</div>
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>Languages</h2>
          ${languagesHTML}
        </div>
      `;
      
    case 'Projects':
      const projects = sectionData.projects || [];
      console.log(`Projects: ${projects.length}`);
      
      if (!projects.length) return '';
      
      const projectsHTML = projects.map(project => `
        <div class="item">
          <h3>${project.name || 'Project'}</h3>
          <div class="date">${formatDate(project.startDate)} - ${project.endDate ? formatDate(project.endDate) : 'Ongoing'}</div>
          <div class="description">${project.description || 'Project description'}</div>
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>Projects</h2>
          ${projectsHTML}
        </div>
      `;
      
    case 'Publications':
      const publications = sectionData.publications || [];
      console.log(`Publications: ${publications.length}`);
      
      if (!publications.length) return '';
      
      const publicationsHTML = publications.map(pub => {
        const authorsList = pub.authors && Array.isArray(pub.authors) 
          ? pub.authors.map(author => author.name || author).join(', ')
          : 'Authors';
        return `
          <div class="item">
            <h3>${pub.title || 'Publication'}</h3>
            <div class="company">${authorsList}</div>
            <div class="date">${pub.publisher || 'Publisher'} • ${formatDate(pub.publicationDate)}</div>
            ${pub.doi ? `<div class="description">DOI: ${pub.doi}</div>` : ''}
          </div>
        `;
      }).join('');
      
      return `
        <div class="section">
          <h2>Publications</h2>
          ${publicationsHTML}
        </div>
      `;
      
    case 'Awards':
      const awards = sectionData.awards || [];
      console.log(`Awards: ${awards.length}`);
      
      if (!awards.length) return '';
      
      const awardsHTML = awards.map(award => `
        <div class="item">
          <h3>${award.title || 'Award'}</h3>
          <div class="company">${award.issuer || 'Organization'}</div>
          <div class="date">${formatDate(award.dateReceived)}</div>
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>Awards</h2>
          ${awardsHTML}
        </div>
      `;
      
    case 'References':
      const references = sectionData.references || [];
      console.log(`References: ${references.length}`);
      
      if (!references.length) return '';
      
      const referencesHTML = references.map(ref => `
        <div class="item">
          <h3>${ref.name || 'Reference'}</h3>
          <div class="company">${ref.position || 'Position'} at ${ref.company || 'Company'}</div>
          <div class="description">${ref.email || 'Email'} | ${ref.phone || 'Phone'}</div>
        </div>
      `).join('');
      
      return `
        <div class="section">
          <h2>References</h2>
          ${referencesHTML}
        </div>
      `;
      
    default:
      console.log(`Unknown section: ${section.name}`);
      return '';
  }
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  } catch (error) {
    return dateString;
  }
};

// Debug endpoint to view generated HTML
const debugHTML = async (req, res) => {
  try {
    const cvData = req.body;

    if (!cvData || !cvData.name) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required'
      });
    }

    const htmlContent = generateTemplateHTML(cvData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    console.error('HTML debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating HTML',
      error: error.message
    });
  }
};

module.exports = {
  generatePDF,
  debugHTML
};