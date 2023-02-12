/*
  NumeratesPoints.jsx for Adobe Illustrator
  Description: Numerates selected points and marks them with colored circles
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Disabled Preview only for Illustrator v.24.3, because Illustrator crashes
  0.3 Added more units (yards, meters, etc.) support if the document is saved
  0.3.1 Removed RU localization due to Adobe API bug
  0.3.2 Radius replaced by diameter. Added size correction in large canvas mode
  0.3.3 Added new units API for CC 2023 v27.1.1

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2023 (Mac), 2023 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Numerates Points',
        version: 'v.0.3.3'
      },
      CFG = {
        aiVers: app.version.slice(0, 4),
        units: getUnits(), // Active document units
        diameter: 8, // Marker diameter
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
        errDoc: 'Error\nOpen a document and try again',
        errSel: 'Error\nPlease select atleast one object',
        number: 'Start number',
        diameter: 'Marker diameter',
        font: 'Font size, pt',
        left: 'Left margin',
        top: 'Top margin',
        cancel: 'Cancel',
        ok: 'Ok',
        preview: 'Preview',
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

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  getPaths(selection, selPaths);
  getPoints(selPaths, selPoints);

  // INTERFACE
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];
      win.opacity = CFG.uiOpacity;

  // Value fields
  var fieldGroup = win.add('group');
      fieldGroup.orientation = 'row';
      fieldGroup.alignChildren = ['fill', 'center'];

  var grpTitle = fieldGroup.add('group');
      grpTitle.orientation = 'column';
  var numTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.number);
  var radTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.diameter + ', ' + CFG.units);
  var leftTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.left + ', ' + CFG.units);
  var topTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.top + ', ' + CFG.units);
  var fontTitle = grpTitle.add('statictext', CFG.uiTitle, LANG.font);

  var grpInput = fieldGroup.add('group');
      grpInput.orientation = 'column';
  var numVal = grpInput.add('edittext', CFG.uiField, CFG.start);
  var diaVal = grpInput.add('edittext', CFG.uiField, CFG.diameter);
  var leftVal = grpInput.add('edittext', CFG.uiField, CFG.left);
  var topVal = grpInput.add('edittext', CFG.uiField, CFG.top);
  var fontVal = grpInput.add('edittext', CFG.uiField, CFG.font);

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill','center'];
  var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, LANG.ok,  { name: 'ok' });

  var grpPreview = win.add('group');
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

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  loadSettings();

  if (isPreview.value) previewStart();

  // Event listener for isPreview
  isPreview.onClick = previewStart;
  numVal.onChanging = diaVal.onChanging = fontVal.onChanging = previewStart;
  leftVal.onChanging = topVal.onChanging = previewStart;

  numVal.onChange = function () { this.text = strToNum(this.text, CFG.start); }
  leftVal.onChange = function () { this.text = strToNum(this.text, CFG.left); }
  topVal.onChange = function () { this.text = strToNum(this.text, CFG.top); }

  diaVal.onChange = function () {
    this.text = strToNum(this.text, CFG.diameter);
    if (this.text * 1 <= 0) this.text = CFG.diameter;
  }

  fontVal.onChange = function () {
    this.text = strToNum(this.text, CFG.font);
    if (this.text * 1 <= 0) this.text = CFG.font;
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  for (var i = 0; i < grpInput.children.length; i++) {
    shiftInputNumValue(grpInput.children[i]);
  }

  cancel.onClick = win.close;

  win.onClose = function () {
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
    win.close();
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
    var counter = strToNum(numVal.text, CFG.start),
        diameter = strToNum(diaVal.text, CFG.diameter),
        leftMargin = strToNum(leftVal.text, CFG.left),
        topMargin = strToNum(topVal.text, CFG.top),
        fontSize  = strToNum(fontVal.text, CFG.font),
        markerColor = setMarkerColor(),
        markerGroup, numGroup;

    if (fontSize <= 0) fontSize = CFG.font;
    if (fontSize > 1296 * CFG.sf) fontSize = 1296 * CFG.sf;
    if (diameter <= 0) diameter = CFG.diameter;

    // Convert value to document units
    diameter = convertUnits(diameter, CFG.units, 'px') / CFG.sf;
    leftMargin = convertUnits(leftMargin, CFG.units, 'px') / CFG.sf;
    topMargin = convertUnits(topMargin, CFG.units, 'px') / CFG.sf;

    tempPath = doc.activeLayer.pathItems.add();
    tempPath.name = 'Temp_Path';

    // Add new groups for numbers and markers
    markerGroup = addGroup(CFG.markerName);
    numGroup = addGroup(CFG.numName);

    for (var j = 0, pLen = selPoints.length; j < pLen; j++) {
      var currPoint = selPoints[j];
      drawMarker(currPoint, diameter, markerColor, markerGroup);
      drawNumber(currPoint, fontSize / CFG.sf, counter, topMargin, leftMargin, numGroup);
      counter++;
    }
  }

  win.center();
  win.show();

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.counter = numVal.text;
    pref.diameter = diaVal.text;
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
          diaVal.text = pref.diameter;
          leftVal.text = pref.left;
          topVal.text = pref.top;
          fontVal.text = pref.font;
          isPreview.value = (pref.preview == true && CFG.aiVers !== '24.3');
        }
      } catch (e) {}
    }
  }

  function shiftInputNumValue(item, min, max) {
    item.addEventListener('keydown', function (kd) {
      var step = kd.shiftKey ? step = 10 : step = 1;
      switch (kd.keyName) {
        case 'Up': 
          this.text = String(1 * this.text + step);
          if (max && 1 * this.text > max) this.text = max;
          kd.preventDefault();
          previewStart();
          break;
        case 'Down':
          this.text = String(1 * this.text - step);
          if (min && 1 * this.text < min) this.text = min;
          kd.preventDefault();
          previewStart();
          break;
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
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
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
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

function drawMarker(point, diameter, color, container) {
  var marker = activeDocument.pathItems.ellipse(
      point.anchor[1] + diameter * 0.5, // Top
      point.anchor[0] - diameter * 0.5, // Left
      diameter, // Width
      diameter, // Height
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