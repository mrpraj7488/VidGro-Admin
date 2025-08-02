import React, { useState } from 'react'
import { Plus, Minus, DollarSign } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { formatNumber } from '../../lib/utils'

interface CoinAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onAdjust: (amount: number, reason: string) => Promise<void>
}

export function CoinAdjustmentModal({ isOpen, onClose, user, onAdjust }: CoinAdjustmentModalProps) {
  const [amount, setAmount] = useState<number>(0)
  const [reason, setReason] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !reason.trim()) return

    setIsLoading(true)
    try {
      await onAdjust(amount, reason)
      onClose()
      setAmount(0)
      setReason('')
    } catch (error) {
      console.error('Failed to adjust coins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="gaming-modal max-w-md w-full">
        <div className="p-6 border-b border-violet-500/20">
          <h3 className="text-lg font-semibold text-white">
            Adjust Coins for {user.username}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Current balance: {formatNumber(user.coins)} coins
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (use negative for deduction)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount..."
                className="pr-20 !bg-violet-500/10"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => setAmount(Math.abs(amount) * -1)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(Math.abs(amount))}
                  className="p-1 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for this adjustment..."
              rows={3}
              className="w-full px-3 py-2 border border-violet-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-violet-500/10 text-white placeholder-gray-400"
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-violet-500/20">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !amount || !reason.trim()}
              className="flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{isLoading ? 'Adjusting...' : 'Adjust Coins'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}