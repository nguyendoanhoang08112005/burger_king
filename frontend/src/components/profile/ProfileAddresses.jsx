import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '../../api/axios'
import { useUiStore } from '../../store/uiStore'
import VietnamAddressSelector from '../VietnamAddressSelector'

export default function ProfileAddresses() {
  const { t } = useTranslation()
  const { showToast } = useUiStore()

  const emptyAddress = useCallback(() => ({
    label: '',
    recipient_name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    is_default: false
  }), [])

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [newAddress, setNewAddress] = useState(() => emptyAddress())
  const [page, setPage] = useState(1)

  const loadAddresses = useCallback(() => {
    setLoading(true)
    apiClient.get('/addresses')
      .then(res => {
        setAddresses(res.data)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  const resetAddressForm = useCallback(() => {
    setEditingAddressId(null)
    setNewAddress(emptyAddress())
  }, [emptyAddress])

  const openCreateAddressForm = () => {
    resetAddressForm()
    setShowAddressForm(true)
  }

  const openEditAddressForm = (address) => {
    setEditingAddressId(address.id)
    setNewAddress({
      label: address.label || '',
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      province: address.province || '',
      district: address.district || '',
      ward: address.ward || '',
      street: address.street || '',
      is_default: Boolean(address.is_default)
    })
    setShowAddressForm(true)
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    
    // Gán nhãn mặc định Nhà riêng nếu để trống
    const payload = {
      ...newAddress,
      label: newAddress.label.trim() ? newAddress.label : t('address.home_label', 'Nhà riêng')
    }

    const request = editingAddressId
      ? apiClient.put(`/addresses/${editingAddressId}`, payload)
      : apiClient.post('/addresses', payload)

    request
      .then(res => {
        setAddresses(current => (
          editingAddressId
            ? current.map(address => address.id === editingAddressId ? res.data : { ...address, is_default: res.data.is_default ? false : address.is_default })
            : [res.data, ...current.map(address => ({ ...address, is_default: res.data.is_default ? false : address.is_default }))]
        ))
        setShowAddressForm(false)
        resetAddressForm()
        showToast(t(editingAddressId ? 'profile.address_updated' : 'profile.address_created', editingAddressId ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công'))
      }).catch(err => {
        console.error(err)
        showToast(t('profile.address_save_error', 'Không thể lưu địa chỉ, vui lòng thử lại'), 'error')
      })
  }

  const handleDeleteAddress = (event, id) => {
    event.stopPropagation()
    if (window.confirm(t('profile.address_delete_confirm'))) {
      apiClient.delete(`/addresses/${id}`)
        .then(() => {
          setAddresses(addresses.filter(a => a.id !== id))
          if (editingAddressId === id) {
            setShowAddressForm(false)
            resetAddressForm()
          }
          showToast(t('profile.address_deleted'))
        })
    }
  }

  // Pagination
  const pageSize = 4
  const totalPages = Math.ceil(addresses.length / pageSize)
  const paginatedAddresses = addresses.slice((page - 1) * pageSize, page * pageSize)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const goToPage = (nextPage) => {
      setPage(Math.min(Math.max(1, nextPage), totalPages))
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => start + index).filter(pageNumber => pageNumber <= totalPages)

    return (
      <div className="flex justify-end border-t border-[#E8E8E8] pt-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map(pageNumber => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goToPage(pageNumber)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                pageNumber === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-[#F5F5F5]'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('common.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-[#E8E8E8] pb-3">
        <h2 className="font-bold text-xl text-[#1A1A1A] uppercase tracking-[0.3px]">{t('profile.address_book')}</h2>
        <button 
          onClick={() => {
            if (showAddressForm && !editingAddressId) {
              setShowAddressForm(false)
            } else {
              openCreateAddressForm()
            }
          }}
          className="bg-primary text-white font-semibold px-4 py-2 rounded-[8px] text-xs tracking-wider hover:opacity-90 transition hover:-translate-y-[1px]"
        >
          {t('profile.add_address').toUpperCase()}
        </button>
      </div>

      {/* Address Form */}
      {showAddressForm && (
        <form onSubmit={handleSaveAddress} className="p-5 rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#1A1A1A]">
              {editingAddressId ? t('profile.edit_address', 'Chỉnh sửa địa chỉ') : t('profile.add_address', 'Thêm địa chỉ mới')}
            </h3>
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.label', 'Tên gợi nhớ (VD: Nhà riêng, Văn phòng)')}</label>
            <input 
              type="text" 
              required
              value={newAddress.label}
              placeholder={t('address.home_label', 'Nhà riêng')}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('checkout.recipient_name', 'Tên người nhận')}</label>
            <input 
              type="text" 
              required
              value={newAddress.recipient_name}
              placeholder={t('address.recipient_placeholder', 'Nguyễn Văn A')}
              onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase">{t('address.delivery_phone', 'Số điện thoại nhận hàng')}</label>
            <input 
              type="tel" 
              required
              value={newAddress.phone}
              placeholder={t('address.phone_placeholder', '0901234567')}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
              className="w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
          <VietnamAddressSelector
            province={newAddress.province}
            district={newAddress.district}
            ward={newAddress.ward}
            street={newAddress.street}
            onChange={({ province, district, ward, street }) =>
              setNewAddress({ ...newAddress, province, district, ward, street })
            }
            required={true}
            theme="storefront"
          />

          <div className="sm:col-span-2 flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={newAddress.is_default}
              onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-[#E8E8E8]"
            />
            <span className="text-xs text-gray-500">{t('address.set_default', 'Đặt làm địa chỉ giao hàng mặc định')}</span>
          </div>

          <div className="sm:col-span-2 flex gap-2">
            <button 
              type="button" 
              onClick={() => {
                setShowAddressForm(false)
                resetAddressForm()
              }}
              className="bg-white hover:bg-[#F5F5F5] border border-[#E8E8E8] text-[#1A1A1A] font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition"
            >
              {t('common.cancel').toUpperCase()}
            </button>
            <button 
              type="submit" 
              className="bg-primary hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-[8px] text-xs tracking-wider transition hover:-translate-y-[1px]"
            >
              {t(editingAddressId ? 'profile.update_address' : 'profile.save_address').toUpperCase()}
            </button>
          </div>
        </form>
      )}

      {/* List addresses */}
      {loading ? (
        <div className="text-center py-6 text-xs text-gray-500">{t('common.loading') || 'Loading...'}</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8E8E8] bg-[#F8F8F8] px-5 py-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-xs font-semibold text-gray-500">{t('profile.no_addresses')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedAddresses.map((addr) => (
            <div
              key={addr.id}
              role="button"
              tabIndex={0}
              onClick={() => openEditAddressForm(addr)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openEditAddressForm(addr)
                }
              }}
              className={`p-4 rounded-xl border bg-white flex flex-col justify-between shadow-glass cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-premium ${
                editingAddressId === addr.id ? 'border-primary/60 bg-primary/5' : 'border-[#E8E8E8]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-wider text-primary">{addr.label}</span>
                  {addr.is_default && <span className="text-[10px] bg-[#FFC72C] text-[#1A1A1A] px-2 py-0.5 rounded-[8px] font-bold uppercase">{t('common.default')}</span>}
                </div>
                <p className="text-xs font-semibold text-[#1A1A1A] mt-3">{addr.recipient_name} - {addr.phone}</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8E8E8] flex justify-end">
                <button 
                  type="button"
                  onClick={(event) => handleDeleteAddress(event, addr.id)}
                  className="rounded-[8px] border border-primary/15 bg-primary/5 p-2 text-primary transition hover:bg-primary hover:text-white"
                  aria-label={t('profile.delete_address')}
                  title={t('profile.delete_address')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {renderPagination()}
    </div>
  )
}
