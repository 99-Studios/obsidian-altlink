import { Plugin, MarkdownView } from 'obsidian';

export default class QuickLinkPlugin extends Plugin {
	async onload() {
		// This listens for any keyup event in the whole document
		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
			// We only care if the key was "Alt"
			if (evt.key === 'Alt') {
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