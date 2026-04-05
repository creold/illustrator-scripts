/*
  DrawPolyline.jsx for Adobe Illustrator
  Description: Extends open path ends by adding a segment of given length and angle from selected endpoints
  Date: March, 2026
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
  // Preset custom angles for buttons 
  var ANGLE_PRESETS = [
    [90, 180, 270, 360],
    [45, 90, 135, 180],
    [30, 60, 90, 120],
    [15, 30, 45, 60],
    [10, 20, 30, 40],
    [5, 10, 15, 20],
  ];

  var SCRIPT = {
        name: 'Draw Polyline',
        version: 'v0.1'
      };

  var CFG = {
        units: getUnits(),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        sf: 1 // Scale factor for Large Canvas mode
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!isCorrectEnv()) return;

  var defaultData = {
    line: { length: 10, angle: 0 },
    arc: { radius: 10, length: 31.416, sweep: 180, chord: 20, height: 2.67, angle: 0 }
  };

  var sessionData = {
    line: { length: 10, angle: 0 },
    arc: { radius: 10, length: 31.416, sweep: 180, chord: 20, height: 2.67, angle: 0 }
  };

  var doc = app.activeDocument;
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  var isRulerTopLeft = app.preferences.getBooleanPreference('isRulerOriginTopLeft');
  var isRulerInFourthQuad = app.preferences.getBooleanPreference('isRulerIn4thQuad');
  CFG.isFlipY = isRulerTopLeft && isRulerInFourthQuad;

  var states = [];
  var activePresetIdx = 0;
  var view = doc.views[0];
  var originPoint = [view.centerPoint[0], view.centerPoint[1]];
  var isUndo = false;
  
  var paths = getPaths(app.selection);
  if (paths.length > 0) {
    // Build initial state: for each path, which endpoints are selected
    // Each entry: { path: PathItem, addToStart: bool, addToEnd: bool }
    for (var i = 0; i < paths.length; i++) {
      var state = getInitialState(paths[i]);
      if (state) states.push(state);
    }
  }

  var activePoints = getActivePoints(states);

  app.selection = null;

  // ==========================================
  //  DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];

  // ==========================================
  //  MODE
  // ==========================================
  var modeGrp = win.add('group');
      modeGrp.orientation = 'row';
      modeGrp.alignChildren = ['left', 'top'];

  var modeLbl = modeGrp.add('statictext', undefined, 'Mode:');
      modeLbl.justify = 'right';
      modeLbl.preferredSize.width = 45;

  var rbLine = modeGrp.add('radiobutton', undefined, 'Line');
      rbLine.helpTip = 'Draw straight line segments';
      rbLine.value = true;
  var rbArc = modeGrp.add('radiobutton', undefined, 'Arc');
      rbArc.helpTip = 'Draw curved segments (arcs)';

  var inpWrapper = win.add('group');
      inpWrapper.orientation = 'column';
      inpWrapper.alignChildren = ['fill', 'top']
      inpWrapper.spacing = 0;

  // ==========================================
  //  X COORDINATE
  // ==========================================
  var xGrp = inpWrapper.add('group');
      xGrp.orientation = 'row';
      xGrp.alignChildren = ['left', 'center'];
      xGrp.margins = [0, 0, 0, 10];

  var xLbl = xGrp.add('statictext', undefined, '\u0394X:');
      xLbl.justify = 'right';
      xLbl.preferredSize.width = 45;

  var xInp = xGrp.add('edittext', undefined, '0');
      xInp.preferredSize.width = 120;
      xInp.helpTip = 'Relative X coordinate of the point';

  xGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  Y COORDINATE
  // ==========================================
  var yGrp = inpWrapper.add('group');
      yGrp.orientation = 'row';
      yGrp.alignChildren = ['left', 'center'];
      yGrp.margins = [0, 0, 0, 10];

  var yLbl = yGrp.add('statictext', undefined, '\u0394Y:');
      yLbl.justify = 'right';
      yLbl.preferredSize.width = 45;

  var yInp = yGrp.add('edittext', undefined, '0');
      yInp.preferredSize.width = 120;
      yInp.helpTip = 'Relative Y coordinate of the point';

  yGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  ARC RADIUS
  // ==========================================
  var radiusGrp = inpWrapper.add('group');
      radiusGrp.orientation = 'row';
      radiusGrp.alignChildren = ['left', 'center'];
      radiusGrp.margins = [0, 0, 0, 10];
      radiusGrp.visible = false;

  var radiusLbl = radiusGrp.add('statictext', undefined, 'Radius:');
      radiusLbl.justify = 'right';
      radiusLbl.preferredSize.width = 45;

  var radiusInp = radiusGrp.add('edittext', undefined, '10');
      radiusInp.preferredSize.width = 120;
      radiusInp.helpTip = 'Distance from the center\nto the arc curve';

  radiusGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  SEGMENT LENGTH
  // ==========================================
  var lengthGrp = inpWrapper.add('group');
      lengthGrp.orientation = 'row';
      lengthGrp.alignChildren = ['left', 'center'];
      lengthGrp.margins = [0, 0, 0, 10];

  var lengthLbl = lengthGrp.add('statictext', undefined, 'Length:');
      lengthLbl.justify = 'right';
      lengthLbl.preferredSize.width = 45;

  var lengthInp = lengthGrp.add('edittext', undefined, '10');
      lengthInp.preferredSize.width = 120;
      lengthInp.helpTip = 'Length of the segment.\nUnits: ' + CFG.units + ' (from Document Setup)';

  lengthGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  CHORD LENGTH (ARC MODE)
  // ==========================================
  var chordGrp = inpWrapper.add('group');
      chordGrp.orientation = 'row';
      chordGrp.alignChildren = ['left', 'center'];
      chordGrp.margins = [0, 0, 0, 10];
      chordGrp.visible = false;

  var chordLbl = chordGrp.add('statictext', undefined, 'Chord:');
      chordLbl.justify = 'right';
      chordLbl.preferredSize.width = 45;

  var chordInp = chordGrp.add('edittext', undefined, '20');
      chordInp.preferredSize.width = 120;
      chordInp.helpTip = 'Straight-line distance between\nthe start and end of the arc';

  chordGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  ARC HEIGHT (ARC MODE)
  // ==========================================
  var heightGrp = inpWrapper.add('group');
      heightGrp.orientation = 'row';
      heightGrp.alignChildren = ['left', 'center'];
      heightGrp.margins = [0, 0, 0, 10];
      heightGrp.visible = false;

  var heightLbl = heightGrp.add('statictext', undefined, 'Height:');
      heightLbl.justify = 'right';
      heightLbl.preferredSize.width = 45;

  var heightInp = heightGrp.add('edittext', undefined, '0');
      heightInp.preferredSize.width = 120;
      heightInp.helpTip = 'Perpendicular distance from the chord\nto highest point of the arc';

  heightGrp.add('statictext', undefined, CFG.units);

  // ==========================================
  //  SWEEP ANGLE (ARC MODE)
  // ==========================================
  var sweepGrp = inpWrapper.add('group');
      sweepGrp.orientation = 'row';
      sweepGrp.alignChildren = ['left', 'center'];
      sweepGrp.margins = [0, 0, 0, 10];
      sweepGrp.visible = false;

  var sweepLbl = sweepGrp.add('statictext', undefined, 'Sweep:');
      sweepLbl.justify = 'right';
      sweepLbl.preferredSize.width = 45;

  var sweepInp = sweepGrp.add('edittext', undefined, '0');
      sweepInp.preferredSize.width = 120;
      sweepInp.helpTip = 'Central angle of the arc\nin degrees';

  sweepGrp.add('statictext', undefined, '\u00B0');

  // ==========================================
  //  SEGMENT ANGLE
  // ==========================================
  var angleGrp = inpWrapper.add('group');
      angleGrp.orientation = 'row';
      angleGrp.alignChildren = ['left', 'center'];

  var angleLbl = angleGrp.add('statictext', undefined, 'Angle:');
      angleLbl.justify = 'right';
      angleLbl.preferredSize.width = 45;

  var angleInp = angleGrp.add('edittext', undefined, '0');
      angleInp.preferredSize.width = 120;
      angleInp.helpTip = 'Rotation angle of the segment\nrelative to the X-axis';

  angleGrp.add('statictext', undefined, '\u00B0');

  // ==========================================
  //  ANGLE PRESETS BUTTONS
  // ==========================================
  var presetGrp = win.add('group');
      presetGrp.orientation = 'row';
      presetGrp.alignChildren = ['fill', 'center'];

  var presetBtns = [];
  for (var i = 0; i < 4; i++) {
    presetBtns.push( createPresetBtn(i) );
  }

  // ==========================================
  //  BUTTONS
  // ==========================================
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'fill'];

  var btnSettings = btns.add('button', undefined, '\u2699', { name: 'settings' });
      btnSettings.preferredSize.width = 28;
      btnSettings.helpTip = 'Angle presets'
  var btnClose = btns.add('button', undefined, 'Close');
      btnClose.helpTip = 'Press Alt and click\nto reset values';
  var btnAdd  = btns.add('button', undefined, 'Add', { name: 'ok'});

  // ==========================================
  //  FOOTER
  // ==========================================
  var footer = win.add('group');
      footer.orientation = 'row';
      footer.alignChildren = ['fill', 'center'];

  var isPreview = footer.add('checkbox', undefined, 'Preview');
      isPreview.justify = 'left';

  var link = footer.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // ==========================================
  //  EVENTS
  // ==========================================
  loadSettings(SETTINGS);

  rbLine.onClick = rbArc.onClick = function () {
    switchMode(rbArc.value);
    preview();
  };

  bindStepperKeys(xInp, -16000, 16000, syncPolar);
  bindStepperKeys(yInp, -16000, 16000, syncPolar);

  bindStepperKeys(radiusInp, 0.001, 10000, function() { syncArc('radius'); });

  bindStepperKeys(lengthInp, 0.001, 10000, function() {
    if (rbLine.value) updateCoordinates();
    else syncArc('length');
  });

  bindStepperKeys(angleInp, -720, 720, function() {
    if (rbLine.value) updateCoordinates();
  });

  bindStepperKeys(chordInp, 0.001, 10000, function() { syncArc('chord'); });
  bindStepperKeys(heightInp, 0.001, 10000, function() { syncArc('height'); });
  bindStepperKeys(sweepInp, -360, 360, function() { syncArc('sweep'); });

  xInp.onChange = yInp.onChange = function () {
    this.text = evalMath(this.text, 0);
    syncPolar();
    preview();
  };

  lengthInp.onChange = function () {
    this.text = Math.abs(evalMath(this.text, 10));
    if (rbLine.value) updateCoordinates();
    else syncArc('length');
    preview();
  };

  angleInp.onChange = function () {
    this.text = evalMath(this.text, 0);
    if (rbLine.value) updateCoordinates();
    preview();
  };

  // ARC EVENTS
  radiusInp.onChange = function () {
    this.text = Math.abs(evalMath(this.text, 10));
    syncArc('radius');
    preview();
  };

  chordInp.onChange = function () {
    this.text = Math.abs(evalMath(this.text, 0));
    syncArc('chord');
    preview();
  };

  heightInp.onChange = function () {
    this.text = Math.abs(evalMath(this.text, 0));
    syncArc('height');
    preview();
  };

  sweepInp.onChange = function () {
    this.text = evalMath(this.text, 0);
    syncArc('sweep');
    preview();
  };

  /**
   * Open a dialog window for selecting angle presets
   */
  btnSettings.onClick = function () {
    var setsWin = new Window('dialog', 'Angle Presets');
        setsWin.orientation = 'column';
        setsWin.alignChildren = ['fill', 'top'];

    // Add a listbox to display presets
    var presetList = setsWin.add('listbox', undefined, []);

    for (var i = 0; i < ANGLE_PRESETS.length; i++) {
      var preset = ANGLE_PRESETS[i];
      // Format preset angles as a string (e.g., "30°, 45°, 60°")
      presetList.add('item', preset.join('\u00B0, ') + '\u00B0');
    }
    presetList.selection = activePresetIdx;

    var setsBtns = setsWin.add('group');
        setsBtns.orientation = 'row';
        setsBtns.alignChildren = ['fill', 'center'];

    var btnCancel = setsBtns.add('button', undefined, 'Cancel', { name: 'cancel' });
    var btnOk = setsBtns.add('button', undefined, 'OK', { name: 'ok' });

    btnCancel.onClick = setsWin.close;

    btnOk.onClick = function () {
      if (presetList.selection) {
        activePresetIdx = presetList.selection.index;
        updatePresetButtons();
      }
      setsWin.close();
    };

    setsWin.location = win.location;
    setsWin.show();
  };

  /**
   * Reset session data to defaults if Alt key is pressed,
   * otherwise save settings and close the window
   */
  btnClose.onClick = function () {
    if (ScriptUI.environment.keyboardState.altKey) {
      var mode = rbArc.value ? 'arc' : 'line';
      for (var prop in defaultData[mode]) {
        sessionData[mode][prop] = defaultData[mode][prop];
      }
      updateUI(rbArc.value);
      // Reset button highlight
      this.active = true;
      this.active = false;
      this.text = 'Close';
      lengthInp.active = true;
      preview();
    } else {
      saveSettings(SETTINGS);
      win.close();
    }
  }

  /**
   * Add new segment
   */
  btnAdd.onClick = function () {
    if (isUndo) {
      app.undo();
      isUndo = false;
      if (states.length && states[0].isCreated) states = [];
    }

    applyAll();

    // Update states for next step
    if (states.length) {
      for (var j = 0; j < states.length; j++) {
        var state = states[j];
        state.isCreated = false;
      }
    }

    if (rbLine.value) updateCoordinates();
    app.redraw();
    if (isPreview.value) preview();

    // Reset button highlight
    this.active = true;
    this.active = false;
    lengthInp.active = true;
  };

  isPreview.onClick = preview;

  setTextHandler(link, function () {
    openURL('https://github.com/creold');
  });

  win.onShow = function () {
    updatePresetButtons();
    updateUI(rbArc.value);
    if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
      lengthInp.active = true;
    }
  };

  win.addEventListener('keydown', function (kd) {
    btnClose.text = kd.keyName === 'Alt' ? 'Reset' : 'Close';
    win.update();
  });

  win.addEventListener('keyup', function(kd) {
    btnClose.text = 'Close';
    win.update();
  });

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  };

  // ==========================================
  //  HELPER FUNCTIONS
  // ==========================================
  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isUndo) {
        app.undo();
        isUndo = false;
        if (states.length && states[0].isCreated) states = [];
      }

      if (isPreview.value) {
        var success = applyAll();
        if (success) {
          isUndo = true;
          app.redraw();
        }
      } else {
        app.redraw();
      }
    } catch (err) {
      isUndo = false;
    }
  }

  /**
   * Apply a transformation to all states based on current mode (line or arc)
   * @returns {boolean} True if document was actually modified
   */
  function applyAll() {
    var isArcMode = rbArc.value;

    var length = Math.abs(parseFloat(lengthInp.text));
    length = convertUnits(length, CFG.units, 'px') / CFG.sf;

    var radius = Math.abs(parseFloat(radiusInp.text));
    radius = convertUnits(radius, CFG.units, 'px') / CFG.sf;

    var angle = parseFloat(angleInp.text);
    var sweep = isArcMode ? (parseFloat(sweepInp.text) || 0) : 0;

    if (isNaN(length) || isNaN(angle) || length === 0) return false;

    if (!states.length) {
      doc.activeLayer.visible = true;
      doc.activeLayer.locked = false;

      var newPath = doc.activeLayer.pathItems.add();
      newPath.filled = false;
      newPath.stroked = true;
      newPath.strokeWidth = 1;

      var sp = newPath.pathPoints.add();
      sp.anchor = originPoint;
      sp.leftDirection = originPoint;
      sp.rightDirection = originPoint;

      states.push({
        path: newPath,
        addToStart: false,
        addToEnd: true,
        isCreated: true
      });
    }

    if (isArcMode) {
      // Arc mode
      if (Math.abs(sweep) < 0.001) return false;

      for (var i = 0; i < states.length; i++) {
        states[i] = applyArcSegment(states[i], radius, sweep, angle);
      }
    } else {
      // Line mode
      var rad  = angle * Math.PI / 180;
      var cosA = Math.cos(rad);
      var sinA = Math.sin(rad);

      for (var i = 0; i < states.length; i++) {
        states[i] = applyLineSegment(states[i], length, cosA, sinA);
      }
    }

    app.selection = null;
    return true;
  }

  /**
   * Create a preset button for a given index
   * @param {number} idx - The index of the preset angle in the array
   * @returns {Button} The created ScriptUI button element
   */
  function createPresetBtn(idx) {
    var btn = presetGrp.add('button', undefined, '');
        btn.preferredSize.width = 38;
    
    btn.onClick = function () {
      angleInp.text = ANGLE_PRESETS[activePresetIdx][idx];
      // Reset button highlight
      this.active = true;
      this.active = false;
      angleInp.active = true;
      preview();
    };
    
    return btn;
  }

  /**
   * Refresh preset button labels from the active preset
   */
  function updatePresetButtons() {
    var angles = ANGLE_PRESETS[activePresetIdx];
    for (var i = 0; i < presetBtns.length; i++) {
      presetBtns[i].text = angles[i] + '\u00B0';
    }
    win.update();
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {EditText} input - The input element to which the event listener will be attached
   * @param {number} [min] - The minimum allowed value for the numerical input
   * @param {number} [max] - The maximum allowed value for the numerical input
   * @param {Function} [callback] - Optional function to call after value changes.
   * @returns {void}
   */
  function bindStepperKeys(input, min, max, callback) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text) || 0;
      // Handle decrement (Down arrow or '[' key)
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        kd.preventDefault();
        if (typeof callback === 'function') callback();
        preview();
      }
      // Handle increment (Up arrow or ']' key)
      else if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
        if (typeof callback === 'function') callback();
        preview();
      }
    });
  }

  /**
   * Update the UI window based on the current mode (arc or line)
   * @param {boolean} isArcMode - If true, UI is configured for arc mode; otherwise, for line mode
   */
  function updateUI(isArcMode) {
    var min = [0, 0], max = [1000, 1000];

    radiusGrp.maximumSize = chordGrp.maximumSize = isArcMode ? max : min;
    heightGrp.maximumSize = sweepGrp.maximumSize = isArcMode ? max : min;
    radiusGrp.visible = chordGrp.visible = isArcMode;
    heightGrp.visible = sweepGrp.visible = isArcMode;

    xGrp.maximumSize = !isArcMode ? max : min;
    yGrp.maximumSize = !isArcMode ? max : min;
    xGrp.visible = yGrp.visible = !isArcMode;

    // Update input fields with session data
    if (isArcMode) {
      radiusInp.text = sessionData.arc.radius;
      lengthInp.text = sessionData.arc.length;
      chordInp.text = sessionData.arc.chord;
      heightInp.text = sessionData.arc.height;
      sweepInp.text = sessionData.arc.sweep;
      angleInp.text = sessionData.arc.angle;
    } else {
      lengthInp.text = sessionData.line.length;
      angleInp.text = sessionData.line.angle;
      updateCoordinates();
    }

    // Force layout update
    win.layout.layout(true);
  }

  /**
   * Toggle UI mode between arc and line modes
   * @param {boolean} isArcMode - If true, switches to arc mode; otherwise, switches to line mode
   */
  function switchMode(isArcMode) {
    if (isArcMode) {
      sessionData.line.length = lengthInp.text;
      sessionData.line.angle = angleInp.text;
    } else {
      sessionData.arc.radius = radiusInp.text;
      sessionData.arc.length = lengthInp.text;
      sessionData.arc.chord = chordInp.text;
      sessionData.arc.height = heightInp.text;
      sessionData.arc.sweep = sweepInp.text;
      sessionData.arc.angle = angleInp.text;
    }

    // Update UI to reflect new mode
    updateUI(isArcMode);
  }

  /**
   * Synchronize Cartesian coordinates (x, y) to polar coordinates (length, angle)
   * @returns {void}
   */
  function syncPolar() {
    xInp.text = evalMath(xInp.text, 0);
    yInp.text = evalMath(yInp.text, 0);

    var dX = convertUnits(parseFloat(xInp.text), CFG.units, 'px') / CFG.sf;
    var dY = convertUnits(parseFloat(yInp.text), CFG.units, 'px') / CFG.sf;
    if (CFG.isFlipY) dY *= -1;

    var length = Math.sqrt(dX * dX + dY * dY);
    var angle = Math.atan2(dY, dX) * 180 / Math.PI;

    lengthInp.text = round(convertUnits(length * CFG.sf, 'px', CFG.units));
    angleInp.text = round(angle);
  }

  /**
   * Calculate and update the UI absolute X and Y coordinate fields
   * Converts Length and Angle (polar) into Cartesian coordinates relative to the start point
   * @returns {void}
   */
  function updateCoordinates() {
    var length = convertUnits(parseFloat(lengthInp.text), CFG.units, 'px') / CFG.sf;
    var angle = parseFloat(angleInp.text) * Math.PI / 180;

    var dX = length * Math.cos(angle);
    var dY = length * Math.sin(angle);

    xInp.text = round(convertUnits(dX * CFG.sf, 'px', CFG.units));
    yInp.text = round(convertUnits((CFG.isFlipY ? -dY : dY) * CFG.sf, 'px', CFG.units));
  }

  /**
   * Synchronize arc properties (length, chord, height, sweep) based on the triggering parameter
   * @param {string} trigger - The property that triggered the sync
   * @returns {void}
   */
  function syncArc(trigger) {
      var actions = {
          radius: ['length', 'chord', 'height'],
          length: ['sweep', 'chord', 'height'],
          chord: ['sweep', 'length', 'height'],
          height: ['sweep', 'length', 'chord'],
          sweep: ['length', 'chord', 'height']
      };

      var updates = actions[trigger];
      if (!updates) return;

      for (var i = 0; i < updates.length; i++) {
          switch (updates[i]) {
              case 'length': updateArcLength(); break;
              case 'chord': updateArcChord(); break;
              case 'height': updateArcHeight(); break;
              case 'sweep': updateArcSweep(trigger); break;
          }
      }
  }

  /**
   * Calculate the arc length based on radius and sweep angle
   * @returns {void} Updates the length input field with the calculated value
   */
  function updateArcLength() {
    var radius = convertUnits(parseFloat(radiusInp.text), CFG.units, 'px') / CFG.sf;
    var sweep = parseFloat(sweepInp.text) || 180;
    var arcLength = (2 * Math.PI * radius * Math.abs(sweep)) / 360;
    lengthInp.text = round(convertUnits(arcLength * CFG.sf, 'px', CFG.units));
  }

  /**
   * Calculate the arc chord based on radius and sweep angle
   * @returns {void} Updates the chord input field with the calculated value
   */
  function updateArcChord() {
    var radius = convertUnits(parseFloat(radiusInp.text), CFG.units, 'px') / CFG.sf;
    var sweep = parseFloat(sweepInp.text) || 180;
    var chord = 2 * radius * Math.sin((Math.abs(sweep) / 2) * Math.PI / 180);
    chordInp.text = round(convertUnits(chord * CFG.sf, 'px', CFG.units));
  }

  /**
   * Calculate the arc height (sagitta) based on radius and sweep angle
   * @returns {void} Updates the chord input field with the calculated value
   */
  function updateArcHeight() {
    var radius = convertUnits(parseFloat(radiusInp.text), CFG.units, 'px') / CFG.sf;
    var sweep = parseFloat(sweepInp.text) || 0;
    var height = radius * (1 - Math.cos((Math.abs(sweep) / 2) * Math.PI / 180));
    heightInp.text = round(convertUnits(height * CFG.sf, 'px', CFG.units));
  }

  /**
   * Calculate the sweep angle based on radius and arc / chord / sagitta length
   * @param {string} source - The input source triggering the update
   * @returns {void} Updates the sweep input field with the calculated value
   */
  function updateArcSweep(source) {
    var radius = convertUnits(parseFloat(radiusInp.text), CFG.units, 'px') / CFG.sf;
    var length = convertUnits(parseFloat(lengthInp.text), CFG.units, 'px') / CFG.sf;
    var chord = convertUnits(parseFloat(chordInp.text), CFG.units, 'px') / CFG.sf;
    var height = convertUnits(parseFloat(heightInp.text), CFG.units, 'px') / CFG.sf;

    if (radius === 0) return;

    var sweep = 0;
    var currSign = parseFloat(sweepInp.text) < 0 ? -1 : 1;

    if (source === 'length') {
      // Calculate sweep from arc length
      sweep = (length * 360) / (2 * Math.PI * radius);
    } else if (source === 'chord') {
      if (chord > 2 * radius) {
        chord = 2 * radius;
        chordInp.text = round(convertUnits(chord * CFG.sf, 'px', CFG.units));
      }
      // Calculate sweep from chord length
      sweep = 2 * Math.asin(chord / (2 * radius)) * 180 / Math.PI;
    } else if (source === 'height') {
      if (height > 2 * radius) {
        height = 2 * radius;
        heightInp.text = round(convertUnits(height * CFG.sf, 'px', CFG.units));
      }
      // Calculate sweep from height (saggita) length
      sweep = 2 * Math.acos(1 - (height / radius)) * 180 / Math.PI;
    }

    sweepInp.text = round(sweep * currSign);
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
    // Update session data
    if (rbArc.value) {
      sessionData.arc.radius = radiusInp.text;
      sessionData.arc.length = lengthInp.text;
      sessionData.arc.chord  = chordInp.text;
      sessionData.arc.height = heightInp.text;
      sessionData.arc.sweep  = sweepInp.text;
      sessionData.arc.angle  = angleInp.text;
    } else {
      sessionData.line.length = lengthInp.text;
      sessionData.line.angle  = angleInp.text;
    }

    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.mode = rbLine.value ? 'line' : 'arc';
    data.line_len = sessionData.line.length;
    data.line_ang = sessionData.line.angle;
    data.arc_rad = sessionData.arc.radius;
    data.arc_len = sessionData.arc.length;
    data.arc_chord = sessionData.arc.chord;
    data.arc_hgt = sessionData.arc.height;
    data.arc_swp = sessionData.arc.sweep;
    data.arc_ang = sessionData.arc.angle;

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

        rbLine.value = (data.mode !== 'arc');
        rbArc.value = !rbLine.value;

        defaultData.line.length = Math.abs(evalMath(data.line_len, 10)) || 10;
        defaultData.line.angle = Math.abs(evalMath(data.line_ang, 0)) || 0;
        defaultData.arc.radius = Math.abs(evalMath(data.arc_rad, 10)) || 10;
        defaultData.arc.length = Math.abs(evalMath(data.arc_len, 31.416)) || 31.416;
        defaultData.arc.chord = Math.abs(evalMath(data.arc_chord, 20)) || 20;
        defaultData.arc.height = Math.abs(evalMath(data.arc_hgt, 2.67)) || 2.67;
        defaultData.arc.sweep = Math.abs(evalMath(data.arc_swp, 180)) || 180;
        defaultData.arc.angle = Math.abs(evalMath(data.arc_ang, 180)) || 180;

        for (var key in defaultData) {
          for (var prop in defaultData[key]) {
            sessionData[key][prop] = defaultData[key][prop];
          }
        }

        if (rbLine.value) {
          updateCoordinates();
        } else { 
          syncArc('sweep');
        }
      }
    } catch (err) {
      return;
    }
  }

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
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Nothing selected\nPlease select one or more open paths', 'Script Error');
          return false;
        }
        break;
    }
  }

  return true;
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
 * Get paths from a collection of Illustrator PageItems, recursively including
 * paths within groups and compounds
 * @param {PageItems|Array} coll - The collection of Illustrator PageItems
 * @returns {Array} An array containing the paths from the provided collection
 */
function getPaths(coll) {
  var results = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      results = [].concat(results, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      results.push(item.pathItems[0]);
    } else if (/pathitem/i.test(item.typename)) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Build initial endpoint state for a path based on current selection
 * @param {PathItem} path - The path to inspect
 * @returns {Object|null} State object or null if no endpoints selected
 */
function getInitialState(path) {
  if (path.closed) return null;

  var pp = path.pathPoints;
  var lastIdx = pp.length - 1;
  if (pp.length < 1) return null;

  var addToStart = false;
  var addToEnd = false;

  for (var i = 0; i < pp.length; i++) {
    if (pp[i].selected !== PathPointSelection.ANCHORPOINT) continue;
    if (i === 0) addToStart = true;
    if (i === lastIdx) addToEnd = true;
  }

  if (!addToStart && !addToEnd) return null;

  return {
    path: path,
    addToStart: addToStart,
    addToEnd: addToEnd,
    isCreated: false
  };
}

/**
 * Count the number of active points in an array of state objects
 * @param {Array} states - Array of state objects
 * @returns {number} Total count of active points
 */
function getActivePoints(states) {
  var count = 0;
  for (var i = 0; i < states.length; i++) {
    if (states[i].addToStart) count++;
    if (states[i].addToEnd) count++;
  }
  return count;
}

/**
 * Apply an straight segment to a path
 * @param {Object} state - Current state { path, addToStart, addToEnd }
 * @param {number} length - Segment length in document units
 * @param {number} cosA - X component of the direction unit vector
 * @param {number} sinA - Y component of the direction unit vector (pre-inverted for AI coords)
 * @returns {Object} Updated state
 */
function applyLineSegment(state, length, cosA, sinA) {
  var path = state.path;
  var addToEnd = state.addToEnd;
  var addToStart = state.addToStart;

  var pp = path.pathPoints;
  var lastIdx = pp.length - 1;

  // Append segment to the end of the path
  if (addToEnd) {
    var endAnchor = pp[lastIdx].anchor;
    pp[lastIdx].rightDirection = endAnchor; // Reset right direction

    var np = pp.add(); // New PathPoint
    np.anchor = [endAnchor[0] + length * cosA, endAnchor[1] + length * sinA];
    np.leftDirection = np.anchor;
    np.rightDirection = np.anchor;
    np.pointType = PointType.CORNER;
  }

  // Prepend segment to the start of the path
  if (addToStart) {
    var sa = pp[0].anchor;
    var newAnchor = [sa[0] + length * cosA, sa[1] + length * sinA];
    path = prependPointToPath(path, newAnchor);
  }

  return {
    path: path,
    addToStart: addToStart,
    addToEnd: addToEnd,
    isCreated: !!state.isCreated
  };
}

/**
 * Rebuild a path with a new point prepended before all existing points,
 * preserving handles and point types of all original points
 * @param {PathItem} path - The original path to rebuild
 * @param {Array} newAnchor - [x, y] coordinates of the new first point
 * @returns {PathItem} The modified path with the new anchor prepended
 */
function prependPointToPath(path, newAnchor) {
  var pp = path.pathPoints;
  var oldData = [];
  var i, data;

  // Store original path data (anchor, handles, type)
  for (i = 0; i < pp.length; i++) {
    data = pp[i];
    oldData.push({
      anch: data.anchor,
      left: data.leftDirection,
      right: data.rightDirection,
      type: data.pointType
    });
  }

  var newCoords = [newAnchor];
  for (i = 0; i < oldData.length; i++) {
    newCoords.push(oldData[i].anch);
  }

  // Apply new path structure
  path.setEntirePath(newCoords); 
  var npp = path.pathPoints;

  // Configure the new first point
  npp[0].pointType = PointType.CORNER;
  npp[0].leftDirection = npp[0].anchor;
  npp[0].rightDirection = npp[0].anchor;

  // Restore original data for all subsequent points
  for (var k = 0; k < oldData.length; k++) {
    var target = npp[k + 1];
    var data = oldData[k];
    target.anchor = data.anch;
    target.leftDirection = data.left;
    target.rightDirection = data.right;
    target.pointType = data.type;
  }

  return path;
}

/**
 * Apply an arc segment to a path
 * @param {Object} state - Current state { path, addToStart, addToEnd }
 * @param {number} radius - Arc radius in px
 * @param {number} sweepDeg - Sweep angle in degrees (+CCW, -CW in math; AI Y-flipped)
 * @param {number} dirDeg - Tangent direction from endpoint in degrees (0=right, 90=up)
 * @returns {Object} Updated state
 */
function applyArcSegment(state, radius, sweepDeg, dirDeg) {
  var path = state.path;
  var addToEnd = state.addToEnd;
  var addToStart = state.addToStart;

  if (addToEnd) path = appendArc(path, radius, sweepDeg, dirDeg);
  if (addToStart) path = prependArc(path, radius, sweepDeg, dirDeg);

  return {
    path: path,
    addToStart: addToStart,
    addToEnd: addToEnd,
    isCreated: !!state.isCreated
  };
}

/**
 * Append an arc segment to the end of a path using Bezier approximation
 * @param {PathItem} path - The original path to rebuild
 * @param {number} radius - Arc radius in px
 * @param {number} sweepDeg - Sweep angle in degrees (+CCW, -CW in math; AI Y-flipped)
 * @param {number} dirDeg - Tangent direction from endpoint in degrees (0=right, 90=up)
 * @returns {PathItem} Updated path
 */
function appendArc(path, radius, sweepDeg, dirDeg) {
  var pp = path.pathPoints;
  var lastIdx = pp.length - 1;
  var anchor = pp[lastIdx].anchor;

  // Splits sweep into ≤90° chunks to stay within Bezier accuracy limits
  var segments = Math.ceil(Math.abs(sweepDeg) / 90);
  var segSweep = sweepDeg / segments;
  var segRad = segSweep * Math.PI / 180;
  var sweepDir = sweepDeg >= 0 ? 1 : -1;

  // Calculate center and start angle
  var dirRad = dirDeg * Math.PI / 180;
  var angleToCenter = dirRad + (Math.PI / 2);
  
  var cx = anchor[0] - radius * Math.cos(angleToCenter);
  var cy = anchor[1] - radius * Math.sin(angleToCenter);

  var angStart = Math.atan2(anchor[1] - cy, anchor[0] - cx);
  var k = (4 / 3) * Math.tan(Math.abs(segRad) / 4) * radius;

  // Update outgoing handle of the last point
  pp[lastIdx].rightDirection = [
    anchor[0] + k * Math.cos(angStart + (sweepDir * Math.PI / 2)),
    anchor[1] + k * Math.sin(angStart + (sweepDir * Math.PI / 2))
  ];

  // Add new points for the arc
  for (var s = 0; s < segments; s++) {
    var angEnd = angStart + (segRad * (s + 1));
    var ex = cx + radius * Math.cos(angEnd);
    var ey = cy + radius * Math.sin(angEnd);

    var np = pp.add();
    np.anchor = [ex, ey];
    np.leftDirection = [
      ex + k * Math.cos(angEnd - (sweepDir * Math.PI / 2)),
      ey + k * Math.sin(angEnd - (sweepDir * Math.PI / 2))
    ];
    
    if (s < segments - 1) {
      np.rightDirection = [
        ex + k * Math.cos(angEnd + (sweepDir * Math.PI / 2)),
        ey + k * Math.sin(angEnd + (sweepDir * Math.PI / 2))
      ];
    } else {
      np.rightDirection = np.anchor;
    }
    np.pointType = PointType.SMOOTH;
  }

  return path;
}

/**
 * Prepend an arc segment to the start of a path using Bezier approximation
 * @param {PathItem} path - The original path to rebuild
 * @param {number} radius - Arc radius in px
 * @param {number} sweepDeg - Sweep angle in degrees (+CCW, -CW in math; AI Y-flipped)
 * @param {number} dirDeg - Tangent direction from endpoint in degrees (0=right, 90=up)
 * @returns {PathItem} Updated path
 */
function prependArc(path, radius, sweepDeg, dirDeg) {
  var pp = path.pathPoints;
  var anchor = pp[0].anchor;

  // Splits sweep into ≤90° chunks to stay within Bezier accuracy limits
  var segments = Math.ceil(Math.abs(sweepDeg) / 90);
  var segSweep = sweepDeg / segments;
  var segRad = segSweep * Math.PI / 180;
  var sweepDir = sweepDeg >= 0 ? 1 : -1;

  // Calculate center and start angle
  var dirRad = dirDeg * Math.PI / 180;
  var angleToCenter = dirRad + (Math.PI / 2);
  
  var cx = anchor[0] - radius * Math.cos(angleToCenter);
  var cy = anchor[1] - radius * Math.sin(angleToCenter);

  var angStart = Math.atan2(anchor[1] - cy, anchor[0] - cx);
  var k = (4 / 3) * Math.tan(Math.abs(segRad) / 4) * radius;

  // Generate new points (from farthest to the junction)
  var newPoints = [];
  for (var s = segments; s > 0; s--) {
    var angEnd = angStart - (segRad * s);
    var ex = cx + radius * Math.cos(angEnd);
    var ey = cy + radius * Math.sin(angEnd);

    newPoints.push({
      anch: [ex, ey],
      left: [ex + k * Math.cos(angEnd - (sweepDir * Math.PI / 2)), ey + k * Math.sin(angEnd - (sweepDir * Math.PI / 2))],
      right: [ex + k * Math.cos(angEnd + (sweepDir * Math.PI / 2)), ey + k * Math.sin(angEnd + (sweepDir * Math.PI / 2))],
      type: PointType.SMOOTH
    });
  }

  // Cache the entire old path for restoration
  var oldData = [];
  for (var i = 0; i < pp.length; i++) {
    oldData.push({
      anch: pp[i].anchor,
      left: pp[i].leftDirection,
      right: pp[i].rightDirection,
      type: pp[i].pointType
    });
  }

  // Set new path coordinates
  var coords = [];
  for (var j = 0; j < newPoints.length; j++) {
    coords.push(newPoints[j].anch);
  }
  for (var j = 0; j < oldData.length; j++) {
    coords.push(oldData[j].anch);
  }

  // Apply new path structure
  path.setEntirePath(coords);
  var npp = path.pathPoints;

  // Restore new arc points
  for (var j = 0; j < newPoints.length; j++) {
    npp[j].leftDirection = newPoints[j].left;
    npp[j].rightDirection = newPoints[j].right;
    npp[j].pointType = PointType.SMOOTH;
    if (j === 0) npp[j].leftDirection = npp[j].anchor;
  }

  // Update junction point (former first point)
  var joinIdx = newPoints.length;
  npp[joinIdx].leftDirection = [
    anchor[0] + k * Math.cos(angStart - (sweepDir * Math.PI / 2)),
    anchor[1] + k * Math.sin(angStart - (sweepDir * Math.PI / 2))
  ];
  npp[joinIdx].rightDirection = oldData[0].right;
  npp[joinIdx].pointType = PointType.SMOOTH;

  // Restore the rest of the path
  for (var m = 1; m < oldData.length; m++) {
    var idx = joinIdx + m;
    var data = oldData[m];
    npp[idx].leftDirection = data.left;
    npp[idx].rightDirection = data.right;
    npp[idx].pointType = data.type;
  }

  return path;
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
  var digits = 1000;
  return Math.round(value * digits) / digits;
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