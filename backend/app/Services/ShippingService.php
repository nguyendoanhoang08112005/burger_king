<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ShippingService
{
    public function calculate(float $orderAmount, ?float $destLat = null, ?float $destLng = null, ?array $address = null): array
    {
        $method = Setting::get('shipping.method', 'fixed');
        $freeFrom = (float) Setting::get('shipping.free_from_amount', 0);

        // Resolve coordinates if missing but address details are present
        if (($destLat === null || $destLng === null) && !empty($address)) {
            $coords = $this->resolveCoordinates($address);
            if ($coords) {
                $destLat = $coords['lat'];
                $destLng = $coords['lng'];
            }
        }

        // Calculate nearest branch and distance if coordinates are available
        $nearestBranch = null;
        $distanceKm = null;

        if ($destLat !== null && $destLng !== null) {
            try {
                $branches = Branch::where('is_active', true)
                    ->whereNotNull('lat')
                    ->whereNotNull('lng')
                    ->get();

                if ($branches->isNotEmpty()) {
                    $minDistance = null;
                    foreach ($branches as $branch) {
                        $dist = $this->haversine((float) $branch->lat, (float) $branch->lng, $destLat, $destLng);
                        if ($minDistance === null || $dist < $minDistance) {
                            $minDistance = $dist;
                            $nearestBranch = $branch;
                        }
                    }
                    $distanceKm = $minDistance;
                }
            } catch (\Throwable $e) {
                Log::error("Failed to query branches for nearest distance: " . $e->getMessage());
            }

            if ($distanceKm === null) {
                $storeLat = (float) Setting::get('shipping.store_lat', 0);
                $storeLng = (float) Setting::get('shipping.store_lng', 0);
                $distanceKm = $this->haversine($storeLat, $storeLng, $destLat, $destLng);
            }
        }

        if ($freeFrom > 0 && $orderAmount >= $freeFrom) {
            return [
                'fee' => 0,
                'distance_km' => $distanceKm !== null ? round($distanceKm, 1) : null,
                'message' => 'Mien phi giao hang',
                'is_free' => true,
                'out_of_range' => false,
                'lat' => $destLat,
                'lng' => $destLng,
                'nearest_branch_name' => $nearestBranch ? $nearestBranch->name : null,
                'nearest_branch_id' => $nearestBranch ? $nearestBranch->id : null,
            ];
        }

        if ($method === 'free') {
            return [
                'fee' => 0,
                'distance_km' => $distanceKm !== null ? round($distanceKm, 1) : null,
                'message' => 'Mien phi giao hang',
                'is_free' => true,
                'out_of_range' => false,
                'lat' => $destLat,
                'lng' => $destLng,
                'nearest_branch_name' => $nearestBranch ? $nearestBranch->name : null,
                'nearest_branch_id' => $nearestBranch ? $nearestBranch->id : null,
            ];
        }

        if ($method === 'fixed' || !$destLat || !$destLng) {
            return [
                'fee' => (float) Setting::get('shipping.base_fee', 15000),
                'distance_km' => $distanceKm !== null ? round($distanceKm, 1) : null,
                'estimated' => Setting::get('shipping.estimated_time', '30-45 phut'),
                'message' => null,
                'is_free' => false,
                'out_of_range' => false,
                'lat' => $destLat,
                'lng' => $destLng,
                'nearest_branch_name' => $nearestBranch ? $nearestBranch->name : null,
                'nearest_branch_id' => $nearestBranch ? $nearestBranch->id : null,
            ];
        }

        $maxDistance = (float) Setting::get('shipping.max_distance_km', 0);

        if ($maxDistance > 0 && $distanceKm > $maxDistance) {
            return [
                'fee' => null,
                'distance_km' => round($distanceKm, 1),
                'message' => "Cua hang khong giao toi dia chi nay (>{$maxDistance}km)",
                'is_free' => false,
                'out_of_range' => true,
                'lat' => $destLat,
                'lng' => $destLng,
                'nearest_branch_name' => $nearestBranch ? $nearestBranch->name : null,
                'nearest_branch_id' => $nearestBranch ? $nearestBranch->id : null,
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
            'lat' => $destLat,
            'lng' => $destLng,
            'nearest_branch_name' => $nearestBranch ? $nearestBranch->name : null,
            'nearest_branch_id' => $nearestBranch ? $nearestBranch->id : null,
        ];
    }

    private function resolveCoordinates(array $address): ?array
    {
        $province = $address['province'] ?? '';
        $district = $address['district'] ?? '';

        if (empty($province) || empty($district)) {
            return null;
        }

        // 1. Check DB Cache
        $cached = DB::table('district_coordinates')
            ->where('province_name', $province)
            ->where('district_name', $district)
            ->first();

        if ($cached) {
            return [
                'lat' => (float) $cached->lat,
                'lng' => (float) $cached->lng,
            ];
        }

        // 2. Query OSM Nominatim API
        try {
            $query = urlencode("{$district}, {$province}, Vietnam");
            $url = "https://nominatim.openstreetmap.org/search?q={$query}&format=json&limit=1";

            $response = Http::withHeaders([
                'User-Agent' => 'HamburgerKing/1.0 (contact@hamburgerking.com)'
            ])->timeout(5)->get($url);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data[0]['lat']) && !empty($data[0]['lon'])) {
                    $lat = (float) $data[0]['lat'];
                    $lng = (float) $data[0]['lon'];

                    // Cache in DB
                    DB::table('district_coordinates')->insert([
                        'province_name' => $province,
                        'district_name' => $district,
                        'lat' => $lat,
                        'lng' => $lng,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    return ['lat' => $lat, 'lng' => $lng];
                }
            }
        } catch (\Throwable $e) {
            Log::error("Geocoding failed for {$district}, {$province}: " . $e->getMessage());
        }

        return null;
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
