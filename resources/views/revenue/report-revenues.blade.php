@extends('layouts.app')

@section('title', 'Revenues Report')

@section('content')
<div id="loadingOverlay" class="loading-overlay">
    <div class="spinner-border text-primary" role="status"></div>
</div>

<section class="container-fluid-dashboard px-4 pb-5">
    <div class="row mb-4">
        <div class="col-12" id="filter-wrapper">
            {{-- <div id="filter-container" class="card p-3 shadow-sm"></div> --}}
        </div>
    </div>

    <div class="card section-card shadow-sm">
        <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
            <h4 class="mb-0 fw-semibold text-dark">Revenue Overview</h4>
            <div class="d-flex align-items-center gap-2">
                <select id="viewMode" class="form-select w-auto">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2" onclick="exportRevenueReport();">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </button>
            </div>
        </div>

        <div class="card-body">
            <div class="row g-3 mb-4 text-center d-flex align-items-stretch">
                @php
                    $cards = [
                        ['id' => 'sumRevenue', 'title' => 'Total Revenue'],
                        ['id' => 'monthlyGrowth', 'title' => 'Growth Rate'],
                        ['id' => 'activeStores', 'title' => 'Active Stores']
                    ];
                @endphp
                @foreach($cards as $card)
                <div class="col-md-4 d-flex"> 
                    <div class="summary-card p-3 rounded shadow-sm border h-100 w-100 d-flex flex-column justify-content-center">
                        <h6 class="mb-1 text-secondary text-uppercase small fw-bold">{{ $card['title'] }}</h6>
                        <p id="{{ $card['id'] }}" class="summary-value mb-0 h4 fw-bold">--</p>
                    </div>
                </div>
                @endforeach
            </div>

            <div class="row g-3 mb-4">
                <div class="col-lg-6">
                    <div class="chart-card shadow-sm p-3 rounded border">
                        <h5 class="mb-3 fw-semibold">Revenue Trend</h5>
                        <div class="chart-wrapper" style="overflow-x: auto;">
                            <div style="height: 320px; min-width: 600px;">
                                <canvas id="lineChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="chart-card shadow-sm p-3 rounded border">
                        <h5 class="mb-3 fw-semibold">Revenue Comparison</h5>
                        <div class="chart-wrapper" style="overflow-x: auto;">
                            <div style="height: 320px; min-width: 600px;">
                                <canvas id="barChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="chart-card shadow-sm p-3 rounded border">
                        <h5 class="mb-3 fw-semibold text-center">Category Distribution</h5>
                        <div style="height: 400px;">
                            <canvas id="pieChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" id="revenueTable">
                    <thead class="table-light">
                        <tr>
                            <th>Date/Period</th>
                            <th>Revenue</th>
                            <th>Growth (%)</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</section>
@endsection

@push('scripts')
    @vite(['resources/js/filter-component.js', 'resources/js/report-revenues.js'])
@endpush