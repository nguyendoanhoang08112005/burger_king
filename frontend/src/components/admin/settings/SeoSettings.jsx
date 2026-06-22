import React from 'react'
import {
  SettingInput, SettingTextarea
} from '../../../utils/adminUtils'

export default function SeoSettings({
  settings,
  updateSetting,
  updateTransSetting,
  getTransValue,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <SettingInput 
        label="Meta title" 
        value={getTransValue(settings['seo.meta_title'])} 
        onChange={value => updateTransSetting('seo.meta_title', value)} 
      />
      <SettingTextarea 
        label="Meta description" 
        value={getTransValue(settings['seo.meta_description'])} 
        onChange={value => updateTransSetting('seo.meta_description', value)} 
      />
      <SettingInput 
        label="Meta keywords" 
        value={getTransValue(settings['seo.meta_keywords'])} 
        onChange={value => updateTransSetting('seo.meta_keywords', value)} 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label="Google Analytics" 
          value={settings['seo.google_analytics']} 
          onChange={value => updateSetting('seo.google_analytics', value)} 
        />
        <SettingInput 
          label="Facebook Pixel" 
          value={settings['seo.facebook_pixel']} 
          onChange={value => updateSetting('seo.facebook_pixel', value)} 
        />
      </div>
      <SettingTextarea 
        label="robots.txt" 
        rows={5} 
        value={settings['seo.robots_txt']} 
        onChange={value => updateSetting('seo.robots_txt', value)} 
      />
    </div>
  )
}
