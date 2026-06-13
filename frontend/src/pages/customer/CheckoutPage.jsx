import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Gift, CreditCard, Plus, X, ArrowRight, ChevronRight, CheckCircle, Tag } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatVND } from '../../utils/format'
import VietnamAddressSelector from '../../components/VietnamAddressSelector'
import { BrandLogo } from '../../components/layout/Header'

const getLastCheckoutAddress = () => {
  try {
    return JSON.parse(localStorage.getItem('hk_last_checkout_address') || 'null') || {}
  } catch {
    return {}
  }
}

function usePaymentMethods() {
  const { t } = useTranslation()
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    apiClient.get('/payment-methods')
      .then(res => {
        if (!ignore) setMethods(res.data?.data || [])
      })
      .catch(() => {
        if (!ignore) {
          setMethods([{ key: 'cod', name: t('checkout.cod_method'), icon: 'cod', is_default: true }])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [t])

  return { methods, loading }
}

function paymentIcon(key) {
  if (key === 'loyalty_points') return <Gift className="w-5 h-5 text-yellow-500" />
  return <CreditCard className="w-5 h-5 text-gray-400" />
}

function PaymentMethodSelector({ selected, onChange }) {
  const { methods, loading } = usePaymentMethods()

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(item => <div key={item} className="h-[58px] bg-[#F5F5F5] rounded-[10px] animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-2 text-left">
      {methods.map(method => (
        <div
          key={method.key}
          onClick={() => onChange(method.key)}
          className={`flex items-center justify-between p-4 rounded-[10px] border cursor-pointer transition-smooth hover:-translate-y-[1px] ${
            selected === method.key
              ? 'border-primary bg-primary/5 text-[#1A1A1A]'
              : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentIcon(method.key)}
            <div>
              <span className="text-xs font-semibold text-[#1A1A1A]">{method.name}</span>
              {method.description && <p className="text-[10px] text-gray-400 mt-0.5">{method.description}</p>}
            </div>
          </div>
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selected === method.key ? 'border-primary text-primary' : 'border-gray-400'
          }`}>
            {selected === method.key && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const { cartItems, getCartTotals, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore()
  const user = useAuthStore(state => state.user)
  const { showToast } = useUiStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [deliveryType, setDelivery] = useState('delivery')
  const [paymentMethod, setPayment] = useState('cod')
  const [couponInput, setCouponInput] = useState('')
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  
  // Custom manual address input
  const [manualAddress, setManualAddress] = useState(() => {
    const savedAddress = getLastCheckoutAddress()
    return {
      recipient_name: savedAddress.recipient_name || user?.name || '',
      phone: savedAddress.phone || user?.phone || '',
      province: savedAddress.province || '',
      district: savedAddress.district || '',
      ward: savedAddress.ward || '',
      street: savedAddress.street || '',
    }
  })

  // Scheduler options
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [loyaltyInfo, setLoyaltyInfo] = useState({
    balance: user?.loyalty_balance || 0,
    vnd_per_point: 100,
    loading: Boolean(user)
  })

  const [shippingCalculation, setShippingCalculation] = useState(null)
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingError, setShippingError] = useState(null)

  // Pickup Branch Selection states
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)

  const totals = getCartTotals(deliveryType)
  const displayShippingFee = deliveryType === 'pickup' ? 0 : (shippingCalculation?.fee ?? (totals.subtotal >= 300000 ? 0 : 15000))
  const displayTotal = Math.max(0, totals.subtotal - totals.couponDiscount + displayShippingFee)

  const loyaltyPointValue = Math.max(1, Number(loyaltyInfo.vnd_per_point) || 100)
  const loyaltyBalance = Math.max(0, Number(loyaltyInfo.balance) || 0)
  const loyaltyAvailableValue = loyaltyBalance * loyaltyPointValue
  const loyaltyPointsNeeded = Math.ceil(displayTotal / loyaltyPointValue)
  const loyaltyShortfall = Math.max(0, loyaltyPointsNeeded - loyaltyBalance)
  const canPayWithLoyalty = Boolean(user) && loyaltyShortfall === 0
  const isShippingInvalid = deliveryType === 'delivery' && (calculatingShipping || !shippingCalculation || shippingCalculation.out_of_range)
  
  const isPickupInvalid = deliveryType === 'pickup' && (!selectedBranch || !manualAddress.recipient_name || !manualAddress.phone)
  const isCheckoutInvalid = isShippingInvalid || isPickupInvalid

  useEffect(() => {
    // Load customer address book
    apiClient.get('/addresses')
      .then(res => {
        setAddresses(res.data)
        const defaultAddr = res.data.find(a => a.is_default) || res.data[0]
        setSelectedAddress(defaultAddr)
      }).catch(err => {
        console.error(err)
      })

    // Load active branches
    apiClient.get('/branches')
      .then(res => {
        setBranches(res.data)
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0])
        }
      }).catch(err => {
        console.error('Failed to load branches:', err)
      })
  }, [])

  useEffect(() => {
    if (!user) return

    let ignore = false
    apiClient.get('/loyalty-points')
      .then(res => {
        if (ignore) return
        setLoyaltyInfo({
          balance: res.data?.balance || 0,
          vnd_per_point: res.data?.vnd_per_point || 100,
          loading: false
        })
      })
      .catch(() => {
        if (!ignore) setLoyaltyInfo(current => ({ ...current, loading: false }))
      })

    return () => {
      ignore = true
    }
  }, [user])

  useEffect(() => {
    if (deliveryType !== 'delivery') {
      setShippingCalculation(null)
      return
    }

    const addr = selectedAddress || manualAddress
    if (!addr || !addr.province || !addr.district) {
      setShippingCalculation(null)
      return
    }

    const timer = setTimeout(() => {
      setCalculatingShipping(true)
      setShippingError(null)

      apiClient.post('/shipping/calculate', {
        order_amount: totals.subtotal,
        lat: addr.lat || null,
        lng: addr.lng || null,
        address: {
          province: addr.province,
          district: addr.district,
          ward: addr.ward,
          street: addr.street
        }
      })
      .then(res => {
        setShippingCalculation(res.data.data)
      })
      .catch(err => {
        console.error('Failed to calculate shipping:', err)
        setShippingError(err.response?.data?.message || t('checkout.shipping_error_fallback'))
      })
      .finally(() => {
        setCalculatingShipping(false)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [deliveryType, selectedAddress, manualAddress.province, manualAddress.district, manualAddress.ward, manualAddress.street, totals.subtotal])

  if (cartItems.length === 0) {
    return <Navigate to="/menu" />
  }

  const handleApplyCoupon = () => {
    if (!couponInput) return
    apiClient.post('/cart/apply-coupon', { code: couponInput, subtotal: totals.subtotal })
      .then(res => {
        applyCoupon(res.data)
        showToast(t('checkout.coupon_applied'))
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.coupon_invalid'), 'error')
      })
  }

  const handleCheckoutSubmit = () => {
    if (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) {
      showToast(t('checkout.loyalty_not_enough', {
        needed: loyaltyPointsNeeded,
        current: loyaltyBalance
      }), 'error')
      return
    }

    setLoading(true)

    const payload = {
      delivery_type: deliveryType,
      payment_method: paymentMethod,
      use_loyalty_points: paymentMethod === 'loyalty_points',
      coupon_code: coupon ? coupon.code : null,
      note,
      scheduled_at: isScheduled ? scheduledAt : null,
      items: cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size || null,
        toppings: item.toppings.map(t => t.id)
      }))
    }

    if (deliveryType === 'delivery') {
      if (selectedAddress) {
        payload.address = {
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.street,
          lat: selectedAddress.lat || shippingCalculation?.lat || null,
          lng: selectedAddress.lng || shippingCalculation?.lng || null,
        }
      } else {
        // Validate manual input
        if (!manualAddress.recipient_name || !manualAddress.phone || !manualAddress.province || !manualAddress.district || !manualAddress.ward || !manualAddress.street) {
          showToast(t('checkout.address_required'), 'error')
          setLoading(false)
          return
        }
        payload.address = {
          ...manualAddress,
          lat: shippingCalculation?.lat || null,
          lng: shippingCalculation?.lng || null
        }
        localStorage.setItem('hk_last_checkout_address', JSON.stringify(manualAddress))
      }
    } else if (deliveryType === 'pickup') {
      if (!selectedBranch) {
        showToast(t('checkout.branch_required'), 'error')
        setLoading(false)
        return
      }
      if (!manualAddress.recipient_name || !manualAddress.phone) {
        showToast(t('checkout.recipient_info_required'), 'error')
        setLoading(false)
        return
      }
      payload.address = {
        recipient_name: manualAddress.recipient_name,
        phone: manualAddress.phone,
        province: selectedBranch.name,
        district: selectedBranch.address,
        ward: 'pickup',
        street: selectedBranch.phone || '',
        lat: selectedBranch.lat || null,
        lng: selectedBranch.lng || null
      }
    }

    apiClient.post('/orders', payload)
      .then(res => {
        clearCart()
        showToast(t('checkout.order_created'))
        setLoading(false)
        
        // Redirect to the payment gateway URL returned by the backend.
        if (res.data.payment_url) {
          // If the gateway is online, let's redirect
          window.location.href = res.data.payment_url
        } else {
          navigate(`/orders/tracking/${res.data.order.order_code}`)
        }
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.payment_error'), 'error')
        setLoading(false)
      })
  }

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      
      {/* Refactored Light Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-10 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-smooth ${
            step >= 1 ? 'border-primary bg-primary text-white' : 'border-[#E8E8E8] bg-[#E8E8E8] text-[#999999]'
          }`}>1</span>
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 1 ? 'text-primary' : 'text-[#999999]'}`}>{t('checkout.step_info')}</span>
        </div>
        <div className={`h-0.5 flex-1 transition-smooth ${step >= 2 ? 'bg-primary' : 'bg-[#E8E8E8]'}`} />
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-smooth ${
            step >= 2 ? 'border-primary bg-primary text-white' : 'border-[#E8E8E8] bg-[#E8E8E8] text-[#999999]'
          }`}>2</span>
          <span className={`font-semibold text-xs uppercase tracking-wide ${step >= 2 ? 'text-primary' : 'text-[#999999]'}`}>{t('checkout.step_payment')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checkout Forms */}
        <main className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6 text-left">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_method')}</h2>
              
              {/* Delivery Type toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setDelivery('delivery')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] cursor-pointer ${
                    deliveryType === 'delivery' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  {t('checkout.delivery').toUpperCase()}
                </button>
                <button 
                  onClick={() => setDelivery('pickup')}
                  className={`py-3 rounded-[10px] font-semibold text-sm tracking-wider transition-all duration-200 hover:-translate-y-[1px] cursor-pointer ${
                    deliveryType === 'pickup' ? 'bg-primary text-white' : 'bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]'
                  }`}
                >
                  {t('checkout.pickup').toUpperCase()}
                </button>
              </div>

              {/* Address Book Selections */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_address')}</h3>
                  {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-smooth ${
                            selectedAddress?.id === addr.id 
                              ? 'border-primary bg-primary/5 text-[#1A1A1A]' 
                              : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                            {addr.is_default && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-[8px] font-bold uppercase">{t('common.default')}</span>}
                          </div>
                          <p className="text-xs font-semibold text-[#1A1A1A] mt-2">{addr.recipient_name} - {addr.phone}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
                        </div>
                      ))}
                      <div 
                        onClick={() => setSelectedAddress(null)}
                        className={`p-4 rounded-2xl border border-dashed border-[#E8E8E8] cursor-pointer transition-smooth flex flex-col items-center justify-center text-center text-xs text-gray-400 hover:text-[#1A1A1A] hover:border-gray-400 ${
                          !selectedAddress ? 'border-primary text-primary' : 'bg-[#F8F8F8]'
                        }`}
                      >
                        <Plus className="w-5 h-5 mb-1 text-primary" />
                        <span>{t('checkout.use_other_address')}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Manual Address Input Card */}
                  {!selectedAddress && (
                    <div className="p-5 rounded-2xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.recipient_name')}</label>
                        <input 
                          type="text" 
                          placeholder={t('auth.name_placeholder')}
                          value={manualAddress.recipient_name}
                          onChange={(e) => setManualAddress({ ...manualAddress, recipient_name: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.phone')}</label>
                        <input 
                          type="tel" 
                          placeholder="09xxxxxx" 
                          value={manualAddress.phone}
                          onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                          className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <VietnamAddressSelector
                        province={manualAddress.province}
                        district={manualAddress.district}
                        ward={manualAddress.ward}
                        street={manualAddress.street}
                        onChange={({ province, district, ward, street }) =>
                          setManualAddress({ ...manualAddress, province, district, ward, street })
                        }
                        theme="storefront"
                      />
                    </div>
                  )}

                  {/* Shipping status/warnings */}
                  {calculatingShipping && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl mt-3 animate-pulse font-semibold">
                      🔄 {t('checkout.calculating')}
                    </div>
                  )}
                  {shippingError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl mt-3 font-semibold">
                      ⚠️ {shippingError}
                    </div>
                  )}
                  {shippingCalculation?.out_of_range && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mt-3 font-semibold">
                      ⚠️ {shippingCalculation.message || t('checkout.out_of_range_error')}
                    </div>
                  )}
                  {shippingCalculation && !shippingCalculation.out_of_range && shippingCalculation.distance_km && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl mt-3 font-semibold space-y-1">
                      {shippingCalculation.nearest_branch_name && (
                        <p>🏪 {t('checkout.fulfilled_by')}: <span className="font-bold text-[#1A1A1A]">{shippingCalculation.nearest_branch_name}</span></p>
                      )}
                      <p>📍 {t('checkout.distance')}: {shippingCalculation.distance_km}km. {t('checkout.estimated')}: {
                        typeof shippingCalculation.estimated === 'object'
                          ? (shippingCalculation.estimated[i18n.language] || shippingCalculation.estimated.vi || t('checkout.fallback_estimated'))
                          : (shippingCalculation.estimated || t('checkout.fallback_estimated'))
                      }</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Scheduler option */}
              <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                <h3 className="font-bold text-[20px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.delivery_time')}</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsScheduled(false)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] cursor-pointer ${
                      !isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    {t('checkout.deliver_now').toUpperCase()}
                  </button>
                  <button 
                    onClick={() => setIsScheduled(true)}
                    className={`flex-1 py-2.5 rounded-[10px] border text-xs font-semibold tracking-wide transition-smooth hover:-translate-y-[1px] cursor-pointer ${
                      isScheduled ? 'bg-primary/10 border-primary text-primary' : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500'
                    }`}
                  >
                    {t('checkout.schedule_order').toUpperCase()}
                  </button>
                </div>

                {isScheduled && (
                  <div>
                    <input 
                      type="datetime-local" 
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Order Note */}
              <div className="space-y-2 pt-4 border-t border-[#E8E8E8]">
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.order_note')}</label>
                <textarea 
                  placeholder={t('checkout.order_note_placeholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>

              {/* Self-pickup branch selection UI */}
              {deliveryType === 'pickup' && (
                <div className="space-y-6 pt-4 border-t border-[#E8E8E8]">
                  {/* Recipient info for pickup */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-[18px] text-[#1A1A1A] uppercase tracking-wide">
                      {t('checkout.recipient_info')}
                    </h3>
                    <div className="p-5 rounded-2xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.5px] text-[#888888] mb-2 uppercase">
                          {t('checkout.recipient_name')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder={t('auth.name_placeholder')}
                          value={manualAddress.recipient_name}
                          onChange={(e) => setManualAddress({ ...manualAddress, recipient_name: e.target.value })}
                          className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[12px] px-[14px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold tracking-[0.5px] text-[#888888] mb-2 uppercase">
                          {t('checkout.phone')} <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="tel" 
                          placeholder="09xxxxxx" 
                          value={manualAddress.phone}
                          onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                          className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[12px] px-[14px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branch selection */}
                  <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                    <h3 className="font-bold text-[18px] text-[#1A1A1A] uppercase tracking-wide">
                      {t('checkout.select_pickup_branch')}
                    </h3>
                    
                    {branches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {branches.map((br) => {
                          const isSelected = selectedBranch?.id === br.id
                          return (
                            <div 
                              key={br.id}
                              onClick={() => setSelectedBranch(br)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between hover:shadow-premium text-left ${
                                isSelected 
                                  ? 'border-primary bg-primary/5 text-[#1A1A1A]' 
                                  : 'border-[#E8E8E8] bg-white text-gray-500 hover:border-gray-400'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                  {t('checkout.selected')}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-xs text-[#1A1A1A] mb-1.5 pr-12">{br.name}</h4>
                                <p className="text-[10px] leading-relaxed text-[#666666] mb-2">{br.address}</p>
                              </div>
                              <div className="pt-2 border-t border-dashed border-[#E8E8E8] flex flex-col sm:flex-row sm:justify-between gap-1 text-[9px] text-[#888888]">
                                <span>📞 {t('checkout.branch_hotline')}: <strong className="text-[#1A1A1A]">{br.phone || '-'}</strong></span>
                                <span>🕒 {br.open_time?.substring(0, 5) || '08:00'} - {br.close_time?.substring(0, 5) || '22:00'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center border border-[#E8E8E8] rounded-2xl text-xs text-gray-400 bg-white">
                        ⚠️ {t('checkout.no_active_branches')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                disabled={isCheckoutInvalid}
                className={`w-full font-semibold py-3.5 rounded-[8px] tracking-wider text-sm transition flex justify-center items-center gap-2 active:translate-y-0 mt-6 cursor-pointer ${
                  isCheckoutInvalid
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 text-white hover:-translate-y-[1px]'
                }`}
              >
                {t('checkout.continue_to_payment')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6 text-left">
              <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.payment_method')}</h2>
              
              <PaymentMethodSelector selected={paymentMethod} onChange={setPayment} />

              {paymentMethod === 'loyalty_points' && (
                <div className={`rounded-xl border p-4 text-xs space-y-3 ${
                  canPayWithLoyalty
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-amber-200 bg-amber-50/80'
                }`}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_balance_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">
                        {loyaltyInfo.loading ? t('checkout.loyalty_loading') : `${loyaltyBalance} ${t('profile.points')}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_value_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">{formatVND(loyaltyAvailableValue)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-gray-400">{t('checkout.loyalty_needed_label')}</p>
                      <p className="font-bold text-[#1A1A1A] mt-1">{loyaltyPointsNeeded} {t('profile.points')}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3">
                    <p className="text-[11px] text-gray-500">
                      {t('checkout.loyalty_exchange_note', { value: formatVND(loyaltyPointValue) })}
                    </p>
                    <p className={`font-bold ${canPayWithLoyalty ? 'text-emerald-600' : 'text-amber-700'}`}>
                      {canPayWithLoyalty
                        ? t('checkout.loyalty_enough')
                        : t('checkout.loyalty_shortfall', { points: loyaltyShortfall, amount: formatVND(loyaltyShortfall * loyaltyPointValue) })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-[#F8F8F8] hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-3.5 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px] cursor-pointer"
                >
                  {t('checkout.back').toUpperCase()}
                </button>
                <button 
                  onClick={handleCheckoutSubmit}
                  disabled={loading || (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) || isShippingInvalid}
                  className={`w-1/2 font-semibold py-3.5 rounded-[8px] tracking-wider text-xs transition shadow-glass flex justify-center items-center gap-2 active:translate-y-0 cursor-pointer ${
                    loading || (paymentMethod === 'loyalty_points' && !canPayWithLoyalty) || isShippingInvalid
                      ? 'bg-gray-300 text-white cursor-not-allowed'
                      : 'bg-primary hover:opacity-90 text-white hover:-translate-y-[1px]'
                  }`}
                >
                  {loading ? t('checkout.processing') : t('checkout.confirm').toUpperCase()}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Refactored light order summary card */}
        <aside className="space-y-6" data-aos="fade-left">
          <div className="p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium text-left">
            <h3 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide mb-4">{t('checkout.order_summary')}</h3>
            
            <div className="divide-y divide-[#E8E8E8] max-h-60 overflow-y-auto mb-4 pr-1">
              {cartItems.map((item) => {
                let baseItemPrice = parseFloat(item.product.sale_price ?? item.product.base_price)
                const sizeModel = item.product.sizes?.find(s => s.size === item.size)
                if (sizeModel) baseItemPrice += parseFloat(sizeModel.extra_price)

                const toppingsPrice = item.toppings.reduce((sum, t) => sum + parseFloat(t.price), 0)
                const unitTotal = baseItemPrice + toppingsPrice

                return (
                  <div key={item.id} className="py-3 flex justify-between text-xs">
                    <div>
                      {/* Product Name DM Sans 15px bold */}
                      <p className="font-bold text-[15px] text-[#1A1A1A] leading-tight">{item.product.name}</p>
                      {/* Sub-info size/quantity DM Sans 13px */}
                      {[
                        item.size ? `Size ${item.size}` : null,
                        ...(item.toppings || []).map(t => t.name)
                      ].filter(Boolean).length > 0 && (
                        <p className="text-[13px] text-[#888888] mt-1">
                          {[
                            item.size ? `Size ${item.size}` : null,
                            ...(item.toppings || []).map(t => t.name)
                          ].filter(Boolean).join(' + ')}
                        </p>
                      )}
                      <p className="text-[13px] text-[#888888] mt-1 font-semibold">x {item.quantity}</p>
                    </div>
                    <span className="text-[#1A1A1A] font-semibold text-sm">{formatVND(unitTotal * item.quantity)}</span>
                  </div>
                )
              })}
            </div>

            {/* Coupons input field formatted like fields */}
            <div className="pt-4 border-t border-[#E8E8E8] flex gap-2">
              <input 
                type="text" 
                placeholder={t('checkout.coupon_placeholder')}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-xs text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-secondary text-[#1A1A1A] font-bold px-4 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px] cursor-pointer"
              >
                {t('cart.apply').toUpperCase()}
              </button>
            </div>

            {coupon && (
              <div className="mt-2 flex items-center justify-between bg-primary/10 border border-primary/20 text-xs px-3 py-2 rounded-[10px]">
                <span className="text-primary font-semibold flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-primary" /> {coupon.code}</span>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-black transition font-semibold cursor-pointer">{t('common.delete').toUpperCase()}</button>
              </div>
            )}

            {/* Price lines */}
            <div className="border-t border-[#E8E8E8] pt-4 mt-4 space-y-2 text-xs text-[#666666]">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
              </div>
              {totals.productSavings > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('cart.product_savings')}</span>
                  <span>-{formatVND(totals.productSavings)}</span>
                </div>
              )}
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('cart.coupon')}</span>
                  <span>-{formatVND(totals.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span className="text-[#1A1A1A] font-semibold">
                  {calculatingShipping ? (
                    <span className="text-gray-400 animate-pulse">{t('checkout.calculating')}</span>
                  ) : deliveryType === 'pickup' ? (
                    t('cart.free_shipping')
                  ) : shippingCalculation?.out_of_range ? (
                    <span className="text-red-500 font-bold">{t('checkout.not_available')}</span>
                  ) : displayShippingFee === 0 ? (
                    t('cart.free_shipping')
                  ) : (
                    formatVND(displayShippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-3 mt-4 flex justify-between items-center">
              <span className="font-bold text-[20px] uppercase tracking-wide text-[#666666]">{t('cart.total')}</span>
              
              {/* Product Total: DM Sans 24px primary red */}
              <span className="font-bold text-2xl text-primary">
                {formatVND(displayTotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
