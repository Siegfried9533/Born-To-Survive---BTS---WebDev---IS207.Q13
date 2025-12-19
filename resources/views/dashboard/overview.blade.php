@extends('layouts.overview')

@section('title', 'Overview')

@section('header')
    @include('partials.overview-header')
@endsection

@section('content')

    {{-- Loading Overlay --}}
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading data...</p>
        </div>
    </div>

    {{-- Bộ lọc riêng cho Overview (chỉ chọn Store) --}}
    @include('partials.overview-filter')

    <section class="container-fluid-dashboard px-4 py-3">
        <div class="row g-4">

            <!-- 1. Modalab Synthesis -->
            <div class="col-lg-6">
                <div class="card section-card h-100">
                    <div class="card-body p-4 d-flex flex-column">
                        <h5 class="card-title mb-3">Modalab Synthesis</h5>
                        <div class="chart-wrapper" style="height: 300px; position: relative;">
                            <canvas id="modalabChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Sales Channels -->
            <div class="col-lg-6">
                <div class="card section-card h-100">
                    <div class="card-body p-4 d-flex flex-column">
                        <h5 class="card-title mb-3">Percentage of Products Sold</h5>
                        <div class="chart-wrapper" style="height: 300px; position: relative;">
                            <canvas id="salesChannelsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. GMV Evolution (bottom) -->
            <div class="col-12 mt-4">
                <div class="card section-card">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Evolution of GMV over 12 months</h5>
                            <span class="text-warning fw-bold">Growth</span>
                        </div>
                        <div class="chart-wrapper-evolution" style="height: 350px; position: relative;">
                            <canvas id="gmvEvolutionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

@endsection

@push('scripts')
    {{-- Litepicker CDN cho date-range đôi --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css">
    <script src="https://cdn.jsdelivr.net/npm/litepicker/dist/litepicker.js"></script>
    @vite('resources/js/overview.js')
@endpush