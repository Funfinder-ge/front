// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '339531091899-o323fb104jqb2c7k3bagllog69rg8i4n.apps.googleusercontent.com339531091899-o323fb104jqb2c7k3bagllog69rg8i4n.apps.googleusercontent.com';

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
