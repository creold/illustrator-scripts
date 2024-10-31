/*
  MatchColors.jsx for Adobe Illustrator
  Description: Matches two groups of objects (paths, texts) or text objecs characters by fill color
  Warning: Scripts cannot copy/paste gradient angle and length properties
  Note: Text frames and characters don't support gradient fill
  Date: December, 2023
  Modification date: May, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.1 Fixed preview
  0.2 Added recolor to selected swatches
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
        name: 'Match Colors',
        version: 'v0.2.1'
      },
      CFG = {
        coordTolerance: 10, // Object alignment tolerance for sorting
        isMac: /mac/i.test($.os),
        uiMgns: [10, 15, 10, 8],
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return false;
  }

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return false;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert('Few objects are selected\nPlease select two paths or groups or text objects, '
    + 'or swatches with objects and try again', 'Script error');
    return false;
  }

  var swatches = app.activeDocument.swatches.getSelected();

  // Array of temporary paths for fixing compound paths
  var tmpPaths = [];

  var items = [];
  if (selection.length === 1 && isType(selection[0], 'text')) {
    items = getCharacters(selection[0].textRange.characters);
  } else {
    items = getItems(selection, tmpPaths);
  }

  var topItems = [selection[0]];
  if (isType(selection[0], 'text')) {
    topItems = getCharacters(selection[0].textRange.characters);
  } else if (isType(selection[0], 'group')) {
    topItems = getItems(selection[0].pageItems, tmpPaths);
  }

  var btmItems = [selection[1]];
  if (isType(selection[1], 'text')) {
    btmItems = getCharacters(selection[1].textRange.characters);
  } else if (isType(selection[1], 'group')) {
    btmItems = getItems(selection[1].pageItems, tmpPaths);
  }

  if (selection.length < 2 && swatches.length < 2) {
    alert('Few objects are selected\nPlease select two paths or groups or text objects, '
    + 'or swatches with objects and try again', 'Script error');
    return false;
  }

  invokeUI(SCRIPT, CFG, SETTINGS, items, topItems, btmItems, swatches);

  // Clear changes in compound paths
  for (var i = tmpPaths.length - 1; i >= 0; i--) {
    tmpPaths[i].remove();
  }
  tmpPaths = [];
}

/**
 * Check the item typename by short name
 * @param {Object} item - Item to be checked
 * @param {string} type - The shortened type to check against. Case-insensitive
 * @returns {boolean} Returns true if the item's typename matches the specified type
 */
function isType(item, type) {
  if (item == undefined) return false;
  var regEx = new RegExp(type, 'i');
  return regEx.test(item.typename);
}

/**
 * Get characters from an textRange collection, excluding whitespace characters
 * @param {Object} coll - Collection containing characters to be retrieved
 * @returns {Array} Returns a standard JS Array
 */
function getCharacters(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var _char = coll[i];
    if (_char.hasOwnProperty('contents') && !/\s/.test(_char.contents)) {
      out.push(_char);
    }
  }
  return out;
}

/**
 * Get items from an Adobe Illustrator collection, including nested pageItems.
 * Filter items based on type, excluding non-relevant items
 * @param {[Object|Array]} coll - The Adobe Illustrator collection to retrieve items from
 * @param {Array} tmp - Temporary paths array
 * @returns {Array} out - An array containing relevant items
 */
function getItems(coll, tmp) {
  var out = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems, tmp));
    } else if (isType(item, 'compound')) {
      // Fix compound path created from groups
      if (!item.pathItems.length) {
        tmp.push(item.pathItems.add());
      }
      out.push(item.pathItems[0]);
    } else if (isType(item, 'path|text')) {
      out.push(item);
    }
  }

  return out;
}

/**
 * Show UI
 * @param {Object} title - The title of the user interface window
 * @param {Object} cfg - Configuration object for the user interface
 * @param {Object} prefs - User settings file
 * @param {Array} selArr - All items
 * @param {Array} topArr - Top-level items
 * @param {Array} btmArr - Bottom-level items
 * @param {[Object|Array]} swatches - Selected swatches
 */
function invokeUI(title, cfg, prefs, selArr, topArr, btmArr, swatches) {
  var isUndo = false; // Undo history

  var win = new Window('dialog', title.name + ' ' + title.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = cfg.uiOpacity;

  // Source
  var srcPnl = win.add('panel', undefined, 'Source Group or Text Frame');
      srcPnl.orientation = 'row';
      srcPnl.alignChildren = 'fill';
      srcPnl.margins = cfg.uiMgns;

  var isTop = srcPnl.add('radiobutton', undefined, 'Top');
      isTop.value = true;
      isTop.enabled = selection.length > 1;
  var isBtm = srcPnl.add('radiobutton', undefined, 'Bottom');
      isBtm.enabled = selection.length > 1;
  var isSw = srcPnl.add('radiobutton', undefined, 'Swatches');
      isSw.enabled = swatches.length > 1;

  // Sort objects
  var sortPnl = win.add('panel', undefined, 'Sort Objects');
      sortPnl.orientation = 'row';
      sortPnl.alignChildren = 'fill';
      sortPnl.margins = cfg.uiMgns;

  var isByLay = sortPnl.add('radiobutton', undefined, 'As in Layers');
      isByLay.value = true;
  var isByPos = sortPnl.add('radiobutton', undefined, 'By X + Y');

  // Direction
  var dirPnl = win.add('panel', undefined, 'Target Recolor Direction');
      dirPnl.orientation = 'row';
      dirPnl.alignChildren = 'fill';
      dirPnl.margins = cfg.uiMgns;

  var isFwd = dirPnl.add('radiobutton', undefined, 'Forward');
      isFwd.value = true;
  var isBkwd = dirPnl.add('radiobutton', undefined, 'Backward');

  // Colors
  var colPnl = win.add('panel', undefined, 'Match Source Colors');
      colPnl.alignChildren = 'fill';
      colPnl.margins = cfg.uiMgns;

  var isByNum = colPnl.add('radiobutton', undefined, 'Only Once');
      isByNum.value = true;
  var isRpt = colPnl.add('radiobutton', undefined, 'Repeat Until the End');
  var isExt = colPnl.add('radiobutton', undefined, 'Once and Repeat Last Color');

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'bottom'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');

  var cancel, ok;
  if (cfg.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  loadSettings(prefs);

  if (isPreview.value) preview();

  isPreview.onClick = preview;
  isTop.onClick = isBtm.onClick = isSw.onClick = preview;
  isByLay.onClick = isByPos.onClick = preview;
  isFwd.onClick = isBkwd.onClick = preview;
  isByNum.onClick = isRpt.onClick = isExt.onClick = preview

  ok.onClick = okClick;
  cancel.onClick = win.close;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  win.onClose = function () {
    try {
      if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
    try {
      var tmpPath = app.activeDocument.pageItems.getByName('__TempPath');
      tmpPath.remove();
    } catch (err) {}
  };

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        applyColors();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  // Apply new fill colors based on the source array
  function applyColors()  {
    var tmpPath = selection[0].layer.pathItems.add();
    tmpPath.name = '__TempPath';
    tmpPath.hidden = true;
    tmpPath.hidden = false;

    var srcArr = [].concat([], isTop.value ? topArr : (isBtm.value ? btmArr : swatches));
    var destArr = [].concat([], isTop.value ? btmArr : (isBtm.value ? topArr : selArr));

    var len = isByNum.value 
        ? Math.min(destArr.length, srcArr.length) 
        : destArr.length;
    var last = srcArr.length - 1;

    if (!isSw.value && !isType(srcArr[0], 'textrange') && isByPos.value) {
      sortByPosition(srcArr, cfg.coordTolerance);
    }

    if (!isType(destArr[0], 'textrange') && isByPos.value) {
      sortByPosition(destArr, cfg.coordTolerance);
    }
    if (isBkwd.value) destArr.reverse();

    for (var i = 0; i < len; i++) {
      var currItem = destArr[i];
      var j = isExt.value && i > last ? last : i % srcArr.length;
      var srcColor;

      if (isType(srcArr[j], 'swatch')) {
        srcColor = srcArr[j].color;
      } else if (isType(srcArr[j], 'textrange')) {
        srcColor = srcArr[j].characterAttributes.fillColor;
      } else if (isType(srcArr[j], 'textframe')) {
        srcColor = srcArr[j].textRange.characters[0].characterAttributes.fillColor;
      } else {
        srcColor = srcArr[j].fillColor;
      }

      if (isType(currItem, 'textrange')) {
        currItem.characterAttributes.fillColor = srcColor;
      } else if (isType(currItem, 'textframe')) {
        currItem.textRange.characterAttributes.fillColor = srcColor;
      } else {
        currItem.fillColor = srcColor;
      }
    }
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    applyColors();
    isUndo = false;
    saveSettings(prefs);
    win.close();
  }

  /**
   * Save options to a file
   * @param {Object} prefs - The preferences file
   */
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.source = isTop.value ? 0 : (isBtm.value ? 1 : 2);
    pref.sort = isByLay.value ? 0 : 1;
    pref.direction = isFwd.value ? 0 : 1;
    pref.match = isByNum.value ? 0 : (isRpt.value ? 1 : 2);
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  /**
   * Loads options from a file
   * @param {Object} prefs - The preferences file
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
          if (!isTop.enabled && !isBtm.enabled) {
            srcPnl.children[2].value = true;
          } else if (!isSw.enabled) {
            srcPnl.children[0].value = true;
          } else {
            srcPnl.children[pref.source].value = true;
          }
          sortPnl.children[pref.sort].value = true;
          dirPnl.children[pref.direction].value = true;
          colPnl.children[pref.match].value = true;
        }
      } catch (e) {}
    }
  }

  win.center();
  win.show();
}

/**
 * Sort items based on their position
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
 * Open link in browser
 * @param {string} url - The URL to be opened in the default web browser
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