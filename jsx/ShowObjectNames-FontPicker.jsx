/*
  ShowObjectNames-FontPicker.jsx for Adobe Illustrator
  Description: Shows names of vector objects, linked or embedded raster images
  Date: June, 2023
  Modicitaion Date: March, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3.1 Minor fixes
  0.3 Added fonts, more positions, text justification, options to rotate text
  0.2 Added UI with options, support any objects
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

function main() {
  var SCRIPT = {
    name: 'Show Object Names',
    version: 'v0.3.1'
  };
  
  var CFG = {
    name: 'Object_Names',
    fontWidth: 200, // Font list width, px
    fonts: get(app.textFonts, 'name'),
    fontUnits: getTypeUnits(),
    units: getUnits(),
    isMac: /mac/i.test($.os),
    aiVers: parseFloat(app.version),
    is2020: parseInt(app.version) == 24, // Current AI is CC 2020
    uiMargins: [10, 15, 10, 7],
    uiOpacity: .97 // UI window opacity
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('selection:1')) return;

  var doc = app.activeDocument;
  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  var items = get(app.selection);
  var itemsData = getItemsData(items);
  var isUndo = false;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.spacing = 10;
      win.opacity = CFG.uiOpacity;

  // POSITION
  var posPnl = win.add('panel', undefined, 'Position');
      posPnl.alignChildren = ['fill', 'top'];
      posPnl.spacing = 7;
      posPnl.margins = CFG.uiMargins;

  var posGrp = posPnl.add('group');
  var isOutPos = posGrp.add('radiobutton', undefined, 'Around Object');
      isOutPos.value = true;
  var isInPos = posGrp.add('radiobutton', undefined, 'Inside Object');

  // List of reference points around the object
  var outPosList = [
    'Left Top',
    'Left Center',
    'Left Bottom',
    '-',
    'Top Left',
    'Top Center',
    'Top Right',
    '-',
    'Right Top',
    'Right Center',
    'Right Bottom',
    '-',
    'Bottom Left',
    'Bottom Center',
    'Bottom Right'
  ];

  // List of reference points inside the object
  var inPosList = [
    'Left Top',
    'Left Center',
    'Left Bottom',
    '-',
    'Center Top',
    'Center Center',
    'Center Bottom',
    '-',
    'Right Top',
    'Right Center',
    'Right Bottom',
  ];

  var posDdl = posPnl.add('dropdownlist', undefined, outPosList);
      posDdl.selection = 0;

  // OFFSET
  var offsetPnl = win.add('panel', undefined, 'Offset Distance');
      offsetPnl.orientation = 'row';
      offsetPnl.alignChildren = ['fill', 'center'];
      offsetPnl.spacing = 15;
      offsetPnl.margins = CFG.uiMargins;

  // OFFSET X
  var xGrp = offsetPnl.add('group');

  xGrp.add('statictext', undefined, 'X:');
  var xInp = xGrp.add('edittext', undefined, 0);
      xInp.preferredSize.width = 55;

  xGrp.add('statictext', undefined, CFG.units);

  // OFFSET Y
  var yGrp = offsetPnl.add('group');

  yGrp.add('statictext', undefined, 'Y:');
  var yInp = yGrp.add('edittext', undefined, 0);
      yInp.preferredSize.width = 55;

  yGrp.add('statictext', undefined, CFG.units);

  // ANGLE
  var angPnl = win.add('panel', undefined, 'Rotate');
      angPnl.orientation = 'row';
      angPnl.alignChildren = ['fill', 'center'];
      angPnl.spacing = 7;
      angPnl.margins = CFG.uiMargins;

  angPnl.add('statictext', undefined, 'Angle:');
  var angleDdl = angPnl.add('dropdownlist', undefined, ['0\u00B0', '90\u00B0 Clockwise', '90\u00B0 Counter Clockwise', '180\u00B0']);
      angleDdl.selection = 0;

  // FONT
  var fontPnl = win.add('panel', undefined, 'Font');
      fontPnl.orientation = 'row';
      fontPnl.alignChildren = ['fill', 'top'];
      fontPnl.margins = CFG.uiMargins;

  var fontDdl = fontPnl.add('dropdownlist', undefined, CFG.fonts);
      fontDdl.preferredSize.width = 100;
      fontDdl.itemSize.width = CFG.fontWidth;
      fontDdl.selection = 0;
      fontDdl.active = true;

  var fontGrp = fontPnl.add('group');

  fontGrp.add('statictext', undefined, 'Size:');
  var fontInp = fontGrp.add('edittext', undefined, 14);
      fontInp.preferredSize.width = 40;

  fontGrp.add('statictext', undefined, CFG.fontUnits);

  // WRAPPER 2
  var wrapper2 = win.add('group');
      wrapper2.orientation = 'row';
      wrapper2.alignChildren = ['fill', 'top'];

  // JUSTIFICATION
  var alignPnl = wrapper2.add('panel', undefined, 'Justification');
      alignPnl.alignChildren = ['fill', 'top'];
      alignPnl.spacing = 7;
      alignPnl.margins = CFG.uiMargins;

  var isAlignL = alignPnl.add('radiobutton', undefined, 'Left');
  var isAlignC = alignPnl.add('radiobutton', undefined, 'Center');
      isAlignC.value = true;
  var isAlignR = alignPnl.add('radiobutton', undefined, 'Right');

  // LAYER
  var layPnl = wrapper2.add('panel', undefined, 'Move Names To');
      layPnl.alignChildren = ['fill', 'top'];
      layPnl.spacing = 7;
      layPnl.margins = CFG.uiMargins;

  var isCurrLay = layPnl.add('radiobutton', undefined, 'No');
      isCurrLay.value = true;
  var isNewGrp = layPnl.add('radiobutton', undefined, 'Object Group');
  var isNewLay = layPnl.add('radiobutton', undefined, 'New Layer');

  // IMAGE OPTIONS
  var imgPnl = win.add('panel', undefined, 'Raster Image Options');
      imgPnl.orientation = 'row';
      imgPnl.alignChildren = ['fill', 'top'];
      imgPnl.margins = CFG.uiMargins;

  var isAddExtension = imgPnl.add("checkbox", undefined, 'Add Extension');
  var isRenameImage = imgPnl.add("checkbox", undefined, 'Rename in Layer');

  var btns = win.add('group');
      btns.alignChildren = ['left', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = false;

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = "Preview disabled for CC 2020\ndue to critical bug";
  }

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

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify  = 'center';

  // EVENTS
  loadSettings(SETTINGS);

  // Selecting font in dropdown by name using the keyboard
  // Book: Beginning ScriptUI, author: Peter Kahrel, June 2019
  var fontQuery = '';
  fontDdl.onActivate = fontDdl.onDeactivate = function () { 
    fontQuery = ''; // Clear previous query
  }

  fontDdl.addEventListener('keydown', function (k) {
    if (k.keyName == 'Backspace') {
      fontQuery = fontQuery.replace(/.$/, '');
    } else {
      if (k.keyName.length > 0) {
        fontQuery += k.keyName.toLowerCase();
      }
      var i = 0;
      while (i < CFG.fonts.length - 1 && CFG.fonts[i].toLowerCase().indexOf(fontQuery) != 0) {
        ++i;
      }
      if (CFG.fonts[i].toLowerCase().indexOf(fontQuery) == 0) {
        fontDdl.selection = i;
      }
    }
  });

  fontInp.onChange = preview;
  xInp.onChange = yInp.onChange = preview;

  shiftInputNumValue(fontInp);
  shiftInputNumValue(xInp);
  shiftInputNumValue(yInp);

  if (isPreview.value) preview();

  isOutPos.onClick = function () {
    updateDropdown(posDdl, outPosList);
  };

  isInPos.onClick = function () {
    updateDropdown(posDdl, inPosList);
  };

  fontDdl.onChange = posDdl.onChange = angleDdl.onChange = function () {
    this.active = true;

    // Adobe Illustrator crash protection
    if (this.children.length > 1) {
      // Protect mouse selection of empty separator in dropdown
      if (this.selection === null) {
        this.selection = 0;
      }
      preview();
    }
  }

  isAlignL.onClick = isAlignC.onClick = isAlignR.onClick = preview;
  isAddExtension.onClick = preview;
  isPreview.onClick = preview;

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
  }

  /**
   * Update the dropdown list with given items
   * @param {Object} dropdown - The dropdown UI element to update
   * @param {Array} list - The list of items to populate the dropdown with
   */
  function updateDropdown(dropdown, list) {
    dropdown.removeAll();
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] === '-') {
        dropdown.add('separator', undefined, i);
      } else {
        dropdown.add('item', list[i].toString());
      }
    }
    dropdown.selection = 0;
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        process();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Process selected items to create name labels based on specified parameters
   */
  function process() {
    var angleMap = { 0: 0, 1: -90, 2: 90, 3: 180 };

    var labelParams = {
      position: (posDdl.selection === null || posDdl.selection.text === '-') ? 'TOP LEFT' : posDdl.selection.text.toUpperCase(),
      isOutside: isOutPos.value,
      offsetX: convertUnits( strToNum(xInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      offsetY: convertUnits( strToNum(yInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      angle: angleMap[angleDdl.selection.index] || 0,
      justification: isAlignL.value ? 'LEFT' : (isAlignR.value ? 'RIGHT' : 'CENTER'),
      isExtension: isAddExtension.value,
      isRename: isRenameImage.value,
      fontSize: convertUnits( strToNum(fontInp.text, 14), CFG.fontUnits, 'px' ) / CFG.sf,
      fontFamily: app.textFonts.getByName(fontDdl.selection.text)
    };

    if (labelParams.fontSize <= 0) {
      labelParams.fontSize = 14;
      fontInp.text = 14;
    }

    var labels = []; // Array to store created text frames

    // Process each selected item
    for (var i = 0, len = items.length; i < len; i++) {
      var itemLabel = addNameLabel(items[i], itemsData[i], labelParams);
      labels.push(itemLabel);
    }

    return labels;
  }

  function okClick() {
    if (isPreview.value && isUndo) {
      app.undo();
    }
    isUndo = false;

    saveSettings(SETTINGS);

    var labels = process();

    if (isNewLay.value) { // Move text frames into the layer
      var lay; // Get or create the layer
      try {
        lay = doc.layers.getByName(CFG.name);
        lay.visible = true;
        lay.locked = false;
      } catch (err) {
        lay = doc.layers.add();
        lay.name = CFG.name;
      }

      for (var i = 0, len = labels.length; i < len; i++) {
        labels[i].move(lay, ElementPlacement.PLACEATEND);
      }
    } else if (isNewGrp.value) { // Group text frames with objects
      for (var j = 0, len = labels.length; j < len; j++) {
        var group = labels[j].layer.groupItems.add();
        group.name = labels[j].contents;
        group.move(items[j], ElementPlacement.PLACEBEFORE);
        labels[j].move(group, ElementPlacement.PLACEATEND);
        items[j].move(group, ElementPlacement.PLACEATEND);
      }
    }

    // Update the selection with created text frames
    app.selection = labels;
    win.close();
  }

  /**
  * Handle keyboard input to shift numerical values
  * @param {Object} item - The input element to which the event listener will be attached
  * @returns {void}
  */
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = Number(this.text);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = num - step;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = num + step;
        kd.preventDefault();
        preview();
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

    var pref = {};
    pref.fontFamily = fontDdl.selection.index;
    pref.fontSize = fontInp.text;
    pref.offsetX = xInp.text;
    pref.offsetY = yInp.text;
    pref.direction = isOutPos.value ? 0 : 1;
    pref.pos = posDdl.selection.index;
    pref.angle = angleDdl.selection.index;
    pref.justification = isAlignL.value ? 0 : (isAlignC.value ? 1 : 2);
    pref.container = isCurrLay.value ? 0 : (isNewGrp.value ? 1 : 2);
    pref.extension = isAddExtension.value;
    pref.rename = isRenameImage.value;

    f.write( stringify(pref) );
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
      try { var pref = new Function('return (' + json + ')')(); }
      catch (err) { return; }
      f.close();

      if (typeof pref != 'undefined') {
        if (fontDdl && fontInp && pref.fontFamily) {
          fontDdl.selection = pref.fontFamily;
          fontInp.text = pref.fontSize ? pref.fontSize : 14;
        }
        xInp.text = pref.offsetX;
        yInp.text = pref.offsetY;
        posGrp.children[pref.direction].value = true;
        if (pref.direction == 1) updateDropdown(posDdl, inPosList);
        posDdl.selection = pref.pos;
        angleDdl.selection = pref.angle;
        alignPnl.children[pref.justification].value = true;
        layPnl.children[pref.container].value = true;
        isAddExtension.value = pref.extension === 'true';
        isRenameImage.value = pref.rename === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.center();
  win.show();
}

/**
 * Get active document ruler units
 * @returns {string} - Shortened units
 */
function getUnits() {
  if (!documents.length) return '';
  var key = app.activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  switch (key) {
    case 'Pixels': return 'px';
    case 'Points': return 'pt';
    case 'Picas': return 'pc';
    case 'Inches': return 'in';
    case 'Millimeters': return 'mm';
    case 'Centimeters': return 'cm';
    // Added in CC 2023 v27.1.1
    case 'Meters': return 'm';
    case 'Feet': return 'ft';
    case 'FeetInches': return 'ft';
    case 'Yards': return 'yd';
    // Parse new units in CC 2020-2023 if a document is saved
    case 'Unknown':
      var xmp = activeDocument.XMPString;
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'FeetInches') return 'ft';
        if (units == 'Yards') return 'yd';
        return 'px';
      }
      break;
    default: return 'px';
  }
}

/**
 * Get the type measurement units based on the application's preference
 * @returns {string} - The unit of measurement for text
 */
function getTypeUnits() {
  var code = app.preferences.getIntegerPreference('text/units');
  var units = 'pt';

  switch (code) {
    case 0: units = 'in'; break;
    case 1: units = 'mm'; break;
    case 2: units = 'pt'; break;
    case 6: units = 'px'; break;
  }

  return units;
}

/**
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} - The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} - Continue or abort script
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
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select atleast ' + rqdLen + ' object and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Convert a collection into a standard Array
 * @param {Object} coll - The collection to be converted
 * @param {string} prop - The property name to extract from each object (optional)
 * @returns {Array} - A new array with either the extracted properties or the original elements
 */
function get(coll, prop) {
  var arr = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    arr.push(prop && coll[i].hasOwnProperty(prop) ? coll[i][prop] : coll[i]);
  }

  return arr;
}

/**
 * Get data for a collection of items, including their bounds, dimensions, and names
 * @param {(Object|Array)} coll - The collection of items to process
 * @returns {Array} - An array of objects
 */
function getItemsData(coll) {
  var data = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var bnds = getVisibleBounds(coll[i], 'geometricBounds');
    var name = getName(coll[i]);
    if (!name.length) name = 'Unnamed Object';

    data.push({
      bounds: bnds,
      width: Math.abs(bnds[2] - bnds[0]),
      height: Math.abs(bnds[1] - bnds[3]),
      name: name
    });
  }

  return data;
}

/**
 * Get the actual "visible" bounds
 * https://github.com/joshbduncan/illustrator-scripts/blob/main/jsx/DrawVisibleBounds.jsx
 * @param {Object} obj - The target object
 * @param {string} type - The object bounds type
 * @returns {Array} - An array representing the actual bounds
 */
function getVisibleBounds(obj, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';
  var doc = app.activeDocument;
  var bnds, clippedItem, tmpItem, tmpLayer;
  var curItem;
  if (obj.typename === 'GroupItem') {
    if (obj.clipped) {
      // Check all sub objects to find the clipping path
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename === 'CompoundPathItem') {
          if (!curItem.pathItems.length) {
            // Catch compound path items with no pathItems
            // via William Dowling @ github.com/wdjsdev
            tmpLayer = doc.layers.add();
            tmpItem = curItem.duplicate(tmpLayer);
            app.executeMenuCommand('deselectall');
            tmpItem.selected = true;
            app.executeMenuCommand('noCompoundPath');
            tmpLayer.hasSelectedArtwork = true;
            app.executeMenuCommand('group');
            clippedItem = item[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        }
      }
      if (!clippedItem) clippedItem = obj.pageItems[0];
      bnds = clippedItem[type];
      if (tmpLayer) {
        tmpLayer.remove();
        tmpLayer = undefined;
      }
    } else {
      // If the object is not clipped
      var subObjBnds;
      var allBoundPoints = [[], [], [], []];
      // Get the bounds of every object in the group
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        subObjBnds = getVisibleBounds(curItem, type);
        allBoundPoints[0].push(subObjBnds[0]);
        allBoundPoints[1].push(subObjBnds[1]);
        allBoundPoints[2].push(subObjBnds[2]);
        allBoundPoints[3].push(subObjBnds[3]);
      }
      // Determine the groups bounds from it sub object bound points
      bnds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bnds = obj[type];
  }
  return bnds;
}

/**
 * Get the name of an item, considering its type
 * @param {Object} item - The item for which to get the name
 * @returns {string} - The name of the item
 */
function getName(item) {
  var str = '';
  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    str = item.contents;
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    str = item.symbol.name;
  } else {
    str = item.name;
  }
  return str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} - True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Add a name label to the specified item based on the provided parameters
 * @param {Object} item - The Illustrator item to label. Can be a placed, raster, or other object type
 * @param {Object} itemData - Contains item properties like name, width, height, and bounds
 * @param {Object} params - Labeling parameters including font size, justification, position, and offsets
 * @param {number} params.fonFamily - The font family for the label text
 * @param {number} params.fontSize - The font size for the label text
 * @param {string} params.justification - Text justification
 * @param {number} params.angle - The rotation angle for the label
 * @param {boolean} params.isExtension - Whether to include the file extension in the label
 * @param {boolean} params.isRename - Whether to rename the item to match the label
 * @param {boolean} params.isOutside - Whether to place the label outside the item's bounds
 * @param {number} params.offsetX - Horizontal offset for label positioning
 * @param {number} params.offsetY - Vertical offset for label positioning
 * @param {string} params.position - The label's position relative to the item
 * 
 * @returns {Object} - The created text frame containing the label
 */
function addNameLabel(item, itemData, params) {
  var f;
  try {
    f = item.file;
  } catch (err) {
    f = item;
  }

  var nameStr = '';
  if (/placed|raster/i.test(item.typename)) {
    nameStr = params.isExtension ? f.name : f.name.replace(/\.[^\.]+$/, '');
    if (nameStr.length && params.isRename) item.name = decodeURI(nameStr);
    if (!nameStr.length) nameStr = 'Missing Image';
  } else {
    nameStr = itemData.name;
  }

  var tf = item.layer.textFrames.add();
  tf.contents = decodeURI(nameStr);
  tf.textRange.characterAttributes.textFont = params.fontFamily;
  tf.textRange.characterAttributes.size = params.fontSize;
  tf.textRange.paragraphAttributes.justification = Justification[params.justification];
  tf.rotate(params.angle);

  var diffW = itemData.width - tf.width + params.offsetX;
  var diffH = itemData.height - tf.height + params.offsetY;
  var halfDiffW = diffW / 2 + params.offsetX;
  var halfDiffH = diffH / 2;

  var topBase = itemData.bounds[1] + (params.isOutside ? tf.height : -tf.height) + params.offsetY;
  var bottomBase = itemData.bounds[3] + tf.height + params.offsetY;
  var leftBase = itemData.bounds[0] + (params.isOutside ? -tf.width - params.offsetX : params.offsetX);
  var rightBase = itemData.bounds[2] + (params.isOutside ? params.offsetX : -tf.width - params.offsetX);
  var centerX = itemData.bounds[0] + halfDiffW;
  var centerY = itemData.bounds[1] - halfDiffH + params.offsetY;

  switch (params.position) {
    case 'LEFT TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = leftBase;
      break;
    case 'LEFT CENTER':
      tf.top = centerY;
      tf.left = leftBase;
      break;
    case 'LEFT BOTTOM':
      tf.top = bottomBase;
      tf.left = leftBase;
      break;
    case 'TOP LEFT':
      tf.top = topBase;
      tf.left = itemData.bounds[0] + params.offsetX;
      break;
    case 'TOP CENTER':
      tf.top = topBase;
      tf.left = centerX;
      break;
    case 'TOP RIGHT':
      tf.top = topBase;
      tf.left = itemData.bounds[2] - tf.width - params.offsetX;
      break;
    case 'RIGHT TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = rightBase;
      break;
    case 'RIGHT CENTER':
      tf.top = centerY;
      tf.left = rightBase;
      break;
    case 'RIGHT BOTTOM':
      tf.top = bottomBase;
      tf.left = rightBase;
      break;
    case 'BOTTOM LEFT':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = itemData.bounds[0] + params.offsetX;
      break;
    case 'BOTTOM CENTER':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = centerX;
      break;
    case 'BOTTOM RIGHT':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = itemData.bounds[2] - tf.width - params.offsetX;
      break;
    case 'CENTER TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = centerX;
      break;
    case 'CENTER CENTER':
      tf.top = centerY;
      tf.left = centerX;
      break;
    case 'CENTER BOTTOM':
      tf.top = bottomBase;
      tf.left = centerX;
      break;
    default:
      break;
  }

  tf.move(item, ElementPlacement.PLACEBEFORE);

  return tf;
}

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
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
 * @returns {string} - A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\\t")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

// Run script
try {
  main();
} catch (err) {}