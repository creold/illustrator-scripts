/*
  Duplicate_Artboards_Light.jsx for Adobe Illustrator
  Description: Script for copying the selected Artboard with his artwork
  Requirements: Adobe Illustrator CS6 and later
  Date: October, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ============================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
$.localize = true; // Enabling automatic localization

// Global variables
var SCRIPT_NAME = 'Duplicate Atboards Light',
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
    CANVAS_LIMIT = 8672, // The Illustrator canvas relative coordinates -7711,7911,8672,-8472
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
      currBoardIdx = doc.artboards.getActiveArtboardIndex(),
      boardsArr = [],
      copies = spacing = 0;
 
  for (var i = 0; i < doc.artboards.length; i++) {
    boardsArr.push((i + 1) + ': ' + doc.artboards[i].name);
  }

  // Main Window
  var dialog = new Window('dialog', SCRIPT_NAME, undefined);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = DEF_DLG_OPACITY;

  // Input fields
  var boardsGroup = dialog.add('group');
      boardsGroup.orientation = 'column';
      boardsGroup.alignChildren = ['fill', 'top'];
      boardsGroup.add('statictext', undefined, LANG_ARTBOARD);
  var artboardIdx = boardsGroup.add('dropdownlist', TITLE_SIZE, boardsArr);
      artboardIdx.selection = currBoardIdx;
  
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
  currBoardIdx = doc.artboards.getActiveArtboardIndex();
  var oversizeCanvasWidth = isCanvasWidthReached(currBoardIdx, COPIES_MAX, spacing);
  
  copiesTitle.text = LANG_COPIES + oversizeCanvasWidth.copies + ')';
  if (copiesVal.text * 1 > oversizeCanvasWidth.copies) {
    copiesVal.text = oversizeCanvasWidth.copies;
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
    currBoardIdx = doc.artboards.getActiveArtboardIndex();
    var oversizeCanvasWidth = isCanvasWidthReached(currBoardIdx, COPIES_MAX, spacing);

    copiesTitle.text = LANG_COPIES + oversizeCanvasWidth.copies + ')';
    if (copiesVal.text * 1 > oversizeCanvasWidth.copies) { 
      copiesVal.text = oversizeCanvasWidth.copies;
    } else if (copiesVal.text * 1 < 0) { 
      copiesVal.text = 0;
    }
  }
  artboardIdx.onChange = function() {
    doc.artboards.setActiveArtboardIndex(artboardIdx.selection.index);
    app.redraw();
  }
  
  ok.onClick = okClick;

  function okClick() {
    doc.artboards.setActiveArtboardIndex(artboardIdx.selection.index);
    currBoardIdx = doc.artboards.getActiveArtboardIndex();

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
    saveItemsState(); // Save information about locked & hidden pageItems
   
    try {
      for (var i = 0; i < copies; i++) {
        suffix = SUFFIX_DEF + fillZero((i + 1), copies.toString().length);
        duplicateArtboard(currBoardIdx, spacing, suffix);
      }
    } catch (e) {
      // showError(e);
    }

    // Restore locked & hidden pageItems
    app.executeMenuCommand('unlockAll');
    restoreItemsState();
    selection = null;
    doc.views[0].screenMode = userScreen;

    saveSettings();
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    
    dialog.close();
  }
  
  cancel.onClick = function() {
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

// Save information about locked & hidden pageItems
function saveItemsState() {
  for (var i = 0; i < activeDocument.pageItems.length; i++) {
    var currItem = activeDocument.pageItems[i];
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

// Restoring locked & hidden pageItems
function restoreItemsState() {
  for (var i = 0; i < activeDocument.pageItems.length; i++) {
    var currItem = activeDocument.pageItems[i];
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

// Find out if the amount of copies over the canvas width
function isCanvasWidthReached(thisBoardIdx, copies, spacing) {
  var doc = app.activeDocument,
      thisBoard = doc.artboards[thisBoardIdx], // The user selected artboard
      thisRect = thisBoard.artboardRect, // The artboard size
      lastBoardRightEdge = thisRect[2] + (spacing + thisRect[2] - thisRect[0]) * copies,
      tempEdge = lastBoardRightEdge;
  
  copies = copies * 1;
  spacing = spacing * 1;

  // Get a safe amount of copies
  for (var i = copies; i >= 0; i--) {
    if (tempEdge <= CANVAS_LIMIT) { break; } 
    else { tempEdge = tempEdge - (spacing + thisRect[2] - thisRect[0]); }
  }

  return { 'answer': lastBoardRightEdge > CANVAS_LIMIT, 'copies': i };
}

// The function is based on the idea of @Silly-V
function duplicateArtboard(thisBoardIdx, spacing, suffix) {
  var doc = app.activeDocument,
	    thisBoard = doc.artboards[thisBoardIdx],
	    thisRect = thisBoard.artboardRect,
	    idx = doc.artboards.length - 1,
      lastBoard = doc.artboards[idx],
      lastRect = lastBoard.artboardRect,
      colBoardHeight = thisRect[2] - thisRect[0];
  // Lock Artwork outside the Artboard
  doc.selectObjectsOnActiveArtboard();
  app.executeMenuCommand('Inverse menu item');
  app.executeMenuCommand('lock');
  app.redraw();
  // Copy Artwork
  doc.selectObjectsOnActiveArtboard();
  app.copy();

	var newBoard = doc.artboards.add(thisRect);
  newBoard.artboardRect = [
    lastRect[2] + spacing,
    lastRect[1],
    lastRect[2] + spacing + colBoardHeight,
    lastRect[3]
  ];
	newBoard.name = thisBoard.name + suffix;
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