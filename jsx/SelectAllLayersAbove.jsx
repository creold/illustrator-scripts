/*
  SelectAllLayersAbove.jsx for Adobe Illustrator
  Description: Selects the contents of all layers above the active layer
  Date: February, 2022
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
  var isInclActive = false; // Include the content of the active layer

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (selection.length && selection.typename !== 'TextRange') {
    activeDocument.activeLayer = getParentLayer(selection[0]);
  }

  var layers = getLayersAbove(isInclActive);
  selectAllOnLayers(layers);
}

/**
 * Get all layers above the active layer
 * @param {boolean} isInclActive - include the active layer
 * @return {array} out - layers
 */
function getLayersAbove(isInclActive) {
  var doc = activeDocument,
      aLayer = getParentLayer(doc.activeLayer),
      out = [];

  for (var i = 0, len = doc.layers.length; i < len; i++) {
    if (doc.layers[i] !== aLayer) {
      if(isAvailable(doc.layers[i])) out.push(doc.layers[i]);
    } else {
      break;
    }
  }
  if (isInclActive && isAvailable(aLayer)) out.push(aLayer);

  return out;
}

/**
 * Get the parent layer for object
 * @param {object} obj - selected item or sublayer
 * @return {object} parent layer 
 */
function getParentLayer(obj) {
  if (obj.parent.typename === 'Document') return obj;
  else return getParentLayer(obj.parent);
}

/**
 * Check layer availability
 * @param {object} layer
 * @return {boolean} layer is unlocked and visible
 */
function isAvailable(layer) {
  return layer.visible && !layer.locked;
}

/**
 * Select all objects on layers
 * @param {array} layers
 */
function selectAllOnLayers(layers) {
  if (!layers.length) return;

  selection = null;
  for (var i = 0, len = layers.length; i < len; i++) {
    layers[i].hasSelectedArtwork = true;
  }
}

// Run script
try {
  main();
} catch (e) {}