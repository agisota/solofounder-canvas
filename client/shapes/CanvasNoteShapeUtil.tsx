import { HTMLContainer, Rectangle2d, ShapeUtil, TLBaseShape, T } from 'tldraw'

type CanvasNoteShape = TLBaseShape<
	'canvas-note',
	{
		w: number
		h: number
		title: string
		body: string
		category: 'compute' | 'network' | 'storage' | 'cache' | 'ai' | 'monitoring' | 'default'
		isCollapsed: boolean
	}
>

export class CanvasNoteShapeUtil extends ShapeUtil<CanvasNoteShape> {
	static override type = 'canvas-note' as const
	static override props = {
		w: T.number,
		h: T.number,
		title: T.string,
		body: T.string,
		category: T.string,
		isCollapsed: T.boolean,
	}

	getDefaultProps(): CanvasNoteShape['props'] {
		return {
			w: 280,
			h: 160,
			title: 'Note',
			body: '',
			category: 'default',
			isCollapsed: false,
		}
	}

	override getGeometry(shape: CanvasNoteShape) {
		const h = shape.props.isCollapsed ? 36 : shape.props.h
		return new Rectangle2d({ width: shape.props.w, height: h, isFilled: true })
	}

	override component(shape: CanvasNoteShape) {
		const { w, title, body, category, isCollapsed } = shape.props
		const categoryClass = category !== 'default' ? `category-${category}` : ''
		const collapsedClass = isCollapsed ? 'canvas-note-collapsed' : ''

		return (
			<HTMLContainer>
				<div
					className={`canvas-note ${categoryClass} ${collapsedClass}`}
					style={{ width: w, pointerEvents: 'all' }}
				>
					<div className="canvas-note-title">
						<span style={{ flex: 1 }}>{title}</span>
						<button
							onClick={(e) => {
								e.stopPropagation()
								const editor = this.editor
								editor.updateShape<CanvasNoteShape>({
									id: shape.id,
									type: 'canvas-note',
									props: { isCollapsed: !isCollapsed },
								})
							}}
							style={{
								background: 'none',
								border: 'none',
								color: 'var(--sf-text-ghost)',
								cursor: 'pointer',
								fontSize: 12,
								padding: '0 4px',
								lineHeight: 1,
							}}
						>
							{isCollapsed ? '\u25B8' : '\u25BE'}
						</button>
					</div>
					<div className="canvas-note-body">{body}</div>
				</div>
			</HTMLContainer>
		)
	}

	override indicator(shape: CanvasNoteShape) {
		const h = shape.props.isCollapsed ? 36 : shape.props.h
		return <rect width={shape.props.w} height={h} rx={12} />
	}
}
