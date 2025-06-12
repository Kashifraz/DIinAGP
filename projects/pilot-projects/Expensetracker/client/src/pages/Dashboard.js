import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { fetchTransactions } from '../features/transactions/transactionSlice';
import { fetchBudgets } from '../features/budgets/budgetSlice';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Dashboard() {
  const dispatch = useDispatch();
  const { transactions, isLoading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );
  const { budgets, isLoading: budgetsLoading } = useSelector(
    (state) => state.budgets
  );

  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const [categoryData, setCategoryData] = useState({
    labels: [],
    data: [],
    backgroundColor: [],
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    income: [],
    expenses: [],
  });

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
  }, [dispatch]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Calculate monthly statistics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTransactions = transactions.filter(
        (transaction) =>
          new Date(transaction.date).getMonth() === currentMonth &&
          new Date(transaction.date).getFullYear() === currentYear
      );

      const income = monthlyTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthlyTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlyStats({
        income,
        expenses,
        balance: income - expenses,
      });

      // Prepare category data for doughnut chart
      const categoryExpenses = monthlyTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          const category = t.category.name;
          if (!acc[category]) {
            acc[category] = {
              amount: 0,
              color: t.category.color,
            };
          }
          acc[category].amount += t.amount;
          return acc;
        }, {});

      setCategoryData({
        labels: Object.keys(categoryExpenses),
        data: Object.values(categoryExpenses).map((c) => c.amount),
        backgroundColor: Object.values(categoryExpenses).map((c) => c.color),
      });

      // Prepare monthly data for bar chart
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      const monthlyData = last6Months.map((date) => {
        const monthTransactions = transactions.filter(
          (t) =>
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
        );

        return {
          month: date.toLocaleString('default', { month: 'short' }),
          income: monthTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          expenses: monthTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        };
      });

      setMonthlyData({
        labels: monthlyData.map((d) => d.month),
        income: monthlyData.map((d) => d.income),
        expenses: monthlyData.map((d) => d.expenses),
      });
    }
  }, [transactions]);

  if (transactionsLoading || budgetsLoading) {
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Monthly Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Income
              </Typography>
              <Typography variant="h5" component="div">
                ${monthlyStats.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Expenses
              </Typography>
              <Typography variant="h5" component="div">
                ${monthlyStats.expenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Balance
              </Typography>
              <Typography
                variant="h5"
                component="div"
                color={monthlyStats.balance >= 0 ? 'success.main' : 'error.main'}
              >
                ${monthlyStats.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={{
                  labels: categoryData.labels,
                  datasets: [
                    {
                      data: categoryData.data,
                      backgroundColor: categoryData.backgroundColor,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Income vs Expenses
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={{
                  labels: monthlyData.labels,
                  datasets: [
                    {
                      label: 'Income',
                      data: monthlyData.income,
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                    {
                      label: 'Expenses',
                      data: monthlyData.expenses,
                      backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
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

export default Dashboard; 