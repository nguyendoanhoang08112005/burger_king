import React from 'react'
import { Plus, ChevronRight, Store, Compass, Clock, Loader2, AlertTriangle } from 'lucide-react'
import VietnamAddressSelector from '../../components/VietnamAddressSelector'

export default function CheckoutInfo({
  deliveryType,
  setDelivery,
  addresses,
  selectedAddress,
  setSelectedAddress,
  manualAddress,
  setManualAddress,
  isScheduled,
  setIsScheduled,
  scheduledAt,
  setScheduledAt,
  note,
  setNote,
  calculatingShipping,
  shippingError,
  shippingCalculation,
  branches,
  selectedBranch,
  setSelectedBranch,
  isCheckoutInvalid,
  setStep,
  user,
  t,
  i18n
}) {
  return (
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
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.phone')}</label>
                <input 
                  type="tel" 
                  placeholder="09xxxxxx" 
                  value={manualAddress.phone}
                  onChange={(e) => setManualAddress({ ...manualAddress, phone: e.target.value })}
                  className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
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
            <div className="p-3 bg-blue-50/50 border border-blue-100 text-blue-700 text-xs rounded-xl mt-3 flex items-center gap-2 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>{t('checkout.calculating')}</span>
            </div>
          )}
          {shippingError && (
            <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-700 text-xs rounded-xl mt-3 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{shippingError}</span>
            </div>
          )}
          {shippingCalculation?.out_of_range && (
            <div className="p-3 bg-red-50/50 border border-red-100 text-red-700 text-xs rounded-xl mt-3 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{shippingCalculation.message || t('checkout.out_of_range_error')}</span>
            </div>
          )}
          {shippingCalculation && !shippingCalculation.out_of_range && shippingCalculation.distance_km && (
            <div className="p-4 rounded-xl bg-orange-50/30 border border-orange-100/80 mt-4 space-y-3">
              <div className="flex items-start gap-3 text-left">
                <div className="p-2 rounded-lg bg-orange-100/50 text-primary">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('checkout.fulfilled_by')}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{shippingCalculation.nearest_branch_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-orange-100/50">
                <div className="flex items-center gap-2 text-left">
                  <Compass className="w-4 h-4 text-primary opacity-80" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">{t('checkout.distance')}</p>
                    <p className="text-xs font-bold text-gray-800">{shippingCalculation.distance_km} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-left">
                  <Clock className="w-4 h-4 text-primary opacity-80" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold">{t('checkout.estimated')}</p>
                    <p className="text-xs font-bold text-gray-800">
                      {typeof shippingCalculation.estimated === 'object'
                        ? (shippingCalculation.estimated[i18n.language] || shippingCalculation.estimated.vi || t('checkout.fallback_estimated'))
                        : (shippingCalculation.estimated || t('checkout.fallback_estimated'))}
                    </p>
                  </div>
                </div>
              </div>
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
  )
}
