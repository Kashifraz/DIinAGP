# Social App Requirements

## 1. System Architecture

- **Frontend:** React Native mobile app (iOS & Android)
- **Backend:** Python Flask REST API
- **Database:** Relational (PostgreSQL or MySQL recommended)
- **Media Storage:** Local or cloud (e.g., AWS S3, Google Cloud Storage)
- **Authentication:** JWT-based authentication
- **Deployment:** Cloud-based (Heroku, AWS, etc.)

## 2. Major Components & Modules

### 2.1 User Management
- **User Registration & Login**
- **Profile Management**
- **Profile Photo Upload**
- **User Search**

### 2.2 Social Graph (Friend System)
- **Send Friend Request**
- **Accept/Reject Friend Request**
- **List Friends**
- **Friendship Privacy Enforcement**

### 2.3 Content Sharing
- **Create Post (Text & Image)**
- **View Friends' Posts**
- **Like Post**
- **Comment on Post**
- **Post Privacy (Friends Only)**

### 2.4 Media Handling
- **Profile Photo Upload & Storage**
- **Post Image Upload & Storage**
- **Secure Media Access**

### 2.5 Communication (Future Increment)
- **Private Messaging**

## 3. Detailed Requirements

### 3.1 User Management
- Users can sign up with email, password, name.
- Users can log in and log out securely.
- Users can update their profile (name, bio, profile photo).
- Users can search for others by name or email.
- Passwords must be securely hashed.

### 3.2 Social Graph
- Users can send friend requests to others.
- Users can accept or reject incoming friend requests.
- Only confirmed friends can view each other's posts and profiles.
- Users can view a list of their friends.

### 3.3 Content Sharing
- Authenticated users can create posts with text and optional images.
- Posts are visible only to friends.
- Friends can like and comment on posts.
- Each post displays the number of likes and comments.

### 3.4 Media Handling
- All media uploads (profile photos, post images) are validated and securely stored.
- Media URLs are protected and accessible only to authorized users.

### 3.5 Security & Privacy
- All endpoints require authentication unless explicitly public.
- Input validation and sanitization on all user inputs.
- Rate limiting and brute-force protection on authentication endpoints.

### 3.6 UI/UX
- Clean, modern, and responsive design.
- Consistent experience across iOS and Android.
- Intuitive navigation and feedback for all actions.

---

This document is the single source of truth for the Social App's architecture and requirements. All changes must be reflected here. 