import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatVND } from '../../utils/format'
import CheckoutInfo from '../../components/checkout/CheckoutInfo'
import CheckoutPayment from '../../components/checkout/CheckoutPayment'
import OrderSummary from '../../components/checkout/OrderSummary'

const getLastCheckoutAddress = () => {
  try {
    return JSON.parse(localStorage.getItem('hk_last_checkout_address') || 'null') || {}
  } catch {
    return {}
  }
}

export default function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const { cartItems, getCartTotals, coupon, applyCoupon, removeCoupon, clearCart } = useCartStore()
  const user = useAuthStore(state => state.user)
  const { showToast } = useUiStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

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
  const [orderPlaced, setOrderPlaced] = useState(false)
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
  const [activeCoupons, setActiveCoupons] = useState([])

  const totals = getCartTotals(deliveryType)
  const displayShippingFee = deliveryType === 'pickup' ? 0 : (shippingCalculation?.fee ?? (totals.subtotal >= 300000 ? 0 : 15000))
  
  let displayCouponDiscount = totals.couponDiscount
  if (coupon && coupon.type === 'free_ship') {
    displayCouponDiscount = displayShippingFee
  }

  const displayTotal = Math.max(0, totals.subtotal - displayCouponDiscount + displayShippingFee)

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

    // Load visible active coupons
    apiClient.get('/coupons/active')
      .then(res => {
        setActiveCoupons(res.data || [])
      }).catch(err => {
        console.error('Failed to load active coupons:', err)
      })
  }, [])

  useEffect(() => {
    if (!user?.id) return

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
  }, [user?.id])

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

  if (cartItems.length === 0 && !orderPlaced) {
    return <Navigate to="/menu" />
  }

  const handleApplyCouponCode = (code) => {
    if (!code) return
    apiClient.post('/cart/apply-coupon', { code: code, subtotal: totals.subtotal, shipping_fee: displayShippingFee })
      .then(res => {
        applyCoupon(res.data)
        showToast(t('checkout.coupon_applied'))
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.coupon_invalid'), 'error')
      })
  }

  const handleApplyCoupon = () => {
    handleApplyCouponCode(couponInput)
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
        setOrderPlaced(true)
        clearCart()
        showToast(t('checkout.order_created'))
        setLoading(false)
        
        // Redirect to the payment gateway URL returned by the backend (only for online payment gateways).
        if (res.data.payment_url && !res.data.payment_url.includes('/orders/tracking/')) {
          // If the gateway is online (e.g. VNPay/Stripe), let's redirect
          window.location.href = res.data.payment_url
        } else {
          // COD or points: use navigate to go to tracking page smoothly!
          navigate(`/orders/tracking/${res.data.order.order_code}`)
        }
      }).catch(err => {
        console.error(err)
        showToast(err.response?.data?.message || t('checkout.payment_error'), 'error')
        setLoading(false)
      })
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-24 md:pt-32 pb-16 px-6 bg-[#FFFAF5] text-[#1A1A1A]">
      
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
            <CheckoutInfo
              deliveryType={deliveryType}
              setDelivery={setDelivery}
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              manualAddress={manualAddress}
              setManualAddress={setManualAddress}
              isScheduled={isScheduled}
              setIsScheduled={setIsScheduled}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
              note={note}
              setNote={setNote}
              calculatingShipping={calculatingShipping}
              shippingError={shippingError}
              shippingCalculation={shippingCalculation}
              branches={branches}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              isCheckoutInvalid={isCheckoutInvalid}
              setStep={setStep}
              user={user}
              t={t}
              i18n={i18n}
            />
          )}

          {step === 2 && (
            <CheckoutPayment
              paymentMethod={paymentMethod}
              setPayment={setPayment}
              canPayWithLoyalty={canPayWithLoyalty}
              loyaltyInfo={loyaltyInfo}
              loyaltyBalance={loyaltyBalance}
              loyaltyAvailableValue={loyaltyAvailableValue}
              loyaltyPointsNeeded={loyaltyPointsNeeded}
              loyaltyShortfall={loyaltyShortfall}
              loyaltyPointValue={loyaltyPointValue}
              loading={loading}
              isShippingInvalid={isShippingInvalid}
              setStep={setStep}
              handleCheckoutSubmit={handleCheckoutSubmit}
              formatVND={formatVND}
              t={t}
            />
          )}
        </main>

        <OrderSummary
          cartItems={cartItems}
          totals={{ ...totals, couponDiscount: displayCouponDiscount }}
          coupon={coupon}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          activeCoupons={activeCoupons}
          displayShippingFee={displayShippingFee}
          displayTotal={displayTotal}
          handleApplyCoupon={handleApplyCoupon}
          removeCoupon={removeCoupon}
          handleApplyCouponCode={handleApplyCouponCode}
          formatVND={formatVND}
          t={t}
        />
      </div>
    </div>
  )
}
