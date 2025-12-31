// frontend/src/pages/BudgetsPage/BudgetsPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './BudgetsPage.module.css';
import * as api from '../../services/api';

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho form thêm/sửa
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        startDate: '',
        endDate: '',
    });
    const [editingId, setEditingId] = useState(null); // Dùng để biết đang sửa hay thêm mới

    // Fetch dữ liệu khi component được mount
    useEffect(() => {
        const getBudgets = async () => {
            try {
                const { data } = await api.fetchBudgets();
                setBudgets(data);
            } catch (err) {
                setError('Không thể tải danh sách ngân sách.');
            } finally {
                setLoading(false);
            }
        };
        getBudgets();
    }, []);

    const handleOpenForm = (budget = null) => {
        if (budget) {
            // Chế độ sửa
            setEditingId(budget.id);
            setFormData({
                category: budget.category,
                amount: budget.amount,
                // Format lại ngày tháng để input type="date" có thể nhận
                startDate: new Date(budget.startDate).toISOString().split('T')[0],
                endDate: new Date(budget.endDate).toISOString().split('T')[0],
            });
        } else {
            // Chế độ thêm mới
            setEditingId(null);
            setFormData({ category: '', amount: '', startDate: '', endDate: '' });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setError('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Logic sửa
                const { data: updatedBudget } = await api.updateBudget(editingId, formData);
                setBudgets(budgets.map(b => (b.id === editingId ? updatedBudget : b)));
            } else {
                // Logic thêm mới
                const { data: newBudget } = await api.createBudget(formData);
                setBudgets([...budgets, newBudget]);
            }
            handleCloseForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại.');
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
            try {
                await api.deleteBudget(id);
                setBudgets(budgets.filter(b => b.id !== id));
            } catch (err) {
                alert('Xóa thất bại!');
            }
        }
    }

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>Quản lý Ngân sách</h1>
                <button onClick={() => handleOpenForm()} className={styles.addButton}>Thêm Ngân sách</button>
            </header>
            
            {error && !isFormOpen && <p className={styles.error}>{error}</p>}

            <div className={styles.budgetList}>
                {budgets.length > 0 ? budgets.map(budget => (
                    <div key={budget.id} className={styles.budgetCard}>
                        <h3>{budget.category}</h3>
                        <p className={styles.amount}>{Number(budget.amount).toLocaleString('vi-VN')} đ</p>
                        <p className={styles.dateRange}>
                            {new Date(budget.startDate).toLocaleDateString('vi-VN')} - {new Date(budget.endDate).toLocaleDateString('vi-VN')}
                        </p>
                        <div className={styles.actions}>
                            <button onClick={() => handleOpenForm(budget)}>Sửa</button>
                            <button onClick={() => handleDelete(budget.id)} className={styles.deleteButton}>Xóa</button>
                        </div>
                    </div>
                )) : (
                    <p>Chưa có ngân sách nào. Hãy tạo một cái!</p>
                )}
            </div>

            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{editingId ? 'Chỉnh sửa Ngân sách' : 'Tạo Ngân sách mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* ... Các input cho form ... */}
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="Danh mục (VD: Ăn uống)" required />
                            <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Số tiền" required />
                            <label>Ngày bắt đầu</label>
                            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                            <label>Ngày kết thúc</label>
                            <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />

                            {error && isFormOpen && <p className={styles.error}>{error}</p>}
                            
                            <div className={styles.formActions}>
                                <button type="button" onClick={handleCloseForm}>Hủy</button>
                                <button type="submit">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsPage;