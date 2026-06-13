import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
  Save,
  Info,
  X
} from 'lucide-react'
import apiClient from '../../api/axios'
import { useRefLang } from '../../hooks/useRefLang'
import { formatVND } from '../../utils/format'
import {
  assetUrl,
  logoSizeValue,
  useAdminText,
  fieldInputClass,
  slugify,
  skuify,
  SettingInput,
  AdminImageInput
} from '../../utils/adminUtils'
import {
  AdminPageShell,
  TableSkeleton,
  EmptyTableRow,
  Pagination
} from '../../components/layout/AdminLayout'

export function AdminProductsPage({ products, categories, loading, meta, filters, setFilters, onToggleFlag, onDelete, onPageChange }) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const tableLocale = i18n.language?.startsWith('en') ? 'en' : 'vi'
  const tAdmin = useAdminText()

  return (
    <AdminPageShell title={tAdmin('products')} action={tAdmin('add_product')} onAction={() => navigate('/admin/products/create')}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={event => setFilters(prev => ({ ...prev, search: event.target.value, page: 1 }))}
              placeholder={tAdmin('search_products')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
            />
          </div>
          <select
            value={filters.categoryId}
            onChange={event => setFilters(prev => ({ ...prev, categoryId: event.target.value, page: 1 }))}
            className="flex-1 min-w-[220px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{tAdmin('all_categories')}</option>
            {categories.map(category => {
              const catName = category.name && typeof category.name === 'object' ? (category.name[tableLocale] || category.name.vi) : category.name
              return <option key={category.id} value={category.id}>{catName}</option>
            })}
          </select>
          <select
            value={filters.available}
            onChange={event => setFilters(prev => ({ ...prev, available: event.target.value, page: 1 }))}
            className="flex-1 min-w-[180px] border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{tAdmin('all_statuses')}</option>
            <option value="true">{tAdmin('available')}</option>
            <option value="false">{tAdmin('unavailable')}</option>
          </select>
          <button
            type="button"
            onClick={() => setFilters({ search: '', categoryId: '', available: '', page: 1 })}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            {tAdmin('reset')}
          </button>
        </div>

        {loading ? <TableSkeleton rows={6} cols={9} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3">{tAdmin('product')}</th>
                  <th className="py-3">{tAdmin('category')}</th>
                  <th className="py-3">{tAdmin('base_price')}</th>
                  <th className="py-3">{tAdmin('sale_price')}</th>
                  <th className="py-3">{tAdmin('featured')}</th>
                  <th className="py-3">{tAdmin('status')}</th>
                  <th className="py-3 text-center">
                    <img src="/flags/vn.svg" alt="Vietnamese" className="mx-auto h-5 w-7 rounded-sm object-cover shadow-sm" />
                  </th>
                  <th className="py-3 text-center">
                    <img src="/flags/us.svg" alt="English" className="mx-auto h-5 w-7 rounded-sm object-cover shadow-sm" />
                  </th>
                  <th className="py-3 text-right">{tAdmin('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products.map(product => {
                  const productName = product.name && typeof product.name === 'object' ? (product.name[tableLocale] || product.name.vi) : product.name
                  const categoryName = product.category?.name && typeof product.category.name === 'object' ? (product.category.name[tableLocale] || product.category.name.vi) : product.category?.name
                  const missingEn = tableLocale === 'en' && (!product.translations?.name?.en)

                  return (
                    <tr key={product.id} className="text-gray-700 dark:text-gray-200">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={assetUrl(product.thumbnail)} alt={productName} className="w-11 h-11 object-cover rounded-lg bg-gray-100" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{productName}</p>
                            <p className="text-xs text-gray-400">{product.sku || product.slug}</p>
                            {missingEn && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 mt-0.5 font-medium">
                                <span>⚠️</span>
                                <span>{tAdmin('no_en_translation')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{categoryName || 'N/A'}</td>
                      <td className="py-3">{formatVND(product.base_price)}</td>
                      <td className="py-3 text-[#D62300] font-semibold">{product.sale_price ? formatVND(product.sale_price) : '-'}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => onToggleFlag(product.id, 'is_featured', product.is_featured)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${product.is_featured ? 'bg-[#D62300]' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${product.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => onToggleFlag(product.id, 'is_available', product.is_available)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${product.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-label="Toggle available"
                        >
                          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${product.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          title={tAdmin('edit_vi')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                          aria-label={tAdmin('edit_vi')}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${product.id}/edit?ref_lang=en`)}
                          title={tAdmin('edit_en')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer"
                          aria-label={tAdmin('edit_en')}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button type="button" onClick={() => onDelete(product)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 cursor-pointer"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!products.length && <EmptyTableRow colSpan={9} />}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <Pagination page={meta.current_page} totalPages={meta.last_page} onChange={onPageChange} />
        </div>
      </div>
    </AdminPageShell>
  )
}

export function AdminProductFormPage({ categories, itemId }) {
  const params = useParams()
  const id = itemId ?? params.id
  const isCreate = !id
  const navigate = useNavigate()
  const { refLang, currentLocale, isDefault, LOCALES } = useRefLang()
  const tAdmin = useAdminText()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Translatable fields
  const [translations, setTranslations] = useState({
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
    short_description: { vi: '', en: '' },
  })

  // Shared non-translatable fields
  const [fields, setFields] = useState({
    category_id: '',
    slug: '',
    sku: '',
    base_price: '',
    sale_price: '',
    thumbnail: '',
    is_featured: false,
    is_available: true,
    sort_order: 0,
    sizes: [
      { size: 'S', sku: '', extra_price: 0, is_available: true },
      { size: 'M', sku: '', extra_price: 15000, is_available: true },
      { size: 'L', sku: '', extra_price: 30000, is_available: true },
    ],
  })

  // Fetch product data if edit mode
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get(`/admin/products/${id}`)
        const p = res.data.data
        setTranslations(p.translations || {
          name: { vi: '', en: '' },
          description: { vi: '', en: '' },
          short_description: { vi: '', en: '' },
        })
        setFields({
          category_id: p.category_id || '',
          slug: p.slug || '',
          sku: p.sku || '',
          base_price: p.base_price || '',
          sale_price: p.sale_price || '',
          thumbnail: p.thumbnail || '',
          is_featured: !!p.is_featured,
          is_available: p.is_available ?? true,
          sort_order: p.sort_order || 0,
          sizes: p.sizes?.length ? p.sizes : [
            { size: 'S', sku: '', extra_price: 0, is_available: true },
            { size: 'M', sku: '', extra_price: 15000, is_available: true },
            { size: 'L', sku: '', extra_price: 30000, is_available: true },
          ],
        })
      } catch {
        toast.error(tAdmin('product_not_found'))
      } finally {
        setLoading(false)
      }
    }

    if (!isCreate && id) {
      loadProduct()
    }
  }, [id, isCreate, tAdmin])

  const updateTranslation = (field, value) => {
    setTranslations(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [refLang]: value
      }
    }))
    if (field === 'name' && refLang === 'vi' && isCreate) {
      setFields(prev => ({
        ...prev,
        slug: slugify(value),
        sku: prev.sku || skuify('PRD', value),
      }))
    }
  }

  const updateField = (key, value) => {
    setFields(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && isCreate) {
        const nameVal = typeof value === 'object' ? (value?.vi || '') : value
        next.slug = slugify(nameVal)
      }
      return next
    })
  }

  const handleSave = async (andContinue = false) => {
    if (!translations.name.vi?.trim()) {
      toast.error(tAdmin('product_name_required'))
      return
    }
    setSaving(true)
    try {
      const payload = { ...fields, translations }
      let savedId = id

      if (isCreate) {
        const res = await apiClient.post('/admin/products', payload)
        savedId = res.data.data.id
        toast.success(tAdmin('product_created'))
      } else {
        await apiClient.put(`/admin/products/${id}`, payload)
        toast.success(tAdmin('saved_bang'))
      }

      if (andContinue) {
        if (isCreate) {
          navigate(`/admin/products/${savedId}/edit?ref_lang=${refLang}`)
        }
      } else {
        navigate('/admin/products')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || tAdmin('generic_error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#D62300]" size={28} /></div>
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400'

  return (
    <AdminPageShell title={isCreate ? tAdmin('add_product_title') : tAdmin('edit_product_title')} action={tAdmin('back')} onAction={() => navigate('/admin/products')}>
      {/* Warning Banner */}
      {!isDefault && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
          <Info size={16} className="text-blue-500 flex-shrink-0 animate-bounce" />
          <p className="text-sm text-blue-700">
            {tAdmin('editing_locale_notice', { locale: currentLocale.label })}
          </p>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        {/* Left Form */}
        <div className="space-y-5 bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          {/* Name */}
          <div className="text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {tAdmin('product_name')} {isDefault && <span className="text-red-500">*</span>}
            </label>
            <input
              value={translations.name?.[refLang] || ''}
              onChange={e => updateTranslation('name', e.target.value)}
              placeholder={tAdmin('enter_product_name')}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.name?.vi && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <span>🇻🇳 {tAdmin('original_vi')}</span>
                <span className="font-medium">{translations.name.vi}</span>
              </p>
            )}
          </div>

          {/* Slug (only edit on default vi) */}
          {isDefault && (
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</label>
              <input
                value={fields.slug}
                onChange={e => updateField('slug', e.target.value)}
                placeholder="slug..."
                className={inputClass}
              />
            </div>
          )}

          {isDefault && (
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sku')}</label>
              <input
                value={fields.sku}
                onChange={e => updateField('sku', e.target.value.toUpperCase())}
                placeholder="PRD-WHOPPER"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>
            </div>
          )}

          {/* Category */}
          <div className="text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('category')}</label>
            <select
              disabled={!isDefault}
              value={fields.category_id}
              onChange={e => updateField('category_id', e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            >
              <option value="">{tAdmin('select_category')}</option>
              {categories.map(category => {
                const catName = category.name && typeof category.name === 'object' ? (category.name.vi || '') : category.name
                return <option key={category.id} value={category.id}>{catName}</option>
              })}
            </select>
          </div>

          {/* Short description */}
          <div className="text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('short_description')}</label>
            <textarea
              value={translations.short_description?.[refLang] || ''}
              onChange={e => updateTranslation('short_description', e.target.value)}
              placeholder={tAdmin('enter_short_description')}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.short_description?.vi && (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5">
                <span className="flex-shrink-0">🇻🇳 {tAdmin('original_vi')}</span>
                <span>{translations.short_description.vi}</span>
              </p>
            )}
          </div>

          {/* Detailed description */}
          <div className="text-left">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('detailed_description')}</label>
            <textarea
              value={translations.description?.[refLang] || ''}
              onChange={e => updateTranslation('description', e.target.value)}
              placeholder={tAdmin('enter_detailed_description')}
              rows={6}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {!isDefault && translations.description?.vi && (
              <details className="mt-1">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 outline-none">🇻🇳 {tAdmin('view_original_vi')}</summary>
                <p className="text-xs text-gray-400 mt-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  {translations.description.vi}
                </p>
              </details>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('base_price')}</label>
              <input
                disabled={!isDefault}
                type="number"
                value={fields.base_price}
                onChange={e => updateField('base_price', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sale_price')}</label>
              <input
                disabled={!isDefault}
                type="number"
                value={fields.sale_price || ''}
                onChange={e => updateField('sale_price', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Sorting */}
          {isDefault && (
            <div className="text-left">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('sort_order')}</label>
              <input
                type="number"
                value={fields.sort_order}
                onChange={e => updateField('sort_order', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          )}

          {/* Sizes (shared - disabled in EN) */}
          <div className={`border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 ${!isDefault ? 'opacity-60' : ''} text-left`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{tAdmin('sizes')}</h3>
              {isDefault && (
                <button
                  type="button"
                  onClick={() => updateField('sizes', [...fields.sizes, { size: 'XL', sku: fields.sku ? `${fields.sku}-XL` : '', extra_price: 0, is_available: true }])}
                  className="text-xs font-semibold text-[#D62300] cursor-pointer"
                >
                  {tAdmin('add_size')}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>
            {fields.sizes.map((size, index) => (
              <div key={index} className="grid grid-cols-[80px_minmax(160px,1fr)_110px_90px_40px] gap-2">
                <select
                  disabled={!isDefault}
                  value={size.size}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, size: e.target.value, sku: row.sku || (fields.sku ? `${fields.sku}-${e.target.value}` : '') } : row))}
                  className={inputClass}
                >
                  {['S', 'M', 'L', 'XL'].map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <input
                  disabled={!isDefault}
                  value={size.sku || ''}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, sku: e.target.value.toUpperCase() } : row))}
                  placeholder={tAdmin('sku')}
                  className={inputClass}
                />
                <input
                  disabled={!isDefault}
                  type="number"
                  value={size.extra_price}
                  onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, extra_price: Number(e.target.value) } : row))}
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    disabled={!isDefault}
                    type="checkbox"
                    checked={!!size.is_available}
                    onChange={e => updateField('sizes', fields.sizes.map((row, i) => i === index ? { ...row, is_available: e.target.checked } : row))}
                  />
                  {tAdmin('available')}
                </label>
                {isDefault && (
                  <button
                    type="button"
                    onClick={() => updateField('sizes', fields.sizes.filter((_, i) => i !== index))}
                    className="text-red-500 font-semibold cursor-pointer"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Publish card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('publish')}</h4>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {tAdmin('save_continue')}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              {tAdmin('save')}
            </button>
          </div>

          {/* Language card */}
          <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('language')}</h4>
            <div className="space-y-1">
              {LOCALES.map(locale => {
                const isActive = locale.code === refLang
                const hasTranslation = locale.code === 'vi' || !!translations.name?.[locale.code]

                const editUrl = isCreate
                  ? `/admin/products/create${locale.code !== 'vi' ? `?ref_lang=${locale.code}` : ''}`
                  : locale.code === 'vi'
                    ? `/admin/products/${id}/edit`
                    : `/admin/products/${id}/edit?ref_lang=${locale.code}`

                return (
                  <Link
                    key={locale.code}
                    to={editUrl}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isActive
                        ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{locale.flag}</span>
                      <span>{locale.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${hasTranslation ? 'bg-green-400' : 'bg-gray-300'}`} />
                      {isActive && <ExternalLink size={12} className="text-gray-400" />}
                    </div>
                  </Link>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400">
              🟢 {tAdmin('translated')} &nbsp; ⚪ {tAdmin('not_translated')}
            </p>
          </div>

          {/* Options card (only edit on default locale) */}
          {isDefault && (
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3 text-left">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('options')}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{tAdmin('featured')}</label>
                  <button
                    type="button"
                    onClick={() => updateField('is_featured', !fields.is_featured)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${fields.is_featured ? 'bg-[#D62300]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${fields.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{tAdmin('available')}</label>
                  <button
                    type="button"
                    onClick={() => updateField('is_available', !fields.is_available)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${fields.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${fields.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image card (only edit on default locale) */}
          <div className={`${!isDefault ? 'opacity-60' : ''}`}>
            <AdminImageInput
              label={tAdmin('product_image')}
              value={fields.thumbnail}
              onChange={value => {
                if (isDefault) updateField('thumbnail', value)
              }}
            />
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
