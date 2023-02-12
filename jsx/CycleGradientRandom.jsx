/*
  CycleGradientRandom.jsx for Adobe Illustrator
  Description: Random shuffle the colors of gradient stops without changing their positions
  Date: August, 2021
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
  Tested with Adobe Illustrator CC 2018-2021 (Mac), CS6, CC 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  if (!documents.length) return;
  if (!selection.length || selection.typename == 'TextRange') return;

  var selPaths = [],
      tmp = []; // Array of temp paths for fix compound paths

  getPaths(selection, selPaths, tmp);

  // Processing
  for (var i = 0, selLen = selPaths.length; i < selLen; i++) {
    var currItem = selPaths[i];

    // Shift fill gradient
    if (currItem.filled && isGradient(currItem.fillColor)) {
      shuffleColors(currItem.fillColor.gradient);
    }

    // Shift stroke gradient
    if (currItem.stroked && isGradient(currItem.strokeColor)) {
      shuffleColors(currItem.strokeColor.gradient);
    }
  }

   // Clear changes in compound paths
  for (var j = 0, tmpLen = tmp.length; j < tmpLen; j++) {
    tmp[j].remove();
  }
}

/**
 * Get paths from selection
 * @param {object} collection - collection of items
 * @param {array} arr - output array of single paths
 * @param {array} tmp - output array of temporary paths in compounds
 */
function getPaths(collection, arr, tmp) {
  for (var i = 0, iLen = collection.length; i < iLen; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          arr.push(currItem);
          break;
        case 'CompoundPathItem':
          // Fix compound path created from groups
          if (!currItem.pathItems.length) {
            tmp.push(currItem.pathItems.add());
          }
          arr.push(currItem.pathItems[0]);
          break;
        default:
          break;
      }
    } catch (e) {}
  }
}

/**
 * Check gradient color
 * @param {object} color - current item color
 * @return {boolean} is gradient color or not
 */
function isGradient(color) {
  return color.typename === 'GradientColor';
}

/**
 * Shuffle the colors of gradient stops
 * @param {object} color - current item color
 */
function shuffleColors(color) {
  var gStopsLength = color.gradientStops.length,
      oldStops = [],
      i;

  // Get all stops colors
  for (i = 0; i < gStopsLength; i++) {
    oldStops.push(color.gradientStops[i].color);
  }

  shuffle(oldStops);

  for (i = 0; i < gStopsLength; i++) {
    color.gradientStops[i].color = oldStops[i];
  }
}

/**
 * Shuffle array
 * @param {array} arr - array of colors
 */
function shuffle(arr) {
  var j, temp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
}

try {
  main();
} catch (e) {}