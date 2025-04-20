import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
  Box,
  Button,
  Grid,
  Link,
  Typography,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { TextField2 } from '../../components/ui';
import { authSchemas } from '../../utils/forms/validation';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setResetError(null);
      
      // TODO: Implement actual password reset logic with API
      console.log('Forgot password form submitted:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setResetSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError('An error occurred while sending the password reset email. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant= h4 component=h1 gutterBottom align=center>
        Forgot Password
      </Typography>
      <Typography variant=body1 color=text.secondary align=center sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password
      </Typography>

      {resetError && (
        <Alert severity=error sx={{ mb: 3 }}>
          {resetError}
        </Alert>
      )}

      {resetSuccess ? (
        <Box>
          <Alert severity=success sx={{ mb: 3 }}>
            Password reset email sent! Check your inbox for further instructions.
          </Alert>
          <Button
            variant=outlined
            color=primary
            fullWidth
            size=large
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Box>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={authSchemas.forgotPassword}
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
                  <Button
                    type=submit
                    variant=contained
                    color=primary
                    fullWidth
                    size=large
                    disabled={isSubmitting}
                    sx={{ mt: 1 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
