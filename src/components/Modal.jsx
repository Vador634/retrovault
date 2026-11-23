import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import Icon from './Icon'

/**
 * Pop-up générique : plein écran sur téléphone, fenêtre centrée sur desktop.
 * À utiliser dans un <AnimatePresence> pour avoir l'animation de fermeture.
 */
export default function Modal({ title, onClose, onBack, children, footer, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)

    // on bloque le scroll de la page derrière
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`panel relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-none shadow-2xl sm:h-auto sm:max-h-[88vh] sm:rounded-xl ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        <header className="flex items-center gap-2 border-b border-line px-3 py-3 sm:px-5">
          {onBack && (
            <button className="btn btn-ghost !px-2" onClick={onBack} aria-label="Retour">
              <Icon name="back" />
            </button>
          )}
          <h2 className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink-strong">
            {title}
          </h2>
          <button className="btn btn-ghost !px-2" onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer && <footer className="pb-safe border-t border-line px-4 py-3 sm:px-5">{footer}</footer>}
      </motion.div>
    </motion.div>,
    document.body,
  )
}
