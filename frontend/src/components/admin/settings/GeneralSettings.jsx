import React from 'react'
import {
  SettingInput, SettingTextarea, SettingSelect, AdminImageInput
} from '../../../utils/adminUtils'
import { SettingToggle } from '../../../utils/adminUtils'

export default function GeneralSettings({
  settings,
  updateSetting,
  updateTransSetting,
  getTransValue,
  selectedBranchId,
  handleBranchChange,
  branchOptions,
  branches,
  selectedBranch,
  selectedBranchAddress,
  tAdmin
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInput 
          label={tAdmin('store_name')} 
          value={getTransValue(settings['general.store_name'])} 
          onChange={value => updateTransSetting('general.store_name', value)} 
        />
        <SettingInput 
          label={tAdmin('slogan')} 
          value={getTransValue(settings['general.store_tagline'])} 
          onChange={value => updateTransSetting('general.store_tagline', value)} 
        />
        <SettingInput 
          label={tAdmin('hotline')} 
          value={settings['general.hotline']} 
          onChange={value => updateSetting('general.hotline', value)} 
        />
        <SettingInput 
          label={tAdmin('support_email')} 
          value={settings['general.email']} 
          onChange={value => updateSetting('general.email', value)} 
        />
      </div>
      <SettingTextarea 
        label={tAdmin('store_description')} 
        value={getTransValue(settings['general.store_description'])} 
        onChange={value => updateTransSetting('general.store_description', value)} 
      />
      <SettingSelect
        label={tAdmin('address')}
        value={selectedBranchId}
        onChange={handleBranchChange}
        options={branchOptions}
        disabled={!branches.length}
        hint={selectedBranch ? `${tAdmin('branch_address_source')}: ${selectedBranchAddress}` : tAdmin('select_branch_hint')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminImageInput
          label={tAdmin('logo')}
          value={settings['general.logo']}
          uploadType="logo"
          width={settings['general.logo_width'] ?? 260}
          height={settings['general.logo_height'] ?? 64}
          onChange={value => updateSetting('general.logo', value)}
          onWidthChange={value => updateSetting('general.logo_width', value)}
          onHeightChange={value => updateSetting('general.logo_height', value)}
        />
        <AdminImageInput
          label={tAdmin('favicon')}
          value={settings['general.favicon']}
          uploadType="favicon"
          width={settings['general.favicon_width'] ?? 56}
          height={settings['general.favicon_height'] ?? 56}
          onChange={value => updateSetting('general.favicon', value)}
          onWidthChange={value => updateSetting('general.favicon_width', value)}
          onHeightChange={value => updateSetting('general.favicon_height', value)}
        />
        <AdminImageInput
          label={tAdmin('admin_logo') || 'Admin Logo'}
          value={settings['general.admin_logo']}
          uploadType="admin_logo"
          width={settings['general.admin_logo_width'] ?? 260}
          height={settings['general.admin_logo_height'] ?? 64}
          onChange={value => updateSetting('general.admin_logo', value)}
          onWidthChange={value => updateSetting('general.admin_logo_width', value)}
          onHeightChange={value => updateSetting('general.admin_logo_height', value)}
        />
        <AdminImageInput
          label={tAdmin('admin_favicon') || 'Admin Favicon'}
          value={settings['general.admin_favicon']}
          uploadType="admin_favicon"
          width={settings['general.admin_favicon_width'] ?? 56}
          height={settings['general.admin_favicon_height'] ?? 56}
          onChange={value => updateSetting('general.admin_favicon', value)}
          onWidthChange={value => updateSetting('general.admin_favicon_width', value)}
          onHeightChange={value => updateSetting('general.admin_favicon_height', value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'zalo_url', 'google_maps_key'].map(key => (
          <SettingInput 
            key={key} 
            label={key.replaceAll('_', ' ')} 
            value={settings[`general.${key}`]} 
            onChange={value => updateSetting(`general.${key}`, value)} 
          />
        ))}
      </div>
      <SettingToggle 
        label={tAdmin('maintenance_mode')} 
        description={tAdmin('maintenance_desc')} 
        checked={!!settings['general.maintenance_mode']} 
        onChange={value => updateSetting('general.maintenance_mode', value)} 
      />
      <SettingTextarea 
        label={tAdmin('maintenance_message')} 
        value={getTransValue(settings['general.maintenance_message'])} 
        onChange={value => updateTransSetting('general.maintenance_message', value)} 
      />
    </div>
  )
}
