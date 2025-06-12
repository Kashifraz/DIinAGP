import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Box, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery, Switch } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ClassIcon from '@mui/icons-material/Class';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';

const NavBar = ({ onThemeToggle, darkMode }) => {
  const user = getUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Build nav links based on user role
  let navLinks = [];
  if (user) {
    navLinks.push({ label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' });
    navLinks.push({ label: 'Courses', icon: <ClassIcon />, path: '/courses' });
    navLinks.push({ label: 'Calendar', icon: <CalendarTodayIcon />, path: '/calendar' });
    if (user.role === 'student') {
      navLinks.push({ label: 'Attendance', icon: <QrCodeScannerIcon />, path: '/attendance-student' });
      navLinks.push({ label: 'Stats', icon: <BarChartIcon />, path: '/student-courses-stats' });
    }
    if (user.role === 'teacher' || user.role === 'admin') {
      navLinks.push({ label: 'Timetables', icon: <TimelineIcon />, path: '/timetables' });
      navLinks.push({ label: 'Attendance', icon: <QrCodeScannerIcon />, path: '/attendance-teacher' });
      // Optionally: navLinks.push({ label: 'Enrolled', icon: <GroupIcon />, path: '/courses/:id/students' });
    }
  }

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { clearAuth(); navigate('/login'); };
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const renderLinks = () => navLinks.map(link => (
    <Button
      key={link.label}
      color="inherit"
      startIcon={link.icon}
      onClick={() => navigate(link.path)}
      sx={{ mx: 1, fontWeight: 500 }}
    >
      {link.label}
    </Button>
  ));

  return (
    <AppBar position="sticky" color="primary" elevation={3}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          Course Management
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {renderLinks()}
          <Switch checked={darkMode} onChange={onThemeToggle} color="default" sx={{ mx: 2 }} />
          {user && (
            <>
              <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user.name}</MenuItem>
                <MenuItem onClick={handleLogout}><ExitToAppIcon sx={{ mr: 1 }} />Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
        {/* Mobile Hamburger */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
            <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
              <List>
                {navLinks.map(link => (
                  <ListItem button key={link.label} onClick={() => navigate(link.path)}>
                    <ListItemIcon>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.label} />
                  </ListItem>
                ))}
                <ListItem>
                  <ListItemIcon><Switch checked={darkMode} onChange={onThemeToggle} color="default" /></ListItemIcon>
                  <ListItemText primary={darkMode ? 'Dark' : 'Light'} />
                </ListItem>
                {user && <>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        {user.name ? user.name[0].toUpperCase() : '?'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={user.name} />
                  </ListItem>
                  <ListItem button onClick={handleLogout}>
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </>}
              </List>
            </Box>
          </Drawer>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 