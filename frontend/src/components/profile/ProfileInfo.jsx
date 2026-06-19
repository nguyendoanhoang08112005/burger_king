import React from 'react'
import { CheckCircle } from 'lucide-react'

export default function ProfileInfo({
  user,
  name,
  setName,
  phone,
  setPhone,
  profileSaving,
  showPasswordForm,
  setShowPasswordForm,
  passwordSaving,
  passwordForm,
  setPasswordForm,
  handleUpdateProfile,
  handleChangePassword,
  formatDate,
  t,
  avatarUrl,
  avatarUploading,
  handleAvatarChange,
  fileInputRef
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-bold text-xl text-[#2C1A16] uppercase tracking-[0.3px] border-b border-[#E8E8E8] pb-3">{t('profile.personal_info')}</h2>
      
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white border border-[#E8E8E8] shadow-sm">
        <div className="relative group flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-premium" 
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-white shadow-premium flex items-center justify-center text-primary text-3xl font-bold uppercase">
              {(name || 'A').charAt(0)}
            </div>
          )}
          {avatarUploading && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
              {t('profile.avatar_uploading')}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="font-bold text-base text-[#2C1A16]">{t('profile.avatar')}</h3>
          <p className="text-xs text-gray-400 max-w-xs">{t('common.image_format_hint') || 'Support JPG, PNG, WebP, GIF. Max 2MB.'}</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <button
              type="button"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-[8px] text-xs transition cursor-pointer"
            >
              {(avatarUploading ? t('profile.avatar_uploading') : t('profile.avatar_upload')).toUpperCase()}
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-left">
        <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.customer_id')}</p>
          <p className="mt-2 text-sm font-bold text-[#1A1A1A]">#{user.id}</p>
        </div>
        <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.account_role')}</p>
          <p className="mt-2 text-sm font-bold text-[#1A1A1A] capitalize">{user.role || t('profile.customer_role')}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t('profile.account_status')}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            {t('profile.active_account')}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('profile.member_since')}</p>
          <p className="mt-2 text-sm font-bold text-[#1A1A1A]">{user.created_at ? formatDate(user.created_at) : '-'}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.name')}</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.login_email')}</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('auth.phone')}</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] uppercase">{t('auth.password')}</label>
              <button
                type="button"
                onClick={() => setShowPasswordForm(current => !current)}
                className="text-[10px] font-bold uppercase tracking-wider text-primary transition hover:opacity-70"
              >
                {showPasswordForm ? t('profile.cancel_password_change') : t('profile.change_password')}
              </button>
            </div>
            <input
              type="password"
              value="********"
              disabled
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="border-t border-[#E8E8E8] pt-5">
          <button 
            type="submit"
            disabled={profileSaving}
            className="w-full sm:w-auto bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
          >
            {(profileSaving ? t('profile.saving') : t('profile.update_info')).toUpperCase()}
          </button>
        </div>
      </form>

      {showPasswordForm && (
        <form onSubmit={handleChangePassword} className="max-w-3xl rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-4 space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.3px] text-[#1A1A1A]">{t('profile.change_password')}</h3>
            <p className="mt-1 text-xs text-gray-400">{t('profile.password_security')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.current_password')}</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={event => setPasswordForm(current => ({ ...current, current_password: event.target.value }))}
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.new_password')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.password}
                onChange={event => setPasswordForm(current => ({ ...current, password: event.target.value }))}
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('profile.confirm_new_password')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.password_confirmation}
                onChange={event => setPasswordForm(current => ({ ...current, password_confirmation: event.target.value }))}
                className="w-full bg-white border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-primary hover:opacity-90 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-[8px] text-xs tracking-wider transition"
            >
              {(passwordSaving ? t('profile.saving') : t('profile.save_password')).toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordForm(false)}
              className="border border-[#E8E8E8] bg-white px-8 py-3 rounded-[8px] text-xs font-semibold tracking-wider text-gray-500 transition hover:border-gray-400"
            >
              {t('common.cancel').toUpperCase()}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
