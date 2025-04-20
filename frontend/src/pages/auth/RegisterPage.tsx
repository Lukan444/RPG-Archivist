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

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setRegisterError(null);
      
      // TODO: Implement actual registration logic with API
      console.log('Register form submitted:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just navigate to login on successful registration
      navigate('/login', { state: { registered: true } });
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('An error occurred during registration. Please try again.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

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

      {registerError && (
        <Alert severity=error sx={{ mb: 3 }}>
          {registerError}
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
                  disabled={isSubmitting || !values.agreeToTerms}
                  sx={{ mt: 1 }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
