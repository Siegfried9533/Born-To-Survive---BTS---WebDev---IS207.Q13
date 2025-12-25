@extends('layouts.app')

@section('title', 'My Profile')

@section('content')

<div class="container-fluid mt-4">
    <div class="row">
        <div class="col-lg-8">
            <div class="card profile-card shadow-sm">
                <div class="card-body">

                    <div class="d-flex align-items-center mb-4">
                        <img src="/assets/images/avatar.jpg" alt="Avatar" class="profile-avatar me-3">
                        <div>
                            <div>
                                <h5 class="mb-0 fw-bold" id="profileName"></h5>
                                <span class="text-muted fs-small" id="profileEmail"></span>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm ms-auto" id="btn-edit-profile">Edit</button>
                    </div>
                    <hr>

                    <form class="mt-4">
                        <div class="mb-3">
                            <label for="fullName" class="form-label fs-small fw-bold">Full Name</label>
                            <input type="text" class="form-control profile-input" id="fullName" value="" disabled>
                        </div>

                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="gender" class="form-label fs-small fw-bold">Gender</label>
                                <select class="form-select profile-input" id="gender" disabled>
                                    <option value="F" selected>Female</option>
                                    <option value="M">Male</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="dob-picker" class="form-label fs-small fw-bold">Date of Birth</label>
                                <div class="input-group">
                                    <span class="input-group-text profile-input-icon">
                                        <i class="fa-solid fa-calendar-days"></i>
                                    </span>
                                    <input type="text" class="form-control" id="dob-picker" placeholder="Select date" readonly disabled>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="country" class="form-label fs-small fw-bold">Country</label>
                                <input type="text" class="form-control profile-input" id="country" placeholder="Your Country" disabled>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="timeZone" class="form-label fs-small fw-bold">Time Zone</label>
                            <select class="form-select profile-input" id="timeZone" disabled>
                                <option value="Asia/Bangkok" selected>(UTC+07:00) Bangkok, Hanoi, Jakarta</option>
                                <option value="Asia/Kuala_Lumpur">(UTC+08:00) Kuala Lumpur, Singapore</option>
                                <option value="Asia/Tokyo">(UTC+09:00) Tokyo, Seoul</option>
                                <option value="Europe/Paris">(UTC+02:00) Paris, Berlin</option>
                                <option value="America/New_York">(UTC-04:00) New York, Toronto</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="address" class="form-label fs-small fw-bold">Address</label>
                            <input type="text" class="form-control profile-input" id="address" placeholder="Your Address" disabled>
                        </div>

                        <hr class="my-4">

                        <h5 class="fw-bold mb-4">Security Settings</h5>
                        <div class="mb-3">
                            <label for="email" class="form-label fs-small fw-bold">Email Address</label>
                            <input type="email" class="form-control" id="email" value="" disabled>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fs-small fw-bold">Password</label>
                            <div class="d-flex align-items-center">
                                <span class="text-muted">Reset your password</span>
                                <a href="/reset-password" class="btn btn-sm btn-outline-primary ms-3">Reset</a>
                            </div>
                        </div>

                </div>
            </div>
        </div>

@endsection
    
@push('scripts')
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/utc.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/timezone.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="/frontend/js/profile.js"></script>
@endpush