export function CarouselIndicators({ labels, active, onChange, label, className = '' }: { labels: string[]; active: number; onChange: (index: number) => void; label: string; className?: string }) {
  return <><nav className={`carousel-indicators ${className}`} aria-label={label} onKeyDown={event => {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!direction && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? labels.length - 1 : (active + direction + labels.length) % labels.length
    onChange(next); event.currentTarget.querySelectorAll('button')[next]?.focus()
  }}>{labels.map((name,index) => <button type="button" key={name} aria-label={name} aria-current={active === index ? 'page' : undefined} aria-pressed={active === index} onClick={() => onChange(index)}><span /></button>)}</nav><p className="sr-only" role="status">{labels[active]}</p></>
}
