/*
  StrokesWeightDown.jsx for Adobe Illustrator
  Description: Reduces the weight of the strokes of the selected paths relative to the current weight
  Date: October, 2022
  Modification date: November, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  ******************************************************************************
  * TIP: Hold Alt key when launching to show UI, otherwise runs in silent mode *
  ******************************************************************************

  Release notes:
  0.4 Added to UI math operations for strokes, random weights, min limit. Minor improvements
  0.3 Added dialog for scaling by percentage or delta. Added support for editable text objects
  0.2.2 Added size correction in large canvas mode
  0.2.1 Minor improvements
  0.2 Gets the app preferences of the stroke units
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
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

function main() {
  var CFG = {
        units : getStrokeUnits(),
        isRound: true, // Round stroke width
        isAddStroke: false, // Add stroke if not exists
        defWidth: 0.1, // Default value for added stroke
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os)
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  if (!app.selection.length || app.selection.typename === 'TextRange') {
    alert('Few objects are selected\nPlease select one or more objects and try again', 'Script error');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = app.activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var sel = app.selection;
  var items = getItems(app.selection);
  
  if (CFG.isAddStroke && CFG.isMac) app.selection = null;

  if (ScriptUI.environment.keyboardState.altKey) {
    invokeUI(items, CFG);
  } else {
    for (var i = 0, len = items.length; i < len; i++) {
      applyStrokeWidth(items[i], CFG, 'default', null, 0, null);
    }
  }

  if (CFG.isAddStroke && CFG.isMac) app.selection = sel;
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
 * Get items from an Adobe Illustrator collection, including nested pageItems
 * Filter items based on type, excluding non-relevant items
 * @param {Object} coll - The Adobe Illustrator collection to retrieve items from
 * @returns {Array} results - Return a JavaScript Array containing relevant items from the given collection
 */
function getItems(coll) {
  var results = [];
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (isType(item, 'group') && item.pageItems.length) {
      results = [].concat(results, getItems(item.pageItems));
    } else if (isType(item, '^compound') && item.pathItems.length) {
      results.push(item.pathItems[0]);
    } else if (isType(item, 'path|text')) {
      results.push(item);
    }
  }
  return results;
}

/**
 * Check the item typename by short name
 * @param {Object} item - Item to be checked
 * @param {string} type - The shortened type to check against. Case-insensitive
 * @returns {boolean} Returns true if the item's typename matches the specified type
 */
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

/**
 * Update a stroke width to an item based on the specified mode and preferences
 * @param {Object} item - The item to modify
 * @param {Object} prefs - User preferences object
 * @param {string} mode - Mode for stroke width calculation
 * @param {Object} values - Values for stroke width calculation
 * @param {number} limit - Minimum allowed stroke width
 * @param {number} idx - Index for random value cache
 */
function applyStrokeWidth(item, prefs, mode, values, limit, idx) {
  // Skip if no stroke and not allowed to add
  if (!isHasStroke(item) && !prefs.isAddStroke) return;

  var color = {};
  if (app.activeDocument.documentColorSpace === DocumentColorSpace.RGB) {
    color = new RGBColor();
    color.red = 0;
    color.green = 0;
    color.blue = 0;
  } else {
    color = new CMYKColor();
    color.black = 100;
  }

  // Add default stroke if none exists and allowed
  if (!isHasStroke(item) && prefs.isAddStroke) {
    setStrokeWidth(item, convertUnits(prefs.defWidth, prefs.units, 'pt') / prefs.sf, color);
  }

  // Get current stroke width and convert to script units
  var curWidth = getStrokeWidth(item);
  curWidth = convertUnits(curWidth, 'pt', prefs.units) * prefs.sf;
  var newWidth = 0;

  // Calculate new width based on mode
  switch (mode) {
    case 'relative':
      newWidth = curWidth * (values.relative / 100);
      break;
    case 'absolute':
      newWidth = calcAdjustedValue(curWidth, values.absolute);
      break;
    case 'random':
      if (values.cache[idx] === undefined) {
        values.cache[idx] = getRandomInRange(values.min, values.max, values.step);
      }
      newWidth = values.cache[idx];
      break;
    case 'default':
    default:
      newWidth = calcDefaultValue(curWidth, prefs.isRound);
      break;
  }

  // Convert script units to app units
  newWidth = Math.max(newWidth, limit);
  newWidth = convertUnits(newWidth, prefs.units, 'pt' ) / prefs.sf;
  setStrokeWidth(item, newWidth, color);
}

/**
 * Check if an item has a stroke
 * @param {Object} item - The item to check for a stroke
 * @returns {boolean} True if the item has a stroke, false otherwise
 */
function isHasStroke(item) {
  if (isType(item, 'text')) {
    var attr = item.textRange.characterAttributes;
    return !/nocolor/i.test(attr.strokeColor) && attr.strokeWeight > 0;
  }
  return item.stroked && item.strokeWidth > 0;
}

/**
 * Set the stroke width and color of an item
 * @param {Object} item - The item whose stroke width is to be set
 * @param {number} value - The value (pt) to set the stroke width to
 * @param {Object} color - The stroke color to apply if the item was not previously stroked
 */
function setStrokeWidth(item, value, color) {
  if (arguments.length < 2 || value == undefined || isNaN(value)) return;

  if (isType(item, 'text')) {
    var attr = item.textRange.characterAttributes;
    var isStroked = attr.strokeWeight && !/nocolor/i.test(attr.strokeColor);
    attr.strokeWeight = value;
    if (!isStroked && color) attr.strokeColor = color;
  } else {
    var isStroked = item.stroked && item.strokeWidth > 0;
    if (value > 0) {
      item.stroked = true;
      item.strokeWidth = value;
      if (!isStroked && color) item.strokeColor = color;
    } else {
      item.stroked = false;
    }
  }
}

/**
 * Get the stroke width of an item
 * @param {object} item - The item whose stroke width is to be retrieved
 * @returns {number} The stroke width of the item, or 0 if the item has no stroke
 */
function getStrokeWidth(item) {
  if (!isHasStroke(item)) {
    return 0;
  } else if (isType(item, 'text')) {
    return item.textRange.characterAttributes.strokeWeight;
  } else {
    return item.strokeWidth;
  }
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
 * Round a number to a specified number of decimal places
 * @param {number} num - The number to be rounded
 * @param {number} decimals - The number of decimal places to round to
 * @returns {number} The rounded number
 */
function roundNum(num, decimals) {
  var pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
}

/**
 * Display a UI dialog for adjusting stroke width
 * @param {Array} items - The paths and texts to be processed
 * @param {Object} prefs - Default settings
 */
function invokeUI(items, prefs) {
  var json = {
        name: 'Strokes_Weight_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };
  var rndValCache = [];
  var isUndo = false;
  var INIT_WIDTH = getInitStrokeData(items, prefs.units, prefs.sf);
  var MIN = 0;
  var MAX = 1000;

  // DIALOG
  var win = new Window('dialog', 'Strokes Weight v0.4');
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = 0.97;

  // TABS
  var tabPnl = win.add('tabbedpanel');
      tabPnl.alignChildren = ['left', 'top'];
      tabPnl.preferredSize.width = 200;
      tabPnl.margins = [10, 5, 5, 10];

  // RELATIVE SECTION
  var relativeTab = tabPnl.add('tab', undefined, 'RELATIVE');
      relativeTab.alignChildren = ['left', 'top'];
      relativeTab.margins = [10, 15, 10, 5];

  var relativeWrapper = relativeTab.add('group');
      relativeWrapper.orientation = 'column';
      relativeWrapper.alignChildren = ['fill', 'top']

  var sliderGrp = relativeWrapper.add('group');
      sliderGrp.orientation = 'row';
      sliderGrp.alignChildren = ['left', 'center'];

  var relativeSlider = sliderGrp.add('slider', undefined, 100, 0, 1000);
      relativeSlider.preferredSize.width = 160;

  var relativeInp = sliderGrp.add('edittext', undefined, 100);
      relativeInp.preferredSize.width = 50;
      relativeInp.justify = 'right';

  sliderGrp.add('statictext', undefined, '%');

  // ABSOLUTE SECTION
  var absoluteTab = tabPnl.add('tab', undefined, 'ABSOLUTE');
      absoluteTab.alignChildren = ['left', 'top'];
      absoluteTab.margins = [10, 15, 10, 5];

  var absoluteWrapper = absoluteTab.add('group');
      absoluteWrapper.orientation = 'column';
      absoluteWrapper.spacing = 15;
      absoluteWrapper.alignChildren = ['fill', 'top']

  var absoluteInp = absoluteWrapper.add('edittext', undefined, '');
      absoluteInp.preferredSize.width = 230;

  var absoluteBtns = absoluteWrapper.add('group');
      absoluteBtns.orientation = 'row';
      absoluteBtns.alignChildren = ['fill', 'center'];
      absoluteBtns.spacing = 10;

  var absoluteMinBtn = absoluteBtns.add('button', undefined, 'Min');
      absoluteMinBtn.preferredSize.width = 50;
  var absoluteMaxBtn = absoluteBtns.add('button', undefined, 'Max');
      absoluteMaxBtn.preferredSize.width = 50;
  var averageBtn = absoluteBtns.add('button', undefined, 'Average');

  // FIXED MODE INFO
  var absoluteInfoPnl = absoluteWrapper.add('panel', undefined, '\u24D8 Syntax');
      absoluteInfoPnl.alignChildren = ['left', 'top'];
      absoluteInfoPnl.margins = [10, 15, 10, 5];

  var absoluteHelp = '1.25 - set exactly to 1.25 ' + prefs.units +
                  '\n+0.5 - increase by 0.5 ' + prefs.units +
                  '\n-3 - decrease by 3 ' + prefs.units +
                  '\n*2 - multiply current value by 2' +
                  '\n/5 - divide current value by 5';
  absoluteInfoPnl.add('statictext', undefined, absoluteHelp, { multiline: true });

  // RANDOMIZE SECTION
  var randomTab = tabPnl.add('tab', undefined, 'RANDOM');
      randomTab.alignChildren = ['left', 'top'];
      randomTab.margins = [10, 15, 10, 5];

  var randomWrapper = randomTab.add('group');
      randomWrapper.orientation = 'column';
      randomWrapper.spacing = 15;
      randomWrapper.alignChildren = ['fill', 'top']

  var minGrp = randomWrapper.add('group');
      minGrp.orientation = 'row';
      minGrp.alignChildren = ['right', 'center'];
      minGrp.spacing = 10;

  minGrp.add('statictext', undefined, 'Min:');
  var minRandInp = minGrp.add('edittext', undefined, 0.5);
      minRandInp.preferredSize.width = prefs.aiVers > 29 ? 160 : 170;
  minGrp.add('statictext', undefined, prefs.units);

  var maxGrp = randomWrapper.add('group');
      maxGrp.orientation = 'row';
      maxGrp.alignChildren = ['right', 'center'];
      maxGrp.spacing = 10;

  maxGrp.add('statictext', undefined, 'Max:');
  var maxRandInp = maxGrp.add("edittext", undefined, 5);
      maxRandInp.preferredSize.width = prefs.aiVers > 29 ? 160 : 170;
  maxGrp.add('statictext', undefined, prefs.units);

  var stepGrp = randomWrapper.add('group');
      stepGrp.orientation = 'row';
      stepGrp.alignChildren = ['right', 'center'];
      stepGrp.spacing = 10;

  stepGrp.add('statictext', undefined, 'Step:');
  var stepRandInp = stepGrp.add('edittext', undefined, '0.5');
      stepRandInp.preferredSize.width = prefs.aiVers > 29 ? 160 : 170;
  stepGrp.add('statictext', undefined, prefs.units);

  var randBtns = randomWrapper.add('group');
      randBtns.orientation = 'row';
      randBtns.alignChildren = ['fill', 'center'];
      randBtns.spacing = 10;

  var randMinMaxBtn = randBtns.add('button', undefined, 'Get from Selection');
  var randBtn = randBtns.add('button', undefined, 'Randomize');

  var isAddStroke = win.add('checkbox', undefined, "Add stroke if doesn't exist");

  // LIMIT STROKE
  var limitGrp = win.add('group');
      limitGrp.orientation = 'row';
      limitGrp.alignChildren = ['left', 'center']

  var isLimit = limitGrp.add('checkbox', undefined, "Don't reduce below");

  var limitInp = limitGrp.add('edittext', undefined, 0.25);
      limitInp.preferredSize.width = 60;
      limitInp.enabled = isLimit.value;

  limitGrp.add('statictext', undefined, prefs.units);

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview',  { name: 'preview' });
      // isPreview.alignment = 'left';

  var cancelBtn = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var okBtn = btns.add('button', undefined, 'OK',  { name: 'ok' });

  var copyGrp = win.add('group');
      copyGrp.orientation = 'row';
      copyGrp.alignChildren = ['fill', 'center'];

  var author = copyGrp.add('statictext', undefined, '\u00A9 Sergey Osokin');
      author.justify = 'left';

  var link = copyGrp.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // EVENT HANDLERS
  loadSettings(json);

  // CC 2020 v24.3 has the problem
  if (hasTextFrame(items) && prefs.aiVers === 24) {
    isPreview.enabled = false;
    isPreview.active = false
    isPreview.helpTip = 'Preview disabled for CC 2020\ndue to critical bug'
  }

  if (/relative/i.test(tabPnl.selection.text)) relativeInp.active = true;
  else if (/absolute/i.test(tabPnl.selection.text)) absoluteInp.active = true;
  else if (/random/i.test(tabPnl.selection.text)) minRandInp.active = true;

  // Change modes
  tabPnl.onChange = function () {
    switchMode(this.selection.text.toLowerCase());
    preview();
  }

  // Sync slider and input
  relativeSlider.onChanging = function () {
    relativeInp.text = Math.round(relativeSlider.value);
    preview();
  };

  relativeSlider.onChange = preview;

  relativeInp.onChange = function () {
    var value = Math.abs(strToNum(this.text, 100));
    value = Math.max(MIN, Math.min(MAX, value))
    relativeSlider.value = value;
    this.text = value;
    preview();
  };

  absoluteInp.onChange = preview;

  absoluteMinBtn.onClick = function () {
    absoluteInp.text = roundNum(INIT_WIDTH.min, 3);
    preview();
    // Reset button color after click
    this.active = true;
    this.active = false;
  }

  absoluteMaxBtn.onClick = function () {
    absoluteInp.text = roundNum(INIT_WIDTH.max, 3);
    preview();
    // Reset button color after click
    this.active = true;
    this.active = false;
  }

  averageBtn.onClick = function () {
    var oldValue = absoluteInp.text;

    var avgWin = new Window('dialog', 'Averaged Values');
        avgWin.preferredSize.width = 150;
        avgWin.alignChildren = ['fill', 'top'];
    var avgList = avgWin.add('listbox', undefined, [], {
        numberOfColumns: 2,
        showHeaders: true,
        columnTitles: ['Type', 'Width'],
        multiselect: false
    });

    var averageData = [
      { name: 'Area-weighted', value: INIT_WIDTH.area },
      { name: 'Arithmetic Mean', value: INIT_WIDTH.mean },
      { name: 'Root Mean Square', value: INIT_WIDTH.rms },
      { name: 'Weighted Median', value: INIT_WIDTH.median }
    ];

    for (var i = 0; i < averageData.length; i++) {
      var item = avgList.add('item', averageData[i].name);
      item.subItems[0].text = averageData[i].value + ' ' + prefs.units;
    }

    var avgBtns = avgWin.add('group');
        avgBtns.orientation = 'row';
        avgBtns.alignChildren = ['fill', 'center'];
    var avgCancel = avgBtns.add ('button', undefined, 'Cancel', { name: 'cancel' });
    var avgOk = avgBtns.add ('button', undefined, 'OK', { name: 'ok' });

    avgList.onChange = function() {
      absoluteInp.text = 1 * avgList.selection.subItems[0].text;
      preview();
    }

    avgCancel.onClick = function () {
      absoluteInp.text = oldValue;
      preview();
      avgWin.close();
    }

    avgOk.onClick = function () {
      absoluteInp.text = 1 * avgList.selection.subItems[0].text;
      preview();
      avgWin.close();
    }

    avgWin.center();
    avgWin.show();
  }

  // Random
  minRandInp.onChange = maxRandInp.onChange = stepRandInp.onChange = function () {
    rndValCache = []; // Reset previous random values
    preview();
  }

  randMinMaxBtn.onClick = function () {
    rndValCache = []; // Reset previous random values
    minRandInp.text = roundNum(INIT_WIDTH.min, 4);
    maxRandInp.text = roundNum(INIT_WIDTH.max, 4);
    stepRandInp.text = roundNum(INIT_WIDTH.step, 4);
    preview();
    // Reset button color after click
    this.active = true;
    this.active = false;
  }

  randBtn.onClick = function () {
    rndValCache = []; // Reset previous random values
    preview();
    // Reset button color after click
    this.active = true;
    this.active = false;
  }

  isAddStroke.onClick = preview;

  isLimit.onClick = function () {
    limitInp.enabled = this.value;
    preview();
  }

  limitInp.onChange = preview;

  bindStepperKeys(relativeInp, MIN, MAX);
  bindStepperKeys(limitInp, MIN, MAX);

  if (isPreview.value) preview();
  isPreview.onClick = preview;

  setTextHandler(link, function () {
    openURL('https://github.com/creold')
  });

  cancelBtn.onClick = win.close;

  /**
   * Handle the click event for the OK button
   */
  okBtn.onClick = function() {
    saveSettings(json);
    if (isPreview.value && isUndo) {
      app.undo();
    }
    isUndo = false;
    process(false);
    win.close();
  }

  win.onShow = function () {
    switchMode(tabPnl.selection.text.toLowerCase());
  }

  win.onClose = function () {
    tabPnl.onChange = null;
    rndValCache = null;
    try {
      if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
    try {
      var tmpPath = app.activeDocument.pageItems.getByName('__TempPath');
      tmpPath.remove();
    } catch (err) {}
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        process(isPreview.value);
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Process stroke widths for selected items in Adobe Illustrator
   */
  function process(isPreview) {
    if (isPreview) {
      var tmpPath = items[0].layer.pathItems.add();
      tmpPath.name = '__TempPath';
      tmpPath.hidden = true;
      tmpPath.hidden = false;
    }

    prefs.isAddStroke = isAddStroke.value;
    var mode = tabPnl.selection.text.toLowerCase();
    var limit = isLimit.value ? strToNum(limitInp.text, MIN) : 0;
    if (!rndValCache.length) rndValCache.length = items.length;

    var values = {};
    values.relative = Math.abs( strToNum(relativeInp.text, 1) );
    values.relative = Math.max(MIN, Math.min(MAX, values.relative));
    values.absolute = absoluteInp.text;
    values.min = Math.abs( strToNum(minRandInp.text, MIN) );
    values.max = Math.abs( strToNum(maxRandInp.text, MAX) );
    values.step = Math.abs( strToNum(stepRandInp.text, MIN) );
    values.cache = rndValCache;

    for (var i = 0, len = items.length; i < len; i++) {
      applyStrokeWidth(items[i], prefs, mode, values, limit, i);
    }
  }

  /**
   * Toggle UI mode between modes states
   * @param {string} mode - Mode to switch
   */
  function switchMode(mode) {
    var min = [0, 0], max = [1000, 1000];
    var panels = {
      'relative': relativeWrapper,
      'absolute': absoluteWrapper,
      'random': randomWrapper
    };
    var activePanel = panels[mode];
    if (!activePanel) panels['relative'];

    for (var key in panels) {
      if (panels.hasOwnProperty(key)) {
        var panel = panels[key];
        var isActive = (key === mode);
        // Change panels size
        panel.maximumSize = isActive ? max : min;
        // Toggle visibility for panels
        panel.visible = isActive;
      }
    }

    // Refresh layout and preview
    win.layout.layout(true);
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
   * Handle keyboard input to shift numerical values
   * @param {Object} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text) || 0;
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
        preview();
      }
      if (this === relativeInp) relativeSlider.value = 1 * this.text;
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
    var tabIdx = 0;
    if (/absolute/i.test(tabPnl.selection.text)) tabIdx = 1;
    if (/random/i.test(tabPnl.selection.text)) tabIdx = 2;
    data.mode = tabIdx;
    data.relative = relativeInp.text;
    data.absolute = absoluteInp.text;
    data.min = minRandInp.text;
    data.max = maxRandInp.text;
    data.step = stepRandInp.text;
    data.isAdd = isAddStroke.value;
    data.isLimit = isLimit.value;
    data.limit = limitInp.text;

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
        tabPnl.selection = parseInt(data.mode) || 0;
        relativeSlider.value = parseFloat(data.relative) || 100;
        relativeInp.text = relativeSlider.value;
        absoluteInp.text = data.absolute;
        minRandInp.text = data.min;
        maxRandInp.text = data.max;
        stepRandInp.text = data.step;
        isAddStroke.value = data.isAdd === 'true';
        isLimit.value = data.isLimit === 'true';
        limitInp.enabled = isLimit.value;
        limitInp.text = data.limit;
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Check if any item in the collection or its sub-collections is a TextFrame
 * @param {Array} coll - The collection of items to check
 * @returns {boolean} Returns true if a TextFrame is found, otherwise false
 */
function hasTextFrame(coll) {
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (item.typename === 'TextFrame') {
      return true;
    } else if (item.pageItems && item.pageItems.length) {
      if (hasTextFrame(item.pageItems)) return true;
    }
  }
  return false;
}

/**
 * Convert a string to a number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} Returns the numeric value of the string or the default value if the conversion fails
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
 * Collect stroke widths and compute statistical data
 * @param {Array} items - Array of Illustrator items (e.g., paths, texts)
 * @param {string} units - Target unit for conversion (e.g., 'mm', 'cm', 'in')
 * @param {number} scaleFactor - Factor to scale the converted values
 * @returns {Object}
 */
function getInitStrokeData(items, units, scaleFactor) {
  var data = { min: 0, max: 0, step: 0, area: 0, mean: 0, median: 0, rms: 0 };
  var values = [];
  var i, len;

  // Collect valid width/length pairs
  for (i = 0, len = items.length; i < len; i++) {
    var w = getStrokeWidth(items[i]);
    if (!isNaN(w)) {
      values.push({
        width: w,
        length: items[i].length || null
      });
    }
  }
  if (!values.length) return data;

  // Filter positive widths
  var nonZero = [];
  var widthArr = [];

  for (i = 0, len = values.length; i < len; i++) {
    var v = values[i];
    if (v.width <= 0) continue;
    nonZero.push(v);
    widthArr.push(v.width);
  }
  if (!nonZero.length) return data;

  // Min/Max
  var minW = Math.min.apply(null, widthArr);
  var maxW = Math.max.apply(null, widthArr);

  data.min = convertUnits(minW, 'pt', units) / scaleFactor;
  data.max = convertUnits(maxW, 'pt', units) / scaleFactor;

  // Calculate step
  var delta = data.max - data.min;
  if (delta === 0) data.step = 0;
  else if (delta <= 0.1) data.step = 0.01;
  else if (delta <= 1) data.step = 0.1;
  else if (delta < 5) data.step = 0.5;
  else data.step = 1.0;

  data.area = convertUnits(getAreaWeighted(nonZero), 'pt', units) / scaleFactor;
  data.area = roundNum(data.area, 2);

  data.mean = convertUnits(getArithmeticMean(widthArr), 'pt', units) / scaleFactor;
  data.mean = roundNum(data.mean, 2);

  data.median = convertUnits(getWeightedMedian(nonZero), 'pt', units) / scaleFactor;
  data.median = roundNum(data.median, 2);

  data.rms = convertUnits(getRootMeanSquare(widthArr), 'pt', units) / scaleFactor;
  data.rms = roundNum(data.rms, 2);

  return data;
}

/**
 * Calculate the area-weighted average of an array of objects with width and length properties
 * @param {Array>} values - Array of objects with width and length
 * @returns {number} The area-weighted average
 */
function getAreaWeighted(values) {
  if (!values.length) return 0;

  var totalArea = 0;
  var total = 0;

  for (var i = 0, len = values.length; i < len; i++) {
    var v = values[i];
    if (v.length === null || v.width === 0) continue;

    var area = v.width * v.length;
    total += v.width * area;
    totalArea += area;
  }
  return totalArea > 0 ? total / totalArea : 0;
}

/**
 * Calculate the arithmetic mean of an array of numbers
 * @param {Array} values - Array of numbers
 * @returns {number} The arithmetic mean
 */
function getArithmeticMean(values) {
  if (!values.length) return 0;

  var total = 0;
  for (var i = 0, len = values.length; i < len; i++) {
    total += values[i];
  }
  return total / values.length;
}

/**
 * Calculate the weighted median of an array of objects with width and length properties
 * @param {Array} values - Array of objects with width and length
 * @returns {number} The weighted median
 */
function getWeightedMedian(values) {
  if (!values.length) return 0;

  var sorted = values.slice().sort(function(a, b) { return a.width - b.width; });

  sorted.sort(function (a, b) {
    return a.width - b.width;
  });

  var totalWeight = 0;
  var i, len;
  for (i = 0, len = sorted.length; i < len; i++) {
    if (sorted[i].length === null) continue;
    totalWeight += sorted[i].length;
  }

  var half = totalWeight / 2;
  var cum = 0;

  for (i = 0, len = sorted.length; i < len; i++) {
    if (sorted[i].length === null) continue;
    cum += sorted[i].length;
    if (cum >= half) return sorted[i].width;
  }

  return sorted[sorted.length - 1].width;
}

/**
 * Calculate the root mean square (RMS) of an array of numbers
 * @param {Array} values - Array of numbers
 * @returns {number} The RMS value
 */
function getRootMeanSquare(values) {
  if (!values.length) return 0;

  var total = 0;
  for (var i = 0; i < values.length; i++) {
    total += values[i] * values[i];
  }
  return Math.sqrt(total / values.length);
}

/**
 * Generate a random number within a specified range, incremented by a given step
 * @param {number} min - The minimum value of the range (inclusive)
 * @param {number} max - The maximum value of the range (inclusive)
 * @param {number} step - The increment step for the random value
 * @returns {number} A random number between `min` and `max`, aligned to the nearest `step`
 */
function getRandomInRange(min, max, step) {
  min = Math.min(min, max);
  max = Math.max(min, max);
  var range = Math.round((max - min) / step) + 1;
  var random = Math.floor(Math.random() * range);
  return min + random * step;
}

/**
 * Adjust a base value using a string operation (e.g., "+5", "-2", "*3")
 * @param {number} base - Base value to adjust
 * @param {string} str - String representing the operation and value (e.g., "+5")
 * @returns {number} The adjusted value
 */
function calcAdjustedValue(base, str) {
  str = str.replace(/\s/g, '');
  var op = str.charAt(0);
  var newValue = strToNum(str, 100);
  var hasOperation = /[-+*\/]/i.test(op);

  if (hasOperation) {
    newValue = Math.abs(newValue);
    switch (op) {
      case '+': return base + newValue;
      case '-': return base - newValue;
      case '*': return base * newValue;
      case '/': return newValue !== 0 ? base / newValue : 1;
      default: return base;
    }
  } else {
    return newValue;
  }
}

/**
 * Calculate a default stroke width based on the base value and rounding preference
 * @param {number} base - Base stroke width
 * @param {boolean} isRound - Whether to round the result
 * @returns {number} The calculated default stroke width
 */
function calcDefaultValue(base, isRound) {
  if (base <= 0.01) {
    return 0;
  } else if (roundNum(base, 1) <= 0.1) {
    return (isRound ? roundNum(base, 2) : base) - 0.01;
  } else if (roundNum(base, 1) <= 1.5) {
    return (isRound ? roundNum(base, 1) : base) - (roundNum(base, 1) > 0.2 ? 0.2 : 0.1);
  } else if (base < 5) {
    return (isRound ? roundNum(base, 1) : base) - 0.5;
  } else {
    return (isRound ? roundNum(base, 0) : base) - 1.0;
  }
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

try {
  main();
} catch (err) {}