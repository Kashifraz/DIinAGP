const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Create write stream for error logs
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for request ID
morgan.token('id', (req) => req.id);

// Access logger
const accessLogger = morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Error logger
const errorLogger = morgan('combined', {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode >= 400
});

// Console logger for development
const consoleLogger = morgan('dev');

module.exports = {
  accessLogger,
  errorLogger,
  consoleLogger
};
