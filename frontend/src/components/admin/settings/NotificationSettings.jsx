import React from 'react'
import {
  SettingInput, SettingToggle
} from '../../../utils/adminUtils'

export default function NotificationSettings({
  settings,
  updateSetting,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <SettingToggle 
        label={tAdmin('email_order_created')} 
        checked={!!settings['notification.email_order_created']} 
        onChange={value => updateSetting('notification.email_order_created', value)} 
      />
      <SettingToggle 
        label={tAdmin('email_order_status')} 
        checked={!!settings['notification.email_order_status']} 
        onChange={value => updateSetting('notification.email_order_status', value)} 
      />
      <SettingToggle 
        label={tAdmin('email_new_user')} 
        checked={!!settings['notification.email_new_user']} 
        onChange={value => updateSetting('notification.email_new_user', value)} 
      />
      
      <hr className="border-gray-100 dark:border-gray-800 my-2" />
      <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">{tAdmin('bell_settings_section', { defaultValue: 'Cấu hình chuông thông báo' })}</div>
      
      <SettingToggle 
        label={tAdmin('bell_new_order')} 
        checked={settings['notification.bell_new_order'] !== false} 
        onChange={value => updateSetting('notification.bell_new_order', value)} 
      />
      <SettingToggle 
        label={tAdmin('bell_new_review')} 
        checked={settings['notification.bell_new_review'] !== false} 
        onChange={value => updateSetting('notification.bell_new_review', value)} 
      />
      <SettingToggle 
        label={tAdmin('bell_new_contact')} 
        checked={settings['notification.bell_new_contact'] !== false} 
        onChange={value => updateSetting('notification.bell_new_contact', value)} 
      />
      <SettingToggle 
        label={tAdmin('bell_new_newsletter')} 
        checked={settings['notification.bell_new_newsletter'] !== false} 
        onChange={value => updateSetting('notification.bell_new_newsletter', value)} 
      />
      <SettingToggle 
        label={tAdmin('bell_new_complaint')} 
        checked={settings['notification.bell_new_complaint'] !== false} 
        onChange={value => updateSetting('notification.bell_new_complaint', value)} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <SettingInput 
          label={tAdmin('admin_email')} 
          value={settings['notification.admin_email']} 
          onChange={value => updateSetting('notification.admin_email', value)} 
        />
      </div>
    </div>
  )
}
