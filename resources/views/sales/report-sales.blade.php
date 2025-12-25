@extends('layouts.sales')

@section('title', 'Sales Report')

@section('header')
    @include('partials.sales-header')
@endsection

@section('content')

{{-- Loading Overlay --}}
<div id="loadingOverlay" class="loading-overlay">
    <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading data...</p>
    </div>
</div>

{{-- Filter Bar --}}
<section class="container-fluid-dashboard px-4 pb-3" style="padding-top: 15px">
    <div class="filter-bar d-flex align-items-center gap-3 flex-wrap">
        <button class="btn-apply-filters" id="applySalesFilters">
            <i class="fas fa-filter me-2"></i>Apply Filters
        </button>
    </div>
</section>

<section class="container-fluid-dashboard px-4 pb-5">
    <div class="card section-card shadow-sm">
        <div class="container-fluid px-4 py-4">
            <div class="d-flex align-items-center mb-4">
                <h4 class="mb-0 fw-bold">Sale Overview</h4>
            </div>

            <!-- 4 Summary Cards -->
            <div class="row g-4 mb-5">
                {{-- Total Sale Card (Clickable) --}}
                <div class="col-xl-3 col-md-6">
                    <div class="card border-0 shadow rounded-4 h-100 bg-white summary-card-clickable" 
                         data-bs-toggle="modal" data-bs-target="#totalSaleModal" role="button">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1 fw-medium">Total Sale</p>
                                    <h3 class="mb-0 fw-bold text-dark" id="totalSaleValue">--</h3>
                                </div>
                                <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                                    <i class="fas fa-sack-dollar fa-xl"></i>
                                </div>
                            </div>
                            <small class="text-muted mt-2 d-block"><i class="fas fa-chart-line me-1"></i>Click to view details</small>
                        </div>
                    </div>
                </div>

                {{-- Total Orders Card (Clickable) --}}
                <div class="col-xl-3 col-md-6">
                    <div class="card border-0 shadow rounded-4 h-100 bg-white summary-card-clickable" 
                         data-bs-toggle="modal" data-bs-target="#totalOrdersModal" role="button">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1 fw-medium">Total Orders</p>
                                    <h3 class="mb-0 fw-bold text-dark" id="totalOrdersValue">--</h3>
                                </div>
                                <div class="bg-success bg-opacity-10 text-success rounded-3 p-3">
                                    <i class="fas fa-shopping-cart fa-xl"></i>
                                </div>
                            </div>
                            <small class="text-muted mt-2 d-block"><i class="fas fa-chart-bar me-1"></i>Click to view details</small>
                        </div>
                    </div>
                </div>

                {{-- Average Order Value --}}
                <div class="col-xl-3 col-md-6">
                    <div class="card border-0 shadow rounded-4 h-100 bg-white">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1 fw-medium">Average Order Value</p>
                                    <h3 class="mb-0 fw-bold text-dark" id="avgOrderValue">--</h3>
                                </div>
                                <div class="bg-info bg-opacity-10 text-info rounded-3 p-3">
                                    <i class="fas fa-calculator fa-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Growth YoY --}}
                <div class="col-xl-3 col-md-6">
                    <div class="card border-0 shadow rounded-4 h-100 bg-white">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1 fw-medium">Growth YoY</p>
                                    <h3 class="mb-0 fw-bold" id="growthYoYValue">--</h3>
                                </div>
                                <div class="bg-success bg-opacity-10 text-success rounded-3 p-3" id="growthYoYIcon">
                                    <i class="fas fa-arrow-trend-up fa-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row 1 -->
            <div class="row g-4 mb-4">
                {{-- Sale by Channel (Pie Chart) --}}
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold">Sale by Channel</div>
                        <div class="card-body d-flex align-items-center justify-content-center" style="min-height: 300px;">
                            <canvas id="channelChart"></canvas>
                        </div>
                    </div>
                </div>

                {{-- Top 10 Best-Selling Products (Scrollable) --}}
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold">Top 10 Best-Selling SubCategories</div>
                        <div class="card-body" style="max-height: 350px; overflow-y: auto;">
                            <canvas id="topProductsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row 2 -->
            <div class="row g-4 mb-4">
                {{-- Sale Trend (Last 30 Days) --}}
                <div class="col-lg-8">
                    <div class="card shadow-sm border-0">
                        <div class="card-header bg-white fw-bold">Sale Trend (Last 30 Days)</div>
                        <div class="card-body" style="height: 300px;">
                            <canvas id="revenueTrendChart"></canvas>
                        </div>
                    </div>
                </div>

                {{-- Monthly Target Achievement --}}
                <div class="col-lg-4">
                    <div class="card shadow-sm border-0 h-100 text-center bg-white">
                        <div class="card-body p-4">
                            <h5 class="card-title">Monthly Target Achievement</h5>
                            <div class="gauge-container">
                                <svg class="gauge-svg" viewBox="0 0 200 110">
                                    <defs>
                                        <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#20c997" />
                                            <stop offset="100%" stop-color="#198754" />
                                        </linearGradient>
                                    </defs>
                                    <path class="gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100" />
                                    <path id="progress-bar" class="gauge-progress" d="M 20 100 A 80 80 0 0 1 180 100" />
                                </svg>
                            </div>
                            <div class="gauge-info">
                                <div class="percent-text">--</div>
                                <div class="sub-text">Coming soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tables Row -->
            <div class="row g-4">
                {{-- Top 10 Provinces by Revenue --}}
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            Top 10 Cities by Sale
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 top-growth-table align-middle" id="topProvincesTable">
                                    <thead>
                                        <tr>
                                            <th style="width:10%">Rank</th>
                                            <th style="width:45%">City</th>
                                            <th class="text-end pe-4" style="width:30%">Revenue</th>
                                            <th class="text-end pe-4" style="width:15%">% Total</th>
                                        </tr>
                                    </thead>
                                    <tbody id="topProvincesBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Top 10 Sales Representatives --}}
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            Top 10 Sales Representatives
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0 top-growth-table align-middle" id="topSalesRepsTable">
                                    <thead>
                                        <tr>
                                            <th style="width:10%">Rank</th>
                                            <th style="width:35%">Employee</th>
                                            <th class="text-end pe-4" style="width:25%">Revenue</th>
                                            <th class="text-center" style="width:15%">Orders</th>
                                            <th class="text-end pe-4" style="width:15%">AOV</th>
                                        </tr>
                                    </thead>
                                    <tbody id="topEmployeesBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</section>

{{-- Modal: Total Sale Chart --}}
<div class="modal fade" id="totalSaleModal" tabindex="-1" aria-labelledby="totalSaleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="totalSaleModalLabel">
                    <i class="fas fa-chart-line me-2 text-primary"></i>Daily Revenue Breakdown
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div style="height: 400px;">
                    <canvas id="dailyRevenueChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Modal: Total Orders Chart --}}
<div class="modal fade" id="totalOrdersModal" tabindex="-1" aria-labelledby="totalOrdersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="totalOrdersModalLabel">
                    <i class="fas fa-chart-bar me-2 text-success"></i>Daily Orders Breakdown
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div style="height: 400px;">
                    <canvas id="dailyOrdersChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
    @vite('resources/js/sales.js')
@endpush
