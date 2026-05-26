/*
  TransformPoints.jsx for Adobe Illustrator
  Description: Unlike Illustrator's native tools, this script allows you to enter exact dimensions for any selection of anchor points
  Date: May, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Transform Points',
        version: 'v0.1'
      };

  var CFG = {
        refPoints: [
            { label: '┌', name: 'Top Left' },
            { label: '┬', name: 'Top' },
            { label: '┐', name: 'Top Right' },
            { label: '├', name: 'Left' },
            { label: '┼', name: 'Center' },
            { label: '┤', name: 'Right' },
            { label: '└', name: 'Bottom Left' },
            { label: '┴', name: 'Bottom' },
            { label: '┘', name: 'Bottom Right' },
          ],
        units: getUnits(),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        sf: 1 // Scale factor
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('selection:1')) return;

  // ==========================================
  // GET DATA
  // ==========================================
  var doc = app.activeDocument;
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  var paths = getPaths(app.selection);
  var selPts = [];

  for (var i = 0; i < paths.length; i++) {
    var p = getSelectedPoints(paths[i]);
    selPts = selPts.concat(p);
  }

  if (selPts.length < 2) {
    alert('No points\nPlease select at least 2 anchor points', 'Script Error');
    return;
  }

  var rawPts = [];
  for (var j = 0; j < selPts.length; j++) {
    rawPts.push(selPts[j].pt);
  }

  // Bounding box dimensions
  var bbox = getPointsBBox(rawPts);
  var initW = convertUnits(bbox.width, 'pt', CFG.units) / CFG.sf;
  var initH = convertUnits(bbox.height, 'pt', CFG.units) / CFG.sf;
  var ratio = (initH !== 0) ? bbox.width / bbox.height : 1;

  // Line mode: exactly 2 selected points
  var lineMode = (selPts.length === 2);
  var line = lineMode ? getLine(selPts[0].pt, selPts[1].pt) : null;
  var initL = line ? convertUnits(line.length, 'pt', CFG.units) / CFG.sf : 0;

  var isUndo = false;
  var isUpdating = false;

  // ==========================================
  // DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  var wrapper = win.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = ['fill', 'top'];

  // ==========================================
  // DIMENSIONS
  // ==========================================
  var dimPnl = wrapper.add('panel', undefined, 'Dimensions');
      dimPnl.orientation = 'column';
      dimPnl.alignChildren = 'left';
      dimPnl.margins = [10, 15, 10, 10];

  // WIDTH
  var wGrp = dimPnl.add('group');
      wGrp.orientation = 'row';

  var wLbl = wGrp.add('statictext', undefined, 'W:');
      wLbl.preferredSize.width = 15;

  var wInp = wGrp.add('edittext', undefined, round(initW));
      wInp.preferredSize.width = 80;
      wInp.helpTip ='Original width:\n' + round(initW) + ' ' + CFG.units;
  wGrp.add('statictext', undefined, CFG.units);

  // HEIGHT
  var hGrp = dimPnl.add('group');
      hGrp.orientation = 'row';

  var hLbl = hGrp.add('statictext', undefined, 'H:');
      hLbl.preferredSize.width = 15;

  var hInp = hGrp.add('edittext', undefined, round(initH));
      hInp.preferredSize.width = 80;
      hInp.helpTip ='Original height:\n' + round(initH) + ' ' + CFG.units;
  hGrp.add('statictext', undefined, CFG.units);

  if (initW === 0) wInp.enabled = false;
  if (initH === 0) hInp.enabled = false;

  // Focus input field on compatible versions
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    if (initW !== 0) wInp.active = true;
    else hInp.active = true;
  }

  // ==========================================
  // LINE PROPERTIES (only in line mode)
  // ==========================================
  var lInp = null;
  var aInp = null;

  if (lineMode) {
    // LENGTH
    var lGrp = dimPnl.add('group');
        lGrp.orientation = 'row';

    var lLbl = lGrp.add('statictext', undefined, 'L:');
        lLbl.preferredSize.width = 15;

    lInp = lGrp.add('edittext', undefined, round(initL));
    lInp.preferredSize.width = 80;
    lInp.helpTip = 'Original length:\n' + round(initL) + ' ' + CFG.units;
    lGrp.add('statictext', undefined, CFG.units);

    // ANGLE
    var aGrp = dimPnl.add('group');
        aGrp.orientation = 'row';

    var aLbl = aGrp.add('statictext', undefined, 'A:');
        aLbl.preferredSize.width = 15;

    aInp = aGrp.add('edittext', undefined, round(line.angle));
    aInp.preferredSize.width = 80;
    aInp.helpTip = 'Original angle:\n' + round(line.angle) + ' \u00B0';
    aGrp.add('statictext', undefined, '\u00B0');
  }

  // PROPORTIONS
  var isLock = dimPnl.add('checkbox', undefined, 'Lock Proportions');
      isLock.value = false;

  // ==========================================
  // REFERENCE POINT
  // ==========================================
  var refPnl = wrapper.add('panel', undefined, 'Reference Point');
      refPnl.alignChildren = ['center', 'center'];
      refPnl.margins = [10, 15, 10, 10];

  var selRefIdx = 4;
  var refBtns = addReferencePoints(refPnl);

  // ==========================================
  // SCALE MODE
  // ==========================================
  var isScaleHandles = null;

  if (!lineMode) {
    var isScaleHandles = win.add('checkbox', undefined, 'Scale All Handles of Selected Points');
        isScaleHandles.helpTip = 'When off, handles toward unselected points\nmove without changing angle and length';
  }

  // ==========================================
  // BUTTONS
  // ==========================================
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignment = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');

  var spacer = btns.add('group');
      spacer.alignment = ['fill', 'center'];

  var about = btns.add('button', undefined, '?');
      about.preferredSize.width = 25;
      about.helpTip = 'About';

  // Platform-specific button order
  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  // ==========================================
  // EVENTS
  // ==========================================
  var lastInp = (initW === 0) ? 'height' : 'width';

  wInp.onChange = function() {
    this.text = evalMath(this.text, 0);
    lastInp = 'width';
    syncFromBBox();
    preview();
  };

  hInp.onChange = function() {
    this.text = evalMath(this.text, 0);
    lastInp = 'height';
    syncFromBBox();
    preview();
  };

  bindStepperKeys(wInp, -16000, 16000);
  bindStepperKeys(hInp, -16000, 16000);

  if (lineMode) {
    lInp.onChange = function () {
      var newL = evalMath(this.text, 0);
      this.text = Math.max(-16000, Math.min(16000, newL));
      syncFromLine();
      preview();
    };

    aInp.onChange = function () {
      var newA = evalMath(this.text, 0);
      this.text = Math.max(-360, Math.min(360, newA));
      syncFromLine();
      preview();
    };

    bindStepperKeys(lInp, -16000, 16000);
    bindStepperKeys(aInp, -360, 360);
  }

  isLock.onClick = function() {
    if (this.value) {
      if (lastInp === 'height') updateDimension(hInp, wInp, ratio, true);
      else updateDimension(wInp, hInp, ratio, false);
      if (lineMode) updateLine();
      preview();
    }
  };

  if (!lineMode && isScaleHandles) {
    isScaleHandles.onClick = preview;
  }

  isPreview.onClick = preview;

  about.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];
    
    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = [10, 15, 10, 8];
      
    var overviewText = overviewPnl.add('statictext', undefined,
        SCRIPT.name + ' ' + SCRIPT.version + '\n\n' + "Unlike Illustrator's native tools, " + 
        "this script allows you to enter exact dimensions for any selection of anchor points.", 
        { multiline: true });
    overviewText.preferredSize.width = 280;
    overviewText.preferredSize.height = 80;

    // Credit
    var authorPnl = helpWin.add('panel', undefined, 'Author');
        authorPnl.alignChildren = ['fill', 'top'];
        authorPnl.spacing = 15;
        authorPnl.margins = [10, 15, 10, 8];

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
      openURL('mailto:hi@sergosokin.ru')
    });

    setTextHandler(bmcText, function () {
      openURL('https://buymeacoffee.com/aiscripts/extras')
    });

    setTextHandler(roboText, function () {
      openURL('https://aiscripts.robo.market')
    });

    setTextHandler(gitText, function () {
      openURL('https://github.com/creold')
    });

    helpWin.center();
    helpWin.show();
  };

  cancel.onClick = win.close;

  ok.onClick = function () {
    saveSettings(SETTINGS);
    if (isPreview.value && isUndo) app.undo();
    applyTransform();
    isUndo = false;
    win.close();
  };

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  /**
   * Update the document preview
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) {
          doc.swatches.add().remove();
          app.undo();
        }
        applyTransform();
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
   * Apply scale to selected points
   */
  function applyTransform() {
    if (lineMode) {
      var newL = parseFloat(lInp.text);
      var newA = parseFloat(aInp.text);
      if (isNaN(newL)) newL = lInp.text = initL;
      if (isNaN(newA)) newA = aInp.text = line.angle;

      if (round(newL) === round(initL) && round(newA) === round(line.angle)) {
        return;
      }

      newL = convertUnits(newL, CFG.units, 'pt') / CFG.sf;

      scaleLine(selPts, newL, newA, selRefIdx);
    } else {
      var newW = parseFloat(wInp.text);
      var newH = parseFloat(hInp.text);

      if (isNaN(newW)) newW = wInp.text = initW;
      if (isNaN(newH)) newH = hInp.text = initH;

      newW = convertUnits(newW, CFG.units, 'pt') / CFG.sf;
      newH = convertUnits(newH, CFG.units, 'pt') / CFG.sf;

      if (round(newW) === round(initW) && round(newH) === round(initH)) {
        return;
      }

      var refCoords = getRefPointCoords(bbox, selRefIdx);

      scalePoints(selPts, bbox, newW, newH, refCoords, isScaleHandles.value);
    }
  }

  /**
   * Create reference point grid
   * @param {Group|Panel} parent - The UI window, panel, or group to which the buttons will be added
   * @returns {Array} buttons - Buttons array
   */
  function addReferencePoints(parent) {
    var buttons = [];

    for (var r = 0; r < 3; r++) {
      var rowGrp = parent.add('group');
      rowGrp.orientation = 'row';

      for (var c = 0; c < 3; c++) {
        var idx = r * 3 + c;
        var btn = rowGrp.add('button', undefined, CFG.refPoints[idx].label);
            btn.helpTip = CFG.refPoints[idx].name;
            btn.preferredSize = [22, 22];

        btn.onClick = (function (i) {
          return function () {
            selRefIdx = i;
            for (var k = 0; k < buttons.length; k++) {
              buttons[k].text = CFG.refPoints[k].label;
            }
            this.text = '●';
            preview();
          };
        })(idx);

        buttons.push(btn);
      }
    }

    return buttons;
  }

  /**
   * Update the paired field (lock propotions), then length and angle if in line mode
   */
  function syncFromBBox() {
    if (lastInp === 'height') updateDimension(hInp, wInp, ratio, true);
    else updateDimension(wInp, hInp, ratio, false);
    if (lineMode) updateLine();
  }

  /**
   * Compute new anchor positions and update fields
   */
  function syncFromLine() {
    if (isUpdating) return;
    isUpdating = true;

    var newL = parseFloat(lInp.text);
    var newA = parseFloat(aInp.text);
    if (isNaN(newL)) newL = lInp.text = initL;
    if (isNaN(newA)) newA = aInp.text = line.angle;

    // Derive new bbox dimensions
    var rad = newA * Math.PI / 180;
    var dX = round( Math.abs(newL * Math.cos(rad)) );
    var dY = round( Math.abs(newL * Math.sin(rad)) );

    wInp.text = dX;
    hInp.text = dY;

    wInp.enabled = (dX !== 0);
    hInp.enabled = (dY !== 0);

    isUpdating = false;
  }

  /**
   * Recalculate dimension fields based on ratio
   * @param {EditText} source - The input that changed
   * @param {EditText} target - The input to update
   * @param {number} r - Aspect ratio
   * @param {boolean} isMult - Multiply or divide
   */
  function updateDimension(source, target, r, isMult) {
    if (isLock.value && !isUpdating) {
      if (isMult && initW === 0) return;
      if (!isMult && initH === 0) return;
      isUpdating = true;
      var val = parseFloat(source.text);
      if (!isNaN(val)) {
        target.text = round(isMult ? val * r : val / r);
      }
      isUpdating = false;
    }
  }

  /**
   * Recalculate length and angle from the current bbox values
   */
  function updateLine() {
    if (isUpdating) return;
    isUpdating = true;

    var newW = parseFloat(wInp.text);
    var newH = parseFloat(hInp.text);
    if (isNaN(newW)) newW = wInp.text = initW;
    if (isNaN(newH)) newH = hInp.text = initH;

    var origRad = line.angle * Math.PI / 180;
    var signX = (Math.cos(origRad) >= 0) ? 1 : -1;
    var signY = (Math.sin(origRad) >= 0) ? 1 : -1;

    var dx = signX * newW;
    var dy = signY * newH;

    var newL = Math.sqrt(dx * dx + dy * dy);
    var newA = Math.atan2(dy, dx) * 180 / Math.PI;

    lInp.text = round(newL);
    aInp.text = round(newA);

    isUpdating = false;
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
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text) || 0;
      var isChanged = false;

      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        isChanged = true;
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        isChanged = true;
      }

      if (isChanged) {
        kd.preventDefault();
        if (typeof input.onChange === 'function') input.onChange();
      }
    });
  }

  /**
   * Set up a clickable text handler with hover effects and callback execution
   * @param {StaticText} text - The statictext object to attach handlers to
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
    data.constrain = isLock.value;
    if (!lineMode && isScaleHandles) {
      data.handles = isScaleHandles.value;
    }
    data.reference = selRefIdx;

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
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];
        isLock.value = data.constrain === 'true';
        if (!lineMode && isScaleHandles) {
          isScaleHandles.value = data.handles === 'true';
        }
        selRefIdx = parseInt(data.reference);
        if (isNaN(selRefIdx)) selRefIdx = 4;
      }
    } catch (err) {
      return;
    }
  }

  loadSettings(SETTINGS);
  refBtns[selRefIdx].text = '●';
  win.show();
}

/**
 * Check the script environment
 * @param {string} args - List of initial data for verification
 * @returns {boolean} Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Wrong application\nRun script from Adobe Illustrator', 'Script Error');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script Error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select ' + rqdLen + ' path(s) and try again', 'Script error');
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
  if (!documents.length) return '';
  var key = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  switch (key) {
    case 'Pixels': return 'pt';
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
        return 'pt';
      }
      break;
    default: return 'pt';
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
 * Get paths from a collection of Illustrator PageItems, recursively including
 * paths within groups and compounds
 * @param {PageItems|Array} coll - The collection of Illustrator PageItems
 * @returns {Array} results - An array containing the paths from the provided collection
 */
function getPaths(coll) {
  var results = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      results = results.concat(getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      results = results.concat(getPaths(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Extract the anchor points of any selected path points, including their adjacent selection states
 * @param {PathItem} path - The path item to inspect
 * @returns {Array} results - Array of selected anchor points with flags
 */
function getSelectedPoints(path) {
  var results = [];
  if (!path.pathPoints) return results;

  var pts = path.pathPoints;
  var len = pts.length;
  var isClosed = path.closed;

  for (var i = 0; i < len; i++) {
    var pt = pts[i];
    if (pt.selected !== PathPointSelection.ANCHORPOINT) {
      continue;
    }

    // Calculate adjacent indices (handles closed paths)
    var prevIdx = (i - 1 + len) % len;
    var nextIdx = (i + 1) % len;

    var hasPrev = isClosed ? true : (i > 0);
    var hasNext = isClosed ? true : (i < len - 1);

    var prevSel = hasPrev && (pts[prevIdx].selected === PathPointSelection.ANCHORPOINT);
    var nextSel = hasNext && (pts[nextIdx].selected === PathPointSelection.ANCHORPOINT);

    results.push({
      pt: pt,
      transformLeft: prevSel,  // Left handle affected if previous anchor is selected
      transformRight: nextSel  // Right handle affected if next anchor is selected
    });
  }

  return results;
}

/**
 * Calculate the bounding box of an array of path points
 * @param {Array} pts - Array of path points
 * @returns {Object} bbox - Bounding box object
 */
function getPointsBBox(pts) {
  var x = pts[0].anchor[0];
  var y = pts[0].anchor[1];
  var bbox = { minX: x, maxX: x, minY: y, maxY: y, width: 0, height: 0 };

  for (var i = 1, len = pts.length; i < len; i++) {
    var anch = pts[i].anchor;
    if (anch[0] < bbox.minX) bbox.minX = anch[0];
    if (anch[0] > bbox.maxX) bbox.maxX = anch[0];
    if (anch[1] < bbox.minY) bbox.minY = anch[1];
    if (anch[1] > bbox.maxY) bbox.maxY = anch[1];
  }

  bbox.width = round(bbox.maxX - bbox.minX);
  bbox.height = round(bbox.maxY - bbox.minY);

  return bbox;
}

/**
 * Get line length and angle from two path points
 * @param {PathPoint} ptA - First point
 * @param {PathPoint} ptB - Second point
 * @returns {Object} An object with length and angle (in degrees)
 */
function getLine(ptA, ptB) {
  var aX = ptA.anchor[0];
  var aY = ptA.anchor[1];
  var bX = ptB.anchor[0];
  var bY = ptB.anchor[1];

  var dx = bX - aX;
  var dy = aY - bY;

  var length = Math.sqrt(dx * dx + dy * dy);
  var angle = -Math.atan2(dy, dx) * 180 / Math.PI;

  return { length: length, angle: angle };
}

/**
 * Transform exactly 2 points line to match a given length and angle
 * @param {Array} points - Array of path points
 * @param {number} newL - Desired length
 * @param {number} newA - Desired angle in degrees
 * @param {number} refIdx - Reference point index
 */
function scaleLine(points, newL, newA, refIdx) {
  var ptA = points[0].pt;
  var ptB = points[1].pt;

  var rad = newA * Math.PI / 180;
  var dx = newL * Math.cos(rad);
  var dy = -newL * Math.sin(rad);

  var aX = ptA.anchor[0];
  var aY = ptA.anchor[1];
  var bX = ptB.anchor[0];
  var bY = ptB.anchor[1];

  // Reference point of the current line
  var col = refIdx % 3; // 0=left, 1=center, 2=right
  var row = Math.floor(refIdx / 3); // 0=top, 1=center, 2=bottom

  var minX = Math.min(aX, bX), maxX = Math.max(aX, bX);
  var minY = Math.min(aY, bY), maxY = Math.max(aY, bY);

  var refX = (col === 0) ? minX : (col === 1 ? (minX + maxX) / 2 : maxX);
  var refY = (row === 0) ? maxY : (row === 1 ? (minY + maxY) / 2 : minY);

  var origDx = bX - aX;
  var origDy = bY - aY;
  var origL = Math.sqrt(origDx * origDx + origDy * origDy);

  var tRef;
  if (origL < 0.0001) {
    tRef = 0.5; // degenerate: coincident points, pin to midpoint
  } else {
    tRef = ((refX - aX) * origDx + (refY - aY) * origDy) / (origL * origL);
    tRef = Math.max(0, Math.min(1, tRef));
  }

  // New anchor positions
  var newDx = dx;
  var newDy = -dy;

  var newAx = refX - tRef * newDx;
  var newAy = refY - tRef * newDy;
  var newBx = refX + (1 - tRef) * newDx;
  var newBy = refY + (1 - tRef) * newDy;

  // Move handles by the same delta as anchors
  var dAx = newAx - aX, dAy = newAy - aY;
  var dBx = newBx - bX, dBy = newBy - bY;

  ptA.leftDirection  = [ptA.leftDirection[0]  + dAx, ptA.leftDirection[1]  + dAy];
  ptA.rightDirection = [ptA.rightDirection[0] + dAx, ptA.rightDirection[1] + dAy];
  ptA.anchor = [newAx, newAy];

  ptB.leftDirection  = [ptB.leftDirection[0]  + dBx, ptB.leftDirection[1]  + dBy];
  ptB.rightDirection = [ptB.rightDirection[0] + dBx, ptB.rightDirection[1] + dBy];
  ptB.anchor = [newBx, newBy];
}

/**
 * Scale an array of path points relative to a reference point and new dimensions
 * @param {Array} points - Array of path points
 * @param {Object} bbox - Bounding box of the points
 * @param {number} newW - Desired width in pt
 * @param {number} newH - Desired height in pt
 * @param {Array} refCoords - Reference coordinates [x, y]
 * @param {boolean} allHandles - If `false` scales only if `transformLeft`/`transformRight` is set
 */
function scalePoints(points, bbox, newW, newH, refCoords, allHandles) {
  var currW = bbox.maxX - bbox.minX;
  var currH = bbox.maxY - bbox.minY;
  var ratioX = (currW === 0) ? 1 : newW / currW;
  var ratioY = (currH === 0) ? 1 : newH / currH;

  for (var i = 0; i < points.length; i++) {
    var item = points[i];
    var pt = item.pt;
    var oldAnch = pt.anchor;
    var newAnch = transformCoord(oldAnch, refCoords, ratioX, ratioY);

    var dX = newAnch[0] - oldAnch[0];
    var dY = newAnch[1] - oldAnch[1];

    pt.anchor = newAnch;

    // Handle left direction
    if (allHandles || item.transformLeft) {
      pt.leftDirection = transformCoord(pt.leftDirection, refCoords, ratioX, ratioY);
    } else {
      pt.leftDirection = [pt.leftDirection[0] + dX, pt.leftDirection[1] + dY];
    }

    // Handle right direction
    if (allHandles || item.transformRight) {
      pt.rightDirection = transformCoord(pt.rightDirection, refCoords, ratioX, ratioY);
    } else {
      pt.rightDirection = [pt.rightDirection[0] + dX, pt.rightDirection[1] + dY];
    }
  }
}

/**
 * Transform a coordinate relative to a reference point and scaling ratios
 * @param {Array} coord - Coordinate to transform [x, y]
 * @param {Array} ref - Reference point [x, y]
 * @param {number} ratioX - Scaling ratio for X-axis
 * @param {number} ratioY - Scaling ratio for Y-axis
 * @returns {Array} Transformed coordinate [x, y]
 */
function transformCoord(coord, ref, rx, ry) {
  return [
    ref[0] + (coord[0] - ref[0]) * rx,
    ref[1] + (coord[1] - ref[1]) * ry
  ];
}

/**
 * Get reference point coordinates based on a bounding box and index
 * @param {Object} bbox - Bounding box
 * @param {number} idx - Index to determine reference point position (0-8)
 * @returns {Array} Reference point coordinates [x, y]
 */
function getRefPointCoords(bbox, idx) {
  var centerX = bbox.minX + (bbox.maxX - bbox.minX) / 2;
  var centerY = bbox.minY + (bbox.maxY - bbox.minY) / 2;

  var x = (idx % 3 === 0) ? bbox.minX :
          (idx % 3 === 1 ? centerX :
          bbox.maxX);

  var y = (idx < 3) ? bbox.maxY :
          (idx < 6 ? centerY :
          bbox.minY);

  return [x, y];
}

/**
 * Evaluate a mathematical expression from a string input
 * Supports +, -, *, /, parentheses and decimal numbers
 * @param {string} str - The string expression to evaluate (e.g. '100/3', '50*2+10')
 * @param {number} def - The default value to return if evaluation fails
 * @returns {number} The evaluated result or the default value
 */
function evalMath(str, def) {
  if (def === undefined) def = 0;
  if (!str || !str.length) return def;

  // Normalize: replace commas with dots, remove all chars except digits, operators, dots, parentheses
  str = str.replace(/,/g, '.').replace(/[^\d+\-*\/().]/g, '');

  if (!str.length) return def;

  // Reject strings that are only operators with no operands
  if (/^[+\-*\/]+$/.test(str)) return def;

  try {
    var result = eval(str);
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return def;
    var pow = Math.pow(10, 4);
    return Math.round(result * pow) / pow;
  } catch (err) {
    return def;
  }
}

/**
 * Round a number
 * @param {number} value - The number to be rounded
 * @returns {number} The rounded number
 */
function round(value) {
  var digits = 10000;
  return Math.round(value * digits) / digits;
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
        .replace(/\t/g, "\t")
        .replace(/\r/g, "\r")
        .replace(/\n/g, "\n")
        .replace(/"/g, '\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

// Run script
try {
  main();
} catch (err) {}