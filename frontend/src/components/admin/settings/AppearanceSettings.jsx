import React from 'react'
import {
  SettingInput, SettingSelect
} from '../../../utils/adminUtils'

export default function AppearanceSettings({
  settings,
  updateSetting,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SettingInput 
          label={tAdmin('primary_color')} 
          type="color" 
          value={settings['appearance.primary_color']} 
          onChange={value => updateSetting('appearance.primary_color', value)} 
        />
        <SettingInput 
          label={tAdmin('secondary_color')} 
          type="color" 
          value={settings['appearance.secondary_color']} 
          onChange={value => updateSetting('appearance.secondary_color', value)} 
        />
        <SettingSelect 
          label={tAdmin('font')} 
          value={settings['appearance.font_family']} 
          onChange={value => updateSetting('appearance.font_family', value)} 
          options={[
            { value: 'DM Sans', label: 'DM Sans' }, 
            { value: 'Inter', label: 'Inter' }, 
            { value: 'Arial', label: 'Arial' }
          ]} 
        />
      </div>
    </div>
  )
}
