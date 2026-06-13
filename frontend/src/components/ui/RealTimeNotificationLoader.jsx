import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/axios'

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const audioCtx = new AudioContext()
    
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
      
      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    
    const now = audioCtx.currentTime
    playTone(523.25, now, 0.4) // C5
    playTone(783.99, now + 0.1, 0.5) // G5
  } catch (e) {
    console.error('Failed to play audio notification', e)
  }
}

export default function RealTimeNotificationLoader() {
  const { user, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loadedIdsRef = useRef(new Set())
  const isInitializedRef = useRef(false)

  useEffect(() => {
    isInitializedRef.current = false
    loadedIdsRef.current.clear()

    if (!isAuthenticated) return undefined

    const fetchNotifications = async () => {
      try {
        const { data } = await apiClient.get('/notifications')
        const list = Array.isArray(data) ? data : data?.data || []
        
        if (!isInitializedRef.current) {
          list.forEach(item => {
            if (item?.id) loadedIdsRef.current.add(item.id)
          })
          isInitializedRef.current = true
        } else {
          let hasNew = false
          list.forEach(item => {
            if (item?.id && !loadedIdsRef.current.has(item.id)) {
              loadedIdsRef.current.add(item.id)
              if (!item.read_at) {
                hasNew = true
                
                const nData = item.data || {}
                const title = item.title || nData.title || nData.message || item.message || t('profile.notifications')
                const body = nData.body || nData.content || ''
                const orderCode = nData.order_code || ''

                toast.custom((toastItem) => (
                  <div
                    onClick={() => {
                      toast.dismiss(toastItem.id)
                      if (orderCode) {
                        navigate(`/orders/tracking/${orderCode}`)
                      } else {
                        navigate('/profile?tab=notifications')
                      }
                    }}
                    className={`${
                      toastItem.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-600 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl p-4`}
                  >
                    <div className="flex items-start w-full">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-6 w-6 text-red-600 animate-bounce" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ), { duration: 6000 })
              }
            }
          })

          if (hasNew) {
            playNotificationSound()
          }
        }
      } catch (err) {
        console.error('Failed to fetch user notifications for realtime', err)
      }
    }

    fetchNotifications()

    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user, navigate, t])

  return null
}
