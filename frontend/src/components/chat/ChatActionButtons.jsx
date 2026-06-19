import React, { useState } from 'react'
import { Check, X, ShoppingBag, Eye, LogIn, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ChatActionButtons({ action, messageId, onAction, onConfirm }) {
  const { t } = useTranslation()
  const [decision, setDecision] = useState(() => {
    if (messageId) {
      return localStorage.getItem(`chat_decision_${messageId}`) || null
    }
    return null
  })

  if (!action) return null

  const handleConfirmClick = (confirmed) => {
    if (decision !== null) return // already decided
    const newDecision = confirmed ? 'yes' : 'no'
    setDecision(newDecision)
    if (messageId) {
      localStorage.setItem(`chat_decision_${messageId}`, newDecision)
    }
    if (onConfirm) {
      onConfirm(action.data, confirmed)
    }
  }

  if (action.type === 'confirm') {
    const data = action.data || {}
    const isCart = data.confirm_type === 'add_to_cart'
    const isCancel = data.confirm_type === 'cancel_order'

    return (
      <div className="mt-3 flex flex-col gap-2">
        {isCart && data.product && (
          <div className="text-xs bg-[#FFF5F5] border border-primary/10 rounded-lg p-2.5 text-primary mb-1 flex items-start gap-3">
            {data.product.thumbnail && (
              <img
                src={data.product.thumbnail}
                alt={data.product.name}
                className="w-14 h-14 object-cover rounded-lg bg-white border border-primary/5 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="font-bold">{t('chatbot.confirm_item', 'Thêm vào giỏ:')}</span> {data.product.name}
              {data.size && <span className="ml-1 px-1 bg-primary/10 rounded font-semibold text-[10px]">{data.size}</span>}
              {data.toppings && data.toppings.length > 0 && (
                <div className="mt-1 text-[11px] text-[#666]">
                  + Toppings: {data.toppings.map(tp => tp.name).join(', ')}
                </div>
              )}
              {data.quantity && <div className="mt-0.5 text-[11px] text-[#666]">{t('chatbot.qty', 'Số lượng:')} {data.quantity}</div>}
            </div>
          </div>
        )}

        {isCancel && data.order_code && (
          <div className="text-xs bg-[#FFF5F5] border border-primary/10 rounded-lg p-2.5 text-primary mb-1">
            <span className="font-bold">{t('chatbot.confirm_cancel', 'Hủy đơn hàng:')}</span> {data.order_code}
          </div>
        )}

        {decision === null ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleConfirmClick(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <Check className="w-4.5 h-4.5" />
              {t('chatbot.confirm_yes', 'Xác nhận')}
            </button>
            <button
              onClick={() => handleConfirmClick(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm rounded-xl transition-all active:scale-[0.98]"
            >
              <X className="w-4.5 h-4.5" />
              {t('chatbot.confirm_no', 'Thôi')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg w-fit">
            {decision === 'yes' ? (
              <span className="text-green-600 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                <Check className="w-4 h-4" /> {t('chatbot.confirmed', 'Đã xác nhận')}
              </span>
            ) : (
              <span className="text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                <X className="w-4 h-4" /> {t('chatbot.cancelled', 'Đã hủy thao tác')}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  // Handle other action buttons
  let buttonLabel = ''
  let Icon = ArrowRight

  switch (action.type) {
    case 'product':
      buttonLabel = t('chatbot.view_product', 'Xem sản phẩm 🍔')
      Icon = ShoppingBag
      break
    case 'order':
      buttonLabel = t('chatbot.view_order', 'Xem đơn hàng 📦')
      Icon = Eye
      break
    case 'login':
      buttonLabel = t('chatbot.login_now', 'Đăng nhập ngay 🔑')
      Icon = LogIn
      break
    case 'navigate':
      buttonLabel = t('chatbot.open_link', 'Mở liên kết 🌐')
      Icon = ArrowRight
      break
    default:
      return null
  }

  return (
    <button
      onClick={() => onAction && onAction(action)}
      className="mt-3 inline-flex items-center gap-2 py-2 px-4 bg-[#FFFAF5] hover:bg-primary/5 text-primary border border-primary/20 hover:border-primary font-bold text-xs rounded-xl shadow-premium transition-all duration-200 active:scale-[0.98]"
    >
      <Icon className="w-4.5 h-4.5 text-primary" />
      {buttonLabel}
    </button>
  )
}
