/*
  SetPointsCoordinates.jsx for Adobe Illustrator
  Description:  Sets the path points to the entered X and Y coordinate values. Supports offset delta, similar to the Move menu
  Date: July, 2023
  Modification date: February, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.1 Removed input activation on Windows OS below CC v26.4
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2025 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);// Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Set Points Coordinates',
        version: 'v.0.1'
      },
      CFG = {
        tolerance: 0.0, // Inaccuracy of point coordinates
        units: getUnits(),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };
  
  if (!isCorrectEnv('selection')) return;

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var isRulerTopLeft = preferences.getBooleanPreference('isRulerOriginTopLeft'),
      isRulerInFourthQuad = preferences.getBooleanPreference('isRulerIn4thQuad');
  CFG.isFlipY = isRulerTopLeft && isRulerInFourthQuad;

  var defCoordSys = app.coordinateSystem;
  var paths = getPaths(selection);
  var points = getSelectedPoints(paths);
  if (!points.length) {
    alert('No selected points\nPlease, select path points', 'Script error');
    return false;
  }

  var isUndo = false;

  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill','top'];
  
  // Wrapper
  var coordPnl = win.add('panel', undefined, 'Position of ' + points.length + ' selected points, ' + CFG.units);
      coordPnl.alignChildren = ['fill','center'];
      coordPnl.margins = [10, 15, 10, 10];

  // Wrapper
  var wrapper = coordPnl.add('group');
      wrapper.alignChildren = ['fill','center'];
  
  // X Axis
  var xGrp = wrapper.add('group');
      xGrp.alignChildren = ['left', 'center'];
      xGrp.add('statictext', undefined, 'X:');
  var xInp = xGrp.add('edittext', undefined, '');
      xInp.characters = 8;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    xInp.active = true;
  }

  // Y Axis
  var yGrp = wrapper.add('group');
      yGrp.alignChildren = ['left', 'center'];
      yGrp.add('statictext', undefined, 'Y:');
  var yInp = yGrp.add('edittext', undefined, '');
      yInp.characters = 8;
  
  var info = "If you don't want to change a\ncoordinate, leave its field blank.\n"
      info += "Use ++ or -- before a number\nto increment or decrement\na original coordinate.";
  xInp.helpTip = yInp.helpTip = info;

  // Rulers
  var isAbCoord = win.add('checkbox', undefined, 'Use artboard rulers (on) or global (off)');
      isAbCoord.value = false;
  
  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');
  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  // Copyright block
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  initCoords(CFG.tolerance);
  if (isPreview.value) preview();

  // Events
  isPreview.onClick = preview;
  xInp.onChange = yInp.onChange = preview;

  shiftInputNumValue(xInp);
  shiftInputNumValue(yInp);

  isAbCoord.onClick = function () {
    initCoords(CFG.tolerance);
    preview();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = win.close;

  win.onClose = function () {
    app.coordinateSystem = defCoordSys;
    try {
      if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  ok.onClick = okClick;

  // Get initial coordinates
  function initCoords(tolerance) {
    if (isAbCoord.value) {
      app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    } else {
      app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
    }

    var xCoord, yCoord;
    var isXEqual = isEqualAxis(points, 'x', tolerance);
    var isYEqual = isEqualAxis(points, 'y', tolerance);

    if (isXEqual) {
      xCoord = convertUnits(points[0].anchor[0], 'px', CFG.units);
      xInp.text = (CFG.sf * xCoord).toFixed(3);
    }

    if (isYEqual) {
      yCoord = convertUnits(points[0].anchor[1], 'px', CFG.units);
      yInp.text = (CFG.sf * (CFG.isFlipY ? -1 : 1) * yCoord).toFixed(3);
    }
  }

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) undo();
        else isUndo = true;
        process(points, xInp.text, yInp.text, CFG.sf, CFG.isFlipY, CFG.units);
        redraw();
      } else if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) undo();
    process(points, xInp.text, yInp.text, CFG.sf, CFG.isFlipY, CFG.units);
    isUndo = false;
    win.close();
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var matches = this.text.match(/^[+-]{1,2}/g),
          sign = (matches == null) ? '' : matches.toString(),
          num = this.text.replace(/^[+-]{2}/g, ''),
          step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      if (kd.keyName == 'Down') {
        num = strToNum(num, 0) - step;
        kd.preventDefault();
        this.text = (sign.length == 2) ? sign + Math.abs(num) : num;
      }
      if (kd.keyName == 'Up') {
        num = strToNum(num, 0) + step;
        kd.preventDefault();
        this.text = (sign.length == 2) ? sign + Math.abs(num) : num;
      }
      preview();
    });
  }

  win.center();
  win.show();
}

// Check the script environment
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0;i < args.length;i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Wrong app version\nSorry, script only works in Illustrator v.' + rqdVers + ' and later', 'Script error');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease, select at least one path and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
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

// Get single items from selection
function getPaths(coll) {
  var out = [];
  for (var i = 0;i < coll.length;i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getPaths(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      out.push(item);
    } else {
      item.selected = false;
    }
  }
  return out;
}

// Get selected points on paths
function getSelectedPoints(coll) {
  var out = [];
  for (var i = 0, len = coll.length;i < len;i++) {
    var points = coll[i].pathPoints;
    for (var j = 0, pLen = points.length;j < pLen;j++) {
      if (isSelected(points[j])) out.push(points[j]);
    }
  }
  return out;
}

// Check the point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

// Check if all the points coordinates on a axis are equal
function isEqualAxis(points, axis, tolerance) {
  var idx = (axis === 'x') ? 0 : 1;
  var coord = points[0].anchor[idx];
  var delta = 0;
  for (var i = 1; i < points.length; i++) {
    delta = Math.abs(coord - points[i].anchor[idx]);
    if (delta > tolerance) return false;
  }
  return true;
}

// Process point coordinates
function process(points, xStr, yStr, sf, isFlipY, units) {
  var isEmptyX = isEmpty(xStr) || isNaN(strToNum(xStr));
  var isEmptyY = isEmpty(yStr) || isNaN(strToNum(yStr));
  var hasSignX = hasSign(xStr);
  var hasSignY = hasSign(yStr);
  var xCoord = null, yCoord = null;

  if (!isEmptyX) {
    xCoord = strToNum(xStr) / sf;
    xCoord = convertUnits(xCoord, units, 'px');
  }

  if (!isEmptyY) {
    yCoord = strToNum(yStr) / sf;
    yCoord = convertUnits(yCoord, units, 'px');
  }

  var point = null, coords = [];
  for (var i = 0, len = points.length;i < len;i++) {
    point = points[i];
    coords = getCoordValue(point, xCoord, isEmptyX, hasSignX, yCoord, isEmptyY, hasSignY, isFlipY);
    setPointCoord(point, coords, isFlipY);
  }
}

// Check empty string
function isEmpty(str) {
  return str === undefined || !str.replace(/\s/g, '').length;
}

// Check the sign of a string
function hasSign(str) {
  if (str.match(/^[+-]{2}/g)) return true;
  return false;
}

// Calculate the coordinates of a point based on the input values and point anchor
function getCoordValue(point, x, isEmptyX, hasSignX, y, isEmptyY, hasSignY, isFlipY) {
  if (isEmptyX) {
    x = point.anchor[0];
  } else if (hasSignX) {
    x = point.anchor[0] + x;
  }

  if (isFlipY) y *= -1;
  if (isEmptyY) {
    y = point.anchor[1];
  } else if (hasSignY) {
    y = point.anchor[1] + y;
  }

  return isFlipY ? [x, -y] : [x, y];
}

// Move point to given coordinate
function setPointCoord(point, coords, isFlipY) {
  var deltaX = coords[0] - point.anchor[0];
  var deltaY = coords[1] - (isFlipY ? -1 : 1) * point.anchor[1];

  if (isFlipY) {
    coords[1] *= -1;
    deltaY *= -1;
  }

  point.anchor = coords;
  var rd = point.rightDirection;
  var ld = point.leftDirection;
  point.rightDirection = [deltaX + rd[0], deltaY + rd[1]];
  point.leftDirection = [deltaX + ld[0], deltaY + ld[1]];
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
} catch (err) {}