import Chart from 'chart.js/auto';
import $ from 'jquery';
import { fetchSalesAnalytics } from './api.js';


// Quản lý trạng thái ứng dụng
const state = {
    instances: { line: null, bar: null, pie: null },
    currentViewMode: 'daily',
    isLoading: false,
    lastFilters: {}
};

/* ================= HELPERS ================= */
const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const calculateGrowth = (current, previous) => {
    if (!previous || previous <= 0) return 0;
    return ((current - previous) / previous) * 100;
};

const toggleLoading = (show) => {
    state.isLoading = show;
    $('#loadingOverlay').toggleClass('active', show);
    if(show) {
        $('.summary-value').html('<div class="spinner-border spinner-border-sm text-primary"></div>');
    }
};

/* ================= CORE LOGIC ================= */

async function initPage() {
    console.log('🚀 Initializing Report Page...');

    // Lắng nghe khi bộ lọc được áp dụng
    $(document).on("filters:applied", function (event, filterData) {
        console.log("📥 Nhận dữ liệu filter mới:", filterData);
        state.lastFilters = filterData;
        loadRevenueData(filterData);
    });
    
    // Lấy giá trị mặc định từ DOM
    const initialFilters = {
        from_date: $('#startDate').val(),
        to_date: $('#endDate').val()
    };
    state.lastFilters = initialFilters;

    // Sử dụng Promise.allSettled để đảm bảo các tác vụ chạy độc lập
    await Promise.allSettled([
        renderPieChart(),
        loadRevenueData(initialFilters)
    ]);

    $('#viewMode').off('change').on('change', function() {
        state.currentViewMode = $(this).val();
        loadRevenueData();
    });
}

async function loadRevenueData(filters = null) {
    toggleLoading(true);
    
    const params = filters || state.lastFilters;
    
    // Fallback nếu params rỗng
    if (!params.from_date && !params.from) {
         params.from_date = $('#startDate').val();
         params.to_date = $('#endDate').val();
    }

    try {
        const response = await fetchSalesAnalytics(params);
        
        // Axios trả về dữ liệu nằm trong response.data
        // Do đó result ở đây chính là JSON từ Laravel trả về
        const result = response.data; 

        console.log('📦 Dữ liệu thực tế từ server:', result);

        if (result && result.status === 'success') {
            const chartData = transformData(result);
            updateUI(result.summary, chartData);
            console.log('✅ Cập nhật UI thành công');
        } else {
            console.error('❌ Cấu trúc JSON không đúng hoặc status != success:', result);
            $('.summary-value').text('Error');
        }
    } catch (error) {
        console.error('❌ Lỗi khi gọi API:', error);
        $('.summary-value').text('N/A');
    } finally {
        toggleLoading(false);
    }
}

// Chuyển đổi dữ liệu linh hoạt từ API
function transformData(result) {
    // Ưu tiên lấy từ chart_data
    if (result.chart_data && Array.isArray(result.chart_data)) {
        return result.chart_data;
    }
    
    // Nếu không có, thử lấy từ daily_data và biến đổi
    if (result.daily_data && result.daily_data.labels) {
        return result.daily_data.labels.map((label, i) => ({
            date: label,
            revenue: parseFloat(result.daily_data.revenue?.[i] || 0),
            orders: parseInt(result.daily_data.orders?.[i] || 0)
        }));
    }

    console.warn('⚠️ Không tìm thấy dữ liệu biểu đồ phù hợp trong JSON');
    return [];
}

function updateUI(summary, chartData) {
    // 1. Summary Cards
    $('#sumRevenue').text(formatCurrency(summary?.total_revenue));
    $('#activeStores').text(summary?.active_stores || 0);
    
    const growth = chartData.length >= 2 
        ? calculateGrowth(chartData[chartData.length-1].revenue, chartData[chartData.length-2].revenue) 
        : 0;
    
    $('#monthlyGrowth')
        .text(`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`)
        .attr('class', `summary-value ${growth >= 0 ? 'text-success' : 'text-danger'}`);

    // 2. Charts
    renderMainCharts(chartData);

    // 3. Table
    renderTable(chartData);
}

/* ================= RENDERING ================= */

function renderMainCharts(data) {
    // Xử lý dữ liệu theo viewMode
    const processedData = processDataByViewMode(data, state.currentViewMode);
    
    const labels = processedData.map(d => d.date);
    const values = processedData.map(d => d.revenue);

    // Line Chart
    if (state.instances.line) state.instances.line.destroy();
    state.instances.line = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Revenue',
                data: values,
                borderColor: '#647acb',
                fill: true,
                backgroundColor: 'rgba(100, 122, 203, 0.1)',
                tension: 0.4
            }]
        },
        options: { maintainAspectRatio: false }
    });

    // Bar Chart
    if (state.instances.bar) state.instances.bar.destroy();
    state.instances.bar = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Revenue',
                data: values,
                backgroundColor: '#647acb'
            }]
        },
        options: { maintainAspectRatio: false }
    });
}

// Hàm gộp dữ liệu theo tuần/tháng/năm
function processDataByViewMode(data, mode) {
    if (mode === 'daily') return data;

    const grouped = {};

    data.forEach(item => {
        const date = new Date(item.date);
        let key;

        if (mode === 'weekly') {
            // Lấy ngày đầu tuần (Thứ 2)
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
            const monday = new Date(date.setDate(diff));
            key = monday.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (mode === 'monthly') {
            key = item.date.substring(0, 7); // YYYY-MM
        } else if (mode === 'yearly') {
            key = item.date.substring(0, 4); // YYYY
        }

        if (!grouped[key]) {
            grouped[key] = { date: key, revenue: 0, orders: 0 };
        }
        grouped[key].revenue += item.revenue;
        grouped[key].orders += item.orders;
    });

    return Object.values(grouped);
}

async function renderPieChart() {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;

    try {
        const res = await fetch('/api/products/categories').then(r => r.json());
        if (res.status === 'success') {
            const categories = Array.isArray(res.data.categories) ? res.data.categories : Object.values(res.data.categories);
            
            const sorted = categories.sort((a, b) => b.delta_gmv - a.delta_gmv).slice(0, 5);
            
            if (state.instances.pie) state.instances.pie.destroy();
            state.instances.pie = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: sorted.map(c => c.Category),
                    datasets: [{
                        data: sorted.map(c => c.delta_gmv),
                        backgroundColor: ['#647acb', '#48bb78', '#f6ad55', '#f56565', '#ed8936']
                    }]
                },
                options: { maintainAspectRatio: false }
            });
        }
    } catch (e) { console.warn('Pie Chart Error', e); }
}

function renderTable(data) {
    let html = data.map((item, index) => {
        const growth = index > 0 ? calculateGrowth(item.revenue, data[index-1].revenue) : null;
        const growthColor = growth >= 0 ? 'text-success' : 'text-danger';
        
        return `
            <tr>
                <td class="fw-bold">${item.date}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td class="${growthColor}">${growth !== null ? (growth >= 0 ? '↑' : '↓') + Math.abs(growth).toFixed(1) + '%' : '--'}</td>
            </tr>
        `;
    }).reverse().join(''); // Đảo ngược để thấy ngày mới nhất lên đầu
    
    $('#revenueTable tbody').html(html || '<tr><td colspan="3" class="text-center">No data</td></tr>');
}

$(document).ready(initPage);