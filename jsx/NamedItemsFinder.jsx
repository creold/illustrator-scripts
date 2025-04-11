/*
  NamedItemsFinder.jsx for Adobe Illustrator
  Description: Search items in the document by name and zoom to them contents. Inspired by Photoshop CC 2020 features
  Date: April, 2021
  Modification date: April, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3 Added search modes, search scopes, column with human-readable item type. Minor improvements
  0.2.3 Removed input activation on Windows OS below CC v26.4
  0.2.2 Fixed input activation in Windows OS
  0.2.1 Added a linked image search
  0.2 Added custom zoom checkbox & saving settings
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
        name: 'Named Items Finder',
        version: 'v0.3'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        minZoom: 0.1, // Minimum zoom ratio in document window
        width: 300, // Units: px
        rows: 9, // Amount of rows in listbox
        noZoom: false, // Jump to item without zoom
        limit: 3000, // Limit for warning about performance
        uiOpacity: .97 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  var LABEL = {
        compound: '<Compound Path>',
        graph: '<Graph>',
        group: '<Group>',
        legacy: '<Legacy Text>',
        link: '<Linked File>',
        mesh: '<Mesh>',
        nonative: '<Non-Native Art>',
        image: '<Image>',
        errDoc: 'Error\nOpen a document and try again',
        warning: 'Warning: in the document over ' + CFG.limit + ' objects.\nThe script can run slowly',
        query: 'Query:',
        mode: 'Search By:',
        scope: 'Search In:',
        modeName: 'Name',
        modeType: 'Type',
        modeText: 'Text Contents',
        empty: 'No results found',
        list: 'List of document objects that match by name.\nUse \u2318 Cmd (Ctrl) or \u21e7 Shift to select list items\nand document objects',
        allLayers: 'Include Locked & Hidden Layers',
        noZoom: 'Zoom To Selection (Ratio: ' + CFG.minZoom + '-1)',
        item: 'Item',
        layer: 'Layer',
        type: 'Type',
        hidden: 'Hidden',
        locked: 'Locked',
        search: 'Search',
        clear: 'Clear unput',
        wait: 'Waiting...',
        close: 'Close'
      };

  var TYPE_MAP = {
    'PathItem': 'Path',
    'CompoundPathItem': 'Compound Path',
    'GroupItem': 'Group',
    'TextFrame': 'Text',
    'PlacedItem': 'Linked File',
    'RasterItem': 'Raster Image',
    'SymbolItem': 'Symbol',
    'MeshItem': 'Mesh',
    'PluginItem': 'Plugin Item',
    'GraphItem': 'Graph',
    'LegacyTextItem': 'Legacy Text (AI v10)',
    'NonNativeItem': 'Non-Native'
  };

  if (!/illustrator/i.test(app.name)) {
    return;
  }

  if (!app.documents.length) {
    alert(LABEL.errDoc);
    return;
  }

  var doc = activeDocument,
      docSel = app.selection,
      actLayName = doc.activeLayer.name.substr(0, 30)
      actAbName = doc.artboards[doc.artboards.getActiveArtboardIndex()].name.substr(0, 30),
      namedItems = [], // All named items
      resItems = [], // Matched items
      selItems = [], // Selected items
      layItems = [], // Active layer items
      abItems = [], // Active artboard items
      layState = [], // Visible and locked status of document layers
      isOverLimit = false,
      isLocked = false,
      isHidden = false;

  // Parse items
  getItems(app.selection, selItems);
  getItems(doc.activeLayer.pageItems, layItems);
  if (CFG.aiVers >= 16) {
    app.executeMenuCommand('deselectall');
  } else {
    app.selection = null;
  }
  doc.selectObjectsOnActiveArtboard();
  getItems(app.selection, abItems);
  app.selection = null;

  var selNamedItems = getNamedItems(selItems),
      layNamedItems = getNamedItems(layItems),
      abNamedItems = getNamedItems(abItems);

  saveLayersState(doc.layers, layState);

  // Check the document contains too many items
  if ((docSel.length && selItems.length > CFG.limit) ||
      (!docSel.length && doc.pageItems.length > CFG.limit)) {
    isOverLimit = true;
  }

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.uiOpacity;

  // SEARCH QUERY
  var queryGroup = win.add('group');
      queryGroup.alignChildren = ['left', 'center'];

  queryGroup.add('statictext', undefined, LABEL.query);
  var query = queryGroup.add('edittext', undefined, '');
      query.alignment = ['fill', 'center'];
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    query.active = true;
  }

  var clear = queryGroup.add('button', undefined, '\u2715');
      clear.alignment = ['right', 'center'];
      clear.preferredSize = [30, 22];
      clear.helpTip = LABEL.clear;

  // SEARCH QUERY
  var scopeGroup = win.add('group');
      scopeGroup.alignChildren = ['left', 'center'];

  scopeGroup.add('statictext', undefined, LABEL.scope);

  var scopeList = [
        'Document',
        'Layer: ' + actLayName,
        'Artboard: ' + actAbName
      ];
  if (selItems.length) scopeList.unshift('Selection');

  var scopeDdl = scopeGroup.add('dropdownlist', undefined, scopeList);
      scopeDdl.selection = 0;
      scopeDdl.alignment = ['fill', 'center'];

  // SEARCH MODE
  var modeGroup = win.add('group');
      modeGroup.alignChildren = ['left', 'top'];
  
  modeGroup.add('statictext', undefined, LABEL.mode);
  var isByName = modeGroup.add('radiobutton', undefined, LABEL.modeName);
      isByName.value = true;
  var isByType = modeGroup.add('radiobutton', undefined, LABEL.modeType);
      isByType.helpTip = getTypeNamesList(TYPE_MAP);
  var isByText = modeGroup.add('radiobutton', undefined, LABEL.modeText);

  // MATCH LIST
  var listBox = win.add('listbox', [0, 0, CFG.width, 20 + 21 * CFG.rows], undefined,
      {
        numberOfColumns: 5,
        showHeaders: true,
        columnTitles: [LABEL.item, LABEL.type, LABEL.layer, LABEL.hidden, LABEL.locked],
        multiselect: true
      });
  listBox.helpTip = LABEL.list;

  // OPTIONS
  var optGroup = win.add('group');
      optGroup.orientation = 'column';
      optGroup.alignChildren = ['fill', 'fill'];
      optGroup.spacing = 7;

  var isInLocked = optGroup.add('checkbox', undefined, LABEL.allLayers);

  // ZOOM
  var zoomGroup = optGroup.add('group');
      zoomGroup.alignChildren = ['left', 'bottom'];

  var isZoom = zoomGroup.add('checkbox', undefined, LABEL.noZoom);
      isZoom.value = CFG.noZoom;

  var zoomRatioInp = zoomGroup.add('edittext', undefined, CFG.minZoom);
      zoomRatioInp.characters = 5;

  // LIMIT WARNING
  if (isOverLimit) {
    var warningMsg = win.add('statictext', undefined, LABEL.warning, { multiline: true });
        warningMsg.enabled = false;
  }

  // FOOTER
  var footer = win.add('group');
      footer.alignChildren = ['fill', 'fill'];

  var copyright = footer.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'left';

  // BUTTONS
  var btns = footer.add('group');
      btns.alignChildren = ['right', 'center'];

  if (isOverLimit) {
    var searchBtn = btns.add('button', undefined, LABEL.search,  {name: 'ok'});
  }
  var closeBtn = btns.add('button', undefined, LABEL.close, {name: 'cancel'});

  // EVENTS
  loadSettings(SETTINGS, layState);
  if (!isOverLimit) outputResults(); // Real-time search

  if (isOverLimit) {
    searchBtn.onClick = function () {
      this.active = true;
      query.active = true;
      scopeDdl.active = false;
      outputResults();
    }
  } else {
    query.onChanging = outputResults; // Real-time search
  }

  clear.onClick = function () {
    query.text = '';
    this.active = true;
    query.active = true;
    scopeDdl.active = false;
    if (!isOverLimit) outputResults(); // Real-time search
  }

  scopeDdl.onChange = function () {
    query.active = false;
    this.active = true;

    // Adobe Illustrator crash protection
    if (this.children.length > 1) {
      // Protect mouse selection of empty separator in dropdown
      if (this.selection === null) {
        this.selection = 0;
      }
    }

    namedItems = []; // Clear for collect new items
    if (!isOverLimit) outputResults(); // Real-time search
  }

  isByName.onClick = isByType.onClick = isByText.onClick = function () {
    if (!isOverLimit) outputResults(); // Real-time search
  }

  // Select matched item
  listBox.onChange = selectResults;

  // Include locked & hidden layers
  isInLocked.onClick = function() {
    app.selection = null;
    this.value ? resetLayersState(layState) : restoreLayersState(layState);
    updateScreen();
    namedItems = []; // Clear for collect new items
    if (!isOverLimit) outputResults(); // Real-time search
  }

  // Change the zoom
  isZoom.onClick = function() {
    zoomRatioInp.onChange();
  }

  zoomRatioInp.onChange = function() {
    if (strToAbsNum(this.text, CFG.minZoom) > 1) this.text = 1;
    if (strToAbsNum(this.text, CFG.minZoom) < CFG.minZoom) this.text = CFG.minZoom;

    for (var i = 0, len = listBox.children.length; i < len; i++) {
      if (listBox.children[i].selected) {
        zoom(this.text, isZoom.value);
        updateScreen();
        break;
      }
    }
  }

  closeBtn.onClick = function() {
    if (isLocked || isHidden) {
      app.selection = null;
      updateScreen();
    }
    restoreLayersState(layState);
    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  win.onClose = function () {
    saveSettings(SETTINGS);
  }

  /**
   * Output the search results to a listbox after performing a search operation
   */
  function outputResults() {
    // Indicate a search is in progress
    if (searchBtn) {
      searchBtn.text = LABEL.wait;
      win.update();
    }

    // Clear the list before adding new search results
    listBox.removeAll();

    if (!namedItems.length) {
      var scope = scopeDdl.selection.text;
      if (/selection/i.test(scope)) {
        namedItems = [].concat(selNamedItems);
      } else if (/document/i.test(scope)) {
        var docItems = [];
        getLayersItems(doc.layers, docItems);
        namedItems = getNamedItems(docItems);
      } else if (/layer/i.test(scope)) {
        namedItems = [].concat(layNamedItems);
      } else if (/artboard/i.test(scope)) {
        namedItems = [].concat(abNamedItems);
      }
    }

    if (isByName.value) {
      resItems = getByName(query.text, namedItems, LABEL);
    } else if (isByType.value) {
      resItems = getByType(query.text, namedItems, TYPE_MAP);
    } else {
      resItems = getByContents(query.text, namedItems);
    }

    // Create listbox rows from the search results
    var newListItem;
    var addItemToList = function (itemName) {
      return listBox.add('item', itemName);
    };

    if (!resItems.length) {
      newListItem = addItemToList(LABEL.empty);
    } else {
      for (var i = 0, len = resItems.length; i < len; i++) {
        var item = resItems[i];
        var itemName;

        // Determine the name to display for each item
        if (isByText.value && !isEmpty(query.text)) {
          itemName = hasWhiteSpace(query.text) ? query.text : getFirstWord(item, query.text);
        } else {
          if (item.typename === 'CompoundPathItem' && isEmpty(item.name)) {
            itemName = LABEL.compound;
          } else if (item.typename === 'GraphItem' && isEmpty(item.name)) {
            itemName = LABEL.graph;
          } else if (item.typename === 'GroupItem' && isEmpty(item.name)) {
            itemName = LABEL.group;
          } else if (item.typename === 'MeshItem' && isEmpty(item.name)) {
            itemName = LABEL.mesh;
          } else if (item.typename === 'NonNativeItem' && isEmpty(item.name)) {
            itemName = LABEL.nonative;
          } else if (item.typename === 'PlacedItem' && isEmpty(item.name)) {
            itemName = LABEL.link;
          } else if (item.typename === 'RasterItem' && isEmpty(item.name)) {
            itemName = LABEL.image;
          } else if (isLegacyText(item) && isEmpty(item.name)) {
            itemName = LABEL.legacy;
          } else {
            itemName = getName(item);
          }
        }

        // Add the item to the list
        newListItem = addItemToList(itemName); // Name
        newListItem.subItems[0].text = getTypeName(item, TYPE_MAP); // Type
        newListItem.subItems[1].text = item.layer.name; // Layer

        // Add locked and hidden indicators
        var parentState = [false, false];
        checkParentState(item, layState, parentState);
        newListItem.subItems[2].text = (item.hidden || parentState[0]) ? '\u2666' : ''; // Hidden or not
        newListItem.subItems[3].text = (item.locked || parentState[1]) ? '\u2666' : ''; // Locked or not
      }
    }

    // Restore the search button text
    if (searchBtn) {
      searchBtn.text = LABEL.search;
      win.update();
    }
  }

  /**
   * Go to document objects based on the selected items in the listBox
   */
  function selectResults() {
    if (!resItems.length) return;

    var tmpItems = [],  // Array of the found items
        tmpState = [], //  Initial state of the found items
        parentGrp; // Topmost parent Group of item

    isLocked = false;
    isHidden = false;
    app.selection = null;

    // Collect selected rows indexes
    for (var i = 0, len = listBox.children.length; i < len; i++) {
      var parentState = [false, false];
      // Reset array for multiple select
      tmpItems = [];

      if (!listBox.children[i].selected) continue;

      parentGrp = getTopGroup(resItems[i]);
      checkParentState(resItems[i], layState, parentState);

      if (parentState[0]) isHidden = true;
      if (parentState[1]) isLocked = true;

      if (resItems[i].typename === 'GroupItem') {
        tmpItems.push(resItems[i]);
        getItems(resItems[i].pageItems, tmpItems);
      } else {
        if (parentGrp.typename === 'GroupItem' && parentGrp.pageItems.length == 1) {
          tmpItems.push(parentGrp);
          getItems(parentGrp.pageItems, tmpItems);
        } else {
          tmpItems.push(resItems[i]);
        }
      }

      saveItemsState(tmpItems, tmpState);
      resItems[i].selected = true;
    }
    
    var ratio = strToAbsNum(zoomRatioInp.text, CFG.minZoom);
    zoom(ratio, isZoom.value);

    restoreItemsState(tmpState);
    updateScreen();
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
    data.query = query.text;
    data.mode = isByName.value ? 1 : (isByType.value ? 2 : 3);
    data.inAllLayers = isInLocked.value;
    data.isZoom = isZoom.value;
    data.zoomRatio = zoomRatioInp.text;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
   */
  function loadSettings(prefs, stateArr) {
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
        if (data.query) query.text = data.query;
        modeGroup.children[data.mode].value = true;
        isInLocked.value = data.inAllLayers == 'true';
        if (isInLocked.value) {
          resetLayersState(stateArr);
          updateScreen();
        }
        isZoom.value = data.isZoom  == 'true';
        zoomRatioInp.text = data.zoomRatio;
      }
    } catch (err) {
      return;
    }
  }

  win.center;
  win.show();
}

/**
 * Extract and join type names from a type map based on the current locale
 * @param {Object} typeMap - A mapping object containing translations of item types
 * @returns {string} A newline-separated string of type names in the current locale
 */
function getTypeNamesList(typeMap) {
  var results = [];

  for (var typeName in typeMap) {
    if (typeMap.hasOwnProperty(typeName)) {
      results.push(typeMap[typeName]);
    }
  }

  results.sort(function (a, b) {
    return a.localeCompare(b);
  });

  return results.join('\n');
}

/**
 * Get items from a collection and adds them to an array
 * @param {(Object|Array)} coll - The collection of items to iterate over
 * @param {Array} results - The array to which items will be added
 */
function getItems(coll, results) {
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    try {
      switch (item.typename) {
        case 'GroupItem':
          results.push(item);
          getItems(item.pageItems, results);
          break;
        default:
          results.push(item);
          break;
      }
    } catch (err) {}
  }
}

/**
 * Save the state of layers in a collection
 * @param {(Object|Array)} coll - The collection of layers to save the state of
 * @param {Array} results - The array to store the state information
 */
function saveLayersState(coll, results) {
  for (var i = 0, len = coll.length; i < len; i++) {
    results.push({
      'layer': coll[i],
      'visible': coll[i].visible,
      'locked': coll[i].locked,
    });
    if (coll[i].layers.length) {
      saveLayersState(coll[i].layers, results);
    }
  }
}

/**
 * Restore the locked and visible state of layers in a collection
 * @param {(Object|Array)} coll - A collection of objects with layer properties to restore
 */
function restoreLayersState(coll) {
  for (var i = 0, len = coll.length; i < len; i++) {
    coll[i].layer.locked = coll[i].locked;
    coll[i].layer.visible = coll[i].visible;
  }
}

/**
 * Reset the locked and visible state of layers in a collection
 * @param {(Object|Array)} coll - A collection of objects with layer properties to reset
 */
function resetLayersState(coll) {
  for (var i = 0, len = coll.length; i < len; i++) {
    coll[i].layer.locked = false;
    coll[i].layer.visible = true;
  }
}

/**
 * Filter and return items from a collection that have a name
 * @param {Array} coll - The collection of items to filter
 * @returns {Array} The filtered collection of items
 */
function getNamedItems(coll) {
  try {
    var results = [];

    for (var i = 0, len = coll.length; i < len; ++i) {
      var item = coll[i];
      if (!isEmpty(getName(item)) || isNotEmptyText(item) || isLegacyText(item) ||
          /compound|graph|group|placed|mesh|native|raster/i.test(item.typename)) {
        results.push(item);
      }
    }

    return results;
  } catch (err) {
    return [];
  }
}

/**
 * Get the name of an item, considering its type
 * @param {Object} item - The item for which to get the name
 * @returns {string} The name of the item
 */
function getName(item) {
  var str = '';
  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    str = item.contents;
    if (str.length > 20) str = str.substr(0,20) + '...';
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    str = item.symbol.name;
  } else {
    str = item.name;
  }
  return str;
}

/**
 * Check if a string is empty
 * @param {string} str - Input string
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return !str || !str.length;
}

/**
 * Check if an item is a non-empty text frame
 * @param {Object} item - The item to check
 * @returns {boolean} True if the item is a non-empty text frame, false otherwise
 */
function isNotEmptyText(item) {
  if (isLegacyText(item)) {
    return false; // Legacy text frames are not supported
  }
  return item.typename === 'TextFrame' && item.contents.length > 0;
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
 * Get items from visible and unlocked layers in a collection
 * @param {(Object|Array)} coll - The collection of layers to process
 * @param {Array} results - The array to store the retrieved items
 */
function getLayersItems(coll, results) {
  for (var i = 0, len = coll.length; i < len; i++) {
    var currLayer = coll[i];
    if (currLayer.visible && !currLayer.locked) {
      if (currLayer.layers.length > 0) {
        getItems(currLayer.pageItems, results);
        getLayersItems(currLayer.layers, results);
      } else {
        getItems(currLayer.pageItems, results);
      }
    }
  }
}

/**
 * Find items by name in a collection based on matching strings
 * @param {string} str - The search string
 * @param {Array} coll - The collection of items to search within
 * @param {Object} defNames - The default system names
 * @returns {Array} The array of items that match the search criteria
 */
function getByName(str, coll, defNames) {
  var results = [];
  var regex = new RegExp(escapeRegExp(str), 'ig');

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    var itemName = getName(item);

    if ((!isEmpty(itemName) && regex.test(itemName)) ||
        (item.typename === 'CompoundPathItem' && isEmpty(itemName) && regex.test(defNames.compound)) ||
        (item.typename === 'GraphItem' && isEmpty(itemName) && regex.test(defNames.graph)) ||
        (item.typename === 'GroupItem' && isEmpty(itemName) && regex.test(defNames.group)) ||
        (item.typename === 'MeshItem' && isEmpty(itemName) && regex.test(defNames.mesh)) ||
        (item.typename === 'NonNativeItem' && isEmpty(itemName) && regex.test(defNames.nonative)) ||
        (item.typename === 'PlacedItem' && isEmpty(itemName) && regex.test(defNames.link)) ||
        (item.typename === 'RasterItem' && isEmpty(itemName) && regex.test(defNames.image)) ||
        (isLegacyText(item) && isEmpty(itemName) && regex.test(defNames.legacy))) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Find items by type in a collection based on matching strings
 * @param {string} str - The search string
 * @param {Array} coll - The collection of items to search within
 * @param {Object} typeMap - A mapping object containing translations of item types
 * @returns {Array} The array of items that match the search criteria
 */
function getByType(str, coll, typeMap) {
  var results = [];
  var regex = new RegExp(escapeRegExp(str), 'ig');

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    var itemType = item.typename;
    if (typeMap[itemType] && regex.test(typeMap[itemType])) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Find items by text frame contents in a collection based on matching strings
 * @param {string} str - The search string
 * @param {Array} coll - The collection of items to search within
 * @returns {Array} The array of items that match the search criteria
 */
function getByContents(str, coll) {
  var results = [];
  var regex = new RegExp(escapeRegExp(str), 'ig');

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (isNotEmptyText(item) && regex.test(item.contents)) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Escape regular expression special characters in a string
 * @param {string} str - The string to escape
 * @return {string} The escaped string
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a string contains any whitespace characters
 * @param {string} str - The string to check
 * @returns {boolean} True if the string contains whitespace, false otherwise
 */
function hasWhiteSpace(str) {
  return /\s/g.test(str);
}

/**
 * Find the first occurrence of a word in a string
 * @param {Object} item - The object containing the string to search
 * @param {string} str - The word to search for (case insensitive)
 * @returns {string} The first occurrence of the word with dots
 */
function getFirstWord(item, str) {
  var enterCode = String.fromCharCode(3),
      regSplit = new RegExp('\\s|' + enterCode, 'g'),
      regex = new RegExp(str, 'i'), // Case insensitive search
      words = item.contents.split(regSplit);

  for (var i = 0, len = words.length; i < len; i++) {
    if (regex.test(words[i])) {
      var word = words[i];
      if (i > 0) word = '...' + word;
      if (i !== len - 1) word += '...';
      return word;
    }
  }

  return '';
}

/**
 * Get the human-readable type name of a item based on the current locale
 * @param {Object} item - The item whose type name is to be retrieved
 * @param {Object} typeMap - A mapping object containing translations of item types
 * @returns {string} A human-readable type name of the item
 */
function getTypeName(item, typeMap) {
  var itemType = item.typename;
  if (isLegacyText(item)) itemType = 'LegacyTextItem';

  var suffix = '';

  if (itemType === 'PlacedItem') {
    try {
      var isExistsLink = item.file;
    } catch (err) {
      suffix = ' \u2205'; // If link is broken
    }
  }

  if (typeMap[itemType]) {
    return typeMap[itemType] + suffix;
  } else {
    return itemType;
  }
}

/**
 * Check the parent state of an item
 * @param {Object} item - The item to check
 * @param {Array} coll - The layers array to check against
 * @param {Array} results - The array to update based on parent state
 */
function checkParentState(item, coll, results) {
  var parent = item.parent;
  try {
    switch (parent.typename) {
      case 'GroupItem':
        if (parent.hidden) results[0] = true;
        if (parent.locked) results[1] = true;
        checkParentState(parent, coll, results);
        break;
      case 'Layer':
        for (var i = 0, len = coll.length; i < len; i++) {
          if (parent === coll[i].layer) {
            if (!coll[i].visible) results[0] = true;
            if (coll[i].locked) results[1] = true;
            break;
          }
        }
        checkParentState(parent, coll, results);
        break;
      default:
        break;
    }
  } catch (err) {}
}

/**
 * Find the top group of an item
 * @param {Object} item - The item to find the top group for
 * @returns {Object} The top group item
 */
function getTopGroup(item) {
  return item.parent.typename !== 'Layer' ? getTopGroup(item.parent) : item;
}

/**
 * Saves the state of items in a collection
 * @param {(Object|Array)} coll - The collection of items
 * @param {Array} results - The array to store the state of items
 */
function saveItemsState(coll, results) {
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    results.push({
      'item': item,
      'visible': item.hidden,
      'locked': item.locked
    });
    item.locked = false;
    item.hidden = false;
  }
}

/**
 * Restore the state of items from a saved state
 * @param {Array} stateArr - The array containing the saved state of items
 */
function restoreItemsState(stateArr) {
  for (var i = 0, len = stateArr.length; i < len; i++) {
    var data = stateArr[i];
    data.item.hidden = data.visible;
    data.item.locked = data.locked;
  }
}

/**
 * Zooms the active document based on the specified ratio and zoom flag
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {number} ratio - The zoom ratio to apply
 * @param {boolean} isZoom - Flag indicating whether to zoom in or not
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
  var bnds = calcBounds(app.selection),
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
 * Calculate the bounding box for a collection of objects
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {Array} coll - An array of objects
 * @returns {Array} - An array representing the bounding box [ul_x, ul_y, lr_x, lr_y]
 */
function calcBounds(coll) {
  // If object is a (collection of) object(s) not a text field
  if (coll instanceof Array) {
    // Initialize vars
    var initBounds = coll[0].visibleBounds,
        ul_x = initBounds[0];
        ul_y = initBounds[1];
        lr_x = initBounds[2];
        lr_y = initBounds[3];

    // Check rest of group if any
    for (var i = 1, len = coll.length; i < len; i++) {
      var groupBounds = coll[i].visibleBounds;
      if (groupBounds[0] < ul_x) ul_x = groupBounds[0];
      if (groupBounds[1] > ul_y) ul_y = groupBounds[1];
      if (groupBounds[2] > lr_x) lr_x = groupBounds[2];
      if (groupBounds[3] < lr_y) lr_y = groupBounds[3];
    }
  }

  return [ul_x, ul_y, lr_x, lr_y];
}

/**
 * Force the screen to update by toggling artboard edges
 * @returns {void}
 */
function updateScreen() {
  if (parseFloat(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  } else {
    app.redraw();
  }
}

/**
 * Convert a string to an absolute number
 * @param {string} str - The string to convert
 * @param {number} [def=1] - The default value to return if conversion fails
 * @returns {number} The converted number or the default value if conversion is not possible
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