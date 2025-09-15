import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SegmentBuilderPage from './pages/SegmentBuilderPage';
import CampaignHistoryPage from './pages/CampaignHistoryPage';
import CampaignCreatePage from './pages/CampaignCreatePage';
import { AuthProvider, useAuth } from './auth/AuthContext';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Mini CRM Platform
        </Typography>
        <Button 
          color={location.pathname === '/segments' ? 'secondary' : 'inherit'} 
          onClick={() => navigate('/segments')}
        >
          Create Segments
        </Button>
        <Button 
          color={location.pathname === '/create-campaign' ? 'secondary' : 'inherit'} 
          onClick={() => navigate('/create-campaign')}
        >
          Create Campaign
        </Button>
        <Button 
          color={location.pathname === '/campaigns' ? 'secondary' : 'inherit'} 
          onClick={() => navigate('/campaigns')}
        >
          Campaign History
        </Button>
        <Button color="inherit" onClick={logout}>
          Logout ({user.displayName})
        </Button>
      </Toolbar>
    </AppBar>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/segments" element={<PrivateRoute><SegmentBuilderPage /></PrivateRoute>} />
        <Route path="/create-campaign" element={<PrivateRoute><CampaignCreatePage /></PrivateRoute>} />
        <Route path="/campaigns" element={<PrivateRoute><CampaignHistoryPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/segments" />} />
      </Routes>
    </AuthProvider>
  );
}
