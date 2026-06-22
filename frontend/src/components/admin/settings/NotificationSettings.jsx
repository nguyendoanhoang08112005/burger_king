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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label={tAdmin('admin_email')} 
          value={settings['notification.admin_email']} 
          onChange={value => updateSetting('notification.admin_email', value)} 
        />
      </div>
    </div>
  )
}
