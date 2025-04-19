/*
  RenameArtboardAsSize.jsx for Adobe Illustrator
  Description: The script Renames artboards according to their size in document units
  Date: September, 2018
  Modification date: April, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.5 Added an option to display text labels with artboard names. Save/load settings
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
    version: 'v0.5'
  };

  var CFG = {
        precision: 2, // Decimal places 
        separator: '_', // Name words separator symbol
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7]
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, "_") + "_data.json",
        folder: Folder.myDocuments + "/Adobe Scripts/"
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  var docAbs = doc.artboards;
  var currIdx = docAbs.getActiveArtboardIndex();

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

  var wrapper = srcPnl.add('group');
      wrapper.alignChildren = ['left', 'center'];

  var isCstmAb = wrapper.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = wrapper.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" to export 1, 3, 4, 5';
      rangeInp.characters = 10;
      rangeInp.enabled = isCstmAb.value;

  // FORMAT
  var formatPnl = win.add('panel', undefined, 'Name Format');
      formatPnl.alignChildren = ['fill', 'center'];
      formatPnl.margins = CFG.mgns;

    var isSaveName = formatPnl.add('radiobutton', undefined, 'Original Name And Size');
        isSaveName.value = true;
    var isRplcName = formatPnl.add('radiobutton', undefined, 'Only Artboard Size');

  // OPTIONS
  var optPnl = win.add('panel', undefined, 'Options');
      optPnl.alignChildren = ['fill', 'center'];
      optPnl.margins = CFG.mgns;

  var isRound = optPnl.add('checkbox', undefined, 'Round Size To Integer');
      isRound.value = true;

  var isAddUnit = optPnl.add('checkbox', undefined, 'Add Units After Size');
      isAddUnit.value = true;

  var fontGrp = optPnl.add('group');
      fontGrp.alignChildren = ['left', 'bottom'];

  var isAddLabel = fontGrp.add('checkbox', undefined, 'Add Text Label:');
      isAddLabel.value = true;

  var fontInp = fontGrp.add('edittext', undefined, '12 pt');
      fontInp.characters = 6;
      fontInp.enabled = isAddLabel.value;

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
  loadSettings(SETTINGS);
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isCurrAb.value ? isCurrAb.active = true : isCstmAb.active = true;
  }

  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
    isCstmAb.value = false;
  }

  isCstmAb.onClick = function () {
    rangeInp.enabled = true;
    isCurrAb.value = false;
  }

  isAddLabel.onClick = function () {
    fontInp.enabled = this.value;
  }

  fontInp.onChange = function () {
    var value = parseFloat(this.text);
    if (isNaN(value)) value = 12;
    if (value > 1296) value = 1296;
    this.text = value + ' pt';
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    saveSettings(SETTINGS);

    if (isAddLabel.value) {
      var labelLayer = getEditableLayer(doc);
      var labelGroup;
      try {
        labelGroup = labelLayer.groupItems.getByName('Artboard_Names');
      } catch (err) {
        labelGroup = labelLayer.groupItems.add();
        labelGroup.name = 'Artboard_Names';
      }
      labelGroup.hidden = false;
      labelGroup.locked = false;
    }

    var data = {
          precision: CFG.precision,
          length: 100,
          separator: CFG.separator,
          isSaveName: isSaveName.value,
          isAddUnit: isAddUnit.value,
          fontSize: parseFloat(fontInp.text),
          isRound: isRound.value,
          isAddLabel: isAddLabel.value,
          scaleFactor: doc.scaleFactor ? doc.scaleFactor : 1,
          units: getUnits()
        };

    if (isCurrAb.value) {
      renameArtboard(docAbs[currIdx], labelGroup, data);
    } else {
      var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
      for (i = 0; i < range.length; i++) {
        renameArtboard(docAbs[range[i]], labelGroup, data);
      }
    }

    if (!labelGroup.pageItems.length) {
      labelGroup.remove();
    }
    win.close();
  }

  /**
   * Save UI options to a file
   * @param {object} prefs - Object containing preferences
   * @returns {void}
   */
  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.artboard = isCurrAb.value ? 0 : 1;
    data.saveName = isSaveName.value ? 0 : 1;
    data.round = isRound.value;
    data.addUnit = isAddUnit.value;
    data.addLabel = isAddLabel.value;
    data.fontSize = fontInp.text;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
   * @returns {void}
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (!f.exists) return;

    try {
      f.encoding = 'UTF-8';
      f.open('r');
      var json = f.readln();
      try { var data = new Function('return (' + json + ')')(); }
      catch (err) { return; }
      f.close();

      if (typeof data != 'undefined') {
        win.location = [
          data.win_x ? parseInt(data.win_x) : 100,
          data.win_y ? parseInt(data.win_y) : 100
        ];
        isCurrAb.value = data.artboard === '0';
        isCstmAb.value = data.artboard === '1';
        rangeInp.enabled = isCstmAb.value;
        isRplcName.value = data.saveName === '1';
        isRound.value = data.round === 'true';
        isAddUnit.value = data.addUnit === 'true';
        isAddLabel.value = data.addLabel === 'true';
        fontInp.text = parseFloat(data.fontSize) + ' pt';
        fontInp.enabled = isAddLabel.value;
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get active document ruler units
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
* @param {string} value - The numeric value to be converted
* @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
* @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
* @returns {number} The converted value in the specified units
*/
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Truncate a string to a specific length and add an ellipsis ('...') if it exceeds that length
 * @param {string} str - The string to truncate
 * @param {number} n - The maximum length of the truncated string including the ellipsis
 * @returns {string} The truncated string with an ellipsis if it was truncated, otherwise the original string
 */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

/**
 * Parse a string representing a list of indexes and filters them based on a total count
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} An array of valid indexes
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
 * Find the first editable layer in the document
 * If no such layer is found, it makes the first layer editable
 * @param {Object} doc - The document object containing layers
 * @returns {Object} The first editable layer found or made editable
 */
function getEditableLayer(doc) {
  var layers = doc.layers;
  var len = layers.length;
  var aLayer = doc.activeLayer;

  // Check if the active layer is editable
  if (aLayer.visible && !aLayer.locked) return aLayer;

  // Iterate through layers to find an editable one
  for (var i = 0; i < len; i++) {
    var currLayer = layers[i];
    if (currLayer.visible && !currLayer.locked) {
      doc.activeLayer = currLayer;
      return currLayer;
    }
  }

  // If no editable layer is found, make the active layer editable
  aLayer.visible = true;
  aLayer.locked = false;
  return aLayer;
}

/**
 * Rename an artboard based on its dimensions and user preferences
 * @param {object} ab - The artboard object to rename.
 * @param {Object} target - The target object containing labels
 * @param {object} data - An object containing user preferences
 * @returns {void}
 */
function renameArtboard(ab, target, data) {
  var abName = ab.name;
  var abRect = ab.artboardRect;
  var separator = /\s/.test(abName) ? ' ' : ((/-/.test(abName) ? '-' : data.separator));

  var width = calcDimension(abRect[2] - abRect[0], data);
  var height = calcDimension(abRect[1] - abRect[3], data);

  width = data.isRound ? Math.round(width) : width.toFixed(data.precision);
  height = data.isRound ? Math.round(height) : height.toFixed(data.precision);

  var size = width + 'x' + height;
  if (data.isAddUnit) size += data.units;

  if (data.isSaveName) {
    ab.name += separator + size;
  } else {
    ab.name = size;
  }

  if (data.isAddLabel) addLabel(ab, target, data.fontSize);
}

/**
 * Calculate the dimension based on the provided value and preferences
 * @param {number} value - The dimension value
 * @param {object} data - An object containing user preferences
 * @returns {(string|number)} The formatted dimension
 */
function calcDimension(value, data) {
  value = data.scaleFactor * convertUnits(value, 'px', data.units);
  return data.isRound ? Math.round(value) : value.toFixed(data.precision) * 1;
}

/**
 * Add a label to the artboard
 * @param {Object} ab - The artboard object
 * @param {Object} target - The target object containing labels
 * @param {object} fontSize - The label text size
 */
function addLabel(ab, target, fontSize) {
  if (isNaN(fontSize)) fontSize = 12;
  if (fontSize > 1296) fontSize = 1296;

  var label = target.textFrames.add();
  label.contents = ab.name;
  label.textRange.characterAttributes.size = fontSize;
  label.position = [ab.artboardRect[0], ab.artboardRect[1] + label.height];
}

/**
 * Open a URL in the default web browser
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

/**
 * Serialize a JavaScript plain object into a JSON-like string
 * @param {Object} obj - The object to serialize
 * @returns {string} A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\t")
        .replace(/\r/g, "\r")
        .replace(/\n/g, "\n")
        .replace(/"/g, '\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

try {
  main();
} catch (err) {}