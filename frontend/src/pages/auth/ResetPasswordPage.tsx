import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
  Box,
  Button,
  Grid,
  Link,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { TextField2 } from '../../components/ui';
import { authSchemas } from '../../utils/forms/validation';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Get token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const initialValues: ResetPasswordFormValues = {
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setResetError(null);
      
      // Check if token exists
      if (!token) {
        setResetError('Invalid or missing reset token. Please request a new password reset link.');
        return;
      }
      
      // TODO: Implement actual password reset logic with API
      console.log('Reset password form submitted:', { ...values, token });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setResetSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError('An error occurred while resetting your password. Please try again.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prevShowConfirmPassword => !prevShowConfirmPassword);
  };

  // If no token is provided, show error message
  if (!token && !resetSuccess) {
    return (
      <Box>
        <Typography variant= h4 component=h1 gutterBottom align=center>
          Reset Password
        </Typography>
        <Alert severity=error sx={{ mb: 3 }}>
          Invalid or missing reset token. Please request a new password reset link.
        </Alert>
        <Button
          variant=outlined
          color=primary
          fullWidth
          size=large
          component={RouterLink}
          to=/forgot-password
          sx={{ mt: 2 }}
        >
          Request New Reset Link
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant=h4 component=h1 gutterBottom align=center>
        Reset Password
      </Typography>
      <Typography variant=body1 color=text.secondary align=center sx={{ mb: 3 }}>
        Enter your new password
      </Typography>

      {resetError && (
        <Alert severity=error sx={{ mb: 3 }}>
          {resetError}
        </Alert>
      )}

      {resetSuccess ? (
        <Box>
          <Alert severity=success sx={{ mb: 3 }}>
            Your password has been successfully reset!
          </Alert>
          <Button
            variant=contained
            color=primary
            fullWidth
            size=large
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Box>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={authSchemas.resetPassword}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField2
                    name=password
                    label=New Password
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
                    helperText=Password must be at least 8 characters and include uppercase, lowercase, number, and special character
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField2
                    name=confirmPassword
                    label=Confirm New Password
                    type={showConfirmPassword ? 'text' : 'password'}
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
                            aria-label=toggle confirm password visibility
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge=end
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
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
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link
                      component={RouterLink}
                      to=/login
                      color=primary
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ArrowBackIcon fontSize=small sx={{ mr: 0.5 }} />
                      Back to Login
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </Box>
  );
};

export default ResetPasswordPage;
