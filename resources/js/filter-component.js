
/* ======================================================= */
/* KHỞI TẠO COMPONENT FILTER 
/* ======================================================= */
function initFilterComponent() {
    console.log("Khởi tạo Filter component...");
  const $filterGroups = $(".filter-group");
  if (!$filterGroups.length) {
    console.warn("Không tìm thấy .filter-group để khởi tạo.");
    return;
  }

  // --- Helper 1: Cập nhật text hiển thị ---
  function updateDisplayText($group) {
    const $displayText = $group.find(".filter-display-text");
    const $checkedInputs = $group.find("input:checked");

    if ($checkedInputs.length === 0) {
      $displayText.html("&nbsp;").removeClass("has-selection");
    } else {
      // If this group is the Stores group, show "Store Name - StoreID"
      const groupLabel = ($group.find('.filter-label').text() || '').toLowerCase();
      const isStoreGroup = groupLabel.indexOf('store') !== -1;

      const selectedValues = $checkedInputs
        .map(function () {
          const $input = $(this);
          const val = $input.val();
          if (!isStoreGroup) return val;

          // For stores: try to find the label text that corresponds to this input
          const inputId = $input.attr('id');
          let name = val;
          if (inputId) {
            const $lbl = $group.find('label[for="' + inputId + '"]');
            if ($lbl.length) name = $lbl.text().trim();
          } else {
            // fallback: try to get next sibling label
            const $lbl = $input.next('label');
            if ($lbl.length) name = $lbl.text().trim();
          }

          // Normalize
          const nameStr = String(name || '').trim();
          const valStr = String(val || '').trim();

          // If the label already contains the ID at the end (e.g. "Name - ID"), show the label only
          if (nameStr) {
            const parts = nameStr.split('-').map(function(p){ return String(p).trim(); }).filter(Boolean);
            const last = parts.length ? parts[parts.length - 1] : '';
            if (last && last === valStr) {
              return nameStr;
            }
          }

          // Otherwise show "Name - ID" if name differs from value, else just value
          if (nameStr && nameStr !== valStr) return nameStr + ' - ' + valStr;
          return valStr;
        })
        .get()
        .join(', ');

      $displayText.text(selectedValues).addClass('has-selection');
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
    const apiUrl = window.Laravel && window.Laravel.baseUrl
      ? `${String(window.Laravel.baseUrl).replace(/\/+$/, '')}/api/products/categories`
      : `${window.location.origin}/api/products/categories`;

    // Hiển thị loading nhỏ trong dropdown
    const $header = $categoryDropdown.find(".filter-dropdown-header");
    const $loading = $("<div class='filter-loading text-muted'>Loading categories...</div>");
    if ($header.length) {
      $header.after($loading);
    } else {
      $categoryDropdown.html($loading);
    }

    // Gọi API để lấy category
    $.ajax({
      url: apiUrl,
      type: 'GET',
      dataType: 'json',
      timeout: 5000, // 5 second timeout
    })
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
        console.error("❌ Failed to load categories:");
        console.error("   URL:", apiUrl);
        console.error("   Status:", textStatus);
        console.error("   Error:", error);
        if (jqxhr && jqxhr.status) {
          console.error("   HTTP Status:", jqxhr.status, jqxhr.statusText);
          console.error("   Response:", jqxhr.responseText);
        }
        fallbackCategories();
      });

    function fallbackCategories() {
      console.warn("⚠️ Using fallback categories");
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
      // Try to populate stores dynamically from API when available
      generateStores();

  // --- 2. Mở/đóng dropdown khi click vào box ---
  // Sửa: Dùng ID selector '#filter-container'
  $("#filter-container").on("click", ".filter-display-box", function (e) {
    e.stopPropagation();
    const $currentGroup = $(this).closest(".filter-group");
    $(".filter-group").not($currentGroup).removeClass("open");
    $currentGroup.toggleClass("open");
  });

  // --- 3. Xử lý khi chọn một item (change) ---
  // Sửa: Dùng ID selector '#filter-container'
  $("#filter-container").on(
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

  // --- 4. Đóng dropdown khi click ra ngoài ---
  $(window).on("click", function () {
    $filterGroups.removeClass("open");
  });

  // --- 5. Ngăn click BÊN TRONG dropdown làm đóng dropdown ---
  // Sửa: Dùng ID selector '#filter-container'
  $("#filter-container").on("click", ".filter-dropdown", function (e) {
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

      // --- Helper 4: Tự động tạo Stores nếu view không cung cấp $stores ---
      function generateStores() {
      // Find the stores filter group by label or by data-max=3 heuristic
      let $storesGroup = $(".filter-group").filter(function () {
        const label = $(this).find('.filter-label').text() || '';
        return label.toLowerCase().indexOf('store') !== -1;
      }).first();

      if (!$storesGroup.length) {
        // fallback to data-max=3
        $storesGroup = $(".filter-group[data-max='3']").first();
      }

      if (!$storesGroup.length) return;

      const $storesDropdown = $storesGroup.find('.filter-dropdown');
      if (!$storesDropdown.length) return;

      const apiUrl = window.Laravel && window.Laravel.baseUrl
        ? `${String(window.Laravel.baseUrl).replace(/\/+$/, '')}/api/analytics/stores`
        : `${window.location.origin}/api/analytics/stores`;

      // Show loading placeholder
      const $header = $storesDropdown.find('.filter-dropdown-header');
      const $loading = $("<div class='filter-loading text-muted'>Loading stores...</div>");
      if ($header.length) $header.after($loading); else $storesDropdown.html($loading);

      $.ajax({ url: apiUrl, type: 'GET', dataType: 'json', timeout: 5000 })
        .done(function (resp) {
        $loading.remove();
        const list = (resp && resp.data) ? resp.data : (Array.isArray(resp) ? resp : []);
        if (!list || !list.length) {
          // no stores - leave existing content (fallback)
          if ($storesDropdown.children().length === 0) {
          $storesDropdown.html('<div class="filter-item">No stores available</div>');
          }
          return;
        }

        let html = '';
        list.forEach(function (s, idx) {
          const sid = (s.StoreID || s.store_id || s.id || '').toString().trim();
          const sname = (s.Name || s.name || s.StoreName || sid).toString().trim();
          const safeId = 'store_' + (sid ? sid.replace(/[^A-Za-z0-9_-]/g, '_') : idx);
          html += `\
            <div class="filter-item">\
              <input type="checkbox" id="${safeId}" value="${sid}" data-store-id="${sid}">\
              <label for="${safeId}">${sname} - ${sid}</label>\
            </div>`;
        });

        if ($header.length) $header.after(html); else $storesDropdown.html(html);

        // Re-initialize display text and limits on this group
        // updateDisplayText($storesGroup);
        // handleSelectionLimits($storesGroup);
        })
        .fail(function (jqxhr, textStatus, error) {
        $loading.remove();
        console.error('❌ Failed to load stores from API:', apiUrl, textStatus, error);
        });
      }
/* ======================================================= */
initFilterComponent();
