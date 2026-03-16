import { App, Plugin, MarkdownView, Notice, PluginSettingTab, Setting } from 'obsidian';

interface AltLinkSettings {
	triggerKey: string;
}

const DEFAULT_SETTINGS: AltLinkSettings = {
	triggerKey: 'Alt'
}

export default class AltLink extends Plugin {
	settings!: AltLinkSettings;

	async onload() {
		await this.loadSettings();
		
		this.addSettingTab(new AltLinkSettingTab(this.app, this));

		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
			const isTrigger = evt.key === this.settings.triggerKey;
			
			if (isTrigger) {
				const isModifier = ['Alt', 'Control', 'Shift', 'Meta'].includes(evt.key);
				if (isModifier || (!evt.shiftKey && !evt.ctrlKey && !evt.metaKey)) {
					void this.makeLink();
				}
			}
		});
	}

	async makeLink() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const editor = activeView.editor;
		const rawSelection = editor.getSelection();
		
		if (!rawSelection || rawSelection.trim() === "") return;

		const cleanedName = this.cleanFilename(rawSelection);

		if (cleanedName === rawSelection) {
			editor.replaceSelection(`[[${rawSelection}]]`);
		} else {
			editor.replaceSelection(`[[${cleanedName}|${rawSelection}]]`);
		}

		new Notice(`Link created: ${cleanedName}`);
	}

	cleanFilename(name: string): string {
		return name.replace(/[\\/:*?"<>|]/g, '').trim();
	}

	async loadSettings() {
		const loaded = await this.loadData() as Partial<AltLinkSettings>; this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
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

		new Setting(containerEl) .setName('AltLink settings') .setHeading();

		new Setting(containerEl)
			.setName('Trigger key')
			.setDesc('Which key should trigger the link? (Common: Alt, F2, `)')
			.addText(text => text
				.setPlaceholder('Alt')
				.setValue(this.plugin.settings.triggerKey)
				.onChange(async (value) => {
					const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
					this.plugin.settings.triggerKey = formattedValue;
					await this.plugin.saveSettings();
				}));
	}
}