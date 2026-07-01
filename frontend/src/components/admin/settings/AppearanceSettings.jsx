import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Check, MapPin } from 'lucide-react'
import {
  SettingInput, SettingSelect
} from '../../../utils/adminUtils'

// Custom branch address picker – better than native select for long text
function BranchAddressPicker({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="block text-left" ref={ref}>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{label}</span>
      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 text-left bg-white hover:border-gray-300 transition-colors"
        >
          <span className="flex items-center gap-2 truncate text-gray-700 dark:text-gray-200">
            <MapPin className="w-3.5 h-3.5 text-[#D62300] shrink-0" />
            <span className="truncate">{selected ? selected.label : '—'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#1E2130] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="max-h-56 overflow-y-auto py-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm ${
                    opt.value === value ? 'bg-red-50 dark:bg-red-500/10' : ''
                  }`}
                >
                  <Check className={`w-4 h-4 shrink-0 mt-0.5 transition-opacity ${
                    opt.value === value ? 'text-[#D62300] opacity-100' : 'opacity-0'
                  }`} />
                  <span className={`leading-snug ${
                    opt.value === value ? 'text-[#D62300] font-semibold' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {opt.value === '' ? (
                      <span className="text-gray-400 dark:text-gray-500 italic">{opt.label}</span>
                    ) : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AppearanceSettings({
  settings,
  updateSetting,
  updateTransSetting,
  getTransValue,
  refLang,
  branches = [],
  tAdmin
}) {
  const { t } = useTranslation()

  // Dynamic fallback values resolved from active translation locale
  const headerHomeVal = getTransValue(settings['appearance.header_nav_home']) || t('nav.home', { lng: refLang })
  const headerMenuVal = getTransValue(settings['appearance.header_nav_menu']) || t('nav.menu', { lng: refLang })
  const headerBranchesVal = getTransValue(settings['appearance.header_nav_branches']) || t('nav.branches', { lng: refLang })
  const headerBlogVal = getTransValue(settings['appearance.header_nav_blog']) || t('nav.blog', { lng: refLang })

  const headerHomeUrlVal = settings['appearance.header_nav_home_url'] || '/'
  const headerMenuUrlVal = settings['appearance.header_nav_menu_url'] || '/menu'
  const headerBranchesUrlVal = settings['appearance.header_nav_branches_url'] || '/branches'
  const headerBlogUrlVal = settings['appearance.header_nav_blog_url'] || '/blog'

  const footerHotlineVal = settings['appearance.footer_hotline'] || settings['general.hotline'] || '1900 8888'
  const footerEmailVal = settings['appearance.footer_email'] || settings['general.email'] || 'support@hamburgerking.com'

  // Find which branch matches the current appearance.footer_address
  const currentFooterAddr = settings['appearance.footer_address']
  const matchedBranch = branches.find(b => JSON.stringify(b.address) === JSON.stringify(currentFooterAddr))
  const selectedBranchId = matchedBranch ? matchedBranch.id.toString() : ''

  const branchAddressOptions = [
    ...branches.map(branch => {
      const name = branch.name?.[refLang] || branch.name?.vi || branch.name?.en || `#${branch.id}`
      const addr = branch.address?.[refLang] || branch.address?.vi || branch.address?.en || ''
      return {
        value: branch.id.toString(),
        label: addr ? `${name} — ${addr}` : name
      }
    })
  ]

  const handleFooterAddressBranchChange = (branchId) => {
    if (!branchId) {
      updateSetting('appearance.footer_address', null)
      return
    }
    const branch = branches.find(b => b.id.toString() === branchId)
    if (branch) {
      updateSetting('appearance.footer_address', branch.address)
    }
  }

  const footerHoursVal = getTransValue(settings['appearance.footer_hours']) || '08:00 - 23:00'
  const footerBrandDescVal = getTransValue(settings['appearance.footer_brand_desc']) || t('footer.brand_desc', { lng: refLang })
  
  const footerMenuTitleVal = getTransValue(settings['appearance.footer_menu_title']) || (refLang === 'vi' ? 'QUY ĐỊNH & CHÍNH SÁCH' : 'LEGAL & POLICIES')
  const footerContactTitleVal = getTransValue(settings['appearance.footer_contact_title']) || t('footer.contact', { lng: refLang }).toUpperCase()
  const footerNewsletterTitleVal = getTransValue(settings['appearance.footer_newsletter_title']) || t('footer.newsletter', { lng: refLang }).toUpperCase()
  const footerNewsletterDescVal = getTransValue(settings['appearance.footer_newsletter_desc']) || t('footer.newsletter_desc', { lng: refLang })

  const footerLink1TextVal = getTransValue(settings['appearance.footer_link1_text']) || (refLang === 'vi' ? 'Về Chúng Tôi' : 'About Us')
  const footerLink1UrlVal = settings['appearance.footer_link1_url'] || '/about'

  const footerLink2TextVal = getTransValue(settings['appearance.footer_link2_text']) || (refLang === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy')
  const footerLink2UrlVal = settings['appearance.footer_link2_url'] || '/privacy'

  const footerLink3TextVal = getTransValue(settings['appearance.footer_link3_text']) || (refLang === 'vi' ? 'Điều Khoản Sử Dụng' : 'Terms of Service')
  const footerLink3UrlVal = settings['appearance.footer_link3_url'] || '/terms'

  const footerLink4TextVal = getTransValue(settings['appearance.footer_link4_text']) || (refLang === 'vi' ? 'Chính Sách Giao Hàng' : 'Delivery Policy')
  const footerLink4UrlVal = settings['appearance.footer_link4_url'] || '/delivery'

  const renderUrlHint = (onChange) => (
    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
      <span className="font-medium mr-1">{refLang === 'vi' ? 'Gợi ý:' : 'Suggest:'}</span>
      {[
        { path: '/', label: refLang === 'vi' ? 'Trang chủ' : 'Home' },
        { path: '/menu', label: refLang === 'vi' ? 'Thực đơn' : 'Menu' },
        { path: '/branches', label: refLang === 'vi' ? 'Chi nhánh' : 'Branches' },
        { path: '/blog', label: refLang === 'vi' ? 'Blog' : 'Blog' },
        { path: '/about', label: refLang === 'vi' ? 'Về chúng tôi' : 'About Us' },
        { path: '/privacy', label: refLang === 'vi' ? 'Bảo mật' : 'Privacy' },
        { path: '/terms', label: refLang === 'vi' ? 'Điều khoản' : 'Terms' },
        { path: '/delivery', label: refLang === 'vi' ? 'Giao hàng' : 'Delivery' },
      ].map(item => (
        <button
          key={item.path}
          type="button"
          onClick={() => onChange(item.path)}
          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-[#D62300] transition font-semibold"
          title={item.label}
        >
          {item.path}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="font-bold text-sm text-[#2C1A16] uppercase tracking-wider mb-4 border-b border-[#E8E8E8] pb-2">
          {tAdmin('theme_settings') || 'Theme Appearance'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingInput 
            label={tAdmin('primary_color')} 
            type="color" 
            value={settings['appearance.primary_color'] || ''} 
            onChange={value => updateSetting('appearance.primary_color', value)} 
          />
          <SettingInput 
            label={tAdmin('secondary_color')} 
            type="color" 
            value={settings['appearance.secondary_color'] || ''} 
            onChange={value => updateSetting('appearance.secondary_color', value)} 
          />
          <SettingSelect 
            label={tAdmin('font')} 
            value={settings['appearance.font_family'] || 'DM Sans'} 
            onChange={value => updateSetting('appearance.font_family', value)} 
            options={[
              { value: 'DM Sans', label: 'DM Sans' }, 
              { value: 'Inter', label: 'Inter' }, 
              { value: 'Arial', label: 'Arial' }
            ]} 
          />
        </div>
      </div>

      <hr className="border-[#E8E8E8] my-6" />

      <div>
        <h3 className="font-bold text-sm text-[#2C1A16] uppercase tracking-wider mb-4 border-b border-[#E8E8E8] pb-2">
          {tAdmin('header_settings_title') || 'HEADER MENU CONFIGURATION'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trang chủ */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('header_nav_home')} 
              value={headerHomeVal} 
              onChange={value => updateTransSetting('appearance.header_nav_home', value)} 
            />
            <SettingInput 
              label={tAdmin('header_nav_home_url', 'Đường dẫn: Trang Chủ')} 
              value={headerHomeUrlVal} 
              onChange={value => updateSetting('appearance.header_nav_home_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.header_nav_home_url', val))}
            />
          </div>

          {/* Thực đơn */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('header_nav_menu')} 
              value={headerMenuVal} 
              onChange={value => updateTransSetting('appearance.header_nav_menu', value)} 
            />
            <SettingInput 
              label={tAdmin('header_nav_menu_url', 'Đường dẫn: Thực Đơn')} 
              value={headerMenuUrlVal} 
              onChange={value => updateSetting('appearance.header_nav_menu_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.header_nav_menu_url', val))}
            />
          </div>

          {/* Chi nhánh & Liên hệ */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('header_nav_branches')} 
              value={headerBranchesVal} 
              onChange={value => updateTransSetting('appearance.header_nav_branches', value)} 
            />
            <SettingInput 
              label={tAdmin('header_nav_branches_url', 'Đường dẫn: Chi Nhánh & Liên Hệ')} 
              value={headerBranchesUrlVal} 
              onChange={value => updateSetting('appearance.header_nav_branches_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.header_nav_branches_url', val))}
            />
          </div>

          {/* Blog */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('header_nav_blog')} 
              value={headerBlogVal} 
              onChange={value => updateTransSetting('appearance.header_nav_blog', value)} 
            />
            <SettingInput 
              label={tAdmin('header_nav_blog_url', 'Đường dẫn: Blog')} 
              value={headerBlogUrlVal} 
              onChange={value => updateSetting('appearance.header_nav_blog_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.header_nav_blog_url', val))}
            />
          </div>
        </div>
      </div>

      <hr className="border-[#E8E8E8] my-6" />

      <div>
        <h3 className="font-bold text-sm text-[#2C1A16] uppercase tracking-wider mb-4 border-b border-[#E8E8E8] pb-2">
          {tAdmin('footer_settings_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput 
            label={tAdmin('footer_hotline')} 
            value={footerHotlineVal} 
            onChange={value => updateSetting('appearance.footer_hotline', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_email')} 
            value={footerEmailVal} 
            onChange={value => updateSetting('appearance.footer_email', value)} 
          />
          <BranchAddressPicker
            label={tAdmin('footer_address_select', 'Lấy địa chỉ từ chi nhánh')}
            value={selectedBranchId}
            onChange={handleFooterAddressBranchChange}
            options={branchAddressOptions}
          />
          <SettingInput 
            label={tAdmin('footer_hours')} 
            value={footerHoursVal} 
            onChange={value => updateTransSetting('appearance.footer_hours', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_brand_desc')} 
            value={footerBrandDescVal} 
            onChange={value => updateTransSetting('appearance.footer_brand_desc', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_menu_title')} 
            value={footerMenuTitleVal} 
            onChange={value => updateTransSetting('appearance.footer_menu_title', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_contact_title')} 
            value={footerContactTitleVal} 
            onChange={value => updateTransSetting('appearance.footer_contact_title', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_newsletter_title')} 
            value={footerNewsletterTitleVal} 
            onChange={value => updateTransSetting('appearance.footer_newsletter_title', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_newsletter_desc')} 
            value={footerNewsletterDescVal} 
            onChange={value => updateTransSetting('appearance.footer_newsletter_desc', value)} 
          />
          <SettingInput 
            label={tAdmin('footer_copyright', 'Văn bản Copyright')}
            value={settings['appearance.footer_copyright'] || t('footer.copyright', { lng: refLang, year: new Date().getFullYear() })}
            onChange={value => updateSetting('appearance.footer_copyright', value)}
          />
          <SettingInput 
            label={tAdmin('footer_credit', 'Văn bản Credit')}
            value={settings['appearance.footer_credit'] || t('footer.credit', { lng: refLang })}
            onChange={value => updateSetting('appearance.footer_credit', value)}
          />
        </div>
      </div>

      <hr className="border-[#E8E8E8] my-6" />

      <div>
        <h3 className="font-bold text-sm text-[#2C1A16] uppercase tracking-wider mb-4 border-b border-[#E8E8E8] pb-2">
          {tAdmin('footer_links_settings_title', 'CẤU HÌNH LIÊN KẾT FOOTER')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Link 1 */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('footer_link1_text', 'Liên kết 1: Tiêu đề')} 
              value={footerLink1TextVal} 
              onChange={value => updateTransSetting('appearance.footer_link1_text', value)} 
            />
            <SettingInput 
              label={tAdmin('footer_link1_url', 'Liên kết 1: Đường dẫn')} 
              value={footerLink1UrlVal} 
              onChange={value => updateSetting('appearance.footer_link1_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.footer_link1_url', val))}
            />
          </div>

          {/* Link 2 */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('footer_link2_text', 'Liên kết 2: Tiêu đề')} 
              value={footerLink2TextVal} 
              onChange={value => updateTransSetting('appearance.footer_link2_text', value)} 
            />
            <SettingInput 
              label={tAdmin('footer_link2_url', 'Liên kết 2: Đường dẫn')} 
              value={footerLink2UrlVal} 
              onChange={value => updateSetting('appearance.footer_link2_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.footer_link2_url', val))}
            />
          </div>

          {/* Link 3 */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('footer_link3_text', 'Liên kết 3: Tiêu đề')} 
              value={footerLink3TextVal} 
              onChange={value => updateTransSetting('appearance.footer_link3_text', value)} 
            />
            <SettingInput 
              label={tAdmin('footer_link3_url', 'Liên kết 3: Đường dẫn')} 
              value={footerLink3UrlVal} 
              onChange={value => updateSetting('appearance.footer_link3_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.footer_link3_url', val))}
            />
          </div>

          {/* Link 4 */}
          <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150/80 dark:border-gray-800/50 rounded-2xl shadow-sm">
            <SettingInput 
              label={tAdmin('footer_link4_text', 'Liên kết 4: Tiêu đề')} 
              value={footerLink4TextVal} 
              onChange={value => updateTransSetting('appearance.footer_link4_text', value)} 
            />
            <SettingInput 
              label={tAdmin('footer_link4_url', 'Liên kết 4: Đường dẫn')} 
              value={footerLink4UrlVal} 
              onChange={value => updateSetting('appearance.footer_link4_url', value)} 
              hint={renderUrlHint(val => updateSetting('appearance.footer_link4_url', val))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
