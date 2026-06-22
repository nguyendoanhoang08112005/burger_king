import React from 'react'
import {
  SettingInput, SettingToggle
} from '../../../utils/adminUtils'

export default function LoyaltySettings({
  settings,
  updateSetting,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <SettingToggle 
        label={tAdmin('enable_loyalty')} 
        checked={!!settings['loyalty.enabled']} 
        onChange={value => updateSetting('loyalty.enabled', value)} 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label={tAdmin('vnd_per_point')} 
          type="number" 
          value={settings['loyalty.points_per_vnd']} 
          onChange={value => updateSetting('loyalty.points_per_vnd', value)} 
        />
        <SettingInput 
          label={tAdmin('point_value')} 
          type="number" 
          value={settings['loyalty.vnd_per_point']} 
          onChange={value => updateSetting('loyalty.vnd_per_point', value)} 
        />
        <SettingInput 
          label={tAdmin('min_redeem_points')} 
          type="number" 
          value={settings['loyalty.min_redeem_points']} 
          onChange={value => updateSetting('loyalty.min_redeem_points', value)} 
        />
        <SettingInput 
          label={tAdmin('expires_after')} 
          type="number" 
          suffix={tAdmin('days')} 
          value={settings['loyalty.expiry_days']} 
          onChange={value => updateSetting('loyalty.expiry_days', value)} 
        />
      </div>
    </div>
  )
}
