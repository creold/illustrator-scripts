/*
  NamedItemsFinder.jsx for Adobe Illustrator
  Description: Search items in the document by name and zoom to them contents.
               Inspired by Photoshop CC 2020 features
  Date: April, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
  1.0 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via PayPal http://www.paypal.me/osokin/usd
  - via QIWI https://qiwi.com/n/OSOKIN​
  - via YooMoney https://yoomoney.ru/to/410011149615582​

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization

//Global variables
var SCRIPT_NAME = 'Named Items Finder',
    SCRIPT_VERSION = 'v.0.1',
    ZOOM_FACTOR = 0.5, // Zoom ratio in document window
    LIST_WIDTH = 300, // Units: px
    LIST_ROWS = 7, // Amount of rows in listbox
    DLG_OPACITY = .98, // UI window opacity. Range 0-1
    OVER_ITEMS = 3000, // Limit for warning about performance
    DEF_IN_TEXT = false, // Default value for search only inside text
    DEF_IN_DOC = false, // Default value for search throughout the doc
    DEF_IN_LYR = false; // Default value for include locked & hidden layers

// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.',
                     ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_SLOW = { en: 'Warning: in the document over ' + OVER_ITEMS + ' objects. The script can run slowly',
                  ru: 'Внимание: в документе свыше ' + OVER_ITEMS + ' объектов. Скрипт может работать медленно'},
    LANG_INPUT = { en: 'Enter name...', ru: 'Введите имя...'},
    LANG_CHK_LOCKED = { en: 'Include locked & hidden layers', ru: 'Включить заблокированные и скрытые слои'},
    LANG_CHK_DOC = { en: 'Search whole document', ru: 'Искать по всему документу'},
    LANG_CHK_TEXT = { en: 'Search only text contents', ru: 'Искать по содержимому текстов'},
    LANG_TITLE_LAYER = { en: 'Layer', ru: 'Слой'},
    LANG_TITLE_ITEM = { en: 'Item', ru: 'Объект'},
    LANG_TITLE_HIDDEN = { en: 'Hidden', ru: 'Скрыт'},
    LANG_TITLE_LOCKED = { en: 'Locked', ru: 'Заблокирован'},
    LANG_SEARCH = { en: 'Search', ru: 'Найти'},
    LANG_WAIT = { en: 'Waiting...', ru: 'Ожидайте...'},
    LANG_CLOSE = { en: 'Close', ru: 'Закрыть'};

function main() {
  if (!app.documents.length) {
    alert(LANG_ERR_DOC);
    return;
  }

  var doc = app.activeDocument,
      namedItems = [], // Array of all items with name in doc or selection
      resItems = [], // Array of found items
      selItems = [], // Array of selected items
      layersState = [], // Initial state of the layers
      isOverItems = false,
      isLockedPrnt = false,
      isHiddenPrnt = false;

  getItems(selection, selItems);
  saveLayersState(doc.layers, layersState);

  // Check the document contains too many items
  if ( (selection.length && selItems.length > OVER_ITEMS) ||
       (!selection.length && doc.pageItems.length > OVER_ITEMS) ) {
    isOverItems = true;
  }

  // Create Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION, undefined);
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = DLG_OPACITY;

  var nameInp = dialog.add('edittext', undefined, LANG_INPUT);
      nameInp.active = true;

  var listbox = dialog.add('listbox', [0, 0, LIST_WIDTH, 20 + 21 * LIST_ROWS], undefined,
      {
        numberOfColumns: 4,
        showHeaders: true,
        columnTitles: [LANG_TITLE_LAYER, LANG_TITLE_ITEM, LANG_TITLE_HIDDEN, LANG_TITLE_LOCKED],
        multiselect: true
      });

  // Options
  var chkGroup = dialog.add('group');
      chkGroup.orientation = 'column';
      chkGroup.alignChildren = ['left', 'center'];
      chkGroup.spacing = 5;

  if (selItems.length > 0) {
    var isInDoc = chkGroup.add('checkbox', undefined, LANG_CHK_DOC);
        isInDoc.value = DEF_IN_DOC;
  }

  var isInLocked = chkGroup.add('checkbox', undefined, LANG_CHK_LOCKED);
      isInLocked.value = (typeof isInDoc !== 'undefined') ? false : DEF_IN_LYR;
      isInLocked.enabled = (typeof isInDoc !== 'undefined') ? false : true;

  var isInText = chkGroup.add('checkbox', undefined, LANG_CHK_TEXT);
      isInText.value = DEF_IN_TEXT;

  if (isOverItems) {
    var warningMsg = dialog.add('statictext', undefined, LANG_SLOW, {multiline: true});
        warningMsg.enabled = false;
  }

  // Buttons
  var btns = dialog.add('group');
      btns.alignChildren = ['center', 'center'];
  var close = btns.add('button', undefined, LANG_CLOSE, {name: 'cancel'});

  var copyright = dialog.add('statictext', undefined, '\u00A9 https://github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  if (isOverItems) {
    var search = btns.add('button', undefined, LANG_SEARCH,  {name: 'ok'});
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
        app.redraw();
      }
      if (typeof search == 'undefined') outputResult();
    }
  }

  // Include locked & hidden layers
  isInLocked.onClick = function() {
    (this.value) ? resetLayersState(layersState) : restoreLayersState(layersState);
    app.redraw();
    namedItems = []; // Clear for collect new items
    if (typeof search == 'undefined') outputResult();
  };

  close.onClick = function() {
    if (isLockedPrnt || isHiddenPrnt) selection = null;
    if (isInLocked.value) restoreLayersState(layersState);
    dialog.close();
  };

  // Displaying search results for navigation
  function outputResult() {
    // Change the search button label
    if (typeof search !== 'undefined') {
      search.text = LANG_WAIT;
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

    resItems = getByName(nameInp.text, namedItems, isInText.value);

    // Create listbox rows from search results
    var newListItem;
    for (var i = 0, len = resItems.length; i < len; i++) {
      // If search only text contents
      if (isInText.value) {
        if (nameInp.text !== '') {
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
        if (isSymbol(resItems[i]) && resItems[i].name == '') {
          newListItem.subItems[0].text = resItems[i].symbol.name;
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
      search.text = LANG_SEARCH;
      dialog.update();
    }
  }

  // Select list items and zoom to them contents
  function selectListItem() {
    var selListItems = [], // Array of selected list rows
        tmpItems = [],  // Array of the found items
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
      };
    }

    calcBounds(selection);
    zoom(ZOOM_FACTOR);
    restoreItemsState(tmpState);
    app.redraw();
  }

  dialog.center;
  dialog.show();
}

/**
 * Collect items with any type
 * @param {object} collection source array of items
 * @param {array} arr output array of items
 */
function getItems(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          arr.push(currItem);
          getItems(currItem.pageItems, arr);
          break;
        default:
          arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Get items in visible & unlocked Layers & Sublayers
 * @param {object} _layers source layers
 * @param {array} arr output array of items
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
 * @param {array} collection source array of items
 * @return {array} output array of named items
 */
function getNamedItems(collection) {
  var currItem,
      arr = [];
  for (var i = 0, len = collection.length; i < len; ++i) {
    currItem = collection[i];
    if (isSymbol(currItem)) {
      arr.push(currItem);
    } else if (isNotEmptyText(currItem)) {
      arr.push(currItem);
    } else if (currItem.name !== '') {
      arr.push(currItem);
    }
  }
  return arr;
}

/**
 * Get name matches
 * @param {string} str search string
 * @param {array} collection source array of named items
 * @param {boolean} option the value of the text search checkbox
 * @return {array} array of matches 
 */
function getByName(str, collection, option) {
  var currItem,
      arr = [],
      regexp = new RegExp(str, 'i'); // Case insensitive search
  for (var i = 0, len = collection.length; i < len; i++) {
    currItem = collection[i];
    if (option) {
      if (isNotEmptyText(currItem) && currItem.contents.match(regexp)) arr.push(currItem);
    } else {
      if ((isSymbol(currItem) && currItem.name == '' && currItem.symbol.name.match(regexp))
           || (currItem.name.match(regexp) && currItem.name !== '')) {
        arr.push(currItem);
      }
    }
  }
  return arr;
}

/**
 * Save locked & hidden state of pageItems
 * @param {array} collection source array of matched items with childrens
 * @param {object} state output array of objects
 */
function saveItemsState(collection, state) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var currItem = collection[i];
    state.push({
      'item': currItem,
      'vis': currItem.hidden,
      'lock': currItem.locked
    });
    currItem.locked = false;
    currItem.hidden = false;
  }
}

/**
 * Restore locked & hidden pageItems
 * @param {object} state source items
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
 * @param {object} _layers source layers
 * @param {array} arr output array of objects
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
 * @param {object} collection source layers & sublayers
 */
function resetLayersState(collection) {
  for (var i = 0, len = collection.length; i < len; i++) {
    collection[i].lyr.locked = false;
    collection[i].lyr.visible = true;
  }
}

/**
 * Restore locked & hidden states of layers & sublayers
 * @param {object} collection source layers & sublayers
 */
function restoreLayersState(collection) {
  for (var i = 0, len = collection.length; i < len; i++) {
    collection[i].lyr.locked = collection[i].lock;
    collection[i].lyr.visible = collection[i].vis;
  }
}

/**
 * Get the topmost parent Group via recursion
 * @param {object} item source item
 * @return {object} topmost group or the object itself
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
 * @param {object} item source item
 * @param {object} _layers collection of doc layers & sublayers
 * @param {array} arr boolean values of item state
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
 * @param {object} item source item
 * @param {string} str entered characters
 * @return {string} return full word between whitespaces
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
 * Get visible bounds of selected items
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {object} collection selected items
 */
function calcBounds(collection) {
  // If object is a (collection of) object(s) not a text field.
  if (collection instanceof Array) {
    // Initialize vars
    initBounds = collection[0].visibleBounds;
    ul_x = initBounds[0];
    ul_y = initBounds[1];
    lr_x = initBounds[2];
    lr_y = initBounds[3];
    // Check rest of group if any
    for (i = 1, len = collection.length; i < len; i++) {
      groupBounds = collection[i].visibleBounds;
      if (groupBounds[0] < ul_x) ul_x = groupBounds[0];
      if (groupBounds[1] > ul_y) ul_y = groupBounds[1];
      if (groupBounds[2] > lr_x) lr_x = groupBounds[2];
      if (groupBounds[3] < lr_y) lr_y = groupBounds[3];
    }
  }
}

/**
 * Zoom to selected items
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {number} ratio scale ratio
 */
function zoom(ratio) {
  var doc = app.activeDocument;
  // Get x,y/x,y Matrix for 100% view
  doc.views[0].zoom = 1;
  screenSize = doc.views[0].bounds;
  screenWidth = screenSize[2] - screenSize[0];
  screenHeight = screenSize[1] - screenSize[3];
  screenProportion = screenHeight / screenWidth;

  // Determine upperLeft position of object(s)
  cntrPos = [ul_x, ul_y];

  mySelWidth = lr_x - ul_x;
  mySelHeight = ul_y - lr_y;
  cntrPos[0] = ul_x + mySelWidth / 2;
  cntrPos[1] = ul_y - mySelHeight / 2;
  doc.views[0].centerPoint = cntrPos;

  // Set zoom for height and width
  zoomFactorW = screenWidth / mySelWidth;
  zoomFactorH = screenHeight / mySelHeight;

  // Decide which proportion is larger...
  if (mySelWidth * screenProportion >= mySelHeight) {
    zF = zoomFactorW;
  } else {
    zF = zoomFactorH;
  }

  // And scale to that proportion minus a little bit.
  doc.views[0].zoom = zF * parseFloat(ratio);
}

/**
 * Check item type
 * @param {object} item source item
 * @return {boolean} 
 */
function isSymbol(item) {
  return item.typename === 'SymbolItem';
}

/**
 * Check item type
 * @param {object} item source item
 * @return {boolean} 
 */
function isNotEmptyText(item) {
  return item.typename === 'TextFrame' && item.contents.length > 0;
}

/**
 * Check for multiple words in the string
 * @param {string} str user input
 * @return {boolean} 
 */
function hasWhiteSpace(str) {
  return /\s/g.test(str);
}

function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

try {
  main();
} catch (e) {
  // showError(e);
}