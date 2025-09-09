import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { format } from 'date-fns'

interface DateRangePickerProps {
  value: [Date | null, Date | null]
  onChange: (range: [Date | null, Date | null]) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const presets = [
    {
      label: 'Last 7 days',
      range: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date]
    },
    {
      label: 'Last 30 days',
      range: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date]
    },
    {
      label: 'Last 90 days',
      range: [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date]
    },
    {
      label: 'This year',
      range: [new Date(new Date().getFullYear(), 0, 1), new Date()] as [Date, Date]
    }
  ]

  const formatRange = (range: [Date | null, Date | null]) => {
    if (!range[0] || !range[1]) return 'Select date range'
    return `${format(range[0], 'MMM dd')} - ${format(range[1], 'MMM dd')}`
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{formatRange(value)}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-[99999]">
          <div className="p-3 space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onChange(preset.range)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 rounded transition-colors dark:text-white"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[99998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}