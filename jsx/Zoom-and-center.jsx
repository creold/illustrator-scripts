/*
  Zoom And Center.jsx
  Requirements: Adobe Illustrator CS6 and later
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Modification date: January, 2025
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Original Script: Zoom and Center to Selection v2.
  JS code (c) copyright: John Wundes ( john@wundes.com ) http://www.wundes.com
  copyright full text here:  http://www.wundes.com/js4ai/copyright.txt

  Modification by Sergey Osokin ( hi@sergosokin.ru ) https://github.com/creold
  Description: Zooms active view to all object(s) in a document or to selection.
  Used code from FitArtboardToArt.jsx by Darryl Zurn

  Release notes:
  1.3 Added zoom to selected points. Minor improvements
  1.2.3 Added deselecting guides to exclude from zooming
  1.2.2 Removed radiobutton activation on Windows OS below CC v26.4
  1.2.1 Fixed radiobutton activation in Windows OS
  1.2 Fixed "Illustrator quit unexpectedly" error
  1.1 Fixed zoom to text in edit mode
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
        name: 'Zoom and Center',
        version: 'v1.3'
      };

  var CFG = {
        ratio: 0.75, // Zoom ratio in document window
        limit: 4000, // The amount of objects, when the script can run slowly
        bnds: 'visibleBounds', // Type of object boundaries: visibleBounds including strokes and effects or geometricBounds
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (CFG.aiVers < 16) {
    alert('Wrong app version\nSorry, script only works in Illustrator CS6 and later', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  if (!doc.pageItems.length) return;

  deselectGuides(app.selection);

  var selBnds = [];
  
  if (app.selection.typename === 'TextRange') {
    // Define the current TextFrames to zoom, if text editing mode is active
    var selTFs = getTextFrames(app.selection);
    selBnds = getTotalBounds(selTFs, CFG.bnds);
    zoom(selBnds, CFG.ratio);
  } else if (app.selection.length) {
    selBnds = getTotalBounds( get(app.selection), CFG.bnds );
    zoom(selBnds, CFG.ratio);
  } else {
    invokeUI(SCRIPT, CFG);
  }
}

/**
 * Deselect all guide objects within a given collection of items
 * 
 * @param {(Object|Array)} coll - The collection of items to process
 */
function deselectGuides(coll) {
  if (coll.typename === 'TextRange') return;

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) {
      deselectGuides(item.pageItems);
    } else if (isGuide(item)) {
      item.selected = false;
    }
  }
}

/**
 * Determine whether an item is a guide
 * 
 * @param {Object} item - The item to check
 * @returns {boolean} - True if the item is a guide, otherwise false
 */
function isGuide(item) {
  return (item.hasOwnProperty('guides') && item.guides) ||
    (item.typename === 'CompoundPathItem' &&
      item.pathItems.length &&
      item.pathItems[0].guides);
}

/**
 * Retrieve the text frames that contain the specified text range selection
 * 
 * @param {Object} coll - The selected text range
 * @returns {Array} - An array of text frame objects containing the selected text range
 */
function getTextFrames(coll) {
  if (coll.typename !== 'TextRange') return [];

  var results = [];
  var parentTFs = coll.parent.textFrames;
  var firstIdx, lastIdx;

  // Find the index range of text frames overlapping the selection
  for (var i = 0, len = parentTFs.length; i < len; i++) {
    if (coll.start >= parentTFs[i].textRange.start &&
      coll.start <= parentTFs[i].textRange.end) {
      firstIdx = i;
    }

    if (coll.end >= parentTFs[i].textRange.start &&
      coll.end <= parentTFs[i].textRange.end) {
      lastIdx = i;
    }
  }

  // If valid indices are found, collect the overlapping text frames
  for (var j = firstIdx; j <= lastIdx; j++) {
    results.push(parentTFs[j]);
  }

  return results;
}

/**
 * Convert a collection into a standard Array
 *
 * @param {Object} coll - The collection to be converted
 * @returns {Array} - A new array containing the elements
 */
function get(coll) {
  var results = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    results.push(coll[i]);
  }

  return results;
}

/**
 * Calculate the total bounds of all items in a given collection
 * 
 * @param {(Object|Array)} coll - The collection of items to process
 * @param {string} type - The type of bounds to calculate
 * @returns {Array} - An array representing the total bounds [left, top, right, bottom]
 */
function getTotalBounds(coll, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';
  if (!coll.length) return [0, 0, 0, 0];

  var totalBnds = getItemBounds(coll[0], type);

  for (var i = 1, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (isGuide(item)) continue;

    var currBnds = getItemBounds(item, type);

    totalBnds[0] = Math.min(totalBnds[0], currBnds[0]);
    totalBnds[1] = Math.max(totalBnds[1], currBnds[1]);
    totalBnds[2] = Math.max(totalBnds[2], currBnds[2]);
    totalBnds[3] = Math.min(totalBnds[3], currBnds[3]);
  }

  return totalBnds;
}

/**
 * Calculate the bounds of selected points or the entire object
 * 
 * @param {Object} item - The item to evaluate
 * @param {string} type - The type of bounds to calculate
 * @returns {Array} - An array representing the bounds
 */
function getItemBounds(item, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';

  if (isSelectedEntireItem(item) || !item.editable) {
    return getVisibleBounds(item, type);
  };

  var results = [];
  var anchPt = PathPointSelection.ANCHORPOINT;
  var points = item.pathPoints;

  for (var i = 0; i < points.length; i++) {
    if (points[i].selected === anchPt) {
      results.push(points[i]);
    }
  }

  var left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity;

  for (var j = 0; j < results.length; j++) {
    var currAnch = results[j].anchor;
    left = Math.min(left, currAnch[0]);
    right = Math.max(right, currAnch[0]);
    top = Math.max(top, currAnch[1]);
    bottom = Math.min(bottom, currAnch[1]);
  }

  return [left, top, right, bottom];
}

/**
 * Check if an entire object is selected
 * 
 * @param {Object} item - The item to evaluate
 * @returns {boolean} - True if the entire object is selected, otherwise false
 */
function isSelectedEntireItem(item) {
  if (!item.hasOwnProperty('pathPoints') || !item.pathPoints.length) {
    return true;
  };

  var selPoints = [];
  var anchPt = PathPointSelection.ANCHORPOINT;
  var points = item.pathPoints;

  for (var i = 0; i < points.length; i++) {
    if (points[i].selected === anchPt) {
      selPoints.push(points[i]);
    }
  }

  if (selPoints.length > 0 && selPoints.length < points.length) {
    return false;
  }

  return true;
}

/**
 * Get the actual "visible" bounds
 * https://github.com/joshbduncan/illustrator-scripts/blob/main/jsx/DrawVisibleBounds.jsx
 *
 * @param {Object} obj - The target object
 * @param {string} type - The object bounds type
 * @returns {Array} - An array representing the actual bounds
 */
function getVisibleBounds(obj, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';
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
            clippedItem = item[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        }
      }
      if (!clippedItem) clippedItem = obj.pageItems[0];
      bnds = clippedItem[type];
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
        subObjBnds = getVisibleBounds(curItem, type);
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
    bnds = obj[type];
  }
  return bnds;
}

/**
 * Zoom the Illustrator document view to fit the given bounds with a specified zoom ratio
 *
 * @param {Array} bnds - The bounding box [left, top, right, bottom] for the object(s) to focus on
 * @param {number} ratio - The zoom ratio to apply (e.g., 1 for 100% zoom)
 */
function zoom(bnds, ratio) {
  var doc = app.activeDocument;

  // Reset zoom to 100% to calculate the view size
  doc.views[0].zoom = 1;

  var screenSize = doc.views[0].bounds;
  var screenW = screenSize[2] - screenSize[0];
  var screenH = screenSize[1] - screenSize[3];
  var proportion = screenH / screenW;

  // Calculate the center position of the bounding box
  var position = [bnds[0], bnds[1]];
  var bndsW = bnds[2] - bnds[0];
  var bndsH = bnds[1] - bnds[3];

  position[0] = bnds[0] + bndsW / 2;
  position[1] = bnds[1] - bndsH / 2;

  // Center the view on the bounding box
  doc.views[0].centerPoint = position;

  // Calculate zoom factors for width and height
  var zoomFactorW = screenW / bndsW;
  var zoomFactorH = screenH / bndsH;

  // Choose the larger zoom factor based on the bounding box's proportion
  var zoomFactor = bndsW * proportion >= bndsH ? zoomFactorW : zoomFactorH;

  // Apply the zoom factor adjusted by the ratio
  doc.views[0].zoom = zoomFactor * ratio;
}

/**
 * Display the user interface for zooming in on items in the active document
 *
 * @param {Object} SCRIPT - The script's name and version
 * @param {Object} CFG - Configuration settings
 */
function invokeUI(SCRIPT, CFG) {
  var doc = app.activeDocument;

  // Create the main dialog window
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];
      win.opacity = .98;

  // Zoom options panel
  var option = win.add('panel', undefined, 'Zoom to');
      option.orientation = 'column';
      option.alignChildren = ['fill', 'fill'];
      option.margins = [10, 20, 10, 10];

  var isZoomVis = option.add('radiobutton', undefined, 'Visible and Unlocked');
      isZoomVis.helpTip = 'Press 1 to activate';
  var isZoomLock = option.add('radiobutton', undefined, 'All Visible Items');
      isZoomLock.helpTip = 'Press 2 to activate';
  var isZoomAll = option.add('radiobutton', undefined, 'All in Document');
      isZoomAll.helpTip = 'Press 3 to activate';
  
  isZoomVis.value = true;

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isZoomVis.active = true;
  }

  // If the document has a large number of items, the script can run slowly
  // The number depends on the performance of the computer 
  if (doc.pageItems.length > CFG.limit) {
    var info = win.add('statictext', undefined, '', { multiline: true });
        info.text = 'The document has over ' + CFG.limit + ' items. The script can run slowly';
        info.justify = 'center';
  }

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
      cancel.helpTip = 'Press Esc to Close';
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});
      ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // Keyboard shortcuts for radio buttons
  win.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (key.match(/1/)) isZoomVis.notify();
    if (key.match(/2/)) isZoomLock.notify();
    if (key.match(/3/)) isZoomAll.notify();
  });

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    var selBnds = [];

    if (isZoomVis.value) { // Zoom to visible and unlocked items
      app.executeMenuCommand('deselectall');
      app.executeMenuCommand('selectall');
      deselectGuides(app.selection);
      selBnds = getTotalBounds(app.selection, CFG.bnds);
      zoom(selBnds, CFG.ratio);
      app.executeMenuCommand('deselectall');
    } else if (isZoomLock.value) { // Zoom to all visible items
      var items = getVisibleItems( get(doc.pageItems) );
      selBnds = getTotalBounds(items, CFG.bnds);
      zoom(selBnds, CFG.ratio);
    } else if (isZoomAll.value) { // Zoom to entire document
      selBnds = getTotalBounds(doc.pageItems, CFG.bnds);
      zoom(selBnds, CFG.ratio);
    }

    win.close();
  }

  win.center();
  win.show();
}

/**
 * Filter and returns all visible items from a given collection
 *
 * @param {(Object|Array)} coll - The collection of items to check for visibility
 * @returns {Array} - An array of visible items from the collection
 */
function getVisibleItems(coll) {
  var results = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    if (isVisible(coll[i])) results.push(coll[i]);
  }

  return results;
}

/**
 * Check whether an item is visible, considering visibility and lock status of its parent layers and groups
 *
 * @param {Object} item - The item to check for visibility
 * @returns {boolean} - True if the item is visible, false otherwise
 */
function isVisible(item) {
  var prnt = item.parent;
  var result = true;

  switch (prnt.typename) {
    case 'GroupItem':
      // Group is not visible, item is considered hidden
      if (prnt.hidden) return false;
      else result = isVisible(prnt);
      break;
    case 'Layer':
      // Layer is not visible, item is considered hidden
      if (!prnt.visible) return false;
      else result = isVisible(prnt);
      break;
  }

  return result;
}

/**
 * Open a URL in the default web browser
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

// Run script
try {
  main();
} catch (err) {}