import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', 
});

// Interceptor để tự động gắn token vào mỗi request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Các hàm gọi API
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchTransactions = () => API.get('/transactions');
