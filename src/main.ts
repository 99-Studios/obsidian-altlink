import { Plugin, MarkdownView } from 'obsidian';

export default class QuickLinkPlugin extends Plugin {
	async onload() {
		console.log('AltLink loaded');

		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
			// Check if ONLY the Alt key was pressed and released
			// and that no other modifiers (like Shift or Ctrl) are active
			if (evt.key === 'Alt' && !evt.shiftKey && !evt.ctrlKey && !evt.metaKey) {
				this.makeLink();
			}
		});
	}

	async makeLink() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const editor = activeView.editor;
		const selection = editor.getSelection();

		// If nothing is highlighted, do nothing
		if (!selection || selection.trim() === "") return;

		// Check if the file already exists
		const existingFile = this.app.metadataCache.getFirstLinkpathDest(selection, "");

		if (existingFile) {
			// If it exists, just wrap it in brackets
			editor.replaceSelection(`[[${selection}]]`);
		} else {
			// If it doesn't exist, create the file first, then link it
			await this.app.vault.create(`${selection}.md`, `# ${selection}`);
			editor.replaceSelection(`[[${selection}]]`);
		}
	}
}