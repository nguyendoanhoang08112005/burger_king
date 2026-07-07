import React, { useState, useEffect } from 'react'
import { Gift, CreditCard, CheckCircle } from 'lucide-react'
import apiClient from '../../api/axios'

function usePaymentMethods() {
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
          setMethods([{ key: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: 'cod', is_default: true }])
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  return { methods, loading }
}

function paymentIcon(key) {
  if (key === 'loyalty_points') return <Gift className="w-5 h-5 text-yellow-500" />
  return <CreditCard className="w-5 h-5 text-gray-400" />
}

function PaymentMethodSelector({ selected, onChange, t }) {
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

export default function CheckoutPayment({
  paymentMethod,
  setPayment,
  canPayWithLoyalty,
  loyaltyInfo,
  loyaltyBalance,
  loyaltyAvailableValue,
  loyaltyPointsNeeded,
  loyaltyShortfall,
  loyaltyPointValue,
  loading,
  isShippingInvalid,
  setStep,
  handleCheckoutSubmit,
  formatVND,
  t
}) {
  return (
    <div className="p-5 sm:p-[28px_32px] rounded-2xl bg-white border border-[#E8E8E8] shadow-premium space-y-6 text-left">
      <h2 className="font-bold text-[22px] text-[#1A1A1A] uppercase tracking-wide">{t('checkout.payment_method')}</h2>
      
      <PaymentMethodSelector selected={paymentMethod} onChange={setPayment} t={t} />

      {paymentMethod === 'loyalty_points' && (
        <div className={`rounded-xl border p-4 text-xs space-y-3 ${
          canPayWithLoyalty
            ? 'border-emerald-200 bg-emerald-50/70'
            : 'border-amber-200 bg-amber-50/80'
        }`}>
          <div className="grid sm:grid-cols-3 gap-3 text-left">
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-3 text-left">
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
  )
}
