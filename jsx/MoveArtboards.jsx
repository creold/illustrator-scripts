/*
  MoveArtboards.jsx for Adobe Illustrator
  Description: Script for moving artboards range with artwork along the X and Y axis
  Requirements: Adobe Illustrator CS6 and later
  Date: October, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Minor improvements

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
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Move Artboards',
        version: 'v.0.1.1'
      },
      CFG = {
        aiVers: parseInt(app.version),
        tmpLyr: 'ARTBOARD_NUMBERS',
        abs: '1, 2-4',
        allAbs: '%all',
        shift: 100,
        lKey: '%isLocked',
        hKey: '%isHidden',
        limit: 2500, // The amount of objects, when the script can run slowly
        cnvs: 16383, // Illustrator canvas max size, px
        uiMargins: [10, 15, 10, 10],
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errVers: { en: 'Error\nSorry, script only works in Illustrator CS6 and later',
                  ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше' },
        errOverCnvs: { en: 'Error\nMoved artboards go beyond canvas\nbounds from the ',
                      ru: 'Ошибка\nПеремещаемые артборды выходят за пределы\nхолста Иллюстратора с ' },
        errOverSide: { en: 'side.', ru: 'стороны.' },
        errOverL: { en: 'LEFT, ', ru: 'ЛЕВОЙ, ' },
        errOverR: { en: 'RIGHT, ', ru: 'ПРАВОЙ, ' },
        errOverT: { en: 'TOP, ', ru: 'ВЕРХНЕЙ, ' },
        errOverB: { en: 'BOTTOM, ', ru: 'НИЖНЕЙ, ' },
        errOverTip: { en: '\n\nTry smaller distance or different range',
                      ru: '\n\nПопробуйте меньший сдвиг или другой диапазон' },
        warning: { en: 'The document has over ' + CFG.limit + ' objects. The script can run slowly',
                    ru: 'В документе свыше ' + CFG.limit + ' объектов. Скрипт может работать медленно' },
        range: { en: 'Artboards range', ru: 'Номера артбордов' },
        placeholder: { en: 'all artboards', ru: 'все артборды' },
        shift: { en: 'Shift', ru: 'Смещение' },
        axisX: { en: 'X axis', ru: 'Ось X' },
        axisY: { en: 'Y axis', ru: 'Ось Y' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (CFG.aiVers < 16) {
    alert(LANG.errVers);
    return;
  }

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  var doc = activeDocument,
      currBoardIdx = doc.artboards.getActiveArtboardIndex();

  // INTERFACE
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill','center'];
      dialog.opacity = CFG.uiOpacity;

  // Value fields
  var abPanel = dialog.add('panel', undefined, LANG.range);
      abPanel.orientation = 'column';
      abPanel.alignChildren = ['fill','center'];
      abPanel.margins = CFG.uiMargins;
  var abInput = abPanel.add('edittext', undefined, CFG.abs);
  var abDescr = abPanel.add('statictext', undefined, CFG.allAbs + ' - ' + LANG.placeholder);
      abDescr.justify = 'left';

  var shiftPanel = dialog.add('panel', undefined, LANG.shift + ', ' + getDocUnit());
      shiftPanel.orientation = 'column';
      shiftPanel.alignChildren = ['left','center'];
      shiftPanel.margins = CFG.uiMargins;

  var direction = shiftPanel.add('group');
      direction.orientation = 'row';

  var titleX = direction.add('statictext', undefined, LANG.axisX);
  var inputX = direction.add('edittext', [0, 0, 50, 30], CFG.shift);

  var titleY = direction.add('statictext', undefined, LANG.axisY);
  var inputY = direction.add('edittext', [0, 0, 50, 30], CFG.shift);

  if (doc.pageItems.length > CFG.limit) {
    var warning = dialog.add('statictext', undefined, LANG.warning, { multiline: true });
  }

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];
  var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  loadSettings();

  // Event listeners
  inputX.onChange = inputY.onChange = function () {
    this.text = convertToNum(this.text, CFG.shift);
  }

  shiftInputNumValue(inputX);
  shiftInputNumValue(inputY);

  abDescr.addEventListener('mousedown', function () {
    inputX.active = true;
    dialog.update();
    abInput.text = CFG.allAbs;
  });

  dialog.onClose = function () {
    // Remove temp layer with artboards numbers
    try {
      var layerToRm = doc.layers.getByName(CFG.tmpLyr);
      layerToRm.remove();
    } catch (e) {}
  }

  drawAbsNumbers(CFG.tmpLyr);
  redraw();

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  function okClick() {
    var tmpRange = abInput.text,
        absRange = [], // Range of artboards indexes
        extremeCoord = [], // Range of min & max artboards coordinates
        shiftX = convertUnits((inputX.text * 1) + getDocUnit(), 'px'), // Convert value to document units
        shiftY = convertUnits((inputY.text * 1) + getDocUnit(), 'px'); // Convert value to document units

    // Prepare
    tmpRange = tmpRange.replace(/\s/g, ''); // Remove whitespaces
    tmpRange = tmpRange.split(','); // Split string to array
    absRange = getArtboardsRange(tmpRange, CFG.allAbs);

    saveItemsState(CFG.lKey, CFG.hKey); // Save information about locked & hidden pageItems

    // Check coordinates limit before moving
    extremeCoord = collectExtremeCoordinates(absRange, CFG.cnvs);
    var overCnvsSize = isOverCnvsBounds(extremeCoord, shiftX, shiftY, CFG.cnvs, LANG);
    if (overCnvsSize.val) {
      alert(overCnvsSize.msg);
      return;
    }

    var abItems = collectArtboardItems(absRange);

    for (var i = 0, rLen = absRange.length; i < rLen; i++) {
      var idx = absRange[i];
      try {
        moveArtboard(doc.artboards[idx], abItems[i][0], shiftX, shiftY);
      } catch (e) {}
    }

    // Restore locked & hidden pageItems
    selection = null;
    restoreItemsState(CFG.lKey, CFG.hKey);

    doc.artboards.setActiveArtboardIndex(currBoardIdx);

    saveSettings();
    dialog.close();
  }

  dialog.center();
  dialog.show();

  // Use Up / Down arrow keys (+ Shift) for change value
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
      }
    });
  }

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.range = abInput.text;
    pref.x = inputX.text;
    pref.y = inputY.text;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

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
          abInput.text = pref.range;
          inputX.text = pref.x;
          inputY.text = pref.y;
        }
      } catch (e) {}
    }
  }
}

// Numbering of artboards for the user
function drawAbsNumbers(layer) {
  var doc = activeDocument,
      tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(layer);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = layer;
  }

  for (var i = 0, absLen = doc.artboards.length; i < absLen; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i],
        abWidth = currAb.artboardRect[2] - currAb.artboardRect[0],
        abHeight = currAb.artboardRect[1] - currAb.artboardRect[3],
        label = doc.textFrames.add(),
        labelSize = (abWidth >= abHeight) ? abHeight : abWidth;
    label.contents = i + 1;
    label.textRange.characterAttributes.size = labelSize / 2;
    label.position = [
      currAb.artboardRect[0],
      currAb.artboardRect[1]
    ];
    label.move(tmpLayer, ElementPlacement.PLACEATBEGINNING);
  }
}

function collectArtboardItems(absRange) {
  var doc = app.activeDocument;
  var obj = [];
  for (var i = 0, rLen = absRange.length; i < rLen; i++) {
    idx = absRange[i];
    doc.artboards.setActiveArtboardIndex(idx);
    doc.selectObjectsOnActiveArtboard();
    obj[i] = [];
    obj[i].push(selection);
    selection = null;
  }
  return obj;
}

// Get min & max coordinate of artboards range
function collectExtremeCoordinates(absRange, max) {
  var doc = activeDocument,
      idx = 0,
      minLeft = max,
      maxTop = max,
      maxRight = 0,
      minBottom = 0;

  // Trick with temp pathItem to get the absolute coordinate of the artboard. Thanks to @moodyallen
  var fakePath = doc.pathItems.add(),
      cnvsDelta = 1 + ((fakePath.position[0] * 2 - 16384) - (fakePath.position[1] * 2 + 16384)) / 2,
      cnvsTempPath = doc.pathItems.rectangle(fakePath.position[0] - cnvsDelta, fakePath.position[1] + cnvsDelta, 300, 300);
  cnvsTempPath.filled = false;
  cnvsTempPath.stroked  = false;

  fakePath.remove();

  // Get coordinates for each artboard in the range
  for (var i = 0, rLen = absRange.length; i < rLen; i++) {
    idx = absRange[i];
    var thisAbRect = doc.artboards[idx].artboardRect;

    // Create a rectangle with the same size as the artboard
    var top = thisAbRect[1],
        left = thisAbRect[0],
        width = thisAbRect[2] - thisAbRect[0],
        height = thisAbRect[1] - thisAbRect[3];
    var abTempPath = doc.pathItems.rectangle(top, left, width, height);
    abTempPath.stroked  = false;
    abTempPath.filled =  false;

    // Use the X, Y coordinates of cnvsTempPath and abTempPath to get the absolute coordinate
    var absLeft = Math.floor(abTempPath.position[0] - cnvsTempPath.position[0]),
        absTop = Math.floor(cnvsTempPath.position[1] - abTempPath.position[1]),
        absBottom = absTop + height,
        absRight = absLeft + width;

    if (absLeft < minLeft) minLeft = absLeft;
    if (absTop < maxTop) maxTop = absTop;
    if (absRight > maxRight) maxRight = absRight;
    if (absBottom > minBottom) minBottom = absBottom;

    abTempPath.remove();
  }
  cnvsTempPath.remove();

  return [minLeft, maxTop, maxRight, minBottom];
}

// Check coordinates limit before moving
function isOverCnvsBounds(coord, shiftX, shiftY, max, LANG) {
  var isOverCnvs = false;
  var msg = LANG.errOverCnvs;
  if (coord[0] + shiftX < 0) {
    isOverCnvs = true;
    msg += LANG.errOverL;
  }
  if (coord[1] - shiftY < 0 ) {
    isOverCnvs = true;
    msg += LANG.errOverT;
  }
  if (coord[2] + shiftX > max) {
    isOverCnvs = true;
    msg += LANG.errOverR;
  }
  if (coord[3] - shiftY > max) {
    isOverCnvs = true;
    msg += LANG.errOverB;
  }

  msg += LANG.errOverSide;
  var idx = msg.lastIndexOf(',');
  msg = msg.substring(0, idx) + msg.substring(idx + 1);
  msg += LANG.errOverTip;

  return { val: isOverCnvs, msg: msg };
}

// Moving the artboard
function moveArtboard(ab, items, shiftX, shiftY) {
  var doc = activeDocument,
      docCoordSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
      abCoordSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
      isDocCoords = (app.coordinateSystem == docCoordSystem),
      thisAbRect = ab.artboardRect;

  // Move current artboard
  ab.artboardRect = [
    thisAbRect[0] + shiftX,
    thisAbRect[1] + shiftY,
    thisAbRect[2] + shiftX,
    thisAbRect[3] + shiftY
  ];

  // Move objects from array
  for (var i = 0, iLen = items.length; i < iLen; i++) {
    var pos = isDocCoords ? items[i].position : doc.convertCoordinate(items[i].position, docCoordSystem, abCoordSystem);
    items[i].position = [pos[0] + shiftX, pos[1] + shiftY];
  }
}

// Convert any input data to a number
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  // Remove duplicate Minus
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Save information about locked & hidden pageItems
function saveItemsState(lKey, hKey) {
  for (var i = 0, piLen = activeDocument.pageItems.length; i < piLen; i++) {
    var currItem = activeDocument.pageItems[i];
    var regexp = new RegExp(lKey + '|' + hKey, 'gi');
    currItem.note = currItem.note.replace(regexp, '');
    if (currItem.locked) {
      currItem.locked = false;
      currItem.note += lKey;
    }
    if (currItem.hidden) {
      currItem.hidden = false;
      currItem.note += hKey;
    }
  }
  redraw();
}

// Restoring locked & hidden pageItems
function restoreItemsState(lKey, hKey) {
  var regexp = new RegExp(lKey + '|' + hKey, 'gi');
  for (var i = 0, piLen = activeDocument.pageItems.length; i < piLen; i++) {
    var currItem = activeDocument.pageItems[i];
    if (currItem.note.match(lKey) != null) {
      currItem.note = currItem.note.replace(regexp, '');
      currItem.locked = true;
    }
    if (currItem.note.match(hKey) != null) {
      currItem.note = currItem.note.replace(regexp, '');
      currItem.hidden = true;
    }
  }
}

// Get document artboards from user input
function getArtboardsRange(arr, placeholder) {
  var parsedStr = [];

  forEach(arr, function (e) {
    if (e.match(placeholder) != null) {
      for (var i = 0, absLen = activeDocument.artboards.length; i <= absLen; i++) {
        parsedStr.push(i);
      }
      return;
    };
    if (e.match('-') == null) {
      parsedStr.push(e * 1);
      return;
    };
    var extremeVal = e.split('-'); // Min & max value in range
    for (var j = (extremeVal[0] * 1); j <= extremeVal[1]; j++) {
      parsedStr.push(j);
    }
  });
  // if (isNaN(parsedStr));
  return intersect(activeDocument.artboards, parsedStr);
}

// Calls a provided callback function once for each element in an array
function forEach(collection, fn) {
	for (var i = 0, cLen = collection.length; i < cLen; i++) {
		fn(collection[i]);
	}
}

// Search for common elements in arrays
function intersect(arr1, arr2) {
  var tmp = [];
  for (var i = 0, arrLen = arr1.length; i < arrLen; i++) {
    if (arr2.indexOf(i + 1) !== -1) tmp.push(i);
  }
  return tmp;
}

// Polyfill indexOf() for Array
Array.prototype.indexOf = function (item) {
  for (var i = 0, len = this.length; i < len; i++ ) {
    if ( this[i] === item ) return i;
  }
  return -1;
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

// Open link in browser
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