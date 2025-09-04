/*
  ChangeOpacity.jsx for Adobe Illustrator
  Description: Set or shift the Opacity value relative to the current for the selected objects
  Date: December, 2021
  Modification date: August, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added Random Mode with various algorithms.
      Added more math operations to Fixed Mode.
  0.1.2 Removed input activation on Windows OS below CC v26.4
  0.1.1 Fixed input activation in Windows OS
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

function main () {
  var SCRIPT = {
        name: 'Change Opacity',
        version: 'v0.2'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        uiMgns: [10, 15, 10, 15],
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  if (!app.selection.length || app.selection.typename === 'TextRange') {
    alert('Few objects are selected\nPlease select at least 1 objects and try again', 'Script error');
    return;
  }

  // VARIABLES
  var doc = app.activeDocument;
  var docSel = app.selection;
  var isUndo = false; // For preview functionality

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.minimumSize.width = 300;
      win.alignChildren = ['fill', 'top'];
      win.spacing = 10;
      win.opacity = 0.97;

  // MODE
  var modePnl = win.add('panel', undefined, 'Mode');
      modePnl.orientation = 'row';
      modePnl.alignChildren = ['left', 'fill'];
      modePnl.minimumSize.width = 270;
      modePnl.spacing = 20;
      modePnl.margins = [10, 15, 10, 10];

  var isFixMode = modePnl.add('radiobutton', undefined, 'Fixed');
      isFixMode.value = true;
      isFixMode.helpTip = 'Allows entering exact values\nor calculating relative ones'

  var isRandMode = modePnl.add('radiobutton', undefined, 'Random');
      isRandMode.helpTip = 'Generates random values\nwithin set parameters';

  // MODES CONTAINER
  var modeWrapper = win.add('group');
      modeWrapper.orientation = 'column';
      modeWrapper.alignChildren = ['fill', 'fill']
      modeWrapper.spacing = 0;

  // FIXED MODE
  var fixedWrapper = modeWrapper.add('group');
      fixedWrapper.orientation = 'column';
      fixedWrapper.alignChildren = ['fill', 'fill']

  var fixedPnl = fixedWrapper.add('panel', undefined, 'Opacity');
      fixedPnl.orientation = 'row';
      fixedPnl.alignChildren = ['fill', 'center'];
      fixedPnl.margins = CFG.uiMgns;

  var fixedInp = fixedPnl.add('edittext', undefined, 100);
      fixedInp.preferredSize.width = 210;

  fixedPnl.add('statictext', undefined, '%');

  // FIXED MODE INFO
  var fixedInfoPnl = fixedWrapper.add('panel', undefined, '\u24D8 Syntax');
      fixedInfoPnl.alignChildren = ['fill', 'top'];
      fixedInfoPnl.margins = CFG.uiMgns;

  var fixedHelp = '50 - set opacity exactly 50%;' +
                  '\n+10 - increase by 10%;' +
                  '\n-15 - decrease by 15%;' +
                  '\n*1.25 - calc 125% of the current;' +
                  '\n/3 - calc 30% of the current;';
  fixedInfoPnl.add('statictext', undefined, fixedHelp, { multiline: true });

  // RANDOM MODE
  var randPnl = modeWrapper.add('panel', undefined, 'Opacity');
      randPnl.orientation = 'column';
      randPnl.alignChildren = ['fill', 'fill'];
      randPnl.spacing = CFG.isMac ? 20 : 15;
      randPnl.margins = [10, 15, 10, 15];

  // RANDOM * RANGE
  var randRangeGrp = randPnl.add('group');
      randRangeGrp.orientation = 'column';
      randRangeGrp.alignChildren = ['fill', 'top'];

  var isRandRange = randRangeGrp.add('radiobutton', undefined, 'Random in Range');
      isRandRange.helpTip = 'Example:\nRange: 20-100%\nRandom values: 23, 45, 67, 89';
      isRandRange.value = true;

  var randRangeWrapper = randRangeGrp.add('group');
      randRangeWrapper.orientation = 'row';
      randRangeWrapper.alignChildren = ['left', 'center']
      randRangeWrapper.spacing = 15;

  var randRangeInpGrp = randRangeWrapper.add('group');
      randRangeInpGrp.orientation = 'row';
      randRangeInpGrp.alignChildren = ['left', 'center'];

  randRangeInpGrp.add('statictext', undefined, 'Min-Max:');

  var randRangeInp = randRangeInpGrp.add('edittext', undefined, '20-100');
      randRangeInp.preferredSize.width = 65;

  var randRangeBtn = randRangeWrapper.add('button', undefined, 'Refresh');

  randRangeInpGrp.add('statictext', undefined, '%');

  // RANDOM * RANGE * STEP
  var randRangeStepGrp = randRangeGrp.add('group');
      randRangeStepGrp.orientation = 'row';
      randRangeStepGrp.alignChildren = ['left', 'center'];

  var stepLabel = randRangeStepGrp.add('statictext', undefined, 'Step:');
      stepLabel.preferredSize.width = CFG.isMac ? 56 : 50;
      stepLabel.justify = 'right';

  var randStepInp = randRangeStepGrp.add('edittext', undefined, 1);
      randStepInp.preferredSize.width = 65;

  randRangeStepGrp.add('statictext', undefined, '%');

  // RANDOM * INCREMENT / DECREMENT
  var randIncGrp = randPnl.add('group');
      randIncGrp.orientation = 'column';
      randIncGrp.alignChildren = ['fill', 'top'];

  var isRandInc = randIncGrp.add('radiobutton', undefined, 'Random Variation');
      isRandInc.helpTip = 'Example:\n15 - randomly increase or decrease\nthe current opacity by 15%';

  var randIncWrapper = randIncGrp.add('group');
      randIncWrapper.orientation = 'row';
      randIncWrapper.alignChildren = ['left', 'center']
      randIncWrapper.spacing = 15;

  var randIncInpGrp = randIncWrapper.add('group');
      randIncInpGrp.orientation = 'row';
      randIncInpGrp.alignChildren = ['left', 'center'];

  randIncInpGrp.add('statictext', undefined, '\u00B1');

  var randIncInp = randIncInpGrp.add('edittext', undefined, 15);
      randIncInp.preferredSize.width = CFG.isMac ? 111 : 106;

  randIncInpGrp.add('statictext', undefined, '%');

  var randIncBtn = randIncWrapper.add('button', undefined, 'Refresh');

  // RANDOM * GAUSSIAN DISTRIBUTION
  var randGaussGrp = randPnl.add('group');
      randGaussGrp.orientation = 'column';
      randGaussGrp.alignChildren = ['fill', 'top'];

  var isRandGauss = randGaussGrp.add('radiobutton', undefined, 'Gaussian Distribution');
      isRandGauss.helpTip = 'Example:\nCenter: 50%, Spread: 20%\n';
      isRandGauss.helpTip += 'Most objects will get 40-60% opacity.\n';
      isRandGauss.helpTip += 'Some objects will receive 30-40% or 60-70%.\n';
      isRandGauss.helpTip += 'Rare objects will receive 10-30% or 70-90%';

  // RANDOM * GAUSSIAN DISTRIBUTION * CENTER
  var randGaussWrapper = randGaussGrp.add('group');
      randGaussWrapper.orientation = 'row';
      randGaussWrapper.alignChildren = ['left', 'center']
      randGaussWrapper.spacing = 15;

  var randGaussCenterGrp = randGaussWrapper.add('group');
      randGaussCenterGrp.orientation = 'row';
      randGaussCenterGrp.alignChildren = ['left', 'center'];

  randGaussCenterGrp.add('statictext', undefined, 'Center:');

  var randGaussCenterInp = randGaussCenterGrp.add('edittext', undefined, 50);
      randGaussCenterInp.preferredSize.width = CFG.isMac ? 78 : 74;

  randGaussCenterGrp.add('statictext', undefined, '%');

  var randGaussBtn = randGaussWrapper.add('button', undefined, 'Refresh');

  // RANDOM * GAUSSIAN DISTRIBUTION * SPREAD
  var randGaussSpreadGrp = randGaussGrp.add('group');
      randGaussSpreadGrp.orientation = 'row';
      randGaussSpreadGrp.alignChildren = ['left', 'center'];

  randGaussSpreadGrp.add('statictext', undefined, 'Spread:');

  var randGaussSpreadInp = randGaussSpreadGrp.add('edittext', undefined, 15);
      randGaussSpreadInp.preferredSize.width = CFG.isMac ? 77 : 72;

  randGaussSpreadGrp.add('statictext', undefined, '%');

  var isGroupContent = win.add('checkbox', undefined, 'Apply to Objects Inside Groups');

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');

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

  // FOOTER
  var footer = win.add('group');
      footer.orientation = 'row';
      footer.alignChildren = ['fill', 'center'];

  var copyright = footer.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // PRE-LOAD
  loadSettings(SETTINGS);

  // EVENTS
  // Initialize UI state based on mode
  if (isFixMode.value) switchMode('fixed');
  else if (isRandMode.value) switchMode('random');

  // Change modes
  isFixMode.onClick  = function () { switchMode('fixed'); }
  isRandMode.onClick = function () { switchMode('random'); }

  isRandRange.onClick = function () {
    randRangeBtn.enabled = isPreview.value;
    randIncBtn.enabled = false;
    randGaussBtn.enabled = false;
    isRandInc.value = false;
    isRandGauss.value = false;
    randRangeInpGrp.enabled = true;
    randRangeStepGrp.enabled = true;
    randIncInpGrp.enabled = false;
    randGaussCenterGrp.enabled = false;
    randGaussSpreadGrp.enabled = false;
    preview();
  }

  isRandInc.onClick = function () {
    randRangeBtn.enabled = false;
    randIncBtn.enabled = isPreview.value;
    randGaussBtn.enabled = false;
    isRandRange.value = false;
    isRandGauss.value = false;
    randRangeInpGrp.enabled = false;
    randRangeStepGrp.enabled = false;
    randIncInpGrp.enabled = true;
    randGaussCenterGrp.enabled = false;
    randGaussSpreadGrp.enabled = false;
    preview();
  }

  isRandGauss.onClick = function () {
    randRangeBtn.enabled = false;
    randIncBtn.enabled = false;
    randGaussBtn.enabled = isPreview.value;
    isRandRange.value = false;
    isRandInc.value = false;
    randRangeInpGrp.enabled = false;
    randRangeStepGrp.enabled = false;
    randIncInpGrp.enabled = false;
    randGaussCenterGrp.enabled = true;
    randGaussSpreadGrp.enabled = true;
    preview();
  }

  // Change inputs
  bindStepperKeys(fixedInp);
  bindStepperKeys(randIncInp);
  bindStepperKeys(randGaussCenterInp);
  bindStepperKeys(randGaussSpreadInp);

  fixedInp.onChange = function () {
    var prefix = '';
    if (/^[\+\*\/]/i.test(this.text.charAt(0))) {
      prefix = this.text.charAt(0);
    }
    this.text = prefix + strToNum(this.text, 100);
    preview();
  }

  randRangeInp.onChange = randStepInp.onChange = preview;

  // Convert to absolute number
  randIncInp.onChange = randGaussCenterInp.onChange = randGaussSpreadInp.onChange = function () {
    this.text = Math.abs( strToNum(this.text) );
    preview();
  }

  randRangeBtn.onClick = randIncBtn.onClick = randGaussBtn.onClick = function () {
    this.active = true;
    this.active = false;
    preview();
  }

  isGroupContent.onClick = preview;

  isPreview.onClick = function () {
    randRangeBtn.enabled = isRandRange.value && this.value;
    randIncBtn.enabled = isRandInc.value && this.value;
    randGaussBtn.enabled = isRandGauss.value && this.value;
    preview();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = win.close;
  ok.onClick = okClick;

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) {
          doc.swatches.add().remove();
          app.undo();
        }
        process();
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
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);
    if (isPreview.value && isUndo) {
      isUndo = false;
    } else {
      process();
    }
    win.close();
  }

  /**
   * Process target items based on selected opacity mode (fixed/random)
   */
  function process() {
    var tempItems = [].concat(isGroupContent.value ? getItems(docSel) : docSel);

    if (isFixMode.value) {
      // Fixed mode
      if (isEmpty(fixedInp.text)) fixedInp.text = 100;
      applyFixed(tempItems, fixedInp.text);
    } else if (isRandMode.value) {
      // Random mode
      if (isRandRange.value) {
        // Random in range
        if (isEmpty(randRangeInp.text)) randRangeInp.text = '20-100';
        if (isEmpty(randStepInp.text)) randStepInp.text = 1;
        applyRandomRange(tempItems, randRangeInp.text, randStepInp.text);

      } else if (isRandInc.value) {
        // Random increment
        if (isEmpty(randIncInp.text)) randIncInp.text = 15;
        applyRandomInc(tempItems, randIncInp.text);

      } else if (isRandGauss.value) {
        // Gaussian distribution
        if (isEmpty(randGaussCenterInp.text)) randGaussCenterInp.text = 50;
        if (isEmpty(randGaussSpreadInp.text)) randGaussSpreadInp.text = 20;
        applyRandomGaussian(tempItems, randGaussCenterInp.text, randGaussSpreadInp.text);
      }
    }
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {Object} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text.replace(/^[\+\*\/]/, ''));

      if (isNaN(num)) return;

      var prefix = '';
      if (/^[\+\*\/]/i.test(this.text.charAt(0))) {
        prefix = this.text.charAt(0);
      }
      var newValue;

      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        newValue = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        this.text = (newValue >= 0 ? prefix : '') + newValue;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        newValue = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        this.text = (newValue >= 0 ? prefix : '') + newValue;
        kd.preventDefault();
        preview();
      }
    });
  }

  /**
   * Toggle UI mode between modes states
   * @param {string} mode - Mode to switch
   */
  function switchMode(mode) {
    var min = [0, 0], max = [1000, 1000];
    var isFix = (mode === 'fixed');

    // Change panels size
    fixedWrapper.maximumSize = isFix ? max : min;
    fixedPnl.maximumSize = isFix ? max : min;
    fixedInfoPnl.maximumSize = isFix ? max : min;
    randPnl.maximumSize = isFix ? min : max;

    // Toggle visibility for panels
    fixedWrapper.visible = isFix;
    randPnl.visible = !isFix;

    // Refresh layout and preview
    win.layout.layout(true);

    preview();
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
    data.isFixed = isFixMode.value;
    data.fixed = fixedInp.text;
    data.isRange = isRandRange.value;
    data.range = randRangeInp.text;
    data.step = randStepInp.text;
    data.isIncrement = isRandInc.value;
    data.increment = randIncInp.text;
    data.isGauss = isRandGauss.value;
    data.center = randGaussCenterInp.text;
    data.spread = randGaussSpreadInp.text;
    data.isDeep = isGroupContent.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);

    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        try { var data = new Function('return (' + json + ')')(); }
        catch (err) {}
        f.close();
  
        if (typeof data != 'undefined') {
          win.location = [
            data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
            data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
          ];
          isFixMode.value = data.isFixed === 'true';
          isRandMode.value = !isFixMode.value;
          fixedInp.text = data.fixed || 100;
          isRandRange.value = data.isRange === 'true';
          randRangeInp.text = data.range || '20-100';
          randStepInp.text = data.step || 1;
          isRandInc.value = data.isIncrement === 'true';
          randIncInp.text = data.increment || 15;
          isRandGauss.value = data.isGauss === 'true';
          randGaussCenterInp.text = data.center || 50;
          randGaussSpreadInp.text = data.spread || 15;
          isGroupContent.value = data.isDeep === 'true';
        }
      } catch (err) {}
    }

    randRangeInpGrp.enabled = isRandRange.value;
    randRangeStepGrp.enabled = isRandRange.value;
    randIncInpGrp.enabled = isRandInc.value;
    randGaussCenterGrp.enabled = isRandGauss.value;
    randGaussSpreadGrp.enabled = isRandGauss.value;
    randRangeBtn.enabled = isPreview.value;
    randIncBtn.enabled = isPreview.value;
    randGaussBtn.enabled = isPreview.value;
    if (docSel.length === 1) fixedInp.text = docSel[0].opacity;

    // Activate input field
    if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
      if (isFixMode.value) {
        fixedInp.active = true;
      } else if (isRandMode.value) {
        if (isRandRange.value) randRangeInp.active = true;
        else if (isRandInc.value) randIncInp.active = true;
        else if (isRandGauss.value) randGaussCenterInp.active = true;
      }
    }
  }

  win.show();
}

/**
 * Get individual items from a collection
 * @param {object} coll - Collection of items
 * @returns {array} results - Output array of individual items
 */
function getItems(coll) {
  var results = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      results = [].concat(results, getItems(item.pageItems));
    } else if (!isClippingMask(item)) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Check if an item is a clipping mask
 * @param {PageItem} item - The Illustrator item to check
 * @returns {boolean} True if the item is a clipping object, false otherwise
 */
function isClippingMask(item) {
  // Check if the item is a text frame with no fill or stroke
  var isUncoloredText = (
    /text/i.test(item.typename) &&
    item.textRange.characterAttributes.fillColor == '[NoColor]' &&
    item.textRange.characterAttributes.strokeColor == '[NoColor]'
  );

  return (
    (/compound/i.test(item.typename) && item.pathItems.length && item.pathItems[0].clipping) ||
    item.clipping || isUncoloredText
  );
}

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} The converted number
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
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length === 0;
}

/**
 * Apply a fixed operation to the opacity of each item
 * @param {Array} items - The array of items whose opacity needs to be modified
 * @param {string} str - The input string containing the operation and value
 */
function applyFixed(items, str) {
  str = str.replace(/\s/g, '');
  var op = str.charAt(0);
  var value = strToNum(str, 100);
  var hasOperation = /\-|\+|\*|\//i.test(op);

  for (var i = 0, len = items.length; i < len; i++) {
    var item = items[i];
    var newOpacity = hasOperation ? applyOperation(op, item.opacity, value) : value;
    item.opacity = clamp(newOpacity, 0, 100);
  }
}

/**
 * Apply a mathematical operation to the base value
 * @param {string} op - The operation to apply
 * @param {number} base - The current value
 * @param {number} value - The value to apply with the operation
 * @return {number} The new value after applying the operation
 */
function applyOperation(op, base, value) {
  value = Math.abs(value);
  switch (op) {
    case '+': return base + value;
    case '-': return base - value;
    case '*': return base * value;
    case '/': return value !== 0 ? base / value : 1;
    default: return base;
  }
}

/**
 * Clamp value to the range
 * @param {number} value - Value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply a random opacity value within a specified range to each item
 * @param {Array} items - The array of items whose opacity needs to be modified
 * @param {string} minMaxStr - The input string containing a range of opacity values, e.g., "20-80"
 * @param {string} stepStr - The input string containing a step of opacity values
 */
function applyRandomRange(items, minMaxStr, stepStr) {
  var min = 0;
  var max = 100;

  if (minMaxStr.indexOf('-') !== -1) {
    var rangeArr = minMaxStr.split('-');
    var parsedMin = Math.abs( strToNum(rangeArr[0], 100) );
    var parsedMax = Math.abs( strToNum(rangeArr[1], 100) );
    min = Math.min(parsedMin, parsedMax);
    max = Math.max(parsedMin, parsedMax);
  }

  min = clamp(min, 0, 100);
  max = clamp(max, 0, 100);

  var step = Math.abs( strToNum(stepStr, 1) );
  var range = Math.floor((max - min) / step) + 1;

  for (var i = 0, len = items.length; i < len; i++) {
    var newOpacity = min + (Math.floor(Math.random() * range) * step);
    items[i].opacity = clamp(newOpacity, 0, 100);
  }
}

/**
 * Apply a random increment or decrement to the opacity of each item
 * @param {Array} items - The array of items whose opacity needs to be modified
 * @param {string} str - The input string containing a value for random increment
 */
function applyRandomInc(items, str) {
  var value = Math.abs( strToNum(str, 15) );

  for (var i = 0, len = items.length; i < len; i++) {
    var item = items[i];
    var multiplier = Math.random() < 0.5 ? 1 : -1;
    var newOpacity = item.opacity + multiplier * value;
    item.opacity = clamp(newOpacity, 0, 100);
  }
}

/**
 * Apply a random Gaussian opacity of each item
 * @param {Array} items - The array of items whose opacity needs to be modified
 * @param {string} strCenter - The string containing a center value for the Gaussian distribution
 * @param {string} strSpread - The string containing a spread value for the Gaussian distribution
 */
function applyRandomGaussian(items, strCenter, strSpread) {
  var center = Math.abs( strToNum(strCenter, 50) );
  var spread = Math.abs( strToNum(strSpread, 20) );

  for (var i = 0, len = items.length; i < len; i++) {
    var item = items[i];
    var newOpacity;
    do {
      newOpacity = gaussianRandom() * spread + center;
    } while (newOpacity < 1); // Avoid opacity close to 0
    item.opacity = clamp(newOpacity, 0, 100);
  }
}

/**
 * Generate a random number using the Box-Muller Transform for a Gaussian distribution
 * @returns {number} A random number from a Gaussian distribution
 */
function gaussianRandom() {
  var u1 = 1 - Math.random(); // Avoid log(0)
  var u2 = Math.random();
  var z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0;
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
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0;URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

try {
  main();
} catch (err) {}