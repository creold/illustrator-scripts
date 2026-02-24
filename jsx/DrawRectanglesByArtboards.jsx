/*
  DrawRectanglesByArtboards.jsx for Adobe Illustrator
  Description: Draws rectangles to match the size of each artboard, including any specified bleed
  Date: July, 2024
  Modification date: February, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.4 Added rectangles preview and optional display of artboard indexes
  0.3 Added percentage-based rectangle sizing, settings persistence
  0.2.1 Added active artboard index to custom range option
  0.2.0 Added UI with many options
  0.1 Initial version (thanks for Egor Chistyakov, https://t.me/@egrch)

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

function main() {
  var SCRIPT = {
        name: 'Draw Rectangles By Artboards',
        version: 'v0.4'
      };

  var CFG = {
        bleed: getBleed(), // Default document bleed
        isEqual: true, // Default same bleed values
        layer: 'Artboard_Rectangles', // New layer name
        isLower: true, // Rectangles under the others objects
        rectColor: [255, 0, 0], // RGB color of rectangle stroke for preview
        isShowIndex: true, // Show (true) or not (false) temporary artboard indexes
        indexColor: [255, 0, 0], // RGB color for temporary artboard indexes
        indexLayer: 'ARTBOARD_INDEX', // Layer for temporary artboard indexes
        aiVers: parseFloat(app.version),
        units: getUnits(),
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7],
        dlgOpacity: .97 // UI window opacity. rangeInp 0-1
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, "_") + "_data.json",
        folder: Folder.myDocuments + "/Adobe Scripts/"
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

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;
  CFG.bleed = roundNum( convertUnits(CFG.bleed, 'pt', CFG.units) * CFG.sf, 4);

  var docAbs = doc.artboards;
  var currIdx = docAbs.getActiveArtboardIndex();
  var actLayer = doc.activeLayer;

  // Create rectangles color
  var rectColor = setRGBColor(CFG.rectColor);

  var isUndo = false;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'top'];
      win.opacity = CFG.dlgOpacity;

  // SOURCE
  var srcPnl = win.add('panel', undefined, 'Artboards');
      srcPnl.orientation = 'row';
      srcPnl.alignChildren = ['left', 'bottom'];
      srcPnl.margins = CFG.mgns;

  var isCurrAb = srcPnl.add('radiobutton', undefined, 'Active #' + (currIdx + 1));
      isCurrAb.value = true;

  var isCstmAb = srcPnl.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = srcPnl.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" > 1, 3, 4, 5';
      rangeInp.characters = 13;
      rangeInp.enabled = isCstmAb.value;

  // RECTANGLE SIZE
  var sizePnl = win.add('panel', undefined, 'Bleed Size');
      sizePnl.orientation = 'column';
      sizePnl.alignChildren = ['left', 'bottom'];
      sizePnl.margins = CFG.mgns;

  var modeGrp = sizePnl.add('group');
      modeGrp.orientation = 'row';
      modeGrp.alignChildren = ['left', 'bottom'];

  var isFixBleed = modeGrp.add('radiobutton', undefined, 'Absolute (' + CFG.units + ')');
      isFixBleed.helpTip = 'Set bleeds in absolute units\n(px, mm, etc.)';
      isFixBleed.value = true;

  var isRelBleed = modeGrp.add('radiobutton', undefined, 'Relative by Short Side (%)');
      isRelBleed.helpTip = 'Set bleeds as a percentage\nof short side of artboard';

  // BLEED * FIXED
  var fixGrp = sizePnl.add('group');
      fixGrp.orientation = 'row';
      fixGrp.alignChildren = ['left', 'bottom'];

  // TOP
  var top = fixGrp.add('group');
      top.orientation = 'column';
      top.alignChildren = ['fill', 'center'];
      top.spacing = 5;

  top.add('statictext', undefined, 'Top');
  var topInp = top.add('edittext', undefined, CFG.bleed);
      topInp.preferredSize.width = 45;

  // BOTTOM
  var bottom = fixGrp.add('group');
      bottom.orientation = 'column';
      bottom.alignChildren = ['fill', 'center'];
      bottom.spacing = 5;

  bottom.add('statictext', undefined, 'Bottom');
  var bottomInp = bottom.add('edittext', undefined, CFG.bleed);
      bottomInp.preferredSize.width = 45;

  // LEFT
  var left = fixGrp.add('group');
      left.orientation = 'column';
      left.alignChildren = ['fill', 'center'];
      left.spacing = 5;

  left.add('statictext', undefined, 'Left');
  var leftInp = left.add('edittext', undefined, CFG.bleed);
      leftInp.preferredSize.width = 45;

  // RIGHT
  var right = fixGrp.add('group');
      right.orientation = 'column';
      right.alignChildren = ['fill', 'center'];
      right.spacing = 5;

  right.add('statictext', undefined, 'Right');
  var rightInp = right.add('edittext', undefined, CFG.bleed);
      rightInp.preferredSize.width = 45;

  var isEqual = fixGrp.add('checkbox', undefined, 'Same');
      isEqual.helpTip = 'Make all settings\nthe same';
      isEqual.value = CFG.isEqual;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // TARGET
  var tgtPnl = win.add('panel', undefined, 'Move Rectangles To');
      tgtPnl.orientation = 'row';
      tgtPnl.alignChildren = ['left', 'top'];
      tgtPnl.margins = CFG.mgns;

  var isCurrLay = tgtPnl.add("radiobutton", undefined, 'Active Layer: \u0022' + truncate(actLayer.name, 12) + '\u0022');
      isCurrLay.value = true;

  var isNewLay = tgtPnl.add('radiobutton', undefined, 'New Layer');
      isNewLay.helpTip = 'New Layer \u0022' + CFG.layer + '\u0022\nCan be changed in CFG.layer';

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  var copyright = win.add('group');
      copyright.orientation = 'row';
      copyright.alignChildren = ['fill', 'center'];

  var author = copyright.add('statictext', undefined, '\u00A9 Sergey Osokin');
      author.justify = 'left';

  var link = copyright.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // EVENTS
  loadSettings(SETTINGS);

  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
    preview();
  }

  isCstmAb.onClick = function () {
    rangeInp.enabled = true;
    preview();
  }

  rangeInp.onChange = isFixBleed.onClick = isRelBleed.onClick = preview;

  bindStepperKeys(topInp);
  bindStepperKeys(bottomInp);
  bindStepperKeys(leftInp);
  bindStepperKeys(rightInp);

  topInp.onChange = bottomInp.onChange = leftInp.onChange = rightInp.onChange = function () {
    if (isRelBleed.value) {
      var val = strToNum(this.text, 100);
      if (val <= -50) this.text = -49;
    }
    preview();
  }

  isEqual.onClick = function () {
    bottomInp.enabled = !this.value;
    leftInp.enabled = !this.value;
    rightInp.enabled = !this.value;
    preview();
  }

  isPreview.onClick = preview;

  cancel.onClick = win.close;
  ok.onClick = okClick;

  setTextHandler(link, function () {
    openURL('https://github.com/creold');
  });

  // Fix unfocus bug when arrow keys not working
  win.onShow = function () {
    if (CFG.isShowIndex && docAbs.length > 1) {
      showArboardIndex(CFG.indexLayer, CFG.indexColor);
    }
    isCurrAb.active = true;
  }

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
    try {
      var tmpLayer = doc.layers.getByName(CFG.indexLayer);
      tmpLayer.remove();
    } catch (err) {}
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (!isPreview.value) {
        if (isUndo) {
          app.undo();
          app.redraw();
          isUndo = false;
        }
        return;
      }

      if (isUndo) {
        doc.swatches.add().remove();
        app.undo();
      }

      process();

      doc.swatches.add().remove();
      app.redraw();

      isUndo = true;
    } catch (err) {}
  }

  /**
   * Handle the OK button click event.
   * Save settings, process the document, and clean up
   */
  function okClick() {
    if (isPreview.value && isUndo) app.undo();

    process();

    try {
      var tmpLayer = doc.layers.getByName(CFG.layer);
      var items = tmpLayer.pathItems;

      // Set layer order if required
      if (CFG.isLower) tmpLayer.zOrder(ZOrderMethod.SENDTOBACK);

      // Select all generated rectangles fast
      tmpLayer.hasSelectedArtwork = true;

      var tgtLayer;
      if (isCurrLay.value) {
        tgtLayer = actLayer;
        tgtLayer.locked = false;
        tgtLayer.visible = true;
      }

      for (var i = items.length - 1; i >= 0; i--) {
        var currItem = items[i];
        currItem.filled = false;
        currItem.stroked = false;

        if (tgtLayer) {
          currItem.move(actLayer, ElementPlacement.PLACEATEND);
        }
      }

      if (tgtLayer && tmpLayer !== tgtLayer) tmpLayer.remove();
    } catch (err) {
      // temp layer may not exist
    }

    saveSettings(SETTINGS);
    isUndo = false;
    win.close();
  }

  /**
   * Process the document based on user input and configuration
   * Validate bleed values, create/update layers, and draw artboard rectangles
   */
  function process() {
    var params = getRectParams();

    // Create or retrieve target layer
    var tgtLayer;
    try {
      tgtLayer = doc.layers.getByName(CFG.layer);
    } catch (err) {
      tgtLayer = doc.layers.add();
      tgtLayer.name = CFG.layer;
    }

    // Draw artboard rectangles
    processArtboards(function(idx) {
      drawArtboardRect(tgtLayer, docAbs[idx], params);
    });
  }

  /**
   * Process artboards based on the provided callback function
   * @param {Function} callback - The function to execute for each artboard index
   */
  function processArtboards(callback) {
    if (isCurrAb.value) {
      callback(currIdx);
      return;
    }

    var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
    // Default to the first artboard if no range is specified
    if (!range.length) range = [0];

    for (var i = 0; i < range.length; i++) callback(range[i]);
  }

  /**
   * Retrieve rectangle parameters for mask creation
   * @returns {Object} - An object containing rectangle parameters
   */
  function getRectParams() {
    var isFixed = isFixBleed.value;
    var params = {
      isFixed: isFixed,
      color: rectColor
    };

    var topVal = getSideValue(topInp, isFixed);
    params.top = topVal;

    // Use topVal for all sides if 'isEqual' is true, otherwise calculate individually
    params.bottom = isEqual.value ? topVal : getSideValue(bottomInp, isFixed);
    params.left   = isEqual.value ? topVal : getSideValue(leftInp, isFixed);
    params.right  = isEqual.value ? topVal : getSideValue(rightInp, isFixed);

    // Enforce minimum value if relative bleed is enabled
    if (isRelBleed.value) {
      var minVal = -49;
      if (params.top <= -50) params.top = topInp.text = minVal;
      if (params.bottom <= -50) params.bottom = bottomInp.text = minVal;
      if (params.left <= -50) params.left = leftInp.text = minVal;
      if (params.right <= -50) params.right = rightInp.text = minVal;
    };

    return params;
  }

  /**
   * Calculate the value for a specific side (top, bottom, left, right)
   * @param {Object} input - The input object containing the text value
   * @param {boolean} isFixed - Whether the bleed is fixed or relative
   * @returns {number} - The calculated side value
   */
  function getSideValue(input, isFixed) {
    var val = strToNum(input.text, isFixed ? CFG.bleed : 100);
    if (isFixed) val = convertUnits(val, CFG.units, 'px') / CFG.sf;
    return val;
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
      var num = parseFloat(this.text);
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
    data.artboard = isCurrAb.value ? 0 : 1;
    data.isFixBleed = isFixBleed.value ? 0 : 1;
    data.top = topInp.text;
    data.bottom = bottomInp.text;
    data.left = leftInp.text;
    data.right = rightInp.text;
    data.equal = isEqual.value;
    data.layer = isCurrLay.value ? 0 : 1;

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
        isCurrAb.value = data.artboard === '0';
        isCstmAb.value = !isCurrAb.value;
        rangeInp.enabled = isCstmAb.value;
        rangeInp.active = isCstmAb.value;

        isFixBleed.value = data.isFixBleed === '0';
        isRelBleed.value = !isFixBleed.value;

        topInp.text = data.top;
        bottomInp.text = data.bottom;
        leftInp.text = data.left;
        rightInp.text = data.right;

        isEqual.value = data.equal === 'true';
        bottomInp.enabled = !isEqual.value;
        leftInp.enabled = !isEqual.value;
        rightInp.enabled = !isEqual.value;

        isCurrLay.value = data.layer === '0';
        isNewLay.value = !isCurrLay.value;
      }
    } catch (err) {
      return;
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

  win.show();
}

/**
 * Get document bleed settings
 * @param {Object} [doc] - The document to read the bleed settings from
 * @returns {number} - The bleed setting in points
 */
function getBleed(doc) {
  if (doc == undefined) {
    if (app.documents.length) doc = app.activeDocument;
    else return 0;
  }

  var str = '';
  var regex = /TrimBox\[(\d+\.\d+)/;
  var bleed = 0;

  if (!/(\.ai|\.pdf)$/i.test(doc.fullName)) {
    // Bleed are not readable for other formats
    return bleed;
  } else {
    // For AI, PDF
    try {
      var f = File(doc.fullName);
      if (!f.exists) return bleed;
      f.open('r');

      while (!f.eof) {
        str = f.readln();
        // Find technical data in a SAVED file
        if (/TrimBox\[.*?\]/.test(str)) {
          var match = str.match(regex);
          // Example data TrimBox[25.5118 25.5118 1125.51 1125.51] in points
          if (match) bleed = parseFloat(match[1]);
          break;
        }
      }

      f.close();
    } catch (err) {
      f.close();
    }
  }

  return bleed;
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
 * Display the index of each artboard in the active document
 * @param {string} name - The name of the temporary layer to create
 * @param {Array} color - The RGB color array for the text. Defaults to black if not provided
 */
function showArboardIndex(name, color) {
  if (arguments.length == 1 || color == undefined) {
    color = [255, 0, 0];
  }

  var doc = app.activeDocument;
  var color = setRGBColor(color);

  var tmpLayer;
  try {
    tmpLayer = doc.layers.getByName(name);
  } catch (err) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = name;
  }
  tmpLayer.visible = true;
  tmpLayer.locked = false;

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i];
    var abWidth = currAb.artboardRect[2] - currAb.artboardRect[0];
    var abHeight = currAb.artboardRect[1] - currAb.artboardRect[3];
    var label = tmpLayer.textFrames.add();
    var labelSize = (abWidth >= abHeight) ? abHeight / 3 : abWidth / 3;

    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = color;
    label.position = [
      currAb.artboardRect[0] + (abWidth) / 2 - label.width / 2,
      currAb.artboardRect[1] - (abHeight) / 2 + label.height / 2
    ];
    label.locked = true;
  }

  // Update screen
  app.redraw();
}

/**
 * Create a RGB object with validated RGB values
 * @param {Array} rgb - An array of three numbers representing RGB values
 * @returns {Object} A RGB color with validated and clamped RGB values
 */
function setRGBColor(rgb) {
  var defaultRGB = [255, 0, 0];

  // Validate and clamp each CMYK value
  for (var i = 0; i < 4; i++) {
    if (rgb[i] !== undefined && typeof rgb[i] === 'number') {
      defaultRGB[i] = Math.max(0, Math.min(255, rgb[i]));
    }
  }

  // Create and return a new CMYKColor object
  var color = new RGBColor();
  color.red = defaultRGB[0];
  color.green = defaultRGB[1];
  color.blue = defaultRGB[2];

  return color;
}

/**
 * Truncate a string to a specific length and add an ellipsis ('...') if it exceeds that length
 * @param {string} str - The string to truncate
 * @param {number} n - The maximum length of the truncated string including the ellipsis
 * @returns {string} - The truncated string with an ellipsis if it was truncated, otherwise the original string
 */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
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
 * Round a number to a specified number of decimal places
 * @param {number} num - The number to be rounded
 * @param {number} decimals - The number of decimal places to round to
 * @returns {number} - The rounded number
 */
function roundNum(num, decimals) {
  var pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
}

/**
 * Draw an artboard-sized rectangle with bleed
 * @param {Object} container - The target container to draw the rectangle on
 * @param {Object} artboard - The artboard object to base the rectangle dimensions on
 * @param {Object} params - An object containing the rectangle settings
 * @param {boolean} isLower - Determines whether to place created rectangles below or above other objects
 */
function drawArtboardRect(container, artboard, params, isLower) {
  var abData = getArtboardData(artboard);
  var rectData = calculateRect(abData, params);

  if (rectData.width <= 0 || rectData.height <= 0) return;

  var zoom = 1.0;
  try { zoom = app.activeDocument.views[0].zoom; } catch (err) {}

  var rect = container.pathItems.rectangle(
    rectData.top,
    rectData.left,
    rectData.width,
    rectData.height
  );

  rect.fillColor = new NoColor();
  rect.stroked = true;
  rect.strokeColor = params.color;
  rect.strokeWidth = 0.5 + (1.5 / zoom);
  rect.strokeDashes = [6 / zoom, 4 / zoom];

  rect.zOrder(isLower ? ZOrderMethod.SENDTOBACK : ZOrderMethod.BRINGTOFRONT);
}

/**
 * Get data for an artboard
 * @param {object} ab - The artboard object to retrieve data from
 * @returns {object} - An object containing the artboard's boundaries and dimensions
 */
function getArtboardData(ab) {
  var abRect = ab.artboardRect;
  return {
    left: abRect[0],
    top: abRect[1],
    right: abRect[2],
    bottom: abRect[3],
    width: Math.abs(abRect[2] - abRect[0]),
    height: Math.abs(abRect[1] - abRect[3]),
  };
}

/**
 * Calculate the rectangle dimensions and position based on artboard data and parameters
 * @param {Object} abData - Artboard data (width, height, top, left)
 * @param {Object} params - Rectangle parameters (isFixed, top, bottom, left, right)
 * @returns {Object} - The calculated rectangle (width, height, top, left)
 */
function calculateRect(abData, params) {
  var rect = {};

  if (params.isFixed) {
    rect.width  = abData.width + params.left + params.right;
    rect.height = abData.height + params.top + params.bottom;
    rect.top    = abData.top + params.top;
    rect.left   = abData.left - params.left;
  } else {
    var min = Math.min(abData.width, abData.height);

    var padLeft   = min * params.left / 100;
    var padRight  = min * params.right / 100;
    var padTop    = min * params.top / 100;
    var padBottom = min * params.bottom / 100;

    rect.width  = abData.width + padLeft + padRight;
    rect.height = abData.height + padTop + padBottom;
    rect.top    = abData.top + padTop;
    rect.left   = abData.left - padLeft;
  }

  return rect;
}

/**
 *  Parse a string representing a list of indexes and filters them based on a total count
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} - An array of valid indexes
 */
function parseAndFilterIndexes(str, total) {
  var parsedNums = [];
  var chunks = str.split(/[,; ]+/);
  var length = chunks.length;

  for (var i = 0; i < length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsedNums.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) {
        parsedNums.push(num);
      }
    }
  }

  var filteredNums = [];
  length = parsedNums.length;

  for (var k = 0; k < length; k++) {
    var num = parsedNums[k] - 1;

    if (num >= 0 && num <= total) {
      filteredNums.push(num);
    }
  }

  return filteredNums;
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

try {
  main();
} catch (err) {}