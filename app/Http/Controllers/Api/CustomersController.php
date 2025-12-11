<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Customers;
use App\Models\Invoices;
use App\Models\InvoiceLines;

class CustomersController extends Controller
{
    /**
     * API 1: Danh sách khách hàng & KPI (Có phân trang)
     */
    public function index(Request $request)
    {
        // 1. Query dữ liệu và tính toán
        $query = Customers::query() 
            ->select("customers.CusID", "customers.Name", "customers.Phone", "customers.Email")

            //Dùng withSum có điều kiện
            //SELECT customers.*, 
                //SUM(invoice_lines.Quantity * invoice_lines.UnitPrice - invoice_lines.Discount) AS total_spent
            ///FROM customers
                //LEFT JOIN invoices ON customers.CusID = invoices.CusID
                //LEFT JOIN invoice_lines ON invoices.InvoiceID = invoice_lines.InvoiceID
            //GROUP BY customers.CusID
            //ORDER BY total_spent DESC;
            
            ->withSum(["invoices as total_spent" => function($q){
                // LƯU Ý: Tên bảng trong DB của bạn là 'invoice_lines'
                $q->join("invoice_lines", "invoices.InvoiceID", "=", "invoice_lines.InvoiceID")
                  // Công thức: (Số lượng * Đơn giá) - Giảm giá
                  ->select(DB::raw("SUM((invoice_lines.Quantity * invoice_lines.UnitPrice) - invoice_lines.Discount)"));
            }], 'total_spent')

            ->orderByDesc('total_spent');

        // 2. Xử lý Phân trang hoặc Lấy hết (cho chức năng Export)
        if ($request->input('limit') === 'all') {
            $customers = $query->get();
        } else {
            $customers = $query->paginate(10);
        }
        
        // 3. Biến đổi dữ liệu (Transformation)
        // Dùng biến $dataSet để xử lý chung cho cả 2 trường hợp (Phân trang và Không phân trang)
        $dataSet = ($request->input('limit') === 'all') ? $customers : $customers->getCollection();

        $formattedData = $dataSet->map(function($customer){ // Sửa biến $customers -> $customer (số ít)
            
            $money = $customer->total_spent ?? 0;

            // Logic xếp hạng
            if($money >= 10000000){
                $rank = "VIP";
            } else if ($money >= 5000000){
                $rank = "Gold";
            } else {
                $rank = "Member";
            }

            return [
                'CusID' => $customer->CusID,
                'Name' => $customer->Name,
                'Phone' => $customer->Phone,
                'Email' => $customer->Email,
                'total_spent' => $money, // Giữ số nguyên để JS tính toán nếu cần
                'formatted_spent' => number_format($money) . ' VND',
                'rank' => $rank
            ];
        });

        // Gán lại dữ liệu đã format
        if ($request->input('limit') === 'all') {
            $finalData = $formattedData;
        } else {
            $customers->setCollection($formattedData);
            $finalData = $customers;
        }

        // 4. Trả JSON
        return response()->json([
            'status' => 'success',
            'message' => 'Lấy danh sách khách hàng thành công',
            'data' => $finalData
        ]);
    }

    /**
     * API 2: Tìm kiếm thông minh (Smart Search)
     */
    public function search(Request $request)
    {
        $keyword = $request->input('keyword');

        if (!$keyword) {
             return response()->json([
                'status' => 'error', 
                'message' => 'Vui lòng nhập từ khóa (keyword)'
            ]);
        }

        // Tìm kiếm đa năng (Tên OR SĐT OR Email OR ID)
                // Dùng đúng model Customers (đã được import ở đầu file)
                $customers = Customers::query()
            ->select('CusID', 'Name', 'Phone', 'Email') // Chỉ lấy cột cần thiết
            ->where(function($q) use ($keyword) {
                $q->where('Name', 'LIKE', "%{$keyword}%")
                  ->orWhere('Phone', 'LIKE', "%{$keyword}%")
                  ->orWhere('Email', 'LIKE', "%{$keyword}%")
                  ->orWhere('CusID', 'LIKE', "%{$keyword}%");
            })
            ->limit(20) // Giới hạn 20 kết quả
            ->get();

        // Format lại dữ liệu tìm kiếm (nếu cần hiển thị Rank luôn ở đây thì phải tính toán như trên)
        // Tạm thời trả về raw data
        return response()->json([
            'status' => 'success',
            'total_found' => $customers->count(),
            'data' => $customers
        ]); 
    }
}