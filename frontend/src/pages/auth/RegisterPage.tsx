import React, { useState, useEffect } from 'react';
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { TextField2 } from '../../components/ui';
import { authSchemas } from '../../utils/forms/validation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get auth state from Redux
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  // Initial form values
  const initialValues: RegisterFormValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  };

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const handleSubmit = async (values: RegisterFormValues) => {
    await dispatch(register({
      username: values.username,
      email: values.email,
      password: values.password,
    }));
    
    // If registration is successful, the auth state will update and the useEffect above will redirect
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prevShowConfirmPassword => !prevShowConfirmPassword);
  };

  return (
    <Box>
      <Typography variant= h4 component=h1 gutterBottom align=center>
        Create Account
      </Typography>
      <Typography variant=body1 color=text.secondary align=center sx={{ mb: 3 }}>
        Sign up to start managing your RPG campaigns
      </Typography>

      {error && (
        <Alert severity=error sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={authSchemas.register}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, errors, touched }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField2
                  name=username
                  label=Username
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position=start>
                        <PersonIcon color=action />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
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
                  helperText=Password must be at least 8 characters and include uppercase, lowercase, number, and special character
                />
              </Grid>
              <Grid item xs={12}>
                <TextField2
                  name=confirmPassword
                  label=Confirm Password
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
                <FormControlLabel
                  control={
                    <Checkbox
                      name=agreeToTerms
                      color=primary
                      checked={values.agreeToTerms}
                      onChange={(e) => {
                        // Formik will handle this
                      }}
                    />
                  }
                  label={
                    <Typography variant=body2>
                      I agree to the{' '}
                      <Link component={RouterLink} to=/terms color=primary>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link component={RouterLink} to=/privacy color=primary>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {touched.agreeToTerms && errors.agreeToTerms && (
                  <Typography variant=caption color=error>
                    {errors.agreeToTerms}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  type=submit
                  variant=contained
                  color=primary
                  fullWidth
                  size=large
                  disabled={isSubmitting || isLoading || !values.agreeToTerms}
                  sx={{ mt: 1 }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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
          Already have an account?{' '}
          <Link component={RouterLink} to=/login color=primary>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
