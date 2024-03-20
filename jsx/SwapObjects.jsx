/*
  SwapObjects.jsx for Adobe Illustrator
  Description: Swaps the coordinates of two selected objects by reference point and the order within the layer optionally
  Date: March, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.1 Fixed selection bug in preview mode
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2024 (Mac/Win).
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
    name: 'Swap Objects',
    version: 'v0.1.1'
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('version:16', 'selection:2')) return;

  deselectGuides(app.selection);

  var refPointArr = new Array(9); // Reference points array
  var refPointDef = [false, false, false, false, true, false, false, false, false];   // Default values for reference points
  var refHints = ['Top Left', 'Top', 'Top Right', 'Left', 'Center', 'Right', 'Bottom Left', 'Bottom', 'Bottom Right']; // Reference point names

  var doc = app.activeDocument;

  var isUndo = false; // For preview

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.opacity = .97;

  var wrapper = win.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = ['left', 'top'];
      wrapper.spacing = 25;
  
  var swapPnl = wrapper.add('panel', undefined, 'Properties');
      swapPnl.orientation = 'column';
      swapPnl.alignChildren = 'fill';
      swapPnl.margins = [10, 22, 10, 7];

  var isSwapX = swapPnl.add('checkbox', undefined, 'X-axis');
      isSwapX.value = true;
  var isSwapY = swapPnl.add('checkbox', undefined, 'Y-axis');
      isSwapY.value = true;

  var isSwapOrder = swapPnl.add('checkbox', undefined, 'Order in Layers');
      isSwapOrder.value = true;

  var refPnl = wrapper.add('panel', undefined, 'Reference Point');
      refPnl.orientation = 'row';
      refPnl.bounds = [0, 0, 116, 116];

  // Create reference point matrix
  var idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(refPnl, j, i, refPointDef[idx], refHints[idx]);
      idx++;
    }
  }

  // Bounds
  var bndsPnl = win.add('panel', undefined, 'Object dimensions');
      bndsPnl.orientation = 'row';
      bndsPnl.alignment = 'fill';
      bndsPnl.margins = [10, 15, 10, 7];

  var geoRb = bndsPnl.add('radiobutton', undefined, 'Geometric');
      geoRb.helpTip = 'The bounds of object\nexcluding stroke width and effects';
      geoRb.value = true;
  var visRb = bndsPnl.add('radiobutton', undefined, 'Visible (stroke & effects)');
      visRb.helpTip = 'The visible bounds of object\nincluding stroke width and effects';

  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignment = 'right';

  var isPreview = btns.add('checkbox', undefined, 'Preview');
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'OK', {name: 'ok'});
  
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');

  loadSettings(SETTINGS);

  var dataA = getObjectData(doc.selection[0]);
  var dataB = getObjectData(doc.selection[1]);

  // Events
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  isPreview.onClick = preview;
  isSwapX.onClick = isSwapY.onClick = isSwapOrder.onClick = preview;
  geoRb.onClick = visRb.onClick = preview;

  for (var i = 0; i < refPointArr.length; i++) {
    refPointArr[i].onClick = preview;
  }

  function preview() {
    if (isPreview.value) {
      if (isUndo) app.undo();
      else isUndo = true;
      start();
      app.selection = null;
      app.redraw();
    } else if (isUndo) {
      app.undo();
      app.redraw();
      isUndo = false;
    }
  }

  function start() {
    var refPoint = getReferencePoint(refHints, refPointArr);

    if (isSwapX.value || isSwapY.value) {
      swapPositions(dataA, dataB, isSwapX.value, isSwapY.value, geoRb.value, refPoint);
    }

    if (isSwapOrder.value) {
      swapOrderInLayer(dataA.obj, dataB.obj);
    }
  }

  ok.onClick = okClick;

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    saveSettings(SETTINGS);
    win.close();
  }

  cancel.onClick = win.close;

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    app.selection = [dataA.obj, dataB.obj];
  }

  /**
   * Get the reference point name based on the index of the active radio button
   *
   * @param {Array} hints - Array of reference point names
   * @param {Array} arr - Array of radio buttons representing reference points
   * @returns {string} - The name of the reference point
   */
  function getReferencePoint(hints, arr) {
    var str = hints[4];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value) {
        str = hints[i];
        break;
      }
    }
    return str.replace(/\s+/g, '').toUpperCase();
  }

  /**
   * Save UI options to a file
   *
   * @param {object} prefs - Object containing preferences
   */
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.x = isSwapX.value;
    pref.y = isSwapY.value;
    pref.order = isSwapOrder.value;
    for (var i = 0, len = refPnl.children.length; i < len; i++) {
      if (refPnl.children[i].value) {
        pref.point = i;
        break;
      }
      pref.point = 4;
    }
    pref.bounds = geoRb.value ? 0 : 1;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  /**
   * Load options from a file
   *
   * @param {object} prefs - Object containing preferences
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var pref = new Function('return ' + json)();
        f.close();
        if (typeof pref != 'undefined') {
          isSwapX.value = pref.x;
          isSwapY.value = pref.y;
          isSwapOrder.value = pref.order;
          refPnl.children[pref.point].value = true;
          bndsPnl.children[pref.bounds].value = true;
        }
      } catch (err) {}
    }
  }

  win.center();
  win.show();
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Wrong app version\nSorry, script only works in Illustrator v.' + rqdVers + ' and later', 'Script error');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!app.documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select ' + rqdLen + ' path(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Deselect guide paths from a collection of items recursively
 *
 * @param {[Object|Array]} coll - The collection of items to deselect guide paths from
 * @returns {void}
 */
function deselectGuides(coll) {
  var item = null;

  for (var i = 0, len = coll.length; i < len; i++) {
    item = coll[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) {
      deselectGuides(item.pageItems);
    } else if (
      (item.hasOwnProperty('guides') && item.guides)
      || (item.typename === 'CompoundPathItem' && item.pathItems.length && item.pathItems[0].guides)) {
      item.selected = false;
    }
  }
}

/**
 * Retrieve geometric and visible bounds data of the given object
 *
 * @param {object} obj - The object for which data is to be retrieved
 * @returns {object} - An object containing the input object and its geometric and visible bounds data
 */
function getObjectData(obj) {
  var data = { obj: obj };

  // Retrieve geometric bounds data
  data.gBounds = getVisibleBounds(obj, 'geometricBounds');
  data.gWidth = data.gBounds[2] - data.gBounds[0];
  data.gHeight = data.gBounds[1] - data.gBounds[3];

  // Retrieve visible bounds data
  data.vBounds = getVisibleBounds(obj, 'visibleBounds'),
  data.vWidth = data.vBounds[2] - data.vBounds[0];
  data.vHeight = data.vBounds[1] - data.vBounds[3];

  return data;
}

// Get the actual "visible" bounds
// https://github.com/joshbduncan/adobe-scripts/blob/main/DrawVisibleBounds.jsx
function getVisibleBounds(obj, bndsType) {
  if (arguments.length == 1 || bndsType == undefined) bndsType = 'geometricBounds';
  var doc = app.activeDocument;
  var bnds, clippedItem, tmpItem, tmpLayer;
  var curItem;
  if (obj.typename === 'GroupItem') {
    if (obj.clipped) {
      // Check all sub objects to find the clipping path
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename === 'CompoundPathItem') {
          if (!curItem.pathItems.length) {
            // Catch compound path items with no pathItems
            // via William Dowling @ github.com/wdjsdev
            tmpLayer = doc.layers.add();
            tmpItem = curItem.duplicate(tmpLayer);
            app.executeMenuCommand('deselectall');
            tmpItem.selected = true;
            app.executeMenuCommand('noCompoundPath');
            tmpLayer.hasSelectedArtwork = true;
            app.executeMenuCommand('group');
            clippedItem = selection[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        }
      }
      if (!clippedItem) clippedItem = obj.pageItems[0];
      bnds = clippedItem[bndsType];
      if (tmpLayer) {
        tmpLayer.remove();
        tmpLayer = undefined;
      }
    } else {
      // If the object is not clipped
      var subObjBnds;
      var allBoundPoints = [[], [], [], []];
      // Get the bounds of every object in the group
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        subObjBnds = getVisibleBounds(curItem, bndsType);
        allBoundPoints[0].push(subObjBnds[0]);
        allBoundPoints[1].push(subObjBnds[1]);
        allBoundPoints[2].push(subObjBnds[2]);
        allBoundPoints[3].push(subObjBnds[3]);
      }
      // Determine the groups bounds from it sub object bound points
      bnds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bnds = obj[bndsType];
  }
  return bnds;
}

/**
 * Generate a radio button and adds it to a specified UI window, panel, or group
 *
 * @param {object} place - The UI window, panel, or group to which the radio button will be added
 * @param {number} x - The column position of the radio button
 * @param {number} y - The row position of the radio button
 * @param {boolean} val - The initial state of the radio button
 * @param {string} info - The tooltip information for the radio button
 * @returns {object} The generated radio button object
 */
function addRadio(place, x, y, val, info) {
  var rb = place.add('radiobutton', undefined, x);

  // Calculate position and size based on grid layout
  var step = 30;
  var x0 = y0 = 20;
  var d = 14; // Padding
  x = x0 + step * x;
  y = y0 + step * y;

  // Set position and size of the radio button
  rb.bounds = [x, y, x + d, y + d]; 
  
  // Set initial value and tooltip information
  rb.value = val;
  rb.helpTip = info;

  return rb;
}

/**
 * Swap the coordinates of two objects based on specified reference points
 *
 * @param {Object} dataA - The first object and its dimension information
 * @param {Object} dataB - The second object and its dimension information
 * @param {boolean} isX - Indicates whether the swap should happen along the X-axis
 * @param {boolean} isY - Indicates whether the swap should happen along the Y-axis
 * @param {boolean} isGeometric - Indicates whether to use geometric bounds or visible bounds for calculations
 * @param {string} ref - The reference point for the swap, e.g., 'TOPLEFT', 'CENTER', etc
 */
function swapPositions(dataA, dataB, isX, isY, isGeometric, ref) {
  var deltaX = isX ? (isGeometric ? dataB.gBounds[0] - dataA.gBounds[0] : dataB.vBounds[0] - dataA.vBounds[0]) : 0;
  var deltaY = isY ? (isGeometric ? dataB.gBounds[1] - dataA.gBounds[1] : dataB.vBounds[1] - dataA.vBounds[1]) : 0;

  var deltaWidth = isGeometric ? dataB.gWidth - dataA.gWidth : dataB.vWidth - dataA.vWidth;
  var deltaHeight = isGeometric ? dataA.gHeight - dataB.gHeight : dataA.vHeight - dataB.vHeight;

  var offsetX = isX ? (deltaWidth) * 0.5 : 0;
  var offsetY = isY ? (isGeometric ? dataB.gHeight - dataA.gHeight : dataB.vHeight - dataA.vHeight) * 0.5 : 0;

  var translateX = 0;
  var translateY = 0;

  switch (ref) {
    case 'TOPLEFT':
      translateX = deltaX;
      translateY = deltaY;
      break;
    case 'TOP':
      translateX = deltaX + offsetX;
      translateY = deltaY;
      break;
    case 'TOPRIGHT':
      translateX = deltaWidth + deltaX;
      translateY = deltaY;
      break;
    case 'LEFT':
      translateX = deltaX;
      translateY = deltaY - offsetY;
      break;
    case 'CENTER':
      translateX = deltaX + offsetX;
      translateY = deltaY - offsetY;
      break;
    case 'RIGHT':
      translateX = deltaWidth + deltaX;
      translateY = deltaY - offsetY;
      break;
    case 'BOTTOMLEFT':
      translateX = deltaX;
      translateY = deltaHeight + deltaY;
      break;
    case 'BOTTOM':
      translateX = deltaX + offsetX;
      translateY = deltaHeight + deltaY;
      break;
    case 'BOTTOMRIGHT':
      translateX = deltaWidth + deltaX;
      translateY = deltaHeight + deltaY;
      break;
    default:
      break;
  }

  try {
    dataA.obj.translate(translateX, translateY);
    dataB.obj.translate(-translateX, -translateY); // Reverse translation for second object
  } catch (err) {}
}

/**
 * Swap the order of items in layers by moving them relative to each other
 *
 * @param {object} objA - The first selected item whose order needs to be swapped
 * @param {object} objB - The second selected item whose order needs to be swapped
 */
function swapOrderInLayer(objA, objB) {
  var tmpObj = objA.parent.pathItems.add();

  tmpObj.move(objA, ElementPlacement.PLACEBEFORE);
  objA.move(objB, ElementPlacement.PLACEBEFORE);
  objB.move(tmpObj, ElementPlacement.PLACEBEFORE);

  tmpObj.remove();
}

/**
 * Opens a URL in the default web browser
 * 
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

try {
  main();
} catch (err) {}