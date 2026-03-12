import { Rectangle2d, ShapeUtil, SVGContainer, TLBaseShape, T } from 'tldraw'

type IsoNodeShape = TLBaseShape<
	'iso-node',
	{
		w: number
		h: number
		iconId: string
		label: string
		category: 'compute' | 'network' | 'storage' | 'cache' | 'ai' | 'monitoring'
	}
>

const CATEGORY_COLORS: Record<string, string> = {
	compute: '#60a5fa',
	network: '#4ade80',
	storage: '#fbbf24',
	cache: '#f87171',
	ai: '#c084fc',
	monitoring: '#94a3b8',
}

export class IsoNodeShapeUtil extends ShapeUtil<IsoNodeShape> {
	static override type = 'iso-node' as const
	static override props = {
		w: T.number,
		h: T.number,
		iconId: T.string,
		label: T.string,
		category: T.string,
	}

	getDefaultProps(): IsoNodeShape['props'] {
		return { w: 120, h: 120, iconId: 'server', label: '', category: 'compute' }
	}

	override getGeometry(shape: IsoNodeShape) {
		return new Rectangle2d({ width: shape.props.w, height: shape.props.h + 24, isFilled: true })
	}

	override component(shape: IsoNodeShape) {
		const { w, h, label, category } = shape.props
		const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.compute
		const halfW = w / 2
		const quarterH = h / 4

		const topFace = `${halfW},0 ${w},${quarterH} ${halfW},${quarterH * 2} 0,${quarterH}`
		const leftFace = `0,${quarterH} ${halfW},${quarterH * 2} ${halfW},${quarterH * 2 + h / 2} 0,${quarterH + h / 2}`
		const rightFace = `${w},${quarterH} ${halfW},${quarterH * 2} ${halfW},${quarterH * 2 + h / 2} ${w},${quarterH + h / 2}`

		return (
			<SVGContainer>
				<polygon
					points={topFace}
					fill={color}
					fillOpacity={0.25}
					stroke={color}
					strokeWidth={1.5}
					strokeOpacity={0.6}
				/>
				<polygon
					points={leftFace}
					fill={color}
					fillOpacity={0.15}
					stroke={color}
					strokeWidth={1}
					strokeOpacity={0.4}
				/>
				<polygon
					points={rightFace}
					fill={color}
					fillOpacity={0.1}
					stroke={color}
					strokeWidth={1}
					strokeOpacity={0.3}
				/>

				{label && (
					<text
						x={halfW}
						y={quarterH * 2 + h / 2 + 16}
						textAnchor="middle"
						fill="#e4e4e7"
						fontSize={11}
						fontFamily="Inter, sans-serif"
						fontWeight={500}
					>
						{label}
					</text>
				)}
			</SVGContainer>
		)
	}

	override indicator(shape: IsoNodeShape) {
		const { w, h } = shape.props
		return <rect width={w} height={h + 24} rx={4} />
	}
}
