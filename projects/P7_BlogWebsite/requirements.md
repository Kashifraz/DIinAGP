# Blog Platform - Requirements Document

## 1. System Overview

### 1.1 Purpose
A modern, scalable blog platform consisting of two main applications:
- **Admin Dashboard**: Secure content management system for authors
- **Public Blog Website**: Reader-facing blog with modern UI and accessibility features

### 1.2 Technology Stack
- **Public Blog**: Next.js with Server-Side Rendering (SSR)
- **Admin Dashboard**: React Single Page Application (SPA)
- **Backend API**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication with httpOnly cookies

### 1.3 Architecture Principles
- Separation of concerns across modules
- Scalable architecture for future growth
- RESTful API design
- Role-based access control (RBAC)
- Responsive and accessible UI/UX

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐
│  Public Blog    │     │ Admin Dashboard │
│  (Next.js SSR)  │     │  (React SPA)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │  Express API    │
            │   (Node.js)     │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │    MongoDB       │
            └─────────────────┘
```

### 2.2 Application Components

#### 2.2.1 Public Blog (Next.js SSR)
- **Purpose**: Display published blog posts to readers
- **Key Features**: 
  - Server-side rendering for SEO
  - Static generation where applicable
  - Client-side interactivity for dynamic features

#### 2.2.2 Admin Dashboard (React SPA)
- **Purpose**: Content management interface for authors
- **Key Features**:
  - Client-side routing
  - Rich text editor with media support
  - Real-time preview
  - Comment moderation interface

#### 2.2.3 Backend API (Node.js/Express)
- **Purpose**: Centralized API serving both applications
- **Key Features**:
  - RESTful endpoints
  - Authentication and authorization
  - File upload handling
  - Data validation and sanitization

#### 2.2.4 Database (MongoDB)
- **Purpose**: Persistent data storage
- **Collections**: Users, Posts, Comments, Categories, Tags, Media

---

## 3. Database Schema

### 3.1 Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['author', 'admin'], default: 'author'),
  avatar: String (URL),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 Posts Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (unique, required),
  content: Array<Block>, // Array of content blocks
  excerpt: String,
  authorId: ObjectId (ref: Users),
  categoryId: ObjectId (ref: Categories),
  tags: Array<String>,
  status: String (enum: ['draft', 'published'], default: 'draft'),
  featuredImage: String (URL),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  viewCount: Number (default: 0)
}
```

### 3.3 Content Blocks Structure
```javascript
{
  type: String (enum: [
    'paragraph',
    'heading',
    'image',
    'code',
    'authorBox',
    'tableOfContents',
    'quiz',
    'poll',
    'carousel'
  ]),
  data: Object // Block-specific data
}
```

### 3.4 Comments Collection
```javascript
{
  _id: ObjectId,
  postId: ObjectId (ref: Posts),
  authorName: String (required),
  authorEmail: String (required),
  content: String (required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date,
  moderatedBy: ObjectId (ref: Users),
  moderatedAt: Date
}
```

### 3.5 Categories Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  slug: String (unique, required),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.6 Media Collection
```javascript
{
  _id: ObjectId,
  filename: String (required),
  originalName: String (required),
  mimeType: String (required),
  size: Number (required),
  url: String (required),
  uploadedBy: ObjectId (ref: Users),
  createdAt: Date
}
```

---

## 4. Functional Requirements

### 1 Authentication & Authorization

#### 1.1 User Authentication
- **FR-AUTH-001**: System shall allow authors to log in with email and password
- **FR-AUTH-002**: System shall use JWT tokens stored in httpOnly cookies
- **FR-AUTH-003**: System shall validate JWT tokens on protected routes
- **FR-AUTH-004**: System shall provide logout functionality
- **FR-AUTH-005**: System shall implement password hashing (bcrypt)
- **FR-AUTH-006**: System shall restrict admin dashboard access to authenticated authors only

#### 1.2 Session Management
- **FR-AUTH-007**: System shall maintain user sessions with configurable expiration
- **FR-AUTH-008**: System shall handle token refresh for extended sessions

### 2 Blog Post Management

#### 2.1 Post Creation
- **FR-POST-001**: Authors shall be able to create new blog posts
- **FR-POST-002**: Authors shall be able to set post title
- **FR-POST-003**: System shall auto-generate URL-friendly slug from title
- **FR-POST-004**: Authors shall be able to write content using rich text editor
- **FR-POST-005**: Authors shall be able to add custom content blocks
- **FR-POST-006**: Authors shall be able to assign category to post
- **FR-POST-007**: Authors shall be able to add search tags
- **FR-POST-008**: Authors shall be able to set featured image
- **FR-POST-009**: Authors shall be able to write excerpt/description
- **FR-POST-010**: Authors shall be able to save post as draft
- **FR-POST-011**: Authors shall be able to publish post
- **FR-POST-012**: System shall only display published posts on public blog

#### 2.2 Post Editing
- **FR-POST-013**: Authors shall be able to edit existing posts
- **FR-POST-014**: Authors shall be able to update all post fields
- **FR-POST-015**: Authors shall be able to change post status (draft/published)
- **FR-POST-016**: System shall preserve post history (updatedAt timestamp)

#### 2.3 Post Deletion
- **FR-POST-017**: Authors shall be able to delete posts
- **FR-POST-018**: System shall handle cascading deletion of related comments

#### 2.4 Post Preview
- **FR-POST-019**: Authors shall be able to preview posts before publishing
- **FR-POST-020**: Preview shall render all content blocks correctly

### 3 Rich Text Editor & Content Blocks

#### 3.1 Rich Text Editor
- **FR-EDITOR-001**: Editor shall support basic text formatting (bold, italic, underline)
- **FR-EDITOR-002**: Editor shall support heading levels (H1, H2, H3)
- **FR-EDITOR-003**: Editor shall support lists (ordered, unordered)
- **FR-EDITOR-004**: Editor shall support links
- **FR-EDITOR-005**: Editor shall support media uploads (images)
- **FR-EDITOR-006**: Editor shall support block-based content structure

#### 3.2 Author Box Block
- **FR-BLOCK-001**: Authors shall be able to insert author box block
- **FR-BLOCK-002**: Author box shall display author name
- **FR-BLOCK-003**: Author box shall display author description/bio
- **FR-BLOCK-004**: Author box shall display author picture/avatar
- **FR-BLOCK-005**: Author box data shall be auto-populated from user profile

#### 3.3 Table of Contents Block
- **FR-BLOCK-006**: Authors shall be able to insert table of contents block
- **FR-BLOCK-007**: Table of contents shall automatically generate from H1, H2, H3 headings
- **FR-BLOCK-008**: Table of contents shall provide clickable links to headings
- **FR-BLOCK-009**: Table of contents shall update dynamically when headings change

#### 3.4 Quiz/Poll Block
- **FR-BLOCK-010**: Authors shall be able to insert quiz/poll block
- **FR-BLOCK-011**: Authors shall be able to create question with multiple answers
- **FR-BLOCK-012**: System shall track user responses
- **FR-BLOCK-013**: System shall display statistics after user submission
- **FR-BLOCK-014**: Statistics shall show response counts and percentages

#### 3.5 Code Snippet Block
- **FR-BLOCK-015**: Authors shall be able to insert code snippet block
- **FR-BLOCK-016**: Code block shall support syntax highlighting
- **FR-BLOCK-017**: Authors shall be able to specify programming language
- **FR-BLOCK-018**: Code block shall be displayed in styled container

#### 3.6 Image/Product Carousel Block
- **FR-BLOCK-019**: Authors shall be able to insert carousel block
- **FR-BLOCK-020**: Authors shall be able to add multiple images to carousel
- **FR-BLOCK-021**: Each image shall have alt text
- **FR-BLOCK-022**: Each image shall be clickable to a link
- **FR-BLOCK-023**: Carousel shall support sliding/navigation between images

### 4 Media Management

#### 4.1 Image Upload
- **FR-MEDIA-001**: Authors shall be able to upload images
- **FR-MEDIA-002**: System shall validate image file types
- **FR-MEDIA-003**: System shall validate image file size
- **FR-MEDIA-004**: System shall store images securely
- **FR-MEDIA-005**: System shall generate accessible URLs for uploaded images
- **FR-MEDIA-006**: System shall support image optimization/resizing

### 5 Category Management

#### 5.1 Category CRUD
- **FR-CAT-001**: Authors shall be able to create categories
- **FR-CAT-002**: Authors shall be able to view all categories
- **FR-CAT-003**: Authors shall be able to edit categories
- **FR-CAT-004**: Authors shall be able to delete categories
- **FR-CAT-005**: System shall prevent deletion of categories with associated posts

#### 5.2 Category Display
- **FR-CAT-006**: Public blog shall display categories in navigation
- **FR-CAT-007**: Users shall be able to filter posts by category
- **FR-CAT-008**: Category pages shall display all posts in that category

### 6 Comment System

#### 6.1 Comment Submission
- **FR-COMMENT-001**: Readers shall be able to submit comments on published posts
- **FR-COMMENT-002**: Comments shall require name and email
- **FR-COMMENT-003**: Comments shall require content
- **FR-COMMENT-004**: System shall hold comments for moderation
- **FR-COMMENT-005**: Comments shall not appear publicly until approved

#### 6.2 Comment Moderation
- **FR-COMMENT-006**: Authors shall be able to view pending comments
- **FR-COMMENT-007**: Authors shall be able to approve comments
- **FR-COMMENT-008**: Authors shall be able to reject comments
- **FR-COMMENT-009**: System shall track moderation actions (who, when)
- **FR-COMMENT-010**: Approved comments shall appear on public blog

### 7 Public Blog Features

#### 7.1 Homepage
- **FR-PUBLIC-001**: Homepage shall display published blog posts
- **FR-PUBLIC-002**: Posts shall be displayed in reverse chronological order
- **FR-PUBLIC-003**: Homepage shall support pagination
- **FR-PUBLIC-004**: Each post preview shall show title, excerpt, featured image, date, author
- **FR-PUBLIC-005**: Homepage shall provide link to full post

#### 7.2 Post Display
- **FR-PUBLIC-006**: Full post page shall display complete post content
- **FR-PUBLIC-007**: Post page shall render all content blocks correctly
- **FR-PUBLIC-008**: Post page shall display post metadata (date, author, category, tags)
- **FR-PUBLIC-009**: Post page shall display approved comments
- **FR-PUBLIC-010**: Post page shall provide comment submission form

#### 7.3 Search & Filtering
- **FR-PUBLIC-011**: Users shall be able to search posts by keywords
- **FR-PUBLIC-012**: Users shall be able to search posts by tags
- **FR-PUBLIC-013**: Search shall work across title, content, and tags
- **FR-PUBLIC-014**: Users shall be able to filter posts by category via navigation

#### 7.4 Navigation
- **FR-PUBLIC-015**: Top navigation bar shall display all categories
- **FR-PUBLIC-016**: Navigation shall be responsive and accessible
- **FR-PUBLIC-017**: Navigation shall include search functionality

### 4.8 UI/UX Requirements

#### 4.8.1 Responsive Design
- **FR-UI-001**: All interfaces shall be responsive across devices
- **FR-UI-002**: Mobile, tablet, and desktop layouts shall be optimized

#### 4.8.2 Accessibility
- **FR-UI-003**: All interfaces shall meet WCAG 2.1 AA standards
- **FR-UI-004**: All images shall have alt text
- **FR-UI-005**: All interactive elements shall be keyboard accessible
- **FR-UI-006**: Color contrast shall meet accessibility standards
- **FR-UI-007**: Screen reader compatibility shall be ensured

#### 4.8.3 Performance
- **FR-UI-008**: Public blog shall load quickly (< 3 seconds)
- **FR-UI-009**: Images shall be optimized and lazy-loaded
- **FR-UI-010**: Admin dashboard shall provide smooth interactions

---

## 5. API Endpoints

### 5.1 Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### 5.2 Post Endpoints
- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (author only)
- `PUT /api/posts/:id` - Update post (author only)
- `DELETE /api/posts/:id` - Delete post (author only)
- `GET /api/posts/public` - Get published posts (public)
- `GET /api/posts/public/:slug` - Get published post by slug (public)

### 5.3 Category Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (author only)
- `PUT /api/categories/:id` - Update category (author only)
- `DELETE /api/categories/:id` - Delete category (author only)
- `GET /api/categories/public` - Get all categories (public)

### 5.4 Comment Endpoints
- `GET /api/comments` - Get comments (author only, with filters)
- `GET /api/comments/:id` - Get single comment
- `POST /api/comments` - Create comment (public)
- `PUT /api/comments/:id/approve` - Approve comment (author only)
- `PUT /api/comments/:id/reject` - Reject comment (author only)
- `GET /api/comments/post/:postId` - Get approved comments for post (public)

### 5.5 Media Endpoints
- `POST /api/media/upload` - Upload media (author only)
- `GET /api/media/:id` - Get media file
- `DELETE /api/media/:id` - Delete media (author only)

---

## 6. Security Requirements

### 6.1 Authentication Security
- **SEC-001**: Passwords shall be hashed using bcrypt (minimum 10 rounds)
- **SEC-002**: JWT tokens shall have expiration times
- **SEC-003**: Tokens shall be stored in httpOnly cookies
- **SEC-004**: API shall validate tokens on protected routes

### 6.2 Input Validation
- **SEC-005**: All user inputs shall be validated and sanitized
- **SEC-006**: File uploads shall be validated for type and size
- **SEC-007**: SQL injection prevention (N/A for MongoDB, but NoSQL injection prevention)
- **SEC-008**: XSS prevention through input sanitization

### 6.3 Authorization
- **SEC-009**: API shall enforce role-based access control
- **SEC-010**: Authors shall only modify their own posts (unless admin)
- **SEC-011**: Public endpoints shall not expose sensitive data

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **NFR-001**: API response time < 200ms for standard queries
- **NFR-002**: Database queries shall be optimized with proper indexes
- **NFR-003**: Public blog shall support caching strategies

### 7.2 Scalability
- **NFR-004**: Architecture shall support horizontal scaling
- **NFR-005**: Database shall support sharding if needed
- **NFR-006**: Media storage shall be scalable (consider CDN)

### 7.3 Maintainability
- **NFR-007**: Code shall follow consistent style guidelines
- **NFR-008**: Code shall be modular and well-documented
- **NFR-009**: API shall have clear error messages

### 7.4 Reliability
- **NFR-010**: System shall handle errors gracefully
- **NFR-011**: System shall provide appropriate error messages
- **NFR-012**: Database operations shall use transactions where needed

---

## 8. Future Enhancements (Out of Scope)

- User registration for readers
- Social media sharing
- Email notifications
- RSS feeds
- Multi-language support
- Advanced analytics
- SEO optimization tools
- Scheduled publishing

