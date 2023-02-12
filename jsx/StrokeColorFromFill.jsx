/*
  StrokeColorFromFill.jsx for Adobe Illustrator
  Description: Sets a stroke color of an object based on an its solid or gradient fill.
                Adds a stroke, if there is none (not available on Mac OS Illustrator older than CC 2020)
  Date: August, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added changing the color shift value with the Up/Down keys
  0.3 Added color interpolation to get the Stroke color from the gradient
  0.3.1 Minor improvements
  0.3.2 Added conversion of spot tint to color
  0.3.3 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), CS6, 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

function main() {
  var SCRIPT = {
        name: 'Stroke Color From Fill',
        version: 'v.0.3.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        isRgb: (activeDocument.documentColorSpace === DocumentColorSpace.RGB) ? true : false,
        uiOpacity: .97, // UI window opacity. Range 0-1
        spotConvert: false,
        preview: true,
        addStroke: true,
        shift: -30 // Default color shift value
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel: { en: 'Error\nPlease select atleast one object',
                  ru: 'Ошибка\nВыделите хотя бы 1 объект' },
        errFill: { en: 'Attention\nThe script skips Paths & Compound Paths ' +
                        'with patterns or empty fills. Such objects:',
                  ru: 'Внимание\nСкрипт пропускает контуры и составные контуры ' +
                        'с паттернами или без заливки. Таких объектов:' },
        shift: { en: 'Color Shift', ru: 'Смещение цвета' },
        lighter: { en: 'lighter', ru: 'светлее' },
        darker: { en: 'darker', ru: 'темнее' },
        stroke: { en: 'If there is no stroke, add it', ru: 'Если нет обводки, то добавить' },
        spot: { en: 'Convert Spot colors to ', ru: 'Перевести Spot цвета в ' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' },
        preview: { en: 'Preview', ru: 'Предпросмотр' }
      };
    
  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  // Setup initial data
  var doc = activeDocument,
      selPaths = [],
      isUndo = false,
      maxVal = 0, // Max color value in the channel
      cKeys = [], // RGB or CMYK names
      tempPath; // For fix Preview bug

  var badFills = getPaths(doc.selection, selPaths),
      hasStroke = hasStrokedPath(selPaths);

  if (CFG.isRgb) {
    maxVal = 255;
    cKeys = ['red', 'green', 'blue'];
  } else {
    maxVal = 100;
    cKeys = ['cyan', 'magenta', 'yellow', 'black'];
  }

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  // Value fields
  var shiftPanel = dialog.add('panel', undefined, LANG.shift);
      shiftPanel.orientation = 'row';
      shiftPanel.alignChildren = ['left', 'center'];
  var colorShift = shiftPanel.add('edittext', [0, 0, 80, 30], CFG.shift);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    colorShift.active = true;
  }

  var info = shiftPanel.add('group');
      info.orientation = 'column';
  var lighter = info.add('statictext', undefined, '> 0 : ' + LANG.lighter);
  var darker = info.add('statictext', undefined, '< 0 : ' + LANG.darker);

  var isSpotConvert = dialog.add('checkbox', undefined, LANG.spot + (CFG.isRgb ? 'RGB' : 'CMYK'));
      isSpotConvert.value = CFG.spotConvert;

  // AI older 2020 on Mac OS has bug with add stroke
  if (!CFG.isMac || (CFG.isMac && CFG.aiVers >= 24)) {
    var isAddStroke = dialog.add('checkbox', undefined, LANG.stroke);
        isAddStroke.value = CFG.addStroke;
  }

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];
  var cancel = btns.add('button', undefined, LANG.cancel, {name: 'cancel'});
  var ok = btns.add('button', undefined, LANG.ok, {name: 'ok'});

  var grpPreview = dialog.add('group');
      grpPreview.orientation = 'row';
      grpPreview.alignChildren = ['center', 'center'];
  var isPreview = grpPreview.add('checkbox', undefined, LANG.preview);
      isPreview.value = CFG.preview;

  var copyright = dialog.add('statictext', undefined, '\u00A9 github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  // Begin event listener for isPreview
  if (isPreview.value) previewStart();
  colorShift.onChanging = isSpotConvert.onClick = isPreview.onClick = previewStart;
  if (isExists(isAddStroke)) isAddStroke.onClick = previewStart;
  // End event listener for isPreview

  // Use Up / Down arrow keys (+ Shift) for change color shift
  shiftInputNumValue(colorShift, maxVal);

  ok.onClick = okClick;

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    dialog.close();
  }

  function previewStart() {
    try {
      if (isPreview.value && (hasStroke ||
          (isExists(isAddStroke) && isAddStroke.value))) {
        if (isUndo) app.undo();
        else isUndo = true;
        start();
        redraw();
      } else if (isUndo) {
          undo();
          redraw();
          isUndo = false;
        }
    } catch (e) {}
  }

  // Start conversion
  function start() {
    tempPath = doc.activeLayer.pathItems.add();
    tempPath.name = '__TempPath';
    var shiftVal = strToNum(colorShift.text, 0);
    for (var i = 0, pLen = selPaths.length; i < pLen; i++) {
      try {
        var item = selPaths[i];
        if (isExists(isAddStroke) && isAddStroke.value && !item.stroked) {
          item.stroked = true;
          item.strokeWidth = 1;
        }
        applyColor(item, shiftVal, maxVal, cKeys, CFG.isRgb, isSpotConvert.value);
      } catch (e) {}
    }
  }

  cancel.onClick = dialog.close;

  dialog.onClose = function () {
    try {
      if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (e) {}
    tempPath.remove();
    redraw();
    if (badFills) alert(LANG.errFill + ' ' + badFills);
    return true;
  }

  function shiftInputNumValue(item, max) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        if (Number(this.text) >= -max + step) {
          this.text = Number(this.text) - step;
          kd.preventDefault();
        } else {
          this.text = -max;
        }
      }
      if (kd.keyName == 'Up') {
        if (Number(this.text) <= max - step) {
          this.text = Number(this.text) + step;
          kd.preventDefault();
        } else {
          this.text = max;
        }
      }
      previewStart();
    });
  }

  dialog.center();
  dialog.show();
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

// Checking whether there are stroked Paths in the selection
function hasStrokedPath(arr) {
  for (var i = 0, aLen = arr.length; i < aLen; i++) {
    if (arr[i].stroked) return true;
  }
  return false;
}

function isExists(item) {
  return typeof item !== 'undefined';
}

// Get only Paths from selection
function getPaths(item, arr) {
  var noColorCounter = 0;
  for (var i = 0, iLen = item.length; i < iLen; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          noColorCounter += getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          if (currItem.filled && hasColorFill(currItem)) arr.push(currItem);
          else noColorCounter++;
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && hasColorFill(currItem.pathItems[0])) {
            arr.push(currItem.pathItems[0]);
          } else { noColorCounter++; }
          break;
        default:
          break;
      }
    } catch (e) {}
  }
  return noColorCounter;
}

// Apply color to stroke
function applyColor(obj, shift, max, keys, isRgb, isSpotRplc) {
  var _fill = obj.fillColor,
      sColor = isRgb ? new RGBColor() : new CMYKColor(),
      currColor,
      delta = 0;

  if (_fill.typename === 'GradientColor') _fill = interpolateColor(isRgb, _fill.gradient);

  currColor = _fill;

  if (_fill.typename === 'SpotColor' && isSpotRplc) {
    if (_fill.tint === 100) {
      currColor = _fill.spot.color; 
    } else {
      currColor = tint2process(_fill, isRgb);
    }
  }

  // For Grayscale mode color is set individually
  if (currColor.typename === 'GrayColor') {
    sColor = new GrayColor();
    var grayColor = Math.round(currColor.gray),
        grayDelta = grayColor - shift;

    if (grayDelta > 100) sColor.gray = 100;
    else if (grayDelta < 0) sColor.gray = 0;
    else sColor.gray = grayDelta;
  }

  // For Spot or Global color is set individually
  if (currColor.typename === 'SpotColor' && !isSpotRplc) {
    sColor = new SpotColor();
    var spotColor = currColor.spot,
        spotDelta = currColor.tint - shift;

    sColor.spot = currColor.spot;

    if (spotDelta > 100) sColor.tint = 100;
    else if (spotDelta < 0) sColor.tint = 0;
    else sColor.tint = spotDelta;
  } else {
    // Set color for RGB || CMYK channels
    for (var j = 0, cLen = keys.length; j < cLen; j++) {
      var keyName = keys[j],
          currKeyColor = Math.round(currColor[keyName]);
      delta = isRgb ? currKeyColor + shift : currKeyColor - shift;

      if (delta > max) sColor[keyName] = max;
      else if (delta < 0) sColor[keyName] = 0;
      else sColor[keyName] = delta;
    }
  }

  // Set a new color to stroke
  if (obj.stroked) obj.strokeColor = sColor;
}

// Convert Spot color tint to process color
function tint2process(fill, isRgb) {
  var sColor = fill.spot.color,
      value = 1 - fill.tint / 100,
      newColor = isRgb ? new RGBColor() : new CMYKColor();
  if (isRgb) {
    newColor.red = sColor.red + (255 - sColor.red) * value;
    newColor.green = sColor.green + (255 - sColor.green) * value;
    newColor.blue = sColor.blue + (255 - sColor.blue) * value;
  } else {
    newColor.cyan = sColor.cyan * (1 - value);
    newColor.magenta = sColor.magenta * (1 - value);
    newColor.yellow = sColor.yellow * (1 - value);
    newColor.black = sColor.black * (1 - value);
  }
  return newColor;
}

// Color interpolation by moody allen (moodyallen7@gmail.com)
function interpolateColor(isRgb, color) {
  var gStopsLength = color.gradientStops.length,
      cSum = {}; // Sum of color channels
  for (var j = 0; j < gStopsLength; j++) {
    var c = color.gradientStops[j].color;
    if (c.typename === 'SpotColor') c = c.spot.color;
    if (c.typename === 'GrayColor') c.red = c.green = c.blue = c.black = c.gray;
    for (var key in c) {
      if (typeof c[key] === 'number') {
        if (cSum[key]) cSum[key] += c[key];
        else cSum[key] = c[key];
      }
    }
  }
  var iColor = isRgb ? new RGBColor() : new CMYKColor();
  for (var key in cSum) { iColor[key] = cSum[key] / gStopsLength; }
  return iColor;
}

function hasColorFill(obj) {
  var _type = obj.fillColor.typename;
  if (_type === 'RGBColor' || _type === 'CMYKColor' || _type === 'GrayColor' ||
      _type === 'SpotColor' || _type === 'GradientColor') return true;
  return false;
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

// Run script
try {
  main();
} catch (e) {}