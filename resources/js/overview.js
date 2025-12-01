
/* ======================================================= */
/* OVERVIEW: GỌI API /api/dashboard/overview → VẼ BIỂU ĐỒ */
/* ======================================================= */
function initOverviewChartsFromApi() {
  if (!document.getElementById("gmvEvolutionChart")) return;

  const baseUrl = window.Laravel && window.Laravel.baseUrl ? window.Laravel.baseUrl : "";

  $.get(`${baseUrl}/api/dashboard/overview`, function (response) {
    if (!response) {
      console.error("API /api/dashboard/overview trả về rỗng.");
      return;
    }

    // Vẽ 3 biểu đồ với dữ liệu từ API
    if (response.GMV_Evolution) {
      renderGMVEvolution(response.GMV_Evolution);
    }

    if (response.Modalab_Synthesis) {
      renderModalabSynthesis(response.Modalab_Synthesis);
    }

    if (response.Sales_Channels) {
      renderSalesChannels(response.Sales_Channels);
    }
  }).fail(function (xhr, status, error) {
    console.error("Lỗi khi gọi API /api/dashboard/overview:", status, error);
    alert("Không thể tải dữ liệu tổng quan từ server. Vui lòng thử lại sau.");
  });
}
  
  // === 1. GMV Evolution (Line on top of Bar) ===
  function renderGMVEvolution(data) {
    const ctx = document.getElementById("gmvEvolutionChart").getContext("2d");

    // Hỗ trợ cả dạng mảng (từ API) lẫn chuỗi (nếu sau này vẫn dùng text)
    const labels = Array.isArray(data.labels)
      ? data.labels
      : String(data.labels || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

    const gmv = Array.isArray(data.gmv)
      ? data.gmv.map(Number)
      : String(data.gmv || "")
          .split(",")
          .map((v) => Number(v));

    const growth = Array.isArray(data.growth)
      ? data.growth.map(Number)
      : String(data.growth || "")
          .split(",")
          .map((v) => Number(v));
  
    new Chart(ctx, {
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
            barThickness: 18,
            order: 2, // Cột ở dưới
          },
          {
            type: "line",
            label: "Growth",
            data: growth,
            borderColor: "#f6ad55",
            backgroundColor: "#f6ad55",
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "#f6ad55",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            yAxisID: "y1",
            order: 1, // Đường ở trên
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: function (context) {
                if (context.dataset.label === "GMV") {
                  return `GMV: €${(context.parsed.y / 1000000).toFixed(1)}M`;
                } else {
                  return `Growth: ${context.parsed.y.toFixed(1)}%`;
                }
              },
            },
          },
        },
        scales: {
          y: {
            ticks: { callback: (v) => `€${(v / 1000000).toFixed(1)}M` },
            grid: { color: "#e5e7eb" },
          },
          y1: {
            position: "right",
            ticks: { callback: (v) => `${v}%` },
            grid: { drawOnChartArea: false },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }
  
  // === 2. Modalab Synthesis ===
  function renderModalabSynthesis(data) {
    const ctx = document.getElementById("modalabChart").getContext("2d");

    const labels = Array.isArray(data.labels)
      ? data.labels
      : String(data.labels || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

    const values = Array.isArray(data.values)
      ? data.values.map(Number)
      : String(data.values || "")
          .split(",")
          .map((v) => Number(v));
  
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: "#647acb",
            borderRadius: 6,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.parsed.x}%`;
              },
            },
          },
        },
        scales: {
          x: {
            max: 100,
            ticks: {
              stepSize: 10,
              callback: (v) => `${v}%`,
            },
          },
          y: { grid: { display: false } },
        },
      },
    });
  }
  
  // === 3. Sales Channels (Percentage of Products Sold) ===
  function renderSalesChannels(data) {
    const ctx = document.getElementById("salesChannelsChart").getContext("2d");

    const labels = Array.isArray(data.labels)
      ? data.labels
      : String(data.labels || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

    const values = Array.isArray(data.values)
      ? data.values.map(Number)
      : String(data.values || "")
          .split(",")
          .map((v) => Number(v));

    const colors = Array.isArray(data.colors)
      ? data.colors
      : String(data.colors || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
  
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 4,
            borderColor: "#fff",
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "right",
            align: "center",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 11.5, family: "Roboto" },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${percentage}%`;
              },
            },
          },
        },
      },
    });
  }
  
  // Cấu hình tooltip toàn cục (có thể override từng biểu đồ)
  Chart.defaults.plugins.tooltip.backgroundColor = "rgba(0, 0, 0, 0.85)";
  Chart.defaults.plugins.tooltip.titleColor = "#fff";
  Chart.defaults.plugins.tooltip.bodyColor = "#fff";
  Chart.defaults.plugins.tooltip.borderColor = "#402dbaff";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleFont = {
    size: 13,
    family: "Roboto",
    weight: "600",
  };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12, family: "Roboto" };
  
  /* GỌI KHI TRANG OVERVIEW */
  $(document).ready(function () {
    if (window.location.pathname.includes("overview")) {
      initOverviewChartsFromApi();
    }
  });
  