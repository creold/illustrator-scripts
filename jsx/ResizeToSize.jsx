/*
  ResizeToSize.jsx for Adobe Illustrator
  Description: Scales each selected objects to a given value
  Date: March, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
   0.1 Initial version
   0.2 Added menu for side selection
   0.3 Added additional settings 
   0.4 Correct resize Clipping Mask. Added access key shortcuts
   0.5 Added dimensions bounds.
   0.6 Added live preview (Shift+P).
   0.7 Fixed live preview bug. Minor improvements

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

// Global variables
var SCRIPT_TITLE = 'ResizeToSize',
    SCRIPT_VERSION = 'v.0.7';

var DLG_MARGINS = [10, 20, 10, 10],
    DEF_SIZE = 100, // Default size value
    DEF_BNDS = app.preferences.getBooleanPreference('includeStrokeInBounds'),
    DEF_CORNER = app.preferences.getIntegerPreference('policyForPreservingCorners'),
    DEF_STROKE = app.preferences.getBooleanPreference('scaleLineWeight'),
    DEF_PATT = app.preferences.getBooleanPreference('transformPatterns'),
    MAX_SIZE = 16383, // Px
    REF_POINT_NUM = 9, // Don't change
    refPointArr = new Array(REF_POINT_NUM), // Reference point array
    refPointVal = '', // Reference point name
    refPointDef = [ // Default values for all state of Reference Point
      false, false, false,
      false, true, false,
      false, false, false
    ], 
    REF_POINT_HINT = [ 
      'Top Left', 'Top', 'Top Right',
      'Left', 'Center', 'Right',
      'Bottom Left', 'Bottom', 'Bottom Right' ],
    scaleSide = '',
    scaleRatio = scaleX = scaleY = 0, // Scale factor
    isUndo = false,
    DEF_BREAK = 20; // Fix infinity looping

function main () {
  if (documents.length == 0) {
    alert('Error\nOpen a document and try again.');
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object.');
    return;
  }

  var doc = app.activeDocument,
      docSel = doc.selection;

  // Create Main Window
  var dialog = new Window('dialog', SCRIPT_TITLE + ' ' + SCRIPT_VERSION);
      dialog.orientation = 'column';
   
  var sizeGr = dialog.add('group');
      sizeGr.orientation = 'row';
      sizeGr.add ('statictext', undefined, 'Required size, ' + getDocUnit() + ':');

  var sizeStr = sizeGr.add('edittext', undefined, DEF_SIZE);
      sizeStr.characters = 8;
      sizeStr.active = true;

  var bndsPnl = dialog.add('panel', undefined, 'Item dimensions bounds');
      bndsPnl.orientation = 'row';
      bndsPnl.alignChildren = 'left';
      bndsPnl.margins = DLG_MARGINS;
  var vbRadio = bndsPnl.add('radiobutton', undefined, 'V\u0332isible'); // Unicode V̲
      vbRadio.helpTip = 'Object\u0027s bounding box, \nincluding any stroke widths.' +
                        '\nCheck Preferences > General >\nUse Preview Bounds,' +
                        '\nView > Show bounding box';
  var gbRadio = bndsPnl.add('radiobutton', undefined, 'G\u0332eometric'); // Unicode G̲
      gbRadio.helpTip = 'Object\u0027s bounding box, excluding \nstroke width. ' +
                        'Uncheck Preferences > \nGeneral > Use Preview Bounds.';

  DEF_BNDS ? vbRadio.value = true : gbRadio.value = true; 

  var sides = dialog.add('group');
      sides.orientation = 'row';
      sides.alignChildren = 'left';
  var sidePnl = sides.add('panel', undefined, 'Scaling side');
      sidePnl.orientation = 'column';
      sidePnl.alignChildren = 'left';
      sidePnl.margins = DLG_MARGINS;
  var lRadio = sidePnl.add('radiobutton', undefined, 'L\u0332arger side'); // Unicode L̲
      lRadio.value = true;
  var wRadio = sidePnl.add('radiobutton', undefined, 'W\u0332idth'); // Unicode W̲
  var hRadio = sidePnl.add('radiobutton', undefined, 'H\u0332eight'); // Unicode H̲

  var refPointPnl = sides.add('panel', undefined, 'Reference point');
      refPointPnl.orientation = 'row';
      refPointPnl.bounds = [0, 0 , 116, 116];

  // Create Reference point matrix 3x3
  var idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(refPointPnl, j, i, refPointDef[idx], REF_POINT_HINT[idx]);
      idx++;
    };
  };
    
  var settings = dialog.add('panel', undefined, 'Additional scale');
      settings.orientation = 'row';
      settings.alignChildren = ['left','top']; 
      settings.margins = DLG_MARGINS;

  var gr1 = settings.add('group');
      gr1.orientation = 'column';
      gr1.alignChildren = ['left', 'center'];    
      gr1.margins = 0;
  var isUnif = gr1.add('checkbox', undefined, 'U\u0332niform'); // Unicode U̲
      isUnif.helpTip = 'Scale proportionally';
      isUnif.value = true;  
  if (isAiCC()) { // Illustrator CS6 not support Live Shape
    var isCorner = gr1.add('checkbox', undefined, 'C\u0332orners'); // Unicode C̲
        isCorner.helpTip = 'Only works with Live Shape';
        isCorner.value = (DEF_CORNER == 1) ? true : false;
  }
  var isStroke = gr1.add('checkbox', undefined, 'S\u0332trokes \u0026 Effects'); // Unicode S̲
      isStroke.value = DEF_STROKE;
  
  var gr2 = settings.add('group');
      gr2.orientation = 'column';
      gr2.alignChildren = ['left', 'center'];    
      gr2.margins = 0;       
  var isFillPatt = gr2.add('checkbox', undefined, 'F\u0332ill Pattern'); // Unicode F̲
      isFillPatt.value = DEF_PATT;
  var isStrokePatt = gr2.add('checkbox', undefined, 'Stroke Pat\u0332tern'); // Unicode t̲
      isStrokePatt.value = DEF_PATT;

  var hintAlt = dialog.add('statictext', undefined, 'Quick access with Alt + underlined key/digit');
      hintAlt.justify = 'center';
      hintAlt.enabled = false;  
    
  var buttons = dialog.add('group');
      buttons.alignChildren = ['fill', 'fill'];
  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  var isPreview = dialog.add('checkbox', undefined, 'P\u0332review'); // Unicode P̲
      isPreview.value = false;
  
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, github.com/creold');
  copyright.justify = 'center';
  copyright.enabled = false;

  // Begin access key shortcut
  sizeStr.addEventListener('keydown', function(kd) {
    if (kd.altKey) { kd.preventDefault(); };
  });

  dialog.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      var key = kd.keyName;
      if (key.match(/[1-9]/)) {
        refPointArr[key * 1 - 1].notify();
      };
      if (key.match(/V/)) vbRadio.notify();
      if (key.match(/G/)) gbRadio.notify();
      if (key.match(/L/)) lRadio.notify();
      if (key.match(/W/)) wRadio.notify();
      if (key.match(/H/)) hRadio.notify();
      if (key.match(/U/)) isUnif.notify();
      if (key.match(/C/) && isAiCC()) isCorner.notify();
      if (key.match(/F/)) isFillPatt.notify();
      if (key.match(/T/)) isStrokePatt.notify();
      if (key.match(/S/)) isStroke.notify();
      if (key.match(/P/)) isPreview.notify();
    };
  });
  // End access key shortcut
  
  // Begin event listener for isPreview
  if (isPreview.value) previewStart();
  sizeStr.onChanging = previewStart;
  isPreview.onClick = previewStart;
  // Select bounds radio
  for (var i = 0; i < bndsPnl.children.length; i++) {
    bndsPnl.children[i].onClick = previewStart;
  }  
  // Select reference point radio
  for (var j = 0; j < refPointArr.length; j++) {
    refPointArr[j].onClick = previewStart;
  }
  // Select scaling side radio
  for (var k = 0; k < sidePnl.children.length; k++) {
    sidePnl.children[k].onClick = previewStart;
  }
  // Select settings radio
  for (var i = 0; i < settings.children.length; i++) {
    var settingsCol = settings.children[i];
    for (var j = 0; j < settingsCol.children.length; j++) {
      settingsCol.children[j].onClick = previewStart;
    }
  }
  // End event listener for isPreview
  
  ok.onClick = okClick;

  function previewStart() {
    try {
      if (isPreview.value) {
        if (isUndo) { 
          app.undo();
        } else {
          isUndo = true;
        }
        start();
        app.redraw();
      } else if (isUndo) {
          app.undo();
          app.redraw();
          isUndo = false;
        } 
    } catch (e) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    dialog.close();
  }

  function start() {
    var _size = convertToNum(sizeStr.text, DEF_SIZE);
    if (_size == 0) _size = sizeStr.text = DEF_SIZE;
   
    // Input size limit
    var pxSize = convertUnits(_size + getDocUnit(), 'px');
    if (pxSize > MAX_SIZE) {
      pxSize = MAX_SIZE;
      sizeStr.text = convertUnits(MAX_SIZE + 'px', getDocUnit());
    }

    // Set transformation side key
    for (var i = 0; i < sidePnl.children.length; i++) {
      if (sidePnl.children[i].value) scaleSide = sidePnl.children[i].text.slice(0, 1);
    }

    // Set scaleAbout value
    for (var j = 0; j < refPointPnl.children.length; j++) {
      if (refPointPnl.children[j].value == true) {
        refPointVal = (REF_POINT_HINT[j]).replace(/\s+/g, '').toUpperCase();
      }
    }
    
    if (isAiCC()) {
      var _isCorner = isCorner.value ? 1 : 2;
      app.preferences.setIntegerPreference('policyForPreservingCorners', _isCorner);
    }

    // Ignore the change if the new size is the same
    isUndo = false;
    for (var j = 0, len = docSel.length; j < len; j++) {
      var currItem = docSel[j];
      if (getSize(currItem, scaleSide, vbRadio.value).val.toFixed(4) !== pxSize.toFixed(4)) {
        isUndo = true;
        break;
      };
    }

    for (var i = 0, len = docSel.length; i < len; i++) {
      var currItem = docSel[i],
          isWidth = getSize(currItem, scaleSide, vbRadio.value).check,
          breakCount = 0;
      while (getSize(currItem, scaleSide, vbRadio.value).val.toFixed(4) !== pxSize.toFixed(4)) {
        breakCount++;
        scaleX = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUnif.value).x;
        scaleY = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUnif.value).y;
        scaleRatio = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUnif.value).r;
        currItem.resize(
          scaleX, // x
          scaleY, // y
          true, // changePositions  
          isFillPatt.value, // changeFillPatterns
          true, // changeFillGradients
          isStrokePatt.value, // changeStrokePattern
          isStroke.value ? scaleRatio : 100, // changeLineWidths
          Transformation[refPointVal] // scaleAbout
          );
        if (breakCount == DEF_BREAK) break; // Fix infinity looping
      }
    }
  }
  
  cancel.onClick = function () {
    dialog.close();
  }

  dialog.onClose = function () {
    if (isUndo) {
      app.undo();
      app.redraw();
      isUndo = false;
    }
    // Restore app preferences
    app.preferences.setIntegerPreference('policyForPreservingCorners', DEF_CORNER);
    return true;
  }
  
  dialog.center();
  dialog.show();
}

// Generate radiobuttons 
function addRadio(place, x, y, val, info) {
  var rb = place.add('radiobutton', undefined, x),
      step = 30,
      x0 = y0 = 20,
      d = 14; // padding
  x = x0 + step * x;
  y = y0 + step * y;
  rb.bounds = [x, y, x + d, y + d];
  rb.value = val;
  rb.helpTip = info;
  return rb;
};

// Get scale ratio
function getRatio(item, side, size, isW, isBnds, isUnif){
  var scaleX = scaleY = 0,
      ratio = 100 / (getSize(item, side, isBnds).val / size);
  if (!isUnif) {
    switch (side) {
      case 'L':
        if (isW) {
          scaleX = ratio = 100 / (getSize(item, 'W', isBnds).val / size);
          scaleY = 100;
        } else {
          scaleX = 100;
          scaleY = ratio = 100 / (getSize(item, 'H', isBnds).val / size);
        }
        break;
      case 'W':
        scaleX = ratio;
        scaleY = 100;
        break;
      case 'H':
        scaleX = 100;
        scaleY = ratio;
        break;
    }
  } else {
    scaleX = scaleY = ratio;
  }
  return { 'x': scaleX, 'y': scaleY, 'r': ratio };
}

// Get current item size
function getSize(item, side, isBnds) {
  var itemB = itemBW = itemBH = 0,
      check = true, // width > heigth
      currSize; 
  
    if (item.typename === 'GroupItem' && item.clipped) {
      try {
        for (var i = 0, iLen = item.pageItems.length; i < iLen; i++) {
          var clipItem = item.pageItems[i];
          if (clipItem.clipping || (clipItem.typename === 'CompoundPathItem' && 
              clipItem.pathItems[0].clipping)) {
            itemB = isBnds ? clipItem.visibleBounds : clipItem.geometricBounds;
          }
        }
        if (itemB == 0) itemB = isBnds ? item.visibleBounds : item.geometricBounds;
      } catch (e) {}
    } else {
      itemB = isBnds ? item.visibleBounds : item.geometricBounds;
    }

  itemBW = itemB[2] - itemB[0]; // width
  itemBH = itemB[1] - itemB[3]; // heigth
  if (itemBH >= itemBW) check = false;

  switch (side) {
    case 'L':
      currSize = itemBH > itemBW ? itemBH : itemBW;
      break;
    case 'W':
      currSize = itemBW;
      break;
    case 'H':
      currSize = itemBH;
      break;
  }
  return { 'val': currSize, 'check': check };
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

function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

function createAction(str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

function ascii2Hex(hex) {
  return hex.replace(/./g, function(a) {
    return a.charCodeAt(0).toString(16)
  });
}

// Check Adobe Illustrator version
function isAiCC() {
  if (parseInt(app.version) <= 16) { return false; }
  return true;
}

function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

// Run script
try {
  main();
} catch (e) {
  // showError(e);
}