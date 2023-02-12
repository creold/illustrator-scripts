/*
  MirrorMove.jsx for Adobe Illustrator
  Description: Mirror movement the object or points using the last values of the Object > Transform > Move...
  Date: May, 2022
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
  var SCRIPT = {
        name    : 'Mirror Move',
        version : 'v.0.1'
      },
      CFG = {
        aiVers  : parseInt(app.version),
        axis    : 'XY', // XY, X, Y
        ratio   : 1.0, // Movement ratio
        showUI  : false // Silent mode or dialog
      },
      SETTINGS = {
        name    : SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder  : Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later');
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one or more paths or path points');
    return;
  }

  var isAltPressed = false;

  if (ScriptUI.environment.keyboardState.altKey) {
    isAltPressed = true;
  }

  if ((CFG.showUI && !isAltPressed) || (!CFG.showUI && isAltPressed)) { // Show dialog
    invokeUI(SCRIPT, CFG, SETTINGS);
  } else if (CFG.showUI && isAltPressed) { // Silent mode with the latest settings
    var params = loadSettings(SETTINGS);
    if (params.length) process(params[0], params[1]);
  } else { // Silent mode with the default settings
    process(CFG.axis, CFG.ratio);
  }
}

/**
 * Show UI
 * @param {Object} title - The script name
 * @param {Object} CFG - Default settings
 * @param {Object} cfgFile - Settings file
 * @param {Array} paths - Selected paths
 */
function invokeUI(title, cfg, cfgFile) {
  var params = loadSettings(cfgFile);

  var dialog = new Window('dialog', title.name + ' ' + title.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = .98;

  var axisPnl = dialog.add('panel', undefined, 'Movement axis');
      axisPnl.orientation = 'row';
      axisPnl.margins = [10, 15, 10, 7];
      axisPnl.alignChildren = ['fill', 'center'];

  var xyRb = axisPnl.add('radiobutton', undefined, 'XY');
  var xRb = axisPnl.add('radiobutton', undefined, 'X');
  var yRb = axisPnl.add('radiobutton', undefined, 'Y');

  if (params.length) {
    for (var i = 0; i < axisPnl.children.length; i++) {
      if (params[0] == axisPnl.children[i].text)
        axisPnl.children[i].value = true;
    }
  } else {
    xyRb.value = true;
  }

  var ratioGrp = dialog.add('group');
      ratioGrp.alignChildren = ['fill', 'center'];

  ratioGrp.add('statictext', undefined, 'Movement ratio');
  var ratioInp = ratioGrp.add('edittext', undefined, params.length ? params[1] : cfg.ratio);
      ratioInp.preferredSize.width = 60;

  var btns = dialog.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok',  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  cancel.onClick = dialog.close;

  ok.onClick = function() {
    var params = [
          xyRb.value ? 'XY' : (xRb.value ? 'X' : 'Y'),
          strToAbsNum(ratioInp.text, cfg.ratio)
        ];

    saveSettings(cfgFile, params);
    process(params[0], params[1]);
    dialog.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  dialog.center();
  dialog.show();
}

/**
 * Save UI options to file
 * @param {Object} cfgFile - Settings file
 * @param {Array} params - Options status
 */
function saveSettings(cfgFile, params) {
  if(!Folder(cfgFile.folder).exists) Folder(cfgFile.folder).create();
  var $file = new File(cfgFile.folder + cfgFile.name);
  $file.encoding = 'UTF-8';
  $file.open('w');
  var pref = {};
  pref.axis = params[0];
  pref.ratio = params[1];
  var data = pref.toSource();
  $file.write(data);
  $file.close();
}

/**
 * Load options from file
 * @param {Object} cfgFile - Settings file
 * @return {Array} out - Options status
 */
function loadSettings(cfgFile) {
  var out = [], $file = File(cfgFile.folder + cfgFile.name);
  if ($file.exists) {
    try {
      $file.encoding = 'UTF-8';
      $file.open('r');
      var json = $file.readln();
      var pref = new Function('return ' + json)();
      $file.close();
      if (typeof pref != 'undefined') {
        out[0] = pref.axis;
        out[1] = pref.ratio;
      }
    } catch (e) {}
  }
  return out;
}

/**
 * Run processing
 * @param {string} axis - Movement axis key
 * @param {number} ratio - Movement ratio
 */
function process(axis, ratio) {
  var items = getItems(selection),
      isX = /x/i.test(axis),
      isY = /y/i.test(axis),
      oldPos = getPositions(items); // Save current point positions

  app.executeMenuCommand('transformagain');

  // Update items positions
  items = getItems(selection);
  var newPos = getPositions(items);

  // Reduce operations in the Illustrator history
  app.undo();
  items = getItems(selection);

  for (var i = 0, len = oldPos.length; i < len; i++) {
    if (!isEqualArr(oldPos[i], newPos[i])) {
      move(items[i], oldPos[i], newPos[i], isX, isY, ratio);
    }
  }
}

/**
 * Get single item and points from selection
 * @param {(Object|Array)} collection - Set of items
 * @return {Array} out - Items 
 */
function getItems(collection) {
  var out = [];

  for (var i = 0; i < collection.length; i++) {
    var item = collection[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getItems(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      out = out.concat(getPoints(item));
    } else {
      out.push(item);
    }
  }

  return out;
}

/**
 * Get selected points
 * @param {Object} item - Current object
 * @return {Array} out - Selected points 
 */
function getPoints(item) {
  var out = [];

  if (item.pathPoints && item.pathPoints.length > 1) {
    var points = item.pathPoints;
    for (var i = 0, len = points.length; i < len; i++) {
      if (isSelected(points[i])) out.push(points[i]);
    }
  }

  return out;
}

/**
 * Check PathPoint
 * @param {Object} item - Current object
 * @return {boolean} PathPoint or not
 */
function isPoint(item) {
  return /point/i.test(item.typename);
}

/**
 * Check PathPoint is selected
 * @param {Object} point - Current point
 * @return {boolean} Selected or not 
 */
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

/**
 * Get selected points on paths
 * @param {Array} items - Objects and points
 * @return {Array} out - Items coordinate pairs
 */
function getPositions(items) {
  var out = [];

  for (var i = 0, len = items.length; i < len; i++) {
    if (isPoint(items[i])) {
      out[i] = items[i].anchor;
    } else {
      out[i] = items[i].position;
    }
  }

  return out;
}

/**
 * Compare arrays
 * @param {Array} a
 * @param {Array} b
 * @return {boolean} Equal or not
 */
function isEqualArr(a, b) {
  if (a.length !== 0 && a.length === b.length) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  return false;
}

/**
 * Move item to position
 * @param {Object} item - Object or point
 * @param {Array} pos1 - Old position
 * @param {Array} pos2 - Current position
 * @param {boolean} isX - X-axis move
 * @param {boolean} isY - Y-axis move
 * @param {number} ratio - Movement ratio
 */
function move(item, pos1, pos2, isX, isY, ratio) {
  var x = (isX ? 1 : -1) * ratio * (pos1[0] - pos2[0]),
      y = (isY ? 1 : -1) * ratio * (pos1[1] - pos2[1]);

  if (isPoint(item)) {
    with (item) {
      anchor = [anchor[0] + x, anchor[1] + y];
      leftDirection = [leftDirection[0] + x, leftDirection[1] + y];
      rightDirection = [rightDirection[0] + x, rightDirection[1] + y];
    }
  } else {
    item.translate(x, y);
  }
}

/**
 * Convert string to absolute number
 * @param {string} str - Input data
 * @param {number} def - Default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Open link in browser
 * @param {string} url - Website adress
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