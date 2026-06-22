import React from 'react'
import { MapPin } from 'lucide-react'

export default function OrderDetailCard({ order, formatVND, formatDate, t }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Items lists */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] space-y-4 shadow-glass">
        <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase">{t('order.item_details')}</h3>
        <div className="divide-y divide-[#E8E8E8]">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex justify-between text-xs text-left">
              <div>
                <p className="font-bold text-[#1A1A1A]">{item.product_name}</p>
                {item.size && (
                  <p className="text-[10px] text-gray-500 mt-1">Size {item.size}</p>
                )}
                {item.toppings?.length > 0 && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">Toppings: {item.toppings.map(t => t.name).join(', ')}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">x {item.quantity}</p>
              </div>
              <span className="text-[#1A1A1A] font-semibold">{formatVND(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E8E8E8] pt-4 text-xs space-y-2 text-[#666666]">
          <div className="flex justify-between">
            <span>{t('cart.subtotal')}</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          {parseFloat(order.discount) > 0 && (
            <div className="flex justify-between text-primary font-semibold">
              <span>{t('cart.discount')}</span>
              <span>-{formatVND(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t('cart.shipping')}</span>
            <span>{parseFloat(order.shipping_fee) === 0 ? t('cart.free_shipping') : formatVND(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-[#E8E8E8] pt-3 text-sm font-bold text-[#1A1A1A] mt-2">
            <span className="font-semibold text-sm">{t('cart.total')}</span>
            <span className="text-primary font-semibold text-base">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery / Pickup address card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col justify-between shadow-glass text-left">
        <div>
          <h3 className="font-bold text-lg text-primary uppercase tracking-[0.3px]">{t('order.delivery_info')}</h3>
          {order.delivery_type === 'delivery' && order.address ? (
            <div className="mt-4 text-xs space-y-2">
              <p className="text-[#1A1A1A] font-bold">{order.address.recipient_name} - {order.address.phone}</p>
              <p className="text-[#666666] leading-relaxed">
                {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
              </p>
              <p className="text-gray-400 text-[10px] pt-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {t('order.delivery_from_branch')}
              </p>
            </div>
          ) : (
            <div className="mt-4 text-xs text-[#666666] space-y-2">
              {order.address ? (
                <>
                  <p className="text-[#1A1A1A] font-bold">{order.address.recipient_name} - {order.address.phone}</p>
                  <p className="mt-2 font-semibold text-[#1A1A1A]">🏪 {order.address.province}</p>
                  <p className="text-[10px] text-gray-500 mt-1">📍 {t('order.pickup_address_label')}: {order.address.district}</p>
                  {order.address.street && (
                    <p className="text-[10px] text-gray-500">📞 {t('order.pickup_hotline_label')}: {order.address.street}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[#1A1A1A] font-bold">{t('order.pickup_customer')}</p>
                  <p className="mt-2">{t('order.pickup_branch')}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{t('order.pickup_address')}</p>
                </>
              )}
            </div>
          )}
          {order.scheduled_at && (
            <div className="mt-4 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4 text-xs">
              <p className="font-semibold uppercase tracking-[0.4px] text-gray-400">{t('order.scheduled_at')}</p>
              <p className="mt-1 font-bold text-[#1A1A1A]">{formatDate(order.scheduled_at)}</p>
            </div>
          )}
          {order.note && (
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs">
              <p className="font-semibold uppercase tracking-[0.4px] text-amber-700">{t('checkout.order_note')}</p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#1A1A1A]">{order.note}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-[#E8E8E8] mt-6 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400 font-semibold">{t('order.payment')}</span>
            <span className="text-[#1A1A1A] font-bold uppercase">{order.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-semibold">{t('order.status')}</span>
            <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-primary' : 'text-primary/70'}`}>
              {order.payment_status === 'paid' ? t('order.paid') : t('order.unpaid')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
