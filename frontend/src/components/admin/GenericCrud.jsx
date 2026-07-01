import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import toast from 'react-hot-toast'
import {
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
  Save,
  Info,
  X,
  MapPin
} from 'lucide-react'
import apiClient from '../../api/axios'
import { useCrud } from '../../hooks/useCrud'
import { useRefLang } from '../../hooks/useRefLang'
import AdminTable from './AdminTable'
import AdminSearch from './AdminSearch'
import AdminPagination from './AdminPagination'
import StatusBadge from './StatusBadge'
import VietnamAddressSelector from '../VietnamAddressSelector'
import { formatDate, formatVND } from '../../utils/format'
import {
  assetUrl,
  useAdminText,
  fieldInputClass,
  slugify,
  skuify,
  SettingInput,
  AdminImageInput,
  renderFlag
} from '../../utils/adminUtils'
import {
  AdminPageShell,
  ConfirmDialog
} from '../layout/AdminLayout'

export const bannerPositionOptions = [
  { value: 'blog_hero', labelKey: 'banner_position_blog_hero' },
  { value: 'popup', labelKey: 'banner_position_popup' },
  { value: 'sidebar', labelKey: 'banner_position_sidebar' },
  { value: 'gallery', labelKey: 'banner_position_gallery' },
  { value: 'cta',     labelKey: 'banner_position_cta' },
]

export const toppingIcon = category => category === 'cheese' ? '🧀' : category === 'meat' ? '🥓' : category === 'veggie' ? '🧅' : '🏺'

export function ToppingCategoryBadge({ category }) {
  const tAdmin = useAdminText()
  const label = tAdmin(category) === category ? category : tAdmin(category)
  return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">{label}</span>
}

export const imageThumb = (src, size = 'w-12 h-12', fallback = null) => (
  src ? <img src={assetUrl(src)} alt="" className={`${size} object-cover rounded-lg bg-gray-100`} /> : <div className={`${size} rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg`}>{fallback}</div>
)

export function ToggleCell({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export function TagInputField({ field, form, updateField, isDefault, fieldLabel, tAdmin }) {
  const tags = Array.isArray(form[field.key]) ? form[field.key] : []
  const [tagInputVal, setTagInputVal] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    let active = true
    const fetchTags = async () => {
      try {
        const res = await apiClient.get('/admin/post-tags')
        const data = res.data?.data || []
        if (active) {
          setAvailableTags(data.map(item => item.name))
        }
      } catch (err) {
        console.error('Failed to load tags from database', err)
      }
    }
    fetchTags()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const suggestions = useMemo(() => {
    const query = tagInputVal.trim().toLowerCase()
    return availableTags.filter(t => {
      const isNotSelected = !tags.includes(t)
      if (!query) return isNotSelected
      return isNotSelected && t.toLowerCase().includes(query)
    })
  }, [availableTags, tags, tagInputVal])

  useEffect(() => {
    setActiveIndex(0)
  }, [suggestions])

  const addTag = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed || tags.includes(trimmed)) return
    updateField(field.key, [...tags, trimmed])
    if (!availableTags.includes(trimmed)) {
      setAvailableTags(prev => [...prev, trimmed])
    }
  }

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (isOpen && suggestions[activeIndex]) {
        addTag(suggestions[activeIndex])
        setTagInputVal('')
      } else if (tagInputVal.trim()) {
        addTag(tagInputVal)
        setTagInputVal('')
      }
      setIsOpen(false)
    } else if (e.key === 'Backspace' && !tagInputVal && tags.length > 0) {
      updateField(field.key, tags.slice(0, -1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex(prev => (prev + 1) % Math.max(1, suggestions.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex(prev => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div key={field.key} className="space-y-1.5 text-left relative" ref={containerRef}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {fieldLabel(field)}
      </label>
      <div
        className={`flex flex-wrap gap-1.5 p-2 border rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-300 transition-all ${isDefault ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161825]' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/30 opacity-60'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-500/10 text-[#D62300] text-xs font-medium px-2.5 py-0.5 rounded-full animate-fade-in">
            {tag}
            {isDefault && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  updateField(field.key, tags.filter(t => t !== tag))
                }}
                className="hover:text-red-700 transition-colors font-bold"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {isDefault && (
          <input
            ref={inputRef}
            type="text"
            value={tagInputVal}
            onChange={e => {
              setTagInputVal(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleTagKey}
            placeholder={tags.length === 0 ? tAdmin('tags_placeholder', 'Nhập tag rồi Enter...') : ''}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 py-0.5"
          />
        )}
      </div>

      {isDefault && isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 z-50 max-h-52 overflow-y-auto bg-white dark:bg-[#1E2130] border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl p-1.5 space-y-0.5 animate-fade-in">
          {suggestions.map((tag, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  addTag(tag)
                  setTagInputVal('')
                  setIsOpen(false)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-red-50 dark:bg-red-500/10 text-[#D62300] font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span>{tag}</span>
                {isActive && <span className="text-[10px] text-gray-400">↵ {tAdmin('select', 'chọn')}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}

export const crudPages = {
  categories: {
    endpoint: '/admin/categories',
    defaults: { name: { vi: '', en: '' }, slug: '', description: { vi: '', en: '' }, image: '', sort_order: 0, is_active: true },
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image, 'w-10 h-10') },
      { key: 'name', labelKey: 'category_name' },
      { key: 'slug', label: 'Slug' },
      { key: 'products_count', labelKey: 'products_count' },
      { key: 'sort_order', labelKey: 'sort_order' },
      { key: 'is_active', labelKey: 'status', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'description', labelKey: 'description', type: 'textarea', translatable: true },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'sort_order', labelKey: 'sort_order', type: 'number' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  combos: {
    title: 'Combo Sets',
    endpoint: '/admin/combos',
    defaults: { name: { vi: '', en: '' }, slug: '', sku: '', description: { vi: '', en: '' }, image: '', price: '', sale_price: '', is_active: true, items: [] },
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image) },
      { key: 'name', labelKey: 'combo_name', render: item => <div><p className="font-semibold">{item.name}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      { key: 'sku', labelKey: 'sku' },
      { key: 'price', labelKey: 'base_price', render: item => formatVND(item.price) },
      { key: 'sale_price', labelKey: 'sale_price', render: item => item.sale_price ? <span className="text-[#D62300] font-semibold">{formatVND(item.sale_price)}</span> : '-' },
      { key: 'items_count', labelKey: 'items_count' },
      { key: 'is_active', labelKey: 'active', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'sku', labelKey: 'sku' },
      { key: 'description', labelKey: 'description', type: 'textarea', translatable: true },
      { key: 'price', labelKey: 'price', type: 'number', required: true },
      { key: 'sale_price', labelKey: 'sale_price', type: 'number' },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'items', labelKey: 'combo_items', type: 'comboItems' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  toppings: {
    endpoint: '/admin/toppings',
    defaults: { name: { vi: '', en: '' }, sku: '', category: 'sauce', category_ids: [], price: '', image: '', is_available: true },
    filters: [
      {
        key: 'category', labelKey: 'all_types', options: [
          { value: 'sauce', labelKey: 'sauce' }, { value: 'cheese', labelKey: 'cheese' }, { value: 'veggie', labelKey: 'veggie' }, { value: 'meat', labelKey: 'meat' },
        ]
      },
      { key: 'category_id', labelKey: 'all_applied_categories', options: ({ categories }) => categories.map(category => ({ value: category.id, label: category.name })) },
    ],
    columns: [
      { key: 'image', labelKey: 'image', render: item => imageThumb(item.image, 'w-10 h-10', toppingIcon(item.category)) },
      { key: 'name', labelKey: 'topping_name' },
      { key: 'sku', labelKey: 'sku' },
      { key: 'category', labelKey: 'type', render: item => <ToppingCategoryBadge category={item.category} /> },
      { key: 'category_ids', labelKey: 'apply_to', render: item => item.category_ids?.length || 0 },
      { key: 'price', labelKey: 'price', render: item => formatVND(item.price) },
      { key: 'is_available', labelKey: 'available', toggleKey: 'is_available' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'sku', labelKey: 'sku' },
      {
        key: 'category', labelKey: 'type', type: 'select', required: true, options: [
          { value: 'sauce', labelKey: 'sauce' }, { value: 'cheese', labelKey: 'cheese' }, { value: 'veggie', labelKey: 'veggie' }, { value: 'meat', labelKey: 'meat' },
        ]
      },
      { key: 'category_ids', labelKey: 'all_applied_categories', type: 'categoryMultiSelect' },
      { key: 'price', labelKey: 'price', type: 'number', required: true },
      { key: 'image', labelKey: 'image', type: 'image' },
      { key: 'is_available', labelKey: 'available', type: 'checkbox' },
    ],
  },
  banners: {
    endpoint: '/admin/banners',
    defaults: { title: { vi: '', en: '' }, subtitle: { vi: '', en: '' }, image: '', link: '', position: 'blog_hero', sort_order: 0, starts_at: '', expires_at: '', is_active: true },
    filters: [{ key: 'position', labelKey: 'all_positions', options: bannerPositionOptions }],
    columns: [
      { key: 'image', labelKey: 'preview', render: item => imageThumb(item.image, 'w-20 h-12') },
      { key: 'title', labelKey: 'title' },
      { key: 'position', labelKey: 'position', valueOptions: bannerPositionOptions, render: item => <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">{item.position}</span> },
      { key: 'sort_order', labelKey: 'sort_order' },
      { key: 'is_active', labelKey: 'active', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'title', labelKey: 'title', required: true, translatable: true },
      { key: 'subtitle', labelKey: 'subtitle', translatable: true },
      { key: 'image', labelKey: 'image', type: 'image', required: true },
      { key: 'link', labelKey: 'link_target' },
      { key: 'position', labelKey: 'position', type: 'select', required: true, options: bannerPositionOptions },
      { key: 'sort_order', labelKey: 'sort_order', type: 'number' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  branches: {
    endpoint: '/admin/branches',
    defaults: { name: { vi: '', en: '' }, address: { vi: '', en: '' }, phone: '', open_time: '08:00', close_time: '22:00', lat: '', lng: '', is_active: true },
    columns: [
      { key: 'name', labelKey: 'branch_name' },
      { key: 'address', labelKey: 'address' },
      { key: 'phone', labelKey: 'phone' },
      { key: 'open_time', labelKey: 'open_close_time', render: item => `${item.open_time} - ${item.close_time}` },
      { key: 'is_active', labelKey: 'active_operation', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'address', labelKey: 'address', type: 'branchAddress', required: true, translatable: true },
      { key: 'phone', labelKey: 'phone', required: true },
      { key: 'open_time', labelKey: 'open_time', type: 'time', required: true },
      { key: 'close_time', labelKey: 'close_time', type: 'time', required: true },
      { key: 'lat', labelKey: 'latitude', type: 'number' },
      { key: 'lng', labelKey: 'longitude', type: 'number' },
      { key: 'map_preview', labelKey: 'branch_map', type: 'branchMap' },
      { key: 'is_active', labelKey: 'active_operation', type: 'checkbox' },
    ],
  },
  posts: {
    endpoint: '/admin/posts',
    defaults: { title: { vi: '', en: '' }, slug: '', excerpt: { vi: '', en: '' }, thumbnail: '', category: '', tags: [], read_time: 5, video_url: '', content: { vi: '', en: '' }, is_published: true, published_at: '' },
    filters: [
      { key: 'status', labelKey: 'all_statuses', options: [{ value: 'published', labelKey: 'published' }, { value: 'draft', labelKey: 'draft' }] },
      {
        key: 'category',
        labelKey: 'all_categories',
        options: ({ postCategories }) => (postCategories || [])
          .map(cat => ({
            value: cat.slug || cat,
            label: typeof cat === 'object' ? (cat.name?.vi || cat.name?.en || cat.slug) : cat,
          })),
      },
    ],
    columns: [
      { key: 'thumbnail', labelKey: 'image', render: item => imageThumb(item.thumbnail, 'w-16 h-10') },
      { key: 'title', labelKey: 'title', render: item => <div><p className="font-semibold">{item.title}</p><p className="text-xs text-gray-400">{item.slug}</p></div> },
      {
        key: 'category',
        labelKey: 'blog_category',
        render: item => {
          const lang = i18next.language?.startsWith('en') ? 'en' : 'vi'
          const cat = item.post_category
          if (cat) {
            return cat.name?.[lang] || cat.name?.vi || cat.name?.en || cat.name || item.category
          }
          return item.category
        }
      },
      { key: 'read_time', labelKey: 'read_label', render: item => item.read_time },
      { key: 'is_published', labelKey: 'status', render: item => <StatusBadge status={item.is_published ? 'published' : 'draft'} /> },
      { key: 'published_at', labelKey: 'published_at', render: item => item.published_at ? formatDate(item.published_at) : '-' },
    ],
    fields: [
      { key: 'title', labelKey: 'title', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, required: true, maxLength: 200, translatable: true },
      { key: 'thumbnail', labelKey: 'thumbnail', type: 'image', required: true },
      { key: 'category', labelKey: 'category', type: 'postCategorySelect', required: true },
      { key: 'tags', labelKey: 'tags', type: 'tagInput' },
      { key: 'read_time', labelKey: 'read_time', type: 'number' },
      { key: 'video_url', labelKey: 'video_url' },
      { key: 'content', labelKey: 'content', type: 'textarea', rows: 10, required: true, translatable: true },
      { key: 'is_published', labelKey: 'published', type: 'checkbox' },
      { key: 'published_at', labelKey: 'published_at', type: 'date' },
    ],
  },
  postCategories: {
    endpoint: '/admin/post-categories',
    defaults: { name: { vi: '', en: '' }, slug: '', color: '#D62300', sort_order: 0, is_active: true },
    columns: [
      {
        key: 'color',
        labelKey: 'color',
        render: item => (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full border border-gray-200" style={{ background: item.color || '#D62300' }} />
            <span className="text-xs text-gray-500">{item.color}</span>
          </span>
        ),
      },
      { key: 'name', labelKey: 'category_name' },
      { key: 'slug', label: 'Slug' },
      { key: 'posts_count', labelKey: 'posts_count' },
      { key: 'sort_order', labelKey: 'sort_order' },
      { key: 'is_active', labelKey: 'status', toggleKey: 'is_active' },
    ],
    fields: [
      { key: 'name', labelKey: 'name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
      { key: 'color', labelKey: 'color', type: 'colorInput' },
      { key: 'sort_order', labelKey: 'sort_order', type: 'number' },
      { key: 'is_active', labelKey: 'active', type: 'checkbox' },
    ],
  },
  postTags: {
    endpoint: '/admin/post-tags',
    defaults: { name: { vi: '', en: '' }, slug: '' },
    columns: [
      { key: 'name', labelKey: 'tag_name' },
      { key: 'slug', label: 'Slug' },
      { key: 'posts_count', labelKey: 'posts_count' },
    ],
    fields: [
      { key: 'name', labelKey: 'tag_name', required: true, translatable: true },
      { key: 'slug', label: 'Slug' },
    ],
  },
  contacts: {
    endpoint: '/admin/contacts',
    defaults: { name: '', email: '', phone: '', message: '', type: 'contact', status: 'pending', admin_note: '' },
    filters: [
      {
        key: 'type', labelKey: 'contact_type', options: [
          { value: 'contact', labelKey: 'contact' },
          { value: 'newsletter', labelKey: 'newsletter' }
        ]
      },
      {
        key: 'status', labelKey: 'contact_status', options: [
          { value: 'pending', labelKey: 'contact_pending' },
          { value: 'read', labelKey: 'contact_read' },
          { value: 'replied', labelKey: 'contact_replied' }
        ]
      }
    ],
    columns: [
      { key: 'name', labelKey: 'name', render: item => item.name || '-' },
      { key: 'email', labelKey: 'email' },
      { key: 'phone', labelKey: 'phone', render: item => item.phone || '-' },
      {
        key: 'type',
        labelKey: 'contact_type',
        render: item => {
          const isContact = item.type === 'contact'
          return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isContact ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300'}`}>
              {isContact ? i18next.t('adminPanel.contact', 'Liên hệ') : i18next.t('adminPanel.newsletter', 'Newsletter')}
            </span>
          )
        }
      },
      {
        key: 'status',
        labelKey: 'contact_status',
        render: item => {
          const statusColors = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
            read: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
            replied: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
          }
          const statusLabels = {
            pending: i18next.t('adminPanel.contact_pending', 'Chưa xử lý'),
            read: i18next.t('adminPanel.contact_read', 'Đã đọc'),
            replied: i18next.t('adminPanel.contact_replied', 'Đã trả lời'),
          }
          return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[item.status] || ''}`}>
              {statusLabels[item.status] || item.status}
            </span>
          )
        }
      },
      { key: 'created_at', labelKey: 'created_at', render: item => new Date(item.created_at).toLocaleString('vi-VN') },
    ],
    fields: [
      { key: 'name', labelKey: 'name', readonly: true },
      { key: 'email', labelKey: 'email', readonly: true },
      { key: 'phone', labelKey: 'phone', readonly: true },
      {
        key: 'type',
        labelKey: 'contact_type',
        type: 'select',
        readonly: true,
        options: [
          { value: 'contact', labelKey: 'contact' },
          { value: 'newsletter', labelKey: 'newsletter' }
        ]
      },
      { key: 'message', labelKey: 'contact_message', type: 'textarea', readonly: true, rows: 5 },
      {
        key: 'status',
        labelKey: 'contact_status',
        type: 'select',
        required: true,
        options: [
          { value: 'pending', labelKey: 'contact_pending' },
          { value: 'read', labelKey: 'contact_read' },
          { value: 'replied', labelKey: 'contact_replied' }
        ]
      },
      { key: 'admin_note', labelKey: 'admin_note', type: 'textarea', rows: 3 }
    ],
  },
}

export function GenericCrudPage({ title, endpoint, columns, fields, filters = [], products = [], categories = [], postCategories = [] }) {
  const tAdmin = useAdminText()
  const crud = useCrud(endpoint)
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const tableLocale = i18n.language?.startsWith('en') ? 'en' : 'vi'

  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState({ open: false })
  const [confirmLoading, setConfirmLoading] = useState(false)
  const debouncedSearch = useDebounce(search)
  const hasTranslatableFields = fields.some(field => field.translatable)

  const fetchParams = useMemo(() => ({
    page,
    per_page: 10,
    search: debouncedSearch || undefined,
    ...Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '')),
  }), [page, debouncedSearch, filterValues])

  useEffect(() => {
    crud.fetchAll(fetchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchParams])

  const resourceKey = endpoint.replace(/^\/admin\//, '')
  const titleText = tAdmin(resourceKey)
  const labelFor = value => tAdmin(value) === value ? value : tAdmin(value)
  const filterLabel = filter => {
    if (filter.labelKey) return tAdmin(filter.labelKey)
    if (filter.key === 'status') return tAdmin('all_statuses')
    if (filter.key === 'category') return tAdmin('all_types')
    if (filter.key === 'category_id') return tAdmin('all_applied_categories')
    if (filter.key === 'position') return tAdmin('all_positions')
    return filter.label || filter.key
  }

  const deleteItem = item => {
    setConfirm({
      open: true,
      title: tAdmin('delete_data_title'),
      message: tAdmin('delete_data_message', { name: resolveTranslation(item.name || item.title, tableLocale) || item.code }),
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await crud.remove(item.id)
          setConfirm({ open: false })
          await crud.fetchAll(fetchParams)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  const patchItem = async (item, key) => {
    const nextValue = !item[key]
    crud.setData(current => current.map(row => row.id === item.id ? { ...row, [key]: nextValue } : row))
    try {
      await crud.update(item.id, { ...item, [key]: nextValue })
      toast.success(tAdmin('status_updated'))
    } catch {
      crud.setData(current => current.map(row => row.id === item.id ? { ...row, [key]: item[key] } : row))
      toast.error(tAdmin('update_error'))
    }
  }

  const resolveTranslation = (value, locale = 'vi') => {
    if (value && typeof value === 'object') {
      return value[locale] || value['vi'] || Object.values(value)[0] || '';
    }
    return value;
  }

  const enhancedColumns = columns.map(column => {
    let baseRender = column.render;
    const render = (item) => {
      if (baseRender) {
        // Flatten all translatable attributes into strings for the tableLocale
        const translatedItem = { ...item };
        Object.keys(translatedItem).forEach(key => {
          if (
            translatedItem[key] &&
            typeof translatedItem[key] === 'object' &&
            !Array.isArray(translatedItem[key]) &&
            !('id' in translatedItem[key])
          ) {
            translatedItem[key] = translatedItem[key][tableLocale] || Object.values(translatedItem[key])[0] || '';
          }
        });
        if (column.valueOptions) {
          const rawValue = item[column.key]
          const option = column.valueOptions.find(entry => entry.value === rawValue)
          if (option?.labelKey) translatedItem[column.key] = tAdmin(option.labelKey)
          else if (option?.label) translatedItem[column.key] = option.label
        }
        return baseRender(translatedItem);
      }

      const rawValue = item[column.key];
      if (rawValue && typeof rawValue === 'object') {
        return rawValue[tableLocale] || Object.values(rawValue)[0] || '';
      }
      if (column.valueOptions) {
        const option = column.valueOptions.find(entry => entry.value === rawValue)
        if (option?.labelKey) return tAdmin(option.labelKey)
        if (option?.label) return option.label
      }
      return rawValue;
    };

    const translatedColumnLabel = column.label ? tAdmin(column.label) : column.label
    const label = column.labelKey
      ? tAdmin(column.labelKey)
      : (translatedColumnLabel !== column.label ? translatedColumnLabel : column.label)
    if (column.toggleKey) {
      return {
        ...column,
        label,
        render: item => <ToggleCell checked={!!item[column.toggleKey]} onToggle={() => patchItem(item, column.toggleKey)} />,
      }
    }
    return {
      ...column,
      label,
      render
    }
  })

  const hasAddAction = resourceKey !== 'contacts'
  return (
    <AdminPageShell title={titleText || title} action={hasAddAction ? tAdmin('add_new') : undefined} onAction={hasAddAction ? () => navigate(`/admin/${resourceKey}/create`) : undefined}>
      <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full">
          <AdminSearch value={search} onChange={value => { setSearch(value); setPage(1) }} placeholder={tAdmin('search_resource', { title: titleText.toLowerCase() })} className="relative w-full md:w-auto md:flex-1 min-w-0 md:min-w-[260px]" />
          {filters.map(filter => (
            <select key={filter.key} value={filterValues[filter.key] || ''} onChange={e => { setFilterValues(prev => ({ ...prev, [filter.key]: e.target.value })); setPage(1) }} className={`${fieldInputClass} w-full md:w-auto md:flex-1 min-w-0 md:min-w-[220px]`}>
              <option value="">{filterLabel(filter)}</option>
              {(typeof filter.options === 'function' ? filter.options({ categories, products, postCategories, data: crud.data }) : filter.options).map(option => {
                const rawLabel = option.label && typeof option.label === 'object' ? (option.label[tableLocale] || Object.values(option.label)[0] || '') : option.label
                const optLabel = option.labelKey ? tAdmin(option.labelKey) : labelFor(rawLabel)
                return <option key={option.value} value={option.value}>{optLabel}</option>
              })}
            </select>
          ))}
          <button type="button" onClick={() => { setSearch(''); setFilterValues({}); setPage(1) }} className="w-full md:w-auto px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">{tAdmin('reset')}</button>
        </div>
        {crud.error && <p className="text-sm text-red-500">{crud.error}</p>}
        <AdminTable
          columns={enhancedColumns}
          data={crud.data}
          loading={crud.loading}
          onDelete={deleteItem}
          renderLanguageActions={hasTranslatableFields ? (item, LOCALES) => (
            <>
              {LOCALES.map(locale => {
                const editUrl = locale.is_default
                  ? `/admin/${resourceKey}/${item.id}/edit`
                  : `/admin/${resourceKey}/${item.id}/edit?ref_lang=${locale.code}`

                return (
                  <td key={locale.code} className="py-3 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(editUrl)}
                      title={tAdmin('edit_resource', { title: locale.name })}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${locale.is_default
                          ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
                        }`}
                      aria-label={tAdmin('edit_resource', { title: locale.name })}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                )
              })}
            </>
          ) : undefined}
          renderActions={item => (
            <div className="inline-flex items-center gap-2">
              {!hasTranslatableFields && (
                <button
                  type="button"
                  onClick={() => navigate(`/admin/${resourceKey}/${item.id}/edit`)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                  aria-label={tAdmin('edit')}
                >
                  <Pencil size={15} />
                </button>
              )}
              <button type="button" onClick={() => deleteItem(item)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 cursor-pointer" aria-label={tAdmin('delete')}><Trash2 size={15} /></button>
            </div>
          )}
        />
        <div className="flex justify-end">
          <AdminPagination page={crud.meta?.current_page || page} totalPages={crud.meta?.last_page || 1} onChange={setPage} />
        </div>
      </div>
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} onCancel={() => setConfirm({ open: false })} onConfirm={confirm.onConfirm} loading={confirmLoading} />
    </AdminPageShell>
  )
}

export function GenericCrudFormPage({ config, products = [], categories = [], postCategories = [], itemId }) {
  const tAdmin = useAdminText()
  const params = useParams()
  const id = itemId ?? params.id
  const isCreate = !id
  const navigate = useNavigate()
  const { refLang, currentLocale, isDefault, LOCALES, defaultCode, defaultLocale } = useRefLang()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const translatableKeys = useMemo(() => config.fields.filter(f => f.translatable).map(f => f.key), [config])
  const nameKey = useMemo(() => config.fields.find(f => f.key === 'title') ? 'title' : 'name', [config])
  const resourceKey = config.endpoint.replace(/^\/admin\//, '')
  const titleText = tAdmin(resourceKey)
  const fieldLabel = field => {
    if (field.labelKey) return tAdmin(field.labelKey)
    const translatedLabel = tAdmin(field.key)
    if (translatedLabel !== field.key) return translatedLabel
    return field.label || field.key
  }
  const optionLabel = option => {
    if (typeof option === 'string') return tAdmin(option) === option ? option : tAdmin(option)
    if (option.labelKey) return tAdmin(option.labelKey)
    if (option.label && typeof option.label === 'object') return option.label[refLang] || option.label[defaultCode] || Object.values(option.label)[0] || ''
    if (option.label) return option.label
    return option.value || ''
  }

  const [form, setForm] = useState(config.defaults)

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true)
      try {
        const res = await apiClient.get(`${config.endpoint}/${id}`)
        const fetchedItem = res.data.data
        const merged = { ...config.defaults }
        Object.keys(config.defaults).forEach(key => {
          if (translatableKeys.includes(key)) {
            const translationMap = fetchedItem.translations?.[key] || fetchedItem[key] || {}
            const transObj = {}
            LOCALES.forEach(locale => {
              transObj[locale.code] = (translationMap && typeof translationMap === 'object')
                ? (translationMap[locale.code] || '')
                : (locale.code === defaultCode ? (translationMap || '') : '')
            })
            merged[key] = transObj
          } else {
            merged[key] = fetchedItem[key] !== undefined ? fetchedItem[key] : config.defaults[key]
          }
        })
        setForm(merged)
      } catch (err) {
        console.error(err)
        toast.error(err.response?.data?.message || tAdmin('load_error', 'Không thể tải dữ liệu'))
      } finally {
        setLoading(false)
      }
    }

    if (!isCreate && id) {
      loadItem()
    }
  }, [id, isCreate, config, translatableKeys, tAdmin])

  const updateTranslation = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [refLang]: value
      },
      ...(field === nameKey && refLang === defaultCode && isCreate && !prev.sku
        ? { sku: skuify(resourceKey === 'combos' ? 'CMB' : resourceKey === 'toppings' ? 'TOP' : 'SKU', value) }
        : {}),
    }))
  }

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if ((key === 'name' || key === 'title') && isCreate) {
        const slugField = config.fields.find(f => f.key === 'slug')
        const skuField = config.fields.find(f => f.key === 'sku')
        const nameVal = typeof value === 'object' ? (value?.vi || '') : value
        if (slugField) {
          next.slug = slugify(nameVal)
        }
        if (skuField && !next.sku) {
          next.sku = skuify(resourceKey === 'combos' ? 'CMB' : resourceKey === 'toppings' ? 'TOP' : 'SKU', nameVal)
        }
      }
      return next
    })
  }

  const handleSave = async (andContinue = false) => {
    for (const field of config.fields) {
      if (field.required) {
        if (field.translatable) {
          const val = form[field.key]?.[refLang] || ''
          if (refLang === 'vi' && !val.trim()) {
            toast.error(tAdmin('required_vi', { label: fieldLabel(field).toLowerCase() }))
            return
          }
        } else {
          if (isDefault) {
            const val = form[field.key]
            if (val === undefined || val === null || val === '') {
              toast.error(tAdmin('required_field', { label: fieldLabel(field).toLowerCase() }))
              return
            }
          }
        }
      }
    }

    setSaving(true)
    try {
      const transPayload = {}
      const fieldsPayload = {}

      Object.keys(form).forEach(key => {
        if (translatableKeys.includes(key)) {
          transPayload[key] = form[key]
        } else {
          fieldsPayload[key] = form[key]
        }
      })

      const payload = {
        ...fieldsPayload,
        translations: transPayload
      }

      let savedId = id
      const resource = config.endpoint.replace(/^\/admin\//, '')

      if (isCreate) {
        const res = await apiClient.post(config.endpoint, payload)
        savedId = res.data.data.id
        toast.success(tAdmin('created_resource', { title: titleText.toLowerCase() }))
      } else {
        await apiClient.put(`${config.endpoint}/${id}`, payload)
        toast.success(tAdmin('saved_changes'))
      }

      if (andContinue) {
        if (isCreate) {
          navigate(`/admin/${resource}/${savedId}/edit?ref_lang=${refLang}`)
        }
      } else {
        navigate(`/admin/${resource}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || tAdmin('generic_error'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400'

  const imageField = config.fields.find(f => f.type === 'image' || f.key === 'image' || f.key === 'thumbnail')
  const toggleFields = config.fields.filter(f => f.type === 'checkbox' && (f.key.startsWith('is_') || f.key === 'active' || f.key === 'published'))

  const leftFields = config.fields.filter(field => {
    if (field.type === 'image' || field.key === 'image' || field.key === 'thumbnail') return false
    if (field.type === 'checkbox' && (field.key.startsWith('is_') || field.key === 'active' || field.key === 'published')) return false
    return true
  })

  const renderField = field => {
    if (field.translatable) {
      if (field.type === 'branchAddress') {
        const val = form[field.key]?.[refLang] || ''
        const origVi = form[field.key]?.vi || ''

        const parseAddressString = (addrStr) => {
          if (!addrStr) return { province: '', district: '', ward: '', street: '' }
          const parts = addrStr.split(',').map(p => p.trim())
          const province = parts.pop() || ''
          const district = parts.pop() || ''
          const ward = parts.pop() || ''
          const street = parts.join(', ')
          return { province, district, ward, street }
        }

        const { province, district, ward, street } = parseAddressString(val)

        return (
          <div key={field.key} className="space-y-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/30">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
            </label>
            <VietnamAddressSelector
              province={province}
              district={district}
              ward={ward}
              street={street}
              required={field.required && isDefault}
              onChange={({ province: p, district: d, ward: w, street: s }) => {
                const parts = [s, w, d, p].filter(x => !!x && x.trim() !== '')
                const combined = parts.join(', ')
                updateTranslation(field.key, combined)
              }}
              asGridContainer={true}
              theme="admin"
            />
            {!isDefault && origVi && (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5 border-t border-gray-100 dark:border-gray-700 pt-2">
                <span className="flex-shrink-0">{defaultLocale?.flag || '🇻🇳'} {tAdmin('original_lang', 'Bản gốc')}:</span>
                <span>{origVi}</span>
              </p>
            )}
          </div>
        )
      }

      const isLongText = field.type === 'textarea'
      const showDetails = isLongText && (field.rows >= 5 || field.key === 'content')
      const val = form[field.key]?.[refLang] || ''
      const origVi = form[field.key]?.vi || ''

      return (
        <div key={field.key} className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          {isLongText ? (
            <textarea
              value={val}
              onChange={e => updateTranslation(field.key, e.target.value)}
              placeholder={fieldLabel(field)}
              rows={field.rows || 4}
              className={inputClass}
            />
          ) : (
            <input
              type="text"
              value={val}
              onChange={e => updateTranslation(field.key, e.target.value)}
              placeholder={fieldLabel(field)}
              className={inputClass}
            />
          )}
          {!isDefault && origVi && (
            showDetails ? (
              <details className="mt-1">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 outline-none">{defaultLocale?.flag || '🇻🇳'} {tAdmin('view_original_lang', 'Xem bản gốc')}</summary>
                <p className="text-xs text-gray-400 mt-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 whitespace-pre-wrap">
                  {origVi}
                </p>
              </details>
            ) : (
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1.5">
                <span className="flex-shrink-0">{defaultLocale?.flag || '🇻🇳'} {tAdmin('original_lang', 'Bản gốc')}:</span>
                <span>{origVi}</span>
              </p>
            )
          )}
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          <textarea
            disabled={!isDefault || field.readonly}
            value={form[field.key] || ''}
            onChange={e => updateField(field.key, e.target.value)}
            rows={field.rows || 3}
            className={inputClass}
            required={field.required && isDefault}
            maxLength={field.maxLength}
          />
        </div>
      )
    }

    if (field.type === 'select') {
      const options = typeof field.options === 'function' ? field.options({ products, categories, postCategories }) : field.options
      return (
        <div key={field.key} className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          <select
            disabled={!isDefault || field.readonly}
            value={form[field.key] || ''}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            required={field.required && isDefault}
          >
            <option value="">{tAdmin('choose')}</option>
            {options.map(option => {
              const value = typeof option === 'string' ? option : option.value
              return <option key={value} value={value}>{optionLabel(option)}</option>
            })}
          </select>
        </div>
      )
    }

    if (field.type === 'categoryMultiSelect') {
      const selected = Array.isArray(form[field.key]) ? form[field.key].map(Number) : []
      return (
        <div key={field.key} className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 ${!isDefault ? 'opacity-60' : ''} text-left`}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fieldLabel(field)}</label>
          <p className="text-xs text-gray-500 mb-3">{tAdmin('all_products_categories_hint')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map(category => {
              const catId = Number(category.id)
              const checked = selected.includes(catId)
              const catName = category.name && typeof category.name === 'object' ? (category.name[refLang] || category.name.vi || '') : category.name
              return (
                <label key={category.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${checked ? 'border-[#D62300] bg-red-50 text-[#D62300]' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <input
                    disabled={!isDefault}
                    type="checkbox"
                    checked={checked}
                    onChange={event => {
                      const next = event.target.checked
                        ? [...selected, catId]
                        : selected.filter(value => value !== catId)
                      updateField(field.key, next)
                    }}
                  />
                  {catName}
                </label>
              )
            })}
          </div>
        </div>
      )
    }

    if (field.type === 'branchMap') {
      const translatedAddress = typeof form.address === 'object' ? (form.address?.[refLang] || form.address?.vi || '') : form.address
      const coordinateQuery = form.lat && form.lng ? `${form.lat},${form.lng}` : ''
      const mapQuery = coordinateQuery || translatedAddress
      const encodedQuery = encodeURIComponent(mapQuery || '')
      const mapsUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodedQuery}` : null

      return (
        <div key={field.key} className="space-y-3 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm">{tAdmin('branch_map')}</h3>
              <p className="text-xs text-gray-400 mt-1">{tAdmin('branch_map_hint')}</p>
            </div>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#D62300] px-3 py-2 text-xs font-semibold text-white hover:bg-[#b51e00]">
                <MapPin size={15} /> {tAdmin('open_google_maps')}
              </a>
            )}
          </div>
          {mapQuery ? (
            <iframe
              title={tAdmin('branch_map')}
              src={`https://maps.google.com/maps?q=${encodedQuery}&z=16&output=embed`}
              className="h-72 w-full rounded-xl border-0 bg-gray-100"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#161825] text-sm text-gray-400">{tAdmin('branch_map_empty')}</div>
          )}
        </div>
      )
    }

    if (field.type === 'tagInput') {
      return (
        <TagInputField
          key={field.key}
          field={field}
          form={form}
          updateField={updateField}
          isDefault={isDefault}
          fieldLabel={fieldLabel}
          tAdmin={tAdmin}
        />
      )
    }

    if (field.type === 'postCategorySelect') {
      const catOptions = (postCategories || []).filter(c => c && typeof c === 'object')
      const currentVal = form[field.key] || ''
      return (
        <div key={field.key} className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
          </label>
          <select
            disabled={!isDefault}
            value={currentVal}
            onChange={e => updateField(field.key, e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
            required={field.required && isDefault}
          >
            <option value="">{tAdmin('choose_category', 'Chọn danh mục...')}</option>
            {catOptions.map(cat => (
              <option key={cat.id} value={cat.slug}>
                {cat.name?.[refLang] || cat.name?.vi || cat.name?.en || cat.slug}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (field.type === 'colorInput') {
      const colorVal = form[field.key] || '#D62300'
      return (
        <div key={field.key} className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fieldLabel(field)}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colorVal}
              onChange={e => updateField(field.key, e.target.value)}
              disabled={!isDefault}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5 disabled:opacity-60"
            />
            <input
              type="text"
              value={colorVal}
              onChange={e => updateField(field.key, e.target.value)}
              disabled={!isDefault}
              className={inputClass + ' flex-1 font-mono'}
              placeholder="#D62300"
              maxLength={20}
            />
            <span className="w-8 h-8 rounded-full border border-gray-200" style={{ background: colorVal }} />
          </div>
        </div>
      )
    }

    if (field.type === 'comboItems') {
      const items = form.items || []
      return (
        <div key={field.key} className={`border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3 ${!isDefault ? 'opacity-60' : ''} text-left`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{tAdmin('combo_items')}</h3>
            {isDefault && (
              <button
                type="button"
                onClick={() => updateField('items', [...items, { product_id: '', size: 'S', quantity: 1 }])}
                className="text-xs font-semibold text-[#D62300] cursor-pointer"
              >
                {tAdmin('add_combo_item')}
              </button>
            )}
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_80px_90px_40px] gap-2">
              <select
                disabled={!isDefault}
                value={item.product_id || ''}
                onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, product_id: e.target.value } : row))}
                className={inputClass}
              >
                <option value="">{tAdmin('product')}</option>
                {products.map(product => {
                  const prodName = product.name && typeof product.name === 'object' ? (product.name[refLang] || product.name[defaultCode] || Object.values(product.name)[0] || '') : product.name
                  return <option key={product.id} value={product.id}>{product.sku ? `${product.sku} - ${prodName}` : prodName}</option>
                })}
              </select>
              <select
                disabled={!isDefault}
                value={item.size || 'S'}
                onChange={e => updateField('items', items.map((row, i) => i === index ? { ...row, size: e.target.value } : row))}
                className={inputClass}
              >
                {['S', 'M', 'L', 'XL'].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <input
                disabled={!isDefault}
                type="number"
                min="1"
                value={item.quantity ?? 1}
                onChange={e => {
                  const val = Math.max(1, parseInt(e.target.value) || 1)
                  updateField('items', items.map((row, i) => i === index ? { ...row, quantity: val } : row))
                }}
                className={inputClass}
              />
              {isDefault && (
                <button type="button" onClick={() => updateField('items', items.filter((_, i) => i !== index))} className="text-red-500 font-semibold cursor-pointer">X</button>
              )}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div key={field.key} className="space-y-1.5 text-left">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {fieldLabel(field)} {field.required && isDefault && <span className="text-red-500">*</span>}
        </label>
        <input
          disabled={!isDefault || field.readonly}
          type={field.type || 'text'}
          value={form[field.key] || ''}
          onChange={e => updateField(field.key, e.target.value)}
          className={inputClass}
          required={field.required && isDefault}
          readOnly={field.readOnly}
          maxLength={field.maxLength}
        />
        {field.key === 'sku' && isDefault && <p className="text-xs text-gray-400">{tAdmin('sku_auto_hint')}</p>}
      </div>
    )
  }

  return (
    <AdminPageShell title={tAdmin(isCreate ? 'add_resource' : 'edit_resource', { title: titleText })} action={tAdmin('back')} onAction={() => navigate(`/admin/${resourceKey}`)}>
      {!isDefault && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-left">
          <Info size={16} className="text-blue-500 flex-shrink-0 animate-bounce" />
          <p className="text-sm text-blue-700">
            {tAdmin('editing_locale_notice', { locale: currentLocale.label })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        {/* Left Form */}
        <div className="space-y-5 bg-white dark:bg-[#1E2130] rounded-2xl p-6 shadow-sm">
          {leftFields.map(field => renderField(field))}
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
                const hasTranslation = locale.code === defaultCode || !!form[nameKey]?.[locale.code]

                const editUrl = isCreate
                  ? `/admin/${resourceKey}/create${locale.code !== defaultCode ? `?ref_lang=${locale.code}` : ''}`
                  : locale.code === defaultCode
                    ? `/admin/${resourceKey}/${id}/edit`
                    : `/admin/${resourceKey}/${id}/edit?ref_lang=${locale.code}`

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
                      {renderFlag(locale.code, "h-3.5 w-5 rounded-sm object-cover shadow-sm")}
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

          {/* Options card */}
          {isDefault && toggleFields.length > 0 && (
            <div className="bg-white dark:bg-[#1E2130] rounded-2xl p-4 shadow-sm space-y-3 text-left">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{tAdmin('options')}</h4>
              <div className="space-y-3">
                {toggleFields.map(field => {
                  const checked = !!form[field.key]
                  const isGreen = field.key === 'is_available' || field.key === 'is_published' || field.key === 'is_active'
                  return (
                    <div key={field.key} className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-500 uppercase">{field.checkLabel ? tAdmin(field.checkLabel) : fieldLabel(field)}</label>
                      <button
                        type="button"
                        onClick={() => updateField(field.key, !checked)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${checked ? (isGreen ? 'bg-green-500' : 'bg-[#D62300]') : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Image card */}
          {imageField && (
            <div className={`${!isDefault ? 'opacity-60' : ''}`}>
              <AdminImageInput
                label={fieldLabel(imageField)}
                value={form[imageField.key] || ''}
                onChange={value => {
                  if (isDefault) updateField(imageField.key, value)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AdminPageShell>
  )
}
