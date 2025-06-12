import React from 'react';
import AppRouter from './routes/AppRouter';
import { QueryProvider } from './config/queryClient';
import './styles/global.css';
import './index.css';

function App() {
  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  );
}

export default App;
