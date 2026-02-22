import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Tính toán độ mạnh của mật khẩu
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!]+/)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return styles.strengthWeak;
        if (passwordStrength <= 3) return styles.strengthFair;
        return styles.strengthStrong;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        //Kiểm tra mật khẩu có khớp không
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        //Kiểm tra độ mạnh của mật khẩu
        if (passwordStrength < 2) {
            setError('Mật khẩu phải có ít nhất 8 ký tự và chứa chữ cái.');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await api.register(registerData);

            alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập');
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại';
            setError(errorMessage);
            console.error('Registration failed:', err);
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
                        {/* Background Circle */}
                        <circle cx="200" cy="200" r="180" fill="rgba(255, 255, 255, 0.1)" strokeWidth="2" stroke="rgba(255, 255, 255, 0.2)" />
                        
                        {/* Person Profile */}
                        <circle cx="200" cy="120" r="40" fill="rgba(255, 215, 0, 0.8)" />
                        
                        {/* Body */}
                        <rect x="165" y="160" width="70" height="60" rx="10" fill="rgba(255, 165, 0, 0.8)" />
                        
                        {/* Arms */}
                        <rect x="120" y="175" width="45" height="15" rx="7" fill="rgba(255, 165, 0, 0.8)" transform="rotate(-30 142.5 182.5)" />
                        <rect x="235" y="175" width="45" height="15" rx="7" fill="rgba(255, 165, 0, 0.8)" transform="rotate(30 257.5 182.5)" />
                        
                        {/* Legs */}
                        <rect x="175" y="220" width="15" height="50" rx="7" fill="rgba(255, 165, 0, 0.7)" />
                        <rect x="210" y="220" width="15" height="50" rx="7" fill="rgba(255, 165, 0, 0.7)" />
                        
                        {/* Shield (Security) */}
                        <path d="M 200 80 L 240 100 L 240 150 Q 200 180 200 180 Q 160 180 160 150 L 160 100 Z" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="3" />
                        <text x="200" y="145" textAnchor="middle" fontSize="40" fill="rgba(255, 255, 255, 0.7)">✓</text>
                        
                        {/* Success Check Marks */}
                        <circle cx="310" cy="150" r="25" fill="rgba(39, 174, 96, 0.7)" />
                        <text x="310" y="160" textAnchor="middle" fontSize="40" fill="white">✓</text>
                        
                        <circle cx="280" cy="240" r="20" fill="rgba(39, 174, 96, 0.6)" />
                        <text x="280" y="248" textAnchor="middle" fontSize="30" fill="white">✓</text>
                    </svg>
                    <h2 className={styles.illustrationTitle}>Tham gia ngay</h2>
                    <p className={styles.illustrationText}>
                        Bắt đầu hành trình quản lý tài chính của bạn và đạt được tự do tài chính
                    </p>
                </div>

                {/* Form Section */}
                <div className={styles.formSection}>
                    <h1 className={styles.formTitle}>Đăng ký</h1>
                    <p className={styles.formSubtitle}>Tạo tài khoản SmartMoney miễn phí</p>

                    {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

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
                            <label htmlFor="username">👤 Tên người dùng</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>👤</span>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    className={styles.input}
                                    placeholder="Chọn tên người dùng"
                                    value={formData.username}
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
                                    placeholder="Tối thiểu 8 ký tự"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {formData.password && (
                                <div className={styles.passwordStrength}>
                                    <div className={`${styles.strengthBar} ${getPasswordStrengthColor()}`}></div>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>🔒</span>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    className={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.termsCheckbox}>
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms" style={{ margin: 0, marginLeft: '8px' }}>
                                Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? '⏳ Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className={styles.linkSection}>
                        <p>
                            Đã có tài khoản?
                            <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;