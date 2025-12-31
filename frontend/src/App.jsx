   import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
//import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import RegisterPage from './pages/RegisterPage';
import AddTransactionPage from './pages/AddTransactionPage/AddTransactionPage';
import BudgetsPage from './pages/BudgetsPage/BudgetsPage';
import GoalsPage from './pages/GoalsPage/GoalsPage';
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Các route được bảo vệ */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/add-transaction" element={<AddTransactionPage />} />
                        <Route path="/budgets" element={<BudgetsPage />} />
                        <Route path="/goals" element={<GoalsPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
