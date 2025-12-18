import Chart from 'chart.js/auto';
import $ from 'jquery';
import { fetchDashboardOverview } from './api.js';

/* ======================================================= */
/* BIẾN TOÀN CỤC LƯU TRỮ INSTANCE BIỂU ĐỒ (để destroy) */
/* ======================================================= */
let gmvChartInstance = null;
let modalabChartInstance = null;
let salesChartInstance = null;

/* ======================================================= */
/* OVERVIEW: GỌI API /api/dashboard/overview → VẼ BIỂU ĐỒ */
/* ======================================================= */
async function initOverviewChartsFromApi(filterParams = {}) {
    // Chỉ chạy nếu đang ở trang có biểu đồ này
    const canvas = document.getElementById("gmvEvolutionChart");
    if (!canvas) {
        console.warn("⚠️ Canvas #gmvEvolutionChart không tồn tại - không phải trang overview");
        return;
    }

    console.log("🚀 Calling API: /api/dashboard/overview");

    //test
    try {
        const response = await fetchDashboardOverview(filterParams);
        const data = response.data;

        console.log("1. Data đã về tới JS");

        if (data.Modalab_Synthesis) {
            console.log("2. Bắt đầu vẽ Modalab...");
            renderModalabSynthesis(data.Modalab_Synthesis);
        }

        if (data.Sales_Channels) {
            console.log("3. Bắt đầu vẽ Sales Channels...");
            renderSalesChannels(data.Sales_Channels);
        }
        
        console.log("4. Kết thúc quá trình vẽ");

    } catch (error) {
        console.error("❌ Lỗi cụ thể:", error);
    }
    //

    try {
        // Dùng axios thay vì jQuery để đảm bảo ổn định
        const response = await fetchDashboardOverview(filterParams);
        const data = response.data;

        if (!data) {
            console.error("❌ API trả về rỗng.");
            return;
        }

        console.log("✅ API Data Received:", data);

        // Vẽ 3 biểu đồ (Kiểm tra kỹ key trả về từ API)
        if (data.GMV_Evolution) {
            console.log("📊 Rendering GMV Evolution...");
            renderGMVEvolution(data.GMV_Evolution);
        } else {
            console.warn("⚠️ Thiếu dữ liệu: GMV_Evolution");
        }

        if (data.Modalab_Synthesis) {
            console.log("📊 Rendering Modalab Synthesis...");
            renderModalabSynthesis(data.Modalab_Synthesis);
        } else {
            console.warn("⚠️ Thiếu dữ liệu: Modalab_Synthesis");
        }

        if (data.Sales_Channels) {
            console.log("📊 Rendering Sales Channels...");
            renderSalesChannels(data.Sales_Channels);
        } else {
            console.warn("⚠️ Thiếu dữ liệu: Sales_Channels");
        }

        if ($('#total-revenue').length) {
            $('#total-revenue').text(`€${data.total_revenue.toLocaleString()}`);
        }

    } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        alert("Không thể tải dữ liệu tổng quan. Vui lòng kiểm tra Console (F12).");
    }
}

// === 1. GMV Evolution (Line on top of Bar) ===
function renderGMVEvolution(data) {
    const ctx = document.getElementById("gmvEvolutionChart").getContext("2d");

    // ⚠️ SỬA 2: Hủy biểu đồ cũ nếu tồn tại
    if (gmvChartInstance) {
        gmvChartInstance.destroy();
    }

    // Helper xử lý dữ liệu an toàn
    const processArray = (input) => Array.isArray(input) ? input : String(input || "").split(",").map(v => v.trim()).filter(Boolean);
    const processNumbers = (input) => Array.isArray(input) ? input.map(Number) : String(input || "").split(",").map(Number);

    const labels = processArray(data.labels);
    const gmv = processNumbers(data.gmv);
    const growth = processNumbers(data.growth);

    gmvChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "GMV",
                    data: gmv,
                    backgroundColor: "#647acb",
                    borderRadius: 4,
                    barThickness: 18, // Độ rộng cột
                    order: 2,
                },
                {
                    type: "line",
                    label: "Growth",
                    data: growth,
                    borderColor: "#f6ad55",
                    backgroundColor: "#f6ad55",
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#f6ad55",
                    pointBorderWidth: 2,
                    yAxisID: "y1", // Trục Y phụ
                    order: 1,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Quan trọng để khớp height CSS
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === "GMV") {
                                return `GMV: €${Number(context.parsed.y).toLocaleString('fr-FR')}`;
                            } else {
                                return `Growth: ${context.parsed.y}%`;
                            }
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `€${(v / 1000).toFixed(0)}k` }, // Rút gọn số liệu trục Y
                    grid: { color: "#e5e7eb" },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: "right",
                    beginAtZero: true,
                    ticks: { callback: (v) => `${v}%` },
                    grid: { drawOnChartArea: false }, // Không vẽ lưới cho trục phụ
                },
                x: { grid: { display: false } },
            },
        },
    });
}

// === 2. Modalab Synthesis ===
function renderModalabSynthesis(data) {
    const ctx = document.getElementById("modalabChart").getContext("2d");

    if (modalabChartInstance) {
        modalabChartInstance.destroy();
    }

    const labels = Array.isArray(data.labels) ? data.labels : String(data.labels || "").split(",");
    const values = Array.isArray(data.values) ? data.values.map(Number) : String(data.values || "").split(",").map(Number);

    modalabChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: 'Synthesis', // Cần label cho tooltip
                data: values,
                backgroundColor: "#647acb",
                borderRadius: 6,
                barThickness: 20,
            }],
        },
        options: {
            indexAxis: "y", // Biểu đồ ngang
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw}%`
                    }
                }
            },
            scales: {
                x: {
                    max: 100, // Phần trăm thì max là 100
                    ticks: { callback: (v) => `${v}%` },
                },
                y: { grid: { display: false } },
            },
        },
    });
}

// === 3. Sales Channels ===
function renderSalesChannels(data) {
    const ctx = document.getElementById("salesChannelsChart").getContext("2d");

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    const labels = Array.isArray(data.labels) ? data.labels : String(data.labels || "").split(",");
    const values = Array.isArray(data.values) ? data.values.map(Number) : String(data.values || "").split(",").map(Number);
    // Màu mặc định nếu API không gửi màu
    const defaultColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
    const colors = data.colors ? (Array.isArray(data.colors) ? data.colors : data.colors.split(",")) : defaultColors;

    salesChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: "#fff",
                hoverOffset: 10,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "75%", // Lỗ tròn ở giữa
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { size: 12 },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${percentage}% (${value})`;
                        },
                    },
                },
            },
        },
    });
}

// Cấu hình Global Defaults
Chart.defaults.font.family = "'Inter', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.color = "#495057";

// 2. Lắng nghe sự kiện từ bộ lọc (Nút Apply)
$(document).on('click', '#apply-filter-btn', function (e) {
    e.preventDefault();
    
    // Lấy giá trị từ các ô Input trong file filter.blade.php
    // Đảm bảo các ô này có ID tương ứng là #date-from và #date-to
    const from = $('#date-from').val(); 
    const to = $('#date-to').val();

    // Gọi lại hàm để fetch dữ liệu mới
    initOverviewChartsFromApi({ from, to });
});

// 3. Khởi chạy lần đầu (không có param -> hiện toàn bộ thời gian)
$(document).ready(function () {
    initOverviewChartsFromApi();
});