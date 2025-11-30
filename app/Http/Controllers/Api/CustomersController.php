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
    public function index(){
        //1. Query dữ liệu và tính toán
        $customers = Customers::query() 
            -> select("customers.CusID", "customers.Name", "customers.Phone", "customers.Email")
            
            //Dùng withSum có điều kiện
            //SELECT customers.*, 
                //SUM(invoice_lines.Quantity * invoice_lines.UnitPrice - invoice_lines.Discount) AS total_spent
            ///FROM customers
                //LEFT JOIN invoices ON customers.CusID = invoices.CusID
                //LEFT JOIN invoice_lines ON invoices.InvoiceID = invoice_lines.InvoiceID
            //GROUP BY customers.CusID
            //ORDER BY total_spent DESC;
            
            -> withSum(["invoices as total_spent" => function($query){
                $query->join("invoice_lines", "invoices.InvoiceID", "=", "invoice_lines.InvoiceID")
                    -> select(DB::raw("SUM(invoice_lines.Quantity * invoice_lines.UnitPrice  - invoice_lines.Discount)"));
            }], 'total_spent')

            //Sắp xếp ai nhiều tiền nhất đưa lên đầu
           -> orderByDesc('total_spent')
           //Phân trang lấy 10 người mỗi lần tải
           -> paginate(10);
        
           //2. Biến đổi dữ liệu
           //Gắn nhãn khách hàng (VIP, Gold, Member) dựa trên tổng chi tiêu
              $customers->getCollection()->transform(function($customers){
                $money = $customers->total_spent ?? 0;

                if($money >= 1000000){
                    $customers->label = "VIP";
                } else if ($money >= 500000){
                    $customers->label = "Gold";
                } else {
                    $customers->label = "Member";
                }

                return [
                    'CusID' => $customers->CusID,
                    'Name' => $customers->Name,
                    'Phone' => $customers->Phone,
                    'Email' => $customers->Email,
                    'total_spent' => number_format($money) . ' VND',
                    'rank' => $customers->label
                ];
              });

              //3. Trả JSON
                return response()->json([
                    'status' => 'success',
                    'message' => 'Lấy danh sách khách hàng thành công',
                    'data' => $customers
                ]);
    }

    public function search(Request $request){

        $keyword = $request->input('keyword');

        if (!$keyword) {
             return response()->json([
                'status' => 'error', 
                'message' => 'Vui lòng nhập từ khóa'
            ]);
        }

        $customers = Customers::query()
            ->where('Name', 'LIKE', "%{$keyword}%")
            ->orWhere('Phone', 'LIKE', "%{$keyword}%")
            ->orWhere('Email', 'LIKE', "%{$keyword}%")
            ->limit(20)
            ->get();

        return response()->json([
            'status' => 'success',
            'total_found' => $customers->count(),
            'data' => $customers
        ]); 
    }
}
