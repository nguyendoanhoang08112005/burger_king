import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Award, ShieldCheck, Clock, Flame } from 'lucide-react'

export default function AboutPage() {
  const { i18n, t } = useTranslation()
  const isVi = i18n.language === 'vi'

  const content = isVi 
    ? {
        badge: 'Câu chuyện thương hiệu',
        title: 'Chào mừng tới Hamburger King',
        subtitle: 'Từ bếp lửa hồng truyền thống đến chuỗi cửa hàng hiện đại hàng đầu Việt Nam.',
        storyTitle: 'Hành trình nướng lửa hồng nghệ thuật',
        storyP1: 'Được thành lập với niềm đam mê cháy bỏng dành cho những chiếc burger nướng lửa hồng đích thực, Hamburger King đã và đang khẳng định vị thế dẫn đầu bằng việc nói KHÔNG với thịt nướng chảo công nghiệp. Mỗi miếng thịt bò tại hệ thống của chúng tôi đều được nướng trực tiếp trên ngọn lửa hồng rực, khóa chặt nước thịt ngọt tự nhiên và tạo nên hương vị hun khói đặc trưng riêng biệt.',
        storyP2: 'Chúng tôi tin rằng món ăn ngon bắt đầu từ những nguyên liệu sạch và tươi ngon nhất. Bò nhập khẩu 100% từ Mỹ, kết hợp cùng các loại rau củ trồng hữu cơ thu hoạch trong ngày và công thức sốt độc quyền, mang tới cho thực khách những trải nghiệm ẩm thực đỉnh cao.',
        stats: [
          { value: '100%', label: 'Bò Mỹ Nhập Khẩu' },
          { value: '20 Mins', label: 'Giao hàng cực tốc' },
          { value: '24/7', label: 'Hỗ trợ chu đáo' },
        ],
        valuesTitle: 'Giá trị cốt lõi của chúng tôi',
        values: [
          {
            icon: <Flame className="w-8 h-8 text-primary" />,
            title: 'Lửa Hồng Truyền Thống',
            desc: 'Nướng lửa hồng trực tiếp giúp loại bỏ mỡ thừa nhưng vẫn giữ nguyên độ ngọt mềm tự nhiên của thịt bò Mỹ.'
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: 'An Toàn Tuyệt Đối',
            desc: 'Nguyên liệu sạch chuẩn VIETGAP, quy trình chế biến khép kín đạt chứng nhận HACCP về vệ sinh an toàn thực phẩm.'
          },
          {
            icon: <Clock className="w-8 h-8 text-primary" />,
            title: 'Nhanh Chóng & Nóng Hổi',
            desc: 'Cam kết giao bánh trong vòng 20-30 phút để bánh luôn nóng hổi, giòn tan như vừa mới ra lò.'
          },
        ]
      }
    : {
        badge: 'Our Brand Story',
        title: 'Welcome to Hamburger King',
        subtitle: 'From a traditional flame-grilled kitchen to the leading modern burger chain in Vietnam.',
        storyTitle: 'The Art of Flame-Grilling',
        storyP1: 'Founded with a burning passion for authentic flame-grilled burgers, Hamburger King has established its leadership by saying NO to industrial pan-frying. Every single beef patty in our system is grilled directly over an open flame, locking in the natural juices and creating our signature smoky flavor.',
        storyP2: 'We believe that great food starts with the cleanest and freshest ingredients. With 100% imported premium US beef, combined with organic veggies harvested daily and our secret house sauces, we deliver a top-tier culinary experience to every customer.',
        stats: [
          { value: '100%', label: 'Imported US Beef' },
          { value: '20 Mins', label: 'Fast Delivery' },
          { value: '24/7', label: 'Dedicated Support' },
        ],
        valuesTitle: 'Our Core Values',
        values: [
          {
            icon: <Flame className="w-8 h-8 text-primary" />,
            title: 'Flame-Grilled Authenticity',
            desc: 'Direct flame grilling melts away excess fat while locking in the natural tenderness of US beef.'
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: 'Premium Quality & Safety',
            desc: 'Clean ingredients matching VIETGAP standards, processed in a closed system meeting HACCP food safety standards.'
          },
          {
            icon: <Clock className="w-8 h-8 text-primary" />,
            title: 'Fast & Freshly Served',
            desc: 'Committed to delivering within 20-30 minutes so your burger arrives hot and fresh, just like straight out of the oven.'
          },
        ]
      }

  return (
    <div className="pt-24 pb-16 bg-[var(--color-cream)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block">
            {content.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-dark)] uppercase">
            {content.title}
          </h1>
          <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
            {content.subtitle}
          </p>
          <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto mt-4 rounded-full" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white rounded-3xl p-8 md:p-12 shadow-glass border border-gray-100 mb-16">
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-dark)] uppercase">
              {content.storyTitle}
            </h2>
            <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
              {content.storyP1}
            </p>
            <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
              {content.storyP2}
            </p>
            {/* Stats list */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {content.stats.map((stat, i) => (
                <div key={i} className="text-center lg:text-left space-y-1">
                  <span className="block text-2xl md:text-3xl font-extrabold text-primary">{stat.value}</span>
                  <span className="block text-xs text-[var(--color-text-muted)] font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 relative aspect-square lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden bg-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600" 
              alt="Hamburger King Crafting" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Core Values Section */}
        <div className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-dark)] text-center uppercase">
            {content.valuesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-glass flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition duration-200">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                  {v.icon}
                </div>
                <h3 className="font-extrabold text-lg text-[var(--color-dark)] uppercase">
                  {v.title}
                </h3>
                <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
