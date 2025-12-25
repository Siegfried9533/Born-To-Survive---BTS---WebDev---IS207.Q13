import $ from 'jquery';

/* ======================================================= */
/* TOP CATEGORY    */
/* ======================================================= */
console.log("🔧 top-category.js file đã được load");
function initTopCategory() {
  if ($("#topCategoryTable").length === 0) return;

  // Lấy dữ liệu từ API categories
  const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
  const apiUrl = `${baseUrl}/api/top/top-categories`;

  const $tbody = $("#topCategoryTable tbody");

  // Shared state
  let data = [];
  let totalDelta = 0,
    totalInstore = 0;
  let sortState = { col: "delta", asc: false };

  // Ensure pagination container exists if needed (keep parity with other modules)

  function fetchAndRender(params = {}) {
    $tbody.empty();
    $tbody.append('<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>');

    $.get(apiUrl, params, function (response) {
      console.log("API categories response:", response);
      const items = response && response.data ? response.data : (Array.isArray(response) ? response : []);
      $tbody.empty();

      data = [];
      totalDelta = 0;
      totalInstore = 0;

      items.forEach((it, idx) => {
        let id, name, deltaNum, instoreNum, deltaDisplay, vnGrowth, instoreDisplay;

        if (typeof it === 'string' || typeof it === 'number') {
          id = String(it);
          name = String(it);
          deltaNum = 0;
          instoreNum = 0;
          deltaDisplay = '0 pts';
          vnGrowth = '-';
          instoreDisplay = '-';
        } else if (typeof it === 'object' && it !== null) {
          id = it.Category || it.CategoryID || it.id || it.code || it.name || '';
          name = it.Category || it.CategoryName || it.Name || it.name || id;
          deltaNum = Number(it.delta_gmv || it.delta || it.total_sold || it.change || 0) || 0;
          instoreNum = Number(it.instore_gmv || it.instore || it.revenue || it.value || 0) || 0;
          deltaDisplay = (deltaNum > 0 ? deltaNum.toLocaleString('en-US') : '0') + ' pts';
          vnGrowth = it.product_count ? `${it.product_count} products` : (it.growth || '-');
          instoreDisplay = (instoreNum > 0 ? instoreNum.toLocaleString('fr-FR') : '0') + ' $';
        } else {
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
          name: name,
          deltaGMV: deltaDisplay,
          vnGrowth: vnGrowth,
          instore: instoreDisplay,
          deltaNum: deltaNum,
          instoreNum: instoreNum,
        });
      });

      sortData("delta", false);
      render();
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error('❌ Lỗi khi gọi API categories:', textStatus, errorThrown, jqXHR && jqXHR.responseText);
      $tbody.html(
        '<tr><td colspan="5" class="text-center text-danger py-5">Không tải được dữ liệu danh mục từ API</td></tr>'
      );
    });

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
                    )} </div></td>
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
        )}K pts,,${totalInstore.toLocaleString("fr-FR")} $\n`;
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
  }

  // Listen for global filters event and re-fetch
  $(document).off('filters:applied.topCategory').on('filters:applied.topCategory', function (e, filters) {
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

  // Initial fetch
  fetchAndRender();
}

// Gọi khi DOM sẵn sàng
$(document).ready(() => initTopCategory());