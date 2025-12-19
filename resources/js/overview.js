import Chart from 'chart.js/auto';
import $ from 'jquery';
import dayjs from 'dayjs';
import { fetchDashboardOverview, fetchStores } from './api.js';

/* ======================================================= */
/* BIẾN TOÀN CỤC LƯU TRỮ INSTANCE BIỂU ĐỒ (để destroy) */
/* ======================================================= */
let gmvChartInstance = null;
let modalabChartInstance = null;
let salesChartInstance = null;

/* ======================================================= */
/* LOADING OVERLAY HELPERS                                  */
/* ======================================================= */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

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

    const params = collectFilters();
    console.log("🚀 Calling API: /api/dashboard/overview", params);

    // Hiển thị loading overlay
    showLoading();

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
        const response = await fetchDashboardOverview(params);
        const data = response.data;

        if (!data) {
            console.error("❌ API trả về rỗng.");
            hideLoading();
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
    } finally {
        // Ẩn loading overlay sau khi hoàn tất (dù thành công hay lỗi)
        hideLoading();
    }
}

// Thu thập filter (1 ngày + stores)
function collectFilters() {
    const anchor = document.getElementById('startDate')?.value || null;
    
    // Kiểm tra "All stores" có được chọn không
    const allStoresChecked = document.getElementById('store_all')?.checked;
    
    let stores = [];
    if (!allStoresChecked) {
        // Chỉ lấy stores cụ thể nếu không chọn "All stores"
        const storeCheckboxes = document.querySelectorAll('#overview-store-dropdown input[type="checkbox"]:checked:not(#store_all)');
        stores = Array.from(storeCheckboxes).map(c => c.value).filter(v => v !== "");
    }
    // Nếu allStoresChecked = true hoặc không có store nào được chọn → stores = [] → backend query tất cả

    console.log("🔍 Filters collected:", { anchor, stores });
    
    return {
        anchor: anchor,
        stores: stores
    };
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
    const gmvs   = data.gmv ? (Array.isArray(data.gmv) ? data.gmv.map(Number) : String(data.gmv || "").split(",").map(Number)) : [];

    // Tính màu động: xanh nếu growth >= 0, đỏ nếu < 0
    const backgroundColors = values.map(v => v >= 0 ? "#48bb78" : "#f56565");

    modalabChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: 'Growth %',
                data: values,
                backgroundColor: backgroundColors,
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
                        label: (ctx) => {
                            const growth = ctx.raw;
                            const gmvVal = gmvs[ctx.dataIndex] ?? null;
                            const gmvText = gmvVal !== null ? ` | GMV: ${Number(gmvVal).toLocaleString('fr-FR')} €` : "";
                            return `Growth: ${growth}%${gmvText}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    // Auto scale - không giới hạn max 100% vì SBY, SBM có thể > 100%
                    ticks: { callback: (v) => `${v}%` },
                    grid: { color: "#e5e7eb" },
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
    const gmvs   = data.gmv ? (Array.isArray(data.gmv) ? data.gmv.map(Number) : String(data.gmv || "").split(",").map(Number)) : [];
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
                            const gmvVal = gmvs[context.dataIndex] ?? null;
                            const gmvText = gmvVal !== null ? ` | GMV: ${Number(gmvVal).toLocaleString('fr-FR')} €` : "";
                            return `${context.label}: ${percentage}%${gmvText}`;
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
    initFilters();
    initOverviewChartsFromApi();
});

function initFilters() {
    // Litepicker chọn 1 ngày (single mode)
    const pickerA = new Litepicker({
        element: document.getElementById('startDateDisplay'),
        singleMode: true,
        numberOfMonths: 2,
        numberOfColumns: 2,
        format: "YYYY-MM-DD",
        setup: (picker) => {
            picker.on('selected', (date1) => {
                const val = date1.format('YYYY-MM-DD');
                document.getElementById('startDate').value = val;
                document.getElementById('endDate').value   = val;
                document.getElementById('startDateDisplay').value = val;
                document.getElementById('endDateDisplay').value   = dayjs(val).subtract(1, 'year').format('YYYY-MM-DD');
                // Không tự động load - chờ user ấn Apply Filters
            });
        }
    });

    // Nút calendar trigger
    const triggerBtn = document.getElementById('calendarTriggerBtn');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', () => pickerA.show());
    }

    // Auto set default: hôm nay
    const today = dayjs();
    const todayStr = today.format('YYYY-MM-DD');
    
    // Set giá trị cho hidden inputs và display inputs
    document.getElementById('startDate').value = todayStr;
    document.getElementById('endDate').value = todayStr;
    document.getElementById('startDateDisplay').value = todayStr;
    document.getElementById('endDateDisplay').value = today.subtract(1, 'year').format('YYYY-MM-DD');
    
    // Set date cho picker (không trigger event)
    pickerA.setDate(today.toDate());

    // Load stores vào dropdown checkbox
    fetchStores().then(resp => {
        // API trả về { status: 'success', data: [...stores] }
        const stores = resp.data?.data || resp.data || [];
        console.log("📦 Stores loaded:", stores);
        
        const dropdown = document.getElementById('overview-store-dropdown');
        if (!dropdown) return;
        
        // Giữ option All stores (checked mặc định)
        dropdown.innerHTML = `
            <div class="filter-item">
                <input type="checkbox" id="store_all" value="" checked>
                <label for="store_all">All stores</label>
            </div>
        `;
        
        stores.forEach((s, idx) => {
            const id = `store_${idx + 1}`;
            const value = s.StoreID || s.store_id || s.id;
            const label = s.StoreName || s.Name || `Store ${value}`;
            const div = document.createElement('div');
            div.className = 'filter-item';
            div.innerHTML = `
                <input type="checkbox" id="${id}" value="${value}">
                <label for="${id}">${label}</label>
            `;
            dropdown.appendChild(div);
        });

        // bật/tắt dropdown - toggle class 'open' trên parent .filter-group
        const filterGroup = document.getElementById('overview-store-group');
        const displayBox = document.querySelector('#overview-store-group .filter-display-box');
        const displayText = document.querySelector('#overview-store-group .filter-display-text');
        
        if (displayBox && filterGroup) {
            displayBox.addEventListener('click', (e) => {
                e.stopPropagation();
                filterGroup.classList.toggle('open');
            });
        }
        
        document.addEventListener('click', (e) => {
            if (filterGroup && !filterGroup.contains(e.target)) {
                filterGroup.classList.remove('open');
            }
        });

        // Logic: Khi chọn "All stores", bỏ chọn các store khác và ngược lại
        const storeAllCheckbox = document.getElementById('store_all');
        const storeCheckboxes = () => dropdown.querySelectorAll('input[type="checkbox"]:not(#store_all)');
        
        storeAllCheckbox?.addEventListener('change', () => {
            if (storeAllCheckbox.checked) {
                storeCheckboxes().forEach(cb => cb.checked = false);
            }
        });
        
        dropdown.addEventListener('change', (e) => {
            if (e.target.id !== 'store_all' && e.target.checked) {
                // Nếu chọn store cụ thể, bỏ "All stores"
                if (storeAllCheckbox) storeAllCheckbox.checked = false;
            }
            // Nếu không còn store nào được chọn, tự động chọn lại "All stores"
            const anyChecked = Array.from(storeCheckboxes()).some(cb => cb.checked);
            if (!anyChecked && storeAllCheckbox) {
                storeAllCheckbox.checked = true;
            }
        });

        // cập nhật text khi chọn
        const updateText = () => {
            const allChecked = storeAllCheckbox?.checked;
            if (allChecked) {
                displayText.textContent = 'All stores';
                return;
            }
            const checked = Array.from(storeCheckboxes()).filter(c => c.checked);
            const names = checked.map(c => c.nextElementSibling?.textContent?.trim() || '').filter(Boolean);
            displayText.textContent = names.length ? names.join(', ') : 'All stores';
        };
        
        dropdown.addEventListener('change', updateText);
        updateText();
        
    }).catch(err => {
        console.warn("❌ Không tải được stores", err);
    });

    const applyBtn = document.getElementById('applyOverviewFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            initOverviewChartsFromApi();
        });
    }
}