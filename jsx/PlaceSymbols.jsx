/*
  PlaceSymbols.jsx for Adobe Illustrator
  Description: Search and place symbol objects from the Symbols panel on the canvas
  Date: August, 2024
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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Place Symbols',
        version: 'v0.1'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        uiOpacity: .97 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var docSymbols = get(app.activeDocument.symbols);

  // Sort default list alphabetically
  docSymbols.sort(function (a, b) {
    var aName = a.name;
    var bName = b.name;
    if (!isNaN(aName) && !isNaN(bName)) {
      return 1 * aName - 1 * bName;
    } else {
      return hasMixedCase(aName, bName) ?
        handleMixedCase(aName, bName, false) :
        aName.toLowerCase().localeCompare(bName.toLowerCase());
    }
  })

  var targetLayer = getEditableLayer();

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version, undefined, {resizeable: true});
      win.preferredSize = [240, 200];
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.uiOpacity;

  var queryGrp = win.add('group');
      queryGrp.alignChildren = ['fill', 'center'];
      queryGrp.alignment = ['fill', 'top'];

  var query = queryGrp.add('edittext', undefined, '');
      query.alignment = ['fill', 'center'];
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    query.active = true;
  }

  var clear = queryGrp.add('button', undefined, 'Clear');
      clear.preferredSize.width = 50;
      clear.alignment = ['right', 'center'];

  // SEARCH RESULTS
  var list = win.add('listbox', undefined, '',
      {
        numberOfColumns: 2,
        showHeaders: true,
        columnTitles: ['Parent Symbol', 'Instances'],
        multiselect: true
      });

  // FOOTER
  var footer = win.add('group');
      footer.alignChildren = ['fill', 'center'];
      footer.alignment = ['fill', 'bottom'];

  // Instances counter include hidden symbols
  var isHiddenCount = footer.add('checkbox', undefined, 'Count Hidden Symbol Instances');
      isHiddenCount.alignment = ['left', 'center'];
      isHiddenCount.value = true;

  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];
      btns.alignment = ['right', 'center'];

  var close = btns.add('button', undefined, 'Close', {name: 'cancel'});
  var select = btns.add('button', undefined, 'Select Instances', {name: 'select'});
      select.enabled = list.selection !== null;
  var place = btns.add('button', undefined, 'Place', {name: 'place'});
      place.enabled = list.selection !== null;

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // EVENTS
  addList('', docSymbols);
  list.preferredSize = [240, 200];

  query.onChanging = function () {
    addList(this.text, docSymbols);
  }

  clear.onClick = function () {
    query.text = '';
    this.active = true;
    query.active = true;
    addList('', docSymbols);
  }

  list.onChange = function () {
    place.enabled = list.selection !== null;
    select.enabled = list.selection !== null;
  }

  isHiddenCount.onClick = function () {
    addList(query.text, docSymbols);
  }

  place.onClick = function () {
    var items = getSelectedList(list);

    if (!items.length) {
      this.active = true;
      this.active = false;
      return;
    }

    placeSymbols(targetLayer, items);

    // Update instances counter
    for (var i = 0, len = items.length; i < len; i++) {
      var instCol = items[i].subItems[0];
      instCol.text = instCol.text.length ? parseInt(instCol.text) + 1 : 1;
    }

    list.hide();
    list.show();

    this.active = true;
    this.active = false;
  }

  select.onClick = function () {
    var items = getSelectedList(list);

    if (!items.length) {
      this.active = true;
      this.active = false;
      return;
    }

    selectSymbols(items);

    this.active = true;
    this.active = false;
  }

  close.onClick = win.close;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  win.onShow = function () {
    loadSettings(SETTINGS);
    addList(query.text, docSymbols);
    this.layout.resize();
  }

  win.onResizing = function () {
    this.layout.resize();
  }

  win.onClose = function () {
    saveSettings(SETTINGS);
  }

  /**
   * Display a list of symbols to place based on the search string
   * @param {string} query - The search string to filter symbols
   * @param {(Object|Array)} symbols - An array of symbol objects to filter
   */
  function addList(query, symbols) {
    if (query == undefined) query = '';

    var filtered = filterSymbols(query, symbols);
    var instances = countInstances(isHiddenCount.value);

    list.removeAll(); // Clear current list before search

    // Create listbox rows from search results
    for (var i = 0, len = filtered.length; i < len; i++) {
      var name = filtered[i].name;
      var row = list.add('item', name);
      row.subItems[0].text = instances[name] !== undefined ? instances[name] : '';
    }
  }

  /**
   * Get the selected items from a list object
   * @param {Object} obj - The list object containing items
   * @returns {Array} results - An array of selected items
   */
  function getSelectedList(obj) {
    var results = [];
    for (var i = 0, len = obj.children.length; i < len; i++) {
      if (obj.children[i].selected) results.push(obj.children[i]);
    }
    return results;
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
    pref.win_x = win.location.x;
    pref.win_y = win.location.y;
    pref.win_w = win.size.width;
    pref.win_h = win.size.height;
    pref.query = query.text;
    pref.hidden = isHiddenCount.value;
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
          win.location = [pref.win_x ? pref.win_x : 0, pref.win_y ? pref.win_y : 0];
          if (pref.win_w && pref.win_h) {
            win.size = [pref.win_w, pref.win_h];
          }
          query.text = pref.query;
          isHiddenCount.value = pref.hidden;
          win.update();
        }
      } catch (err) {}
    }
  }

  win.center();
  win.show();
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
 * Check if two strings have mixed case (one is uppercase and the other is lowercase)
 * @param {string} a - The first string
 * @param {string} b - The second string
 * @returns {boolean} True if the strings have mixed case, false otherwise
 */
function hasMixedCase(a, b) {
  if (a.charAt(0).toLowerCase() !== b.charAt(0).toLowerCase()) return false;
  return isUpperCase(a) && isLowerCase(b) ? true : isLowerCase(a) && isUpperCase(b);
}

/**
 * Handle the sorting of mixed case strings
 * @param {string} a - The first string
 * @param {string} b - The second string
 * @param {boolean} isLowerFirst - If true, lowercase strings come first
 * @returns {number} The sort order value
 */
function handleMixedCase(a, b, isLowerFirst) {
  var result = a === b ? 0 : isUpperCase(a) ? 1 : -1;
  return isLowerFirst ? result : result * -1;
}

/**
 * Check if the first character of a string is uppercase
 * @param {string} str - The string to be checked
 * @returns {boolean} True if the first character is uppercase, false otherwise
 */
function isUpperCase(str) {
  return /[A-Z]/.test(str.charAt(0));
}

/**
 * Check if the first character of a string is lowercase
 * @param {string} str - The string to be checked
 * @returns {boolean} True if the first character is lowercase, false otherwise
 */
function isLowerCase(str) {
  return /[a-z]/.test(str.charAt(0));
}

/**
 * Get an editable layer from the active document
 * @returns {Object} The editable layer
 */
function getEditableLayer() {
  var doc = app.activeDocument;
  var activeLay = doc.activeLayer;

  if (activeLay.visible && !activeLay.locked) return activeLay;

  for (var i = 0, len = doc.layers.length; i < len; i++) {
    var currLay = doc.layers[i];
    if (currLay.visible && !currLay.locked) {
      doc.activeLayer = currLay;
      return currLay;
    }
  }

  doc.layers[0].visible = true
  doc.layers[0].locked = false;
  doc.activeLayer = doc.layers[0];

  return doc.layers[0];
}

/**
 * Filter symbols in the active document based on the search string
 * @param {string} query - The search string used to filter symbols
 * @param {(Object|Array)} symbols - An array of symbol objects to filter
 * @returns {Array} sortedResults - An array of symbols that match the search criteria
 */
function filterSymbols(query, symbols) {
  if (query == undefined || query.length === 0) {
    return symbols;
  }

  var results = [];
  query = normalizeString(query);

  for (var j = 0, len = symbols.length; j < len; j++) {
    var symbol = symbols[j];
    var index = query.length > 0 ? normalizeString(symbol.name).indexOf(query) : 0;
    if (index !== -1) {
      var score = index === 0 ? 1 : index > 0 ? 0.5 : 0;
      results.push({ symbol: symbol, name: symbol.name, score: score, index: index });
    }
  }

  // Sort results based on score and index
  for (var j = 0; j < results.length; j++) {
    for (var k = j + 1; k < results.length; k++) {
      var a = results[j];
      var b = results[k];
      if (b.score > a.score || (b.score === a.score && (a.index > b.index || (a.index === b.index && a.name.localeCompare(b.name) > 0)))) {
        var temp = results[j];
        results[j] = results[k];
        results[k] = temp;
      }
    }
  }

  var sortedResults = [];
  for (var s = 0; s < results.length; s++) {
    sortedResults.push(results[s].symbol);
  }

  return sortedResults;
}

/**
 * Normalize a string (lowercase, trim)
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string
 */
function normalizeString(str) {
  return str.toLowerCase().replace(/^\s+|\s+$/g, '');
}

/**
 * Count the instances of symbols in the active document
 * @param {boolean} isHiddenCount - Flag to include hidden symbols in the count
 * @returns {Object} result - An object with symbol names as keys and their counts as values
 */
function countInstances(isHiddenCount) {
  var doc = app.activeDocument;
  var symbols = doc.symbolItems;
  var i = symbols.length;
  var symbol, result = {};

  while (i--) {
    if (!isHiddenCount && isHidden(symbols[i])) continue;
    symbol = symbols[i].symbol;
    result[symbol.name] = result[symbol.name] || 0;
    result[symbol.name]++;
  }

  return result;
}

/**
 * Check if an item is hidden
 * @param {Object} item - The item to be checked
 * @returns {boolean} result - True if the item is hidden, false otherwise
 */
function isHidden(item) {
  if (item.hasOwnProperty('hidden') && item.hidden == true) {
    return true;
  }

  if (item.hasOwnProperty('visible') && item.visible == false) {
    return true;
  }

  var result = false;
  var prnt = item.parent;

  switch (prnt.typename) {
    case 'GroupItem':
      result = isHidden(prnt);
      break;
    case 'Layer':
      result = isHidden(prnt);
      break;
    default:
      break;
  }

  return result;
}

/**
 * Place symbols into the target container in the active document
 * @param {Object} target - The target container where symbols will be placed
 * @param {Array} arr - An array of objects containing the names of symbols
 */
function placeSymbols(target, arr) {
  var doc = app.activeDocument;

  for (var i = 0, len = arr.length; i < len; i++) {
    var name = arr[i].text;
    try {
      var symbol = doc.symbols.getByName(name);
      symbol = target.symbolItems.add(symbol);
      symbol.selected = true;
    } catch (err) {}
  }

  if (parseFloat(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  }
}

/**
 * Select symbols in the active document based on the provided array of names
 * @param {(Object|Array)} arr - An array of objects containing the names of symbols
 */
function selectSymbols(arr) {
  var doc = app.activeDocument;
  app.selection = null;

  for (var i = 0, len = arr.length; i < len; i++) {
    var name = arr[i].text;
    for (var j = 0; j < doc.symbolItems.length; j++) {
      var item = doc.symbolItems[j];
      if (item.symbol.name === name && item.editable) {
        item.selected = true;
      }
    }
  }

  if (app.selection.length && parseFloat(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  }
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

try {
  main();
} catch (err) {}