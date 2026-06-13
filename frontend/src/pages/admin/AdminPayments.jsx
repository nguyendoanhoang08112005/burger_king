/**
 * AdminPayments.jsx - Admin payment plugins management page
 */
import { useState, useEffect } from 'react'
import { Banknote, Eye, EyeOff, Gift, Info, Loader2, Settings, WalletCards, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import apiClient from '../../api/axios'
import { useAdminText } from '../../utils/adminUtils'
import { AdminPageShell, EmptyState, TableSkeleton } from '../../components/layout/AdminLayout'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pluginLogos = {
  vnpay: '/payment-logos/vnpay.svg',
  momo: '/payment-logos/momo.svg',
  zalopay: '/payment-logos/zalopay.svg',
  sepay: '/payment-logos/sepay.svg',
  stripe: '/payment-logos/stripe.svg',
  paypal: '/payment-logos/paypal.svg',
}

const configFields = {
  vnpay: [
    { key: 'vnp_TmnCode', label: 'Terminal Code', type: 'text' },
    { key: 'vnp_HashSecret', label: 'Hash Secret', type: 'password' },
    { key: 'vnp_Url', label: 'Payment URL', type: 'text' },
    { key: 'vnp_ReturnUrl', label: 'Return URL', type: 'text' },
  ],
  momo: [
    { key: 'partner_code', label: 'Partner Code', type: 'text' },
    { key: 'access_key', label: 'Access Key', type: 'password' },
    { key: 'secret_key', label: 'Secret Key', type: 'password' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
  ],
  zalopay: [
    { key: 'app_id', label: 'App ID', type: 'text' },
    { key: 'key1', label: 'Key 1', type: 'password' },
    { key: 'key2', label: 'Key 2', type: 'password' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
  ],
  sepay: [
    { key: 'api_key', label: 'API Key', type: 'password' },
    { key: 'account_number', labelKey: 'account_number', type: 'text' },
    { key: 'bank_code', labelKey: 'bank_code', type: 'text' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
  ],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
    { key: 'secret_key', label: 'Secret Key', type: 'password' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
  ],
  paypal: [
    { key: 'client_id', label: 'Client ID', type: 'text' },
    { key: 'client_secret', label: 'Client Secret', type: 'password' },
    { key: 'mode', labelKey: 'environment', type: 'select', options: ['sandbox', 'live'] },
  ],
}

// ─── PaymentPluginLogo ─────────────────────────────────────────────────────────

function PaymentPluginLogo({ plugin }) {
  const logo = pluginLogos[plugin.key]
  if (logo) {
    return <img src={logo} alt={`${plugin.name} logo`} className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-100 bg-white object-contain p-2" />
  }
  const Icon = plugin.key === 'cod' ? Banknote : plugin.key === 'loyalty_points' ? Gift : WalletCards
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
      <Icon size={24} />
    </div>
  )
}

// ─── PluginConfigModal ─────────────────────────────────────────────────────────

function PluginConfigModal({ plugin, onClose, onSave }) {
  const tAdmin = useAdminText()
  const [config, setConfig] = useState(plugin.config || {})
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const fields = configFields[plugin.key] || []

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanConfig = Object.fromEntries(
        Object.entries(config).filter(([, value]) => !(typeof value === 'string' && value.includes('•')))
      )
      await onSave(cleanConfig)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <div onMouseDown={event => event.stopPropagation()} className="bg-white dark:bg-[#1E2130] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{tAdmin('configure_plugin', { name: plugin.name })}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{tAdmin('plugin_credentials_hint')}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors">
            <X size={16} />
            {tAdmin('close')}
          </button>
        </div>
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">{tAdmin('masked_fields_hint')}</p>
        </div>
        <div className="p-5 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5 block">{field.labelKey ? tAdmin(field.labelKey) : field.label}</label>
              {field.type === 'select' ? (
                <select value={config[field.key] || ''} onChange={event => setConfig(prev => ({ ...prev, [field.key]: event.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-300">
                  {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <div className="relative">
                  <input
                    type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                    value={config[field.key] || ''}
                    onChange={event => setConfig(prev => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:border-red-300"
                  />
                  {field.type === 'password' && (
                    <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPasswords[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#161825] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{tAdmin('cancel')}</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm text-white bg-[#D62300] rounded-xl hover:bg-[#b51e00] disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {tAdmin('save_config')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AdminPaymentsPage ─────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const tAdmin = useAdminText()
  const { i18n } = useTranslation()
  const currentLang = i18n.language
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)
  const [configModal, setConfigModal] = useState(null)

  const fetchPlugins = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/admin/payment-plugins')
      setPlugins(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    apiClient.get('/admin/payment-plugins')
      .then(({ data }) => {
        if (!ignore) setPlugins(data.data || [])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [currentLang])

  const handleToggle = async plugin => {
    if (plugin.is_default) return
    setPlugins(prev => prev.map(item => item.key === plugin.key ? { ...item, is_active: !item.is_active } : item))
    try {
      const { data } = await apiClient.patch(`/admin/payment-plugins/${plugin.key}/toggle`)
      toast.success(data.message || tAdmin('plugin_updated'))
    } catch {
      setPlugins(prev => prev.map(item => item.key === plugin.key ? { ...item, is_active: plugin.is_active } : item))
      toast.error(tAdmin('plugin_update_error'))
    }
  }

  const saveConfig = async config => {
    await apiClient.put(`/admin/payment-plugins/${configModal.key}/config`, { config })
    toast.success(tAdmin('config_saved'))
    setConfigModal(null)
    await fetchPlugins()
  }

  return (
    <AdminPageShell title={tAdmin('payment_methods')}>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tAdmin('payment_note')}</p>
      </div>
      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map(plugin => (
            <div key={plugin.key} className={`bg-white dark:bg-[#1E2130] rounded-2xl border-2 p-5 transition-all ${plugin.is_active && !plugin.is_default ? 'border-green-200 shadow-md' : 'border-gray-100 dark:border-gray-700'}`}>
              <div className="flex items-start gap-4">
                <PaymentPluginLogo plugin={plugin} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{plugin.name}</h3>
                    {plugin.is_default && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tAdmin('default_badge')}</span>}
                    {plugin.is_active && !plugin.is_default && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">{tAdmin('active')}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{plugin.description}</p>
                </div>
              </div>
              {!plugin.is_default && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(plugin)} className={`relative w-11 h-6 rounded-full transition-colors ${plugin.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${plugin.is_active ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className="text-sm text-gray-500">{plugin.is_active ? tAdmin('enabled') : tAdmin('disabled')}</span>
                  </div>
                  <button onClick={() => setConfigModal(plugin)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings size={14} />
                    {tAdmin('config')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {!plugins.length && <div className="md:col-span-2"><EmptyState message={tAdmin('no_payment_plugins')} /></div>}
        </div>
      )}
      {configModal && <PluginConfigModal plugin={configModal} onClose={() => setConfigModal(null)} onSave={saveConfig} />}
    </AdminPageShell>
  )
}
