const mongoose = require('mongoose');
const Template = require('../models/Template');

const predefinedTemplates = [
  {
    name: 'Professional Classic',
    description: 'A clean, traditional design perfect for corporate and professional roles',
    category: 'professional',
    preview: 'A traditional two-column layout with clear sections and professional typography',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - CV</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="cv-container">
        <header class="cv-header">
            <h1 class="name">{{name}}</h1>
            <div class="contact-info">
                <p>{{email}} | {{phone}} | {{location}}</p>
            </div>
        </header>
        
        <div class="cv-content">
            <div class="left-column">
                <section class="profile-section">
                    <h2>Profile</h2>
                    <p>{{profileSummary}}</p>
                </section>
                
                <section class="skills-section">
                    <h2>Skills</h2>
                    <ul>
                        {{#each skills}}
                        <li>{{this}}</li>
                        {{/each}}
                    </ul>
                </section>
            </div>
            
            <div class="right-column">
                <section class="experience-section">
                    <h2>Experience</h2>
                    {{#each experience}}
                    <div class="experience-item">
                        <h3>{{title}}</h3>
                        <p class="company">{{company}} | {{startDate}} - {{endDate}}</p>
                        <p>{{description}}</p>
                    </div>
                    {{/each}}
                </section>
                
                <section class="education-section">
                    <h2>Education</h2>
                    {{#each education}}
                    <div class="education-item">
                        <h3>{{degree}}</h3>
                        <p class="institution">{{institution}} | {{graduationYear}}</p>
                    </div>
                    {{/each}}
                </section>
            </div>
        </div>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Open Sans', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

.cv-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.cv-header {
    background: #2c3e50;
    color: white;
    padding: 2rem;
    text-align: center;
}

.name {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.contact-info {
    font-size: 1.1rem;
    opacity: 0.9;
}

.cv-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    padding: 2rem;
}

.left-column, .right-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

section {
    margin-bottom: 2rem;
}

h2 {
    color: #2c3e50;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 0.5rem;
}

h3 {
    color: #34495e;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.company, .institution {
    color: #7f8c8d;
    font-style: italic;
    margin-bottom: 0.5rem;
}

ul {
    list-style: none;
    padding-left: 0;
}

li {
    margin-bottom: 0.5rem;
    padding-left: 1rem;
    position: relative;
}

li:before {
    content: "•";
    color: #3498db;
    position: absolute;
    left: 0;
}

.experience-item, .education-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ecf0f1;
}

.experience-item:last-child, .education-item:last-child {
    border-bottom: none;
}`,
    sections: [
      { name: 'Profile', order: 1, required: true, visible: true },
      { name: 'Experience', order: 2, required: true, visible: true },
      { name: 'Education', order: 3, required: true, visible: true },
      { name: 'Skills', order: 4, required: true, visible: true },
      { name: 'Languages', order: 5, required: false, visible: true },
      { name: 'Projects', order: 6, required: false, visible: true },
      { name: 'Publications', order: 7, required: false, visible: true },
      { name: 'Awards', order: 8, required: false, visible: true },
      { name: 'References', order: 9, required: false, visible: true }
    ],
    colorSchemes: [
      {
        name: 'Default',
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        text: '#333333',
        background: '#ffffff'
      },
      {
        name: 'Blue',
        primary: '#1e3a8a',
        secondary: '#1e40af',
        accent: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff'
      },
      {
        name: 'Green',
        primary: '#065f46',
        secondary: '#047857',
        accent: '#10b981',
        text: '#1f2937',
        background: '#ffffff'
      }
    ],
    fonts: [
      {
        name: 'Open Sans',
        family: 'Open Sans, sans-serif',
        weights: ['300', '400', '600', '700']
      },
      {
        name: 'Roboto',
        family: 'Roboto, sans-serif',
        weights: ['300', '400', '500', '700']
      }
    ],
    isActive: true,
    version: '1.0.0'
  },
  {
    name: 'Modern Minimal',
    description: 'A sleek, contemporary design with clean lines and modern typography',
    category: 'modern',
    preview: 'A single-column layout with bold typography and plenty of white space',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - CV</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="cv-container">
        <header class="cv-header">
            <h1 class="name">{{name}}</h1>
            <div class="contact-info">
                <span>{{email}}</span>
                <span>{{phone}}</span>
                <span>{{location}}</span>
            </div>
        </header>
        
        <main class="cv-content">
            <section class="profile-section">
                <h2>About</h2>
                <p>{{profileSummary}}</p>
            </section>
            
            <section class="experience-section">
                <h2>Experience</h2>
                {{#each experience}}
                <div class="experience-item">
                    <div class="experience-header">
                        <h3>{{title}}</h3>
                        <span class="duration">{{startDate}} - {{endDate}}</span>
                    </div>
                    <p class="company">{{company}}</p>
                    <p class="description">{{description}}</p>
                </div>
                {{/each}}
            </section>
            
            <section class="education-section">
                <h2>Education</h2>
                {{#each education}}
                <div class="education-item">
                    <h3>{{degree}}</h3>
                    <p class="institution">{{institution}} • {{graduationYear}}</p>
                </div>
                {{/each}}
            </section>
            
            <section class="skills-section">
                <h2>Skills</h2>
                <div class="skills-grid">
                    {{#each skills}}
                    <span class="skill-tag">{{this}}</span>
                    {{/each}}
                </div>
            </section>
        </main>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #fafafa;
}

.cv-container {
    max-width: 700px;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
}

.cv-header {
    padding: 3rem 2rem 2rem;
    border-bottom: 1px solid #e5e5e5;
}

.name {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
}

.contact-info {
    display: flex;
    gap: 2rem;
    font-size: 1rem;
    color: #666;
}

.cv-content {
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
}

h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
}

.experience-item, .education-item {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.experience-item:last-child, .education-item:last-child {
    border-bottom: none;
}

.experience-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.duration {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.company, .institution {
    color: #666;
    margin-bottom: 0.5rem;
}

.description {
    color: #4a4a4a;
    line-height: 1.7;
}

.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.skill-tag {
    background: #f5f5f5;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #1a1a1a;
    font-weight: 500;
}`,
    sections: [
      { name: 'Profile', order: 1, required: true, visible: true },
      { name: 'Experience', order: 2, required: true, visible: true },
      { name: 'Education', order: 3, required: true, visible: true },
      { name: 'Skills', order: 4, required: true, visible: true },
      { name: 'Languages', order: 5, required: false, visible: true },
      { name: 'Projects', order: 6, required: false, visible: true },
      { name: 'Publications', order: 7, required: false, visible: true },
      { name: 'Awards', order: 8, required: false, visible: true },
      { name: 'References', order: 9, required: false, visible: true }
    ],
    colorSchemes: [
      {
        name: 'Default',
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        accent: '#007acc',
        text: '#1a1a1a',
        background: '#ffffff'
      },
      {
        name: 'Dark',
        primary: '#ffffff',
        secondary: '#cccccc',
        accent: '#00d4aa',
        text: '#ffffff',
        background: '#1a1a1a'
      },
      {
        name: 'Purple',
        primary: '#6b46c1',
        secondary: '#8b5cf6',
        accent: '#a78bfa',
        text: '#1f2937',
        background: '#ffffff'
      }
    ],
    fonts: [
      {
        name: 'Inter',
        family: 'Inter, sans-serif',
        weights: ['300', '400', '500', '600', '700']
      },
      {
        name: 'Poppins',
        family: 'Poppins, sans-serif',
        weights: ['300', '400', '500', '600', '700']
      }
    ],
    isActive: true,
    version: '1.0.0'
  },
  {
    name: 'Creative Portfolio',
    description: 'A bold, creative design perfect for designers, artists, and creative professionals',
    category: 'creative',
    preview: 'A vibrant design with creative layouts and bold typography',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="cv-container">
        <aside class="sidebar">
            <div class="profile-image">
                <div class="image-placeholder"></div>
            </div>
            <h1 class="name">{{name}}</h1>
            <p class="title">{{jobTitle}}</p>
            
            <div class="contact-section">
                <h3>Contact</h3>
                <p>{{email}}</p>
                <p>{{phone}}</p>
                <p>{{location}}</p>
            </div>
            
            <div class="skills-section">
                <h3>Skills</h3>
                <div class="skills-list">
                    {{#each skills}}
                    <span class="skill">{{this}}</span>
                    {{/each}}
                </div>
            </div>
        </aside>
        
        <main class="main-content">
            <section class="about-section">
                <h2>About Me</h2>
                <p>{{profileSummary}}</p>
            </section>
            
            <section class="experience-section">
                <h2>Experience</h2>
                {{#each experience}}
                <div class="experience-item">
                    <div class="experience-meta">
                        <h3>{{title}}</h3>
                        <span class="company">{{company}}</span>
                        <span class="duration">{{startDate}} - {{endDate}}</span>
                    </div>
                    <p class="description">{{description}}</p>
                </div>
                {{/each}}
            </section>
            
            <section class="education-section">
                <h2>Education</h2>
                {{#each education}}
                <div class="education-item">
                    <h3>{{degree}}</h3>
                    <p class="institution">{{institution}}</p>
                    <p class="year">{{graduationYear}}</p>
                </div>
                {{/each}}
            </section>
        </main>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
    line-height: 1.6;
    color: #2c3e50;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.cv-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 30px rgba(0,0,0,0.1);
}

.sidebar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.profile-image {
    margin-bottom: 2rem;
}

.image-placeholder {
    width: 120px;
    height: 120px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.3);
}

.name {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.title {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

.contact-section, .skills-section {
    width: 100%;
    margin-bottom: 2rem;
}

.contact-section h3, .skills-section h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid rgba(255,255,255,0.3);
    padding-bottom: 0.5rem;
}

.contact-section p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.skill {
    background: rgba(255,255,255,0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
}

.main-content {
    padding: 2rem;
    background: white;
}

section {
    margin-bottom: 3rem;
}

h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    position: relative;
}

h2:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h3 {
    font-size: 1.3rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.experience-item, .education-item {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.experience-meta {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.company, .institution {
    color: #7f8c8d;
    font-weight: 600;
    margin-bottom: 0.3rem;
}

.duration, .year {
    color: #95a5a6;
    font-size: 0.9rem;
}

.description {
    color: #34495e;
    line-height: 1.7;
}`,
    sections: [
      { name: 'Profile', order: 1, required: true, visible: true },
      { name: 'Experience', order: 2, required: true, visible: true },
      { name: 'Education', order: 3, required: true, visible: true },
      { name: 'Skills', order: 4, required: true, visible: true },
      { name: 'Languages', order: 5, required: false, visible: true },
      { name: 'Projects', order: 6, required: false, visible: true },
      { name: 'Publications', order: 7, required: false, visible: true },
      { name: 'Awards', order: 8, required: false, visible: true },
      { name: 'References', order: 9, required: false, visible: true }
    ],
    colorSchemes: [
      {
        name: 'Default',
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        text: '#2c3e50',
        background: '#ffffff'
      },
      {
        name: 'Orange',
        primary: '#ff6b6b',
        secondary: '#ffa726',
        accent: '#ffeb3b',
        text: '#2c3e50',
        background: '#ffffff'
      },
      {
        name: 'Green',
        primary: '#4ecdc4',
        secondary: '#44a08d',
        accent: '#96f2d7',
        text: '#2c3e50',
        background: '#ffffff'
      }
    ],
    fonts: [
      {
        name: 'Playfair Display + Source Sans Pro',
        family: 'Playfair Display, serif',
        weights: ['400', '700']
      },
      {
        name: 'Montserrat + Open Sans',
        family: 'Montserrat, sans-serif',
        weights: ['300', '400', '600', '700']
      }
    ],
    isActive: true,
    version: '1.0.0'
  },
  {
    name: 'Classic Executive',
    description: 'A sophisticated, executive-level design with traditional elegance',
    category: 'classic',
    preview: 'A formal three-column layout with traditional typography and professional styling',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}} - Curriculum Vitae</title>
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&family=Arial:wght@300;400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="cv-container">
        <header class="cv-header">
            <h1 class="name">{{name}}</h1>
            <div class="contact-details">
                <div class="contact-item">
                    <strong>Email:</strong> {{email}}
                </div>
                <div class="contact-item">
                    <strong>Phone:</strong> {{phone}}
                </div>
                <div class="contact-item">
                    <strong>Location:</strong> {{location}}
                </div>
            </div>
        </header>
        
        <div class="cv-body">
            <div class="left-column">
                <section class="profile-section">
                    <h2>Professional Summary</h2>
                    <p>{{profileSummary}}</p>
                </section>
                
                <section class="skills-section">
                    <h2>Core Competencies</h2>
                    <ul>
                        {{#each skills}}
                        <li>{{this}}</li>
                        {{/each}}
                    </ul>
                </section>
                
                <section class="languages-section">
                    <h2>Languages</h2>
                    {{#each languages}}
                    <div class="language-item">
                        <span class="language">{{name}}</span>
                        <span class="proficiency">{{proficiency}}</span>
                    </div>
                    {{/each}}
                </section>
            </div>
            
            <div class="right-column">
                <section class="experience-section">
                    <h2>Professional Experience</h2>
                    {{#each experience}}
                    <div class="experience-item">
                        <div class="experience-header">
                            <h3>{{title}}</h3>
                            <span class="duration">{{startDate}} - {{endDate}}</span>
                        </div>
                        <div class="company-info">
                            <strong>{{company}}</strong> | {{location}}
                        </div>
                        <div class="experience-description">
                            <p>{{description}}</p>
                        </div>
                    </div>
                    {{/each}}
                </section>
                
                <section class="education-section">
                    <h2>Education</h2>
                    {{#each education}}
                    <div class="education-item">
                        <h3>{{degree}}</h3>
                        <div class="education-details">
                            <strong>{{institution}}</strong> | {{graduationYear}}
                        </div>
                    </div>
                    {{/each}}
                </section>
                
                <section class="certifications-section">
                    <h2>Certifications</h2>
                    {{#each certifications}}
                    <div class="certification-item">
                        <h4>{{name}}</h4>
                        <p class="issuer">{{issuer}} | {{date}}</p>
                    </div>
                    {{/each}}
                </section>
            </div>
        </div>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #2c3e50;
    background-color: #f8f9fa;
}

.cv-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.cv-header {
    background: #2c3e50;
    color: white;
    padding: 2.5rem;
    text-align: center;
    border-bottom: 4px solid #3498db;
}

.name {
    font-family: 'Times New Roman', serif;
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    letter-spacing: 1px;
}

.contact-details {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.contact-item {
    font-size: 1rem;
    opacity: 0.95;
}

.cv-body {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    padding: 2.5rem;
}

.left-column, .right-column {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

section {
    margin-bottom: 2.5rem;
}

h2 {
    font-family: 'Times New Roman', serif;
    font-size: 1.6rem;
    color: #2c3e50;
    margin-bottom: 1.2rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #3498db;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

h3 {
    font-size: 1.3rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

h4 {
    font-size: 1.1rem;
    color: #34495e;
    margin-bottom: 0.3rem;
    font-weight: 600;
}

ul {
    list-style: none;
    padding-left: 0;
}

li {
    margin-bottom: 0.8rem;
    padding-left: 1.5rem;
    position: relative;
    font-size: 0.95rem;
}

li:before {
    content: "▶";
    color: #3498db;
    position: absolute;
    left: 0;
    font-size: 0.8rem;
}

.experience-item, .education-item, .certification-item {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #ecf0f1;
}

.experience-item:last-child, .education-item:last-child, .certification-item:last-child {
    border-bottom: none;
}

.experience-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.duration {
    color: #7f8c8d;
    font-size: 0.9rem;
    font-weight: 500;
}

.company-info, .education-details {
    color: #7f8c8d;
    margin-bottom: 0.8rem;
    font-size: 0.95rem;
}

.experience-description p {
    color: #34495e;
    line-height: 1.7;
    font-size: 0.95rem;
}

.language-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.language {
    font-weight: 600;
    color: #2c3e50;
}

.proficiency {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.issuer {
    color: #7f8c8d;
    font-size: 0.9rem;
    font-style: italic;
}`,
    sections: [
      { name: 'Profile', order: 1, required: true, visible: true },
      { name: 'Experience', order: 2, required: true, visible: true },
      { name: 'Education', order: 3, required: true, visible: true },
      { name: 'Skills', order: 4, required: true, visible: true },
      { name: 'Languages', order: 5, required: false, visible: true },
      { name: 'Projects', order: 6, required: false, visible: true },
      { name: 'Publications', order: 7, required: false, visible: true },
      { name: 'Awards', order: 8, required: false, visible: true },
      { name: 'References', order: 9, required: false, visible: true }
    ],
    colorSchemes: [
      {
        name: 'Default',
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        text: '#2c3e50',
        background: '#ffffff'
      },
      {
        name: 'Navy',
        primary: '#1a365d',
        secondary: '#2d3748',
        accent: '#3182ce',
        text: '#1a202c',
        background: '#ffffff'
      },
      {
        name: 'Burgundy',
        primary: '#742a2a',
        secondary: '#9c4221',
        accent: '#d69e2e',
        text: '#2d3748',
        background: '#ffffff'
      }
    ],
    fonts: [
      {
        name: 'Times New Roman + Arial',
        family: 'Times New Roman, serif',
        weights: ['400', '700']
      },
      {
        name: 'Georgia + Helvetica',
        family: 'Georgia, serif',
        weights: ['400', '700']
      }
    ],
    isActive: true,
    version: '1.0.0'
  },
  {
    name: 'Minimal Clean',
    description: 'An ultra-clean, minimal design focusing on content and readability',
    category: 'minimal',
    preview: 'A single-column layout with maximum white space and clean typography',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{name}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="cv-container">
        <header class="header">
            <h1>{{name}}</h1>
            <div class="contact">
                <span>{{email}}</span>
                <span>{{phone}}</span>
                <span>{{location}}</span>
            </div>
        </header>
        
        <main class="content">
            <section class="summary">
                <h2>Summary</h2>
                <p>{{profileSummary}}</p>
            </section>
            
            <section class="experience">
                <h2>Experience</h2>
                {{#each experience}}
                <div class="item">
                    <div class="item-header">
                        <h3>{{title}}</h3>
                        <span class="date">{{startDate}} — {{endDate}}</span>
                    </div>
                    <div class="company">{{company}}</div>
                    <p>{{description}}</p>
                </div>
                {{/each}}
            </section>
            
            <section class="education">
                <h2>Education</h2>
                {{#each education}}
                <div class="item">
                    <h3>{{degree}}</h3>
                    <div class="institution">{{institution}} • {{graduationYear}}</div>
                </div>
                {{/each}}
            </section>
            
            <section class="skills">
                <h2>Skills</h2>
                <div class="skills-content">
                    {{#each skills}}
                    <span class="skill">{{this}}</span>
                    {{/each}}
                </div>
            </section>
        </main>
    </div>
</body>
</html>`,
    css: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Lato', sans-serif;
    line-height: 1.6;
    color: #333;
    background: #fff;
}

.cv-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 3rem 2rem;
}

.header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #eee;
}

h1 {
    font-family: 'Merriweather', serif;
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 1rem;
    color: #222;
}

.contact {
    display: flex;
    justify-content: center;
    gap: 2rem;
    font-size: 0.9rem;
    color: #666;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

section {
    margin-bottom: 3rem;
}

h2 {
    font-family: 'Merriweather', serif;
    font-size: 1.4rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
    color: #222;
    text-transform: uppercase;
    letter-spacing: 1px;
}

h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #333;
}

.item {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
    border-bottom: none;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.date {
    font-size: 0.85rem;
    color: #888;
    font-weight: 400;
}

.company, .institution {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.8rem;
}

p {
    color: #555;
    line-height: 1.7;
    font-size: 0.9rem;
}

.skills-content {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.skill {
    background: #f8f8f8;
    padding: 0.4rem 0.8rem;
    border-radius: 3px;
    font-size: 0.85rem;
    color: #555;
    font-weight: 400;
}`,
    sections: [
      { name: 'Profile', order: 1, required: true, visible: true },
      { name: 'Experience', order: 2, required: true, visible: true },
      { name: 'Education', order: 3, required: true, visible: true },
      { name: 'Skills', order: 4, required: true, visible: true },
      { name: 'Languages', order: 5, required: false, visible: true },
      { name: 'Projects', order: 6, required: false, visible: true },
      { name: 'Publications', order: 7, required: false, visible: true },
      { name: 'Awards', order: 8, required: false, visible: true },
      { name: 'References', order: 9, required: false, visible: true }
    ],
    colorSchemes: [
      {
        name: 'Default',
        primary: '#333333',
        secondary: '#666666',
        accent: '#007acc',
        text: '#333333',
        background: '#ffffff'
      },
      {
        name: 'Warm',
        primary: '#8b4513',
        secondary: '#a0522d',
        accent: '#daa520',
        text: '#2f2f2f',
        background: '#ffffff'
      },
      {
        name: 'Cool',
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        text: '#2c3e50',
        background: '#ffffff'
      }
    ],
    fonts: [
      {
        name: 'Merriweather + Lato',
        family: 'Merriweather, serif',
        weights: ['300', '400', '700']
      },
      {
        name: 'Crimson Text + Source Sans Pro',
        family: 'Crimson Text, serif',
        weights: ['400', '600', '700']
      }
    ],
    isActive: true,
    version: '1.0.0'
  }
];

const seedTemplates = async () => {
  try {
    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert predefined templates
    const templates = await Template.insertMany(predefinedTemplates);
    console.log(`Successfully seeded ${templates.length} templates`);

    return templates;
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
};

module.exports = {
  predefinedTemplates,
  seedTemplates
};
