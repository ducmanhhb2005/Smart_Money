import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchTransactions } from '../../services/api';
import styles from './DashboardPage.module.css';

import SummaryCard from '../../components/SummaryCard/SummaryCard';
import TransactionList from '../../components/TransactionList/TransactionList';
import Chart from '../../components/Chart/Chart';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const summary = transactions.reduce((acc, t) => {
        if (t.type === 'INCOME') {
            acc.income += t.amount;
        } else {
            acc.expense += t.amount;
        }
        acc.balance = acc.income - acc.expense;
        return acc;
    }, { income: 0, expense: 0, balance: 0 });

    useEffect(() => {
        const getTransactions = async () => {
            setLoading(true);
            try {
                const { data } = await fetchTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
                alert("Không thể tải dữ liệu giao dịch.");
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };
        console.log("Dashboard useEffect triggered by:", location.state);
        getTransactions();
    }, [location.state]);

    if (loading) {
        return <div className={styles.loading}>Đang tải dữ liệu Dashboard...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Chào mừng trở lại, {user?.username}!</p>
                </div>
                <div className={styles.headerActions}>
                    <Link to="/budgets" className={styles.navLink}>Quản lý Ngân sách</Link>
                    <Link to="/goals" className={styles.navLink}>Mục tiêu</Link> 
                    <Link to="/add-transaction" className={styles.addButton}>Thêm Giao dịch</Link>
                    <button onClick={logout} className={styles.logoutButton}>Đăng xuất</button>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    <div className={styles.summaryGrid}>
                        <SummaryCard title="Tổng thu nhập" amount={summary.income} type="income" />
                        <SummaryCard title="Tổng chi tiêu" amount={summary.expense} type="expense" />
                    </div>
                    <Chart income={summary.income} expense={summary.expense} />
                </div>
                <div className={styles.rightColumn}>
                    <TransactionList transactions={transactions} />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;