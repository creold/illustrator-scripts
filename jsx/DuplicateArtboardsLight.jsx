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
  
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  
  NOTICE:
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
    SCRIPT_VERSION = 'v.0.2.1',
    SETTINGS_FILE = {
      name: SCRIPT_NAME.replace(/\s/g, '_') + '_data.ini',
      folder: Folder.myDocuments + '/Adobe Scripts/'
    },
    AI_VER = parseInt(app.version),
    COPIES_DEF = 0,
    SPACING_DEF = 20,
    SPACING_MIN = 0,
    SUFFIX_DEF = ' ',
    L_KEYWORD = '%isLocked',
    H_KEYWORD = '%isHidden',
    TMP_LAYER_NAME = 'FOR_AB_COORD',
    OVER_OBJ = 2500, // The amount of objects, when the script can run slowly
    CNVS_SIZE = 16383, // Illustrator canvas max bounds, px
    OVER_COPIES = 10, // When the number of copies >, full-screen mode is enabled
    DEF_DLG_OPACITY = 0.9,  // UI window opacity. Range 0-1
    FIELD_SIZE = [0, 0, 60, 30],
    TITLE_SIZE = [0, 0, 120, 30];

// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.', ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_VER = { en: 'Error\nSorry, script only works in Illustrator CS6 and later.',
                     ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше.'},
    LANG_ERR_COPIES = { en: 'Error\nMaximum amount of copies in document: ',
                        ru: 'Ошибка\nМаксимальное количество копий в документе: '},
    LANG_SLOW = { en: 'In the document over ' + OVER_OBJ + ' objects. The script can run slowly',
                  ru: 'В документе свыше ' + OVER_OBJ + ' объектов. Скрипт может работать медленно'},
    LANG_ARTBOARD = { en: 'Select artboard', ru: 'Выберите артборд'},
    LANG_COPIES = { en: 'Copies (max ', ru: 'Копии (до '},
    LANG_SPACING = { en: 'Spacing', ru: 'Расстояние'},
    LANG_OK = { en: 'Ok', ru: 'Готово'},
    LANG_CANCEL = { en: 'Cancel', ru: 'Отмена'};

function main() {
  if (AI_VER < 16) {
    alert(LANG_ERR_VER);
    return;
  } 

  if (app.documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  }

  var doc = app.activeDocument,
      COPIES_MAX = 1000 - doc.artboards.length,
      currAbIdx = doc.artboards.getActiveArtboardIndex(),
      abArr = [],
      copies = spacing = 0;
 
  for (var i = 0; i < doc.artboards.length; i++) {
    abArr.push((i + 1) + ': ' + doc.artboards[i].name);
  }

  // Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION, undefined);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = DEF_DLG_OPACITY;

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
  var copiesVal = inputsGroup.add('edittext', FIELD_SIZE, COPIES_DEF);
  var spacingVal = inputsGroup.add('edittext', FIELD_SIZE, SPACING_DEF);

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
  
  spacing = convertUnits((spacingVal.text * 1) + getDocUnit(), 'px');
  currAbIdx = doc.artboards.getActiveArtboardIndex();

  var abCoord = getArtboardCoordinates(currAbIdx);
  var overCnvsSize = isOverCnvsBounds(abCoord, COPIES_MAX, spacing);
  
  copiesTitle.text = LANG_COPIES + overCnvsSize.copies + ')';
  if (copiesVal.text * 1 > overCnvsSize.copies) {
    copiesVal.text = overCnvsSize.copies;
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  keyListener(copiesVal, COPIES_DEF);
  keyListener(spacingVal, SPACING_MIN);
  
  // Change listeners
  copiesVal.onChange = function() {
    this.text = convertInputToNum(this.text, COPIES_DEF);
    this.text = parseInt(this.text);
  }
  spacingVal.onChange = function() {
    this.text = convertInputToNum(this.text, SPACING_MIN);
  }
  copiesVal.onChanging = spacingVal.onChanging = function() {
    spacing = convertUnits((spacingVal.text * 1) + getDocUnit(), 'px');
    currAbIdx = doc.artboards.getActiveArtboardIndex();
    abCoord = getArtboardCoordinates(currAbIdx);
    overCnvsSize = isOverCnvsBounds(abCoord, COPIES_MAX, spacing);

    copiesTitle.text = LANG_COPIES + overCnvsSize.copies + ')';
    if (copiesVal.text * 1 > overCnvsSize.copies) { 
      copiesVal.text = overCnvsSize.copies;
    } else if (copiesVal.text * 1 < 0) { 
      copiesVal.text = 0;
    }
  }
  abIdx.onChange = function() {
    doc.artboards.setActiveArtboardIndex(abIdx.selection.index);
    app.redraw();

    currAbIdx = doc.artboards.getActiveArtboardIndex();
    abCoord = getArtboardCoordinates(currAbIdx);
    overCnvsSize = isOverCnvsBounds(abCoord, COPIES_MAX, spacing);

    copiesTitle.text = LANG_COPIES + overCnvsSize.copies + ')';
    if (copiesVal.text * 1 > overCnvsSize.copies) { 
      copiesVal.text = overCnvsSize.copies;
    } else if (copiesVal.text * 1 < 0) { 
      copiesVal.text = 0;
    }
  }

  cancel.onClick = function() {
    dialog.close();
  }

  dialog.onClose = function() {
    // Remove temp layer with artboards numbers
    try {
      var layerToRm = doc.layers.getByName(TMP_LAYER_NAME);
      layerToRm.remove();
    } catch (e) {}
  }
  
  ok.onClick = okClick;

  function okClick() {
    copies = copiesVal.text * 1;
    spacing = spacingVal.text * 1;
    spacing = convertUnits(spacing + getDocUnit(), 'px'); // Convert value to document units

    if (copies > COPIES_MAX) {
      alert(LANG_ERR_COPIES + COPIES_MAX);
      return;
    }
    
    selection = null;

    var userScreen = doc.views[0].screenMode;
    if (copies > OVER_COPIES) { 
      doc.views[0].screenMode = ScreenMode.FULLSCREEN;
    }
    saveItemsState();
   
    // Copy Artwork
    doc.selectObjectsOnActiveArtboard();
    app.copy();
    try {
      for (var i = 0; i < copies; i++) {
        suffix = SUFFIX_DEF + fillZero((i + 1), copies.toString().length);
        duplicateArtboard(currAbIdx, spacing, suffix, i);
      }
    } catch (e) {
      // showError(e);
    }

    // Restore locked & hidden pageItems
    restoreItemsState();
    selection = null;
    doc.views[0].screenMode = userScreen;

    saveSettings();
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    
    dialog.close();
  }
    
  dialog.center();
  dialog.show();

  function keyListener(item, min) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        if (this.text * 1 < min) { this.text = min; }
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
      }
    });
  }

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

// Save information about locked & hidden pageItems & layers
function saveItemsState() {
  unlockLayers(app.activeDocument.layers);

  for (var i = 0; i < app.activeDocument.pageItems.length; i++) {
    var currItem = app.activeDocument.pageItems[i];
    if (currItem.locked) {
      if (currItem.note == '') { currItem.note = L_KEYWORD; }
      else { currItem.note += L_KEYWORD; }
      currItem.locked = false;
    }
    if (currItem.hidden) {
      if (currItem.note == '') { currItem.note = H_KEYWORD; }
      else { currItem.note += H_KEYWORD; }
      currItem.hidden = false;
    }
  }

  app.redraw();
}

// Unlock all Layers & Sublayers
function unlockLayers(_layers) {
  for (var i = 0; i < _layers.length; i++) {
    if (_layers[i].locked) _layers[i].locked = false;
    if (_layers[i].layers.length) unlockLayers(_layers[i].layers);
  }
}

// Restoring locked & hidden pageItems & layers
function restoreItemsState() {
  for (var i = 0; i < app.activeDocument.pageItems.length; i++) {
    var currItem = app.activeDocument.pageItems[i];
    if (currItem.note.match(L_KEYWORD) != null) {
      currItem.locked = true;
      currItem.note = currItem.note.replace(L_KEYWORD, '');
    }
    if (currItem.note.match(H_KEYWORD) != null) {
      currItem.hidden = true;
      currItem.note = currItem.note.replace(H_KEYWORD, '');
    }
  }
}

// Add zero to the file name before the indexes are less then size
function fillZero(number, size) {
  var str = '000000000' + number;
  return str.slice(str.length - size);
}

// Trick with temp pathItem to get the absolute coordinate of the artboard. Thanks to @moodyallen
function getArtboardCoordinates(abIdx) {
  var doc = app.activeDocument,
      thisAbRect = doc.artboards[abIdx].artboardRect, // The selected artboard size
      tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(TMP_LAYER_NAME);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = TMP_LAYER_NAME;
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

// Find out if the amount of copies over the canvas width
function isOverCnvsBounds(coord, copies, spacing) { 
  copies = copies * 1;
  spacing = spacing * 1;

  var lastAbRight = coord.right + (spacing + coord.right - coord.left) * copies,
      tempEdge = lastAbRight;
  
  // Get a safe amount of copies
  for (var i = copies; i >= 0; i--) {
    if (tempEdge <= CNVS_SIZE) { break; } 
    else { tempEdge = tempEdge - (spacing + coord.right - coord.left); }
  }

  return { 'answer': lastAbRight > CNVS_SIZE, 'copies': i };
}

// The function is based on the idea of @Silly-V
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

// Units conversion. Thanks for help Alexander Ladygin (https://github.com/alexander-ladygin)
function getDocUnit() {
  var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  if (unit === 'Centimeters') unit = 'cm';
  else if (unit === 'Millimeters') unit = 'mm';
  else if (unit === 'Inches') unit = 'in';
  else if (unit === 'Pixels') unit = 'px';
  else if (unit === 'Points') unit = 'pt';
  return unit;
}

function getUnits(value, def) {
  try {
    return 'px,pt,mm,cm,in,pc'.indexOf(value.slice(-2)) > -1 ? value.slice(-2) : def;
  } catch (e) {}
};

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

function convertInputToNum(str, def) {
  str = str.replace(',', '.');
  if (isNaN(str * 1) || (str * 1) <= 0 || str.replace(/\s/g, '').length == 0) { 
    return def; 
  }
  else { 
    return str * 1; 
  }
}

function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

try {
  main();
} catch (e) {}