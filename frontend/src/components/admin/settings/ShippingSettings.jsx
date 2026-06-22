import React, { useState } from 'react'
import { X } from 'lucide-react'
import {
  SettingInput, SettingSelect, fieldInputClass
} from '../../../utils/adminUtils'
import apiClient from '../../../api/axios'

export default function ShippingSettings({
  settings,
  updateSetting,
  selectedBranchAddress,
  selectedBranchLat,
  selectedBranchLng,
  tAdmin,
  formatVND
}) {
  const [testAddress, setTestAddress] = useState({ lat: 10.781232, lng: 106.685324, order_amount: 178000 })
  const [testResult, setTestResult] = useState(null)

  const parseTiers = () => {
    const tiers = settings['shipping.distance_tiers']
    if (Array.isArray(tiers)) return tiers
    try { return JSON.parse(tiers || '[]') } catch { return [] }
  }

  const updateTiers = tiers => updateSetting('shipping.distance_tiers', tiers)

  const calculateTestShipping = async () => {
    try {
      const { data } = await apiClient.post('/shipping/calculate', testAddress)
      setTestResult(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  const tiers = parseTiers()

  return (
    <div className="space-y-5 text-left">
      <SettingSelect 
        label={tAdmin('shipping_method')} 
        value={settings['shipping.method'] || 'fixed'} 
        onChange={value => updateSetting('shipping.method', value)} 
        options={[
          { value: 'fixed', label: tAdmin('fixed') }, 
          { value: 'distance', label: tAdmin('distance') }, 
          { value: 'free', label: tAdmin('free_all') }
        ]} 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label={tAdmin('base_fee')} 
          type="number" 
          suffix={settings['localization.currency_symbol'] || 'VND'} 
          value={settings['shipping.base_fee']} 
          onChange={value => updateSetting('shipping.base_fee', value)} 
        />
        <SettingInput 
          label={tAdmin('free_from')} 
          type="number" 
          suffix={settings['localization.currency_symbol'] || 'VND'} 
          value={settings['shipping.free_from_amount']} 
          onChange={value => updateSetting('shipping.free_from_amount', value)} 
          hint={tAdmin('free_from_hint')} 
        />
        <SettingInput 
          label={tAdmin('per_km_fee')} 
          type="number" 
          suffix={settings['localization.currency_symbol'] || 'VND'} 
          value={settings['shipping.per_km_fee']} 
          onChange={value => updateSetting('shipping.per_km_fee', value)} 
        />
        <SettingInput 
          label={tAdmin('max_distance')} 
          type="number" 
          suffix="km" 
          value={settings['shipping.max_distance_km']} 
          onChange={value => updateSetting('shipping.max_distance_km', value)} 
        />
      </div>
      <SettingInput 
        label={tAdmin('main_store_address')} 
        value={selectedBranchAddress} 
        onChange={() => {}} 
        disabled 
        hint={tAdmin('managed_from_overview')} 
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingInput label={tAdmin('latitude')} type="number" value={selectedBranchLat} onChange={() => {}} disabled />
        <SettingInput label={tAdmin('longitude')} type="number" value={selectedBranchLng} onChange={() => {}} disabled />
        <SettingInput 
          label={tAdmin('estimated_time')} 
          value={typeof settings['shipping.estimated_time'] === 'object' ? settings['shipping.estimated_time']?.vi || '' : settings['shipping.estimated_time'] || ''} 
          onChange={value => updateSetting('shipping.estimated_time', value)} 
        />
      </div>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{tAdmin('distance_tiers')}</h3>
          <button 
            type="button" 
            onClick={() => updateTiers([...tiers, { max_km: 0, fee: 0 }])} 
            className="text-sm font-semibold text-[#D62300]"
          >
            {tAdmin('add_tier')}
          </button>
        </div>
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <input 
                type="number" 
                value={tier.max_km} 
                onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, max_km: Number(event.target.value) } : item))} 
                className={fieldInputClass} 
                placeholder={tAdmin('to_km')} 
              />
              <input 
                type="number" 
                value={tier.fee} 
                onChange={event => updateTiers(tiers.map((item, i) => i === index ? { ...item, fee: Number(event.target.value) } : item))} 
                className={fieldInputClass} 
                placeholder={tAdmin('fee')} 
              />
              <button 
                type="button" 
                onClick={() => updateTiers(tiers.filter((_, i) => i !== index))} 
                className="px-3 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {!tiers.length && <p className="text-sm text-gray-400">{tAdmin('no_tiers')}</p>}
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold mb-3">{tAdmin('test_shipping')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input 
            type="number" 
            value={testAddress.lat} 
            onChange={event => setTestAddress(prev => ({ ...prev, lat: Number(event.target.value) }))} 
            className={fieldInputClass} 
            placeholder="Lat" 
          />
          <input 
            type="number" 
            value={testAddress.lng} 
            onChange={event => setTestAddress(prev => ({ ...prev, lng: Number(event.target.value) }))} 
            className={fieldInputClass} 
            placeholder="Lng" 
          />
          <input 
            type="number" 
            value={testAddress.order_amount} 
            onChange={event => setTestAddress(prev => ({ ...prev, order_amount: Number(event.target.value) }))} 
            className={fieldInputClass} 
            placeholder={tAdmin('order_value')} 
          />
          <button 
            type="button" 
            onClick={calculateTestShipping} 
            className="rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700"
          >
            {tAdmin('calculate')}
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${testResult.out_of_range ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {testResult.out_of_range ? testResult.message : `${tAdmin('shipping_fee_result')}: ${testResult.is_free ? tAdmin('free') : formatVND(testResult.fee || 0)}${testResult.distance_km ? ` - ${testResult.distance_km}km` : ''}`}
          </div>
        )}
      </div>
    </div>
  )
}
