/**
 * AdminSettings.jsx - Admin settings page (multi-tab: general, shipping, appearance, etc.)
 */
import { useState, useEffect, useMemo, Suspense, lazy } from 'react'

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
import { useAdminText } from '../../utils/adminUtils'
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
  const [available, setAvailable] = useState([])
  const [defaultLocale, setDefaultLocale] = useState('vi')
  const [selectedLocale, setSelectedLocale] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const enabledCodes = useMemo(() => new Set(locales.map(locale => locale.code)), [locales])
  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return available
      .filter(locale => !enabledCodes.has(locale.code))
      .filter(locale => !normalizedQuery || `${locale.name} ${locale.code}`.toLowerCase().includes(normalizedQuery))
  }, [available, enabledCodes, query])

  const selectedName = available.find(locale => locale.code === selectedLocale)?.name || ''

  useEffect(() => {
    let ignore = false
    apiClient.get('/admin/translations/locales')
      .then(({ data }) => {
        if (ignore) return
        const payload = data.data || {}
        setLocales(payload.locales || [])
        setAvailable(payload.available || [])
        setDefaultLocale(payload.default || 'vi')
      })
      .catch(() => toast.error(tAdmin('languages_load_error')))
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [tAdmin])

  const addLocale = async () => {
    if (!selectedLocale) { toast.error(tAdmin('language_required')); return }
    setSaving(true)
    try {
      const { data } = await apiClient.post('/admin/translations/locales', { locale: selectedLocale })
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setAvailable(payload.available || [])
      setDefaultLocale(payload.default || 'vi')
      setSelectedLocale('')
      setQuery('')
      toast.success(tAdmin('language_added'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('language_add_error'))
    } finally {
      setSaving(false)
    }
  }

  const makeDefault = async locale => {
    if (locale === defaultLocale) return
    setSaving(true)
    try {
      const { data } = await apiClient.patch(`/admin/translations/locales/${locale}/default`)
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setDefaultLocale(payload.default || locale)
      toast.success(tAdmin('default_language_changed'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('default_language_error'))
    } finally {
      setSaving(false)
    }
  }

  const deleteLocale = async locale => {
    setSaving(true)
    try {
      const { data } = await apiClient.delete(`/admin/translations/locales/${locale}`)
      const payload = data.data || {}
      setLocales(payload.locales || [])
      setDefaultLocale(payload.default || 'vi')
      toast.success(tAdmin('language_deleted'))
    } catch (error) {
      toast.error(error.response?.data?.message || tAdmin('language_delete_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell title={tAdmin('languages')} eyebrow={tAdmin('localization_breadcrumb')}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)] gap-5">
        <div className="bg-white dark:bg-[#1E2130] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tAdmin('languages')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tAdmin('select_language')}</span>
              <div className="mt-2 rounded-lg border border-blue-300 dark:border-blue-500/70 ring-4 ring-blue-100 dark:ring-blue-500/10 bg-white dark:bg-[#161825] overflow-hidden">
                <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-100">
                  <span>{selectedName ? `${selectedName} - ${selectedLocale}` : tAdmin('select_language')}</span>
                  <ChevronRight size={16} className="rotate-90 text-gray-400" />
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={tAdmin('search_language')}
                    className="w-full rounded-lg border border-blue-300 dark:border-blue-500/60 px-3 py-2 text-sm bg-white dark:bg-[#1E2130] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  <button type="button" onClick={() => setSelectedLocale('')} className={`w-full px-4 py-2.5 text-left text-sm ${!selectedLocale ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    {tAdmin('select_language')}
                  </button>
                  {options.map(locale => (
                    <button
                      key={locale.code}
                      type="button"
                      onClick={() => setSelectedLocale(locale.code)}
                      className={`w-full px-4 py-2.5 text-left text-sm ${selectedLocale === locale.code ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {locale.name} - {locale.code}
                    </button>
                  ))}
                  {!options.length && <div className="px-4 py-6 text-center text-sm text-gray-400">{tAdmin('no_language_options')}</div>}
                </div>
              </div>
            </label>
            <button
              type="button"
              onClick={addLocale}
              disabled={saving || !selectedLocale}
              className="inline-flex items-center justify-center rounded-lg bg-[#2b72c9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2362ad] disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : tAdmin('add_language')}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2130] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tAdmin('languages')}</h2>
          </div>
          {loading ? (
            <div className="p-6"><TableSkeleton rows={3} cols={4} /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#161825]">
                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3 font-semibold">{tAdmin('language_name')}</th>
                  <th className="px-6 py-3 font-semibold text-center">{tAdmin('language_code')}</th>
                  <th className="px-6 py-3 font-semibold text-center">{tAdmin('is_default')}</th>
                  <th className="px-6 py-3 font-semibold text-right">{tAdmin('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {locales.map(locale => (
                  <tr key={locale.code} className="text-gray-800 dark:text-gray-100">
                    <td className="px-6 py-4 font-medium">{locale.name}</td>
                    <td className="px-6 py-4 text-center">{locale.code}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={saving || locale.is_default}
                        onClick={() => makeDefault(locale.code)}
                        className={`rounded-md px-3 py-1 text-sm ${locale.is_default ? 'text-gray-900 dark:text-gray-100 cursor-default' : 'text-[#2b72c9] hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                      >
                        {locale.is_default ? tAdmin('yes') : tAdmin('no')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" title={tAdmin('download_language')} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#2b72c9] text-white hover:bg-[#2362ad]">
                          <Download size={16} />
                        </button>
                        {!locale.is_default && (
                          <button
                            type="button"
                            onClick={() => deleteLocale(locale.code)}
                            disabled={saving}
                            title={tAdmin('delete_language')}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!locales.length && <EmptyTableRow colSpan={4} message={tAdmin('no_languages')} />}
              </tbody>
            </table>
          )}
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
            {['general', 'seo'].includes(activeTab) && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200/50 dark:border-slate-700/50">
                {LOCALES.map(locale => {
                  const isActive = locale.code === refLang
                  return (
                    <button
                      type="button"
                      key={locale.code}
                      onClick={() => switchLang(locale.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-200 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-700 text-[#D62300] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                      <img src={locale.flagImg} alt={locale.label} className="w-4 h-2.5 object-cover rounded-sm shadow-sm" />
                      <span>{locale.short}</span>
                    </button>
                  )
                })}
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
