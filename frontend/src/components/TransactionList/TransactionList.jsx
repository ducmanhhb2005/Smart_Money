import React from 'react';
import styles from './TransactionList.module.css';

const TransactionItem = ({ transaction }) => {
    const isIncome = transaction.type === 'INCOME';
    const amountStyle = isIncome ? styles.income : styles.expense;
    const icon = isIncome ? '💰' : '🛍️'; 

    return (
        <li className={styles.item}>
            <div className={styles.iconWrapper}><span>{icon}</span></div>
            <div className={styles.details}>
                <p className={styles.title}>{transaction.title}</p>
                <p className={styles.category}>{transaction.category}</p>
            </div>
            <p className={`${styles.amount} ${amountStyle}`}>
                {isIncome ? '+' : '-'}{transaction.amount.toLocaleString('vi-VN')} đ
            </p>
        </li>
    );
}

const TransactionList = ({ transactions }) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Giao dịch gần đây</h3>
                <a href="#" className={styles.viewAll}>Xem tất cả</a>
            </div>
            <ul className={styles.list}>
                {transactions && transactions.length > 0 ? (
                    transactions.slice(0, 5).map(t => ( // Chỉ hiển thị 5 giao dịch gần nhất
                        <TransactionItem key={t.id} transaction={t} />
                    ))
                ) : (
                    <p className={styles.emptyText}>Chưa có giao dịch nào.</p>
                )}
            </ul>
        </div>
    );
};

export default TransactionList;