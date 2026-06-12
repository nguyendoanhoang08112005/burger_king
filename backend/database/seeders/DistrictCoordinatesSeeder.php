<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DistrictCoordinatesSeeder extends Seeder
{
    public function run(): void
    {
        $districts = [
            // Thành phố Hồ Chí Minh (Ho Chi Minh City)
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 1',
                'lat' => 10.7758439,
                'lng' => 106.7017555,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 3',
                'lat' => 10.7843695,
                'lng' => 106.6812937,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 4',
                'lat' => 10.7578262,
                'lng' => 106.7012971,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 5',
                'lat' => 10.7540281,
                'lng' => 106.6633749,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 6',
                'lat' => 10.7480927,
                'lng' => 106.6353161,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 7',
                'lat' => 10.734034,
                'lng' => 106.721579,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 8',
                'lat' => 10.724088,
                'lng' => 106.628626,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 10',
                'lat' => 10.774581,
                'lng' => 106.666986,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 11',
                'lat' => 10.762961,
                'lng' => 106.650081,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận 12',
                'lat' => 10.867153,
                'lng' => 106.64075,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Bình Thạnh',
                'lat' => 10.810583,
                'lng' => 106.709142,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Gò Vấp',
                'lat' => 10.838678,
                'lng' => 106.66529,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Phú Nhuận',
                'lat' => 10.799194,
                'lng' => 106.680264,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Tân Bình',
                'lat' => 10.799042,
                'lng' => 106.646074,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Tân Phú',
                'lat' => 10.790074,
                'lng' => 106.618253,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Quận Bình Tân',
                'lat' => 10.765258,
                'lng' => 106.581417,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Thành phố Thủ Đức',
                'lat' => 10.849409,
                'lng' => 106.753705,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Huyện Bình Chánh',
                'lat' => 10.687392,
                'lng' => 106.591347,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Huyện Hóc Môn',
                'lat' => 10.8833,
                'lng' => 106.5833,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Huyện Củ Chi',
                'lat' => 10.9833,
                'lng' => 106.5,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Huyện Nhà Bè',
                'lat' => 10.6952,
                'lng' => 106.7297,
            ],
            [
                'province_name' => 'Thành phố Hồ Chí Minh',
                'district_name' => 'Huyện Cần Giờ',
                'lat' => 10.5078,
                'lng' => 106.8776,
            ],

            // Thành phố Hà Nội (Hanoi)
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Hoàn Kiếm',
                'lat' => 21.0285,
                'lng' => 105.8542,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Ba Đình',
                'lat' => 21.0362,
                'lng' => 105.8277,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Đống Đa',
                'lat' => 21.0118,
                'lng' => 105.8262,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Hai Bà Trưng',
                'lat' => 21.0069,
                'lng' => 105.8488,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Tây Hồ',
                'lat' => 21.0583,
                'lng' => 105.8167,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Cầu Giấy',
                'lat' => 21.0361,
                'lng' => 105.7903,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Thanh Xuân',
                'lat' => 20.9937,
                'lng' => 105.8118,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Hoàng Mai',
                'lat' => 20.9723,
                'lng' => 105.8742,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Long Biên',
                'lat' => 21.0423,
                'lng' => 105.8942,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Nam Từ Liêm',
                'lat' => 21.0183,
                'lng' => 105.7761,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Bắc Từ Liêm',
                'lat' => 21.0694,
                'lng' => 105.7733,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Quận Hà Đông',
                'lat' => 20.9667,
                'lng' => 105.7833,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Thị xã Sơn Tây',
                'lat' => 21.1378,
                'lng' => 105.5042,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Gia Lâm',
                'lat' => 21.0167,
                'lng' => 105.95,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Đông Anh',
                'lat' => 21.1333,
                'lng' => 105.8333,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Thanh Trì',
                'lat' => 20.9452,
                'lng' => 105.8378,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Sóc Sơn',
                'lat' => 21.2583,
                'lng' => 105.85,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Hoài Đức',
                'lat' => 21.0167,
                'lng' => 105.7,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Quốc Oai',
                'lat' => 20.9902,
                'lng' => 105.6267,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Thanh Oai',
                'lat' => 20.875,
                'lng' => 105.7833,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Thường Tín',
                'lat' => 20.8667,
                'lng' => 105.85,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Phú Xuyên',
                'lat' => 20.7833,
                'lng' => 105.9,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Mỹ Đức',
                'lat' => 20.7,
                'lng' => 105.7333,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Ứng Hòa',
                'lat' => 20.7667,
                'lng' => 105.8,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Chương Mỹ',
                'lat' => 20.8833,
                'lng' => 105.7,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Đan Phượng',
                'lat' => 21.1,
                'lng' => 105.6667,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Phúc Thọ',
                'lat' => 21.1083,
                'lng' => 105.5902,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Ba Vì',
                'lat' => 21.1789,
                'lng' => 105.3853,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Thạch Thất',
                'lat' => 21.0167,
                'lng' => 105.5667,
            ],
            [
                'province_name' => 'Thành phố Hà Nội',
                'district_name' => 'Huyện Mê Linh',
                'lat' => 21.1723,
                'lng' => 105.7167,
            ],
        ];

        foreach ($districts as $d) {
            DB::table('district_coordinates')->updateOrInsert(
                [
                    'province_name' => $d['province_name'],
                    'district_name' => $d['district_name'],
                ],
                [
                    'lat' => $d['lat'],
                    'lng' => $d['lng'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
