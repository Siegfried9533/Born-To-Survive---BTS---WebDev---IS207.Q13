@extends('layouts.app')

@section('title', 'Report Customers')

@section('content')
<div id="filter-container"></div>
<div class="container-fluid px-4 py-4">
            <!-- 1. Customer Overview + Gender Distribution (cùng 1 hàng) -->
            <div class="d-flex align-items-center mb-4">
                <h4 class="mb-0 fw-bold">Customer Overview</h4>
            </div>
            <div class="row g-4 mb-4">
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            Purchasing Customers
                            <button class="btn btn-sm btn-outline-primary download-btn" data-target="overview">
                                <i class="fas fa-download me-1"></i>Download CSV
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="mb-4">
                                <div class="d-flex justify-content-between small text-muted mb-1"><span>Total
                                        Customers</span><span id="total-customers">0</span></div>
                                <div class="progress" style="height:20px">
                                    <div class="progress-bar bg-primary" style="width:100%"></div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <div class="d-flex justify-content-between small text-muted mb-1"><span>Ever
                                        Purchased</span><span id="ever-purchased">0</span></div>
                                <div class="progress" style="height:20px">
                                    <div class="progress-bar bg-success" id="bar-purchased"></div>
                                </div>
                            </div>
                            <div>
                                <div class="d-flex justify-content-between small text-muted mb-1"><span>New
                                        Customers</span><span id="new-customers">0</span></div>
                                <div class="progress" style="height:20px">
                                    <div class="progress-bar bg-info" id="bar-new"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            Gender Distribution
                            <button class="btn btn-sm btn-outline-primary download-btn" data-target="gender">
                                <i class="fas fa-download me-1"></i>Download CSV
                            </button>
                        </div>
                        <div class="card-body d-flex align-items-center justify-content-center position-relative">
                            <canvas id="genderChart" class="gender-doughnut-canvas"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Customer Recency (toàn chiều rộng) -->
            <!-- Customer Recency  -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                    Customer Recency (Days Since Last Purchase)
                    <button class="btn btn-sm btn-outline-primary download-btn" data-target="recency">
                        <i class="fas fa-download me-1"></i>Download CSV
                    </button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table mb-0 recency-table" id="recencyTable">
                            <!-- JS sẽ fill toàn bộ nội dung ở đây -->
                        </table>
                    </div>
                </div>
            </div>

            <!-- 3. New Customer Segments + Purchase Frequency (cùng 1 hàng) -->
            <div class="row g-4 mb-4">
                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            New Customer Segments
                            <button class="btn btn-sm btn-outline-primary download-btn" data-target="new-segments">
                                <i class="fas fa-download me-1"></i>Download CSV
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <table class="table table-hover mb-0 growth-table" id="newCustomerTable"></table>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            Purchase Frequency Analysis
                            <button class="btn btn-sm btn-outline-primary download-btn" data-target="frequency">
                                <i class="fas fa-download me-1"></i>Download CSV
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <table class="table table-hover mb-0 growth-table" id="frequencyTable"></table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. Top Customers (toàn chiều rộng, giống hệt Sales) -->
            <div class="card shadow-sm border-0">
                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                    Top Customers
                    <button class="btn btn-sm btn-outline-primary download-btn" data-target="top-customers">
                        <i class="fas fa-download me-1"></i>Download CSV
                    </button>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 top-growth-table align-middle" id="topCustomerTable">
                            <thead>
                                <tr>
                                    <th style="width:10%">Rank</th>
                                    <th style="width:20%">Customer ID</th>
                                    <th style="width:35%">Customer Name</th>
                                    <th class="text-end pe-4" style="width:20%">Revenue</th>
                                    <th class="text-end pe-4" style="width:15%">Orders</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
@endsection