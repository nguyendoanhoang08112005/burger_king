<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => 'Bí Quyết Nướng Burger Lửa Hồng Chuẩn Vị',
                'category' => 'Bí Quyết Bếp',
                'thumbnail' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200',
                'video_url' => 'https://www.youtube.com/embed/TVkV2oGPM2k',
                'excerpt' => 'Tìm hiểu cách đầu bếp Hamburger King kiểm soát nhiệt, khói và thời gian nghỉ thịt để tạo nên lớp vỏ cháy cạnh chuẩn vị.',
                'read_time' => 7,
                'content' => <<<'HTML'
<p>Burger ngon bắt đầu từ bề mặt vỉ nướng đủ nóng. Ở Hamburger King, miếng thịt bò được đặt lên vỉ khi nhiệt đạt ngưỡng ổn định, giúp mặt ngoài áp chảo nhanh, khóa nước bên trong và tạo mùi khói đặc trưng.</p>
<p>Đầu bếp không ép miếng thịt trong lúc nướng. Thao tác này giữ lại nước thịt tự nhiên, đồng thời giúp kết cấu bên trong mềm hơn. Sau mỗi mặt nướng, thịt được nghỉ ngắn để nước phân bổ đều trước khi đặt vào bánh brioche đã phết bơ.</p>
<img src="https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&q=80&w=1200" alt="Burger trên bếp nướng">
<h2>Ba nguyên tắc chính</h2>
<p>Thứ nhất là nhiệt ổn định. Thứ hai là thời gian chính xác. Thứ ba là không che lấp vị thịt bằng quá nhiều sốt. Một lớp phô mai cheddar, rau giòn và sốt vừa đủ sẽ làm nổi bật mùi khói.</p>
<blockquote>Miếng burger ngon không cần phức tạp, nhưng từng giây trên bếp phải được kiểm soát.</blockquote>
<img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200" alt="Burger hoàn thiện">
<p>Khi phục vụ, bánh được ráp theo thứ tự để phần sốt không làm mềm lớp vỏ quá nhanh. Đây là lý do burger vẫn giữ độ chắc khi giao đến bàn ăn.</p>
HTML
            ],
            [
                'title' => 'Hành Trình 10 Năm Của Hamburger King Tại Việt Nam',
                'category' => 'Câu Chuyện Thương Hiệu',
                'thumbnail' => 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => 'Từ cửa hàng đầu tiên đến mạng lưới chi nhánh trung tâm, Hamburger King xây dựng trải nghiệm burger nướng lửa hồng cho khách Việt.',
                'read_time' => 6,
                'content' => <<<'HTML'
<p>Mười năm trước, Hamburger King bắt đầu với một bếp nhỏ và một mục tiêu rõ ràng: làm burger nướng lửa hồng có vị đủ mạnh, đủ tươi và đủ ổn định cho khách hàng thành thị.</p>
<h2>2016: Cửa hàng đầu tiên</h2>
<p>Cửa hàng đầu tiên tập trung vào ba dòng burger bò, gà và món ăn kèm. Quy trình nướng được chuẩn hóa theo từng ca để khách ghé buổi trưa hay tối đều nhận cùng một chất lượng.</p>
<img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=1200" alt="Cửa hàng burger">
<h2>2020: Mở rộng giao hàng</h2>
<p>Khi nhu cầu đặt món tăng, hệ thống đóng gói được thiết kế lại. Bánh, khoai và sốt được tách nhiệt hợp lý để món vẫn ngon khi di chuyển.</p>
<h2>Hôm nay</h2>
<p>Hamburger King tiếp tục mở rộng với các chi nhánh trung tâm, menu combo gia đình và chương trình tích điểm cho khách hàng thân thiết.</p>
HTML
            ],
            [
                'title' => 'Top 5 Combo Tiết Kiệm Nhất Cho Cả Gia Đình',
                'category' => 'Khuyến Mãi',
                'thumbnail' => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => 'So sánh nhanh các combo được đặt nhiều nhất để chọn bữa ăn phù hợp cho nhóm bạn hoặc gia đình.',
                'read_time' => 5,
                'content' => <<<'HTML'
<p>Combo là lựa chọn tốt khi bạn muốn cân bằng giữa burger chính, món ăn kèm và đồ uống. Điểm khác biệt nằm ở số lượng người ăn, khẩu vị và mức tiết kiệm thực tế.</p>
<table><thead><tr><th>Combo</th><th>Phù hợp</th><th>Ưu điểm</th></tr></thead><tbody><tr><td>Family Flame</td><td>4 người</td><td>Nhiều burger bò, tiết kiệm cao</td></tr><tr><td>Couple Set</td><td>2 người</td><td>Dễ chia, đủ món kèm</td></tr><tr><td>Lunch Value</td><td>1 người</td><td>Nhanh, gọn, giá tốt</td></tr></tbody></table>
<p>Nếu đi theo nhóm, hãy ưu tiên combo có nhiều loại burger để dễ chia vị. Nếu đặt cho trẻ nhỏ, chọn combo có gà giòn và khoai sẽ dễ ăn hơn.</p>
<img src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=1200" alt="Combo burger">
HTML
            ],
            [
                'title' => 'Nguyên Liệu Sạch - Cam Kết Từ Trang Trại Đến Bàn Ăn',
                'category' => 'Chất Lượng',
                'thumbnail' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => 'Một chiếc burger ngon cần nguyên liệu rõ nguồn gốc, rau tươi, thịt ổn định và quy trình bảo quản nghiêm ngặt.',
                'read_time' => 6,
                'content' => <<<'HTML'
<p>Nguyên liệu sạch không chỉ là khẩu hiệu. Mỗi lô rau, phô mai, bánh và thịt đều cần được kiểm tra trước khi vào bếp. Nhiệt độ bảo quản được ghi nhận theo ca để giảm rủi ro biến đổi chất lượng.</p>
<img src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=1200" alt="Rau củ tươi">
<h2>Rau tươi mỗi ngày</h2>
<p>Xà lách và cà chua được sơ chế theo lượng bán dự kiến, không để qua nhiều ca. Nhờ vậy burger giữ được độ giòn và vị thanh tự nhiên.</p>
<blockquote>Từ trang trại đến bàn ăn là một chuỗi kiểm soát, không phải một bước kiểm tra cuối cùng.</blockquote>
HTML
            ],
            [
                'title' => 'Review Whopper Double - Chiếc Burger Huyền Thoại',
                'category' => 'Review Món',
                'thumbnail' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => 'Whopper Double nổi bật với hai lớp bò nướng, phô mai tan chảy, rau giòn và hậu vị khói rõ ràng.',
                'read_time' => 5,
                'content' => <<<'HTML'
<p>Whopper Double là lựa chọn dành cho người muốn vị thịt rõ hơn burger thông thường. Hai lớp bò nướng tạo độ dày tốt, nhưng vẫn không làm món bị nặng nếu ăn cùng rau tươi và sốt vừa phải.</p>
<img src="https://images.unsplash.com/photo-1606755962773-d324e2dabd2f?auto=format&fit=crop&q=80&w=1200" alt="Lớp burger">
<h2>Điểm nổi bật</h2>
<p>Lớp phô mai giúp kết nối hai miếng thịt, trong khi dưa chua tạo độ cắt vị. Khi ăn nóng, phần bánh brioche mềm và thơm bơ là điểm cộng lớn.</p>
<blockquote>Đánh giá: 4.8/5 cho độ đậm vị, độ no và cảm giác nướng lửa hồng.</blockquote>
HTML
            ],
        ];

        foreach ($posts as $index => $post) {
            Post::updateOrCreate(
                ['slug' => Str::slug($post['title'])],
                [
                    ...$post,
                    'slug' => Str::slug($post['title']),
                    'author' => 'Hamburger King Editorial',
                    'is_published' => true,
                    'published_at' => now()->subDays($index),
                ]
            );
        }
    }
}
