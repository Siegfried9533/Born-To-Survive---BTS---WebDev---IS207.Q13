<div class="overview-banner">
    <div class="banner-background"></div>

    <div class="top-row d-flex justify-content-between align-items-center">
        <h5 class="page-title mb-0 fw-bold">Welcome to ModaLab !</h5>

        <form class="search position-relative">
            <span class="search-icon position-absolute">
                <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input class="form-control form-control-sm" type="search" placeholder="Search...">
        </form>

        <div class="nav-icons d-flex align-items-center">
            <i class="fa-solid fa-gear icon-btn"></i>
            <div class="notification-icon position-relative">
                <i class="fa-solid fa-bell icon-btn"></i>
                <span class="badge-dot"></span>
            </div>

            <div class="dropdown">
                <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" class="nav-avatar-trigger">
                    <img src="{{ asset('assets/images/avatar.jpg') }}" alt="Avatar" class="nav-avatar">
                </a>
                <ul class="dropdown-menu dropdown-menu-end mt-2 shadow-sm">
                    <li>
                        <a class="dropdown-item d-flex align-items-center" href="../pages/profile.html">
                            <i class="fa-solid fa-user me-2"></i>
                            <span>My Profile</span>
                        </a>
                    </li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center text-danger" href="#">
                            <i class="fa-solid fa-arrow-right-from-bracket me-2"></i>
                            <span>Log Out</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="date-filter-row d-flex justify-content-start align-items-center">
        <div class="date-range-picker d-flex align-items-center gap-2">
            <button type="button" class="date-icon-btn" id="calendarTriggerBtn" title="Select date range">
                <i class="fa-solid fa-calendar-days date-icon"></i>
            </button>
            <!-- Visible date inputs: allow native date selection -->
            <input type="date" class="form-control form-control-sm" id="startDateDisplay" title="Start date" style="max-width: 130px;">
            <span class="date-separator fw-bold text-dark">To</span>
            <input type="date" class="form-control form-control-sm" id="endDateDisplay" title="End date" style="max-width: 130px;">
            <!-- Hidden inputs preserved for backward compatibility; values remain in DD-MM-YYYY format -->
            <input type="hidden" id="startDate" value="01-12-2025">
            <input type="hidden" id="endDate" value="29-07-2030">

            <style>
                .date-range-picker {
                    flex-wrap: wrap;
                }
                .date-range-picker .form-control-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.875rem;
                    border: 1px solid #dee2e6;
                    border-radius: 0.25rem;
                }
                .date-range-picker .form-control-sm:focus {
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                    outline: none;
                }
            </style>

            <script>
                (function () {
                    function ddmmyyyyToYyyyMmDd(s) {
                        if (!s) return '';
                        const parts = String(s).split('-');
                        if (parts.length !== 3) return '';
                        // parts: dd, mm, yyyy
                        return parts[2] + '-' + parts[1] + '-' + parts[0];
                    }

                    function yyyyMmDdToDdMmYyyy(s) {
                        if (!s) return '';
                        const parts = String(s).split('-');
                        if (parts.length !== 3) return '';
                        // parts: yyyy, mm, dd
                        return parts[2] + '-' + parts[1] + '-' + parts[0];
                    }

                    function syncHiddenFromDisplay() {
                        const startVal = document.getElementById('startDateDisplay').value;
                        const endVal = document.getElementById('endDateDisplay').value;
                        if (startVal) document.getElementById('startDate').value = yyyyMmDdToDdMmYyyy(startVal);
                        if (endVal) document.getElementById('endDate').value = yyyyMmDdToDdMmYyyy(endVal);
                        console.log('📅 Date updated:', { startDate: document.getElementById('startDate').value, endDate: document.getElementById('endDate').value });
                    }

                    function initDatePicker() {
                        // Initialize display inputs from hidden (if hidden has dd-mm-yyyy)
                        try {
                            const hiddenStart = document.getElementById('startDate').value;
                            const hiddenEnd = document.getElementById('endDate').value;
                            const dispStart = ddmmyyyyToYyyyMmDd(hiddenStart);
                            const dispEnd = ddmmyyyyToYyyyMmDd(hiddenEnd);
                            
                            if (dispStart) document.getElementById('startDateDisplay').value = dispStart;
                            if (dispEnd) document.getElementById('endDateDisplay').value = dispEnd;

                            // When user picks a date, update hidden inputs (backwards-compatible format dd-mm-yyyy)
                            document.getElementById('startDateDisplay').addEventListener('change', syncHiddenFromDisplay);
                            document.getElementById('endDateDisplay').addEventListener('change', syncHiddenFromDisplay);

                            // Also sync when calendar button is clicked
                            document.getElementById('calendarTriggerBtn').addEventListener('click', function(e) {
                                e.preventDefault();
                                document.getElementById('startDateDisplay').focus();
                                document.getElementById('startDateDisplay').click();
                            });

                            console.log('✅ Date picker initialized');
                        } catch (e) {
                            console.error('❌ Date picker init error', e);
                        }
                    }

                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', initDatePicker);
                    } else {
                        initDatePicker();
                    }
                })();
            </script>
        </div>
    </div>

</div>