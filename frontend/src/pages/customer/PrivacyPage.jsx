import { useTranslation } from 'react-i18next'
import { ShieldAlert, Eye, UserCheck, Lock, HardDriveDownload, RefreshCw, FileLock2, Cookie } from 'lucide-react'

export default function PrivacyPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const content = isVi 
    ? {
        badge: 'An toàn & Bảo mật',
        title: 'Chính Sách Bảo Mật',
        subtitle: 'Bảo vệ dữ liệu cá nhân và quyền lợi sự riêng tư của khách hàng tại Hamburger King.',
        intro: 'Hamburger King (sau đây gọi tắt là "Chúng tôi") hiểu rằng sự riêng tư và bảo mật thông tin cá nhân của bạn là điều tối quan trọng. Chính sách bảo mật này được lập ra nhằm giải thích minh bạch cách chúng tôi thu thập, sử dụng, lưu trữ, bảo vệ cũng như chia sẻ dữ liệu cá nhân của bạn khi bạn tạo tài khoản, đặt món ăn trên website, hoặc tương tác với chúng tôi qua các kênh trực tuyến khác. Bằng việc tiếp tục truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý với toàn bộ các nội dung được quy định trong chính sách này.',
        sections: [
          {
            icon: <Eye className="w-6 h-6 text-primary" />,
            title: '1. Phạm vi thu thập thông tin cá nhân',
            desc: 'Chúng tôi chỉ thu thập các thông tin cá nhân thiết thực và cần thiết khi bạn chủ động đăng ký thành viên hoặc tiến hành thanh toán đơn hàng. Các thông tin này bao gồm: Họ và tên đầy đủ, Số điện thoại liên hệ chính thức, Địa chỉ giao hàng chi tiết (bao gồm cả Tỉnh/Thành phố, Quận/Huyện, Phường/Xã), địa chỉ Email, Lịch sử đặt hàng, IP kết nối mạng và tọa độ địa lý (nếu bạn cho phép chia sẻ vị trí để tính toán khoảng cách giao hàng từ chi nhánh gần nhất).'
          },
          {
            icon: <UserCheck className="w-6 h-6 text-primary" />,
            title: '2. Mục đích xử lý và sử dụng thông tin',
            desc: 'Dữ liệu cá nhân thu thập được sẽ được xử lý tối ưu để phục vụ cho các mục đích: Xác nhận thông tin và xử lý đơn hàng, điều phối giao hàng siêu tốc từ chi nhánh gần nhất; Tự động quản lý điểm thưởng tích lũy (Loyalty Points) và nâng cấp hạng thành viên; Tiếp nhận, phản hồi và giải quyết các khiếu nại, sự cố về đơn hàng hoặc thái độ nhân viên; Cải tiến giao diện và tối ưu hóa trải nghiệm mua sắm trên website; Gửi thông tin khuyến mãi, ưu đãi độc quyền hoặc bản tin định kỳ (chỉ thực hiện khi có sự đồng ý rõ ràng của bạn).'
          },
          {
            icon: <Lock className="w-6 h-6 text-primary" />,
            title: '3. Bảo mật thông tin dữ liệu',
            desc: 'Chúng tôi cam kết sử dụng các tiêu chuẩn an ninh cao nhất để ngăn chặn việc truy cập, thay đổi hoặc tiết lộ dữ liệu trái phép. Mọi thông tin truyền tải giữa thiết bị của khách hàng và máy chủ của chúng tôi đều được mã hóa bằng giao thức SSL/HTTPS bảo mật. Dữ liệu thẻ thanh toán và thông tin giao dịch tài chính trực tuyến được xử lý thông qua các cổng đối tác bảo mật đạt chuẩn quốc tế PCI-DSS.'
          },
          {
            icon: <FileLock2 className="w-6 h-6 text-primary" />,
            title: '4. Cam kết không chia sẻ thương mại',
            desc: 'Hamburger King tuyệt đối KHÔNG bán, cho thuê, trao đổi hoặc tiết lộ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại hay quảng cáo. Thông tin chỉ được chia sẻ trong phạm vi cần thiết với đối tác vận chuyển nội bộ hoặc cơ quan pháp luật có thẩm quyền khi có yêu cầu bằng văn bản chính thức theo quy định của pháp luật Việt Nam.'
          },
          {
            icon: <RefreshCw className="w-6 h-6 text-primary" />,
            title: '5. Thời gian lưu trữ dữ liệu',
            desc: 'Thông tin dữ liệu tài khoản thành viên của khách hàng sẽ được lưu trữ an toàn trên hệ thống máy chủ của chúng tôi cho đến khi tài khoản bị xóa hoặc khi có yêu cầu bằng văn bản từ khách hàng về việc hủy bỏ lưu trữ thông tin cá nhân. Các thông tin liên quan đến lịch sử hóa đơn tài chính sẽ được lưu giữ theo thời hạn luật định về kế toán và thuế.'
          },
          {
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            title: '6. Quyền lợi và Lựa chọn của bạn',
            desc: 'Bạn có toàn quyền truy cập, kiểm tra và tự điều chỉnh thông tin cá nhân của mình trực tiếp tại mục Cài đặt Tài khoản trên website bất kỳ lúc nào. Ngoài ra, bạn có quyền yêu cầu chúng tôi xóa dữ liệu, từ chối nhận các email quảng cáo và bản tin khuyến mãi bằng cách nhấp vào liên kết "Hủy đăng ký" ở cuối mỗi email chúng tôi gửi.'
          },
          {
            icon: <Cookie className="w-6 h-6 text-primary" />,
            title: '7. Cookie và Công nghệ theo dõi',
            desc: 'Chúng tôi sử dụng cookie để lưu giữ phiên đăng nhập và ghi nhớ giỏ hàng tạm thời của bạn, giúp bạn mua sắm mượt mà hơn mà không cần đăng nhập lại nhiều lần. Bạn có thể chọn vô hiệu hóa cookie trong phần cấu hình trình duyệt của mình, tuy nhiên một số tính năng nâng cao của website có thể không hoạt động tối ưu.'
          },
          {
            icon: <HardDriveDownload className="w-6 h-6 text-primary" />,
            title: '8. Thay đổi chính sách và Liên hệ',
            desc: 'Hamburger King giữ quyền cập nhật và bổ sung nội dung chính sách này bất kỳ lúc nào để phù hợp với tình hình thực tế và sự thay đổi của pháp luật. Nếu có bất kỳ câu hỏi hoặc yêu cầu xử lý liên quan đến dữ liệu cá nhân, vui lòng liên hệ với bộ phận Chăm sóc khách hàng của chúng tôi qua Hotline hoặc Email hỗ trợ.'
          }
        ]
      }
    : {
        badge: 'Safety & Security',
        title: 'Privacy Policy',
        subtitle: 'Protecting personal data and privacy rights of customers at Hamburger King.',
        intro: 'Hamburger King ("We", "Us", or "Our") understands that your privacy and the security of your personal data are of utmost importance. This Privacy Policy is established to explain transparently how we collect, use, store, protect, and share your personal information when you register an account, order food on our website, or interact with us online. By continuing to access and use our services, you agree to all the terms detailed in this policy.',
        sections: [
          {
            icon: <Eye className="w-6 h-6 text-primary" />,
            title: '1. Scope of Personal Data Collection',
            desc: 'We only collect personal information that is practical and necessary when you register as a member or place an order. This information includes: Full name, official Phone number, detailed Delivery address (including City/Province, District, Ward, and street), Email address, Order history, network IP address, and geographic coordinates (if you authorize location access to calculate shipping distances from the nearest branch).'
          },
          {
            icon: <UserCheck className="w-6 h-6 text-primary" />,
            title: '2. Purpose of Data Processing and Use',
            desc: 'Collected personal data will be processed optimally to serve the following purposes: Confirming details and processing orders, coordinating instant hot delivery from the nearest branch; Automatically managing Loyalty Points accumulation and membership level upgrades; Receiving, responding to, and resolving customer complaints, order issues, or staff service attitude reports; Optimizing website layouts and shopping experiences; Sending promotional campaigns, exclusive discount offers, or newsletters (only with your clear consent).'
          },
          {
            icon: <Lock className="w-6 h-6 text-primary" />,
            title: '3. Data Security Measures',
            desc: 'We are committed to using the highest security standards to prevent unauthorized access, modification, or disclosure of data. All data transmitted between your device and our servers is encrypted using SSL/HTTPS security protocols. Payment card details and online financial transactions are processed securely through internationally certified PCI-DSS payment gateways.'
          },
          {
            icon: <FileLock2 className="w-6 h-6 text-primary" />,
            title: '4. Commitment Against Commercial Sharing',
            desc: 'Hamburger King strictly guarantees NOT to sell, rent, trade, or disclose your personal information to any third parties for commercial or advertising purposes. Information is only shared within the necessary scope with internal delivery logistics partners or government authorities under official written requests in compliance with Vietnamese laws.'
          },
          {
            icon: <RefreshCw className="w-6 h-6 text-primary" />,
            title: '5. Data Retention Period',
            desc: 'Your member account data will be stored securely on our servers until your account is deleted or upon a written request from you to delete your personal database. Financial invoice histories will be retained in accordance with statutory accounting and tax compliance periods.'
          },
          {
            icon: <ShieldAlert className="w-6 h-6 text-primary" />,
            title: '6. Your Rights and Choices',
            desc: 'You have full rights to access, inspect, and update your personal information directly within your Profile Settings page on the website at any time. Furthermore, you have the right to request data deletion, refuse marketing emails and promotional newsletters by clicking the "Unsubscribe" link at the bottom of our emails.'
          },
          {
            icon: <Cookie className="w-6 h-6 text-primary" />,
            title: '7. Cookies and Tracking Technologies',
            desc: 'We use cookies to maintain login sessions and remember temporary cart items, ensuring a smooth ordering flow without requiring repeated logins. You can choose to disable cookies in your browser settings, though some advanced features of the website may not function optimally.'
          },
          {
            icon: <HardDriveDownload className="w-6 h-6 text-primary" />,
            title: '8. Policy Updates and Contact Info',
            desc: 'Hamburger King reserves the right to update and append this policy at any time to reflect operational changes or changes in applicable laws. For any questions or data requests, please contact our Customer Support team via our official Hotline or Support email.'
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
