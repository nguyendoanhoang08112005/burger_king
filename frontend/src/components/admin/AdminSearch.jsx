import { Search } from 'lucide-react'

export default function AdminSearch({ value, onChange, placeholder = 'Search...', className = 'relative max-w-sm w-full' }) {
  return (
    <div className={className}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-[#161825] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100"
      />
    </div>
  )
}
