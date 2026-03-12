import { Editor, TLArrowShape, TLGeoShape, TLGroupShape, TLNoteShape, TLShape, TLTextShape } from 'tldraw'
import { ExportToObsidianAction } from '../../shared/schema/AgentActionSchemas'
import { Streaming } from '../../shared/types/Streaming'
import { AgentActionUtil, registerActionUtil } from './AgentActionUtil'

export const ExportToObsidianActionUtil = registerActionUtil(
	class ExportToObsidianActionUtil extends AgentActionUtil<ExportToObsidianAction> {
		static override type = 'exportToObsidian' as const

		override getInfo(action: Streaming<ExportToObsidianAction>) {
			const label = action.complete ? 'Exported to Obsidian' : 'Exporting to Obsidian'
			return {
				icon: 'external-link' as const,
				description: label,
			}
		}

		override savesToHistory(): boolean {
			return true
		}

		override applyAction(action: Streaming<ExportToObsidianAction>) {
			if (!action.complete) return

			const { editor } = this
			const shapes = getTargetShapes(editor, action.useSelectedOnly ?? false)
			const title = action.title ?? 'Canvas Export'
			const markdown = buildMarkdown(editor, shapes, title)

			downloadMarkdown(markdown, title)
		}
	}
)

// ============================================================================
// Shape collection
// ============================================================================

function getTargetShapes(editor: Editor, selectedOnly: boolean): TLShape[] {
	if (selectedOnly) {
		const selected = editor.getSelectedShapes()
		if (selected.length > 0) return selected
	}
	return editor.getCurrentPageShapes()
}

// ============================================================================
// Markdown building
// ============================================================================

function buildMarkdown(editor: Editor, shapes: TLShape[], title: string): string {
	const date = new Date().toISOString().slice(0, 10)
	const frontmatter = buildFrontmatter(title, date)
	const sections = buildSections(editor, shapes)
	const mermaid = buildMermaidDiagram(editor, shapes)

	const parts: string[] = [frontmatter]

	if (sections.trim()) {
		parts.push(sections)
	}

	if (mermaid.trim()) {
		parts.push('## Relationships\n')
		parts.push('```mermaid')
		parts.push(mermaid)
		parts.push('```')
	}

	return parts.join('\n') + '\n'
}

function buildFrontmatter(title: string, date: string): string {
	return [
		'---',
		`title: "${title}"`,
		`date: ${date}`,
		'tags:',
		'  - architecture',
		'---',
		'',
	].join('\n')
}

function buildSections(editor: Editor, shapes: TLShape[]): string {
	const lines: string[] = []

	// Groups first — render as sections
	const groups = shapes.filter((s): s is TLGroupShape => s.type === 'group')
	const groupChildIds = new Set<string>()

	for (const group of groups) {
		const children = editor.getSortedChildIdsForParent(group.id)
		const childShapes = children
			.map((id) => editor.getShape(id))
			.filter((s): s is TLShape => s !== undefined)

		const groupLabel = getShapeLabel(editor, group) ?? `Group ${group.id.slice(-4)}`
		lines.push(`## ${groupLabel}`)
		lines.push('')

		for (const child of childShapes) {
			groupChildIds.add(child.id)
			const childLine = shapeToMarkdownLine(editor, child, '### ')
			if (childLine) lines.push(childLine, '')
		}
	}

	// Top-level shapes that aren't group children and aren't arrows
	const topLevel = shapes.filter(
		(s) => !groupChildIds.has(s.id) && s.type !== 'group' && s.type !== 'arrow' && s.type !== 'line'
	)

	for (const shape of topLevel) {
		const line = shapeToMarkdownLine(editor, shape, '## ')
		if (line) lines.push(line, '')
	}

	return lines.join('\n')
}

function shapeToMarkdownLine(editor: Editor, shape: TLShape, headingPrefix: string): string | null {
	switch (shape.type) {
		case 'text': {
			const text = getTextShapeContent(editor, shape as TLTextShape)
			if (!text) return null
			return text.startsWith('#') ? text : `${headingPrefix}${text}`
		}

		case 'note': {
			const text = getNoteContent(editor, shape as TLNoteShape)
			if (!text) return null
			return `> [!note]\n> ${text.replace(/\n/g, '\n> ')}`
		}

		case 'geo': {
			const geo = shape as TLGeoShape
			const label = getShapeLabel(editor, geo)
			const geoType = geo.props.geo ?? 'rectangle'
			if (!label) return null
			return `${headingPrefix}${label}\n\n*Component type: ${geoType}*`
		}

		case 'group': {
			// Groups are already handled in buildSections
			return null
		}

		default:
			return null
	}
}

// ============================================================================
// Mermaid diagram
// ============================================================================

function buildMermaidDiagram(editor: Editor, shapes: TLShape[]): string {
	const arrows = shapes.filter((s): s is TLArrowShape => s.type === 'arrow')
	if (arrows.length === 0) return ''

	const lines: string[] = ['flowchart LR']

	for (const arrow of arrows) {
		const bindings = editor.getBindingsFromShape(arrow, 'arrow')
		const startBinding = bindings.find((b) => b.props && (b.props as { terminal?: string }).terminal === 'start')
		const endBinding = bindings.find((b) => b.props && (b.props as { terminal?: string }).terminal === 'end')

		const fromId = startBinding?.toId
		const toId = endBinding?.toId

		if (!fromId || !toId) continue

		const fromShape = editor.getShape(fromId)
		const toShape = editor.getShape(toId)

		if (!fromShape || !toShape) continue

		const fromLabel = sanitizeMermaidId(getShapeLabel(editor, fromShape) ?? fromId.slice(-6))
		const toLabel = sanitizeMermaidId(getShapeLabel(editor, toShape) ?? toId.slice(-6))
		const arrowLabel = getArrowLabel(editor, arrow)

		const fromNode = `${sanitizeMermaidNodeId(fromId)}["${fromLabel}"]`
		const toNode = `${sanitizeMermaidNodeId(toId)}["${toLabel}"]`

		if (arrowLabel) {
			lines.push(`  ${fromNode} -->|"${arrowLabel}"| ${toNode}`)
		} else {
			lines.push(`  ${fromNode} --> ${toNode}`)
		}
	}

	// Return empty if only the header line was added
	if (lines.length === 1) return ''

	return lines.join('\n')
}

function sanitizeMermaidId(text: string): string {
	return text.replace(/["]/g, "'").replace(/[\n\r]/g, ' ').slice(0, 60)
}

function sanitizeMermaidNodeId(id: string): string {
	return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

// ============================================================================
// Shape text helpers
// ============================================================================

function getShapeLabel(editor: Editor, shape: TLShape): string | null {
	const props = shape.props as Record<string, unknown>

	if ('richText' in props && props.richText) {
		try {
			const text = extractPlainTextFromRichText(props.richText)
			return text.trim() || null
		} catch {
			// fall through
		}
	}

	if ('text' in props && typeof props.text === 'string') {
		return props.text.trim() || null
	}

	return null
}

function getTextShapeContent(editor: Editor, shape: TLTextShape): string | null {
	return getShapeLabel(editor, shape)
}

function getNoteContent(editor: Editor, shape: TLNoteShape): string | null {
	return getShapeLabel(editor, shape)
}

function getArrowLabel(editor: Editor, shape: TLArrowShape): string | null {
	return getShapeLabel(editor, shape)
}

// ============================================================================
// Rich text helpers
// ============================================================================

function extractPlainTextFromRichText(richText: unknown): string {
	if (typeof richText === 'string') return richText
	if (!richText || typeof richText !== 'object') return ''

	const rt = richText as { content?: Array<{ content?: Array<{ text?: string }> }> }
	if (!Array.isArray(rt.content)) return ''

	return rt.content
		.map((block) => {
			if (!Array.isArray(block.content)) return ''
			return block.content.map((inline) => inline.text ?? '').join('')
		})
		.join('\n')
}

// ============================================================================
// File download
// ============================================================================

function downloadMarkdown(content: string, title: string): void {
	const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
	const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
	const url = URL.createObjectURL(blob)

	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	anchor.style.display = 'none'
	document.body.appendChild(anchor)
	anchor.click()
	document.body.removeChild(anchor)

	URL.revokeObjectURL(url)
}
