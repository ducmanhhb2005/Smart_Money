import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './Chart.module.css';

//các thành phần cần thiết cho Chart.js
//Chart.js biết cách vẽ biểu đồ tròn
ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = ({ income, expense }) => {
    // Tính toán số dư để hiển thị ở giữa
    const balance = income - expense;

    // Chuẩn bị dữ liệu để đưa vào biểu đồ
    const data = {
        // labels dùng để hiển thị khi di chuột vào (tooltip)
        labels: ['Chi tiêu', 'Thu nhập'],
        datasets: [
            {
                label: 'Số tiền',
                data: [expense > 0 ? expense : 0, income > 0 ? income : 0],
                // Màu sắc tương ứng với labels ở trên
                backgroundColor: [
                    '#ef4444', // Màu đỏ cho Chi tiêu
                    '#10b981', // Màu xanh lá cho Thu nhập
                ],
                borderColor: '#ffffff', // Màu viền giữa các phần
                borderWidth: 3,
                cutout: '75%', // Tạo lỗ hổng ở giữa, biến biểu đồ tròn thành doughnut
            },
        ],
    };

    const options = {
        responsive: true, // Biểu đồ tự co giãn theo kích thước container
        maintainAspectRatio: false, //Cho phép biểu đồ không bị méo khi co giãn
        plugins: {
            legend: {
                display: false, // Ẩn chú thích (legend) mặc định vì ta sẽ tự tạo
            },
            tooltip: {
                // Tùy chỉnh nội dung hiển thị khi di chuột vào
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const formattedValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
                        return `${label}: ${formattedValue}`;
                    },
                },
                //tùy chỉnh khác cho tooltip
                backgroundColor: '#111827', // Màu nền
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.header}>
                <h3>Thu nhập vs Chi tiêu</h3>
                <p>Tháng này</p>
            </div>
            
            {/* Vùng chứa biểu đồ và text ở giữa */}
            <div className={styles.chartWrapper}>
                <Doughnut data={data} options={options} />
                <div className={styles.centerText}>
                    <span className={styles.balanceLabel}>Số dư</span>
                    <span className={styles.balanceAmount}>
                        {balance.toLocaleString('vi-VN')} đ
                    </span>
                </div>
            </div>

            {/*legend*/}
            <div className={styles.legendContainer}>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.incomeDot}`}></span>
                    <div>
                        <p className={styles.legendLabel}>Thu nhập</p>
                        <p className={styles.legendAmount}>{income.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.dot} ${styles.expenseDot}`}></span>
                    <div>
                        <p className={styles.legendLabel}>Chi tiêu</p>
                        <p className={styles.legendAmount}>{expense.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chart;