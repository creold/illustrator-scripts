
/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options
                or simple rename one selected item / active layer / artboard
  Date: December, 2019
  Modification date: August, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  1.8 Fixed: Compound path renaming with partial point selection, layer/artboard names find & replace
      Added: Support for empty default names such as <Group>, <Mesh>, etc.
  1.7 Added options to sort selected objects before numbering
  1.6.9 Added prefilled name if same for all objects. Minor improvements
  1.6.8 Removed input activation on Windows OS below CC v26.4
  1.6.7 Fixed text frame content as names for various options
  1.6.6 Added display of text frame content as name if it is empty
  1.6.5 Fixed placeholder insertion for CS6
  1.6.4 Updated object name reloading
  1.6.3 Added erase object names by empty input
  1.6.2 Fixed placeholder buttons, input activation in Windows OS
  1.6.1 Fixed UI for Illustrator 26.4.1 on PC
  1.6.0 Added renaming of the active artboard.
        Saving the name input field when switching options
  1.5.0 Added placeholders. New UI
  1.4.0 Renaming the parent layers of the selected items
  1.3.0 Renaming of the parent Symbol
  1.2.0 Recursive search in Sublayers names
  1.1.0 New option Find and replace string in all Layer names
  1.0.0 Initial version

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
        name: 'Rename Items',
        version: 'v1.8'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };

  var PH = {
        name: '{n}', // Put current name
        numUp: '{nu}', // Put ascending numeration
        numDown: '{nd}' // Put descending numeration
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

  var doc = app.activeDocument;
  var docSel = app.selection;
  var actLayer = doc.activeLayer;
  var actAb = doc.artboards[doc.artboards.getActiveArtboardIndex()];
  var uniqLayers = getUniqueLayers(docSel);
  var isMultiSel = docSel.length > 1;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];

  // TARGET
  var grpTarget = win.add('group');

  if (docSel.length && docSel.typename !== 'TextRange') {
    var isSelection = grpTarget.add('radiobutton', undefined, 'Selection');
        isSelection.value = true;
    var isLayer = grpTarget.add('radiobutton', undefined, 'Parent Layer(s)');
  } else if (!docSel.length) {
    var isLayer = grpTarget.add('radiobutton', undefined, 'Layer');
        isLayer.value = true;
    var isArtboard = grpTarget.add('radiobutton', undefined, 'Active Artboard');
  }

  // NAME INPUT
  var grpName = win.add('group');
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column';
      grpName.maximumSize.width = 200;

  var nameTitle = grpName.add('statictext', undefined, 'Rename ');
      nameTitle.text += isMultiSel ? docSel.length + ' Items to' : 'to';

  var nameInp = grpName.add('edittext', undefined, '');
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    nameInp.active = true;
  }

  // OPTION FOR SYMBOLS
  if (docSel.length === 1 && docSel[0].typename === 'SymbolItem') {
    var isReplcSym = win.add('checkbox', undefined, 'Rename Parent Symbol');
  }

  // REPLACE INPUT
  if (isMultiSel || !docSel.length) {
    var grpReplc = win.add('group');
        grpReplc.alignChildren = 'fill';
        grpReplc.orientation = 'column';

    grpReplc.add('statictext', undefined, 'Search for (Optional)');

    var replcInp = grpReplc.add('edittext', undefined, '');
        replcInp.helpTip = 'Enter the part of the name\nyou want to replace';
  }

  // GLOBAL REPLACE OPTION
  if (!docSel.length) {
    var isFindAll = win.add('checkbox', undefined, 'Replace in All Doc Layers');
  }

  // PLACEHOLDERS
  if (isMultiSel) {
    win.add('statictext', undefined, 'Click To Add Placeholder');

    var grpPH = win.add('group');
        grpPH.alignChildren = ['fill', 'fill'];

    putPlaceholder('Name', [0, 0, 50, 20], grpPH, PH.name);
    putPlaceholder('Num \u2191', [0, 0, 50, 20], grpPH, PH.numUp);
    putPlaceholder('Num \u2193', [0, 0, 50, 20], grpPH, PH.numDown);
    
    // NUMERATION
    var grpNum = win.add('group');
    grpNum.add('statictext', undefined, 'Start Number At:');
    var countInp = grpNum.add('edittext', undefined, 1);
        countInp.preferredSize.width = 78;

    countInp.onChange = function () {
      this.text = convertToInt(countInp.text, 1);
    }

    bindStepperKeys(countInp, 0);

    // Sort objects
    var sortPnl = win.add('panel', undefined, 'Sort Before Numbering');
        sortPnl.alignChildren = 'left';
        sortPnl.margins = [10, 15, 10, 10];

    var isOrder = sortPnl.add('radiobutton', undefined, 'By Order in Layers');
        isOrder.value = true;
    var isRows = sortPnl.add('radiobutton', undefined, 'By Rows (Like Z)');
    var isCols = sortPnl.add('radiobutton', undefined, 'By Columns (Like \u0418)');
  }

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

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

  // COPYRIGHT
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // LOAD SETTINGS AND FILL NAME INPUT FIELD
  loadSettings(SETTINGS);
  nameInp.text = getPlaceholder();
  if (isLayer && isLayer.value) {
    nameTitle.text = nameTitle.text.replace('items', 'layers');
  }

  // CHANGE THE AMOUNT OF ITEMS AND PLACEHOLDER
  // Selection + Layers mode
  if (isSelection) {
    var layerTmpInp = '';
    var selTmpInp = '';
    var isEditSel = isSelection.value;

    if (isLayer.value) {
      nameTitle.text = nameTitle.text.replace(/\d+/g, uniqLayers.length);
    }

    // Rename selection
    isSelection.onClick = function () {
      if (!isEditSel) layerTmpInp = nameInp.text;
      nameTitle.text = nameTitle.text.replace(/\d+/g, docSel.length);
      nameTitle.text = nameTitle.text.replace('Layers', 'Items');
      nameInp.text = !isEmpty(selTmpInp) ? selTmpInp : getPlaceholder();
      isEditSel = true;
      sortPnl.enabled = true;
    }

    // Rename layer
    isLayer.onClick = function () {
      if (isEditSel) selTmpInp = nameInp.text;
      nameTitle.text = nameTitle.text.replace(/\d+/g, uniqLayers.length);
      nameTitle.text = nameTitle.text.replace('Items', 'Layers');
      if (isReplcSym) isReplcSym.value = false;
      nameInp.text = !isEmpty(layerTmpInp) ? layerTmpInp : getPlaceholder();
      isEditSel = false;
      sortPnl.enabled = false;
    }
  } else if (isArtboard) {
    // Layer + Artboard mode
    var layerTmpInp = '';
    var abTmpInp = '';
    var isEditAb = isArtboard.value;

    // Rename layer
    isLayer.onClick = function () {
      if (isEditAb) abTmpInp = nameInp.text;
      isFindAll.text = isFindAll.text.replace('Artboards', 'Doc Layers');
      nameInp.text = !isEmpty(layerTmpInp) ? layerTmpInp : getPlaceholder();
      isEditAb = false;
    }

    // Rename active artboard
    isArtboard.onClick = function () {
      if (!isEditAb) layerTmpInp = nameInp.text;
      isFindAll.text = isFindAll.text.replace('Doc Layers', 'Artboards');
      nameInp.text = !isEmpty(abTmpInp) ? abTmpInp : getPlaceholder();
      isEditAb = true;
    }
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = win.close;

  ok.onClick = okClick;

  function okClick() {
    var name = nameInp.text;
    var replc = replcInp ? replcInp.text : '';

    switch (docSel.length) {
      case 0: // Empty selection
        if (isFindAll.value) {
          // Find and replace in all objects
          if (isArtboard.value) replaceInAll(doc.artboards, replc, name);
          else replaceInAll(doc.layers, replc, name);
        } else {
          // Find and replace in one object
          if (!isEmpty(replc)) {
            // Find and replace in one object
            if (isArtboard.value) actAb.name = actAb.name.replaceAll(replc, name);
            else actLayer.name = actLayer.name.replaceAll(replc, name);
          } else if (!isEmpty(name)) {
            // Rename one object
            if (isArtboard.value) actAb.name = name;
            else actLayer.name = name;
          }
        }
        break;
      case 1: // One selected item
        if (isSelection.value) {
          // Rename items
          if (isReplcSym && isReplcSym.value && !isEmpty(name)) {
            docSel[0].symbol.name = name;
          }
          if (name !== getPlaceholder()) { // Input is modified
            var compound = getCompound(docSel[0]);
            if (compound) {
              compound.name = name;
            } else {
              docSel[0].name = name;
            }
          }
        } else if (!isEmpty(name)) {
          // Rename parent layers
          getTopLayer(docSel[0]).name = name;
        }
        break;
      default: // Multiple items
        if (isSelection && isSelection.value) {
          var sortedSel = [].concat(docSel);
          if (isRows.value) {
            sortByRows(sortedSel, 0);
          } else if (isCols.value) {
            sortByColumns(sortedSel, 0);
          }
          rename(sortedSel, name, replc, countInp.text, PH);
        } else if (!isEmpty(name)) {
          rename(uniqLayers, name, replc, countInp.text, PH);
        }
        break;
    }
  
    // AI doesn't update in realtime the Layers panel until CC 2020
    if (parseInt(app.version) <= 23 && docSel.length && isSelection.value) {
      try {
        var tmp = docSel[0].layer.pathItems.add();
        tmp.remove();
      } catch (err) {}
    }
  
    saveSettings(SETTINGS);
    win.close();
  }

  /**
   * Retrieve a placeholder name based on the current selection in the document
   * @returns {string} str - The placeholder name based on the selection criteria
   */
  function getPlaceholder() {
    if (docSel.typename === 'TextRange') return '';

    var str = '';

    switch (docSel.length) {
      case 0: // Empty selection
        str = isArtboard.value ? actAb.name : actLayer.name;
        break;
      case 1: // One item
        var item = docSel[0];
        str = isLayer.value ? getTopLayer(item).name : getName(item);
        break;
      default: // Multiple items
        if(isSelection && isSelection.value) {
          str = isEqualNames(docSel) ? getName(docSel[0]) : '';
        }
        break;
    }

    return str;
  }

  /**
   * Add a button with a placeholder name to the specified parent container
   * @param {string} name - The name of the button
   * @param {string|object} size - The size of the button
   * @param {object} parent - The parent container to which the button will be added
   * @param {string} value - The value to be inserted into the input field when the button is clicked
   */
  function putPlaceholder(name, size, parent, value) {
    var ph = parent.add('button', size, name);

    ph.onClick = function () {
      var str = nameInp.text;
      replcInp.active = true;
      str += value;
      nameInp.active = true;
      nameInp.textselection = str;
    }
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {Object} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
      }
    });
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

    if (isSelection) data.selection = isSelection.value;
    if (isArtboard) data.artboard = isArtboard.value;
    if (replcInp) data.pattern = replcInp.text;
    if (countInp) data.number = countInp.text;
    if (isFindAll) data.isReplace = isFindAll.value;
    if (sortPnl) data.sort = isOrder.value ? 0 : (isRows.value ? 1 : 2);

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
        if (isSelection && data.selection) {
          data.selection === 'true' ? isSelection.value = true : isLayer.value = true;
        }
        if (isArtboard && data.artboard) {
          data.artboard === 'true' ? isArtboard.value = true : isLayer.value = true;
          if (isArtboard.value) {
            isFindAll.text = isFindAll.text.replace('Doc Layers', 'Artboards');
          }
        }
        if (replcInp && data.pattern) {
          replcInp.text = data.pattern;
        }
        if (countInp && data.number) {
          countInp.text = data.number;
        }
        if (isFindAll && data.isReplace) {
          isFindAll.value = data.isReplace === 'true';
        }
        if (sortPnl) {
          sortPnl.children[parseInt(data.sort) || 0].value = true;
        }
      }
    } catch (err) {
      return;
    }
  }

  win.center();
  win.show();
}

/**
 * String prototype with a replaceAll method if it doesn't already exist
 * This method replaces all occurrences of a pattern in a string with a replacement string
 * @memberof String.prototype
 * @param {string} pattern - The substring or regex pattern to be replaced
 * @param {string} replc - The string to replace each match of the pattern
 * @returns {string} A new string with all matches of the pattern replaced by the replacement string
 */
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(pattern, replc) {
    // Escape the pattern if it's a string to handle special regex characters properly
    var escapedPattern = typeof pattern === 'string' ? pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : pattern;
    return this.replace(new RegExp(escapedPattern, 'g'), replc);
  };
}

/**
 * Retrieve unique top layers from a collection of selected items
 * @param {Array} coll - The collection of selected items
 * @returns {Array} An array of unique top layers
 */
function getUniqueLayers(coll) {
  if (!coll.length) return [];

  // Start from the end of the collection and move backwards
  var uniqLays = [getTopLayer(coll[coll.length - 1])];

  for (var i = coll.length - 2; i >= 0; i--) {
    var curLayer = getTopLayer(coll[i]);
    if (curLayer !== uniqLays[uniqLays.length - 1]) {
      uniqLays.push(curLayer);
    }
  }

  return uniqLays.reverse();
}

/**
 * Retrieve the topmost layer of an item
 * @param {Object} item - The starting layer item to check
 * @returns {Object} The topmost layer of the item
 */
function getTopLayer(item) {
  return item.parent.typename === 'Document' ? item : getTopLayer(item.parent);
}

/**
* Get the name of an item, considering its type
* @param {Object} item - The item for which to get the name
* @returns {string} str - The name of the item
*/
function getName(item) {
  if (!item || !item.typename) return item.name || '';

  // If part of a compound path, set item
  var compound = getCompound(item);
  if (compound) item = compound;

  // If item has a direct name, return it
  if (!isEmpty(item.name)) {
    return item.name;
  }

  // Special cases for derived names
  if (item.typename === 'TextFrame' && !isEmpty(item.contents)) {
    return item.contents;
  }

  if (item.typename === 'SymbolItem') {
    return item.symbol.name;
  }

  if (item.typename === 'PlacedItem') {
    return item.file && item.file.name ? item.file.name : '<Linked File>';
  }

  // Default system names for unnamed objects
  switch (item.typename) {
    case 'PathItem': return '<Path>';
    case 'CompoundPathItem': return '<Compound Path>';
    case 'GraphItem': return '<Graph>';
    case 'GroupItem': return item.clipped ? '<Clipping Group>' : '<Group>';
    case 'MeshItem': return '<Mesh>';
    case 'NonNativeItem': return '<Non-Native Art>';
    case 'RasterItem': return '<Image>';
    case 'SymbolItem': return '<Symbol>';
    case 'TextFrame': return '<Text>';
    default:
      if (isLegacyText(item)) return '<Legacy Text>';
      return '<' + item.typename + '>';
  }
}

/**
 * Retrieve the compound path parent of an item
 * @param {Object} item - The item to check for a compound path parent
 * @returns {Object|null} The compound path item if found, otherwise null
 */
function getCompound(item) {
  if (!item || !item.typename) return null;

  // Skip top-level objects: layers, artboards, document
  if (item.typename === 'Layer' || item.typename === 'Artboard' || item.typename === 'Document') {
    return null;
  }

  while (item && item.parent) {
    if (item.parent.typename === 'CompoundPathItem') {
      return item.parent;
    }
    item = item.parent;
  }

  return null;
}

/**
 * Check if an item is considered a legacy text item
 * @param {Object} item - The item to check
 * @return {boolean} Returns true if the item is a legacy text item, false otherwise
 */
function isLegacyText(item) {
  return item.typename === 'LegacyTextItem' || 
        (item.typename === 'TextFrame' && (!item.hasOwnProperty('contents') ||
        item.hasOwnProperty('converted')));
}

/**
 * Check if all names in the collection are equal
 * @param {Array} coll - The collection of items to check
 * @returns {boolean} True if all names are equal, false otherwise
 */
function isEqualNames(coll) {
  if (coll.length === 0) return true; // Handle empty collection

  var str = getName(coll[0]);
  for (var i = 1, len = coll.length; i < len; i++) {
    if (getName(coll[i]) !== str) return false;
  }
  return true;
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
 * Replace all occurrences of a pattern in the names of items within a collection
 * @param {Array} coll - The collection of items to process
 * @param {string} pattern - The pattern to search for
 * @param {string} replc - The replacement string
 */
function replaceInAll(coll, pattern, replc) {
  if (isEmpty(pattern)) return;

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];

    // Check if the item is a Layer and has sub-layers
    if (item.typename === 'Layer' && item.layers.length > 0) {
      replaceInAll(item.layers, pattern, replc);
    }

    // Replace pattern in the item's name
    var srcName = getName(item);
    var newName = srcName.replaceAll(pattern, replc);
    item.name = newName;
  }
}

/**
 * Sort an array of objects by their coordinates from left to right by rows
 * @param {Array} arr - The array of objects to be sorted
 * @param {number} tolerance - The tolerance within which objects are considered to be on the same row
 * @returns {void}
 */
function sortByRows(arr, tolerance) {
  if (arguments.length == 1 || tolerance == undefined) tolerance = 0;
  arr.sort(function(a, b) {
    if (Math.abs(b.top - a.top) <= tolerance) {
      return a.left - b.left;
    }
    return b.top - a.top;
  });
}

/**
 * Sort an array of objects by their coordinates from top to bottom by columns
 * @param {Array>} arr - The array of objects to be sorted
 * @param {number} tolerance - The tolerance within which objects are considered to be in the same column
 * @returns {void}
 */
function sortByColumns(arr, tolerance) {
  if (arguments.length == 1 || tolerance == undefined) tolerance = 0;
  arr.sort(function(a, b) {
    if (Math.abs(a.left - b.left) <= tolerance) {
      return b.top - a.top;
    }
    return a.left - b.left;
  });
}

/**
 * Rename the items based on a specified pattern
 * @param {Array} coll - The array of items to rename
 * @param {string} pattern - The naming pattern to apply
 * @param {string} replc - The substring to be replaced in the original names
 * @param {number} counter - The starting index for numbering
 * @param {Object} ph - Placeholder object containing keys for name, numUp, and numDown
 */
function rename(coll, pattern, replc, counter, ph) {
  var min = counter * 1;
  var max = coll.length + min - 1;

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    var compound = getCompound(item);
    var targetItem = compound || item;
    var srcName = getName(targetItem);

    var newName = pattern
          .replaceAll(ph.name, srcName)
          .replaceAll(ph.numUp, padZero(min + i, max.toString().length))
          .replaceAll(ph.numDown, padZero(max - i, max.toString().length));

    targetItem.name = !isEmpty(replc) ? srcName.replaceAll(replc, newName) : newName;
  }
}

/**
 * Convert a string to an integer
 * @param {string} str - The string to convert
 * @param {string|number} def - The default value to return if conversion fails
 * @return {number} The converted integer or the default value if conversion fails
 */
function convertToInt(str, def) {
  // Remove unnecessary characters
  str = str.replace(/[^\d]/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  return parseFloat(str);
}

/**
 * Pad a number with leading zeros to ensure it reaches a specified length
 * @param {number|string} num - The number to pad
 * @param {number} len - The desired length of the resulting string
 * @returns {string} num - The padded number as a string
 */
function padZero(num, len) {
  num = num.toString();
  while (num.length < len) num = '0' + num;
  return num;
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