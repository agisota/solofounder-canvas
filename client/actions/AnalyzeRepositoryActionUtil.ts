import { AnalyzeRepositoryAction } from '../../shared/schema/AgentActionSchemas'
import { parseGitHubUrl } from '../../shared/repoAnalyzer'
import { Streaming } from '../../shared/types/Streaming'
import { AgentActionUtil, registerActionUtil } from './AgentActionUtil'

export const AnalyzeRepositoryActionUtil = registerActionUtil(
	class AnalyzeRepositoryActionUtil extends AgentActionUtil<AnalyzeRepositoryAction> {
		static override type = 'analyzeRepository' as const

		override getInfo(action: Streaming<AnalyzeRepositoryAction>) {
			const parsed = action.url ? parseGitHubUrl(action.url) : null
			const repoName = parsed ? `${parsed.owner}/${parsed.repo}` : 'repository'
			const description = action.complete
				? `Analyzed ${repoName}`
				: `Analyzing ${repoName}...`
			return {
				icon: 'search' as const,
				description,
			}
		}

		override applyAction(action: Streaming<AnalyzeRepositoryAction>) {
			if (!action.complete) return

			const parsed = action.url ? parseGitHubUrl(action.url) : null
			if (!parsed) return

			// Schedule a follow-up request that instructs the agent to create
			// the visual decomposition using create/arrow/note actions.
			this.agent.schedule(
				`Analyze the GitHub repository ${parsed.url} and create a visual decomposition on the canvas. Follow the repo analysis instructions from the system prompt. Create component boxes for each major module, draw arrows for dependencies, and add detail notes. Owner: ${parsed.owner}, Repo: ${parsed.repo}`
			)
		}
	}
)
