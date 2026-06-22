import { useState, useEffect, useMemo, Suspense, lazy, useRef } from 'react'
import { Link } from 'react-router-dom'

// Lazy loaded tab components
const GeneralSettings = lazy(() => import('../../components/admin/settings/GeneralSettings'))
const ShippingSettings = lazy(() => import('../../components/admin/settings/ShippingSettings'))
const AppearanceSettings = lazy(() => import('../../components/admin/settings/AppearanceSettings'))
const NotificationSettings = lazy(() => import('../../components/admin/settings/NotificationSettings'))
const MailSettings = lazy(() => import('../../components/admin/settings/MailSettings'))
const LocalizationSettings = lazy(() => import('../../components/admin/settings/LocalizationSettings'))
const SeoSettings = lazy(() => import('../../components/admin/settings/SeoSettings'))
const LoyaltySettings = lazy(() => import('../../components/admin/settings/LoyaltySettings'))
const ReviewComplaintSettings = lazy(() => import('../../components/admin/settings/ReviewComplaintSettings'))
import {
  Bell, Download, Gift, Globe, Loader2, MapPin, Palette,
  Save, Search, Settings, Star, Store, Trash2, Truck, X, ChevronRight, Mail,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminText, renderFlag } from '../../utils/adminUtils'
import {
  SettingInput, SettingTextarea, SettingSelect, SettingToggle, AdminImageInput,
  fieldInputClass, CURRENCY_OPTIONS,
} from '../../utils/adminUtils'
import { AdminPageShell, TableSkeleton, EmptyTableRow } from '../../components/layout/AdminLayout'
import { useUiStore } from '../../store/uiStore'
import { useRefLang } from '../../hooks/useRefLang'
import apiClient from '../../api/axios'

// ─── Setting tabs ──────────────────────────────────────────────────────────────

const settingTabs = [
  { key: 'general', labelKey: 'general', icon: Store },
  { key: 'shipping', labelKey: 'shipping', icon: Truck },
  { key: 'appearance', labelKey: 'appearance', icon: Palette },
  { key: 'mail', labelKey: 'mail', icon: Mail },
  { key: 'notification', labelKey: 'notification', icon: Bell },
  { key: 'localization', labelKey: 'localization', icon: Globe },
  { key: 'seo', labelKey: 'seo', icon: Search },
  { key: 'loyalty', labelKey: 'loyalty', icon: Gift },
  { key: 'review_complaint', labelKey: 'review_complaint', icon: Star },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(value) {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

// ─── AdminLanguageLocalesPage ──────────────────────────────────────────────────

export function AdminLanguageLocalesPage() {
  const tAdmin = useAdminText()
  const [locales, setLocales] = useState([])
  const [availableLocales, setAvailableLocales] = useState([])
  const [selectedCode, setSelectedCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const setPublicSettings = useUiStore(state => state.setPublicSettings)

  const refreshPublicSettings = async () => {
    try {
      const { data } = await apiClient.get('/settings/public')
      setPublicSettings(data.data || {})
    } catch (e) {
      console.error('Failed to refresh public settings', e)
    }
  }

  const loadLocales = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await apiClient.get('/admin/translations/locales')
      setLocales(data.active || [])
      setAvailableLocales(data.available || [])
    } catch {
      toast.error(tAdmin('languages_load_error') || 'Lỗi tải danh sách ngôn ngữ')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadLocales()
  }, [])

  const handleAdd = async () => {
    if (!selectedCode) return
    setSaving(true)
    try {
      await apiClient.post('/admin/translations/locales', {
        code: selectedCode
      })
      toast.success(tAdmin('toast_language_added', 'Đã thêm ngôn ngữ mới thành công!'))
      setSelectedCode('')
      await loadLocales()
      await refreshPublicSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('toast_language_add_error', 'Lỗi khi thêm ngôn ngữ mới'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(tAdmin('confirm_delete_language', 'Bạn có chắc chắn muốn xóa ngôn ngữ {{code}}? Toàn bộ tệp dịch tương ứng sẽ bị loại bỏ.', { code }))) return
    setSaving(true)
    try {
      await apiClient.delete(`/admin/translations/locales/${code}`)
      toast.success(tAdmin('toast_language_deleted', 'Đã xóa ngôn ngữ!'))
      await loadLocales()
      await refreshPublicSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('toast_language_delete_error', 'Lỗi khi xóa ngôn ngữ'))
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (code) => {
    setSaving(true)
    try {
      await apiClient.patch(`/admin/translations/locales/${code}/default`)
      toast.success(tAdmin('toast_default_language_changed', 'Đã đặt làm ngôn ngữ mặc định mới!'))
      await loadLocales()
      await refreshPublicSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('toast_default_language_change_error', 'Lỗi khi thay đổi ngôn ngữ mặc định'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell title={tAdmin('languages_management', 'Quản Lý Ngôn Ngữ')} eyebrow={tAdmin('settings', 'Cài đặt')}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Locales đang dùng */}
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>{tAdmin('languages_in_use', 'Ngôn Ngữ Đang Dùng')}</span>
            {saving && <Loader2 size={16} className="animate-spin text-[#D62300]" />}
          </h3>
          {loading ? (
            <div className="space-y-4 py-4">
              <TableSkeleton rows={3} cols={2} />
            </div>
          ) : (
            <div className="space-y-3">
              {locales.map(locale => (
                <div key={locale.code}
                  className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all bg-gray-50/30 dark:bg-[#161825]/30">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl leading-none flex items-center" role="img" aria-label={locale.name}>
                      {renderFlag(locale.code, "h-6 w-9 rounded-md object-cover shadow-md")}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {locale.native_name} ({locale.code.toUpperCase()})
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {locale.is_default && (
                          <span className="text-[10px] font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200/50">
                            {tAdmin('default', 'Mặc định')}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {tAdmin('progress_translated_with_percent', '{{percent}}% đã dịch', { percent: locale.progress ?? 100 })}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-36 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                        <div
                           className="h-full bg-[#D62300] rounded-full transition-all duration-500"
                          style={{ 
                            width: `${locale.progress ?? 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {locale.code !== 'vi' && (
                      <Link
                        to={`/admin/translations/${locale.code}`}
                        className="text-xs px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-all">
                        {tAdmin('translate', 'Dịch')}
                      </Link>
                    )}
                    {!locale.is_default && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSetDefault(locale.code)}
                          disabled={saving}
                          className="text-xs px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-all cursor-pointer">
                          {tAdmin('set_default', 'Đặt mặc định')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(locale.code)}
                          disabled={saving}
                          className="text-xs px-3 py-2 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition-all cursor-pointer">
                          {tAdmin('delete', 'Xóa')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!locales.length && (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                  {tAdmin('no_languages_configured', 'Chưa cấu hình ngôn ngữ nào')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thêm ngôn ngữ mới */}
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
            {tAdmin('add_language_title', 'Thêm Ngôn Ngữ Mới')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            {tAdmin('add_language_desc', 'Sau khi thêm, hệ thống sẽ tự động tạo tệp dịch mới bằng cách sao chép cấu trúc từ bản dịch tiếng Anh để giữ tính nhất quán. Bạn có thể dịch từng key trong trang quản lý dịch thuật.')}
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                {tAdmin('select_language_label', 'Chọn Ngôn Ngữ Muốn Thêm')}
              </label>
              <select
                value={selectedCode}
                onChange={e => setSelectedCode(e.target.value)}
                disabled={saving}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-300 bg-white dark:bg-[#161825] text-gray-800 dark:text-gray-100">
                <option value="">{tAdmin('select_language_placeholder', 'Chọn ngôn ngữ...')}</option>
                {availableLocales.map(locale => (
                  <option key={locale.code} value={locale.code}>
                    {locale.flag} {locale.native_name} ({locale.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedCode || saving}
              className="w-full py-3 bg-[#D62300] hover:bg-[#b51e00] text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors shadow-md shadow-red-500/10 cursor-pointer">
              {saving ? tAdmin('processing', 'Đang xử lý...') : tAdmin('add_language_btn', 'Thêm ngôn ngữ')}
            </button>
          </div>

          {/* Info box */}
          <div className="mt-5 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <span>💡 {tAdmin('after_adding_note_title', 'Sau khi thêm ngôn ngữ:')}</span>
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>{tAdmin('after_adding_note_1', 'Biểu tượng cờ tự động xuất hiện trên menu chọn ngôn ngữ của trang khách hàng.')}</li>
              <li>{tAdmin('after_adding_note_2', 'File JSON dịch tự động được tạo từ template bản tiếng Anh (hoặc tiếng Việt).')}</li>
              <li>{tAdmin('after_adding_note_3', 'Các key chưa dịch sẽ tự động fallback về tiếng Anh (hoặc tiếng Việt) để đảm bảo không lỗi giao diện.')}</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}

// ─── AdminSettingsDatabasePage (main Settings page) ───────────────────────────

export default function AdminSettingsDatabasePage() {
  const tAdmin = useAdminText()
  const { refLang, switchLang, LOCALES } = useRefLang()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const setPublicSetting = useUiStore(state => state.setPublicSetting)

  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateTransSetting = (key, text) => {
    const val = settings[key]
    const current = typeof val === 'object' && val !== null ? val : { vi: typeof val === 'string' ? val : '', en: '' }
    const next = { ...current, [refLang]: text }
    updateSetting(key, next)
  }

  const getTransValue = val => {
    if (typeof val === 'object' && val !== null) return val[refLang] || ''
    return val || ''
  }

  const getLocalizedField = (item, key, locale = refLang) => {
    const value = item?.[key]
    if (typeof value === 'object' && value !== null) return value[locale] || value.vi || value.en || ''
    const translated = item?.translations?.[key]
    if (typeof translated === 'object' && translated !== null) return translated[locale] || translated.vi || translated.en || ''
    return value || ''
  }

  const getBranchAddress = (branch, locale = refLang) => getLocalizedField(branch, 'address', locale)
  const getBranchLat = branch => branch?.lat ?? branch?.latitude ?? ''
  const getBranchLng = branch => branch?.lng ?? branch?.longitude ?? ''

  const normalizeListResponse = payload => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const savedBranchId = settings['general.branch_id'] ? String(settings['general.branch_id']) : ''
  const savedBranchAddress = getTransValue(settings['general.address']) || settings['shipping.store_address'] || ''
  const savedBranchLat = settings['shipping.store_lat'] ?? ''
  const savedBranchLng = settings['shipping.store_lng'] ?? ''
  const inferredBranch = savedBranchId ? null : branches.find(branch => {
    const branchAddresses = [getBranchAddress(branch, 'vi'), getBranchAddress(branch, 'en'), getBranchAddress(branch)]
      .filter(Boolean).map(address => String(address).trim())
    const branchLat = getBranchLat(branch)
    const branchLng = getBranchLng(branch)
    return (
      (savedBranchAddress && branchAddresses.includes(String(savedBranchAddress).trim())) ||
      (savedBranchLat !== '' && savedBranchLng !== '' && String(branchLat) === String(savedBranchLat) && String(branchLng) === String(savedBranchLng))
    )
  })
  const selectedBranchId = savedBranchId || (inferredBranch ? String(inferredBranch.id) : '')
  const selectedBranch = branches.find(branch => String(branch.id) === selectedBranchId)
  const selectedBranchAddress = selectedBranch ? getBranchAddress(selectedBranch) : getTransValue(settings['general.address'])
  const selectedBranchLat = selectedBranch ? getBranchLat(selectedBranch) : (settings['shipping.store_lat'] ?? '')
  const selectedBranchLng = selectedBranch ? getBranchLng(selectedBranch) : (settings['shipping.store_lng'] ?? '')
  const branchOptions = [
    { value: '', label: branches.length ? tAdmin('select_branch') : tAdmin('no_branch_available') },
    ...branches.map(branch => {
      const name = getLocalizedField(branch, 'name') || `#${branch.id}`
      const address = getBranchAddress(branch)
      return { value: String(branch.id), label: address ? `${name} - ${address}` : name }
    }),
  ]

  const buildBranchSyncedSettings = (baseSettings, branchId) => {
    const normalizedBranchId = branchId ? String(branchId) : ''
    const branch = branches.find(item => String(item.id) === normalizedBranchId)
    if (!branch) return { ...baseSettings, 'general.branch_id': normalizedBranchId }
    const fallbackAddress = getBranchAddress(branch)
    const addressValue = {
      ...(typeof baseSettings['general.address'] === 'object' && baseSettings['general.address'] !== null ? baseSettings['general.address'] : {}),
      vi: getBranchAddress(branch, 'vi') || fallbackAddress,
      en: getBranchAddress(branch, 'en') || fallbackAddress,
    }
    return {
      ...baseSettings,
      'general.branch_id': normalizedBranchId,
      'general.address': addressValue,
      'shipping.store_address': fallbackAddress,
      'shipping.store_lat': getBranchLat(branch),
      'shipping.store_lng': getBranchLng(branch),
    }
  }

  const flattenSettings = groups => {
    const flat = {}
    Object.entries(groups || {}).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => { flat[`${group}.${key}`] = value })
    })
    return flat
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const [settingsRes, branchesRes] = await Promise.all([
        apiClient.get('/admin/settings'),
        apiClient.get('/admin/branches', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
      ])
      setSettings(flattenSettings(settingsRes.data.data || {}))
      setBranches(normalizeListResponse(branchesRes.data))
      setDirty(false)
    } catch {
      toast.error(tAdmin('settings_load_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    Promise.all([
      apiClient.get('/admin/settings'),
      apiClient.get('/admin/branches', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([settingsRes, branchesRes]) => {
        if (ignore) return
        setSettings(flattenSettings(settingsRes.data.data || {}))
        setBranches(normalizeListResponse(branchesRes.data))
        setDirty(false)
      })
      .catch(() => toast.error(tAdmin('settings_load_error')))
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [tAdmin])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setPublicSetting(key, value)
    setDirty(true)
  }

  const handleBranchChange = branchId => {
    const nextSettings = buildBranchSyncedSettings(settings, branchId)
    setSettings(nextSettings)
    ;['general.branch_id', 'general.address', 'shipping.store_address', 'shipping.store_lat', 'shipping.store_lng'].forEach(key => {
      setPublicSetting(key, nextSettings[key])
    })
    setDirty(true)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const payloadSettings = selectedBranchId ? buildBranchSyncedSettings(settings, selectedBranchId) : settings
      await apiClient.put('/admin/settings', { settings: payloadSettings })
      toast.success(tAdmin('settings_saved'))
      await loadSettings()
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('settings_save_error'))
    } finally {
      setSaving(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings}
            updateSetting={updateSetting}
            updateTransSetting={updateTransSetting}
            getTransValue={getTransValue}
            selectedBranchId={selectedBranchId}
            handleBranchChange={handleBranchChange}
            branchOptions={branchOptions}
            branches={branches}
            selectedBranch={selectedBranch}
            selectedBranchAddress={selectedBranchAddress}
            tAdmin={tAdmin}
          />
        )
      case 'shipping':
        return (
          <ShippingSettings
            settings={settings}
            updateSetting={updateSetting}
            selectedBranchAddress={selectedBranchAddress}
            selectedBranchLat={selectedBranchLat}
            selectedBranchLng={selectedBranchLng}
            tAdmin={tAdmin}
            formatVND={formatVND}
          />
        )
      case 'appearance':
        return (
          <AppearanceSettings
            settings={settings}
            updateSetting={updateSetting}
            updateTransSetting={updateTransSetting}
            getTransValue={getTransValue}
            refLang={refLang}
            branches={branches}
            tAdmin={tAdmin}
          />
        )
      case 'mail':
        return (
          <MailSettings
            settings={settings}
            updateSetting={updateSetting}
            tAdmin={tAdmin}
            onSettingsReload={loadSettings}
          />
        )
      case 'notification':
        return (
          <NotificationSettings
            settings={settings}
            updateSetting={updateSetting}
            tAdmin={tAdmin}
          />
        )
      case 'localization':
        return (
          <LocalizationSettings
            settings={settings}
            updateSetting={updateSetting}
            tAdmin={tAdmin}
          />
        )
      case 'seo':
        return (
          <SeoSettings
            settings={settings}
            updateSetting={updateSetting}
            updateTransSetting={updateTransSetting}
            getTransValue={getTransValue}
            tAdmin={tAdmin}
          />
        )
      case 'loyalty':
        return (
          <LoyaltySettings
            settings={settings}
            updateSetting={updateSetting}
            tAdmin={tAdmin}
          />
        )
      case 'review_complaint':
        return (
          <ReviewComplaintSettings
            settings={settings}
            updateSetting={updateSetting}
            tAdmin={tAdmin}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AdminPageShell title={tAdmin('settings')}>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm"><TableSkeleton rows={7} cols={3} /></div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title={tAdmin('settings')}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-300">{tAdmin('settings_desc')}</p>
        <button type="button" onClick={saveSettings} disabled={saving || !dirty} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${dirty ? 'bg-[#D62300] hover:bg-[#b51e00]' : 'bg-gray-300 cursor-not-allowed'}`}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {dirty ? tAdmin('save_changes') : tAdmin('saved')}
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-6">
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-2 shadow-sm h-fit">
          {settingTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeTab === tab.key ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Icon size={16} />
                {tAdmin(tab.labelKey)}
              </button>
            )
          })}
        </div>
        <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-700 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{tAdmin(settingTabs.find(tab => tab.key === activeTab)?.labelKey)}</h2>
            {['general', 'seo', 'appearance'].includes(activeTab) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161825] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 transition shadow-sm cursor-pointer"
                >
                  {renderFlag(refLang, "w-4 h-2.5 object-cover rounded-sm shadow-sm")}
                  <span>{LOCALES.find(l => l.code === refLang)?.short || refLang.toUpperCase()}</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#1E2130] border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1.5 z-30 animate-fade-in-down">
                    {LOCALES.map(locale => {
                      const isActive = locale.code === refLang
                      return (
                        <button
                          type="button"
                          key={locale.code}
                          onClick={() => {
                            switchLang(locale.code)
                            setLangDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition ${
                            isActive
                              ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-bold'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {renderFlag(locale.code, "w-4 h-2.5 object-cover rounded-sm shadow-sm")}
                            <span>{locale.label || locale.name || locale.short}</span>
                          </div>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D62300]" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <Suspense fallback={<div className="text-center py-10"><Loader2 className="animate-spin inline-block mr-2" size={16} />{tAdmin('loading') || 'Loading...'}</div>}>
            {renderTabContent()}
          </Suspense>
        </div>
      </div>
    </AdminPageShell>
  )
}
