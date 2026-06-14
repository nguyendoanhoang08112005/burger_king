import React, { useEffect, useRef } from 'react'
import { X, Trash2, Bot, Sparkles, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  isLoading,
  initialized,
  sendMessage,
  clearChat,
  handleAction,
  handleConfirm
}) {
  const { t } = useTranslation()
  const messagesEndRef = useRef(null)

  const quickSuggestions = [
    { text: t('chatbot.suggest_promo', 'Hôm nay có khuyến mãi gì? 🎁'), query: 'Hôm nay có khuyến mãi gì?' },
    { text: t('chatbot.suggest_menu', 'Menu hamburger có những gì? 🍔'), query: 'Menu hamburger có những gì?' },
    { text: t('chatbot.suggest_order', 'Kiểm tra đơn hàng của tôi 📦'), query: 'Kiểm tra đơn hàng của tôi' },
    { text: t('chatbot.suggest_branches', 'Tìm chi nhánh gần nhất 📍'), query: 'Tìm chi nhánh gần nhất' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isLoading, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col w-[380px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-120px)] bg-white rounded-3xl border border-[#E8E8E8] shadow-premium overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-primary text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Bot className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-wide flex items-center gap-1">
              {t('chatbot.assistant_title', 'Trợ Lý AI Burger King')}
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
            </h3>
            <p className="text-[10px] text-white/80 font-medium">
              {t('chatbot.assistant_subtitle', 'Tự động phản hồi 24/7')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title={t('chatbot.clear_history', 'Xóa lịch sử')}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#FFFAF5] scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h4 className="font-extrabold text-sm text-[#1A1A1A]">
              {t('chatbot.welcome_title', 'Xin chào! Tôi có thể giúp gì cho bạn?')}
            </h4>
            <p className="text-xs text-gray-500 font-medium max-w-[240px] mt-1 mb-6">
              {t('chatbot.welcome_desc', 'Hỏi tôi về thực đơn, ưu đãi, kiểm tra hoặc hủy đơn hàng của bạn.')}
            </p>

            <div className="w-full flex flex-col gap-2">
              {quickSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  disabled={isLoading || !initialized}
                  onClick={() => sendMessage(item.query)}
                  className="w-full text-left text-xs font-semibold py-2.5 px-4 bg-white border border-[#E8E8E8] hover:border-primary/30 hover:bg-primary/5 text-gray-700 hover:text-primary rounded-2xl shadow-premium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onAction={handleAction}
                onConfirm={handleConfirm}
              />
            ))}
            {isLoading && (
              <div className="flex w-full justify-start mb-4">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} initialized={initialized} />
    </div>
  )
}
