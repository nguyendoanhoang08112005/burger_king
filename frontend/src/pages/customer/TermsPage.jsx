import { useTranslation } from 'react-i18next'
import { FileText, CreditCard, Gift, AlertCircle, Scale, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react'

export default function TermsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const content = isVi 
    ? {
        badge: 'Quy chế hoạt động',
        title: 'Điều Khoản Dịch Vụ',
        subtitle: 'Các quy định, chính sách và thỏa thuận sử dụng dịch vụ trên hệ thống Hamburger King.',
        intro: 'Chào mừng bạn đến với hệ thống đặt món trực tuyến của Hamburger King. Bằng việc truy cập website, đăng ký thông tin cá nhân, thực hiện đặt hàng hoặc sử dụng bất kỳ dịch vụ trực tuyến nào của chúng tôi, bạn đồng ý tuân thủ vô điều kiện tất cả các điều khoản, quy chế hoạt động được nêu chi tiết bên dưới. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng website và dịch vụ của chúng tôi.',
        sections: [
          {
            icon: <FileText className="w-6 h-6 text-primary" />,
            title: '1. Chấp thuận điều khoản sử dụng',
            desc: 'Điều khoản này thiết lập một thỏa thuận pháp lý ràng buộc giữa bạn (khách hàng sử dụng dịch vụ) và Hamburger King. Chúng tôi có quyền điều chỉnh, sửa đổi hoặc loại bỏ bất kỳ nội dung nào trong điều khoản dịch vụ này vào bất kỳ lúc nào mà không cần thông báo trước. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website chính thức.'
          },
          {
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            title: '2. Đăng ký tài khoản và Bảo mật thông tin',
            desc: 'Khi tạo tài khoản trên website, bạn cam kết cung cấp các thông tin liên lạc chính xác, chính chủ bao gồm họ tên, số điện thoại hoạt động và địa chỉ email chính thức. Bạn chịu trách nhiệm hoàn toàn đối với việc bảo mật thông tin tài khoản đăng nhập (mật khẩu) cá nhân và tất cả giao dịch được tiến hành dưới tên tài khoản của bạn.'
          },
          {
            icon: <FileSpreadsheet className="w-6 h-6 text-primary" />,
            title: '3. Quy trình đặt món và Xác nhận giao dịch',
            desc: 'Mọi đơn hàng của bạn được thiết lập trực tiếp thông qua hệ thống giỏ hàng và checkout của website. Hệ thống sẽ tự động gán đơn hàng cho chi nhánh gần nhất dựa trên khoảng cách định vị địa lý. Sau khi đặt món thành công, hệ thống gửi email xác nhận cùng mã đơn hàng chi tiết. Chúng tôi có quyền hủy bỏ đơn hàng nếu thông tin người nhận không rõ ràng hoặc không liên lạc được qua số điện thoại.'
          },
          {
            icon: <CreditCard className="w-6 h-6 text-primary" />,
            title: '4. Giá cả, Thuế và Phương thức thanh toán',
            desc: 'Tất cả giá niêm yết trên website được hiển thị bằng Việt Nam Đồng (VND) và đã bao gồm thuế Giá trị gia tăng (VAT) hiện hành. Biểu phí giao hàng được tính tách biệt rõ ràng ở trang checkout dựa trên khoảng cách. Khách hàng có thể chọn thanh toán bằng Tiền mặt khi nhận hàng (COD) hoặc Thanh toán trực tuyến bảo mật thông qua cổng ngân hàng nội địa, thẻ Visa/Mastercard hoặc các Ví điện tử tích hợp.'
          },
          {
            icon: <Gift className="w-6 h-6 text-primary" />,
            title: '5. Cơ chế Tích lũy và Quy đổi Điểm Loyalty',
            desc: 'Chương trình điểm thưởng Loyalty áp dụng tự động cho mọi khách hàng có tài khoản thành viên hợp lệ. Điểm được tích lũy theo tỷ lệ quy định dựa trên giá trị thanh toán thực tế của đơn hàng (sau khi trừ các mã giảm giá và phí ship). Điểm thưởng dùng để đổi mã giảm giá trực tiếp cho đơn hàng tiếp theo. Điểm tích lũy không có giá trị quy đổi thành tiền mặt, không được chuyển nhượng giữa các tài khoản và tự động hết hạn sau 12 tháng kể từ ngày tích lũy thành công.'
          },
          {
            icon: <Award className="w-6 h-6 text-primary" />,
            title: '6. Quyền sở hữu trí tuệ',
            desc: 'Toàn bộ nội dung hiển thị trên website bao gồm hình ảnh thiết kế, logo thương hiệu, giao diện đồ họa, các đoạn văn bản quảng cáo, mã nguồn và công thức chế biến độc quyền thuộc quyền sở hữu trí tuệ hợp pháp của Hamburger King. Mọi hành vi sao chép, tái bản, khai thác thương mại dữ liệu từ website khi chưa có sự đồng ý bằng văn bản của chúng tôi đều bị coi là vi phạm pháp luật.'
          },
          {
            icon: <AlertCircle className="w-6 h-6 text-primary" />,
            title: '7. Giới hạn trách nhiệm pháp lý',
            desc: 'Chúng tôi nỗ lực tối đa để phục vụ những món ăn nóng hổi, chất lượng cao nhất. Tuy nhiên, trong các sự kiện bất khả kháng (bao gồm thiên tai, tai nạn giao thông nghiêm trọng, sự cố cúp điện diện rộng trên hệ thống, lỗi mạng ISP toàn quốc hoặc thời tiết cực đoan), việc giao hàng có thể bị chậm trễ hoặc hủy bỏ ngoài ý muốn. Hamburger King sẽ thông báo nhanh nhất và tìm phương án bồi hoàn hợp lý cho khách hàng.'
          },
          {
            icon: <Scale className="w-6 h-6 text-primary" />,
            title: '8. Luật áp dụng và Giải quyết tranh chấp',
            desc: 'Bất kỳ tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ trên website sẽ được ưu tiên giải quyết thông qua thương lượng hòa giải giữa hai bên. Trong trường hợp không đạt được thỏa thuận chung, tranh chấp sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền tại Thành phố Hồ Chí Minh theo các quy định hiện hành của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.'
          }
        ]
      }
    : {
        badge: 'Terms & Agreements',
        title: 'Terms of Service',
        subtitle: 'Regulations, policies, and terms of service on the Hamburger King website.',
        intro: 'Welcome to the Hamburger King online ordering system. By accessing this website, registering personal details, placing an order, or using any of our online services, you agree unconditionally to comply with all terms and conditions set out below. If you do not agree to any part of these terms, please stop using our website and services immediately.',
        sections: [
          {
            icon: <FileText className="w-6 h-6 text-primary" />,
            title: '1. Acceptance of Terms of Use',
            desc: 'These terms establish a legally binding agreement between you (the customer using our services) and Hamburger King. We reserve the right to adapt, modify, or remove any part of these terms of service at any time without prior notice. Changes will take effect immediately upon being posted on the official website.'
          },
          {
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            title: '2. Account Registration and Security',
            desc: 'When creating an account on the website, you promise to provide accurate, verified contact details including full name, active phone number, and official email. You are fully responsible for maintaining the confidentiality of your account login credentials (password) and all transactions conducted under your account.'
          },
          {
            icon: <FileSpreadsheet className="w-6 h-6 text-primary" />,
            title: '3. Ordering Process & Transaction Confirmations',
            desc: 'All your orders are configured directly through the website shopping cart and checkout systems. The system automatically assigns orders to the nearest branch based on geographic distance calculation. After a successful order, the system sends a confirmation email with detailed order codes. We reserve the right to cancel orders if recipient details are unclear or unreachable via phone.'
          },
          {
            icon: <CreditCard className="w-6 h-6 text-primary" />,
            title: '4. Pricing, Taxes, and Payment Methods',
            desc: 'All listed prices on the website are displayed in Vietnam Dong (VND) and include active Value Added Tax (VAT). Shipping fees are calculated separately on the checkout page based on distance. Customers can choose between Cash on Delivery (COD) or secure online payments via local banks, Visa/Mastercard, or integrated e-wallets.'
          },
          {
            icon: <Gift className="w-6 h-6 text-primary" />,
            title: '5. Loyalty Points Accumulation & Redemption Logic',
            desc: 'The Loyalty reward program applies automatically to all customers with a valid member account. Points accumulate based on the actual checkout values (after subtracting discount codes and shipping fees). Loyalty points can be redeemed for price deductions during next orders. Points cannot be redeemed for physical cash, are non-transferable, and expire automatically 12 months after being earned.'
          },
          {
            icon: <Award className="w-6 h-6 text-primary" />,
            title: '6. Intellectual Property Rights',
            desc: 'All content displayed on this website including design layouts, brand logos, graphical interfaces, promotional texts, source code, and exclusive recipes belongs to the legal intellectual property of Hamburger King. Any copying, reproduction, or commercial extraction of website data without our written consent is strictly prohibited and illegal.'
          },
          {
            icon: <AlertCircle className="w-6 h-6 text-primary" />,
            title: '7. Limitation of Liability',
            desc: 'We exert maximum effort to serve fresh, hot meals of the highest quality. However, under force majeure circumstances (natural disasters, severe traffic accidents, power grid failures, nationwide ISP downtime, or extreme weather conditions), deliveries may be delayed or cancelled unexpectedly. Hamburger King will notify you immediately and seek appropriate compensations.'
          },
          {
            icon: <Scale className="w-6 h-6 text-primary" />,
            title: '8. Governing Law & Dispute Resolutions',
            desc: 'Any dispute arising from or relating to the use of services on this website will be prioritized for resolution through amicable negotiation between both parties. If a mutual agreement is not reached, the dispute will be resolved by the competent court of Ho Chi Minh City in accordance with the current laws of the Socialist Republic of Vietnam.'
          }
        ]
      }

  return (
    <div className="pt-24 pb-16 bg-[var(--color-cream)]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Block */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full inline-block">
            {content.badge}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-dark)] uppercase">
            {content.title}
          </h1>
          <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
            {content.subtitle}
          </p>
          <div className="w-20 h-1 bg-[var(--color-primary)] mx-auto mt-4 rounded-full" />
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-glass border border-gray-100 space-y-8 text-left">
          <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed border-b border-gray-100 pb-6">
            {content.intro}
          </p>

          <div className="space-y-8">
            {content.sections.map((sec, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 shrink-0">
                  {sec.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-base md:text-lg text-[var(--color-dark)] uppercase tracking-tight">
                    {sec.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
