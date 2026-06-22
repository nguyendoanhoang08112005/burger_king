import React from 'react'
import {
  SettingInput, SettingToggle
} from '../../../utils/adminUtils'

export default function ReviewComplaintSettings({
  settings,
  updateSetting,
  tAdmin
}) {
  return (
    <div className="space-y-5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label={tAdmin('review_expiry_days')} 
          type="number" 
          suffix={tAdmin('days')} 
          value={settings['review.expiry_days']} 
          onChange={value => updateSetting('review.expiry_days', value)} 
        />
        <SettingInput 
          label={tAdmin('complaint_expiry_hours')} 
          type="number" 
          suffix={tAdmin('hours_unit') || 'giờ'} 
          value={settings['complaint.expiry_hours']} 
          onChange={value => updateSetting('complaint.expiry_hours', value)} 
        />
        <SettingInput 
          label={tAdmin('review_bonus_points')} 
          type="number" 
          suffix={tAdmin('points_unit') || 'điểm'} 
          value={settings['review.bonus_points']} 
          onChange={value => updateSetting('review.bonus_points', value)} 
        />
        <SettingInput 
          label={tAdmin('complaint_notification_email')} 
          type="text" 
          value={settings['complaint.notification_email']} 
          onChange={value => updateSetting('complaint.notification_email', value)} 
        />
      </div>
      <SettingToggle 
        label={tAdmin('review_auto_approve_stars')} 
        checked={!!settings['review.auto_approve_stars']} 
        onChange={value => updateSetting('review.auto_approve_stars', value)} 
      />
      <SettingToggle 
        label={tAdmin('review_email_reminder')} 
        checked={!!settings['review.email_reminder']} 
        onChange={value => updateSetting('review.email_reminder', value)} 
      />
    </div>
  )
}
