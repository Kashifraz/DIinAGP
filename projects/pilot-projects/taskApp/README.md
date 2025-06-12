# Task Management System

A modern, collaborative task management system built with React, Node.js, and PostgreSQL. Features include Kanban boards, real-time collaboration, team management, and comprehensive analytics.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, organize, and manage projects with configurable settings
- **Kanban Boards**: Drag-and-drop task management with real-time updates
- **Task Management**: Create tasks with priorities, due dates, assignees, and tags
- **Team Collaboration**: Role-based permissions and team member management
- **Real-time Updates**: Live collaboration using Socket.io
- **File Attachments**: Upload and manage files for tasks
- **Comments & @Mentions**: Rich commenting system with team member mentions
- **Analytics Dashboard**: Comprehensive metrics and visualizations

### User Experience
- **Responsive Design**: Mobile-optimized interface
- **Modern UI**: Clean, intuitive design with Tailwind CSS
- **Real-time Notifications**: Instant updates and notifications
- **Search & Filters**: Advanced filtering and search capabilities
- **Dark Mode Support**: Toggle between light and dark themes

### Security & Performance
- **JWT Authentication**: Secure user authentication
- **Role-based Access Control**: Granular permissions system
- **Data Validation**: Comprehensive input validation
- **Optimized Queries**: Efficient database operations
- **Rate Limiting**: API protection against abuse

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for state management
- **Tailwind CSS** for styling
- **React Beautiful DnD** for drag-and-drop
- **Socket.io Client** for real-time features
- **Recharts** for data visualization
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **bcrypt** for password hashing

### Development Tools
- **ESLint** and **Prettier** for code formatting
- **TypeScript** for type checking
- **Hot reload** for development
- **Environment configuration**

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up the database**
   ```bash
   cd server
   
   # Copy environment file
   cp env.example .env
   
   # Update database configuration in .env
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"
   
   # Run database migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

4. **Start the development servers**
   ```bash
   # Start backend server (from server directory)
   npm run dev
   
   # Start frontend server (from client directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗 Project Structure

```
task-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS and styling
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.io handlers
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema
│   └── package.json
├── package.json
└── README.md
```

## 📊 Database Schema

### Core Models
- **User**: User accounts and profiles
- **Project**: Project information and settings
- **Task**: Task details and status
- **Comment**: Task comments and discussions
- **FileAttachment**: File uploads and attachments
- **ProjectTag**: Project-specific tags
- **Notification**: User notifications
- **ProjectMember**: Team member relationships

### Key Relationships
- Users can belong to multiple projects with different roles
- Tasks belong to projects and can have assignees
- Comments are linked to tasks and users
- Files can be attached to tasks
- Tags can be applied to tasks within projects

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Server
PORT=5000
NODE_ENV=development

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set up production environment**
   ```bash
   cd server
   cp env.example .env.production
   # Update production environment variables
   ```

3. **Deploy to your preferred platform**
   - **Heroku**: Use the provided Procfile
   - **Vercel**: Deploy frontend and backend separately
   - **AWS**: Use EC2 or ECS for backend, S3 for frontend
   - **Docker**: Use the provided Dockerfile

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📱 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Team Management
- `POST /api/projects/:id/invite` - Invite team member
- `DELETE /api/projects/:projectId/members/:userId` - Remove member
- `PUT /api/projects/:projectId/members/:userId/role` - Update role

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API protection
- **CORS Configuration**: Cross-origin request handling
- **SQL Injection Protection**: Prisma ORM protection
- **XSS Protection**: Input sanitization

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- Unit tests for API endpoints
- Integration tests for database operations
- Component tests for React components
- E2E tests for critical user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting guide

## 🗺 Roadmap

### Upcoming Features
- [ ] Advanced reporting and analytics
- [ ] Time tracking and logging
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Advanced automation and workflows
- [ ] Integration with third-party tools
- [ ] Advanced search and filters
- [ ] Custom dashboards
- [ ] API rate limiting and monitoring
- [ ] Advanced notification system

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Lazy loading implementation

---

**Built with ❤️ using modern web technologies** 