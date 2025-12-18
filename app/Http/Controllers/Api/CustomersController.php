<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Customers;

class CustomersController extends Controller
{
    /**
     * API 1: Danh sách khách hàng & KPI (Có phân trang)
     */
    public function index(Request $request)
    {
        // 1. Query dữ liệu và tính toán
        $query = Customers::query() 
            ->select("customers.CustomerID", "customers.Name", "customers.Email", "customers.Telephone", "customers.City", "customers.Country")

            //Dùng withSum có điều kiện
            //SELECT customers.*, 
                //SUM(LineTotal) AS total_spent
            //FROM customers
                //LEFT JOIN transactions ON customers.CustomerID = transactions.CustomerID
            //GROUP BY customers.CustomerID
            //ORDER BY total_spent DESC;
            
            ->withSum(["transactions as total_spent" => function($q){
                $q->select(DB::raw("COALESCE(SUM(COALESCE(transactions.LineTotal, transactions.Quantity * transactions.UnitPrice)),0)"));
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
                'CustomerID' => $customer->CustomerID,
                'Name' => $customer->Name,
                'Telephone' => $customer->Telephone,
                'Email' => $customer->Email,
                'City' => $customer->City,
                'Country' => $customer->Country,
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
        $customers = Customers::query()
            ->select('CustomerID', 'Name', 'Telephone', 'Email', 'City', 'Country') // Chỉ lấy cột cần thiết
            ->where(function($q) use ($keyword) {
                $q->where('Name', 'LIKE', "%{$keyword}%")
                  ->orWhere('Telephone', 'LIKE', "%{$keyword}%")
                  ->orWhere('Email', 'LIKE', "%{$keyword}%")
                  ->orWhere('CustomerID', 'LIKE', "%{$keyword}%");
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