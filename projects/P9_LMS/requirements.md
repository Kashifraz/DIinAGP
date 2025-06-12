# Learning Management System - Requirements Document

## 1. System Overview

The Learning Management System (LMS) is a comprehensive platform designed for educational institutions to manage academic programs, course delivery, student enrollment, and assessment. The system supports three distinct user roles: Coordinators, Professors, and Students, each with specific responsibilities and access levels.

**Technology Stack:**
- Backend: Java Spring Boot
- Frontend: Vue.js
- Database: MySQL

---

## 2. User Roles and Permissions

### 2.1 Coordinator
- **Primary Responsibilities:**
  - Define academic structure (majors and courses)
  - Assign Professors to courses
  - Enroll Students in courses
  - Create and broadcast official notices/announcements
  - View all system users (Professors and Students)

- **Access Level:** Administrative (highest privilege)

### 2.2 Professor
- **Primary Responsibilities:**
  - Upload and organize course content (PowerPoint, PDF, Word, links)
  - Create and manage assessments (assignments, quizzes)
  - Set assessment weights for grading
  - Grade student submissions
  - Create course timetables (start/end dates, class schedules)
  - Conduct attendance using QR code system

- **Access Level:** Course-specific management

### 2.3 Student
- **Primary Responsibilities:**
  - View enrolled courses and schedules
  - Access course content
  - Submit assignments
  - Take online quizzes
  - View grades and resultsheets
  - Mark attendance via QR code scanner

- **Access Level:** Read and submit (limited)

---

## 3. Core Components and Modules

### 1 Authentication & Authorization Module

**Functional Requirements:**
1.1 - User registration and login system
1.2 - Role-based access control (RBAC)

**Technical Requirements:**
- Spring Security integration
- JWT token generation and validation
- Password hashing (BCrypt)
- Token refresh mechanism
- Role-based endpoint protection

---

### 2 User Management Module

**Functional Requirements:**
2.1 - User profile management (create, read, update)
2.2 - User listing and search functionality (Coordinator view)

**Data Requirements:**
- User ID, name, email, password, role, status
- Profile information (phone, address, etc.)
- Registration date, last login

---

### 3 Course Major Management Module

**Functional Requirements:**
3.1 - CRUD course majors (Coordinator only)
3.2 - Major details view

**Data Requirements:**
- Major ID, name, description
- Creation date, coordinator ID
- Status (active/inactive)

---

### 4 Course Management Module

**Functional Requirements:**
4.1 - Create courses within majors (Coordinator only)
4.2 - Assign Professors to courses (Coordinator only)
4.3 - Enroll Students in courses (Coordinator only)
4.4 - View course details

**Data Requirements:**
- Course ID, name, code, description
- Major ID (foreign key)
- Professor ID (foreign key)
- Start date, end date
- Credit hours
- Status

---

### 5 Content Management Module

**Functional Requirements:**
5.1 - Upload learning materials (PowerPoint, PDF, Word documents, links)
5.2 - Organize content into modules/units
5.3 - Download/view uploaded files
5.4 - Content ordering/reordering within modules

**File Types Supported:**
- PowerPoint (.pptx, .ppt)
- PDF (.pdf)
- Word documents (.doc, .docx)
- External links (URLs)

**Data Requirements:**
- Content ID, title, description
- Course ID (foreign key)
- Module ID (foreign key)
- File path/URL
- File type, file size
- Upload date, uploader ID
- Display order

---

### 6 Assessment Management Module

**Functional Requirements:**
6.1 - Create assignments with deadlines (Professor only)
6.2 - Create automated quizzes (Professor only)
6.3 - Set custom weights for each assessment type
6.4 - View all assessments for a course
6.5 - Edit/delete assessments (Professor only)

**Assessment Types:**
- **Assignments:**
  - Title, description, instructions
  - Deadline date and time
  - Maximum marks
  - File upload requirement
  - Weight percentage

- **Quizzes:**
  - Title, description
  - Question bank (multiple choice, true/false, short answer)
  - Time limit (optional)
  - Maximum marks
  - Auto-grading capability
  - Weight percentage

**Data Requirements:**
- Assessment ID, title, description, type
- Course ID (foreign key)
- Professor ID (foreign key)
- Weight percentage
- Maximum marks
- Deadline (for assignments)
- Time limit (for quizzes)
- Creation date
- Status (active/closed)

---

### 7 Grading System Module

**Functional Requirements:**
7.1 - Display student submissions for each assessment (Professor view)
7.2 - Grade individual submissions (Professor only)
7.3 - Assign marks to submissions
7.4 - Automatic calculation of overall course grade based on weights

**Grading Calculation:**
- Weighted average: Σ(Assessment Grade × Weight) / Total Weight
- Real-time grade updates as submissions are graded

**Data Requirements:**
- Submission ID, assessment ID (foreign key)
- Student ID (foreign key)
- Submitted file path/URL
- Submission date and time
- Marks obtained
- Feedback/comments
- Grading date, grader ID

---

### 8 Timetable Management Module

**Functional Requirements:**
8.1 - Create course timetable (Professor only)
  - Set course start and end dates
  - Define class schedules (day, time, duration)
  - Example: Two 2-hour classes on Monday, one 1-hour class on Thursday
8.2 - View timetable
  - View timetable by course
  - View personal timetable (Student/Professor)
  - Calendar view
  - Weekly schedule view

**Data Requirements:**
- Timetable entry ID
- Course ID (foreign key)
- Day of week
- Start time, end time
- Duration (in minutes)
- Location/room (optional)
- Recurrence pattern

---

### 9 Attendance System Module

**Functional Requirements:**
9.1 - QR code generation
    - Generate unique QR code for class session (Professor only)
    - Display QR code in class
    - QR code expiration (time-limited validity)
9.2 - Attendance marking by students
    - Student QR code scanning functionality
    - Record attendance instantly upon scan
    - View attendance records (Professor and Student)
9.3 - Attendance statistics and reports

**QR Code Specifications:**
- Unique code per class session
- Contains: Course ID, Session ID, Timestamp
- Expiration: Configurable (e.g., 15 minutes)
- One-time use per student per session

**Data Requirements:**
- Attendance record ID
- Course ID (foreign key)
- Session ID/date
- Student ID (foreign key)
- QR code used
- Scan timestamp
- Status (present/absent)

---

### 10 Notice/Announcement System Module

**Functional Requirements:**
10.1 - Create official notices (Coordinator only)
     - Notice categories (exams, holidays, general)
     - Notice priority/importance levels
10.2 - Broadcast notices to all users
     - View all notices (all users)
     - Notice expiration dates
     - Read/unread status tracking
    

**Data Requirements:**
- Notice ID, title, content
- Coordinator ID (foreign key)
- Creation date
- Expiration date (optional)
- Priority level
- Category
- Broadcast status

---

### Dashboard Module

**Functional Requirements:**
- **Coordinator Dashboard:**
  - Overview of all majors and courses
  - User statistics
  - Recent notices
  - Quick actions (create major, assign professor, etc.)

- **Professor Dashboard:**
  - List of assigned courses
  - Upcoming deadlines
  - Pending grading tasks
  - Recent student submissions
  - Today's classes

- **Student Dashboard:**
  - List of enrolled courses
  - Upcoming assignments and deadlines
  - Recent grades
  - Today's schedule
  - Attendance summary

---

### 3.12 Calendar View Module

**Functional Requirements:**
- Display weekly/monthly calendar
- Show class schedules
- Show assignment deadlines
- Show exam dates
- Filter by course
- Color coding by course/event type

---

### 3.13 Resultsheet Generation Module

**Functional Requirements:**
- Automatic generation of comprehensive resultsheet per course
- Display all assessment grades
- Display weighted overall grade
- Grade breakdown visualization
- Export resultsheet (PDF/printable format)
- Historical resultsheet viewing

**Resultsheet Contents:**
- Student information
- Course information
- Assessment list with individual grades
- Weight breakdown
- Overall course grade
- Grade letter (A, B, C, etc.) - optional

---

## 4. Technical Architecture

### 4.1 Backend Architecture (Spring Boot)

**Layered Architecture:**
- **Controller Layer:** REST API endpoints
- **Service Layer:** Business logic
- **Repository Layer:** Data access (JPA/Hibernate)
- **Entity Layer:** Domain models

**Key Components:**
- Spring Security for authentication
- JPA/Hibernate for ORM
- File upload handling (MultipartFile)
- QR code generation library
- Scheduled tasks for QR expiration
- Email service (optional, for notifications)

**API Design:**
- RESTful API design principles
- Standard HTTP status codes
- JSON request/response format
- API versioning (if needed)
- Error handling and validation

---

### 4.2 Frontend Architecture (Vue.js)

**Component Structure:**
- Layout components (Header, Sidebar, Footer)
- Role-specific views (Coordinator, Professor, Student)
- Reusable UI components (Forms, Tables, Cards)
- Feature-specific components (Calendar, QR Scanner, File Uploader)

**State Management:**
- Vuex or Pinia for global state
- User authentication state
- Course data caching
- Real-time updates

**Routing:**
- Vue Router for navigation
- Role-based route guards
- Protected routes

**Key Libraries:**
- QR code scanner library
- Calendar component library
- File upload component
- PDF viewer (for content display)
- Date/time picker

---

### 4.3 Database Architecture (MySQL)

**Database Design Principles:**
- Normalized database schema
- Foreign key relationships
- Indexes for performance
- Soft deletes (status flags) where appropriate
- Audit fields (created_at, updated_at)

**Key Tables:**
- users
- course_majors
- courses
- course_enrollments
- content_modules
- course_content
- assessments
- submissions
- grades
- timetable_entries
- attendance_sessions
- attendance_records
- notices

---

## 5. Non-Functional Requirements

### 5.1 Performance
- API response time < 500ms for standard operations
- File upload support up to 50MB per file
- Support for concurrent users (minimum 1000)
- Database query optimization

### 5.2 Security
- Password encryption (BCrypt)
- JWT token expiration and refresh
- SQL injection prevention (parameterized queries)
- XSS protection
- File upload validation (type and size)
- Role-based access control enforcement

### 5.3 Usability
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Clear error messages
- Loading indicators for async operations
- Accessible UI (WCAG guidelines)

### 5.4 Scalability
- Modular architecture for easy extension
- Database indexing strategy
- File storage scalability (consider cloud storage for production)

---

## 6. Integration Points

### 6.1 File Storage
- Local file system (development)
- Cloud storage integration ready (AWS S3, Azure Blob) for production

### 6.2 External Services (Future)
- Email service for notifications
- SMS service for attendance alerts
- Calendar integration (Google Calendar, Outlook)

---

## 7. Data Flow Examples

### 7.1 Course Creation Flow
1. Coordinator creates major
2. Coordinator creates course within major
3. Coordinator assigns Professor to course
4. Coordinator enrolls Students
5. Professor receives access to course management

### 7.2 Assessment Submission Flow
1. Professor creates assignment with deadline
2. Student views assignment in dashboard
3. Student uploads submission file
4. System records submission timestamp
5. Professor views submission list
6. Professor grades submission
7. System calculates updated course grade
8. Student views grade update

### 7.3 Attendance Flow
1. Professor starts class session
2. System generates unique QR code
3. QR code displayed in class (expires in 15 minutes)
4. Student scans QR code via mobile app
5. System validates QR code and records attendance
6. Attendance instantly recorded in database
7. Professor and Student can view attendance records

---

## 8. Assumptions and Constraints

### 8.1 Assumptions
- Users have internet connectivity
- Students have mobile devices for QR scanning
- File storage space is available
- MySQL database is accessible
- All users are registered in the system

### 8.2 Constraints
- File size limits (to be defined)
- QR code expiration time (configurable)
- Maximum concurrent quiz attempts (to be defined)
- Assessment weight total must equal 100%

---

## 9. Future Enhancements (Out of Scope for Initial Release)

- Video lecture integration
- Discussion forums
- Peer review assignments
- Advanced analytics and reporting
- Mobile native applications
- Offline mode support
- Integration with external learning tools
- AI-powered plagiarism detection
- Automated attendance via facial recognition

---

## 10. Glossary

- **Major:** An academic program or field of study (e.g., Software Engineering, Cybersecurity)
- **Course:** An individual subject within a major
- **Module:** A unit of organization for course content
- **Assessment:** Any graded activity (assignment or quiz)
- **Weight:** Percentage contribution of an assessment to overall course grade
- **Resultsheet:** Comprehensive grade report for a student in a course
- **QR Code:** Quick Response code used for attendance marking

