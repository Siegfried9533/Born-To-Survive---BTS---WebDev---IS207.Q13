
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
    const apiUrl = "/api/products/categories";

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

/* ======================================================= */
initFilterComponent();
