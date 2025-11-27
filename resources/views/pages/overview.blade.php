@extends('app')

@section('title', 'Overview')

@section('content')

    <div id="filter-container">
        @include('partials.filter')
    </div>

    <section class="container-fluid-dashboard px-4 py-3">
        <div class="row g-4">

            <!-- 1. Modalab Synthesis -->
            <div class="col-lg-6">
                <div class="card section-card h-100">
                    <div class="card-body p-4 d-flex flex-column">
                        <h5 class="card-title mb-3">Modalab Synthesis</h5>
                        <div class="chart-wrapper">
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
                        <div class="chart-wrapper">
                            <canvas id="salesChannelsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. GMV Evolution (dưới) -->
            <div class="col-12 mt-4">
                <div class="card section-card">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Evolution of GMV over 12 months</h5>
                            <span class="text-warning fw-bold">Growth</span>
                        </div>
                        <div class="chart-wrapper-evolution">
                            <canvas id="gmvEvolutionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

@endsection

@push('scripts')
    {{-- overview uses global `main.js` which initializes charts based on pathname; add page-specific scripts here if needed --}}
@endpush