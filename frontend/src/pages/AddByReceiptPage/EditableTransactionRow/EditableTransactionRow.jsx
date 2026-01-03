// frontend/src/pages/AddByReceiptPage/components/EditableTransactionRow/EditableTransactionRow.jsx
import React from 'react';
import styles from './EditableTransactionRow.module.css';

const EditableTransactionRow = ({ transaction, index, onUpdate, onDelete }) => {
    
    // Hàm xử lý khi một trường input thay đổi
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Gọi hàm onUpdate được truyền từ cha, gửi lên index và dữ liệu mới
        onUpdate(index, { ...transaction, [name]: value });
    };

    return (
        <div className={styles.row}>
            <input 
                type="text"
                name="title"
                value={transaction.title}
                onChange={handleChange}
                className={`${styles.input} ${styles.titleInput}`}
                placeholder="Tên giao dịch"
            />
            <input 
                type="text"
                name="category"
                value={transaction.category}
                onChange={handleChange}
                className={`${styles.input} ${styles.categoryInput}`}
                placeholder="Danh mục"
            />
            <input 
                type="number"
                name="amount"
                value={transaction.amount}
                onChange={handleChange}
                className={`${styles.input} ${styles.amountInput}`}
                placeholder="Số tiền"
            />
            <button onClick={() => onDelete(index)} className={styles.deleteButton}>
                &times;
            </button>
        </div>
    );
};

export default EditableTransactionRow;