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
                        <a class="dropdown-item d-flex align-items-center" href="/profile">
                            <i class="fa-solid fa-user me-2"></i>
                            <span>My Profile</span>
                        </a>
                    </li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li>
                        <a class="dropdown-item d-flex align-items-center text-danger" href="#" id="btnLogout">
                            <i class="fa-solid fa-arrow-right-from-bracket me-2"></i>
                            <span>Log Out</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="date-filter-row d-flex justify-content-start">
        <div class="date-range-picker">
            <button type="button" class="date-icon-btn" id="calendarTriggerBtn">
                <i class="fa-solid fa-calendar-days date-icon"></i>
            </button>
            <input type="text" class="date-input" id="startDateDisplay" readonly>
            <span class="date-separator fw-bold text-dark">To</span>
            <input type="text" class="date-input" id="endDateDisplay" readonly>
            <input type="hidden" id="startDate" value="25-07-2030">
            <input type="hidden" id="endDate" value="29-07-2030">
        </div>
    </div>

</div>