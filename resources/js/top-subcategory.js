import $ from 'jquery';

/* ======================================================= */
/* TOP SubCategory                                        */
/* ======================================================= */
console.log("🔧 top-SubCategory.js file đã được load");
function initTopSubCategory() {
  if ($("#topSubCategoryTable").length === 0) return;

  const baseUrl = window.Laravel && window.Laravel.baseUrl ? window.Laravel.baseUrl : window.location.origin;
  const apiUrl = `${baseUrl}/api/products/subcategories`;
  const $tbody = $("#topSubCategoryTable tbody");

  // Shared state
  let data = [];
  let totalDelta = 0, totalInstore = 0;
  let sortState = { col: "delta", asc: false };

  function fetchAndRender(params = {}) {
    $tbody.empty();
    $tbody.append('<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>');

    $.get(apiUrl, params, function (response) {
      const items = response && response.data ? response.data : (Array.isArray(response) ? response : []);
      $tbody.empty();
      console.log("API subcategories response:", response);
      data = [];
      totalDelta = 0;
      totalInstore = 0;

      items.forEach((it) => {
        let id = '';
        let name = '';
        let deltaNum = 0;
        let instoreNum = 0;

        if (typeof it === 'string' || typeof it === 'number') {
          id = String(it);
          name = id;
        } else if (it && typeof it === 'object') {
          id = it.SubCategory || it.SubCategoryID || it.id || '';
          name = it.SubCategory || it.SubCategoryName || it.Name || id;
          deltaNum = Number(it.delta_gmv || it.delta || it.total_revenue || 0) || 0;
          instoreNum = Number(it.instore_gmv || it.instore || it.revenue || 0) || 0;
        }

        totalDelta += (deltaNum || 0);
        totalInstore += (instoreNum || 0);

        data.push({
          rank: 0,
          id: id,
          name: name,
          deltaGMV: (deltaNum > 0 ? deltaNum.toLocaleString('en-US') : '0') + ' pts',
          vnGrowth: it.product_count ? `${it.product_count} products` : '-',
          instore: (instoreNum > 0 ? instoreNum.toLocaleString('fr-FR') : '0') + ' €',
          deltaNum: deltaNum,
          instoreNum: instoreNum
        });
      });

      sortData(sortState.col, sortState.asc);
      render();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('❌ Lỗi khi gọi API subcategories:', textStatus, errorThrown, jqXHR && jqXHR.responseText);
      $tbody.html('<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu SubCategory từ API</td></tr>');
    });
  }

  function sortData(col, asc) {
    data.sort((a, b) => asc ? a[col + 'Num'] - b[col + 'Num'] : b[col + 'Num'] - a[col + 'Num']);
    data.forEach((r, i) => (r.rank = i + 1));
  }

  function render() {
    $tbody.empty();

    $tbody.append(`
      <tr class="table-total align-middle">
        <td></td>
        <td class="text-primary fw-bold">Total</td>
        <td class="text-primary fw-bold">All SubCategories</td>
        <td class="text-end pe-4"><div class="value-main">${totalDelta.toFixed(1)} pts</div></td>
        <td class="text-end pe-4"><div class="value-main">${totalInstore.toLocaleString('fr-FR')} €</div></td>
      </tr>
    `);

    data.forEach((r) => {
      const rankCell = r.rank === 1 ? '<div class="rank-trophy gold"><i class="fas fa-medal"></i></div>' : r.rank === 2 ? '<div class="rank-trophy silver"><i class="fas fa-medal"></i></div>' : r.rank === 3 ? '<div class="rank-trophy bronze"><i class="fas fa-medal"></i></div>' : `<div class="rank-normal">${r.rank}</div>`;
      const deltaClass = r.deltaNum > 0 ? 'text-success' : 'text-danger';

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

  function applySort(col) {
    sortState.asc = sortState.col === col ? !sortState.asc : false;
    sortState.col = col;
    sortData(col, sortState.asc);
    render();
    $("#topSubCategoryTable .sort-icon").removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
    $("#topSubCategoryTable #sort-" + col).removeClass('fa-sort').addClass(sortState.asc ? 'fa-sort-up' : 'fa-sort-down');
  }

  $(document).on('click', '#sort-delta, #sort-instore', function () { applySort(this.id.split('-')[1]); });
  $('#sort-delta').removeClass('fa-sort').addClass('fa-sort-down');

  // Download
  $(document).off('click', '#downloadSubCategoryBtn').on('click', '#downloadSubCategoryBtn', function () {
    let csv = 'Rank,ID,Family,Delta GMV,VN Growth,InStore GMV\n';
    csv += `,Total,All SubCategories,${totalDelta.toFixed(1)} pts,,${totalInstore.toLocaleString('fr-FR')} €\n`;
    data.forEach((r) => csv += `${r.rank},${r.id},${r.name},${r.deltaGMV},${r.vnGrowth},${r.instore}\n`);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'top-SubCategory-growth.csv'; a.click(); URL.revokeObjectURL(url);
  });

  // Listen for filters
  $(document).off('filters:applied.topSubCategory').on('filters:applied.topSubCategory', function (e, filters) {
    const params = {};
    if (filters) {
      if (filters.categories && filters.categories.length) params.categories = filters.categories.join(',');
      if (filters.stores && filters.stores.length) params.stores = filters.stores.join(',');
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.sort) params.sort = filters.sort;
    }
    fetchAndRender(params);
  });

  // Initial load
  fetchAndRender();
}


// Gọi khi DOM sẵn sàng
$(document).ready(() => initTopSubCategory());