/*
  DrawRectanglesByArtboards.jsx for Adobe Illustrator
  Description: Draws rectangles to match the size of each artboard, including any specified bleed
  Date: July, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added UI with many options
  0.1 Initial version (thanks for Egor Chistyakov, https://t.me/@egrch)

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
        name: 'Draw Rectangles By Artboards',
        version: 'v0.2'
      };

  var CFG = {
        bleed: getBleed(), // Default document bleed
        isEqual: true, // Default same bleed values
        layer: 'Rectangles', // New layer name
        isLower: false, // Rectangles under the others objects
        aiVers: parseFloat(app.version),
        units: getUnits(),
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7],
        dlgOpacity: .97 // UI window opacity. rangeInp 0-1
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return false;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return false;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  CFG.bleed = roundNum( convertUnits(CFG.bleed, 'pt', CFG.units) * CFG.sf, 4);

  var doc = app.activeDocument;
  var docAbs = doc.artboards;
  var currIdx = docAbs.getActiveArtboardIndex();

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'top'];
      win.opacity = CFG.dlgOpacity;

  // SOURCE
  var srcPnl = win.add('panel', undefined, 'Source Artboards');
      srcPnl.orientation = 'row';
      srcPnl.alignChildren = ['left', 'bottom'];
      srcPnl.margins = CFG.mgns;

  var isCurrAb = srcPnl.add('radiobutton', undefined, 'Active #' + (currIdx + 1));
      isCurrAb.value = true;

  var isCstmAb = srcPnl.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = srcPnl.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" to export 1, 3, 4, 5';
      rangeInp.characters = 10;
      rangeInp.enabled = isCstmAb.value;

  // BLEED
  var bleedPnl = win.add('panel', undefined, 'Bleed, ' + CFG.units);
      bleedPnl.orientation = 'row';
      bleedPnl.alignChildren = ['left', 'bottom'];
      bleedPnl.margins = CFG.mgns;

  // TOP
  var top = bleedPnl.add('group');
      top.orientation = 'column';
      top.alignChildren = ['fill', 'center'];
      top.spacing = 5;

  top.add('statictext', undefined, 'Top');
  var topInp = top.add('edittext', undefined, CFG.bleed);
      topInp.preferredSize.width = 45;

  // BOTTOM
  var bottom = bleedPnl.add('group');
      bottom.orientation = 'column';
      bottom.alignChildren = ['fill', 'center'];
      bottom.spacing = 5;

  bottom.add('statictext', undefined, 'Bottom');
  var bottomInp = bottom.add('edittext', undefined, CFG.bleed);
      bottomInp.preferredSize.width = 45;

  // LEFT
  var left = bleedPnl.add('group');
      left.orientation = 'column';
      left.alignChildren = ['fill', 'center'];
      left.spacing = 5;

  left.add('statictext', undefined, 'Left');
  var leftInp = left.add('edittext', undefined, CFG.bleed);
      leftInp.preferredSize.width = 45;

  // RIGHT
  var right = bleedPnl.add('group');
      right.orientation = 'column';
      right.alignChildren = ['fill', 'center'];
      right.spacing = 5;

  right.add('statictext', undefined, 'Right');
  var rightInp = right.add('edittext', undefined, CFG.bleed);
      rightInp.preferredSize.width = 45;

  var isEqual = bleedPnl.add('checkbox', undefined, 'Same');
      isEqual.helpTip = 'Make all settings\nthe same';
      isEqual.value = CFG.isEqual;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // TARGET
  var tgtPnl = win.add('panel', undefined, 'Move Rectangles To');
      tgtPnl.orientation = 'row';
      tgtPnl.alignChildren = ['left', 'top'];
      tgtPnl.margins = CFG.mgns;

  var isCurrLay = tgtPnl.add("radiobutton", undefined, 'Active Layer: \u0022' + truncate(doc.activeLayer.name, 12) + '\u0022');
      isCurrLay.value = true;

  var isNewLay = tgtPnl.add('radiobutton', undefined, 'New Layer');
      isNewLay.helpTip = 'New Layer \u0022' + CFG.layer + '\u0022\nCan be changed in CFG.layer';

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var copyright = btns.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  // EVENTS
  shiftInputNumValue(topInp);
  shiftInputNumValue(bottomInp);
  shiftInputNumValue(leftInp);
  shiftInputNumValue(rightInp);

  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
  }

  isCstmAb.onClick = function () {
    rangeInp.enabled = true;
  }

  isEqual.onClick = function () {
    bottomInp.enabled = !this.value;
    leftInp.enabled = !this.value;
    rightInp.enabled = !this.value;
  }

  // Fix unfocus bug when arrow keys not working
  win.onShow = function () {
    isCurrAb.active = true;
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;


  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  function okClick() {
    app.selection = null;

    var bleed = {};
    bleed.top = convertUnits( strToNum(topInp.text, CFG.bleed), CFG.units, 'px' ) / CFG.sf;
    bleed.bottom = isEqual.value ? bleed.top : convertUnits( strToNum(bottomInp.text, CFG.bleed), CFG.units, 'px' ) / CFG.sf;
    bleed.left = isEqual.value ? bleed.top : convertUnits( strToNum(leftInp.text, CFG.bleed), CFG.units, 'px' ) / CFG.sf;
    bleed.right = isEqual.value ? bleed.top : convertUnits( strToNum(rightInp.text, CFG.bleed), CFG.units, 'px' ) / CFG.sf;

    var tgtLay;
    if (isCurrLay.value) { // Unlock and show active layer
      tgtLay = doc.activeLayer;
      tgtLay.locked = false;
      tgtLay.visible = true;
    } else { // Add new layer
      try {
        tgtLay = doc.layers.getByName(CFG.layer);
      } catch (e) {
        tgtLay = doc.layers.add();
        tgtLay.name = CFG.layer;
      }
      if (CFG.isLower) tgtLay.zOrder(ZOrderMethod.SENDTOBACK);
    }
  
    if (isCurrAb.value) {
      drawArtboardRect(tgtLay, docAbs[currIdx], bleed, CFG.isLower);
    } else {
      var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
      for (i = 0; i < range.length; i++) {
        var idx = range[i];
        drawArtboardRect(tgtLay, docAbs[idx], bleed, CFG.isLower);
      }
    }

    win.close();
  }

  /**
  * Handle keyboard input to shift numerical values
  *
  * @param {Object} item - The input element to which the event listener will be attached
  * @param {number} max - The maximum allowed value for the numerical input
  * @returns {void}
  */
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = Number(this.text);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = num - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = num + step;
        kd.preventDefault();
      }
    });
  }
  win.center();
  win.show();
}

/**
 * Get active document ruler units
 *
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
 * Get document bleed settings
 *
 * @param {Object} [doc] - The document to read the bleed settings from
 * @returns {number} - The bleed setting in points
 */
function getBleed(doc) {
  if (doc == undefined) {
    if (app.documents.length) doc = app.activeDocument;
    else return 0;
  }

  var str = '';
  var regex = /TrimBox\[(\d+\.\d+)/;
  var bleed = 0;

  if (!/(\.ai|\.pdf)$/i.test(doc.fullName)) {
    // Bleed are not readable for other formats
    return bleed;
  } else {
    // For AI, PDF
    try {
      var f = File(doc.fullName);
      if (!f.exists) return bleed;
      f.open('r');

      while (!f.eof) {
        str = f.readln();
        // Find technical data in a SAVED file
        if (/TrimBox\[.*?\]/.test(str)) {
          var match = str.match(regex);
          // Example data TrimBox[25.5118 25.5118 1125.51 1125.51] in points
          if (match) bleed = parseFloat(match[1]);
          break;
        }
      }

      f.close();
    } catch (err) {
      f.close();
    }
  }

  return bleed;
}

/**
 * Truncate a string to a specific length and add an ellipsis ('...') if it exceeds that length
 *
 * @param {string} str - The string to truncate
 * @param {number} n - The maximum length of the truncated string including the ellipsis
 * @returns {string} - The truncated string with an ellipsis if it was truncated, otherwise the original string
 */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

/**
 * Convert a value from one set of units to another
 *
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} - The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Round a number to a specified number of decimal places
 * 
 * @param {number} num - The number to be rounded
 * @param {number} decimals - The number of decimal places to round to
 * @returns {number} - The rounded number
 */
function roundNum(num, decimals) {
  var pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
}

/**
 * Draw an artboard-sized rectangle with bleed
 *
 * @param {Object} target - The target container to draw the rectangle on
 * @param {Object} ab - The artboard object to base the rectangle dimensions on
 * @param {Object} bleed - An object containing the bleed dimensions {top, left, bottom, right}
 * @param {boolean} isLower - Determines whether to place created rectangles below or above other objects
 */
function drawArtboardRect(target, ab, bleed, isLower) {
  var data = getArtboardData(ab);
  var top = data.top + bleed.top;
  var left = data.left - bleed.left;
  var width = data.width + bleed.left + bleed.right;
  var height = data.height + bleed.top + bleed.bottom;

  var rect = target.pathItems.rectangle(top, left, width, height);

  rect.fillColor = rect.strokeColor = new NoColor();
  rect.selected = true;
  rect.zOrder(isLower ? ZOrderMethod.SENDTOBACK : ZOrderMethod.BRINGTOFRONT);
}

/**
 * Get data for an artboard
 *
 * @param {object} ab - The artboard object to retrieve data from
 * @returns {object} - An object containing the artboard's boundaries and dimensions
 */
function getArtboardData(ab) {
  var abRect = ab.artboardRect;
  return {
    left: abRect[0],
    top: abRect[1],
    right: abRect[2],
    bottom: abRect[3],
    width: Math.abs(abRect[2] - abRect[0]),
    height: Math.abs(abRect[1] - abRect[3])
  };
}

/**
 *  Parse a string representing a list of indexes and filters them based on a total count
 *
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} - An array of valid indexes
 */
function parseAndFilterIndexes(str, total) {
  var parsedNums = [];
  var chunks = str.split(/[,; ]+/);
  var length = chunks.length;

  for (var i = 0; i < length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsedNums.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) {
        parsedNums.push(num);
      }
    }
  }

  var filteredNums = [];
  length = parsedNums.length;

  for (var k = 0; k < length; k++) {
    var num = parsedNums[k] - 1;

    if (num >= 0 && num <= total) {
      filteredNums.push(num);
    }
  }

  return filteredNums;
}

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
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

try {
  main();
} catch (err) {}