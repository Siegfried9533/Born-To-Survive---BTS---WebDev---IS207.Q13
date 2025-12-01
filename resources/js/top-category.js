/* ======================================================= */
/* TOP CATEGORY    */
/* ======================================================= */
console.log("🔧 top-category.js file đã được load");
function initTopCategory() {
  if ($("#topCategoryTable").length === 0) return;

  // Lấy dữ liệu từ API categories
  const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
  const apiUrl = `${baseUrl}/api/products/categories`;
  console.log("🔗 Lấy dữ liệu Top Category từ API:", apiUrl);
  $.get(apiUrl, function (response) {
    console.log("✅ API categories response:", response);
    const items = response && response.data ? response.data : (Array.isArray(response) ? response : []);
    const $tbody = $("#topCategoryTable tbody");
    $tbody.empty();

    let data = [];
    let totalDelta = 0,
      totalInstore = 0;

    items.forEach((it, idx) => {
      // Support both object items (new API with delta_gmv/instore_gmv) and plain string array (backward compat)
      let id, name, deltaNum, instoreNum, deltaDisplay, vnGrowth, instoreDisplay;

      console.log(`📊 Category ${idx}:`, it); // Debug: in từng object

      if (typeof it === 'string' || typeof it === 'number') {
        // Simple string item -> use as name and id, no metrics available
        id = String(it);
        name = String(it);
        deltaNum = 0;
        instoreNum = 0;
        deltaDisplay = '0 pts';
        vnGrowth = '-';
        instoreDisplay = '-';
      } else if (typeof it === 'object' && it !== null) {
        // New API returns: Category, product_count, delta_gmv, instore_gmv
        id = it.Category || it.CategoryID || it.id || it.code || it.name || '';
        name = it.Category || it.CategoryName || it.Name || it.name || id;
        
        // Map delta_gmv and instore_gmv from new API, fallback to old field names
        deltaNum = Number(it.delta_gmv || it.delta || it.total_sold || it.change || 0) || 0;
        instoreNum = Number(it.instore_gmv || it.instore || it.revenue || it.value || 0) || 0;
        
        console.log(`   id=${id}, name=${name}, delta_gmv=${deltaNum}, instore_gmv=${instoreNum}`);
        
        // Format display values
        deltaDisplay = (deltaNum > 0 ? deltaNum.toLocaleString('en-US') : '0') + ' pts';
        vnGrowth = it.product_count ? `${it.product_count} products` : (it.growth || '-');
        instoreDisplay = (instoreNum > 0 ? instoreNum.toLocaleString('fr-FR') : '0') + ' €';
      } else {
        // Fallback
        id = '';
        name = '';
        deltaNum = 0;
        instoreNum = 0;
        deltaDisplay = '0 pts';
        vnGrowth = '-';
        instoreDisplay = '-';
      }

      totalDelta += (deltaNum || 0);
      totalInstore += (instoreNum || 0);

      data.push({
        rank: 0,
        id: id,
        name: name, // dùng chung cho Family / Model
        deltaGMV: deltaDisplay,
        vnGrowth: vnGrowth,
        instore: instoreDisplay,
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

      // TOTAL ROW – giống hệt Sales
      $tbody.append(`
                <tr class="table-total align-middle">
                    <td></td>
                    <td class="text-primary fw-bold">Total</td>
                    <td class="text-primary fw-bold">All Categories</td>
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(
                      1
                    )}K pts</div></td>
                    <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString(
                      "fr-FR"
                    )} €</div></td>
                </tr>
            `);

      // DATA ROWS
      data.forEach((r) => {
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
    }

    // Sort events – giống hệt Sales
    let sortState = { col: "delta", asc: false };
    function applySort(col) {
      sortState.asc = sortState.col === col ? !sortState.asc : false;
      sortState.col = col;
      sortData(col, sortState.asc);
      render();
      $("#topCategoryTable .sort-icon")
        .removeClass("fa-sort-up fa-sort-down")
        .addClass("fa-sort");
      $("#sort-" + col)
        .removeClass("fa-sort")
        .addClass(sortState.asc ? "fa-sort-up" : "fa-sort-down");
    }

    $("#sort-delta, #sort-instore")
      .off("click")
      .on("click", function () {
        applySort(this.id.split("-")[1]);
      });

    // Mặc định sort Delta giảm dần
    $("#sort-delta").removeClass("fa-sort").addClass("fa-sort-down");

    // Download CSV
    $("#downloadCategoryBtn")
      .off("click")
      .on("click", function () {
        let csv = "Rank,ID,Family,Delta GMV,VN Growth,InStore GMV\n";
        csv += `,Total,All Categories,${totalDelta.toFixed(
          1
        )}K pts,,${totalInstore.toLocaleString("fr-FR")} €\n`;
        data.forEach(
          (r) =>
            (csv += `${r.rank},${r.id},${r.name},${r.deltaGMV},${r.vnGrowth},${r.instore}\n`)
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "top-category-growth.csv";
        a.click();
        URL.revokeObjectURL(url);
      });
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error('❌ Lỗi khi gọi API categories:', textStatus, errorThrown, jqXHR && jqXHR.responseText);
    $("#topCategoryTable tbody").html(
      '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu danh mục từ API</td></tr>'
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

  // ============= FILTER: fetch categories summary with selected stores/categories =============
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

  function buildCategoriesSummaryUrl(stores, categories, dateParams = []) {
    const base = (window.Laravel && window.Laravel.baseUrl) ? String(window.Laravel.baseUrl).replace(/\/+$/, '') : window.location.origin.replace(/\/+$/, '');
    let url = `${base}/api/products/categories/summary`;
    const params = [];
    if (stores && stores.length) params.push('stores=' + encodeURIComponent(stores.join(',')));
    if (categories && categories.length) params.push('categories=' + encodeURIComponent(categories.join(',')));
    if (dateParams && dateParams.length) {
      dateParams.forEach(p => params.push(p.key + '=' + encodeURIComponent(p.value)));
    }
    if (params.length) url += '?' + params.join('&');
    return url;
  }

  function fetchCategoriesSummaryAndRender() {
    // Validate dates first
    const dateCheck = validateAndGetDateParams();
    if (!dateCheck.valid) {
      console.error('❌ Date validation failed:', dateCheck.message);
      const $tbody = $("#topCategoryTable tbody");
      $tbody.html(`<tr><td colspan="5" class="text-center text-danger">❌ ${dateCheck.message}</td></tr>`);
      return;
    }

    const sel = readSelectedFilters();
    const url = buildCategoriesSummaryUrl(sel.stores, sel.categories, dateCheck.params);
    console.log('📡 Fetching categories summary:', url);
    const $tbody = $("#topCategoryTable tbody");
    $tbody.html('<tr><td colspan="5" class="text-center py-4">Đang tải dữ liệu...</td></tr>');

    $.ajax({ url: url, method: 'GET', dataType: 'json', timeout: 10000 })
      .done(function(resp){
        if (!resp || resp.status !== 'success' || !resp.data) {
          console.warn('⚠️ Invalid categories summary response', resp);
          $tbody.html('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
          return;
        }

        const items = resp.data;
        // Reuse rendering logic by calling initTopCategory's internal renderer:
        // We'll duplicate minimal mapping & render here to avoid changing function scoping.
        let data = [];
        let totalDelta = 0, totalInstore = 0;
        items.forEach((it, idx) => {
          const id = it.Category || it.CategoryID || it.id || it.code || it.name || '';
          const name = it.Category || it.CategoryName || it.Name || it.name || id;
          const deltaNum = Number(it.delta_gmv || it.delta || it.change || 0) || 0;
          const instoreNum = Number(it.instore_gmv || it.instore || it.revenue || it.value || 0) || 0;
          totalDelta += deltaNum;
          totalInstore += instoreNum;
          data.push({ rank: 0, id: id, name: name, deltaGMV: (deltaNum>0?deltaNum.toLocaleString('en-US'):'0') + ' pts', vnGrowth: it.product_count? (it.product_count + ' products') : (it.growth|| '-'), instore: (instoreNum>0?instoreNum.toLocaleString('fr-FR'):'0') + ' €', deltaNum: deltaNum, instoreNum: instoreNum });
        });

        data.sort((a,b)=> b.deltaNum - a.deltaNum);
        data.forEach((r,i)=> r.rank = i+1);

        // render
        $tbody.empty();
        $tbody.append(`\
                <tr class="table-total align-middle">\
                    <td></td>\
                    <td class="text-primary fw-bold">Total</td>\
                    <td class="text-primary fw-bold">All Categories</td>\
                    <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(1)}K pts</div></td>\
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
        console.error('❌ Error fetching categories summary:', textStatus, errorThrown);
        $("#topCategoryTable tbody").html('<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu danh mục từ API</td></tr>');
      });
  }

  // Bind Apply Filters button to fetch categories summary
  $('.btn-apply-filters').off('click.topCategory').on('click.topCategory', function(e){
    e.preventDefault();
    fetchCategoriesSummaryAndRender();
  });
}
initTopCategory();