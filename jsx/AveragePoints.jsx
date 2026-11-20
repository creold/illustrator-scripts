/*
  AveragePoints.jsx for Adobe Illustrator
  Description: Averages the selected points of paths and optionally joins point pairs
  Created: October, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.0 (2026-11-04) Added rounding averaged coordinates to a custom step
  0.1.0 (2026-10-29) Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via CloudTips: https://pay.cloudtips.ru/p/b81d370e
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2027 (Mac/Win).
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
    name: 'Average Points',
    version: 'v0.1.0'
  };

  var CFG = {
        units: getUnits(), // Active document units
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        uiMargins: [10, 15, 10, 8],
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('version:16', 'selection')) return;

  var doc = app.activeDocument;
  var currCoordSys = app.coordinateSystem;

  var allPoints = getSelectedPoints(app.selection);
  var isUndo = false;
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  if (allPoints.length < 2) {
    alert('Too few points are selected\nSelect at least two points of one or more paths and try again', 'Script Error');
    return;
  }

  app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

  // ==========================================
  //  DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.uiOpacity;

  var wrapperRow = win.add('group');
      wrapperRow.orientation = 'row';
      wrapperRow.alignChildren = ['fill', 'fill'];
      wrapperRow.spacing = 15;

  var wrapperL = wrapperRow.add('group');
      wrapperL.orientation = 'column';
      wrapperL.alignChildren = ['fill', 'fill'];

  // ==========================================
  //  TOLERANCE
  // ==========================================
  var pnlPoints = wrapperL.add('panel', undefined, 'Points');
      pnlPoints.orientation = 'column';
      pnlPoints.alignChildren = ['fill', 'fill'];
      pnlPoints.margins = CFG.uiMargins;

  var grpTolerance = pnlPoints.add('group');
      grpTolerance.orientation = 'row';
      grpTolerance.alignChildren = ['fill', 'fill'];

  grpTolerance.add('statictext', undefined, 'Tolerance:');
  var etTolerance = grpTolerance.add('edittext', undefined, '5');
      etTolerance.characters = 5;
      etTolerance.active = true;
      etTolerance.helpTip = 'Max distance for grouping points.\nArrows: +/-1\nShift+Arrows: +/-10\nAlt+Arrows: +/-0.1';
  grpTolerance.add('statictext', undefined, CFG.units);

  // ==========================================
  //  FILTER POINTS TYPE
  // ==========================================
  var chkEndsOnly = pnlPoints.add('checkbox', undefined, 'Process Endpoints Only');
      chkEndsOnly.helpTip = 'Work only with the endpoints\namong the selected points';

  // ==========================================
  //  JOIN
  // ==========================================
  var chkJoin = pnlPoints.add('checkbox', undefined, 'Join Pairs of Two Points');
      chkJoin.value = true;
      chkJoin.helpTip = 'Join every cluster of two endpoints.\nJoining runs only after OK is pressed'

  // ==========================================
  //  AXIS
  // ==========================================
  var pnlAxis = wrapperL.add('panel', undefined, 'Axis');
      pnlAxis.orientation = 'column';
      pnlAxis.alignChildren = ['fill', 'fill'];
      pnlAxis.margins = CFG.uiMargins;

  var rbHorizontal = pnlAxis.add('radiobutton', undefined, 'Horizontal');
      rbHorizontal.helpTip = 'Align the selected points\non a horizontal lineby averaging\ntheir Y coordinate';
  var rbVertical = pnlAxis.add('radiobutton', undefined, 'Vertical');
      rbVertical.helpTip = 'Align the selected points\non a vertical line by averaging\ntheir X coordinates';
  var rbBoth = pnlAxis.add('radiobutton', undefined, 'Both');
      rbBoth.value = true;
      rbBoth.helpTip = 'Move the selected points\nto the average of both coordinates';

  // ==========================================
  //  ROUND COORDINATES
  // ==========================================
  var pnlSnap = wrapperL.add('panel', undefined, 'Snap');
      pnlSnap.orientation = 'column';
      pnlSnap.alignChildren = ['fill', 'fill'];
      pnlSnap.margins = CFG.uiMargins;

  var grpRound = pnlSnap.add('group');
      grpRound.orientation = 'row';
      grpRound.alignChildren = ['fill', 'center'];

  var chkRound = grpRound.add('checkbox', undefined, 'Round to');
      chkRound.helpTip = 'Round each averaged coordinate\nto the nearest multiple of the step';
  var etRound = grpRound.add('edittext', undefined, '1');
      etRound.characters = 4;
      etRound.enabled = false;
      etRound.helpTip = chkRound.helpTip;
  grpRound.add('statictext', undefined, CFG.units);

  // ==========================================
  //  RULERS
  // ==========================================
  var chkUseAbCoord = pnlSnap.add('checkbox', undefined, 'Use Artboard Rulers');
      chkUseAbCoord.value = true;
      chkUseAbCoord.helpTip = 'Snap rounded coordinates to the grid\nof artboard rulers (ON) or global rulers (OFF)';

  var wrapperR = wrapperRow.add('group');
      wrapperR.orientation = 'column';
      wrapperR.alignment = ['fill', 'fill'];

  var grpActions = wrapperR.add('group');
      grpActions.orientation = 'column';
      grpActions.alignChildren = ['fill', 'fill'];

  var btnEdge = grpActions.add('button', undefined, 'Toggle Edges', { name: 'edges' });
      btnEdge.helpTip = 'Toggle object edges visibility.\nMenu View > Hide/Show Edges';

  var grpBtns = grpActions.add('group');
      grpBtns.orientation = 'column';
      grpBtns.alignChildren = ['fill', 'top'];

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
  //  LINE INFO
  // ==========================================
  var lblInfo = grpBtns.add('statictext', undefined, 'Selected Points:\n' + allPoints.length, { multiline: true });
      lblInfo.alignment = 'fill';
      lblInfo.graphics.foregroundColor = lblInfo.graphics.newPen(
        lblInfo.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1
      );

  // ==========================================
  //  FOOTER
  // ==========================================
  var grpFooter = wrapperR.add('group');
      grpFooter.alignment = ['fill', 'bottom'];
      grpFooter.margins = [0, 0, 0, CFG.uiMargins[3]];

  var chkPreview = grpFooter.add('checkbox', undefined, 'Preview');
      chkPreview.alignment = ['left', 'center'];
      chkPreview.value = false;

  var btnAbout = grpFooter.add('button', undefined, '?');
      btnAbout.alignment = ['right', 'center'];
      btnAbout.preferredSize = [16, 16];
      btnAbout.helpTip = 'About';

  var progressBar = win.add('progressbar', undefined, 0, 100);
      progressBar.preferredSize.height = 4;
      progressBar.alignment = ['fill', 'fill'];

  win.defaultElement = btnOk;
  win.cancelElement = btnCancel;

  // ==========================================
  //  EVENTS
  // ==========================================
  loadSettings(SETTINGS);

  var workPoints = filterPoints(allPoints, chkEndsOnly.value);
  lblInfo.text = lblInfo.text.replace(/\d+$/, workPoints.length);

  rbHorizontal.onClick = rbVertical.onClick = rbBoth.onClick = preview;
  chkUseAbCoord.onClick = preview;
  chkPreview.onClick = preview;
  etTolerance.onChange = preview;

  bindStepperKeys(etTolerance, 0, Infinity);

  chkRound.onClick = function () {
    etRound.enabled = chkUseAbCoord.enabled = this.value;
    preview();
  };

  etRound.onChange = function () {
    if (chkRound.value) preview();
  };

  bindStepperKeys(etRound, 0, Infinity);

  chkEndsOnly.onClick = function () {
    workPoints = filterPoints(allPoints, this.value);
    lblInfo.text = lblInfo.text.replace(/\d+$/, workPoints.length);
    if (workPoints.length < 2) return;
    preview();
  }

  btnEdge.onClick = function () {
    this.active = true;
    this.active = false;
    app.executeMenuCommand('edge');
  };

  btnCancel.onClick = win.close;

  btnOk.onClick = function () {
    saveSettings(SETTINGS);
    var settings = readSettings();
    if (chkPreview.value && isUndo) app.undo();
    isUndo = false;
    applyAverageAndJoin(workPoints, settings);
    removeZeroPaths(allPoints);
    win.close();
  };

  btnAbout.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];

    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = CFG.uiMargins;

    var overviewText = overviewPnl.add('statictext', undefined,
        SCRIPT.name + ' ' + SCRIPT.version + '\n\n' + 
        'This Illustrator script script averages the selected endpoints of paths and can optionally join points\n\n' +
        'Key Features:\n' +
        '\u2022 Horizontal, Vertical and Both averaging axes\n' + 
        '\u2022 Selected points within the tolerance are grouped and averaged together\n' +
        '\u2022 Handle directions keep their offset from the anchor\n' +
        '\u2022 Round averaged coordinates to a grid step of artboard or global rulers\n' +
        '\u2022 Optional Join for clusters of two endpoints\n',
        { multiline: true });
    
    overviewText.preferredSize.width = 310;
    overviewText.preferredSize.height = CFG.aiVers > 16 ? 220 : 130;

    // Credit
    var authorPnl = helpWin.add('panel', undefined, 'Author');
        authorPnl.alignChildren = ['fill', 'top'];
        authorPnl.spacing = 15;
        authorPnl.margins = CFG.uiMargins;

    var authorWrapper = authorPnl.add('group');
        authorWrapper.orientation = 'column';
        authorWrapper.alignChildren = ['fill', 'top'];
        authorWrapper.spacing = 5;

    authorWrapper.add('statictext', undefined, '\u00A9 Sergey Osokin, 2026');

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
      if (isUndo) {
        app.undo();
        app.redraw();
      }
    } catch (err) {}
    isUndo = false;
  };

  // ==========================================
  //  HELPERS
  // ==========================================
  /**
   * Handle keyboard input to shift numerical values
   * @param {EditText} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var keyState = ScriptUI.environment.keyboardState;
      var step = keyState['shiftKey'] ? 10 : (keyState['altKey'] ? 0.1 : 1);
      var num = parseFloat(this.text) || 0;
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket' || kd.keyName == 'Minus') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket' || kd.keyName == 'Equal' || kd.keyName == 'Plus') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
        preview();
      }
    });
  }

  /**
   * Read the dialog state
   * @returns {Object|null} {axis, join, tolerance}
   */
  function readSettings() {
    var tolerance = strToAbsNum(etTolerance.text, 0);
    tolerance = convertUnits(tolerance, CFG.units, 'px') / CFG.sf;

    var roundStep = 0;
    if (chkRound.value) {
      roundStep = strToAbsNum(etRound.text, 1);
      roundStep = convertUnits(roundStep, CFG.units, 'px') / CFG.sf;
    }

    var axis = 'both';
    if (rbHorizontal.value) axis = 'horizontal';
    else if (rbVertical.value) axis = 'vertical';

    return {
      axis: axis,
      join: chkJoin.value,
      tolerance: tolerance,
      roundStep: roundStep,
      isAbRuler: chkUseAbCoord.value,
      progress: progressBar
    };
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
        var settings = readSettings();
        applyAverage(workPoints, settings);
        doc.swatches.add().remove();
        app.redraw();
        isUndo = true;
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {
      alert(err + ': on line ' + err.line, 'Script Error', true);
    }
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
   * Save UI options to a file
   * @param {Object} prefs - Object containing preferences
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
    data.axis = rbHorizontal.value ? 0 : (rbVertical.value ? 1 : 2);
    data.tolerance = etTolerance.text;
    data.isRound = chkRound.value;
    data.roundStep = etRound.text;
    data.isAbRuler = chkUseAbCoord.value;
    data.isEnds = chkEndsOnly.value;
    data.isJoin = chkJoin.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {Object} prefs - Object containing preferences
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (!f.exists) return;

    try {
      f.encoding = 'UTF-8';
      f.open('r');
      var json = f.readln();
      f.close();
      try { var data = new Function('return (' + json + ')')(); }
      catch (err) { return; }

      if (typeof data != 'undefined') {
        win.location = [
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];
        pnlAxis.children[parseInt(data.axis) || 0].value = true;
        etTolerance.text = strToAbsNum(data.tolerance, 0);
        chkRound.value = data.isRound === 'true';
        etRound.text = strToAbsNum(data.roundStep, 1);
        etRound.enabled = chkRound.value;
        chkUseAbCoord.value = data.isAbRuler === 'true';
        chkUseAbCoord.enabled = chkRound.value;
        chkEndsOnly.value = data.isEnds === 'true';
        chkJoin.value = data.isJoin === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get active document ruler units
 * @returns {string} Shortened units
 */
function getUnits() {
  if (!documents.length) return '';
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
 * @returns {number} The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Convert a point between coordinate systems
 * @param {Array} pt - [x, y] point, px
 * @param {CoordinateSystem} source - Source coordinate system
 * @param {CoordinateSystem} destination - Target coordinate system
 * @returns {Array} [x, y] point, px
 */
function convertPoint(pt, source, destination) {
  return app.activeDocument.convertCoordinate([pt[0], pt[1]], source, destination);
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
 * Collect the selected anchor points of paths
 * @param {PageItems} coll - The collection of Illustrator items
 * @param {Array} results - Records of {path, point, isStart} for selected anchors
 */
function getSelectedPoints(coll) {
  var results = [];
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (!item.editable) continue;
    if (item.typename === 'PathItem') {
      results = [].concat(results, getPointsFromPath(item));
    } else if (item.typename === 'GroupItem') {
      results = [].concat(results, getSelectedPoints(item.pageItems));
    } else if (item.typename === 'CompoundPathItem') {
      results = [].concat(results, getSelectedPoints(item.pathItems));
    }
  }
  return results;
}

/**
 * Get the selected points of a single path
 * @param {PathItem} path - source path
 * @returns {Array} results - Entries for selected anchor points
 */
function getPointsFromPath(path) {
  var pp = path.pathPoints;
  if (pp.length < 2) return [];

  var last = pp.length - 1;
  var results = [];

  for (var i = 0; i <= last; i++) {
    if (pp[i].selected !== PathPointSelection.ANCHORPOINT) continue;
    var isStart = null;
    if (!path.closed) {
      if (i == 0) isStart = true;
      else if (i == last) isStart = false;
    }
    results.push({ path: path, point: pp[i], isStart: isStart });
  }

  return results;
}

/**
 * Keep only the records of path endpoints
 * @param {Array} points - Collected point records
 * @param {boolean} isEndsOnly - True to drop the middle points
 * @returns {Array} ends - Filtered records
 */
function filterPoints(points, isEndsOnly) {
  if (!isEndsOnly) return points;
  var ends = [];
  for (var i = 0; i < points.length; i++) {
    if (points[i].isStart != null) ends.push(points[i]);
  }
  return ends;
}

/**
 * Average clustered endpoints
 * @param {Array} points - Entries for selected first/last points
 * @param {Object} settings - Settings: tolerance, axis, progress bar
 * @returns {void}
 */
function applyAverage(points, settings) {
  var bar = settings.progress;
  var onProgress = function (value, max) {
    bar.maxvalue = Math.max(max, 1);
    bar.value = value;
    bar.parent.update();
  };

  var clusters = groupPointsByDist(points, settings.tolerance);
  for (var i = 0, len = clusters.length; i < len; i++) {
    averageCluster(clusters[i], settings.axis, settings.roundStep, settings.isAbRuler);
    onProgress(i + 1, len);
  }
}

/**
 * Average clustered endpoints, then join path pairs per cluster
 * @param {Array} points - Entries for selected first/last points
 * @param {Object} settings - Settings: tolerance, axis, join, progress bar
 * @returns {void}
 */
function applyAverageAndJoin(points, settings) {
  var bar = settings.progress;
  var onProgress = function (value, max) {
    bar.maxvalue = Math.max(max, 1);
    bar.value = value;
    bar.parent.update();
  };

  var clusters = groupPointsByDist(points, settings.tolerance);
  for (var i = 0, len = clusters.length; i < len; i++) {
    averageCluster(clusters[i], settings.axis, settings.roundStep, settings.isAbRuler);
    onProgress(i + 1, len);
  }

  if (settings.join) {
    var failed = joinPaths(clusters, points, onProgress);
    if (failed > 0) {
      alert(
        failed + ' pair(s) could not be joined\n' +
        'Their paths were already merged by an earlier join',
        'Script Error'
      );
    }
  }
}

/**
 * Group points whose anchors are all within tolerance of each other
 * @param {Array} points - Entries for selected first/last points
 * @param {number} tolerance - Max distance between any two members
 * @returns {Array} clusters - Clusters of 2+ entries
 */
function groupPointsByDist(points, tolerance) {
  var len = points.length;
  var used = [];
  var clusters = [];

  for (var i = 0; i < len; i++) {
    if (used[i]) continue;
    used[i] = true;

    var cluster = [points[i]];
    for (var j = i + 1; j < len; j++) {
      if (used[j]) continue;
      var ax = points[j].point.anchor[0];
      var ay = points[j].point.anchor[1];
      if (withinTolerance(cluster, ax, ay, tolerance)) {
        used[j] = true;
        cluster.push(points[j]);
      }
    }

    if (cluster.length > 1) clusters.push(cluster);
  }

  return clusters;
}

/**
 * Check a candidate against every member of a cluster
 * @param {Array} cluster - Existing cluster members
 * @param {number} ax - Candidate x
 * @param {number} ay - Candidate y
 * @param {number} tolerance - Max distance
 * @returns {boolean} True when within tolerance of all members
 */
function withinTolerance(cluster, ax, ay, tolerance) {
  var tolSq = tolerance * tolerance;
  for (var i = 0, len = cluster.length; i < len; i++) {
    var anchor = cluster[i].point.anchor;
    var dx = anchor[0] - ax;
    var dy = anchor[1] - ay;
    if ((dx * dx + dy * dy) > tolSq) return false;
  }
  return true;
}

/**
 * Move all points of a cluster to their average position
 * @param {Array} cluster - Records: { point: PathPoint, target: Array }
 * @param {string} axis - 'both', 'vertical' (align x) or 'horizontal' (align y)
 * @param {number} [step] - Optional rounding step, pt; 0 disables rounding
 * @param {boolean} [isAbRuler] - True to snap to the artboard ruler grid
 * @returns {void}
 */
function averageCluster(cluster, axis, step, isAbRuler) {
  var len = cluster.length;
  var i, sumX = 0, sumY = 0;
  var alignX = (axis == 'both' || axis == 'vertical');
  var alignY = (axis == 'both' || axis == 'horizontal');

  for (i = 0; i < len; i++) {
    sumX += cluster[i].point.anchor[0];
    sumY += cluster[i].point.anchor[1];
  }

  var avgX = sumX / len;
  var avgY = sumY / len;
  if (step > 0) {
    var rounded = roundToRulers(avgX, avgY, axis, step, isAbRuler);
    if (alignX) avgX = rounded[0];
    if (alignY) avgY = rounded[1];
  }

  for (i = 0; i < len; i++) {
    var rec = cluster[i];
    var pt = rec.point;
    var dx = alignX ? avgX - pt.anchor[0] : 0;
    var dy = alignY ? avgY - pt.anchor[1] : 0;
    if (dx != 0 || dy != 0) {
      pt.anchor = [pt.anchor[0] + dx, pt.anchor[1] + dy];
      pt.leftDirection = [pt.leftDirection[0] + dx, pt.leftDirection[1] + dy];
      pt.rightDirection = [pt.rightDirection[0] + dx, pt.rightDirection[1] + dy];
    }
    // Target lets the record be re-found after a join replaces its parent path
    rec.target = copyCoord(pt.anchor);
  }
}

/**
 * Snap an averaged point to the grid step of the active rulers
 * @param {number} x - Averaged x in the document system, px
 * @param {number} y - Averaged y in the document system, px
 * @param {string} axis - 'both', 'vertical' (align x) or 'horizontal' (align y)
 * @param {number} step - Positive rounding step, px
 * @param {boolean} isAbRuler - True for artboard rulers, false for global
 * @returns {Array} coord - [x, y] snapped coordinates, px
 */
function roundToRulers(x, y, axis, step, isAbRuler) {
  var alignX = (axis == 'both' || axis == 'vertical');
  var alignY = (axis == 'both' || axis == 'horizontal');

  if (!isAbRuler) {
    // Global rulers: the origin is the document ruler origin
    if (alignX) x = roundToStep(x, step);
    if (alignY) y = roundToStep(y, step);
    return [x, y];
  }

  // Artboard rulers: snap in the artboard system, then return to the document
  var ab = convertPoint([x, y],
      CoordinateSystem.DOCUMENTCOORDINATESYSTEM,
      CoordinateSystem.ARTBOARDCOORDINATESYSTEM);

  if (alignX) ab[0] = roundToStep(ab[0], step);
  if (alignY) ab[1] = roundToStep(ab[1], step);

  return convertPoint(ab,
      CoordinateSystem.ARTBOARDCOORDINATESYSTEM,
      CoordinateSystem.DOCUMENTCOORDINATESYSTEM);
}

/**
 * Round a value to the nearest multiple of the step
 * @param {number} value - Averaged coordinate
 * @param {number} step - Positive step, pt; 0 or less disables rounding
 * @returns {number} Snapped value
 */
function roundToStep(value, step) {
  if (!step || step <= 0) return value;
  var n = value / step;
  n = (n >= 0) ? Math.floor(n + 0.5) : Math.ceil(n - 0.5);
  return Math.round(n * step * 1e6) / 1e6;
}

/**
 * Copy a 2D coordinate so the source array
 * @param {Array} coord - [x, y] coordinate
 * @returns {Array} Independent copy of the coordinate
 */
function copyCoord(coord) {
  return [coord[0], coord[1]];
}

/**
 * Join paired endpoints
 * @param {Array} clusters - Clusters of records: { path, point, target, isStart }
 * @param {Array} points - Flat list of all records
 * @param {function} [onProgress] - Callback per processed cluster
 * @returns {number} failed - Count of clusters that could not be joined
 */
function joinPaths(clusters, points, onProgress) {
  var failed = 0;

  for (var i = 0, len = clusters.length; i < len; i++) {
    var cluster = clusters[i];

    var ends = [];
    for (var e = 0; e < cluster.length; e++) {
      if (cluster[e].isStart != null) ends.push(cluster[e]);
    }
    if (ends.length != 2) continue;

    var a = ends[0], b = ends[1];
    if (a.point == null || b.point == null) {
      failed++;
      continue;
    }

    a.point = null;
    b.point = null;

    if (a.path == b.path) {
      var samePath = a.path;
      clearRecords(points, samePath);
      closePath(samePath);
    } else {
      var merged = mergePair(a, b);
      rebindRecords(clusters, merged.survivor, merged.removed);
      clearRecords(points, merged.removed);
      merged.removed.remove();
      a.path = null;
      b.path = null;
    }

    if (onProgress != null) onProgress(i + 1, len);
  }

  return failed;
}

/**
 * Detach every record that still references the given path
 * @param {Array} points - Flat list of records
 * @param {PathItem} path - Path to detach records from
 * @returns {void}
 */
function clearRecords(points, path) {
  for (var i = 0; i < points.length; i++) {
    if (points[i].path == path) {
      points[i].path = null;
      points[i].point = null;
    }
  }
}

/**
 * Close a path with averaged ends: one anchor or joined by a straight segment
 * @param {PathItem} path - Path to close
 * @returns {void}
 */
function closePath(path) {
  var pp = path.pathPoints;

  if (pp.length <= 2) {
    path.remove();
    return;
  }

  var first = pp[0];
  var last = pp[pp.length - 1];

  if (isPointAt(first, last.anchor)) {
    first.leftDirection = copyCoord(last.leftDirection);
    first.pointType = PointType.CORNER;
    last.remove();
  } else {
    first.leftDirection = copyCoord(first.anchor);
    last.rightDirection = copyCoord(last.anchor);
  }

  path.closed = true;
}

/**
 * Merge two open paths end to end into a single path
 * @param {Object} a - First record: { path, isStart }.
 * @param {Object} b - Second record: { path, isStart }.
 * @returns {Object} { survivor: PathItem, removed: PathItem }
 */
function mergePair(a, b) {
  if (a.isStart && !b.isStart) {
    var t = a; a = b; b = t;
  }

  var pathA = a.path;
  var pathB = b.path;
  if (a.isStart) reversePath(pathA);
  if (!b.isStart) reversePath(pathB);

  var ppA = pathA.pathPoints;
  var ppB = pathB.pathPoints;
  var lastA = ppA[ppA.length - 1];
  var firstB = ppB[0];

  if (isPointAt(lastA, firstB.anchor)) {
    lastA.rightDirection = copyCoord(firstB.rightDirection);
  } else {
    lastA.rightDirection = copyCoord(lastA.anchor);
    var pt = ppA.add();
    pt.anchor = copyCoord(firstB.anchor);
    pt.leftDirection = copyCoord(firstB.anchor);
    pt.rightDirection = copyCoord(firstB.rightDirection);
    pt.pointType = PointType.CORNER;
  }
  lastA.pointType = PointType.CORNER;

  for (var i = 1; i < ppB.length; i++) {
    var src = ppB[i];
    var pt = ppA.add();
    pt.anchor = copyCoord(src.anchor);
    pt.leftDirection = copyCoord(src.leftDirection);
    pt.rightDirection = copyCoord(src.rightDirection);
    pt.pointType = src.pointType;
  }

  return { survivor: pathA, removed: pathB };
}

/**
 * Flip the fill polarity of a path
 * @param {PathItem} path - Path to flip
 * @returns {void}
 */
function reversePath(path) {
  path.polarity = (path.polarity == PolarityValues.POSITIVE)
    ? PolarityValues.NEGATIVE
    : PolarityValues.POSITIVE;
}

/**
 * Re-point all records of the survivor and removed paths to the merged
 * path's current endpoints, matched by stored target coordinates
 * @param {Array} clusters - All clusters of records
 * @param {PathItem} survivorPath - Merged path that remains
 * @param {PathItem} removedPath - Path that was merged away
 * @returns {void}
 */
function rebindRecords(clusters, survivorPath, removedPath) {
  var pp = survivorPath.pathPoints;
  var first = pp[0];
  var last = pp[pp.length - 1];

  for (var c = 0, len = clusters.length; c < len; c++) {
    var cluster = clusters[c];

    for (var r = 0; r < cluster.length; r++) {
      var rec = cluster[r];
      if (rec.isStart == null) continue;
      if (rec.point == null) continue;
      if (rec.path != survivorPath && rec.path != removedPath) continue;

      rec.path = survivorPath;

      if (isPointAt(first, rec.target)) {
        rec.point = first;
        rec.isStart = true;
      } else if (isPointAt(last, rec.target)) {
        rec.point = last;
        rec.isStart = false;
      } else {
        rec.point = null;
      }
    }
  }
}

/**
 * Check whether a path point sits at a given coordinate
 * @param {PathPoint} point - Point to test
 * @param {Array} coord - [x, y] coordinate to compare with
 * @return {boolean} True if the anchor matches the coordinate
 */
function isPointAt(point, coord) {
  var a = point.anchor;
  return Math.abs(a[0] - coord[0]) < 0.001 && 
         Math.abs(a[1] - coord[1]) < 0.001;
}

/**
 * Remove degenerate paths
 * @param {Array} points - Flat list of records
 * @returns {void}
 */
function removeZeroPaths(points) {
  var seen = [];

  for (var i = 0; i < points.length; i++) {
    var path = points[i].path;
    if (path == null) continue;

    var dup = false;
    for (var j = 0; j < seen.length; j++) {
      if (seen[j] == path) {
        dup = true;
        break;
      }
    }
    if (dup) continue;

    seen.push(path);

    try {
      if (path.length < 0.001 || path.pathPoints.length < 2) {
        path.remove();
      }
    } catch (err) {}
  }
}

/**
 * Convert string to absolute number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} The converted number
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Serialize a JavaScript plain object into a JSON-like string
 * @param {Object} obj - The object to serialize
 * @returns {string} A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\t")
        .replace(/\r/g, "\r")
        .replace(/\n/g, "\n")
        .replace(/"/g, '\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
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