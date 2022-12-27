/*
  DuplicateArtboardsLight.jsx for Adobe Illustrator
  Description: Script for copying the selected Artboard with his artwork
  Requirements: Adobe Illustrator CS6 and later
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Fixed: bounds checking of the Illustrator canvas; position of the first copy
  0.2.1 Fixed script didn't run if the layers were locked
  0.2.2 Performance optimization
  0.3 Fixed copying all objects into one layer
  0.4 Added more units (yards, meters, etc.) support if the document is saved
  0.4.1 Fixed input activation in Windows OS. Removed RU localization
  0.4.2 Added size correction in large canvas mode
  0.4.3 Added new units API for CC 2023 v27.1.1

  Buy Pro version: https://sergosokin.gumroad.com/l/dupartboards

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2023 (Mac), 2023 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

function main() {
  var SCRIPT = {
        name: 'Duplicate Atboards Light',
        version: 'v.0.4.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        units: getUnits(), // Active document units
        copies: 0, // Default amount of copies
        spacing: 20, // Default spacing between copies (doc units)
        minSpacing: 0, // The spacing can't be < 0
        tmpLyr: 'FOR_AB_COORD',
        suffix: ' ', // Default suffix for copies names
        limit: 2500, // The amount of objects, when the script can run slowly
        abs: 10, // When the number of copies >, full-screen mode is enabled
        cnvs: 16383, // Illustrator canvas max size, px
        lKey: '%isLocked',
        hKey: '%isHidden',
        uiField: [0, 0, 60, 30],
        uiTitle: [0, 0, 120, 30],
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later');
    return;
  }

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  var doc = activeDocument,
      maxCopies = ((CFG.aiVers >= 22) ? 1000 : 100) - doc.artboards.length, // Artboards limit
      curAbIdx = doc.artboards.getActiveArtboardIndex(),
      absArr = [],
      copies = spacing = 0;

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // Collect artboards names for dropdown menu
  for (var i = 0, aLen = doc.artboards.length; i < aLen; i++) {
    absArr.push((i + 1) + ': ' + doc.artboards[i].name);
  }

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // Main Window
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  // Input fields
  var abGroup = dialog.add('group');
      abGroup.orientation = 'column';
      abGroup.alignChildren = ['fill', 'top'];
      abGroup.add('statictext', undefined, 'Select artboard');
  var abIdx = abGroup.add('dropdownlist', CFG.uiTitle, absArr);
      abIdx.selection = curAbIdx;

  var fieldGroup = dialog.add('group');
      fieldGroup.orientation = 'row';
      fieldGroup.alignChildren = ['fill', 'center'];

  var titlesGroup = fieldGroup.add('group');
      titlesGroup.orientation = 'column';
  var copiesTitle = titlesGroup.add('statictext', CFG.uiTitle, 'Copies (max ');
      titlesGroup.add('statictext', CFG.uiTitle, 'Spacing, ' + CFG.units);

  var inputsGroup = fieldGroup.add('group');
      inputsGroup.orientation = 'column';
  var copiesVal = inputsGroup.add('edittext', CFG.uiField, CFG.copies);
  var spacingVal = inputsGroup.add('edittext', CFG.uiField, CFG.spacing);

  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 2);
  } else {
    copiesVal.active = true;
  }

  if (doc.pageItems.length > CFG.limit) {
    var warning = dialog.add('statictext', undefined, 'The document has over ' + CFG.limit + ' objects. The script can run slowly', { multiline: true });
  }

  // Buttons
  var btnsGroup = dialog.add('group');
      btnsGroup.orientation = 'row';
      btnsGroup.alignChildren = ['fill', 'center'];
  var cancel = btnsGroup.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btnsGroup.add('button', undefined, 'Ok', { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  loadSettings();

  spacing = convertUnits( strToAbsNum(spacingVal.text, CFG.minSpacing), CFG.units, 'px' );
  curAbIdx = doc.artboards.getActiveArtboardIndex();

  var abCoord = getArtboardCoordinates(curAbIdx, CFG.tmpLyr);
  var overCnvsSize = isOverCnvsBounds(abCoord, maxCopies, spacing, CFG.cnvs);

  copiesTitle.text = 'Copies (max ' + overCnvsSize.copies + ')';
  if (strToAbsNum(copiesVal.text, CFG.copies) > overCnvsSize.copies) {
    copiesVal.text = overCnvsSize.copies;
  }

  shiftInputNumValue(copiesVal, CFG.copies);
  shiftInputNumValue(spacingVal, CFG.minSpacing);

  // Change listeners
  spacingVal.onChange = function () {
    recalcCopies();
    this.text = strToAbsNum(this.text, CFG.spacing);
  }

  copiesVal.onChange = function () {
    recalcCopies();
    this.text = strToAbsNum(this.text, CFG.copies);
  }

  copiesVal.onChanging = spacingVal.onChanging = recalcCopies;

  abIdx.onChange = function() {
    doc.artboards.setActiveArtboardIndex(abIdx.selection.index);
    redraw();
    recalcCopies();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = dialog.close;

  // Remove temp layer
  dialog.onClose = function() {
    try {
      doc.layers.getByName(CFG.tmpLyr).remove();
    } catch (e) {}
  }

  ok.onClick = okClick;

  function okClick() {
    copies = copiesVal.text = Math.round( strToAbsNum(copiesVal.text, CFG.copies) );
    spacing = spacingVal.text = strToAbsNum(spacingVal.text, CFG.spacing);
    spacing = convertUnits(spacing, CFG.units, 'px') / CFG.sf;

    var userView = doc.views[0].screenMode;
    if (copies == 0) {
      dialog.close();
    } else if (copies > CFG.abs) {
      doc.views[0].screenMode = ScreenMode.FULLSCREEN;
    }

    selection = null;
    redraw();
    unlockLayers(doc.layers);
    removeNote(doc.layers, CFG.lKey, CFG.hKey); // Сlear Note after previous run
    saveItemsState(doc.layers, CFG.lKey, CFG.hKey);

    // Copy Artwork
    doc.selectObjectsOnActiveArtboard();
    var abItems = selection;
    try {
      for (var i = 0; i < copies; i++) {
        suffix = CFG.suffix + fillZero((i + 1), copies.toString().length);
        duplicateArtboard(curAbIdx, abItems, spacing, suffix, i);
      }
    } catch (e) {}

    // Restore locked & hidden pageItems
    restoreItemsState(doc.layers, CFG.lKey, CFG.hKey);
    selection = null;
    doc.views[0].screenMode = userView;
    saveSettings();
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;

    dialog.close();
  }

  dialog.center();
  dialog.show();

  /**
   * Recalculate the maximum amount of copies at a given spacing
   */
  function recalcCopies() {
    spacing = convertUnits( strToAbsNum(spacingVal.text, CFG.minSpacing), CFG.units, 'px' ) / CFG.sf;
    curAbIdx = doc.artboards.getActiveArtboardIndex();
    abCoord = getArtboardCoordinates(curAbIdx, CFG.tmpLyr);
    overCnvsSize = isOverCnvsBounds(abCoord, maxCopies, spacing, CFG.cnvs);
    copiesTitle.text = 'Copies (max ' + overCnvsSize.copies + ')';
    if (strToAbsNum(copiesVal.text, CFG.copies) > overCnvsSize.copies) {
      copiesVal.text = overCnvsSize.copies;
    }
    if (strToAbsNum(copiesVal.text, CFG.copies) < 0) {
      copiesVal.text = 0;
    }
  }

  /**
   * Use Up / Down arrow keys (+ Shift) for change value
   * @param {object} item - input text field
   * @param {number} min - minimal input value
   */
  function shiftInputNumValue(item, min) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = strToAbsNum(this.text, min) - step;
        if (this.text * 1 < min) this.text = min;
        recalcCopies();
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = strToAbsNum(this.text, min) + step;
        recalcCopies();
        kd.preventDefault();
      }
    });
  }

  /**
   * Save input data to file
   */
  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.copies = copiesVal.text;
    pref.spacing = spacingVal.text;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  /**
   * Load input data from file
   */
  function loadSettings() {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          copiesVal.text = pref.copies;
          spacingVal.text = pref.spacing;
        }
      } catch (e) {}
    }
  }
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
 * Unlock all Layers & Sublayers
 * @param {Object} _layers - Layers collection
 */
function unlockLayers(_layers) {
  for (var i = 0, len = _layers.length; i < len; i++) {
    if (_layers[i].locked) _layers[i].locked = false;
    if (_layers[i].layers.length) unlockLayers(_layers[i].layers);
  }
}

/**
 * Remove keyword from Note in Attributes panel
 * @param {Object} _layers - Layers collection
 * @param {string} lKey - Keyword for locked items
 * @param {string} hKey - Keyword for hidden items
 */
function removeNote(_layers, lKey, hKey) {
  var regexp = new RegExp(lKey + '|' + hKey, 'gi');
  for (var i = 0, len = _layers.length; i < len; i++) {
    var curLayer = _layers[i],
        allItems = [];
    if (curLayer.layers.length > 0) {
      removeNote(curLayer.layers, lKey, hKey);
    }
    try {
      getItems(curLayer.pageItems, allItems);
      for (var j = 0, iLen = allItems.length; j < iLen; j++) {
        var curItem = allItems[j];
        curItem.note = curItem.note.replace(regexp, '');
      }
    } catch (e) {}
  }
}

/**
 * Save information about locked & hidden pageItems & layers
 * @param {Object} _layers - Layers collection
 * @param {string} lKey - Keyword for locked items
 * @param {string} hKey - Keyword for hidden items
 */
function saveItemsState(_layers, lKey, hKey) {
  var allItems = [];
  for (var i = 0, len = _layers.length; i < len; i++) {
    var curLayer = _layers[i];
    if (curLayer.layers.length > 0) {
      saveItemsState(curLayer.layers, lKey, hKey);
    }
    getItems(curLayer.pageItems, allItems);
    for (var j = 0, iLen = allItems.length; j < iLen; j++) {
      var curItem = allItems[j];
      if (curItem.locked) {
        curItem.locked = false;
        curItem.note += lKey;
      }
      if (curItem.hidden) {
        curItem.hidden = false;
        curItem.note += hKey;
      }
    }
  }
  redraw();
}

/**
 * Restoring locked & hidden pageItems & layers
 * @param {Object} _layers - Layers collection
 * @param {string} lKey - Keyword for locked items
 * @param {string} hKey - Keyword for hidden items
 */
function restoreItemsState(_layers, lKey, hKey) {
  var allItems = [],
      regexp = new RegExp(lKey + '|' + hKey, 'gi');
  for (var i = 0, len = _layers.length; i < len; i++) {
    var curLayer = _layers[i];
    if (curLayer.layers.length > 0) {
      restoreItemsState(curLayer.layers, lKey, hKey);
    }
    getItems(curLayer.pageItems, allItems);
    for (var j = 0, iLen = allItems.length; j < iLen; j++) {
      var curItem = allItems[j];
      if (curItem.note.match(lKey) != null) {
        curItem.note = curItem.note.replace(regexp, '');
        curItem.locked = true;
      }
      if (curItem.note.match(hKey) != null) {
        curItem.note = curItem.note.replace(regexp, '');
        curItem.hidden = true;
      }
    }
  }
}

/**
 * Collect items
 * @param {(Object|Array)} obj - Items collection
 * @param {Array} arr - Output array with childrens
 */
function getItems(obj, arr) {
  for (var i = 0, len = obj.length; i < len; i++) {
    var curItem = obj[i];
    try {
      switch (curItem.typename) {
        case 'GroupItem':
          arr.push(curItem);
          getItems(curItem.pageItems, arr);
          break;
        default:
          arr.push(curItem);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Add zero to the file name before the indexes are less then size
 * @param {number} number - Copy number
 * @param {number} size - Length of the amount of copies
 * @return {string} Copy number with pre-filled zeros
 */
function fillZero(number, size) {
  var str = '000000000' + number;
  return str.slice(str.length - size);
}

/**
 * Trick with temp pathItem to get the absolute coordinate of the artboard. Thanks to @moodyallen
 * @param {number} abIdx - Current artboard index
 * @return {Object} Absolute coordinates of the artboard
 */
function getArtboardCoordinates(abIdx, lyrName) {
  var doc = activeDocument,
      thisAbRect = doc.artboards[abIdx].artboardRect, // The selected artboard size
      tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(lyrName);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = lyrName;
  }

  var fakePath = tmpLayer.pathItems.add();
  var cnvsDelta = 1 + ((fakePath.position[0] * 2 - 16384) - (fakePath.position[1] * 2 + 16384)) / 2;
  var cnvsTempPath = tmpLayer.pathItems.rectangle(fakePath.position[0] - cnvsDelta, fakePath.position[1] + cnvsDelta, 300, 300);
  cnvsTempPath.filled = false;
  cnvsTempPath.stroked  = false;

  // Create a rectangle with the same size as the artboard
  var top = thisAbRect[1],
      left = thisAbRect[0],
      width = thisAbRect[2] - thisAbRect[0],
      height = thisAbRect[1] - thisAbRect[3];

  var abTempPath = tmpLayer.pathItems.rectangle(top, left, width, height);
  abTempPath.stroked  = false;
  abTempPath.filled = false;

  // Use the X, Y coordinates of cnvsTempPath and abTempPath to get the absolute coordinate
  var absLeft = Math.floor(abTempPath.position[0] - cnvsTempPath.position[0]),
      absTop = Math.floor(cnvsTempPath.position[1] - abTempPath.position[1]),
      absBottom = absTop + height,
      absRight = absLeft + width;

  fakePath.remove();
  abTempPath.remove();
  cnvsTempPath.remove();
  redraw();

  return { 'left': absLeft, 'right': absRight, 'top': absTop, 'bottom': absBottom };
}

/**
 * Find out if the amount of copies over the canvas width
 * @param {Object} coord - Coordinates of the selected artboard
 * @param {number} copies - Amount of copies
 * @param {number} spacing - Distance between copies
 * @return {Object} Information about the extreme possible artboard
 */
function isOverCnvsBounds(coord, copies, spacing, max) {
  var lastAbRight = coord.right + (spacing + coord.right - coord.left) * copies,
      tempEdge = lastAbRight;

  // Get a safe amount of copies
  for (var i = copies; i >= 0; i--) {
    if (tempEdge <= max) break;
    tempEdge = tempEdge - (spacing + coord.right - coord.left);
  }

  return { 'answer': lastAbRight > max, 'copies': i };
}

/**
 * Duplicate the selected artboard. Based on the idea of @Silly-V
 * @param {number} thisAbIdx - Current artboard index
 * @param {Object} items - Collection of items on the artboard
 * @param {number} spacing - Distance between copies
 * @param {string} suffix - Copy name suffix
 * @param {number} counter - Current copy number
 */
function duplicateArtboard(thisAbIdx, items, spacing, suffix, counter) {
  var doc = activeDocument,
      thisAb = doc.artboards[thisAbIdx],
      thisAbRect = thisAb.artboardRect,
      idx = doc.artboards.length - 1,
      lastAb = doc.artboards[idx],
      lastAbRect = lastAb.artboardRect,
      abWidth = thisAbRect[2] - thisAbRect[0];

	var newAb = doc.artboards.add(thisAbRect);
  if (counter === 0) {
    newAb.artboardRect = [
      thisAbRect[2] + spacing,
      thisAbRect[1],
      thisAbRect[2] + spacing + abWidth,
      thisAbRect[3]
    ];
  } else {
    newAb.artboardRect = [
      lastAbRect[2] + spacing,
      lastAbRect[1],
      lastAbRect[2] + spacing + abWidth,
      lastAbRect[3]
    ];
  }
	newAb.name = thisAb.name + suffix;

  var docCoordSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
      abCoordSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
      isDocCoords = app.coordinateSystem == docCoordSystem,
      dupArr = getDuplicates(items);

  // Move copied items to the new artboard
  for (var i = 0, dLen = dupArr.length; i < dLen; i++) {
    var pos = isDocCoords ? dupArr[i].position : doc.convertCoordinate(dupArr[i].position, docCoordSystem, abCoordSystem);
    dupArr[i].position = [pos[0] + (abWidth + spacing) * (counter + 1), pos[1]];
  }
}

/**
 * Duplicate all items
 * @param {Object} collection - Selected items on active artboard
 * @return {Array} arr - Duplicated items
 */
function getDuplicates(collection) {
  var arr = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    arr.push(collection[i].duplicate());
  }
  return arr;
}

/**
 * Get active document ruler units
 * @return {string} Shortened units
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
 * Convert units of measurement
 * @param {string} value - Numeric data
 * @param {string} curUnits - Document units 
 * @param {string} newUnits - Final units
 * @return {number} Converted value 
 */
function convertUnits(value, curUnits, newUnits) {
  return UnitValue(value, curUnits).as(newUnits);
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