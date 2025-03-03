# Looking to Develop on this Fork
- DONE! Looking to add support for JSON configuration file rather than hardcoded paths.
    - The JSON file is passed via command line, i.e. `npm start -- ./config.json`
    - config.json included as an example, with explanations for the fields included as comments.
- TODO? Perhaps use one BaseWindow not multiple BrowserWindow copies?
- Testing with [IINACT](https://github.com/marzent/IINACT) 
- Testing with [XFCE4's built-in compositor](https://wiki.archlinux.org/title/Xfwm#Composite_manager) 

# Linux ACT Electron Overlay

Rough implementation to allow various ACT Overlays to display over FFXIV. Functionality has only been tested on [ArchLinux](https://archlinux.org/) on X11 with GNOME's Mutter compositor.

## Prerequisites
- [Node.js](https://nodejs.org/)
- [Electron](https://electronjs.org/), any version after 29.1.0
- [NPM](https://www.npmjs.com/)

However your particular machine gets these is up to you. (e.g. for Arch: `pacman -S nodejs electron34 npm`).

## Installation
- Clone the repository
- Navigate to project directory 
- Run `npm install` to install Electron
- Start the application with `npm start`.

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
