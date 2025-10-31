// === Dữ liệu giả định và khởi tạo màu ===
const primaryColor = "#4FD1C5";
const primaryHover = "#38B2AC";
const mutedColor = "#A0AEC0";
const darkColor = "#2D3748";

const cardIds = [
  "#dailyRevenueCard",
  "#ordersOverviewCard",
  "#newCustomersCard",
  "#grossProfitMarginCard",
  "#employeeProductivityCard",
  "#turnoverChartCard",
  "#salesChartCard",
  "#financialChartCard",
  "#kpiCard",
];

// =======================================================
// Hàm Tải Dữ liệu và Khởi tạo Biểu đồ (Mô phỏng API call)
// =======================================================
function loadDashboardContent() {
  // === 1. PRODUCT INVENTORY TURNOVER (Doughnut Chart) ===
  const turnoverCtx = document.getElementById("turnoverChart");
  if (turnoverCtx) {
    new Chart(turnoverCtx, {
      type: "doughnut",
      data: {
        labels: [
          "Popular Products",
          "Medium Products",
          "Low Products",
          "Others",
        ],
        datasets: [
          {
            label: "Turnover Rate",
            data: [45, 25, 20, 10],
            backgroundColor: [primaryColor, primaryHover, "#647ACB", "#F6AD55"],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed !== null) {
                  label += context.parsed + "%";
                }
                return label;
              },
            },
          },
        },
        cutout: "75%",
        maintainAspectRatio: false,
        aspectRatio: 1,
      },
    });
  }

  // === 2. SALES LINE CHART ===
  const salesLineCtx = document.getElementById("salesLineChart");
  if (salesLineCtx) {
    new Chart(salesLineCtx, {
      type: "line",
      data: {
        labels: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
        datasets: [
          {
            label: "Sales 1",
            data: [10, 40, 20, 30, 40],
            borderColor: primaryColor,
            backgroundColor: "rgba(79, 209, 197, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointBackgroundColor: primaryColor,
          },
          {
            label: "Sales 2",
            data: [20, 30, 15, 20, 38],
            borderColor: primaryHover,
            backgroundColor: "rgba(56, 178, 172, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointBackgroundColor: primaryHover,
          },
          {
            label: "Sales 3",
            data: [30, 20, 45, 25, 42],
            borderColor: "#647ACB",
            backgroundColor: "rgba(100, 122, 203, 0.1)",
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointBackgroundColor: "#647ACB",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 20,
              color: darkColor,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: mutedColor },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          x: { ticks: { color: mutedColor }, grid: { display: false } },
        },
      },
    });
  }

  // === 3. REVENUE GROWTH (Bar Chart) ===
  const revenueGrowthCtx = document.getElementById("revenueGrowthChart");
  if (revenueGrowthCtx) {
    new Chart(revenueGrowthCtx, {
      type: "bar",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Operating Sales",
            data: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
            backgroundColor: primaryColor,
            borderRadius: 4,
          },
          {
            label: "Gross Margin",
            data: [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
            backgroundColor: primaryHover,
            borderRadius: 4,
          },
          {
            label: "Gross Profit",
            data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
            backgroundColor: "rgba(79, 209, 197, 0.5)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            stacked: false,
            ticks: { color: mutedColor },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          x: {
            stacked: false,
            ticks: { color: mutedColor },
            grid: { display: false },
          },
        },
        plugins: { legend: { position: "top", labels: { color: darkColor } } },
      },
    });
  }

  // === 4. Render Employee Productivity List ===
  const employeeData = [
    { name: "Division 1", percent: 80, color: primaryColor },
    { name: "Division 2", percent: 60, color: primaryHover },
    { name: "Division 3", percent: 75, color: "#647ACB" },
    { name: "Division 4", percent: 50, color: "#F6AD55" },
  ];
  const employeeList = $("#employee-productivity-list");
  employeeData.forEach((data) => {
    const item = `
                <div class="productivity-item">
                    <div class="d-flex justify-content-between fs-small text-muted mb-1">
                        <span>${data.name}</span>
                        <span class="text-dark fw-bold">${data.percent}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" 
                            style="width: ${data.percent}%; background-color: ${data.color} !important;" 
                            aria-valuenow="${data.percent}" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                </div>
            `;
    employeeList.append(item);
  });

  // === 5. Render Product Turnover List (Legend) ===
  const productLegendData = [
    { name: "Popular Products", color: primaryColor },
    { name: "Medium Products", color: primaryHover },
    { name: "Low Products", color: "#647ACB" },
    { name: "Other Items", color: "#F6AD55" },
  ];
  const productList = $("#product-turnover-list");
  productList.append('<div class="d-flex flex-wrap gap-3"></div>');
  productLegendData.forEach((data) => {
    const legendItem = `
                <div class="turnover-item d-flex align-items-center">
                    <span class="turnover-legend-dot" style="background-color: ${data.color}"></span>
                    ${data.name}
                </div>
            `;
    productList.find(".d-flex").append(legendItem);
  });

  // === BƯỚC CUỐI CÙNG: ẨN SKELETON ===
  // Mô phỏng độ trễ tải dữ liệu (ví dụ: 1.5 giây)
  setTimeout(() => {
    cardIds.forEach((id) => {
      $(id).removeClass("loading");
    });
    // Nếu bạn có class 'loaded' cho main content, hãy thêm nó ở đây
    $(".main-content").addClass("loaded");
  }, 2000);
}

// Bắt đầu tải nội dung dashboard
loadDashboardContent();

// =======================================================
// SIDEBAR INTERACTIVE LOGIC (Active + Hover + Submenu)
// =======================================================
(function () {
  // Chờ DOM sẵn sàng và sidebar tồn tại
  function initSidebar() {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) return; // Sidebar chưa load

    const menuItems = sidebar.querySelectorAll(".menu-item");
    if (!menuItems.length) return;

    menuItems.forEach((item) => {
      const link = item.querySelector(".menu-link");

      // CLICK: xử lý active + submenu
      link.addEventListener("click", function (e) {
        // Menu không có submenu → vẫn cho phép chuyển trang (nếu có href thật)
        if (!item.classList.contains("has-submenu")) {
          // e.preventDefault(); // Bỏ nếu bạn muốn link thật hoạt động
        }

        // 1. XÓA active + HOVER INLINE của tất cả menu
        menuItems.forEach((mi) => {
          mi.classList.remove("active");

          // XÓA HOVER INLINE (do mouseenter/leave tạo ra)
          const ml = mi.querySelector(".menu-link");
          ml.style.backgroundColor = "";
          ml.style.color = "";
          ml.style.boxShadow = "";
          mi.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
            (icon) => {
              icon.style.color = "";
            }
          );
        });

        // 2. THÊM active cho menu được click
        item.classList.add("active");

        // 3. XỬ LÝ SUBMENU (nếu có)
        if (item.classList.contains("has-submenu")) {
          e.preventDefault();

          const submenu = item.querySelector(".submenu");
          const isOpen = submenu.classList.contains("open");

          // 1. ĐÓNG TẤT CẢ submenu KHÁC
          document.querySelectorAll(".has-submenu .submenu").forEach((s) => {
            s.classList.remove("open");
          });
          document.querySelectorAll(".has-submenu .menu-link").forEach((l) => {
            l.classList.add("collapsed");
          });

          // 2. MỞ/ĐÓNG submenu HIỆN TẠI
          if (!isOpen) {
            link.classList.remove("collapsed");
            submenu.classList.add("open");
          } else {
            link.classList.add("collapsed");
            submenu.classList.remove("open");
          }
        }
      });
    });

    // HOVER: chỉ áp dụng khi KHÔNG active
    menuItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        if (!this.classList.contains("active")) {
          const ml = this.querySelector(".menu-link");
          ml.style.backgroundColor = "var(--primary)";
          ml.style.color = "var(--white)";
          ml.style.boxShadow = "0 4px 6px rgba(79, 209, 197, 0.3)";
          this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
            (icon) => {
              icon.style.color = "var(--white)";
            }
          );
        }
      });

      item.addEventListener("mouseleave", function () {
        if (!this.classList.contains("active")) {
          const ml = this.querySelector(".menu-link");
          ml.style.backgroundColor = "";
          ml.style.color = "";
          ml.style.boxShadow = "";
          this.querySelectorAll(".menu-icon-bg i, .toggle-icon").forEach(
            (icon) => {
              icon.style.color = "";
            }
          );
        }
      });
    });
  }

  // CHẠY KHI DOM SẴN SÀNG
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSidebar);
  } else {
    initSidebar();
  }

  // TỰ ĐỘNG CHẠY LẠI nếu sidebar được load bằng AJAX/fetch
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length && document.querySelector("#sidebar")) {
        initSidebar();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
