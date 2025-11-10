// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// Google OAuth Scopes
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Google OAuth Configuration Object
export const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: GOOGLE_SCOPES.join(' '),
  redirectUri: window.location.origin,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

// Environment variables documentation
/*
To use Google OAuth, you need to:

1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials and create OAuth 2.0 Client ID
5. Add your domain to authorized origins:
   - http://localhost:3000 (for development)
   - https://yourdomain.com (for production)
6. Copy the Client ID and set it in your .env file:
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here

Example .env file:
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
*/
