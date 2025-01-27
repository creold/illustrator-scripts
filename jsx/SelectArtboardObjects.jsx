/*
  SelectArtboardObjects.jsx for Adobe Illustrator
  Description: Select objects overlapping or non-overlapping active artboard with bounds tolerance
  Date: January, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.2 Improved selection performance
  0.1.1 Fixed selection of a large number of objects
  0.1 Initial version

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
    name: 'Select Artboard Objects',
    version: 'v0.1.2'
  };

  var CFG = {
      tolerance: 1, // Default tolerance
      units: getUnits(),
      aiVers: parseFloat(app.version),
      isMac: /mac/i.test($.os)
    };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (parseFloat(app.version) < 16) {
    alert('Wrong app version\nSorry, script only works in Illustrator CS6 and later', 'Script error');
    return false;
  }

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  var idx = doc.artboards.getActiveArtboardIndex();
  var abBnds = doc.artboards[idx].artboardRect;

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];

  win.add('statictext', undefined, 'Artboard: ' + doc.artboards[idx].name.slice(0, 16));

  // AREA
  var overlapPnl = win.add('panel', undefined, 'Which objects to select');
      overlapPnl.orientation = 'column';
      overlapPnl.alignChildren = ['fill', 'center'];
      overlapPnl.margins = [10, 15, 10, 7];

  var isOverlapRb = overlapPnl.add('radiobutton', undefined, 'All Inside Artboard');
      isOverlapRb.value = true;
  var isNonOverlapRb = overlapPnl.add('radiobutton', undefined, 'All Outside Artboard');

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isOverlapRb.active = true;
  }

  // TOLERANCE
  var tolPnl = win.add('panel', undefined, 'Artboard Tolerance, ' + CFG.units);
      tolPnl.orientation = 'row';
      tolPnl.alignChildren = ['fill', 'center'];
      tolPnl.margins = [10, 15, 10, 7];

  var tolInp = tolPnl.add('edittext', undefined, CFG.tolerance);
      tolInp.characters = 6;

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'fill'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok', { name: 'ok' });

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  cancel.onClick = win.close;

  ok.onClick = function () {
    var tolerance = convertUnits(parseFloat(tolInp.text), CFG.units, 'px' ) / CFG.sf;
    // Check numeric tolerance
    if (isNaN(tolerance)) {
      alert('Incorrect tolerance\nEnter numeric value', 'Script error');
      return;
    }
    // Invert tolerance value
    if (isOverlapRb.value) tolerance *= -1;

    ok.text = 'Wait...';

    app.executeMenuCommand('selectall');
    app.redraw();

    var items = getItems(app.selection);

    app.executeMenuCommand('deselectall');
    app.selection = null;

    var overlapArr = [];
    var nonOverlapArr = [];

    for (var i = items.length - 1; i >= 0; i--) {
      var itemBnds = getVisibleBounds(items[i], 'geometricBounds');
      if (isOverlap(itemBnds, abBnds, tolerance)) {
        overlapArr.push(items[i]);
      } else {
        nonOverlapArr.push(items[i]);
      }
    }

    selectItems(isOverlapRb.value ? overlapArr : nonOverlapArr);

    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  win.center();
  win.show();
}

/**
 * Get active document ruler units
 * @returns {string} - Shortened units
 */
function getUnits() {
  if (!documents.length) return '';
  var key = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  switch (key) {
    case 'Pixels': return 'px';
    case 'Points': return 'pt';
    case 'Picas': return 'pc';
    case 'Inches': return 'in';
    case 'Millimeters': return 'mm';
    case 'Centimeters': return 'cm';
    // Added in CC 2023 v27.1.1
    case 'Meters': return 'm';
    case 'Feet': return 'ft';
    case 'FeetInches': return 'ft';
    case 'Yards': return 'yd';
    // Parse new units in CC 2020-2023 if a document is saved
    case 'Unknown':
      var xmp = activeDocument.XMPString;
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'FeetInches') return 'ft';
        if (units == 'Yards') return 'yd';
        return 'px';
      }
      break;
    default: return 'px';
  }
}

/**
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} - The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Get items from an Adobe Illustrator collection, including nested pageItems.
 * @param {Object} coll - The Adobe Illustrator collection to retrieve items from
 * @returns {Array} result - Return a JavaScript Array containing relevant items from the given collection
 */
function getItems(coll) {
  var results = [];
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (!item.editable) continue;
    if (item.pageItems && item.pageItems.length) {
      results = [].concat(results, getItems(item.pageItems));
    } else {
      results.push(item);
    }
  }
  return results;
}

/**
 * Get the actual "visible" bounds
 * https://github.com/joshbduncan/illustrator-scripts/blob/main/jsx/DrawVisibleBounds.jsx
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
 * Determine whether two bounding boxes overlap, within a specified tolerance
 * @param {Array} bnds1 - The first bounding box represented as an array of four numbers [left, top, right, bottom]
 * @param {Array} bnds2 - The second bounding box represented as an array of four numbers [left, top, right, bottom]
 * @param {number} t - The tolerance value to use when checking for overlap
 * @returns {boolean} - True if the bounding boxes overlap, false otherwise
 */
function isOverlap(bnds1, bnds2, t) {
  if ((bnds1[2] <= bnds2[0] + t || bnds1[0] >= bnds2[2] - t) ||
  (bnds1[3] >= bnds2[1] - t || bnds1[1] <= bnds2[3] + t)) {
    return false;
  } else {
    return true;
  }
}

/**
 * Select all items in the specified collection
 * @param {(Object|Array))} coll - An array of items to be selected
 */
function selectItems(coll) {
  var tmpArr = [];
  var lay = coll[0].layer;
  var tmpGroup = lay.groupItems.add();

  for (var i = 0, len = coll.length; i < len; i++) {
    var tmpItem = lay.pathItems.add(); // Add a temporary path item
    tmpItem.move(coll[i], ElementPlacement.PLACEBEFORE);
    tmpArr.push(tmpItem);
    coll[i].move(tmpGroup, ElementPlacement.PLACEATEND);
  }

  tmpGroup.selected = true;

  // Return objects to their original positions
  var groupItems = tmpGroup.pageItems;
  for (var j = 0, len = groupItems.length; j < len; j++) {
    groupItems[j].move(tmpArr[j], ElementPlacement.PLACEBEFORE);
    tmpArr[j].move(tmpGroup, ElementPlacement.PLACEATBEGINNING);
  }

  tmpGroup.remove();
  tmpGroup = null;
}

/**
 * Open a URL in the default web browser
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