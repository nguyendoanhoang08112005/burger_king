<?php

namespace App\Services;

use App\Models\Setting;

class ShippingService
{
    public function calculate(float $orderAmount, ?float $destLat = null, ?float $destLng = null): array
    {
        $method = Setting::get('shipping.method', 'fixed');
        $freeFrom = (float) Setting::get('shipping.free_from_amount', 0);

        if ($freeFrom > 0 && $orderAmount >= $freeFrom) {
            return [
                'fee' => 0,
                'distance_km' => null,
                'message' => 'Mien phi giao hang',
                'is_free' => true,
                'out_of_range' => false,
            ];
        }

        if ($method === 'free') {
            return [
                'fee' => 0,
                'distance_km' => null,
                'message' => 'Mien phi giao hang',
                'is_free' => true,
                'out_of_range' => false,
            ];
        }

        if ($method === 'fixed' || !$destLat || !$destLng) {
            return [
                'fee' => (float) Setting::get('shipping.base_fee', 15000),
                'distance_km' => null,
                'estimated' => Setting::get('shipping.estimated_time', '30-45 phut'),
                'message' => null,
                'is_free' => false,
                'out_of_range' => false,
            ];
        }

        $storeLat = (float) Setting::get('shipping.store_lat', 0);
        $storeLng = (float) Setting::get('shipping.store_lng', 0);
        $distanceKm = $this->haversine($storeLat, $storeLng, $destLat, $destLng);
        $maxDistance = (float) Setting::get('shipping.max_distance_km', 0);

        if ($maxDistance > 0 && $distanceKm > $maxDistance) {
            return [
                'fee' => null,
                'distance_km' => round($distanceKm, 1),
                'message' => "Chung toi chua giao den khu vuc nay (>{$maxDistance}km)",
                'is_free' => false,
                'out_of_range' => true,
            ];
        }

        $fee = $this->tierFee($distanceKm);

        return [
            'fee' => $fee,
            'distance_km' => round($distanceKm, 1),
            'estimated' => Setting::get('shipping.estimated_time', '30-45 phut'),
            'message' => null,
            'is_free' => false,
            'out_of_range' => false,
        ];
    }

    private function tierFee(float $distanceKm): float
    {
        $tiers = Setting::get('shipping.distance_tiers', []);
        if (is_array($tiers) && count($tiers) > 0) {
            foreach ($tiers as $tier) {
                if ($distanceKm <= (float) ($tier['max_km'] ?? 0)) {
                    return (float) ($tier['fee'] ?? 0);
                }
            }
        }

        $baseFee = (float) Setting::get('shipping.base_fee', 15000);
        $perKm = (float) Setting::get('shipping.per_km_fee', 5000);

        return ceil(($baseFee + (max(0, $distanceKm - 1) * $perKm)) / 1000) * 1000;
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
