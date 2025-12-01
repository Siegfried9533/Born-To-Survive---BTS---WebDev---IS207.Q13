// =======================================================
// TOP-STORES (Dữ liệu từ API Laravel)
// =======================================================
console.log("🔧 top-stores.js file đã được load");
console.log("$ jQuery available?", typeof $ !== 'undefined' ? "✅ Có" : "❌ Không");

// Wait for jQuery (poll) before initializing to avoid race conditions
(function waitForjQueryAndInit() {
  const maxAttempts = 25; // try for ~5 seconds (25 * 200ms)
  let attempts = 0;

  function tryInit() {
    if (typeof $ !== "undefined") {
      try {
        initTopStores();
      } catch (err) {
        console.error('Error initializing initTopStores():', err);
      }

      if (typeof initFilterComponent === 'function') {
        try {
          initFilterComponent();
        } catch (err) {
          console.error('Error initializing initFilterComponent():', err);
        }
      }
      return;
    }

    attempts++;
    if (attempts <= maxAttempts) {
      // wait 200ms and retry
      setTimeout(tryInit, 200);
    } else {
      console.error('jQuery not found after ' + attempts + ' attempts. Skipping initialization.');
    }
  }

  tryInit();
})();

function initTopStores() {
  console.log("🚀 Bắt đầu khởi tạo Top Stores");
  $(document).ready(function () {
  console.log("📄 DOM ready - tiến hành khởi tạo bảng stores");
  
  const $tbody = $("#storesTable tbody");
  console.log("🎯 Tìm tbody element:", $tbody.length > 0 ? "✅ Tìm thấy" : "❌ Không tìm thấy");
  
  // 1. Thay đổi đường dẫn tới API Laravel của bạn
  // Route hiện có là /api/analytics/stores (routes/api.php)
  // Use window.Laravel.baseUrl when available, otherwise fall back to origin
  const baseUrl = (window.Laravel && window.Laravel.baseUrl)
    ? String(window.Laravel.baseUrl).replace(/\/+$/, '')
    : window.location.origin.replace(/\/+$/, '');
  const apiUrl = `${baseUrl}/api/analytics/stores`;
  console.log("🔗 API URL:", apiUrl);
  
  let data = [];
  // Helper: try multiple keys and return first existing value
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
  console.log("📡 Đang kết nối tới API:", apiUrl);
  
  $.get(apiUrl, function (response) {
    // API trả về format: { status: "success", data: [...] }
    console.log("✅ API Response:", response);
    
    const apiData = response.data;
    console.log("📦 Dữ liệu nhận được:", apiData);
    console.log("📊 Số lượng cửa hàng:", apiData ? apiData.length : 0);

    if (!apiData || apiData.length === 0) {
        console.warn("⚠️ Không có dữ liệu cửa hàng");
        $tbody.html(`<tr><td colspan="10" class="text-center">Chưa có dữ liệu cửa hàng</td></tr>`);
        return;
    }

    // 2. Map dữ liệu từ API sang cấu trúc của bảng cũ
    // 2. Map dữ liệu từ API sang cấu trúc của bảng cũ
    data = apiData.map(item => {
        const id = String(pick(item, ['StoreID','store_id','id','StoreId'], '') || '').trim();
        const name = String(pick(item, ['Name','name','StoreName','store_name'], '') || '').trim();
        const city = String(pick(item, ['City','city','Town','town'], '') || '').trim();
        const country = String(pick(item, ['Country','country','country_code'], 'VN') || 'VN').trim();
        const zip = String(pick(item, ['ZIPCode','zip','zip_code','postalCode'], '') || '').trim();

        const latRaw = pick(item, ['Latitude','latitude','Lat','lat'], 0);
        const lngRaw = pick(item, ['Longitude','longitude','Lng','lng'], 0);
        const lat = toNumber(latRaw, 0);
        const lng = toNumber(lngRaw, 0);

        const revenueRaw = pick(item, ['revenue','Revenue','total_revenue','totalRevenue','allCat'], 0);
        const allCat = toNumber(revenueRaw, 0);

        return {
            id: id,
            name: name || id || 'Unknown Store',
            city: city,
            country: country || 'VN',
            zip: zip,
            lat: lat,
            lng: lng,
            catSelected: 0,
            allCat: allCat
        };
    });

    // Render lần đầu
    sortAndRender(currentSort.col, currentSort.asc);

  }).fail((jqXHR, textStatus, errorThrown) => {
    // Xử lý lỗi chi tiết hơn
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

  // ============= FILTER: Call dashboard summary and re-render =============
  function buildSummaryApiUrl(selectedStores, selectedCategories) {
    const base = (window.Laravel && window.Laravel.baseUrl)
      ? String(window.Laravel.baseUrl).replace(/\/+$/, '')
      : window.location.origin.replace(/\/+$/, '');
    let url = `${base}/api/stores/dashboard/summary`;
    const params = [];
    if (selectedStores && selectedStores.length) params.push('stores=' + encodeURIComponent(selectedStores.join(',')));
    if (selectedCategories && selectedCategories.length) params.push('categories=' + encodeURIComponent(selectedCategories.join(',')));
    if (params.length) url += '?' + params.join('&');
    return url;
  }

  function fetchSummaryAndRender() {
    // determine selected stores (prefer data-store-id, then parse label 'Name - ID', then fallback to value)
    function extractStoreId($input) {
      // 1) data-store-id attribute
      const dataId = $input.data('store-id');
      if (dataId) return String(dataId).trim();

      // 2) input value looks like an ID (simple heuristic: contains digits or uppercase letters, short)
      const val = String($input.val() || '').trim();
      if (/^[A-Za-z0-9_-]{1,20}$/.test(val) && /[0-9A-Za-z]/.test(val)) return val;

      // 3) try to get associated label text and parse 'Name - ID'
      const inputId = $input.attr('id');
      let labelText = '';
      if (inputId) {
        const $lbl = $input.closest('.filter-group').find('label[for="' + inputId + '"]');
        if ($lbl.length) labelText = $lbl.text().trim();
      }
      if (!labelText) {
        const $lbl2 = $input.next('label');
        if ($lbl2.length) labelText = $lbl2.text().trim();
      }
      if (labelText) {
        const parts = labelText.split('-').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const possibleId = parts[parts.length - 1];
          if (/^[A-Za-z0-9_-]{1,30}$/.test(possibleId)) return possibleId;
        }
      }

      // 4) last resort: return the raw value
      return val;
    }

    let selectedStores = [];
    const $storesGroup = $(".filter-group").filter(function () {
      const label = $(this).find('.filter-label').text() || '';
      return label.toLowerCase().indexOf('stores') !== -1;
    }).first();
    const $storeInputs = ($storesGroup.length ? $storesGroup : $(".filter-group").not('#category-filter-group').first()).find('input[type=checkbox]:checked');
    selectedStores = $storeInputs.map(function(){ return extractStoreId($(this)); }).get().filter(Boolean);

    // categories (category group has id 'category-filter-group')
    const selectedCategories = $('#category-filter-group').find('input[type=checkbox]:checked').map(function(){ return $(this).val(); }).get();

    const url = buildSummaryApiUrl(selectedStores, selectedCategories);
    console.log('📡 Fetching dashboard summary:', url);

    $tbody.html(`<tr><td colspan="10" class="text-center">Đang tải dữ liệu...</td></tr>`);

    $.ajax({ url: url, method: 'GET', dataType: 'json', timeout: 10000 })
      .done(function(resp){
        if (!resp || resp.status !== 'success') {
          console.warn('⚠️ Không nhận được dữ liệu hợp lệ từ summary API', resp);
          $tbody.html(`<tr><td colspan="10" class="text-center">Không có dữ liệu</td></tr>`);
          return;
        }

        // resp.stores: [{ store: {...}, categories: [{Category, revenue}, ...] }, ...]
        const storesResp = resp.stores || [];

        data = storesResp.map(item => {
          const s = item.store || {};
          const id = String(pick(s, ['StoreID','store_id','id','StoreId'], '') || '').trim();
          const name = String(pick(s, ['Name','name','StoreName','store_name'], '') || '').trim() || id || 'Unknown Store';
          const city = String(pick(s, ['City','city','Town','town'], '') || '').trim();
          const country = String(pick(s, ['Country','country','country_code'], 'VN') || 'VN').trim();
          const zip = String(pick(s, ['ZIPCode','zip','zip_code','postalCode'], '') || '').trim();
          const lat = toNumber(pick(s, ['Latitude','latitude','Lat','lat'], 0), 0);
          const lng = toNumber(pick(s, ['Longitude','longitude','Lng','lng'], 0), 0);

          // sum revenue for selected categories (if provided) otherwise sum all returned categories
          const cats = item.categories || [];
          const catSelectedSum = cats.reduce((acc, c) => acc + toNumber(c.revenue || c.delta_gmv || c.revenue_amount || 0, 0), 0);
          // allCat: try store-level field first, otherwise fallback to sum
          const allCatVal = toNumber(pick(s, ['allCat','total_revenue','revenue','Revenue'], null), null);
          const allCat = (allCatVal === null) ? catSelectedSum : allCatVal;

          return {
            id: id,
            name: name,
            city: city,
            country: country,
            zip: zip,
            lat: lat,
            lng: lng,
            catSelected: catSelectedSum,
            allCat: allCat
          };
        });

        // re-sort and render
        sortAndRender(currentSort.col, currentSort.asc);
      })
      .fail(function(jqXHR, textStatus, errorThrown){
        console.error('❌ Summary API error', jqXHR.status, textStatus, errorThrown);
        $tbody.html(`<tr><td colspan="10" class="text-center text-danger">Lỗi khi tải dữ liệu (${jqXHR.status})</td></tr>`);
      });
  }

  // Bind apply button
  $('.btn-apply-filters').off('click.topStores').on('click.topStores', function(e){
    e.preventDefault();
    fetchSummaryAndRender();
  });
  });
}
