import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function OrderTimeline({ isCancelled, steps, currentStepIndex, t }) {
  if (isCancelled) {
    return (
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center mb-8 flex flex-col items-center justify-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-primary mb-3 stroke-1 animate-float" />
        <h3 className="font-bold text-xl text-primary uppercase tracking-wide">{t('order.cancelled_title')}</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-sm">
          {t('order.cancelled_desc')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E8E8E8] mb-8 shadow-glass">
      <h3 className="font-bold text-[20px] text-primary tracking-wide uppercase mb-6 text-center">{t('order.delivery_status')}</h3>
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
        {/* Timeline connectors */}
        <div className="absolute top-4 left-4 md:left-0 md:right-0 h-full md:h-0.5 bg-gray-200 z-0" />
        
        {steps.map((st, idx) => {
          const active = idx <= currentStepIndex
          return (
            <div key={st.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition duration-300 ${
                active ? 'bg-primary border-primary text-white font-bold' : 'bg-gray-100 border-[#E8E8E8] text-gray-400'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-xs font-semibold tracking-wide ${active ? 'text-[#1A1A1A] font-bold' : 'text-gray-400'}`}>
                {st.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
