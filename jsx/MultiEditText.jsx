/*
  MultiEditText.jsx for Adobe Illustrator
  Description: Bulk editing of text frame contents. Replaces content separately or with the same text
  Date: March, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  ********************************************************************************************
  * WARNING: The font properties of the first character are applied to the entire text frame *
  ********************************************************************************************

  Release notes:
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
        version: 'v0.1'
      };

  var CFG = {
        width: 300, // Text area width, px
        height: 210, // Text area height, px
        ph: '<text>', // Content display placeholder
        divider: '\n@@@\n', // Symbol for separating multiple text frames
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

  var tfContents = extractContents(tfs);
  var sortedTfContents = extractContents(sortedTfs);

  var placeholder = isEqualContents(tfs) ? tfs[0].contents : CFG.ph;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];

  var input = win.add('edittext', [0, 0, CFG.width, CFG.height], placeholder, {multiline: true, scrolling: true });
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    input.active = true;
  }

  // Options & Buttons
  var opt = win.add('group');
      opt.orientation = 'column';
      opt.alignChildren = ['fill', 'center'];
  
  var isSeparate = opt.add('checkbox', undefined, 'Edit separately');
  var isSort = opt.add('checkbox', undefined, 'List by XY');
      isSort.enabled = isSeparate.value;
  var isReverse = opt.add('checkbox', undefined, 'Reverse apply');
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

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = "Preview disabled for CC 2020\ndue to critical bug";
  }

  loadSettings(SETTINGS);

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

  cancel.onClick = win.close;

  ok.onClick = function () {
    if (isPreview.value && isUndo) app.undo();
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
      if (isPreview.value) {
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

    if (isSeparate.value) {
      var srcTfs = [].concat(isSort.value ? sortedTfs : tfs);
      var texts = input.text.split(CFG.divider);
      var min = Math.min(srcTfs.length, texts.length);

      for (var i = 0; i < min; i++) {
        var tf = srcTfs[i];
        if (tf.contents !== texts[i]) tf.contents = texts[i];
      }
    } else {
      for (var i = 0, len = tfs.length; i < len; i++) {
        var tf = tfs[i];
        var str = input.text.replace(/<text>/gi, tfContents[i]);
        if (tf.contents !== str) tf.contents = str;
      }
    }
  }

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
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
          isSeparate.value = pref.separated;
          isSort.value = pref.sorted;
          isSort.enabled = pref.separated;
          isReverse.value = pref.reversed;
          isReverse.enabled = pref.separated;
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
 * @returns {Array} - An array containing the contents of TextFrames
 */
function extractContents(coll) {
  var result = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    result.push(coll[i].contents);
  }

  return result;
}

/**
 * Check if the contents of all TextFrames in the collection are equal
 * 
 * @param {Array} coll - The collection of TextFrames to compare
 * @returns {boolean} - Returns true if all TextFrames have equal contents, otherwise false
 */
function isEqualContents(coll) {
  var str = coll[0].contents;

  for (var i = 1, len = coll.length; i < len; i++) {
    if (coll[i].contents !== str) return false;
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