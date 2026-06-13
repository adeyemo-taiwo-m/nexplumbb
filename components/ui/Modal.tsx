import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footerActions?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  maxWidth = 'md'
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl', // default 600px
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-navy/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className={`relative bg-white w-full ${widthClasses[maxWidth]} rounded-modal shadow-modal border border-border flex flex-col max-h-[90vh] z-10 overflow-hidden transition-all transform scale-100`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-lgray/30">
          <h3 className="font-display font-bold text-[18px] text-navy">
            {title}
          </h3>
          <button 
            aria-label="Close modal" 
            onClick={onClose}
            className="p-1 rounded-btn hover:bg-lgray text-slate hover:text-navy transition-colors focus-visible:outline-2 focus-visible:outline-teal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 font-body text-[15px] text-body leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div className="px-6 py-4 border-t border-border bg-lgray/10 flex items-center justify-end gap-3">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  )
}
export default Modal
