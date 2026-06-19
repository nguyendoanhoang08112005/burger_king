import { useState, useEffect } from 'react'
import apiClient from '../api/axios'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export const useChat = (onSelectProduct) => {
  const { i18n, t } = useTranslation()
  const { addItem } = useCartStore()
  const { setCartDrawerOpen } = useUiStore()

  const [sessionId, setSessionId] = useState(() => localStorage.getItem('hk_chat_session_id') || '')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const [initialized, setInitialized] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return undefined

    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  // Initialize or fetch history only when widget is opened (lazy init)
  useEffect(() => {
    if (isOpen && !initialized) {
      const timer = setTimeout(() => {
        if (sessionId) {
          fetchHistory(sessionId)
        } else {
          startNewSession()
        }
        setInitialized(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialized, sessionId])

  const startNewSession = async () => {
    setIsLoading(true)
    try {
      const lang = i18n.language || 'vi'
      const response = await apiClient.post('/chat/session', { language: lang })
      const newSid = response.data.session_id
      localStorage.setItem('hk_chat_session_id', newSid)
      setSessionId(newSid)
      setMessages([])
    } catch (err) {
      console.error('Failed to create chat session:', err)
      toast.error(t('chatbot.error_session', 'Không thể khởi tạo cuộc trò chuyện'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistory = async (sid) => {
    setIsLoading(true)
    try {
      const response = await apiClient.get(`/chat/history/${sid}`)
      setMessages(response.data.messages || [])
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
      // Session might be expired or deleted, let's clear local copy and start fresh
      localStorage.removeItem('hk_chat_session_id')
      setSessionId('')
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    if (!sessionId) return
    setIsLoading(true)
    try {
      await apiClient.delete(`/chat/session/${sessionId}`)
      localStorage.removeItem('hk_chat_session_id')
      setSessionId('')
      setMessages([])
      toast.success(t('chatbot.clear_success', 'Đã xóa lịch sử trò chuyện'))
    } catch (err) {
      console.error('Failed to clear chat history:', err)
      toast.error(t('chatbot.clear_error', 'Không thể xóa lịch sử'))
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    let currentSid = sessionId

    // If session ID doesn't exist, create one first
    if (!currentSid) {
      setIsLoading(true)
      try {
        const lang = i18n.language || 'vi'
        const response = await apiClient.post('/chat/session', { language: lang })
        currentSid = response.data.session_id
        localStorage.setItem('hk_chat_session_id', currentSid)
        setSessionId(currentSid)
      } catch (err) {
        console.error('Failed to create session on message send:', err)
        toast.error(t('chatbot.error_session', 'Không thể khởi tạo cuộc trò chuyện'))
        setIsLoading(false)
        return
      }
    }

    // Append user message immediately
    const userMessage = {
      id: Date.now(), // temporary id
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await apiClient.post('/chat/message', {
        session_id: currentSid,
        message: text,
        language: i18n.language || 'vi'
      })

      const botMessageText = response.data.content || ''
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: botMessageText,
        actions: response.data.actions,
        created_at: new Date().toISOString()
      }
      setMessages((prev) => [...prev, botMessage])

      // Extract cooldown duration if rate limit hit
      if (botMessageText.includes('thử lại sau') || botMessageText.includes('try again in')) {
        const match = botMessageText.match(/(\d+)\s*(giây|seconds)/i)
        if (match) {
          const secs = parseInt(match[1])
          if (!isNaN(secs) && secs > 0) {
            setCooldown(secs)
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      const status = err.response?.status
      const errorCode = err.response?.data?.error

      let errorMsg = t('chatbot.error_generic', 'Đã xảy ra lỗi khi gửi tin nhắn')

      if (status === 429) {
        errorMsg = err.response?.data?.message || t('chatbot.error_429', 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.')
      } else if (status === 404) {
        errorMsg = t('chatbot.error_session_expired', 'Session hết hạn, đang tạo mới...')
        await startNewSession()
      } else if (errorCode === 'quota_exceeded') {
        errorMsg = t('chatbot.error_quota', 'Trợ lý đang bận, thử lại sau ít phút')
      }

      // Extract cooldown duration from error message if rate limit hit
      if (errorMsg.includes('thử lại sau') || errorMsg.includes('try again in')) {
        const match = errorMsg.match(/(\d+)\s*(giây|seconds)/i)
        if (match) {
          const secs = parseInt(match[1])
          if (!isNaN(secs) && secs > 0) {
            setCooldown(secs)
          }
        }
      }

      toast.error(errorMsg)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: errorMsg,
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action, option = null) => {
    // Action can be: product, order, navigate, cart, confirm, login
    if (!action) return

    switch (action.type) {
      case 'product':
        const prod = action.data?.product || action.data
        const slug = prod?.slug || action.product_slug
        if (prod && onSelectProduct) {
          onSelectProduct(prod)
        } else if (slug && onSelectProduct) {
          try {
            const res = await apiClient.get(`/products/${slug}`)
            onSelectProduct(res.data.data)
          } catch {
            toast.error(t('chatbot.product_not_found', 'Không tìm thấy sản phẩm'))
          }
        } else {
          toast.error(t('chatbot.product_not_found', 'Không tìm thấy sản phẩm'))
        }
        break

      case 'order':
        const orderCode = action.data?.order_code || action.order_code || action.data?.code
        if (orderCode) {
          window.location.href = `/orders/tracking/${orderCode}`
        }
        break

      case 'navigate':
        const url = action.data?.url || action.path
        if (url) {
          window.location.href = url
        }
        break

      case 'cart':
        setCartDrawerOpen(true)
        break

      case 'login':
        window.location.href = '/login'
        break

      case 'confirm':
        // Handled via separate handleConfirm call inside UI
        break

      default:
        console.warn('Unknown chat action:', action.type)
    }
  }

  const handleConfirm = async (actionData, isConfirmed) => {
    if (!isConfirmed) {
      toast.error(t('chatbot.action_cancelled', 'Đã hủy thao tác'))
      return
    }

    if (actionData.confirm_type === 'add_to_cart') {
      const { product, size, toppings, quantity } = actionData
      if (product) {
        addItem(product, size || 'S', toppings || [], quantity || 1)
        toast.success(t('chatbot.added_to_cart_success', 'Đã thêm món vào giỏ hàng!'))
      } else {
        toast.error(t('chatbot.add_to_cart_error', 'Không thể thêm món vào giỏ'))
      }
    } else if (actionData.confirm_type === 'cancel_order') {
      const { order_code } = actionData
      if (order_code) {
        try {
          setIsLoading(true)
          await apiClient.post(`/orders/${order_code}/cancel`)
          toast.success(t('chatbot.cancel_order_success', 'Hủy đơn hàng thành công!'))
          // Append success system message locally
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: 'assistant',
              content: t('chatbot.cancel_order_chat_success', 'Đã hủy thành công đơn hàng {{code}}.', { code: order_code }),
              created_at: new Date().toISOString()
            }
          ])
        } catch (err) {
          console.error('Failed to cancel order via chat:', err)
          const errorMsg = err.response?.data?.message || t('chatbot.cancel_order_error', 'Không thể hủy đơn hàng này.')
          toast.error(errorMsg)
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  return {
    messages,
    isLoading,
    initialized,
    isOpen,
    setIsOpen,
    sendMessage,
    clearChat,
    handleAction,
    handleConfirm,
    cooldown
  }
}
