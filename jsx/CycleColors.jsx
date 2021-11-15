/*
  CycleColors.jsx for Adobe Illustrator
  Description: Rearrange the colors of the selected objects
  Date: November, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Transfer stroke width, minor improvements
  0.3 Added shift steps, revert button

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), CS6, CC 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Cycle Colors',
        version: 'v.0.3'
      },
      CFG = {
        steps: 1,
        aiVers: parseInt(app.version),
        os: $.os.toLowerCase().indexOf('mac') >= 0 ? 'MAC': 'WINDOWS',
        uiOpacity: .96 // UI window opacity. Range 0-1
      };

  if (!documents.length) return;
  if (!selection.length || selection.typename == 'TextRange') return;

  var selItems = [],
      origColors = [],
      tmp = []; // Array of temp paths for fix compound paths

  getItems(selection, selItems, tmp);
  getColors(selItems, origColors);

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  // STEPS
  var stepsGrp = dialog.add('group');
      stepsGrp.orientation = 'row';
      stepsGrp.alignChildren = ['left', 'center'];

  stepsGrp.add('statictext', undefined, 'Steps (max ' + (selItems.length - 1) + ')');
  var stepsInp = stepsGrp.add('edittext', undefined, CFG.steps);
      stepsInp.alignment = ['fill','top'];
      stepsInp.characters = 4;

  // OPTIONS
  var options = dialog.add('group');
      options.orientation = 'row';
      options.alignChildren = ['center', 'top'];

  options.add('statictext', undefined, 'Color');
  var isFill = options.add('checkbox', undefined, 'Fill');
      isFill.value = true;
  var isStroke = options.add('checkbox', undefined, 'Stroke');

  // ACTION BUTTONS
  var action = dialog.add('group');
      action.orientation = 'column';
      action.margins = [0, 0, 0, 5];
      action.alignChildren = ['fill', 'center'];

  var forwardBtn = action.add('button', undefined, 'Forward');
  var backwardBtn = action.add('button', undefined, 'Backward');
  var randBtn = action.add('button', undefined, 'Randomize');
  var revertBtn = action.add('button', undefined, 'Revert');

  var ok = dialog.add('button', undefined, 'Ok', { name: 'ok' });

  // AI older 2020 on Mac OS has bug with add stroke
  if (CFG.os === 'MAC' && CFG.aiVers === 23) {
    var warningMsg = dialog.add('statictext', undefined, undefined, { multiline: true });
        warningMsg.text = 'AI CC 2019 (Mac OS)\nhas problem with stroke';
  }

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  stepsInp.onChange = function () {
    this.text = convertToNum(this.text, 1);
    if (this.text * 1 === 0) this.text = 1;
    if (this.text * 1 > selItems.length - 1) this.text = selItems.length - 1;
  }

  forwardBtn.onClick = function() {
    processing(selItems, stepsInp.text, 'forward', isStroke.value, isFill.value);
    resetButton();
  }

  backwardBtn.onClick = function() {
    processing(selItems, stepsInp.text, 'backward', isStroke.value, isFill.value);
    resetButton();
  }

  randBtn.onClick = function() {
    processing(selItems, stepsInp.text, 'randomize', isStroke.value, isFill.value);
    resetButton();
  }

  revertBtn.onClick = function() {
    restoreColors(selItems, origColors);
  }

  ok.onClick = dialog.close;

  // Clear changes in compound paths
  dialog.onClose = function() {
    for (var j = 0, tmpLen = tmp.length; j < tmpLen; j++) {
      tmp[j].remove();
    }
  }

  dialog.center();
  dialog.show();

  // Reset button highlight
  function resetButton() {
    var tmpUI = dialog.add('checkbox', undefined, 'checkbox');
    tmpUI.active = true;
    dialog.update();
    tmpUI.remove();
    dialog.update();
  }
}

/**
 * Get items from selection
 * @param {object} collection - collection of items
 * @return {array} arr - output array of single items
 * @return {array} tmp - output array of temporary paths in compounds
 */
function getItems(collection, arr, tmp) {
  for (var i = 0, iLen = collection.length; i < iLen; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getItems(currItem.pageItems, arr);
          break;
        case 'TextFrame':
          arr.push(currItem.textRange);
          break;
        case 'CompoundPathItem':
          // Fix compound path created from groups
          if (!currItem.pathItems.length) {
            tmp.push(currItem.pathItems.add());
          }
          arr.push(currItem.pathItems[0]);
          break;
        default:
          arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Rearrange colors in the selection
 * @param {array} items - array of items
 * @param {string} steps - amount of color shift steps
 * @param {string} direction - color shift direction
 * @param {boolean} isStroke - change the color of the strokes
 * @param {boolean} isFill - change the color of the fills
 */
function processing(items, steps, direction, isStroke, isFill) {
  var shiftItems = [],
      colors = [];

  steps = parseInt(steps);
  getColors(items, colors);

  shiftItems.push.apply(shiftItems, items);

  try {
    switch (direction) {
      case 'forward':
        shiftArrayBackward(shiftItems, steps);
        break;
      case 'backward':
        shiftArrayForward(shiftItems, steps);
        break;
      case 'randomize':
        shuffle(shiftItems);
        break;
    }
  } catch (e) {}

  for (var i = 0, len = shiftItems.length; i < len; i++) {
    var currItem = isText(shiftItems[i]) ? shiftItems[i].characterAttributes : shiftItems[i];
    if (isStroke) applyStroke(currItem, colors[i]);
    if (isFill) currItem.fillColor = colors[i].f;
  }
  redraw();
}

/**
 * Restore colors in the selection
 * @param {array} items - array of items
 * @param {array} colors - array of original colors
 */
function restoreColors(items, colors) {
  for (var i = 0, len = items.length; i < len; i++) {
    var currItem = isText(items[i]) ? items[i].characterAttributes : items[i];
    applyStroke(currItem, colors[i]);
    currItem.fillColor = colors[i].f;
  }
  redraw();
}

/**
 * Get color property from selection
 * @param {array} items - array of items
 * @return {array} arr - output array of color objects
 */
function getColors(items, arr) {
  var noColor = new NoColor();
  for (var i = 0, len = items.length; i < len; i++) {
    var currItem = items[i],
        obj = {};
    if (isText(currItem)) {
      obj.f = currItem.characters[0].characterAttributes.fillColor;
      obj.s = currItem.characters[0].characterAttributes.strokeColor;
      obj.w = (obj.s.typename === 'NoColor') ? 0 : currItem.characters[0].characterAttributes.strokeWeight;
    } else {
      obj.f = currItem.filled ? currItem.fillColor : noColor;
      obj.s = currItem.stroked ? currItem.strokeColor : noColor;
      obj.w = currItem.stroked ? currItem.strokeWidth : 0;
    }
    arr.push(obj);
  }
}

/**
 * Shift array elements to the right
 * @param {array} arr - input array
 * @param {number} steps - amount of shift steps
 * @return {array} out - output shifted array
 */
function shiftArrayForward(arr, steps) {
  for (var i = 0; i < steps; i++) {
    arr.unshift(arr.pop());
  }
}

/**
 * Shift array elements to the left
 * @param {array} arr - input array
 * @param {number} steps - amount of shift steps
 * @return {array} out - output shifted array
 */
function shiftArrayBackward(arr, steps) {
  for (var i = 0; i < steps; i++) {
    arr.push(arr.shift());
  }
}

/**
 * Shuffle array
 * @param {array} arr - input array
 */
function shuffle(arr) {
  var j, tmp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
  return arr;
}

/**
 * Apply weight and color property
 * @param {object} item - selected item
 * @param {object} color - object with color parameters
 */
function applyStroke(item, color) {
  var noColor = new NoColor();
  if (item.typename === 'CharacterAttributes') {
    if (color.w > 0) {
      if (item.strokeColor.typename === 'NoColor') {
        item.strokeWeight = color.w;
      }
      item.strokeColor = color.s;
    } else {
      item.strokeColor = noColor;
    }
  } else {
    if (color.w > 0) {
      if (!item.stroked) {
        item.stroked = true;
        item.strokeWidth = color.w;
      }
      item.strokeColor = color.s;
    } else {
      item.stroked = false;
    }
  }
  redraw();
}

/**
 * Convert any input data to a number
 * @param {string} str - input data
 * @param {number} def - default value if the input data don't contain numbers
 * @return {number} 
 */
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/[^\d]/g, '');
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

/**
 * Check TextRange typename
 * @param {object} item - item from selection
 */
function isText(item) {
  return item.typename === 'TextRange';
}

/**
 * Open link in browser
 * @param {string} url - website adress
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
} catch (e) {}