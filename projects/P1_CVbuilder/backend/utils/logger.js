const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger utility
const logger = {
  // Log levels
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },

  // Current log level
  currentLevel: process.env.LOG_LEVEL || 'INFO',

  // Format log message
  formatMessage: (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  },

  // Write to file
  writeToFile: (level, message, meta = {}) => {
    const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
    const formattedMessage = logger.formatMessage(level, message, meta) + '\n';
    
    fs.appendFile(logFile, formattedMessage, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  },

  // Check if should log
  shouldLog: (level) => {
    return logger.levels[level] <= logger.levels[logger.currentLevel];
  },

  // Log methods
  error: (message, meta = {}) => {
    if (logger.shouldLog('ERROR')) {
      const formattedMessage = logger.formatMessage('ERROR', message, meta);
      console.error(formattedMessage);
      logger.writeToFile('ERROR', message, meta);
    }
  },

  warn: (message, meta = {}) => {
    if (logger.shouldLog('WARN')) {
      const formattedMessage = logger.formatMessage('WARN', message, meta);
      console.warn(formattedMessage);
      logger.writeToFile('WARN', message, meta);
    }
  },

  info: (message, meta = {}) => {
    if (logger.shouldLog('INFO')) {
      const formattedMessage = logger.formatMessage('INFO', message, meta);
      console.log(formattedMessage);
      logger.writeToFile('INFO', message, meta);
    }
  },

  debug: (message, meta = {}) => {
    if (logger.shouldLog('DEBUG')) {
      const formattedMessage = logger.formatMessage('DEBUG', message, meta);
      console.log(formattedMessage);
      logger.writeToFile('DEBUG', message, meta);
    }
  },
};

module.exports = logger;
