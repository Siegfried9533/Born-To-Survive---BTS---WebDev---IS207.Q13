// =======================================================
// TOP-STORES (Dữ liệu từ API Laravel)
// =======================================================
$(document).ready(function () {
  const $tbody = $("#storesTable tbody");
  // 1. Thay đổi đường dẫn tới API Laravel của bạn
  const apiUrl = "/api/analytics/stores"; 
  
  let data = [];
  // Mặc định sắp xếp theo Doanh thu (allCat) giảm dần
  let currentSort = { col: "allCat", asc: false };

  // ============= CSS CHO HUY CHƯƠNG (Giữ nguyên) =============
  const medalStyle = `
    <style>
      .rank-trophy { font-size: 1.5rem; line-height: 1; }
      .rank-trophy.gold i   { color: #FFD700; text-shadow: 0 0 12px rgba(255,215,0,0.7); }
      .rank-trophy.silver i { color: #C0C0C0; text-shadow: 0 0 12px rgba(192,192,192,0.7); }
      .rank-trophy.bronze i { color: #CD7F32; text-shadow: 0 0 12px rgba(205,127,50,0.7); }
      .rank-normal { 
        text-align: center; font-weight: 600; color: #495057; font-size: 1.1rem;
      }
    </style>
  `;
  $("head").append(medalStyle);

  // ============= LOAD DỮ LIỆU TỪ API =============
  $.get(apiUrl, function (response) {
    // API trả về format: { status: "success", data: [...] }
    const apiData = response.data;

    if (!apiData || apiData.length === 0) {
        $tbody.html(`<tr><td colspan="10" class="text-center">Chưa có dữ liệu cửa hàng</td></tr>`);
        return;
    }

    // 2. Map dữ liệu từ API sang cấu trúc của bảng cũ
    data = apiData.map(item => {
        return {
            id: item.StoreID,           // Từ API
            name: item.Name,            // Từ API
            city: item.City,            // Từ API
            country: item.Country || 'VN', // Nếu API thiếu thì mặc định VN
            zip: item.ZIPCode || '',    
            // Nếu API chưa trả về Lat/Lng thì để mặc định 0 để không lỗi bảng
            lat: parseFloat(item.Latitude || 0), 
            lng: parseFloat(item.Longitude || 0),
            
            // Giả sử catSelected là doanh thu lọc theo danh mục (tạm thời để 0 hoặc bằng tổng)
            catSelected: 0, 
            
            // Map doanh thu từ API vào cột allCat
            allCat: parseInt(item.revenue || 0) 
        };
    });

    // Render lần đầu
    sortAndRender(currentSort.col, currentSort.asc);

  }).fail((jqXHR) => {
    // Xử lý lỗi chi tiết hơn
    console.error("Lỗi API:", jqXHR);
    $tbody.html(
      `<tr><td colspan="10" class="text-center text-danger">
        Lỗi kết nối API (${jqXHR.status}). Hãy kiểm tra lại server Laravel.
      </td></tr>`
    );
  });

  // ============= HÀM TẠO HUY CHƯƠNG (Giữ nguyên) =============
  function getRankMedal(rank) {
    if (rank === 1) return `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`;
    if (rank === 2) return `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`;
    if (rank === 3) return `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`;
    return `<div class="rank-normal">${rank}</div>`;
  }

  // ============= SORT + RENDER (Giữ nguyên logic) =============
  function sortAndRender(column, asc) {
    // Sort dữ liệu
    data.sort((a, b) => (asc ? a[column] - b[column] : b[column] - a[column]));

    // Tính rank lại sau khi sort
    const rankedData = data.map((d, i) => ({
      ...d,
      currentRank: i + 1,
    }));

    $tbody.empty();

    rankedData.forEach((d) => {
      const rankHtml = getRankMedal(d.currentRank);

      const row = `
        <tr>
            <td class="text-center align-middle">${rankHtml}</td>
            <td class="text-center text-muted small">${d.id}</td>
            <td class="fw-semibold">${d.name}</td>
            <td>${d.city}</td>
            <td>${d.country}</td>
            <td>${d.zip}</td>
            <td>${d.lat.toFixed(6)}</td>
            <td>${d.lng.toFixed(6)}</td>
            <td class="text-end pe-4">
                <div class="value-main text-secondary small">${d.catSelected.toLocaleString("vi-VN")} ₫</div>
            </td>
            <td class="text-end pe-4">
                <div class="value-main text-success fw-bold">${d.allCat.toLocaleString("vi-VN")} ₫</div>
            </td>
        </tr>
      `;
      $tbody.append(row);
    });

    // Cập nhật mũi tên sort
    $("#storesTable thead th .sort-arrow").text("");
    $(`#storesTable thead th[data-col="${column}"] .sort-arrow`).text(asc ? "▲" : "▼");
  }

  // ============= CLICK ĐỂ SORT (Giữ nguyên) =============
  $("#storesTable thead").on("click", ".sortable", function () {
    const col = $(this).data("col");
    if (currentSort.col === col) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort = { col: col, asc: false };
    }
    sortAndRender(currentSort.col, currentSort.asc);
  });
});