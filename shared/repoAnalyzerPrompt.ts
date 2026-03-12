/**
 * System prompt additions for GitHub repository analysis.
 * Instructs the AI agent on how to decompose a repo into visual canvas elements.
 */

export const REPO_ANALYZER_PROMPT = `
### GitHub Repository Analysis

When the user provides a GitHub repository URL (e.g., \`https://github.com/owner/repo\`), analyze the repository and create a structured visual decomposition on the canvas. Follow this process:

#### Step 1: Think & Plan
Use \`think\` actions to plan the decomposition:
- Identify the repo's purpose, tech stack, and architecture
- List the major modules/services/components
- Identify dependencies and data flow between them
- Plan the layout layers

#### Step 2: Create Overview Card
Create a large rectangle at the top-center as the "overview card":
- Color: \`black\` with \`solid\` fill
- Contains: repo name, description, tech stack, key metrics
- Width: 600px, Height: 200px
- Position: centered at the top of the layout

#### Step 3: Create Component Boxes (Layer by Layer)
Decompose the repo into components and create rectangle shapes for each:

**Layout (Mermaid-style, top-to-bottom):**
- **Row 1 (y=280):** External APIs, entry points, UI components — color: \`violet\`
- **Row 2 (y=480):** Core services, business logic — color: \`blue\`
- **Row 3 (y=680):** Internal APIs, routing, middleware — color: \`green\`
- **Row 4 (y=880):** Data stores, databases, caches — color: \`orange\`
- **Row 5 (y=1080):** Infrastructure, CI/CD, monitoring — color: \`grey\`

Each component box:
- Type: \`rectangle\`
- Size: 280x120 pixels
- Fill: \`semi\` (translucent)
- Text label: component name
- Note: brief description of the component's purpose
- Horizontal spacing: 60px gap between boxes
- Center each row horizontally relative to the overview card

#### Step 4: Draw Connections
Create arrow shapes between dependent components:
- Use \`fromId\` and \`toId\` to bind arrows to component shapes
- Color arrows to match the source component's category color
- Add text labels on arrows describing the relationship (e.g., "REST API", "gRPC", "imports")
- Avoid crossing arrows where possible — use bend to curve around obstacles

#### Step 5: Add Detail Notes
Create note shapes (sticky notes) next to key components:
- Color matches the component category
- Content: key files, dependencies, tech details
- Position: offset to the right or below the component box
- Keep notes concise — 2-3 lines max

#### Step 6: Add Text Annotations
Create text shapes for additional context:
- Tech stack labels near relevant components
- Dependency version annotations
- Architecture pattern labels (e.g., "Event-Driven", "MVC", "Microservices")

#### Step 7: Review & Refine
Use the \`review\` action to check:
- No overlapping shapes
- All arrows properly connected
- Labels readable and not truncated
- Overall layout is balanced and clear

#### Color Scheme Reference
- Compute/Core: \`blue\` — API servers, workers, main logic
- Network/API: \`green\` — load balancers, routers, gateways
- Storage/Data: \`orange\` — databases, caches, file storage
- AI/ML/External: \`violet\` — external services, third-party APIs
- Infrastructure: \`grey\` — CI/CD, monitoring, config

#### Shape ID Convention
Use descriptive IDs for repo analysis shapes:
- Overview: \`repo-overview\`
- Components: \`repo-{name}\` (e.g., \`repo-api-server\`, \`repo-database\`)
- Arrows: \`repo-arrow-{from}-{to}\`
- Notes: \`repo-note-{name}\`

#### Depth Layers (aim for 7+)
1. **Overview** — repo summary, tech stack, metrics
2. **Services** — major services/modules as component boxes
3. **Components** — sub-components within each service
4. **Connections** — arrows showing data flow and dependencies
5. **Annotations** — tech details, protocols, versions
6. **Notes** — detailed descriptions per component
7. **Metrics** — performance hints, cost estimates, SLA targets
`
