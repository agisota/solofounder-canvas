/**
 * GitHub repository URL parser and DeepWiki integration types
 * for the repo analysis feature.
 */

/** Parsed GitHub repository info */
export interface GitHubRepoInfo {
	owner: string
	repo: string
	url: string
}

/** Categories for visual decomposition of repo components */
export type RepoComponentCategory = 'core' | 'data' | 'api' | 'infrastructure' | 'external'

/** Color mapping for component categories (maps to FocusedColor values) */
export const REPO_CATEGORY_COLORS: Record<RepoComponentCategory, string> = {
	core: 'blue',
	data: 'orange',
	api: 'green',
	infrastructure: 'grey',
	external: 'violet',
} as const

/** Layout constants for repo visualization */
export const REPO_LAYOUT = {
	/** Starting X coordinate for the layout */
	startX: 0,
	/** Starting Y coordinate for the layout */
	startY: 0,
	/** Width of component boxes */
	componentWidth: 280,
	/** Height of component boxes */
	componentHeight: 120,
	/** Width of note cards */
	noteWidth: 240,
	/** Gap between components horizontally */
	horizontalGap: 60,
	/** Gap between components vertically */
	verticalGap: 80,
	/** Width of the overview card */
	overviewWidth: 600,
	/** Height of the overview card */
	overviewHeight: 200,
} as const

/**
 * Parse a GitHub URL to extract owner and repo.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo/tree/branch
 *   - https://github.com/owner/repo.git
 *   - github.com/owner/repo
 *
 * @returns Parsed repo info, or null if the URL is not a valid GitHub repo URL
 */
export function parseGitHubUrl(input: string): GitHubRepoInfo | null {
	const trimmed = input.trim()

	// Add protocol if missing
	const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`

	let url: URL
	try {
		url = new URL(urlStr)
	} catch {
		return null
	}

	if (url.hostname !== 'github.com') return null

	const segments = url.pathname.split('/').filter(Boolean)
	if (segments.length < 2) return null

	const owner = segments[0]
	const repo = segments[1].replace(/\.git$/, '')

	if (!owner || !repo) return null

	return {
		owner,
		repo,
		url: `https://github.com/${owner}/${repo}`,
	}
}

/**
 * Check if a string contains a GitHub repo URL.
 */
export function containsGitHubUrl(text: string): boolean {
	return /github\.com\/[\w.-]+\/[\w.-]+/.test(text)
}
