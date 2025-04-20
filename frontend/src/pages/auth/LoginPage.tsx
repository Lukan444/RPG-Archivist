import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { TextField2 } from '../../components/ui';
import { authSchemas } from '../../utils/forms/validation';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoginError(null);
      
      // TODO: Implement actual login logic with API
      console.log('Login form submitted:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  return (
    <Box>
      <Typography variant= h4 component=h1 gutterBottom align=center>
        Sign In
      </Typography>
      <Typography variant=body1 color=text.secondary align=center sx={{ mb: 3 }}>
        Sign in to access your RPG campaigns and sessions
      </Typography>

      {loginError && (
        <Alert severity=error sx={{ mb: 3 }}>
          {loginError}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={authSchemas.login}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField2
                  name=email
                  label=Email
                  type=email
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position=start>
                        <EmailIcon color=action />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField2
                  name=password
                  label=Password
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position=start>
                        <LockIcon color=action />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position=end>
                        <IconButton
                          aria-label=toggle password visibility
                          onClick={handleTogglePasswordVisibility}
                          edge=end
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link
                    component={RouterLink}
                    to=/forgot-password
                    variant=body2
                    color=primary
                  >
                    Forgot password?
                  </Link>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type=submit
                  variant=contained
                  color=primary
                  fullWidth
                  size=large
                  disabled={isSubmitting}
                  sx={{ mt: 1 }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>

      <Divider sx={{ my: 3 }}>
        <Typography variant=body2 color=text.secondary>
          OR
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant=body2 color=text.secondary>
          Don't have an account?{' '}
          <Link component={RouterLink} to=/register color=primary>
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
