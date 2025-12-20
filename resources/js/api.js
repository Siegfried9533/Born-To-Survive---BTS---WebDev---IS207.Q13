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

export const fetchSalesAnalytics = (arg1, arg2) => {//dùng cho cả 2 kiểu gọi hàm
    let params = {};

    // TRƯỜNG HỢP 1: dùng kiểu cũ: fetchSalesAnalytics(from, to)
    // Kiểm tra nếu arg1 là String (ngày tháng) hoặc null
    if (typeof arg1 === 'string' || arg1 === null || typeof arg2 === 'string') {
        params = { 
            from: arg1, 
            to: arg2 
        };
    } 
    // TRƯỜNG HỢP 2: kiểu mới: fetchSalesAnalytics({ categories, stores, ... })
    // Kiểm tra nếu arg1 là một Object
    else if (typeof arg1 === 'object' && arg1 !== null) {
        params = arg1;
        
        // Bonus: Đồng bộ tên biến nếu Backend của bạn yêu cầu 'from'/'to' 
        // thay vì 'from_date'/'to_date' của bộ lọc
        if (params.from_date) params.from = params.from_date;
        if (params.to_date) params.to = params.to_date;
    }

    return apiClient.get(`/analytics/sales`, { params });
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