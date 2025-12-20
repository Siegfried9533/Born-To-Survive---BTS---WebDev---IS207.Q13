
/* ======================================================= */
/* KHỞI TẠO COMPONENT FILTER 
/* ======================================================= */
function initFilterComponent() {
  console.log("Khởi tạo Filter component...");
  const $filterGroups = $(".filter-group");
  
  if (!$filterGroups.length) {
    console.log("ℹ️ Không có .filter-group nào, nhưng vẫn khởi tạo các sự kiện chung (Date, Apply button).");
  }

  // --- Helper 1: Cập nhật text hiển thị ---
  function updateDisplayText($group) {
    const $displayText = $group.find(".filter-display-text");
    const $checkedInputs = $group.find("input:checked");

    if ($checkedInputs.length === 0) {
      $displayText.html("&nbsp;").removeClass("has-selection");
    } else {
      const selectedValues = $checkedInputs
        .map(function () {
          return $(this).val();
        })
        .get()
        .join(", ");

      $displayText.text(selectedValues).addClass("has-selection");
    }
  }

  // --- Helper 2: Xử lý giới hạn (max) ---
  function handleSelectionLimits($group) {
    const maxCount = parseInt($group.attr("data-max"), 10);
    if (!maxCount) return;

    const $checkboxes = $group.find('input[type="checkbox"]');
    const checkedCount = $group.find('input[type="checkbox"]:checked').length;

    if (checkedCount >= maxCount) {
      $checkboxes
        .not(":checked")
        .prop("disabled", true)
        .closest(".filter-item")
        .addClass("disabled");
    } else {
      $checkboxes
        .prop("disabled", false)
        .closest(".filter-item")
        .removeClass("disabled");
    }
  }

  // --- Helper 3: Tự động tạo Category (thay cho document.write) ---
  function generateCategories() {
    // Nhắm vào dropdown của group category bằng ID
    const $categoryDropdown = $("#category-filter-group .filter-dropdown");
    if (!$categoryDropdown.length) return;
      const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
    const apiUrl = `${baseUrl}/api/top/top-categories`;

    // Hiển thị loading nhỏ trong dropdown
    const $header = $categoryDropdown.find(".filter-dropdown-header");
    const $loading = $("<div class='filter-loading text-muted'>Loading categories...</div>");
    if ($header.length) {
      $header.after($loading);
    } else {
      $categoryDropdown.html($loading);
    }

    // Gọi API để lấy category
    $.getJSON(apiUrl)
      .done(function (resp) {
        $loading.remove();
        if (!resp || resp.status !== "success" || !resp.data) {
          console.warn("Invalid categories response", resp);
          fallbackCategories();
          return;
        }

        const categories = resp.data;
        console.log("📦 Categories received:", categories);
        if (!categories.length) {
          $categoryDropdown.html('<div class="filter-item">No categories available</div>');
          return;
        }
        let categoryHTML = "";
        categories.forEach(function (c, idx) {
          // Some responses may return Category under 'Category' or 'category'
          const name = (c.Category || c.category || c.name || String(c)).toString().trim();
          const id = `cat-${idx}-${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
          // Only render the category name (no counts)
          categoryHTML += `\
                <div class="filter-item">\
                    <input type="checkbox" id="${id}" value="${name}">\
                    <label for="${id}">${name}</label>\
                </div>`;
        });

        if ($header.length) {
          $header.after(categoryHTML);
        } else {
          $categoryDropdown.html(categoryHTML);
        }
      })
      .fail(function (jqxhr, textStatus, error) {
        $loading.remove();
        console.error("Failed to load categories:", textStatus, error);
        fallbackCategories();
      });

    function fallbackCategories() {
      let html = "";
      for (let i = 1; i <= 12; i++) {
        html += `\
                <div class="filter-item">\
                    <input type="checkbox" id="cat${i}" value="Category ${i}">\
                    <label for="cat${i}">Category ${i}</label>\
                </div>`;
      }
      if ($header.length) {
        $header.after(html);
      } else {
        $categoryDropdown.html(html);
      }
    }
  }

  // --- Helper 4: Tự động tạo Stores cho dropdown `store-filter-group` ---
  function generateStores() {
    const $storeDropdown = $("#store-filter-group .filter-dropdown");
    if (!$storeDropdown.length) return;
      const baseUrl = window.Laravel.baseUrl; // Lấy biến từ Bước 1
    const apiUrl = `${baseUrl}/api/stores`;

    const $header = $storeDropdown.find(".filter-dropdown-header");
    const $loading = $("<div class='filter-loading text-muted'>Loading stores...</div>");
    if ($header.length) {
      $header.after($loading);
    } else {
      $storeDropdown.html($loading);
    }

    $.getJSON(apiUrl)
      .done(function (resp) {
        $loading.remove();
        if (!resp || resp.status !== "success" || !resp.data) {
          console.warn("Invalid stores response", resp);
          fallbackStores();
          return;
        }

        const stores = resp.data;
        if (!stores.length) {
          $storeDropdown.html('<div class="filter-item">No stores available</div>');
          return;
        }

        let html = "";
        stores.forEach(function (s, idx) {
          const name = (s.StoreName || s.name || s.Store || (`Store ${s.StoreID || idx}`)).toString().trim();
          const id = `store-${s.StoreID || idx}-${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
          html += `\
                <div class="filter-item">\
                    <input type="checkbox" id="${id}" value="${s.StoreID}">\
                    <label for="${id}">${name}</label>\
                </div>`;
        });

        if ($header.length) {
          $header.after(html);
        } else {
          $storeDropdown.html(html);
        }

        // After inserting store items update UI state for this group
        const $group = $("#store-filter-group");
        handleSelectionLimits($group);
        updateDisplayText($group);
      })
      .fail(function (jqxhr, textStatus, error) {
        $loading.remove();
        console.error("Failed to load stores:", textStatus, error);
        fallbackStores();
      });

    function fallbackStores() {
      let html = "";
      for (let i = 1; i <= 6; i++) {
        html += `\
                <div class="filter-item">\
                    <input type="checkbox" id="store${i}" value="${i}">\
                    <label for="store${i}">Store ${i}</label>\
                </div>`;
      }
      if ($header.length) {
        $header.after(html);
      } else {
        $storeDropdown.html(html);
      }

      // Ensure UI state is correct after fallback items inserted
      const $group = $("#store-filter-group");
      handleSelectionLimits($group);
      updateDisplayText($group);
    }
  }

  // --- 1. Thêm header "Chọn tối đa X" ---
  $filterGroups.each(function () {
    const $group = $(this);
    const maxCount = parseInt($group.attr("data-max"), 10);
    // Kiểm tra xem header đã tồn tại chưa
    if (maxCount && $group.find(".filter-dropdown-header").length === 0) {
      const $header = $("<div></div>")
        .addClass("filter-dropdown-header")
        .html(`Select up to ${maxCount} <hr>`);
      $group.find(".filter-dropdown").prepend($header);
    }
  });

  generateCategories();

  // Tạo danh sách cửa hàng cho dropdown
  generateStores();

  // --- 2. Mở/đóng dropdown khi click vào box ---
  // Dùng delegation trên document để chắc chắn handler được gắn
  $(document).on("click", ".filter-display-box", function (e) {
    e.stopPropagation();
    const $currentGroup = $(this).closest(".filter-group");
    $(".filter-group").not($currentGroup).removeClass("open");
    $currentGroup.toggleClass("open");
  });

  // --- 3. Xử lý khi chọn một item (change) ---
  // Dùng delegation trên document để chắc chắn handler được gắn
  $(document).on(
    "change",
    'input[type="checkbox"], input[type="radio"]',
    function () {
      const $group = $(this).closest(".filter-group");

      handleSelectionLimits($group);
      updateDisplayText($group);

      if ($(this).is(":radio")) {
        $group.removeClass("open");
      }
    }
  );

  // --- Apply filters: Thu thập lựa chọn và kích hoạt filter ---
  function collectFilters() {
    const categories = $("#category-filter-group input:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    const stores = $("#store-filter-group input:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    const sort = $("input[name='sort']:checked").val() || null;

    const from_date = $("#startDate").length ? $("#startDate").val() : null;
    const to_date = $("#endDate").length ? $("#endDate").val() : null;

    return {
      categories: categories,
      stores: stores,
      sort: sort,
      from_date: from_date || null,
      to_date: to_date || null,
    };
  }

  $("#filter-container").on("click", ".btn-apply-filters", function (e) {
    e.preventDefault();
    $(document).trigger("filters:applied", [collectFilters()]);
  });

  // Auto-apply when date inputs change (no need to click Apply)
  $(document).on('change', '#startDate, #endDate', function () {
    $(document).trigger('filters:applied', [collectFilters()]);
  });

  // Handle Apply button in Header
  $(document).on('click', '#btnApplyHeaderDate', function (e) {
    e.preventDefault();
    $(document).trigger('filters:applied', [collectFilters()]);
  });

  // --- 4. Đóng dropdown khi click ra ngoài ---
  $(window).on("click", function () {
    $filterGroups.removeClass("open");
  });

  // --- 5. Ngăn click BÊN TRONG dropdown làm đóng dropdown ---
  // Dùng delegation trên document để chắc chắn handler được gắn
  $(document).on("click", ".filter-dropdown", function (e) {
    e.stopPropagation();
  });

  // --- 6. Khởi tạo trạng thái ban đầu ---
  $filterGroups.each(function () {
    const $group = $(this);
    updateDisplayText($group);
    handleSelectionLimits($group);
  });

  console.log("Filter component đã được khởi tạo.");
}

/* ======================================================= */
initFilterComponent();
