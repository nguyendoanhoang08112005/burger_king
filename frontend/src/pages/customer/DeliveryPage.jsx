import { useTranslation } from 'react-i18next'
import { CalendarRange, MapPin, Truck, AlertTriangle, HelpCircle, ShieldCheck, Box, PhoneCall } from 'lucide-react'

export default function DeliveryPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const content = isVi 
    ? {
        badge: 'Giao nhận hàng',
        title: 'Chính Sách Giao Hàng',
        subtitle: 'Thông tin chi tiết về thời gian phục vụ, biểu phí vận chuyển và cam kết bồi thường sự cố của Hamburger King.',
        intro: 'Với cam kết mang lại những bữa ăn chất lượng tốt nhất, Hamburger King áp dụng quy trình giao hàng khép kín nhiệt độ tối ưu. Chúng tôi cam kết bánh giao tới tay khách hàng luôn giữ được trạng thái nóng hổi, thơm ngon, vỏ bánh giòn như vừa mới ra lò. Để bảo đảm quyền lợi tối đa cho thực khách, vui lòng tham khảo các quy định vận chuyển chi tiết dưới đây.',
        sections: [
          {
            icon: <CalendarRange className="w-6 h-6 text-primary" />,
            title: '1. Thời gian phục vụ và Đặt hàng trước',
            desc: 'Dịch vụ giao hàng trực tuyến của chúng tôi hoạt động liên tục từ 08:00 đến 23:00 hàng ngày (bao gồm cả thứ Bảy, Chủ Nhật và các ngày nghỉ lễ Tết). Hệ thống hỗ trợ tính năng Đặt giao ngay (vận chuyển ngay sau khi chuẩn bị) hoặc Đặt hẹn giờ linh hoạt (khách hàng có thể lên lịch giao trước tối đa 7 ngày để chủ động thời gian tổ chức sự kiện).'
          },
          {
            icon: <MapPin className="w-6 h-6 text-primary" />,
            title: '2. Phạm vi giao nhận và Cửa hàng phụ trách',
            desc: 'Để bảo đảm chất lượng đồ ăn nướng nhiệt tốt nhất, chúng tôi giới hạn phạm vi giao hàng tối đa 20km tính từ chi nhánh gần nhất. Khi bạn nhập địa chỉ giao hàng, hệ thống định vị của website sẽ tự động tính toán khoảng cách và phân bổ đơn hàng về chi nhánh có thời gian chế biến tối ưu nhất để giao cho bạn.'
          },
          {
            icon: <Box className="w-6 h-6 text-primary" />,
            title: '3. Quy định đóng gói và Tiêu chuẩn nhiệt độ',
            desc: 'Mọi sản phẩm của Hamburger King từ burgers, khoai tây chiên cho đến gà giòn đều được đặt trong các hộp giấy thực phẩm chuyên dụng và vận chuyển bằng túi giao hàng giữ nhiệt kín gió của shipper. Điều này bảo đảm thực phẩm luôn được duy trì ở mức nhiệt tốt nhất, tránh tối đa việc hấp hơi làm mềm bánh hoặc thất thoát nhiệt độ trong quá trình di chuyển trên đường.'
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            title: '4. Kiểm tra sản phẩm khi nhận hàng',
            desc: 'Khi shipper giao hàng tới, khách hàng vui lòng đối chiếu thông tin mã đơn hàng, kiểm tra tem niêm phong giỏ hàng và số lượng các sản phẩm đi kèm trước khi nhận. Việc đồng kiểm giúp hạn chế các sai sót ngoài ý muốn trong quá trình đóng gói của bếp.'
          },
          {
            icon: <Truck className="w-6 h-6 text-primary" />,
            title: '5. Biểu phí vận chuyển và Ưu đãi Freeship',
            desc: 'Phí giao nhận được tính toán tự động dựa trên khoảng cách địa lý cụ thể từ chi nhánh giao hàng tới vị trí nhận của bạn. Phí ship được chia theo các khung khoảng cách quy định bởi quản trị viên. Hamburger King thường xuyên có các chương trình khuyến mại miễn phí giao hàng (Freeship) áp dụng cho đơn hàng đạt giá trị tối thiểu theo quy định cài đặt.'
          },
          {
            icon: <AlertTriangle className="w-6 h-6 text-primary" />,
            title: '6. Chính sách bồi hoàn và Xử lý sự cố',
            desc: 'Trong trường hợp hiếm hoi xảy ra sự cố ngoài ý muốn như: giao sai món, thiếu món, hoặc sản phẩm bị dập nát, nguội lạnh do thời gian giao kéo dài bất thường; khách hàng có quyền báo cáo khiếu nại (kèm ảnh chụp bằng chứng thực tế) trong vòng 24 giờ kể từ lúc nhận hàng trực tiếp qua trang Theo Dõi Đơn Hàng trên tài khoản cá nhân. Hamburger King cam kết xử lý hoàn tiền hoặc chuẩn bị giao lại đơn mới miễn phí hoàn toàn lập tức.'
          },
          {
            icon: <HelpCircle className="w-6 h-6 text-primary" />,
            title: '7. Thay đổi địa chỉ hoặc Hủy đơn hàng',
            desc: 'Khách hàng có thể thay đổi thông tin địa chỉ giao hàng hoặc yêu cầu hủy đơn hàng mà không chịu bất kỳ chi phí nào nếu yêu cầu được đưa ra trước khi bếp bắt đầu quá trình chế biến (Trạng thái đơn hàng ở mức: Chờ xác nhận). Trường hợp đơn hàng đã được chuẩn bị xong và shipper đang di chuyển, chúng tôi không hỗ trợ hủy đơn trừ các trường hợp bất khả kháng.'
          },
          {
            icon: <PhoneCall className="w-6 h-6 text-primary" />,
            title: '8. Kênh liên hệ hỗ trợ khẩn cấp',
            desc: 'Nếu đơn hàng của bạn gặp sự cố trễ hẹn hoặc bạn muốn thay đổi thông tin giao hàng gấp, vui lòng gọi điện trực tiếp tới số Hotline của chi nhánh phụ trách hiển thị trong hóa đơn đặt hàng hoặc liên hệ Tổng đài Chăm sóc khách hàng để được điều phối xử lý nhanh nhất.'
          }
        ]
      }
    : {
        badge: 'Delivery & Shipping',
        title: 'Delivery Policy',
        subtitle: 'Details regarding service hours, shipping fees, and safety resolution commitments at Hamburger King.',
        intro: 'With a firm commitment to delivering meals of the highest quality, Hamburger King employs a fully integrated thermal-retention delivery process. We guarantee that your burgers arrive hot, flavorful, and crispy, just as if they came straight out of the grill. To protect your rights, please review our comprehensive shipping and delivery guidelines below.',
        sections: [
          {
            icon: <CalendarRange className="w-6 h-6 text-primary" />,
            title: '1. Service & Delivery Hours',
            desc: 'Our online delivery service operates daily from 08:00 to 23:00 (including Saturdays, Sundays, and public holidays). The system supports both Instant Delivery (shipped immediately after food prep) and Scheduled Delivery (customers can schedule drop-offs up to 7 days in advance to coordinate events seamlessly).'
          },
          {
            icon: <MapPin className="w-6 h-6 text-primary" />,
            title: '2. Delivery Coverage & Branch Allocation',
            desc: 'To secure the freshness and temperature of your meals, we limit our delivery radius to a maximum of 20km from the nearest branch. When you specify your delivery address, our geo-location algorithm automatically routes your order to the branch with the optimal preparation time.'
          },
          {
            icon: <Box className="w-6 h-6 text-primary" />,
            title: '3. Packaging Standards & Thermal Maintenance',
            desc: 'Every item from Hamburger King, whether burgers, fries, or crispy chicken, is packed in specialized food-grade paper boxes and transported in airtight thermal delivery bags by our dispatchers. This prevents moisture buildup and minimizes heat loss during transit.'
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            title: '4. Delivery Checks & Order Inspections',
            desc: 'Upon delivery, please verify order codes, inspect the security seal on the bag, and check the item count before accepting the package. Co-inspection ensures any discrepancies during packaging are identified and resolved immediately.'
          },
          {
            icon: <Truck className="w-6 h-6 text-primary" />,
            title: '5. Shipping Fees & Free Shipping Offers',
            desc: 'Delivery fees are calculated dynamically based on geographic distance from the assigned dispatch branch to your location. Distance pricing tiers are configured by our administration team. Free delivery promotions apply automatically when your shopping cart meets active minimum threshold configurations.'
          },
          {
            icon: <AlertTriangle className="w-6 h-6 text-primary" />,
            title: '6. Incident Resolutions & Refund Policies',
            desc: 'In the rare event of order discrepancies (incorrect/missing items) or damaged food quality due to severe traffic delays, you are fully entitled to submit an online complaint with photo evidence within 24 hours of delivery. This can be filed under the Order Tracking page in your account. Hamburger King promises to issue refunds or redeliver fresh items immediately.'
          },
          {
            icon: <HelpCircle className="w-6 h-6 text-primary" />,
            title: '7. Address Changes & Order Cancellations',
            desc: 'Customers can modify delivery addresses or request order cancellations at no charge, provided the request is made before our kitchen starts cooking (Order status: Pending). Once preparation is complete and the courier is in transit, cancellations are not permitted except for force majeure events.'
          },
          {
            icon: <PhoneCall className="w-6 h-6 text-primary" />,
            title: '8. Urgent Customer Support Channels',
            desc: 'If your delivery is delayed or you need to make urgent updates, please call the branch Hotline number listed on your order invoice or reach out directly to our Customer Support Call Center for rapid coordination.'
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
