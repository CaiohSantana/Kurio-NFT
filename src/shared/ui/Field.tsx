import { useId } from 'react'
export function Field({ name, label, value = '', error, type = 'text', required = false, options }: { name: string; label: string; value?: string; error?: string; type?: string; required?: boolean; options?: readonly string[] }) {
  const id = useId()
  return <div className="form-field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{options ? <select id={id} name={name} defaultValue={value} required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input id={id} name={name} type={type} defaultValue={value} required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} autoComplete={type === 'password' ? name === 'currentPassword' ? 'current-password' : 'new-password' : undefined} />}{error && <p id={`${id}-error`}>{error}</p>}</div>
}
