import { createShapeId } from 'tldraw'
import { CreateIsoNodeAction } from '../../shared/schema/AgentActionSchemas'
import { Streaming } from '../../shared/types/Streaming'
import { AgentHelpers } from '../AgentHelpers'
import { AgentActionUtil, registerActionUtil } from './AgentActionUtil'

export const CreateIsoNodeActionUtil = registerActionUtil(
	class CreateIsoNodeActionUtil extends AgentActionUtil<CreateIsoNodeAction> {
		static override type = 'createIsoNode' as const

		override getInfo(action: Streaming<CreateIsoNodeAction>) {
			return {
				icon: 'geo-rectangle' as const,
				description: action.intent ?? '',
			}
		}

		override sanitizeAction(action: Streaming<CreateIsoNodeAction>, helpers: AgentHelpers) {
			if (!action.complete) return action

			const floatX = helpers.ensureValueIsNumber(action.x)
			const floatY = helpers.ensureValueIsNumber(action.y)
			if (floatX === null || floatY === null) return null
			action.x = floatX
			action.y = floatY

			return action
		}

		override applyAction(action: Streaming<CreateIsoNodeAction>, helpers: AgentHelpers) {
			if (!action.complete) return
			const { editor } = this

			const { x, y } = helpers.removeOffsetFromVec({ x: action.x, y: action.y })

			editor.createShape({
				id: createShapeId(),
				type: 'iso-node',
				x,
				y,
				props: {
					w: action.w ?? 120,
					h: action.h ?? 120,
					iconId: action.iconId,
					label: action.label,
					category: action.category,
				},
			})
		}
	}
)
