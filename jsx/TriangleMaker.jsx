/*
  TriangleMaker.jsx for Adobe Illustrator
  Description: Draws a triangle with dimensions for one or two sides and angle(s)
  Date: March, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Original idea by Carlos Canto (Nov 21, 2013)
  Discussion: https://community.adobe.com/t5/illustrator-discussions/custom-angled-triangles-question/m-p/5628371

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added user interface. New options. Updated algorithm
  0.1 Initial version (by Carlos Canto)

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Triangle Maker',
        version: 'v0.2'
      };

  var CFG = {
        units: getUnits(),
        rgb: [0, 0, 0],
        cmyk: [0, 0, 0, 100],
        uiMargins: [10, 15, 10, 7],
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };
  
  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return false;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return false;
  }

  // GLOBAL VARIABLES
  var doc = app.activeDocument;
  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;
  var lay = getEditableLayer(doc);

  // Create triangle color
  var triangleColor;
  if (/rgb/i.test(doc.documentColorSpace)) {
    triangleColor = new RGBColor();
    triangleColor.red = CFG.rgb[0];
    triangleColor.green = CFG.rgb[1];
    triangleColor.blue = CFG.rgb[2];
  } else {
    triangleColor = new CMYKColor();
    triangleColor.cyan = CFG.cmyk[0];
    triangleColor.magenta = CFG.cmyk[1];
    triangleColor.yellow = CFG.cmyk[2];
    triangleColor.black = CFG.cmyk[3];
  }

  // Triangle vertices
  var p1, p2, p3;

  var selPoints = [];
  if (app.selection.length && /path/i.test(app.selection[0].typename)) {
    selPoints = getSelectedPoints(app.selection[0]);
  }

  // Calc screen view position
  var viewSize = doc.views[0].bounds;
  var viewCenterX = viewSize[0] + (viewSize[2] - viewSize[0]) / 2;
  var viewCenterY = viewSize[3] + (viewSize[1] - viewSize[3]) / 2;

  var isUndo = false; // For preview

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'fill'];
      win.spacing = 20;
      win.margins = 16;
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');
      wrapper.orientation = 'row';
      wrapper.spacing = 20;
      wrapper.alignChildren = ['fill', 'fill'];

  // LEFT COLUMN
  var colLeft = wrapper.add('group');
      colLeft.orientation = 'column';
      colLeft.spacing = 15;
      colLeft.alignChildren = ['fill', 'top'];

  // DRAW MODE
  var modePnl = colLeft.add('panel', undefined, 'Mode');
      modePnl.orientation = 'column';
      modePnl.alignChildren = ['fill', 'top'];
      modePnl.margins = CFG.uiMargins;

  var isOneAngle = modePnl.add('radiobutton', undefined, '2 Sides and Angle');
      isOneAngle.value = true;
  var isTwoAngle = modePnl.add('radiobutton', undefined, 'Side and 2 Angles');

  // SIDE LENGTH
  var sidePnl = colLeft.add('panel', undefined, 'Sides Length');
      sidePnl.orientation = 'column';
      sidePnl.alignChildren = ['fill', 'top'];
      sidePnl.margins = CFG.uiMargins;

  // First Side
  var side1Group = sidePnl.add('group');
      side1Group.orientation = 'row';
      side1Group.alignChildren = ['fill', 'center'];

  side1Group.add('statictext', undefined, 'Side 1:');
  var side1Inp = side1Group.add('edittext', undefined, '120 ' + CFG.units);
      side1Inp.characters = 7;

  // Second Side
  var side2Group = sidePnl.add('group');
      side2Group.orientation = 'row';
      side2Group.alignChildren = ['fill', 'center'];

  side2Group.add('statictext', undefined, 'Side 2:');
  var side2Inp = side2Group.add('edittext', undefined, '100 ' + CFG.units);
      side2Inp.characters = 7;
      side2Inp.enabled = true;

  // ANGLE
  var anglePnl = colLeft.add('panel', undefined, 'Angles');
      anglePnl.orientation = 'column';
      anglePnl.alignChildren = ['fill', 'center'];
      anglePnl.margins = CFG.uiMargins;

  // First angle
  var angle1Group = anglePnl.add('group');
      angle1Group.orientation = 'row';
      angle1Group.alignChildren = ['fill', 'center'];

  angle1Group.add('statictext', undefined, 'Angle 1:');
  var angle1Inp = angle1Group.add('edittext', undefined, '30\u00B0');
      angle1Inp.characters = 7;

  // Second angle
  var angle2Group = anglePnl.add('group');
      angle2Group.orientation = 'row';
      angle2Group.alignChildren = ['fill', 'center'];

  angle2Group.add('statictext', undefined, 'Angle 2:');
  var angle2Inp = angle2Group.add('edittext', undefined, '57\u00B0');
      angle2Inp.characters = 7;
      angle2Inp.enabled = false;

  var isAddInfo = colLeft.add('checkbox', undefined, 'Add Triangle Data As Text');
      isAddInfo.value = false;

  // RIGHT COLUMN
  var colRight = wrapper.add('group');
      colRight.orientation = 'column';
      colRight.alignChildren = ['fill', 'fill'];
      colRight.preferredSize.width = 120;

  // BUTTONS
  var btns = colRight.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];

  var ok = btns.add('button', undefined, 'OK');
      ok.helpTip = 'Press Enter to Run';
  var cancel = btns.add('button', undefined, 'Cancel');
      cancel.helpTip = 'Press Esc to Close';
  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = false;

  var info = btns.add('statictext', undefined, '', {multiline:true});
      info.alignment = ['fill', 'top'];

  info.text = 'Triangle:\n\n';
  info.text += 'Side 1: ' + side1Inp.text + '\n';
  info.text += 'Side 2: ' + side2Inp.text + '\n';
  info.text += 'Side 3: ' + side2Inp.text + '\n';
  info.text += 'Total: 0 ' + CFG.units + '\n\n';
  info.text += 'Angle 1: ' + angle1Inp.text + '\n';
  info.text += 'Angle 2: ' + angle2Inp.text + '\n';
  info.text += 'Angle 3: ' + angle2Inp.text;

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Click Here To Visit Github');
      copyright.justify  = 'center';
      copyright.alignment = ['fill', 'center'];

  // EVENT HANDLERS
  loadSettings(SETTINGS);
  getTriangleInfo();

  isTwoAngle.onClick = function () {
    side2Inp.enabled = false;
    angle2Inp.enabled = true;
    getTriangleInfo();
    preview();
  };

  isOneAngle.onClick = function () {
    side2Inp.enabled = true;
    angle2Inp.enabled = false;
    getTriangleInfo();
    preview();
  };

  shiftInputNumValue(side1Inp, 0.1, 100000, ' ' + CFG.units);
  shiftInputNumValue(side2Inp, 0.1, 100000, ' ' + CFG.units);
  shiftInputNumValue(angle1Inp, 1, 180, '\u00B0');
  shiftInputNumValue(angle2Inp, 1, 180, '\u00B0');

  side1Inp.onChange = side2Inp.onChange = function () {
    validateInput(this, 0.1, 100000, ' ' + CFG.units);
    getTriangleInfo();
    preview();
  }

  angle1Inp.onChange = angle2Inp.onChange = function () {
    validateInput(this, 1, 180, '\u00B0');
    getTriangleInfo();
    preview();
  }

  isPreview.onClick = preview;

  ok.onClick = function () {
    saveSettings(SETTINGS);

    if (isPreview.value && isUndo) app.undo();
    isUndo = false;

    var triangle = drawTriangle();

    // Show triangle data
    if (isAddInfo.value) {
      var tf = triangle.layer.textFrames.add();
      tf.contents = info.text.replace(/\n/g, '\r');
      tf.position = [p1[0], p1[1] - 10];
      var charAttr = tf.textRange.characterAttributes;
      charAttr.size = 6;
      var ratio = (0.35 * triangle.width / tf.width) * 100;
      tf.resize(ratio, ratio, true, true, true, true, 100, Transformation.TOPLEFT);
      if (charAttr.size < 2) charAttr.size = 2;
      if (charAttr.size > 1296) charAttr.size = 1296;
    }

    win.close();
  }

  cancel.onClick = function () {
    win.close();
  };

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        drawTriangle();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  function drawTriangle() {
    getTriangleInfo();

    var triangle = lay.pathItems.add();
    triangle.setEntirePath([p1, p2, p3]);
    triangle.closed = true;
    triangle.stroked = false;
    triangle.filled = true;
    triangle.fillColor = triangleColor;

    return triangle

  }

  /**
   * Calculate the sides and angles of a triangle based on user input
   * @returns {void} 
   */
  function getTriangleInfo() {
    var side1 = convertUnits( strToNum(side1Inp.text, 1), CFG.units, 'pt') / CFG.sf;
    var side2 = convertUnits( strToNum(side2Inp.text, 1), CFG.units, 'pt') / CFG.sf;
    var side3 = 0;

    var angle1 = strToNum(angle1Inp.text, 1);
    var angle2 = strToNum(angle2Inp.text, 1);
    var angle3 = 0;

    // Validate angles based on mode
    if (isOneAngle.value) {
      if (angle1 >= 180) {
        angle1 = 179;
        angle1Inp.text = angle1 + '\u00B0';
      }
    } else {
      if (angle1 + angle2 >= 180) {
        angle1 = 179;
        angle1Inp.text = angle1 + '\u00B0';
        angle2 = 1;
        angle2Inp.text = angle2 + '\u00B0';
      }
    }

    // Triangle vertices
    p1 = selPoints.length ? selPoints[0] : [viewCenterX - side1 / 2, viewCenterY];
    p2 = selPoints.length ? [selPoints[0][0] + side1, selPoints[0][1]] : [viewCenterX + side1 / 2, viewCenterY];

    var rad1 = toRadians(angle1);
    var rad2 = toRadians(angle2);

    if (isOneAngle.value) { // Mode: 2 Sides + 1 Angle
      p3 = [
        p1[0] + side2 * Math.cos(rad1),
        p1[1] + side2 * Math.sin(rad1)
      ];
    } else { // Mode: 1 Side + 2 Angles
      p3 = [
        p1[0] + (side1 * Math.sin(rad2)) / Math.sin(Math.PI - rad1 - rad2) * Math.cos(rad1),
        p1[1] + (side1 * Math.sin(rad2)) / Math.sin(Math.PI - rad1 - rad2) * Math.sin(rad1)
      ];
    }

    side1 = distance(p1[0], p1[1], p2[0], p2[1]); // AB
    side2 = distance(p3[0], p3[1], p1[0], p1[1]); // CA
    side3 = distance(p2[0], p2[1], p3[0], p3[1]); // BC

    side1 = convertUnits(side1, 'pt', CFG.units) * CFG.sf;
    side2 = convertUnits(side2, 'pt', CFG.units) * CFG.sf;
    side3 = convertUnits(side3, 'pt', CFG.units) * CFG.sf;

    var total = side1 + side2 + side3;

    var angle1 = calculateAngle(side3, side1, side2); // Angle C
    var angle2 = calculateAngle(side2, side1, side3); // Angle B
    var angle3 = calculateAngle(side1, side2, side3); // Angle A

    var newValues = {
      'Side 1': side1.toFixed(2),
      'Side 2': side2.toFixed(2),
      'Side 3': side3.toFixed(2),
      'Total': total.toFixed(2),
      'Angle 1': angle1.toFixed(2),
      'Angle 2': angle2.toFixed(2),
      'Angle 3': angle3.toFixed(2)
    };

    info.text = info.text.replace(/(Side|Total|Angle)\s?(\d+)?:\s?(\d+(?:\.\d+)?)/g, 
      function(match, type, num, oldValue) {
        var key = num ? type + ' ' + num : type; // Remove undefined
        return newValues.hasOwnProperty(key) ? key + ': ' + newValues[key] : match;
      });
  }

  /**
  * Handle keyboard input to shift numerical values
  * @param {Object} item - The input element to which the event listener will be attached
  * @param {number} min - The minimum allowed value for the numerical input
  * @param {number} max - The maximum allowed value for the numerical input
  * @param {string} sign - The suffix for the numerical input
  * @returns {void}
  */
  function shiftInputNumValue(item, min, max, sign) {
    item.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = strToNum(this.text, min);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        if (min && (num - step) < min) {
          this.text = min + sign;
        } else {
          this.text = (num - step) + sign;
        }
        kd.preventDefault();
        getTriangleInfo();
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        if (max && (num + step) > max) {
          this.text = max + sign;
        } else {
          this.text = (num + step) + sign;
        }
        kd.preventDefault();
        getTriangleInfo();
        preview();
      }
    });
  }

  /**
   * Validate the input value of a text field and ensures it falls within the specified range
   * The corresponding slider value is also updated if a slider is provided
   * @param {Object} item - The input object containing the text field to validate
   * @param {number} min - The minimum allowed value for the input
   * @param {number} max - The maximum allowed value for the input
   * @param {string} sign - The suffix for the numerical input
   * @returns {void}
   */
  function validateInput(item, min, max, sign) {
    var num = strToNum(item.text, min);
    num = num < min ? min : (num > max ? max : num);
    item.text = num + sign;
  }

  /**
   * Save UI options to a file
   * @param {object} prefs - Object containing preferences
   */
  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.mode = isOneAngle.value;
    data.side1 = side1Inp.text;
    data.side2 = side2Inp.text;
    data.angle1 = angle1Inp.text;
    data.angle2 = angle2Inp.text;
    data.legend = isAddInfo.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (!f.exists) return;

    try {
      f.encoding = 'UTF-8';
      f.open('r');
      var json = f.readln();
      try { var data = new Function('return (' + json + ')')(); }
      catch (err) { return; }
      f.close();

      if (typeof data != 'undefined') {
        win.location = [
          data.win_x ? parseInt(data.win_x) : 100,
          data.win_y ? parseInt(data.win_y) : 100
        ];
        side1Inp.text = parseFloat(data.side1) + ' ' + CFG.units;
        side2Inp.text = parseFloat(data.side2) + ' ' + CFG.units;
        angle1Inp.text = data.angle1;
        angle2Inp.text = data.angle2;
        if (data.mode) {
          isOneAngle.value = data.mode === 'true';
          isTwoAngle.value = data.mode === 'false';
          side2Inp.enabled = isOneAngle.value;
          angle2Inp.enabled = !isOneAngle.value;
        }
        isAddInfo.value = data.legend === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get active document ruler units
 * @returns {string} - Shortened units
 */
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

/**
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} - The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Get an editable layer from the active document
 * @param {Object} doc - The Illustrator document to search for editable layers
 * @returns {Object} - The first editable layer found or created
 */
function getEditableLayer(doc) {
  var activeLay = doc.activeLayer;

  if (activeLay.visible && !activeLay.locked) {
    return activeLay;
  }

  for (var i = 0, len = doc.layers.length; i < len; i++) {
    var currLay = doc.layers[i];
    if (currLay.visible && !currLay.locked) {
      doc.activeLayer = currLay;
      return currLay;
    }
  }

  doc.layers[0].visible = true
  doc.layers[0].locked = false;
  doc.activeLayer = doc.layers[0];

  return doc.layers[0];
}

/**
 * Extract the anchor points of any selected path points
 * @param {Object} item - The object to search
 * @returns {boolean} - An array of the [x, y] coordinates of a selected anchor point
 */
function getSelectedPoints(item) {
  var coords = [];

  if (item.hasOwnProperty('pathPoints')) {
    for (var j = 0; j < item.pathPoints.length; j++) {
      var pt = item.pathPoints[j];
      if (isSelected(pt)) coords.push(pt.anchor);
    }
  }

  return coords;
}

/**
 * Check whether a given point is selected or not
 * @param {Object} point - The point to check
 * @returns {boolean} - True if the point is selected, false otherwise
 */
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Convert an angle from degrees to radians
 * @param {number} angle - The angle in degrees to be converted
 * @returns {number} - The equivalent angle in radians
 */
function toRadians(angle) {
  return angle * (Math.PI / 180);
}

/**
 * Convert an angle from radians to degrees
 * @param {number} angle - The angle in radians to be converted
 * @returns {number} - The equivalent angle in degrees
 */
function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate the Euclidean distance between two points
 * @param {number} x1 - The x-coordinate of the first point
 * @param {number} y1 - The y-coordinate of the first point
 * @param {number} x2 - The x-coordinate of the second point
 * @param {number} y2 - The y-coordinate of the second point
 * @returns {number} - The distance between points (x1,y1) and (x2,y2)
 */
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Calculate the angle opposite to side 'a' in a triangle using the Law of Cosines
 * The triangle has sides of length a, b, and c
 * @param {number} a - The length of the side opposite the angle we're calculating
 * @param {number} b - The length of one adjacent side
 * @param {number} c - The length of the other adjacent side
 * @returns {number} - The angle in degrees opposite to side 'a'
 */
function calculateAngle(a, b, c) {
  var rad = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2)) / (2 * b * c));
  return toDegrees(rad);
}

/**
 * Open a URL in the default web browser
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
*/
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

/**
 * Serialize a JavaScript plain object into a JSON-like string
 * @param {Object} obj - The object to serialize
 * @returns {string} - A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\\t")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

// Run script
try {
  main();
} catch (err) {}