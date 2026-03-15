# AltLink

AltLink is a lightweight Obsidian plugin designed for "Top-Down" thinkers. It allows you to instantly transform selected text into Wikilinks by tapping a single key, without interrupting your flow or cluttering your vault with empty notes.

## Features

- **Instant Wikilinks:** Highlight any text and tap your trigger key (Default: `Alt`) to wrap it in `[[ ]]`.
- **Automatic Aliasing:** If your selection contains characters that are illegal in filenames (like `?`, `:`, or `*`), AltLink automatically cleans the link path while keeping your original text as an alias (e.g., `[[Clean Name|Original Text?]]`).
- **No Note Clutter:** Unlike standard Obsidian behavior, this plugin does not create the underlying file until you decide to click the link.
- **Customizable Trigger:** Change the trigger key in settings to any key that fits your workflow (Alt, F2, Backtick, etc.).

## How to Use

1. Highlight the text you want to turn into a link.
2. Tap the **Alt** key (or your custom trigger key).
3. The text is instantly converted into a Wikilink.

## Installation

### From Community Plugins (Pending)
1. Search for `AltLink` in the Obsidian Community Plugins browser.
2. Click Install, then Enable.

### Manual Installation
1. Download `main.js` and `manifest.json` from the latest [Release](link-to-your-github-releases-here).
2. Create a folder named `altlink` in your vault's `.obsidian/plugins/` directory.
3. Move the downloaded files into that folder.
4. Reload Obsidian and enable the plugin in settings.

## Settings

- **Trigger Key:** Set the key used to trigger the link conversion. Note: Use the standard KeyboardEvent key names (e.g., `Alt`, `F2`, `` ` ``).