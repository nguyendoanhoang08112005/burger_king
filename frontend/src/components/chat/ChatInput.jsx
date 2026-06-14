import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ChatInput({ onSend, isLoading, initialized }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!isLoading && initialized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading, initialized])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e)
    }
  }

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#E8E8E8] bg-white p-3.5">
      <div className="relative flex-1">
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chatbot.input_placeholder', 'Nhập tin nhắn... Hỏi về thực đơn, ưu đãi...')}
          maxLength={1000}
          disabled={isLoading}
          className="w-full resize-none bg-[#F8F8F8] text-[#1A1A1A] text-sm font-semibold rounded-2xl py-2.5 pl-3.5 pr-10 border border-transparent focus:border-primary/20 focus:bg-white focus:outline-none placeholder:text-gray-400 placeholder:font-medium transition-all"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-primary/30">
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        className={`flex items-center justify-center w-10.5 h-10.5 rounded-full shadow-md transition-all active:scale-95 ${
          text.trim() && !isLoading
            ? 'bg-primary text-white hover:bg-primary/95 hover:shadow-premium'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        <Send className="w-4.5 h-4.5" />
      </button>
    </form>
  )
}
