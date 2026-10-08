import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './button'

export function Modal({ title, open, onClose, children, className = '', showTitle = true }: { title: string; open: boolean; onClose: () => void; children: ReactNode; className?: string; showTitle?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (open && !ref.current?.open) ref.current?.showModal(); if (!open && ref.current?.open) ref.current?.close() }, [open])
  return <dialog ref={ref} className={`market-modal ${className}`} aria-label={title} onCancel={onClose} onClose={onClose}>
    <header>{showTitle && <h2>{title}</h2>}<Button variant="outline" onClick={onClose} aria-label="Fechar diálogo">×</Button></header>
    {children}
  </dialog>
}
