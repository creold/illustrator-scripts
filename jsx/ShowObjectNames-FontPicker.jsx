/*
  ShowObjectNames-FontPicker.jsx for Adobe Illustrator
  Description: Shows names of vector objects, linked or embedded raster images
  Date: June, 2023
  Modification Date: November, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.4 Added artboard name labels generation
  0.3.1 Minor fixes
  0.3 Added fonts, more positions, text justification, options to rotate text
  0.2 Added UI with options, support any objects
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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);// Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
    name: 'Show Object Names',
    version: 'v0.4'
  };
  
  var CFG = {
    name: 'Object_Names',
    fontWidth: 200, // Font list width, px
    fonts: get(app.textFonts, 'name'),
    fontUnits: getTypeUnits(),
    units: getUnits(),
    isMac: /mac/i.test($.os),
    aiVers: parseFloat(app.version),
    is2020: parseInt(app.version) == 24, // Current AI is CC 2020
    uiMargins: [10, 15, 10, 7],
    uiOpacity: .97 // UI window opacity
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv()) return;

  var doc = app.activeDocument;
  var docAbs = doc.artboards;

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  var docSel = get(app.selection);
  var selData = getItemsData(docSel);
  var isUndo = false;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.spacing = 10;
      win.opacity = CFG.uiOpacity;

  // SOURCE
  var targetPnl = win.add('panel', undefined, 'Target');
      targetPnl.orientation = 'row';
      targetPnl.alignChildren = ['fill', 'bottom'];
      targetPnl.margins = CFG.uiMargins;

  var isSelObj = targetPnl.add('radiobutton', undefined, 'Selection');
      isSelObj.value = docSel.length > 0;
      isSelObj.enabled = docSel.length > 0;

  var isArtboard = targetPnl.add('radiobutton', undefined, 'Artboards:');
      isArtboard.value = !isSelObj.value;

  var absInp = targetPnl.add('edittext', undefined, 1 + '-' + docAbs.length);
      absInp.helpTip = 'Active artboard: ' + 1 + '\nDocument artboards: ' + docAbs.length;
      absInp.characters = 6;
      absInp.enabled = isArtboard.value;

  // POSITION
  var posPnl = win.add('panel', undefined, 'Position');
      posPnl.alignChildren = ['fill', 'top'];
      posPnl.spacing = 7;
      posPnl.margins = CFG.uiMargins;

  var posGrp = posPnl.add('group');
  var isOutPos = posGrp.add('radiobutton', undefined, 'Around Object');
      isOutPos.value = true;
  var isInPos = posGrp.add('radiobutton', undefined, 'Inside Object');

  // List of reference points around the object
  var outPosList = [
    'Left Top',
    'Left Center',
    'Left Bottom',
    '-',
    'Top Left',
    'Top Center',
    'Top Right',
    '-',
    'Right Top',
    'Right Center',
    'Right Bottom',
    '-',
    'Bottom Left',
    'Bottom Center',
    'Bottom Right'
  ];

  // List of reference points inside the object
  var inPosList = [
    'Left Top',
    'Left Center',
    'Left Bottom',
    '-',
    'Center Top',
    'Center Center',
    'Center Bottom',
    '-',
    'Right Top',
    'Right Center',
    'Right Bottom',
  ];

  var posDdl = posPnl.add('dropdownlist', undefined, outPosList);
      posDdl.selection = 0;

  // OFFSET
  var offsetPnl = win.add('panel', undefined, 'Offset Distance');
      offsetPnl.orientation = 'row';
      offsetPnl.alignChildren = ['fill', 'center'];
      offsetPnl.spacing = 15;
      offsetPnl.margins = CFG.uiMargins;

  // OFFSET X
  var xGrp = offsetPnl.add('group');

  xGrp.add('statictext', undefined, 'X:');
  var xInp = xGrp.add('edittext', undefined, 0);
      xInp.preferredSize.width = 55;

  xGrp.add('statictext', undefined, CFG.units);

  // OFFSET Y
  var yGrp = offsetPnl.add('group');

  yGrp.add('statictext', undefined, 'Y:');
  var yInp = yGrp.add('edittext', undefined, 0);
      yInp.preferredSize.width = 55;

  yGrp.add('statictext', undefined, CFG.units);

  // ANGLE
  var angPnl = win.add('panel', undefined, 'Rotate');
      angPnl.orientation = 'row';
      angPnl.alignChildren = ['fill', 'center'];
      angPnl.spacing = 7;
      angPnl.margins = CFG.uiMargins;

  angPnl.add('statictext', undefined, 'Angle:');
  var angleDdl = angPnl.add('dropdownlist', undefined, ['0\u00B0', '90\u00B0 Clockwise', '90\u00B0 Counter Clockwise', '180\u00B0']);
      angleDdl.selection = 0;

  // FONT
  var fontPnl = win.add('panel', undefined, 'Font');
      fontPnl.orientation = 'row';
      fontPnl.alignChildren = ['fill', 'top'];
      fontPnl.margins = CFG.uiMargins;

  var fontDdl = fontPnl.add('dropdownlist', undefined, CFG.fonts);
      fontDdl.preferredSize.width = 100;
      fontDdl.itemSize.width = CFG.fontWidth;
      fontDdl.selection = 0;

  var fontGrp = fontPnl.add('group');

  fontGrp.add('statictext', undefined, 'Size:');
  var fontInp = fontGrp.add('edittext', undefined, 14);
      fontInp.preferredSize.width = 40;

  fontGrp.add('statictext', undefined, CFG.fontUnits);

  // WRAPPER 2
  var wrapper2 = win.add('group');
      wrapper2.orientation = 'row';
      wrapper2.alignChildren = ['fill', 'top'];

  // JUSTIFICATION
  var alignPnl = wrapper2.add('panel', undefined, 'Justification');
      alignPnl.alignChildren = ['fill', 'top'];
      alignPnl.spacing = 7;
      alignPnl.margins = CFG.uiMargins;

  var isAlignL = alignPnl.add('radiobutton', undefined, 'Left');
  var isAlignC = alignPnl.add('radiobutton', undefined, 'Center');
      isAlignC.value = true;
  var isAlignR = alignPnl.add('radiobutton', undefined, 'Right');

  // LAYER
  var layPnl = wrapper2.add('panel', undefined, 'Move Names To');
      layPnl.alignChildren = ['fill', 'top'];
      layPnl.spacing = 7;
      layPnl.margins = CFG.uiMargins;

  var isCurrLay = layPnl.add('radiobutton', undefined, 'No');
      isCurrLay.value = true;
  var isNewGrp = layPnl.add('radiobutton', undefined, 'Object Group');
  var isNewLay = layPnl.add('radiobutton', undefined, 'New Layer');

  // IMAGE OPTIONS
  var imgPnl = win.add('panel', undefined, 'Raster Image Options');
      imgPnl.orientation = 'row';
      imgPnl.alignChildren = ['fill', 'top'];
      imgPnl.margins = CFG.uiMargins;

  var isAddExtension = imgPnl.add('checkbox', undefined, 'Add Extension');
      isAddExtension.enabled = isSelObj.value;
  var isRenameImage = imgPnl.add('checkbox', undefined, 'Rename in Layer');
      isRenameImage.enabled = isSelObj.value;

  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = false;

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = "Preview disabled for CC 2020\ndue to critical bug";
  }

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

  var copyGrp = win.add('group');
      copyGrp.orientation = 'row';
      copyGrp.alignChildren = ['fill', 'center'];

  var author = copyGrp.add('statictext', undefined, '\u00A9 Sergey Osokin');
      author.justify = 'left';

  var link = copyGrp.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // EVENTS
  loadSettings(SETTINGS);
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isSelObj.active = isSelObj.value;
    absInp.active = isArtboard.value;
  }

  isSelObj.onClick = function () {
    absInp.enabled = false;
    isAddExtension.enabled = true;
    isRenameImage.enabled = true;
    isCurrLay.enabled = true;
    isNewGrp.enabled = true;
    preview();
  }

  isArtboard.onClick = function () {
    absInp.enabled = true;
    isAddExtension.enabled = false;
    isRenameImage.enabled = false;
    isCurrLay.value = false;
    isCurrLay.enabled = false;
    isNewGrp.value = false;
    isNewGrp.enabled = false;
    isNewLay.value = true;
    preview();
  }

  // Selecting font in dropdown by name using the keyboard
  // Book: Beginning ScriptUI, author: Peter Kahrel, June 2019
  var fontQuery = '';
  fontDdl.onActivate = fontDdl.onDeactivate = function () { 
    fontQuery = ''; // Clear previous query
  }

  fontDdl.addEventListener('keydown', function (k) {
    if (k.keyName == 'Backspace') {
      fontQuery = fontQuery.replace(/.$/, '');
    } else {
      if (k.keyName.length > 0) {
        fontQuery += k.keyName.toLowerCase();
      }
      var i = 0;
      while (i < CFG.fonts.length - 1 && CFG.fonts[i].toLowerCase().indexOf(fontQuery) != 0) {
        ++i;
      }
      if (CFG.fonts[i].toLowerCase().indexOf(fontQuery) == 0) {
        fontDdl.selection = i;
      }
    }
  });

  absInp.onChange = fontInp.onChange = preview;
  xInp.onChange = yInp.onChange = preview;

  bindStepperKeys(fontInp, 0.1, 1296);
  bindStepperKeys(xInp);
  bindStepperKeys(yInp);

  if (isPreview.value) preview();

  isOutPos.onClick = function () {
    updateDropdown(posDdl, outPosList);
  };

  isInPos.onClick = function () {
    updateDropdown(posDdl, inPosList);
  };

  fontDdl.onChange = posDdl.onChange = angleDdl.onChange = function () {
    this.active = true;

    // Adobe Illustrator crash protection
    if (this.children.length > 1) {
      // Protect mouse selection of empty separator in dropdown
      if (this.selection === null) {
        this.selection = 0;
      }
      preview();
    }
  }

  isAlignL.onClick = isAlignC.onClick = isAlignR.onClick = preview;
  isAddExtension.onClick = preview;
  isPreview.onClick = preview;

  cancel.onClick = win.close;
  ok.onClick = okClick;

  setTextHandler(link, function () {
    openURL('https://github.com/creold')
  });

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
      isUndo = false;
    } catch (err) {}
    try {
      var tmpLay = doc.layers.getByName('REMOVE_THIS');
      tmpLay.remove();
    } catch (err) {}
  }

  /**
   * Update the dropdown list with given items
   * @param {Object} dropdown - The dropdown UI element to update
   * @param {Array} list - The list of items to populate the dropdown with
   */
  function updateDropdown(dropdown, list) {
    dropdown.removeAll();
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] === '-') {
        dropdown.add('separator', undefined, i);
      } else {
        dropdown.add('item', list[i].toString());
      }
    }
    dropdown.selection = 0;
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        process();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Process selected items to create name labels based on specified parameters
   */
  function process() {
    var angleMap = { 0: 0, 1: -90, 2: 90, 3: 180 };

    var labelParams = {
      position: (posDdl.selection === null || posDdl.selection.text === '-') ? 'TOP LEFT' : posDdl.selection.text.toUpperCase(),
      isOutside: isOutPos.value,
      offsetX: convertUnits( strToNum(xInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      offsetY: convertUnits( strToNum(yInp.text, 0), CFG.units, 'px' ) / CFG.sf,
      angle: angleMap[angleDdl.selection.index] || 0,
      justification: isAlignL.value ? 'LEFT' : (isAlignR.value ? 'RIGHT' : 'CENTER'),
      isExtension: isAddExtension.value,
      isRename: isRenameImage.value,
      fontSize: convertUnits( strToNum(fontInp.text, 14), CFG.fontUnits, 'px' ) / CFG.sf,
      fontFamily: app.textFonts.getByName(fontDdl.selection.text),
      layer: doc.layers.add()
    };
    labelParams.layer.name = 'REMOVE_THIS';

    if (labelParams.fontSize <= 0) {
      labelParams.fontSize = 14;
      fontInp.text = 14;
    }

    // Prepare the processed items
    var items = [];
    var itemsData = [];
    if (isSelObj.value && docSel.length) {
      items = [].concat(docSel);
      itemsData = [].concat(selData);
    } else {
      if (isEmpty(absInp.text)) absInp.text = '1-' + docAbs.length;
      var absIdx = parseAndFilterIndexes(absInp.text, docAbs.length - 1);
      for (var a = 0; a < absIdx.length; a++) {
        items.push(docAbs[absIdx[a]]);
      }
      itemsData = getItemsData(items);
    }

    var labels = []; // Array to store created text frames

    // Process each item
    for (var i = 0, len = items.length; i < len; i++) {
      var itemLabel = addNameLabel(items[i], itemsData[i], labelParams);
      labels.push(itemLabel);
    }

    return labels;
  }

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);

    if (isPreview.value && isUndo) {
      app.undo();
    }
    isUndo = false;

    var labels = process();

    if (isNewLay.value) { // Move text frames into the layer
      var lay; // Get or create the layer
      try {
        lay = doc.layers.getByName(CFG.name);
        lay.visible = true;
        lay.locked = false;
      } catch (err) {
        lay = doc.layers.add();
        lay.name = CFG.name;
      }

      for (var i = 0, len = labels.length; i < len; i++) {
        labels[i].move(lay, ElementPlacement.PLACEATEND);
      }
    } else if (isNewGrp.value) { // Group text frames with objects
      for (var j = 0, len = labels.length; j < len; j++) {
        var group = labels[j].layer.groupItems.add();
        group.name = labels[j].contents;
        group.move(docSel[j], ElementPlacement.PLACEBEFORE);
        labels[j].move(group, ElementPlacement.PLACEATEND);
        docSel[j].move(group, ElementPlacement.PLACEATEND);
      }
    } else {
      for (var k = 0, len = labels.length; k < len; k++) {
        labels[k].move(docSel[k], ElementPlacement.PLACEBEFORE);
      }
    }

    // Update the selection with created text frames
    app.selection = labels;
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
    data.selection = isSelObj.value;
    data.fontFamily = fontDdl.selection.index;
    data.fontSize = fontInp.text;
    data.offsetX = xInp.text;
    data.offsetY = yInp.text;
    data.direction = isOutPos.value ? 0 : 1;
    data.pos = posDdl.selection.index;
    data.angle = angleDdl.selection.index;
    data.justification = isAlignL.value ? 0 : (isAlignC.value ? 1 : 2);
    data.container = isCurrLay.value ? 0 : (isNewGrp.value ? 1 : 2);
    data.extension = isAddExtension.value;
    data.rename = isRenameImage.value;

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

        isSelObj.value = data.selection === 'true' && app.selection.length;
        isArtboard.value = !isSelObj.value;
        absInp.enabled = isArtboard.value;

        if (fontDdl && fontInp && data.fontFamily) {
          fontDdl.selection = data.fontFamily;
          fontInp.text = data.fontSize ? data.fontSize : 14;
        }

        xInp.text = data.offsetX;
        yInp.text = data.offsetY;

        posGrp.children[data.direction].value = true;
        if (data.direction == 1) updateDropdown(posDdl, inPosList);
        posDdl.selection = data.pos;
        angleDdl.selection = data.angle;

        alignPnl.children[parseInt(data.justification) || 0].value = true;
        layPnl.children[parseInt(data.container) || 0].value = true;
        if (isArtboard.value) {
          isCurrLay.value = false;
          isCurrLay.enabled = false;
          isNewGrp.value = false;
          isNewGrp.enabled = false;
          isNewLay.value = true;
        }

        isAddExtension.value = data.extension === 'true';
        isAddExtension.enabled = !isArtboard.value;
        isRenameImage.value = data.rename === 'true';
        isRenameImage.enabled = !isArtboard.value;
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
 * Get the type measurement units based on the application's preference
 * @returns {string} The unit of measurement for text
 */
function getTypeUnits() {
  var code = app.preferences.getIntegerPreference('text/units');
  var units = 'pt';

  switch (code) {
    case 0: units = 'in'; break;
    case 1: units = 'mm'; break;
    case 2: units = 'pt'; break;
    case 6: units = 'px'; break;
  }

  return units;
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
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0;i < args.length;i++) {
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
          alert('Few objects are selected\nPlease select atleast ' + rqdLen + ' object and try again', 'Script error');
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
 * @param {string} prop - The property name to extract from each object (optional)
 * @returns {Array} A new array with either the extracted properties or the original elements
 */
function get(coll, prop) {
  var arr = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    arr.push(prop && coll[i].hasOwnProperty(prop) ? coll[i][prop] : coll[i]);
  }

  return arr;
}

/**
 * Get data for a collection of items, including their bounds, dimensions, and names
 * @param {(Object|Array)} coll - The collection of items to process
 * @returns {Array} An array of objects
 */
function getItemsData(coll) {
  if (!coll.length) return [];

  var data = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    var isArtboard = /artboard/i.test(item.typename);
    var bnds = isArtboard ? item.artboardRect : getVisibleBounds(item, 'geometricBounds');
    var name = isArtboard ? item.name : getName(item);
    if (!name.length) {
      name = isArtboard ? 'Unnamed Artboard' : 'Unnamed Object';
    }

    data.push({
      bounds: bnds,
      width: Math.abs(bnds[2] - bnds[0]),
      height: Math.abs(bnds[1] - bnds[3]),
      name: name
    });
  }

  return data;
}

/**
 * Get the actual "visible" bounds
 * https://github.com/joshbduncan/illustrator-scripts/blob/main/jsx/DrawVisibleBounds.jsx
 * @param {Object} obj - The target object
 * @param {string} type - The object bounds type
 * @returns {Array} An array representing the actual bounds
 */
function getVisibleBounds(obj, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';
  var doc = app.activeDocument;
  var bnds, clippedItem, tmpItem, tmpLayer;
  var curItem;
  if (obj.typename === 'GroupItem') {
    if (obj.clipped) {
      // Check all sub objects to find the clipping path
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename === 'CompoundPathItem') {
          if (!curItem.pathItems.length) {
            // Catch compound path items with no pathItems
            // via William Dowling @ github.com/wdjsdev
            tmpLayer = doc.layers.add();
            tmpItem = curItem.duplicate(tmpLayer);
            app.executeMenuCommand('deselectall');
            tmpItem.selected = true;
            app.executeMenuCommand('noCompoundPath');
            tmpLayer.hasSelectedArtwork = true;
            app.executeMenuCommand('group');
            clippedItem = item[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        }
      }
      if (!clippedItem) clippedItem = obj.pageItems[0];
      bnds = clippedItem[type];
      if (tmpLayer) {
        tmpLayer.remove();
        tmpLayer = undefined;
      }
    } else {
      // If the object is not clipped
      var subObjBnds;
      var allBoundPoints = [[], [], [], []];
      // Get the bounds of every object in the group
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        subObjBnds = getVisibleBounds(curItem, type);
        allBoundPoints[0].push(subObjBnds[0]);
        allBoundPoints[1].push(subObjBnds[1]);
        allBoundPoints[2].push(subObjBnds[2]);
        allBoundPoints[3].push(subObjBnds[3]);
      }
      // Determine the groups bounds from it sub object bound points
      bnds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bnds = obj[type];
  }
  return bnds;
}

/**
 * Get the name of an item, considering its type
 * @param {Object} item - The item for which to get the name
 * @returns {string} str - The name of the item
 */
function getName(item) {
  if (!item || !item.typename) return item.name || '';

  // If part of a compound path with a name, return that
  var compound = getCompound(item);
  if (compound && !isEmpty(compound.name)) {
    return compound.name;
  }

  // If item has a direct name, return it
  if (!isEmpty(item.name)) {
    return item.name;
  }

  // Special cases for derived names
  if (item.typename === 'TextFrame' && !isEmpty(item.contents)) {
    return item.contents;
  }

  if (item.typename === 'SymbolItem') {
    return item.symbol.name;
  }

  if (item.typename === 'PlacedItem') {
    return item.file && item.file.name ? item.file.name : '<Linked File>';
  }

  return item.name || '';
}

/**
 * Retrieve the compound path parent of an item
 * @param {Object} item - The item to check for a compound path parent
 * @returns {Object|null} The compound path item if found, otherwise null
 */
function getCompound(item) {
  if (!item || !item.typename) return null;

  // Skip top-level objects: layers, artboards, document
  if (item.typename === 'Layer' || item.typename === 'Artboard' || item.typename === 'Document') {
    return null;
  }

  while (item && item.parent) {
    if (item.parent.typename === 'CompoundPathItem') {
      return item.parent;
    }
    item = item.parent;
  }

  return null;
}

/**
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Parse a string representing a list of indexes and filters them based on a total count
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} An array of valid indexes
 */
function parseAndFilterIndexes(str, givenNumber) {
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

    if (num >= 0 && num <= givenNumber) {
      filteredNums.push(num);
    }
  }

  // Remove duplicates and sort
  filteredNums = getUnique(filteredNums);
  filteredNums.sort(function (a, b) {
    return a - b;
  });

  return filteredNums;
}

/**
 * Remove duplicate elements from an array
 * @param {Array} arr - The input array
 * @returns {Array} An array with duplicate elements removed
 */
function getUnique(arr) {
  var obj = {};
  var i, l = arr.length;
  var unique = [];
  for (i = 0; i < l; i++) obj[arr[i]] = arr[i];
  for (i in obj) unique.push(obj[i]);
  return unique;
}

/**
 * Add a name label to the specified item based on the provided parameters
 * @param {Object} item - The Illustrator item to label. Can be a placed, raster, or other object type
 * @param {Object} itemData - Contains item properties like name, width, height, and bounds
 * @param {Object} params - Labeling parameters including font size, justification, position, and offsets
 * @returns {Object} The created text frame containing the label
 */
function addNameLabel(item, itemData, params) {
  var f;
  try {
    f = item.file;
  } catch (err) {
    f = item;
  }

  var nameStr = '';
  if (/placed|raster/i.test(item.typename)) {
    nameStr = params.isExtension ? f.name : f.name.replace(/\.[^\.]+$/, '');
    if (nameStr.length && params.isRename) item.name = decodeURI(nameStr);
    if (!nameStr.length) nameStr = 'Missing Image';
  } else {
    nameStr = itemData.name;
  }

  var tf = params.layer.textFrames.add();
  tf.contents = decodeURI(nameStr);
  tf.textRange.characterAttributes.textFont = params.fontFamily;
  tf.textRange.characterAttributes.size = params.fontSize;
  tf.textRange.paragraphAttributes.justification = Justification[params.justification];
  tf.rotate(params.angle);

  var diffW = itemData.width - tf.width + params.offsetX;
  var diffH = itemData.height - tf.height + params.offsetY;
  var halfDiffW = diffW / 2 + params.offsetX;
  var halfDiffH = diffH / 2;

  var topBase = itemData.bounds[1] + (params.isOutside ? tf.height : -tf.height) + params.offsetY;
  var bottomBase = itemData.bounds[3] + tf.height + params.offsetY;
  var leftBase = itemData.bounds[0] + (params.isOutside ? -tf.width - params.offsetX : params.offsetX);
  var rightBase = itemData.bounds[2] + (params.isOutside ? params.offsetX : -tf.width - params.offsetX);
  var centerX = itemData.bounds[0] + halfDiffW;
  var centerY = itemData.bounds[1] - halfDiffH + params.offsetY;

  switch (params.position) {
    case 'LEFT TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = leftBase;
      break;
    case 'LEFT CENTER':
      tf.top = centerY;
      tf.left = leftBase;
      break;
    case 'LEFT BOTTOM':
      tf.top = bottomBase;
      tf.left = leftBase;
      break;
    case 'TOP LEFT':
      tf.top = topBase;
      tf.left = itemData.bounds[0] + params.offsetX;
      break;
    case 'TOP CENTER':
      tf.top = topBase;
      tf.left = centerX;
      break;
    case 'TOP RIGHT':
      tf.top = topBase;
      tf.left = itemData.bounds[2] - tf.width - params.offsetX;
      break;
    case 'RIGHT TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = rightBase;
      break;
    case 'RIGHT CENTER':
      tf.top = centerY;
      tf.left = rightBase;
      break;
    case 'RIGHT BOTTOM':
      tf.top = bottomBase;
      tf.left = rightBase;
      break;
    case 'BOTTOM LEFT':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = itemData.bounds[0] + params.offsetX;
      break;
    case 'BOTTOM CENTER':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = centerX;
      break;
    case 'BOTTOM RIGHT':
      tf.top = itemData.bounds[1] - itemData.height - params.offsetY;
      tf.left = itemData.bounds[2] - tf.width - params.offsetX;
      break;
    case 'CENTER TOP':
      tf.top = itemData.bounds[1] + params.offsetY;
      tf.left = centerX;
      break;
    case 'CENTER CENTER':
      tf.top = centerY;
      tf.left = centerX;
      break;
    case 'CENTER BOTTOM':
      tf.top = bottomBase;
      tf.left = centerX;
      break;
    default:
      break;
  }

  return tf;
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