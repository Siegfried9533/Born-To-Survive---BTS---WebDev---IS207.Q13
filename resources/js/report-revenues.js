import Chart from 'chart.js/auto';
import $ from 'jquery';
import { fetchSalesAnalytics } from './api.js';

/* ======================================================= */
/* REPORT REVENUES PAGE: Load revenue data từ API */
/* ======================================================= */

let lineChartInstance = null;
let barChartInstance = null;
let pieChartInstance = null;
let currentViewMode = 'daily';

async function loadRevenueData(from = null, to = null) {
    console.log('Loading revenue data...');
    
    // Hiển thị loading state
    $('#sumRevenue').html('<i class="fas fa-spinner fa-spin"></i>');
    $('#monthlyGrowth').html('<i class="fas fa-spinner fa-spin"></i>');
    $('#activeStores').html('<i class="fas fa-spinner fa-spin"></i>');

    try {
        const response = await fetchSalesAnalytics(from, to);
        const result = response.data;

        if (result.status === 'success') {
            const summary = result.summary;
            const chartData = result.chart_data;

            // Update summary cards
            updateSummaryCards(summary, chartData);

            // Update charts based on view mode
            updateCharts(chartData);

            // Update table
            updateTable(chartData);

            console.log('Revenue data loaded successfully');
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error loading revenue data:', error);
        $('#sumRevenue').text('Error');
        $('#monthlyGrowth').text('Error');
        $('#activeStores').text('Error');
        alert('Failed to load revenue data. Please check console (F12).');
    }
}

function updateSummaryCards(summary, chartData) {
    // Total Revenue
    $('#sumRevenue').text(formatCurrency(summary.total_revenue));

    // Calculate growth (compare last 2 periods)
    let growth = 0;
    if (chartData.length >= 2) {
        const lastRevenue = parseFloat(chartData[chartData.length - 1].revenue);
        const prevRevenue = parseFloat(chartData[chartData.length - 2].revenue);
        
        if (prevRevenue > 0) {
            growth = ((lastRevenue - prevRevenue) / prevRevenue) * 100;
        }
    }

    const growthText = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    const growthClass = growth >= 0 ? 'text-success' : 'text-danger';
    $('#monthlyGrowth').html(`<span class="${growthClass}">${growthText}</span>`);

    // Active Stores (count unique stores from transactions)
    $('#activeStores').text(summary.total_orders || 0);
}

function updateCharts(data) {
    const processedData = processDataByViewMode(data, currentViewMode);
    
    // Line Chart - Revenue Trend
    renderLineChart(processedData);
    
    // Bar Chart - Revenue Comparison
    renderBarChart(processedData);
    
    // Pie Chart - Category Distribution (load từ API)
    renderPieChart();
}

function processDataByViewMode(data, mode) {
    if (mode === 'daily') {
        return data.map(item => ({
            label: formatDate(item.date),
            revenue: parseFloat(item.revenue),
            orders: parseInt(item.total_orders)
        }));
    }
    
    // For weekly/monthly/yearly, we'd need to aggregate
    // For now, return daily data
    return data.map(item => ({
        label: formatDate(item.date),
        revenue: parseFloat(item.revenue),
        orders: parseInt(item.total_orders)
    }));
}

function renderLineChart(data) {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;

    if (lineChartInstance) {
        lineChartInstance.destroy();
    }

    const labels = data.map(item => item.label);
    const revenues = data.map(item => item.revenue);

    // Tính toán độ rộng động của Chart dựa trên số lượng dữ liệu
    // Nếu data > 20 điểm, mỗi điểm chiếm ít nhất 50px
    const chartWidth = data.length > 20 ? data.length * 50 : ctx.parentElement.clientWidth;
    ctx.style.width = chartWidth + 'px';

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: revenues,
                borderColor: '#647acb',
                backgroundColor: 'rgba(100, 122, 203, 0.1)',
                borderWidth: 2,
                tension: 0.3, // Giảm độ cong để dễ nhìn khi dữ liệu dày
                fill: true,
                pointRadius: data.length > 50 ? 0 : 3, // Ẩn điểm chấm nếu quá dày (>50 điểm)
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: false, // Tắt responsive để cho phép cuộn ngang
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: true, // Tự động ẩn bớt nhãn nếu thiếu chỗ
                        maxTicksLimit: 15, // Giới hạn tối đa 15 nhãn hiển thị trên trục X
                        maxRotation: 0,
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${(value / 1000000).toFixed(1)}M`
                    }
                }
            }
        }
    });
}

function renderBarChart(data) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    if (barChartInstance) barChartInstance.destroy();

    // Mỗi cột tối thiểu 50px bao gồm khoảng cách
    const minBarWidth = 50;
    const chartWidth = Math.max(ctx.parentElement.clientWidth, data.length * minBarWidth);
    ctx.style.width = chartWidth + 'px';

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.label),
            datasets: [{
                label: 'Revenue',
                data: data.map(item => item.revenue),
                backgroundColor: '#647acb',
                borderRadius: 4,
                barThickness: 25 // ✅ Cố định độ rộng cột, không cho nó bị bóp nhỏ
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { autoSkip: true, maxTicksLimit: 15 } },
                y: { beginAtZero: true }
            }
        }
    });
}

async function renderPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    try {
        // 1. Load category data từ API
        const response = await fetch('/api/products/categories');
        const result = await response.json();

        if (result.status === 'success' && result.data && result.data.categories) {
            let categoryData = Array.isArray(result.data.categories) ? 
                result.data.categories : 
                Object.values(result.data.categories);

            // --- BƯỚC CHỈNH SỬA CHO DỮ LIỆU LỚN ---
            // 2. Sắp xếp dữ liệu từ lớn đến nhỏ theo delta_gmv
            categoryData.sort((a, b) => parseFloat(b.delta_gmv || 0) - parseFloat(a.delta_gmv || 0));

            // 3. Gom nhóm: Chỉ giữ lại Top 6 mục lớn nhất, còn lại gom vào "Others"
            const MAX_ITEMS = 6;
            let finalLabels = [];
            let finalValues = [];
            let othersValue = 0;

            categoryData.forEach((item, index) => {
                const val = parseFloat(item.delta_gmv || 0);
                if (index < MAX_ITEMS) {
                    finalLabels.push(item.Category || 'N/A');
                    finalValues.push(val);
                } else {
                    othersValue += val;
                }
            });

            if (othersValue > 0) {
                finalLabels.push('Others');
                finalValues.push(othersValue);
            }

            // 4. Tính toán tỷ lệ %
            const totalRevenue = finalValues.reduce((a, b) => a + b, 0) || 1;
            const percentages = finalValues.map(v => ((v / totalRevenue) * 100).toFixed(1));

            // 5. Bảng màu (Tương ứng với số lượng labels sau khi đã gom nhóm)
            const colors = [
                '#647acb', '#f6ad55', '#48bb78', '#ed8936', '#9f7aea', 
                '#f56565', '#a0aec0', '#4299e1', '#48bb78', '#ecc94b'
            ];
            const chartColors = colors.slice(0, finalLabels.length);

            // 6. Khởi tạo Chart - Scale nhỏ cho dữ liệu lớn
            pieChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: finalLabels,
                    datasets: [{
                        data: percentages,
                        backgroundColor: chartColors,
                        borderWidth: 1.5, // Giảm border width
                        borderColor: '#fff',
                        hoverOffset: 8 // Giảm hiệu ứng hover
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%', // Vòng tròn mỏng hơn để nhìn nhỏ gọn
                    layout: {
                        padding: 10 // Tạo khoảng trống nhỏ để biểu đồ không dính sát lề
                    },
                    plugins: {
                        legend: {
                            position: 'bottom', // 👈 Đẩy xuống dưới để không làm phình chiều ngang
                            labels: {
                                boxWidth: 12,
                                padding: 20
                            }
                        }
                    }
                }
            });

            console.log('✅ Pie chart rendered with top categories and others grouping');
        } else {
            throw new Error('Invalid category data format');
        }
    } catch (error) {
        console.warn('⚠️ Error loading category data, using mock data:', error);
        
        // Fallback to mock data
        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Others'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#647acb',
                        '#f6ad55',
                        '#48bb78',
                        '#ed8936',
                        '#a0aec0'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed}%`
                        }
                    }
                }
            }
        });
    }
}

function updateTable(data) {
    const tbody = $('#revenueTable tbody');
    
    if (data.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="3" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox me-2"></i> No data available
                </td>
            </tr>
        `);
        return;
    }

    let html = '';
    let prevRevenue = null;

    data.forEach((item, index) => {
        const revenue = parseFloat(item.revenue);
        let growth = 0;
        let growthClass = '';
        let growthIcon = '';

        if (prevRevenue !== null && prevRevenue > 0) {
            growth = ((revenue - prevRevenue) / prevRevenue) * 100;
            growthClass = growth >= 0 ? 'text-success' : 'text-danger';
            growthIcon = growth >= 0 ? '↑' : '↓';
        }

        html += `
            <tr>
                <td class="fw-semibold">${formatDate(item.date)}</td>
                <td class="fw-semibold">${formatCurrency(revenue)}</td>
                <td class="${growthClass}">
                    ${prevRevenue !== null ? `${growthIcon} ${Math.abs(growth).toFixed(1)}%` : 'N/A'}
                </td>
            </tr>
        `;

        prevRevenue = revenue;
    });

    tbody.html(html);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
}

async function downloadCSV() {
    const btn = $('#downloadBtn');
    const originalHtml = btn.html();
    
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i> Downloading...');

    try {
        // Get current filter dates if any
        const response = await fetchSalesAnalytics();
        const result = response.data;

        if (result.status === 'success') {
            const data = result.chart_data;

            // Create CSV content
            let csv = 'Date,Revenue,Total Orders\n';

            data.forEach(item => {
                csv += `${item.date},${item.revenue},${item.total_orders}\n`;
            });

            // Download file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ CSV downloaded successfully');
        }
    } catch (error) {
        console.error('❌ Error downloading CSV:', error);
        alert('Failed to download CSV. Please check console (F12).');
    } finally {
        btn.prop('disabled', false).html(originalHtml);
    }
}

// Initialize
$(document).ready(function() {
    console.log('🚀 Report Revenues page initialized');

    // Load initial data (last 30 days by default)
    loadRevenueData();

    // View mode selector
    $('#viewMode').on('change', function() {
        currentViewMode = $(this).val();
        loadRevenueData();
    });

    // Download button
    $('#downloadBtn').on('click', function(e) {
        e.preventDefault();
        downloadCSV();
    });
});
