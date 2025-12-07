import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions } from '../services/api';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const fakeTransactions = [
                    { id: 1, title: 'Lương tháng 5', amount: 7000000, type: 'INCOME', category: 'Salary', date: new Date() },
                    { id: 2, title: 'Cà phê', amount: 30000, type: 'EXPENSE', category: 'Food & Drinks', date: new Date() },
                    { id: 3, title: 'Vitamin C', amount: 23000, type: 'EXPENSE', category: 'Healthcare', date: new Date() },
                ];
                setTransactions(fakeTransactions);

                // const { data } = await fetchTransactions();
                // setTransactions(data);

            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };
        getTransactions();
    }, []);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Chào mừng, {user?.username}!</p>
            <button onClick={logout}>Đăng xuất</button>
            
            <h2>Giao dịch gần đây</h2>
            <ul>
                {transactions.map(t => (
                    <li key={t.id}>
                        {t.title} - {t.amount.toLocaleString('vi-VN')} đ - {t.type}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DashboardPage;
 
