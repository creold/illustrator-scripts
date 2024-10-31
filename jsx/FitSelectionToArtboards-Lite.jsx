/*
  FitSelectionToArtboards-Lite.jsx for Adobe Illustrator
  Description: Proportional resizing one selected object to fit in parent artboard
  Date: July, 2022
  Modification date: April, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Full version: https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.2 Fixed objects alignment with modified artboard rulers
  0.1.1 Fixed text object fitting
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
preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var CFG = {
        visBnds: true,
        isScaleStroke: true,
        isContains: false,
        tag: 'artboard',
        aiVers: parseInt(app.version),
      };

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later', 'Script error');
    return;
  }

  if (!documents.length) {
    alert('Error\nOpen a document and try again', 'Script error');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one item', 'Script error');
    return;
  }

  var doc = app.activeDocument,
      abIdx = doc.artboards.getActiveArtboardIndex(),
      abBnds = doc.artboards[abIdx].artboardRect,
      item = selection[0],
      coord = app.coordinateSystem,
      ruler = doc.artboards[abIdx].rulerOrigin;

  // If the active artboard contains the selected object
  if (!CFG.isContains || isContains(item, CFG.tag)) {
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    doc.artboards[abIdx].rulerOrigin = [0, 0];

    fitToArtboard(item, abBnds, CFG.visBnds, CFG.isScaleStroke);
    centerToArtboard(item, abBnds);

    app.coordinateSystem = coord;
    doc.artboards[abIdx].rulerOrigin = ruler;
  }

  selection = [item];
}

// Check if item is in the active artboard area
function isContains(item, tag) {
  var isContains = false;

  addTag(item, tag);

  selection = null;
  redraw();

  activeDocument.selectObjectsOnActiveArtboard();
  for (var i = 0, len = selection.length; i < len; i++) {
    var item = selection[i];
    if (isTagExists(item, tag)) {
      isContains = true;
      break;
    }
  }

  removeTag(item, tag);

  return isContains;
}

// Add custom tag to item
function addTag(item, key) {
  var tag = item.tags.add();
  tag.name = key;
}

// Check if item tag exists
function isTagExists(item, key) {
  try {
    var tag = item.tags.getByName(key);
    return true;
  } catch (e) {
    return false;
  }
}

// Remove item tag
function removeTag(item, key) {
  try {
    var tag = item.tags.getByName(key);
    tag.remove();
  } catch (e) {}
}

// Fit the item to the size of the artboard
function fitToArtboard(item, abBnds, isVisBnds, isStroke) {
  var type = isVisBnds ? 'visibleBounds' : 'geometricBounds';
  var bnds = [];

  if (isType(item, 'group|text')) {
    var dup = item.duplicate();
    app.executeMenuCommand('deselectall');
    selection = dup;
    outlineText(dup.pageItems ? dup.pageItems : [dup]);
    dup = selection[0];
    bnds = getVisibleBounds(dup, type);
    app.executeMenuCommand('deselectall');
    dup.remove();
  } else {
    bnds = getVisibleBounds(item, type);
  }

  var itemWidth = Math.abs(bnds[2] - bnds[0]),
      itemHeight = Math.abs(bnds[1] - bnds[3]),
      abWidth = Math.abs(abBnds[2] - abBnds[0]),
      abHeight = Math.abs(abBnds[1] - abBnds[3]);
  
  var ratioW = 100 * abWidth / itemWidth,
      ratioH = 100 * abHeight / itemHeight,
      ratio = Math.min(ratioW, ratioH);

  // X, Y, Positions, FillPatterns, FillGradients, StrokePattern, LineWidths
  item.resize(ratio, ratio, true, true, true, true, (isVisBnds || isStroke) ? ratio : 100);
}

// Create outlines
function outlineText(coll) {
  for (var i = coll.length - 1; i >= 0; i--) {
    var item = coll[i];
    if (isType(item, 'text')) {
      item.createOutline();
    } else if (isType(item, 'group')) {
      outlineText(item.pageItems);
    }
  }
}

// Get the actual "visible" bounds
// https://github.com/joshbduncan/adobe-scripts/blob/main/DrawVisibleBounds.jsx
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
            clippedItem = selection[0];
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

// Place the item in the center of the artboard
function centerToArtboard(item, abBnds) {
  var bnds = item.geometricBounds,
      itemSize = {
        left: bnds[0],
        top: bnds[1],
        inLeft: bnds[0],
        inTop: bnds[1],
        inRight: bnds[2],
        inBottom: bnds[3],
        h: 0,
        w: 0
      };

  if (isType(item, 'group') && item.clipped) {
    bnds = getVisibleBounds(item, 'geometricBounds');
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
  } else if (isType(item, 'group|text')) {
    var dup = item.duplicate();
    app.executeMenuCommand('deselectall');
    selection = dup;
    outlineText(dup.pageItems ? dup.pageItems : [dup]);
    dup = selection[0];
    bnds = getVisibleBounds(dup, 'geometricBounds');
    app.executeMenuCommand('deselectall');
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
    dup.remove();
  }

  abWidth = Math.abs(abBnds[2] - abBnds[0]);
  abHeight = Math.abs(abBnds[1] - abBnds[3]);
  itemSize.h = Math.abs(itemSize.inTop - itemSize.inBottom);
  itemSize.w = Math.abs(itemSize.inRight - itemSize.inLeft);

  var left = itemSize.left - itemSize.inLeft,
      top = itemSize.top - itemSize.inTop,
      centerX = left + (abWidth - itemSize.w) / 2,
      centerY = top + (itemSize.h - abHeight) / 2;

  item.position = [centerX, centerY];
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

try {
  main();
} catch (e) {}