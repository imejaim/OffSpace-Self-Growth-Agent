'use client'

import { useState, useRef, useEffect } from 'react'

interface EditableTopicProps {
  defaultTitle: string
  onSubmit: (newTopic: string) => void
  disabled?: boolean
}

export function EditableTopic({ defaultTitle, onSubmit, disabled }: EditableTopicProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(defaultTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && trimmed !== defaultTitle) {
      onSubmit(trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setValue(defaultTitle)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="원하는 주제를 적어보세요"
        disabled={disabled}
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-navy)',
          background: 'var(--color-bg-muted)',
          border: '1px solid var(--color-coral)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.25rem 0.5rem',
          outline: 'none',
          width: '100%',
          letterSpacing: '-0.02em',
        }}
      />
    )
  }

  return (
    <button
      onClick={() => !disabled && setEditing(true)}
      disabled={disabled}
      title="클릭해서 주제 수정"
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--color-navy)',
        letterSpacing: '-0.02em',
        textAlign: 'left',
        borderBottom: disabled ? 'none' : '1px dashed var(--color-border)',
        transition: 'border-color 0.15s',
      }}
    >
      {value || defaultTitle}
    </button>
  )
}
