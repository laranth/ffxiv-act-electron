# Linux ACT Electron Overlay

Rough implementation to allow various ACT Overlays to display over FFXIV. Functionality has only been tested on Arch on X11 on GNOME's Mutter compositor.

## Prerequisites
- [Node.js](https://nodejs.org/)
- [Electron](https://electronjs.org/) 

## Installation
- Clone the repository
- Navigate to project directory 
- Run 'npm install' to install Electron
- Start the application with 'npm start'.

## Usage
Requires ACT installed per [valarnin's repository.](https://github.com/valarnin/ffxiv-tools), with OverlayPlugin WSServer started. 
- Displays two overlays on Monitor 1 (Cactbot & Kagerou by default)
- Ctrl + Shift + D will toggle mouse click-through, allowing you to control and configure the kagerou overlay.

## Customization
- **Window URLs.**: To change the content displayed in either window, modify the `loadURL` calls in the `createWindow` function within `main.js`.
    - Replace "('file:///home/cora/.xlcore/wineprefix/drive_c/users/cora/AppData/Roaming/Advanced%20Combat%20Tracker/Plugins/cactbot/cactbot/ui/raidboss/raidboss.html?OVERLAY_WS=ws://127.0.0.1:10501/ws');" with your appropriate username and wine prefix directory.
- **Global Shortcut**: The global shortcut can be changed by modifying the argument passed to `globalShortcut.register` in the `app.whenReady().then()` function.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.
