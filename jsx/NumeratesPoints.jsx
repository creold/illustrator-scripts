/*
  NumeratesPoints.jsx for Adobe Illustrator
  Description: Numerates selected points and marks them with colored circles
  Date: August, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Disabled Preview only for Illustrator v.24.3, because Illustrator crashes
  0.3 Added more units (yards, meters, etc.) support if the document is saved

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via PayPal (temporarily unavailable) http://www.paypal.me/osokin/usd

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
        name: 'Numerates Points',
        version: 'v.0.3'
      },
      CFG = {
        aiVers: app.version.slice(0, 4),
        units: getUnits(), // Active document units
        radius: 4, // Marker radius
        font: 6, // Font size, pt
        left: 10, // Margin left
        top: -10, // Margin top
        start: 1, // Start number
        isPreview: true,
        markerName: 'Points_Markers',
        numName: 'Points_Numbers',
        uiField: [0, 0, 50, 30],
        uiTitle: [0, 0, 130, 30],
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel:  { en: 'Error\nPlease select atleast one object',
                  ru: 'Ошибка\nВыделите хотя бы 1 объект' },
        number: { en: 'Start number', ru: 'Стартовый номер' },
        radius: { en: 'Marker radius', ru: 'Радиус маркера' },
        font: { en: 'Font size, pt', ru: 'Размер шрифта, pt' },
        left: { en: 'Left margin', ru: 'Отступ слева' },
        top: { en: 'Top margin', ru: 'Отступ сверху' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' },
        preview: { en: 'Preview', ru: 'Предпросмотр' }
      };

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var doc = activeDocument,
      selPaths = [],
      selPoints = [],
      isUndo = false,
      tempPath; // For fix Preview bug

  getPaths(selection, selPaths);
  getPoints(selPaths, selPoints);

  // INTERFACE
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  // Value fields
  var fieldGroup = dialog.add('group');
      fieldGroup.orientation = 'row';
      fieldGroup.alignChildren = ['fill', 'center'];

  var grpTitle = fieldGroup.add('group');
      grpTitle.orientation = 'column';
  var numTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.number);
  var radTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.radius + ', ' + CFG.units);
  var leftTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.left + ', ' + CFG.units);
  var topTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.top + ', ' + CFG.units);
  var fontTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.font);

  var grpInput = fieldGroup.add('group');
      grpInput.orientation = 'column';
  var numVal = grpInput.add('edittext', CFG.uiField, CFG.start);
  var radVal = grpInput.add('edittext', CFG.uiField, CFG.radius);
  var leftVal = grpInput.add('edittext', CFG.uiField, CFG.left);
  var topVal = grpInput.add('edittext', CFG.uiField, CFG.top);
  var fontVal = grpInput.add('edittext', CFG.uiField, CFG.font);

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill','center'];
  var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, LANG.ok,  { name: 'ok' });

  var grpPreview = dialog.add('group');
      grpPreview.orientation = 'row';
      grpPreview.alignChildren = ['center','center'];
  var isPreview = grpPreview.add('checkbox', undefined, LANG.preview);
  // It's sad. Illustrator 2020 24.3 crashes when we run app.undo() to the textFrame
  // The Preview will not be available on this version of Adobe Illustrator
  if (CFG.aiVers == '24.3') {
    isPreview.enabled = false;
  } else {
    isPreview.value = CFG.isPreview;
  }

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  loadSettings();

  if (isPreview.value) previewStart();

  // Event listener for isPreview
  isPreview.onClick = previewStart;
  numVal.onChanging = radVal.onChanging = fontVal.onChanging = previewStart;
  leftVal.onChanging = topVal.onChanging = previewStart;

  numVal.onChange = function () { this.text = convertToNum(this.text, CFG.start); }
  leftVal.onChange = function () { this.text = convertToNum(this.text, CFG.left); }
  topVal.onChange = function () { this.text = convertToNum(this.text, CFG.top); }

  radVal.onChange = function () {
    this.text = convertToNum(this.text, CFG.radius);
    if (this.text * 1 <= 0) this.text = CFG.radius;
  }

  fontVal.onChange = function () {
    this.text = convertToNum(this.text, CFG.font);
    if (this.text * 1 <= 0) this.text = CFG.font;
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  for (var i = 0; i < grpInput.children.length; i++) {
    shiftInputNumValue(grpInput.children[i]);
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
    saveSettings();
  }

  ok.onClick = okClick;

  function okClick() {
    if (isPreview.value && isUndo) undo();
    start();
    isUndo = false;
    dialog.close();
  }

  function previewStart() {
    try {
      if (isPreview.value) {
        if (isUndo) undo();
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

  function start() {
    var counter = convertToNum(numVal.text, CFG.start),
        radius = convertToNum(radVal.text, CFG.radius),
        leftMargin = convertToNum(leftVal.text, CFG.left),
        topMargin = convertToNum(topVal.text, CFG.top),
        fontSize  = convertToNum(fontVal.text, CFG.font),
        markerColor = setMarkerColor(),
        markerGroup, numGroup;

    if (fontSize <= 0) fontSize = CFG.font;
    if (radius <= 0) radius = CFG.radius;

    // Convert value to document units
    radius = convertUnits(radius, CFG.units, 'px');
    leftMargin = convertUnits(leftMargin, CFG.units, 'px');
    topMargin = convertUnits(topMargin, CFG.units, 'px');

    tempPath = doc.activeLayer.pathItems.add();
    tempPath.name = 'Temp_Path';

    // Add new groups for numbers and markers
    markerGroup = addGroup(CFG.markerName);
    numGroup = addGroup(CFG.numName);

    for (var j = 0, pLen = selPoints.length; j < pLen; j++) {
      var currPoint = selPoints[j];
      drawMarker(currPoint, radius, markerColor, markerGroup);
      drawNumber(currPoint, fontSize, counter, topMargin, leftMargin, numGroup);
      counter++;
    }
  }

  dialog.center();
  dialog.show();

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.counter = numVal.text;
    pref.radius = radVal.text;
    pref.left = leftVal.text;
    pref.top = topVal.text;
    pref.font = fontVal.text;
    pref.preview = isPreview.value;
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
          numVal.text = pref.counter;
          radVal.text = pref.radius;
          leftVal.text = pref.left;
          topVal.text = pref.top;
          fontVal.text = pref.font;
          isPreview.value = (pref.preview == true && CFG.aiVers !== '24.3');
        }
      } catch (e) {}
    }
  }

  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        kd.preventDefault();
        previewStart();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
        previewStart();
      }
    });
  }
}

// Set color for marker. Default Black
function setMarkerColor() {
  var newColor;
  if (activeDocument.documentColorSpace === DocumentColorSpace.RGB) {
    newColor = new RGBColor();
    newColor.red = 0;
    newColor.green = 0;
    newColor.blue = 0;
  } else {
    newColor = new CMYKColor();
    newColor.cyan = 0;
    newColor.magenta = 0;
    newColor.yellow = 0;
    newColor.black = 100;
  }

  return newColor;
}

function getPaths(item, arr) {
  for (var i = 0, len = item.length; i < len; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          arr.push(currItem);
          break;
        case 'CompoundPathItem':
          getPaths(currItem.pathItems, arr);
          break;
        default:
          currItem.selected = false;
          break;
      }
    } catch (e) {}
  }
}

function getPoints(paths, arr) {
  for (var i = 0, len = paths.length; i < len; i++) {
    if (paths[i].pathPoints.length > 1) {
      var points = paths[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        if (points[j].selected == PathPointSelection.ANCHORPOINT) arr.push(points[j]);
      }
    }
  }
}

function addGroup(name) {
  var lblGroup;
  try {
    lblGroup = activeDocument.groupItems.getByName(name);
  } catch (e) {
    lblGroup = activeDocument.activeLayer.groupItems.add();
    lblGroup.name = name;
  }

  return lblGroup;
}

// Convert string to number
function convertToNum(str, def) {
  if (arguments.length == 1 || !def) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

// Get active document ruler units
function getUnits() {
  if (!documents.length) return '';
  switch (activeDocument.rulerUnits) {
    case RulerUnits.Pixels: return 'px';
    case RulerUnits.Points: return 'pt';
    case RulerUnits.Picas: return 'pc';
    case RulerUnits.Inches: return 'in';
    case RulerUnits.Millimeters: return 'mm';
    case RulerUnits.Centimeters: return 'cm';
    case RulerUnits.Unknown: // Parse new units only for the saved doc
      var xmp = activeDocument.XMPString;
      // Example: <stDim:unit>Yards</stDim:unit>
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'Yards') return 'yd';
      }
      break;
  }
  return 'px'; // Default
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

function drawMarker(point, radius, color, container) {
  var marker = activeDocument.pathItems.ellipse(
      point.anchor[1] + radius, // Top
      point.anchor[0] - radius, // Left
      2 * radius, // Width
      2 * radius, // Height
      false, // Reversed
      true); // Inscribed
  marker.stroked = false;
  marker.fillColor = color;
  marker.move(container, ElementPlacement.PLACEATBEGINNING);
}

function drawNumber(point, font, num, top, left, container) {
  var numStr = activeDocument.textFrames.add();
  numStr.textRange.characterAttributes.size = font;
  numStr.contents = num;
  numStr.top = point.anchor[1] + top;
  numStr.left = point.anchor[0] + left;
  numStr.move(container, ElementPlacement.PLACEATBEGINNING);
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