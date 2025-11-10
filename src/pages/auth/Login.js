import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, Box, InputAdornment, IconButton, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/GoogleLogin';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.email || !form.password) {
      setError('შეავსეთ ყველა ველი');
      setLoading(false);
      return;
    }

    try {
      const result = await login({ email: form.email, password: form.password });
      if (result.success) {
        console.log('Login successful, redirecting to profile...');
        navigate('/profile');
      } else {
        setError(result.error || 'არასწორი ელ.ფოსტა ან პაროლი');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('შეცდომა შესვლისას. სცადეთ თავიდან.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (userData) => {
    loginWithGoogle(userData);
    navigate('/profile');
  };

  const handleGoogleError = (error) => {
    setError('Google ავტორიზაცია ვერ მოხერხდა');
    console.error('Google login error:', error);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight={700} mb={2}>
            შესვლა
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="ელ.ფოსტა"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="პაროლი"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography color="error" align="center" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? 'შესვლა...' : 'შესვლა'}
            </Button>
          </form>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
              ან
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          {/* Google Login */}
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;