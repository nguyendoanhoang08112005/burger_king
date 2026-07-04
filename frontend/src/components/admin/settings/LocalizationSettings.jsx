import React from 'react'
import {
  SettingInput, SettingSelect, SettingToggle, fieldInputClass, CURRENCY_OPTIONS
} from '../../../utils/adminUtils'

export default function LocalizationSettings({
  settings,
  updateSetting,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingSelect
          label={tAdmin('timezone')}
          value={settings['localization.timezone']}
          onChange={value => updateSetting('localization.timezone', value)}
          options={[
            { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh' },
            { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
            { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
            { value: 'Asia/Seoul', label: 'Asia/Seoul' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
            { value: 'America/New_York', label: 'America/New_York' },
            { value: 'UTC', label: 'UTC' },
          ]}
        />
        <div className="block">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">
            {tAdmin('currency')}
          </span>
          <select
            value={settings['localization.currency'] || ''}
            onChange={e => {
              const opt = CURRENCY_OPTIONS.find(o => o.value === e.target.value)
              updateSetting('localization.currency', e.target.value)
              if (opt) updateSetting('localization.currency_symbol', opt.symbol)
            }}
            className={`${fieldInputClass} mt-2`}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <SettingInput 
          label={tAdmin('currency_symbol')} 
          value={settings['localization.currency_symbol']} 
          onChange={value => updateSetting('localization.currency_symbol', value)} 
        />
        <SettingSelect 
          label={tAdmin('currency_position')} 
          value={settings['localization.currency_position']} 
          onChange={value => updateSetting('localization.currency_position', value)} 
          options={[
            { value: 'after', label: tAdmin('after_amount') }, 
            { value: 'before', label: tAdmin('before_amount') }
          ]} 
        />
        <SettingSelect 
          label={tAdmin('number_format')} 
          value={settings['localization.number_format']} 
          onChange={value => updateSetting('localization.number_format', value)} 
          options={[
            { value: 'dot', label: '1.000' }, 
            { value: 'comma', label: '1,000' }
          ]} 
        />
      </div>

      <hr className="border-gray-100 dark:border-gray-800 my-4" />
      <SettingToggle 
        label={tAdmin('default_to_vietnam_address', 'Mặc định cho Việt Nam (Dùng API lấy địa chỉ Tỉnh/Huyện/Xã)')} 
        checked={settings['localization.default_to_vietnam'] !== false} 
        onChange={value => updateSetting('localization.default_to_vietnam', value)} 
      />
    </div>
  )
}
