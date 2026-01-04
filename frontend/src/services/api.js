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

// Các hàm gọi API đến backend 
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchTransactions = () => API.get('/transactions');
export const createTransaction = (transactionData) => API.post('/transactions', transactionData);

export const fetchBudgets = () => API.get('/budgets');
export const createBudget = (budgetData) => API.post('/budgets', budgetData);
export const updateBudget = (id, updatedData) => API.put(`/budgets/${id}`, updatedData);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

export const fetchGoals = () => API.get('/goals');
export const createGoal = (goalData) => API.post('/goals', goalData);
export const updateGoal = (id, updatedData) => API.put(`/goals/${id}`, updatedData);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

export const parseTextToTransaction = (text)=>API.post('/ai/parse-text', { text });
export const parseReceiptWithAI = (file) => {
    const formData = new FormData();
    formData.append('receiptImage', file); // Tên field phải khớp với backend

    // Gọi đến endpoint mới của AI
    return API.post('/ai/parse-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const generateSavingPlan = (goalId, baseMonths) => API.post('/ai/generate-saving-plan', { goalId, baseMonths });