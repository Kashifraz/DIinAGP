import mongoose from 'mongoose';

let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log('MongoDB connection attempt already in progress...');
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    reconnectAttempts = 0; // Reset on successful connection
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Please make sure MongoDB is running and the connection string is correct.');
    
    // Don't throw error - allow server to start
    // Will attempt to reconnect in the background
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Will attempt to reconnect in ${RECONNECT_DELAY / 1000} seconds... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => {
        connectDB().catch(() => {
          // Silently handle reconnection failures
        });
      }, RECONNECT_DELAY);
    } else {
      console.error('Max reconnection attempts reached. Please start MongoDB manually.');
    }
    
    // Return the connection object anyway (even if not connected)
    return mongoose.connection;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnecting = false;
  
  // Attempt to reconnect if not already attempting
  if (!isConnecting && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect to MongoDB... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    setTimeout(() => {
      connectDB().catch(() => {
        // Silently handle reconnection failures
      });
    }, RECONNECT_DELAY);
  }
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
  isConnecting = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
  reconnectAttempts = 0;
  isConnecting = false;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  reconnectAttempts = 0;
  isConnecting = false;
});

// Handle process termination
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});

export default connectDB;

