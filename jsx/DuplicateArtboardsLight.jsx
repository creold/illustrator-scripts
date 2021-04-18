/*
  Duplicate_Artboards_Light.jsx for Adobe Illustrator
  Description: Script for copying the selected Artboard with his artwork
  Requirements: Adobe Illustrator CS6 and later
  Date: October, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
  0.1 Initial version
  0.2 Fixed: bounds checking of the Illustrator canvas; position of the first copy
  0.2.1 Fixed script didn't run if the layers were locked
  0.2.2 Performance optimization

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
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
$.localize = true; // Enabling automatic localization

// Global variables
var SCRIPT_NAME = 'Duplicate Atboards Light',
    SCRIPT_VERSION = 'v.0.2.2',
    SETTINGS_FILE = {
      name: SCRIPT_NAME.replace(/\s/g, '_') + '_data.ini',
      folder: Folder.myDocuments + '/Adobe Scripts/'
    },
    AI_VER = parseInt(app.version),
    DEF_COPIES = 0, // Default amount of copies
    DEF_SPACING = 20, // Default spacing between copies (doc units)
    SPACING_MIN = 0, // The spacing can't be < 0
    DEF_SUFFIX = ' ', // Default suffix for copies names
    L_KEY = '%isLocked',
    H_KEY = '%isHidden',
    TMP_LAYER_NAME = 'FOR_AB_COORD',
    OVER_OBJ = 2500, // The amount of objects, when the script can run slowly
    CNVS_SIZE = 16383, // Illustrator canvas max bounds, px
    OVER_COPIES = 10, // When the number of copies >, full-screen mode is enabled
    DLG_OPACITY = 0.96,  // UI window opacity. Range 0-1
    FIELD_SIZE = [0, 0, 60, 30],
    TITLE_SIZE = [0, 0, 120, 30];

// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again',
                     ru: 'Ошибка\nОткройте документ и запустите скрипт' },
    LANG_ERR_VER = { en: 'Error\nSorry, script only works in Illustrator CS6 and later',
                     ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше' },
    LANG_ERR_COPIES = { en: 'Error\nMaximum amount of copies in document: ',
                        ru: 'Ошибка\nМаксимальное количество копий в документе: ' },
    LANG_SLOW = { en: 'In the document over ' + OVER_OBJ + ' objects. The script can run slowly',
                  ru: 'В документе свыше ' + OVER_OBJ + ' объектов. Скрипт может работать медленно' },
    LANG_ARTBOARD = { en: 'Select artboard', ru: 'Выберите артборд' },
    LANG_COPIES = { en: 'Copies (max ', ru: 'Копии (до ' },
    LANG_SPACING = { en: 'Spacing', ru: 'Расстояние' },
    LANG_OK = { en: 'Ok', ru: 'Готово' },
    LANG_CANCEL = { en: 'Cancel', ru: 'Отмена' };

function main() {
  if (AI_VER < 16) {
    alert(LANG_ERR_VER);
    return;
  }

  if (!documents.length) {
    alert(LANG_ERR_DOC);
    return;
  }

  var doc = app.activeDocument,
      maxCopies = ((AI_VER >= 22) ? 1000 : 100) - doc.artboards.length, // Artboards limit
      currAbIdx = doc.artboards.getActiveArtboardIndex(),
      abArr = [],
      copies = spacing = 0;

  // Collect artboards names for dropdown menu
  for (var i = 0, aLen = doc.artboards.length; i < aLen; i++) {
    abArr.push((i + 1) + ': ' + doc.artboards[i].name);
  }

  // Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = DLG_OPACITY;

  // Input fields
  var abGroup = dialog.add('group');
      abGroup.orientation = 'column';
      abGroup.alignChildren = ['fill', 'top'];
      abGroup.add('statictext', undefined, LANG_ARTBOARD);
  var abIdx = abGroup.add('dropdownlist', TITLE_SIZE, abArr);
      abIdx.selection = currAbIdx;

  var fieldGroup = dialog.add('group');
      fieldGroup.orientation = 'row';
      fieldGroup.alignChildren = ['fill', 'center'];

  var titlesGroup = fieldGroup.add('group');
      titlesGroup.orientation = 'column';
  var copiesTitle = titlesGroup.add('statictext', TITLE_SIZE, LANG_COPIES);
      titlesGroup.add('statictext', TITLE_SIZE, LANG_SPACING + ', ' + getDocUnit());

  var inputsGroup = fieldGroup.add('group');
      inputsGroup.orientation = 'column';
  var copiesVal = inputsGroup.add('edittext', FIELD_SIZE, DEF_COPIES);
  var spacingVal = inputsGroup.add('edittext', FIELD_SIZE, DEF_SPACING);

  if (doc.pageItems.length > OVER_OBJ) {
    var warning = dialog.add('statictext', undefined, LANG_SLOW, { multiline: true });
  }

  // Buttons
  var btnsGroup = dialog.add('group');
      btnsGroup.orientation = 'row';
      btnsGroup.alignChildren = ['fill', 'center'];
  var cancel = btnsGroup.add('button', undefined, LANG_CANCEL, { name: 'cancel' });
  var ok = btnsGroup.add('button', undefined, LANG_OK,  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, sergosokin.ru');
      copyright.justify = 'center';
      copyright.enabled = false;

  loadSettings();

  spacing = convertUnits( convertToNum(spacingVal.text, SPACING_MIN) + getDocUnit(), 'px' );
  currAbIdx = doc.artboards.getActiveArtboardIndex();

  var abCoord = getArtboardCoordinates(currAbIdx, TMP_LAYER_NAME);
  var overCnvsSize = isOverCnvsBounds(abCoord, maxCopies, spacing);

  copiesTitle.text = LANG_COPIES + overCnvsSize.copies + ')';
  if (convertToNum(copiesVal.text, DEF_COPIES) > overCnvsSize.copies) {
    copiesVal.text = overCnvsSize.copies;
  }

  shiftInputNumValue(copiesVal, DEF_COPIES);
  shiftInputNumValue(spacingVal, SPACING_MIN);

  // Change listeners
  copiesVal.onChange = spacingVal.onChange = recalcCopies;
  copiesVal.onChanging = spacingVal.onChanging = recalcCopies;

  abIdx.onChange = function() {
    doc.artboards.setActiveArtboardIndex(abIdx.selection.index);
    app.redraw();
    recalcCopies();
  }

  cancel.onClick = function() {
    dialog.close();
  }

  dialog.onClose = function() {
    // Remove temp layer
    try {
      doc.layers.getByName(TMP_LAYER_NAME).remove();
    } catch (e) {}
  }

  ok.onClick = okClick;

  function okClick() {
    copies = copiesVal.text = Math.round( convertToNum(copiesVal.text, DEF_COPIES) );
    spacing = spacingVal.text = convertToNum(spacingVal.text, DEF_SPACING);
    spacing = convertUnits(spacing + getDocUnit(), 'px');

    if (copies > maxCopies) {
      alert(LANG_ERR_COPIES + maxCopies);
      return;
    }

    selection = null;

    var userView = doc.views[0].screenMode;
    if (copies > OVER_COPIES) doc.views[0].screenMode = ScreenMode.FULLSCREEN;
    unlockLayers(doc.layers);
    removeNote(doc.layers, L_KEY, H_KEY); // Сlear Note after previous run
    saveItemsState(doc.layers, L_KEY, H_KEY);

    // Copy Artwork
    doc.selectObjectsOnActiveArtboard();
    app.copy();
    try {
      for (var i = 0; i < copies; i++) {
        suffix = DEF_SUFFIX + fillZero((i + 1), copies.toString().length);
        duplicateArtboard(currAbIdx, spacing, suffix, i);
      }
    } catch (e) {
      // showError(e);
    }

    // Restore locked & hidden pageItems
    restoreItemsState(doc.layers, L_KEY, H_KEY);
    removeNote(doc.layers, L_KEY, H_KEY); // Сlear Note before close
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
    spacing = convertUnits( convertToNum(spacingVal.text, SPACING_MIN) + getDocUnit(), 'px' );
    currAbIdx = doc.artboards.getActiveArtboardIndex();
    abCoord = getArtboardCoordinates(currAbIdx, TMP_LAYER_NAME);
    overCnvsSize = isOverCnvsBounds(abCoord, maxCopies, spacing);

    copiesTitle.text = LANG_COPIES + overCnvsSize.copies + ')';
    if (convertToNum(copiesVal.text, DEF_COPIES) > overCnvsSize.copies) {
      copiesVal.text = overCnvsSize.copies;
    }
    if (convertToNum(copiesVal.text, DEF_COPIES) < 0) {
      copiesVal.text = 0;
    }
  }

  /**
   * Use Up / Down arrow keys (+ Shift) for change value
   * @param {object} item input text field
   * @param {number} min minimal input value
   */
  function shiftInputNumValue(item, min) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        if (convertToNum(this.text, min) < min) this.text = min;
        recalcCopies();
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = convertToNum(this.text, min) + step;
        recalcCopies();
        kd.preventDefault();
      }
    });
  }

  /**
   * Save input data to file
   */
  function saveSettings() {
    if(!Folder(SETTINGS_FILE.folder).exists) Folder(SETTINGS_FILE.folder).create();
    var $file = new File(SETTINGS_FILE.folder + SETTINGS_FILE.name),
        data = [
          copies,
          spacingVal.text
        ].toString();
    $file.open('w');
    $file.write(data);
    $file.close();
  }

  /**
   * Load input data from file
   */
  function loadSettings() {
    var $file = File(SETTINGS_FILE.folder + SETTINGS_FILE.name);
    if ($file.exists) {
      try {
        $file.open('r');
        var data = $file.read().split('\n'),
            $main = data[0].split(',');
        copiesVal.text = $main[0];
        spacingVal.text = $main[1];
      } catch (e) {}
      $file.close();
    }
  }
}

/**
 * Unlock all Layers & Sublayers
 * @param {object} _layers the collection of layers
 */
function unlockLayers(_layers) {
  for (var i = 0, len = _layers.length; i < len; i++) {
    if (_layers[i].locked) _layers[i].locked = false;
    if (_layers[i].layers.length) unlockLayers(_layers[i].layers);
  }
}

/**
 * Remove keyword from Note in Attributes panel
 * @param {object} _layers the collection of layers
 * @param {string} lKey keyword for locked items
 * @param {string} hKey keyword for hidden items
 */
function removeNote(_layers, lKey, hKey) {
  var regexp = new RegExp(lKey + '|' + hKey, 'gi');
  for (var i = 0, len = _layers.length; i < len; i++) {
    var currLayer = _layers[i],
        allItems = [];
    if (currLayer.layers.length > 0) {
      removeNote(currLayer.layers, lKey, hKey);
    }
    getItems(currLayer.pageItems, allItems);
    for (var j = 0, iLen = allItems.length; j < iLen; j++) {
      var currItem = allItems[j];
      currItem.note = currItem.note.replace(regexp, '');
    }
  }
}

/**
 * Save information about locked & hidden pageItems & layers
 * @param {object} _layers the collection of layers
 * @param {string} lKey keyword for locked items
 * @param {string} hKey keyword for hidden items
 */
function saveItemsState(_layers, lKey, hKey) {
  var allItems = [];
  for (var i = 0, len = _layers.length; i < len; i++) {
    var currLayer = _layers[i];
    if (currLayer.layers.length > 0) {
      saveItemsState(currLayer.layers, lKey, hKey);
    }
    getItems(currLayer.pageItems, allItems);
    for (var j = 0, iLen = allItems.length; j < iLen; j++) {
      var currItem = allItems[j];
      if (currItem.locked) {
        currItem.note += lKey;
        currItem.locked = false;
      }
      if (currItem.hidden) {
        currItem.note += hKey;
        currItem.hidden = false;
      }
    }
  }
  app.redraw();
}

/**
 * Restoring locked & hidden pageItems & layers
 * @param {object} _layers the collection of layers
 * @param {string} lKey keyword for locked items
 * @param {string} hKey keyword for hidden items
 */
function restoreItemsState(_layers, lKey, hKey) {
  var allItems = [];
  for (var i = 0, len = _layers.length; i < len; i++) {
    var currLayer = _layers[i];
    if (currLayer.layers.length > 0) {
      restoreItemsState(currLayer.layers, lKey, hKey);
    }
    getItems(currLayer.pageItems, allItems);
    for (var j = 0, iLen = allItems.length; j < iLen; j++) {
      var currItem = allItems[j];
      if (currItem.note.match(lKey) != null) currItem.locked = true;
      if (currItem.note.match(hKey) != null) currItem.hidden = true;
    }
  }
}

/**
 * Collect items
 * @param {object} obj collection of items
 * @param {array} arr output array with childrens
 */
function getItems(obj, arr) {
  for (var i = 0, len = obj.length; i < len; i++) {
    var currItem = obj[i];
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
 * Add zero to the file name before the indexes are less then size
 * @param {number} number copy number
 * @param {number} size length of the amount of copies
 * @return {string} copy number with pre-filled zeros
 */
function fillZero(number, size) {
  var str = '000000000' + number;
  return str.slice(str.length - size);
}

/**
 * Trick with temp pathItem to get the absolute coordinate of the artboard. Thanks to @moodyallen
 * @param {number*} abIdx current artboard index
 * @return {object} absolute coordinates of the artboard
 */
function getArtboardCoordinates(abIdx, lyrName) {
  var doc = app.activeDocument,
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
  app.redraw();

  return { 'left': absLeft, 'right': absRight, 'top': absTop, 'bottom': absBottom };
}

/**
 * Find out if the amount of copies over the canvas width
 * @param {object} coord coordinates of the selected artboard
 * @param {number} copies amount of copies
 * @param {number} spacing distance between copies
 * @return {object} information about the extreme possible artboard
 */
function isOverCnvsBounds(coord, copies, spacing) {
  var lastAbRight = coord.right + (spacing + coord.right - coord.left) * copies,
      tempEdge = lastAbRight;

  // Get a safe amount of copies
  for (var i = copies; i >= 0; i--) {
    if (tempEdge <= CNVS_SIZE) break;
    tempEdge = tempEdge - (spacing + coord.right - coord.left);
  }

  return { 'answer': lastAbRight > CNVS_SIZE, 'copies': i };
}

/**
 * Duplicate the selected artboard. Based on the idea of @Silly-V
 * @param {number} thisAbIdx current artboard index
 * @param {number} spacing distance between copies
 * @param {string} suffix copy name suffix
 * @param {number} count current copy number
 */
function duplicateArtboard(thisAbIdx, spacing, suffix, count) {
  var doc = app.activeDocument,
	    thisAb = doc.artboards[thisAbIdx],
	    thisAbRect = thisAb.artboardRect,
	    idx = doc.artboards.length - 1,
      lastAb = doc.artboards[idx],
      lastAbRect = lastAb.artboardRect,
      colAbHeight = thisAbRect[2] - thisAbRect[0];

	var newAb = doc.artboards.add(thisAbRect);
  if (count === 0) {
    newAb.artboardRect = [
      thisAbRect[2] + spacing,
      thisAbRect[1],
      thisAbRect[2] + spacing + colAbHeight,
      thisAbRect[3]
    ];
  } else {
    newAb.artboardRect = [
      lastAbRect[2] + spacing,
      lastAbRect[1],
      lastAbRect[2] + spacing + colAbHeight,
      lastAbRect[3]
    ];
  }
	newAb.name = thisAb.name + suffix;
  app.executeMenuCommand('pasteFront');
  selection = null;
}

/**
 * Units conversion. Thanks for help Alexander Ladygin (https://github.com/alexander-ladygin)
 * @return {string} document ruler units
 */
function getDocUnit() {
  var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  if (unit === 'Centimeters') unit = 'cm';
  else if (unit === 'Millimeters') unit = 'mm';
  else if (unit === 'Inches') unit = 'in';
  else if (unit === 'Pixels') unit = 'px';
  else if (unit === 'Points') unit = 'pt';
  return unit;
}

/**
 * @param {string} value input data
 * @param {string} def default units
 * @return {string} input data units
 */
function getUnits(value, def) {
  try {
    return 'px,pt,mm,cm,in,pc'.indexOf(value.slice(-2)) > -1 ? value.slice(-2) : def;
  } catch (e) {}
};

/**
 * Сonvert to the specified units of measurement
 * @param {string} value input data
 * @param {string} newUnit specified units
 * @return {number} converted data
 */
function convertUnits(value, newUnit) {
  if (value === undefined) return value;
  if (newUnit === undefined) newUnit = 'px';
  if (typeof value === 'number') value = value + 'px';
  if (typeof value === 'string') {
    var unit = getUnits(value),
        val = parseFloat(value);
    if (unit && !isNaN(val)) {
      value = val;
    } else if (!isNaN(val)) {
      value = val;
      unit = 'px';
    }
  }

  if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'mm')) {
      value = parseFloat(value) / 2.83464566929134;
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'cm')) {
      value = parseFloat(value) / (2.83464566929134 * 10);
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'in')) {
      value = parseFloat(value) / 72;
  } else if ((unit === 'mm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134;
  } else if ((unit === 'mm') && (newUnit === 'cm')) {
      value = parseFloat(value) * 10;
  } else if ((unit === 'mm') && (newUnit === 'in')) {
      value = parseFloat(value) / 25.4;
  } else if ((unit === 'cm') && ((newUnit === 'px') || (bnewUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134 * 10;
  } else if ((unit === 'cm') && (newUnit === 'mm')) {
      value = parseFloat(value) / 10;
  } else if ((unit === 'cm') && (newUnit === 'in')) {
      value = parseFloat(value) * 2.54;
  } else if ((unit === 'in') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 72;
  } else if ((unit === 'in') && (newUnit === 'mm')) {
      value = parseFloat(value) * 25.4;
  } else if ((unit === 'in') && (newUnit === 'cm')) {
      value = parseFloat(value) * 25.4;
  }
  return parseFloat(value);
}

/**
 * Convert any input data to a number
 * @param {string} str input data
 * @param {number} def default value if the input data don't contain numbers
 * @return {number}
 */
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

try {
  main();
} catch (e) {
  // showError(e);
}