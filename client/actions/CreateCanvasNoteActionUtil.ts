import { createShapeId } from 'tldraw'
import { CreateCanvasNoteAction } from '../../shared/schema/AgentActionSchemas'
import { Streaming } from '../../shared/types/Streaming'
import { AgentHelpers } from '../AgentHelpers'
import { AgentActionUtil, registerActionUtil } from './AgentActionUtil'

const MIN_HEIGHT = 80
const LINE_HEIGHT = 18
const TITLE_HEIGHT = 36
const PADDING_HEIGHT = 24

export const CreateCanvasNoteActionUtil = registerActionUtil(
	class CreateCanvasNoteActionUtil extends AgentActionUtil<CreateCanvasNoteAction> {
		static override type = 'createCanvasNote' as const

		override getInfo(action: Streaming<CreateCanvasNoteAction>) {
			return {
				icon: 'geo-rectangle' as const,
				description: action.intent ?? '',
			}
		}

		override sanitizeAction(action: Streaming<CreateCanvasNoteAction>, helpers: AgentHelpers) {
			if (!action.complete) return action

			const floatX = helpers.ensureValueIsNumber(action.x)
			const floatY = helpers.ensureValueIsNumber(action.y)
			if (floatX === null || floatY === null) return null
			action.x = floatX
			action.y = floatY

			return action
		}

		override applyAction(action: Streaming<CreateCanvasNoteAction>, helpers: AgentHelpers) {
			if (!action.complete) return
			const { editor } = this

			const { x, y } = helpers.removeOffsetFromVec({ x: action.x, y: action.y })

			const bodyLines = (action.body ?? '').split('\n').length
			const estimatedHeight = TITLE_HEIGHT + PADDING_HEIGHT + bodyLines * LINE_HEIGHT
			const h = action.h ?? Math.max(MIN_HEIGHT, estimatedHeight)

			editor.createShape({
				id: createShapeId(),
				type: 'canvas-note',
				x,
				y,
				props: {
					w: action.w ?? 280,
					h,
					title: action.title,
					body: action.body,
					category: action.category ?? 'default',
					isCollapsed: false,
				},
			})
		}
	}
)
