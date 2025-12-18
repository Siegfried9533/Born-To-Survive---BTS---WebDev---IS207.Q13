import $ from 'jquery';

/* ========================================================= */
/* TOP PRODUCTS  */
/* ========================================================= */
console.log("🔧 top-products.js file đã được load");
function initTopProducts() {
  if ($("#topProductsTable").length === 0) return;

  // Lấy dữ liệu từ API getProductAnalytics
  const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
  const apiUrl = `${baseUrl}/api/analytics/products`;

  // Shared state used by render logic
  let data = [];
  let totalDelta = 0,
    totalInstore = 0;
  const pageSize = 10; // items per page
  let currentPage = 1;
  let sortState = { col: "delta", asc: false };

  const $tbody = $("#topProductsTable tbody");

  // Ensure there's a pagination container under the table
  const $tableWrapper = $("#topProductsTable").closest('.table-responsive');
  if ($tableWrapper.length && $("#topProductsPagination").length === 0) {
    $tableWrapper.after('<div id="topProductsPagination" class="px-3 py-2 d-flex justify-content-center align-items-center"></div>');
  }

  function fetchAndRender(params = {}) {
    // Clear table immediately so user sees the change
    $tbody.empty();
    $tbody.append('<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>');

    $.get(apiUrl, params, function (response) {
      console.log("API products response:", response);
      const products = response && response.data ? response.data : [];

      // reset state
      data = [];
      totalDelta = 0;
      totalInstore = 0;
      currentPage = 1;

      products.forEach((p) => {
        const id = p.ProdID || p.prodID || p.ProdId || p.ProductID || "";
        const name = p.ProductName || p.SubCategory || p.Description || "-";
        const totalSold = Number(p.total_sold || 0);
        const revenue = Number(p.revenue || 0);

        const deltaNum = totalSold;
        const instoreNum = revenue;

        totalDelta += deltaNum;
        totalInstore += instoreNum;

        data.push({
          rank: 0,
          id: id,
          name: name,
          deltaGMV: `${totalSold} units`,
          vnGrowth: "-",
          instore: `${revenue.toLocaleString('fr-FR')} €`,
          deltaNum: deltaNum,
          instoreNum: instoreNum,
        });
      });

      sortData(sortState.col, sortState.asc);
      render();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Lỗi khi gọi API products:', textStatus, errorThrown, jqXHR && jqXHR.responseText);
      $tbody.html(
        '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu sản phẩm từ API</td></tr>'
      );
    });
  }

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

  $("#topProductsTable").off('click', '#sort-delta, #sort-instore').on(
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

  // Listen for global filters event and call API with params
  $(document).off('filters:applied.topProducts').on('filters:applied.topProducts', function (e, filters) {
    // filters expected: { categories: [], stores: [], sort: '...' , from_date, to_date }
    const params = {};
    if (filters) {
      if (filters.categories && filters.categories.length) params.category = filters.categories.join(',');
      if (filters.stores && filters.stores.length) params.stores = filters.stores.join(',');
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.sort) params.sort = filters.sort;
    }
    fetchAndRender(params);
  });

  // Initial load with no filters
  fetchAndRender();
}

// GỌI KHI LOAD TRANG
$(document).ready(function () {
  initTopProducts();
});