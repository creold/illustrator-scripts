/*
  DuplicateToArtboards.jsx for Adobe Illustrator
  Description: Copy and paste selected artboard objects to the same position on specific artboards
  Date: September, 2022
  Modification date: September, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added option to paste on even and odd artboards. Minor improvements
  0.1.3 Removed input activation on Windows OS below CC v26.4
  0.1.2 Fixed display of indexes when launched by action
  0.1.1 Fixed input activation in Windows OS
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

// Main function
function main() {
  var SCRIPT = {
        name: 'Duplicate To Artboards',
        version: 'v0.2'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isPreserveLayer: app.preferences.getBooleanPreference('layers/pastePreserve'), // Default Paste Remembers Layers
        color: [255, 0, 0], // RGB artboard index color
        tempLayer: 'ARTBOARD_INDEX',
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!isCorrectEnv('version:16', 'selection:1')) return;
  if (CFG.aiVers > 24) { app.selectTool('Adobe Select Tool'); }
  polyfills();

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');
      wrapper.alignChildren = ['fill', 'fill'];

  // ARTBOARDS
  var absPnl = wrapper.add('panel', undefined, 'Artboards Range');
      absPnl.orientation = 'column';
      absPnl.alignChildren = 'fill';
      absPnl.margins = [10, 15, 10, 10];

  // ARTBOARDS * INDEX MODE
  var modeGrp = absPnl.add('group');
      modeGrp.orientation = 'row';
      modeGrp.alignChildren = 'left';

  var isCustomIdx = modeGrp.add('radiobutton', undefined, 'Custom');
      isCustomIdx.value = true;
  var isOddIdx = modeGrp.add('radiobutton', undefined, 'Odd');
      isOddIdx.helpTip = '1, 3, 5, 7, etc.'
  var isEvenIdx = modeGrp.add('radiobutton', undefined, 'Even');
      isEvenIdx.helpTip = '2, 4, 6, 8, etc.'

  var absInp = absPnl.add('edittext', undefined, 1);
      absInp.enabled = true;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    absInp.active = true;
  }

  var customTip = absPnl.add('statictext', undefined, '(e.g. "1, 5-7" to export 1, 5, 6, 7)\nor leave it empty to paste on all artboards', { multiline: true });
      customTip.justify = 'left';

  // Separator
  wrapper.separator = wrapper.add('panel');
  wrapper.separator.minimumSize.width = wrapper.separator.maximumSize.width = 2;

  // Options
  var optsGrp = wrapper.add('group');
      optsGrp.orientation = 'column';
      optsGrp.alignChildren = 'fill';
      optsGrp.spacing = 16;

  var pasteGrp = optsGrp.add('group');
      pasteGrp.orientation = 'column';
      pasteGrp.alignChildren = 'fill';
      pasteGrp.spacing = 8;

  var isPasteFront = pasteGrp.add('radiobutton', undefined, 'Paste in Front');
      isPasteFront.helpTip = 'Similar to the Edit menu function';
      isPasteFront.value = true;
  var isPasteBack = pasteGrp.add('radiobutton', undefined, 'Paste in Back');
      isPasteBack.helpTip = 'Similar to the Edit menu function';

  var isPreserveLayer = optsGrp.add('checkbox', undefined, 'Preserve Layers');
      isPreserveLayer.helpTip = 'Similar to the Layer option\nPaste Remembers Layers';
      isPreserveLayer.value = CFG.isPreserveLayer;

  var isSelectCopies = optsGrp.add('checkbox', undefined, 'Select Pasted');
      isSelectCopies.value = true;

  // WARNING
  if (CFG.aiVers >= 29.6) {
    var warnPnl = win.add('panel', undefined, 'Warning for Adobe Illustrator CC 2025 and later');
        warnPnl.orientation = 'column';
        warnPnl.alignChildren = 'fill';
        warnPnl.margins = [10, 15, 10, 10];

    var warning = warnPnl.add('statictext', undefined, 'For this script to work correctly, no artboards must be selected (highlighted in blue) in the Artboards panel', { multiline: true });
        warning.justify = 'left';
        warning.preferredSize.height = 30;
  }

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'fill'];

  var copyright = btns.add('statictext', undefined, 'Visit Github');

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  // EVENTS
  loadSettings(SETTINGS);

  isCustomIdx.onClick = function () { absInp.enabled = true; }
  isEvenIdx.onClick = function () { absInp.enabled = false; }
  isOddIdx.onClick = function () { absInp.enabled = false; }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  win.onShow = function () {
    showArboardIndex(CFG.tempLayer, CFG.color);
  }

  win.onClose = function () {
    removeArtboardIndex(CFG.tempLayer);
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    var doc = app.activeDocument;
    var docSel = get(app.selection);
    var currAbIdx = doc.artboards.getActiveArtboardIndex();
    var cmdName = isPasteFront.value ? 'pasteFront' : 'pasteBack';

    // Activate Paste Remembers Layers
    app.preferences.setBooleanPreference('layers/pastePreserve', isPreserveLayer.value);

    var absRange = [];
    if (isCustomIdx.value) {
      absRange = getArtboardsRange(absInp.text, currAbIdx);
    } else if (isOddIdx.value) {
      absRange = getOddArtboards(currAbIdx);
    } else {
      absRange = getEvenArtboards(currAbIdx);
    }

    // Copy selected items to clipboard
    app.executeMenuCommand('copy');
    app.executeMenuCommand('deselectall');

    var dupItems = [];
    for (var i = 0; i < absRange.length; i++) {
      pasteToArtboard(cmdName, absRange[i]);
      dupItems = dupItems.concat( get(app.selection) );
    }

    doc.artboards.setActiveArtboardIndex(currAbIdx);
    app.executeMenuCommand('deselectall');

    selectItems(isSelectCopies.value && dupItems.length ? dupItems : docSel);

    app.preferences.setBooleanPreference('layers/pastePreserve', CFG.isPreserveLayer);
    saveSettings(SETTINGS);
    win.close();
  }

  /**
   * Save UI options to a file
   * @param {object} prefs - Object containing preferences
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
    data.range = absInp.text;
    data.mode = isCustomIdx.value ? 0 : (isOddIdx.value ? 1 : 2);
    data.isPasteFront = isPasteFront.value;
    data.isSelect = isSelectCopies.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
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
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];
        modeGrp.children[parseInt(data.mode) || 0].value = true;
        absInp.enabled = isCustomIdx.value;
        data.isPasteFront === 'true' ? isPasteFront.value = true : isPasteBack.value = true;
        absInp.text = data.range;
        isSelectCopies.value = data.isSelect === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} - Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0;i < args.length;i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Wrong app version\nSorry, script only works in Illustrator v.' + rqdVers + ' and later', 'Script error');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!app.documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select at least ' + rqdLen + ' object and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Add polyfills for Array.prototype.indexOf, Array.prototype.filter
 * Optimized for Adobe Illustrator ExtendScript (ECMA3)
 * @function polyfills
 * @returns {void}
 */
function polyfills() {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = start || 0, j = this.length; i < j; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  };

  Array.prototype.filter = function (callback, context) {
    arr = [];
    for (var i = 0; i < this.length; i++) {
      if (callback.call(context, this[i], i, this))
        arr.push(this[i]);
    }
    return arr;
  };
}

/**
 * Display the index of each artboard in the active document
 * @param {string} name - The name of the temporary layer to create
 * @param {Array} color - The RGB color array for the text. Defaults to black if not provided
 */
function showArboardIndex(name, color) {
  if (arguments.length == 1 || color == undefined) {
    color = [0, 0, 0];
  }

  var doc = app.activeDocument;
  var currAbIdx = doc.artboards.getActiveArtboardIndex();
  var rgbColor = setRGBColor(color);
  var tempLayer;

  try {
    tempLayer = doc.layers.getByName(name);
  } catch (err) {
    tempLayer = doc.layers.add();
    tempLayer.name = name;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i];
    var abWidth = currAb.artboardRect[2] - currAb.artboardRect[0];
    var abHeight = currAb.artboardRect[1] - currAb.artboardRect[3];
    var label = tempLayer.textFrames.add();
    var labelSize = (abWidth >= abHeight) ? abHeight / 2 : abWidth / 2;

    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = rgbColor;
    label.position = [currAb.artboardRect[0], currAb.artboardRect[1]];
  }

  doc.artboards.setActiveArtboardIndex(currAbIdx);

  // Update screen
  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  } else {
    app.redraw();
  }

  tempLayer.remove();
}

/**
 * Set the RGB color
 * @param {Array} color - The RGB color array
 * @returns {RGBColor} The RGB color object
 */
function setRGBColor(rgb) {
  var color = new RGBColor();
  color.red = rgb[0];
  color.green = rgb[1];
  color.blue = rgb[2];
  return color;
}

/**
 * Remove a temporary layer by name, typically used for artboard indexes
 * @param {string} name - Name of the layer to remove
 * @returns {void}
 */
function removeArtboardIndex(name) {
  var tempLayer = app.activeDocument.layers[name];
  if (tempLayer) { tempLayer.remove(); }
}

/**
 * Parse a string range (e.g., "1,3-5") and returns filtered artboard indexes
 * @param {string} str - Input string (e.g., "1,3-5" or "2-4,6")
 * @param {number} currIdx - Current artboard index to exclude (optional)
 * @returns {Array} Array of valid artboard indexes (0-based)
 */
function getArtboardsRange(str, currIdx) {
  var userAbs = [];
  var docAbs = [];
  var i, j, extreme, temp, skipIdx = -1;

  // Populate all artboard indexes (0-based)
  for (i = 0; i < app.activeDocument.artboards.length; i++) {
    docAbs.push(i);
  }

  // If input is empty, return all indexes except `currIdx`
  if (!str.replace(/\s/g, '').length) {
    skipIdx = docAbs.indexOf(currIdx);
    if (skipIdx !== -1) docAbs.splice(skipIdx, 1);
    return docAbs;
  }

  // Normalize input: remove spaces, replace dots with commas
  str = str.replace(/\s/g, '').replace(/\./g, ',');
  temp = str.split(',');

  // Parse ranges (e.g., "3-5") and single values (e.g., "1")
  for (i = 0; i < temp.length; i++) {
    if (temp[i].indexOf('-') === -1) {
      userAbs.push(parseInt(temp[i], 10) - 1);
    } else {
      extreme = temp[i].split('-');
      for (j = parseInt(extreme[0], 10) - 1; j <= parseInt(extreme[1], 10) - 1; j++) {
        userAbs.push(j);
      }
    }
  }

  var filtered = docAbs.filter(function (e) {
    return userAbs.indexOf(e) !== -1;
  });

  // Remove current artboard if present
  skipIdx = filtered.indexOf(currIdx);
  if (skipIdx !== -1) filtered.splice(skipIdx, 1);

  return filtered;
}

/**
 * Get indices of odd artboards, excluding the active one
 * @param {number} currIdx - Index of the active artboard to exclude
 * @returns {Array} Array of odd artboard indices
 */
function getOddArtboards(currIdx) {
  var results = [];
  for (var i = 0; i < app.activeDocument.artboards.length; i++) {
    if ((i + 1) % 2 == 1 && i !== currIdx) results.push(i);
  }
  return results;
}

/**
 * Get indices of even artboards, excluding the active one
 * @param {number} currIdx - Index of the active artboard to exclude
 * @returns {Array} Array of even artboard indices
 */
function getEvenArtboards(currIdx) {
  var results = [];
  for (var i = 0; i < app.activeDocument.artboards.length; i++) {
    if ((i + 1) % 2 == 0 && i !== currIdx) results.push(i);
  }
  return results;
}

/**
 * Paste items from clipboard to specified artboard or all artboards
 * @param {string} cmdName - Paste command name
 * @param {number} idx - Index of the target artboard. If omitted, pastes to all artboards
 */
function pasteToArtboard(cmdName, idx) {
  if (arguments.length <= 1 || idx == undefined) {
    cmdName = 'pasteInAllArtboard';
  } else {
    app.activeDocument.artboards.setActiveArtboardIndex(idx);
  }

  switch(cmdName) {
    case 'pasteFront':
    case 'pasteBack':
    case 'pasteInPlace':
    case 'pasteInAllArtboard':
      app.executeMenuCommand(cmdName);
      break;
    case 'paste':
    default:
      app.paste();
      break ;
  }
}

/**
 * Convert a collection into a standard Array
 * @param {Object} coll - The collection to be converted
 * @returns {Array} A new array containing the elements
 */
function get(coll) {
  var results = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    results.push(coll[i]);
  }
  return results;
}

/**
 * Fast select an array of Illustrator items by temporarily grouping them
 * @param {Array} arr - Array of items to select
 * @returns {void}
 */
function selectItems(arr) {
  // Validate input
  if (!arr || Object.prototype.toString.call(arr) !== '[object Array]' || !arr.length) return;

  // Create temp layer and group
  var tempLayer = app.activeDocument.layers.add();
  tempLayer.name = '__tempSelectionLayer__';
  var tempGroup = tempLayer.groupItems.add();

  // Store pairs of placeholder and original items
  var pairs = [];
  for (var i = 0; i < arr.length; i++) {
    try {
      var tempItem = tempLayer.pathItems.add();
      tempItem.move(arr[i], ElementPlacement.PLACEBEFORE);
      arr[i].move(tempGroup, ElementPlacement.PLACEATEND);
      pairs.push({ placeholder: tempItem, original: arr[i] });
    } catch (err) {
      if (tempItem) tempItem.remove(); // Cleanup on error
    }
  }

  // Select the group
  try { 
    tempGroup.selected = true;
  } catch (err) {}

  // Restore original positions and cleanup
  for (var j = pairs.length - 1; j >= 0; j--) {
    var pair = pairs[j];
    try {
      pair.original.move(pair.placeholder, ElementPlacement.PLACEBEFORE);
      pair.placeholder.remove();
    } catch (err) {
      try { pair.placeholder.remove(); } catch (e) {} // Silent cleanup
    }
  }

  // Remove temp group and layer
  try { tempGroup.remove(); } catch (err) {}
  try { tempLayer.remove(); } catch (err) {}
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
 * @returns {string} - A JSON-like string representation of the object
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