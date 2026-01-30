// frontend/src/pages/BudgetsPage/BudgetsPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './BudgetsPage.module.css';
import * as api from '../../services/api';

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    const expenseCategories = ["Ăn uống", "Hóa đơn", "Di chuyển", "Mua sắm", "Giải trí", "Sức khỏe", "Giáo dục", "Gia đình", "Quà tặng & Từ thiện", "Khác"];
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
        const fetchData = async () => {
            try {
                const [budgetsRes, transactionsRes] = await Promise.all([
                    api.fetchBudgets(),
                    api.fetchTransactions()
                ]);
                setBudgets(budgetsRes.data);
                setTransactions(transactionsRes.data);
            } catch (err) {
                setError('Không thể tải danh sách ngân sách.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                {budgets.length > 0 ? budgets.map(budget => {
                    const spentAmount = transactions
                        .filter(t => 
                            t.category === budget.category && 
                            t.type === 'EXPENSE' &&
                            new Date(t.date) >= new Date(budget.startDate) &&
                            new Date(t.date) <= new Date(budget.endDate)
                        )
                        .reduce((sum, t) => sum + t.amount, 0);

                    const progress = budget.amount > 0 ? Math.min((spentAmount / budget.amount) * 100, 100) : 0;
                    const isOverBudget = spentAmount > budget.amount;

                    return (
                        <div key={budget.id} className={`${styles.budgetCard} ${isOverBudget ? styles.overBudgetCard : ''}`}>
                            <div className={styles.cardHeader}>
                                <h3>{budget.category}</h3>
                                <div className={styles.actions}>
                                    <button onClick={() => handleOpenForm(budget)} className={styles.editButton}>Sửa</button>
                                    <button onClick={() => handleDelete(budget.id)} className={styles.deleteButton}>Xóa</button>
                                </div>
                            </div>
                            
                            {/* Thông tin số tiền */}
                            <div className={styles.amountInfo}>
                                <span className={isOverBudget ? styles.spentOver : styles.spent}>
                                    {spentAmount.toLocaleString('vi-VN')} đ
                                </span>
                                <span className={styles.limit}>/ {Number(budget.amount).toLocaleString('vi-VN')} đ</span>
                            </div>

                            {/* Thanh tiến trình (Progress Bar) */}
                            <div className={styles.progressContainer}>
                                <div 
                                    className={`${styles.progressBar} ${isOverBudget ? styles.progressOver : ''}`} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {/* Ngày tháng và Cảnh báo */}
                            <div className={styles.cardFooter}>
                                <span className={styles.dateRange}>
                                    {new Date(budget.startDate).toLocaleDateString('vi-VN')} - {new Date(budget.endDate).toLocaleDateString('vi-VN')}
                                </span>
                                {isOverBudget && <span className={styles.warning}>⚠️ Vượt ngân sách!</span>}
                            </div>
                        </div>
                    );
                }) : (
                    <div className={styles.emptyState}>
                        <p>Chưa có ngân sách nào được thiết lập.</p>
                        <button onClick={() => handleOpenForm()} className={styles.addButton}>Tạo ngân sách đầu tiên</button>
                    </div>
                )}
            </div>


            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{editingId ? 'Chỉnh sửa Ngân sách' : 'Tạo Ngân sách mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* ... Các input cho form ... */}
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="" disabled>-- Chọn một danh mục --</option>
                                {expenseCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
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