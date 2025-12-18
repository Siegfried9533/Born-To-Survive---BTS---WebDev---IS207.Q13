import $ from 'jquery';

// =======================================================
// TOP-STORES (Dữ liệu từ API Laravel)
// =======================================================
console.log("🔧 top-stores.js file đã được load");

// $(document).ready(function() {
//   initTopStores();
// });

function initTopStores() {
  console.log("🚀 Bắt đầu khởi tạo Top Stores");
  console.log("📄 DOM ready - tiến hành khởi tạo bảng stores");

  // Hỗ trợ render vào #storesTable hoặc #topStoresTable — chọn tbody tồn tại đầu tiên
  let $tbody = $("#storesTable tbody");
  if (!$tbody.length) {
    $tbody = $("#topStoresTable tbody");
  }

  const hasTopStoresTable = $("#topStoresTable").length > 0;
  const hasStoresTable = $("#storesTable").length > 0;

  console.log("🎯 Tìm #topStoresTable:", hasTopStoresTable ? "✅ Tìm thấy" : "❌ Không tìm thấy");
  console.log("🎯 Tìm #storesTable:", hasStoresTable ? "✅ Tìm thấy" : "❌ Không tìm thấy");

  if (!$tbody.length) {
    console.warn("Không tìm thấy tbody cho #storesTable hoặc #topStoresTable — API vẫn sẽ được gọi nhưng không có nơi để render.");
  }
  
  // 1. Thay đổi đường dẫn tới API Laravel của bạn
  // Route hiện có là /api/analytics/stores (routes/api.php)
  // Use window.Laravel.baseUrl when available, otherwise fall back to origin
  const baseUrl = (window.Laravel && window.Laravel.baseUrl)
    ? String(window.Laravel.baseUrl).replace(/\/+$/, '')
    : window.location.origin.replace(/\/+$/, '');
  const apiUrl = `${baseUrl}/api/analytics/stores`;
  console.log("🔗 API URL:", apiUrl);
  
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
  // Hàm lấy dữ liệu từ API và render bảng — có thể truyền params từ filter
  function fetchAndRender(params = {}) {
    console.log("📡 Gọi API stores với params:", params);
    $.get(apiUrl, params, function (response) {
      console.log("✅ API Response:", response);
      const apiData = response.data;
      console.log("📦 Dữ liệu nhận được:", apiData);
      console.log("📊 Số lượng cửa hàng:", apiData ? apiData.length : 0);

      if (!apiData || apiData.length === 0) {
          console.warn("⚠️ Không có dữ liệu cửa hàng");
          $tbody.html(`<tr><td colspan="10" class="text-center">Chưa có dữ liệu cửa hàng</td></tr>`);
          return;
      }

      // Helpers
      function pick(obj, keys, fallback) {
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (obj == null) break;
          if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== null && obj[k] !== undefined) return obj[k];
        }
        return fallback;
      }

      function toNumber(v, fallback = 0) {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return isNaN(n) ? fallback : n;
      }

        data = apiData.map(item => {
          const id = String(pick(item, ['StoreID','store_id','id','StoreId'], '') || '').trim();
          const name = String(pick(item, ['Name','name','StoreName','store_name'], '') || '').trim();
          const city = String(pick(item, ['City','city','Town','town'], '') || '').trim();
          const country = String(pick(item, ['Country','country','country_code'], 'VN') || 'VN').trim();
          const zip = String(pick(item, ['ZIPCode','zip','ZipCode','postalCode'], '') || '').trim();

          const latRaw = pick(item, ['Latitude','latitude','Lat','lat'], 0);
          const lngRaw = pick(item, ['Longitude','longitude','Lng','lng'], 0);
          const lat = toNumber(latRaw, 0);
          const lng = toNumber(lngRaw, 0);

          const revenueRaw = pick(item, ['revenue','Revenue','total_revenue','totalRevenue','allCat'], 0);
          const allCat = toNumber(revenueRaw, 0);

          // catSelected: doanh thu cho các category được chọn (Server trả về field catSelected)
          const catSelectedRaw = pick(item, ['catSelected','cat_selected','categories_selected','selected_revenue'], 0);
          const catSelected = toNumber(catSelectedRaw, 0);

          return {
              id: id,
              name: name || id || 'Unknown Store',
              city: city,
              country: country || 'VN',
              zip: zip,
              lat: lat,
              lng: lng,
              catSelected: catSelected,
              allCat: allCat
          };
      });

      // Render
      sortAndRender(currentSort.col, currentSort.asc);

    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error("❌ Lỗi kết nối API:");
      console.error("   Status:", jqXHR.status);
      console.error("   Status Text:", jqXHR.statusText);
      console.error("   Text Status:", textStatus);
      console.error("   Error Thrown:", errorThrown);
      console.error("   Response Text:", jqXHR.responseText);
      console.error("   URL được gọi:", apiUrl);
      
      $tbody.html(
        `<tr><td colspan="10" class="text-center text-danger">
          ❌ Lỗi kết nối API (${jqXHR.status} ${jqXHR.statusText})<br>
          <small>${textStatus}: ${errorThrown}</small><br>
          <small>URL: ${apiUrl}</small><br>
          <small>Kiểm tra console để xem chi tiết lỗi</small>
        </td></tr>`
      );
    });
  }

  // Gọi lần đầu không có params
  fetchAndRender();

  // Lắng nghe filter events từ filter-component và gọi lại fetch với params
  $(document).on('filters:applied', function (e, filters) {
    console.log('filters:applied received in top-stores.js', filters);
    const params = {};
    if (filters.categories && filters.categories.length) params.category = filters.categories.join(',');
    if (filters.stores && filters.stores.length) params.stores = filters.stores.join(',');
    if (filters.sort) params.sort = filters.sort;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    fetchAndRender(params);
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

    // Re-select tbody in case DOM changed and ensure we clear previous rows
    let $targetTbody = $("#storesTable tbody");
    if (!$targetTbody.length) $targetTbody = $("#topStoresTable tbody");
    if (!$targetTbody.length) {
      console.warn('No tbody found to render stores table.');
      return;
    }

    // Clear existing rows before rendering new ones
    $targetTbody.empty();

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
      $targetTbody.append(row);
    });

    // Cập nhật mũi tên sort
    // Update sort arrow for whichever table exists
    if ($("#storesTable").length) {
      $("#storesTable thead th .sort-arrow").text("");
      $(`#storesTable thead th[data-col="${column}"] .sort-arrow`).text(asc ? "▲" : "▼");
    }
    if ($("#topStoresTable").length) {
      $("#topStoresTable thead th .sort-arrow").text("");
      $(`#topStoresTable thead th[data-col="${column}"] .sort-arrow`).text(asc ? "▲" : "▼");
    }
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
}


// Gọi khi DOM sẵn sàng
$(document).ready(() => initTopStores());