// frontend/src/pages/GoalsPage/GoalsPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './GoalsPage.module.css';
import * as api from '../../services/api';

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        api.fetchGoals()
            .then(response => setGoals(response.data))
            .catch(() => setError('Không thể tải danh sách mục tiêu.'))
            .finally(() => setLoading(false));
    }, []);

    const handleOpenForm = (goal = null) => {
        if (goal) {
            setEditingId(goal.id);
            setFormData({
                name: goal.name,
                targetAmount: goal.targetAmount,
                deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
                currentAmount: goal.currentAmount // Thêm currentAmount để có thể sửa
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', targetAmount: '', deadline: '', currentAmount: 0 });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setError('');
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { data: updatedGoal } = await api.updateGoal(editingId, formData);
                setGoals(goals.map(g => (g.id === editingId ? updatedGoal : g)));
            } else {
                const { data: newGoal } = await api.createGoal(formData);
                setGoals([...goals, newGoal]);
            }
            handleCloseForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại.');
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
            try {
                await api.deleteGoal(id);
                setGoals(goals.filter(g => g.id !== id));
            } catch (err) {
                alert('Xóa thất bại!');
            }
        }
    }

    const calculateProgress = (current, target) => {
        if (target <= 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>Mục tiêu Tiết kiệm</h1>
                <button onClick={() => handleOpenForm()} className={styles.addButton}>Thêm Mục tiêu</button>
            </header>
            
            {error && !isFormOpen && <p className={styles.error}>{error}</p>}

            <div className={styles.goalList}>
                {goals.length > 0 ? goals.map(goal => {
                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                    return (
                        <div key={goal.id} className={styles.goalCard}>
                            <h3>{goal.name}</h3>
                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className={styles.amountInfo}>
                                <span>{Number(goal.currentAmount).toLocaleString('vi-VN')} đ</span>
                                <span>{Number(goal.targetAmount).toLocaleString('vi-VN')} đ</span>
                            </div>
                             <p className={styles.deadline}>
                                {goal.deadline ? `Hạn cuối: ${new Date(goal.deadline).toLocaleDateString('vi-VN')}` : "Không có hạn cuối"}
                            </p>
                            <div className={styles.actions}>
                                <button onClick={() => handleOpenForm(goal)}>Sửa</button>
                                <button onClick={() => handleDelete(goal.id)} className={styles.deleteButton}>Xóa</button>
                            </div>
                        </div>
                    );
                }) : (
                    <p>Chưa có mục tiêu nào. Hãy đặt ra mục tiêu đầu tiên!</p>
                )}
            </div>

            {isFormOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{editingId ? 'Chỉnh sửa Mục tiêu' : 'Tạo Mục tiêu mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên mục tiêu (VD: Mua Macbook)" required />
                            <input name="targetAmount" type="number" value={formData.targetAmount} onChange={handleChange} placeholder="Số tiền mục tiêu" required />
                            {editingId && (
                                <input name="currentAmount" type="number" value={formData.currentAmount} onChange={handleChange} placeholder="Số tiền đã có" required />
                            )}
                            <label>Hạn cuối (Tùy chọn)</label>
                            <input name="deadline" type="date" value={formData.deadline} onChange={handleChange} />

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

export default GoalsPage;