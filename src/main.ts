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
    const rawSelection = editor.getSelection();
    if (!rawSelection || rawSelection.trim() === "") return;

    // Clean the selection for the filename, but keep rawSelection for the text display
    const cleanedName = this.cleanFilename(rawSelection);
    
    let folderPath = this.settings.folderPath.trim();
    
    if (folderPath !== "") {
        const folderExists = await this.app.vault.adapter.exists(folderPath);
        if (!folderExists) {
            await this.app.vault.createFolder(folderPath);
        }
        if (!folderPath.endsWith('/')) folderPath += '/';
    }

    const fullPath = `${folderPath}${cleanedName}.md`;
    const existingFile = this.app.metadataCache.getFirstLinkpathDest(cleanedName, "");

    if (existingFile) {
        // If it exists, we link it. We use an alias [[CleanName|Original Text]] 
        // so the user's document still looks the way they highlighted it.
        editor.replaceSelection(`[[${cleanedName}|${rawSelection}]]`);
        new Notice(`Linked to existing note.`);
    } else {
        try {
            await this.app.vault.create(fullPath, `# ${cleanedName}`);
            // Create link with alias
            editor.replaceSelection(`[[${cleanedName}|${rawSelection}]]`);
            new Notice(`Created: ${cleanedName}`);
        } catch (error) {
            new Notice("Error creating file. Check console.");
            console.error(error);
        }
    }
}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	
	cleanFilename(name: string): string {
    	return name.replace(/[\\/:*?"<>|]/g, '').trim();
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