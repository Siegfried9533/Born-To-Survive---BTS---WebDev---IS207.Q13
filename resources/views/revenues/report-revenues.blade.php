@extends('layouts.app')

@section('title', 'Revenues Report')

@section('content')
<div id="filter-container"></div>

        <div id="filter-container"></div>

        <!-- REPORT SECTION -->
        <section class="container-fluid-dashboard px-4 pb-5">
            <div class="card section-card shadow-sm">


                <!-- HEADER -->
                <div
                    class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                    <h4 class="mb-0 fw-semibold text-dark">Revenue Overview</h4>
                    <div class="d-flex align-items-center gap-2">
                        <select id="viewMode" class="form-select w-auto">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                            <i class="fas fa-download"></i>
                            <span>Download</span>
                        </button>
                    </div>
                </div>


                <!-- BODY -->
                <div class="card-body">


                    <!-- SUMMARY CARDS -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-4">
                            <div class="summary-card p-3 rounded shadow-sm">
                                <h6 class="mb-1 text-secondary">Total Revenue</h6>
                                <p id="sumRevenue" class="summary-value">$0</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="summary-card p-3 rounded shadow-sm">
                                <h6 class="mb-1 text-secondary">Monthly Growth</h6>
                                <p id="monthlyGrowth" class="summary-value text-success">+0%</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="summary-card p-3 rounded shadow-sm">
                                <h6 class="mb-1 text-secondary">Active Stores</h6>
                                <p id="activeStores" class="summary-value">0</p>
                            </div>
                        </div>
                    </div>


                    <div class="row g-3 mb-4">
                        <div class="col-lg-6">
                            <div class="chart-card shadow-sm p-3 rounded">
                                <h5 class="mb-3 fw-semibold">Revenue Trend</h5>
                                <div class="chart-container" style="position: relative; height: 320px; width: 100%;">
                                    <canvas id="lineChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6">
                            <div class="chart-card shadow-sm p-3 rounded">
                                <h5 class="mb-3 fw-semibold">Revenue Comparison</h5>
                                <div class="chart-container" style="position: relative; height: 320px; width: 100%;">
                                    <canvas id="barChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="chart-card shadow-sm p-3 rounded mt-3">
                                <h5 class="mb-3 fw-semibold">Category Distribution</h5>
                                <div class="chart-container" style="position: relative; height: 400px; width: 100%;">
                                    <canvas id="pieChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- TABLE -->
                    <div class="table-responsive mt-4">
                        <table class="table table-hover align-middle mb-0 growth-table" id="revenueTable">
                            <thead class="bg-light">
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
    @vite('resources/js/report-revenues.js')
@endpush