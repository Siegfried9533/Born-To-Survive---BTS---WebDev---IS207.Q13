<div class="sidebar-header">
    <img src="{{ asset('assets/images/Logo-02.png') }}" alt="logo" class="logo-sidebar me-2">
    <span class="app-title">MODALAB</span>
</div>

<ul class="sidebar-menu">

    <li class="menu-item">
        <a href="{{ route('overview')}}" class="menu-link">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-house"></i>
            </div>
            <span>Overview</span>
        </a>
    </li>

    <li class="menu-item">
        <a href="{{ route('sales')}}" class="menu-link">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-users"></i>
            </div>
            <span>Sales</span>
        </a>
    </li>

    <li class="menu-item">
        <a href="{{ route('customers')}}" class="menu-link">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-users"></i>
            </div>
            <span>Customers</span>
        </a>
    </li>

    <li class="menu-item has-submenu" data-menu="product">
        <a href="#" class="menu-link collapsed">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-box-archive"></i>
            </div>
            <span>Products</span>
            <i class="fa-solid fa-chevron-up toggle-icon"></i>
        </a>
        <ul class="submenu">
            <li class="submenu-item"><a href="/top-category">Top Category</a></li>
            <li class="submenu-item"><a href="/top-products">Top Products</a></li>
        </ul>
    </li>

    <li class="menu-item has-submenu" data-menu="order">
        <a href="#" class="menu-link collapsed">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-clipboard-list"></i>
            </div>
            <span>Stores</span>
            <i class="fa-solid fa-chevron-up toggle-icon"></i>
        </a>
        <ul class="submenu">
            <li class="submenu-item"><a href="{{ route('top-stores') }}" class="nav-link {{ request()->routeIs('top-stores') ? 'active' : 'text-white' }}">Top Stores</a></li>
            <li class="submenu-item"><a href="#">Track Inventory</a></li>
        </ul>
    </li>

    <li class="menu-item has-submenu" data-menu="report">
        <a href="#" class="menu-link collapsed">
            <div class="menu-icon-bg">
                <i class="fa-solid fa-chart-simple"></i>
            </div>
            <span>Report</span>
            <i class="fa-solid fa-chevron-up toggle-icon"></i>
        </a>
        <ul class="submenu">
            <li class="submenu-item"><a href="{{ route('report-revenues')}}">Revenues</a></li>
            <li class="submenu-item"><a href="#">Orders</a></li>
            <li class="submenu-item"><a href="{{ route('report-sales')}}">Sales</a></li>
            <li class="submenu-item"><a href="{{ route('report-customers')}}">Customers</a></li>
            <li class="submenu-item"><a href="#">Prediction</a></li>
        </ul>
    </li>
</ul>