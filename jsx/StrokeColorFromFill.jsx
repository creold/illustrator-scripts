/*
  StrokeColorFromFill.jsx for Adobe Illustrator
  Description: Sets a stroke color of an object based on an its solid or gradient fill. 
               Adds a stroke, if there is none (not available on Mac OS Illustrator older than CC 2020)
  Date: August, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
  0.1 Initial version
  0.2 Added changing the color shift value with the Up/Down keys
  0.3 Added color interpolation to get the Stroke color from the gradient
  0.3.1 Minor improvements

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
$.localize = true; // Enabling automatic localization

// Begin global variables
var SCRIPT_NAME = 'Stroke Color From Fill',
    SCRIPT_VERSION = 'v.0.3.1',
    USER_OS = $.os.toLowerCase().indexOf('mac') >= 0 ? 'MAC': 'WINDOWS',
    AI_VER = parseInt(app.version);

// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again', 
                      ru: 'Ошибка\nОткройте документ и запустите скрипт' },
    LANG_ERR_SELECT = { en: 'Error\nPlease select atleast one object',
                        ru: 'Ошибка\nВыделите хотя бы 1 объект' },
    LANG_ERR_FILL = { en: 'Attention\nThe script skips Paths & Compound Paths ' +
                          'with patterns or empty fills. Such objects:', 
                      ru: 'Внимание\nСкрипт пропускает контуры и составные контуры ' +
                          'с паттернами или без заливки. Таких объектов:' },
    LANG_SHIFT = { en: 'Color Shift', ru: 'Смещение цвета' },
    LANG_LIGHTER = { en: 'lighter', ru: 'светлее' },
    LANG_DARKER = { en: 'darker', ru: 'темнее' },
    LANG_STROKE = { en: 'If there is no stroke, add it', ru: 'Если нет обводки, то добавить' };
    LANG_SPOT = { en: 'Convert Spot colors to ', ru: 'Перевести Spot цвета в ' };
    LANG_OK = { en: 'Ok', ru: 'Готово' },
    LANG_CANCEL = { en: 'Cancel', ru: 'Отмена' },
    LANG_PREVIEW = { en: 'Preview', ru: 'Предпросмотр' }; 

var selPaths = [],
    isRgbProfile = true, // Current document color mode
    hasStroke = false,
    shift = 0, // Color shift
    maxValue = 0, // Max color value in the channel
    badFillCount = 0,
    colorChannel = [], // RGB or CMYK names
    isUndo = false,
    tempPath, // For fix Preview bug
    DEF_SHIFT = -30, // Default color shift value
    DEF_ADD_STROKE = true,
    DEF_IS_PREVIEW = true,
    DEF_SPOT_CONVERT = false,
    DLG_OPACITY = 0.95;  // UI window opacity. Range 0-1
// End global variables

function main() {
  if (documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert(LANG_ERR_SELECT);
    return;
  }

  // Setup initial data
  var doc = app.activeDocument;
  isRgbProfile = (doc.documentColorSpace == DocumentColorSpace.RGB) ? true : false;

  if (isRgbProfile) {
    maxValue = 255;
    colorChannel = ['red', 'green', 'blue'];
  } else {
    maxValue = 100;
    colorChannel = ['cyan', 'magenta', 'yellow', 'black'];
  }
  
  getPaths(doc.selection, selPaths);
  
  hasStroke = hasStrokedPath(selPaths);

  // Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = DLG_OPACITY;

  // Value fields
  var shiftPanel = dialog.add('panel', undefined, LANG_SHIFT);
      shiftPanel.orientation = 'row';
      shiftPanel.alignChildren = ['left', 'center']; 
  var colorShift = shiftPanel.add('edittext', [0, 0, 80, 30], DEF_SHIFT);
  
  var info = shiftPanel.add('group');
      info.orientation = 'column';
  var lighter = info.add('statictext', undefined, '> 0 : ' + LANG_LIGHTER);
  var darker = info.add('statictext', undefined, '< 0 : ' + LANG_DARKER);

  var isSpotConvert = dialog.add('checkbox', undefined, LANG_SPOT + (isRgbProfile ? 'RGB' : 'CMYK'));
      isSpotConvert.value = DEF_SPOT_CONVERT;

  // AI older 2020 on Mac OS has bug with add stroke
  if (USER_OS == 'WINDOWS' || (USER_OS == 'MAC' && AI_VER >= 24)) {
    var isAddStroke = dialog.add('checkbox', undefined, LANG_STROKE);
        isAddStroke.value = DEF_ADD_STROKE;
  }

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];
  var cancel = btns.add('button', undefined, LANG_CANCEL, {name: 'cancel'});
  var ok = btns.add('button', undefined, LANG_OK, {name: 'ok'});

  var grpPreview = dialog.add('group');
      grpPreview.orientation = 'row';
      grpPreview.alignChildren = ['center', 'center'];
  var isPreview = grpPreview.add('checkbox', undefined, LANG_PREVIEW);
      isPreview.value = DEF_IS_PREVIEW;

  var copyright = dialog.add('statictext', undefined, '\u00A9 github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  // Begin event listener for isPreview
  if (isPreview.value) previewStart();
  colorShift.onChanging = isSpotConvert.onClick = isPreview.onClick = previewStart;
  if (isExists(isAddStroke)) isAddStroke.onClick = previewStart;
  // End event listener for isPreview

  // Use Up / Down arrow keys (+ Shift) for change color shift
  shiftInputNumValue(colorShift);

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
        app.redraw();
      } else if (isUndo) {
          app.undo();
          app.redraw();
          isUndo = false;
        }
    } catch (e) {
      // showError(e);
    }
  }

  // Start conversion
  function start() {
    tempPath = doc.activeLayer.pathItems.add();
    tempPath.name = '__TempPath';
    var shiftVal = convertToNum(colorShift.text, 0);
    for (var i = 0, pLen = selPaths.length; i < pLen; i++) {
      try {
        var item = selPaths[i];
        if (isExists(isAddStroke) && isAddStroke.value && !item.stroked) { 
          item.stroked = true; 
          item.strokeWidth = 1;
        }
        applyColor(item, shiftVal, isSpotConvert.value);
      } catch (e) {
        // showError(e);
      }
    }
  }

  cancel.onClick = function() {
    dialog.close();
  }

  dialog.onClose = function () {
    try {
      if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (e) {
      // showError(e);
    }
    tempPath.remove();
    app.redraw();
    if (badFillCount) alert(LANG_ERR_FILL + ' ' + badFillCount);
    return true;
  }

  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        if (Number(this.text) >= -maxValue + step) {
          this.text = Number(this.text) - step;
          kd.preventDefault();
        } else {
          this.text = -maxValue;
        }
      }
      if (kd.keyName == 'Up') {
        if (Number(this.text) <= maxValue - step) {
          this.text = Number(this.text) + step;
          kd.preventDefault();
        } else {
          this.text = maxValue;
        }
      }
      previewStart();
    });
  }

  dialog.center();
  dialog.show();
}

// Checking whether there are stroked Paths in the selection
function hasStrokedPath(arr) {
  for (var i = 0, aLen = arr.length; i < aLen; i++) {
    if (arr[i].stroked) return true;
  }
  return false;
}

function isExists(item) {
  return typeof (item) !== 'undefined';
}

// Get only Paths from selection
function getPaths(item, arr) {
  for (var i = 0, iLen = item.length; i < iLen; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          if (currItem.filled && hasColorFill(currItem)) arr.push(currItem);
          else badFillCount++;
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && hasColorFill(currItem.pathItems[0])) { 
            arr.push(currItem.pathItems[0]);
          } else { badFillCount++; }
          break;
        default:
          break;
      }
    } catch (e) {
      // showError(e);
    }
  }
}

// Apply color to stroke
function applyColor(obj, shift, isSpotRplc) { 
  var _fill = obj.fillColor,
      sColor = isRgbProfile ? new RGBColor() : new CMYKColor(),
      currColor,
      delta = 0;
  
  if (_fill.typename == 'GradientColor') _fill = interpolateColor(_fill.gradient);
  currColor = (_fill.typename == 'SpotColor' && isSpotRplc) ? _fill.spot.color : _fill;

  // For Grayscale mode color is set individually
  if (currColor.typename == 'GrayColor') {
    sColor = new GrayColor();
    var grayColor = Math.round(currColor.gray),
        grayDelta = grayColor - shift;

    if (grayDelta > 100) sColor.gray = 100;
    else if (grayDelta < 0) sColor.gray = 0;
    else sColor.gray = grayDelta;
  }

  // For Spot or Global color is set individually
  if (currColor.typename == 'SpotColor' && !isSpotRplc) {
    sColor = new SpotColor();
    var spotColor = currColor.spot,
        spotDelta = currColor.tint - shift;
    
    sColor.spot = currColor.spot;

    if (spotDelta > 100) sColor.tint = 100;
    else if (spotDelta < 0) sColor.tint = 0;
    else sColor.tint = spotDelta;
  } else {
    // Set color for RGB || CMYK channels
    for (var j = 0, cLen = colorChannel.length; j < cLen; j++) {
      var channelName = colorChannel[j],
          currChannelColor = Math.round(currColor[channelName]);
      delta = isRgbProfile ? currChannelColor + shift : currChannelColor - shift;

      if (delta > maxValue) sColor[channelName] = maxValue;
      else if (delta < 0) sColor[channelName] = 0;
      else sColor[channelName] = delta;
    }
  }

  // Set a new color to stroke
  if (obj.stroked) obj.strokeColor = sColor;
}

// Color interpolation by moody allen (moodyallen7@gmail.com)
function interpolateColor(color) {
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
  var iColor = isRgbProfile ? new RGBColor() : new CMYKColor();
  for (var key in cSum) { iColor[key] = cSum[key] / gStopsLength; }
  return iColor;
}

function hasColorFill(obj) {
  var _type = obj.fillColor.typename;
  if (_type == 'RGBColor' || _type == 'CMYKColor' || _type == 'GrayColor' || 
      _type == 'SpotColor' || _type == 'GradientColor') return true;
  return false;
}

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

// For debugging
function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

// Run script
try {
  main();
} catch (e) {
  // showError(e);
}