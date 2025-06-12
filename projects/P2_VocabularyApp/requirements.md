# Vocabulary App - System Requirements

## Project Overview
A mobile application for learning Chinese vocabulary based on HSK 1-5 standards, featuring flashcard learning and interactive quiz modes with progress tracking.

## Technology Stack
- **Backend**: Java Spring Boot with Maven
- **Database**: MySQL
- **Frontend**: React Native
- **Authentication**: JWT-based simple authentication
- **Data Persistence**: Online with MySQL database

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Native  │◄──────────────►│   Spring Boot   │
│   Mobile App    │                 │   Backend API   │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   MySQL         │
                                    │   Database      │
                                    └─────────────────┘
```

### Backend Components
1. **Authentication Module**
2. **Vocabulary Management Module**
3. **Quiz Engine Module**
4. **Progress Tracking Module**
5. **Data Seeding Module**

### Frontend Components
1. **Authentication Screens**
2. **Learning Mode Interface**
3. **Quiz Mode Interface**
4. **Progress Dashboard**
5. **Navigation System**

## Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. HSK_Vocabulary Table
```sql
CREATE TABLE hsk_vocabulary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    simplified_chinese VARCHAR(50) NOT NULL,
    pinyin VARCHAR(100) NOT NULL,
    english_meaning VARCHAR(255) NOT NULL,
    detailed_explanation TEXT,
    hsk_level TINYINT NOT NULL CHECK (hsk_level BETWEEN 1 AND 5),
    radicals VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Quiz_Attempts Table
```sql
CREATE TABLE quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    hsk_level TINYINT NOT NULL,
    quiz_type ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    date_attempted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. Quiz_Results Table
```sql
CREATE TABLE quiz_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_attempt_id BIGINT NOT NULL,
    question_word_id BIGINT NOT NULL,
    user_answer VARCHAR(255),
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_word_id) REFERENCES hsk_vocabulary(id) ON DELETE CASCADE
);
```

#### 5. User_Progress Table
```sql
CREATE TABLE user_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    hsk_level TINYINT NOT NULL,
    words_learned INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_level (user_id, hsk_level)
);
```

## Functional Requirements

### 1. Authentication Module

#### 1.1 User Registration
- **Input**: Email address, password
- **Validation**: Email format validation, password strength requirements
- **Output**: Success confirmation or error message
- **Security**: Password hashing using BCrypt

#### 1.2 User Login
- **Input**: Email address, password
- **Validation**: Credential verification
- **Output**: JWT token for authenticated sessions
- **Security**: JWT token with expiration

#### 1.3 Session Management
- **Token Validation**: Verify JWT tokens on protected endpoints
- **Token Refresh**: Handle token expiration gracefully
- **Logout**: Invalidate tokens

### 2. Vocabulary Management Module

#### 2.1 Data Seeding
- **Input**: JSON files from data folder (hsk1.json to hsk5.json)
- **Process**: Parse JSON, validate data, bulk insert into database
- **Output**: Confirmation of successful data import
- **Command**: Executable from terminal

#### 2.2 Vocabulary Retrieval
- **Get by HSK Level**: Retrieve vocabulary for specific HSK level
- **Get by ID**: Retrieve specific vocabulary item
- **Search**: Search vocabulary by Chinese characters or English meaning
- **Pagination**: Support for paginated results

### 3. Learning Mode Module

#### 3.1 Flashcard Display
- **Input**: HSK level selection
- **Display**: Chinese characters, pinyin, radicals, English meaning
- **Navigation**: Previous/Next functionality
- **Grouping**: 10 words per group/page

#### 3.2 Detailed View
- **Input**: Vocabulary item selection
- **Display**: Complete explanation and additional details
- **Navigation**: Return to flashcard view

### 4. Quiz Engine Module

#### 4.1 Quiz Generation
- **Easy Mode**: Chinese + Pinyin → English meaning (multiple choice)
- **Medium Mode**: English meaning → Chinese + Pinyin (multiple choice)
- **Hard Mode**: English meaning → Chinese characters only (multiple choice)
- **Question Pool**: Random selection from HSK level vocabulary

#### 4.2 Quiz Execution
- **Question Flow**: Sequential question presentation
- **Answer Validation**: Real-time answer checking
- **Progress Tracking**: Current question number, time tracking
- **Navigation**: Skip questions, review answers

#### 4.3 Results Processing
- **Score Calculation**: Correct answers / total questions
- **Answer Review**: Show correct/incorrect answers
- **Performance Metrics**: Time per question, accuracy rate

### 5. Progress Tracking Module

#### 5.1 Quiz History
- **Storage**: All quiz attempts with scores and details
- **Retrieval**: Historical quiz data by user and date range
- **Filtering**: By HSK level, quiz type, date range

#### 5.2 Statistics Generation
- **Overall Progress**: Completion rate by HSK level
- **Performance Trends**: Score improvements over time
- **Learning Analytics**: Most challenging words, weak areas
- **Achievements**: Milestones and accomplishments

#### 5.3 Progress Dashboard
- **Visualization**: Charts and graphs for progress data
- **Summary**: Key metrics and achievements
- **Recommendations**: Suggested next steps for learning

## Non-Functional Requirements

### Performance
- **Response Time**: API responses under 500ms
- **Concurrent Users**: Support for 100+ simultaneous users
- **Database Performance**: Optimized queries with proper indexing

### Security
- **Authentication**: Secure JWT token implementation
- **Password Security**: BCrypt hashing with salt
- **Data Validation**: Input sanitization and validation
- **SQL Injection**: Parameterized queries only

### Scalability
- **Database Design**: Normalized schema for efficient queries
- **API Design**: RESTful endpoints with proper HTTP methods
- **Caching**: Consider Redis for frequently accessed data

### Usability
- **Mobile-First**: Optimized for mobile devices
- **Intuitive Navigation**: Clear user flow and navigation
- **Responsive Design**: Support for different screen sizes
- **Offline Capability**: Cache learned vocabulary for offline access

## Data Models

### JSON File Structure (Expected)
```json
{
  "hsk_level": 1,
  "vocabulary": [
    {
      "simplified_chinese": "你好",
      "pinyin": "nǐ hǎo",
      "english_meaning": "hello",
      "detailed_explanation": "A common greeting in Chinese...",
      "radicals": "亻, 女"
    }
  ]
}
```

### API Response Models

#### User Authentication Response
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Vocabulary Response
```json
{
  "id": 1,
  "simplified_chinese": "你好",
  "pinyin": "nǐ hǎo",
  "english_meaning": "hello",
  "detailed_explanation": "A common greeting...",
  "hsk_level": 1,
  "radicals": "亻, 女"
}
```

#### Quiz Question Response
```json
{
  "question_id": 1,
  "question_type": "EASY",
  "question": {
    "chinese": "你好",
    "pinyin": "nǐ hǎo"
  },
  "options": [
    {"id": 1, "text": "hello"},
    {"id": 2, "text": "goodbye"},
    {"id": 3, "text": "thank you"},
    {"id": 4, "text": "please"}
  ]
}
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Vocabulary Endpoints
- `GET /api/vocabulary/level/{level}` - Get vocabulary by HSK level
- `GET /api/vocabulary/{id}` - Get specific vocabulary item
- `GET /api/vocabulary/search` - Search vocabulary

### Quiz Endpoints
- `POST /api/quiz/generate` - Generate new quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history
- `GET /api/quiz/statistics` - Get user statistics

### Progress Endpoints
- `GET /api/progress/dashboard` - Get progress dashboard data
- `GET /api/progress/level/{level}` - Get progress for specific HSK level
- `GET /api/progress/achievements` - Get user achievements
