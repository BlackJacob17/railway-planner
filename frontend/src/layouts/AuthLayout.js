import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthWrapper = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const AuthLayout = () => {
  return (
    <AuthWrapper>
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '12px',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Railway Planner
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </AuthWrapper>
  );
};

export default AuthLayout;
