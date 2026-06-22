import React from 'react'
import ChatActionButtons from './ChatActionButtons'

export default function ChatMessage({ message, onAction, onConfirm }) {
  const isUser = message.role === 'user'

  // Helper to format text (e.g., render bold text, bullets, newlines nicely)
  const formatMessageContent = (text) => {
    if (!text) return ''
    
    // Escape HTML first to prevent XSS
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Replace bold syntax **text** with strong tag
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Replace bullet points * text with list formatting
    formatted = formatted.replace(/^\*\s(.*)$/gm, '• $1')
    
    // Convert newlines to breaks
    formatted = formatted.replace(/\n/g, '<br />')

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  return (
    <div className={`flex w-full flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          {isUser ? '' : 'Hamburger King Assistant 🍔'}
        </span>
      </div>

      <div
        className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-premium text-[14px] leading-relaxed transition-all duration-200 ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-white border border-[#E8E8E8] text-[#1A1A1A] rounded-tl-none'
        }`}
      >
        <div className="whitespace-pre-wrap select-text font-medium">
          {formatMessageContent(message.content)}
        </div>

        {/* Action Buttons if any */}
        {!isUser && message.actions && (
          <ChatActionButtons
            action={message.actions}
            messageId={message.id}
            onAction={onAction}
            onConfirm={onConfirm}
          />
        )}
      </div>

      <span className={`text-[9px] text-gray-400 mt-1 px-1`}>
        {formatTime(message.created_at)}
      </span>
    </div>
  )
}
