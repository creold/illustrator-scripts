// Zoom And Center.jsx
// Requirements: Adobe Illustrator CS6 / CC
//============================================================================
// Original Script: Zoom and Center to Selection v2.
// Description: Zooms active view to selected object(s).
// New in v.2: If nothing is selected; sets view to 100% at current location.
//============================================================================
// JS code (c) copyright: John Wundes ( john@wundes.com ) http://www.wundes.com
// copyright full text here:  http://www.wundes.com/js4ai/copyright.txt
//============================================================================
// Modification by Sergey Osokin ( hi@sergosokin.ru ) https://github.com/creold
// Description: Zooms active view to all object(s) in a document or to selection.
// Used code from FitArtboardToArt.jsx by Darryl Zurn ( daz-scripting@zzzurn.com )
// ============================================================================
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ============================================================================
// Check other author's scripts: https://github.com/creold

//@target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

//Global variables
if (documents.length > 0) {
    var doc = app.activeDocument,
        lockedItems = new Array(),
        lockedLayers = new Array();
}

function main() {
    // Create Main Window
    var win = new Window('dialog', 'Zoom \u0026 Center', undefined);
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

    // Zoom to locked item checkbox
    var option = win.add('panel', undefined, 'What objects to include');
    option.orientation = 'column';
    option.alignChildren = ['fill', 'fill'];
    option.margins = [20, 20, 10, 10];
    var zoomVis = option.add('radiobutton', undefined, 'Visible unlocked'),
        zoomLock = option.add('radiobutton', undefined, 'All except hidden'),
        zoomAll = option.add('radiobutton', undefined, 'All in document');
    zoomVis.value = true;

    // If the number of objects is large, the script can run slowly. 
    // The number depends on the performance of the computer 
    var chckCount = getCountObj(doc);
    if (chckCount > 4000) {
        var warning = win.add('panel');
        warning.orientation = 'column';
        warning.margins = 5;
        var warningTxt = warning.add('statictext', undefined, 'Found ' + chckCount + ' objects.\nIf you choose option 2 or 3 \nthe script can run slowly.', { multiline: true });
        warningTxt.justify = "center";
    }

    // Buttons
    var btns = win.add('group');
    btns.alignChildren = 'center';
    btns.margins = [0, 10, 0, 0];
    var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
    cancel.helpTip = 'Press Esc to Close';
    var ok = btns.add('button', undefined, 'OK', {name: 'ok'});
    ok.helpTip = 'Press Enter to Run';
    ok.active = true;
    cancel.onClick = function () { win.close(); }
    ok.onClick = okClick;

    var copyright = win.add('statictext', undefined, '\u00A9 www.sergosokin.ru');
    copyright.justify = 'center';
    copyright.enabled = false;

    function okClick() {
        if (zoomVis.value == true) {
            app.executeMenuCommand('selectall');
            calcBounds(doc.selection);
            doc.selection = null;
            zoom();
            win.close();
        }
        if (zoomLock.value == true) {
            saveItemsState(doc);
            app.executeMenuCommand('selectall');
            calcBounds(doc.selection);
            doc.selection = null;
            restoreItemsState(doc);
            zoom();
            win.close();
        }
        if (zoomAll.value == true) {
            // The VisibleBounds rect is in this order: 0 - left, 1 - right, 2 - top, 3 - bottom
            var myVisibleBounds = doc.pageItems[0].visibleBounds;
            for (var i = 1; i < doc.pageItems.length; i++) {
                // We want the ultimate maximum bounds, so select the minimum left and bottom, and max right and top of our rect.
                myVisibleBounds[0] = Math.min(myVisibleBounds[0], doc.pageItems[i].visibleBounds[0]);
                myVisibleBounds[1] = Math.max(myVisibleBounds[1], doc.pageItems[i].visibleBounds[1]);
                myVisibleBounds[2] = Math.max(myVisibleBounds[2], doc.pageItems[i].visibleBounds[2]);
                myVisibleBounds[3] = Math.min(myVisibleBounds[3], doc.pageItems[i].visibleBounds[3]);
            }
            ul_x = myVisibleBounds[0];
            ul_y = myVisibleBounds[1];
            lr_x = myVisibleBounds[2];
            lr_y = myVisibleBounds[3];
            zoom();
            win.close();
        }
    }

    // Start zoom
    if (doc.selection.length > 0) {
        calcBounds(doc.selection);
        zoom();
    } else {
        win.center();
        win.show();
    }
}

function calcBounds(sel) {
    //if object is a (collection of) object(s) not a text field.
    if (sel instanceof Array) {
        //initialize vars
        initBounds = sel[0].visibleBounds;
        ul_x = initBounds[0];
        ul_y = initBounds[1];
        lr_x = initBounds[2];
        lr_y = initBounds[3];
        //check rest of group if any
        for (i = 1; i < sel.length; i++) {
            groupBounds = sel[i].visibleBounds;
            if (groupBounds[0] < ul_x) {
                ul_x = groupBounds[0];
            }
            if (groupBounds[1] > ul_y) {
                ul_y = groupBounds[1];
            }
            if (groupBounds[2] > lr_x) {
                lr_x = groupBounds[2];
            }
            if (groupBounds[3] < lr_y) {
                lr_y = groupBounds[3];
            }
        }
    }
}

function zoom() {
    //get x,y/x,y Matrix for 100% view
    doc.views[0].zoom = 1;
    ScreenSize = doc.views[0].bounds;
    ScreenWidth = ScreenSize[2] - ScreenSize[0];
    ScreenHeight = ScreenSize[1] - ScreenSize[3];
    screenProportion = ScreenHeight / ScreenWidth;

    //Determine upperLeft position of object(s)
    cntrPos = [ul_x, ul_y];

    mySelWidth = lr_x - ul_x;
    mySelHeight = ul_y - lr_y;
    cntrPos[0] = ul_x + mySelWidth / 2;
    cntrPos[1] = ul_y - mySelHeight / 2;
    doc.views[0].centerPoint = cntrPos;

    //set zoom for height and width
    zoomFactorW = ScreenWidth / mySelWidth;
    zoomFactorH = ScreenHeight / mySelHeight;

    //decide which proportion is larger...
    if (mySelWidth * screenProportion >= mySelHeight) {
        zF = zoomFactorW;
    } else {
        zF = zoomFactorH;
    }

    //and scale to that proportion minus a little bit.
    doc.views[0].zoom = zF * 0.85;
}

// Save information about locked Layers, pageItems
function saveItemsState(target) {
    for (var i = 0; i < target.layers.length; i++) {
        if (target.layers[i].locked == true) {
            target.layers[i].locked = false;
            lockedLayers.push(i);
        }
    }
    for (var j = 0; j < target.pageItems.length; j++) {
        var currItem = target.pageItems[j];
        if (currItem.locked == true && currItem.hidden == false && currItem.layer.visible == true) {
            lockedItems.push(j);
            currItem.locked = false;
        }
    }
}

// Restoring locked Layers, pageItems
function restoreItemsState(target) {
    for (var k = 0; k < lockedItems.length; k++) {
        var idx = lockedItems[k];
        target.pageItems[idx].locked = true;
    }
    for (var l = 0; l < lockedLayers.length; l++) {
        var idx = lockedLayers[l];
        target.layers[idx].locked = true;
    }
}

function getCountObj(target) {
    return target.pageItems.length;
}

function showError(err) {
    if (confirm(scriptName + ': an unknown error has occurred.\n' +
        'Would you like to see more information?', true, 'Unknown Error')) {
        alert(err + ': on line ' + err.line, 'Script Error', true);
    }
}

try {
    if (documents.length > 0 && activeDocument.pageItems.length > 0) {
        main();
    }
} catch (e) {
    showError(e);
}