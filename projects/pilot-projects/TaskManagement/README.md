# Task Management System

A collaborative task management system with Kanban workflow, real-time synchronization, and role-based access control.

## Features

- **Secure Authentication**: Email/password login with optional OAuth
- **Role-Based Access Control**: Admin, Team Lead, and Member roles with escalating permissions
- **Kanban Workflow**: Customizable columns with drag-and-drop task movement
- **Real-Time Synchronization**: WebSocket updates for instant collaboration
- **Task Management**: Rich task features including attachments, comments, and tags
- **Analytics Dashboard**: Interactive charts and workload distribution
- **Full-Text Search**: Optimized search across tasks and comments
- **File Attachments**: Secure file upload with size and type restrictions

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Frontend**: React, TypeScript, Material-UI
- **Authentication**: JWT, bcrypt
- **Real-time**: Socket.io
- **File Storage**: Local storage with validation

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your-secret-key
   PORT=5000
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## User Roles

### Admin
- User management and system-wide settings
- Full access to all projects and tasks
- Analytics and reporting

### Team Lead
- Create and manage projects
- Assign tasks to team members
- Manage project settings and columns

### Member
- View and update assigned tasks
- Add comments and attachments
- Move tasks between columns

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get tasks with filters
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/move` - Move task between columns

### Analytics
- `GET /api/analytics/completion-rates` - Task completion analytics
- `GET /api/analytics/workload` - Workload distribution
- `GET /api/analytics/overdue` - Overdue tasks

## Project Structure

```
TaskManagement/
├── server/                 # Backend server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── client/               # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   ├── context/      # React context
│   │   └── utils/        # Utility functions
│   └── package.json
└── uploads/              # File uploads directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 