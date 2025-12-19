import Chart from 'chart.js/auto';
import $ from 'jquery';
import dayjs from 'dayjs';
import axios from 'axios';

/* ======================================================= */
/* GLOBAL CHART INSTANCES                                   */
/* ======================================================= */
let channelChartInstance = null;
let topProductsChartInstance = null;
let trendChartInstance = null;
let dailyRevenueChartInstance = null;
let dailyOrdersChartInstance = null;

// Lưu data để render modal charts
let cachedDailyData = null;

/* ======================================================= */
/* LOADING OVERLAY                                          */
/* ======================================================= */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

/* ======================================================= */
/* FORMAT HELPERS                                           */
/* ======================================================= */
function formatCurrency(value) {
    if (value >= 1e9) return (value / 1e9).toFixed(2) + ' Billion';
    if (value >= 1e6) return (value / 1e6).toFixed(1) + ' Million';
    if (value >= 1e3) return (value / 1e3).toFixed(0) + 'K';
    return value.toLocaleString('vi-VN');
}

function formatNumber(value) {
    return value.toLocaleString('vi-VN');
}

/* ======================================================= */
/* COLLECT FILTERS                                          */
/* ======================================================= */
function collectFilters() {
    const from = document.getElementById('salesStartDate')?.value || null;
    const to = document.getElementById('salesEndDate')?.value || null;
    return { from, to };
}

/* ======================================================= */
/* FETCH SALES DATA                                         */
/* ======================================================= */
async function fetchSalesData() {
    const canvas = document.getElementById('channelChart');
    if (!canvas) return;

    const filters = collectFilters();
    console.log('🚀 Fetching Sales Data:', filters);

    showLoading();

    try {
        const response = await axios.get('/api/analytics/sales', { params: filters });
        const data = response.data;

        if (!data || data.status !== 'success') {
            console.error('❌ API Error:', data);
            hideLoading();
            return;
        }

        console.log('✅ Sales Data:', data);

        // Update summary cards
        updateSummaryCards(data.summary);

        // Cache daily data for modals
        cachedDailyData = data.daily_data;

        // Render charts
        renderChannelChart(data.channels);
        renderTopProductsChart(data.top_products);
        renderTrendChart(data.trend);

        // Populate tables
        populateProvincesTable(data.top_provinces);
        populateEmployeesTable(data.top_employees);

    } catch (error) {
        console.error('❌ Error fetching sales data:', error);
        alert('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
        hideLoading();
    }
}

/* ======================================================= */
/* UPDATE SUMMARY CARDS                                     */
/* ======================================================= */
function updateSummaryCards(summary) {
    // Total Sale
    document.getElementById('totalSaleValue').textContent = formatCurrency(summary.total_revenue);
    
    // Total Orders
    document.getElementById('totalOrdersValue').textContent = formatNumber(summary.total_orders);
    
    // Average Order Value
    document.getElementById('avgOrderValue').textContent = formatCurrency(summary.avg_order_value);
    
    // Growth YoY
    const growthEl = document.getElementById('growthYoYValue');
    const growthIconEl = document.getElementById('growthYoYIcon');
    const growth = summary.growth_yoy;
    
    if (growth >= 0) {
        growthEl.textContent = '+' + growth + '%';
        growthEl.className = 'mb-0 fw-bold text-success';
        growthIconEl.className = 'bg-success bg-opacity-10 text-success rounded-3 p-3';
        growthIconEl.innerHTML = '<i class="fas fa-arrow-trend-up fa-xl"></i>';
    } else {
        growthEl.textContent = growth + '%';
        growthEl.className = 'mb-0 fw-bold text-danger';
        growthIconEl.className = 'bg-danger bg-opacity-10 text-danger rounded-3 p-3';
        growthIconEl.innerHTML = '<i class="fas fa-arrow-trend-down fa-xl"></i>';
    }
}

/* ======================================================= */
/* RENDER CHANNEL CHART (PIE)                               */
/* ======================================================= */
function renderChannelChart(data) {
    const ctx = document.getElementById('channelChart')?.getContext('2d');
    if (!ctx) return;

    if (channelChartInstance) channelChartInstance.destroy();

    channelChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: data.colors,
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 10,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
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
                        label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
                    }
                }
            }
        }
    });
}

/* ======================================================= */
/* RENDER TOP PRODUCTS CHART (BAR HORIZONTAL)               */
/* ======================================================= */
function renderTopProductsChart(data) {
    const ctx = document.getElementById('topProductsChart')?.getContext('2d');
    if (!ctx) return;

    if (topProductsChartInstance) topProductsChartInstance.destroy();

    topProductsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Quantity Sold',
                data: data.values,
                backgroundColor: '#647acb',
                borderRadius: 6,
                barThickness: 20,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Sold: ${formatNumber(ctx.parsed.x)} units`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { callback: (v) => formatNumber(v) }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

/* ======================================================= */
/* RENDER TREND CHART (LINE)                                */
/* ======================================================= */
function renderTrendChart(data) {
    const ctx = document.getElementById('revenueTrendChart')?.getContext('2d');
    if (!ctx) return;

    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.values,
                borderColor: '#647acb',
                backgroundColor: 'rgba(100, 122, 203, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#647acb',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Revenue: ${formatCurrency(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => formatCurrency(v) }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/* ======================================================= */
/* POPULATE TABLES                                          */
/* ======================================================= */
function populateProvincesTable(provinces) {
    const tbody = document.getElementById('topProvincesBody');
    if (!tbody) return;

    tbody.innerHTML = provinces.map(p => `
        <tr>
            <td class="text-center">${getRankBadge(p.rank)}</td>
            <td>${p.city}</td>
            <td class="text-end pe-4">${formatCurrency(p.revenue)}</td>
            <td class="text-end pe-4">${p.percent}%</td>
        </tr>
    `).join('');
}

function populateEmployeesTable(employees) {
    const tbody = document.getElementById('topEmployeesBody');
    if (!tbody) return;

    tbody.innerHTML = employees.map(e => `
        <tr>
            <td class="text-center">${getRankBadge(e.rank)}</td>
            <td>${e.name}</td>
            <td class="text-end pe-4">${formatCurrency(e.revenue)}</td>
            <td class="text-center">${formatNumber(e.orders)}</td>
            <td class="text-end pe-4">${formatCurrency(e.aov)}</td>
        </tr>
    `).join('');
}

function getRankBadge(rank) {
    if (rank === 1) return '<div class="rank-trophy gold"><i class="fas fa-trophy"></i></div>';
    if (rank === 2) return '<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>';
    if (rank === 3) return '<div class="rank-trophy bronze"><i class="fas fa-award"></i></div>';
    return `<div class="rank-normal">${rank}</div>`;
}

/* ======================================================= */
/* MODAL CHARTS                                             */
/* ======================================================= */
function renderDailyRevenueChart() {
    if (!cachedDailyData) return;

    const ctx = document.getElementById('dailyRevenueChart')?.getContext('2d');
    if (!ctx) return;

    if (dailyRevenueChartInstance) dailyRevenueChartInstance.destroy();

    dailyRevenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cachedDailyData.labels,
            datasets: [{
                label: 'Daily Revenue',
                data: cachedDailyData.revenue,
                backgroundColor: '#647acb',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Revenue: ${formatCurrency(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => formatCurrency(v) }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderDailyOrdersChart() {
    if (!cachedDailyData) return;

    const ctx = document.getElementById('dailyOrdersChart')?.getContext('2d');
    if (!ctx) return;

    if (dailyOrdersChartInstance) dailyOrdersChartInstance.destroy();

    dailyOrdersChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cachedDailyData.labels,
            datasets: [{
                label: 'Daily Orders',
                data: cachedDailyData.orders,
                backgroundColor: '#48bb78',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Orders: ${formatNumber(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => formatNumber(v) }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

/* ======================================================= */
/* INIT FILTERS                                             */
/* ======================================================= */
function initFilters() {
    // Litepicker cho date range (from - to)
    const startDisplay = document.getElementById('salesStartDateDisplay');
    const endDisplay = document.getElementById('salesEndDateDisplay');
    
    if (!startDisplay || !endDisplay) return;

    const picker = new Litepicker({
        element: startDisplay,
        elementEnd: endDisplay,
        singleMode: false,
        numberOfMonths: 2,
        numberOfColumns: 2,
        format: 'YYYY-MM-DD',
        autoApply: true,
        showTooltip: true,
        tooltipText: {
            one: 'day',
            other: 'days'
        },
        setup: (picker) => {
            picker.on('selected', (date1, date2) => {
                if (date1 && date2) {
                    const from = date1.format('YYYY-MM-DD');
                    const to = date2.format('YYYY-MM-DD');
                    document.getElementById('salesStartDate').value = from;
                    document.getElementById('salesEndDate').value = to;
                    document.getElementById('salesStartDateDisplay').value = from;
                    document.getElementById('salesEndDateDisplay').value = to;
                }
            });
        }
    });

    // Calendar trigger button - mở picker
    const triggerBtn = document.getElementById('salesCalendarTriggerBtn');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => picker.show());
    }
    
    // Cho phép click vào end date cũng mở picker
    endDisplay.addEventListener('click', () => picker.show());

    // Set default: last 30 days
    const today = dayjs();
    const thirtyDaysAgo = today.subtract(30, 'day');
    
    document.getElementById('salesStartDate').value = thirtyDaysAgo.format('YYYY-MM-DD');
    document.getElementById('salesEndDate').value = today.format('YYYY-MM-DD');
    document.getElementById('salesStartDateDisplay').value = thirtyDaysAgo.format('YYYY-MM-DD');
    document.getElementById('salesEndDateDisplay').value = today.format('YYYY-MM-DD');
    
    picker.setDateRange(thirtyDaysAgo.toDate(), today.toDate());

    // Apply Filters button
    const applyBtn = document.getElementById('applySalesFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fetchSalesData();
        });
    }
}

/* ======================================================= */
/* INIT MODAL EVENTS                                        */
/* ======================================================= */
function initModalEvents() {
    // Render chart when modal is shown
    const totalSaleModal = document.getElementById('totalSaleModal');
    if (totalSaleModal) {
        totalSaleModal.addEventListener('shown.bs.modal', () => {
            renderDailyRevenueChart();
        });
    }

    const totalOrdersModal = document.getElementById('totalOrdersModal');
    if (totalOrdersModal) {
        totalOrdersModal.addEventListener('shown.bs.modal', () => {
            renderDailyOrdersChart();
        });
    }
}

/* ======================================================= */
/* DOCUMENT READY                                           */
/* ======================================================= */
$(document).ready(function() {
    initFilters();
    initModalEvents();
    fetchSalesData(); // Load data on page load
});

// Chart.js defaults
Chart.defaults.font.family = "'Inter', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.color = '#495057';
