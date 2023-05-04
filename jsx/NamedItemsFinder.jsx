/*
  NamedItemsFinder.jsx for Adobe Illustrator
  Description: Search items in the document by name and zoom to them contents. Inspired by Photoshop CC 2020 features
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added custom zoom checkbox & saving settings
  0.2.1 Added a linked image search
  0.2.2 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), CS6, 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

function main() {
  var SCRIPT = {
        name: 'Named Items Finder',
        version: 'v.0.2.2'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        zoomRatio: 0.1, // Zoom ratio in document window
        width: 300, // Units: px
        rows: 7, // Amount of rows in listbox
        inText: false, // Default value for search only inside text
        inDoc: false, // Default value for search throughout the doc
        inLayers: false, // Default value for include locked & hidden layers
        noZoom: false, // Jump to item without zoom
        limit: 3000, // Limit for warning about performance
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        warning: { en: 'Warning: in the document over ' + CFG.limit + ' objects. The script can run slowly',
                  ru: 'Внимание: в документе свыше ' + CFG.limit + ' объектов. Скрипт может работать медленно'},
        input: { en: 'Enter name...', ru: 'Введите имя...'},
        allDoc: { en: 'Search whole document', ru: 'Искать по всему документу'},
        allLayers: { en: 'Include locked & hidden layers', ru: 'Включить заблокированные и скрытые слои'},
        onlyText: { en: 'Search only text contents', ru: 'Искать по содержимому текстов'},
        noZoom: { en: 'Center view with zoom ratio (' + CFG.zoomRatio + '-1)', ru: 'Показать по центру с приближением (' + CFG.zoomRatio + '-1)'},
        layer: { en: 'Layer', ru: 'Слой'},
        item: { en: 'Item', ru: 'Объект'},
        hidden: { en: 'Hidden', ru: 'Скрыт'},
        locked: { en: 'Locked', ru: 'Заблокирован'},
        search: { en: 'Search', ru: 'Найти'},
        wait: { en: 'Waiting...', ru: 'Ожидайте...'},
        close: { en: 'Close', ru: 'Закрыть'},
        link: { en: '<Linked File>', ru: '<Связанный файл>'},
        image: { en: '<Image>', ru: '<Изображение>'}
      };

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  var doc = activeDocument,
      namedItems = [], // Array of all items with name in doc or selection
      resItems = [], // Array of found items
      selItems = [], // Array of selected items
      layersState = [], // Initial state of the layers
      isOverItems = false,
      isLockedPrnt = false,
      isHiddenPrnt = false;

  getItems(selection, selItems);
  saveLayersState(doc.layers, layersState);

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers > 16;

  // Check the document contains too many items
  if ( (selection.length && selItems.length > CFG.limit) ||
        (!selection.length && doc.pageItems.length > CFG.limit) ) {
    isOverItems = true;
  }

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = CFG.uiOpacity;

  var nameInp = dialog.add('edittext', undefined, LANG.input);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    nameInp.active = true;
  }

  var listbox = dialog.add('listbox', [0, 0, CFG.width, 20 + 21 * CFG.rows], undefined,
      {
        numberOfColumns: 4,
        showHeaders: true,
        columnTitles: [LANG.layer, LANG.item, LANG.hidden, LANG.locked],
        multiselect: true
      });

  // Options
  var chkGroup = dialog.add('group');
      chkGroup.orientation = 'column';
      chkGroup.alignChildren = ['left', 'center'];
      chkGroup.spacing = 5;

  if (selItems.length > 0) {
    var isInDoc = chkGroup.add('checkbox', undefined, LANG.allDoc);
        isInDoc.value = CFG.inDoc;
  }

  var isInLocked = chkGroup.add('checkbox', undefined, LANG.allLayers);
      isInLocked.value = (typeof isInDoc !== 'undefined') ? false : CFG.inLayers;
      isInLocked.enabled = (typeof isInDoc !== 'undefined') ? false : true;

  var isInText = chkGroup.add('checkbox', undefined, LANG.onlyText);
      isInText.value = CFG.inText;

  var zoomGroup = chkGroup.add('group');
      zoomGroup.alignChildren = ['left', 'bottom'];

  var isZoom = zoomGroup.add('checkbox', undefined, LANG.noZoom);
      isZoom.value = CFG.noZoom;

  var zoomRatioInp = zoomGroup.add('edittext', undefined, CFG.zoomRatio);
      zoomRatioInp.characters = 5;

  if (isOverItems) {
    var warningMsg = dialog.add('statictext', undefined, LANG.warning, { multiline: true });
        warningMsg.enabled = false;
  }

  // Buttons
  var btns = dialog.add('group');
      btns.alignChildren = ['center', 'center'];
  var close = btns.add('button', undefined, LANG.close, {name: 'cancel'});

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  loadSettings(layersState);

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  if (isOverItems) {
    var search = btns.add('button', undefined, LANG.search,  {name: 'ok'});
    search.onClick = outputResult;
  } else {
    nameInp.onChanging = outputResult;
    isInText.onClick = outputResult;
  }

  // Select matched item
  listbox.onChange = selectListItem;

  // Search whole document
  if (typeof isInDoc !== 'undefined') {
    isInDoc.onClick = function() {
      namedItems = []; // Clear for collect new items
      isInLocked.enabled = this.value;
      if (!this.value) {
        isInLocked.value = false;
        restoreLayersState(layersState);
        redraw();
      }
      if (typeof search == 'undefined') outputResult();
    }
  }

  // Include locked & hidden layers
  isInLocked.onClick = function() {
    (this.value) ? resetLayersState(layersState) : restoreLayersState(layersState);
    redraw();
    namedItems = []; // Clear for collect new items
    if (typeof search == 'undefined') outputResult();
  }

  isZoom.onClick = function() {
    zoomRatioInp.onChange();
  }

  // Changing the zoom ratio
  zoomRatioInp.onChange = function() {
    if (strToAbsNum(this.text, CFG.zoomRatio) > 1) this.text = 1;
    if (strToAbsNum(this.text, CFG.zoomRatio) < CFG.zoomRatio) this.text = CFG.zoomRatio;

    for (var i = 0, len = listbox.children.length; i < len; i++) {
      if (listbox.children[i].selected) {
        zoom(this.text, isZoom.value);
        redraw();
        break;
      }
    }
  }

  close.onClick = function() {
    if (isLockedPrnt || isHiddenPrnt) selection = null;
    if (isInLocked.value) restoreLayersState(layersState);
    saveSettings();
    dialog.close();
  }

  // Displaying search results for navigation
  function outputResult() {
    // Change the search button label
    if (typeof search !== 'undefined') {
      search.text = LANG.wait;
      dialog.update();
    }

    listbox.removeAll(); // Clear list before search

    // Get named items in the document or selection
    if (namedItems.length == 0) {
      if (selItems.length > 0 && !isInDoc.value) {
        namedItems = getNamedItems(selItems);
      } else {
        var layersItems = [];
        getLayersItems(doc.layers, layersItems);
        namedItems = getNamedItems(layersItems);
      }
    }

    resItems = getByName(nameInp.text, LANG.link, LANG.image, namedItems, isInText.value);

    // Create listbox rows from search results
    var newListItem;
    for (var i = 0, len = resItems.length; i < len; i++) {
      // If search only text contents
      if (isInText.value) {
        if (!isEmpty(nameInp.text)) {
          newListItem = listbox.add('item', resItems[i].layer.name);
          // Show all entered text
          if (hasWhiteSpace(nameInp.text)) {
            newListItem.subItems[0].text = nameInp.text;
          } else {
            // Show the full word
            var fullWord = getFirstWord(resItems[i], nameInp.text);
            newListItem.subItems[0].text = fullWord;
          }
        }
      } else {
        newListItem = listbox.add('item', resItems[i].layer.name);
        // Trick for get Symbol name
        if (isSymbol(resItems[i]) && isEmpty(resItems[i].name)) {
          newListItem.subItems[0].text = resItems[i].symbol.name;
        } else if (isLink(resItems[i]) && isEmpty(resItems[i].name)) {
          newListItem.subItems[0].text = LANG.link;
        } else if (isImage(resItems[i]) && isEmpty(resItems[i].name)) {
          newListItem.subItems[0].text = LANG.image;
        } else {
          newListItem.subItems[0].text = resItems[i].name;
        }
      }

      // Show item state using Unicode icons
      var tmpPrntState = [false, false];
      checkParentState(resItems[i], layersState, tmpPrntState);
      newListItem.subItems[1].text = (resItems[i].hidden || tmpPrntState[0]) ? '\u2713' : '';
      newListItem.subItems[2].text = (resItems[i].locked || tmpPrntState[1]) ? '\u2713' : '';
    }

    // Restore the search button label
    if (typeof search !== 'undefined') {
      search.text = LANG.search;
      dialog.update();
    }
  }

  // Select list items and zoom to them contents
  function selectListItem() {
    var tmpItems = [],  // Array of the found items
        tmpState = [], //  Initial state of the found items
        itemPrntGp; // Topmost parent Group of item

    isLockedPrnt = false;
    isHiddenPrnt = false;
    selection = null;

    // Collect selected rows indexes
    for (var i = 0, len = listbox.children.length; i < len; i++) {
      var tmpPrntState = [false, false];
      tmpItems = []; // Reset array for multiple select
      if (listbox.children[i].selected) {
        itemPrntGp = getTopGroup(resItems[i]);
        checkParentState(resItems[i], layersState, tmpPrntState);
        if (tmpPrntState[0]) isHiddenPrnt = true;
        if (tmpPrntState[1]) isLockedPrnt = true;

        if (resItems[i].typename === 'GroupItem') {
          tmpItems.push(resItems[i]);
          getItems(resItems[i].pageItems, tmpItems);
        } else {
          if (itemPrntGp.typename === 'GroupItem' && itemPrntGp.pageItems.length == 1) {
            tmpItems.push(itemPrntGp);
            getItems(itemPrntGp.pageItems, tmpItems);
          } else {
            tmpItems.push(resItems[i]);
          }
        }

        saveItemsState(tmpItems, tmpState);
        resItems[i].selected = true;
      }
    }
    
    var ratio = strToAbsNum(zoomRatioInp.text, CFG.zoomRatio);
    zoom(ratio, isZoom.value);

    restoreItemsState(tmpState);
    redraw();
  }

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.inAllDoc = (typeof isInDoc !== 'undefined') ? isInDoc.value : false;
    pref.inAllLayers = isInLocked.value;
    pref.inOnlyText = isInText.value;
    pref.isZoom = isZoom.value;
    pref.zoomRatio = zoomRatioInp.text;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  function loadSettings(arr) {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          if (typeof isInDoc !== 'undefined') {
            isInDoc.value = (pref.inAllDoc == true);
            if (pref.inAllDoc == true) isInLocked.enabled = true;
          }
          isInLocked.value = (isInLocked.enabled && pref.inAllLayers == true);
          if (isInLocked.value) {
            resetLayersState(arr);
            redraw();
          }
          isInText.value = (pref.inOnlyText == true);
          isZoom.value = (pref.isZoom == true);
          zoomRatioInp.text = pref.zoomRatio;
        }
      } catch (e) {}
    }
  }

  dialog.center;
  dialog.show();
}

/**
 * Simulate keyboard keys on Windows OS via VBScript
 * 
 * This function is in response to a known ScriptUI bug on Windows.
 * Basically, on some Windows Ai versions, when a ScriptUI dialog is
 * presented and the active attribute is set to true on a field, Windows
 * will flash the Windows Explorer app quickly and then bring Ai back
 * in focus with the dialog front and center.
 *
 * @param {String} k - Key to simulate
 * @param {Number} n - Number of times to simulate the keypress
 */
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
}

/**
 * Collect items with any type
 * @param {(Object|Array)} collection - Source array of items
 * @param {Array} arr - Output array of items
 */
function getItems(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var item = collection[i];
    try {
      switch (item.typename) {
        case 'GroupItem':
          arr.push(item);
          getItems(item.pageItems, arr);
          break;
        default:
          arr.push(item);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Get items in visible & unlocked Layers & Sublayers
 * @param {Object} _layers - Source layers
 * @param {Array} arr - Output array of items
 */
function getLayersItems(_layers, arr) {
  for (var i = 0, len = _layers.length; i < len; i++) {
    var currLayer = _layers[i];
    if (currLayer.visible && !currLayer.locked) {
      if (currLayer.layers.length > 0) {
        getItems(currLayer.pageItems, arr);
        getLayersItems(currLayer.layers, arr);
      } else {
        getItems(currLayer.pageItems, arr);
      }
    }
  }
}

/**
 * Collect items with names & TextFrames with contents
 * @param {Array} collection - Source array of items
 * @return {Array} out - Output array of named items
 */
function getNamedItems(collection) {
  var item,
      out = [];
  for (var i = 0, len = collection.length; i < len; ++i) {
    item = collection[i];
    if (!isEmpty(item.name) || isSymbol(item) || isLink(item) ||
        isImage(item) || isNotEmptyText(item)) {
      out.push(item);
    }
  }
  return out;
}

/**
 * Check empty string
 * @param {string} str - Input string
 * @return {boolean}
 */
function isEmpty(str) {
  return !str || !str.length;
}

/**
 * Get name matches
 * @param {string} str - search string
 * @param {string} link - Default caption for linked file
 * @param {string} image - Default caption for embed file
 * @param {Array} collection - Source array of named items
 * @param {boolean} option - The value of the text search checkbox
 * @return {Array} out - Array of matches
 */
function getByName(str, link, image, collection, option) {
  var item,
      out = [],
      regexp = new RegExp(str, 'i'); // Case insensitive search
  for (var i = 0, len = collection.length; i < len; i++) {
    item = collection[i];
    if (option) {
      if (isNotEmptyText(item) && item.contents.match(regexp)) out.push(item);
    } else {
      if ((isSymbol(item) && isEmpty(item.name) && item.symbol.name.match(regexp)) ||
          (isLink(item) && isEmpty(item.name) && ('' + link).match(regexp)) ||
          (isImage(item) && isEmpty(item.name) && ('' + image).match(regexp)) ||
          (!isEmpty(item.name)  && item.name.match(regexp))) {
        out.push(item);
      }
    }
  }
  return out;
}

/**
 * Save locked & hidden state of pageItems
 * @param {Array} collection - Source array of matched items with childrens
 * @param {Object} state - Output array of objects
 */
function saveItemsState(collection, state) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var item = collection[i];
    state.push({
      'item': item,
      'vis': item.hidden,
      'lock': item.locked
    });
    item.locked = false;
    item.hidden = false;
  }
}

/**
 * Restore locked & hidden pageItems
 * @param {Object} state
 */
function restoreItemsState(state) {
  for (var i = 0, len = state.length; i < len; i++) {
    var obj = state[i];
    obj.item.hidden = obj.vis;
    obj.item.locked = obj.lock;
  }
}

/**
 * Save information about locked & hidden layers & sublayers
 * @param {Object} _layers - Source layers
 * @param {Array} arr - Output array of objects
 */
function saveLayersState(_layers, arr) {
  for (var i = 0, len = _layers.length; i < len; i++) {
    arr.push({
      'lyr': _layers[i],
      'vis': _layers[i].visible,
      'lock': _layers[i].locked,
    });
    if (_layers[i].layers.length) saveLayersState(_layers[i].layers, arr);
  }
}

/**
 * Unlock & show all layers & sublayers
 * @param {Object} collection - Source layers & sublayers
 */
function resetLayersState(collection) {
  for (var i = 0, len = collection.length; i < len; i++) {
    collection[i].lyr.locked = false;
    collection[i].lyr.visible = true;
  }
}

/**
 * Restore locked & hidden states of layers & sublayers
 * @param {Object} collection - Source layers & sublayers
 */
function restoreLayersState(collection) {
  for (var i = 0, len = collection.length; i < len; i++) {
    collection[i].lyr.locked = collection[i].lock;
    collection[i].lyr.visible = collection[i].vis;
  }
}

/**
 * Get the topmost parent Group via recursion
 * @param {Object} item - Source item
 * @return {object} Topmost group or the object itself
 */
function getTopGroup(item) {
  if (item.parent.typename !== 'Layer') {
    return getTopGroup(item.parent);
  } else {
    return item;
  }
}

/**
 * Get the topmost parent state via recursion
 * @param {Object} item - Source item
 * @param {Object} _layers - Collection of doc layers & sublayers
 * @param {Array} arr - Boolean values of item state
 */
function checkParentState(item, _layers, arr) {
  var prnt = item.parent;
  try {
    switch (prnt.typename) {
      case 'GroupItem':
        if (prnt.hidden) arr[0] = true;
        if (prnt.locked) arr[1] = true;
        checkParentState(prnt, _layers, arr);
        break;
      case 'Layer':
        for (var i = 0, len = _layers.length; i < len; i++) {
          if (prnt === _layers[i].lyr) {
            if (!_layers[i].vis) arr[0] = true;
            if (_layers[i].lock) arr[1] = true;
            break;
          }
        }
        checkParentState(prnt, _layers, arr);
        break;
      default:
        break;
    }
  } catch (e) {}
}

/**
 * Get the first full word by matching characters
 * @param {Object} item - Source item
 * @param {string} str - Entered characters
 * @return {string} Return full word between whitespaces
 */
function getFirstWord(item, str) {
  var enterCode = String.fromCharCode(3),
      regSplit = new RegExp('\\s|' + enterCode, 'g'),
      regStr = new RegExp(str, 'i'), // Case insensitive search
      words = item.contents.split(regSplit);
  for (var i = 0, len = words.length; i < len; i++) {
    if (words[i].match(regStr)) {
      var res = words[i];
      if (i > 0) res = '...' + res;
      if (i !== len - 1) res += '...';
      return res;
    }
  }
}

/**
 * Zoom to selected items
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {number} ratio - Scale ratio
 * @param {boolean} isZoom - Use scale ratio
 */
function zoom(ratio, isZoom) {
  var doc = activeDocument;
  // Get x,y/x,y Matrix for 100% view
  if (isZoom) doc.views[0].zoom = 1;

  var screenSize = doc.views[0].bounds,
      screenWidth = screenSize[2] - screenSize[0],
      screenHeight = screenSize[1] - screenSize[3],
      screenProportion = screenHeight / screenWidth;

  // Determine upperLeft position of object(s)
  var bnds = calcBounds(selection),
      centerPos = [bnds[0], bnds[1]],
      width = bnds[2] - bnds[0],
      height = bnds[1] - bnds[3];

  centerPos[0] = bnds[0] + width / 2;
  centerPos[1] = bnds[1] - height / 2;

  doc.views[0].centerPoint = centerPos;

  if (isZoom) {
    // Set zoom for height and width
    var zoomRatioW = screenWidth / width,
        zoomRatioH = screenHeight / height;

    // Decide which proportion is larger...
    var zR = (width * screenProportion >= height) ? zoomRatioW : zoomRatioH;

    // And scale to that proportion minus a little bit.
    doc.views[0].zoom = zR * parseFloat(ratio);
  }
}

/**
 * Get visible bounds of selected items
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {Object} collection - Selected items
 */
function calcBounds(collection) {
  // If object is a (collection of) object(s) not a text field.
  if (collection instanceof Array) {
    // Initialize vars
    var initBounds = collection[0].visibleBounds,
        ul_x = initBounds[0];
        ul_y = initBounds[1];
        lr_x = initBounds[2];
        lr_y = initBounds[3];

    // Check rest of group if any
    for (var i = 1, len = collection.length; i < len; i++) {
      var groupBounds = collection[i].visibleBounds;
      if (groupBounds[0] < ul_x) ul_x = groupBounds[0];
      if (groupBounds[1] > ul_y) ul_y = groupBounds[1];
      if (groupBounds[2] > lr_x) lr_x = groupBounds[2];
      if (groupBounds[3] < lr_y) lr_y = groupBounds[3];
    }
  }

  return [ul_x, ul_y, lr_x, lr_y];
}

/**
 * Check the symbol type
 * @param {Object} item - Source item
 * @return {boolean}
 */
function isSymbol(item) {
  return item.typename === 'SymbolItem';
}

/**
 * Check the placed art type
 * @param {Object} item - Source item
 * @return {boolean}
 */
function isLink(item) {
  return item.typename === 'PlacedItem';
}

/**
 * Check the image type
 * @param {Object} item - Source item
 * @return {boolean}
 */
function isImage(item) {
  return item.typename === 'RasterItem';
}

/**
 * Check item type
 * @param {Object} item - Source item
 * @return {boolean}
 */
function isNotEmptyText(item) {
  return item.typename === 'TextFrame' && item.contents.length > 0;
}

/**
 * Check for multiple words in the string
 * @param {string} str - User input
 * @return {boolean}
 */
function hasWhiteSpace(str) {
  return /\s/g.test(str);
}

/**
 * Convert string to absolute number
 * @param {string} str - Input data
 * @param {number} def - Default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
* Open link in browser
* @param {string} url - Website adress
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
} catch (e) {}