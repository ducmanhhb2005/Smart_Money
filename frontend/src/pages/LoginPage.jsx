import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData);
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Illustration Section */}
                <div className={styles.illustrationSection}>
                    <svg className={styles.illustration} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                        {/* Wallet Icon with Gradient */}
                        <defs>
                            <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        
                        {/* Background Circle */}
                        <circle cx="200" cy="200" r="180" fill="rgba(255, 255, 255, 0.1)" strokeWidth="2" stroke="rgba(255, 255, 255, 0.2)" />
                        
                        {/* Wallet */}
                        <rect x="100" y="140" width="200" height="120" rx="15" fill="url(#walletGradient)" />
                        <rect x="105" y="145" width="190" height="45" rx="10" fill="rgba(255, 255, 255, 0.2)" />
                        
                        {/* Card in Wallet */}
                        <rect x="115" y="170" width="70" height="50" rx="5" fill="rgba(255, 255, 255, 0.9)" />
                        <text x="150" y="195" textAnchor="middle" fontSize="12" fill="#667eea" fontWeight="bold">CARD</text>
                        
                        {/* Coins */}
                        <circle cx="280" cy="160" r="20" fill="url(#walletGradient)" />
                        <text x="280" y="168" textAnchor="middle" fontSize="20" fill="white" fontWeight="bold">$</text>
                        
                        <circle cx="320" cy="190" r="18" fill="rgba(255, 215, 0, 0.8)" />
                        <text x="320" y="197" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">¥</text>
                        
                        <circle cx="300" cy="240" r="16" fill="rgba(255, 165, 0, 0.8)" />
                        <text x="300" y="246" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">€</text>
                        
                        {/* Upward Arrow (Growth) */}
                        <line x1="80" y1="280" x2="80" y2="220" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="3" />
                        <polygon points="80,210 70,230 90,230" fill="rgba(255, 255, 255, 0.7)" />
                        
                        {/* Chart Bars */}
                        <rect x="140" y="260" width="15" height="40" fill="rgba(255, 255, 255, 0.6)" />
                        <rect x="165" y="245" width="15" height="55" fill="rgba(255, 255, 255, 0.7)" />
                        <rect x="190" y="230" width="15" height="70" fill="rgba(255, 255, 255, 0.8)" />
                    </svg>
                    <h2 className={styles.illustrationTitle}>Chào mừng!</h2>
                    <p className={styles.illustrationText}>
                        Quản lý tài chính thông minh, đạt được tự do tài chính.
                    </p>
                </div>

                {/* Form Section */}
                <div className={styles.formSection}>
                    <h1 className={styles.formTitle}>Đăng nhập</h1>
                    <p className={styles.formSubtitle}>Vào lại tài khoản SmartMoney của bạn</p>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>✉️</span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className={styles.input}
                                    placeholder="Nhập email của bạn"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>🔒</span>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className={styles.input}
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? '⏳ Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className={styles.linkSection}>
                        <p>
                            Chưa có tài khoản?
                            <Link to="/register">Đăng ký tại đây</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
 
