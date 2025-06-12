# Personal Finance Tracker

A comprehensive personal finance application that helps users track expenses, manage budgets, and visualize their financial data.

## Features

- Track daily expenses with detailed transaction information
- Customizable spending categories
- Monthly budget planning and tracking
- Visual analytics and spending patterns
- Search and filter transaction history
- Data export functionality
- Responsive design for mobile and desktop
- Secure user authentication
- Multi-currency support
- Recurring expense management

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Charts: Chart.js
- State Management: Redux Toolkit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
4. Create a .env file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
5. Start the development servers:
   ```bash
   npm run dev:full
   ```

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
├── .env                   # Environment variables
└── package.json          # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 