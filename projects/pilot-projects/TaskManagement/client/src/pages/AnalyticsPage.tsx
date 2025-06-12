import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AnalyticsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Analytics Dashboard Implementation Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This will include task completion rates, workload distribution, and overdue task charts.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage; 