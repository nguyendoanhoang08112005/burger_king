<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ComboSet;
use App\Models\Branch;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\ProductTopping;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Gemini\Data\Tool;
use Gemini\Data\FunctionDeclaration;
use Gemini\Data\Schema;
use Gemini\Enums\DataType;

class ChatToolExecutor
{
    // Return all Gemini tool definitions
    public static function getTools(): array
    {
        return [
            new Tool(
                functionDeclarations: [
                    new FunctionDeclaration(
                        name: 'get_menu',
                        description: 'Lấy danh sách sản phẩm/món ăn đang phục vụ. Có thể lọc theo danh mục (category) nếu được cung cấp.',
                        parameters: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'category' => new Schema(
                                    type: DataType::STRING,
                                    description: 'Slug hoặc tên danh mục sản phẩm (ví dụ: "burger", "drinks", "combos")'
                                )
                            ]
                        )
                    ),
                    new FunctionDeclaration(
                        name: 'get_product_detail',
                        description: 'Lấy chi tiết của một sản phẩm cụ thể bao gồm các kích thước (sizes) và toppings đi kèm.',
                        parameters: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'query' => new Schema(
                                    type: DataType::STRING,
                                    description: 'Tên hoặc slug của sản phẩm cần tìm kiếm'
                                )
                            ],
                            required: ['query']
                        )
                    ),
                    new FunctionDeclaration(
                        name: 'get_combos',
                        description: 'Lấy danh sách các Value Combo (combo tiết kiệm) đang hoạt động và danh sách món ăn trong từng combo.',
                    ),
                    new FunctionDeclaration(
                        name: 'get_branches',
                        description: 'Lấy danh sách các chi nhánh của cửa hàng Hamburger King (tên, địa chỉ, hotline, giờ mở cửa).',
                    ),
                    new FunctionDeclaration(
                        name: 'get_active_coupons',
                        description: 'Lấy danh sách các mã giảm giá/khuyến mãi (coupon) đang có hiệu lực. Trả về mã code, loại giảm giá, giá trị và điều kiện áp dụng.',
                    ),
                    new FunctionDeclaration(
                        name: 'get_order_status',
                        description: 'Kiểm tra trạng thái đơn hàng của người dùng hiện tại. Yêu cầu người dùng phải đăng nhập trước.',
                        parameters: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'order_code' => new Schema(
                                    type: DataType::STRING,
                                    description: 'Mã đơn hàng cần kiểm tra. Nếu không cung cấp, hệ thống sẽ lấy đơn hàng gần nhất.'
                                )
                            ]
                        )
                    ),
                    new FunctionDeclaration(
                        name: 'get_loyalty_points',
                        description: 'Lấy điểm số tích lũy hiện có của tài khoản thành viên hiện tại. Yêu cầu đăng nhập.',
                    ),
                    new FunctionDeclaration(
                        name: 'add_to_cart',
                        description: 'Thêm một món ăn vào giỏ hàng của bạn. Sẽ hiển thị hộp xác nhận trước khi thực hiện.',
                        parameters: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'product_id' => new Schema(
                                    type: DataType::INTEGER,
                                    description: 'ID của sản phẩm cần thêm vào giỏ'
                                ),
                                'size' => new Schema(
                                    type: DataType::STRING,
                                    description: 'Kích cỡ của sản phẩm (ví dụ: "S", "M", "L"). Nếu không có, mặc định là "S".'
                                ),
                                'topping_ids' => new Schema(
                                    type: DataType::ARRAY,
                                    description: 'Mảng các ID toppings muốn thêm vào món ăn.',
                                    items: new Schema(type: DataType::INTEGER)
                                ),
                                'qty' => new Schema(
                                    type: DataType::INTEGER,
                                    description: 'Số lượng sản phẩm muốn thêm. Mặc định là 1.'
                                )
                            ],
                            required: ['product_id']
                        )
                    ),
                    new FunctionDeclaration(
                        name: 'cancel_order',
                        description: 'Hủy đơn hàng hiện tại của bạn. Chỉ có thể hủy khi đơn hàng đang ở trạng thái Chờ xử lý (pending) hoặc Đã xác nhận (confirmed). Sẽ hiển thị hộp xác nhận.',
                        parameters: new Schema(
                            type: DataType::OBJECT,
                            properties: [
                                'order_code' => new Schema(
                                    type: DataType::STRING,
                                    description: 'Mã đơn hàng cần hủy'
                                )
                            ],
                            required: ['order_code']
                        )
                    )
                ]
            )
        ];
    }

    // Execute the tool call
    public function execute(string $name, array $args, \App\Models\ChatSession $session): array
    {
        try {
            $user = $session->user;

            return match ($name) {
                'get_menu' => $this->getMenu($args['category'] ?? null),
                'get_product_detail' => $this->getProductDetail($args['query'] ?? ''),
                'get_combos' => $this->getCombos(),
                'get_branches' => $this->getBranches(),
                'get_active_coupons' => $this->getActiveCoupons(),
                'get_order_status' => $this->getOrderStatus($args['order_code'] ?? null, $user),
                'get_loyalty_points' => $this->getLoyaltyPoints($user),
                'add_to_cart' => $this->addToCart(
                    $args['product_id'] ?? null,
                    $args['size'] ?? null,
                    $args['topping_ids'] ?? null,
                    $args['qty'] ?? 1,
                    $session
                ),
                'cancel_order' => $this->cancelOrder($args['order_code'] ?? '', $user),
                default => [
                    'success' => false,
                    'error' => 'unknown_tool',
                    'message' => "Tool {$name} không tồn tại"
                ]
            };
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Tool execution failed: {$name}", [
                'params' => $args,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'tool_execution_failed',
                'message' => "Không thể thực hiện {$name} lúc này",
                'detail' => $e->getMessage()
            ];
        }
    }

    private function getMenu(?string $category)
    {
        $cacheKey = 'chatbot_menu_' . ($category ?? 'all');
        return Cache::remember($cacheKey, 1800, function () use ($category) {
            $query = Product::where('is_available', true);
            if ($category) {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('slug', $category)->orWhere('name', 'like', "%{$category}%");
                });
            }
            $products = $query->get()->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'base_price' => $p->base_price,
                    'sale_price' => $p->sale_price,
                    'description' => $p->short_description ?: $p->description,
                ];
            });
            return ['products' => $products];
        });
    }

    private function getProductDetail(string $queryStr)
    {
        $p = Product::where('is_available', true)
            ->where(function ($q) use ($queryStr) {
                $q->where('slug', $queryStr)
                  ->orWhere('name', 'like', "%{$queryStr}%")
                  ->orWhere('sku', $queryStr);
            })
            ->with(['sizes', 'category'])
            ->first();

        if (!$p) {
            return ['error' => 'Không tìm thấy món ăn này.'];
        }

        // Toppings are applicable based on category_ids
        $toppings = ProductTopping::where('is_available', true)
            ->where(function ($q) use ($p) {
                $q->whereNull('category_ids')
                  ->orWhereJsonLength('category_ids', 0)
                  ->orWhereJsonContains('category_ids', $p->category_id);
            })
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'price' => $t->price,
            ]);

        return [
            'product' => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'base_price' => $p->base_price,
                'sale_price' => $p->sale_price,
                'description' => $p->description,
                'sizes' => $p->sizes->map(fn ($s) => [
                    'id' => $s->id,
                    'size' => $s->size,
                    'extra_price' => $s->extra_price,
                ]),
                'toppings' => $toppings,
                'thumbnail' => $p->thumbnail,
            ],
            // Action to allow UI to open product details modal
            'action' => [
                'type' => 'product',
                'data' => $p
            ]
        ];
    }

    private function getCombos()
    {
        return Cache::remember('chatbot_combos', 1800, function () {
            $combos = ComboSet::where('is_active', true)
                ->with('items.product')
                ->get()
                ->map(function ($c) {
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'price' => $c->price,
                        'description' => $c->description,
                        'items' => $c->items->map(fn ($i) => [
                            'product_name' => $i->product?->name,
                            'quantity' => $i->quantity,
                        ]),
                    ];
                });
            return ['combos' => $combos];
        });
    }

    private function getBranches()
    {
        return Cache::remember('chatbot_branches', 3600, function () {
            $branches = Branch::where('is_active', true)
                ->get()
                ->map(fn ($b) => [
                    'name' => $b->name,
                    'address' => $b->address,
                    'phone' => $b->phone,
                    'open_time' => $b->open_time,
                    'close_time' => $b->close_time,
                ]);
            return ['branches' => $branches];
        });
    }

    private function getActiveCoupons()
    {
        $now = now();
        $coupons = Coupon::where('is_active', true)
            ->where('show_at_checkout', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', $now);
            })
            ->get()
            ->filter(function ($c) {
                return $c->usage_limit === null || $c->used_count < $c->usage_limit;
            })
            ->map(fn ($c) => [
                'code' => $c->code,
                'type' => $c->type,
                'value' => $c->value,
                'min_order' => $c->min_order,
                'expires_at' => $c->expires_at?->toDateTimeString(),
            ])
            ->values();

        return ['coupons' => $coupons];
    }

    private function getOrderStatus(?string $orderCode, ?User $user)
    {
        if (!$user) {
            return [
                'error' => 'Bạn cần đăng nhập để xem thông tin đơn hàng.',
                'action' => [
                    'type' => 'login'
                ]
            ];
        }

        $query = $user->orders();
        if ($orderCode) {
            $query->where('order_code', $orderCode);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $order = $query->with('items.product')->first();

        if (!$order) {
            return ['error' => 'Không tìm thấy đơn hàng nào.'];
        }

        return [
            'order' => [
                'order_code' => $order->order_code,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'total' => $order->total,
                'date' => $order->created_at->toDateTimeString(),
                'items' => $order->items->map(fn ($i) => [
                    'name' => $i->product?->name,
                    'quantity' => $i->quantity,
                    'size' => $i->size,
                    'price' => $i->price,
                ]),
            ],
            'action' => [
                'type' => 'order',
                'code' => $order->order_code
            ]
        ];
    }

    private function getLoyaltyPoints(?User $user)
    {
        if (!$user) {
            return [
                'error' => 'Bạn cần đăng nhập để xem điểm tích lũy.',
                'action' => [
                    'type' => 'login'
                ]
            ];
        }

        return [
            'loyalty_balance' => $user->loyalty_balance
        ];
    }

    private function addToCart(?int $productId, ?string $size, ?array $toppingIds, ?int $qty, \App\Models\ChatSession $session)
    {
        $pendingContext = $session->pending_context;

        $id = $productId ?? ($pendingContext['product_id'] ?? null);

        if (!$id) {
            return [
                'success' => false,
                'error' => 'missing_product',
                'message' => 'Không xác định được sản phẩm cần thêm vào giỏ hàng.'
            ];
        }

        $product = Product::where('is_available', true)->find($id);
        if (!$product) {
            return [
                'success' => false,
                'error' => 'product_not_found',
                'message' => 'Không tìm thấy sản phẩm hoặc sản phẩm hiện tại không có sẵn.'
            ];
        }

        $resolvedSize = $size ?? ($pendingContext['size'] ?? 'S');
        $resolvedToppingIds = $toppingIds ?? ($pendingContext['topping_ids'] ?? []);
        $resolvedQty = $qty ?? 1;

        $toppings = ProductTopping::where('is_available', true)->whereIn('id', $resolvedToppingIds)->get();

        return [
            'success' => true,
            'message' => 'Vui lòng xác nhận thêm món ăn vào giỏ hàng.',
            'action' => [
                'type' => 'confirm',
                'sub_type' => 'add_to_cart',
                'data' => [
                    'confirm_type' => 'add_to_cart',
                    'product' => $product,
                    'size' => $resolvedSize,
                    'toppings' => $toppings,
                    'quantity' => $resolvedQty,
                ]
            ]
        ];
    }

    private function cancelOrder(string $orderCode, ?User $user)
    {
        if (!$user) {
            return [
                'error' => 'Bạn cần đăng nhập để thực hiện hủy đơn.',
                'action' => [
                    'type' => 'login'
                ]
            ];
        }

        $order = $user->orders()->where('order_code', $orderCode)->first();
        if (!$order) {
            return ['error' => 'Không tìm thấy đơn hàng của bạn.'];
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return ['error' => 'Đơn hàng chỉ có thể hủy khi ở trạng thái Chờ xử lý hoặc Đã xác nhận. Trạng thái hiện tại: ' . $order->status];
        }

        return [
            'message' => 'Vui lòng xác nhận hủy đơn hàng ' . $orderCode,
            'action' => [
                'type' => 'confirm',
                'sub_type' => 'cancel_order',
                'data' => [
                    'order_code' => $orderCode,
                ]
            ]
        ];
    }
}
