import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../features/budgets/budgetSlice';
import { fetchCategories } from '../features/categories/categorySlice';

const validationSchema = Yup.object({
  category: Yup.string().required('Category is required'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  period: Yup.string().required('Period is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().when('period', {
    is: 'custom',
    then: (schema) => schema.required('End date is required'),
  }),
  rollover: Yup.boolean(),
  notifications: Yup.boolean(),
});

const budgetPeriods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

function Budgets() {
  const dispatch = useDispatch();
  const { budgets, isLoading, error } = useSelector((state) => state.budgets);
  const { categories } = useSelector((state) => state.categories);
  const [open, setOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCategories());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      category: '',
      amount: '',
      period: 'monthly',
      startDate: new Date(),
      endDate: null,
      rollover: false,
      notifications: true,
    },
    validationSchema,
    onSubmit: (values) => {
      if (selectedBudget) {
        dispatch(updateBudget({ id: selectedBudget._id, budgetData: values }));
      } else {
        dispatch(createBudget(values));
      }
      handleClose();
    },
  });

  const handleOpen = (budget = null) => {
    if (budget) {
      setSelectedBudget(budget);
      formik.setValues({
        category: budget.category._id,
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate),
        endDate: budget.endDate ? new Date(budget.endDate) : null,
        rollover: budget.rollover,
        notifications: budget.notifications,
      });
    } else {
      setSelectedBudget(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBudget(null);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      dispatch(deleteBudget(id));
    }
  };

  const calculateProgress = (budget) => {
    const progress = (budget.currentSpending / budget.amount) * 100;
    return Math.min(progress, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'error';
    if (progress >= 80) return 'warning';
    return 'success';
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Budgets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Budget
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {budgets.map((budget) => (
          <Grid item xs={12} sm={6} md={4} key={budget._id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: budget.category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      <span className="material-icons">
                        {budget.category.icon}
                      </span>
                    </Box>
                    <Box>
                      <Typography variant="h6">{budget.category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(budget)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(budget._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      ${budget.currentSpending.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      {calculateProgress(budget).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(budget)}
                    color={getProgressColor(calculateProgress(budget))}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {new Date(budget.startDate).toLocaleDateString()} -{' '}
                  {budget.endDate
                    ? new Date(budget.endDate).toLocaleDateString()
                    : 'Ongoing'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Add Budget'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="category"
                  label="Category"
                  select
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                >
                  {categories
                    .filter((category) => category.type === 'expense')
                    .map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                              mr: 1,
                            }}
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="period"
                  label="Period"
                  select
                  value={formik.values.period}
                  onChange={formik.handleChange}
                  error={formik.touched.period && Boolean(formik.errors.period)}
                  helperText={formik.touched.period && formik.errors.period}
                >
                  {budgetPeriods.map((period) => (
                    <MenuItem key={period.value} value={period.value}>
                      {period.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formik.values.startDate}
                  onChange={(value) => formik.setFieldValue('startDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                      helperText={formik.touched.startDate && formik.errors.startDate}
                    />
                  )}
                />
              </Grid>
              {formik.values.period === 'custom' && (
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={formik.values.endDate}
                    onChange={(value) => formik.setFieldValue('endDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                        helperText={formik.touched.endDate && formik.errors.endDate}
                      />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="rollover"
                  label="Rollover"
                  select
                  value={formik.values.rollover}
                  onChange={formik.handleChange}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="notifications"
                  label="Notifications"
                  select
                  value={formik.values.notifications}
                  onChange={formik.handleChange}
                >
                  <MenuItem value={true}>Enabled</MenuItem>
                  <MenuItem value={false}>Disabled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedBudget ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Budgets; 