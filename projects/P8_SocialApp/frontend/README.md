# Social App Frontend

React Native mobile application for the Social Networking Application.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing) OR iOS Simulator / Android Emulator

## Setup Instructions

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API Base URL**:
   - Open `src/config/api.js`
   - Update `API_BASE_URL` if needed
   - For physical device testing, replace `localhost` with your machine's IP address
   - Example: `http://192.168.1.100:8080/api`

3. **Start the development server**:
   ```bash
   npm start
   ```
   
   Or use:
   ```bash
   expo start
   ```

4. **Run on device/emulator**:
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

## Project Structure

```
frontend/
├── App.js                    # Main app component with navigation
├── app.json                  # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies
├── src/
│   ├── config/
│   │   ├── api.js           # API endpoints configuration
│   │   └── theme.js         # Theme, colors, typography
│   ├── screens/
│   │   └── TestScreen.js    # Test screen
│   ├── services/
│   │   ├── apiService.js    # API client with interceptors
│   │   └── testService.js   # Test API service
│   ├── components/          # Reusable components (to be added)
│   ├── utils/               # Helper functions (to be added)
│   └── navigation/          # Navigation configuration (to be added)
└── assets/                  # Images, fonts, etc.
```

## Features Implemented

- ✅ React Native with Expo
- ✅ React Navigation setup
- ✅ API service layer with axios
- ✅ Request/Response interceptors
- ✅ AsyncStorage integration
- ✅ Theme configuration
- ✅ Test screen with API connection tests
- ✅ Error handling

## Testing the API Connection

1. Make sure the backend server is running on `http://localhost:8080`
2. Open the app and navigate to the Test Screen
3. Tap "Test Health Endpoint" to verify server connection
4. Tap "Test Database Endpoint" to verify database connection

## Important Notes

### For Physical Device Testing

When testing on a physical device, you need to:

1. Find your machine's IP address:
   - **Windows**: `ipconfig` (look for IPv4 address)
   - **Mac/Linux**: `ifconfig` or `ip addr`

2. Update `src/config/api.js`:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8080/api';
   ```

3. Make sure your device and computer are on the same network

4. Ensure your backend CORS configuration allows requests from your device

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

## Next Steps

- Feature 2: User Authentication screens
- Feature 3: User Profile screens
- And more...

## Troubleshooting

### Connection Refused
- Verify backend is running
- Check API_BASE_URL in `src/config/api.js`
- For physical devices, use IP address instead of localhost

### CORS Errors
- Ensure backend CORS is configured correctly
- Check that backend allows requests from your device

### Module Not Found
- Run `npm install` again
- Clear Expo cache: `expo start -c`

