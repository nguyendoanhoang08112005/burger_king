import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Upload } from 'lucide-react'
import { SettingInput, SettingTextarea, AdminImageInput, assetUrl, useAdminText } from '../../../utils/adminUtils'
import apiClient from '../../../api/axios'

// Compact image uploader for Deal cards — avoids tall 260px dropzone layout breaking sections below
function DealImageUpload({ label, value, onChange }) {
  const tAdmin = useAdminText()
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await apiClient.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(assetUrl(data?.data?.url || data?.url))
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]) }}
        className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-red-400 transition-colors bg-white dark:bg-[#1E2130]"
      >
        {uploading ? (
          <Loader2 className="animate-spin text-gray-400" size={24} />
        ) : value ? (
          <img src={assetUrl(value)} alt="" className="w-full h-full object-contain" />
        ) : (
          <Upload className="text-gray-400" size={22} />
        )}
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="text-[11px] text-gray-500 hover:text-red-500 transition-colors font-medium"
      >
        {tAdmin('change_image', 'Đổi ảnh')}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleUpload(e.target.files[0])} />
    </div>
  )
}

export default function HomepageSettings({
  settings,
  updateSetting,
  updateTransSetting,
  getTransValue,
  refLang,
  tAdmin
}) {
  const [combos, setCombos] = useState([])
  const [products, setProducts] = useState([])
  const [galleryBanners, setGalleryBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const multiFileInputRef = useRef(null)
  const [multiUploading, setMultiUploading] = useState(false)

  useEffect(() => {
    Promise.all([
      apiClient.get('/admin/combos?per_page=200').then(res => res.data?.data || res.data || []),
      apiClient.get('/admin/products?per_page=200').then(res => res.data?.data || res.data || []),
      apiClient.get('/admin/banners').then(res => res.data?.data || res.data || [])
    ]).then(([combosData, productsData, bannersData]) => {
      setCombos(combosData)
      setProducts(productsData)
      setGalleryBanners(bannersData.filter(b => b.position === 'gallery'))
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#D62300]" />
      </div>
    )
  }

  // Safe parsing helper
  const parseJsonSetting = (key, fallback = []) => {
    const val = settings[key]
    if (!val) return fallback
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch (e) {
        return fallback
      }
    }
    return Array.isArray(val) ? val : fallback
  }

  const getTransObject = (val) => {
    if (typeof val === 'object' && val !== null) return val
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        if (typeof parsed === 'object' && parsed !== null) return parsed
      } catch (e) {}
      return { vi: val, en: val }
    }
    return { vi: '', en: '' }
  }

  const faqs = parseJsonSetting('homepage.faqs', [])
  const galleryImages = parseJsonSetting('homepage.gallery_images', [])
  
  const addFaq = () => {
    const currentFaqs = [...faqs, { q_vi: '', q_en: '', a_vi: '', a_en: '' }]
    updateSetting('homepage.faqs', currentFaqs)
  }
  
  const removeFaq = (index) => {
    const currentFaqs = faqs.filter((_, i) => i !== index)
    updateSetting('homepage.faqs', currentFaqs)
  }
  
  const updateFaqItem = (index, field, value) => {
    const currentFaqs = [...faqs]
    currentFaqs[index] = { ...currentFaqs[index], [field]: value }
    updateSetting('homepage.faqs', currentFaqs)
  }
  
  const moveFaq = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= faqs.length) return
    const currentFaqs = [...faqs]
    const temp = currentFaqs[index]
    currentFaqs[index] = currentFaqs[newIndex]
    currentFaqs[newIndex] = temp
    updateSetting('homepage.faqs', currentFaqs)
  }

  // 3D Transparent fallbacks for combos
  const fallback1 = '/hero-burger-3d.webp'
  const fallback2 = '/hero-chicken-3d.webp'
  const fallback3 = '/hero-family-3d.png'

  const handleMultiUpload = async (files) => {
    if (!files || files.length === 0) return
    setMultiUploading(true)
    const newItems = [...galleryImages]
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await apiClient.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const uploadedUrl = assetUrl(data?.data?.url || data?.url)
        newItems.push({ url: uploadedUrl, title: { vi: '', en: '' } })
      }
      updateSetting('homepage.gallery_images', newItems)
    } catch (error) {
      console.error(error)
    } finally {
      setMultiUploading(false)
      if (multiFileInputRef.current) multiFileInputRef.current.value = ''
    }
  }

  const activeGallery = galleryImages.length > 0
    ? galleryImages.map(img => ({
        url: img.url || img,
        title: getTransObject(img.title)
      }))
    : galleryBanners.map(b => ({
        url: assetUrl(b.image),
        title: getTransObject(b.title)
      }))

  return (
    <div className="space-y-10 text-left">
      {/* ─── SECTION 1: DANH MỤC MÓN ĂN (CATEGORIES) ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>🍔 {tAdmin('homepage_categories_title', 'Danh mục món ăn')}</span>
        </h3>
        <div className="space-y-4">
          <SettingInput
            label={tAdmin('subtitle_label', 'Tiêu đề phụ (Subtitle)')}
            value={getTransValue(settings['homepage.categories_subtitle']) || (refLang === 'vi' ? 'Danh Mục Món Ăn' : 'Categories')}
            onChange={val => updateTransSetting('homepage.categories_subtitle', val)}
          />
          <SettingInput
            label={tAdmin('title_label', 'Tiêu đề chính (Title)')}
            value={getTransValue(settings['homepage.categories_title']) || (refLang === 'vi' ? 'KHÁM PHÁ CÁC MÓN ĂN PHỔ BIẾN' : 'EXPLORE OUR POPULAR DISHES')}
            onChange={val => updateTransSetting('homepage.categories_title', val)}
          />
        </div>
      </div>

      {/* ─── SECTION 2: ƯU ĐÃI ĐẶC BIỆT (DEALS/COMBOS) ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>🔥 {tAdmin('homepage_deals_title', 'Ưu đãi đặc biệt')}</span>
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SettingInput
              label={tAdmin('subtitle_label', 'Tiêu đề phụ (Subtitle)')}
              value={getTransValue(settings['homepage.deal_subtitle']) || (refLang === 'vi' ? 'Ưu Đãi Đặc Biệt' : 'Special Offers')}
              onChange={val => updateTransSetting('homepage.deal_subtitle', val)}
            />
            <SettingInput
              label={tAdmin('title_label', 'Tiêu đề chính (Title)')}
              value={getTransValue(settings['homepage.deal_title']) || (refLang === 'vi' ? 'ƯU ĐÃI THƠM NGON DÀNH CHO BẠN' : 'DELICIOUS DEALS FOR YOU')}
              onChange={val => updateTransSetting('homepage.deal_title', val)}
            />
          </div>
          <SettingTextarea
            label={tAdmin('desc_label', 'Mô tả ngắn (Description)')}
            rows={3}
            value={getTransValue(settings['homepage.deal_desc']) || (refLang === 'vi' ? 'Thưởng thức những món ăn yêu thích với mức giá không thể bỏ lỡ — luôn tươi ngon và đậm đà hương vị.' : 'Enjoy your favorite meals at unbeatable prices — freshly made and full of flavor with delicious ingredients, great quality, amazing taste.')}
            onChange={val => updateTransSetting('homepage.deal_desc', val)}
          />

          {/* Deal Card Config — compact layout */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-[#1E2130]">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{tAdmin('deal_cards_config', 'Cấu hình liên kết Deals & Hình ảnh các Card Deals')}</span>
            <div className="flex flex-col gap-5">
              {[
                { n: 1, label: "Card 1 (Chef's Selection)", imgKey: 'homepage.deal1_image', typeKey: 'homepage.deal1_type', idKey: 'homepage.deal1_id', fallback: fallback1 },
                { n: 2, label: "Card 2 (Oven Special)", imgKey: 'homepage.deal2_image', typeKey: 'homepage.deal2_type', idKey: 'homepage.deal2_id', fallback: fallback2 },
                { n: 3, label: "Card 3 (Signature Burgers)", imgKey: 'homepage.deal3_image', typeKey: 'homepage.deal3_type', idKey: 'homepage.deal3_id', fallback: fallback3 },
              ].map(({ n, label, imgKey, typeKey, idKey, fallback }) => {
                const currentType = settings[typeKey] || 'combo'
                const currentId = settings[idKey] || ''
                const listItems = currentType === 'product' ? products : combos
                return (
                  <div key={n} className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-gray-50 dark:bg-[#161825] border border-gray-100 dark:border-slate-700">
                    {/* Preview + upload */}
                    <DealImageUpload
                      label={label}
                      value={settings[imgKey] || fallback}
                      onChange={val => updateSetting(imgKey, val)}
                    />
                    {/* Dropdowns */}
                    <div className="flex-1 flex flex-col gap-3 justify-center min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{label}</h4>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase">{tAdmin('deal_type', 'Loại Ưu Đãi')}</label>
                        <select
                          value={currentType}
                          onChange={e => {
                            updateSetting(typeKey, e.target.value)
                            updateSetting(idKey, '')
                          }}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#1E2130] rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100"
                        >
                          <option value="combo">Combo Set</option>
                          <option value="product">Sản Phẩm (Product)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500 uppercase">{tAdmin('deal_target', 'Đối Tượng Liên Kết')}</label>
                        <select
                          value={currentId}
                          onChange={e => updateSetting(idKey, e.target.value ? Number(e.target.value) : '')}
                          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#1E2130] rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-100"
                        >
                          <option value="">{tAdmin('select_target_placeholder', '-- Chọn đối tượng --')}</option>
                          {listItems.map(item => {
                            const name = typeof item.name === 'object' ? (item.name[refLang] || item.name.vi) : item.name
                            return <option key={item.id} value={item.id}>{name}</option>
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>


      {/* ─── SECTION 3: GỢI Ý TỪ BẾP TRƯỞNG (FEATURED PRODUCTS) ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>⭐ {tAdmin('homepage_featured_section', 'Gợi ý từ bếp trưởng')}</span>
        </h3>
        <div className="space-y-4">
          <SettingInput
            label={tAdmin('subtitle_label', 'Tiêu đề phụ (Subtitle)')}
            value={getTransValue(settings['homepage.featured_subtitle']) || (refLang === 'vi' ? 'Gợi ý từ bếp trưởng' : "Chef's Recommendation")}
            onChange={val => updateTransSetting('homepage.featured_subtitle', val)}
          />
          <SettingInput
            label={tAdmin('title_label', 'Tiêu đề chính (Title)')}
            value={getTransValue(settings['homepage.featured_title']) || (refLang === 'vi' ? 'GỢI Ý TỪ BẾP TRƯỞNG' : "CHEF'S RECOMMENDATION")}
            onChange={val => updateTransSetting('homepage.featured_title', val)}
          />
        </div>
      </div>

      {/* ─── SECTION 4: KHÔNG GIAN & MÓN ĂN (GALLERY) ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>🖼️ {tAdmin('homepage_gallery_section', 'Không gian & món ăn')}</span>
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SettingInput
              label={tAdmin('subtitle_label', 'Tiêu đề phụ (Subtitle)')}
              value={getTransValue(settings['homepage.gallery_badge']) || (refLang === 'vi' ? 'KHÔNG GIAN & MÓN ĂN' : 'SPACE & DISHES')}
              onChange={val => updateTransSetting('homepage.gallery_badge', val)}
            />
            <SettingInput
              label={tAdmin('title_label', 'Tiêu đề chính (Title)')}
              value={getTransValue(settings['homepage.gallery_title']) || (refLang === 'vi' ? 'MÃN NHÃN VỚI HƯƠNG VỊ' : 'A FEAST FOR YOUR EYES')}
              onChange={val => updateTransSetting('homepage.gallery_title', val)}
            />
          </div>

          <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-[#1E2130] space-y-6">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{tAdmin('image_gallery_mgmt', 'Quản lý hình ảnh trưng bày (Tải lên một hoặc nhiều ảnh)')}</span>
            
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                handleMultiUpload(e.dataTransfer.files)
              }}
              onClick={() => multiFileInputRef.current?.click()}
              className="flex h-[140px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-red-400 hover:bg-red-50/50 dark:border-gray-700 dark:hover:bg-red-500/10 cursor-pointer"
            >
              {multiUploading ? (
                <div>
                  <Loader2 className="mx-auto text-gray-400 mb-2 animate-spin" size={28} />
                  <p className="text-sm text-gray-500 font-semibold">{tAdmin('uploading', 'Đang tải...')}</p>
                </div>
              ) : (
                <div>
                  <Plus className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500 font-bold">{tAdmin('image_gallery_drag', 'Kéo thả nhiều ảnh vào đây hoặc nhấp để chọn ảnh')}</p>
                  <p className="text-xs text-gray-400 mt-1">{tAdmin('image_gallery_hint', 'Hỗ trợ tải lên nhiều tệp ảnh cùng lúc')}</p>
                </div>
              )}
            </div>
            <input 
              ref={multiFileInputRef} 
              type="file" 
              multiple 
              accept="image/*" 
              hidden 
              onChange={e => handleMultiUpload(e.target.files)} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {activeGallery.map((item, index) => {
                return (
                  <div key={index} className="flex flex-col p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-xl border border-gray-100 dark:border-slate-800 space-y-3 relative group">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white flex items-center justify-center">
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = galleryImages.length > 0 ? [...galleryImages] : galleryBanners.map(b => ({ url: assetUrl(b.image), title: b.title || { vi: '', en: '' } }))
                          updated.splice(index, 1)
                          updateSetting('homepage.gallery_images', updated)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <SettingInput
                      label={tAdmin('image_description', 'Mô tả ảnh / Chú thích')}
                      value={item.title[refLang] || ''}
                      onChange={val => {
                        const updated = galleryImages.length > 0 ? [...galleryImages] : galleryBanners.map(b => ({ url: assetUrl(b.image), title: getTransObject(b.title) }))
                        updated[index] = {
                          ...updated[index],
                          title: {
                            ...getTransObject(updated[index].title),
                            [refLang]: val
                          }
                        }
                        updateSetting('homepage.gallery_images', updated)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 5: TIN TỨC & BÀI VIẾT (BLOG) ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>📰 {tAdmin('homepage_blog_section', 'Tin tức & bài viết')}</span>
        </h3>
        <div className="space-y-4">
          <SettingInput
            label={tAdmin('subtitle_label', 'Tiêu đề phụ (Subtitle)')}
            value={getTransValue(settings['homepage.blog_badge']) || (refLang === 'vi' ? 'Tin Tức' : 'News')}
            onChange={val => updateTransSetting('homepage.blog_badge', val)}
          />
          <SettingInput
            label={tAdmin('title_label', 'Tiêu đề chính (Title)')}
            value={getTransValue(settings['homepage.blog_title']) || (refLang === 'vi' ? 'CÔNG THỨC, CÂU CHUYỆN & BÀI VIẾT ẨM THỰC' : 'RECIPES, STORIES & FOOD ARTICLES')}
            onChange={val => updateTransSetting('homepage.blog_title', val)}
          />
        </div>
      </div>

      {/* ─── SECTION 6: FAQ ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>❓ {tAdmin('homepage_faqs_title', 'Câu hỏi thường gặp')}</span>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#D62300] hover:bg-[#b51e00] text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Plus size={12} />
            <span>{tAdmin('add_faq_btn', 'Thêm Câu Hỏi')}</span>
          </button>
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-white dark:bg-[#1E2130] rounded-xl border border-gray-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                <span className="font-bold text-sm text-[#D62300]">{tAdmin('faq_question_label', 'Câu hỏi')} #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={i === 0} onClick={() => moveFaq(i, -1)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"><ArrowUp size={14} /></button>
                  <button type="button" disabled={i === faqs.length - 1} onClick={() => moveFaq(i, 1)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => removeFaq(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-1"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <SettingInput label={tAdmin('faq_question_label', 'Câu hỏi') + ' (VI)'} value={faq.q_vi} onChange={val => updateFaqItem(i, 'q_vi', val)} />
                  <SettingTextarea label={tAdmin('faq_answer_label', 'Trả lời') + ' (VI)'} rows={2} value={faq.a_vi} onChange={val => updateFaqItem(i, 'a_vi', val)} />
                </div>
                <div className="space-y-3">
                  <SettingInput label={tAdmin('faq_question_label', 'Câu hỏi') + ' (EN)'} value={faq.q_en} onChange={val => updateFaqItem(i, 'q_en', val)} />
                  <SettingTextarea label={tAdmin('faq_answer_label', 'Trả lời') + ' (EN)'} rows={2} value={faq.a_en} onChange={val => updateFaqItem(i, 'a_en', val)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 7: CTA BANNER ─── */}
      <div className="bg-gray-50/50 dark:bg-slate-800/10 p-6 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
          <span>📢 {tAdmin('homepage_cta_title', 'Banner kêu gọi hành động')}</span>
        </h3>
        <div className="space-y-4">
          <SettingInput
            label={tAdmin('cta_banner_title', 'Tiêu đề banner kêu gọi')}
            value={getTransValue(settings['homepage.cta_title']) || (refLang === 'vi' ? 'Đặt hàng ngay để trải nghiệm vị ngon đỉnh cao giao tận cửa!' : 'Order now to experience the ultimate taste delivered to your door!')}
            onChange={val => updateTransSetting('homepage.cta_title', val)}
          />
          <div className="pt-2">
            <SettingInput
              label={tAdmin('cta_banner_btn', 'Văn bản nút bấm kêu gọi')}
              value={getTransValue(settings['homepage.cta_btn']) || (refLang === 'vi' ? 'Đặt Hàng Ngay' : 'Order Now')}
              onChange={val => updateTransSetting('homepage.cta_btn', val)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
