import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    //Cập nhật giá trị của error thành 'Mật khẩu không khớp'
    //Tự động render lại component để hiển thị giá trị mới của error trên giao diện
    const [loading, setLoading] = useState(false);
    //Để theo dõi xem một hành động bất đồng bộ (như gọi API) có đang diễn ra hay không
    //Khởi tạo một biến trạng thái loading với giá trị ban đầu là false (vì ban đầu chưa có hành động nào diễn ra)
    const navigate = useNavigate();
//Để điều hướng người dùng đến một trang (route) khác 

//useNavigate() trả về một hàm, chúng ta gán nó vào biến navigate.
//Để chuyển trang, bạn chỉ cần gọi hàm này với đường dẫn bạn muốn đến.
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra mật khẩu có khớp không
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            // Chỉ gửi email, username, password lên server
            const { confirmPassword, ...registerData } = formData;
            await api.register(registerData);

            alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            
            // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
            navigate('/login');

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(errorMessage);
            console.error('Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Đăng ký tài khoản SmartMoney</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '0.5rem' }}
                />
                <input 
                    type="text" 
                    name="username" 
                    placeholder="Tên người dùng (username)" 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '0.5rem' }}
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Mật khẩu" 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '0.5rem' }}
                />
                <input 
                    type="password" 
                    name="confirmPassword" 
                    placeholder="Xác nhận mật khẩu" 
                    onChange={handleChange} 
                    required 
                    style={{ padding: '0.5rem' }}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ padding: '0.75rem', cursor: 'pointer' }}>
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </div>
    );
};

export default RegisterPage;