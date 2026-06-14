import React from 'react'
import { Bot, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useChat } from '../../hooks/useChat'
import ChatWindow from './ChatWindow'

export default function ChatWidget({ onSelectProduct }) {
  const { t } = useTranslation()
  const {
    messages,
    isLoading,
    initialized,
    isOpen,
    setIsOpen,
    sendMessage,
    clearChat,
    handleAction,
    handleConfirm
  } = useChat(onSelectProduct)

  return (
    <>
      {/* Floating launcher trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-gold group"
          title={t('chatbot.open_chat', 'Chat với trợ lý AI')}
        >
          <div className="relative">
            <Bot className="w-6.5 h-6.5 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
        </button>
      )}

      {/* Embedded Chat window panel */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        initialized={initialized}
        sendMessage={sendMessage}
        clearChat={clearChat}
        handleAction={handleAction}
        handleConfirm={handleConfirm}
      />
    </>
  )
}
