import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { useAgent } from '../agent/TldrawAgentAppProvider'
import { ChatHistory } from './chat-history/ChatHistory'
import { ChatInput } from './ChatInput'
import { TemplatePicker } from './TemplatePicker'
import { TodoList } from './TodoList'

export function ChatPanel() {
	const agent = useAgent()
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)
	const [chatInputValue, setChatInputValue] = useState('')

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault()
			if (!inputRef.current) return
			const formData = new FormData(e.currentTarget)
			const value = formData.get('input') as string

			// If the user's message is empty, just cancel the current request (if there is one)
			if (value === '') {
				agent.cancel()
				return
			}

			// Clear the chat input (context is cleared after it's captured in requestAgentActions)
			inputRef.current.value = ''
			setChatInputValue('')

			// Sending a new message to the agent should interrupt the current request
			agent.interrupt({
				input: {
					agentMessages: [value],
					bounds: agent.editor.getViewportPageBounds(),
					source: 'user',
					contextItems: agent.context.getItems(),
				},
			})
		},
		[agent]
	)

	const handleNewChat = useCallback(() => {
		agent.reset()
	}, [agent])

	const handleTemplateSelect = useCallback((text: string) => {
		setChatInputValue(text)
		// Focus the textarea after inserting template
		requestAnimationFrame(() => {
			if (inputRef.current) {
				inputRef.current.focus()
				inputRef.current.setSelectionRange(text.length, text.length)
			}
		})
	}, [])

	return (
		<div className="chat-panel tl-theme__dark">
			<div className="chat-header">
				<button className="new-chat-button" onClick={handleNewChat}>
					+
				</button>
			</div>
			<ChatHistory agent={agent} />
			<div className="chat-input-container">
				<TodoList agent={agent} />
				<ChatInput
					handleSubmit={handleSubmit}
					inputRef={inputRef}
					onTemplateOpen={() => setIsTemplatePickerOpen(true)}
					externalValue={chatInputValue}
					onExternalValueChange={setChatInputValue}
				/>
			</div>
			<TemplatePicker
				isOpen={isTemplatePickerOpen}
				onClose={() => setIsTemplatePickerOpen(false)}
				onSelect={handleTemplateSelect}
			/>
		</div>
	)
}
