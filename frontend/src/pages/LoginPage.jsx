import React from 'react';
import { Button, Box, Typography } from '@mui/material';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:4000/api/auth/google';
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h4" mb={2}>Mini CRM Login</Typography>
      <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
        Sign in with Google
      </Button>
    </Box>
  );
}
