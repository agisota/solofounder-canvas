import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ARCHITECTURE_TEMPLATES,
  ArchitectureTemplateKey,
  TEMPLATE_CATEGORIES,
} from '../../shared/promptTemplates'

interface TemplatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (text: string) => void
}

export function TemplatePicker({ isOpen, onClose, onSelect }: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Infrastructure')
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredTemplates = useMemo(() => {
    const categoryKeys = TEMPLATE_CATEGORIES[activeCategory] ?? []
    return categoryKeys
      .filter((key) => {
        if (!searchQuery) return true
        const text = ARCHITECTURE_TEMPLATES[key as ArchitectureTemplateKey]
        return (
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      .map((key) => ({
        key,
        text: ARCHITECTURE_TEMPLATES[key as ArchitectureTemplateKey],
      }))
  }, [activeCategory, searchQuery])

  const handleSelect = useCallback(
    (text: string) => {
      onSelect(text)
      onClose()
    },
    [onSelect, onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset search when category changes
  useEffect(() => {
    setSearchQuery('')
  }, [activeCategory])

  if (!isOpen) return null

  return (
    <div className="template-picker-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        className="template-picker"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="template-picker-header">
          <span className="template-picker-title">Architecture Templates</span>
          <span className="template-picker-count">{filteredTemplates.length}</span>
        </div>

        <input
          className="template-picker-search"
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />

        <div className="template-picker-categories">
          {Object.keys(TEMPLATE_CATEGORIES).map((cat) => (
            <button
              key={cat}
              className={`template-picker-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="template-picker-list">
          {filteredTemplates.map(({ key, text }) => (
            <button
              key={key}
              className="template-picker-item"
              onClick={() => handleSelect(text)}
            >
              <span className="template-picker-item-name">{formatTemplateName(key)}</span>
              <span className="template-picker-item-preview">{text.slice(0, 80)}...</span>
            </button>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="template-picker-empty">No templates found</div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTemplateName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}
