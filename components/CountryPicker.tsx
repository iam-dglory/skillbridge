'use client'

import { COUNTRIES } from '@/lib/ppp'

interface Props {
  value: string
  onChange: (country: string) => void
  label?: string
  className?: string
}

export default function CountryPicker({ value, onChange, label, className = '' }: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer hover:border-gray-300 transition w-full"
      >
        {Object.entries(COUNTRIES).map(([name, d]) => (
          <option key={name} value={name}>{d.flag} {name}</option>
        ))}
      </select>
    </div>
  )
}
