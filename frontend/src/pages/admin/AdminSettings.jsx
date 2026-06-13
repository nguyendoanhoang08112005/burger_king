/**
 * AdminSettings.jsx - Admin settings page (multi-tab: general, shipping, appearance, etc.)
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Bell, Download, Gift, Globe, Loader2, MapPin, Palette,
  Save, Search, Settings, Star, Store, Trash2, Truck, X, ChevronRight,
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
  const [testAddress, setTestAddress] = useState({ lat: 10.781232, lng: 106.685324, order_amount: 178000 })
  const [testResult, setTestResult] = useState(null)
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

  const calculateTestShipping = async () => {
    const { data } = await apiClient.post('/shipping/calculate', testAddress)
    setTestResult(data.data)
  }

  const parseTiers = () => {
    const tiers = settings['shipping.distance_tiers']
    if (Array.isArray(tiers)) return tiers
    try { return JSON.parse(tiers || '[]') } catch { return [] }
  }

  const updateTiers = tiers => updateSetting('shipping.distance_tiers', tiers)

  const renderGeneral = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('store_name')} value={getTransValue(settings['general.store_name'])} onChange={value => updateTransSetting('general.store_name', value)} />
        <SettingInput label={tAdmin('slogan')} value={getTransValue(settings['general.store_tagline'])} onChange={value => updateTransSetting('general.store_tagline', value)} />
        <SettingInput label={tAdmin('hotline')} value={settings['general.hotline']} onChange={value => updateSetting('general.hotline', value)} />
        <SettingInput label={tAdmin('support_email')} value={settings['general.email']} onChange={value => updateSetting('general.email', value)} />
      </div>
      <SettingTextarea label={tAdmin('store_description')} value={getTransValue(settings['general.store_description'])} onChange={value => updateTransSetting('general.store_description', value)} />
      <SettingSelect
        label={tAdmin('address')}
        value={selectedBranchId}
        onChange={handleBranchChange}
        options={branchOptions}
        disabled={!branches.length}
        hint={selectedBranch ? `${tAdmin('branch_address_source')}: ${selectedBranchAddress}` : tAdmin('select_branch_hint')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput
          label={tAdmin('logo')}
          value={settings['general.logo']}
          uploadType="logo"
          width={settings['general.logo_width'] ?? 260}
          height={settings['general.logo_height'] ?? 64}
          onChange={value => updateSetting('general.logo', value)}
          onWidthChange={value => updateSetting('general.logo_width', value)}
          onHeightChange={value => updateSetting('general.logo_height', value)}
        />
        <AdminImageInput
          label={tAdmin('favicon')}
          value={settings['general.favicon']}
          uploadType="favicon"
          width={settings['general.favicon_width'] ?? 56}
          height={settings['general.favicon_height'] ?? 56}
          onChange={value => updateSetting('general.favicon', value)}
          onWidthChange={value => updateSetting('general.favicon_width', value)}
          onHeightChange={value => updateSetting('general.favicon_height', value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'zalo_url', 'google_maps_key'].map(key => (
          <SettingInput key={key} label={key.replaceAll('_', ' ')} value={settings[`general.${key}`]} onChange={value => updateSetting(`general.${key}`, value)} />
        ))}
      </div>
      <SettingToggle label={tAdmin('maintenance_mode')} description={tAdmin('maintenance_desc')} checked={!!settings['general.maintenance_mode']} onChange={value => updateSetting('general.maintenance_mode', value)} />
      <SettingTextarea label={tAdmin('maintenance_message')} value={getTransValue(settings['general.maintenance_message'])} onChange={value => updateTransSetting('general.maintenance_message', value)} />
    </div>
  )

  const renderShipping = () => {
    const tiers = parseTiers()
    return (
      <div className="space-y-5">
        <SettingSelect label={tAdmin('shipping_method')} value={settings['shipping.method'] || 'fixed'} onChange={value => updateSetting('shipping.method', value)} options={[{ value: 'fixed', label: tAdmin('fixed') }, { value: 'distance', label: tAdmin('distance') }, { value: 'free', label: tAdmin('free_all') }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput label={tAdmin('base_fee')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.base_fee']} onChange={value => updateSetting('shipping.base_fee', value)} />
          <SettingInput label={tAdmin('free_from')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.free_from_amount']} onChange={value => updateSetting('shipping.free_from_amount', value)} hint={tAdmin('free_from_hint')} />
          <SettingInput label={tAdmin('per_km_fee')} type="number" suffix={settings['localization.currency_symbol'] || 'VND'} value={settings['shipping.per_km_fee']} onChange={value => updateSetting('shipping.per_km_fee', value)} />
          <SettingInput label={tAdmin('max_distance')} type="number" suffix="km" value={settings['shipping.max_distance_km']} onChange={value => updateSetting('shipping.max_distance_km', value)} />
        </div>
        <SettingInput label={tAdmin('main_store_address')} value={selectedBranchAddress} onChange={() => {}} disabled hint={tAdmin('managed_from_overview')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingInput label={tAdmin('latitude')} type="number" value={selectedBranchLat} onChange={() => {}} disabled />
          <SettingInput label={tAdmin('longitude')} type="number" value={selectedBranchLng} onChange={() => {}} disabled />
          <SettingInput label={tAdmin('estimated_time')} value={typeof settings['shipping.estimated_time'] === 'object' ? settings['shipping.estimated_time']?.vi || '' : settings['shipping.estimated_time'] || ''} onChange={value => updateSetting('shipping.estimated_time', value)} />
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{tAdmin('distance_tiers')}</h3>
            <button type="button" onClick={() => updateTiers([...tiers, { max_km: 0, fee: 0 }])} className="text-sm font-semibold text-[#D62300]">{tAdmin('add_tier')}</button>
          </div>
          <div className="space-y-2">
            {tiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input type="number" value={tier.max_km} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, max_km: Number(event.target.value) } : item))} className={fieldInputClass} placeholder={tAdmin('to_km')} />
                <input type="number" value={tier.fee} onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, fee: Number(event.target.value) } : item))} className={fieldInputClass} placeholder={tAdmin('fee')} />
                <button type="button" onClick={() => updateTiers(tiers.filter((_, i) => i !== index))} className="px-3 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
              </div>
            ))}
            {!tiers.length && <p className="text-sm text-gray-400">{tAdmin('no_tiers')}</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold mb-3">{tAdmin('test_shipping')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="number" value={testAddress.lat} onChange={event => setTestAddress(prev => ({ ...prev, lat: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lat" />
            <input type="number" value={testAddress.lng} onChange={event => setTestAddress(prev => ({ ...prev, lng: Number(event.target.value) }))} className={fieldInputClass} placeholder="Lng" />
            <input type="number" value={testAddress.order_amount} onChange={event => setTestAddress(prev => ({ ...prev, order_amount: Number(event.target.value) }))} className={fieldInputClass} placeholder={tAdmin('order_value')} />
            <button type="button" onClick={calculateTestShipping} className="rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700">{tAdmin('calculate')}</button>
          </div>
          {testResult && (
            <div className={`mt-3 rounded-xl p-3 text-sm ${testResult.out_of_range ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {testResult.out_of_range ? testResult.message : `${tAdmin('shipping_fee_result')}: ${testResult.is_free ? tAdmin('free') : formatVND(testResult.fee || 0)}${testResult.distance_km ? ` - ${testResult.distance_km}km` : ''}`}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderAppearance = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingInput label={tAdmin('primary_color')} type="color" value={settings['appearance.primary_color']} onChange={value => updateSetting('appearance.primary_color', value)} />
        <SettingInput label={tAdmin('secondary_color')} type="color" value={settings['appearance.secondary_color']} onChange={value => updateSetting('appearance.secondary_color', value)} />
        <SettingSelect label={tAdmin('font')} value={settings['appearance.font_family']} onChange={value => updateSetting('appearance.font_family', value)} options={[{ value: 'DM Sans', label: 'DM Sans' }, { value: 'Inter', label: 'Inter' }, { value: 'Arial', label: 'Arial' }]} />
      </div>
    </div>
  )

  const renderNotification = () => (
    <div className="space-y-5">
      <SettingToggle label={tAdmin('email_order_created')} checked={!!settings['notification.email_order_created']} onChange={value => updateSetting('notification.email_order_created', value)} />
      <SettingToggle label={tAdmin('email_order_status')} checked={!!settings['notification.email_order_status']} onChange={value => updateSetting('notification.email_order_status', value)} />
      <SettingToggle label={tAdmin('email_new_user')} checked={!!settings['notification.email_new_user']} onChange={value => updateSetting('notification.email_new_user', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('admin_email')} value={settings['notification.admin_email']} onChange={value => updateSetting('notification.admin_email', value)} />
        <SettingSelect label={tAdmin('email_driver')} value={settings['notification.email_driver']} onChange={value => updateSetting('notification.email_driver', value)} options={[{ value: 'smtp', label: 'SMTP' }, { value: 'mailgun', label: 'Mailgun' }, { value: 'ses', label: 'SES' }]} />
        <SettingInput label="SMTP host" value={settings['notification.smtp_host']} onChange={value => updateSetting('notification.smtp_host', value)} />
        <SettingInput label="SMTP port" type="number" value={settings['notification.smtp_port']} onChange={value => updateSetting('notification.smtp_port', value)} />
        <SettingInput label="SMTP username" value={settings['notification.smtp_username']} onChange={value => updateSetting('notification.smtp_username', value)} />
        <SettingInput label="SMTP password" type="password" value={settings['notification.smtp_password']} onChange={value => updateSetting('notification.smtp_password', value)} />
      </div>
    </div>
  )

  const renderLocalization = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingSelect
          label={tAdmin('timezone')}
          value={settings['localization.timezone']}
          onChange={value => updateSetting('localization.timezone', value)}
          options={[
            { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' },
            { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
            { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
            { value: 'Asia/Seoul', label: 'Asia/Seoul' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
            { value: 'America/New_York', label: 'America/New_York' },
            { value: 'UTC', label: 'UTC' },
          ]}
        />
        <div className="block">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">{tAdmin('currency')}</span>
          <select
            value={settings['localization.currency'] || ''}
            onChange={e => {
              const opt = CURRENCY_OPTIONS.find(o => o.value === e.target.value)
              updateSetting('localization.currency', e.target.value)
              if (opt) updateSetting('localization.currency_symbol', opt.symbol)
            }}
            className={`${fieldInputClass} mt-2`}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <SettingInput label={tAdmin('currency_symbol')} value={settings['localization.currency_symbol']} onChange={value => updateSetting('localization.currency_symbol', value)} />
        <SettingSelect label={tAdmin('currency_position')} value={settings['localization.currency_position']} onChange={value => updateSetting('localization.currency_position', value)} options={[{ value: 'after', label: tAdmin('after_amount') }, { value: 'before', label: tAdmin('before_amount') }]} />
        <SettingSelect label={tAdmin('number_format')} value={settings['localization.number_format']} onChange={value => updateSetting('localization.number_format', value)} options={[{ value: 'dot', label: '1.000' }, { value: 'comma', label: '1,000' }]} />
      </div>
    </div>
  )

  const renderSeo = () => (
    <div className="space-y-5">
      <SettingInput label="Meta title" value={getTransValue(settings['seo.meta_title'])} onChange={value => updateTransSetting('seo.meta_title', value)} />
      <SettingTextarea label="Meta description" value={getTransValue(settings['seo.meta_description'])} onChange={value => updateTransSetting('seo.meta_description', value)} />
      <SettingInput label="Meta keywords" value={getTransValue(settings['seo.meta_keywords'])} onChange={value => updateTransSetting('seo.meta_keywords', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label="Google Analytics" value={settings['seo.google_analytics']} onChange={value => updateSetting('seo.google_analytics', value)} />
        <SettingInput label="Facebook Pixel" value={settings['seo.facebook_pixel']} onChange={value => updateSetting('seo.facebook_pixel', value)} />
      </div>
      <SettingTextarea label="robots.txt" rows={5} value={settings['seo.robots_txt']} onChange={value => updateSetting('seo.robots_txt', value)} />
    </div>
  )

  const renderLoyalty = () => (
    <div className="space-y-5">
      <SettingToggle label={tAdmin('enable_loyalty')} checked={!!settings['loyalty.enabled']} onChange={value => updateSetting('loyalty.enabled', value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('vnd_per_point')} type="number" value={settings['loyalty.points_per_vnd']} onChange={value => updateSetting('loyalty.points_per_vnd', value)} />
        <SettingInput label={tAdmin('point_value')} type="number" value={settings['loyalty.vnd_per_point']} onChange={value => updateSetting('loyalty.vnd_per_point', value)} />
        <SettingInput label={tAdmin('min_redeem_points')} type="number" value={settings['loyalty.min_redeem_points']} onChange={value => updateSetting('loyalty.min_redeem_points', value)} />
        <SettingInput label={tAdmin('expires_after')} type="number" suffix={tAdmin('days')} value={settings['loyalty.expiry_days']} onChange={value => updateSetting('loyalty.expiry_days', value)} />
      </div>
    </div>
  )

  const renderReviewComplaint = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput label={tAdmin('review_expiry_days')} type="number" suffix={tAdmin('days')} value={settings['review.expiry_days']} onChange={value => updateSetting('review.expiry_days', value)} />
        <SettingInput label={tAdmin('complaint_expiry_hours')} type="number" suffix={tAdmin('hours_unit') || 'giờ'} value={settings['complaint.expiry_hours']} onChange={value => updateSetting('complaint.expiry_hours', value)} />
        <SettingInput label={tAdmin('review_bonus_points')} type="number" suffix={tAdmin('points_unit') || 'điểm'} value={settings['review.bonus_points']} onChange={value => updateSetting('review.bonus_points', value)} />
        <SettingInput label={tAdmin('complaint_notification_email')} type="text" value={settings['complaint.notification_email']} onChange={value => updateSetting('complaint.notification_email', value)} />
      </div>
      <SettingToggle label={tAdmin('review_auto_approve_stars')} checked={!!settings['review.auto_approve_stars']} onChange={value => updateSetting('review.auto_approve_stars', value)} />
      <SettingToggle label={tAdmin('review_email_reminder')} checked={!!settings['review.email_reminder']} onChange={value => updateSetting('review.email_reminder', value)} />
    </div>
  )

  const tabContent = {
    general: renderGeneral,
    shipping: renderShipping,
    appearance: renderAppearance,
    notification: renderNotification,
    localization: renderLocalization,
    seo: renderSeo,
    loyalty: renderLoyalty,
    review_complaint: renderReviewComplaint,
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
          {tabContent[activeTab]?.()}
        </div>
      </div>
    </AdminPageShell>
  )
}
