<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;

class PaymentController
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function vnpayCallback(Request $request)
    {
        $request->validate([
            'order_code' => 'required|string',
            'status' => 'required|in:success,failed'
        ]);

        $success = $this->paymentService->processCallback(
            $request->order_code,
            'vnpay',
            $request->status
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if ($success) {
            return redirect($frontendUrl . "/orders/tracking/" . $request->order_code . "?payment=success");
        } else {
            return redirect($frontendUrl . "/orders/tracking/" . $request->order_code . "?payment=failed");
        }
    }

    public function momoCallback(Request $request)
    {
        $request->validate([
            'order_code' => 'required|string',
            'status' => 'required|in:success,failed'
        ]);

        $success = $this->paymentService->processCallback(
            $request->order_code,
            'momo',
            $request->status
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        if ($success) {
            return redirect($frontendUrl . "/orders/tracking/" . $request->order_code . "?payment=success");
        } else {
            return redirect($frontendUrl . "/orders/tracking/" . $request->order_code . "?payment=failed");
        }
    }
}
