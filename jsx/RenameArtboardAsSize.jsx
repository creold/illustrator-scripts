/*
  RenameArtboardAsSize.jsx for Adobe Illustrator
  Description: The script Renames artboards according to their size in document units
  Date: September, 2018
  Modification date: September, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.4 Added custom artboard range
  0.3 Added user interface
  0.2.2 Added new units API for CC 2023 v27.1.1
  0.2.1 Added size correction in large canvas mode
  0.2 Added more units (yards, meters, etc.) support if the document is saved
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
    name: 'Rename Artboard As Size',
    version: 'v0.4'
  };

  var CFG = {
        units: getUnits(), // Active document units
        isSaveName: true, // Set false to overwrite the full name
        isRound: true, // Set true to get a round number
        precision: 2,  // Size rounding precision
        isAddUnit: true,
        separator: '_',
        length: 100, // Name length
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7]
      };

  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = app.activeDocument;
  var docAbs = doc.artboards;
  var currIdx = docAbs.getActiveArtboardIndex();

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // INTERFACE
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'fill'];

  // RANGE
  var srcPnl = win.add('panel', undefined, 'Artboards Range');
      srcPnl.orientation = 'column';
      srcPnl.alignChildren = ['left', 'bottom'];
      srcPnl.margins = CFG.mgns;

  var isCurrAb = srcPnl.add('radiobutton', undefined, 'Active #' + (currIdx + 1) + ': \u0022' + truncate(docAbs[currIdx].name, 12) + '\u0022');
      isCurrAb.value = true;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isCurrAb.active = true;
  }

  var wrapper = srcPnl.add('group');
      wrapper.alignChildren = ['left', 'center'];

  var isCstmAb = wrapper.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = wrapper.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" to export 1, 3, 4, 5';
      rangeInp.characters = 10;
      rangeInp.enabled = isCstmAb.value;

  // OPTIONS
  var optPnl = win.add('panel', undefined, 'Options');
      optPnl.alignChildren = ['fill', 'center'];
      optPnl.margins = CFG.mgns;

  var isSaveName = optPnl.add('checkbox', undefined, 'Add size as suffix');
      isSaveName.value = CFG.isSaveName;

  var isRound = optPnl.add('checkbox', undefined, 'Round to integer');
      isRound.value = CFG.isRound;

  var isAddUnit = optPnl.add('checkbox', undefined, 'Add units after size');
      isAddUnit.value = CFG.isAddUnit;

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  // EVENTS
  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
    isCstmAb.value = false;
  }

  isCstmAb.onClick = function () {
    rangeInp.enabled = true;
    isCurrAb.value = false;
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    CFG.isSaveName = isSaveName.value;
    CFG.isRound = isRound.value;
    CFG.isAddUnit = isAddUnit.value;

    if (isCurrAb.value) {
      renameArtboard(docAbs[currIdx], CFG);
    } else {
      var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
      for (i = 0; i < range.length; i++) {
        renameArtboard(docAbs[range[i]], CFG);
      }
    }

    win.close();
  }

  win.center();
  win.show();
}

/**
 * Get active document ruler units
 * 
 * @returns {string} Shortened units
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
 * Parse a string representing a list of indexes and filters them based on a total count
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
 * Rename an artboard based on its dimensions and user preferences
 *
 * @param {object} ab - The artboard object to rename.
 * @param {object} prefs - An object containing user preferences for renaming
 * @returns {void}
 */
function renameArtboard(ab, prefs) {
  var abName = ab.name;
  var abRect = ab.artboardRect;
  var separator = /\s/.test(abName) ? ' ' : ((/-/.test(abName) ? '-' : prefs.separator));

  var width = prefs.sf * convertUnits(abRect[2] - abRect[0], 'px', prefs.units);
  var height = prefs.sf * convertUnits(abRect[1] - abRect[3], 'px', prefs.units);

  width = prefs.isRound ? Math.round(width) : width.toFixed(prefs.precision);
  height = prefs.isRound ? Math.round(height) : height.toFixed(prefs.precision);

  var size = width + 'x' + height;
  if (prefs.isAddUnit) size += prefs.units;

  if (prefs.isSaveName) {
    ab.name += separator + size;
  } else {
    ab.name = size;
  }
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
} catch (e) {}