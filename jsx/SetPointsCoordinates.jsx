/*
  SetPointsCoordinates.jsx for Adobe Illustrator
  Description: Sets the path points to the entered X and Y coordinate values. Supports offset delta, similar to the Move menu
  Created: July, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.0 (2026-11-04) 
  - Added buttons to insert averaged coordinates
  - Various fixes and improvements
  0.1.1 (2024-02-09) Removed input activation on Windows OS below CC v26.4
  0.1.0 (2023-07-31) Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via CloudTips: https://pay.cloudtips.ru/p/b81d370e
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2026 (Mac/Win).
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
        version: 'v0.2'
      };

  var CFG = {
        tolerance: 0.0001, // Inaccuracy of point coordinates
        units: getUnits(),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        uiMargins: [10, 15, 10, 10]
      };

  if (!isCorrectEnv('selection:1')) return;

  // Scale factor for Large Canvas mode
  var doc = app.activeDocument;
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // The rulers with the origin at the top left placed in the 4th quadrant
  // show Y inverted relative to the scripting DOM
  CFG.isFlipY = app.preferences.getBooleanPreference('isRulerOriginTopLeft')
      && app.preferences.getBooleanPreference('isRulerIn4thQuad');

  var currCoordSys = app.coordinateSystem;
  app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

  var paths = getPaths(selection);
  var points = getSelectedPoints(paths);
  if (!points.length) {
    alert('No selected points\nPlease, select path points', 'Script error');
    return false;
  }

  var base = getBaseCoords(points);
  var avgCoords = averageCoords(base);
  var isUndo = false;

  // ==========================================
  //  DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill','top'];

  // ==========================================
  //  COORDINATES
  // ==========================================
  var pnlCoord = win.add('panel', undefined, 'Points Coordinates');
      pnlCoord.alignChildren = ['fill','center'];
      pnlCoord.margins = CFG.uiMargins;

  // ==========================================
  //  AXIS * HORIZONTAL
  // ==========================================
  var grpX = pnlCoord.add('group');
      grpX.alignChildren = ['left', 'center'];

  grpX.add('statictext', undefined, 'X:');
  var inpX = grpX.add('edittext', undefined, '');
      inpX.characters = 7;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    inpX.active = true;
  }
  grpX.add('statictext', undefined, CFG.units);

  var btnAvgX = grpX.add('button', undefined, 'Avg');
      btnAvgX.preferredSize = [40, 24];
      btnAvgX.helpTip = 'Averaged value';

  // ==========================================
  //  AXIS * VERTICAL
  // ==========================================
  var grpY = pnlCoord.add('group');
      grpY.alignChildren = ['left', 'center'];

  grpY.add('statictext', undefined, 'Y:');
  var inpY = grpY.add('edittext', undefined, '');
      inpY.characters = 7;
  grpY.add('statictext', undefined, CFG.units);

  var btnAvgY = grpY.add('button', undefined, 'Avg');
      btnAvgY.preferredSize = [40, 24];
      btnAvgY.helpTip = 'Averaged value';

  var tip = "If you don't want to change a\ncoordinate, leave its field blank\nor keep the Mixed marker.\n"
      tip += "Use ++ or -- before a number\nto increment or decrement\nthe original coordinate.";
  inpX.helpTip = inpY.helpTip = tip;

  // ==========================================
  //  ORIGINAL COORDINATES
  // ==========================================
  var grpInfo = pnlCoord.add('group');
      grpInfo.orientation = 'column';
      grpInfo.alignChildren = ['fill', 'top'];

  grpInfo.add('statictext', undefined, 'Selected Points: ' + points.length, { multiline: true });
  var lblBase = grpInfo.add('statictext', undefined, '', { multiline: true });

  // ==========================================
  //  RULERS
  // ==========================================
  var chkUseAbCoord = win.add('checkbox', undefined, 'Use Artboard Rulers');
      chkUseAbCoord.value = true;
      chkUseAbCoord.helpTip = 'Use artboard rulers (ON)\nor global rulers (OFF).\nTyped values are converted'

  // ==========================================
  //  BUTTONS
  // ==========================================
  var grpBtns = win.add('group');
      grpBtns.orientation = 'row';
      grpBtns.alignChildren = ['fill', 'center'];

  var btnCancel, btnOk;
  if (CFG.isMac) {
      btnCancel = grpBtns.add('button', undefined, 'Cancel', { name: 'cancel' });
      btnOk = grpBtns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
      btnOk = grpBtns.add('button', undefined, 'OK', { name: 'ok' });
      btnCancel = grpBtns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  btnCancel.helpTip = 'Press Esc to Close';
  btnOk.helpTip = 'Press Enter to Run';

  // ==========================================
  //  FOOTER
  // ==========================================
  var grpFooter = win.add('group');
      grpFooter.alignment = ['fill', 'bottom'];

  var chkPreview = grpFooter.add('checkbox', undefined, 'Preview');
      chkPreview.alignment = ['left', 'center'];
      chkPreview.value = false;

  var btnAbout = grpFooter.add('button', undefined, '?');
      btnAbout.alignment = ['right', 'center'];
      btnAbout.preferredSize = [16, 16];
      btnAbout.helpTip = 'About';

  win.defaultElement = btnOk;
  win.cancelElement = btnCancel;

  // ==========================================
  //  EVENTS
  // ==========================================
  fillInputCoords(true, true, true);

  inpX.onChange = function () { onValueChange(this, true); };
  inpY.onChange = function () { onValueChange(this, false); };

  bindStepperKeys(inpX);
  bindStepperKeys(inpY);

  chkUseAbCoord.onClick = function () {
    fillInputCoords(false, false, false);
    convertCoordValue(inpX, false);
    convertCoordValue(inpY, true);
    preview();
  };

  btnAvgX.onClick = function () {
    var cur = toCurrentSystem([avgCoords.x, avgCoords.y]);
    inpX.text = formatCoord(cur[0], false, CFG);
    this.active = true;
    this.active = false;
    preview();
  };

  btnAvgY.onClick = function () {
    var cur = toCurrentSystem([avgCoords.x, avgCoords.y]);
    inpY.text = formatCoord(cur[1], true, CFG);
    this.active = true;
    this.active = false;
    preview();
  };

  btnCancel.onClick = win.close;
  btnOk.onClick = okClick;

  chkPreview.onClick = preview;
  if (chkPreview.value) preview();

  btnAbout.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];

    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = CFG.uiMargins;

    var overviewText = overviewPnl.add('statictext', undefined,
        SCRIPT.name + ' ' + SCRIPT.version + '\n\n' +
        'Moves the selected anchor points to the exact X, Y coordinates.\n\n' +
        'Key Features:\n' +
        '\u2022 Type an exact X and/or Y value, or use ++ / -- to shift by an offset\n' +
        '\u2022 Leave a field blank or Mixed to keep the axis unchanged\n' +
        '\u2022 Avg button inserts the averaged coordinate of the selected points\n' +
        '\u2022 Switch between artboard and global rulers with live Preview\n',
        { multiline: true });

    overviewText.preferredSize.width = 290;
    overviewText.preferredSize.height = CFG.aiVers > 16 ? 220 : 170;

    // Credit
    var authorPnl = helpWin.add('panel', undefined, 'Author');
        authorPnl.alignChildren = ['fill', 'top'];
        authorPnl.spacing = 15;
        authorPnl.margins = CFG.uiMargins;

    var authorWrapper = authorPnl.add('group');
        authorWrapper.orientation = 'column';
        authorWrapper.alignChildren = ['fill', 'top'];
        authorWrapper.spacing = 5;

    authorWrapper.add('statictext', undefined, '\u00A9 Sergey Osokin, 2023-2026');

    var mailWrapper = authorWrapper.add('group');
        mailWrapper.spacing = 5;
    mailWrapper.add('statictext', undefined, 'Contact:');
    var mailText = mailWrapper.add('statictext', undefined, 'hi@sergosokin.ru');

    var paidWrapper = authorPnl.add('group');
        paidWrapper.orientation = 'column';
        paidWrapper.alignChildren = ['fill', 'top'];
        paidWrapper.spacing = 5;

    paidWrapper.add('statictext', undefined, 'Paid scripts:');

    var bmcWrapper = paidWrapper.add('group');
        bmcWrapper.spacing = 5;
    bmcWrapper.add('statictext', undefined, '\u2022');
    var bmcText = bmcWrapper.add('statictext', undefined, 'buymeacoffee.com/aiscripts/extras');
    bmcWrapper.add('statictext', undefined, '(USD)');

    var roboWrapper = paidWrapper.add('group');
        roboWrapper.spacing = 5;
    roboWrapper.add('statictext', undefined, '\u2022');
    var roboText = roboWrapper.add('statictext', undefined, 'aiscripts.robo.market');
    roboWrapper.add('statictext', undefined, '(RUB)');

    var freeWrapper = authorPnl.add('group');
        freeWrapper.orientation = 'column';
        freeWrapper.alignChildren = ['fill', 'top'];
        freeWrapper.spacing = 5;

    freeWrapper.add('statictext', undefined, 'Free scripts:');

    var gitText = freeWrapper.add('statictext', undefined, 'github.com/creold');

    var helpBtns = helpWin.add('group');
        helpBtns.alignment = 'right';
    var helpOk = helpBtns.add('button', undefined, 'OK', { name: 'ok' });
    helpOk.onClick = helpWin.close;

    setTextHandler(mailText, function () {
      openURL('mailto:hi@sergosokin.ru');
    });

    setTextHandler(bmcText, function () {
      openURL('https://buymeacoffee.com/aiscripts/extras');
    });

    setTextHandler(roboText, function () {
      openURL('https://aiscripts.robo.market');
    });

    setTextHandler(gitText, function () {
      openURL('https://github.com/creold');
    });

    helpWin.center();
    helpWin.show();
  };

  win.onClose = function () {
    app.coordinateSystem = currCoordSys;
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  };

  /**
   * Fill the fields from the snapshot of the original anchors
   * @param {boolean} isX - True for the horizontal axis
   * @param {boolean} isY - True for the vertical axis
   * @param {boolean} isUpdate - True for update the fields
   */
  function fillInputCoords(isX, isY, isUpdate) {
    var cur = toCurrentSystem(base[0]);
    var txtX = isEqualAxis(base, 0, CFG.tolerance)
        ? formatCoord(cur[0], false, CFG)
        : 'Mixed';
    var txtY = isEqualAxis(base, 1, CFG.tolerance)
        ? formatCoord(cur[1], true, CFG)
        : 'Mixed';
    if (isUpdate) {
      if (isX) inpX.text = txtX;
      if (isY) inpY.text = txtY;
    }
    lblBase.text = 'Original Coordinates\nX: ' + txtX + ' Y: ' + txtY;
  }

  /**
   * Re-express a snapshot point in the active ruler system
   * @param {Array} pt - [x, y] point in the document system, px
   * @returns {Array} [x, y] point in the active system, px
   */
  function toCurrentSystem(pt) {
    return chkUseAbCoord.value
        ? convertPoint(pt,
            CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
            CoordinateSystem.ARTBOARDCOORDINATESYSTEM)
        : pt;
  }

  /**
   * Re-express the field value in the active ruler system.
   * Empty fields, the Mixed marker and ++/-- deltas stay unchanged:
   * a delta value is the same in the global and artboard systems
   * @param {Object} inp - Edittext element
   * @param {boolean} isY - True for the vertical axis
   */
  function convertCoordValue(inp, isY) {
    var txt = inp.text;
    if (isSkipAxis(txt) || hasPrefix(txt) || !/\d/.test(txt)) return;

    var px = convertUnits(strToNum(txt) / CFG.sf, CFG.units, 'px');
    if (isY && CFG.isFlipY) px = -px; // display -> DOM orientation

    var from = chkUseAbCoord.value
        ? CoordinateSystem.DOCUMENTCOORDINATESYSTEM
        : CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
    var to = chkUseAbCoord.value
        ? CoordinateSystem.ARTBOARDCOORDINATESYSTEM
        : CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

    var pt = convertPoint(isY ? [0, px] : [px, 0], from, to);
    px = isY ? pt[1] : pt[0];

    inp.text = formatCoord(px, isY, CFG);
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (chkPreview.value) {
        if (isUndo) {
          doc.swatches.add().remove();
          app.undo();
        }
        process(points, inpX.text, inpY.text, CFG, chkUseAbCoord.value);
        doc.swatches.add().remove();
        app.redraw();
        isUndo = true;
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Apply the field values and close the dialog
   */
  function okClick() {
    if (chkPreview.value && isUndo) app.undo();
    process(points, inpX.text, inpY.text, CFG, chkUseAbCoord.value);
    isUndo = false;
    win.close();
  }

  /**
   * Set up a clickable text handler with hover effects and callback execution
   * @param {Object} text - The statictext object to attach handlers to
   * @param {Function} callback - The function to execute on click
   */
  function setTextHandler(text, callback) {
    var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
    var gfx = text.graphics;
    var colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.8, 0.8, 0.8] : [0.3, 0.3, 0.3], 1); // Black
    var colHover = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.27, 0.62, 0.96] : [0.08, 0.45, 0.9], 1); // Blue

    gfx.foregroundColor = colNormal;

    // Hover effect: change color on mouseover
    text.addEventListener('mouseover', function () {
      gfx.foregroundColor = colHover;
      text.notify('onDraw');
    });

    // Revert color to normal
    text.addEventListener('mouseout', function () {
      gfx.foregroundColor = colNormal;
      text.notify('onDraw');
    });

    // Execute callback on click if provided
    text.addEventListener('mousedown', function () {
      if (typeof callback === 'function') callback(text);
    });
  }

  /**
   * Handle a change event for one of the coordinate input fields
   * @param {EditText} input - The input field that triggered the change
   * @param {boolean} isX - True if input represents the horizontal axis
   * @returns {void}
   */
  function onValueChange(input, isX) {
    var txt = input.text;
    if (isSkipAxis(txt)) {
      fillInputCoords(isX, !isX, true);
    } else if (!hasPrefix(txt)) {
      input.text = strToNum(txt);
    }
    preview();
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {EditText} input - The input element to which the event listener will be attached
   * @returns {void}
   */
  function bindStepperKeys(item) {
    item.addEventListener('keydown', function (kd) {
      var matches = this.text.match(/^[+-]{1,2}/g);
      var sign = (matches == null) ? '' : matches.toString();
      var str = this.text.replace(/^[+-]{2}/g, '');
      var keyState = ScriptUI.environment.keyboardState;
      var step = keyState['shiftKey'] ? 10 : (keyState['altKey'] ? 0.1 : 1);
      var num = 0;
      if (kd.keyName === 'Down') {
        num = strToNum(str) - step;
        this.text = (sign.length === 2) ? sign + Math.abs(num) : num;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName === 'Up') {
        num = strToNum(str) + step;
        this.text = (sign.length === 2) ? sign + Math.abs(num) : num;
        kd.preventDefault();
        preview();
      }
    });
  }

  win.center();
  win.show();
}

/**
 * Check if the environment is correct for running the script
 * @param {...string} [arguments] - List of initial data for verification
 * @returns {boolean} Return true if the environment is correct, false otherwise
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
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
        if (!app.documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Too few objects are selected\nPlease select ' + rqdLen + ' path(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get active document ruler units
 * @returns {string} Shortened units
 */
function getUnits() {
  if (!app.documents.length) return '';
  var key = app.activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
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
      var xmp = app.activeDocument.XMPString;
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'FeetInches') return 'ft';
        if (units == 'Yards') return 'yd';
      }
      return 'px';
    default: return 'px';
  }
}

/**
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Format a document-system coordinate
 * @param {number} domVal - Coordinate in the document system
 * @param {boolean} isY - True for the vertical axis
 * @param {Object} cfg - Script settings
 * @returns {string} Input value
 */
function formatCoord(domVal, isY, cfg) {
  if (isY && cfg.isFlipY) domVal = -domVal;
  return round(cfg.sf * convertUnits(domVal, 'px', cfg.units));
}

/**
 * Convert a point between coordinate systems
 * @param {Array} pt - [x, y] point, px
 * @param {CoordinateSystem} source - Source coordinate system
 * @param {CoordinateSystem} destination - Target coordinate system
 * @returns {Array} coord - [x, y] point, px
 */
function convertPoint(pt, source, destination) {
  var coord = app.activeDocument.convertCoordinate([pt[0], pt[1]], source, destination);
  return coord;
}

/**
 * Get paths from a collection of Illustrator PageItems
 * @param {PageItems|Array} coll - The collection of Illustrator PageItems
 * @returns {Array} results - An array containing the paths from the provided collection
 */
function getPaths(coll) {
  var paths = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      paths = [].concat(paths, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      paths = [].concat(paths, getPaths(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      paths.push(item);
    }
  }
  return paths;
}

/**
 * Get the selected anchor points of the paths
 * @param {Object|Array} coll - The collection of objects to search through
 * @returns {Array} points - An array of the selected PathPoint objects
 */
function getSelectedPoints(coll) {
  var points = [];
  for (var i = 0; i < coll.length; i++) {
    if (!coll[i].pathPoints) continue;
    for (var j = 0; j < coll[i].pathPoints.length; j++) {
      var pt = coll[i].pathPoints[j];
      if (pt.selected == PathPointSelection.ANCHORPOINT) {
        points.push(pt);
      }
    }
  }
  return points;
}

/**
 * Snapshot the anchor coordinates of the points
 * @param {Array} points - PathPoint objects
 * @returns {Array} coords - Array of [x, y] pairs in document coordinates
 */
function getBaseCoords(points) {
  var coords = [];
  for (var i = 0, len = points.length; i < len; i++) {
    coords.push([points[i].anchor[0], points[i].anchor[1]]);
  }
  return coords;
}

/**
 * Check all coordinates on one axis are equal
 * @param {Array} base - Array of [x, y] pairs
 * @param {number} idx - Axis index: 0 for X, 1 for Y
 * @param {number} tolerance - Max allowed difference
 * @returns {boolean} True if equal
 */
function isEqualAxis(points, idx, tolerance) {
  var coord = points[0][idx];
  for (var i = 1; i < points.length; i++) {
    if (Math.abs(coord - points[i][idx]) > tolerance) return false;
  }
  return true;
}

/**
 * Average the coordinates of the points
 * @param {Array} points - Array of [x, y] pairs, px
 * @returns {Object} {x, y} averaged coordinates, px
 */
function averageCoords(points) {
  var sumX = 0, sumY = 0;
  for (var i = 0, len = points.length; i < len; i++) {
    sumX += points[i][0];
    sumY += points[i][1];
  }
  return { x: round(sumX / len), y: round(sumY / len) };
}

/**
 * Round a number to four decimals
 * @param {number} value - The number to be rounded
 * @returns {number} The rounded number
 */
function round(value) {
  var digits = 10000;
  return Math.round(value * digits) / digits;
}

/**
 * Process the points coordinates
 * @param {Array} points - PathPoint objects
 * @param {string} xStr - X input value
 * @param {string} yStr - Y input value
 * @param {Object} cfg - Script settings
 * @param {boolean} isArtboard - Values are entered in the artboard system
 */
function process(points, xStr, yStr, cfg, isArtboard) {
  var isSkipX = isSkipAxis(xStr);
  var isSkipY = isSkipAxis(yStr);
  var isRelX = hasPrefix(xStr);
  var isRelY = hasPrefix(yStr);
  var xCoord = null, yCoord = null;

  if (!isSkipX) {
    xCoord = strToNum(xStr) / cfg.sf;
    xCoord = convertUnits(xCoord, cfg.units, 'px');

    if (isArtboard && !isRelX) {
      xCoord = convertPoint([xCoord, 0],
          CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
          CoordinateSystem.DOCUMENTCOORDINATESYSTEM)[0];
    }
  }

  if (!isSkipY) {
    yCoord = strToNum(yStr) / cfg.sf;
    yCoord = convertUnits(yCoord, cfg.units, 'px');
    if (cfg.isFlipY) yCoord = -yCoord;
    if (isArtboard && !isRelY) {
      yCoord = convertPoint([0, yCoord],
          CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
          CoordinateSystem.DOCUMENTCOORDINATESYSTEM)[1];
    }
    if (cfg.isFlipY) yCoord = -yCoord;
  }

  var point = null, coords = [];
  for (var i = 0, len = points.length;i < len;i++) {
    point = points[i];
    coords = getCoordValue(point, xCoord, isSkipX, isRelX, yCoord, isSkipY, isRelY, cfg.isFlipY);
    setPointCoord(point, coords, cfg.isFlipY);
  }
}

/**
 * Check the field value means the axis stays untouched:
 * empty or contains the Mixed marker
 * @param {string} str - Field value
 * @returns {boolean} True if the axis must not change
 */
function isSkipAxis(str) {
  return isEmpty(str) || /mixed/i.test(str);
}

/**
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str === undefined || !str.replace(/\s/g, '').length;
}

/**
 * Check a string has the relative offset prefix '++' or '--'
 * @param {string} str - String to check
 * @returns {boolean} True if the prefix exists
 */
function hasPrefix(str) {
  if (str.match(/^[+-]{2}/g)) return true;
  return false;
}

/**
 * Calculate the point coordinates from the input values and the anchor
 * @param {Object} point - PathPoint
 * @param {number|null} x - Target X, px
 * @param {boolean} isSkipX - X axis stays untouched
 * @param {boolean} isRelX - X value is a relative offset
 * @param {number|null} y - Target Y, px
 * @param {boolean} isSkipY - Y axis stays untouched
 * @param {boolean} isRelY - Y value is a relative offset
 * @param {boolean} isFlipY - Rulers show Y inverted
 * @returns {Array} [x, y] target coordinates, px
 */
function getCoordValue(point, x, isSkipX, isRelX, y, isSkipY, isRelY, isFlipY) {
  if (isSkipX) {
    x = point.anchor[0];
  } else if (isRelX) {
    x = point.anchor[0] + x;
  }

  if (isFlipY) y *= -1;
  if (isSkipY) {
    y = point.anchor[1];
  } else if (isRelY) {
    y = point.anchor[1] + y;
  }

  return isFlipY ? [x, -y] : [x, y];
}

/**
 * Move the point and its handles to the given coordinates
 * @param {Object} point - PathPoint
 * @param {Array} coords - [x, y] target coordinates, px
 * @param {boolean} isFlipY - Rulers show Y inverted
 */
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

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 0;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Open a URL in the default web browser
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
 */
function openURL(url) {
  var path = Folder.myDocuments + '/Adobe Scripts/';
  if (!Folder(path).exists) Folder(path).create();
  var html = new File(path + '/aisLink.html');
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