import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 py-2 px-3 bg-[#F5F5F5] rounded-2xl w-fit max-w-[80%] rounded-tl-none">
      <div className="w-2.5 h-2.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }}></div>
      <div className="w-2.5 h-2.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }}></div>
      <div className="w-2.5 h-2.5 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }}></div>
    </div>
  )
}
