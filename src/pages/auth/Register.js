import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, Box, InputAdornment, IconButton, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/GoogleLogin';
import apiService from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    password: '', 
    confirm: '',
    country: '',
    mobile: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

    // Validation
    if (!form.firstname || !form.lastname || !form.email || !form.password || !form.confirm || !form.country || !form.mobile) {
      setError('ყველა ველი სავალდებულოა');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError('პაროლები არ ემთხვევა');
      setLoading(false);
      return;
    }

    // Prepare registration data
    const registrationData = {
      firstname: form.firstname,
      lastname: form.lastname,
      email: form.email,
      password: form.password,
      country: form.country,
      mobile: form.mobile
    };

    try {
      console.log('Registration data:', registrationData);
      const response = await apiService.post('/auth/register', registrationData);
      console.log('Registration response:', response);
      alert("თქვენ წარმატებით დარეგისტრირდით");
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      alert("დაფიქსირდა შეცდომა");
      setError('რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (userData) => {
    loginWithGoogle(userData);
    navigate('/profile');
  };

  const handleGoogleError = (error) => {
    setError('Google რეგისტრაცია ვერ მოხერხდა');
    console.error('Google registration error:', error);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" fontWeight={700} mb={2}>
            რეგისტრაცია
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="სახელი"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="გვარი"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="მობილური"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="ქვეყანა"
              name="country"
              value={form.country}
              onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon /></InputAdornment> }}
            />
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
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="დაადასტურე პაროლი"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirm}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Typography color="error" fontSize={14} mt={1}>{error}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, py: 1.2, fontWeight: 700, fontSize: 16 }}
            >
              {loading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
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

          {/* Google Registration */}
          <GoogleLogin 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register; 