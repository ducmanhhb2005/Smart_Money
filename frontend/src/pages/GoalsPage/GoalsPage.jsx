// frontend/src/pages/GoalsPage/GoalsPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './GoalsPage.module.css';
import * as api from '../../services/api';
const PlanResult = ({ plan, onAccept }) => (
    <div className={styles.planContainer}>
        <h4>Kế hoạch Tiết kiệm Đề xuất</h4>
        <p className={styles.analysis}>{plan.analysis}</p>
        
        <h5>Gợi ý Cắt giảm:</h5>
        <ul className={styles.suggestionList}>
            {plan.suggestions.map((s, i) => <li key={i}><strong>{s.category}:</strong> {s.action}</li>)}
        </ul>

        <h5>Ngân sách Đề xuất cho Tháng tới:</h5>
        <ul className={styles.budgetList}>
            {plan.recommended_budgets.map((b, i) => (
                 <li key={i}><strong>{b.category}:</strong> {Math.round(b.amount).toLocaleString('vi-VN')} đ</li>
            ))}
        </ul>
        <button onClick={onAccept} className={styles.acceptButton}>OK, Tôi đã hiểu</button>
    </div>
);

const GoalsPage = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', targetAmount: '', deadline: '' });
    const [editingId, setEditingId] = useState(null);
    const [planningState, setPlanningState] = useState({
        goalId: null, // ID của goal đang được lập kế hoạch
        availableMonths: [],
        selectedMonths: new Set(),
        isLoadingPlan: false,
        planResult: null,
        error: ''
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch đồng thời cả goals và transactions
                const [goalsRes, transactionsRes] = await Promise.all([
                    api.fetchGoals(),
                    api.fetchTransactions()
                ]);

                setGoals(goalsRes.data);
                
                // Xử lý để lấy ra các tháng có dữ liệu
                const months = new Set(transactionsRes.data.map(t => 
                    `${new Date(t.date).getFullYear()}-${String(new Date(t.date).getMonth() + 1).padStart(2, '0')}`
                ));
                setPlanningState(prev => ({ ...prev, availableMonths: Array.from(months).sort().reverse() }));

            } catch (err) {
                // ...
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleOpenPlanGenerator = (goalId) => {
        // Mở giao diện chọn tháng cho một goal cụ thể
        setPlanningState(prev => ({
            ...prev,
            goalId: goalId,
            planResult: null, // Xóa kết quả cũ
            error: '',
            selectedMonths: new Set() // Reset lựa chọn tháng
        }));
    };
       const handleMonthToggle = (month) => {
        const newSelection = new Set(planningState.selectedMonths);
        if (newSelection.has(month)) newSelection.delete(month);
        else newSelection.add(month);
        setPlanningState(prev => ({ ...prev, selectedMonths: newSelection }));
    };

    const handleGeneratePlan = async () => {
        if (planningState.selectedMonths.size === 0) {
            setPlanningState(prev => ({ ...prev, error: "Vui lòng chọn ít nhất một tháng." }));
            return;
        }
        setPlanningState(prev => ({ ...prev, isLoadingPlan: true, error: '' }));

        try {
            const { data } = await api.generateSavingPlan(
                planningState.goalId,
                Array.from(planningState.selectedMonths)
            );
            setPlanningState(prev => ({ ...prev, planResult: data }));
        } catch (err) {
            setPlanningState(prev => ({ ...prev, error: err.response?.data?.message || 'Tạo kế hoạch thất bại.' }));
        } finally {
            setPlanningState(prev => ({ ...prev, isLoadingPlan: false }));
        }
    };
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
                                <button onClick={() => handleOpenPlanGenerator(goal.id)} className={styles.planButton}>Tạo Kế hoạch AI</button>
                            </div>
                                                  {planningState.goalId === goal.id && (
                            <div className={styles.planningSection}>
                                <hr />
                                <h5>Chọn các tháng cơ sở để phân tích:</h5>
                                <div className={styles.monthSelector}>
                                    {planningState.availableMonths.map(month => (
                                        <label key={month} className={styles.monthCheckbox}>
                                            <input 
                                                type="checkbox" 
                                                checked={planningState.selectedMonths.has(month)}
                                                onChange={() => handleMonthToggle(month)}
                                            />
                                            {month}
                                        </label>
                                    ))}
                                </div>
                                <button onClick={handleGeneratePlan} disabled={planningState.isLoadingPlan} className={styles.generateButton}>
                                    {planningState.isLoadingPlan ? 'AI đang phân tích...' : 'Bắt đầu Phân tích'}
                                </button>
                                
                                {planningState.error && <p className={styles.error}>{planningState.error}</p>}
                                
                                {planningState.isLoadingPlan && <div className={styles.loader}></div>}

                                {planningState.planResult && 
                                    <PlanResult 
                                        plan={planningState.planResult}
                                        onAccept={() => setPlanningState(prev => ({ ...prev, goalId: null }))}
                                    />
                                }
                            </div>
                        )}
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