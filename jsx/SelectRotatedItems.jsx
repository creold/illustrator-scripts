/*
  SelectRotatedItems.jsx for Adobe Illustrator
  Description: Select all editable objects in the document with a rotation angle other than zero radians
  Date: June, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var CFG = {
        round: (parseInt(app.version) < 24) ? 2 : 3, // Angle value precision
        isSkipRight: true // Skip right & straight angles: 90, 180, 270 degrees
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!activeDocument.pageItems.length) {
    alert('Error\nThe document is empty');
    return;
  }

  var items = (selection.length) ? getItems(selection) : getLayerItems(activeDocument.layers);
      rotItems = getRotated(items, CFG.round, CFG.isSkipRight);

  selection = rotItems;
}

// Get single items
function getItems(collection) {
  var out = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    var item = collection[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems));
    } else if (item.editable) {
      out.push(item);
    }
  }
  return out;
}

// Get items in editable Layers & Sublayers
function getLayerItems(layers) {
  var out = [];
  for (var i = 0, len = layers.length; i < len; i++) {
    var layer = layers[i];
    if (layer.visible && !layer.locked) {
      out = [].concat(out, getItems(layer.pageItems));
      if (layer.layers.length) out = [].concat(out, getItems(layer.layers));
    }
  }
  return out;
}

// Check the angle value in the Transform panel
function getRotated(items, round, isSkip) {
  var out = [];
  for (var i = 0, len = items.length; i < len; i++) {
    try {
      var rotInfo = items[i].tags['BBAccumRotation'],
          angle = 1 * (rotInfo.value * (180 / Math.PI)).toFixed(round); // Radians to degrees
      if ((!isSkip && angle !== 0) || (isSkip && !/(0|90|180|270)$/.test(angle))) {
        out.push(items[i]);
      }
    } catch(e) {}
  }
  return out;
}

// Run script
try {
  main();
} catch (e) {}