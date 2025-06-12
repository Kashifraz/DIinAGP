# Blog Platform Requirements

## System Overview
A modern, scalable blog platform with two main applications:
- **Dashboard**: For authors to manage content, categories, and comments.
- **Public Blog Website**: For readers to browse, search, and comment on published posts.

Built with PHP Laravel (backend), Inertia.js (SPA bridge), and Vue.js (frontend).

---

## Major Components & Modules

### 1. **Dashboard (Author/Admin Panel)**
- **Authentication & Authorization**
  - Secure login/logout for authors
  - Password reset, session management
- **Blog Post Management**
  - Create, edit, delete, preview posts
  - Rich text editor with media (image) uploads
  - Save as draft or publish
  - Assign categories and tags
- **Category Management**
  - Create, edit, delete categories
  - Assign categories to posts
- **Comment Moderation**
  - View, accept, or reject comments on posts
  - Filter comments by status (pending, approved, rejected)
- **Media Management**
  - Upload, view, and delete images/media for posts

### 2. **Public Blog Website**
- **Homepage**
  - List published posts with pagination
  - Filter by category (navigation bar)
  - Search by tags or keywords
- **Post View**
  - Read full post
  - Display post metadata (author, date, categories, tags)
  - Show approved comments
  - Submit new comment (held for moderation)
- **Category Navigation**
  - Filter posts by category
- **Accessibility & UX**
  - Responsive design
  - Adheres to accessibility standards

### 3. **Backend (Laravel API/Controllers)**
- **User Management**
  - Author CRUD, roles/permissions
- **Post Management**
  - CRUD operations, status (draft/published)
  - Media upload handling
- **Category & Tag Management**
  - CRUD for categories/tags
- **Comment Management**
  - CRUD, moderation status
- **Search & Filtering**
  - Full-text search, tag/category filtering
- **API Security**
  - Auth middleware, rate limiting

### 4. **Database (MySQL/PostgreSQL)**
- **Tables**
  - users, posts, categories, tags, post_tag, comments, media
- **Relationships**
  - posts <-> categories (many-to-one)
  - posts <-> tags (many-to-many)
  - posts <-> comments (one-to-many)
  - posts <-> media (one-to-many)

---

## Detailed Module Requirements

### **Authentication & Authorization**
- Only registered authors can access dashboard
- Secure password storage (bcrypt/argon2)
- Session and CSRF protection

### **Blog Post Management**
- Rich text editor with image upload
- Draft and publish states
- Assign multiple categories/tags
- Preview before publishing
- Soft delete (trash/restore)

### **Category & Tag Management**
- CRUD operations
- Categories shown as navigation filters
- Tags used for search/discoverability

### **Comment Moderation**
- Comments require approval before public display
- Authors can accept/reject/delete comments
- Email notification to author on new comment (optional)

### **Media Management**
- Upload images via editor or media library
- Associate media with posts
- Remove unused media

### **Public Blog Website**
- Paginated list of published posts
- Filter by category (top nav)
- Search by tag/keyword
- Responsive, accessible UI
- Submit comments (pending moderation)

---

## Non-Functional Requirements
- Responsive and accessible UI (WCAG 2.1 AA)
- SEO-friendly (server-side rendering, meta tags)
- Scalable architecture (modular code, database indexing)
- Secure (input validation, XSS/CSRF protection)
- Automated tests for critical features 