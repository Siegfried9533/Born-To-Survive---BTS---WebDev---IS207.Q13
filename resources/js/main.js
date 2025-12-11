// =======================================================
// 1. IMPORTS & SETUP (Bắt buộc cho Vite)
// =======================================================
import $ from 'jquery';
window.$ = window.jQuery = $; // Gán jQuery vào window để các plugin cũ chạy được

import axios from 'axios';
window.axios = axios;

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Import Chart.js (Quan trọng để vẽ biểu đồ)
import Chart from 'chart.js/auto';

// Import Flatpickr (Lịch)
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css"; // CSS của lịch

// Import Litepicker (Nếu bạn dùng npm, nếu dùng CDN thì bỏ qua dòng này)
// import Litepicker from 'litepicker'; 

// Import API của chúng ta
import * as API from './api';

// Cấu hình Dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// =======================================================
// 2. CÁC HÀM TIỆN ÍCH (UTILITIES)
// =======================================================
const ERROR_CLASS = "dynamic-error-message";

function displayError(inputElement, message) {
    inputElement.next(`.${ERROR_CLASS}`).remove();
    const $errorDiv = $("<div>")
        .addClass(`text-danger fs-small mt-1 ${ERROR_CLASS}`)
        .text(message);
    inputElement.after($errorDiv);
    inputElement.focus();
}

function clearAllErrors() {
    $(`.${ERROR_CLASS}`).remove();
}

// =======================================================
// 3. UI EFFECTS & LOADER
// =======================================================
$(window).on("load", function () {
    window.history.scrollRestoration = "manual";
    $(window).scrollTop(0);
    const $loadingScreen = $("#loading-screen");
    const $fadePage = $(".fade-page");

    if ($loadingScreen.length) {
        setTimeout(() => {
            $loadingScreen.css("opacity", "0");
            setTimeout(() => {
                $loadingScreen.hide();
                if ($fadePage.length) $fadePage.addClass("loaded");
            }, 600);
        }, 800);
    } else if ($fadePage.length) {
        $fadePage.addClass("loaded");
    }
});

// Hiệu ứng chuyển trang
$(document).ready(function () {
    $(document).on("click", "a", function (e) {
        const href = $(this).attr("href");
        if (href && !href.startsWith("#") && href.trim() !== "" && !href.startsWith("javascript")) {
            e.preventDefault();
            const $fadePage = $(".fade-page");
            if ($fadePage.length) {
                $fadePage.removeClass("loaded");
                setTimeout(() => {
                    $(window).scrollTop(0);
                    window.location.href = href;
                }, 500);
            } else {
                window.location.href = href;
            }
        }
    });
});

/* ======================================================= */
/* 4. LOGIC SIDEBAR
/* ======================================================= */
function initSidebar() {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) return;

    const menuItems = sidebar.querySelectorAll(".menu-item");
    const submenuItems = sidebar.querySelectorAll(".submenu-item");

    if (!menuItems.length) return;

    // Helper: Xóa active cũ
    function clearAllActiveStyles() {
        menuItems.forEach((mi) => {
            mi.classList.remove("active");
            // Reset style inline nếu có
            const ml = mi.querySelector(".menu-link");
            if (ml) { ml.style = ""; }
        });
        submenuItems.forEach((si) => si.classList.remove("active"));
    }

    // Helper: Đóng submenu
    function closeAllSubmenus() {
        sidebar.querySelectorAll(".has-submenu .submenu").forEach(s => s.classList.remove("show"));
        sidebar.querySelectorAll(".has-submenu .menu-link").forEach(l => l.classList.add("collapsed"));
    }

    // Tự động Active Menu dựa trên URL
    const currentPath = window.location.pathname;
    
    // Logic tìm link active
    let activeFound = false;
    sidebar.querySelectorAll('a').forEach(link => {
        if(link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            const parentItem = link.closest('.menu-item');
            const parentSub = link.closest('.submenu-item');
            
            if(parentSub) {
                parentSub.classList.add('active');
                if(parentItem) {
                    parentItem.classList.add('active');
                    const subMenu = parentItem.querySelector('.submenu');
                    const menuLink = parentItem.querySelector('.menu-link');
                    if(subMenu) subMenu.classList.add('show');
                    if(menuLink) menuLink.classList.remove('collapsed');
                }
            } else if(parentItem) {
                parentItem.classList.add('active');
            }
            activeFound = true;
        }
    });

    // Sự kiện Click Menu
    menuItems.forEach((item) => {
        const link = item.querySelector(".menu-link");
        if (!link) return;

        link.addEventListener("click", function (e) {
            if (item.classList.contains("has-submenu")) {
                e.preventDefault();
                const submenu = item.querySelector(".submenu");
                const isOpen = submenu.classList.contains("show");
                
                // Đóng các menu khác
                closeAllSubmenus(); 
                
                if (!isOpen) {
                    link.classList.remove("collapsed");
                    submenu.classList.add("show");
                    item.classList.add("active");
                }
            } else {
                // Link thường -> để trình duyệt chuyển trang
            }
        });
    });
}

// =======================================================
// 5. CHỨC NĂNG: DANH SÁCH KHÁCH HÀNG (API REAL)
// =======================================================
async function initCustomerEnglish() {
    const $tableBody = $("#topCustomerTable tbody");
    
    // Nếu không tìm thấy bảng thì thoát (không phải trang customer)
    if ($tableBody.length === 0) return; 

    const today = dayjs();
    $("#last-update").text(today.format("MMM DD, YYYY HH:mm"));

    // --- Cấu hình search (dùng header) ---
    const $globalInput = $("#globalSearchInput");
    $globalInput.attr("placeholder", "Search customer name, phone, email...");
    $globalInput.val(""); 

    // --- 1. HÀM RENDER DỮ LIỆU RA BẢNG (Tách ra từ đoạn code lỗi) ---
    const renderCustomerTable = (customers) => {
        $tableBody.empty(); // Xóa dữ liệu cũ trước khi render

        if (!customers || customers.length === 0) {
            $tableBody.html('<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có dữ liệu khách hàng</td></tr>');
            return;
        }

        customers.forEach((c, i) => {
            const rank = i + 1;
            let medal = `<div class="rank-normal">${rank}</div>`;
            if (rank === 1) medal = `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`;
            else if (rank === 2) medal = `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`;
            else if (rank === 3) medal = `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`;

            // Màu sắc badge rank
            let badgeClass = 'bg-light text-dark';
            if(c.rank === 'VIP') badgeClass = 'bg-warning text-dark';
            if(c.rank === 'Gold') badgeClass = 'bg-info text-white';

            // Chuyển đổi số thành dạng tiền tệ Việt Nam
            const formattedMoney = new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
            }).format(c.total_spent);

            $tableBody.append(`
                <tr class="align-middle">
                    <td class="text-center">${medal}</td>
                    <td class="text-muted small">${c.CusID}</td>
                    <td class="item-name fw-bold">${c.Name}</td>
                    <td class="text-end pe-4"><div class="value-main text-success">${formattedMoney}</div></td>
                    <td class="text-end pe-4"><span class="badge ${badgeClass}">${c.rank}</span></td>
                </tr>
            `);
        });

        console.log("Customers rendered:", customers.length);
    };

    // --- 2. HÀM GỌI API (LOAD DATA) ---
    const loadData = async (keyword = '') => {
        // Hiển thị loading
        $tableBody.html('<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-spinner fa-spin me-2"></i> Loading...</td></tr>');
        
        try {
            let response;
            if (keyword) {
                // Gọi API Search
                response = await API.searchCustomers(keyword);
            } else {
                // Gọi API List (Trang 1)
                response = await API.fetchCustomers(1);
            }

            // Lấy dữ liệu an toàn
            const dataRaw = response.data.data; 
            const customers = Array.isArray(dataRaw) ? dataRaw : (dataRaw.data || []);

            // Gọi hàm render đã định nghĩa ở trên
            renderCustomerTable(customers);

        } catch (error) {
            console.error("API Error:", error);
            $tableBody.html(`<tr><td colspan="5" class="text-center text-danger">Lỗi kết nối API: ${error.message}</td></tr>`);
        }
    };

    // --- 3. KHỞI CHẠY ---
    try {
        // Load dữ liệu ban đầu
        await loadData();

        // Setup search event listener
        $globalInput.off("keyup").on("keyup", function() {
            const keyword = $(this).val().trim();
            loadData(keyword);
        });

    } catch (error) {
        console.error("Lỗi tải khách hàng:", error);
        $tableBody.html(`<tr><td colspan="5" class="text-center text-danger">Lỗi: ${error.message}</td></tr>`);
    }

    // === LOGIC DOWNLOAD CSV (Giữ nguyên như cũ) ===
    const $btnDownload = $("#downloadBtn");
    
    $btnDownload.off("click").on("click", async function (e) {
        e.preventDefault();
        
        const originalText = $btnDownload.html();
        $btnDownload.html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);

        try {
            const response = await API.fetchAllCustomersForExport();
            const data = response.data.data;

            if (!data || data.length === 0) {
                alert("Không có dữ liệu để xuất!");
                return;
            }

            let csvContent = "\uFEFFRank,Customer ID,Customer Name,Phone,Email,Total Spent,Rank Group\n";

            data.forEach((row, index) => {
                const name = `"${row.Name}"`; 
                const spent = `"${row.formatted_spent}"`;
                csvContent += `${index + 1},${row.CusID},${name},${row.Phone},${row.Email},${spent},${row.rank}\n`;
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            const filename = `Customers_Report_${dayjs().format('YYYY-MM-DD')}.csv`;
            
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Export Error:", error);
            alert("Có lỗi khi xuất dữ liệu. Vui lòng thử lại.");
        } finally {
            $btnDownload.html(originalText).prop('disabled', false);
        }
    });
}

// =======================================================
// 6. CHỨC NĂNG: DASHBOARD CHARTS (API REAL)
// =======================================================
async function initOverviewChartsFromFile() {
    const chartCanvas = document.getElementById("gmvEvolutionChart");
    if (!chartCanvas) return; // Không phải trang dashboard thì thoát

    try {
        // Gọi API Sales
        const response = await API.fetchSalesAnalytics();
        const apiData = response.data.chart_data;
        const summary = response.data.summary;

        // Cập nhật số liệu tổng nếu có thẻ
        if ($("#total-gmv-display").length) {
            $("#total-gmv-display").text(summary.total_revenue_formatted);
        }

        // Chuẩn bị dữ liệu vẽ
        const labels = apiData.map(item => dayjs(item.date).format('DD/MM'));
        const values = apiData.map(item => item.revenue);

        // Hủy biểu đồ cũ nếu tồn tại để tránh lỗi vẽ chồng
        if (window.gmvChart instanceof Chart) {
            window.gmvChart.destroy();
        }

        // Vẽ biểu đồ mới
        window.gmvChart = new Chart(chartCanvas.getContext("2d"), {
            type: 'bar', // Hoặc 'line'
            data: {
                labels: labels,
                datasets: [{
                    label: "Doanh thu thực tế (VNĐ)",
                    data: values,
                    backgroundColor: "#647acb",
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.raw);
                            }
                        }
                    }
                }
            }
        });

        console.log("✅ Dashboard Chart loaded from API");

    } catch (error) {
        console.error("Lỗi tải Dashboard:", error);
    }
}

// =======================================================
// 7. CHỨC NĂNG: CHATBOX TRỢ LÝ (API REAL)
// =======================================================
function initChatboxSystem() {
    // UI Elements
    const $widget = $("#chat-widget");
    const $toggleBtn = $("#chat-toggle-btn");
    const $closeBtn = $("#close-chat");
    const $sendBtn = $("#chat-send-btn");
    const $input = $("#chat-input");
    const $messages = $("#chat-messages");

    // Toggle Chat
    $toggleBtn.on("click", () => $widget.toggle());
    $closeBtn.on("click", () => $widget.hide());

    // Gửi tin nhắn
    $sendBtn.on("click", async function() {
        const message = $input.val().trim();
        if (!message) return;

        // 1. Hiện tin nhắn User
        appendMessage(message, 'user');
        $input.val(''); // Xóa ô nhập
        scrollToBottom();

        try {
            // 2. Gọi API
            // Lưu ý: Cần login để có token, nếu chưa login API sẽ trả về 401
            const response = await API.chatAsk(message);
            
            const data = response.data.data;
            let botHtml = `<strong>Bot:</strong> ${data.bot_answer}`;
            
            if(data.bot_recommendation) {
                botHtml += `<br><div class="mt-1 text-warning small"><em>💡 ${data.bot_recommendation}</em></div>`;
            }
            
            // 3. Hiện tin nhắn Bot
            appendMessage(botHtml, 'bot');

        } catch (error) {
            console.error("Chat Error:", error);
            let errorMsg = "Lỗi kết nối.";
            if(error.response && error.response.status === 401) {
                errorMsg = "Phiên đăng nhập hết hạn. Vui lòng login lại.";
            }
            appendMessage(errorMsg, 'bot');
        }
    });

    // Xử lý phím Enter
    $input.on("keypress", function(e) {
        if(e.which === 13) $sendBtn.click();
    });

    function appendMessage(html, sender) {
        const styleStr = sender === 'user' 
            ? 'background: #e0e7ff; color: #3730a3; align-self: flex-end; text-align: right;' 
            : 'background: #f3f4f6; color: #1f2937; align-self: flex-start;';
        
        const msgDiv = '<div style="padding: 8px 12px; border-radius: 12px; max-width: 80%; margin-bottom: 8px; ' + styleStr + '">' + html + '</div>';
        $messages.append(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        $messages.scrollTop($messages[0].scrollHeight);
    }
}

// =======================================================
// 8. MAIN INITIALIZATION (Hàm chạy chính)
// =======================================================
$(document).ready(function () {
    console.log("🚀 App Initialized");

    // 1. Khởi tạo Sidebar (Chạy mọi trang)
    initSidebar();

    // 2. Khởi tạo Chatbox (Chạy mọi trang)
    initChatboxSystem();

    // 3. Route-based Init (Chỉ chạy ở trang tương ứng)
    const path = window.location.pathname;

    if (path.includes('customers') || path.includes('report-customers')) {
        initCustomerEnglish();
    } 
    else if (path.includes('overview') || path.includes('dashboard')) {
        initOverviewChartsFromFile();
    }
    // else if (path.includes('profile')) {
    //     initProfilePage(); // (Nếu bạn đã sửa hàm này tương thích)
    // }
});