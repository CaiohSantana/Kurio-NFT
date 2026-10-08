import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './button'

export function Modal({ title, open, onClose, children, className = '', showTitle = true }: { title: string; open: boolean; onClose: () => void; children: ReactNode; className?: string; showTitle?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (open && !ref.current?.open) ref.current?.showModal(); if (!open && ref.current?.open) ref.current?.close() }, [open])
  return <dialog ref={ref} className={`market-modal ${className}`} aria-label={title} onCancel={onClose} onClose={onClose} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], summary, [tabindex]')].filter(node => node.tabIndex >= 0 && !node.matches(':disabled, [type=hidden]') && node.getClientRects().length > 0)
    const first = controls[0], last = controls.at(-1)
    if (!first) { event.preventDefault(); event.currentTarget.focus(); return }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }}>
    <header>{showTitle && <h2>{title}</h2>}<Button variant="outline" onClick={onClose} aria-label="Fechar diálogo">×</Button></header>
    {children}
  </dialog>
}
