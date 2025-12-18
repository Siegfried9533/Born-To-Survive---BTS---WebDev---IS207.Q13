import axios from 'axios';

// 1. Cấu hình Axios
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Tự động gửi Token (nếu bạn dùng Login)
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Xuất các hàm API (Mapping với Backend của bạn)

// --- NHÓM ANALYTICS ---
export const fetchCustomers = (page = 1) => {
    return apiClient.get(`/analytics/customers?page=${page}`);
};

export const searchCustomers = (keyword) => {
    return apiClient.get(`/customers/search?keyword=${keyword}`);
};

export const fetchSalesAnalytics = (from, to) => {
    return apiClient.get(`/analytics/sales`, { params: { from, to } });
};

// --- NHÓM DASHBOARD ---
export const fetchDashboardOverview = (params = {}) => {
    return apiClient.get(`/dashboard/overview`, { params });
};

//NHÓM XUẤT BÁO CÁO
// Hàm lấy toàn bộ khách hàng để export
export const fetchAllCustomersForExport = () => {
    return apiClient.get(`/analytics/customers?limit=all`);
};

// Lấy danh sách store (dùng cho filter overview)
export const fetchStores = () => {
    return apiClient.get(`/analytics/stores`);
};

// --- NHÓM CHAT ---
export const chatAsk = (message) => apiClient.post('/chat/ask', { message });
export const chatHistory = () => apiClient.get('/chat/history');
export const chatUsers = () => apiClient.get('/chat/users');

export default apiClient;