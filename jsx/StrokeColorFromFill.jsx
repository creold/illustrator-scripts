/*
  StrokeColorFromFill.jsx for Adobe Illustrator
  Description: Sets a stroke color of an object based on an its solid or gradient fill. 
               Adds a stroke, if there is none (not available on Mac OS Illustrator older than CC 2020)
  Date: August, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ==========================================================================================
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
$.localize = true; // Enabling automatic localization

// Begin global variables
var SCRIPT_NAME = 'Stroke Color From Fill';
var USER_OS = $.os.toLowerCase().indexOf('mac') >= 0 ? 'MAC': 'WINDOWS';
var AI_VER = parseInt(app.version);
// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.', ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_SELECT = { en: 'Error\nPlease select atleast one object.', ru: 'Ошибка\nВыделите хотя бы 1 объект.'},
    LANG_ERR_FILL = { en: 'Attention\nThe script skips Paths & Compound Paths with patterns or empty fills. Such objects:', 
                   ru: 'Внимание\nСкрипт пропускает контуры и составные контуры с паттернами или без заливки. Таких объектов:'},
    LANG_SHIFT = { en: 'Color Shift', ru: 'Смещение цвета'},
    LANG_LIGHTER = { en: 'lighter', ru: 'светлее'},
    LANG_DARKER = { en: 'darker', ru: 'темнее'},
    LANG_STROKE = { en: 'If there is no stroke, add it', ru: 'Если нет обводки, то добавить'};
    LANG_SPOT = { en: 'Convert Spot colors to ', ru: 'Перевести Spot цвета в '};
    LANG_OK = { en: 'Ok', ru: 'Готово'},
    LANG_CANCEL = { en: 'Cancel', ru: 'Отмена'};
    LANG_PREVIEW = { en: 'Preview', ru: 'Предпросмотр'}; 

var selPaths = [],
    docProfile = 'RGB', // Current document color mode
    arrHasStroke = false,
    shift = 0,
    maxValue = 0, // Max color value in the channel
    badFillCount = 0, // Object counter with non-solid fill
    colorChannel = [], // RGB or CMYK names
    isUndo = false,
    tempPath, // For fix Preview bug
    DEF_SHIFT = 30, // Default color shift value
    DEF_ADD_STROKE = true,
    DEF_IS_PREVIEW = true,
    DEF_SPOT_CONVERT = false,
    DEF_DLG_OPACITY = 0.9;  // UI window opacity. Range 0-1
// End global variables

function main() {
  if (app.documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  } else { 
    doc = app.activeDocument;
  }

  if (doc.selection.length == 0) {
    alert(LANG_ERR_SELECT);
    return;
  }

  // Get initial data
  if (doc.documentColorSpace == DocumentColorSpace.RGB) {
    maxValue = 255;
    colorChannel = ['red', 'green', 'blue'];
  } else {
    docProfile = 'CMYK';
    maxValue = 100;
    colorChannel = ['cyan', 'magenta', 'yellow', 'black'];
  }
  
  getPaths(doc.selection, selPaths);
  
  arrHasStroke = searchStrokedPath(selPaths);

  // Main Window
  var dialog = new Window('dialog', SCRIPT_NAME, undefined);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill','center'];
      dialog.opacity = DEF_DLG_OPACITY;

  // Value fields
  var shiftPanel = dialog.add('panel', undefined, LANG_SHIFT);
      shiftPanel.orientation = 'row';
      shiftPanel.alignChildren = ['left','center']; 
  var colorShift = shiftPanel.add('edittext', [0, 0, 80, 30], DEF_SHIFT);
  
  var info = shiftPanel.add('group');
      info.orientation = 'column';
  var lighter = info.add('statictext', undefined, '> 0 : ' + LANG_LIGHTER);
  var darker = info.add('statictext', undefined, '< 0 : ' + LANG_DARKER);

  var isSpotConvert = dialog.add('checkbox', undefined, LANG_SPOT + docProfile);
      isSpotConvert.value = DEF_SPOT_CONVERT;

  // Stroke bug in Ai older 2020 (Mac OS) 
  if (USER_OS == 'WINDOWS' || (USER_OS == 'MAC' && AI_VER >=24)) {
    var isAddStroke = dialog.add('checkbox', undefined, LANG_STROKE);
        isAddStroke.value = DEF_ADD_STROKE;
  }

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill','center'];
  var cancel = btns.add('button', undefined, LANG_CANCEL);
  var ok = btns.add('button', undefined, LANG_OK);

  var grpPreview = dialog.add('group');
      grpPreview.orientation = 'row';
      grpPreview.alignChildren = ['center','center'];
  var isPreview = grpPreview.add('checkbox', undefined, LANG_PREVIEW);
      isPreview.value = DEF_IS_PREVIEW;

  var copyright = dialog.add('statictext', undefined, '\u00A9 github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  // Begin event listener for isPreview
  if (isPreview.value) { previewStart(); }
  colorShift.onChanging = isSpotConvert.onClick = isPreview.onClick = previewStart;
  if (isExists(isAddStroke)) { isAddStroke.onClick = previewStart; }
  // End event listener for isPreview

  ok.onClick = okClick;

  function okClick() {
    if (isPreview.value && isUndo) { app.undo(); }
    isUndo = false;
    start();
    dialog.close();
  }

  function previewStart() {
    try {
      if (isPreview.value && (arrHasStroke || (isExists(isAddStroke) && isAddStroke.value))) {
        if (isUndo) { 
          app.undo(); }
        else { 
          isUndo = true; }
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
    tempPath.name = 'Temp_Path';
    var shiftNum = (isNaN(Number(colorShift.text)) || colorShift.text === '') ? 0 : Math.round(Number(colorShift.text));
    for (var i = 0; i < selPaths.length; i++) {
      try {
        var item = selPaths[i];
        if (isExists(isAddStroke) && isAddStroke.value && !item.stroked) { 
          item.stroked = true; 
          item.strokeWidth = 1;
        }
        applyColor(item, shiftNum, isSpotConvert.value);
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
    if (badFillCount > 0) { alert(LANG_ERR_FILL + ' ' + badFillCount); }
    return true;
  }

  dialog.center();
  dialog.show();
}

// Checking whether there are stroked Paths in the selection
function searchStrokedPath(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].stroked) { return true; }
  }
  return false;
}

function isExists(item) {
  return typeof (item) !== 'undefined';
}

// Get only Paths from selection
function getPaths(item, arr) {
  for (var i = 0; i < item.length; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          if (currItem.filled && isSolidFillType(currItem)) { arr.push(currItem); }
          else { badFillCount++; }
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && isSolidFillType(currItem.pathItems[0])) { arr.push(currItem.pathItems[0]); }
          else { badFillCount++; }
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
function applyColor(obj, shift, convert) { 
  var fillAttr = obj.fillColor,
      currColor,
      strokeNewColor = (docProfile == 'RGB') ? new RGBColor() : new CMYKColor(),
      delta = 0;
  
  if (fillAttr.typename == 'GradientColor') {
    var gStopsNum = fillAttr.gradient.gradientStops.length;
    var half = parseInt(gStopsNum / 2);
    fillAttr = fillAttr.gradient.gradientStops[half].color;
  }

  currColor = (fillAttr.typename == 'SpotColor' && convert) ? fillAttr.spot.color : fillAttr;

  // For Grayscale mode color is set individually
  if (currColor.typename == 'GrayColor') {
    strokeNewColor = new GrayColor();
    var grayColor = Math.round(currColor.gray),
        grayDelta = grayColor - shift;

    if (grayDelta > 100) strokeNewColor.gray = 100;
    else if (grayDelta < 0) strokeNewColor.gray = 0;
    else strokeNewColor.gray = grayDelta;
  }

  // For Spot or Global color is set individually
  if (currColor.typename == 'SpotColor' && !convert) {
    strokeNewColor = new SpotColor();
    var spotColor = currColor.spot,
        spotDelta = currColor.tint - shift;
    
    strokeNewColor.spot = currColor.spot;

    if (spotDelta > 100) strokeNewColor.tint = 100;
    else if (spotDelta < 0) strokeNewColor.tint = 0;
    else strokeNewColor.tint = spotDelta;
  } else {
    // Set color for RGB || CMYK channels
    for (var j = 0; j < colorChannel.length; j++) {
      var channelName = colorChannel[j],
          currChannelColor = Math.round(currColor[channelName]);
      delta = (docProfile == 'RGB') ? currChannelColor + shift : currChannelColor - shift;

      if (delta > maxValue) strokeNewColor[channelName] = maxValue;
      else if (delta < 0) strokeNewColor[channelName] = 0;
      else strokeNewColor[channelName] = delta;
    }
  }

  // Set a new color to stroke
  if (obj.stroked) { obj.strokeColor = strokeNewColor; }
}

function isSolidFillType(obj) {
  if (obj.fillColor.typename == 'RGBColor' ||
      obj.fillColor.typename == 'CMYKColor' ||
      obj.fillColor.typename == 'GrayColor' ||
      obj.fillColor.typename == 'SpotColor' ||
      obj.fillColor.typename == 'GradientColor')
    { return true; }
  return false;
}

// For debugging
function showError(err) {
  if (confirm(SCRIPT_NAME + ': an unknown error has occurred.\n' +
      'Would you like to see more information?', true, 'Unknown Error')) {
    alert(err + ': on line ' + err.line, 'Script Error', true);
  }
}

// Run script
try {
  main();
} catch (e) {
  // showError(e);
}