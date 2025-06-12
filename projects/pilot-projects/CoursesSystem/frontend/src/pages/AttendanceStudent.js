import React, { useState } from 'react';
import { scanQRCode } from '../api/attendance';
import { Box, Typography, Paper, Alert, Button, CircularProgress, Divider } from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const AttendanceStudent = () => {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleScan = async (qr) => {
    if (!qr || scanned) return;
    setScanned(true);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await scanQRCode(qr);
      setResult(qr);
      setSuccess('Attendance marked successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 3000); // allow rescan after 3s
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
        py: 4,
        px: { xs: 1, sm: 2, md: 4 },
        fontFamily: 'Roboto, Arial, sans-serif',
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" mb={2}>
        <QrCodeScannerIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          Scan Attendance QR Code
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, boxShadow: 6, maxWidth: 420, width: '100%', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Scanner
            onScan={data => handleScan(data?.[0]?.rawValue)}
            onError={err => setError('Camera error')}
            styles={{ container: { width: '100%', maxWidth: 400, margin: '0 auto' } }}
          />
          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </Paper>
      {result && (
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, boxShadow: 2, maxWidth: 420, width: '100%' }}>
          <Typography>Last scanned QR: <b>{result}</b></Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AttendanceStudent; 