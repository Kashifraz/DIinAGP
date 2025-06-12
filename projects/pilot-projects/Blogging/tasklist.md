# Blog Platform Incremental Development Roadmap

---

## 1. User Authentication & Author Dashboard Setup
- [ ] Set up Laravel project with Inertia.js and Vue.js
- [ ] Configure database connection
- [ ] Implement author registration and login (Laravel Breeze/Jetstream)
- [ ] Secure dashboard routes (middleware)
- [ ] Author profile management (basic)

---

## 2. Blog Post Management (CRUD, Draft/Publish, Rich Editor)
- [ ] Design posts table (migration)
- [ ] Implement post CRUD (backend/controllers)
- [ ] Integrate rich text editor with image upload (frontend)
- [ ] Save as draft or publish
- [ ] Post preview feature

---

## 3. Category & Tag Management
- [ ] Design categories and tags tables (migration)
- [ ] Backend CRUD for categories and tags
- [ ] Frontend UI for managing categories/tags
- [ ] Add categories and tags option to Posts



## 4. Public Blog Website (Homepage, Post View, Navigation)
- [ ] Homepage: list published posts with pagination
- [ ] Display categories as navigation in the top navigation
- [ ] Post view: display full post, metadata, and comments
- [ ] Category navigation (show filtered by category post from top navigation)
- [ ] Search by tags
- [ ] The blog main reader side interface should be follow modern UI
---

## 5. Comment System & Moderation
- [ ] Design comments table (migration)
- [ ] Allow readers to submit comments
- [ ] Backend logic to hold comments for moderation
- [ ] Dashboard UI for comment moderation (approve/reject/delete)
- [ ] Display approved comments on public posts

---
