/* ========================================================= */
/* TOP PRODUCTS  */
/* ========================================================= */
console.log("🔧 top-stores.js file đã được load");
function initTopProducts() {
  if ($("#topProductsTable").length === 0) return;

  // Lấy dữ liệu từ API getProductAnalytics
  const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
  const apiUrl = `${baseUrl}/api/analytics/products`;
  console.log("🔗 Lấy dữ liệu Top Products từ API:", apiUrl);
  $.get(apiUrl, function (response) {
    // API trả về: { status: 'success', filters: {...}, data: [...] }
    console.log("✅ API products response:", response);
    const products = response && response.data ? response.data : [];
    const $tbody = $("#topProductsTable tbody");
    $tbody.empty();

    let data = [];
    let totalDelta = 0,
      totalInstore = 0;

    // Pagination state
    const pageSize = 10; // items per page
    let currentPage = 1;

    // Ensure there's a pagination container under the table
    const $tableWrapper = $("#topProductsTable").closest('.table-responsive');
    if ($tableWrapper.length && $("#topProductsPagination").length === 0) {
      $tableWrapper.after('<div id="topProductsPagination" class="px-3 py-2 d-flex justify-content-center align-items-center"></div>');
    }

    // Map dữ liệu API sang cấu trúc UI hiện tại
    products.forEach((p) => {
      // Controller trả: ProdID, ProductName, Category, total_sold, revenue
      const id = p.ProdID || p.prodID || p.ProdId || "";
      const name = p.ProductName || p.Description || p.Description || "-";
      const totalSold = Number(p.total_sold || 0);
      const revenue = Number(p.revenue || 0);

      // deltaNum dùng để sort theo "delta" (ở đây tạm dùng total_sold)
      const deltaNum = totalSold;
      const instoreNum = revenue;

      totalDelta += deltaNum;
      totalInstore += instoreNum;

      data.push({
        rank: 0,
        id: id,
        name: name,
        // Hiển thị: deltaGMV as sold qty, vnGrowth as placeholder
        deltaGMV: `${totalSold} units`,
        vnGrowth: "-",
        instore: `${revenue.toLocaleString('fr-FR')} €`,
        deltaNum: deltaNum,
        instoreNum: instoreNum,
      });
    });

    sortData("delta", false);
    render();

    function sortData(col, asc) {
      data.sort((a, b) =>
        asc ? a[col + "Num"] - b[col + "Num"] : b[col + "Num"] - a[col + "Num"]
      );
      data.forEach((r, i) => (r.rank = i + 1));
    }

    function render() {
      $tbody.empty();

      // Total row (always show totals for all products)
      $tbody.append(`
                <tr class="table-total align-middle">
                    <td></td>
                    <td class="text-primary fw-bold">Total</td>
                    <td class="text-primary fw-bold">All Products</td>
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(2)} pts</div></td>
                    <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString("fr-FR")} €</div></td>
                </tr>
            `);

      // Pagination: calculate slice to render
      const totalItems = data.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = data.slice(start, end);

      pageItems.forEach((r) => {
        const rankCell =
          r.rank === 1
            ? `<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>`
            : r.rank === 2
            ? `<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>`
            : r.rank === 3
            ? `<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>`
            : `<div class="rank-normal">${r.rank}</div>`;

        const deltaClass = r.deltaNum > 0 ? "text-success" : "text-danger";

        $tbody.append(`
                    <tr class="align-middle">
                        <td class="text-center">${rankCell}</td>
                        <td class="text-muted fw-medium">${r.id}</td>
                        <td class="item-name">${r.name}</td>
                        <td class="text-end pe-4"><div class="value-main ${deltaClass}">${r.deltaGMV}</div></td>
                        <td class="text-end pe-4"><div class="value-main text-primary">${r.instore}</div></td>
                    </tr>
                `);
      });

      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      const $p = $("#topProductsPagination");
      if ($p.length === 0) return;
      $p.empty();

      // Prev button
      const $prev = $(`<button class="btn btn-sm btn-outline-secondary me-2" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`);
      $prev.on('click', () => {
        if (currentPage > 1) {
          currentPage -= 1;
          render();
        }
      });
      $p.append($prev);

      // Page numbers (show up to 7 numeric buttons with sliding window)
      const maxButtons = 7;
      let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      let endPage = startPage + maxButtons - 1;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const $btn = $(`<button class="btn btn-sm me-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}">${i}</button>`);
        $btn.on('click', () => {
          currentPage = i;
          render();
        });
        $p.append($btn);
      }

      // Next button
      const $next = $(`<button class="btn btn-sm btn-outline-secondary ms-2" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
      $next.on('click', () => {
        if (currentPage < totalPages) {
          currentPage += 1;
          render();
        }
      });
      $p.append($next);
    }

    // Sort – giống hệt Category
    let sortState = { col: "delta", asc: false };
    function applySort(col) {
      sortState.asc = sortState.col === col ? !sortState.asc : false;
      sortState.col = col;
      sortData(col, sortState.asc);
      render();
      $("#topProductsTable .sort-icon")
        .removeClass("fa-sort-up fa-sort-down")
        .addClass("fa-sort");
      $("#topProductsTable #sort-" + col)
        .removeClass("fa-sort")
        .addClass(sortState.asc ? "fa-sort-up" : "fa-sort-down");
    }

    $("#topProductsTable").on(
      "click",
      "#sort-delta, #sort-instore",
      function () {
        applySort(this.id.split("-")[1]);
      }
    );

    $("#topProductsTable #sort-delta")
      .removeClass("fa-sort")
      .addClass("fa-sort-down");

    // Download CSV
    $("#downloadProductBtn")
      .off("click")
      .on("click", function () {
        let csv = "Rank,ID,Model,Delta GMV,VN Growth,InStore GMV\n";
        csv += `,Total,All Products,${totalDelta.toFixed(
          2
        )} pts,,${totalInstore.toLocaleString("fr-FR")} €\n`;
        data.forEach(
          (r) =>
            (csv += `${r.rank},${r.id},${r.name},${r.deltaGMV},${r.vnGrowth},${r.instore}\n`)
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "top-products-growth.csv";
        a.click();
        URL.revokeObjectURL(url);
      });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error('❌ Lỗi khi gọi API products:', textStatus, errorThrown, jqXHR && jqXHR.responseText);
    $("#topProductsTable tbody").html(
      '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu sản phẩm từ API</td></tr>'
    );
  });

  // ============= HELPER: Validate and extract date params from header =============
  function validateAndGetDateParams() {
    const startDateHidden = document.getElementById('startDate');
    const endDateHidden = document.getElementById('endDate');
    
    if (!startDateHidden || !endDateHidden) {
      console.warn('⚠️ Date inputs not found in header');
      return { valid: false, message: 'Không tìm thấy trường ngày trong header', params: [] };
    }

    const startVal = (startDateHidden.value || '').trim();
    const endVal = (endDateHidden.value || '').trim();

    // If both empty, allow (no date filter)
    if (!startVal && !endVal) {
      console.log('✅ No date filter applied');
      return { valid: true, message: '', params: [] };
    }

    // If one is empty, error
    if (!startVal || !endVal) {
      const msg = !startVal ? 'Vui lòng chọn ngày bắt đầu' : 'Vui lòng chọn ngày kết thúc';
      console.warn('⚠️ ' + msg);
      return { valid: false, message: msg, params: [] };
    }

    // Parse dates in DD-MM-YYYY format (stored in hidden inputs)
    const startParts = startVal.split('-');
    const endParts = endVal.split('-');
    
    if (startParts.length !== 3 || endParts.length !== 3) {
      console.warn('⚠️ Invalid date format');
      return { valid: false, message: 'Định dạng ngày không hợp lệ', params: [] };
    }

    const startDate = new Date(startParts[2], startParts[1] - 1, startParts[0]); // YYYY, MM-1, DD
    const endDate = new Date(endParts[2], endParts[1] - 1, endParts[0]);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('⚠️ Invalid date values');
      return { valid: false, message: 'Giá trị ngày không hợp lệ', params: [] };
    }

    // Check if startDate <= endDate
    if (startDate > endDate) {
      console.warn('⚠️ Start date is after end date');
      return { valid: false, message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', params: [] };
    }

    console.log('✅ Date range valid:', { startDate, endDate });
    
    // Return as YYYY-MM-DD format for API
    const startFormatted = `${startParts[2]}-${startParts[1]}-${startParts[0]}`;
    const endFormatted = `${endParts[2]}-${endParts[1]}-${endParts[0]}`;
    
    return {
      valid: true,
      message: '',
      params: [
        { key: 'from_date', value: startFormatted },
        { key: 'to_date', value: endFormatted }
      ]
    };
  }

  // ============= FILTER: fetch products summary with selected stores/categories =============
  function extractStoreIdFromInput($input) {
    const dataId = $input.data('store-id');
    if (dataId) return String(dataId).trim();
    const val = String($input.val() || '').trim();
    if (/^[A-Za-z0-9_-]{1,20}$/.test(val) && /[0-9A-Za-z]/.test(val)) return val;
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
    return val;
  }

  function readSelectedFilters() {
    // stores
    let selectedStores = [];
    const $storesGroup = $(".filter-group").filter(function () {
      const label = $(this).find('.filter-label').text() || '';
      return label.toLowerCase().indexOf('store') !== -1;
    }).first();
    const $storeInputs = ($storesGroup.length ? $storesGroup : $(".filter-group").not('#category-filter-group').first()).find('input[type=checkbox]:checked');
    selectedStores = $storeInputs.map(function(){ return extractStoreIdFromInput($(this)); }).get().filter(Boolean);

    // categories
    const selectedCategories = $('#category-filter-group').find('input[type=checkbox]:checked').map(function(){ return $(this).val(); }).get().filter(Boolean);

    return { stores: selectedStores, categories: selectedCategories };
  }

  function buildProductsSummaryUrl(stores, categories, dateParams = []) {
    const base = (window.Laravel && window.Laravel.baseUrl) ? String(window.Laravel.baseUrl).replace(/\/+$/, '') : window.location.origin.replace(/\/+$/, '');
    let url = `${base}/api/products/product/summary`;
    const params = [];
    if (stores && stores.length) params.push('stores=' + encodeURIComponent(stores.join(',')));
    if (categories && categories.length) params.push('categories=' + encodeURIComponent(categories.join(',')));
    if (dateParams && dateParams.length) {
      dateParams.forEach(p => params.push(p.key + '=' + encodeURIComponent(p.value)));
    }
    if (params.length) url += '?' + params.join('&');
    return url;
  }

  function fetchProductsSummaryAndRender() {
    // Validate dates first
    const dateCheck = validateAndGetDateParams();
    if (!dateCheck.valid) {
      console.error('❌ Date validation failed:', dateCheck.message);
      const $tbody = $("#topProductsTable tbody");
      $tbody.html(`<tr><td colspan="5" class="text-center text-danger">❌ ${dateCheck.message}</td></tr>`);
      return;
    }

    const sel = readSelectedFilters();
    const url = buildProductsSummaryUrl(sel.stores, sel.categories, dateCheck.params);
    console.log('📡 Fetching products summary:', url);
    const $tbody = $("#topProductsTable tbody");
    $tbody.html('<tr><td colspan="5" class="text-center py-4">Đang tải dữ liệu...</td></tr>');

    $.ajax({ url: url, method: 'GET', dataType: 'json', timeout: 10000 })
      .done(function(resp){
        if (!resp || resp.status !== 'success' || !resp.data) {
          console.warn('⚠️ Invalid products summary response', resp);
          $tbody.html('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
          return;
        }

        const products = resp.data;
        let data = [];
        let totalDelta = 0, totalInstore = 0;
        
        products.forEach((p) => {
          const id = p.ProdID || p.prodID || p.ProdId || "";
          const name = p.ProductName || p.Description || "-";
          const totalSold = Number(p.total_sold || 0);
          const revenue = Number(p.revenue || 0);
          totalDelta += totalSold;
          totalInstore += revenue;
          data.push({
            rank: 0,
            id: id,
            name: name,
            deltaGMV: `${totalSold} units`,
            vnGrowth: "-",
            instore: `${revenue.toLocaleString('fr-FR')} €`,
            deltaNum: totalSold,
            instoreNum: revenue,
          });
        });

        data.sort((a,b)=> b.deltaNum - a.deltaNum);
        data.forEach((r,i)=> r.rank = i+1);

        // render
        $tbody.empty();
        $tbody.append(`\
                <tr class="table-total align-middle">\
                    <td></td>\
                    <td class="text-primary fw-bold">Total</td>\
                    <td class="text-primary fw-bold">All Products</td>\
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(2)} pts</div></td>\
                    <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString("fr-FR")} €</div></td>\
                </tr>\
            `);

        data.forEach((r)=>{
          const rankCell = r.rank===1?'<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>':(r.rank===2?'<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>':(r.rank===3?'<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>':`<div class="rank-normal">${r.rank}</div>`));
          const deltaClass = r.deltaNum > 0 ? 'text-success' : 'text-danger';
          $tbody.append(`\
                    <tr class="align-middle">\
                        <td class="text-center">${rankCell}</td>\
                        <td class="text-muted fw-medium">${r.id}</td>\
                        <td class="item-name">${r.name}</td>\
                        <td class="text-end pe-4"><div class="value-main ${deltaClass}">${r.deltaGMV}</div></td>\
                        <td class="text-end pe-4"><div class="value-main text-primary">${r.instore}</div></td>\
                    </tr>\
                `);
        });
      })
      .fail(function(jqXHR, textStatus, errorThrown){
        console.error('❌ Error fetching products summary:', textStatus, errorThrown);
        $("#topProductsTable tbody").html('<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu sản phẩm từ API</td></tr>');
      });
  }

  // Bind Apply Filters button to fetch products summary
  $('.btn-apply-filters').off('click.topProducts').on('click.topProducts', function(e){
    e.preventDefault();
    fetchProductsSummaryAndRender();
  });
}

// GỌI KHI LOAD TRANG
$(document).ready(function () {
  initTopProducts();
});