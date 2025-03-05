// Run me with: npm start -- ./config.json

const {BrowserWindow, globalShortcut} = require('electron'); // declare a few things from electron

let myConfig; // configuration struct from JSON
let myViewConfigs = []; // parsed and sanitized
let myViews       = []; // list of BrowserWindows we've launched
let myAllowInteraction = false; // interaction disabled by default

function inhaleJSONConfig() {
    if (process.argv.length > 2) {
        try {
            console.log('INFO: Parsing configuration file:', process.argv[2], '...');
            let fs = require('node:fs');
            myConfig = JSON.parse(fs.readFileSync(process.argv[2]));
        }
        catch (e) {
            console.log('ERROR: problem reading the JSON file passed on the command line...');
            console.dir(e);
            process.exit(1);
        }
    } else {
        console.log("ERROR: No JSON config file passed in on command line... exiting.");
        process.exit(1);
    }
}

function flipDebug() {
    for (let i = 0; i <  myViewConfigs.length; i++) {
        if (myViewConfigs[i].debug) {
            if (myAllowInteraction) {
                myViews[i].hide();
            } else {
                myViews[i].show();
            }
        }
    }
    myAllowInteraction = !myAllowInteraction;
    for (let i = 0; i < myViews.length; i++) {
        myViews[i].setIgnoreMouseEvents(!myAllowInteraction, {forward:true});
    }
}

// TODO: split this into 2 keybinds: 1 to disable clickthru
//       and one to add a background color so you can see where these invisible overlays really are (and maybe even move them around!)
function bindKeys() {
    if ('keyBind' in myConfig &&
        myConfig.keyBind != null &&
        !myConfig.keyBind.trim().isEmpty) {
        // TODO here more input sanity checks
        let myKeyBinding = myConfig.keyBind.trim();

        if (!globalShortcut.register(myKeyBinding, () => {flipDebug();})) {
            console.log('ERROR: Keybinding registration failed, exiting...');
            process.exit(1);
        }
        console.log("INFO: Keybind",myConfig.keyBind," successfully registered!");

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
                    }
                    myViewConfigs.push({
                        'name'  : myConfig.views[i].name,
                        'url'   : url,
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

function createViews() {
    console.log('INFO: Setting up',myViewConfigs.length,'Views ...');

    for (let i = 0; i < myViewConfigs.length; i++) {
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
                zoomFactor                 : myViewConfigs[i].zoom,
                nodeIntegration            : true,
                contextIsolation           : false,
                enableRemoteModule         : true,
            }
        });
        //TODO:idea? put a name on that window instead of rendering contents+background??? myViews[i].setBackgroundColor('blueviolet');
        myViews[i].loadURL(myViewConfigs[i].url);
        myViews[i].setIgnoreMouseEvents(!myAllowInteraction, {forward:true});
    }
}

function main() {
    inhaleJSONConfig();
    bindKeys();
    parseViews();
    createViews();
    console.log("INFO: Overlays loaded!");
}

const { app } = require('electron');

//console.dir(app.getGPUInfo('complete'))
//console.dir(app.getGPUFeatureStatus())
app.disableHardwareAcceleration(); // we're using software compositing, so might as well skip spawning a mostly-useless GPU raster job

app.whenReady().then(() => {main();});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    console.log("INFO: unregistering keybind...");
    globalShortcut.unregisterAll();
});
