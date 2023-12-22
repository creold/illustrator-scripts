/*
  MatchColors.jsx for Adobe Illustrator
  Description: Matches two groups of objects (paths, texts) or text objecs characters by fill color
  Warning: Scripts cannot copy/paste gradient angle and length properties
  Note: Text frames and characters don't support gradient fill
  Date: December, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
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
        name: 'Match Colors',
        version: 'v0.1'
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

  if (selection.length < 2 
    || !isType(selection[0], 'group|text') 
    || !isType(selection[1], 'group|text')) {
    alert('Few objects are selected\nPlease select two groups or text objects and try again', 'Script error');
    return false;
  }

  // Array of temporary paths for fixing compound paths
  var tmpPaths = [];

  var topItems = isType(selection[0], 'text') 
      ? getCharacters(selection[0].textRange.characters)
      : getItems(selection[0].pageItems, tmpPaths);

  var btmItems = isType(selection[1], 'text') 
      ? getCharacters(selection[1].textRange.characters)
      : getItems(selection[1].pageItems, tmpPaths);

  invokeUI(SCRIPT, CFG, SETTINGS, topItems, btmItems);

  // Clear changes in compound paths
  for (var i = tmpPaths.length - 1; i >= 0; i--) {
    tmpPaths[i].remove();
  }
}

/**
 * Check the item typename by short name
 * @param {Object} item - Item to be checked
 * @param {string} type - The shortened type to check against. Case-insensitive
 * @returns {boolean} Returns true if the item's typename matches the specified type
 */
function isType(item, type) {
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
 * @param {Object} coll - The Adobe Illustrator collection to retrieve items from
 * @param {Array} [tmp] - Temporary array for internal use (optional)
 * @returns {Array} Returns a JavaScript Array containing relevant items from the given collection
 */
function getItems(coll, tmp) {
  var out = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems));
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
 * @param {Array} topArr - Top-level items
 * @param {Array} btmArr - Bottom-level items
 */
function invokeUI(title, cfg, prefs, topArr, btmArr) {
  var isUndo = false; // Undo history

  var win = new Window('dialog', title.name + ' ' + title.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = cfg.uiOpacity;

  // Source
  var srcPnl = win.add('panel', undefined, 'Source group or text frame');
      srcPnl.orientation = 'row';
      srcPnl.alignChildren = 'fill';
      srcPnl.margins = cfg.uiMgns;

  var isTop = srcPnl.add('radiobutton', undefined, 'Top');
      isTop.value = true;
  var isBtm = srcPnl.add('radiobutton', undefined, 'Bottom');

  // Sort objects
  var sortPnl = win.add('panel', undefined, 'Sort objects');
      sortPnl.orientation = 'row';
      sortPnl.alignChildren = 'fill';
      sortPnl.margins = cfg.uiMgns;

  var isByLay = sortPnl.add('radiobutton', undefined, 'As in Layers');
      isByLay.value = true;
  var isByPos = sortPnl.add('radiobutton', undefined, 'By X + Y');

  // Direction
  var dirPnl = win.add('panel', undefined, 'Target recolor direction');
      dirPnl.orientation = 'row';
      dirPnl.alignChildren = 'fill';
      dirPnl.margins = cfg.uiMgns;

  var isFwd = dirPnl.add('radiobutton', undefined, 'Forward');
      isFwd.value = true;
  var isBkwd = dirPnl.add('radiobutton', undefined, 'Backward');

  // Colors
  var colPnl = win.add('panel', undefined, 'Match source colors');
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
  isTop.onClick = isBtm.onClick = preview;
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
      if (isUndo) undo();
    } catch (err) {}
  };

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) undo();
        else isUndo = true;
        applyColors();
        redraw();
      } else if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  // Apply new fill colors based on the source array
  function applyColors()  {
    var srcItems = [].concat([], isTop.value ? topArr : btmArr);
    var destItems = [].concat([], isTop.value ? btmArr : topArr);

    var len = isByNum.value 
        ? Math.min(destItems.length, srcItems.length) 
        : destItems.length;
    var last = srcItems.length - 1;

    if (!isType(srcItems[0], 'textrange') && isByPos.value) {
      sortByPosition(srcItems, cfg.coordTolerance);
    }

    if (!isType(destItems[0], 'textrange') && isByPos.value) {
      sortByPosition(destItems, cfg.coordTolerance);
    }
    if (isBkwd.value) destItems.reverse();

    for (var i = 0; i < len; i++) {
      var currItem = destItems[i];
      var j = isExt.value && i > last ? last : i % srcItems.length;
      var srcColor;

      if (isType(srcItems[j], 'textrange')) {
        srcColor = srcItems[j].characterAttributes.fillColor;
      } else if (isType(srcItems[j], 'textframe')) {
        srcColor = srcItems[j].textRange.characters[0].characterAttributes.fillColor;
      } else {
        srcColor = srcItems[j].fillColor;
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
    if (isPreview.value && isUndo) undo();
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
    pref.source = isTop.value ? 0 : 1;
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
          srcPnl.children[pref.source].value = true;
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