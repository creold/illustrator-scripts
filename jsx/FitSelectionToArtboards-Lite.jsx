/*
  FitSelectionToArtboards-Lite.jsx for Adobe Illustrator
  Description: Proportional resizing one selected object to fit in parent artboard
  Date: July, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Full version: https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2022 (Win).
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
        tag: 'artboard'
      };

  var isRulerTopLeft = preferences.getBooleanPreference('isRulerOriginTopLeft'),
      isRulerInFourthQuad = preferences.getBooleanPreference('isRulerIn4thQuad');
  CFG.isFlipY = (isRulerTopLeft && isRulerInFourthQuad) ? true : false;

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one item');
    return;
  }

  var doc = app.activeDocument,
      abIdx = doc.artboards.getActiveArtboardIndex(),
      abBnds = doc.artboards[abIdx].artboardRect,
      item = selection[0],
      coord = app.coordinateSystem;

  // If the active artboard contains the selected object
  if (!CFG.isContains || isContains(item, CFG.tag)) {
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    fitToArtboard(item, abBnds, CFG.visBnds, CFG.isScaleStroke);
    centerToArtboard(item, abBnds, CFG.isFlipY);

    app.coordinateSystem = coord;
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
  var orig = item;
  if (isType(item, 'group') && item.clipped) {
    item = getMaskPath(item);
  }

  var bnds = isVisBnds ? item.visibleBounds : item.geometricBounds,
      itemWidth = Math.abs(bnds[2] - bnds[0]),
      itemHeight = Math.abs(bnds[1] - bnds[3]),
      abWidth = Math.abs(abBnds[2] - abBnds[0]),
      abHeight = Math.abs(abBnds[1] - abBnds[3]);
  
  var ratioW = 100 * abWidth / itemWidth,
      ratioH = 100 * abHeight / itemHeight,
      ratio = Math.min(ratioW, ratioH);

  // X, Y, Positions, FillPatterns, FillGradients, StrokePattern, LineWidths
  orig.resize(ratio, ratio, true, true, true, true, (isVisBnds || isStroke) ? ratio : 100);
}

// Place the item in the center of the artboard
function centerToArtboard(item, abBnds, isFlipY) {
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
    var mask = getMaskPath(item);
    bnds = mask.geometricBounds,
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
  }

  abWidth = Math.abs(abBnds[2] - abBnds[0]);
  abHeight = Math.abs(abBnds[1] - abBnds[3]);
  itemSize.h = Math.abs(itemSize.inTop - itemSize.inBottom);
  itemSize.w = Math.abs(itemSize.inRight - itemSize.inLeft);

  var left = itemSize.left - itemSize.inLeft,
      top = itemSize.top - itemSize.inTop,
      centerX = left + (abWidth - itemSize.w) / 2,
      centerY = top + (itemSize.h + (isFlipY ? -1 : 1) * abHeight) / 2;

  item.position = [centerX, centerY];
}

// Get the clipping mask
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) {
      return currItem;
    }
  }
}

// Check the clipping mask
function isClippingPath(item) {
  var clipText = (isType(item, 'text') &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (isType(item, 'compound') && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

try {
  main();
} catch (e) {}