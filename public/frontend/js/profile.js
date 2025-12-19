// profile.js

function fillProfileFromUser(user) {
    if (!user) return;
    
    // Helper: try multiple possible paths (supports backend using capitalized DB columns)
    const getField = (obj, paths) => {
        for (const p of paths) {
            if (!p) continue;
            const parts = p.split(".");
            let cur = obj;
            let found = true;
            for (const part of parts) {
                if (cur && Object.prototype.hasOwnProperty.call(cur, part)) {
                    cur = cur[part];
                } else {
                    found = false;
                    break;
                }
            }
            if (found && cur !== undefined && cur !== null) return cur;
        }
        return "";
    };

    // Try common variations: lowercase, snake_case, and capitalized DB names
    const displayName = getField(user, [
        "name",
        "full_name",
        "Name",
        "username",
        "employee.Name",
    ]);
    const email = getField(user, ["email", "Email", "employee.Email"]);

    const profileNameEl = document.getElementById("profileName");
    const profileEmailEl = document.getElementById("profileEmail");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const genderSelect = document.getElementById("gender");
    const dobInput = document.getElementById("dob-picker");
    const countryInput = document.getElementById("country");
    const timeZoneSelect = document.getElementById("timeZone");
    const addressInput = document.getElementById("address");

    if (profileNameEl) profileNameEl.textContent = displayName;
    if (profileEmailEl) profileEmailEl.textContent = email;
    if (fullNameInput) fullNameInput.value = displayName;
    if (emailInput) emailInput.value = email;

    if (genderSelect && user.gender) {
        // backend có thể trả "M"/"F" hoặc "Male"/"Female"
        const g = user.gender;
        if (g === "M" || g === "F") {
            genderSelect.value = g;
        } else if (/male/i.test(g)) {
            genderSelect.value = "M";
        } else if (/female/i.test(g)) {
            genderSelect.value = "F";
        }
    }

    if (dobInput && user.dob) {
        // giả sử dob dạng YYYY-MM-DD
        dobInput.value = dayjs(user.dob).format("DD/MM/YYYY");
    }

    // Also support DOB stored as capitalized or inside employee relation
    if (dobInput && !dobInput.value) {
        const altDob = getField(user, [
            "dob",
            "DOB",
            "employee.dob",
            "employee.DOB",
        ]);
        if (altDob) dobInput.value = dayjs(altDob).format("DD/MM/YYYY");
    }

    if (countryInput && user.country) {
        countryInput.value = user.country;
    }

    if (timeZoneSelect && user.time_zone) {
        timeZoneSelect.value = user.time_zone;
    }

    if (addressInput && user.address) {
        addressInput.value = user.address;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    App.requireAuth(); // bắt buộc login

    // 1. Lấy tạm từ localStorage cho nhanh
    try {
        const raw = localStorage.getItem("user");
        if (raw) {
            const localUser = JSON.parse(raw);
            fillProfileFromUser(localUser);
        }
    } catch (e) {
        console.error("Parse local user error", e);
    }

    // 2. Gọi API /auth/me để lấy dữ liệu chính xác từ backend
    try {
        const user = await App.apiGet("/auth/me");
        fillProfileFromUser(user);

        // Cập nhật lại localStorage
        localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
        console.error("Load profile error", err);
    }

    // 3. Khởi tạo date picker nếu bạn dùng
    if (typeof flatpickr === "function") {
        flatpickr("#dob-picker", {
            dateFormat: "d/m/Y",
            allowInput: false,
            disableMobile: true,
        });
    }

    // 4. Logic Edit / Save profile
    const btnEdit = document.getElementById("btn-edit-profile");
    const inputs = document.querySelectorAll(".profile-input");
    const dobInput = document.getElementById("dob-picker");
    let editing = false;

    if (btnEdit) {
        btnEdit.addEventListener("click", async () => {
            if (!editing) {
                inputs.forEach((i) => (i.disabled = false));
                if (dobInput) dobInput.disabled = false;
                btnEdit.textContent = "Save";
                editing = true;
            } else {
                // Collect form values
                const usernameVal = document.getElementById("fullName").value;
                const emailVal = document.getElementById("email").value;

                const payload = {};
                if (usernameVal) payload.username = usernameVal;
                if (emailVal) payload.email = emailVal;

                try {
                    const res = await App.apiPut("/auth/profile", payload);
                    // Backend returns the updated user model
                    const updatedUser = res.user || res;

                    alert("Cập nhật profile thành công!");

                    inputs.forEach((i) => (i.disabled = true));
                    if (dobInput) dobInput.disabled = true;
                    btnEdit.textContent = "Edit";
                    editing = false;

                    // Save normalized user object to localStorage and refresh UI
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    fillProfileFromUser(updatedUser);
                } catch (err) {
                    alert(err.message || "Cập nhật profile thất bại");
                }
            }
        });
    }
});
