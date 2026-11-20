/*
  RandomScribble.jsx for Adobe Illustrator
  Description: Create random path (scribble) with a given number of points
  Created: July, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Original Idea: @femkeblanco https://community.adobe.com/t5/illustrator/any-easy-way-to-make-a-random-lines-like-this-one/td-p/12169984

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.0 (2026-11-20)
  - Bezier handles are kept inside the artboard or selection bounds and stay
    collinear with their anchors, so points remain smooth
  - Added stroke width input
  - Added random stroke color checkbox
  - Minor improvements
  0.1.3 (2024-02-09) Removed input activation on Windows OS below CC v26.4
  0.1.2 (2022-09-14) Fixed input activation in Windows OS
  0.1.1 (2022-06-12) Fixed "Illustrator quit unexpectedly" error
  0.1.0 (2021-07-26) Initial version

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

// Main function
function main() {
  var SCRIPT = {
        name: 'Random Scribble',
        version: 'v0.2.0'
      };

  var CFG = {
        layer: 'Scribbles', // Layer name
        minStroke: 0.01, // Minimum stroke width
        maxPoints: 500, // Maximum amount of the path points
        tension: 0.5, // Default curve tension: 0 - sharp corners, 1 - standard Catmull-Rom smoothing
        modKey: 'Q', // User modifier key for shortcuts
        units : getStrokeUnits(),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        uiMargins: [10, 15, 10, 10],
        uiOpacity: 0.98 // UI window opacity. Range 0-1
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

  var doc = app.activeDocument;
  var activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()];
  var currTension = 0.5;
  var lines = [];
  var bounds = [];

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? activeDocument.scaleFactor : 1;

  var tgtLayer;
  try {
    tgtLayer = doc.layers.getByName(CFG.layer);
    tgtLayer.visible = true;
    tgtLayer.locked = false;
  } catch (err) {
    tgtLayer = doc.layers.add();
    tgtLayer.name = CFG.layer;
  }
  
  // Get rectangle container for scribble
  if (app.selection.length > 0 && app.selection.typename != 'TextRange') {
    deselectGuides(app.selection);
    var items = getItems(app.selection);
    app.selection = null;
    for (var i = 0; i < items.length; i++) {
      bounds.push(items[i].geometricBounds);
    }
  } else {
    bounds.push(activeAB.artboardRect);
  }

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
  //  POINTS
  // ==========================================
  var pnlPoints = wrapperL.add('panel', undefined, 'Points');
      pnlPoints.orientation = 'column';
      pnlPoints.alignChildren = ['fill', 'fill'];
      pnlPoints.margins = CFG.uiMargins;

  var wrapperPt = pnlPoints.add('group');
      wrapperPt.orientation = 'row';
      wrapperPt.alignChildren = ['left', 'bottom'];

  var grpPoints = wrapperPt.add('group');
      grpPoints.orientation = 'row';
      grpPoints.alignChildren = ['fill', 'fill'];

  grpPoints.add('statictext', undefined, 'Number:');
  var etPoints = grpPoints.add('edittext', undefined, '4');
      etPoints.characters = 6;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    etPoints.active = true;
  }

  var chkClosed = wrapperPt.add('checkbox', undefined, 'C\u0332lose Path');
      chkClosed.value = CFG.isClosed ? true : false;
  
  var grpTension = pnlPoints.add('group');
      grpTension.orientation = 'row';
      grpTension.alignChildren = ['fill', 'center'];

  grpTension.add('statictext', undefined, 'Tension:');
  var slTension = grpTension.add('slider', undefined, 0.5, 0, 1);
  var etTension = grpTension.add('edittext', undefined, 0.5);
      etTension.characters = 4;

  // ==========================================
  //  STROKE
  // ==========================================
  var pnlStroke = wrapperL.add('panel', undefined, 'Stroke');
      pnlStroke.orientation = 'row';
      pnlStroke.alignChildren = ['fill', 'bottom'];
      pnlStroke.margins = CFG.uiMargins;

  var grpWidth = pnlStroke.add('group');
      grpWidth.orientation = 'row';
      grpWidth.alignChildren = ['left', 'fill'];

  grpWidth.add('statictext', undefined, 'Width:');
  var etWidth = grpWidth.add('edittext', undefined, '1');
      etWidth.characters = 4;
  grpWidth.add('statictext', undefined, CFG.units);

  var chkRndColor = pnlStroke.add('checkbox', undefined, 'Ra\u0332ndom Color');
      chkRndColor.value = false;

  // ==========================================
  //  BUTTONS
  // ==========================================
  var wrapperR = wrapperRow.add('group');
      wrapperR.orientation = 'column';
      wrapperR.alignChildren = ['fill', 'top'];

  var btnRandomize = wrapperR.add('button', undefined, 'R\u0332andomize');
  var btnCancel, btnOk;
  if (CFG.isMac) {
      btnCancel = wrapperR.add('button', undefined, 'Cancel', { name: 'cancel' });
      btnOk = wrapperR.add('button', undefined, 'OK', { name: 'ok' });
  } else {
      btnOk = wrapperR.add('button', undefined, 'OK', { name: 'ok' });
      btnCancel = wrapperR.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  btnCancel.helpTip = 'Press Esc to Cancel';

  var lblInfo = wrapperR.add('statictext', undefined, 'Shortcuts: ' + CFG.modKey + '+A/C/R');
      lblInfo.alignment = ['left', 'center'];
      lblInfo.graphics.foregroundColor = lblInfo.graphics.newPen(
        lblInfo.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5, 1], 1
      );

  var btnAbout = wrapperR.add('button', undefined, '?');
      btnAbout.alignment = ['right', 'center'];
      btnAbout.preferredSize = [16, 16];
      btnAbout.helpTip = 'About';

  win.defaultElement = btnRandomize;
  win.cancelElement = btnCancel;

  // ==========================================
  //  EVENTS
  // ==========================================
  loadSettings(SETTINGS);

  etPoints.onChange = function () {
    this.text = strToAbsNum(this.text, 2);
    regenerate();
  }

  bindStepperKeys(etPoints, 2, CFG.maxPoints);

  chkClosed.onClick = function () {
    for (var i = 0; i < lines.length; i++) {
      lines[i].closed = this.value ? true : false;
      if (!this.value) {
        var pp = lines[i].pathPoints;
        var first = pp[0];
        var last = pp[pp.length - 1];
        first.pointType = PointType.CORNER;
        first.rightDirection = first.anchor;
        first.leftDirection = first.anchor;
        last.pointType = PointType.CORNER;
        last.rightDirection = last.anchor;
        last.leftDirection = last.anchor;
      }
    }
    if (this.value) applySmoothing();
    updateScreenView();
  }

  slTension.onChanging = function () {
    currTension = parseFloat(Math.round(this.value * 10) / 10);
    etTension.text = currTension;
    applySmoothing();
    updateScreenView();
  }

  etTension.onChange = function () {
    currTension = Math.min(Math.max(strToAbsNum(this.text), 0), 1);
    this.text = currTension;
    slTension.value = currTension;
    applySmoothing();
    updateScreenView();
  }

  bindStepperKeys(etTension, 0, 1);

  btnRandomize.onClick = regenerate;

  etWidth.onChange = function () {
    var stroke = Math.max(strToAbsNum(this.text), CFG.minStroke);
    this.text = stroke;
    stroke = convertUnits(stroke, CFG.units, 'pt' ) / CFG.sf;
    for (var i = 0; i < lines.length; i++) {
      lines[i].strokeWidth = stroke;
    }
    updateScreenView();
  }

  bindStepperKeys(etWidth, CFG.minStroke, 1000);

  chkRndColor.onClick = function () {
    var color = new CMYKColor();
    color.black = 100;
    var isRgb = /rgb/i.test(doc.documentColorSpace);
    for (var i = 0; i < lines.length; i++) {
      lines[i].strokeColor = this.value ? getRandomColor(isRgb) : color;
    }
    updateScreenView();
  }

  // Shortcut listener
  var keysList = new RegExp('^[' + CFG.modKey + 'ACR]$', 'i');
  var keys = {};

  // Block shortcut keys inside text inputs
  blockInput(etPoints);
  blockInput(etTension);
  blockInput(etWidth);

  win.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (!key) return; // non-English layout
    if (keysList.test(key)) keys[kd.keyName] = true;
    if (keys[CFG.modKey]) {
      for (var k in keys) {
        if (k == 'A') chkRndColor.notify();
        if (k == 'C') chkClosed.notify();
        if (k == 'R') btnRandomize.notify();
      }
    }
  });

  win.addEventListener('keyup', function(kd) {
    var key = kd.keyName;
    if (key && keysList.test(key)) delete keys[kd.keyName];
  });

  btnCancel.onClick = function () {
    removeLines(lines);
    win.close();
  }

  btnOk.onClick = function () {
    for (var i = 0; i < lines.length; i++) {
      lines[i].selected = true;
    }
    win.close();
  }

  btnAbout.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];

    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = CFG.uiMargins;

    var overviewText = overviewPnl.add('statictext', undefined,
        SCRIPT.name + ' ' + SCRIPT.version + '\n\n' +
        'Generates random scribble paths with a set number of anchor points. Select objects before running to draw one scribble inside each of their bounds.\n\n' +
        'Key Features:\n' +
        '\u2022 Set the amount of points\n' +
        '\u2022 Curve tension slider: 0 is a sharp polyline, 1 is full Catmull-Rom smoothing; handles stay inside the bounds and remain smooth\n' +
        '\u2022 Stroke width field and a Random color checkbox (RGB / CMYK by document mode)\n' +
        '\u2022 Toggle closed / open path, redraw on every change with live Preview\n',
        { multiline: true });

    overviewText.preferredSize.width = 320;
    overviewText.preferredSize.height = CFG.aiVers > 16 ? 240 : 190;

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

  win.onShow = function () {
    regenerate();
  }

  win.onClose = function () {
    saveSettings(SETTINGS);
    if (!tgtLayer.pageItems.length) {
      tgtLayer.remove();
    }
  }

  // Re-draw all scribbles
  function regenerate() {
    var stroke = Math.max(strToAbsNum(etWidth.text), CFG.minStroke);
    stroke = convertUnits(stroke, CFG.units, 'pt' ) / CFG.sf;
    removeLines(lines);
    process(
      bounds, lines, etPoints.text, chkClosed.value,
      stroke, currTension, chkRndColor.value
    );
  }

  // Re-apply smoothing to already created paths
  function applySmoothing() {
    for (var i = 0; i < lines.length; i++) {
      smoothing(lines[i], currTension, bounds[i]);
    }
  }

  /**
   * Block default keyboard behavior on an item while the modifier key defined
   * @param {Object} item - UI element
   */
  function blockInput(item) {
    item.addEventListener('keydown', function(kd) {
      if (kd.keyName && kd.keyName.match(CFG.modKey)) {
        keys[kd.keyName] = true;
      }
      if (keys[CFG.modKey]) {
        kd.preventDefault();
      }
    });
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
    data.points = etPoints.text;
    data.closed = chkClosed.value;
    data.tension = etTension.text;
    data.stroke = etWidth.text;
    data.color = chkRndColor.value;

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
        etPoints.text = strToAbsNum(data.points, 4);
        chkClosed.value = data.closed === 'true';
        etTension.text = strToAbsNum(data.tension, 0.5);
        slTension.value = parseFloat(etTension.text);
        etWidth.text = strToAbsNum(data.stroke);
        chkRndColor.value = data.color === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get the stroke width units from Preferences > Units > Stroke
 * @returns {string} units - The units for stroke width
 */
function getStrokeUnits() {
  var key = app.preferences.getIntegerPreference('strokeUnits');
  var units = 'pt';
  switch (key) {
    case 0:
      units = 'in';
      break;
    case 1:
      units = 'mm';
      break;
    case 2:
      units = 'pt';
      break;
    case 3:
      units = 'pc';
      break;
    case 4:
      units = 'cm';
      break;
    case 6:
      units = 'px';
      break;
  }
  return units;
}

/**
 * Convert a value from one unit of measurement to another
 * @param {number} value - The value to convert
 * @param {string} currUnits - The current units of the value
 * @param {string} newUnits - The units to convert the value to
 * @returns {number} The converted value
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Deselect guide paths from a collection of items recursively
 * @param {Object|Array} coll - The collection of items to deselect guide paths from
 * @returns {void}
 */
function deselectGuides(coll) {
  var item = null;
  for (var i = 0, len = coll.length; i < len; i++) {
    item = coll[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) {
      deselectGuides(item.pageItems);
    } else if (
      (item.hasOwnProperty('guides') && item.guides)
      || (item.typename === 'CompoundPathItem' && item.pathItems.length && item.pathItems[0].guides)) {
      item.selected = false;
    }
  }
}

/**
 * Get individual items from a collection
 * @param {Object|Array} coll - The collection of Illustrator items to filter
 * @returns {Array} items - Output array of individual items
 */
function getItems(coll) {
  var items = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var currItem = coll[i];
    if (currItem.pageItems && currItem.pageItems.length) {
      items = [].concat(items, getItems(currItem.pageItems));
    } else {
      items.push(currItem);
    }
  };
  return items;
}

/**
 * Process dialog parameters
 * @param {Array} bounds - Bounding box for all points
 * @param {Array} arr - Collection of new paths
 * @param {number} points - The amount of points on the path
 * @param {boolean} isClosed - Closing the path
 * @param {number} stroke - The width of the stroke
 * @param {number} tension - Tension of the point handles
 * @param {boolean} isRandomColor - Give each new path a random stroke color
 */
function process(bounds, arr, points, isClosed, stroke, tension, isRandomColor) {
  var color = new CMYKColor();
  color.black = 100;
  var isRgb = /rgb/i.test(app.activeDocument.documentColorSpace);
  points = parseInt(strToAbsNum(points, 2), 10);
  if (points < 2) points = 2;
  for (var i = 0; i < bounds.length; i++) {
    var line = new Line(bounds[i], isClosed, stroke, tension, color);
    if (isRandomColor) line.path.strokeColor = getRandomColor(isRgb); 
    line.drawLine(points);
    arr.push(line.path);
  }
  updateScreenView();
}

/**
 * Draw a path with the parameters
 * @param {array} bounds - Bounding box for all points
 * @param {boolean} isClosed - Closing the path
 * @param {number} stroke - The width of the stroke
 * @param {number} tension - Tension of the point handles
 */
function Line(bounds, isClosed, stroke, tension, color) {
  this.bounds = bounds;
  this.path = app.activeDocument.layers[0].pathItems.add();
  this.path.stroked = true;
  this.path.strokeWidth = stroke;
  this.path.strokeColor = color;
  this.path.filled = false;

  this.drawLine = function (points) {
    for (var i = 0; i < points; i++) {
      this.getPoints();
    }
    if (isClosed) this.path.closed = true;
    // Keep both anchors and handles inside the container bounds
    smoothing(this.path, tension, this.bounds);
  };

  this.getPoints = function () {
    var p = this.path.pathPoints.add();
    p.anchor = this.getPoint();
    return p;
  };

  this.getPoint = function () {
    var x = Math.floor(random(bounds[0], bounds[2]));
    var y = Math.floor(random(bounds[3], bounds[1]));
    return [x, y];
  };
}

/**
 * Get random value in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @return {number} Random value >= min and <= max
 */
function random(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Apply smoothing to pathPoints of path
 * Author Hiroyuki Sato https://github.com/shspage
 * With optional bounds, each handle keeps its Catmull-Rom direction but is
 * scaled down to stay inside the rect. Both handles of a point are scaled by
 * the same factor, so the left handle, anchor and right handle stay collinear
 * and the point remains smooth
 * @param {Object} path - Target path
 * @param {number} tension - Catmull-Rom spline parameter
 * @param {Array} [bounds] - Optional [left, top, right, bottom] rect
 */
function smoothing(path, tension, bounds) {
  var pt = path.pathPoints;
  var lastIdx = pt.length - 1;
  var beforeLastIdx = lastIdx - 1;
  var idx0, idx1, idx2, idx3;

  for (var i = 0; i <= lastIdx; i++) {
    if (path.closed) {
      idx0 = (i == 0) ? lastIdx : i - 1;
      idx1 = i;
      idx2 = (i == lastIdx) ? 0 : i + 1;
      if (i == lastIdx) {
        idx3 = 1;
      } else {
        idx3 = (i == beforeLastIdx) ? 0 : i + 2;
      }
    } else {
      if (i == lastIdx) break;
      idx0 = (i == 0) ? 0 : i - 1;
      idx1 = i;
      idx2 = i + 1;
      idx3 = (i == beforeLastIdx) ? i + 1 : i + 2;
    }

    if (bounds) {
      // An interior point owns two handles; the ends of an open path own one
      var dualLeft = path.closed || idx1 != 0;
      var dualRight = path.closed || idx2 != lastIdx;
      setHandlesClamped(pt, idx0, idx1, idx2, idx3, tension, dualLeft, dualRight, bounds);
    } else {
      var rl = catmullRomToBezier(pt[idx0], pt[idx1], pt[idx2], pt[idx3], tension);
      pt[idx1].rightDirection = rl[0];
      pt[idx2].leftDirection = rl[1];
    }
  }

  if (tension > 0) {
    changePointType(path, PointType.SMOOTH);
  } else {
    changePointType(path, PointType.CORNER);
  }
}

/**
 * Set Bezier handles for two neighbor points so both stay inside a bounds
 * rect. Handle offsets keep their Catmull-Rom direction: the right handle of
 * pt1 is anchor1 + sR * dR, the left handle of pt2 is anchor2 + sL * dL, and
 * the scale factors shrink the offsets only as much as the bounds require
 * @param {Object} pt - PathPoints collection
 * @param {number} idx0 - Index of the previous neighbor point
 * @param {number} idx1 - Index of the point that receives the right handle
 * @param {number} idx2 - Index of the point that receives the left handle
 * @param {number} idx3 - Index of the next neighbor point
 * @param {number} tension - Catmull-Rom spline parameter
 * @param {boolean} dualLeft - True if pt1 also has a left handle
 * @param {boolean} dualRight - True if pt2 also has a right handle
 * @param {Array} bounds - [left, top, right, bottom] rect
 */
function setHandlesClamped(pt, idx0, idx1, idx2, idx3, tension, dualLeft, dualRight, bounds) {
  var a0 = pt[idx0].anchor;
  var a1 = pt[idx1].anchor;
  var a2 = pt[idx2].anchor;
  var a3 = pt[idx3].anchor;

  if (tension == 0) {
    pt[idx1].rightDirection = a1;
    pt[idx2].leftDirection = a2;
    return;
  }

  // Handle offsets from the Catmull-Rom formula
  var dR = [(a2[0] - a0[0]) / (6 * tension), (a2[1] - a0[1]) / (6 * tension)];
  var dL = [(a1[0] - a3[0]) / (6 * tension), (a1[1] - a3[1]) / (6 * tension)];
  var sR = dualLeft ? symmetricScale(a1, dR, bounds) : rayScale(a1, dR, bounds);
  var sL = dualRight ? symmetricScale(a2, dL, bounds) : rayScale(a2, dL, bounds);

  pt[idx1].rightDirection = [a1[0] + sR * dR[0], a1[1] + sR * dR[1]];
  pt[idx2].leftDirection = [a2[0] + sL * dL[0], a2[1] + sL * dL[1]];
}

/**
 * Max scale s <= 1 so both anchor + s * d and anchor - s * d stay inside
 * the bounds rect. Used for interior points whose two handles must remain
 * collinear through the anchor
 * @param {Array} a - Anchor [x, y]
 * @param {Array} b - Bounds [left, top, right, bottom]
 * @param {Array} d - Handle offset [dx, dy]
 * @return {number}
 */
function symmetricScale(a, d, b) {
  var s = 1;
  for (var k = 0; k < 2; k++) {
    var lo = Math.min(b[k], b[k + 2]);
    var hi = Math.max(b[k], b[k + 2]);
    var abs = Math.abs(d[k]);

    if (abs > 0) {
      var room = Math.max(Math.min(a[k] - lo, hi - a[k]), 0);
      s = Math.min(s, room / abs);
    }
  }
  return s;
}

/**
 * Max scale s <= 1 so the single handle anchor + s * d stays inside the
 * bounds rect. Used for the ends of an open path that own only one handle
 * @param {Array} a - Anchor [x, y]
 * @param {Array} d - Handle offset [dx, dy]
 * @param {Array} b - Bounds [left, top, right, bottom]
 * @return {number}
 */
function rayScale(a, d, b) {
  var s = 1;
  for (var k = 0; k < 2; k++) {
    var lo = Math.min(b[k], b[k + 2]);
    var hi = Math.max(b[k], b[k + 2]);
    var abs = Math.abs(d[k]);
    if (abs > 0) {
      var room = (d[k] > 0) ? (hi - a[k]) : (a[k] - lo);
      s = Math.min(s, Math.max(room, 0) / abs);
    }
  }
  return s;
}

/**
 * Converts Catmull-Rom to Bezier
 * @param  {Array} pt0 - pathPoint.anchor
 * @param  {Array} pt1 - pathPoint.anchor
 * @param  {Array} pt2 - pathPoint.anchor
 * @param  {Array} pt3 - pathPoint.anchor
 * @param  {number} tension - Tension of the point handles
 * @return {Array} Coordinates for pt1.rightDirection and pt2.leftDirection
*/
function catmullRomToBezier(pt0, pt1, pt2, pt3, tension) {
  var rlx = catmullRomToBezier_sub(
      pt0.anchor[0],
      pt1.anchor[0],
      pt2.anchor[0],
      pt3.anchor[0], tension);

  var rly = catmullRomToBezier_sub(
      pt0.anchor[1],
      pt1.anchor[1],
      pt2.anchor[1],
      pt3.anchor[1], tension);

  return [[rlx[0], rly[0]], [rlx[1], rly[1]]];
}

/**
 * Calcs a pair of X or Y coordinate for bezier control points
 * @param  {number} p0 - Anchor[0] or [1]
 * @param  {number} p1 - Anchor[0] or [1]
 * @param  {number} p2 - Anchor[0] or [1]
 * @param  {number} p3 - Anchor[0] or [1]
 * @param  {number} tension - Tension of the point handles
 * @return {Array} A pair of X or Y ([X,X] or [Y, Y]) for bezier control points
*/
function catmullRomToBezier_sub(p0, p1, p2, p3, tension) {
  if (tension == 0) return [p1, p2];
  return [p1 + (p2 - p0) / (6 * tension),
    p2 - (p3 - p1) / (6 * tension)
  ];
}

/**
 * Change the type of path point
 * @param {object} path - Target path
 * @param {string} type - Either a curve or a corner
 */
function changePointType(path, type) {
  for (var i = 0; i < path.pathPoints.length; i++) {
    path.pathPoints[i].pointType = type;
  }
}

/**
 * Remove paths
 * @param {Array} arr - Array of created paths
 */
function removeLines(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    try { arr[i].remove(); } catch (e) {}
    arr.splice(i, 1);
  }
}

/**
 * Convert string to absolute number
 * @param {string} str - input data
 * @param {number} def - default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = String(str).replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

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
    if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
      this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
      kd.preventDefault();
      input.notify();
    }
    if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
      this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
      kd.preventDefault();
      input.notify();
    }
  });
}

/**
 * Get a random color
 * @param {boolean} isRgb - Is the RGB document mode
 * @return {object} RGBColor or CMYKColor
 */
function getRandomColor(isRgb) {
  var color;
  if (isRgb) {
    color = new RGBColor();
    color.red = Math.round(Math.random() * 255);
    color.green = Math.round(Math.random() * 255);
    color.blue = Math.round(Math.random() * 255);
  } else {
    color = new CMYKColor();
    color.cyan = Math.round(Math.random() * 100);
    color.magenta = Math.round(Math.random() * 100);
    color.yellow = Math.round(Math.random() * 100);
  }
  return color;
}

/**
 * Force a refresh of the active document's view in Adobe Illustrator
 */
function updateScreenView() {
  var doc, currView, currCenter;
  try {
    doc = app.activeDocument;
    currView = doc.views[0];
    currCenter = currView.centerPoint.slice();
    currView.centerPoint = [currCenter[0] + 0.001, currCenter[1]];
    $.sleep(50);
    currView.centerPoint = currCenter;
  } catch (err) {}
  currView = null;
  doc = null;
  $.gc();
  app.executeMenuCommand('edge');
  app.executeMenuCommand('edge');
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
} catch (e) {}