import React from 'react'
import { Tag } from 'lucide-react'

export default function OrderSummary({
  cartItems,
  totals,
  coupon,
  couponInput,
  setCouponInput,
  activeCoupons,
  displayShippingFee,
  displayTotal,
  handleApplyCoupon,
  removeCoupon,
  handleApplyCouponCode,
  formatVND,
  t
}) {
  return (
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

        {/* Clickable public coupon suggestions */}
        {activeCoupons.length > 0 && (
          <div className="mt-3 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-gray-400" />
              {t('checkout.available_coupons', 'Khuyến mãi có sẵn:')}
            </p>
            <div className="flex flex-wrap gap-2">
              {activeCoupons.map((c) => {
                const isApplied = coupon?.code === c.code
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      if (isApplied) {
                        removeCoupon()
                        setCouponInput('')
                      } else {
                        handleApplyCouponCode(c.code)
                        setCouponInput(c.code)
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                      isApplied 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span>{c.code}</span>
                    {c.type === 'free_ship' ? (
                      <span className="opacity-75">({t('cart.free_shipping')})</span>
                    ) : (
                      c.value && <span className="opacity-75">({c.type === 'percent' ? `-${c.value}%` : `-${formatVND(c.value)}`})</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Pricing details listing */}
        <div className="border-t border-[#E8E8E8] pt-4 text-xs space-y-2 text-[#666666] mt-4">
          <div className="flex justify-between">
            <span>{t('cart.subtotal')}</span>
            <span className="text-[#1A1A1A] font-semibold">{formatVND(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('cart.shipping')}</span>
            <span className="text-[#1A1A1A] font-semibold">{displayShippingFee === 0 ? t('cart.free_shipping') : formatVND(displayShippingFee)}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-primary font-bold">
              <span>{t('cart.discount')} ({coupon.code})</span>
              <span>-{formatVND(totals.couponDiscount)}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t border-[#E8E8E8] pt-3 text-sm font-bold text-[#1A1A1A] mt-2">
            <span className="font-semibold text-sm">{t('cart.total')}</span>
            <span className="text-primary font-semibold text-base">{formatVND(displayTotal)}</span>
          </div>
        </div>

      </div>
    </aside>
  )
}
