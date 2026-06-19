import React, { useState } from 'react'
import {
  SettingInput, SettingSelect
} from '../../../utils/adminUtils'
import apiClient from '../../../api/axios'
import toast from 'react-hot-toast'
import { HelpCircle, Loader2, X } from 'lucide-react'

const MAIL_SETTING_KEYS = [
  'notification.email_driver',
  'notification.smtp_host',
  'notification.smtp_port',
  'notification.smtp_username',
  'notification.smtp_password',
  'notification.smtp_encryption',
]

function buildMailSettingsPayload(settings) {
  return Object.fromEntries(
    MAIL_SETTING_KEYS.map(key => {
      if (key === 'notification.email_driver') return [key, settings[key] || 'smtp']
      if (key === 'notification.smtp_encryption') return [key, settings[key] || 'tls']
      if (key === 'notification.smtp_port') return [key, settings[key] ?? 587]
      return [key, settings[key] || '']
    })
  )
}

function MailHelpModal({ onClose, tAdmin }) {
  const sections = [
    {
      title: tAdmin('mail_help_overview_title', 'Cấu hình SMTP là gì?'),
      body: tAdmin(
        'mail_help_overview_body',
        'SMTP là giao thức gửi email từ hệ thống (thông báo đơn hàng, khiếu nại, quên mật khẩu...). Bạn cần tài khoản email hoặc dịch vụ SMTP (Gmail, Outlook, SendGrid, Mailgun...) để điền các trường bên dưới.'
      ),
    },
    {
      title: tAdmin('mail_help_fields_title', 'Giải thích từng trường'),
      items: [
        { label: tAdmin('email_driver', 'Giao thức gửi mail'), desc: tAdmin('mail_help_driver', 'Chọn SMTP cho hầu hết trường hợp. Mailgun/SES chỉ dùng khi bạn đã cấu hình riêng trên server.') },
        { label: tAdmin('smtp_host', 'SMTP Host'), desc: tAdmin('mail_help_host', 'Địa chỉ máy chủ SMTP. Ví dụ: smtp.gmail.com, smtp.office365.com, smtp.mailgun.org.') },
        { label: tAdmin('smtp_port', 'SMTP Port'), desc: tAdmin('mail_help_port', 'Cổng kết nối. Thường dùng 587 (TLS) hoặc 465 (SSL).') },
        { label: tAdmin('smtp_encryption', 'Mã hóa SMTP'), desc: tAdmin('mail_help_encryption', 'TLS cho port 587, SSL cho port 465. Chọn None nếu nhà cung cấp không yêu cầu mã hóa.') },
        { label: tAdmin('smtp_username', 'SMTP Username'), desc: tAdmin('mail_help_username', 'Thường là địa chỉ email đăng nhập hoặc username do nhà cung cấp SMTP cấp.') },
        { label: tAdmin('smtp_password', 'SMTP Password'), desc: tAdmin('mail_help_password', 'Mật khẩu email hoặc App Password (Gmail/Outlook bắt buộc dùng App Password nếu bật xác minh 2 bước).') },
      ],
    },
    {
      title: tAdmin('mail_help_gmail_title', 'Ví dụ: Gmail'),
      body: tAdmin(
        'mail_help_gmail_body',
        'Host: smtp.gmail.com | Port: 587 | Mã hóa: TLS | Username: email@gmail.com | Password: App Password 16 ký tự (tạo tại Google Account → Bảo mật → Mật khẩu ứng dụng).'
      ),
    },
    {
      title: tAdmin('mail_help_outlook_title', 'Ví dụ: Outlook / Microsoft 365'),
      body: tAdmin(
        'mail_help_outlook_body',
        'Host: smtp.office365.com | Port: 587 | Mã hóa: TLS | Username: email@outlook.com | Password: mật khẩu hoặc App Password.'
      ),
    },
    {
      title: tAdmin('mail_help_test_title', 'Kiểm tra & lưu cấu hình'),
      body: tAdmin(
        'mail_help_test_body',
        'Nhập email nhận thử nghiệm và bấm "Gửi Email Thử Nghiệm". Hệ thống dùng đúng thông tin bạn vừa nhập để gửi. Nếu thành công, cấu hình sẽ được lưu tự động và hiển thị lại khi bạn quay lại trang này. Bạn cũng có thể bấm "Lưu thay đổi" ở góc trên nếu chỉ muốn lưu mà không gửi thử.'
      ),
    },
    {
      title: tAdmin('mail_help_tips_title', 'Lưu ý'),
      body: tAdmin(
        'mail_help_tips_body',
        '• Email gửi đi lấy địa chỉ "From" từ tab Tổng quan → Email cửa hàng.\n• Nếu để trống mật khẩu khi lưu, hệ thống giữ nguyên mật khẩu đã lưu trước đó.\n• Kiểm tra spam nếu không nhận được email thử nghiệm.'
      ),
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1E2130] shadow-xl border border-gray-200 dark:border-gray-700"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E2130] px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {tAdmin('mail_help_title', 'Hướng dẫn cấu hình Mail')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={tAdmin('close', 'Đóng')}
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-6 px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
          {sections.map(section => (
            <section key={section.title}>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                {section.title}
              </h4>
              {section.body && <p className="whitespace-pre-line leading-relaxed">{section.body}</p>}
              {section.items && (
                <dl className="space-y-3">
                  {section.items.map(item => (
                    <div key={item.label} className="rounded-xl bg-gray-50 dark:bg-[#161825] px-4 py-3">
                      <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.label}</dt>
                      <dd className="mt-1 leading-relaxed">{item.desc}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MailSettings({
  settings,
  updateSetting,
  tAdmin,
  onSettingsReload,
}) {
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error(tAdmin('enter_test_email_err', 'Vui lòng nhập email nhận thử nghiệm.'))
      return
    }

    const mailSettings = buildMailSettingsPayload(settings)
    if (!mailSettings['notification.smtp_host']) {
      toast.error(tAdmin('mail_host_required', 'Vui lòng nhập SMTP Host trước khi gửi thử.'))
      return
    }

    setSending(true)
    try {
      const res = await apiClient.post('/admin/settings/test-email', {
        email: testEmail,
        settings: mailSettings,
      })
      if (res.data?.success) {
        toast.success(tAdmin('test_email_success', 'Đã gửi email thử nghiệm thành công!'))
        await onSettingsReload?.()
      } else {
        toast.error(res.data?.message || tAdmin('test_email_error', 'Lỗi khi gửi email thử nghiệm.'))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || tAdmin('test_email_error', 'Lỗi khi gửi email thử nghiệm.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="relative space-y-6 text-left">
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          title={tAdmin('mail_help_btn', 'Hướng dẫn sử dụng')}
          className="absolute top-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#161825] text-gray-500 hover:text-[#D62300] hover:border-[#D62300]/30 transition-colors"
        >
          <HelpCircle size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
          <SettingSelect
            label={tAdmin('email_driver', 'Giao thức gửi mail')}
            value={settings['notification.email_driver'] || 'smtp'}
            onChange={value => updateSetting('notification.email_driver', value)}
            options={[
              { value: 'smtp', label: 'SMTP' },
              { value: 'mailgun', label: 'Mailgun' },
              { value: 'ses', label: 'SES' },
            ]}
          />
          <SettingInput
            label={tAdmin('smtp_host', 'SMTP Host')}
            value={settings['notification.smtp_host'] ?? ''}
            onChange={value => updateSetting('notification.smtp_host', value)}
            placeholder="smtp.gmail.com"
          />
          <SettingInput
            label={tAdmin('smtp_port', 'SMTP Port')}
            type="number"
            value={settings['notification.smtp_port'] ?? ''}
            onChange={value => updateSetting('notification.smtp_port', value)}
            placeholder="587"
          />
          <SettingSelect
            label={tAdmin('smtp_encryption', 'Mã hóa SMTP')}
            value={settings['notification.smtp_encryption'] || 'tls'}
            onChange={value => updateSetting('notification.smtp_encryption', value)}
            options={[
              { value: 'tls', label: 'TLS' },
              { value: 'ssl', label: 'SSL' },
              { value: 'none', label: 'None' },
            ]}
          />
          <SettingInput
            label={tAdmin('smtp_username', 'SMTP Username')}
            value={settings['notification.smtp_username'] ?? ''}
            onChange={value => updateSetting('notification.smtp_username', value)}
            placeholder="email@example.com"
          />
          <SettingInput
            label={tAdmin('smtp_password', 'SMTP Password')}
            type="password"
            allowClipboard
            value={settings['notification.smtp_password'] ?? ''}
            onChange={value => updateSetting('notification.smtp_password', value)}
            hint={settings['notification.smtp_password']
              ? tAdmin('mail_password_saved_hint', 'Mật khẩu đã lưu. Để trống khi lưu sẽ giữ nguyên giá trị cũ.')
              : tAdmin('mail_password_empty_hint', 'Dán App Password hoặc mật khẩu SMTP tại đây.')}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">
            {tAdmin('test_mail_section_title', 'Kiểm tra cấu hình gửi mail')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder={tAdmin('test_email_placeholder', 'Nhập email nhận thử nghiệm...')}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sending || !testEmail}
              className="flex items-center justify-center gap-1.5 py-2.5 px-5 bg-primary hover:bg-primary/95 disabled:bg-gray-300 disabled:dark:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              {tAdmin('test_email_btn', 'Gửi Email Thử Nghiệm')}
            </button>
          </div>
        </div>
      </div>

      {showHelp && <MailHelpModal onClose={() => setShowHelp(false)} tAdmin={tAdmin} />}
    </>
  )
}
