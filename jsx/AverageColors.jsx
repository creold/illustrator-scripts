/*
  AverageColors.jsx for Adobe Illustrator
  Description: Averages the colors of selected objects or separately inside groups or gradients
              Hold Alt on launch to show dialog if showUI: false
              or run in silent mode with the latest settings if showUI: true
  Date: March, 2022
  Modification date: June, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  v0.3
  - Added: "Gradients Separately" scope to average each selected gradient individually
  - Added: "Fills & Strokes Combined" appearance mode to average both attributes together
  - Minor improvements
  v0.2
  - Added: "Add to Swatches" (adding averaged colors to the Swatches panel)
  - Added: "Square Root" and "Area-Weighted" averaging methods
  - Added: Support for TextFrame objects
  - Added: Preview checkbox
  - Minor improvements
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
        name    : 'Average Colors',
        version : 'v0.3'
      };

  var CFG = {
        scope       : 'selection',  // Scope: 'selection', 'group', 'gradient'
        avgMethod   : 'simple',       // Average algorithm: 'simple', 'sqrt', 'weighted'
        appearance  : 'separately', // Appearance: 'fills', 'strokes', 'separately', 'combined'
        isAddSwatch : false,        // Add averaged color to swatches
        isGlobalSw  : false,        // Make new swatch global or process
        isAddGroup  : true,         // Add created swatches to swatch group
        showUI      : true          // Silent mode or dialog
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!isCorrectEnv('version:16', 'selection:1')) return;

  // ==========================================
  // CASHED SELECTION
  // ==========================================
  var docSel = app.selection;
  var selItems = getItems(docSel, false);
  var selGroups = (/textrange/i.test(docSel.typename)) ? [] : getGroups(docSel);
  var selGroupItems = [];
  forEach(selGroups, function (g) {
    selGroupItems.push({
      group: g,
      items: getItems(g.pageItems, false)
    });
  });

  var isAltPressed = ScriptUI.environment.keyboardState.altKey;

  // ==========================================
  // RUN
  // ==========================================
  if ((CFG.showUI && !isAltPressed) || (!CFG.showUI && isAltPressed)) {
    // Show dialog
    invokeUI(SCRIPT, SETTINGS, selItems, selGroupItems);
  } else if (CFG.showUI && isAltPressed) {
    // Silent mode with the lastCfg settings
    var lastCfg = loadSettings(SETTINGS);
    process(selItems, selGroupItems, lastCfg);
  } else {
    // Silent mode with the default settings
    process(selItems, selGroupItems, CFG);
  }
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
        if (app.selection.length < rqdLen) {
          alert('Few objects are selected\nPlease select ' + rqdLen + ' item(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Save UI options to file
 * @param {Object} cfgFile - Settings file
 * @param {Object} lastCfg - Object containing preferences
 */
function saveSettings(cfgFile, lastCfg) {
  if (!Folder(cfgFile.folder).exists) {
    Folder(cfgFile.folder).create();
  }

  var f = new File(cfgFile.folder + cfgFile.name);
  f.encoding = 'UTF-8';
  f.open('w');

  f.write( stringify(lastCfg) );
  f.close();
}

/**
 * Load options from a file
 * @param {Object} prefs - Object containing preferences
 * @returns {Object} lastCfg - Options values
 */
function loadSettings(cfgFile) {
  var lastCfg = {
    scope       : 'selection',
    avgMethod   : 'simple',
    appearance  : 'separately',
    isAddSwatch : false,
    isGlobalSw  : false,
    isAddGroup  : false
  };

  var doc = app.activeDocument;
  var isRgb = /rgb/i.test(doc.documentColorSpace);

  var f = File(cfgFile.folder + cfgFile.name);
  if (!f.exists) return lastCfg;

  try {
    f.encoding = 'UTF-8';
    f.open('r');
    var json = f.readln();
    try { var data = new Function('return (' + json + ')')(); }
    catch (err) { return; }
    f.close();

    if (typeof data != 'undefined') {
      lastCfg.scope = data.scope ? data.scope : 'selection';
      lastCfg.avgMethod = data.avgMethod ? data.avgMethod : 'simple';
      if (!isRgb && lastCfg.avgMethod === 'sqrt') {
        lastCfg.avgMethod = 'simple';
      }
      lastCfg.appearance = data.appearance ? data.appearance : 'separately';
      lastCfg.isAddSwatch = data.isAddSwatch === 'true';
      lastCfg.isGlobalSw = data.isGlobalSw === 'true';

    }
  } catch (err) {}

  return lastCfg;
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
 * Show UI
 * @param {Object} title - Script metadata
 * @param {Object} cfgFile - Path to the settings file for persistence
 * @param {Array} items - Pre-collected flat items list
 * @param {Array} grpData - Pre-collected grouped items list
 */
function invokeUI(title, cfgFile, items, grpData) {
  var MARGINS = [10, 15, 10, 8];
  var lastCfg = loadSettings(cfgFile) || {};
  var doc = app.activeDocument;
  var isRgb = /rgb/i.test(doc.documentColorSpace);
  var isUndo = false; // For preview functionality

  var win = new Window('dialog', title.name + ' ' + title.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];
      win.opacity = .98;

  var wrapperL = win.add('group');
      wrapperL.orientation = 'column';
      wrapperL.alignChildren = ['fill', 'fill'];

  // ==========================================
  // SCOPE PANEL
  // ==========================================
  var scopePnl = wrapperL.add('panel', undefined, 'Scope');
      scopePnl.orientation = 'column';
      scopePnl.alignChildren = ['fill',' fill'];
      scopePnl.margins = MARGINS;

  var lastScope = lastCfg.scope || 'selection';
  if (lastScope === 'group' && !grpData.length) {
    lastScope = lastCfg.scope = 'selection';
  }

  var rbAllItems = scopePnl.add('radiobutton', undefined, 'Entire Selection');
      rbAllItems.value = (lastScope === 'selection');
      rbAllItems.helpTip = 'Average colors across all\nselected objects simultaneously';

  var rbPerGrp = scopePnl.add('radiobutton', undefined, 'Per Group');
      rbPerGrp.value = (lastScope === 'group');
      rbPerGrp.enabled = (grpData.length > 0);
      rbPerGrp.helpTip = 'Isolate and average colors\ninside each group separately';

  var rbGradItems = scopePnl.add('radiobutton', undefined, 'Gradients Separately');
      rbGradItems.value = (lastScope === 'gradient');
      rbGradItems.helpTip = 'Averages each selected gradient\nindividually into its own\nsolid color';

  // ==========================================
  // AVERAGING METHOD PANEL * MATH LOGIC
  // ==========================================
  var avgMethodPnl = wrapperL.add('panel', undefined, 'Averaging Method');
      avgMethodPnl.orientation = 'column';
      avgMethodPnl.alignChildren = ['fill', 'fill'];
      avgMethodPnl.margins = MARGINS;

  var lastAvgMethod = lastCfg.avgMethod || 'simple';

  var rbSimpleAvg = avgMethodPnl.add('radiobutton', undefined, 'Simple');
      rbSimpleAvg.value = (lastAvgMethod === 'simple');
      rbSimpleAvg.helpTip = 'Standard arithmetic average\nbased on color count';

  var rbSquareAvg;
  if (isRgb) {
    rbSquareAvg = avgMethodPnl.add('radiobutton', undefined, 'Square Root');
    rbSquareAvg.value = (lastAvgMethod === 'sqrt');
    rbSquareAvg.helpTip = 'Accounts light energy (Square Root).\nPrevents muddy transitions,\nkeeping colors vibrant';
  }

  var rbWeightedAvg = avgMethodPnl.add('radiobutton', undefined, 'Area-Weighted');
      rbWeightedAvg.value = (lastAvgMethod === 'weighted');
      rbWeightedAvg.helpTip = 'Accounts for object size\nand font dimensions.\nLarger elements have\na stronger impact';

  // ==========================================
  // ATTRIBUTES PANEL * APPEARANCE
  // ==========================================
  var appearPnl = wrapperL.add('panel', undefined, 'Target Attributes');
      appearPnl.orientation = 'column';
      appearPnl.alignChildren = ['fill', 'fill'];
      appearPnl.margins = MARGINS;

  var rbFillsOnly = appearPnl.add('radiobutton', undefined, 'Fills Only');
      rbFillsOnly.value = (lastCfg.appearance === 'fills');

  var rbStrokesOnly = appearPnl.add('radiobutton', undefined, 'Strokes Only');
      rbStrokesOnly.value = (lastCfg.appearance === 'strokes');

  var rbSepAttrMode = appearPnl.add('radiobutton', undefined, 'Fills & Strokes Separately');
      rbSepAttrMode.value = (lastCfg.appearance === 'separately' || rbGradItems.value || !lastCfg.appearance);

  var rbCombAttrMode = appearPnl.add('radiobutton', undefined, 'Fills & Strokes Combined');
      rbCombAttrMode.value = (lastCfg.appearance === 'combined');
      rbCombAttrMode.enabled = !rbGradItems.value;

  // ==========================================
  // SWATCHES PANEL
  // ==========================================
  var swatchPnl = wrapperL.add('panel', undefined, 'Swatches');
      swatchPnl.orientation = 'column';
      swatchPnl.alignChildren = ['fill', 'fill'];
      swatchPnl.margins = MARGINS;

  var chkAddSwatch = swatchPnl.add('checkbox', undefined, 'Add to Swatches');
      chkAddSwatch.value = lastCfg.isAddSwatch;

  var rbNormalCol = swatchPnl.add('radiobutton', undefined, 'Regular Colors');
      rbNormalCol.value = !lastCfg.isGlobalSw;
      rbNormalCol.enabled = chkAddSwatch.value;

  var rbGlobalCol = swatchPnl.add('radiobutton', undefined, 'Global Colors');
      rbGlobalCol.value = !rbNormalCol.value;
      rbGlobalCol.enabled = chkAddSwatch.value;

  // ==========================================
  // BUTTONS
  // ==========================================
  var wrapperR = win.add('group');
      wrapperR.orientation = 'column';
      wrapperR.alignment = ['fill', 'fill'];

  var btns = wrapperR.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];

  // Platform-specific button order
  var cancelBtn, okBtn;
  if (/mac/i.test($.os)) {
    cancelBtn = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    okBtn = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    okBtn = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancelBtn = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  var edgeBtn = btns.add('button', undefined, 'Toggle Edges', { name: 'edges' });

  cancelBtn.helpTip = 'Press Esc to Close';
  okBtn.helpTip = 'Press Enter to Run';

  var chkPreview = btns.add('checkbox', undefined, 'Preview',  { name: 'preview' });
      chkPreview.alignment = 'left';

  var aboutBtn = wrapperR.add('button', undefined, '?');
      aboutBtn.alignment = ['right', 'bottom'];
      aboutBtn.preferredSize = [25, 25];
      aboutBtn.helpTip = 'About';

  // ==========================================
  // EVENTS
  // ==========================================
  rbAllItems.onClick = rbPerGrp.onClick = function () {
    rbCombAttrMode.enabled = true;
    preview();
  };

  rbGradItems.onClick = function () {
    if (rbCombAttrMode.value) rbSepAttrMode.value = true;
    rbCombAttrMode.enabled = false;
    preview();
  };

  rbSimpleAvg.onClick = rbWeightedAvg.onClick = preview;
  if (rbSquareAvg) rbSquareAvg.onClick = preview;
  rbFillsOnly.onClick = rbStrokesOnly.onClick = rbSepAttrMode.onClick = rbCombAttrMode.onClick = preview;
  rbNormalCol.onClick = rbGlobalCol.onClick = preview;
  chkPreview.onClick = preview;

  chkAddSwatch.onClick = function () {
    rbNormalCol.enabled = this.value;
    rbGlobalCol.enabled = this.value;
    preview();
  };

  cancelBtn.onClick = win.close;

  okBtn.onClick = function() {
    var runCfg = {
      scope       : getScope(),
      avgMethod   : getAverageMethod(),
      appearance  : getAppearance(),
      isAddSwatch : chkAddSwatch.value,
      isGlobalSw  : rbGlobalCol.value,
      isAddGroup  : true,
    };
    saveSettings(cfgFile, runCfg);

    if (chkPreview.value && isUndo) {
      app.undo();
      isUndo = false;
    }

    process(items, grpData, runCfg);

    win.close();
  };

  edgeBtn.onClick = function () {
    app.executeMenuCommand('edge');
    edgeBtn.active = true;
    edgeBtn.active = false;
  };

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  };

  aboutBtn.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];
    
    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = [10, 15, 10, 8];

    var overviewText = overviewPnl.add('statictext', undefined,
        title.name + ' ' + title.version + '\n\n' +
        'Calculates the average color of selected vector paths, compounds, ' +
        'and text frames, then applies it as a solid fill or stroke.\n\n' +
        'Options:\n' +
        '\u2022 Entire Selection: Mixes all objects into one averaged color.\n' +
        '\u2022 Per Group: Averages colors within each group separately.\n' +
        '\u2022 Gradients Separately: Averages each selected gradient individually.\n' +
        '\u2022 Simple: Standard arithmetic average based on color count.\n' +
        '\u2022 Square Root: Accounts light energy. Prevents muddy transitions, keeping colors vibrant.\n' +
        '\u2022 Area-Weighted: Accounts for object size and font dimensions. Larger elements have a stronger impact.\n' +
        '\u2022 Target Attributes: Select whether to process only Fills, only Strokes, calculate them Separately, or Combine both into a single shared color.\n' +
        '\u2022 Swatches: Add averaged colors to the Swatches panel.', 
        { multiline: true });
    overviewText.preferredSize.width = 350;
    overviewText.preferredSize.height = parseInt(app.version) > 16 ? 345 : 235;

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
        var runCfg = {
          scope       : getScope(),
          avgMethod   : getAverageMethod(),
          appearance  : getAppearance(),
          isAddSwatch : chkAddSwatch.value,
          isGlobalSw  : rbGlobalCol.value,
          isAddGroup  : false
        };
        process(items, grpData, runCfg);
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
   * Get the current scope mode from the UI
   * @returns {string} The scope
   */
  function getScope() {
    if (rbPerGrp.value) return 'group';
    if (rbGradItems.value) return 'gradient';
    return 'selection';
  }

  /**
   * Get the current averaging math method from the UI
   * @returns {string} The average algorithm
   */
  function getAverageMethod() {
    if (rbSquareAvg && rbSquareAvg.value) return 'sqrt';
    if (rbWeightedAvg.value) return 'weighted';
    return 'simple';
  }

  /**
   * Get the appearance mode based on the selected radio button values
   * @returns {string} The appearance mode
   */
  function getAppearance() {
    if (rbFillsOnly.value) return 'fills';
    if (rbStrokesOnly.value) return 'strokes';
    if (rbSepAttrMode.value) return 'separately';
    if (rbCombAttrMode.value) return 'combined';
    return 'separately';
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

  win.center();
  win.show();
}

/**
 * Process the selection in the document,
 * apply color to fills, strokes, or gradients as specified
 * @param {Array} items - Pre-collected flat items list
 * @param {Array} grpData - Pre-collected grouped items list
 * @param {Object} config - Configuration settings object
 * @returns {void}
 */
function process(items, grpData, config) {
  // Process each group
  if (config.scope === 'group') {
    forEach(grpData, function (data) {
      recolorByAttribute(data.items, config);
    });
  } else {
    // Process selected items
    recolorByAttribute(items, config);
  }
}

/**
 * Recolor items based on a specified attribute (fill/stroke)
 * @param {Object|Array} items - The collection of Illustrator items
 * @param {Object} config - Configuration settings object
 * @returns {void}
 */
function recolorByAttribute(items, config) {
  if (!items.length) return;

  var appearMode = config.appearance || 'separately';
  if (config.scope === 'gradient' && appearMode === 'combined') {
    appearMode = 'separately';
  }

  switch (appearMode) {
    case 'fills':
      recolorItems(items, 'fillColor', config);
      break;
    case 'strokes':
      recolorItems(items, 'strokeColor', config);
      break;
    case 'separately':
    default:
      recolorItems(items, 'fillColor', config);
      recolorItems(items, 'strokeColor', config);
      break;
    case 'combined':
      recolorCombinedItems(items, config);
      break;
  }
}

/**
 * Get all top-level groups from a given collection
 * @param {Object|Array} coll - The collection of Illustrator items to filter
 * @returns {Array} groups - An array of group items found in the collection
 */
function getGroups(coll) {
  var groups = [];

  forEach(coll, function (e) {
    if (!e) return;
    if (/group/i.test(e.typename)) groups.push(e);
  });

  return groups;
}

/**
 * Get individual items from a collection
 * @param {Object|Array} coll - The collection of Illustrator items to filter
 * @param {boolean} isPerGroup - Include group content
 * @returns {Array} items - Output array of individual items
 */
function getItems(coll, isPerGroup) {
  var items = [];

  if (/textrange/i.test(coll.typename)) {
    return [coll];
  }

  forEach(coll, function(e) {
    if (e.pageItems && e.pageItems.length && !isPerGroup) {
      items = [].concat(items, getItems(e.pageItems));
    } else if (/compound/i.test(e.typename) && e.pathItems.length) {
      items.push(e);
    } else if (/pathitem|textframe/i.test(e.typename)) {
      items.push(e);
    }
  });

  return items;
}

/**
 * Apply an average color to all objects in a collection
 * @param {Object|Array} items - The collection of Illustrator items
 * @param {string} type - Color property to modify: 'fillColor' or 'strokeColor'
 * @param {Object} config - Configuration settings object
 */
function recolorItems(items, type, config) {
  var colorObjs = [];
  var avgColor;
  var isSqrtAvg = (config.avgMethod === 'sqrt');
  var isWeighted = (config.avgMethod === 'weighted');
  
  if (config.scope === 'gradient') {
    // Isolated gradient approach per object
    forEach(items, function(e) {
      if (/text/i.test(e.typename)) return;

      var isCompound = /compound/i.test(e.typename);
      var tgtObj = isCompound ? e.pathItems[0] : e;

      if (!/gradient/i.test(tgtObj[type].typename)) return;

      var singleObjColors = getColors([tgtObj], type, isWeighted);

      avgColor = averageColors(singleObjColors, isSqrtAvg);
      if (config.isAddSwatch) avgColor = addSwatch(avgColor, config.isGlobalSw, config.isAddGroup);

      applyColorTo(e, type, avgColor);
    });
  } else {
    // Standard solid/global average calculation across collection
    colorObjs = getColors(items, type, isWeighted);

    if (!colorObjs.length) return;

    avgColor = averageColors(colorObjs, isSqrtAvg);
    if (config.isAddSwatch) avgColor = addSwatch(avgColor, config.isGlobalSw, config.isAddGroup);

    forEach(items, function(e) {
      applyColorTo(e, type, avgColor);
    });
  }
}

/**
 * Apply an average fill and stroke colors to all objects in a collection
 * @param {Object|Array} items - The collection of Illustrator items
 * @param {Object} config - Configuration settings object
 */
function recolorCombinedItems(items, config) {
  var isSqrtAvg = (config.avgMethod === 'sqrt');
  var isWeighted = (config.avgMethod === 'weighted');

  var fillColors = getColors(items, 'fillColor', isWeighted);
  var strokeColors = getColors(items, 'strokeColor', isWeighted);
  var allColors = fillColors.concat(strokeColors);

  if (!allColors.length) return;

  var avgColor = averageColors(allColors, isSqrtAvg);
  if (config.isAddSwatch) avgColor = addSwatch(avgColor, config.isGlobalSw, config.isAddGroup);

  forEach(items, function(e) {
    applyColorTo(e, 'fillColor', avgColor);
    applyColorTo(e, 'strokeColor', avgColor);
  });
}

/**
 * Apply a target color to the fill or stroke of an Illustrator item
 * @param {Object} item - The Illustrator item
 * @param {string} type - Color property to modify: 'fillColor' or 'strokeColor'
 * @param {RGBColor|CMYKColor} avgColor - Color object with RGB or CMYK values
 */
function applyColorTo(item, type, avgColor) {
  if (/text/i.test(item.typename)) {
    var charAttr = /textframe/i.test(item.typename) ? item.textRange.characterAttributes : item.characterAttributes;
    var colorProp = charAttr[type];
    if (colorProp && !/nocolor/i.test(colorProp.typename)) {
      charAttr[type] = avgColor;
    }
  } else if (/compound/i.test(item.typename)) {
    forEach(item.pathItems, function(e) {
      if ((type === 'fillColor' && !e.filled) || (type === 'strokeColor' && !e.stroked)) {
        return;
      }
      e[type] = avgColor;
    });
  } else {
    if ((type === 'fillColor' && item.filled) || (type === 'strokeColor' && item.stroked)) {
      item[type] = avgColor;
    }
  }
}

/**
 * Get solid colors with weight coefficients
 * @param {Object|Array} items - The collection of Illustrator items
 * @param {string} type - Color property for the item
 * @param {boolean} isWeighted - If true, applies weighted recoloring
 * @returns {Array} results - Objects containing color and weight {color: Color, weight: Number}
 */
function getColors(items, type, isWeighted) {
  var results = [];

  forEach(items, function(e) {
    var weight = 1;

    // Handle TextFrame or TextRange objects
    if (/text/i.test(e.typename)) {
      var charLen = e.characters.length;
      for (var i = 0; i < charLen; i++) {
        var _char = e.characters[i];
        if (/[\s]|[\t]|[\x03]|[\r]/i.test(_char.contents)) continue;
        
        var charAttr = _char.characterAttributes;
        var colorProp = charAttr[type];

        if (!colorProp || /nocolor|pattern|gradient/i.test(colorProp.typename)) continue;

        // Calculate text element weight
        if (isWeighted) {
          var fontSize = charAttr.size ? charAttr.size : 12;
          weight = fontSize * fontSize;
        }

        results.push({ color: colorProp, weight: weight });
      }
    } else {
      // Handle other objects
      var isCompound = /compound/i.test(e.typename);
      var tgtObj = isCompound ? e.pathItems[0] : e;
      var hasFill = type === 'fillColor' && tgtObj.filled && !/pattern/i.test(tgtObj[type].typename);
      var hasStroke = type === 'strokeColor' && tgtObj.stroked && !/pattern/i.test(tgtObj[type].typename);

      if (!hasFill && !hasStroke) return;

      // Calculate path element weight
      if (isWeighted) weight = getArea(e);

      // Handle gradient colors
      if (/gradient/i.test(tgtObj[type].typename)) {
        var gColor = tgtObj[type].gradient;
        var gStops = gColor.gradientStops;
        var gLen = gStops.length;
        var stopWeight = weight / gLen;

        // Strict color count
        if (!isWeighted) {
          for (var k = 0; k < gLen; k++) {
            results.push({ color: gStops[k].color, weight: stopWeight });
          }
        } else {
          // Proportional to stop locations
          var coeffs = [];
          for (var c = 0; c < gLen; c++) coeffs[c] = 0;
  
          // Calculate impact of each gradient stop
          for (var j = 0; j < gLen - 1; j++) {
            var currStop = gStops[j];
            var nextStop = gStops[j + 1];
  
            var dist = nextStop.rampPoint - currStop.rampPoint;
            var midRatio = currStop.midPoint / 100;
  
            var leftImpact = dist * midRatio;
            var rightImpcat = dist * (1 - midRatio);
  
            coeffs[j] += leftImpact;
            coeffs[j + 1] += rightImpcat;
          }
  
          // Adjust for edge stops
          if (gStops[0].rampPoint > 0) {
            coeffs[0] += gStops[0].rampPoint;
          }
  
          if (gStops[gLen - 1].rampPoint < 100) {
            coeffs[gLen - 1] += (100 - gStops[gLen - 1].rampPoint);
          }
  
          // Push weighted gradient stops
          for (var m = 0; m < gLen; m++) {
            stopWeight = weight * (coeffs[m] / 100);
            if (stopWeight > 0) {
              results.push({ color: gStops[m].color, weight: stopWeight });
            }
          }
        }
      } else {
        // Handle solid colors
        results.push({ color: tgtObj[type], weight: weight });
      }
    }
  });

  return results;
}

/**
 * Average solid colors
 * @param {Array} colorObjs - Collection of {color: Color, weight: Number}
 * @param {boolean} isSqrt - If true, uses square-root averaging for RGB (improves perceptual accuracy)
 * @returns {Object} avgColor - Weighted average color in the document's color space
 */
function averageColors(colorObjs, isSqrt) {
  var isRgb = /rgb/i.test(app.activeDocument.documentColorSpace);
  var tWeight = 0;
  var cSum = {};
  var maxVal = isRgb ? 255 : 100;

  if (!colorObjs.length) {
    return isRgb ? new RGBColor() : new CMYKColor();
  }

  forEach(colorObjs, function(o) {
    var color = o.color;
    var weight = o.weight;

    if (/spot/i.test(color.typename)) {
      color = getSpotTint(color);
    } else if (/gray/i.test(color.typename)) {
      var values = isRgb ? gray2rgb(color.gray) : [0, 0, 0, color.gray];
      color = setColor(values, isRgb);
    }
    
    tWeight += weight;

    for (var key in color) {
      if (typeof color[key] === 'number') {
        var val = isRgb && isSqrt ? Math.pow(color[key], 2) : color[key];
        if (cSum[key]) {
          cSum[key] += val * weight;
        } else {
          cSum[key] = val * weight;
        }
      }
    }
  });

  var avgColor = isRgb ? new RGBColor() : new CMYKColor();

  for (var key in cSum) {
    var avgVal;

    if (isRgb && isSqrt) {
      avgVal = Math.floor(Math.sqrt(cSum[key] / tWeight));
    } else {
      avgVal = Math.floor(cSum[key] / tWeight);
    }

    avgColor[key] = clamp(avgVal, 0, maxVal);
  }

  return avgColor;
}

/**
 * Convert a Grayscale color to RGB
 * @param {number} value - The grayscale value to convert
 * @returns {Array} The RGB color representation of the grayscale value
 */
function gray2rgb(value) {
  return app.convertSampleColor(ImageColorSpace.GrayScale, [value], ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose);
}

/**
 * Calculate the tinted color of a spot color based on its tint percentage
 * @param {Object} color - Spot color
 * @returns {RGBColor|CMYKColor} The resulting tinted color in the document's color space
 */
function getSpotTint(color) {
  var isRgb = /rgb/i.test(app.activeDocument.documentColorSpace);
  var white = isRgb ? new RGBColor() : new CMYKColor();
  var t = clamp(color.tint, 0, 100) / 100;
  var spot = color.spot.color;
  var tintVal = [];

  if (isRgb) {
    white.red = white.green = white.blue = 255;
  }

  // Interpolate between white and spot color
  for (var key in spot) {
    if (typeof spot[key] === 'number') {
      tintVal.push(lerp(white[key], spot[key], t));
    }
  }

  return setColor(tintVal, isRgb);
}

/**
 * Create color from array of values
 * @param {Array} arr - Channels values
 * @param {boolean} isRgb - Is the RGB document mode
 * @returns {Object} color
 */
function setColor(arr, isRgb) {
  var color;

  if (isRgb) {
    color = new RGBColor();
    color.red = clamp(arr[0], 0, 255);
    color.green = clamp(arr[1], 0, 255);
    color.blue = clamp(arr[2], 0, 255);
  } else {
    color = new CMYKColor();
    color.cyan = clamp(arr[0], 0, 100);
    color.magenta = clamp(arr[1], 0, 100);
    color.yellow = clamp(arr[2], 0, 100);
    color.black = clamp(arr[3], 0, 100);
  }

  return color;
}

/**
 * Add a swatch to the active Illustrator document with a unique name
 * @param {RGBColor|CMYKColor} avgColor - Color object with RGB or CMYK values
 * @param {boolean} isGlobal - If true, add as a global swatch
 * @param {boolean} isAddGroup - If true, creates/moves swatch to the target group
 * @returns {Swatch} The newly created swatch
 */
function addSwatch(avgColor, isGlobal, isAddGroup) {
  var doc = app.activeDocument;
  var isRgb = /rgb/i.test(doc.documentColorSpace);

  // Generate base name based on color channels
  var baseName = isRgb
    ? "R=" + avgColor.red + " G=" + avgColor.green + " B=" + avgColor.blue
    : "C=" + avgColor.cyan + " M=" + avgColor.magenta + " Y=" + avgColor.yellow + " K=" + avgColor.black;

  // Resolve name collision using index suffixes
  var uniqueName = baseName;
  var idx = 1;
  while (true) {
    try {
      doc.swatches.getByName(uniqueName);
      uniqueName = uniqueName + ' v' + idx++;
    } catch (err) {
      break;
    }
  }

  var newSwatch;

  if (isGlobal) {
    try {
      newSwatch = doc.spots.getByName(uniqueName);
      newSwatch.color = avgColor;
    } catch (err) {
      newSwatch = doc.spots.add();
      newSwatch.colorType = ColorModel.PROCESS;
      newSwatch.color = avgColor;
    }
    newSwatch.name = uniqueName;
  } else {
    newSwatch = doc.swatches.add();
    newSwatch.color = avgColor;
    newSwatch.name = uniqueName;
  }

  if (isAddGroup) {
    var groupName = 'AVG Colors';
    var tgtGroup;
    try {
      tgtGroup = doc.swatchGroups.getByName(groupName);
    } catch (err) {
      tgtGroup = doc.swatchGroups.add();
      tgtGroup.name = groupName;
    }

    // Move to group based on color type
    if (isGlobal) {
      tgtGroup.addSpot(newSwatch);
    } else {
      tgtGroup.addSwatch(newSwatch);
    }
  }

  if (isGlobal) {
    var spotColor = new SpotColor();
    spotColor.spot = newSwatch;
    spotColor.tint = 100;
    return spotColor;
  } else {
    return newSwatch.color;
  }
}

/**
 * Perform linear interpolation between two values
 * @param {number} a - The start value
 * @param {number} b - The end value
 * @param {number} t - The interpolation factor (0-1)
 * @returns {number} The interpolated value
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
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
 * Calculate the absolute area of an Illustrator item
 * @param {Object} item - The Illustrator item
 * @returns {number} The absolute area of the item
 */
function getArea(item) {
  if (item.hasOwnProperty('area')) {
    return Math.abs(item.area);
  }

  if (/compound/i.test(item.typename)) {
    if (!item.pathItems || !item.pathItems.length) {
      return Math.abs(item.width * item.height);
    }

    // Sum areas of all sub-paths
    var tArea = 0;
    for (var i = 0; i < item.pathItems.length; i++) {
      var path = item.pathItems[i];
      if (path.hasOwnProperty('area')) tArea += path.area;
    }
    return Math.abs(tArea);
  }

  // Default fallback
  return Math.abs(item.width * item.height);
}

/**
 * Call a provided callback function once for each element in an array
 * @param {Object|Array} arr - The collection of items
 * @param {Function} fn - The callback function
 */
function forEach(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn(arr[i]);
  }
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