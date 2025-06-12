# Social Networking Application - Requirements Document

## 1. System Overview

### 1.1 Purpose
A modern social networking application that enables users to connect, share content, and communicate privately. The platform emphasizes privacy through a friend-based content sharing model.

### 1.2 Technology Stack
- **Backend**: Java Spring Boot
- **Frontend**: React Native (Mobile Application)
- **Database**: To be determined (PostgreSQL/MySQL recommended)
- **File Storage**: Local filesystem or cloud storage (AWS S3/Azure Blob Storage)

### 1.3 Core Principles
- Privacy-first: Content is only visible to confirmed friends
- Secure: All media uploads and user data must be handled securely
- Scalable: Architecture supports future growth
- Modern: Clean, responsive UI/UX following modern design standards
- Modular: Well-defined modules with clear separation of concerns

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │ REST API (HTTPS)
         │
┌────────▼────────┐
│  Spring Boot    │
│   Backend API   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Database│ │ File │
│        │ │Storage│
└────────┘ └──────┘
```

### 2.2 Backend Architecture (Spring Boot)
- **Controller Layer**: REST API endpoints
- **Service Layer**: Business logic
- **Repository Layer**: Data access (JPA/Hibernate)
- **Model Layer**: Entity classes
- **Security Layer**: Authentication and authorization
- **Configuration Layer**: Application configuration

### 2.3 Frontend Architecture (React Native)
- **Screens**: UI components for each feature
- **Components**: Reusable UI elements
- **Services**: API communication layer
- **State Management**: Global state (Redux/Context API)
- **Navigation**: Screen navigation (React Navigation)
- **Utils**: Helper functions and utilities

---

## 3. Functional Requirements

### 1 Authentication Module

#### 1.1 User Registration
- **FR-AUTH-001**: Users must be able to sign up with:
  - Email address (unique, validated)
  - Password (minimum strength requirements)
  - Full name
- **FR-AUTH-002**: Email validation must be performed
- **FR-AUTH-003**: Password must meet security requirements (min length, complexity)
- **FR-AUTH-004**: System must prevent duplicate email registrations
- **FR-AUTH-005**: Upon successful registration, user account is created with default profile

#### 1.2 User Login
- **FR-AUTH-006**: Users must be able to log in with email and password
- **FR-AUTH-007**: System must validate credentials
- **FR-AUTH-008**: Upon successful login, system must issue authentication token (JWT)
- **FR-AUTH-009**: Token must be stored securely on client device
- **FR-AUTH-010**: Failed login attempts should be logged

#### 1.3 User Logout
- **FR-AUTH-011**: Users must be able to log out
- **FR-AUTH-012**: Logout must invalidate current session/token
- **FR-AUTH-013**: User must be redirected to login screen after logout

#### 1.4 Session Management
- **FR-AUTH-014**: System must validate authentication token on protected endpoints
- **FR-AUTH-015**: Token expiration must be handled gracefully
- **FR-AUTH-016**: Users must be able to refresh tokens

---

### 2 User Profile Module

#### 2.1 Profile Creation
- **FR-PROF-001**: System must create default profile upon user registration
- **FR-PROF-002**: Default profile includes:
  - User ID (auto-generated)
  - Email address
  - Full name
  - Empty bio field
  - Default profile photo placeholder

#### 2.2 Profile Viewing
- **FR-PROF-003**: Users must be able to view their own profile
- **FR-PROF-004**: Users must be able to view profiles of their confirmed friends
- **FR-PROF-005**: Profile view must display:
  - Profile photo
  - Full name
  - Bio
  - Friend status (if viewing other user's profile)

#### 2.3 Profile Updates
- **FR-PROF-006**: Users must be able to update their own profile
- **FR-PROF-007**: Users can update:
  - Full name
  - Bio (text, character limit)
  - Profile photo
- **FR-PROF-008**: Profile updates must be saved immediately
- **FR-PROF-009**: Profile photo updates must replace previous photo

#### 2.4 Profile Photo Management
- **FR-PROF-010**: Users must be able to upload profile photos
- **FR-PROF-011**: Supported image formats: JPEG, PNG
- **FR-PROF-012**: Image size must be validated (max file size)
- **FR-PROF-013**: Images must be securely stored
- **FR-PROF-014**: System must generate thumbnail versions for efficient loading
- **FR-PROF-015**: Old profile photos must be deleted when new ones are uploaded

---

### 3 User Search Module

#### 3.1 Search Functionality
- **FR-SRCH-001**: Authenticated users must be able to search for other users
- **FR-SRCH-002**: Search must support:
  - Search by name (partial match)
  - Search by email (exact or partial match)
- **FR-SRCH-003**: Search results must display:
  - User's profile photo
  - User's full name
  - Current friend status (if applicable)
- **FR-SRCH-004**: Search results must exclude the current user
- **FR-SRCH-005**: Search must be case-insensitive
- **FR-SRCH-006**: Search results should be paginated

---

### 4 Friend System Module

#### 4.1 Friend Request Management
- **FR-FRND-001**: Users must be able to send friend requests to other users
- **FR-FRND-002**: Users cannot send friend requests to:
  - Themselves
  - Users who are already friends
  - Users who have a pending request (sent or received)
- **FR-FRND-003**: Friend requests must have status: PENDING, ACCEPTED, REJECTED
- **FR-FRND-004**: Users must be able to view pending friend requests (sent and received)
- **FR-FRND-005**: Users must be able to accept friend requests
- **FR-FRND-006**: Users must be able to reject friend requests
- **FR-FRND-007**: Upon acceptance, both users become confirmed friends
- **FR-FRND-008**: Rejected requests should be removed or marked as rejected

#### 4.2 Friend List
- **FR-FRND-009**: Users must be able to view their list of confirmed friends
- **FR-FRND-010**: Friend list must display:
  - Friend's profile photo
  - Friend's full name
  - Date when friendship was established
- **FR-FRND-011**: Friend list should be sortable and searchable
- **FR-FRND-012**: Friend list should support pagination

#### 4.3 Friend Status
- **FR-FRND-013**: System must track friend relationships bidirectionally
- **FR-FRND-014**: Friend status must be checked before allowing content access
- **FR-FRND-015**: Users can unfriend (remove friendship) - this should remove access to each other's content

---

### 5 Post Module

#### 5.1 Post Creation
- **FR-POST-001**: Users must be able to create posts
- **FR-POST-002**: Posts must include:
  - Text content (required, character limit)
  - Images (optional, multiple images per post)
- **FR-POST-003**: Posts must have:
  - Unique post ID
  - Author (user who created it)
  - Creation timestamp
  - Like count (initialized to 0)
- **FR-POST-004**: Image uploads must be validated (format, size)
- **FR-POST-005**: Multiple images per post must be supported
- **FR-POST-006**: Images must be securely stored

#### 5.2 Post Visibility
- **FR-POST-007**: Posts are only visible to:
  - The post author (their own posts)
  - Confirmed friends of the post author
- **FR-POST-008**: Non-friends cannot see posts
- **FR-POST-009**: Users must see a feed of posts from all their friends

#### 5.3 Post Viewing
- **FR-POST-010**: Users must be able to view their own posts
- **FR-POST-011**: Users must be able to view posts from their friends
- **FR-POST-012**: Post display must show:
  - Author's profile photo and name
  - Post text content
  - Post images
  - Number of likes
  - Comments (if any)
  - Post timestamp
- **FR-POST-013**: Posts should be displayed in reverse chronological order (newest first)
- **FR-POST-014**: Post feed should support pagination

#### 5.4 Post Updates
- **FR-POST-015**: Users must be able to edit their own posts
- **FR-POST-016**: Users can update text content
- **FR-POST-017**: Users can add or remove images from existing posts
- **FR-POST-018**: Post updates must preserve like and comment data

#### 5.5 Post Deletion
- **FR-POST-019**: Users must be able to delete their own posts
- **FR-POST-020**: Post deletion must remove:
  - Post record from database
  - Associated images from storage
  - All likes and comments associated with the post

---

### 6 Like Module

#### 6.1 Liking Posts
- **FR-LIKE-001**: Friends must be able to like posts
- **FR-LIKE-002**: Users can like posts from their friends
- **FR-LIKE-003**: Users cannot like their own posts (optional requirement - can be changed)
- **FR-LIKE-004**: Users can unlike posts they previously liked
- **FR-LIKE-005**: Like action must be immediate (toggle behavior)

#### 6.2 Like Display
- **FR-LIKE-006**: Each post must display the total number of likes
- **FR-LIKE-007**: Like count must update in real-time
- **FR-LIKE-008**: System must track which users liked which posts

---

### 7 Comment Module

#### 7.1 Comment Creation
- **FR-CMT-001**: Friends must be able to comment on posts
- **FR-CMT-002**: Comments must include:
  - Text content (required, character limit)
  - Author (user who created it)
  - Post ID (post being commented on)
  - Creation timestamp
- **FR-CMT-003**: Users can comment on posts from their friends
- **FR-CMT-004**: Comments must be associated with a specific post

#### 7.2 Comment Viewing
- **FR-CMT-005**: Comments must be displayed on the post they belong to
- **FR-CMT-006**: Comments must show:
  - Commenter's profile photo and name
  - Comment text
  - Comment timestamp
- **FR-CMT-007**: Comments should be displayed in chronological order (oldest first)
- **FR-CMT-008**: Comments should support pagination for posts with many comments

#### 7.3 Comment Updates
- **FR-CMT-009**: Users must be able to edit their own comments
- **FR-CMT-010**: Comment updates must preserve timestamp and association

#### 7.4 Comment Deletion
- **FR-CMT-011**: Users must be able to delete their own comments
- **FR-CMT-012**: Post authors must be able to delete any comment on their posts

---

### 8 Media Management Module

#### 8.1 Image Upload
- **FR-MEDIA-001**: System must handle image uploads securely
- **FR-MEDIA-002**: Supported formats: JPEG, PNG
- **FR-MEDIA-003**: Maximum file size must be enforced
- **FR-MEDIA-004**: Images must be validated before storage
- **FR-MEDIA-005**: Uploaded images must be stored in secure location

#### 8.2 Image Storage
- **FR-MEDIA-006**: Profile photos must be stored separately from post images
- **FR-MEDIA-007**: System must generate unique filenames to prevent conflicts
- **FR-MEDIA-008**: Old images must be deleted when replaced
- **FR-MEDIA-009**: System should generate thumbnails for efficient loading

#### 8.3 Image Retrieval
- **FR-MEDIA-010**: System must serve images via secure endpoints
- **FR-MEDIA-011**: Images must only be accessible to authorized users
- **FR-MEDIA-012**: Profile photos must be accessible to friends
- **FR-MEDIA-013**: Post images must only be accessible to friends of the post author

---

## 4. Non-Functional Requirements

### 4.1 Security Requirements
- **NFR-SEC-001**: All API endpoints must use HTTPS
- **NFR-SEC-002**: Passwords must be hashed (BCrypt recommended)
- **NFR-SEC-003**: Authentication tokens must be JWT with expiration
- **NFR-SEC-004**: File uploads must be validated and sanitized
- **NFR-SEC-005**: SQL injection prevention (using parameterized queries)
- **NFR-SEC-006**: CORS must be properly configured
- **NFR-SEC-007**: Rate limiting on authentication endpoints

### 4.2 Performance Requirements
- **NFR-PERF-001**: API response time should be < 500ms for standard operations
- **NFR-PERF-002**: Image loading should be optimized (thumbnails, lazy loading)
- **NFR-PERF-003**: Pagination must be implemented for large data sets
- **NFR-PERF-004**: Database queries must be optimized (indexing)

### 4.3 Usability Requirements
- **NFR-USE-001**: UI must be responsive and work on various screen sizes
- **NFR-USE-002**: UI must follow modern design principles
- **NFR-USE-003**: Error messages must be clear and user-friendly
- **NFR-USE-004**: Loading states must be displayed for async operations
- **NFR-USE-005**: Offline handling (graceful degradation)

### 4.4 Scalability Requirements
- **NFR-SCAL-001**: Architecture must support horizontal scaling
- **NFR-SCAL-002**: Database must be designed for growth
- **NFR-SCAL-003**: File storage must be scalable (consider cloud storage)

---

## 5. Data Model

### 5.1 Core Entities

#### User Entity
- `id` (Long, Primary Key, Auto-generated)
- `email` (String, Unique, Not Null)
- `password` (String, Hashed, Not Null)
- `fullName` (String, Not Null)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### Profile Entity
- `id` (Long, Primary Key, Auto-generated)
- `userId` (Long, Foreign Key to User, Unique)
- `bio` (String, Optional)
- `profilePhotoUrl` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### FriendRequest Entity
- `id` (Long, Primary Key, Auto-generated)
- `senderId` (Long, Foreign Key to User)
- `receiverId` (Long, Foreign Key to User)
- `status` (Enum: PENDING, ACCEPTED, REJECTED)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- Unique constraint on (senderId, receiverId)

#### Post Entity
- `id` (Long, Primary Key, Auto-generated)
- `authorId` (Long, Foreign Key to User)
- `content` (String, Not Null)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

#### PostImage Entity
- `id` (Long, Primary Key, Auto-generated)
- `postId` (Long, Foreign Key to Post)
- `imageUrl` (String, Not Null)
- `order` (Integer, for ordering multiple images)
- `createdAt` (Timestamp)

#### Like Entity
- `id` (Long, Primary Key, Auto-generated)
- `postId` (Long, Foreign Key to Post)
- `userId` (Long, Foreign Key to User)
- `createdAt` (Timestamp)
- Unique constraint on (postId, userId)

#### Comment Entity
- `id` (Long, Primary Key, Auto-generated)
- `postId` (Long, Foreign Key to Post)
- `authorId` (Long, Foreign Key to User)
- `content` (String, Not Null)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

---

## 6. API Endpoints (High-Level)

### 6.1 Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### 6.2 User Profile Endpoints
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/{userId}` - Get user profile by ID
- `POST /api/users/me/profile-photo` - Upload profile photo

### 6.3 Search Endpoints
- `GET /api/users/search?query={query}` - Search users

### 6.4 Friend Endpoints
- `GET /api/friends` - Get friend list
- `GET /api/friends/requests` - Get friend requests (sent and received)
- `POST /api/friends/requests` - Send friend request
- `PUT /api/friends/requests/{requestId}/accept` - Accept friend request
- `PUT /api/friends/requests/{requestId}/reject` - Reject friend request
- `DELETE /api/friends/{friendId}` - Unfriend user

### 6.5 Post Endpoints
- `GET /api/posts` - Get posts feed (friends' posts)
- `GET /api/posts/{postId}` - Get specific post
- `POST /api/posts` - Create post
- `PUT /api/posts/{postId}` - Update post
- `DELETE /api/posts/{postId}` - Delete post

### 6.6 Like Endpoints
- `POST /api/posts/{postId}/like` - Like a post
- `DELETE /api/posts/{postId}/like` - Unlike a post

### 6.7 Comment Endpoints
- `GET /api/posts/{postId}/comments` - Get comments for a post
- `POST /api/posts/{postId}/comments` - Create comment
- `PUT /api/comments/{commentId}` - Update comment
- `DELETE /api/comments/{commentId}` - Delete comment

### 6.8 Media Endpoints
- `GET /api/media/{imageId}` - Get image (with authorization check)

---

## 7. Module Structure

### 7.1 Backend Modules (Spring Boot)
1. **auth** - Authentication and authorization
2. **user** - User and profile management
3. **friend** - Friend system and friend requests
4. **post** - Post creation, viewing, and management
5. **like** - Like functionality
6. **comment** - Comment functionality
7. **media** - Media upload and storage
8. **search** - User search functionality
9. **common** - Shared utilities, exceptions, DTOs

### 7.2 Frontend Modules (React Native)
1. **auth** - Login, registration, logout screens
2. **profile** - Profile viewing and editing
3. **search** - User search screen
4. **friends** - Friend list and friend requests
5. **feed** - Post feed screen
6. **post** - Post creation and viewing
7. **components** - Reusable UI components
8. **services** - API service layer
9. **utils** - Helper functions and utilities
10. **navigation** - Navigation configuration

---

## 8. Security Considerations

### 8.1 Authentication
- JWT tokens with expiration
- Token refresh mechanism
- Secure password storage (BCrypt)

### 8.2 Authorization
- Role-based access control
- Friend-based content access
- User can only modify their own content

### 8.3 Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- File upload validation

### 8.4 Privacy
- Content visibility based on friend status
- Profile information only visible to friends
- Search results respect privacy settings

---

## 9. Future Enhancements (Out of Scope for Initial Build)
- Real-time messaging/chat
- Push notifications
- Story/Status feature
- Post sharing
- Groups/Communities
- Hashtags and mentions
- Activity feed/notifications
- Advanced search filters
- Privacy settings (public/private profiles)

---

## 10. Assumptions and Constraints

### 10.1 Assumptions
- Users have stable internet connection
- Mobile devices support camera and image selection
- Backend will be deployed on a server with file storage capability
- Database will be relational (PostgreSQL/MySQL)

### 10.2 Constraints
- Initial version focuses on core features only
- No real-time features in initial version
- No web application (mobile only)
- No admin panel in initial version

---

## Document Version
- **Version**: 1.0
- **Last Updated**: Initial Creation
- **Status**: Planning Phase

