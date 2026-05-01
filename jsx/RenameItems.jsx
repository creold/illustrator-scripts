
/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options
                or simple rename one selected item / active layer / artboard
  Date: December, 2019
  Modification date: April, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  2.0 Refactored UI & engine. New features added
  1.8 Fixed: Compound path renaming with partial point selection, layer/artboard names find & replace
      Added: Support for empty default names such as <Group>, <Mesh>, etc.
  1.7 Added options to sort selected objects before numbering
  1.6.9 Added prefilled name if same for all objects. Minor improvements
  1.6.8 Removed input activation on Windows OS below CC v26.4
  1.6.7 Fixed text frame content as names for various options
  1.6.6 Added display of text frame content as name if it is empty
  1.6.5 Fixed placeholder insertion for CS6
  1.6.4 Updated object name reloading
  1.6.3 Added erase object names by empty input
  1.6.2 Fixed placeholder buttons, input activation in Windows OS
  1.6.1 Fixed UI for Illustrator 26.4.1 on PC
  1.6.0 Added renaming of the active artboard.
        Saving the name input field when switching options
  1.5.0 Added placeholders. New UI
  1.4.0 Renaming the parent layers of the selected items
  1.3.0 Renaming of the parent Symbol
  1.2.0 Recursive search in Sublayers names
  1.1.0 New option Find and replace string in all Layer names
  1.0.0 Initial version

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
        name: 'Rename Items',
        version: 'v2.0'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };

  var PH = {
        name: '{n}', // Put current name
        numUp: '{nu}', // Put ascending numeration
        numDown: '{nd}' // Put descending numeration
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script Error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script Error');
    return;
  }

  var doc = app.activeDocument;
  var docSel = (app.selection && app.selection.typename !== 'TextRange') ? app.selection : [];
  var isMultiSel = docSel.length > 1;
  var actLayer = doc.activeLayer;
  var uniqLayers = getUniqueLayers(docSel);
  var allLayers = getAllLayers(doc);
  var allArtboards = doc.artboards;
  var actAbIdx = allArtboards.getActiveArtboardIndex();
  var actArtboard = allArtboards[actAbIdx];

  // ==========================================
  //  DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];

  // ==========================================
  //  TARGET
  // ==========================================
  var pnlTarget = win.add('panel', undefined, 'Target');
      pnlTarget.orientation = 'column';
      pnlTarget.alignChildren = ['left', 'top'];
      pnlTarget.margins = [10, 15, 10, 10];

  if (docSel.length) {
    var rbSelection = pnlTarget.add('radiobutton');
        rbSelection.text = docSel.length + ' Selected Item' + (isMultiSel ? 's' : '');
        rbSelection.value = true;

    var rbLayer = pnlTarget.add('radiobutton');
        rbLayer.text = uniqLayers.length + ' Parent Layer' + (docSel.length > 1 ? 's' : '');

  } else {
    var rbLayer = pnlTarget.add('radiobutton', undefined, 'Layer: ' + actLayer.name, { truncate: 'end' });
        rbLayer.maximumSize.width = 250;
        rbLayer.value = true;

    var rbArtboard = pnlTarget.add('radiobutton', undefined, 'Artboard: ' + actArtboard.name, { truncate: 'end' });
        rbArtboard.maximumSize.width = 250;
  }

  // ==========================================
  //  MODE SWITCHER (TABS)
  // ==========================================
  var tabMode = win.add('tabbedpanel');
      tabMode.alignChildren = ['left', 'top'];
      tabMode.maximumSize.width = 300;

  // RENAME
  var tabRen = tabMode.add('tab', undefined, 'Full Rename');
      tabRen.alignChildren = ['fill', 'top'];
      tabRen.margins = [15, 15, 10, 10];

  var renWrapper = tabRen.add('group');
      renWrapper.orientation = 'column';
      renWrapper.alignChildren = ['fill', 'top']

  var pnlRen = renWrapper.add('group');
      pnlRen.orientation = 'column';
      pnlRen.alignChildren = ['fill', 'top']

  pnlRen.add('statictext', undefined, 'New Name:');
  var newNameInp = pnlRen.add('edittext', undefined, '');
  newNameInp.characters = 36;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) newNameInp.active = true;

  // OPTION FOR SYMBOLS
  var chkRenSymbol
  if (docSel.length === 1 && docSel[0].typename === 'SymbolItem') {
    chkRenSymbol = pnlRen.add('checkbox', undefined, 'Also Rename The Original Symbol');
    chkRenSymbol.helpTip = 'Changes the name of the Symbol in the Symbols panel.\nAll other instances will show the new name';
  }

  // PLACEHOLDERS (RENAME)
  var sortPnl, rbOrder, rbRows, rbCols, countInp;
  if (isMultiSel) {
    var grpPH = renWrapper.add('group');
        grpPH.alignChildren = ['left', 'center'];

    addPlaceholderBtn('Name', grpPH, newNameInp, PH.name, 'name placeholder');
    addPlaceholderBtn('Num \u2191', grpPH, newNameInp, PH.numUp, 'ascending numbering');
    addPlaceholderBtn('Num \u2193', grpPH, newNameInp, PH.numDown, 'descending numbering');

    // NUMERATION
    var grpNum = renWrapper.add('group');
        grpNum.alignChildren = ['left', 'center'];

    grpNum.add('statictext', undefined, 'Start Number At:');
    countInp = grpNum.add('edittext', undefined, 1);
    countInp.preferredSize.width = 63;

    countInp.onChange = function () {
      this.text = convertToInt(this.text, 1);
    };

    bindStepperKeys(countInp, 0, 1000000);

    // SORT OBJECTS
    sortPnl = renWrapper.add('panel', undefined, 'Sort Items Before Numbering');
    sortPnl.alignChildren = 'left';
    sortPnl.margins = [10, 15, 10, 10];

    rbOrder = sortPnl.add('radiobutton', undefined, 'By Order in Layers');
    rbOrder.value = true;
    rbRows = sortPnl.add('radiobutton', undefined, 'By Rows (Z-Pattern)');
    rbCols = sortPnl.add('radiobutton', undefined, 'By Columns (\u0418-Pattern)');
  }

  // TAB: FIND & REPLACE
  var tabRep = tabMode.add('tab', undefined, 'Find and Replace');
      tabRep.alignChildren = ['fill', 'top'];
      tabRep.margins = [15, 15, 10, 10];

  var repWrapper = tabRep.add('group');
      repWrapper.orientation = 'column';
      repWrapper.alignChildren = ['fill', 'top']

  var pnlRep = repWrapper.add('group');
      pnlRep.orientation = 'column';
      pnlRep.alignChildren = ['fill', 'top']

  pnlRep.add('statictext', undefined, 'Find:');
  var findInp = pnlRep.add('edittext', undefined, '');

  // FIND OPTIONS
  var grpFindOpt = pnlRep.add('group');

  var chkRegex = grpFindOpt.add('checkbox', undefined, 'RegEx');
  var chkCase = grpFindOpt.add('checkbox', undefined, 'Match Case');
  var chkWord = grpFindOpt.add('checkbox', undefined, 'Whole Word');

  pnlRep.add('statictext', undefined, 'Replace with:');
  var repWithInp = pnlRep.add('edittext', undefined, '');

  var grpRepPH = pnlRep.add('group');
      grpRepPH.alignChildren = ['fill', 'center'];

  addPlaceholderBtn('Num \u2191', grpRepPH, repWithInp, PH.numUp, 'ascending numbering');
  addPlaceholderBtn('Num \u2193', grpRepPH, repWithInp, PH.numDown, 'descending numbering');

  // NUMERATION
  var grpRepNum = pnlRep.add('group');
      grpRepNum.alignChildren = ['left', 'center'];

  grpRepNum.add('statictext', undefined, 'Start Number At:');
  var countRepInp = grpRepNum.add('edittext', undefined, '1');
      countRepInp.preferredSize.width = 63;

  countRepInp.onChange = function () {
    this.text = convertToInt(this.text, 1);
  };

  bindStepperKeys(countRepInp, 0, 1000000);

  // GLOBAL REPLACE OPTION
  var chkFindAll;
  if (rbArtboard || !docSel.length) {
    chkFindAll = pnlRep.add('checkbox', undefined, '');
    chkFindAll.text = 'Replace in All ' + allLayers.length + ' Layer' + (allLayers.length > 1 ? 's' : '');
  }

  // PREVIEW AREA
  var prvwText = pnlRep.add('statictext', undefined, 'Example: ', { truncate: 'end' });
      prvwText.maximumSize.width = 270;

  // ==========================================
  //  FOOTER
  // ==========================================
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var copyright = btns.add('statictext', undefined, 'Visit GitHub');

  // Platform-specific button order
  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok     = btns.add('button', undefined, 'OK',     { name: 'ok'     });
  } else {
    ok     = btns.add('button', undefined, 'OK',     { name: 'ok'     });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  // ==========================================
  //  UI LOGIC & EVENTS
  // ==========================================
  loadSettings(SETTINGS);
  updatePreview();

  var targetCache = { 
    selection: docSel.length ? getName(docSel[0]) : '',
    layer: actLayer.name,
    artboard: actArtboard.name,
  };
  var currTarget = getActiveTarget();

  newNameInp.text = getDefaultName();

  // SELECTION AND LAYER
  if (rbSelection) {
    rbSelection.onClick = function () {
      switchTarget('selection');
      if (sortPnl) sortPnl.enabled = true;
      if (chkRenSymbol) chkRenSymbol.enabled = true;
      updatePreview();
    };

    rbLayer.onClick = function () {
      switchTarget('layer');
      if (sortPnl) sortPnl.enabled = false;
      if (chkRenSymbol) chkRenSymbol.enabled = false;
      updatePreview();
    };

  } else if (rbArtboard) {
    // LAYER AND ARTBOARD
    rbLayer.onClick = function () {
      switchTarget('layer');
      chkFindAll.text = 'Replace in All ' + allLayers.length + ' Layer' + (allLayers.length > 1 ? 's' : '');
      updatePreview();
    };

    rbArtboard.onClick = function () {
      switchTarget('artboard');
      if (chkFindAll) chkFindAll.text = 'Replace in All Artboards';
      chkFindAll.text = 'Replace in All ' + allArtboards.length + ' Artboard' + (allArtboards.length > 1 ? 's' : '');
      updatePreview();
    };
  }

  tabMode.onChange = function () {
    switchMode(this.selection.text.toLowerCase());
    updatePreview();
  };

  findInp.onChange = updatePreview;
  repWithInp.onChange = updatePreview;
  countRepInp.onChange = updatePreview;

  chkRegex.onClick = updatePreview;
  chkCase.onClick = updatePreview;
  chkWord.onClick = updatePreview;

  setTextHandler(copyright, function () {
    openURL('https://github.com/creold')
  });

  cancel.onClick = win.close;

  ok.onClick = okClick;

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    // Mode
    var currTab = tabMode.selection;

    var options = {
      name: newNameInp.text,
      isSelection: rbSelection && rbSelection.value,
      isParent: rbSelection && rbLayer.value,
      isSymbol: chkRenSymbol && chkRenSymbol.value,
      isFind: /find/i.test(currTab.text),
      sortCols: rbCols && rbCols.value,
      sortRows: rbRows && rbRows.value,
      findStr: findInp.text,
      replaceStr: repWithInp.text,
      isRegex: chkRegex.value,
      caseSensitive: chkCase.value,
      wholeWord: chkWord.value,
      start: countInp ? convertToInt(countInp.text, 1) : 1,
      startRep: countRepInp ? convertToInt(countRepInp.text, 1) : 1,
      allContainers: chkFindAll && chkFindAll.value
    };

    // Scope
    var items = [];
    if (docSel.length) {
      items = rbSelection.value ? docSel : uniqLayers;
    } else if (rbLayer.value) {
      items = options.isFind && options.allContainers ? allLayers : [actLayer];
    } else if (rbArtboard && rbArtboard.value){
      items = options.isFind && options.allContainers ? allArtboards : [actArtboard];
    }

    if (!items.length) {
      alert('No objects to process', 'Script Error');
      return;
    }

    if (options.isFind) {
      if (options.findStr === '') {
        alert('Find field is empty\nPlease enter a value to search for', 'Script Error');
        return;
      }

      options.regex = buildRegExp(options);
      if (!options.regex) {
        alert('Invalid search pattern', 'Script Error');
        return;
      }

      processFindReplace(items, PH, options);

    } else {
      processRename(items, PH, options);
    }

    // Refresh the Layers panel hack for older versions
    if (CFG.aiVers < 24 && docSel.length && rbSelection.value) {
      try {
        var t = docSel[0].layer.pathItems.add();
        t.remove();
      } catch (err) {}
    }
  
    saveSettings(SETTINGS);
    win.close();
  }

  // ==========================================
  // UI & UTILITY HELPERS
  // ==========================================

  /**
   * Determine the active target based on the current selection, artboard, or layer
   * @returns {string} The active target: 'selection', 'artboard', or 'layer'.
   */
  function getActiveTarget() {
    if (rbSelection && rbSelection.value) return 'selection';
    if (rbArtboard && rbArtboard.value) return 'artboard';
    return 'layer';
  }

  /**
   * Switch the active target and update the input text based on cached value
   * @param {string} newTarget - The identifier of the new target to switch to
   * @returns {void}
   */
  function switchTarget(newTarget) {
    if (currTarget === newTarget) return;
    targetCache[currTarget] = newNameInp.text;
    currTarget = newTarget;
    newNameInp.text = targetCache[newTarget] || getDefaultName();
  }

  /**
   * Return a default name for the rename input based on the current selection
   * @returns {string} str - The default name
   */
  function getDefaultName() {
    if (docSel.typename === 'TextRange') return '';

    if (docSel.length === 0) {
      return (rbArtboard && rbArtboard.value) ? actArtboard.name : actLayer.name;
    }

    if (docSel.length === 1) {
      return (rbLayer && rbLayer.value) ? getTopLayer(docSel[0]).name : getName(docSel[0]);
    }

    if (rbSelection && rbSelection.value) {
      return isEqualNames(docSel) ? getName(docSel[0]) : '';
    }

    return '';
  }

  /**
   * Add a button with a placeholder name to the specified parent container
   * @param {string} name - The name of the button
   * @param {Panel|Group} parent - The parent container to which the button will be added
   * @param {EditText} input - The input field to which the placeholder value will be appended
   * @param {string} value - The value to be inserted into the input field when the button is clicked
   * @param {string} tip - The tooltip text for the button
   */
  function addPlaceholderBtn(name, parent, input, value, tip) {
    var btn = parent.add('button', undefined, name);
    btn.preferredSize.height = 20;
    if (tip) btn.helpTip = 'Click to insert ' + tip;

    btn.onClick = function () {
      var str = input.text;
      input.active = false;
      str += value;
      input.active = true;
      input.textselection = str;
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
      var num = parseFloat(this.text) || 0;
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        kd.preventDefault();
      }
    });
  }

  /**
   * Toggle UI mode between modes states
   * @param {string} mode - Mode to switch
   * @returns {void}
   */
  function switchMode(mode) {
    var min = [0, 0], max = [1000, 1000];
    var panels = {
      'rename': renWrapper,
      'replace': repWrapper
    };
    var activePanel = panels[mode];
    if (!activePanel) panels['rename'];

    for (var key in panels) {
      if (panels.hasOwnProperty(key)) {
        var panel = panels[key];
        var isActive = mode.indexOf(key) !== -1;
        panel.maximumSize = isActive ? max : min; // Change panels size
        panel.visible = isActive; // Toggle visibility for panels
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
   * Update the live example text in the Find and Replace tab
   * @returns {void}
   */
  function updatePreview() {
    if (!/find/i.test(tabMode.selection.text)) return;
    if (!prvwText) return;

    var findStr = findInp.text;
    if (findStr === '') return;

    var sampleItem = null;
    var total = 1;

    if (docSel.length) {
      sampleItem = rbSelection.value ? docSel[0] : uniqLayers[0];
      total = rbSelection.value ? docSel.length : uniqLayers.length;
    } else if (rbLayer.value) {
      sampleItem = actLayer;
    } else if (rbArtboard && rbArtboard.value) {
      sampleItem = actArtboard;
    }

    if (!sampleItem) return;

    var oldName = getName(sampleItem);

    var options = {
      findStr: findStr,
      isRegex: chkRegex.value,
      caseSensitive: chkCase.value,
      wholeWord: chkWord.value
    };

    var regex = buildRegExp(options);
    if (!regex) return;

    var startNum = parseInt(countRepInp.text) || 1;
    var padLen = String(startNum + total - 1).length;
    var numUp = padZero(startNum, padLen);
    var numDown = padZero(startNum + total - 1, padLen);

    var replacement = repWithInp.text
        .replace(new RegExp(escapeRegExp(PH.numUp), 'g'), numUp)
        .replace(new RegExp(escapeRegExp(PH.numDown), 'g'), numDown);

    var newName = oldName.replace(regex, replacement);
    prvwText.text = 'Example: ' + newName;
  }

  // ==========================================
  // SETTINGS & DATA
  // ==========================================

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
    data.tab = /find/i.test(tabMode.selection.text) ? 1 : 0;
    if (rbSelection) data.selection = rbSelection.value;
    if (rbArtboard) data.artboard = rbArtboard.value;
    if (countInp) data.number = countInp.text;
    if (sortPnl) data.sort = rbOrder.value ? 0 : (rbRows.value ? 1 : 2);
    data.find = findInp.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    data.replacement = repWithInp.text;
    data.numberRep = countRepInp.text;
    data.isRegex = chkRegex.value;
    data.caseSensitive = chkCase.value;
    data.wholeWord = chkWord.value;
    if (chkFindAll) data.all = chkFindAll.value;

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
      try { var data = new Function('return (' + json + ')')(); }
      catch (err) { return; }
      f.close();

      if (typeof data != 'undefined') {
        win.location = [
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];

        tabMode.selection = isNaN(data.tab) ? 0 : (parseInt(data.tab) || 0);

        if (rbSelection && data.selection) {
          data.selection === 'true' ? rbSelection.value = true : rbLayer.value = true;
          if (sortPnl) sortPnl.enabled = rbSelection.value;
        }

        if (rbArtboard && data.artboard) {
          data.artboard === 'true' ? rbArtboard.value = true : rbLayer.value = true;
          if (rbArtboard.value) {
            chkFindAll.text = 'Replace in All ' + allArtboards.length + ' Artboard' + (allArtboards.length > 1 ? 's' : '');
          }
        }

        if (countInp) countInp.text = parseInt(data.number) || 1;
        if (sortPnl) sortPnl.children[parseInt(data.sort) || 0].value = true;

        findInp.text = data.find || '';
        repWithInp.text = data.replacement || '';
        countRepInp.text = parseInt(data.numberRep) || 1;

        chkRegex.value = data.isRegex === 'true';
        chkCase.value = data.caseSensitive === 'true';
        chkWord.value = data.wholeWord === 'true';

        if (chkFindAll && data.all) {
          chkFindAll.value = data.all === 'true';
        }
      }
    } catch (err) {
      return;
    }
  }

  win.onShow = function () {
    switchMode(tabMode.selection.text.toLowerCase());
  };

  win.show();
}

/**
 * Rename the items within a collection based on a specified pattern
 * @param {Array} items - The collection of items to process
 * @param {Object} ph - Placeholder object
 * @param {Object} options - Configuration options
 */
function processRename(items, ph, options) {
  if (!items || !items.length) return;

  var tempItems = [].concat(items);
  if (options.isSelection && tempItems.length > 1) {
    if (options.sortRows) tempItems = sortByPattern(tempItems, { pattern: 'rows', useCenter: true });
    else if (options.sortCols) tempItems = sortByPattern(tempItems, { pattern: 'columns', useCenter: true });
  }

  // Regex patterns for placeholders
  var regexUp = new RegExp(escapeRegExp(ph.numUp), 'g');
  var regexDown = new RegExp(escapeRegExp(ph.numDown), 'g');
  var regexName = new RegExp(escapeRegExp(ph.name), 'g');

  var startNum = parseInt(options.start) || 1;
  var total = tempItems.length;
  var padLen = String(startNum + total - 1).length;

  for (var i = 0; i < total; i++) {
    var item = tempItems[i];
    var targets = [];

    // Determine targets based on options
    if (options.isParent) {
      targets.push(getTopLayer(item));
    } else if (options.isSymbol && item.typename === 'SymbolItem') {
      targets.push(item, item.symbol); // Include both instance and its symbol
    } else {
      targets.push(getCompound(item) || item);
    }

    var oldName = getName(targets[0]) || '';

    // Pad numbers with leading zeros
    var numUp = padZero(startNum + i, padLen);
    var numDown = padZero((startNum + total - 1) - i, padLen);

    var newName = options.name
      .replace(regexName, oldName)
      .replace(regexUp, numUp)
      .replace(regexDown, numDown);

    for (var j = 0; j < targets.length; j++) {
      if (targets[j].name !== newName) targets[j].name = newName;
    }
  }
}

/**
 * Replace all occurrences of a pattern in the names of items within a collection
 * @param {Array} items - The collection of items to process
 * @param {Object} ph - Placeholder object
 * @param {Object} options - Configuration options for find/replace
 */
function processFindReplace(items, ph, options) {
  if (!items || !items.length) return;

  // Regex patterns for placeholders
  var regexUp = new RegExp(escapeRegExp(ph.numUp), 'g');
  var regexDown = new RegExp(escapeRegExp(ph.numDown), 'g');

  var startNum = parseInt(options.startRep) || 1;
  var total = items.length;
  var padLen = String(startNum + total - 1).length;

  for (var i = 0; i < total; i++) {
    // Pad numbers with leading zeros
    var numUp = padZero(startNum + i, padLen);
    var numDown = padZero((startNum + total - 1) - i, padLen);

    // Replace placeholders in the base string
    var currReplaceStr = options.replaceStr
        .replace(regexUp, numUp)
        .replace(regexDown, numDown);

    replaceName(items[i], options.regex, currReplaceStr);
  }
}

/**
 * Build a regular expression from a pattern and options
 * @param {Object} options - Configuration for the regex
 * @returns {RegExp|null} The constructed RegExp, or null if invalid
 */
function buildRegExp(options) {
  if (options.findStr === '') return null;

  var source = options.isRegex ? options.findStr : escapeRegExp(options.findStr);

  if (options.wholeWord) {
    source = options.isRegex
      ? '\\b(?:' + source + ')\\b'
      : '\\b' + source + '\\b';
  }

  var flags = options.caseSensitive ? 'g' : 'gi';

  try {
    return new RegExp(source, flags);
  } catch (err) {
    return null;
  }
}

/**
 * Replace all occurrences of a pattern in the name of item
 * @param {Object} item - The item to process
 * @param {RegExp} regex - The regex pattern to match in the item's name
 * @param {string} replacement - The string to replace the matched pattern
 */
function replaceName(item, regex, replacement) {
  if (!item || !regex) return;

  var currName = getName(item);
  if (!currName || isEmpty(currName)) return;

  var newName = currName.replace(regex, replacement);
  if (newName !== currName) item.name = newName;
}

/**
* Get the name of an item, considering its type
* @param {Object} item - The item for which to get the name
* @returns {string} str - The name of the item
*/
function getName(item) {
  if (!item || !item.typename) return item.name || '';

  // If part of a compound path, set item
  var compound = getCompound(item);
  if (compound) item = compound;

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

  // Default system names for unnamed objects
  switch (item.typename) {
    case 'PathItem': return '<Path>';
    case 'CompoundPathItem': return '<Compound Path>';
    case 'GraphItem': return '<Graph>';
    case 'GroupItem': return item.clipped ? '<Clipping Group>' : '<Group>';
    case 'MeshItem': return '<Mesh>';
    case 'NonNativeItem': return '<Non-Native Art>';
    case 'RasterItem': return '<Image>';
    case 'SymbolItem': return '<Symbol>';
    case 'TextFrame': return '<Text>';
    default:
      if (isLegacyText(item)) return '<Legacy Text>';
      return '<' + item.typename + '>';
  }
}

/**
 * Check if an item is considered a legacy text item
 * @param {Object} item - The item to check
 * @return {boolean} Returns true if the item is a legacy text item, false otherwise
 */
function isLegacyText(item) {
  return item.typename === 'LegacyTextItem' || 
        (item.typename === 'TextFrame' && (!item.hasOwnProperty('contents') ||
        item.hasOwnProperty('converted')));
}

/**
 * Find top-level layer parent
 * @param {Object} item - The starting layer item to check
 * @returns {Layer} The topmost layer of the item
 */
function getTopLayer(item) {
  if (!item) return item;
  try {
    if (!item.parent) return item;
    if (item.parent.typename === 'Document') return item;
    else return getTopLayer(item.parent);
  } catch (err) {}
  return item;
}

/**
 * Retrieve unique top layers from a collection of selected items
 * @param {Array} coll - The collection of selected items
 * @returns {Array} An array of unique top layers
 */
function getUniqueLayers(coll) {
  if (!coll.length) return [];

  // Start from the end of the collection and move backwards
  var uniqLays = [getTopLayer(coll[coll.length - 1])];

  for (var i = coll.length - 2; i >= 0; i--) {
    var curLayer = getTopLayer(coll[i]);
    if (curLayer !== uniqLays[uniqLays.length - 1]) {
      uniqLays.push(curLayer);
    }
  }

  return uniqLays.reverse();
}

/**
 * Retrieve the compound path parent of an item
 * @param {Object} item - The item to check for a compound path parent
 * @returns {CompoundPathItem|null} The compound path item if found, otherwise null
 */
function getCompound(item) {
  if (!item || !item.typename) return null;

  // Skip top-level objects: layers, artboards, document
  if (item.typename === 'Layer' || item.typename === 'Artboard' || item.typename === 'Document') {
    return null;
  }

  while (item && item.parent) {
    if (item.parent.typename === 'CompoundPathItem') return item.parent;
    item = item.parent;
  }

  return null;
}

/**
 * Retrieve all layers from a container (e.g., document or layer)
 * @param {Layer|Document} container - The container object
 * @returns {Layer[]} An array of all layers found in the container and its sub-layers
 */
function getAllLayers(container) {
  var res = [];
  for (var i = 0, len = container.layers.length; i < len; i++) {
    var lay = container.layers[i];
    res.push(lay);
    if (lay.layers && lay.layers.length) {
      res = res.concat(getAllLayers(lay));
    }
  }
  return res;
}

/**
 * Sort an array of items by their geometric bounds in rows or columns
 * @param {Array} items - Array of items to sort
 * @param {Object} [options] - Sorting options
 * @returns {Array} Sorted array of PageItem objects
 */
function sortByPattern(items, options) {
  options = options || {};
  var pattern = options.pattern || 'rows';
  var tolerance = options.tolerance || autoTolerance(items, pattern === 'rows' ? 'y' : 'x');
  var useCenter = options.useCenter !== false;

  var arr = [];
  for (var i = 0; i < items.length; i++) {
    var gb = items[i].geometricBounds;
    arr.push({
      item: items[i],
      x: useCenter ? (gb[0] + gb[2]) / 2 : gb[0], // Left or center X
      y: useCenter ? (gb[1] + gb[3]) / 2 : gb[1] // Top or center Y
    });
  }

  // Rows: Y > X
  if (pattern === 'rows') {
    arr.sort(function (a, b) {
      if (Math.abs(b.y - a.y) <= tolerance) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });
  }
  // Columns: X > Y
  else {
    arr.sort(function (a, b) {
      if (Math.abs(a.x - b.x) <= tolerance) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });
  }

  var res = [];
  for (var i = 0; i < arr.length; i++) res.push(arr[i].item);
  return res;
}

/**
 * Calculate an automatic tolerance for sorting based on the median size of items
 * @param {Array} items - Array of items
 * @param {string} axis - Axis to calculate tolerance for ('x' or 'y')
 * @returns {number} Half the median width/height of the items
 */
function autoTolerance(items, axis) {
  if (items.length < 2) return 0;

  var res = [];

  for (var i = 0; i < items.length; i++) {
    var bnds = items[i].geometricBounds;
    res.push(axis === 'x'
      ? Math.abs(bnds[2] - bnds[0]) // Width
      : Math.abs(bnds[1] - bnds[3]) // Height
    );
  }

  res.sort(function (a, b) {
    return a - b;
  });

  return res[Math.floor(res.length / 2)] / 2;
}

/**
 * Check if all names in the collection are equal
 * @param {Array} coll - The collection of items to check
 * @returns {boolean} True if all names are equal, false otherwise
 */
function isEqualNames(coll) {
  if (coll.length === 0) return true; // Handle empty collection

  var str = getName(coll[0]);
  for (var i = 1, len = coll.length; i < len; i++) {
    if (getName(coll[i]) !== str) return false;
  }
  return true;
}

/**
 * Check if a string is empty or contains only whitespace characters
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return !str || str.replace(/\s/g, '').length === 0;
}

/**
 * Convert a string to an integer
 * @param {string} str - The string to convert
 * @param {string|number} def - The default value to return if conversion fails
 * @return {number} The converted integer or the default value if conversion fails
 */
function convertToInt(str, def) {
  str = str.replace(/[^\d]/g, '');
  return (isNaN(str) || isEmpty(str)) ? parseInt(def, 10) : parseInt(str, 10);
}

/**
 * Pad a number with leading zeros to ensure it reaches a specified length
 * @param {number|string} num - The number to pad
 * @param {number} len - The desired length of the resulting string
 * @returns {string} num - The padded number as a string
 */
function padZero(num, len) {
  num = num.toString();
  while (num.length < len) num = '0' + num;
  return num;
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

/**
 * Escape special characters in a string for use in a regular expression
 * This is useful when dynamically creating regex patterns from user input or variable strings
 * @param {string} str - The input string to escape
 * @returns {string} The escaped string, safe for use in a RegExp constructor
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

try {
  main();
} catch (err) {}