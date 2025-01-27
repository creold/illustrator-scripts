/*
  ShowObjectNames.jsx for Adobe Illustrator
  Description: Shows names of vector objects, linked or embedded raster images
  Date: June, 2023
  Modicitaion Date: January, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
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
    version: 'v0.2'
  };
  
  var CFG = {
    fontSize: 14, // Default font size, pt
    name: 'Object_Names',
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

  var refPointArr = new Array(9); // Reference points array
  var refPointDef = [false, false, false, false, true, false, false, false, false];   // Default values for reference points
  var refHints = ['Top Left', 'Top', 'Top Right', 'Left', 'Center', 'Right', 'Bottom Left', 'Bottom', 'Bottom Right']; // Reference point names

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.opacity = CFG.uiOpacity;

  // WRAPPER 1
  var wrapper1 = win.add('group');
      wrapper1.orientation = 'row';
      wrapper1.alignChildren = ['left', 'top'];

  // POSITION
  var posPnl = wrapper1.add('panel', undefined, 'Position');
      posPnl.orientation = 'row';
      posPnl.bounds = [0, 0, 85, 93];

  // Create reference point matrix
  var idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(posPnl, j, i, refPointDef[idx], refHints[idx]);
      idx++;
    }
  }

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    refPointArr[4].active = true;
  }

  // OFFSET
  var offsetPnl = wrapper1.add('panel', undefined, 'Offset Distance');
      offsetPnl.alignChildren = ['left', 'top'];
      offsetPnl.spacing = 15;
      offsetPnl.margins = CFG.uiMargins;
      offsetPnl.preferredSize.width = 155;

  // OFFSET X
  var xGrp = offsetPnl.add('group');

  xGrp.add('statictext', undefined, 'X:');
  var xInp = xGrp.add('edittext', undefined, 0);
      xInp.preferredSize.width = 70;

  xGrp.add('statictext', undefined, CFG.units);

  // OFFSET Y
  var yGrp = offsetPnl.add('group');

  yGrp.add('statictext', undefined, 'Y:');
  var yInp = yGrp.add('edittext', undefined, 0);
      yInp.preferredSize.width = 70;

  yGrp.add('statictext', undefined, CFG.units);

  // LAYER
  var layPnl = win.add('panel', undefined, 'Move Names To');
      layPnl.orientation = 'row';
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

  shiftInputNumValue(xInp);
  shiftInputNumValue(yInp);

  if (isPreview.value) preview();

  for (var i = 0; i < refPointArr.length; i++) {
    refPointArr[i].onClick = preview;
  }

  xInp.onChange = yInp.onChange = preview;
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
    var labelParams = {
      position: getReferencePoint(refHints, refPointArr),
      offsetX: convertUnits( strToNum(xInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      offsetY: convertUnits( strToNum(yInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      isExtension: isAddExtension.value,
      isRename: isRenameImage.value,
      fontSize: CFG.fontSize
    };

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
    for (var i = 0, len = posPnl.children.length; i < len; i++) {
      if (posPnl.children[i].value) {
        pref.position = i;
        break;
      }
      pref.position = 4;
    }
    pref.offsetX = xInp.text;
    pref.offsetY = yInp.text;
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
        posPnl.children[pref.position].value = true;
        xInp.text = pref.offsetX;
        yInp.text = pref.offsetY;
        layPnl.children[pref.container].value = true;
        isAddExtension.value = pref.extension === 'true';
        isRenameImage.value = pref.rename === 'true';
      }
    } catch (err) {
      return;
    }
  }

  /**
   * Get the reference point name based on the index of the active radio button
   * @param {Array} hints - Array of reference point names
   * @param {Array} arr - Array of radio buttons representing reference points
   * @returns {string} - The name of the reference point
   */
  function getReferencePoint(hints, arr) {
    var str = hints[4];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].value) {
        str = hints[i];
        break;
      }
    }
    return str.replace(/\s+/g, '').toUpperCase();
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
  var key = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
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
 * @returns {Array} - A new array containing the elements
 */
function get(coll) {
  var arr = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    arr.push(coll[i]);
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
 * Generate a radio button and adds it to a specified UI window, panel, or group
 * @param {object} place - The UI window, panel, or group to which the radio button will be added
 * @param {number} x - The column position of the radio button
 * @param {number} y - The row position of the radio button
 * @param {boolean} val - The initial state of the radio button
 * @param {string} info - The tooltip information for the radio button
 * @returns {object} - The generated radio button object
 */
function addRadio(place, x, y, val, info) {
  var rb = place.add('radiobutton', undefined, x);

  // Calculate position and size based on grid layout
  var step = 22;
  var x0 = 10;
  var y0 = 15;
  var d = 14; // Padding
  x = x0 + step * x;
  y = y0 + step * y;

  // Set position and size of the radio button
  rb.bounds = [x, y, x + d, y + d]; 
  
  // Set initial value and tooltip information
  rb.value = val;
  rb.helpTip = info;

  return rb;
}

/**
 * Add a name label to the specified item based on the provided parameters
 * @param {Object} item - The Illustrator item to label
 * @param {Object} itemData - The data of the item, including dimensions and bounds
 * @param {Object} labelParams - Configuration parameters for the label
 * @param {string} labelParams.position - Position of the label relative to the item (e.g., 'TOPLEFT', 'CENTER')
 * @param {number} labelParams.offsetX - Horizontal offset in pixels for the label position
 * @param {number} labelParams.offsetY - Vertical offset in pixels for the label position
 * @param {boolean} labelParams.isExtension - Whether to include file extension in the label name
 * @param {boolean} labelParams.isRename - Whether to rename the item with the generated label
 * @param {number} labelParams.fontSize - Font size for the label text
 * @returns {Object} - The created text frame containing the label
 * 
 */
function addNameLabel(item, itemData, labelParams) {
  var f;
  try {
    f = item.file;
  } catch (err) {
    f = item;
  }

  var nameStr = '';
  if (/placed|raster/i.test(item.typename)) {
    nameStr = labelParams.isExtension ? f.name : f.name.replace(/\.[^\.]+$/, '');
    if (nameStr.length && labelParams.isRename) item.name = decodeURI(nameStr);
    if (!nameStr.length) nameStr = 'Missing Image';
  } else {
    nameStr = itemData.name;
  }

  var tf = item.layer.textFrames.add();
  tf.contents = decodeURI(nameStr);
  tf.textRange.characterAttributes.size = labelParams.fontSize;

  var diffW = itemData.width - tf.width + labelParams.offsetX;
  var diffH = itemData.height - tf.height + labelParams.offsetY;
  var halfDiffW = diffW / 2 + labelParams.offsetX;
  var halfDiffH = diffH / 2;

  switch (labelParams.position) {
    case 'TOPLEFT':
      tf.textRange.paragraphAttributes.justification = Justification.LEFT;
      tf.top = itemData.bounds[1] + tf.height + labelParams.offsetY;
      tf.left = itemData.bounds[0] + labelParams.offsetX;
      break;
    case 'TOP':
      tf.textRange.paragraphAttributes.justification = Justification.CENTER;
      tf.top = itemData.bounds[1] + tf.height + labelParams.offsetY;
      tf.left = itemData.bounds[0] + halfDiffW;
      break;
    case 'TOPRIGHT':
      tf.textRange.paragraphAttributes.justification = Justification.RIGHT;
      tf.top = itemData.bounds[1] + tf.height + labelParams.offsetY;
      tf.left = itemData.bounds[0] + diffW;
      break;
    case 'LEFT':
      tf.textRange.paragraphAttributes.justification = Justification.RIGHT;
      tf.top = itemData.bounds[1] - halfDiffH + labelParams.offsetY;
      tf.left = itemData.bounds[0] - tf.width - labelParams.offsetX;
      break;
    case 'CENTER':
      tf.textRange.paragraphAttributes.justification = Justification.CENTER;
      tf.top = itemData.bounds[1] - halfDiffH + labelParams.offsetY;
      tf.left = itemData.bounds[0] + halfDiffW;
      break;
    case 'RIGHT':
      tf.textRange.paragraphAttributes.justification = Justification.LEFT;
      tf.top = itemData.bounds[1] - halfDiffH + labelParams.offsetY;
      tf.left = itemData.bounds[0] + itemData.width + labelParams.offsetX;
      break;
    case 'BOTTOMLEFT':
      tf.textRange.paragraphAttributes.justification = Justification.LEFT;
      tf.top = itemData.bounds[1] - itemData.height - labelParams.offsetY;
      tf.left = itemData.bounds[0] + labelParams.offsetX;
      break;
    case 'BOTTOM':
      tf.textRange.paragraphAttributes.justification = Justification.CENTER;
      tf.top = itemData.bounds[1] - itemData.height - labelParams.offsetY;
      tf.left = itemData.bounds[0] + halfDiffW;
      break;
    case 'BOTTOMRIGHT':
      tf.textRange.paragraphAttributes.justification = Justification.RIGHT;
      tf.top = itemData.bounds[1] - itemData.height - labelParams.offsetY;
      tf.left = itemData.bounds[0] + diffW;
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