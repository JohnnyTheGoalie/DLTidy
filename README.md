# DLTidy

DLTidy is a Firefox extension that intercepts downloads and lets you choose whether to save them permanently or temporarily. Temporary downloads are stored in a separate folder and cleaned up automatically after a set number of days.

## Features

- Intercepts user-initiated downloads
- Prompts the user to save the file as either "Temporary" or "Permanent"
- Automatically removes temporary downloads after a specified number of days (default: 7)
- Simple settings panel to change default behavior and enable/disable the extension

## How It Works

1. When a download is triggered, it is canceled immediately.
2. A popup appears asking whether to save the file permanently or temporarily.
3. If "Temporary" is chosen, the file is saved in `Downloads/clutter/` and tracked for cleanup.
4. If "Permanent" is chosen, the file is saved normally.
5. Cleanup runs on startup and periodically (every 5 minutes) to remove expired temp files.
