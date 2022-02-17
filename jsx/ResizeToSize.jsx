/*
  ResizeToSize.jsx for Adobe Illustrator
  Description: Scales each selected objects to a given value
  Date: March, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added menu for side selection
  0.3 Added additional settings
  0.4 Correct resize Clipping Mask. Added access key shortcuts
  0.5 Added dimensions bounds
  0.6 Added live preview (Shift+P)
  0.7 Fixed live preview bug. Minor improvements
  0.7.1 Code refactoring

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main () {
  var SCRIPT = {
        name: 'ResizeToSize',
        version: 'v.0.7.1'
      },
      CFG = {
        size: 100, // Default size value
        maxSize: 16383,
        isIncludeStroke: app.preferences.getBooleanPreference('includeStrokeInBounds'),
        isScaleCorner: app.preferences.getIntegerPreference('policyForPreservingCorners'),
        isScaleStroke: app.preferences.getBooleanPreference('scaleLineWeight'),
        isScalePattern: app.preferences.getBooleanPreference('transformPatterns'),
        refActive: app.preferences.getIntegerPreference('plugin/Transform/AnchorPoint'),
        refPointsHint: ['Top Left', 'Top', 'Top Right',
                        'Left', 'Center', 'Right',
                        'Bottom Left', 'Bottom', 'Bottom Right'
                      ],
        uiMargins: [10, 20, 10, 10]
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  var doc = activeDocument,
      docSel = selection,
      refPointArr = new Array(9), // Reference point array
      refPointVal = '', // Reference point name
      scaleRatio = scaleX = scaleY = 0, // Scale factor
      isUndo = false;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';

  var sizeGrp = dialog.add('group');
      sizeGrp.orientation = 'row';
      sizeGrp.add('statictext', undefined, 'Required size, ' + getDocUnit() + ':');

  var sizeInp = sizeGrp.add('edittext', [0, 0, 140, 25], CFG.size);
      sizeInp.active = true;

  var bndsPnl = dialog.add('panel', undefined, 'Item dimensions');
      bndsPnl.orientation = 'row';
      bndsPnl.margins = CFG.uiMargins;

  var vbRadio = bndsPnl.add('radiobutton', undefined, 'V\u0332isible bounds'); // Unicode V̲
      vbRadio.helpTip = 'Object\u0027s bounding box, \nincluding any stroke widths.' +
                        '\nCheck Preferences > General >\nUse Preview Bounds,' +
                        '\nView > Show bounding box';
  var gbRadio = bndsPnl.add('radiobutton', undefined, 'G\u0332eometric bounds'); // Unicode G̲
      gbRadio.helpTip = 'Object\u0027s bounding box, excluding \nstroke width. ' +
                        'Uncheck Preferences > \nGeneral > Use Preview Bounds.';

  CFG.isIncludeStroke ? vbRadio.value = true : gbRadio.value = true;

  var sidesGrp = dialog.add('group');
      sidesGrp.spacing = 38;

  var sidePnl = sidesGrp.add('panel', undefined, 'Scaling side');
      sidePnl.alignChildren = 'left';
      sidePnl.margins = CFG.uiMargins;

  var lRadio = sidePnl.add('radiobutton', undefined, 'L\u0332arger side'); // Unicode L̲
      lRadio.value = true;
  var wRadio = sidePnl.add('radiobutton', undefined, 'W\u0332idth'); // Unicode W̲
  var hRadio = sidePnl.add('radiobutton', undefined, 'H\u0332eight'); // Unicode H̲

  var refPointPnl = sidesGrp.add('panel', undefined, 'Reference point');
      refPointPnl.orientation = 'row';
      refPointPnl.bounds = [0, 0 , 116, 116];

  // Create Reference point matrix 3x3
  var idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(refPointPnl, j, i, CFG.refPointsHint[idx]);
      idx++;
    };
  };
  refPointArr[CFG.refActive].value = true; // Get value from Transform panel

  var prefs = dialog.add('panel', undefined, 'Additional scale');
      prefs.orientation = 'row';
      prefs.alignChildren = ['left', 'top'];
      prefs.margins = CFG.uiMargins;
      prefs.spacing = 20;

  var prefsColOne = prefs.add('group');
      prefsColOne.orientation = 'column';
      prefsColOne.alignChildren = ['left', 'center'];

  var isUniform = prefsColOne.add('checkbox', undefined, 'U\u0332niform'); // Unicode U̲
      isUniform.helpTip = 'Scale proportionally';
      isUniform.value = true;
  if (isAiCC()) { // Illustrator CS6 not support Live Shape
    var isCorner = prefsColOne.add('checkbox', undefined, 'C\u0332orners'); // Unicode C̲
        isCorner.helpTip = 'Only works with Live Shape';
        isCorner.value = (CFG.isScaleCorner == 1) ? true : false;
  }
  var isStroke = prefsColOne.add('checkbox', undefined, 'S\u0332trokes \u0026 Effects'); // Unicode S̲
      isStroke.value = CFG.isScaleStroke;

  var prefsColTwo = prefs.add('group');
      prefsColTwo.orientation = 'column';
      prefsColTwo.alignChildren = ['left', 'center'];

  var isFillPatt = prefsColTwo.add('checkbox', undefined, 'F\u0332ill Pattern'); // Unicode F̲
      isFillPatt.value = CFG.isScalePattern;
  var isStrokePatt = prefsColTwo.add('checkbox', undefined, 'Stroke Pat\u0332tern'); // Unicode t̲
      isStrokePatt.value = CFG.isScalePattern;

  var hintAlt = dialog.add('statictext', undefined, 'Quick access with Alt + underlined key/digit');
      hintAlt.justify = 'center';
      hintAlt.enabled = false;

  var buttons = dialog.add('group');
      buttons.alignChildren = ['fill', 'fill'];

  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  var isPreview = dialog.add('checkbox', undefined, 'P\u0332review'); // Unicode P̲
      isPreview.value = false;

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Begin access key shortcut
  sizeInp.addEventListener('keydown', function(kd) {
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
      if (key.match(/U/)) isUniform.notify();
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
  sizeInp.onChanging = previewStart;
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

  // Select prefs radio
  for (var i = 0; i < prefs.children.length; i++) {
    var settingsCol = prefs.children[i];
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
          undo();
        } else {
          isUndo = true;
        }
        start();
        redraw();
      } else if (isUndo) {
          undo();
          redraw();
          isUndo = false;
        }
    } catch (e) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) undo();
    start();
    isUndo = false;
    dialog.close();
  }

  function start() {
    var _size = convertToNum(sizeInp.text, CFG.size),
        scaleSide = '';

    if (_size == 0) _size = sizeInp.text = CFG.size;

    // Input size limit
    var pxSize = convertUnits(_size + getDocUnit(), 'px');
    if (pxSize > CFG.maxSize) {
      pxSize = CFG.maxSize;
      sizeInp.text = convertUnits(CFG.maxSize + 'px', getDocUnit());
    }

    // Set transformation side key
    for (var i = 0; i < sidePnl.children.length; i++) {
      if (sidePnl.children[i].value) {
        scaleSide = sidePnl.children[i].text.slice(0, 1);
        break;
      }
    }

    // Set scaleAbout value
    for (var j = 0; j < refPointPnl.children.length; j++) {
      if (refPointPnl.children[j].value) {
        refPointVal = (CFG.refPointsHint[j]).replace(/\s+/g, '').toUpperCase();
        break;
      }
    }

    if (isAiCC()) {
      app.preferences.setIntegerPreference('policyForPreservingCorners', isCorner.value ? 1 : 2);
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
          breakCounter = 0;
      while (getSize(currItem, scaleSide, vbRadio.value).val.toFixed(4) !== pxSize.toFixed(4)) {
        breakCounter++;
        scaleX = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUniform.value).x;
        scaleY = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUniform.value).y;
        scaleRatio = getRatio(currItem, scaleSide, pxSize, isWidth, vbRadio.value, isUniform.value).r;
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
        if (breakCounter == 20) break; // Fix infinity looping
      }
    }
  }

  cancel.onClick = dialog.close;

  dialog.onClose = function () {
    if (isUndo) {
      undo();
      redraw();
      isUndo = false;
    }
    // Restore app preferences
    app.preferences.setIntegerPreference('policyForPreservingCorners', CFG.isScaleCorner);
    return true;
  }

  dialog.center();
  dialog.show();
}

// Generate radiobuttons
function addRadio(place, x, y, info) {
  var rb = place.add('radiobutton', undefined, x),
      step = 30,
      x0 = y0 = 20,
      d = 14; // padding

  x = x0 + step * x;
  y = y0 + step * y;
  rb.bounds = [x, y, x + d, y + d];
  rb.helpTip = info;

  return rb;
}

// Get scale ratio
function getRatio(item, side, size, isW, isBnds, isUniform){
  var scaleX = scaleY = 0,
      ratio = 100 / (getSize(item, side, isBnds).val / size);

  if (!isUniform) {
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
  } else if ((unit === 'cm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
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

// Convert any input data to a number
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Check Adobe Illustrator version
function isAiCC() {
  if (parseInt(app.version) <= 16) { 
    return false;
  }
  return true;
}

// Open link in browser
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}