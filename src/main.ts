import { Plugin, MarkdownView, Notice } from 'obsidian';

export default class AltLink extends Plugin {
    async onload() {
        console.log('AltLink loaded');

        this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
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

        if (!selection || selection.trim() === "") return;

        const existingFile = this.app.metadataCache.getFirstLinkpathDest(selection, "");

        if (existingFile) {
            editor.replaceSelection(`[[${selection}]]`);
            new Notice(`Linked to existing note: ${selection}`);
        } else {
            await this.app.vault.create(`${selection}.md`, `# ${selection}`);
            editor.replaceSelection(`[[${selection}]]`);
            new Notice(`Created new note: ${selection}`);
        }
    }
}