@extends('layouts.app')

@section('title', 'Customers List')

@section('content')
<div class="container-fluid-dashboard px-4 pb-5">
    
    <div id="filter-container"></div>

    <div class="card section-card shadow-sm">
        <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
            <h5 class="mb-0 fw-semibold text-dark">Top Customers by Revenue</h5>
            <button id="downloadBtn" class="btn btn-sm btn-primary d-flex align-items-center gap-2">
                <i class="fas fa-download"></i> Download
            </button>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 growth-table" id="topCustomerTable">
                    <thead class="bg-light align-middle">
                        <tr>
                            <th class="text-center">Rank</th>
                            <th class="text-center">Customer ID</th>
                            <th>Customer Name</th>
                            <th class="text-end pe-4">Total Spent</th>
                            <th class="text-end pe-4">Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">
                                <i class="fas fa-spinner fa-spin me-2"></i> Loading data from API...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    @vite('resources/js/customers.js')
@endpush