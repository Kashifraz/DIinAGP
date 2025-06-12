# Social Networking Application - Feature-Based Development Roadmap

This document outlines the feature-based incremental development plan. Each section represents a complete, independent feature that can be built and tested independently. Features are ordered by dependency and priority.

**Database**: MySQL

---

## Feature 1: Project Setup and Foundation

### Overview
Set up the project structure, development environment, and foundational infrastructure for both backend and frontend.

### Database Tasks
- [ ] Set up MySQL database instance
- [ ] Design and create database schema
- [ ] Configure MySQL connection in Spring Boot (application.properties)
- [ ] Set up database connection pool configuration
- [ ] Create initial migration scripts (Flyway/Liquibase or SQL scripts)
- [ ] Set up database indexes for performance

### Backend Tasks
- [ ] Initialize Spring Boot project structure
- [ ] Configure project dependencies (Spring Boot, Spring Security, JPA, etc.)
- [ ] Set up application properties and configuration
- [ ] Create base package structure (controller, service, repository, model, config, exception)
- [ ] Configure CORS settings
- [ ] Set up global exception handling
- [ ] Create base response DTOs and utilities
- [ ] Configure file upload settings
- [ ] Set up logging configuration

### Frontend Tasks
- [ ] Initialize React Native project
- [ ] Set up project dependencies (React Navigation, Axios/Fetch, AsyncStorage, etc.)
- [ ] Create folder structure (screens, components, services, utils, navigation)
- [ ] Configure navigation structure
- [ ] Set up API service layer (base URL, interceptors)
- [ ] Create reusable UI components (Button, Input, Card, etc.)
- [ ] Set up theme/colors configuration
- [ ] Configure image picker library
- [ ] Set up state management (Redux/Context API)

---

## Feature 2: User Authentication

### Overview
Implement user registration, login, and logout functionality. This is the foundation for all other features.

### Database Tasks
- [ ] Create `users` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - email (VARCHAR(255), Unique, Not Null)
  - password (VARCHAR(255), Hashed, Not Null)
  - full_name (VARCHAR(255), Not Null)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- [ ] Create indexes on email for fast lookups
- [ ] Create MySQL migration script for users table

### Backend Tasks
- [ ] Create User entity class
- [ ] Create UserRepository interface
- [ ] Create UserService with registration logic
- [ ] Create UserService with login logic
- [ ] Implement password hashing (BCrypt)
- [ ] Create JWT token generation utility
- [ ] Create JWT token validation filter/interceptor
- [ ] Create AuthenticationController with endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
- [ ] Create DTOs for registration and login requests/responses
- [ ] Implement input validation for email and password
- [ ] Handle duplicate email registration errors
- [ ] Configure Spring Security for authentication
- [ ] Set up JWT token expiration and refresh mechanism

### Frontend Tasks
- [ ] Create Login screen UI
- [ ] Create Registration screen UI
- [ ] Implement login form with validation
- [ ] Implement registration form with validation
- [ ] Create authentication service (API calls)
- [ ] Implement token storage (AsyncStorage)
- [ ] Create authentication context/state management
- [ ] Implement navigation flow (login → home, logout → login)
- [ ] Add loading states and error handling
- [ ] Create protected route wrapper
- [ ] Style login and registration screens

---

## Feature 3: User Profile Management

### Overview
Allow users to create, view, and update their profiles, including profile photo upload.

### Database Tasks
- [ ] Create `profiles` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - user_id (BIGINT, Foreign Key to users, Unique)
  - bio (TEXT, Optional)
  - profile_photo_url (VARCHAR(500), Optional)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- [ ] Create foreign key constraint on user_id referencing users(id)
- [ ] Create MySQL migration script for profiles table
- [ ] Set up automatic profile creation trigger (or handle in application)

### Backend Tasks
- [ ] Create Profile entity class
- [ ] Create ProfileRepository interface
- [ ] Create ProfileService with CRUD operations
- [ ] Implement profile creation on user registration
- [ ] Create ProfileController with endpoints:
  - GET /api/users/me (get current user profile)
  - PUT /api/users/me (update current user profile)
  - GET /api/users/{userId} (get user profile by ID)
- [ ] Create profile photo upload endpoint:
  - POST /api/users/me/profile-photo
- [ ] Implement file upload handling (MultipartFile)
- [ ] Implement file validation (type, size)
- [ ] Implement file storage (local filesystem or cloud)
- [ ] Generate unique filenames for uploaded images
- [ ] Delete old profile photos when new ones are uploaded
- [ ] Create DTOs for profile requests/responses
- [ ] Implement authorization (users can only update their own profile)

### Frontend Tasks
- [ ] Create Profile screen UI
- [ ] Create Edit Profile screen UI
- [ ] Display user profile information (name, bio, photo)
- [ ] Implement profile update form
- [ ] Implement profile photo upload (image picker)
- [ ] Create profile service (API calls)
- [ ] Display profile photo with placeholder
- [ ] Add image preview before upload
- [ ] Show loading states during upload
- [ ] Handle upload progress and errors
- [ ] Style profile screens

---

## Feature 4: User Search

### Overview
Enable users to search for other registered users by name or email.

### Database Tasks
- [ ] Create MySQL indexes on user name and email for search performance
- [ ] Add FULLTEXT index on full_name and email for better search (optional)
- [ ] Optimize search queries with proper indexing

### Backend Tasks
- [ ] Create SearchService with user search logic
- [ ] Implement search by name (partial match, case-insensitive)
- [ ] Implement search by email (partial match, case-insensitive)
- [ ] Create SearchController with endpoint:
  - GET /api/users/search?query={query}
- [ ] Implement pagination for search results
- [ ] Exclude current user from search results
- [ ] Create search response DTOs
- [ ] Add authorization (only authenticated users can search)

### Frontend Tasks
- [ ] Create Search screen UI
- [ ] Implement search input with debouncing
- [ ] Display search results list
- [ ] Show user profile photo, name in search results
- [ ] Create search service (API calls)
- [ ] Implement pagination in search results
- [ ] Handle empty search results
- [ ] Add loading states
- [ ] Style search screen
- [ ] Navigate to user profile from search results

---

## Feature 5: Friend System - Friend Requests

### Overview
Implement the ability to send, accept, and reject friend requests.

### Database Tasks
- [ ] Create `friend_requests` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - sender_id (BIGINT, Foreign Key to users)
  - receiver_id (BIGINT, Foreign Key to users)
  - status (ENUM('PENDING', 'ACCEPTED', 'REJECTED'), Default 'PENDING')
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
  - Unique constraint on (sender_id, receiver_id)
- [ ] Create `friendships` table in MySQL (or use friend_requests with ACCEPTED status)
  - id (BIGINT, Primary Key, Auto-increment)
  - user1_id (BIGINT, Foreign Key to users)
  - user2_id (BIGINT, Foreign Key to users)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - Unique constraint on (user1_id, user2_id) with proper ordering
- [ ] Create foreign key constraints on sender_id, receiver_id, user1_id, user2_id
- [ ] Create indexes on sender_id, receiver_id, and status
- [ ] Create MySQL migration scripts for friend system tables

### Backend Tasks
- [ ] Create FriendRequest entity class
- [ ] Create Friendship entity class (if separate table)
- [ ] Create FriendRequestRepository interface
- [ ] Create FriendshipRepository interface
- [ ] Create FriendService with business logic:
  - Send friend request
  - Accept friend request
  - Reject friend request
  - Check if users are friends
  - Prevent duplicate requests
- [ ] Create FriendController with endpoints:
  - GET /api/friends/requests (get sent and received requests)
  - POST /api/friends/requests (send friend request)
  - PUT /api/friends/requests/{requestId}/accept
  - PUT /api/friends/requests/{requestId}/reject
- [ ] Create DTOs for friend request operations
- [ ] Implement validation (cannot send request to self, cannot send duplicate requests)
- [ ] Implement bidirectional friendship creation on acceptance
- [ ] Add authorization checks

### Frontend Tasks
- [ ] Create Friend Requests screen UI
- [ ] Display pending friend requests (sent and received)
- [ ] Implement send friend request functionality
- [ ] Implement accept friend request button
- [ ] Implement reject friend request button
- [ ] Create friend service (API calls)
- [ ] Show friend request status in user profiles
- [ ] Add loading states and error handling
- [ ] Style friend requests screen
- [ ] Update UI after accepting/rejecting requests

---

## Feature 6: Friend System - Friend List

### Overview
Display the list of confirmed friends and allow users to view their friends.

### Database Tasks
- [ ] Optimize MySQL queries for friend list retrieval
- [ ] Ensure proper indexing for friendship queries
- [ ] Review and optimize foreign key relationships

### Backend Tasks
- [ ] Extend FriendService to get friend list
- [ ] Create endpoint:
  - GET /api/friends (get confirmed friends list)
- [ ] Implement friend list retrieval with user details
- [ ] Add pagination support
- [ ] Create friend list response DTOs
- [ ] Implement unfriend functionality:
  - DELETE /api/friends/{friendId}
- [ ] Remove friendship records when unfriending

### Frontend Tasks
- [ ] Create Friends List screen UI
- [ ] Display list of confirmed friends
- [ ] Show friend profile photos and names
- [ ] Implement unfriend functionality
- [ ] Add search/filter in friends list
- [ ] Implement pagination
- [ ] Create friends service (API calls)
- [ ] Navigate to friend's profile from list
- [ ] Style friends list screen

---

## Feature 7: Post Creation and Management

### Overview
Allow users to create posts with rich text content (including emojis) and images, and manage their own posts. Users should be able to format their post text using a rich text editor and add emojis through an emoji selector.

### Database Tasks
- [ ] Create `posts` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - author_id (BIGINT, Foreign Key to users)
  - content (TEXT, Not Null) - Stores rich text content (HTML or formatted text with emojis)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- [ ] Create `post_images` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - post_id (BIGINT, Foreign Key to posts)
  - image_url (VARCHAR(500), Not Null)
  - order_index (INT, for ordering)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
- [ ] Create foreign key constraints on author_id and post_id
- [ ] Create indexes on author_id and created_at for efficient queries
- [ ] Create MySQL migration scripts for posts and post_images tables

### Backend Tasks
- [ ] Create Post entity class
- [ ] Create PostImage entity class
- [ ] Create PostRepository interface
- [ ] Create PostImageRepository interface
- [ ] Create PostService with CRUD operations:
  - Create post
  - Get post by ID
  - Update post
  - Delete post
  - Get posts feed (friends' posts)
- [ ] Implement post visibility logic (only friends can see)
- [ ] Create PostController with endpoints:
  - GET /api/posts (get posts feed - friends' posts)
  - GET /api/posts/{postId} (get specific post)
  - POST /api/posts (create post)
  - PUT /api/posts/{postId} (update post)
  - DELETE /api/posts/{postId} (delete post)
- [ ] Implement multiple image upload for posts
- [ ] Validate image uploads (type, size, count)
- [ ] Store post images securely
- [ ] Delete post images when post is deleted
- [ ] Create DTOs for post operations (handle rich text content)
- [ ] Implement authorization (users can only modify their own posts)
- [ ] Add pagination for post feed
- [ ] Handle rich text content storage and retrieval (HTML or formatted text)
- [ ] Ensure emoji support in content storage (UTF-8 encoding)

### Frontend Tasks
- [ ] Create Create Post screen UI
- [ ] Create Post Feed screen UI
- [ ] Create Post Detail screen UI
- [ ] Implement rich text editor for post content:
  - Text formatting (bold, italic, underline)
  - Text alignment options
  - Support for rich text input
- [ ] Implement emoji selector component:
  - Emoji picker/selector UI
  - Integration with rich text editor
  - Ability to insert emojis at cursor position
- [ ] Implement post creation form (rich text editor, emoji selector, image picker)
- [ ] Support multiple image selection
- [ ] Display post feed with posts from friends
- [ ] Render rich text content in post feed and detail views
- [ ] Show post author, content, images, timestamp
- [ ] Implement post editing with rich text editor
- [ ] Implement post deletion
- [ ] Create post service (API calls)
- [ ] Add image preview in post creation
- [ ] Handle image upload progress
- [ ] Implement pagination in feed
- [ ] Style post screens
- [ ] Add loading states and error handling

---

## Feature 8: Post Reactions (Enhanced Like System)

### Overview
Enable friends to react to posts with multiple expressions (heart/love, thumbs up/like, laugh/funny, sad/emotional, angry/extremely dislike, thumbs down/dislike) and display reaction counts for each expression type.

### Database Tasks
- [ ] Create `post_reactions` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - post_id (BIGINT, Foreign Key to posts)
  - user_id (BIGINT, Foreign Key to users)
  - reaction_type ENUM('HEART', 'THUMBS_UP', 'LAUGH', 'SAD', 'ANGRY', 'THUMBS_DOWN') NOT NULL
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
  - Unique constraint on (post_id, user_id) - one reaction per user per post
- [ ] Create foreign key constraints on post_id and user_id
- [ ] Create indexes on post_id, user_id, and reaction_type
- [ ] Create MySQL migration script for post_reactions table

### Backend Tasks
- [ ] Create PostReaction entity class with reaction_type enum
- [ ] Create PostReactionRepository interface
- [ ] Create ReactionService with reaction management logic:
  - Add/update reaction (user can change reaction type)
  - Remove reaction (unlike)
  - Get reaction counts by type for a post
- [ ] Implement reaction toggle functionality:
  - If no reaction exists, add reaction
  - If same reaction exists, remove it (toggle off)
  - If different reaction exists, update to new reaction type
- [ ] Create ReactionController with endpoints:
  - POST /api/posts/{postId}/reactions (add/update reaction)
  - DELETE /api/posts/{postId}/reactions (remove reaction)
  - GET /api/posts/{postId}/reactions (get reaction counts)
- [ ] Update PostService to include reaction counts in responses:
  - Count for each reaction type (heart, thumbs_up, laugh, sad, angry, thumbs_down)
  - Current user's reaction (if any)
- [ ] Implement authorization (only friends can react)
- [ ] Create DTOs for reaction operations (ReactionResponse, ReactionCounts)
- [ ] Optimize reaction count queries (group by reaction_type)

### Frontend Tasks
- [ ] Create reaction picker component with all 6 reaction types:
  - Heart (love) - ❤️
  - Thumbs Up (like) - 👍
  - Laugh (funny) - 😂
  - Sad (emotional) - 😢
  - Angry (extremely dislike) - 😠
  - Thumbs Down (dislike) - 👎
- [ ] Add reaction button/selector to post display
- [ ] Show reaction counts for each type on posts
- [ ] Implement reaction toggle functionality:
  - Long press or click to show reaction picker
  - Select reaction to add/update
  - Click current reaction to remove
- [ ] Update reaction counts in real-time
- [ ] Show visual feedback (selected reaction highlighted)
- [ ] Create reaction service (API calls)
- [ ] Handle reaction errors gracefully
- [ ] Style reaction buttons and count displays
- [ ] Show current user's reaction state
- [ ] Display reaction summary (e.g., "5 ❤️, 3 👍, 2 😂")

---

## Feature 9: Comment Functionality

### Overview
Enable friends to comment on posts with rich text content (including emojis), reply to comments, and react to comments with likes/dislikes. Comments should support rich text formatting and emoji insertion similar to posts.

### Database Tasks
- [ ] Create `comments` table in MySQL
  - id (BIGINT, Primary Key, Auto-increment)
  - post_id (BIGINT, Foreign Key to posts)
  - author_id (BIGINT, Foreign Key to users)
  - parent_comment_id (BIGINT, Foreign Key to comments, Nullable) - For reply functionality
  - content (TEXT, Not Null) - Stores rich text content (HTML or formatted text with emojis)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- [ ] Create foreign key constraints on post_id, author_id, and parent_comment_id
- [ ] Create indexes on post_id, parent_comment_id, and created_at
- [ ] Create `comment_reactions` table in MySQL (for likes/dislikes on comments)
  - id (BIGINT, Primary Key, Auto-increment)
  - comment_id (BIGINT, Foreign Key to comments)
  - user_id (BIGINT, Foreign Key to users)
  - reaction_type ENUM('LIKE', 'DISLIKE') NOT NULL
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
  - updated_at (TIMESTAMP, Default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
  - Unique constraint on (comment_id, user_id) - one reaction per user per comment
- [ ] Create foreign key constraints on comment_id and user_id
- [ ] Create indexes on comment_id, user_id, and reaction_type
- [ ] Create MySQL migration scripts for comments and comment_reactions tables

### Backend Tasks
- [ ] Create Comment entity class with parent_comment_id for replies
- [ ] Create CommentReaction entity class with reaction_type enum (LIKE, DISLIKE)
- [ ] Create CommentRepository interface with methods for:
  - Finding comments by post (including replies)
  - Finding replies to a comment
  - Counting comments and replies
- [ ] Create CommentReactionRepository interface
- [ ] Create CommentService with CRUD operations:
  - Create comment (with rich text content support)
  - Create reply to a comment
  - Get comments for a post (with nested replies)
  - Update comment
  - Delete comment (handle cascading deletes for replies)
- [ ] Create CommentReactionService with reaction management:
  - Add/update reaction (like/dislike toggle)
  - Remove reaction
  - Get reaction counts for a comment
- [ ] Create CommentController with endpoints:
  - GET /api/posts/{postId}/comments (get comments for a post with replies)
  - POST /api/posts/{postId}/comments (create comment)
  - POST /api/comments/{commentId}/replies (create reply to a comment)
  - PUT /api/comments/{commentId} (update comment)
  - DELETE /api/comments/{commentId} (delete comment)
  - POST /api/comments/{commentId}/reactions (add/update reaction)
  - DELETE /api/comments/{commentId}/reactions (remove reaction)
  - GET /api/comments/{commentId}/reactions (get reaction counts)
- [ ] Implement authorization:
  - Only friends can comment and reply
  - Users can only edit/delete their own comments/replies
  - Post authors can delete any comment/reply on their posts
- [ ] Create DTOs for comment operations:
  - CommentResponse (with likeCount, dislikeCount, isLiked, isDisliked, replies)
  - CreateCommentRequest (with rich text content)
  - CommentReactionResponse
- [ ] Handle rich text content storage and retrieval (HTML or formatted text)
- [ ] Ensure emoji support in content storage (UTF-8 encoding)
- [ ] Add pagination for comments (top-level comments)
- [ ] Order comments chronologically (newest first or oldest first)
- [ ] Implement nested reply structure (threaded comments)
- [ ] Optimize comment queries with proper joins and eager loading

### Frontend Tasks
- [ ] Create Comments section in Post Detail screen
- [ ] Display comments list with nested replies (threaded structure)
- [ ] Show comment author, rich text content, timestamp, and reaction counts
- [ ] Implement rich text editor for comment creation/editing:
  - Text formatting (bold, italic, underline)
  - Text alignment options
  - Support for rich text input
- [ ] Implement emoji selector component for comments:
  - Emoji picker/selector UI
  - Integration with rich text editor
  - Ability to insert emojis at cursor position
- [ ] Implement comment creation form (rich text editor, emoji selector)
- [ ] Implement reply functionality:
  - Reply button on each comment
  - Reply form with rich text editor
  - Display nested replies in threaded structure
  - Indentation/visual hierarchy for replies
- [ ] Implement comment editing with rich text editor
- [ ] Implement comment deletion
- [ ] Implement comment reactions (likes/dislikes):
  - Like/dislike buttons on each comment
  - Display like and dislike counts
  - Show current user's reaction state
  - Toggle like/dislike functionality
- [ ] Show edit/delete buttons for user's own comments/replies
- [ ] Show delete button for post author
- [ ] Create comment service (API calls):
  - Create comment
  - Create reply
  - Update comment
  - Delete comment
  - Get comments with replies
  - Add/remove reactions
- [ ] Render rich text content in comments (HTML rendering)
- [ ] Add pagination for top-level comments
- [ ] Style comments section with threaded reply structure
- [ ] Add loading states and error handling
- [ ] Update comment count display
- [ ] Handle nested reply display and indentation
- [ ] Show/hide replies functionality (optional: collapse/expand)

---

## Feature 10: Live Notifications System

### Overview
Create a live notification system using WebSockets (STOMP over WebSocket) for real-time notifications when users receive likes or comments on their posts. The backend uses Spring Boot WebSocket support with SockJS fallback, and the React Native frontend connects using stompjs and sockjs-client to receive notifications in real-time.

### Database Tasks
- [ ] Create `notifications` table in MySQL (optional - for notification history/persistence)
  - id (BIGINT, Primary Key, Auto-increment)
  - user_id (BIGINT, Foreign Key to users) - notification recipient
  - type (ENUM('LIKE', 'COMMENT', 'FRIEND_REQUEST', etc.), Not Null)
  - message (TEXT, Not Null)
  - post_id (BIGINT, Foreign Key to posts, Nullable)
  - actor_id (BIGINT, Foreign Key to users) - user who triggered the notification
  - read (BOOLEAN, Default false)
  - created_at (TIMESTAMP, Default CURRENT_TIMESTAMP)
- [ ] Create foreign key constraints on user_id, post_id, and actor_id
- [ ] Create indexes on user_id, read, and created_at
- [ ] Create MySQL migration script for notifications table (optional)

### Backend Tasks
- [ ] Add WebSocket dependencies to pom.xml:
  - spring-boot-starter-websocket
  - sockjs-client (for SockJS fallback support)
- [ ] Create WebSocket configuration class:
  - Configure STOMP endpoint at "/ws"
  - Enable SockJS fallback support
  - Configure message broker (in-memory or external)
  - Set up user-specific channels ("/topic/user/{userId}")
- [ ] Create LiveNotification DTO:
  - type (String: "LIKE", "COMMENT", etc.)
  - message (String)
  - postId (Long, nullable)
  - actor (User details: id, email, fullName, profilePhotoUrl)
  - timestamp (String)
- [ ] Create NotificationService:
  - sendNotification(userId, notification) - sends notification to user's channel
  - Broadcast notifications using SimpMessagingTemplate
- [ ] Integrate notification sending in existing services:
  - Update ReactionService: send notification when post is liked
  - Update CommentService: send notification when comment is added
  - Send notifications only to post owner (not the actor)
- [ ] Create WebSocket security configuration:
  - Authenticate WebSocket connections using JWT
  - Map WebSocket sessions to authenticated users
- [ ] Implement heartbeat mechanism for connection health
- [ ] Handle connection errors and cleanup

### Frontend Tasks
- [ ] Install WebSocket dependencies:
  - stompjs (for STOMP protocol)
  - sockjs-client (for SockJS fallback)
- [ ] Create WebSocket service:
  - Establish STOMP over WebSocket connection to "/ws" endpoint
  - Use SockJS for fallback support
  - Subscribe to user-specific channel ("/topic/user/{userId}")
  - Handle connection, disconnection, and errors
  - Implement heartbeat/ping mechanism
  - Implement automatic reconnection logic
- [ ] Create NotificationContext:
  - Manage WebSocket connection state
  - Store notifications in state
  - Provide notification count/badge
  - Handle incoming notifications
- [ ] Create Notification component:
  - Display notification badge/counter
  - Show connection status indicator
  - Display notification list/dropdown
  - Show notification alerts/toasts
- [ ] Integrate notifications in app:
  - Connect WebSocket on user login
  - Disconnect WebSocket on user logout
  - Display notification badge in navigation/header
  - Show notification alerts when new notifications arrive
- [ ] Handle notification types:
  - Display appropriate message for LIKE notifications
  - Display appropriate message for COMMENT notifications
  - Navigate to post when notification is clicked
- [ ] Implement notification persistence (optional):
  - Store notifications locally (AsyncStorage)
  - Mark notifications as read
  - Clear old notifications
- [ ] Add connection status indicator:
  - Show "Connected", "Connecting", "Disconnected" states
  - Visual indicator (green/yellow/red dot)
- [ ] Handle edge cases:
  - Network disconnection
  - Server restart
  - Token expiration
  - Multiple device connections

---

## Notes

- Each feature should be completed and tested before moving to the next
- MySQL database migrations should be version-controlled
- API endpoints should be documented as they are created
- Frontend and backend can be developed in parallel for some features
- Focus on core functionality first, polish can come later
- Security should be considered at every feature
- Testing should be done incrementally, not just at the end
- MySQL connection pooling should be configured appropriately
- Use MySQL-specific data types and features where beneficial

---

## Development Order Summary

1. **Feature 1**: Project Setup and Foundation
2. **Feature 2**: User Authentication
3. **Feature 3**: User Profile Management
4. **Feature 4**: User Search
5. **Feature 5**: Friend System - Friend Requests
6. **Feature 6**: Friend System - Friend List
7. **Feature 7**: Post Creation and Management
8. **Feature 8**: Post Reactions (Enhanced Like System)
9. **Feature 9**: Comment Functionality (with Rich Text, Replies, and Reactions)
10. **Feature 10**: Live Notifications System

---

**Status**: Planning Complete - Ready for Development

