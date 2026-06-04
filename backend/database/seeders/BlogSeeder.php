<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    private function trans($vi, $en = null)
    {
        return [
            'vi' => $vi,
            'en' => $en ?? $vi,
        ];
    }

    public function run(): void
    {
        $posts = [
            [
                'title' => $this->trans('Bí Quyết Nướng Burger Lửa Hồng Chuẩn Vị', 'Secret to Perfect Flame-Grilled Burgers'),
                'category' => 'Bí Quyết Bếp',
                'thumbnail' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1200',
                'video_url' => 'https://www.youtube.com/embed/TVkV2oGPM2k',
                'excerpt' => $this->trans(
                    'Tìm hiểu cách đầu bếp Hamburger King kiểm soát nhiệt, khói và thời gian nghỉ thịt để tạo nên lớp vỏ cháy cạnh chuẩn vị.',
                    'Learn how Hamburger King chefs control heat, smoke, and resting time to create the perfect grilled crust.'
                ),
                'read_time' => 7,
                'content' => $this->trans(
                    <<<'HTML'
<p>Burger ngon bắt đầu từ bề mặt vỉ nướng đủ nóng. Ở Hamburger King, miếng thịt bò được đặt lên vỉ khi nhiệt đạt ngưỡng ổn định, giúp mặt ngoài áp chảo nhanh, khóa nước bên trong và tạo mùi khói đặc trưng.</p>
<p>Đầu bếp không ép miếng thịt trong lúc nướng. Thao tác này giữ lại nước thịt tự nhiên, đồng thời giúp kết cấu bên trong mềm hơn. Sau mỗi mặt nướng, thịt được nghỉ ngắn để nước phân bổ đều trước khi đặt vào bánh brioche đã phết bơ.</p>
<h2>Ba nguyên tắc chính</h2>
<p>Thứ nhất là nhiệt ổn định. Thứ hai là thời gian chính xác. Thứ ba là không che lấp vị thịt bằng quá nhiều sốt. Một lớp phô mai cheddar, rau giòn và sốt vừa đủ sẽ làm nổi bật mùi khói.</p>
<blockquote>Miếng burger ngon không cần phức tạp, nhưng từng giây trên bếp phải được kiểm soát.</blockquote>
<p>Khi phục vụ, bánh được ráp theo thứ tự để phần sốt không làm mềm lớp vỏ quá nhanh. Đây là lý do burger vẫn giữ độ chắc khi giao đến bàn ăn.</p>
HTML
                    ,
                    <<<'HTML'
<p>Good burgers start with a hot grill. At Hamburger King, beef patties are placed on the grill when the temperature reaches an optimal point, searing the outside, sealing the juice inside and generating a signature smoky aroma.</p>
<p>Our chefs do not press the patties while grilling. This locks in the natural juices and keeps the interior texture soft and tender. After grilling, the meat rests briefly before assembling.</p>
<h2>Three Main Rules</h2>
<p>First is consistent heat. Second is precise timing. Third is not masking the beef flavor with too much sauce. A slice of Cheddar cheese, fresh lettuce, and just enough sauce highlights the smoky taste.</p>
<blockquote>A great burger doesn't have to be complicated, but every second on the grill must be controlled.</blockquote>
HTML
                ),
            ],
            [
                'title' => $this->trans('Hành Trình 10 Năm Của Hamburger King Tại Việt Nam', 'Hamburger King\'s 10-Year Journey in Vietnam'),
                'category' => 'Câu Chuyện Thương Hiệu',
                'thumbnail' => 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => $this->trans(
                    'Từ cửa hàng đầu tiên đến mạng lưới chi nhánh trung tâm, Hamburger King xây dựng trải nghiệm burger nướng lửa hồng cho khách Việt.',
                    'From the first store to a network of central branches, Hamburger King built the flame-grilled burger experience for Vietnamese diners.'
                ),
                'read_time' => 6,
                'content' => $this->trans(
                    <<<'HTML'
<p>Mười năm trước, Hamburger King bắt đầu với một bếp nhỏ và một mục tiêu rõ ràng: làm burger nướng lửa hồng có vị đủ mạnh, đủ tươi và đủ ổn định cho khách hàng thành thị.</p>
<h2>2016: Cửa hàng đầu tiên</h2>
<p>Cửa hàng đầu tiên tập trung vào ba dòng burger bò, gà và món ăn kèm. Quy trình nướng được chuẩn hóa theo từng ca để khách ghé buổi trưa hay tối đều nhận cùng một chất lượng.</p>
<h2>Hôm nay</h2>
<p>Hamburger King tiếp tục mở rộng với các chi nhánh trung tâm, menu combo gia đình và chương trình tích điểm cho khách hàng thân thiết.</p>
HTML
                    ,
                    <<<'HTML'
<p>Ten years ago, Hamburger King started with a small kitchen and a clear goal: to make flame-grilled burgers with bold, fresh, and consistent flavors for urban customers.</p>
<h2>2016: The First Store</h2>
<p>Our first store focused on beef burgers, chicken burgers, and sides. The grilling process was standardized so that customers received the same quality every single day.</p>
<h2>Today</h2>
<p>Hamburger King continues to expand with central branches, family combos, and loyalty rewards for regular customers.</p>
HTML
                ),
            ],
            [
                'title' => $this->trans('Top 5 Combo Tiết Kiệm Nhất Cho Cả Gia Đình', 'Top 5 Best Value Combos for the Whole Family'),
                'category' => 'Khuyến Mãi',
                'thumbnail' => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => $this->trans(
                    'So sánh nhanh các combo được đặt nhiều nhất để chọn bữa ăn phù hợp cho nhóm bạn hoặc gia đình.',
                    'Quick comparison of our most popular combos to help you choose the right meal for your friends or family.'
                ),
                'read_time' => 5,
                'content' => $this->trans(
                    <<<'HTML'
<p>Combo là lựa chọn tốt khi bạn muốn cân bằng giữa burger chính, món ăn kèm và đồ uống. Điểm khác biệt nằm ở số lượng người ăn, khẩu vị và mức tiết kiệm thực tế.</p>
<p>Nếu đi theo nhóm, hãy ưu tiên combo có nhiều loại burger để dễ chia vị. Nếu đặt cho trẻ nhỏ, chọn combo có gà giòn và khoai sẽ dễ ăn hơn.</p>
HTML
                    ,
                    <<<'HTML'
<p>Combos are a great choice when you want to balance main burgers, side dishes, and drinks. The difference lies in the number of diners, tastes, and actual savings.</p>
<p>If dining in a group, prioritize combos with various burgers. For kids, choose combos with crispy chicken and fries.</p>
HTML
                ),
            ],
            [
                'title' => $this->trans('Nguyên Liệu Sạch - Cam Kết Từ Trang Trại Đến Bàn Ăn', 'Clean Ingredients - From Farm to Table Commitment'),
                'category' => 'Chất Lượng',
                'thumbnail' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => $this->trans(
                    'Một chiếc burger ngon cần nguyên liệu rõ nguồn gốc, rau tươi, thịt ổn định và quy trình bảo quan nghiêm ngặt.',
                    'A delicious burger requires traceable ingredients, fresh vegetables, consistent meat, and strict handling.'
                ),
                'read_time' => 6,
                'content' => $this->trans(
                    <<<'HTML'
<p>Nguyên liệu sạch không chỉ là khẩu hiệu. Mỗi lô rau, phô mai, bánh và thịt đều cần được kiểm tra trước khi vào bếp. Nhiệt độ bảo quản được ghi nhận theo ca để giảm rủi ro biến đổi chất lượng.</p>
<h2>Rau tươi mỗi ngày</h2>
<p>Xà lách và cà chua được sơ chế theo lượng bán dự kiến, không để qua nhiều ca. Nhờ vậy burger giữ được độ giòn và vị thanh tự nhiên.</p>
HTML
                    ,
                    <<<'HTML'
<p>Clean ingredients are not just a slogan. Every batch of vegetables, cheese, buns, and meat is inspected before entering the kitchen. Storage temperatures are monitored to maintain quality.</p>
<h2>Fresh Greens Daily</h2>
<p>Lettuce and tomatoes are prepared daily based on sales projections, ensuring that every burger stays crisp and refreshing.</p>
HTML
                ),
            ],
            [
                'title' => $this->trans('Review Whopper Double - Chiếc Burger Huyền Thoại', 'Review: Double Whopper - The Legendary Burger'),
                'category' => 'Review Món',
                'thumbnail' => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=1200',
                'excerpt' => $this->trans(
                    'Whopper Double nổi bật với hai lớp bò nướng, phô mai tan chảy, rau giòn và hậu vị khói rõ ràng.',
                    'The Double Whopper features two beef patties, melted cheese, crisp vegetables, and a distinct smoky finish.'
                ),
                'read_time' => 5,
                'content' => $this->trans(
                    <<<'HTML'
<p>Whopper Double là lựa chọn dành cho người muốn vị thịt rõ hơn burger thông thường. Hai lớp bò nướng tạo độ dày tốt, nhưng vẫn không làm món bị nặng nếu ăn cùng rau tươi và sốt vừa phải.</p>
<h2>Điểm nổi bật</h2>
<p>Lớp phô mai giúp kết nối hai miếng thịt, trong khi dưa chua tạo độ cắt vị. Uống kèm Coca-Cola lạnh để tăng hương vị.</p>
HTML
                    ,
                    <<<'HTML'
<p>The Double Whopper is perfect for beef lovers. The double patties offer great thickness while staying balanced with fresh toppings and standard sauce.</p>
<h2>Highlights</h2>
<p>Melted cheese binds the two patties together, while pickles cut through the richness. Pair it with a cold Coca-Cola for the best experience.</p>
HTML
                ),
            ],
        ];

        foreach ($posts as $index => $post) {
            $slugTitle = $post['title']['vi'];
            Post::updateOrCreate(
                ['slug' => Str::slug($slugTitle)],
                [
                    'title' => $post['title'],
                    'category' => $post['category'],
                    'thumbnail' => $post['thumbnail'],
                    'video_url' => $post['video_url'] ?? null,
                    'excerpt' => $post['excerpt'],
                    'content' => $post['content'],
                    'read_time' => $post['read_time'],
                    'slug' => Str::slug($slugTitle),
                    'author' => 'Hamburger King Editorial',
                    'is_published' => true,
                    'published_at' => now()->subDays($index),
                ]
            );
        }
    }
}
