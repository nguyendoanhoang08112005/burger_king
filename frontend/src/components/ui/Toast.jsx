import { AlertCircle, CheckCircle, X } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'

export default function Toast() {
  const toast = useUiStore(state => state.toast)
  const hideToast = useUiStore(state => state.hideToast)

  if (!toast) return null

  return (
    <div className={`fixed top-24 bottom-auto left-4 right-4 md:left-auto md:right-6 z-[9999] flex items-center justify-between md:justify-start gap-3 rounded-[8px] px-5 py-4 shadow-premium border transition-all duration-200 animate-float ${
      toast.type === 'error' 
        ? 'bg-white border-primary text-primary' 
        : 'bg-white border-secondary text-secondary'
    }`}>
      {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-secondary" />}
      <span className="font-semibold text-sm text-[#1A1A1A]">{toast.message}</span>
      <button onClick={hideToast} className="text-gray-400 hover:text-black transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
