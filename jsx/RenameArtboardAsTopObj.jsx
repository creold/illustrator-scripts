/*
  RenameArtboardAsTopObj.jsx for Adobe Illustrator
  Description: The script renames each Artboard by the custom name of the first visible unlocked item on it
  Date: September, 2018
  Modification date: April, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.4 Added an option to display text labels with artboard names. Save/load settings
  0.3 Added artboard range and name length
  0.2.2 Removed input activation on Windows OS below CC v26.4
  0.2.1 Fixed input activation in Windows OS
  0.2 Use textFrame content for renaming
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
    name: 'Rename Artboards As Top Object',
    version: 'v0.4'
  };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7],
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

  var isCurrAb = srcPnl.add('radiobutton', undefined, 'Active #' + (currIdx + 1) + ': \u0022' + truncate(docAbs[currIdx].name, 16) + '\u0022');
      isCurrAb.value = true;

  var wrapper = srcPnl.add('group');
      wrapper.alignChildren = ['left', 'center'];

  var isCstmAb = wrapper.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = wrapper.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" to export 1, 3, 4, 5';
      rangeInp.characters = 15;
      rangeInp.enabled = isCstmAb.value;

  // FORMAT
  var formatPnl = win.add('panel', undefined, 'Name Format');
      formatPnl.alignChildren = ['left', 'center'];
      formatPnl.margins = CFG.mgns;

  var lenGrp = formatPnl.add('group');
      lenGrp.alignChildren = ['left', 'center'];

  lenGrp.add('statictext', undefined, 'Maximum Symbols: ');
  var maxLenInp = lenGrp.add('edittext', undefined, 100);
      maxLenInp.characters = 9;

  var fontGrp = formatPnl.add('group');
      fontGrp.alignChildren = ['left', 'bottom'];

  var isAddLabel = fontGrp.add('checkbox', undefined, 'Add Text Label:');
      isAddLabel.value = true;

  var fontInp = fontGrp.add('edittext', undefined, '12 pt');
      fontInp.characters = 9;
      fontInp.enabled = isAddLabel.value;

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
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

  maxLenInp.onChange = function () {
    var value = parseInt(this.text);
    if (isNaN(value)) value = 100;
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
    openURL('https://github.com/creold/');
  });

  function okClick() {
    saveSettings(SETTINGS);

    app.selection = null;

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
          length: parseInt(maxLenInp.text),
          fontSize: parseFloat(fontInp.text),
          isAddLabel: isAddLabel.value
        };

    if (isNaN(data.length)) data.length = 100;

    if (isCurrAb.value) {
      renameArtboard(doc, currIdx, labelGroup, data);
    } else {
      var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
      for (i = 0; i < range.length; i++) {
        renameArtboard(doc, range[i], labelGroup, data);
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
    data.limit = maxLenInp.text;
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
        maxLenInp.text = parseInt(data.limit);
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
 * Rename an artboard based on the name of the first selected item on it
 * @param {Object} doc - The document object containing the artboard to rename
 * @param {number} idx - The index of the artboard to rename (0-based)
 * @param {Object} target - The target object containing labels
 * @param {object} data - An object containing user preferences
 * @returns {void}
 */
function renameArtboard(doc, idx, target, data) {
  // Get all items on current Artboard
  doc.artboards.setActiveArtboardIndex(idx);
  doc.selectObjectsOnActiveArtboard();

  if (!app.selection.length || !app.selection[0]) return;

  var ab = doc.artboards[idx];
  var itemName = getName(app.selection[0]);

  if (!isEmpty(itemName) && ab.name !== itemName) {
    ab.name = itemName.slice(0, data.length);
  }

  if (data.isAddLabel) addLabel(ab, target, data.fontSize);

  app.selection = null;
}

/**
* Get the name of an item, considering its type
* @param {Object} item - The item for which to get the name
* @returns {string} The name of the item
*/
function getName(item) {
  var str = '';
  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    str = item.contents;
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    str = item.symbol.name;
  } else {
    str = item.name;
  }
  return str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
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

// Run script
try {
  main();
} catch (err) {}
