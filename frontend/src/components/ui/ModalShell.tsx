import React from 'react'
import { motion } from 'framer-motion'

type ModalShellProps = {
  onClose: () => void
  onOverlayClick?: (() => void) | null
  children: React.ReactNode
  overlayClassName?: string
  cardClassName?: string
  cardStyle?: React.CSSProperties
}

const DEFAULT_OVERLAY_CLASS =
  'fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6'

const DEFAULT_CARD_CLASS =
  'bg-[var(--card-bg)] border border-[var(--border-color)] p-10 rounded-[3rem] w-full max-w-md shadow-2xl'

export default function ModalShell({
  onClose,
  onOverlayClick,
  children,
  overlayClassName = DEFAULT_OVERLAY_CLASS,
  cardClassName = DEFAULT_CARD_CLASS,
  cardStyle
}: ModalShellProps) {
  const overlayClickHandler = onOverlayClick === undefined ? onClose : onOverlayClick
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={overlayClassName}
      onClick={overlayClickHandler ?? undefined}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cardClassName}
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

