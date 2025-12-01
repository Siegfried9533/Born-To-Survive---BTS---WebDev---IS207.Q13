<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modalab Dashboard Gauge</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        /* Tùy chỉnh Font (Tùy chọn) */
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .card-custom {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            background: white;
            padding: 30px;
            width: 350px;
            /* Độ rộng thẻ */
        }

        .gauge-container {
            position: relative;
            width: 100%;
            height: 160px;
            /* Chiều cao bằng 1/2 chiều rộng + padding */
            display: flex;
            justify-content: center;
            overflow: hidden;
            /* Ẩn phần thừa nếu có */
        }

        /* SVG Styling */
        .gauge-svg {
            width: 100%;
            height: auto;
            transform: rotate(0deg);
            /* Đảm bảo không bị xoay lệch */
        }

        /* Đường nền (Track) */
        .gauge-bg {
            fill: none;
            stroke: #e9ecef;
            /* Màu xám nhạt cho phần chưa đạt */
            stroke-width: 20;
            /* Độ dày của đường */
            stroke-linecap: round;
            /* Bo tròn đầu */
        }

        /* Đường tiến độ (Progress) */
        .gauge-progress {
            fill: none;
            stroke: url(#gradientColor);
            /* Dùng Gradient định nghĩa trong HTML */
            stroke-width: 20;
            stroke-linecap: round;
            /* Bo tròn đầu */
            transition: stroke-dashoffset 1.5s ease-out;
            /* Hiệu ứng chạy mượt */
        }

        /* Text hiển thị */
        .gauge-info {
            text-align: center;
            margin-top: -40px;
            /* Kéo text lên lồng vào cung tròn */
            position: relative;
            z-index: 10;
        }

        .percent-text {
            font-size: 3rem;
            font-weight: 700;
            color: #198754;
            /* Màu xanh lá đậm (Bootstrap success darken) */
            line-height: 1;
        }

        .sub-text {
            color: #6c757d;
            font-size: 0.9rem;
            font-weight: 500;
            margin-top: 5px;
        }

        .card-title {
            font-weight: 700;
            color: #212529;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

    <div class="card card-custom text-center">
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
            <div class="percent-text">87.3%</div>
            <div class="sub-text">1.087 / 1.247 Billion</div>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            // CẤU HÌNH GIÁ TRỊ TẠI ĐÂY
            const percent = 87.3; // Giá trị % muốn hiển thị

            const progressBar = document.getElementById('progress-bar');

            // Tính toán chiều dài của đường path (cung tròn)
            // getTotalLength() là hàm có sẵn của SVG path
            const totalLength = progressBar.getTotalLength();

            // Thiết lập stroke-dasharray bằng chiều dài cung (tạo nét đứt dài bằng cả cung)
            progressBar.style.strokeDasharray = totalLength;

            // Ban đầu ẩn toàn bộ (offset = totalLength)
            progressBar.style.strokeDashoffset = totalLength;

            // Tính toán offset cần thiết để hiển thị đúng %
            // Công thức: Offset = Tổng dài - (Tổng dài * % / 100)
            const offset = totalLength - (totalLength * percent / 100);

            // Set timeout nhỏ để CSS transition hoạt động (tạo hiệu ứng chạy)
            setTimeout(() => {
                progressBar.style.strokeDashoffset = offset;
            }, 100);
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>