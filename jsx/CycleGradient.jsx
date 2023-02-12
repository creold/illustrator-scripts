/*
  CycleGradient.jsx for Adobe Illustrator
  Description: Rearrange colors in a gradient
  Date: October, 2021
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
  var SCRIPT = {
        name: 'CycleGradient',
        version: 'v.0.1'
      },
      CFG = {
        dlgWidth: 130,
        btnWidth: 110,
        uiOpacity: .96 // UI window opacity. Range 0-1
      };

  if (!documents.length) return;
  if (!selection.length || selection.typename == 'TextRange') return;

  var selGradients = [],
      tmp = []; // Array of temp paths for fix compound paths

  getGradients(selection, selGradients, tmp);

  // Selection has no gradients
  if (!selGradients.length) {
    // Clear changes in compound paths
    for (var j = 0, tmpLen = tmp.length; j < tmpLen; j++) {
      tmp[j].remove();
    }
    return;
  }

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.preferredSize.width = CFG.dlgWidth;
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  // ROWONE
  var firstRow = dialog.add('group');
      firstRow.orientation = 'row';
      firstRow.alignChildren = ['left', 'center'];

  var leftBtn = firstRow.add('button', undefined, 'Rotate Left');
      leftBtn.preferredSize.width = CFG.btnWidth;

  var rightBtn = firstRow.add('button', undefined, 'Rotate Right');
      rightBtn.text = 'Rotate Right';
      rightBtn.preferredSize.width = CFG.btnWidth;

  // ROWTWO
  var secondRow = dialog.add('group');
      secondRow.orientation = 'row';
      secondRow.alignChildren = ['left', 'center'];

  var randBtn = secondRow.add('button', undefined, 'Randomize');
      randBtn.preferredSize.width = CFG.btnWidth;

  var distBtn = secondRow.add('button', undefined, 'Distribute');
      distBtn.preferredSize.width = CFG.btnWidth;

  leftBtn.onClick = function() {
    processing(selGradients, shiftColorsBackward);
  }

  rightBtn.onClick = function() {
    processing(selGradients, shiftColorsForward);
  }

  randBtn.onClick = function() {
    processing(selGradients, shuffleColors);
  }

  distBtn.onClick = function() {
    processing(selGradients, distributeStops);
  }

  dialog.onClose = function() {
    // Clear changes in compound paths
    for (var j = 0, tmpLen = tmp.length; j < tmpLen; j++) {
      tmp[j].remove();
    }
  }

  dialog.center();
  dialog.show();
}

/**
 * Get gradient colors from selection
 * @param {object} collection - collection of items
 * @param {array} arr - output array of single paths
 * @param {array} tmp - output array of temporary paths in compounds
 */
function getGradients(collection, arr, tmp) {
  for (var i = 0, iLen = collection.length; i < iLen; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getGradients(currItem.pageItems, arr);
          break;
        case 'PathItem':
          if (currItem.filled && isGradient(currItem.fillColor)) {
            arr.push(currItem.fillColor.gradient);
          }
          if (currItem.stroked && isGradient(currItem.strokeColor)) {
            arr.push(currItem.strokeColor.gradient);
          }
          break;
        case 'CompoundPathItem':
          // Fix compound path created from groups
          if (!currItem.pathItems.length) {
            tmp.push(currItem.pathItems.add());
          }
          if (currItem.pathItems[0].filled && isGradient(currItem.pathItems[0].fillColor)) {
            arr.push(currItem.pathItems[0].fillColor.gradient);
          }
          if (currItem.pathItems[0].stroked && isGradient(currItem.pathItems[0].strokeColor)) {
            arr.push(currItem.pathItems[0].strokeColor.gradient);
          }
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
 * Rearrange colors in a gradient
 * @param {object} collection - gradient colors
 * @param {function} fn - rearrange function
 */
function processing(collection, fn) {
  for (var i = 0, len = collection.length; i < len; i++) {
    fn(collection[i]);
  }
  redraw();
}

/**
 * Shift gradient colors backward
 * @param {object} color - current item color
 */
function shiftColorsBackward(color) {
  var gStopsLength = color.gradientStops.length,
      oldStops = [],
      i;

  // Get all stops colors
  for (i = 0; i < gStopsLength; i++) {
    oldStops.push(color.gradientStops[i].color);
  }

  // Rearrange
  for (i = gStopsLength - 1; i >= 0; i--) {
    if (i == gStopsLength - 1) {
      color.gradientStops[i].color = oldStops[0];
      continue;
    }
    color.gradientStops[i].color = oldStops[i + 1];
  }
}

/**
 * Shift gradient colors forward
 * @param {object} color - current item color
 */
function shiftColorsForward(color) {
  var gStopsLength = color.gradientStops.length,
      oldStops = [],
      i;

  // Get all stops colors
  for (i = 0; i < gStopsLength; i++) {
    oldStops.push(color.gradientStops[i].color);
  }

  // Rearrange
  for (i = 0; i < gStopsLength; i++) {
    if (i == 0) {
      color.gradientStops[i].color = oldStops[oldStops.length - 1];
      continue;
    }
    color.gradientStops[i].color = oldStops[i - 1];
  }
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

/**
 * Distribute uniform spacing between gradient stops
 * @param {object} color - current item color
 */
function distributeStops(color) {
  var stops = color.gradientStops.length,
      dist = color.gradientStops[stops - 1].rampPoint - color.gradientStops[0].rampPoint,
      step = dist / (stops - 1),
      first = color.gradientStops[0].rampPoint;

  // Trick to avoid reshuffle of gradient stops
  resetRampPoints(color, stops, first, 0.0001);

  for (var i = stops - 2; i > 0; i--) {
    color.gradientStops[i].rampPoint = first + i * step;
  }
}

/**
 * Distribute minimal distance between gradient stops
 * @param {object} color - current item color
 * @param {number} stops - gradient stops length
 * @param {number} first - position of first gradient stop
 * @param {number} step - minimum position shift
 */
function resetRampPoints(color, stops, first, step) {
  var delta = .0001;
  for (var i = 0; i < stops - 1; i++) {
    color.gradientStops[i].rampPoint = first + i * delta;
  }
}

// Run script
try {
  main();
} catch (e) {}