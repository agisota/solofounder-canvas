import { useMemo } from 'react'
import { useEditor, useValue } from 'tldraw'
import { useAgent } from '../agent/TldrawAgentAppProvider'

const EXPECTED_LAYERS = 7
const CIRCUMFERENCE = 2 * Math.PI * 20 // r=20 → ~125.66

export function SaturationMeter() {
	const editor = useEditor()
	const agent = useAgent()

	const promptCount = useValue('promptCount', () => {
		return agent.chat.getHistory().filter((item) => item.type === 'prompt').length
	}, [agent])

	const metrics = useMemo(() => {
		const shapes = editor.getCurrentPageShapes()
		const elements = shapes.filter(
			(s) => s.type === 'geo' || s.type === 'iso-node' || s.type === 'canvas-note'
		).length
		const connections = shapes.filter((s) => s.type === 'arrow').length
		const notes = shapes.filter((s) => s.type === 'note' || s.type === 'canvas-note').length
		const labels = shapes.filter((s) => s.type === 'text').length
		const total = shapes.length

		const expectedActions = Math.max(elements * EXPECTED_LAYERS, 1)
		const actualLayers = connections + notes + labels + elements
		const structuralSaturation = Math.min(Math.round((actualLayers / expectedActions) * 100), 100)

		// Blend structural coverage with AI prompt activity
		const promptBoost = Math.min(promptCount * 10, 50)
		const saturation = Math.min(Math.round((structuralSaturation + promptBoost) / 1.5), 100)

		return { elements, connections, notes, labels, total, saturation }
	}, [editor, promptCount])

	const { saturation, total, elements, connections } = metrics

	const color =
		saturation < 30
			? 'var(--sf-error)'
			: saturation < 70
				? 'var(--sf-warning)'
				: 'var(--sf-success)'

	const dashLength = (saturation / 100) * CIRCUMFERENCE

	return (
		<div className="saturation-meter">
			<div className="saturation-meter-ring">
				<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
					<circle
						cx="24"
						cy="24"
						r="20"
						fill="none"
						stroke="var(--sf-border)"
						strokeWidth="3"
					/>
					<circle
						cx="24"
						cy="24"
						r="20"
						fill="none"
						stroke={color}
						strokeWidth="3"
						strokeLinecap="round"
						strokeDasharray={`${dashLength} ${CIRCUMFERENCE}`}
						transform="rotate(-90 24 24)"
						style={{ transition: 'stroke-dasharray 500ms ease-out' }}
					/>
				</svg>
				<span className="saturation-meter-value">{saturation}%</span>
			</div>
			<div className="saturation-meter-details">
				<span>{elements} components</span>
				<span>{connections} connections</span>
				<span>{total} total shapes</span>
			</div>
		</div>
	)
}
