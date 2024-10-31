﻿/*
  Zoom And Center.jsx
  Requirements: Adobe Illustrator CS6 and later
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Modification date: August, 2024
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Original Script: Zoom and Center to Selection v2.
  JS code (c) copyright: John Wundes ( john@wundes.com ) http://www.wundes.com
  copyright full text here:  http://www.wundes.com/js4ai/copyright.txt

  Modification by Sergey Osokin ( hi@sergosokin.ru ) https://github.com/creold
  Description: Zooms active view to all object(s) in a document or to selection.
  Used code from FitArtboardToArt.jsx by Darryl Zurn

  Release notes:
  1.2.3 Added deselecting guides to exclude from zooming
  1.2.2 Removed radiobutton activation on Windows OS below CC v26.4
  1.2.1 Fixed radiobutton activation in Windows OS
  1.2 Fixed "Illustrator quit unexpectedly" error
  1.1 Fixed zoom in text editing mode
  1.0 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2025 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Zoom \u0026 Center',
        version: 'v1.2.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        ratio: .75, // Zoom ratio in document window
        limit: 4000 // The amount of objects, when the script can run slowly
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  var doc = app.activeDocument,
      lockedItems = [],
      lockedLayers = [];

  if (!doc.pageItems.length) return;

  // Create Main Window
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  // Zoom to locked item checkbox
  var option = win.add('panel', undefined, 'Zoom in');
      option.orientation = 'column';
      option.alignChildren = 'fill';
      option.margins = [10, 20, 10, 10];
  var zoomVis = option.add('radiobutton', undefined, 'Visible unlocked'),
      zoomLock = option.add('radiobutton', undefined, 'Not including hidden'),
      zoomAll = option.add('radiobutton', undefined, 'All in document');
      zoomVis.value = true;

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    zoomVis.active = true;
  }

  // If the number of objects is large, the script can run slowly. 
  // The number depends on the performance of the computer 
  var objCounter = getCountObj(doc);
  if (objCounter > CFG.limit) {
      var warning = win.add('panel');
      warning.orientation = 'column';
      warning.margins = 5;
      var warningTxt = warning.add('statictext', undefined, { multiline: true });
      warningTxt.text = 'The document has over ' + CFG.limit + ' objects. The script can run slowly';
      warningTxt.justify = "center";
  }

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = 'center';
      btns.margins = [0, 10, 0, 0];
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
      cancel.helpTip = 'Press Esc to Close';
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});
      ok.helpTip = 'Press Enter to Run';

  // Begin access key shortcut
  win.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (key.match(/1/)) zoomVis.notify();
    if (key.match(/2/)) zoomLock.notify();
    if (key.match(/3/)) zoomAll.notify();
  });
  // End access key shortcut

  cancel.onClick = win.close;
  ok.onClick = okClick;

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    if (zoomVis.value) {
      app.executeMenuCommand('selectall');
      deselectGuides(app.selection);
      calcBounds(app.selection);
      app.selection = null;
    } else if (zoomLock.value) {
      saveItemsState(doc, lockedItems, lockedLayers);
      app.executeMenuCommand('selectall');
      deselectGuides(app.selection);
      calcBounds(app.selection);
      app.selection = null;
      restoreItemsState(doc, lockedItems, lockedLayers);
    } else if (zoomAll.value) {
      // The VisibleBounds rect is in this order: 0 - left, 1 - right, 2 - top, 3 - bottom
      var totalBnds = [Infinity, -Infinity, -Infinity, Infinity];
      for (var i = 0, piLen = doc.pageItems.length; i < piLen; i++) {
        var item = doc.pageItems[i];
        if (item.typename === 'GroupItem' || isGuide(item)) continue;
        // We want the ultimate maximum bounds, so select the minimum left and bottom, and max right and top of our rect.
        totalBnds[0] = Math.min(totalBnds[0], item.visibleBounds[0]);
        totalBnds[1] = Math.max(totalBnds[1], item.visibleBounds[1]);
        totalBnds[2] = Math.max(totalBnds[2], item.visibleBounds[2]);
        totalBnds[3] = Math.min(totalBnds[3], item.visibleBounds[3]);
      }
      ul_x = totalBnds[0];
      ul_y = totalBnds[1];
      lr_x = totalBnds[2];
      lr_y = totalBnds[3];
    }

    zoom(CFG.ratio);
    win.close();
  }

  // Start zoom
  // Define the current TextFrames to zoom, if text editing mode is active
  deselectGuides(app.selection);
  if (app.selection.typename === 'TextRange') {
    var selTextFrames = getActiveTextFrames();
    calcBounds(selTextFrames);
    zoom(CFG.ratio);
  } else if (app.selection.length > 0) {
    calcBounds(app.selection);
    zoom(CFG.ratio);
  } else {
    win.center();
    win.show();
  }
}

function getActiveTextFrames() {
  var parentTextFrames = app.selection.parent.textFrames,
      selTextFrames = [],
      firstFrameIdx, lastFrameIdx;

  for (var i = 0, tfLen = parentTextFrames.length; i < tfLen; i++) {
    if (app.selection.start >= parentTextFrames[i].textRange.start &&
        app.selection.start <= parentTextFrames[i].textRange.end) {
      firstFrameIdx = i;
    }
    if (app.selection.end >= parentTextFrames[i].textRange.start &&
        app.selection.end <= parentTextFrames[i].textRange.end) {
      lastFrameIdx = i;
    }
  }

  for (var j = firstFrameIdx; j <= lastFrameIdx; j++) {
    selTextFrames.push(parentTextFrames[j]);
  }

  return selTextFrames;
}

function calcBounds(sel) {
  // If object is a (collection of) object(s) not a text field.
  if (sel instanceof Array) {
    // Initialize vars
    initBounds = sel[0].visibleBounds;
    ul_x = initBounds[0];
    ul_y = initBounds[1];
    lr_x = initBounds[2];
    lr_y = initBounds[3];
    // Check rest of group if any
    for (i = 1, sLen = sel.length; i < sLen; i++) {
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

function deselectGuides(arr) {
  var item = null;

  for (var i = 0, len = arr.length; i < len; i++) {
    var item = arr[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) {
      deselectGuides(item.pageItems);
    } else if (isGuide(item)) {
      item.selected = false;
    }
  }
}

function isGuide(item) {
  return (item.hasOwnProperty('guides') && item.guides)
      || (item.typename === 'CompoundPathItem' && item.pathItems.length && item.pathItems[0].guides);
}

function zoom(ratio) {
  var doc = app.activeDocument;
  // Get x,y/x,y Matrix for 100% view
  doc.views[0].zoom = 1;
  ScreenSize = doc.views[0].bounds;
  ScreenWidth = ScreenSize[2] - ScreenSize[0];
  ScreenHeight = ScreenSize[1] - ScreenSize[3];
  screenProportion = ScreenHeight / ScreenWidth;

  // Determine upperLeft position of object(s)
  cntrPos = [ul_x, ul_y];

  mySelWidth = lr_x - ul_x;
  mySelHeight = ul_y - lr_y;
  cntrPos[0] = ul_x + mySelWidth / 2;
  cntrPos[1] = ul_y - mySelHeight / 2;
  doc.views[0].centerPoint = cntrPos;

  // Set zoom for height and width
  zoomFactorW = ScreenWidth / mySelWidth;
  zoomFactorH = ScreenHeight / mySelHeight;

  // Decide which proportion is larger...
  if (mySelWidth * screenProportion >= mySelHeight) {
    zF = zoomFactorW;
  } else {
    zF = zoomFactorH;
  }

  // And scale to that proportion minus a little bit.
  doc.views[0].zoom = zF * ratio;
}

// Save information about locked Layers, pageItems
function saveItemsState(target, _items, _layers) {
  for (var i = 0, lyrLen = target.layers.length; i < lyrLen; i++) {
    if (target.layers[i].locked) {
      target.layers[i].locked = false;
      _layers.push(i);
    }
  }

  for (var j = 0, piLen = target.pageItems.length; j < piLen; j++) {
    var currItem = target.pageItems[j];
    if (currItem.locked && !currItem.hidden && currItem.layer.visible) {
      _items.push(j);
      currItem.locked = false;
    }
  }
}

// Restoring locked Layers, pageItems
function restoreItemsState(target, _items, _layers) {
  for (var i = 0, iLen = _items.length; i < iLen; i++) {
    var idx = _items[i];
    target.pageItems[idx].locked = true;
  }

  for (var j = 0, lyrLen = _layers.length; j < lyrLen; j++) {
    var idx = _layers[j];
    target.layers[idx].locked = true;
  }
}

function getCountObj(target) {
  return target.pageItems.length;
}

// Open link in browser
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}