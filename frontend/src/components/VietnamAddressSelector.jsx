/* eslint-disable */
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useUiStore } from '../store/uiStore'

const cleanAddressPart = (text) => {
  if (!text) return ''
  let s = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]/g, '')      // keep only letters and numbers
  // Remove common prefixes
  s = s.replace(/^thanhpho|^tinh|^quan|^huyen|^thixa|^phuong|^xa|^thitran|^tp|^q|^p/g, '')
  return s
}

const isMatch = (apiName, inputName) => {
  const normApi = cleanAddressPart(apiName)
  const normInput = cleanAddressPart(inputName)
  if (!normApi || !normInput) return false

  // Exact match is always preferred and accurate
  if (normApi === normInput) return true

  // Avoid using startsWith/includes on numeric values (e.g. "1" matches "12")
  const isNumeric = /^\d+$/.test(normApi) || /^\d+$/.test(normInput)
  if (isNumeric) return false

  // For non-numeric text, fallback to substring matching if values are long enough
  if (normApi.length >= 3 && normInput.length >= 3) {
    return normApi.includes(normInput) || normInput.includes(normApi)
  }

  return false
}

export default function VietnamAddressSelector({
  province = '',
  district = '',
  ward = '',
  street = '',
  onChange,
  required = false,
  asGridContainer = false,
  inputClass = '',
  labelClass = '',
  theme = 'storefront'
}) {
  const { t } = useTranslation()

  // Theme styling defaults
  const defaultInputClass = theme === 'admin'
    ? 'w-full border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60'
    : 'w-full bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] py-[14px] px-[16px] text-sm text-[#1A1A1A] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all duration-200'

  const defaultLabelClass = theme === 'admin'
    ? 'text-xs font-semibold text-gray-500 uppercase tracking-wide'
    : 'block text-[12px] font-semibold tracking-[0.5px] text-[#888888] mb-2 uppercase'

  const resolvedInputClass = inputClass || defaultInputClass
  const resolvedLabelClass = labelClass || defaultLabelClass

  // Component states
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [provinceCode, setProvinceCode] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [wardCode, setWardCode] = useState('')

  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  const defaultToVietnam = useUiStore(state => state.publicSettings?.['localization.default_to_vietnam'] !== false)
  const [manualMode, setManualMode] = useState(!defaultToVietnam)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    setManualMode(!defaultToVietnam)
  }, [defaultToVietnam])

  // Track values to avoid cyclic updates
  const lastPropsRef = useRef({ province, district, ward })

  // Fetch all provinces on mount
  useEffect(() => {
    let ignore = false
    setLoadingProvinces(true)
    setApiError(false)

    axios.get('https://provinces.open-api.vn/api/p/')
      .then(res => {
        if (!ignore) {
          setProvinces(res.data || [])
        }
      })
      .catch(err => {
        console.error('Failed to fetch Vietnam provinces:', err)
        if (!ignore) {
          setApiError(true)
          setManualMode(true) // fall back to manual text input
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingProvinces(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  // Resolve Province code when `province` prop changes or provinces list loads
  useEffect(() => {
    if (manualMode || provinces.length === 0) return

    const match = provinces.find(p => isMatch(p.name, province))
    if (match) {
      if (provinceCode !== String(match.code)) {
        setProvinceCode(String(match.code))
        setDistricts([])
        setWards([])
        setDistrictCode('')
        setWardCode('')
      }
    } else if (!province) {
      setProvinceCode('')
      setDistricts([])
      setWards([])
      setDistrictCode('')
      setWardCode('')
    }
  }, [province, provinces, manualMode])

  // Fetch districts when provinceCode changes
  useEffect(() => {
    if (manualMode || !provinceCode) return

    let ignore = false
    setLoadingDistricts(true)
    axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then(res => {
        if (!ignore) {
          setDistricts(res.data?.districts || [])
        }
      })
      .catch(err => {
        console.error('Failed to fetch districts:', err)
        if (!ignore) {
          setApiError(true)
          setManualMode(true)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingDistricts(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [provinceCode, manualMode])

  // Resolve District code when `district` prop changes or districts list loads
  useEffect(() => {
    if (manualMode || districts.length === 0) return

    const match = districts.find(d => isMatch(d.name, district))
    if (match) {
      if (districtCode !== String(match.code)) {
        setDistrictCode(String(match.code))
        setWards([])
        setWardCode('')
      }
    } else if (!district) {
      setDistrictCode('')
      setWards([])
      setWardCode('')
    }
  }, [district, districts, manualMode])

  // Fetch wards when districtCode changes
  useEffect(() => {
    if (manualMode || !districtCode) return

    let ignore = false
    setLoadingWards(true)
    axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then(res => {
        if (!ignore) {
          setWards(res.data?.wards || [])
        }
      })
      .catch(err => {
        console.error('Failed to fetch wards:', err)
        if (!ignore) {
          setApiError(true)
          setManualMode(true)
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingWards(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [districtCode, manualMode])

  // Resolve Ward code when `ward` prop changes or wards list loads
  useEffect(() => {
    if (manualMode || wards.length === 0) return

    const match = wards.find(w => isMatch(w.name, ward))
    if (match) {
      if (wardCode !== String(match.code)) {
        setWardCode(String(match.code))
      }
    } else if (!ward) {
      setWardCode('')
    }
  }, [ward, wards, manualMode])

  // Handle dropdown changes
  const handleProvinceSelect = (e) => {
    const code = e.target.value
    setProvinceCode(code)
    setDistrictCode('')
    setWardCode('')
    setDistricts([])
    setWards([])

    const selectedProv = provinces.find(p => String(p.code) === code)
    const newProvinceName = selectedProv ? selectedProv.name : ''
    onChange({
      province: newProvinceName,
      district: '',
      ward: '',
      street
    })
  }

  const handleDistrictSelect = (e) => {
    const code = e.target.value
    setDistrictCode(code)
    setWardCode('')
    setWards([])

    const selectedDist = districts.find(d => String(d.code) === code)
    const newDistrictName = selectedDist ? selectedDist.name : ''
    onChange({
      province,
      district: newDistrictName,
      ward: '',
      street
    })
  }

  const handleWardSelect = (e) => {
    const code = e.target.value
    setWardCode(code)

    const selectedW = wards.find(w => String(w.code) === code)
    const newWardName = selectedW ? selectedW.name : ''
    onChange({
      province,
      district,
      ward: newWardName,
      street
    })
  }

  const handleStreetChange = (e) => {
    onChange({
      province,
      district,
      ward,
      street: e.target.value
    })
  }

  // Toggle manual inputs
  const toggleManualMode = () => {
    setManualMode(prev => !prev)
  }

  // Render dropdowns or text inputs depending on manualMode
  const renderSelectorFields = () => {
    if (manualMode) {
      return (
        <>
          <div>
            <label className={resolvedLabelClass}>{t('checkout.province')}</label>
            <input
              type="text"
              required={required}
              placeholder={t('address.province_placeholder', { defaultValue: 'Tỉnh / thành phố' })}
              value={province}
              onChange={(e) => onChange({ province: e.target.value, district, ward, street })}
              className={resolvedInputClass}
            />
          </div>
          <div>
            <label className={resolvedLabelClass}>{t('checkout.district')}</label>
            <input
              type="text"
              required={required}
              placeholder={t('address.district_placeholder', { defaultValue: 'Quận / Huyện' })}
              value={district}
              onChange={(e) => onChange({ province, district: e.target.value, ward, street })}
              className={resolvedInputClass}
            />
          </div>
          <div>
            <label className={resolvedLabelClass}>{t('checkout.ward')}</label>
            <input
              type="text"
              required={required}
              placeholder={t('address.ward_placeholder', { defaultValue: 'Phường / Xã' })}
              value={ward}
              onChange={(e) => onChange({ province, district, ward: e.target.value, street })}
              className={resolvedInputClass}
            />
          </div>
        </>
      )
    }

    return (
      <>
        {/* Province Select */}
        <div>
          <label className={resolvedLabelClass}>
            {t('checkout.province')} {loadingProvinces && <span className="text-xs text-gray-400">({t('common.loading', { defaultValue: 'Đang tải...' })})</span>}
          </label>
          <select
            required={required}
            value={provinceCode}
            onChange={handleProvinceSelect}
            className={resolvedInputClass}
          >
            <option value="">{t('address.select_province', { defaultValue: 'Chọn Tỉnh / Thành phố' })}</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div>
          <label className={resolvedLabelClass}>
            {t('checkout.district')} {loadingDistricts && <span className="text-xs text-gray-400">({t('common.loading', { defaultValue: 'Đang tải...' })})</span>}
          </label>
          <select
            required={required}
            disabled={!provinceCode}
            value={districtCode}
            onChange={handleDistrictSelect}
            className={resolvedInputClass}
          >
            <option value="">{t('address.select_district', { defaultValue: 'Chọn Quận / Huyện' })}</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Ward Select */}
        <div>
          <label className={resolvedLabelClass}>
            {t('checkout.ward')} {loadingWards && <span className="text-xs text-gray-400">({t('common.loading', { defaultValue: 'Đang tải...' })})</span>}
          </label>
          <select
            required={required}
            disabled={!districtCode}
            value={wardCode}
            onChange={handleWardSelect}
            className={resolvedInputClass}
          >
            <option value="">{t('address.select_ward', { defaultValue: 'Chọn Phường / Xã' })}</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
      </>
    )
  }

  const content = (
    <>
      {renderSelectorFields()}

      {/* Street Input */}
      <div className={asGridContainer ? 'sm:col-span-2' : 'sm:col-span-2'}>
        <label className={resolvedLabelClass}>{t('checkout.street')}</label>
        <input
          type="text"
          required={required}
          placeholder={t('address.street_placeholder', { defaultValue: 'Số nhà, tên đường' })}
          value={street}
          onChange={handleStreetChange}
          className={resolvedInputClass}
        />
      </div>

      {/* Toggle Manual input fallback */}
      {defaultToVietnam && (
        <div className="sm:col-span-2 flex justify-end text-xs">
          <button
            type="button"
            onClick={toggleManualMode}
            className="text-[#D62300] hover:underline focus:outline-none cursor-pointer"
          >
            {manualMode
              ? (apiError ? t('address.api_error_fallback', { defaultValue: 'Hệ thống tự nhập (API lỗi)' }) : t('address.use_dropdowns', { defaultValue: 'Sử dụng danh sách chọn' }))
              : t('address.enter_manually', { defaultValue: 'Tự nhập địa chỉ / Nhập tay' })}
          </button>
        </div>
      )}
    </>
  )

  if (asGridContainer) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {content}
      </div>
    )
  }

  return content
}
