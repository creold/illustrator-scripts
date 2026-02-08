/*
  StrokeColorFromFill.jsx for Adobe Illustrator
  Description: Sets a stroke color of an object based on an its solid or gradient fill.
  Date: August, 2020
  Modification date: February, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.5 Added overprint, cap, and corner options, save/load settings
  0.4.1 Shifting lightness to white keeps spot swatches
  0.4 Changed color shift method. Spot conversion always.
      Fixed bug with strokes on Mac OS. Added weight input for new strokes.
      Minor improvements
  0.3.3 Fixed input activation in Windows OS
  0.3.2 Added conversion of spot tint to color
  0.3.1 Minor improvements
  0.3 Added color interpolation to get the Stroke color from the gradient
  0.2 Added changing the color shift value with the Up/Down keys
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
  var SCRIPT = {
        name: 'Stroke Color From Fill',
        version: 'v0.5'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        strokeUnits: getUnits('strokeUnits'),
        preview: false,
        addStroke: false,
        max: 100, // Color shift range -100...100
        weight: 1, // Default new strokes weight
        maxStroke: 1000, // Maximum system value, pt
        minStroke: 0.01, // Minimum system value, pt
        shift: -30, // Default color shift value
        uiOpacity: .98, // UI window opacity. Range 0-1
        uiMargins: [10, 15, 10, 8]
      };

  var SETTINGS = {
    name:   SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('selection')) return;

  var doc = app.activeDocument,
      docSel = get(app.selection),
      selPaths = getPaths(docSel),
      hasStroke = hasStrokedPath(selPaths),
      isUndo = false; // For preview

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;
  CFG.isRgb = /rgb/i.test(doc.documentColorSpace);
  CFG.maxStroke = 1 * convertUnits(1000, 'pt', CFG.strokeUnits).toFixed(3);

  var cKeys = CFG.isRgb ? 
  ['red', 'green', 'blue'] : 
  ['cyan', 'magenta', 'yellow', 'black'];

  if (CFG.isMac) {
    app.selection = null;
    app.redraw();
  }

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];
      win.opacity = CFG.uiOpacity;

  // LIGHTNESS
  var shiftPnl = win.add('panel', undefined, 'Shift Ligthness');
      shiftPnl.orientation = 'row';
      shiftPnl.alignChildren = ['left', 'center'];
      shiftPnl.margins = CFG.uiMargins;

  shiftPnl.add('statictext', undefined, -CFG.max);

  var shiftSlider = shiftPnl.add('slider', undefined, CFG.shift, -CFG.max, CFG.max);
      shiftSlider.preferredSize.width = 100;

  shiftPnl.add('statictext', undefined, CFG.max);

  var shiftInp = shiftPnl.add('edittext', undefined, CFG.shift);
      shiftInp.characters = 4;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    shiftInp.active = true;
  }

  // OVERPRINT
  var overprintPnl = win.add('panel', undefined, 'Overprint Stroke');
      overprintPnl.orientation = 'row';
      overprintPnl.alignChildren = ['left', 'center'];
      overprintPnl.margins = CFG.uiMargins;

  var isOverprintOriginal = overprintPnl.add('radiobutton', undefined, 'Original');
      isOverprintOriginal.helpTip = 'Keep original attribute';
      isOverprintOriginal.value = true;
  var isOverprintON = overprintPnl.add('radiobutton', undefined, 'On');
      isOverprintON.helpTip = 'Enable overprint attribute';
  var isOverprintOFF = overprintPnl.add('radiobutton', undefined, 'Off');
      isOverprintOFF.helpTip = 'Disable overprint attribute';

  var styleWrapper = win.add('group');
      styleWrapper.alignChildren = ['fill', 'fill'];

  // STROKE CAP (LINE ENDS)
  var capPnl = styleWrapper.add('panel', undefined, 'Stroke Cap');
      capPnl.orientation = 'column';
      capPnl.alignChildren = ['left', 'center'];
      capPnl.margins = CFG.uiMargins;

  var isCapOriginal = capPnl.add('radiobutton', undefined, 'Original');
      isCapOriginal.helpTip = 'Keep original cap';
      isCapOriginal.value = true;
  var isCapButt = capPnl.add('radiobutton', undefined, 'Butt');
      isCapButt.helpTip = 'Butt cap';
  var isCapRound = capPnl.add('radiobutton', undefined, 'Round');
      isCapRound.helpTip = 'Round cap';
  var isCapProjecting = capPnl.add('radiobutton', undefined, 'Projecting');
      isCapProjecting.helpTip = 'Projecting cap';

  // STROKE CORNER (LINE JOINS)
  var cornerPnl = styleWrapper.add('panel', undefined, 'Stroke Corner');
      cornerPnl.orientation = 'column';
      cornerPnl.alignChildren = ['left', 'center'];
      cornerPnl.margins = CFG.uiMargins;

  var isCornerOriginal = cornerPnl.add('radiobutton', undefined, 'Original');
      isCornerOriginal.helpTip = 'Keep original corner';
      isCornerOriginal.value = true;
  var isCornerMiter = cornerPnl.add('radiobutton', undefined, 'Miter');
      isCornerMiter.helpTip = 'Miter join';
  var isCornerRound = cornerPnl.add('radiobutton', undefined, 'Round');
      isCornerRound.helpTip = 'Round join';
  var isCornerBevel = cornerPnl.add('radiobutton', undefined, 'Bevel');
      isCornerBevel.helpTip = 'Bevel join';

  // STROKE WIDTH
  var strokeGrp = win.add('group');
      strokeGrp.alignChildren = ['left', 'center'];

  var isAddStroke = strokeGrp.add('checkbox', undefined, "Add stroke if doesn't exist:");
      isAddStroke.value = CFG.addStroke;

  var weightInp = strokeGrp.add('edittext', undefined, CFG.weight);
      weightInp.characters = 4;

  strokeGrp.add('statictext', undefined, CFG.strokeUnits);

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = CFG.preview;

  var cancel, ok;
  if (/mac/i.test($.os)) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyGrp = win.add('group');
      copyGrp.orientation = 'row';
      copyGrp.alignChildren = ['fill', 'center'];

  var author = copyGrp.add('statictext', undefined, '\u00A9 Sergey Osokin');
      author.justify = 'left';

  var link = copyGrp.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // EVENTS
  loadSettings(SETTINGS);

  if (isPreview.value) preview();
  isPreview.onClick = isAddStroke.onClick = shiftSlider.onChange = preview;
  
  shiftSlider.onChanging = function () { 
    shiftInp.text = parseInt(this.value);
  }

  shiftInp.onChange = function () {
    var shiftVal = strToNum(this.text, 0);
    this.text = clamp(shiftVal, -CFG.max, CFG.max);
    shiftSlider.value = parseFloat(this.text);
    preview();
  }

  isOverprintOriginal.onClick = isOverprintON.onClick = isOverprintOFF.onClick = preview;

  isCapButt.onClick = isCapRound.onClick = isCapProjecting.onClick = preview;

  isCornerMiter.onClick = isCornerRound.onClick = isCornerBevel.onClick = preview;

  weightInp.onChange = function () {
    var weightVal = strToNum(this.text, CFG.weight);
    this.text = clamp(weightVal, CFG.minStroke, CFG.maxStroke);
    preview();
  }

  /**
   * Use Up / Down arrow keys (+ Shift) to change value
   */
  bindStepperKeys(shiftInp, -CFG.max, CFG.max);
  bindStepperKeys(weightInp, CFG.minStroke, CFG.maxStroke);

  setTextHandler(link, function () {
    openURL('https://github.com/creold')
  });

  ok.onClick = okClick;

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    if (isPreview.value && (hasStroke || isAddStroke.value)) {
      start();
      var activeLayer = doc.activeLayer,
          dummyLayer = doc.layers.add();
      doc.activeLayer = activeLayer;
      dummyLayer.remove();
      app.redraw();
      app.undo();
      isUndo = true;
    } else if (isUndo) {
      app.redraw();
      isUndo = false;
    }
  }

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);
    start();
    win.close();
  }

  /**
   * Process target items based on selected mode
   */
  function start() {
    var styles = getStrokeStyles();
    var shiftVal = strToNum(shiftInp.text, 0);
    var weightVal = convertUnits(strToNum(weightInp.text, CFG.weight), CFG.strokeUnits, 'pt') / CFG.sf;
    var item, color;

    for (var i = 0, len = selPaths.length; i < len; i++) {
      item = selPaths[i];

      if (isAddStroke.value && !item.stroked) {
        item.stroked = true;
        item.strokeWidth = weightVal;
      }

      if (!item.stroked) continue;

      try {
        color = calcColor(item.fillColor, shiftVal, cKeys, CFG.isRgb);
      } catch (err) {
        color = item.fillColor;
      }

      item.strokeColor = color;

      switch (styles.cap) {
        case 'butt':
          item.strokeCap = StrokeCap.BUTTENDCAP;
          break;
        case 'round':
          item.strokeCap = StrokeCap.ROUNDENDCAP;
          break;
        case 'projecting':
          item.strokeCap = StrokeCap.PROJECTINGENDCAP;
          break;
        default:
          break;
      }

      switch (styles.corner) {
        case 'miter':
          item.strokeJoin = StrokeJoin.MITERENDJOIN;
          break;
        case 'round':
          item.strokeJoin = StrokeJoin.ROUNDENDJOIN;
          break;
        case 'bevel':
          item.strokeJoin = StrokeJoin.BEVELENDJOIN;
          break;
        default:
          break;
      }

      switch (styles.overprint) {
        case 'true':
          item.strokeOverprint = true;
          break;
        case 'false':
          item.strokeOverprint = false;
          break;
        default:
          break;
      }
    }
  }

  cancel.onClick = win.close;

  win.onClose = function () {
    if (CFG.isMac) {
      if (docSel.length <= 25) {
        app.selection = docSel;
      } else {
        selectItems(docSel);
      }
    }
    isUndo = false;
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
        shiftSlider.value = parseFloat(this.text);
        preview();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
        shiftSlider.value = parseFloat(this.text);
        preview();
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
    var colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.7, 0.7, 0.7] : [0.3, 0.3, 0.3], 1); // Black
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
   * Retrieve the stroke style properties based on UI radio button values
   * @returns {Object} An object containing the stroke style properties
   */
  function getStrokeStyles() {
    var capType = 'original';
    if (isCapButt.value) capType = 'butt';
    else if (isCapRound.value) capType = 'round';
    else if (isCapProjecting.value) capType = 'projecting';
    
    var cornerType = 'original';
    if (isCornerMiter.value) cornerType = 'miter';
    else if (isCornerRound.value) cornerType = 'round';
    else if (isCornerBevel.value) cornerType = 'bevel';

    var overprintType = 'original';
    if (isOverprintON.value) overprintType = 'true';
    else if (isOverprintOFF.value) overprintType = 'false';

    return {
      cap: capType,
      corner: cornerType,
      overprint: overprintType
    };
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
    data.shift = shiftInp.text;
    data.overprint = isOverprintOriginal.value ? 0 : (isOverprintON.value ? 1 : 2);
    data.cap = isCapOriginal.value ? 0 : (isCapButt.value ? 1 : (isCapRound.value ? 2 : 3));
    data.corner = isCornerOriginal.value ? 0 : (isCornerMiter.value ? 1 : (isCornerRound.value ? 2 : 3));
    data.isAddStroke = isAddStroke.value;
    data.weight = strToNum(weightInp.text, 0);
    data.isPreview = isPreview.value;

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
        var shiftVal = strToNum(data.shift, 0);
        shiftInp.text = clamp(shiftVal, -CFG.max, CFG.max);
        shiftSlider.value = parseFloat(shiftInp.text);
        overprintPnl.children[parseInt(data.overprint) || 0].value = true;
        capPnl.children[parseInt(data.cap) || 0].value = true;
        cornerPnl.children[parseInt(data.corner) || 0].value = true;
        isAddStroke.value = data.isAddStroke === 'true';
        weightInp.text = parseFloat(data.weight) || 1;
        isPreview.value = data.isPreview === 'true';
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get the stroke width units from Preferences > Units > Stroke
 * @param {string} key - The key corresponding to the preference setting
 * @returns {string} The units for stroke width (e.g., 'in', 'mm', 'pt')
 */
function getUnits(key) {
  var code = app.preferences.getIntegerPreference(key);
  var units = 'pt';

  switch (code) {
    case 0: units = 'in'; break;
    case 1: units = 'mm'; break;
    case 2: units = 'pt'; break;
    case 3: units = 'pc'; break;
    case 4: units = 'cm'; break;
    // case 5: units = 'custom'; break;
    case 6: units = 'px'; break;
    case 7: units = 'ft'; break;
    case 8: units = 'm'; break;
    case 9: units = 'yd'; break;
    case 10: units = 'ft'; break;
    default: units = 'pt'; break;
  }

  return units;
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} Returns true if the script environment is correct; otherwise, displays an alert and returns false
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
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select at least one path and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Convert a collection into a standard Array
 * @param {Object} coll - The collection to be converted
 * @returns {Array} A new array containing the elements
 */
function get(coll) {
  var results = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    results.push(coll[i]);
  }
  return results;
}

/**
 * Get paths from a collection of Illustrator PageItems, recursively including paths within groups and compounds
 * @param {(Object|Array)} coll - The collection of Illustrator PageItems
 * @returns {Array} An array containing the paths from the provided collection
 */
function getPaths(coll) {
  var result = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      result = [].concat(result, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      if (item.pathItems[0].filled && hasColorFill(item.pathItems[0])) {
        result.push(item.pathItems[0]);
      }
    } else if (/pathitem/i.test(item.typename)) {
      if (item.filled && hasColorFill(item)) {
        result.push(item);
      }
    }
  }

  return result;
}

/**
 * Check if the provided object has a color fill
 * @param {Object} obj - The Illustrator PageItem to check for color fill
 * @returns {boolean} Returns true if the object has a color fill; otherwise, returns false
 */
function hasColorFill(obj) {
  var _type = obj.fillColor.typename;
  if (_type === 'RGBColor' || _type === 'CMYKColor' || _type === 'GrayColor' ||
      _type === 'SpotColor' || _type === 'GradientColor') return true;
  return false;
}

/**
 * Check whether there are stroked Paths in the array
 * @param {Array} arr - The array of Illustrator PathItems to check
 * @returns {boolean} Returns true if there is at least one PathItem with a stroke in the array; otherwise, returns false
 */
function hasStrokedPath(arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].stroked) return true;
  }
  return false;
}

/**
 * Calculate a color for applying to a stroke
 * @param {Object} color - The original color to be modified
 * @param {number} value - The shift brightness value used for calculating the modified color
 * @param {Array} keys - An array of color property keys to be modified
 * @param {boolean} isRgb - Indicates whether the color type is RGB (true) or CMYK (false)
 * @returns {Object} Returns the calculated color for applying to the stroke
 */
function calcColor(color, value, keys, isRgb) {
  var _stroke, currColor = color;

  // Process gradient
  if (currColor.typename === 'GradientColor') {
    currColor = averageGradient(currColor.gradient, isRgb);
  }

  if (value === 0 || isNaN(value)) {
    return currColor;
  }

  // Process Spot
  if (currColor.typename === 'SpotColor') {
    if (value < 0) {
      currColor = getSpotTint(currColor, isRgb);
    } else {
      _stroke = new SpotColor();
      _stroke.spot = currColor.spot;

      var tint = currColor.tint;
    
      tint = tint * (1 - value / 100);
      tint = clamp(tint, 0, 100);
      _stroke.tint = Math.round(tint);

      return _stroke;
    }
  }

  // Process Grayscale
  if (currColor.typename === 'GrayColor') {
    _stroke = new GrayColor();
    var grayVal = currColor.gray;
    var grayDelta = clamp(grayVal - value, 0, 100);
    _stroke.gray = grayDelta;
    return _stroke;
  }

  // Process other color
  var rawColor = [];
  for (var i = 0; i < keys.length; i++) {
    rawColor.push(Math.round(currColor[keys[i]]));
  }

  if (!isRgb) rawColor = cmykToRgb(rawColor);

  // Change lightness
  var hsl = rgbToHsl(rawColor);
  var modifiedHsl = lightenDarkenHSLColor(hsl, value);
  rawColor = hslToRgb(modifiedHsl);

  if (!isRgb) rawColor = rgbToCmyk(rawColor);

  // Create stroke color
  _stroke = isRgb ? new RGBColor() : new CMYKColor()
  for (var j = 0; j < keys.length; j++) {
    _stroke[keys[j]] = Math.round(rawColor[j]);
  }

  return _stroke;
}

/**
 * Calculate the average color from a gradient
 * @param {Object} gradient - The gradient from which to calculate the average color
 * @param {boolean} isRgb - Indicates whether the color type is RGB (true) or CMYK (false)
 * @returns {Object} Returns the averaged color from the gradient
 */
function averageGradient(gradient, isRgb) {
  var length = gradient.gradientStops.length,
      total = {}; // Sum of color channels

  for (var i = 0; i < length; i++) {
    var stopColor = gradient.gradientStops[i].color;

    if (stopColor.typename === 'SpotColor') {
      stopColor = stopColor.spot.color;
    } else if (stopColor.typename === 'GrayColor') {
      stopColor.red = stopColor.green = stopColor.blue = stopColor.black = stopColor.gray;
    }

    for (var key in stopColor) {
      if (typeof stopColor[key] === 'number') {
        total[key] = (total[key] || 0) + stopColor[key];
      }
    }
  }

  var averagedColor = isRgb ? new RGBColor() : new CMYKColor();

  for (var key in total) {
    averagedColor[key] = total[key] / length;
  }

  return averagedColor;
}

/**
 * Gets the true solid color from a SpotColor by interpolating between white and the spot color
 * @param {Object} color - The SpotColor from which to get the spot tint
 * @param {boolean} isRgb - Indicates whether the color type is RGB (true) or CMYK (false)
 * @returns {Object} Returns the spot tint color
 */
function getSpotTint(color, isRgb) {
  var white, tintVal = [];

  if (isRgb) {
    white = new RGBColor();
    white.red = 255;
    white.green = 255;
    white.blue = 255;
  } else {
    white = new CMYKColor();
  }

  var t = color.tint / 100,
      spot = color.spot.color;

  for (var key in spot) {
    if (typeof spot[key] === 'number') {
      tintVal.push(lerp(white[key], spot[key], t));
    }
  }

  return setColor(tintVal, isRgb);
}

/**
 * Linear interpolation between two values
 * @param {number} start - The starting value
 * @param {number} end - The ending value
 * @param {number} t - The interpolation parameter (0 to 1)
 * @returns {number} Returns the interpolated value
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Create a color from an array of values
 * @param {Array} arr - An array of color channel values
 * @param {boolean} isRgb - Indicates whether the color type is RGB (true) or CMYK (false)
 * @returns {Object} Returns the created color
 */
function setColor(arr, isRgb) {
  var color;

  if (isRgb) {
    color = new RGBColor();
    color.red = arr[0];
    color.green = arr[1];
    color.blue = arr[2];
  } else {
    color = new CMYKColor();
    color.cyan = arr[0];
    color.magenta = arr[1];
    color.yellow = arr[2];
    color.black = arr[3];
  }

  return color;
}

/**
 * Convert CMYK to RGB color space
 * @param {Array} cmyk - The input array of CMYK values
 * @returns {Array} Array of RGB values
 */
function cmykToRgb(cmyk) {
  return convertColor('CMYK', 'RGB', cmyk);
}

/**
 * Convert RGB to CMYK color space
 * @param {Array} rgb - The input array of RGB values
 * @returns {Array} Array of CMYK values
 */
function rgbToCmyk(rgb) {
  return convertColor('RGB', 'CMYK', rgb);
}

/**
* Convert color via native converter
* @param {string} src - Source color mode
* @param {string} dest - Destination color mode
* @param {Array} srcColor - Array of source color values
* @returns {Array} Array of destionation color values
*/
function convertColor(src, dest, srcColor) {
  return app.convertSampleColor(ImageColorSpace[src], srcColor, ImageColorSpace[dest], ColorConvertPurpose.defaultpurpose);
}

/**
 * Convert RGB to HSL color space
 * @param {Array} rgb - Array of RGB values
 * @returns {Array} Array of HSL values
 */
function rgbToHsl(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  var max = Math.max(r, g, b),
      min = Math.min(r, g, b);

  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // Achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
  }

  h *= 60;

  return [h, s, l];
}

/**
 * Convert HSL to RGB color space
 * https://github.com/gka/chroma.js/blob/master/src/io/hsl/hsl2rgb.js
 * @param {Array} hsl - Array of HSL values
 * @returns {Array} Array of RGB values
 */
function hslToRgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1],
      l = hsl[2];

  if (s == 0) {
    r = g = b = l; // Achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? (l * (1 + s)) : (l + s - l * s);
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  var r = clamp(255 * r, 0, 255),
      g = clamp(255 * g, 0, 255),
      b = clamp(255 * b, 0, 255);

  return [r, g, b];
}

/**
 * Clamp value to the range
 * @param {number} n - Value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Adjust the lightness of an HSL color
 * @param {Array} hsl - An array representing the HSL values [hue, saturation, lightness]
 * @param {number} value - The adjustment value for lightness. Positive values lighten the color, negative values darken it
 * @returns {Array} The adjusted HSL values
 */
function lightenDarkenHSLColor(hsl, value) {
  if (arguments.length == 1 || value == undefined) value = 100;

  var h = hsl[0],
      s = hsl[1],
      l = hsl[2];

  l += (value < 0) ? l * (value / 100) : (1 - l) * (value / 100);
  l = clamp(l, 0, 1);

  return [h, s, l];
}

/**
 * Converts a string to a number, handling commas and non-numeric characters
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
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  var convertedVal = UnitValue(value, currUnits).as(newUnits);
  return convertedVal;
}

/**
 * Fast select an array of Illustrator items by temporarily grouping them
 * @param {Array} arr - Array of items to select
 * @returns {void}
 */
function selectItems(arr) {
  // Validate input
  if (!arr || Object.prototype.toString.call(arr) !== '[object Array]' || !arr.length) return;

  // Create temp layer and group
  var tempLayer = app.activeDocument.layers.add();
  tempLayer.name = '__tempSelectionLayer__';
  var tempGroup = tempLayer.groupItems.add();

  // Store pairs of placeholder and original items
  var pairs = [];
  for (var i = 0; i < arr.length; i++) {
    try {
      var tempItem = tempLayer.pathItems.add();
      tempItem.move(arr[i], ElementPlacement.PLACEBEFORE);
      arr[i].move(tempGroup, ElementPlacement.PLACEATEND);
      pairs.push({ placeholder: tempItem, original: arr[i] });
    } catch (err) {
      if (tempItem) tempItem.remove(); // Cleanup on error
    }
  }

  // Select the group
  try { 
    tempGroup.selected = true;
  } catch (err) {}

  // Restore original positions and cleanup
  for (var j = pairs.length - 1; j >= 0; j--) {
    var pair = pairs[j];
    try {
      pair.original.move(pair.placeholder, ElementPlacement.PLACEBEFORE);
      pair.placeholder.remove();
    } catch (err) {
      try { pair.placeholder.remove(); } catch (e) {} // Silent cleanup
    }
  }

  // Remove temp group and layer
  try { tempGroup.remove(); } catch (err) {}
  try { tempLayer.remove(); } catch (err) {}
}

/**
 * Opens a URL in the default web browser
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