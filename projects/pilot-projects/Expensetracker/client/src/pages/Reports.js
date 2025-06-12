import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fetchTransactions } from '../features/transactions/transactionSlice';
import { fetchCategories } from '../features/categories/categorySlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const timeRanges = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' },
];

function Reports() {
  const dispatch = useDispatch();
  const { transactions, isLoading, error } = useSelector((state) => state.transactions);
  const { categories } = useSelector((state) => state.categories);
  const [timeRange, setTimeRange] = useState('30days');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (transactions.length > 0) {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case '6months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const filtered = transactions.filter(
        (transaction) => new Date(transaction.date) >= startDate
      );
      setFilteredTransactions(filtered);
    }
  }, [transactions, timeRange]);

  const calculateTotals = () => {
    const totals = {
      income: 0,
      expenses: 0,
      balance: 0,
    };

    filteredTransactions.forEach((transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount;
      } else {
        totals.expenses += transaction.amount;
      }
    });

    totals.balance = totals.income - totals.expenses;
    return totals;
  };

  const prepareCategoryData = () => {
    const categoryTotals = {};
    const categoryColors = {};
    const categoryIcons = {};

    categories.forEach((category) => {
      categoryTotals[category._id] = 0;
      categoryColors[category._id] = category.color;
      categoryIcons[category._id] = category.icon;
    });

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((transaction) => {
        categoryTotals[transaction.category._id] += transaction.amount;
      });

    const labels = [];
    const data = [];
    const backgroundColors = [];

    Object.entries(categoryTotals)
      .filter(([_, total]) => total > 0)
      .sort(([_, a], [__, b]) => b - a)
      .forEach(([categoryId, total]) => {
        const category = categories.find((c) => c._id === categoryId);
        if (category) {
          labels.push(category.name);
          data.push(total);
          backgroundColors.push(category.color);
        }
      });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareMonthlyData = () => {
    const monthlyData = {
      income: Array(12).fill(0),
      expenses: Array(12).fill(0),
    };

    const now = new Date();
    const currentYear = now.getFullYear();

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (transaction.type === 'income') {
          monthlyData.income[month] += transaction.amount;
        } else {
          monthlyData.expenses[month] += transaction.amount;
        }
      }
    });

    return {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ],
      datasets: [
        {
          label: 'Income',
          data: monthlyData.income,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Expenses',
          data: monthlyData.expenses,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
  };

  const prepareTrendData = () => {
    const dates = [...new Set(filteredTransactions.map((t) => t.date))].sort();
    const dailyData = {
      income: Array(dates.length).fill(0),
      expenses: Array(dates.length).fill(0),
    };

    filteredTransactions.forEach((transaction) => {
      const dateIndex = dates.indexOf(transaction.date);
      if (dateIndex !== -1) {
        if (transaction.type === 'income') {
          dailyData.income[dateIndex] += transaction.amount;
        } else {
          dailyData.expenses[dateIndex] += transaction.amount;
        }
      }
    });

    return {
      labels: dates.map((date) => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Income',
          data: dailyData.income,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Expenses',
          data: dailyData.expenses,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
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

  const totals = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Financial Reports</Typography>
        <TextField
          select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          sx={{ width: 200 }}
        >
          {timeRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="success.main">
                ${totals.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main">
                ${totals.expenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Net Balance
              </Typography>
              <Typography
                variant="h4"
                color={totals.balance >= 0 ? 'success.main' : 'error.main'}
              >
                ${totals.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={prepareCategoryData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={prepareMonthlyData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={prepareTrendData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports; 