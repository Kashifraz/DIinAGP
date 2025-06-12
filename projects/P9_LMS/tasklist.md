# Learning Management System - Feature-Based Development Task List

This document outlines all features to be developed for the Learning Management System. Each feature contains complete database, backend, and frontend tasks grouped together.

---

## Feature 1: Project Setup & Authentication System

**Goal:** Establish the project foundation and implement user authentication.

### Database Tasks
- [ ] Create `users` table with fields:
  - id (primary key, auto-increment)
  - email (unique, not null)
  - password (hashed, not null)
  - role (enum: COORDINATOR, PROFESSOR, STUDENT)
  - first_name, last_name
  - status (enum: ACTIVE, INACTIVE)
  - created_at, updated_at
- [ ] Create indexes on email and role columns

### Backend Tasks
- [ ] Initialize Spring Boot project with dependencies:
  - Spring Web
  - Spring Security
  - Spring Data JPA
  - MySQL Driver
  - JWT library (jjwt)
  - BCrypt password encoder
- [ ] Create User entity class
- [ ] Create UserRepository interface
- [ ] Create UserService with registration and login methods
- [ ] Implement JWT token generation and validation
- [ ] Create AuthenticationController with endpoints:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
- [ ] Configure Spring Security:
  - JWT filter for token validation
  - Password encoder (BCrypt)
  - CORS configuration
  - Public endpoints (register, login)
  - Protected endpoints with role-based access
- [ ] Create custom exception handlers
- [ ] Create DTOs for authentication (RegisterRequest, LoginRequest, AuthResponse)

### Frontend Tasks
- [ ] Initialize Vue.js project with Vue CLI
- [ ] Install dependencies:
  - Vue Router
  - Vuex/Pinia (state management)
  - Axios (HTTP client)
  - JWT decode library
- [ ] Create project folder structure:
  - components/
  - views/
  - router/
  - store/
  - services/
  - utils/
- [ ] Create authentication service (API calls)
- [ ] Create auth store module (state management)
- [ ] Create Login view component
- [ ] Create Register view component
- [ ] Create router configuration with route guards
- [ ] Create HTTP interceptor for adding JWT tokens to requests
- [ ] Create error handling utilities
- [ ] Create basic layout component (Header, Footer)

---

## Feature 2: User Management

**Goal:** Enable Coordinators to view and manage all system users.

### Database Tasks
- [ ] Add additional fields to `users` table if needed:
  - phone_number
  - profile_picture_url
  - last_login_at
- [ ] Create indexes for search functionality

### Backend Tasks
- [ ] Create UserController with endpoints:
  - GET /api/users (list all users - Coordinator only)
  - GET /api/users/{id} (get user details)
  - PUT /api/users/{id} (update user - self or Coordinator)
  - GET /api/users/search?query= (search users - Coordinator only)
  - GET /api/users?role=PROFESSOR (filter by role)
  - GET /api/users?role=STUDENT (filter by role)
- [ ] Create UserService methods:
  - getAllUsers()
  - getUserById()
  - updateUser()
  - searchUsers()
  - getUsersByRole()
- [ ] Create UserDTO for response mapping
- [ ] Implement role-based access control
- [ ] Add pagination support for user listing

### Frontend Tasks
- [ ] Create UserService (API calls)
- [ ] Create user store module
- [ ] Create UserList view (Coordinator only)
  - Table with user details
  - Search functionality
  - Filter by role
  - Pagination
- [ ] Create UserProfile view (view/edit own profile)
- [ ] Create UserCard component (reusable)
- [ ] Add user management route to router
- [ ] Add navigation link in Coordinator dashboard

---

## Feature 3: Course Major Management

**Goal:** Enable Coordinators to create and manage course majors.

### Database Tasks
- [ ] Create `course_majors` table:
  - id (primary key)
  - name (unique, not null)
  - description
  - coordinator_id (foreign key to users)
  - status (enum: ACTIVE, INACTIVE)
  - created_at, updated_at
- [ ] Create indexes on coordinator_id

### Backend Tasks
- [ ] Create CourseMajor entity
- [ ] Create CourseMajorRepository
- [ ] Create CourseMajorService with methods:
  - createMajor()
  - getAllMajors()
  - getMajorById()
  - updateMajor()
  - deleteMajor() (soft delete)
- [ ] Create CourseMajorController with endpoints:
  - POST /api/majors (create - Coordinator only)
  - GET /api/majors (list all)
  - GET /api/majors/{id} (get details)
  - PUT /api/majors/{id} (update - Coordinator only)
  - DELETE /api/majors/{id} (delete - Coordinator only)
- [ ] Create DTOs (CourseMajorDTO, CreateMajorRequest)

### Frontend Tasks
- [ ] Create MajorService (API calls)
- [ ] Create major store module
- [ ] Create MajorList view (Coordinator)
  - List all majors
  - Create new major form
  - Edit/delete major
- [ ] Create MajorForm component
- [ ] Add routes for major management
- [ ] Add navigation links in Coordinator dashboard

---

## Feature 4: Course Management

**Goal:** Enable Coordinators to create and manage courses, and assign Professors to courses.

### Database Tasks
- [ ] Create `courses` table:
  - id (primary key)
  - code (unique, not null)
  - name (not null)
  - description
  - major_id (foreign key to course_majors)
  - professor_id (foreign key to users, nullable)
  - start_date, end_date
  - credit_hours
  - status (enum: ACTIVE, ARCHIVED)
  - created_at, updated_at
- [ ] Create indexes on foreign keys and code

### Backend Tasks
- [ ] Create Course entity
- [ ] Create CourseRepository
- [ ] Create CourseService with methods:
  - createCourse()
  - getCoursesByMajor()
  - getCourseById()
  - updateCourse()
  - assignProfessor()
  - getCoursesByProfessor()
- [ ] Create CourseController with endpoints:
  - POST /api/courses (create - Coordinator only)
  - GET /api/courses (list all with filters)
  - GET /api/courses/{id} (get details)
  - PUT /api/courses/{id} (update - Coordinator only)
  - PUT /api/courses/{id}/assign-professor (assign professor - Coordinator only)
  - GET /api/courses/major/{majorId} (get courses by major)
  - GET /api/courses/professor/{professorId} (get courses by professor)
- [ ] Create DTOs (CourseDTO, CreateCourseRequest)

### Frontend Tasks
- [ ] Create CourseService (API calls)
- [ ] Create course store module
- [ ] Create CourseList view (Coordinator)
  - List all courses
  - Filter by major
  - Create new course form
  - Assign professor dropdown
  - Edit/delete course
- [ ] Create CourseForm component
- [ ] Create ProfessorSelector component (for assignment)
- [ ] Add routes for course management
- [ ] Add navigation links in Coordinator dashboard

---

## Feature 5: Course Enrollment

**Goal:** Enable Coordinators to enroll Students in courses.

### Database Tasks
- [ ] Create `course_enrollments` table:
  - id (primary key)
  - course_id (foreign key to courses)
  - student_id (foreign key to users)
  - enrollment_date
  - status (enum: ACTIVE, DROPPED, COMPLETED)
  - created_at, updated_at
- [ ] Create unique constraint on (course_id, student_id)
- [ ] Create indexes on course_id and student_id

### Backend Tasks
- [ ] Create CourseEnrollment entity
- [ ] Create CourseEnrollmentRepository
- [ ] Create CourseEnrollmentService with methods:
  - enrollStudent()
  - getEnrollmentsByCourse()
  - getEnrollmentsByStudent()
  - dropEnrollment()
  - checkEnrollment()
- [ ] Create CourseEnrollmentController with endpoints:
  - POST /api/enrollments (enroll student - Coordinator only)
  - POST /api/enrollments/bulk (bulk enrollment - Coordinator only)
  - GET /api/enrollments/course/{courseId} (get students in course)
  - GET /api/enrollments/student/{studentId} (get courses for student)
  - DELETE /api/enrollments/{id} (drop enrollment - Coordinator only)
- [ ] Create DTOs (EnrollmentDTO, BulkEnrollmentRequest)

### Frontend Tasks
- [ ] Create EnrollmentService (API calls)
- [ ] Create enrollment store module
- [ ] Create EnrollmentManagement view (Coordinator)
  - Select course
  - Search and select students
  - Bulk enrollment functionality
  - List enrolled students
  - Remove enrollment
- [ ] Create StudentSelector component (multi-select)
- [ ] Create EnrolledStudentsList component
- [ ] Add enrollment route
- [ ] Add link from course list to enrollment management

---

## Feature 6: Content Management

**Goal:** Enable Professors to upload and organize course content into modules.

### Database Tasks
- [ ] Create `content_modules` table:
  - id (primary key)
  - course_id (foreign key to courses)
  - name (not null)
  - description
  - display_order (integer)
  - created_at, updated_at
- [ ] Create `course_content` table:
  - id (primary key)
  - module_id (foreign key to content_modules)
  - course_id (foreign key to courses)
  - title (not null)
  - description
  - content_type (enum: FILE, LINK)
  - file_path (nullable, for uploaded files)
  - file_url (nullable, for external links)
  - file_type (enum: PDF, PPT, DOC, LINK)
  - file_size (bytes)
  - uploader_id (foreign key to users)
  - display_order (integer)
  - created_at, updated_at
- [ ] Create indexes on course_id and module_id

### Backend Tasks
- [ ] Create ContentModule entity
- [ ] Create CourseContent entity
- [ ] Create ContentModuleRepository
- [ ] Create CourseContentRepository
- [ ] Configure file upload settings (MultipartFile)
- [ ] Create file storage service (local filesystem)
- [ ] Create ContentModuleService with methods:
  - createModule()
  - getModulesByCourse()
  - updateModule()
  - deleteModule()
  - reorderModules()
- [ ] Create CourseContentService with methods:
  - uploadContent()
  - getContentByModule()
  - getContentByCourse()
  - deleteContent()
  - reorderContent()
  - validateFileType()
  - validateFileSize()
- [ ] Create ContentModuleController with endpoints:
  - POST /api/courses/{courseId}/modules (create - Professor only)
  - GET /api/courses/{courseId}/modules (list modules)
  - PUT /api/modules/{id} (update - Professor only)
  - DELETE /api/modules/{id} (delete - Professor only)
- [ ] Create CourseContentController with endpoints:
  - POST /api/modules/{moduleId}/content (upload - Professor only)
  - GET /api/modules/{moduleId}/content (list content)
  - GET /api/courses/{courseId}/content (get all content)
  - GET /api/content/{id}/download (download file)
  - DELETE /api/content/{id} (delete - Professor only)
- [ ] Create DTOs (ContentModuleDTO, CourseContentDTO, UploadContentRequest)

### Frontend Tasks
- [ ] Create ContentService (API calls)
- [ ] Create content store module
- [ ] Create ContentManagement view (Professor)
  - Module list
  - Create/edit module
  - Content list per module
  - Upload file component
  - Add link component
  - Delete content
  - Reorder modules/content
- [ ] Create ModuleCard component
- [ ] Create ContentItem component
- [ ] Create FileUpload component
  - Drag and drop
  - File type validation
  - Progress indicator
- [ ] Create LinkInput component
- [ ] Create ContentViewer component (for PDF, etc.)
- [ ] Add content management route
- [ ] Add link from course list to content management

---

## Feature 7: Assessment Management

**Goal:** Enable Professors to create assignments and quizzes with deadlines and weights.

### Database Tasks
- [ ] Create `assessments` table:
  - id (primary key)
  - course_id (foreign key to courses)
  - professor_id (foreign key to users)
  - title (not null)
  - description
  - assessment_type (enum: ASSIGNMENT, QUIZ)
  - weight_percentage (decimal)
  - maximum_marks (decimal)
  - deadline (datetime, nullable for quizzes)
  - time_limit_minutes (integer, nullable for assignments)
  - status (enum: DRAFT, PUBLISHED, CLOSED)
  - created_at, updated_at
- [ ] Create `quiz_questions` table:
  - id (primary key)
  - assessment_id (foreign key to assessments)
  - question_text (not null)
  - question_type (enum: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
  - options (JSON, for multiple choice)
  - correct_answer (text)
  - points (decimal)
  - display_order (integer)
  - created_at, updated_at
- [ ] Create indexes on course_id and assessment_type

### Backend Tasks
- [ ] Create Assessment entity
- [ ] Create QuizQuestion entity
- [ ] Create AssessmentRepository
- [ ] Create QuizQuestionRepository
- [ ] Create AssessmentService with methods:
  - createAssessment()
  - getAssessmentsByCourse()
  - getAssessmentById()
  - updateAssessment()
  - deleteAssessment()
  - publishAssessment()
  - closeAssessment()
  - validateWeights() (ensure total = 100%)
- [ ] Create QuizQuestionService with methods:
  - addQuestion()
  - getQuestionsByAssessment()
  - updateQuestion()
  - deleteQuestion()
  - reorderQuestions()
- [ ] Create AssessmentController with endpoints:
  - POST /api/courses/{courseId}/assessments (create - Professor only)
  - GET /api/courses/{courseId}/assessments (list assessments)
  - GET /api/assessments/{id} (get details)
  - PUT /api/assessments/{id} (update - Professor only)
  - DELETE /api/assessments/{id} (delete - Professor only)
  - PUT /api/assessments/{id}/publish (publish - Professor only)
  - PUT /api/assessments/{id}/close (close - Professor only)
- [ ] Create QuizQuestionController with endpoints:
  - POST /api/assessments/{assessmentId}/questions (add question - Professor only)
  - GET /api/assessments/{assessmentId}/questions (list questions)
  - PUT /api/questions/{id} (update - Professor only)
  - DELETE /api/questions/{id} (delete - Professor only)
- [ ] Create DTOs (AssessmentDTO, QuizQuestionDTO, CreateAssessmentRequest)

### Frontend Tasks
- [ ] Create AssessmentService (API calls)
- [ ] Create assessment store module
- [ ] Create AssessmentManagement view (Professor)
  - List assessments
  - Create assessment form (assignment/quiz)
  - Set weight percentage
  - Set deadline (for assignments)
  - Publish/close assessment
- [ ] Create AssessmentForm component
  - Type selector (Assignment/Quiz)
  - Weight input
  - Deadline picker
  - Time limit input (for quizzes)
- [ ] Create QuizBuilder view (Professor)
  - Add/edit questions
  - Question types (MCQ, True/False, Short Answer)
  - Options input (for MCQ)
  - Correct answer input
  - Points assignment
  - Reorder questions
- [ ] Create QuestionForm component
- [ ] Create AssessmentList component (Student view)
  - Show published assessments
  - Show deadlines
  - Show status (submitted/not submitted)
- [ ] Add assessment management routes
- [ ] Add link from course list to assessments

---

## Feature 8: Grading System

**Goal:** Enable Professors to grade submissions and automatically calculate course grades.

### Database Tasks
- [ ] Create `submissions` table:
  - id (primary key)
  - assessment_id (foreign key to assessments)
  - student_id (foreign key to users)
  - submitted_file_path (nullable, for assignments)
  - submitted_answers (JSON, for quizzes)
  - submission_date (datetime)
  - status (enum: SUBMITTED, GRADED)
  - created_at, updated_at
- [ ] Create `grades` table:
  - id (primary key)
  - submission_id (foreign key to submissions)
  - assessment_id (foreign key to assessments)
  - student_id (foreign key to users)
  - course_id (foreign key to courses)
  - marks_obtained (decimal)
  - feedback (text)
  - graded_by (foreign key to users)
  - graded_at (datetime)
  - created_at, updated_at
- [ ] Create `course_grades` table (calculated overall grades):
  - id (primary key)
  - course_id (foreign key to courses)
  - student_id (foreign key to users)
  - overall_grade (decimal)
  - grade_letter (enum: A, B, C, D, F, nullable)
  - last_calculated_at (datetime)
  - created_at, updated_at
- [ ] Create unique constraint on (course_id, student_id) for course_grades
- [ ] Create indexes on assessment_id, student_id, course_id

### Backend Tasks
- [ ] Create Submission entity
- [ ] Create Grade entity
- [ ] Create CourseGrade entity
- [ ] Create SubmissionRepository
- [ ] Create GradeRepository
- [ ] Create CourseGradeRepository
- [ ] Create SubmissionService with methods:
  - submitAssignment()
  - submitQuiz()
  - getSubmissionsByAssessment()
  - getSubmissionById()
  - getSubmissionsByStudent()
- [ ] Create GradeService with methods:
  - gradeSubmission()
  - updateGrade()
  - getGradesByAssessment()
  - getGradesByStudent()
  - calculateCourseGrade() (automatic calculation)
  - getCourseGrade()
- [ ] Create SubmissionController with endpoints:
  - POST /api/assessments/{assessmentId}/submit (submit - Student only)
  - GET /api/assessments/{assessmentId}/submissions (list - Professor only)
  - GET /api/submissions/{id} (get details)
  - GET /api/students/{studentId}/submissions (get student submissions)
- [ ] Create GradeController with endpoints:
  - POST /api/submissions/{submissionId}/grade (grade - Professor only)
  - PUT /api/grades/{id} (update grade - Professor only)
  - GET /api/assessments/{assessmentId}/grades (list grades)
  - GET /api/courses/{courseId}/grades/student/{studentId} (get student course grades)
  - GET /api/courses/{courseId}/grades (get all grades for course - Professor only)
- [ ] Create DTOs (SubmissionDTO, GradeDTO, CourseGradeDTO, SubmitRequest, GradeRequest)
- [ ] Implement automatic grade calculation trigger (on grade save)

### Frontend Tasks
- [ ] Create SubmissionService (API calls)
- [ ] Create GradeService (API calls)
- [ ] Create submission store module
- [ ] Create grade store module
- [ ] Create SubmissionView view (Student)
  - View assessment details
  - Upload file (for assignments)
  - Take quiz (for quizzes)
  - Submit button
  - View submission status
- [ ] Create GradingView view (Professor)
  - List submissions for assessment
  - Download submitted files
  - Grade input form
  - Feedback textarea
  - Save grade button
  - Auto-calculate course grade indicator
- [ ] Create QuizTakingView component (Student)
  - Display questions
  - Answer inputs
  - Timer (if time limit)
  - Submit quiz
- [ ] Create GradeInput component
- [ ] Create SubmissionList component
- [ ] Create FileDownload component
- [ ] Add submission and grading routes
- [ ] Add link from assessment list to submit/view grades

---

## Feature 9: Timetable Management

**Goal:** Enable Professors to create course timetables and Students to view their schedules.

### Database Tasks
- [ ] Create `timetable_entries` table:
  - id (primary key)
  - course_id (foreign key to courses)
  - day_of_week (enum: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)
  - start_time (time)
  - end_time (time)
  - duration_minutes (integer)
  - location (varchar, nullable)
  - created_at, updated_at
- [ ] Create indexes on course_id and day_of_week

### Backend Tasks
- [ ] Create TimetableEntry entity
- [ ] Create TimetableEntryRepository
- [ ] Create TimetableService with methods:
  - createTimetableEntry()
  - getTimetableByCourse()
  - getTimetableByStudent() (aggregate from enrolled courses)
  - getTimetableByProfessor() (aggregate from assigned courses)
  - updateTimetableEntry()
  - deleteTimetableEntry()
  - validateTimeConflict() (optional)
- [ ] Create TimetableController with endpoints:
  - POST /api/courses/{courseId}/timetable (create entry - Professor only)
  - GET /api/courses/{courseId}/timetable (get course timetable)
  - GET /api/students/{studentId}/timetable (get student timetable)
  - GET /api/professors/{professorId}/timetable (get professor timetable)
  - PUT /api/timetable/{id} (update - Professor only)
  - DELETE /api/timetable/{id} (delete - Professor only)
- [ ] Create DTOs (TimetableEntryDTO, CreateTimetableRequest)

### Frontend Tasks
- [ ] Create TimetableService (API calls)
- [ ] Create timetable store module
- [ ] Create TimetableManagement view (Professor)
  - Select course
  - Add timetable entry form
    - Day selector
    - Time pickers (start/end)
    - Duration display
    - Location input
  - List timetable entries
  - Edit/delete entries
- [ ] Create TimetableView view (Student/Professor)
  - Weekly calendar view
  - Display classes
  - Color coding by course
  - Today's schedule highlight
- [ ] Create WeeklyCalendar component
- [ ] Create TimetableEntryForm component
- [ ] Create TimeSlot component
- [ ] Add timetable routes
- [ ] Add link from dashboard to timetable

---

## Feature 10: Attendance System

**Goal:** Enable Professors to generate QR codes for attendance and Students to scan them.

### Database Tasks
- [ ] Create `attendance_sessions` table:
  - id (primary key)
  - course_id (foreign key to courses)
  - professor_id (foreign key to users)
  - session_date (date)
  - qr_code (unique, not null)
  - qr_code_expires_at (datetime)
  - status (enum: ACTIVE, EXPIRED, CLOSED)
  - created_at, updated_at
- [ ] Create `attendance_records` table:
  - id (primary key)
  - session_id (foreign key to attendance_sessions)
  - student_id (foreign key to users)
  - course_id (foreign key to courses)
  - qr_code_used (varchar)
  - scan_timestamp (datetime)
  - status (enum: PRESENT, ABSENT)
  - created_at, updated_at
- [ ] Create unique constraint on (session_id, student_id)
- [ ] Create indexes on course_id, student_id, session_id

### Backend Tasks
- [ ] Add QR code generation library (ZXing or similar)
- [ ] Create AttendanceSession entity
- [ ] Create AttendanceRecord entity
- [ ] Create AttendanceSessionRepository
- [ ] Create AttendanceRecordRepository
- [ ] Create QRCodeService with methods:
  - generateQRCode()
  - validateQRCode()
  - expireOldSessions() (scheduled task)
- [ ] Create AttendanceService with methods:
  - createAttendanceSession()
  - getActiveSession()
  - markAttendance() (via QR scan)
  - getAttendanceByCourse()
  - getAttendanceByStudent()
  - closeSession()
- [ ] Create AttendanceSessionController with endpoints:
  - POST /api/courses/{courseId}/attendance/start (start session - Professor only)
  - GET /api/courses/{courseId}/attendance/active (get active QR code - Professor only)
  - GET /api/courses/{courseId}/attendance/qr-code (get QR code image - Professor only)
  - PUT /api/attendance/sessions/{id}/close (close session - Professor only)
- [ ] Create AttendanceRecordController with endpoints:
  - POST /api/attendance/scan (scan QR code - Student only)
  - GET /api/courses/{courseId}/attendance/records (get records - Professor only)
  - GET /api/students/{studentId}/attendance (get student attendance)
  - GET /api/courses/{courseId}/attendance/statistics (get statistics - Professor only)
- [ ] Create scheduled task to expire QR codes (every minute)
- [ ] Create DTOs (AttendanceSessionDTO, AttendanceRecordDTO, QRCodeResponse, ScanRequest)

### Frontend Tasks
- [ ] Install QR code scanner library (vue-qrcode-reader or similar)
- [ ] Create AttendanceService (API calls)
- [ ] Create attendance store module
- [ ] Create AttendanceSessionView view (Professor)
  - Start session button
  - Display QR code (large, scannable)
  - QR code expiration countdown
  - Active session indicator
  - Close session button
  - Attendance records list
- [ ] Create QRCodeDisplay component
  - Large QR code image
  - Expiration timer
  - Refresh button
- [ ] Create AttendanceScannerView view (Student)
  - QR code scanner component
  - Scan button
  - Success/error messages
  - Attendance history
- [ ] Create QRScanner component
  - Camera access
  - Scan functionality
  - Validation feedback
- [ ] Create AttendanceRecordsView view (Professor/Student)
  - List attendance records
  - Filter by date/course
  - Statistics display
- [ ] Create AttendanceStatistics component
- [ ] Add attendance routes
- [ ] Add link from course dashboard to attendance

---

## Feature 11: Notice/Announcement System

**Goal:** Enable Coordinators to create and broadcast notices to all users.

### Database Tasks
- [ ] Create `notices` table:
  - id (primary key)
  - coordinator_id (foreign key to users)
  - title (not null)
  - content (text, not null)
  - category (enum: EXAM, HOLIDAY, GENERAL, URGENT)
  - priority (enum: LOW, MEDIUM, HIGH)
  - expiration_date (datetime, nullable)
  - status (enum: DRAFT, PUBLISHED, EXPIRED)
  - created_at, updated_at
- [ ] Create `notice_reads` table (track read status):
  - id (primary key)
  - notice_id (foreign key to notices)
  - user_id (foreign key to users)
  - read_at (datetime)
  - created_at
- [ ] Create unique constraint on (notice_id, user_id)
- [ ] Create indexes on coordinator_id, status, expiration_date

### Backend Tasks
- [ ] Create Notice entity
- [ ] Create NoticeRead entity
- [ ] Create NoticeRepository
- [ ] Create NoticeReadRepository
- [ ] Create NoticeService with methods:
  - createNotice()
  - getAllNotices()
  - getNoticeById()
  - updateNotice()
  - deleteNotice()
  - publishNotice()
  - expireNotices() (scheduled task)
  - markAsRead()
  - getUnreadCount()
- [ ] Create NoticeController with endpoints:
  - POST /api/notices (create - Coordinator only)
  - GET /api/notices (list all published notices)
  - GET /api/notices/{id} (get details)
  - PUT /api/notices/{id} (update - Coordinator only)
  - DELETE /api/notices/{id} (delete - Coordinator only)
  - PUT /api/notices/{id}/publish (publish - Coordinator only)
  - POST /api/notices/{id}/read (mark as read)
  - GET /api/notices/unread/count (get unread count)
- [ ] Create scheduled task to expire notices
- [ ] Create DTOs (NoticeDTO, CreateNoticeRequest)

### Frontend Tasks
- [ ] Create NoticeService (API calls)
- [ ] Create notice store module
- [ ] Create NoticeManagement view (Coordinator)
  - Create notice form
  - List all notices (draft/published)
  - Edit/delete notices
  - Publish button
  - Category and priority selectors
- [ ] Create NoticeList view (All users)
  - List published notices
  - Filter by category
  - Sort by priority/date
  - Unread indicator
  - Mark as read on view
- [ ] Create NoticeDetail view
  - Full notice content
  - Category and priority badges
  - Publication date
  - Mark as read
- [ ] Create NoticeForm component
- [ ] Create NoticeCard component
- [ ] Create NoticeBadge component (unread indicator)
- [ ] Add notice routes
- [ ] Add notice link in header/navigation
- [ ] Add unread count badge in header

---

## Feature 12: Dashboard

**Goal:** Create role-specific dashboards with overview information and quick actions.

### Database Tasks
- [ ] No new tables (uses existing data)
- [ ] Ensure proper indexes for dashboard queries

### Backend Tasks
- [ ] Create DashboardService with methods:
  - getCoordinatorDashboard()
  - getProfessorDashboard()
  - getStudentDashboard()
- [ ] Create DashboardController with endpoints:
  - GET /api/dashboard/coordinator (Coordinator dashboard data)
  - GET /api/dashboard/professor (Professor dashboard data)
  - GET /api/dashboard/student (Student dashboard data)
- [ ] Create DTOs (DashboardDTO with aggregated data)
- [ ] Optimize queries for dashboard performance

### Frontend Tasks
- [ ] Create DashboardService (API calls)
- [ ] Create dashboard store module
- [ ] Create CoordinatorDashboard view
  - Statistics cards (users, courses, majors)
  - Recent notices
  - Quick actions
  - Recent activity
- [ ] Create ProfessorDashboard view
  - Assigned courses list
  - Upcoming deadlines
  - Pending grading tasks
  - Today's classes
  - Recent submissions
- [ ] Create StudentDashboard view
  - Enrolled courses list
  - Upcoming assignments
  - Recent grades
  - Today's schedule
  - Attendance summary
- [ ] Create StatisticsCard component
- [ ] Create QuickActionCard component
- [ ] Create UpcomingDeadlineCard component
- [ ] Create TodayScheduleCard component
- [ ] Add dashboard as default route after login
- [ ] Add navigation links to dashboard

---

## Feature 13: Resultsheet Generation

**Goal:** Automatically generate comprehensive resultsheets for students showing all assessment grades and overall course grade.

### Database Tasks
- [ ] No new tables (uses existing course_grades and grades tables)
- [ ] Ensure proper indexes for resultsheet queries

### Backend Tasks
- [ ] Create ResultsheetService with methods:
  - generateResultsheet()
  - getResultsheetByCourse()
  - calculateGradeBreakdown()
  - getGradeLetter() (A, B, C, D, F mapping)
- [ ] Create ResultsheetController with endpoints:
  - GET /api/courses/{courseId}/resultsheet/student/{studentId} (get resultsheet - Student/Professor)
  - GET /api/students/{studentId}/resultsheets (get all resultsheets - Student)
  - GET /api/courses/{courseId}/resultsheets (get all resultsheets - Professor)
- [ ] Create DTOs (ResultsheetDTO with detailed breakdown)
- [ ] Implement grade letter calculation logic

### Frontend Tasks
- [ ] Create ResultsheetService (API calls)
- [ ] Create resultsheet store module
- [ ] Create ResultsheetView view (Student)
  - Select course
  - Display resultsheet
    - Student info
    - Course info
    - Assessment list with grades
    - Weight breakdown
    - Overall grade
    - Grade letter
  - Export to PDF button (optional)
- [ ] Create ResultsheetView view (Professor)
  - Select course
  - Select student
  - Display resultsheet
- [ ] Create ResultsheetCard component
  - Assessment breakdown table
  - Visual grade representation
  - Weight percentages
- [ ] Create GradeBreakdownChart component (optional, visual representation)
- [ ] Create PDF export functionality (optional)
- [ ] Add resultsheet routes
- [ ] Add link from student dashboard to resultsheets
- [ ] Add link from course view to resultsheets

---

## Development Notes

### Testing Strategy
- Unit tests for services
- Integration tests for controllers
- Frontend component tests
- End-to-end tests for critical flows

### Deployment Considerations
- Environment configuration (dev, staging, production)
- Database migration scripts
- File storage configuration (local vs cloud)
- CORS configuration for production
- Security hardening

### Performance Optimization
- Database query optimization
- Caching strategy (Redis - future)
- File CDN for content delivery (future)
- Pagination for large lists
- Lazy loading for images

---

## Summary

This feature-based task list breaks down the LMS into 13 distinct features, each containing complete database, backend, and frontend tasks. Features can be developed in any order based on project priorities, though it's recommended to start with foundational features like Feature 1 (Project Setup & Authentication System) and Feature 2 (User Management) before building dependent features.

Each feature should be completed and tested before moving to the next, ensuring a stable and functional system at each stage.
