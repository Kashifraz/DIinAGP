# Social App Incremental Development Roadmap

## 1. User Authentication (Feature 1)
- **Database:**
  - Create user table (id, name, email, password_hash, created_at)
- **Backend:**
  - Implement user registration (sign up)
  - Implement user login (JWT authentication)
  - Implement user logout (token invalidation if needed)
  - Secure password hashing
- **Frontend:**
  - Registration screen
  - Login screen

## 2. User Profile (Feature 2)
- **Database:**
  - Add bio, profile_photo_url fields to user table (if not already present)
- **Backend:**
  - Implement profile update (name, bio, profile photo upload)
  - Implement get current user profile
  - Implement user search (by name/email)
- **Frontend:**
  - Profile screen (view/update)
  - Profile photo upload UI
  - User search UI

## 3. Friend System (Feature 3)
- **Database:**
  - Create friend_requests table (id, from_user_id, to_user_id, status, created_at)
  - Create friends table (user_id, friend_id, created_at)
- **Backend:**
  - Send friend request
  - Accept/reject friend request
  - List incoming/outgoing friend requests
  - List friends
  - Enforce privacy: only friends can view each other's content
- **Frontend:**
  - Friend request UI (send, accept, reject)
  - Friends list UI
  - Friend request notifications

## 4. Posts (Feature 4)
- **Database:**
  - Create posts table (id, user_id, text, image_url, created_at)
- **Backend:**
  - Create post (text/image)
  - List posts (friends only)
  - Delete post
  - Enforce privacy: only friends can interact
- **Frontend:**
  - Create post UI (text/image)
  - Feed UI (friends' posts)
  - Delete post UI

## 5. Comments (Feature 5)
- **Database:**
  - Create comments table (id, post_id, user_id, text, created_at)
- **Backend:**
  - Add comment to post
  - List comments for a post
  - Delete comment
  - Enforce privacy: only friends can comment
- **Frontend:**
  - Comment UI under each post
  - List/add/delete comments

## 6. Likes (Feature 6)
- **Database:**
  - Create likes table (id, post_id, user_id, created_at)
- **Backend:**
  - Like/unlike post
  - Get like count for a post
  - Enforce privacy: only friends can like
- **Frontend:**
  - Like button on each post
  - Show like count

---

**Note:**
- Each feature is developed end-to-end (DB, backend, frontend) before moving to the next.
- Adjust roadmap as requirements evolve. 