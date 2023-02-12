/*
  MoveArtboards.jsx for Adobe Illustrator
  Description: Script for moving artboards range with artwork along the X and Y axis
  Requirements: Adobe Illustrator CS6 and later
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Minor improvements
  0.2 Added more units (yards, meters, etc.) support if the document is saved
  0.2.1 Added custom RGB color (idxColor) for artboard indexes
  0.2.2 Fixed input activation in Windows OS
  0.2.3 Added size correction in large canvas mode
  0.2.4 Added new units API for CC 2023 v27.1.1

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2023 (Mac), CS6, 2023 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Move Artboards',
        version: 'v.0.2.4'
      },
      CFG = {
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        units: getUnits(), // Active document units
        tmpLyr: 'ARTBOARD_INDEX',
        idxColor: [255, 0, 0], // Artboard index color
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
        errDoc: { en: 'No documents\nOpen a document and try again',
                  ru: 'Нет документов\nОткройте документ и запустите скрипт' },
        errVers: { en: 'Wrong app version\nSorry, script only works in Illustrator CS6 and later',
                  ru: 'Не подходит версия АИ\nСкрипт работает в Illustrator CS6 и выше' },
        errOverCnvs: { en: 'Canvas limit\nMoved artboards go beyond canvas\nbounds from the ',
                      ru: 'Ограничения холста\nПеремещаемые артборды выходят за пределы\nхолста Иллюстратора с ' },
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
        artwork: { en: 'Move artwork with artboard', ru: 'Переместить объекты с артбордом' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (CFG.aiVers < 16) {
    alert(LANG.errVers, 'Script error');
    return;
  }

  if (!documents.length) {
    alert(LANG.errDoc, 'Script error');
    return;
  }

  var doc = activeDocument,
      curBoardIdx = doc.artboards.getActiveArtboardIndex();

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;
  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // INTERFACE
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill','center'];
      win.opacity = CFG.uiOpacity;

  // Value fields
  var abPnl = win.add('panel', undefined, LANG.range);
      abPnl.orientation = 'column';
      abPnl.alignChildren = ['fill','center'];
      abPnl.margins = CFG.uiMargins;
  var abInp = abPnl.add('edittext', undefined, CFG.abs);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    abInp.active = true;
  }
  var abDescr = abPnl.add('statictext', undefined, CFG.allAbs + ' - ' + LANG.placeholder);
      abDescr.justify = 'left';

  var shiftPanel = win.add('panel', undefined, LANG.shift + ', ' + CFG.units);
      shiftPanel.orientation = 'column';
      shiftPanel.alignChildren = ['left','center'];
      shiftPanel.margins = CFG.uiMargins;

  var dir = shiftPanel.add('group');
      dir.orientation = 'row';

  var titleX = dir.add('statictext', undefined, LANG.axisX);
  var inputX = dir.add('edittext', [0, 0, 50, 30], CFG.shift);

  var titleY = dir.add('statictext', undefined, LANG.axisY);
  var inputY = dir.add('edittext', [0, 0, 50, 30], CFG.shift);

  var isMoveArt = win.add('checkbox', undefined, LANG.artwork);

  if (doc.pageItems.length > CFG.limit) {
    var warning = win.add('statictext', undefined, LANG.warning, { multiline: true });
  }

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];
  var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  loadSettings();

  // Event listeners
  inputX.onChange = inputY.onChange = function () {
    this.text = strToNum(this.text, CFG.shift);
  }

  shiftInputNumValue(inputX);
  shiftInputNumValue(inputY);

  abDescr.addEventListener('mousedown', function () {
    inputX.active = true;
    abInp.text = CFG.allAbs;
    abInp.active = true;
    abInp.textselection = abInp.text;
  });

  win.onShow = function () {
    showAbIndex(CFG.tmpLyr, CFG.idxColor);
  }

  win.onClose = function () {
    removeAbIndex(CFG.tmpLyr);
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    var tmpRange = abInp.text,
        absRange = [], // Range of artboards indexes
        extremeCoord = [], // Range of min & max artboards coordinates
        shiftX = convertUnits(inputX.text * 1, CFG.units, 'px') / CFG.sf,
        shiftY = convertUnits(inputY.text * 1, CFG.units, 'px') / CFG.sf;

    // Prepare
    tmpRange = tmpRange.replace(/\s/g, ''); // Remove whitespaces
    tmpRange = tmpRange.split(','); // Split string to array
    absRange = getArtboardsRange(tmpRange, CFG.allAbs);

    if (isMoveArt.value) saveItemsState(CFG.lKey, CFG.hKey); // Save information about locked & hidden pageItems

    // Check coordinates limit before moving
    extremeCoord = collectExtremeCoordinates(absRange, CFG.cnvs);
    var overCnvsSize = isOverCnvsBounds(extremeCoord, shiftX, shiftY, CFG.cnvs, LANG);
    if (overCnvsSize.val) {
      alert(overCnvsSize.msg, 'Script error');
      return;
    }

    var abItems = [];
    if (isMoveArt.value) abItems = collectArtboardItems(absRange);

    for (var i = 0, len = absRange.length; i < len; i++) {
      var idx = absRange[i];
      try {
        moveArtboard(doc.artboards[idx], shiftX, shiftY);
        if (isMoveArt.value) moveArt(doc, abItems[i][0], shiftX, shiftY);
      } catch (e) {}
    }

    // Restore locked & hidden pageItems
    if (isMoveArt.value) {
      selection = null;
      restoreItemsState(CFG.lKey, CFG.hKey);
      doc.artboards.setActiveArtboardIndex(curBoardIdx);
    }

    saveSettings();
    win.close();
  }

  win.center();
  win.show();

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
    pref.range = abInp.text;
    pref.x = inputX.text;
    pref.y = inputY.text;
    pref.art = isMoveArt.value;
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
          abInp.text = pref.range;
          inputX.text = pref.x;
          inputY.text = pref.y;
          isMoveArt.value = pref.art;
        }
      } catch (e) {}
    }
  }
}

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center.
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

// Output artboard indexes as text
function showAbIndex(layer, color) {
  if (arguments.length == 1 || color == undefined) color = [0, 0, 0];

  var doc = activeDocument,
      idxColor = setRGBColor(color),
      tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(layer);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = layer;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var curAb = doc.artboards[i],
        abWidth = curAb.artboardRect[2] - curAb.artboardRect[0],
        abHeight = curAb.artboardRect[1] - curAb.artboardRect[3],
        label = tmpLayer.textFrames.add(),
        labelSize = (abWidth >= abHeight) ? abHeight / 2 : abWidth / 2;
    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = idxColor;
    label.position = [curAb.artboardRect[0], curAb.artboardRect[1]];
  }

  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('preview');
    app.executeMenuCommand('preview');
  } else {
    redraw();
  }
}

// Generate solid RGB color
function setRGBColor(rgb) {
  var c = new RGBColor();
  c.red = rgb[0];
  c.green = rgb[1];
  c.blue = rgb[2];
  return c;
}

// Remove temp layer with artboard indexes
function removeAbIndex(layer) {
  try {
    var layerToRm = activeDocument.layers.getByName(layer);
    layerToRm.remove();
  } catch (e) {}
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

// Move artboard
function moveArtboard(ab, shiftX, shiftY) {
  var abRect = ab.artboardRect;
  // Move current artboard
  ab.artboardRect = [
    abRect[0] + shiftX,
    abRect[1] + shiftY,
    abRect[2] + shiftX,
    abRect[3] + shiftY
  ];
}

// Move artwork
function moveArt(doc, items, shiftX, shiftY) {
  var docCoordSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
      abCoordSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
      isDocCoords = (app.coordinateSystem == docCoordSystem);
  // Move objects from array
  for (var i = 0, len = items.length; i < len; i++) {
    var pos = isDocCoords ? items[i].position : doc.convertCoordinate(items[i].position, docCoordSystem, abCoordSystem);
    items[i].position = [pos[0] + shiftX, pos[1] + shiftY];
  }
}

// Convert string to number
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

// Save information about locked & hidden pageItems
function saveItemsState(lKey, hKey) {
  for (var i = 0, piLen = activeDocument.pageItems.length; i < piLen; i++) {
    var curItem = activeDocument.pageItems[i];
    var regexp = new RegExp(lKey + '|' + hKey, 'gi');
    curItem.note = curItem.note.replace(regexp, '');
    if (curItem.locked) {
      curItem.locked = false;
      curItem.note += lKey;
    }
    if (curItem.hidden) {
      curItem.hidden = false;
      curItem.note += hKey;
    }
  }
  redraw();
}

// Restoring locked & hidden pageItems
function restoreItemsState(lKey, hKey) {
  var regexp = new RegExp(lKey + '|' + hKey, 'gi');
  for (var i = 0, piLen = activeDocument.pageItems.length; i < piLen; i++) {
    var curItem = activeDocument.pageItems[i];
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
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (item) {
    for (var i = 0, len = this.length; i < len; i++ ) {
      if ( this[i] === item ) return i;
    }
    return -1;
  }
}

// Get active document ruler units
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

// Convert units of measurement
function convertUnits(value, curUnits, newUnits) {
  return UnitValue(value, curUnits).as(newUnits);
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