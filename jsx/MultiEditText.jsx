/*
  MultiEditText.jsx for Adobe Illustrator
  Description: Bulk editing of text frame contents. Replaces content separately or with the same text
  Date: March, 2024
  Modification date: April, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  *******************************************************************************************
  * WARNING: The script does not support the mixed appearance of characters in a text frame *
  *******************************************************************************************

  Release notes:
  0.2.1 Added Shift+Enter shortcut to insert soft line break
  0.2 Added option to keep paragraph formatting (experimental)
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2024 (Mac/Win).
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
        name: 'Multi-edit Text',
        version: 'v0.2.1'
      };

  var CFG = {
        width: 300, // Text area width, px
        height: 240, // Text area height, px
        ph: '<text>', // Content display placeholder
        divider: '\n@@@\n', // Symbol for separating multiple text frames
        softBreak: '@#', // Soft line break char
        coordTolerance: 10, // Object alignment tolerance for sorting
        aiVers: parseFloat(app.version),
        is2020: parseInt(app.version) == 24, // Current AI is CC 2020
        isMac: /mac/i.test($.os)
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('selection:1')) return;

  // INIT DATA
  var tfs = getTextFrames(app.selection);
  if (!tfs.length) {
    alert('Texts not found\nPlease select at least 1 text object and try again', 'Script error');
    return;
  }

  var sortedTfs = [].concat(tfs);
  sortByPosition(sortedTfs, CFG.coordTolerance);

  var tfContents = extractContents(tfs, CFG.softBreak);
  var sortedTfContents = extractContents(sortedTfs, CFG.softBreak);

  var placeholder = isEqualContents(tfs, CFG.softBreak) ? tfs[0].contents.replace(/\x03/g, CFG.softBreak) : CFG.ph;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];

  var input = win.add('edittext', [0, 0, CFG.width, CFG.height], placeholder, {multiline: true, scrolling: true });
      input.helpTip = 'Use Shift+Enter to insert soft line break special char';
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    input.active = true;
  }

  // Options & Buttons
  var opt = win.add('group');
      opt.orientation = 'column';
      opt.alignChildren = ['fill', 'center'];

  var isFormat = opt.add('checkbox', undefined, 'Keep Para Format');
      isFormat.helpTip = 'Keep paragraphs formatting.\nText length affects script\nperformance';
  var isSeparate = opt.add('checkbox', undefined, 'Edit Separately');
      isSeparate.helpTip = 'Edit each text frame\nindividually';
  var isSort = opt.add('checkbox', undefined, 'List by XY');
      isSort.helpTip = 'List text frames\nsorted by position';
      isSort.enabled = isSeparate.value;
  var isReverse = opt.add('checkbox', undefined, 'Reverse Apply');
      isReverse.helpTip = 'Replace the contents\nof text frames in\nreverse order';
      isReverse.enabled = isSeparate.value;

  var cancel, ok;
  if (CFG.isMac) {
    cancel = opt.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = opt.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = opt.add('button', undefined, 'OK', { name: 'ok' });
    cancel = opt.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var isPreview = opt.add('checkbox', undefined, 'Preview');

  var copyright = opt.add('statictext', undefined, 'Visit Github');
  copyright.justify = 'center';

  loadSettings(SETTINGS);

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = "Preview disabled for CC 2020\ndue to critical bug";
  }

  isFormat.onClick = function () {
    isPreview.enabled = !this.value;
    preview();
  };

  isSeparate.onClick = function () {
    isSort.enabled = this.value;
    isReverse.enabled = this.value;
    input.text = getInputText(placeholder);
    win.update();
    preview();
  };

  isSort.onClick = function () {
    input.text = getInputText(placeholder);
    win.update();
    preview();
  }

  isReverse.onClick = function () {
    input.text = reverseText(input.text, CFG.divider);
    win.update();
    preview();
  }

  input.onChange = input.onChanging = preview;

  isPreview.onClick = preview;

  // Insert soft line break char
  input.addEventListener('keydown', function (kd) {
    var isShift = ScriptUI.environment.keyboardState['shiftKey'];
    if (isShift && kd.keyName === 'Enter') {
      this.textselection = CFG.softBreak;
      kd.preventDefault();
      preview();
    }
  });
  
  cancel.onClick = win.close;

  ok.onClick = function () {
    if (isPreview.value && isUndo) app.undo();
    ok.text = 'Wait...';
    win.update();
    changeTexts();
    isUndo = false;
    saveSettings(SETTINGS);
    win.close();
  }

  function getInputText(def) {
    var str = (isSort.value ? sortedTfContents : tfContents).join(CFG.divider);
    if (isSeparate.value) {
      return isReverse.value ? reverseText(str, CFG.divider) : str;
    } else {
      return def;
    }
  }

  var isUndo = false;
  function preview() {
    if (CFG.is2020) return;
    try {
      if (isPreview.enabled && isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        changeTexts();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  function changeTexts() {
    var tmpPath = app.selection[0].layer.pathItems.add();
    tmpPath.name = 'Remove_Path';

    if (isEmpty(input.text)) return;
    var regex = new RegExp(CFG.softBreak, 'gmi');

    if (isSeparate.value) {
      var srcTfs = [].concat(isSort.value ? sortedTfs : tfs);
      var texts = input.text.replace(regex, '\x03').split(CFG.divider);
      var min = Math.min(srcTfs.length, texts.length);

      for (var i = 0; i < min; i++) {
        var tf = srcTfs[i];
        if (tf.contents !== texts[i]) {
          replaceContent(tf, texts[i], isFormat.value);
        }
      }
    } else {
      for (var i = 0, len = tfs.length; i < len; i++) {
        var tf = tfs[i];
        var str = input.text.replace(/<text>/gi, tfContents[i]).replace(regex, '\x03');
        if (tf.contents !== str) {
          replaceContent(tf, str, isFormat.value);
        }
      }
    }
  }

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    try {
      var tmpPath = app.activeDocument.pathItems.getByName('Remove_Path');
      tmpPath.remove();
    } catch (err) {}
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  /**
   * Save UI options to a file
   *
   * @param {object} prefs - Object containing preferences
   */
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.formatting = isFormat.value;
    pref.separated = isSeparate.value;
    pref.sorted = isSort.value;
    pref.reversed = isReverse.value;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  /**
   * Load options from a file
   *
   * @param {object} prefs - Object containing preferences
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var pref = new Function('return ' + json)();
        f.close();
        if (typeof pref != 'undefined') {
          isFormat.value = pref.formatting;
          isSeparate.value = pref.separated;
          isSort.value = pref.sorted;
          isSort.enabled = pref.separated;
          isReverse.value = pref.reversed;
          isReverse.enabled = pref.separated;
          isPreview.enabled = !pref.formatting;
          input.text = getInputText(placeholder);
        }
      } catch (err) {}
    }
  }

  win.center();
  win.show();
}

/**
 * Check the script environment
 * 
 * @param {string} List of initial data for verification
 * @returns {boolean} Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
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
          alert('Few objects are selected\nPlease select at least' + rqdLen + ' object(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get an array of TextFrames from a given collection
 * 
 * @param {Array} coll - The collection to search for TextFrames
 * @returns {Array} - An array containing TextFrames found in the collection
 */
function getTextFrames(coll) {
  var tfs = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename)) {
      tfs.push(coll[i]);
    } else if (/group/i.test(coll[i].typename)) {
      tfs = tfs.concat(getTextFrames(coll[i].pageItems));
    }
  }

  return tfs;
}

/**
 * Sort items based on their position
 * 
 * @param {(Object|Array)} coll - Collection to be sorted
 * @param {number} tolerance - The tolerance within which objects are considered to have the same top position
 */
function sortByPosition(coll, tolerance) {
  if (arguments.length == 1 || tolerance == undefined) {
    tolerance = 10;
  }

  coll.sort(function(a, b) {
    if (Math.abs(b.top - a.top) <= tolerance) {
      return a.left - b.left;
    }
    return b.top - a.top;
  });
}

/**
 * Extract the contents of TextFrames from a given collection
 * 
 * @param {Array} coll - The collection of TextFrames
 * @param {string} softBreak - The soft line break special char
 * @returns {Array} - An array containing the contents of TextFrames
 */
function extractContents(coll, softBreak) {
  var result = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    // Replace End of Text (ETX) to line break
    result.push(coll[i].contents.replace(/\x03/g, softBreak));
  }

  return result;
}

/**
 * Check if the contents of all TextFrames in the collection are equal
 * 
 * @param {Array} coll - The collection of TextFrames to compare
 * @param {string} softBreak - The soft line break special char
 * @returns {boolean} - Return true if all TextFrames have equal contents, otherwise false
 */
function isEqualContents(coll, softBreak) {
  var str = coll[0].contents.replace(/\x03/g, softBreak);

  for (var i = 1, len = coll.length; i < len; i++) {
    if (coll[i].contents.replace(/\x03/g, softBreak) !== str) return false;
  }

  return true;
}

/**
 * Reverse the order of texts within a string separated by a specified divider
 * @param {string} str - The delimited string to reverse
 * @param {string} divider - The divider used to split
 * @returns {string} - A reversed string
 */
function reverseText(str, divider) {
  var tmp = str.split(divider);

  tmp.reverse();
  var str = tmp.join(divider);

  return str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 *
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} - True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Replace the content of a text frame and optionally retains the original paragrah appearance
 *
 * @param {Object} tf - The text frame to replace the content
 * @param {string} str - The new content to replace the original text with
 * @param {boolean} isKeepStyle - Determines whether to keep the original paragrah appearance
 */
function replaceContent(tf, str, isKeepStyle) {
  if (!/text/i.test(tf.typename)) return;

  if (!isKeepStyle) {
    tf.contents = str;
    return;
  }

  var para = get(tf.paragraphs);
  var styles = [];
  // Whitelist of paragraph attributes (short keys)
  var paraKeys = [
    'attributes', 'font', 'color', 'size', 'scale', 'leading', 'tracking', 'baseline', 'rotation', 
    'kerning', 'capitalization', 'italics', 'language', 'alignment', 'overprint', 'stroke', 'underline',
    'strikeThrough', 'justification', 'indent', 'space', 'tab', 'romanHanging', 'direction', 'composer'
    ];

  try {
    for (var i = 0; i < para.length; i++) {
      if (!trim(para[i].contents).length) continue;
      styles.push( getProps(para[i], paraKeys) );
    }
  } catch (err) {}

  // Replace original text
  tf.contents = str;
  para = get(tf.paragraphs);

  var style = null;
  var idx = 0;

  for (var j = 0; j < para.length; j++) {
    if (!trim(para[j].contents).length) continue;
    style = styles[idx] ? styles[idx] : styles[styles.length - 1];
    pasteProps(style, para[j]);
    idx++;
  }
}

/**
 * Convert a Adobe Illustrator collection into a standard Array
 *
 * @param {Object} coll - The collection to convert
 * @returns {Array} arr - An array containing the elements of the collection
 */
function get(coll) {
  var arr = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    try {
      arr.push(coll[i]);
    } catch (err) {
      // Skip 'No such element' error
    }
  }
  return arr;
}

/**
 * Remove leading and trailing whitespace from a string
 *
 * @param {string} str - The string to trim
 * @returns {string} - The trimmed string
 */
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Collect specified properties from an object
 *
 * @param {Object} obj - The object to get properties from
 * @param {Array} whiteList - An array of property names to collect
 * @returns {Object} - An object containing the copied properties
 */
function getProps(obj, whiteList) {
  var props = {};
  var regex = new RegExp(whiteList.join('|'), 'i');

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (!regex.test(key)) continue;
    try {
      props[key] = obj[key];
    } catch (err) {
      // Skip undefined properties
    }
  }

  return props;
}

/**
 * Paste properties from one object to another
 *
 * @param {Object} props - The object containing properties to paste
 * @param {Object} obj - The object to paste properties into
 */
function pasteProps(props, obj) {
  for (var key in props) {
    // Fix Illustrator bug with empty text color
    if (/weight/i.test(key) && /nocolor/i.test(props.strokeColor)) {
      obj.strokeWeight = 0;
    } else {
      obj[key] = props[key];
    }
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

// Run script
try {
  main();
} catch (err) {}