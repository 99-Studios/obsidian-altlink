import { App, Plugin, MarkdownView, Notice, PluginSettingTab, Setting } from 'obsidian';

interface AltLinkSettings {
	folderPath: string;
}

const DEFAULT_SETTINGS: AltLinkSettings = {
	folderPath: '' // Default is the root of your vault
}

export default class AltLink extends Plugin {
    settings!: AltLinkSettings;

	async onload() {
		await this.loadSettings();

		// This adds the settings tab to Obsidian
		this.addSettingTab(new AltLinkSettingTab(this.app, this));

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

    let folderPath = this.settings.folderPath.trim();
    
    // 1. If a folder is specified, make sure it exists
    if (folderPath !== "") {
        const folderExists = await this.app.vault.adapter.exists(folderPath);
        if (!folderExists) {
            await this.app.vault.createFolder(folderPath);
            new Notice(`Created folder: ${folderPath}`);
        }
        if (!folderPath.endsWith('/')) folderPath += '/';
    }

    const fullPath = `${folderPath}${selection}.md`;
    const existingFile = this.app.metadataCache.getFirstLinkpathDest(selection, "");

    if (existingFile) {
        editor.replaceSelection(`[[${selection}]]`);
        new Notice(`Linked to existing note.`);
    } else {
        await this.app.vault.create(fullPath, `# ${selection}`);
        editor.replaceSelection(`[[${selection}]]`);
        new Notice(`Created in ${folderPath || 'root'}`);
    }
}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AltLinkSettingTab extends PluginSettingTab {
	plugin: AltLink;

	constructor(app: App, plugin: AltLink) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Target Folder')
			.setDesc('New notes created with Alt will be placed here (e.g., "Inbox"). Leave blank for vault root.')
			.addText(text => text
				.setPlaceholder('Enter folder name')
				.setValue(this.plugin.settings.folderPath)
				.onChange(async (value) => {
					this.plugin.settings.folderPath = value;
					await this.plugin.saveSettings();
				}));
	}
}