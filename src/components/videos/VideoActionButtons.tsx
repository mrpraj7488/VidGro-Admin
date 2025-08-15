import React from 'react'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  ExternalLink,
  Copy,
  Share2,
  Edit,
  Trash2,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '../ui/Button'

interface VideoActionButtonsProps {
  video: any
  onAction: (action: string) => void
  actionLoading: Record<string, boolean>
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical' | 'grid'
  showLabels?: boolean
  variant?: 'full' | 'minimal' | 'status-only'
}

export function VideoActionButtons({ 
  video, 
  onAction, 
  actionLoading, 
  size = 'sm',
  layout = 'horizontal',
  showLabels = true,
  variant = 'full'
}: VideoActionButtonsProps) {
  const buttonSize = size === 'lg' ? 'default' : size
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  
  const containerClasses = {
    horizontal: 'flex items-center space-x-2 flex-wrap',
    vertical: 'flex flex-col space-y-2',
    grid: 'grid grid-cols-2 md:grid-cols-3 gap-2'
  }

  const getStatusActions = () => {
    const actions = []

    // Status-specific actions
    if (video.status === 'pending') {
      actions.push(
        <Button
          key="approve"
          onClick={() => onAction('approve')}
          disabled={actionLoading.approve}
          variant="success"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          {actionLoading.approve ? (
            <RefreshCw className={`${iconSize} animate-spin`} />
          ) : (
            <CheckCircle className={iconSize} />
          )}
          {showLabels && <span>Approve</span>}
        </Button>,
        
        <Button
          key="reject"
          onClick={() => onAction('reject')}
          disabled={actionLoading.reject}
          variant="danger"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          {actionLoading.reject ? (
            <RefreshCw className={`${iconSize} animate-spin`} />
          ) : (
            <XCircle className={iconSize} />
          )}
          {showLabels && <span>Reject</span>}
        </Button>
      )
    }

    if (video.status === 'active') {
      actions.push(
        <Button
          key="pause"
          onClick={() => onAction('pause')}
          disabled={actionLoading.pause}
          variant="warning"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          {actionLoading.pause ? (
            <RefreshCw className={`${iconSize} animate-spin`} />
          ) : (
            <Pause className={iconSize} />
          )}
          {showLabels && <span>Pause</span>}
        </Button>
      )
    }

    if (video.status === 'paused') {
      actions.push(
        <Button
          key="resume"
          onClick={() => onAction('resume')}
          disabled={actionLoading.resume}
          variant="success"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          {actionLoading.resume ? (
            <RefreshCw className={`${iconSize} animate-spin`} />
          ) : (
            <Play className={iconSize} />
          )}
          {showLabels && <span>Resume</span>}
        </Button>
      )
    }

    return actions
  }

  const getUniversalActions = () => {
    if (variant === 'status-only') return []
    
    const actions = [
      <Button
        key="view"
        onClick={() => onAction('view')}
        variant="outline"
        size={buttonSize}
        className="flex items-center space-x-1"
      >
        <Eye className={iconSize} />
        {showLabels && <span>View</span>}
      </Button>,
      
      <Button
        key="youtube"
        onClick={() => onAction('openYoutube')}
        variant="outline"
        size={buttonSize}
        className="flex items-center space-x-1"
      >
        <ExternalLink className={iconSize} />
        {showLabels && <span>YouTube</span>}
      </Button>
    ]

    if (variant === 'full') {
      actions.push(
        <Button
          key="copy"
          onClick={() => onAction('copyUrl')}
          variant="outline"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          <Copy className={iconSize} />
          {showLabels && <span>Copy</span>}
        </Button>,
        
        <Button
          key="edit"
          onClick={() => onAction('edit')}
          variant="outline"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          <Edit className={iconSize} />
          {showLabels && <span>Edit</span>}
        </Button>
      )
    }

    return actions
  }

  const getDestructiveActions = () => {
    if (variant === 'minimal' || variant === 'status-only') return []
    
    if (video.status !== 'deleted') {
      return [
        <Button
          key="delete"
          onClick={() => onAction('delete')}
          disabled={actionLoading.delete}
          variant="danger"
          size={buttonSize}
          className="flex items-center space-x-1"
        >
          {actionLoading.delete ? (
            <RefreshCw className={`${iconSize} animate-spin`} />
          ) : (
            <Trash2 className={iconSize} />
          )}
          {showLabels && <span>Delete</span>}
        </Button>
      ]
    }
    
    return []
  }

  const allActions = [
    ...getStatusActions(),
    ...getUniversalActions(),
    ...getDestructiveActions()
  ]

  if (allActions.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No actions available</p>
      </div>
    )
  }

  return (
    <div className={containerClasses[layout]}>
      {allActions}
    </div>
  )
}