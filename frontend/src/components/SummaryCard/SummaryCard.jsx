import React from 'react';
import styles from './SummaryCard.module.css';

const SummaryCard = ({ title, amount, type }) => {
    const amountStyle = type === 'income' ? styles.incomeAmount : styles.expenseAmount;

    return (
        <div className={styles.card}>
            <p className={styles.title}>{title}</p>
            <p className={`${styles.amount} ${amountStyle}`}>
                {amount.toLocaleString('vi-VN')} đ
            </p>
        </div>
    );
};

export default SummaryCard;