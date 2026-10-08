import { useId, useState } from 'react'

// Form draft only. The API receives the full ENS, never just the suffix/name.
export function EnsField({ value = '', onChange, error, requiredMarker = true }: { value?: string; onChange?: (value: string) => void; error?: string; requiredMarker?: boolean }) {
  const id = useId(), [draft, setDraft] = useState(value)
  const full = onChange ? value : draft, name = full.replace(/\.eth$/i, '')
  const change = (next: string) => { const normalized = next ? `${next.replace(/\.eth$/i, '')}.eth` : ''; if (onChange) onChange(normalized); else setDraft(normalized) }
  return <div className="form-field ens-field"><label htmlFor={id}>Nome ENS{requiredMarker && <span aria-hidden="true"> *</span>}<span className="sr-only"> (campo opcional)</span></label><div className="ens-control"><select aria-label="Sufixo do ENS" value=".eth" onChange={() => {}}><option>.eth</option></select><input id={id} name="ensName" value={name} onChange={(event) => change(event.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} autoComplete="off" /><input type="hidden" name="ens" value={full} /></div>{error && <p id={`${id}-error`}>{error}</p>}</div>
}
