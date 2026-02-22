
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './AddTransactionPage.module.css';
import { createTransaction } from '../../services/api'; 
const expenseCategories = [
    "Ăn uống", "Hóa đơn", "Di chuyển", "Mua sắm", "Giải trí", 
    "Sức khỏe", "Giáo dục", "Gia đình", "Quà tặng & Từ thiện", "Khác"
];

const incomeCategories = [
    "Lương", "Thưởng", "Tiền lãi", "Bán đồ", "Được tặng", "Khác"
];
const AddTransactionPage = () => {
    const navigate = useNavigate();
    
    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'EXPENSE', // Mặc định là 'Chi tiêu'
        category: expenseCategories[0],
        date: new Date().toISOString().split('T')[0], //ngày hôm nay
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hàm cập nhật state khi người dùng nhập liệu
     const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'type') {
           
            const newCategory = value === 'INCOME' ? incomeCategories[0] : expenseCategories[0];
            setFormData({ ...formData, type: value, category: newCategory });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Hàm xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Xóa lỗi cũ
        setLoading(true);

        try {
            // Kiểm tra dữ liệu đầu vào
            if (!formData.title || !formData.amount || !formData.category) {
                throw new Error("Vui lòng điền đầy đủ các trường bắt buộc");
            }
            if (parseFloat(formData.amount) <= 0) {
                throw new Error("Số tiền phải là một số dương");
            }

            // Gọi API để tạo giao dịch
            await createTransaction(formData);
            
            alert('Thêm giao dịch thành công!');
            
            // Chuyển hướng về Dashboard sau khi thành công
            navigate('/dashboard', {state: {refresh: true}});

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Thêm giao dịch thất bại. Vui lòng thử lại';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
     const currentCategories = formData.type === 'INCOME' ? incomeCategories : expenseCategories;
    return (
        <div className={styles.pageContainer}>
            <div className={styles.formWrapper}>
                <header className={styles.header}>
                    <Link to="/dashboard" className={styles.backButton}>&larr; Quay lại Dashboard</Link>
                    <h1>Thêm Giao dịch mới</h1>
                    <p>Ghi lại các khoản thu nhập hoặc chi tiêu của bạn</p>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Tên giao dịch</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="VD: Cà phê, Ăn trưa..." required />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="amount">Số tiền (VNĐ)</label>
                        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="VD: 50000" required />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="type">Loại giao dịch</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange}>
                                <option value="EXPENSE">Chi tiêu</option>
                                <option value="INCOME">Thu nhập</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="date">Ngày</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category">Danh mục</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                            {currentCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu Giao dịch'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionPage;