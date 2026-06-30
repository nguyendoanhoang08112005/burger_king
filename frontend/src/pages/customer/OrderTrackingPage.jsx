import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle, MapPin, Star, Upload, X } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatDate, formatVND } from '../../utils/format'
import OrderTimeline from '../../components/ui/OrderTimeline'
import OrderDetailCard from '../../components/ui/OrderDetailCard'

export default function OrderTrackingPage() {
  const { t, i18n } = useTranslation()
  const { code } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const showToast = useUiStore(state => state.showToast)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)

  const publicSettings = useUiStore(state => state.publicSettings)

  const completedAt = order?.completed_at ? new Date(order.completed_at) : null
  const reviewExpiryDays = Number(publicSettings['review.expiry_days'] || 7)
  const isWithinReviewExpiry = completedAt && (new Date().getTime() - completedAt.getTime()) < reviewExpiryDays * 24 * 60 * 60 * 1000
  
  const complaintExpiryHours = Number(publicSettings['complaint.expiry_hours'] || 24)
  const isWithinComplaintExpiry = completedAt && (new Date().getTime() - completedAt.getTime()) < complaintExpiryHours * 60 * 60 * 1000
  const hasActiveComplaint = order?.complaints?.some(c => ['pending', 'reviewing'].includes(c.status))
  const hasComplaint = order?.complaints && order.complaints.length > 0

  const loadOrder = () => {
    setLoading(true)
    apiClient.get(`/orders/${code}`)
      .then(res => {
        setOrder(res.data)
        setLoading(false)
      }).catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadOrder()
    const paymentStatus = params.get('payment')
    if (paymentStatus === 'success') {
      showToast(t('order.payment_success'))
    } else if (paymentStatus === 'failed') {
      showToast(t('order.payment_failed'), 'error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, i18n.language])

  const handleCancel = () => {
    if (window.confirm(t('order.cancel_confirm'))) {
      apiClient.post(`/orders/${code}/cancel`)
        .then(() => {
          showToast(t('order.cancel_success'))
          loadOrder()
        }).catch(err => {
          console.error(err)
          showToast(err.response?.data?.message || t('order.cancel_error'), 'error')
        })
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFAF5]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!order) return <Navigate to="/profile" />

  const steps = [
    { id: 'pending', name: t('order.pending') },
    { id: 'confirmed', name: t('order.confirmed') },
    { id: 'preparing', name: t('order.preparing') },
    { id: 'delivering', name: t('order.delivering') },
    { id: 'completed', name: t('order.completed') || t('order.delivered') },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-4xl mx-auto pt-24 md:pt-32 pb-16 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E8E8] pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('order.your_order')}</span>
          <h1 className="font-bold text-3xl text-[#1A1A1A] uppercase tracking-wide mt-1">{t('order.code_label', { code: order.order_code })}</h1>
          <p className="text-xs text-gray-500 mt-1">{t('order.placed_at', { date: formatDate(order.created_at) })}</p>
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button 
              onClick={handleCancel}
              className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
            >
              {t('order.cancel').toUpperCase()}
            </button>
          )}
          <Link 
            to="/profile?tab=orders"
            className="bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold px-5 py-2 rounded-[8px] text-xs tracking-wider transition"
          >
            {t('order.history').toUpperCase()}
          </Link>
        </div>
      </div>

      {/* Timeline tracker */}
      <OrderTimeline 
        isCancelled={isCancelled} 
        steps={steps} 
        currentStepIndex={currentStepIndex} 
        t={t} 
      />

      {/* Review Invitation Banner */}
      {order.status === 'completed' && !order.order_review && isWithinReviewExpiry && (
        <div className="p-6 rounded-2xl bg-[#FFF5F3] border border-[#FFD9D2] mb-8 shadow-glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h3 className="font-bold text-lg text-[#D62300]">{t('order.write_review')}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('review.invitation_desc')}
            </p>
          </div>
          <button 
            onClick={() => {
              if (order.order_review) {
                showToast(t('order.already_reviewed'), 'error')
                return
              }
              setShowReviewModal(true)
            }}
            className="bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap"
          >
            {t('order.write_review').toUpperCase()}
          </button>
        </div>
      )}

      {/* Already Reviewed Card */}
      {order.status === 'completed' && order.order_review && (
        <div className="p-6 rounded-2xl bg-white border border-green-200 mb-8 shadow-glass animate-fade-in space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-bold text-green-700">{t('order.already_reviewed')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t('order.overall_rating')}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= order.order_review.overall_rating ? 'fill-amber-400 text-amber-400 font-bold' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>

            <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t('order.delivery_rating')}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= order.order_review.delivery_rating ? 'fill-amber-400 text-amber-400 font-bold' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>

            <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">{t('order.packaging_rating')}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= order.order_review.packaging_rating ? 'fill-amber-400 text-amber-400 font-bold' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>

          {order.order_review.comment && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
              <span className="font-bold text-gray-700 block mb-1">{t('order.your_feedback')}:</span>
              <p className="text-gray-600 leading-relaxed italic">"{order.order_review.comment}"</p>
            </div>
          )}
        </div>
      )}

      {/* Complaint Timeline Display */}
      {order.complaints && order.complaints.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] mb-8 shadow-glass animate-fade-in">
          <h3 className="font-bold text-lg text-primary uppercase tracking-wide mb-6 text-center">
            {t('order.complaint_timeline_title')}
          </h3>
          <div className="space-y-6">
            {order.complaints.map((complaint) => {
              const timelineSteps = [
                { label: t('order.complaint_status_pending'), done: true, time: formatDate(complaint.created_at) },
                { label: t('order.complaint_status_reviewing'), done: ['reviewing', 'resolved', 'rejected'].includes(complaint.status), time: complaint.status !== 'pending' ? formatDate(complaint.updated_at) : null },
                { 
                  label: complaint.status === 'rejected' ? t('order.complaint_status_rejected') : t('order.complaint_status_resolved'), 
                  done: ['resolved', 'rejected'].includes(complaint.status), 
                  time: ['resolved', 'rejected'].includes(complaint.status) ? formatDate(complaint.resolved_at || complaint.updated_at) : null 
                },
              ]
              return (
                <div key={complaint.id} className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="font-semibold text-gray-500">{t('complaint.type')}: <strong className="text-gray-800">{t(`complaint.type_${complaint.type}`)}</strong></span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      complaint.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      complaint.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t(`order.complaint_status_${complaint.status}`)}
                    </span>
                  </div>
                  
                  {/* Timeline steps */}
                  <div className="relative flex justify-between items-start gap-4 mb-6">
                    <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-200 z-0" />
                    {timelineSteps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center text-center flex-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold transition ${
                          step.done ? 'bg-[#D62300] border-[#D62300] text-white font-bold' : 'bg-white border-[#E8E8E8] text-gray-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</span>
                        {step.time && <span className="text-[9px] text-gray-400 mt-0.5">{step.time}</span>}
                      </div>
                    ))}
                  </div>

                  {complaint.description && (
                    <div className="mb-4 text-xs bg-gray-50 p-3 rounded-lg text-gray-600">
                      <span className="font-bold text-gray-700 block mb-1">{t('order.complaint_description_label')}:</span>
                      "{complaint.description}"
                    </div>
                  )}

                  {['resolved', 'rejected'].includes(complaint.status) && complaint.resolution_note && (
                    <div className="p-4 rounded-xl bg-[#FFFBF0] border border-[#FFEBC2] text-xs">
                      <div>
                        <span className="font-semibold text-gray-500">{t('order.complaint_resolution_note')}:</span>
                        <p className="mt-1 text-gray-700 italic">"{complaint.resolution_note}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Complaint Trigger Link */}
      {order.status === 'completed' && !hasComplaint && isWithinComplaintExpiry && (
        <div className="text-center mb-8">
          <button 
            onClick={() => setShowComplaintModal(true)}
            className="text-xs text-[#666666] hover:text-[#D62300] font-semibold underline underline-offset-4 cursor-pointer transition"
          >
            {t('order.file_complaint')}
          </button>
        </div>
      )}

      {/* Summary grid */}
      <OrderDetailCard 
        order={order} 
        formatVND={formatVND} 
        formatDate={formatDate} 
        t={t} 
      />

      {showReviewModal && <ReviewFlowModal />}
      {showComplaintModal && <ComplaintFlowModal />}
    </div>
  )

  function ReviewStarsInput({ val, setVal }) {
    return (
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            type="button"
            key={star}
            onClick={() => setVal(star)}
            className="p-1 hover:scale-110 transition cursor-pointer"
          >
            <Star className={`w-6 h-6 ${star <= val ? 'fill-amber-400 text-amber-400 font-bold' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    )
  }

  function ReviewFlowModal() {
    const [step, setStep] = useState(1)
    const [deliveryRating, setDeliveryRating] = useState(5)
    const [packagingRating, setPackagingRating] = useState(5)
    const [overallRating, setOverallRating] = useState(5)
    const [comment, setComment] = useState('')
    const [productReviews, setProductReviews] = useState({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
      if (step === 2 && order.items) {
        const initial = {}
        order.items.forEach(item => {
          if (!initial[item.product_id]) {
            initial[item.product_id] = { rating: 5, comment: '' }
          }
        })
        setProductReviews(initial)
      }
    }, [step])

    const handleOverallSubmitOnly = async () => {
      setSubmitting(true)
      try {
        await apiClient.post('/reviews/order', {
          order_id: order.id,
          delivery_rating: deliveryRating,
          packaging_rating: packagingRating,
          overall_rating: overallRating,
          comment: comment,
          product_reviews: []
        })
        showToast(t('order.review_success'))
        loadOrder()
        setShowReviewModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    const handleAllSubmit = async () => {
      setSubmitting(true)
      try {
        const productReviewsList = Object.entries(productReviews).map(([pId, val]) => ({
          product_id: Number(pId),
          rating: val.rating,
          comment: val.comment
        }))
        await apiClient.post('/reviews/order', {
          order_id: order.id,
          delivery_rating: deliveryRating,
          packaging_rating: packagingRating,
          overall_rating: overallRating,
          comment: comment,
          product_reviews: productReviewsList
        })
        showToast(t('order.review_success'))
        loadOrder()
        setShowReviewModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          onClick={() => setShowReviewModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div className="relative w-full max-w-xl bg-white border border-[#E8E8E8] rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh] animate-float-half p-6">
          <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900">{t('order.order_review')}</h3>
            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-6 text-[#1A1A1A]">
            {step === 1 ? (
              <div className="space-y-5">
                <h4 className="font-bold text-sm text-[#D62300] uppercase tracking-wide">{t('order.step_1_title')}</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.delivery_rating')}</span>
                    <ReviewStarsInput val={deliveryRating} setVal={setDeliveryRating} />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.packaging_rating')}</span>
                    <ReviewStarsInput val={packagingRating} setVal={setPackagingRating} />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">{t('order.overall_rating')}</span>
                    <ReviewStarsInput val={overallRating} setVal={setOverallRating} />
                  </div>
                </div>

                {overallRating <= 2 && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-800 space-y-2">
                    <p className="font-semibold">{t('order.complaint_prompt')}</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowReviewModal(false)
                        setShowComplaintModal(true)
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-lg transition text-[10px] uppercase cursor-pointer"
                    >
                      {t('order.file_complaint')}
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('order.comment_placeholder')}</span>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={t('order.comment_placeholder')}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOverallSubmitOnly}
                    disabled={submitting}
                    className="flex-1 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? '...' : t('order.submit_step_1') || t('order.submit_review')}
                  </button>
                  {order.items && order.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md cursor-pointer"
                    >
                      {t('order.step_2_title')} →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h4 className="font-bold text-sm text-[#D62300] uppercase tracking-wide">{t('order.step_2_title')}</h4>
                <div className="space-y-5 divide-y divide-gray-100 max-h-[45vh] overflow-y-auto pr-1">
                  {order.items?.map((item, index) => {
                    const pr = productReviews[item.product_id] || { rating: 5, comment: '' }
                    return (
                      <div key={item.id} className={`${index > 0 ? 'pt-4' : ''} space-y-3`}>
                        <p className="font-bold text-xs text-[#1A1A1A]">{item.product_name}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-semibold text-gray-500">{t('order.product_rating')}</span>
                          <ReviewStarsInput val={pr.rating} setVal={(rating) => {
                            setProductReviews(prev => ({
                              ...prev,
                              [item.product_id]: { ...prev[item.product_id], rating }
                            }))
                          }} />
                        </div>
                        <input
                          type="text"
                          value={pr.comment}
                          onChange={e => {
                            const val = e.target.value
                            setProductReviews(prev => ({
                              ...prev,
                              [item.product_id]: { ...prev[item.product_id], comment: val }
                            }))
                          }}
                          placeholder={t('order.product_comment_placeholder')}
                          className="w-full text-xs p-2.5 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition cursor-pointer"
                  >
                    ← {t('order.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleAllSubmit}
                    disabled={submitting}
                    className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? '...' : t('order.submit_all')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function ComplaintFlowModal() {
    const [step, setStep] = useState(1)
    const [type, setType] = useState('wrong_item')
    const [description, setDescription] = useState('')
    const [images, setImages] = useState([])
    const [desiredResolution, setDesiredResolution] = useState('redeliver')
    const [selectedItems, setSelectedItems] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
      if (order.items) {
        const initial = {}
        order.items.forEach(item => {
          initial[item.product_id] = { selected: false, issue_type: 'wrong', note: '' }
        })
        setSelectedItems(initial)
      }
    }, [])

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return
      if (images.length + files.length > 5) {
        showToast(t('complaint.max_evidence_images'), "error")
        return
      }
      setUploading(true)
      try {
        const uploadedUrls = [...images]
        for (const file of files) {
          const formData = new FormData()
          formData.append('image', file)
          const res = await apiClient.post('/reviews/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (res.data && res.data.url) {
            uploadedUrls.push(res.data.url)
          }
        }
        setImages(uploadedUrls)
        showToast(t('order.review_upload') + ' ✓')
      } catch (err) {
        console.error(err)
        showToast(t('order.review_upload_error'), "error")
      } finally {
        setUploading(false)
      }
    }

    const removeImage = (index) => {
      setImages(prev => prev.filter((_, i) => i !== index))
    }

    const isProductIssue = ['wrong_item', 'missing_item', 'bad_quality'].includes(type)

    const handleNext = () => {
      if (step === 1) {
        if (isProductIssue) {
          setStep(2)
        } else {
          setStep(3)
        }
      } else if (step === 2) {
        const anySelected = Object.values(selectedItems).some(item => item.selected)
        if (!anySelected) {
          showToast(t('complaint.select_faulty_product'), "error")
          return
        }
        setStep(3)
      } else if (step === 3) {
        if (!description.trim()) {
          showToast(t('complaint.describe_issue_required'), "error")
          return
        }
        setStep(4)
      }
    }

    const handlePrev = () => {
      if (step === 2) {
        setStep(1)
      } else if (step === 3) {
        if (isProductIssue) {
          setStep(2)
        } else {
          setStep(1)
        }
      } else if (step === 4) {
        setStep(3)
      }
    }

    const handleSubmit = async () => {
      setSubmitting(true)
      try {
        const itemsList = isProductIssue
          ? Object.entries(selectedItems)
              .filter(([, val]) => val.selected)
              .map(([productId, val]) => ({
                product_id: Number(productId),
                issue_type: val.issue_type,
                note: val.note
              }))
          : []

        await apiClient.post('/complaints', {
          order_id: order.id,
          type: type,
          description: description,
          images: images,
          desired_resolution: desiredResolution,
          items: itemsList
        })

        showToast(t('complaint.success'))
        loadOrder()
        setShowComplaintModal(false)
      } catch (err) {
        console.error(err)
        showToast(err.response?.data?.message || t('order.review_error'), 'error')
      } finally {
        setSubmitting(false)
      }
    }

    const visibleSteps = []
    visibleSteps.push({ id: 1, label: t('complaint.step_1') })
    if (isProductIssue) {
      visibleSteps.push({ id: 2, label: t('complaint.step_2') })
    }
    visibleSteps.push({ id: 3, label: t('complaint.step_3') })
    visibleSteps.push({ id: 4, label: t('complaint.step_4') })

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          onClick={() => setShowComplaintModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div className="relative w-full max-w-xl bg-white border border-[#E8E8E8] rounded-2xl shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh] animate-float-half p-6">
          <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-4 mb-4">
            <h3 className="font-bold text-lg text-gray-900">{t('complaint.modal_title')}</h3>
            <button onClick={() => setShowComplaintModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="overflow-y-auto pr-1 flex-1 space-y-6 text-[#1A1A1A]">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2">
              {visibleSteps.map((s, index) => (
                <span key={s.id} className={step === s.id ? 'text-[#D62300]' : ''}>
                  {`${index + 1}. ${s.label}`}
                </span>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('complaint.complaint_type_label')}</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { key: 'wrong_item', label: t('complaint.type_wrong_item') },
                    { key: 'missing_item', label: t('complaint.type_missing_item') },
                    { key: 'bad_quality', label: t('complaint.type_bad_quality') },
                    { key: 'late_delivery', label: t('complaint.type_late_delivery') },
                    { key: 'shipper_attitude', label: t('complaint.type_shipper_attitude') },
                    { key: 'other', label: t('complaint.type_other') },
                  ].map(opt => (
                    <label key={opt.key} className={`flex items-center gap-3 p-3.5 rounded-xl border transition cursor-pointer text-xs font-semibold ${
                      type === opt.key ? 'border-[#D62300] bg-[#FFF5F3] text-[#D62300]' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                      <input 
                        type="radio" 
                        name="complaint_type" 
                        value={opt.key}
                        checked={type === opt.key} 
                        onChange={() => setType(opt.key)}
                        className="accent-primary"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('complaint.select_products')}</h4>
                <div className="space-y-3.5 max-h-[40vh] overflow-y-auto pr-1">
                  {order.items?.map(item => {
                    const sItem = selectedItems[item.product_id] || { selected: false, issue_type: 'wrong', note: '' }
                    return (
                      <div key={item.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                        <label className="flex items-center gap-3 text-xs font-semibold text-gray-800 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={sItem.selected}
                            onChange={(e) => {
                              setSelectedItems(prev => ({
                                ...prev,
                                [item.product_id]: { ...prev[item.product_id], selected: e.target.checked }
                              }))
                            }}
                            className="accent-primary"
                          />
                          {item.product_name}
                        </label>
                        {sItem.selected && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 animate-fade-in">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('complaint.issue_detail')}</span>
                              <select
                                value={sItem.issue_type}
                                onChange={(e) => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    [item.product_id]: { ...prev[item.product_id], issue_type: e.target.value }
                                  }))
                                }}
                                className="w-full text-xs p-2 mt-1 bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="wrong">{t('complaint.issue_wrong')}</option>
                                <option value="missing">{t('complaint.issue_missing')}</option>
                                <option value="bad_quality">{t('complaint.issue_bad_quality')}</option>
                                <option value="other">{t('complaint.issue_other')}</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{t('checkout.order_note')}</span>
                              <input 
                                type="text"
                                value={sItem.note}
                                onChange={(e) => {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    [item.product_id]: { ...prev[item.product_id], note: e.target.value }
                                  }))
                                }}
                                placeholder={t('complaint.description_placeholder')}
                                className="w-full text-xs p-2 mt-1 bg-white border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.description_label')}</span>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('complaint.description_placeholder')}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.resolution_label_req')}</span>
                  <select
                    value={desiredResolution}
                    onChange={e => setDesiredResolution(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E8E8E8] rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-[#1A1A1A]"
                  >
                    <option value="redeliver">{t('complaint.resolution_redeliver')}</option>
                    <option value="refund_partial">{t('complaint.resolution_refund_partial')}</option>
                    <option value="refund_full">{t('complaint.resolution_refund_full')}</option>
                    <option value="feedback_only">{t('complaint.resolution_feedback_only')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">{t('complaint.evidence')}</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 text-[8px] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-primary transition bg-gray-50">
                        <Upload className="w-4 h-4" />
                        <span className="text-[8px] font-bold mt-1 uppercase">{t('order.review_upload')}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload} 
                          className="hidden"
                          disabled={uploading} 
                        />
                      </label>
                    )}
                    {uploading && <div className="text-[10px] text-gray-400 animate-pulse font-semibold">{t('order.review_uploading')}</div>}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{t('order.complaint_step_4_title')}</h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs space-y-3">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.type')}</span>
                    <span className="font-bold text-gray-800">{t(`complaint.type_${type}`)}</span>
                  </div>
                  
                  {isProductIssue && (
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block mb-1">{t('complaint.select_products')}</span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-700">
                        {Object.entries(selectedItems)
                          .filter(([, val]) => val.selected)
                          .map(([productId, val]) => {
                            const prodName = order.items?.find(item => item.product_id === Number(productId))?.product_name || t('order.item_with_id', { id: productId })
                            return (
                              <li key={productId} className="font-medium">
                                {prodName} ({t(`complaint.issue_${val.issue_type}`)}){val.note ? `: ${val.note}` : ''}
                              </li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.description_label')}</span>
                    <p className="font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block">{t('complaint.resolution_label_req')}</span>
                    <span className="font-bold text-gray-800">{t(`complaint.resolution_${desiredResolution}`)}</span>
                  </div>

                  {images.length > 0 && (
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wide block mb-1">{t('order.evidence_label')}</span>
                      <div className="flex gap-2">
                        {images.map((img, idx) => (
                          <img key={idx} src={img} alt="Evidence preview" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-1/3 border border-[#E8E8E8] hover:bg-gray-50 text-[#1A1A1A] text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition cursor-pointer"
                >
                  ← {t('order.back')}
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md cursor-pointer"
                >
                  {t('order.continue')} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#D62300] hover:bg-[#b51e00] text-white text-xs font-bold uppercase py-3 rounded-xl tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? '...' : t('complaint.submit')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
