<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Retrieve category IDs by slug
        $cat = Category::pluck('id', 'slug');

        $products = [
            // ═══════════════════════════════════════════
            // 🍔 BURGERS
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Whopper',
                'slug'              => 'whopper',
                'description'       => 'Biểu tượng vĩ đại của Hamburger King! Miếng thịt bò Mỹ nướng lửa hồng đậm đà vị khói, phủ xà lách giòn, cà chua tươi, hành tây, dưa chuột muối và sốt mayonnaise đặc biệt trong lớp bánh mè vàng nướng thơm.',
                'short_description' => 'Burger bò nướng lửa hồng huyền thoại — biểu tượng Hamburger King.',
                'base_price'        => 89000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Double Whopper',
                'slug'              => 'double-whopper',
                'description'       => 'Gấp đôi sức mạnh! Hai tầng thịt bò Mỹ nướng lửa than hồng kết hợp cùng rau tươi giòn ngọt, dưa chuột muối chua thanh, hành tây và sốt signature — thỏa mãn mọi tín đồ burger chính hiệu.',
                'short_description' => 'Phiên bản 2 lớp bò nướng khổng lồ của Whopper huyền thoại.',
                'base_price'        => 119000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Cheeseburger',
                'slug'              => 'cheeseburger',
                'description'       => 'Hương vị kinh điển không bao giờ lỗi thời. Thịt bò nướng mọng nước phủ lát phô mai Cheddar tan chảy béo ngậy, kẹp cùng dưa chuột muối, sốt mù tạt và tương cà chua truyền thống.',
                'short_description' => 'Burger bò phủ phô mai Cheddar kinh điển mọi thời đại.',
                'base_price'        => 59000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Double Cheeseburger',
                'slug'              => 'double-cheeseburger',
                'description'       => 'Hai lớp thịt bò nướng hoàn hảo, mỗi lớp phủ một lát phô mai Cheddar tan chảy kéo sợi, kết hợp cùng dưa chuột muối giòn và sốt mù tạt mật ong ngọt dịu đặc biệt.',
                'short_description' => 'Cheeseburger phiên bản kép — gấp đôi phô mai, gấp đôi ngon.',
                'base_price'        => 79000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Bacon King',
                'slug'              => 'bacon-king',
                'description'       => 'Vua của mọi vị giác! Hai lớp thịt bò nướng lửa hồng phủ bốn lát bacon xông khói giòn rụm, hai lát phô mai Mỹ kéo sợi, sốt mayonnaise và tương cà — đậm đà không thể cưỡng lại.',
                'short_description' => 'Burger bò đỉnh cao với 4 lát bacon giòn phủ phô mai kép.',
                'base_price'        => 129000,
                'sale_price'        => 109000,
                'thumbnail'         => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 5,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Chicken Burger',
                'slug'              => 'chicken-burger',
                'description'       => 'Phi lê gà chiên giòn tan bên ngoài, mềm mọng nước bên trong, kết hợp cùng xà lách tươi, cà chua thái lát và sốt mayonnaise thanh nhẹ trong bánh mì mè nướng thơm.',
                'short_description' => 'Burger gà chiên giòn rụm, hương vị nhẹ nhàng thanh tao.',
                'base_price'        => 69000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 6,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Fish Burger',
                'slug'              => 'fish-burger',
                'description'       => 'Phi lê cá tuyết Alaska tẩm bột chiên giòn vàng óng, phủ lát phô mai béo ngậy và sốt tartar kem tươi đặc biệt — hương vị đại dương trong từng miếng cắn.',
                'short_description' => 'Burger cá tuyết chiên giòn phủ sốt tartar kem tươi.',
                'base_price'        => 75000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 7,
            ],
            [
                'category_id'       => $cat['burgers'],
                'name'              => 'Veggie Burger',
                'slug'              => 'veggie-burger',
                'description'       => 'Lựa chọn xanh cho tín đồ healthy! Patty rau củ nướng giòn thơm kết hợp avocado tươi, xà lách romaine, cà chua và sốt pesto rau mùi hấp dẫn — ngon lành mà không cần thịt.',
                'short_description' => 'Burger chay nguyên chất với patty rau củ nướng và avocado.',
                'base_price'        => 65000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 8,
            ],

            // ═══════════════════════════════════════════
            // 🍗 CHICKEN
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['chicken'],
                'name'              => 'Crispy Chicken',
                'slug'              => 'crispy-chicken',
                'description'       => 'Miếng ức gà nguyên thớ tẩm bột chiên giòn rụm bên ngoài, giữ trọn độ mềm mọng nước bên trong. Lớp vỏ vàng óng thơm phức ăn kèm sốt BBQ hun khói — siêu hấp dẫn!',
                'short_description' => 'Ức gà tẩm bột chiên giòn vàng óng, mọng nước bên trong.',
                'base_price'        => 65000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['chicken'],
                'name'              => 'Chicken Nuggets (6 miếng)',
                'slug'              => 'chicken-nuggets-6',
                'description'       => '6 viên gà nuggets tẩm bột chiên giòn xù vàng ruộm, thịt gà xay mịn thơm ngon bên trong. Chấm kèm sốt BBQ hoặc sốt chua ngọt — món ăn vặt hoàn hảo mọi lúc mọi nơi.',
                'short_description' => '6 viên gà chiên giòn xù chấm sốt tùy chọn.',
                'base_price'        => 55000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['chicken'],
                'name'              => 'Chicken Fries',
                'slug'              => 'chicken-fries',
                'description'       => 'Thanh gà tẩm bột chiên giòn cắt dạng que khoai tây — sáng tạo độc đáo kết hợp hương vị gà và khoai. Giòn tan bên ngoài, mềm ngọt bên trong, chấm sốt BBQ hun khói tuyệt đỉnh.',
                'short_description' => 'Que gà chiên giòn kiểu mới, phong cách khoai tây sáng tạo.',
                'base_price'        => 49000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['chicken'],
                'name'              => 'Spicy Chicken Burger',
                'slug'              => 'spicy-chicken-burger',
                'description'       => 'Phi lê gà chiên giòn tẩm ướp ớt Cayenne cay nồng đậm đà, phủ sốt Sriracha lửa, xà lách iceberg giòn mát và lát cà chua tươi — bùng nổ vị cay trong từng miếng cắn!',
                'short_description' => 'Burger gà chiên giòn phiên bản cay nồng bùng nổ.',
                'base_price'        => 75000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1513185158878-8d8c2a2a3e3d?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
            [
                'category_id'       => $cat['chicken'],
                'name'              => 'Chicken Wings (6 miếng)',
                'slug'              => 'chicken-wings-6',
                'description'       => '6 cánh gà chiên giòn tẩm ướp gia vị đặc biệt, phủ đẫm sốt Buffalo cay nồng hoặc sốt BBQ hun khói ngọt dịu. Da giòn tan, thịt mềm mọng — đỉnh cao của món gà chiên.',
                'short_description' => '6 cánh gà chiên giòn phủ sốt Buffalo hoặc BBQ đặc biệt.',
                'base_price'        => 89000,
                'sale_price'        => 79000,
                'thumbnail'         => 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 5,
            ],

            // ═══════════════════════════════════════════
            // 🍟 SIDES
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['sides'],
                'name'              => 'French Fries',
                'slug'              => 'french-fries',
                'description'       => 'Khoai tây nhập khẩu cắt thanh chiên giòn vàng óng rắc muối biển tinh khiết. Nóng hổi, thơm phức, giòn tan — món ăn kèm không thể thiếu cho mọi bữa burger hoàn hảo.',
                'short_description' => 'Khoai tây chiên giòn vàng rắc muối biển, nóng hổi thơm phức.',
                'base_price'        => 29000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['sides'],
                'name'              => 'Onion Rings',
                'slug'              => 'onion-rings',
                'description'       => 'Vòng hành tây tẩm bột chiên giòn xù vàng ruộm, bên trong là lát hành ngọt mềm tan trong miệng. Chấm kèm sốt ranch kem tươi — hương vị đỉnh cao của món ăn kèm.',
                'short_description' => 'Hành tây chiên xù giòn rụm, ngọt mềm bên trong.',
                'base_price'        => 35000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['sides'],
                'name'              => 'Mozzarella Sticks',
                'slug'              => 'mozzarella-sticks',
                'description'       => 'Thanh phô mai Mozzarella bọc bột chiên giòn tan, kéo sợi béo ngậy đầy hấp dẫn. Chấm kèm sốt marinara cà chua chua ngọt — món ăn vặt khiến bạn không thể dừng lại.',
                'short_description' => 'Phô mai que Mozzarella chiên giòn kéo sợi béo ngậy.',
                'base_price'        => 45000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['sides'],
                'name'              => 'Hash Browns',
                'slug'              => 'hash-browns',
                'description'       => 'Bánh khoai tây nghiền ép chiên giòn vàng óng hai mặt, bên ngoài giòn rụm bên trong mềm dẻo ngọt bùi. Món ăn sáng hoàn hảo hoặc side dish tuyệt vời cho burger.',
                'short_description' => 'Bánh khoai tây chiên giòn hai mặt, mềm dẻo bên trong.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1619740455993-9d701af6f8ac?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
            [
                'category_id'       => $cat['sides'],
                'name'              => 'Corn Cup',
                'slug'              => 'corn-cup',
                'description'       => 'Bắp ngọt hạt vàng óng hấp chín dẻo mềm, rắc bơ và phô mai Parmesan thơm ngậy. Một ly bắp nhỏ xinh ngọt ngào — món ăn kèm nhẹ nhàng cho mọi bữa ăn.',
                'short_description' => 'Bắp ngọt hấp rắc bơ phô mai Parmesan thơm ngậy.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 5,
            ],

            // ═══════════════════════════════════════════
            // 🥗 SALADS
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['salads'],
                'name'              => 'Caesar Salad',
                'slug'              => 'caesar-salad',
                'description'       => 'Salad Caesar truyền thống với xà lách romaine giòn tươi, bánh mì nướng crouton giòn tan, phô mai Parmesan bào mỏng và sốt Caesar đậm đà kem tươi — thanh nhẹ mà sang trọng.',
                'short_description' => 'Salad Caesar kinh điển với sốt kem và phô mai Parmesan.',
                'base_price'        => 45000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['salads'],
                'name'              => 'Chicken Caesar Salad',
                'slug'              => 'chicken-caesar-salad',
                'description'       => 'Caesar Salad phiên bản đặc biệt với ức gà nướng thái lát mỏng, romaine tươi giòn, crouton vàng giòn và phô mai Parmesan phủ sốt Caesar béo ngậy — no bụng mà vẫn healthy.',
                'short_description' => 'Caesar Salad phiên bản cao cấp kèm ức gà nướng.',
                'base_price'        => 55000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1580013759032-c96505e24c1f?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['salads'],
                'name'              => 'Garden Salad',
                'slug'              => 'garden-salad',
                'description'       => 'Salad vườn tươi mát với hỗn hợp rau xanh organic, cà chua bi đỏ mọng, dưa chuột giòn, cà rốt bào và hành tím thái mỏng. Ăn kèm sốt vinaigrette chanh dây thanh chua.',
                'short_description' => 'Salad rau vườn organic tươi mát kèm sốt vinaigrette.',
                'base_price'        => 35000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['salads'],
                'name'              => 'Fresh Vegetable Salad',
                'slug'              => 'fresh-vegetable-salad',
                'description'       => 'Đĩa salad rau củ tươi sống đa sắc màu gồm ớt chuông, bắp cải tím, cà rốt, đậu Hà Lan và ngô ngọt. Phủ hạt hướng dương rang và sốt mè rang Nhật Bản thơm bùi.',
                'short_description' => 'Salad rau củ tươi đa sắc kèm sốt mè rang Nhật Bản.',
                'base_price'        => 39000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],

            // ═══════════════════════════════════════════
            // 🌯 WRAPS & SANDWICHES
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['wraps-sandwiches'],
                'name'              => 'Chicken Wrap',
                'slug'              => 'chicken-wrap',
                'description'       => 'Cuốn tortilla mềm mại nhân gà nướng thái sợi, xà lách romaine giòn, cà chua thái hạt lựu, phô mai Cheddar bào và sốt ranch kem tươi — bữa ăn nhanh gọn mà no bụng lâu.',
                'short_description' => 'Wrap gà nướng cuốn tortilla mềm kèm sốt ranch béo ngậy.',
                'base_price'        => 55000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['wraps-sandwiches'],
                'name'              => 'Spicy Wrap',
                'slug'              => 'spicy-wrap',
                'description'       => 'Cuốn wrap tortilla lửa cay với gà chiên giòn tẩm ớt Cayenne, rau trộn cole slaw giòn ngọt, jalapeño thái lát và sốt Sriracha mayo đậm đà — phiên bản cay nồng cho fan cuốn wrap.',
                'short_description' => 'Wrap gà chiên cay phủ sốt Sriracha mayo bùng nổ vị giác.',
                'base_price'        => 59000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['wraps-sandwiches'],
                'name'              => 'Grilled Chicken Sandwich',
                'slug'              => 'grilled-chicken-sandwich',
                'description'       => 'Sandwich bánh mì nướng giòn kẹp phi lê gà áp chảo thơm phức, xà lách iceberg tươi mát, cà chua bò thái lát dày và sốt pesto rau mùi thơm nức — bữa trưa tinh tế đầy đủ dinh dưỡng.',
                'short_description' => 'Sandwich gà nướng áp chảo kẹp bánh mì giòn sốt pesto.',
                'base_price'        => 69000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],

            // ═══════════════════════════════════════════
            // 🥤 DRINKS
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Coca-Cola',
                'slug'              => 'coca-cola',
                'description'       => 'Nước ngọt có ga Coca-Cola mát lạnh sảng khoái, hương vị kinh điển không bao giờ lỗi thời. Ly nước giải khát hoàn hảo đi kèm mọi bữa burger nóng hổi.',
                'short_description' => 'Coca-Cola mát lạnh sảng khoái — hương vị kinh điển.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Sprite',
                'slug'              => 'sprite',
                'description'       => 'Nước ngọt có ga Sprite vị chanh mát lạnh tươi mới, sảng khoái tức thì. Hương chanh tự nhiên nhẹ nhàng giúp thanh lọc vị giác sau bữa ăn đậm đà.',
                'short_description' => 'Sprite vị chanh mát lạnh, thanh khiết sảng khoái.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Fanta',
                'slug'              => 'fanta',
                'description'       => 'Nước ngọt có ga Fanta hương cam tươi mát, sủi bọt vui vẻ đầy sắc màu. Vị cam ngọt thanh nhẹ nhàng — lựa chọn giải khát tuyệt vời cho mọi lứa tuổi.',
                'short_description' => 'Fanta hương cam sủi bọt tươi mát, ngọt thanh dễ uống.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Iced Tea',
                'slug'              => 'iced-tea',
                'description'       => 'Trà đá truyền thống pha từ trà xanh Thái Nguyên thơm nhẹ, thêm đường phèn vừa miệng và đá viên mát lạnh. Hương vị quen thuộc thanh mát giải nhiệt ngày hè.',
                'short_description' => 'Trà đá truyền thống thanh mát, giải khát tức thì.',
                'base_price'        => 20000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Coffee',
                'slug'              => 'coffee',
                'description'       => 'Cà phê đen đậm đà pha từ hạt Robusta Buôn Ma Thuột rang xay thủ công, hương thơm nồng nàn. Uống nóng hoặc đá tùy sở thích — tỉnh táo sau bữa ăn ngon.',
                'short_description' => 'Cà phê đen Robusta rang xay thủ công, đậm đà thơm nồng.',
                'base_price'        => 30000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 5,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Milkshake Chocolate',
                'slug'              => 'milkshake-chocolate',
                'description'       => 'Milkshake socola đặc quánh pha từ kem tươi nhập khẩu và bột cacao Bỉ nguyên chất, phủ kem tươi whipped cream và bột cacao rắc mịn. Ngọt ngào, béo mịn — thiên đường cho tín đồ socola.',
                'short_description' => 'Milkshake socola Bỉ đặc quánh phủ kem tươi whipped cream.',
                'base_price'        => 45000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 6,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Milkshake Vanilla',
                'slug'              => 'milkshake-vanilla',
                'description'       => 'Milkshake vanilla thơm dịu pha từ kem tươi nguyên chất và tinh chất vanilla Madagascar. Đặc mịn, ngọt nhẹ, phủ whipped cream và hạt vụn cookie — vị thanh tao sang trọng.',
                'short_description' => 'Milkshake vanilla Madagascar mịn màng phủ kem tươi.',
                'base_price'        => 45000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1568901839119-631418a3910d?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 7,
            ],
            [
                'category_id'       => $cat['drinks'],
                'name'              => 'Milkshake Strawberry',
                'slug'              => 'milkshake-strawberry',
                'description'       => 'Milkshake dâu tây tươi hồng ngọt ngào pha từ kem tươi và dâu tây Đà Lạt chín mọng. Phủ whipped cream và lát dâu tươi — hương vị lãng mạn cho ngày đẹp trời.',
                'short_description' => 'Milkshake dâu tây Đà Lạt tươi hồng phủ kem và dâu tươi.',
                'base_price'        => 45000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 8,
            ],

            // ═══════════════════════════════════════════
            // 🍨 DESSERTS
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['desserts'],
                'name'              => 'Sundae',
                'slug'              => 'sundae',
                'description'       => 'Sundae kem mát lạnh phủ sốt socola hoặc caramel đậm đà, rắc đậu phộng rang giòn và whipped cream bông tuyết. Món tráng miệng hoàn hảo kết thúc bữa ăn tuyệt vời.',
                'short_description' => 'Sundae kem phủ sốt socola/caramel và đậu phộng rang giòn.',
                'base_price'        => 29000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['desserts'],
                'name'              => 'Ice Cream Cone',
                'slug'              => 'ice-cream-cone',
                'description'       => 'Ốc quế kem tươi mát lạnh xoắn cao đỉnh, kem vanilla mịn như lụa tan chảy nhẹ nhàng trên lớp vỏ wafer giòn thơm. Món tráng miệng nhỏ xinh mà hạnh phúc lớn.',
                'short_description' => 'Ốc quế kem vanilla mịn xoắn cao trên vỏ wafer giòn.',
                'base_price'        => 20000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['desserts'],
                'name'              => 'Chocolate Brownie',
                'slug'              => 'chocolate-brownie',
                'description'       => 'Brownie socola Bỉ nướng vừa chín tới, bên ngoài hơi giòn nhẹ bên trong mềm ẩm đậm vị cacao. Phủ sốt socola nóng và một viên kem vanilla — sự kết hợp hoàn hảo nóng-lạnh.',
                'short_description' => 'Brownie socola Bỉ mềm ẩm phủ sốt nóng kèm kem vanilla.',
                'base_price'        => 35000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['desserts'],
                'name'              => 'Apple Pie',
                'slug'              => 'apple-pie',
                'description'       => 'Bánh táo nướng giòn rụm vỏ vàng óng, nhân táo xanh thái miếng nấu với quế, đường nâu và bơ — thơm phức nóng hổi. Hương vị cổ điển Mỹ quen thuộc đầy hoài niệm.',
                'short_description' => 'Bánh táo nướng vỏ giòn nhân táo quế thơm nức — kiểu Mỹ.',
                'base_price'        => 25000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a7?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
            [
                'category_id'       => $cat['desserts'],
                'name'              => 'Cookie',
                'slug'              => 'cookie',
                'description'       => 'Cookie socola chip nướng tươi hàng ngày, bên ngoài giòn nhẹ bên trong mềm dẻo xốp, đầy ắp socola chip Belgium tan chảy. Hoàn hảo để nhấm nháp cùng cà phê hoặc milkshake.',
                'short_description' => 'Cookie socola chip nướng tươi mỗi ngày, mềm dẻo thơm ngon.',
                'base_price'        => 22000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 5,
            ],

            // ═══════════════════════════════════════════
            // 👨‍👩‍👧‍👦 COMBO MEALS
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['combo-meals'],
                'name'              => 'Whopper Combo',
                'slug'              => 'whopper-combo',
                'description'       => 'Combo tiết kiệm nhất cho tín đồ Whopper! 1 Whopper huyền thoại + 1 French Fries cỡ M giòn tan + 1 Coca-Cola cỡ M mát lạnh. Tiết kiệm hơn mua lẻ tới 15% — bữa ăn trọn vẹn trong một lựa chọn.',
                'short_description' => 'Combo Whopper + Fries M + Coca M — tiết kiệm 15%.',
                'base_price'        => 109000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['combo-meals'],
                'name'              => 'Chicken Combo',
                'slug'              => 'chicken-combo',
                'description'       => 'Combo gà giòn ngon lành! 1 Crispy Chicken chiên giòn + 1 French Fries cỡ M + 1 Sprite cỡ M thanh mát. Bữa ăn nhanh gọn mà chất lượng, tiết kiệm hơn mua lẻ 15%.',
                'short_description' => 'Combo Crispy Chicken + Fries M + Sprite M — tiết kiệm 15%.',
                'base_price'        => 99000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['combo-meals'],
                'name'              => 'Family Combo',
                'slug'              => 'family-combo',
                'description'       => 'Bữa tiệc gia đình đầm ấm! 2 Whopper + 2 Crispy Chicken + 4 French Fries cỡ L + 4 Drinks cỡ L. Combo siêu tiết kiệm cho gia đình 4 người — giảm tới 20% so với mua lẻ.',
                'short_description' => 'Combo gia đình 4 người — 2 Whopper + 2 Gà + 4 Fries + 4 Drinks.',
                'base_price'        => 449000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => true,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['combo-meals'],
                'name'              => 'Kids Meal',
                'slug'              => 'kids-meal',
                'description'       => 'Combo đặc biệt cho các bé yêu! 1 Kids Burger phần nhỏ vừa vặn + 1 Kids Fries giòn ngon + 1 Juice Box trái cây tự nhiên. Phần ăn vui nhộn, bổ dưỡng cho các nhà vô địch nhí.',
                'short_description' => 'Combo bé yêu — Kids Burger + Fries nhỏ + Juice Box.',
                'base_price'        => 79000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],

            // ═══════════════════════════════════════════
            // 🧒 KIDS MENU
            // ═══════════════════════════════════════════
            [
                'category_id'       => $cat['kids-menu'],
                'name'              => 'Kids Burger',
                'slug'              => 'kids-burger',
                'description'       => 'Burger bò phần nhỏ dành riêng cho bé với miếng thịt bò mềm mại, phô mai Cheddar tan chảy, sốt tương cà ngọt dịu và bánh mì mềm xốp. Hương vị nhẹ nhàng, kích thước vừa vặn cho bé.',
                'short_description' => 'Burger bò nhỏ xinh phủ phô mai, dành riêng cho bé yêu.',
                'base_price'        => 55000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 1,
            ],
            [
                'category_id'       => $cat['kids-menu'],
                'name'              => 'Kids Nuggets (4 miếng)',
                'slug'              => 'kids-nuggets-4',
                'description'       => '4 viên gà nuggets nhỏ xinh chiên giòn vàng, thịt gà mềm mịn bên trong. Chấm kèm sốt chua ngọt hoặc sốt BBQ — món ăn vặt yêu thích của mọi bé.',
                'short_description' => '4 viên nuggets gà giòn nhỏ xinh cho bé — chấm sốt tùy chọn.',
                'base_price'        => 39000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 2,
            ],
            [
                'category_id'       => $cat['kids-menu'],
                'name'              => 'Kids Fries',
                'slug'              => 'kids-fries',
                'description'       => 'Khoai tây chiên phần nhỏ dành cho bé, vàng giòn rắc muối nhẹ. Phần lượng vừa đủ để bé thưởng thức mà không lo đầy bụng — snack yêu thích của mọi nhà vô địch nhí.',
                'short_description' => 'Khoai tây chiên phần nhỏ vừa vặn, giòn ngon cho bé.',
                'base_price'        => 19000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 3,
            ],
            [
                'category_id'       => $cat['kids-menu'],
                'name'              => 'Juice Box',
                'slug'              => 'juice-box',
                'description'       => 'Hộp nước trái cây tự nhiên 200ml cho bé, không đường nhân tạo, không chất bảo quản. Hương cam hoặc táo tươi mát — giải khát lành mạnh cho các thiên thần nhỏ.',
                'short_description' => 'Nước trái cây hộp 200ml tự nhiên cho bé — cam hoặc táo.',
                'base_price'        => 20000,
                'sale_price'        => null,
                'thumbnail'         => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=400',
                'is_featured'       => false,
                'is_available'      => true,
                'sort_order'        => 4,
            ],
        ];

        $translations = [
            'whopper' => [
                'name' => 'Whopper',
                'short_description' => 'Legendary flame-grilled beef burger — the icon of Hamburger King.',
                'description' => 'The ultimate icon of Hamburger King! Flame-grilled US beef patty with rich smoky flavor, topped with crisp lettuce, fresh tomatoes, onions, pickles, and special mayonnaise in a toasted sesame bun.'
            ],
            'double-whopper' => [
                'name' => 'Double Whopper',
                'short_description' => 'Giant double-layer flame-grilled beef version of the legendary Whopper.',
                'description' => 'Double the power! Two flame-grilled US beef patties combined with fresh crisp vegetables, pickles, onions, and signature sauce — satisfying every true burger lover.'
            ],
            'cheeseburger' => [
                'name' => 'Cheeseburger',
                'short_description' => 'Classic beef burger topped with melted Cheddar cheese.',
                'description' => 'A classic flavor that never goes out of style. Juicy grilled beef patty topped with rich melted Cheddar cheese, pickles, mustard, and traditional ketchup.'
            ],
            'double-cheeseburger' => [
                'name' => 'Double Cheeseburger',
                'short_description' => 'Double Cheeseburger — double cheese, double the taste.',
                'description' => 'Two perfectly grilled beef patties, each topped with a slice of melted Cheddar cheese, combined with crisp pickles and a mild honey mustard sauce.'
            ],
            'bacon-king' => [
                'name' => 'Bacon King',
                'short_description' => 'Premium beef burger with 4 strips of crispy bacon and double cheese.',
                'description' => 'The king of flavors! Two flame-grilled beef patties topped with four strips of crispy smoked bacon, two slices of American cheese, mayonnaise, and ketchup — absolutely irresistible.'
            ],
            'chicken-burger' => [
                'name' => 'Chicken Burger',
                'short_description' => 'Crispy fried chicken burger, light and delicious flavor.',
                'description' => 'Crispy fried chicken fillet on the outside, tender and juicy inside, combined with fresh lettuce, sliced tomatoes, and light mayonnaise in a toasted sesame bun.'
            ],
            'fish-burger' => [
                'name' => 'Fish Burger',
                'short_description' => 'Crispy cod fish burger topped with creamy tartar sauce.',
                'description' => 'Golden breaded Alaska cod fish fillet, topped with a slice of rich cheese and special creamy tartar sauce — ocean flavor in every bite.'
            ],
            'veggie-burger' => [
                'name' => 'Veggie Burger',
                'short_description' => 'Pure vegetarian burger with grilled veggie patty and fresh avocado.',
                'description' => 'A green choice for healthy eaters! A crispy grilled veggie patty combined with fresh avocado, romaine lettuce, tomatoes, and aromatic cilantro pesto sauce — delicious without meat.'
            ],
            'crispy-chicken' => [
                'name' => 'Crispy Chicken',
                'short_description' => 'Crispy golden breaded chicken breast, juicy inside.',
                'description' => 'Whole chicken breast breaded and fried to a perfect crunch on the outside while keeping its juicy tenderness inside. Served with smoky BBQ sauce — super delicious!'
            ],
            'chicken-nuggets-6' => [
                'name' => 'Chicken Nuggets (6 pcs)',
                'short_description' => '6 crispy breaded chicken nuggets with choice of sauce.',
                'description' => '6 golden crispy chicken nuggets, tender and flavorful inside. Served with BBQ or sweet & sour sauce — the perfect snack anytime, anywhere.'
            ],
            'chicken-fries' => [
                'name' => 'Chicken Fries',
                'short_description' => 'New crispy chicken strips in a creative french fry style.',
                'description' => 'Crispy breaded chicken strips cut into french fry shapes — a unique creation combining chicken and fry flavors. Crispy outside, tender inside, with smoky BBQ sauce.'
            ],
            'spicy-chicken-burger' => [
                'name' => 'Spicy Chicken Burger',
                'short_description' => 'Crispy fried chicken burger in a spicy explosive version.',
                'description' => 'Crispy fried chicken fillet seasoned with spicy Cayenne pepper, topped with fiery Sriracha sauce, crisp iceberg lettuce, and fresh tomatoes — explosive heat in every bite!'
            ],
            'chicken-wings-6' => [
                'name' => 'Chicken Wings (6 pcs)',
                'short_description' => '6 crispy fried chicken wings with special Buffalo or BBQ sauce.',
                'description' => '6 crispy chicken wings seasoned with special spices, tossed in fiery Buffalo or sweet smoky BBQ sauce. Crispy skin, tender meat — the peak of fried chicken.'
            ],
            'french-fries' => [
                'name' => 'French Fries',
                'short_description' => 'Crispy golden french fries sprinkled with sea salt, hot and aromatic.',
                'description' => 'Imported french fries cut and fried to a golden crisp, sprinkled with pure sea salt. Hot, fragrant, and crispy — an essential side for the perfect burger.'
            ],
            'onion-rings' => [
                'name' => 'Onion Rings',
                'short_description' => 'Crisp breaded onion rings, sweet and soft inside.',
                'description' => 'Breaded onion rings fried to a golden crunch, featuring sweet, tender onion inside. Served with creamy ranch sauce — the ultimate side dish.'
            ],
            'mozzarella-sticks' => [
                'name' => 'Mozzarella Sticks',
                'short_description' => 'Crispy fried Mozzarella sticks with rich stretchy cheese.',
                'description' => 'Mozzarella cheese sticks coated in breadcrumbs and fried to a golden crisp, stretchy and rich. Served with tangy marinara sauce — a snack you cannot resist.'
            ],
            'hash-browns' => [
                'name' => 'Hash Browns',
                'short_description' => 'Crispy hash browns fried on both sides, soft and tender inside.',
                'description' => 'Shredded potato patties fried to a golden crisp on both sides, crunchy outside and soft inside. A perfect breakfast or a great side dish for burgers.'
            ],
            'corn-cup' => [
                'name' => 'Corn Cup',
                'short_description' => 'Steamed sweet corn topped with butter and fragrant Parmesan cheese.',
                'description' => 'Steamed golden sweet corn kernels, tossed in butter and rich Parmesan cheese. A sweet, warm cup of corn — a light and delightful side dish.'
            ],
            'caesar-salad' => [
                'name' => 'Caesar Salad',
                'short_description' => 'Classic Caesar Salad with creamy dressing and Parmesan cheese.',
                'description' => 'Traditional Caesar Salad with crisp romaine lettuce, crunchy croutons, shaved Parmesan, and rich, creamy Caesar dressing — light yet elegant.'
            ],
            'chicken-caesar-salad' => [
                'name' => 'Chicken Caesar Salad',
                'short_description' => 'Premium Caesar Salad with sliced grilled chicken breast.',
                'description' => 'Special Caesar Salad featuring sliced grilled chicken breast, crisp romaine, golden croutons, and Parmesan cheese tossed in rich Caesar dressing — filling yet healthy.'
            ],
            'garden-salad' => [
                'name' => 'Garden Salad',
                'short_description' => 'Fresh organic garden salad with vinaigrette dressing.',
                'description' => 'Fresh garden salad with a mix of organic greens, cherry tomatoes, cucumbers, carrots, and red onions. Served with tangy passion fruit vinaigrette.'
            ],
            'fresh-vegetable-salad' => [
                'name' => 'Fresh Vegetable Salad',
                'short_description' => 'Colorful fresh vegetable salad with Japanese roasted sesame dressing.',
                'description' => 'A colorful plate of fresh raw vegetables including bell peppers, purple cabbage, carrots, peas, and sweet corn. Topped with sunflower seeds and fragrant roasted sesame dressing.'
            ],
            'chicken-wrap' => [
                'name' => 'Chicken Wrap',
                'short_description' => 'Grilled chicken wrap in soft tortilla with rich ranch dressing.',
                'description' => 'Soft tortilla wrap filled with sliced grilled chicken, crisp romaine, diced tomatoes, Cheddar cheese, and creamy ranch dressing — quick and satisfying.'
            ],
            'spicy-wrap' => [
                'name' => 'Spicy Wrap',
                'short_description' => 'Spicy chicken wrap with Sriracha mayo for an explosive flavor.',
                'description' => 'Spicy tortilla wrap with crispy chicken seasoned in Cayenne, sweet coleslaw, sliced jalapeños, and rich Sriracha mayo — a fiery version for wrap lovers.'
            ],
            'grilled-chicken-sandwich' => [
                'name' => 'Grilled Chicken Sandwich',
                'short_description' => 'Pan-seared grilled chicken sandwich with crispy bread and pesto.',
                'description' => 'Toasted sandwich loaded with fragrant pan-seared chicken fillet, fresh iceberg lettuce, sliced tomatoes, and aromatic cilantro pesto — a nutritious lunch choice.'
            ],
            'coca-cola' => [
                'name' => 'Coca-Cola',
                'short_description' => 'Ice-cold refreshing Coca-Cola — the classic taste.',
                'description' => 'Chilled sparkling Coca-Cola, a classic flavor that never fades. The perfect refreshing beverage to accompany your hot burger.'
            ],
            'sprite' => [
                'name' => 'Sprite',
                'short_description' => 'Ice-cold lemon Sprite, crisp and refreshing.',
                'description' => 'Sparkling lemon Sprite, cold and refreshing. A light natural lemon flavor to cleanse your palate after a savory meal.'
            ],
            'fanta' => [
                'name' => 'Fanta',
                'short_description' => 'Sparkling orange Fanta, sweet and easy to drink.',
                'description' => 'Sparkling Fanta with a refreshing orange flavor, fun and colorful. A sweet orange taste — a great beverage for all ages.'
            ],
            'iced-tea' => [
                'name' => 'Iced Tea',
                'short_description' => 'Traditional iced tea, cool and instant thirst-quencher.',
                'description' => 'Traditional iced tea brewed from fragrant green tea, lightly sweetened with rock sugar and served chilled. A familiar refreshing drink to beat the summer heat.'
            ],
            'coffee' => [
                'name' => 'Coffee',
                'short_description' => 'Hand-roasted Robusta black coffee, bold and aromatic.',
                'description' => 'Rich black coffee brewed from hand-roasted Buôn Ma Thuột Robusta beans. Enjoy hot or iced — keep awake and refreshed after a delicious meal.'
            ],
            'milkshake-chocolate' => [
                'name' => 'Milkshake Chocolate',
                'short_description' => 'Thick Belgian chocolate milkshake topped with whipped cream.',
                'description' => 'Thick chocolate milkshake made from imported cream and pure Belgian cocoa powder, topped with whipped cream and cocoa powder. Sweet and creamy — chocolate heaven.'
            ],
            'milkshake-vanilla' => [
                'name' => 'Milkshake Vanilla',
                'short_description' => 'Smooth Madagascar vanilla milkshake topped with whipped cream.',
                'description' => 'Fragrant vanilla milkshake made with fresh cream and Madagascar vanilla extract. Thick, smooth, lightly sweetened, and topped with whipped cream and cookie crumbs.'
            ],
            'milkshake-strawberry' => [
                'name' => 'Milkshake Strawberry',
                'short_description' => 'Fresh pink Da Lat strawberry milkshake topped with whipped cream.',
                'description' => 'Sweet pink milkshake made with fresh cream and ripe Da Lat strawberries. Topped with whipped cream and a strawberry slice — a romantic flavor.'
            ],
            'sundae' => [
                'name' => 'Sundae',
                'short_description' => 'Ice cream sundae topped with chocolate/caramel sauce and peanuts.',
                'description' => 'Cold ice cream sundae topped with rich chocolate or caramel sauce, roasted peanuts, and whipped cream. The perfect dessert to complete an amazing meal.'
            ],
            'ice-cream-cone' => [
                'name' => 'Ice Cream Cone',
                'short_description' => 'Smooth vanilla soft serve on a crispy wafer cone.',
                'description' => 'Cold, towering vanilla soft serve melting gently in a crispy, fragrant wafer cone. A small dessert that brings big joy.'
            ],
            'chocolate-brownie' => [
                'name' => 'Chocolate Brownie',
                'short_description' => 'Moist Belgian chocolate brownie with hot sauce and vanilla ice cream.',
                'description' => 'Belgian chocolate brownie baked to perfection, slightly crusty on the outside and moist inside. Topped with hot chocolate sauce and vanilla ice cream — hot and cold.'
            ],
            'apple-pie' => [
                'name' => 'Apple Pie',
                'short_description' => 'Crispy American apple pie with warm cinnamon apple filling.',
                'description' => 'Warm crispy apple pie with golden crust, filled with sliced green apples cooked in cinnamon, brown sugar, and butter. A classic comforting American flavor.'
            ],
            'cookie' => [
                'name' => 'Cookie',
                'short_description' => 'Freshly baked chocolate chip cookie, soft and chewy.',
                'description' => 'Chocolate chip cookies baked fresh daily, slightly crisp on the outside and soft inside, loaded with melted Belgian chocolate chips. Perfect with coffee.'
            ],
            'whopper-combo' => [
                'name' => 'Whopper Combo',
                'short_description' => 'Whopper Combo — Whopper + Medium Fries + Medium Coke (Save 15%).',
                'description' => 'Best value combo for Whopper fans! 1 legendary Whopper + 1 Medium Fries + 1 Medium Coca-Cola. Saves up to 15% compared to individual items — a complete meal.'
            ],
            'chicken-combo' => [
                'name' => 'Chicken Combo',
                'short_description' => 'Chicken Combo — Crispy Chicken + Medium Fries + Medium Sprite (Save 15%).',
                'description' => 'Crispy chicken combo! 1 Crispy Chicken + 1 Medium French Fries + 1 Medium Sprite. Quick, quality meal that saves 15% compared to buying separately.'
            ],
            'family-combo' => [
                'name' => 'Family Combo',
                'short_description' => 'Family Combo for 4 — 2 Whoppers + 2 Chickens + 4 Large Fries + 4 Large Drinks.',
                'description' => 'Warm family feast! 2 Whoppers + 2 Chickens + 4 Large Fries + 4 Large Drinks. Super saver combo for a family of 4 — saves 20% compared to buying separately.'
            ],
            'kids-meal' => [
                'name' => 'Kids Meal',
                'short_description' => 'Kids Meal Combo — Kids Burger + Small Fries + Juice Box.',
                'description' => 'Special combo for the little ones! 1 Kids Burger + 1 Small Fries + 1 natural Juice Box. Fun and nutritious meal for our little champions.'
            ],
            'kids-burger' => [
                'name' => 'Kids Burger',
                'short_description' => 'Small beef cheeseburger, designed specifically for kids.',
                'description' => 'Mini burger designed for kids with a tender beef patty, melted Cheddar cheese, sweet ketchup, and a soft bun. Mild flavor and perfect size for children.'
            ],
            'kids-nuggets-4' => [
                'name' => 'Kids Nuggets (4 pcs)',
                'short_description' => '4 small crispy chicken nuggets for kids with choice of sauce.',
                'description' => '4 small golden crispy chicken nuggets, tender inside. Served with sweet & sour or BBQ sauce — a favorite snack for kids.'
            ],
            'kids-fries' => [
                'name' => 'Kids Fries',
                'short_description' => 'Small portion of crispy fries, perfect for kids.',
                'description' => 'Small portion of french fries for kids, fried to a golden crisp with light salt. Just the right amount for a healthy snack.'
            ],
            'juice-box' => [
                'name' => 'Juice Box',
                'short_description' => '200ml natural juice box for kids — orange or apple.',
                'description' => '200ml natural fruit juice box for kids, no artificial sugars or preservatives. Refreshing orange or apple flavor — a healthy drink for angels.'
            ],
        ];

        DB::transaction(function () use ($products, $translations) {
            foreach ($products as $product) {
                $slug = $product['slug'];
                $viName = $product['name'];
                $viShort = $product['short_description'];
                $viDesc = $product['description'];

                $enName = $translations[$slug]['name'] ?? $viName;
                $enShort = $translations[$slug]['short_description'] ?? $viShort;
                $enDesc = $translations[$slug]['description'] ?? $viDesc;

                $product['name'] = ['vi' => $viName, 'en' => $enName];
                $product['short_description'] = ['vi' => $viShort, 'en' => $enShort];
                $product['description'] = ['vi' => $viDesc, 'en' => $enDesc];
                $product['sku'] = 'PRD-' . Str::upper(Str::slug($slug));

                Product::updateOrCreate(
                    ['slug' => $slug],
                    $product
                );
            }
        });
    }
}
