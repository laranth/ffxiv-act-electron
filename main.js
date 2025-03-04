// Run me with: npm start -- ./config.json 


const { app, BaseWindow, WebContentsView, BrowserWindow, globalShortcut, screen, View } = require('electron'); // declare a few things from electron
const fs = require('node:fs');

// NEW WAY
var myConfig; // configuration struct from JSON
var myViewConfigs = []; // parsed and sanitized
var myViews = [];
var myAllowInteraction = false; // interaction disabled by default

// UnderDevelopment: using one BaseWindow and mulitple WebContentView's as children of it
var myBaseWindow;
const newWayViaBaseWindow = false; // TODO: under development

function inhaleJSONConfig() {
    if (process.argv.length > 2) {
        try {
            console.log('INFO: Parsing configuration file:', process.argv[2], '...');
            myConfig = JSON.parse(fs.readFileSync(process.argv[2]));
        }
        catch (e) {
            console.log('ERROR: problem reading the JSON file passed on the command line...');
            console.log(e);
            process.exit(1);
        }

    } else {
        console.log("ERROR: No JSON config file passed in on command line... exiting.");
        process.exit(1);
    }
}

function bindKeys() {

    if ('keyBind' in myConfig &&
        myConfig.keyBind != null &&
        !myConfig.keyBind.trim().isEmpty) {
        // TODO here more input sanity checks
        let myKeyBinding = myConfig.keyBind.trim();

        const returnValue = globalShortcut.register(myKeyBinding, () => {
            for (let i = 0; i <  myViewConfigs.length; i++) {
                if (myViewConfigs[i].debug) {
                    //console.log("DEBUG: view[",i,"] is a debug one");
                    if (myAllowInteraction) {
                        myViews[i].hide();
                    } else {
                        myViews[i].show();
                    }
                }
            }
            //console.log("DEBUG: keybind press detected! is Interaction Allowed?",myAllowInteraction, "->", !myAllowInteraction);
            myAllowInteraction = !myAllowInteraction;
            if (newWayViaBaseWindow) { // TODO: UNDER DEVELOPMENT
                myBaseWindow.setFocusable(myAllowInteraction);
                myBaseWindow.setIgnoreMouseEvents(!myAllowInteraction, { forward: true });
            } else {
                for (let i = 0; i < myViews.length; i++) {
                    myViews[i].setIgnoreMouseEvents(!myAllowInteraction, {forward:true});
                }
            }
        });

        if (!returnValue) {
            console.log('ERROR: Keybinding registration failed, exiting...');
            process.exit(1);
        }
        console.log("INFO: Checking is the keybind registered: ", globalShortcut.isRegistered(myKeyBinding));

    } else { console.log("WARNING: No keybind configured, will not map any...");}

}

function parseViews() { // TODO here more input sanity checks
    if ('views' in myConfig &&
        Array.isArray(myConfig.views) &&
        myConfig.views.length > 0) {

        for (let i = 0; i < myConfig.views.length; i++) {
            if ('name'   in myConfig.views[i] &&
                'url'    in myConfig.views[i] &&
                'width'  in myConfig.views[i] &&
                'height' in myConfig.views[i] &&
                'x'      in myConfig.views[i] &&
                'y'      in myConfig.views[i]) {
                if (myConfig.views[i].name !== 'TEMPLATE') {
                    let zoom  = 1.0;
                    let debug = false;
                    let url   = myConfig.views[i].url;
                    if ('zoom' in myConfig.views[i]) {
                        zoom = myConfig.views[i].zoom;
                    }
                    if ('debug' in myConfig.views[i]) {
                        debug = myConfig.views[i].debug;
                    }

                    if (myConfig.views[i].url.match(/https?:\/\//) == null) {
                        url = require('url').format({
                            protocol: 'file',
                            slashes: true,
                            pathname: require('node:path').join(__dirname, url)
                        });
                        console.log("INFO: is file",url);
                    }
                    myViewConfigs.push({
                        'name'  : myConfig.views[i].name,
                        'url'   : url, //myConfig.views[i].url,
                        'width' : myConfig.views[i].width,
                        'height': myConfig.views[i].height,
                        'x'     : myConfig.views[i].x,
                        'y'     : myConfig.views[i].y,
                        'zoom'  : zoom,
                        'debug' : debug
                    });
                }
            } else {
                console.log("ERROR: view[",i,"] missing required key one of {name, url, width, height, x, y}.");
                process.exit(1);
            }
        }
    } else {
        console.log("ERROR: can't find any views in your JSON file!");
        process.exit(1);
    }
}

function createBaseWindow() {

    var myDisplay = screen.getPrimaryDisplay();
    var myRect    = myDisplay.bounds;

    //console.log('INFO: Setting up Base Window with ',myRect);

    // setup your base window to be the size of the primary display
    myBaseWindow = new BaseWindow({
        x             : myRect.x,
        y             : myRect.y,
        width         : myRect.width,
        height        : myRect.height,
        frame         : false,
        focusable     : false,
        transparent   : true,
        alwaysOnTop   : true,
        title         : "ffxiv iinact overlay",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            additionalArguments: ['--enable-transparent-visuals', '--disable-gpu']
        }
    });
    // start with a non-interactable window
    myBaseWindow.setIgnoreMouseEvents(!myAllowInteraction, {forward:true});
    myBaseWindow.show();

    // Make sure things close cleanly
    myBaseWindow.on('closed', () => {
        console.log("INFO: closing views...");
        var myKids = myBaseWindow.getChildWindows();
        for (let i = 0; i < myKids.length; i++) {
            myKids[i].webContents.close();
        };
    });
    //console.log(myBaseWindow);
}

function createViews() {  // TODO: UNDER DEVELOPMENT
    console.log('INFO: Setting up',myViewConfigs.length,'Views ...');

    for (let i = 0; i < myViewConfigs.length; i++) {
        console.log('INFO: Setting up view[',i,'] with',myViewConfigs[i]);
        try {
            const mine = new WebContentsView({
                webContents: {
                    zoomFactor: myViewConfigs[i].zoom,
                },
                webPreferences: {
                    transparent: true,
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    additionalArguments: ['--enable-transparent-visuals', '--disable-gpu']
                }
            });
            myViews.push(mine);
            mine.webContents.loadURL(myViewConfigs[i].url);
            myBaseWindow.contentView.addChildView(mine);
            mine.setBackgroundColor('red');
            mine.setBounds({
                x: myViewConfigs[i].x,
                y: myViewConfigs[i].y,
                width: myViewConfigs[i].width,
                height: myViewConfigs[i].height
            });
            //myViews[i].webContents.setZoomFactor(myViewConfigs[i].zoom);
            //myViews[i].setVisible(true/*!myViewConfigs[i].debug*/);
        } catch (e) {
            console.log("ERROR: while creating view[",i,"]");
            //console.log(myViews[i]);
            console.log(e);
            process.exit(1);
        }
    }
    console.log("INFO: Done setting up Views!");
}

function createOverlaysJSON() {
    console.log('INFO: Setting up',myViewConfigs.length,'Views via BrowserWindows ...');

    for (let i = 0; i < myViewConfigs.length; i++) {
        //console.log('INFO: Setting up view[',i,'] with',myViewConfigs[i]);
        myViews[i] = new BrowserWindow({
            width          : myViewConfigs[i].width,
            height         : myViewConfigs[i].height,
            x              : myViewConfigs[i].x,
            y              : myViewConfigs[i].y,
            show           : !myViewConfigs[i].debug,
            frame          : false,
            focusable      : false,
            transparent    : true,
            alwaysOnTop    : true,
            webPreferences : {
                zoomFactor          : myViewConfigs[i].zoom,
                nodeIntegration     : true,
                contextIsolation    : false,
                enableRemoteModule  : true,
                additionalArguments : ['--enable-transparent-visuals', '--disable-gpu']
            }
        });
        myViews[i].loadURL(myViewConfigs[i].url);
        myViews[i].setIgnoreMouseEvents(!myAllowInteraction, {forward:true});
    }
}

//app.disableHardwareAcceleration();

app.whenReady().then(() => {

    inhaleJSONConfig();
    bindKeys();
    parseViews();

    if (newWayViaBaseWindow) { // TODO: UNDER DEVELOPMENT
        createBaseWindow();
        createViews();
    } else {
        createOverlaysJSON();
    }

    console.log("INFO: Overlays loaded!");
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    console.log("INFO: unregistering keybind...");
    globalShortcut.unregisterAll();
});
