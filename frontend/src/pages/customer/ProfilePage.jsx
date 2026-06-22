import React, { useState, Suspense, lazy, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  Gift, 
  Bell, 
  Heart 
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import apiClient from '../../api/axios'
import { formatDate } from '../../utils/format'
import { assetUrl } from '../../utils/adminUtils'

// Lazy loaded sub-panels
const ProfileInfo = lazy(() => import('../../components/profile/ProfileInfo'))
const ProfileOrders = lazy(() => import('../../components/profile/ProfileOrders'))
const ProfileAddresses = lazy(() => import('../../components/profile/ProfileAddresses'))
const ProfileLoyalty = lazy(() => import('../../components/profile/ProfileLoyalty'))
const ProfileNotifications = lazy(() => import('../../components/profile/ProfileNotifications'))
const ProfileWishlist = lazy(() => import('../../components/profile/ProfileWishlist'))

export default function ProfilePage({ onSelectProduct }) {
  const { t } = useTranslation()
  const { user, updateUser, setLogout } = useAuthStore()
  const { showToast } = useUiStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const activeTab = searchParams.get('tab') || 'info'

  // Personal Info Form States
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)

  // Avatar Upload States & Logic
  const fileInputRef = useRef(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarUrl = user?.avatar ? assetUrl(user.avatar) : ''

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        if (res.data.user) {
          updateUser(res.data.user)
        }
        showToast(res.data.message || t('profile.avatar_upload_success'))
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('profile.avatar_upload_error'), 'error')
      })
      .finally(() => {
        setAvatarUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      })
  }
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    setProfileSaving(true)

    apiClient.put('/profile', { name, phone })
      .then(res => {
        updateUser(res.data.user || { name, phone })
        showToast(res.data.message || t('profile.update_success'))
      })
      .catch(error => {
        showToast(error.response?.data?.message || t('profile.update_error'), 'error')
      })
      .finally(() => setProfileSaving(false))
  }

  const handleChangePassword = (e) => {
    e.preventDefault()

    if (passwordForm.password !== passwordForm.password_confirmation) {
      showToast(t('auth.password_confirmation_mismatch'), 'error')
      return
    }

    setPasswordSaving(true)
    apiClient.put('/profile/password', passwordForm)
      .then(res => {
        showToast(res.data.message || t('profile.password_changed'))
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: '',
        })
        setShowPasswordForm(false)
      })
      .catch(error => {
        const errors = error.response?.data?.errors
        const firstError = errors ? Object.values(errors).flat()[0] : null
        showToast(firstError || error.response?.data?.message || t('profile.password_change_error'), 'error')
      })
      .finally(() => setPasswordSaving(false))
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#FFFAF5] text-[#1A1A1A] flex flex-col md:flex-row gap-8">
      {/* Side Tabs */}
      <aside className="w-full md:w-64 md:self-start md:sticky md:top-28 shrink-0 p-6 rounded-2xl bg-white border border-[#E8E8E8] flex flex-col shadow-glass">
        <div className="space-y-2">
          {[
            { id: 'info', name: t('profile.personal_info'), icon: <UserIcon className="w-4 h-4" /> },
            { id: 'orders', name: t('profile.order_history'), icon: <Package className="w-4 h-4" /> },
            { id: 'addresses', name: t('profile.address_book'), icon: <MapPin className="w-4 h-4" /> },
            { id: 'loyalty', name: t('profile.loyalty_history'), icon: <Gift className="w-4 h-4" /> },
            { id: 'notifications', name: t('profile.notifications').toUpperCase(), icon: <Bell className="w-4 h-4" /> },
            { id: 'wishlist', name: t('profile.wishlist_title'), icon: <Heart className="w-4 h-4" /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setSearchParams({ tab: tab.id })
              }}
              className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-[10px] border transition flex items-center gap-3 ${
                activeTab === tab.id 
                  ? 'bg-primary/10 border-primary text-primary font-bold' 
                  : 'bg-[#F8F8F8] border-[#E8E8E8] text-gray-500 hover:border-gray-400'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => {
            setLogout()
            navigate('/')
          }}
          className="mt-8 w-full bg-primary/10 border border-primary/20 text-primary font-heading py-2.5 rounded-[8px] text-xs tracking-wider uppercase hover:bg-primary/20 transition"
        >
          {t('nav.logout').toUpperCase()}
        </button>
      </aside>

      {/* Tab Panels */}
      <main className="flex-1 p-6 rounded-2xl bg-white border border-[#E8E8E8] min-h-[50vh] shadow-glass">
        <Suspense fallback={<div className="text-center py-10 text-xs text-gray-400">{t('common.loading') || 'Loading...'}</div>}>
          {activeTab === 'info' && (
            <ProfileInfo
              user={user}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              profileSaving={profileSaving}
              showPasswordForm={showPasswordForm}
              setShowPasswordForm={setShowPasswordForm}
              passwordSaving={passwordSaving}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              handleUpdateProfile={handleUpdateProfile}
              handleChangePassword={handleChangePassword}
              formatDate={formatDate}
              t={t}
              avatarUrl={avatarUrl}
              avatarUploading={avatarUploading}
              handleAvatarChange={handleAvatarChange}
              fileInputRef={fileInputRef}
            />
          )}

          {activeTab === 'orders' && <ProfileOrders />}

          {activeTab === 'addresses' && <ProfileAddresses />}

          {activeTab === 'loyalty' && <ProfileLoyalty />}

          {activeTab === 'notifications' && <ProfileNotifications />}

          {activeTab === 'wishlist' && <ProfileWishlist onSelectProduct={onSelectProduct} />}
        </Suspense>
      </main>
    </div>
  )
}
