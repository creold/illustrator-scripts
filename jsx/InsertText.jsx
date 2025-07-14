/*
  InsertText.jsx for Adobe Illustrator
  Description: Script for inserting text at specific positions within text frames
  Supports various insertion modes: fixed positions, every N characters, odd/even positions
  Date: June, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);// Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Insert Text',
        version: 'v0.1'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        is2020: parseInt(app.version) == 24, // Current AI is CC 2020
        isMac: /mac/i.test($.os),
        uiMgns: [10, 15, 10, 8],
        uiOpacity: .97 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  // Check if environment is correct
  if (!isCorrectEnv('selection')) return;

  var doc = app.activeDocument;
  var isUndo = false; // Flag to track undo state for preview

  // Get text frames from selection
  var textFrames = getTextFrames(app.selection);
  if (!textFrames.length) {
    alert('Few objects are selected\nPlease select at least 1 text frame and try again', 'Script error');
    return;
  }

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'fill'];
      win.spacing = 10;
      win.opacity = CFG.uiOpacity;

  // Left wrapper for main controls
  var lWrapper = win.add('group');
      lWrapper.orientation = 'column';
      lWrapper.alignChildren = ['fill', 'top'];

  // INSERT INPUT PANEL
  var insertPnl = lWrapper.add('panel', undefined, 'Insert The Folowing Text');
      insertPnl.orientation = 'column';
      insertPnl.alignChildren = ['fill', 'center'];
      insertPnl.margins = CFG.uiMgns;

  var insertInp = insertPnl.add('edittext', undefined, '*');

  // Focus input field on compatible versions
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    insertInp.active = true;
  }

  // POSITION PANEL
  var posPnl = lWrapper.add('panel', undefined, 'At Position');
      posPnl.orientation = 'column';
      posPnl.alignChildren = ['left', 'center'];
      posPnl.margins = CFG.uiMgns;

  // Fixed position controls
  var fixPosGrp = posPnl.add('group');
      fixPosGrp.orientation = 'row';
      fixPosGrp.alignChildren = ['fill', 'center'];

  var isFixPos = fixPosGrp.add('radiobutton', undefined, 'Fixed Number:');
      isFixPos.helpTip = 'Example: 1, 4-5, 8';
      isFixPos.value = true;

  var fixPosInp = fixPosGrp.add('edittext', undefined, '3');
      fixPosInp.helpTip = 'Example: 1, 4-5, 8';
      fixPosInp.characters = 10;

  // Every N symbols controls
  var everyPosGrp = posPnl.add('group');
      everyPosGrp.orientation = 'row';
      everyPosGrp.alignChildren = ['fill', 'center'];

  var isEveryPos = everyPosGrp.add('radiobutton', undefined, 'Every Nth:');
      isEveryPos.helpTip = 'Example: if every 3 symbols\n1, 4, 7, 10, 13';

  var everyPosInp = everyPosGrp.add('edittext', undefined, '3');
      everyPosInp.helpTip = 'Example: if every 3 symbols\n1, 4, 7, 10, 13';
      everyPosInp.characters = 3;
      everyPosInp.enabled = false;

  everyPosGrp.add('statictext', undefined, 'Start:');

  var everyStartInp = everyPosGrp.add('edittext', undefined, '3');
      everyStartInp.helpTip = 'Example: if every 3 symbols\n1, 4, 7, 10, 13';
      everyStartInp.characters = 3;
      everyStartInp.enabled = false;

  // Odd and even position controls
  var isOddPos = posPnl.add('radiobutton', undefined, 'Odd Positions');
      isOddPos.helpTip = 'Example: 1, 3, 5, 7';

  var isEvenPos = posPnl.add('radiobutton', undefined, 'Even Positions');
      isEvenPos.helpTip = 'Example: 2, 4, 6, 8';

// Between symbols only (new option)
var isBetweenOnly = posPnl.add('checkbox', undefined, 'Insert Only Between Characters');
    isBetweenOnly.helpTip = 'Skips first and last positions';

  // DIRECTION PANEL
  var dirPnl = lWrapper.add('panel', undefined, 'Direction');
      dirPnl.orientation = 'column';
      dirPnl.alignChildren = ['left', 'center'];
      dirPnl.margins = CFG.uiMgns;

  var isFromStart = dirPnl.add('radiobutton', undefined, 'From Beginning Of Text');
      isFromStart.value = true;

  var isFromEnd = dirPnl.add('radiobutton', undefined, 'From End Of Text');

  // MODE PANEL
  var modePnl = lWrapper.add('panel', undefined, 'Insert Mode');
      modePnl.orientation = 'column';
      modePnl.alignChildren = ['left', 'center'];
      modePnl.margins = CFG.uiMgns;

  var isInsertBefore = modePnl.add('radiobutton', undefined, 'Insert Before');
  var isInsertAfter = modePnl.add('radiobutton', undefined, 'Insert After');
      isInsertAfter.value = true;
  var isOverwrite = modePnl.add('radiobutton', undefined, 'Overwrite On That Position');

  // Right wrapper for buttons and info
  var rWrapper = win.add('group');
      rWrapper.orientation = 'column';
      rWrapper.alignChildren = ['fill', 'fill'];

  // BUTTONS
  var btns = rWrapper.add('group');
      btns.orientation = 'column';
      btns.alignment = ['left', 'top'];

  // Platform-specific button order
  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var isPreview = btns.add('checkbox', undefined, 'Preview');

  var copyright = rWrapper.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';
      copyright.alignment = ['fill', 'bottom'];

  // EVENT HANDLERS
  loadSettings(SETTINGS);

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = 'Preview disabled for CC 2020\ndue to critical bug';
  }

  // Input change handlers
  insertInp.onChange = previewChanges;

  // Position mode radio button handlers
  isFixPos.onClick = function () {
    isEveryPos.value = false;
    everyPosInp.enabled = false;
    everyStartInp.enabled = false;
    isBetweenOnly.enabled = false;
    isOddPos.value = false;
    isEvenPos.value = false;
    fixPosInp.enabled = true;
    previewChanges();
  }

  isEveryPos.onClick = function () {
    isFixPos.value = false;
    isOddPos.value = false;
    isEvenPos.value = false;
    fixPosInp.enabled = false;
    everyPosInp.enabled = true;
    everyStartInp.enabled = true;
    isBetweenOnly.enabled = true;
    previewChanges();
  }

  isOddPos.onClick = isEvenPos.onClick = function () {
    isFixPos.value = false;
    isEveryPos.value = false;
    everyPosInp.enabled = false;
    everyStartInp.enabled = false;
    isBetweenOnly.enabled = true;
    previewChanges();
  }

  isBetweenOnly.onClick = previewChanges;

  // Position input change handlers
  fixPosInp.onChange = previewChanges;
  everyPosInp.onChange = everyStartInp.onChange = function () {
    validate(this);
    previewChanges();
  }

  // Direction and mode change handlers
  isFromStart.onClick = isFromEnd.onClick = previewChanges;
  isOverwrite.onClick = isInsertBefore.onClick = isInsertAfter.onClick = previewChanges;

  isPreview.onClick = previewChanges;

  // Button click handlers
  cancel.onClick = win.close;

  ok.onClick = function () {
    saveSettings(SETTINGS);
    if (isPreview.value && isUndo) app.undo();
    isUndo = false;
    applyInsertText();
    win.close();
  }

  // Open GitHub link
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Window close handler
  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  /**
   * Validate and fix input field values
   * @param {Object} input - The input field to validate
   * @returns {void}
   */
  function validate(input) {
    var value = input.text;
    var numValue = parseInt(value);
    
    // Check if it's not a valid positive integer
    if (isNaN(numValue) || numValue <= 0) {
      input.text = 1;
    } else {
      // Ensure it's an integer
      input.text = numValue;
    }
  }

  /**
   * Handle the preview functionality with undo support
   * @returns {void}
   */
  function previewChanges() {
    if (CFG.is2020) return;
    try {
      if (isPreview.value) {
        if (isUndo) {
          doc.swatches.add().remove();
          app.undo();
        }
        applyInsertText();
        doc.swatches.add().remove();
        app.redraw();
        isUndo = true;
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Apply text insertion to all selected text frames
   * @returns {void}
   */
  function applyInsertText() {
    var insertText = insertInp.text;
    if (insertText.length <= 0) {
      alert('Please enter text to insert', 'Input Error');
      return;
    }

    // Process each text frame
    for (var i = 0, len = textFrames.length; i < len; i++) {
      var textFrame = textFrames[i];
      var positions = getInsertPositions(textFrame.contents);
      if (positions.length > 0) {
        try {
          insertTextAtPositions(textFrame, insertText, positions);
        } catch (err) {}
      }
    }
  }

  /**
   * Get insertion positions based on selected mode and settings
   * @param {string} text - The original text to analyze
   * @returns {Array} Array of positions where text should be inserted
   */
  function getInsertPositions(text) {
    var positions = [];
    var textLength = text.length;

    if (isFixPos.value) { // Fixed positions (e.g., 1, 3-5, 8)
      positions = parseFixedPositions(fixPosInp.text, textLength - 1);
    } else if (isEveryPos.value) { // Every N symbols
      var start = parseInt(everyStartInp.text) || 1;
      var step = parseInt(everyPosInp.text) || 1;
      positions = getEveryNPositions(textLength, start, step);
    } else if (isOddPos.value) { // Odd positions
      positions = getOddPositions(textLength);
    } else if (isEvenPos.value) { // Even positions
      positions = getEvenPositions(textLength);
    }

    // Apply "between only" filter
    if (isBetweenOnly.enabled && isBetweenOnly.value && !isOverwrite.value) {
      positions = filterBetweenPositions(positions, textLength);
    }

    // Adjust positions based on direction
    if (isFromEnd.value) {
      positions = convertToEndPositions(positions, textLength);
    }

    return positions;
  }

  /**
   * Filter positions to exclude first and last positions
   * @param {Array} positions - Original positions array
   * @param {number} textLength - Length of the target text
   * @returns {Array} Array of filtered positions
   */
  function filterBetweenPositions(positions, textLength) {
    var filtered = [];

    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var isInclude = false;

      if (isInsertBefore.value) {
        isInclude = (pos !== 0);
      } else if (isInsertAfter.value) {
        isInclude = (pos !== textLength - 1);
      }

      if (isInclude) filtered.push(pos);
    }

    return filtered;
  }

  /**
   * Convert positions for "from end" direction
   * @param {Array} positions - Original positions array
   * @param {number} textLength - Length of the target text
   * @returns {Array} Array of converted positions
   */
  function convertToEndPositions(positions, textLength) {
    var endPositions = [];

    for (var i = 0; i < positions.length; i++) {
      var endPos;
      if (isOverwrite.value) {
        // For overwrite: count from end considering actual character position
        endPos = textLength - 1 - positions[i];
      } else {
        // For insert: count position from end
        endPos = textLength - positions[i];
      }

      if (endPos >= 0 && endPos <= textLength) {
        endPositions.push(endPos);
      }
    }

    endPositions.sort(function (a, b) {
      return a - b;
    });

    return endPositions;
  }

  /**
   * Insert text at specified positions
   * @param {string} textFrame - Original text frame to modify
   * @param {string} insertText - Text to insert
   * @param {Array} positions - Array of positions where to insert text
   * @returns {string} Modified text with insertions
   */
  function insertTextAtPositions(textFrame, insertText, positions) {
    if (!textFrame.contents.length || !insertText.length || positions.length === 0) {
      return;
    }

    var textLength = textFrame.contents.length;
    var insertLength = insertText.length;

    // Sort positions in DESCENDING order
    var sortedPositions = positions.slice().sort(function (a, b) {
      return b - a;
    });

    for (var i = 0; i < sortedPositions.length; i++) {
      var pos = sortedPositions[i];

      if (isOverwrite.value) {
        if (pos < textLength) {
          textFrame.characters[pos].contents = insertText;
        } else if (pos === textLength) {
          textFrame.contents += insertText;
        }
      } else {
        var insertPos = isFromStart.value ? pos : Math.max(0, pos - 1);
        insertPos = Math.min(insertPos, textLength - 1);

        if (textLength === 0) {
          textFrame.contents = insertText;
        } else if (insertPos >= 0 && insertPos < textLength) {
          var _chars = textFrame.characters[insertPos];
          var content = _chars.contents;

          // Determine how to insert based on mode
          if (isInsertBefore.value) {
            _chars.contents = isFromStart.value ? insertText + content : content + insertText;
          } else if (isInsertAfter.value) {
            _chars.contents = isFromStart.value ? content + insertText : insertText + content;
          }
        }
      }

      textLength = textFrame.contents.length;
    }
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

    data.insert = insertInp.text;
    data.fixed = fixPosInp.text;
    data.nth = everyPosInp.text;
    data.start = everyStartInp.text;

    data.isFixed = isFixPos.value;
    data.isEvery = isEveryPos.value;
    data.isOdd = isOddPos.value;
    data.isEven = isEvenPos.value;
    data.direction = isFromStart.value ? 0 : 1;
    data.mode = isInsertBefore.value ? 0 : (isInsertAfter.value ? 1 : 2);

    data.between = isBetweenOnly.value;

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

        insertInp.text = data.insert;
        fixPosInp.text = data.fixed;
        everyPosInp.text = data.nth;
        everyStartInp.text = data.start;
    
        isFixPos.value = data.isFixed === 'true';
        isEveryPos.value = data.isEvery === 'true';
        isOddPos.value = data.isOdd === 'true';
        isEvenPos.value = data.isEven === 'true';
        dirPnl.children[parseInt(data.direction) || 0].value = true;
        modePnl.children[parseInt(data.mode) || 0].value = true;
        isBetweenOnly.value = data.between === 'true';

        fixPosInp.enabled = isFixPos.value;
        everyPosInp.enabled = isEveryPos.value;
        everyStartInp.enabled = isEveryPos.value;
        isBetweenOnly.enabled = !isFixPos.value;
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Check if the environment is correct for running the script
 * @param {...string} args - Variable number of arguments to check
 * @returns {boolean} Return true if the environment is correct, false otherwise
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
        if (!app.selection.length) {
          alert('Few objects are selected\nPlease select at least 1 text frame and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get an array of TextFrames from a given collection
 * @param {Array} coll - The collection to search for TextFrames
 * @returns {Array} textFrames - An array containing TextFrames found in the collection
 */
function getTextFrames(coll) {
  var textFrames = [];
  
  if (/textrange/i.test(coll.typename)) {
    return [];
  } else {
    for (var i = 0, len = coll.length; i < len; i++) {
      if (/text/i.test(coll[i].typename)) {
        textFrames.push(coll[i]);
      } else if (/group/i.test(coll[i].typename)) {
        textFrames = textFrames.concat(getTextFrames(coll[i].pageItems));
      }
    }
  }

  return textFrames;
}

/**
 * Parse fixed positions string (e.g., "1,3-5,8")
 * @param {string} posStr - String containing position specifications
 * @param {number} textLength - Length of the target text
 * @returns {Array} Array of parsed positions (0-based indices)
 */
function parseFixedPositions(posStr, textLength) {
  var parsed = [];
  var chunks = posStr.split(/[,; ]+/);
  var length = chunks.length;

  for (var i = 0; i < length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsed.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) {
        parsed.push(num);
      }
    }
  }

  var positions = [];
  length = parsed.length;

  for (var k = 0; k < length; k++) {
    var num = parsed[k] - 1;
    if (num >= 0 && num <= textLength) {
      positions.push(num);
    }
  }

  // Remove duplicates and sort
  positions = getUnique(positions);
  positions.sort(function (a, b) {
    return a - b;
  });

  return positions;
}

/**
 * Remove duplicate elements from an array
 * @param {Array} arr - The input array
 * @returns {Array} An array with duplicate elements removed
 */
function getUnique(arr) {
  var obj = {};
  var i, l = arr.length;
  var unique = [];
  for (i = 0; i < l; i++) obj[arr[i]] = arr[i];
  for (i in obj) unique.push(obj[i]);
  return unique;
}

/**
 * Get positions for "every N symbols" mode
 * @param {number} textLength - Length of the target text
 * @param {number} start - The starting index (1-based)
 * @param {number} step - Step size (every N characters)
 * @returns {Array} Array of positions
 */
function getEveryNPositions(textLength, start, step) {
  var positions = [];

  // Ensure start and step are valid positive integers
  if (start <= 0) start = 1;
  if (step <= 0) step = 1;

  for (var i = start - 1; i < textLength; i += step) {
    positions.push(i);
  }

  return positions;
}

/**
 * Get odd positions (1st, 3rd, 5th, etc.)
 * @param {number} textLength - Length of the target text
 * @returns {Array} Array of odd positions
 */
function getOddPositions(textLength) {
  var positions = [];
  for (var i = 0; i < textLength; i += 2) {
    positions.push(i);
  }
  return positions;
}

/**
 * Get even positions (2nd, 4th, 6th, etc.)
 * @param {number} textLength - Length of the target text
 * @returns {Array} Array of even positions
 */
function getEvenPositions(textLength) {
  var positions = [];
  for (var i = 1; i < textLength; i += 2) {
    positions.push(i);
  }
  return positions;
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