/*
  BatchRenamer.jsx for Adobe Illustrator
  Description: Script for batch renaming artboards, layers & selected items manually or by placeholders.
  Find & Replace supports regular expressions.
  Date: January, 2022
  Modification date: September, 2025

  Original idea by Qwertyfly:
  https://community.adobe.com/t5/illustrator-discussions/is-there-a-way-to-batch-rename-artboards-in-illustrator-cc/m-p/7243667#M153618

  Modification by Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Release notes:
  1.6 The placeholders have been replaced with a selectable dropdown list.
      Prefixes and suffixes are set by index range, and checkboxes have been removed.
      Added case conversion modes.
      Minor improvements
  1.5 Added custom range for Find and Replace. Minor improvements
  1.4 Added import names from txt and export names into txt from active tab
  1.3.3 Added display symbol object names
  1.3.2 Fixed rename bug
  1.3.1 Added display of text frame content as name if it is empty
  1.3 Info about number of artboards, layers, selected document objects added to {nu}, {nd} placeholder text. Minor improvements
  1.2.4a Fixed problem launching through LAScripts extension
  1.2.4 Added {f} placeholder to insert a filename
  1.2.3 Added new units API for CC 2023 v27.1.1
  1.2.2 Added size correction in large canvas mode
  1.2.1 Added custom RGB color (idxColor) for artboard indexes
  1.2 Added more units (yards, meters, etc.) support if the document is saved
  1.1.1 Fixed load user settings
  1.1 Minor improvements
  1.0 Fixed variables, scrollbar in original script by Qwertyfly
      Added tabs for batch rename Artboards, Layers, Paths
      Added 'Select all' checkboxes, 'Find and Replace' algorithm
      Addedd save and load user settings
      Added placeholders for batch rename 
  
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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// MAIN DIALOG

function main() {
  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var SCRIPT = {
        name:     'Batch Renamer',
        version:  'v1.6'
      };

  // CONFIG
  var CFG = {
        rows:         7, // Enter amount of visible rows
        precision:    2, // Decimal places. Rounding object width and height
        decimal:      ',', // Decimal separator for width and height
        isShowIndex:  true, // Show (true) or not (false) temporary artboard indexes
        indexColor:   [255, 0, 0], // Color for temporary artboard indexes
        tmpLayer:     'ARTBOARD_INDEX', // Layer for temporary artboard indexes
        isFind:       false, // Default Find and Replace state
        sf:           app.activeDocument.scaleFactor ? app.activeDocument.scaleFactor : 1, // Scale factor for Large Canvas mode
        isUndo:       false,
        uiOpacity:    .97, // UI window opacity. Range 0-1
      };

  // Calculate height of list of names
  CFG.listHeight = CFG.rows * 32;

  var doc = app.activeDocument;
  var absLength = doc.artboards.length;
  var lyrsLength = doc.layers.length;
  var selLength = app.selection.length;

  // PLACEHOLDERS
  var PH = {
        color:    '{c}',
        date:     '{d}',
        time:     '{t}',
        file:     '{f}',
        height:   '{h}',
        dateDMY:  '{dmy}',
        dateMDY:  '{mdy}',
        dateYMD:  '{ymd}',
        numDown:  '{nd:0}',
        numUp:    '{nu:0}',
        units:    '{u}',
        width:    '{w}',
      };

  // PLACEHOLDERS MAP
  var PH_MAP = [
        { placeholder: '', description: '@', isAllTab: true }, // Dummy top item
        { placeholder: PH.width, description: PH.width + ' - Width', isAllTab: false }, // Not used for layers tab
        { placeholder: PH.height, description: PH.height + ' - Height', isAllTab: false }, // Not used for layers tab
        { placeholder: PH.units, description: PH.units + ' - Ruler Units', isAllTab: false }, // Not used for layers tab
        { placeholder: PH.numUp.replace(/\d+/g, absLength), description: PH.numUp + ' - Auto-Number Up', isAllTab: true },
        { placeholder: PH.numDown.replace(/\d+/g, absLength), description: PH.numDown + ' - Auto-Number Down', isAllTab: true },
        { placeholder: PH.color, description: PH.color + ' - Color Space', isAllTab: true },
        { placeholder: PH.dateDMY, description: PH.dateDMY + ' - Date ' + getCurrentDate(PH.dateDMY), isAllTab: true },
        { placeholder: PH.dateMDY, description: PH.dateMDY + ' - Date ' + getCurrentDate(PH.dateMDY), isAllTab: true },
        { placeholder: PH.dateYMD, description: PH.dateYMD + ' - Date ' + getCurrentDate(PH.dateYMD), isAllTab: true },
        { placeholder: PH.time, description: PH.time + ' - Time HH:MM', isAllTab: true },
        { placeholder: PH.file, description: PH.file + ' - File Name', isAllTab: true },
      ];

  var MSG = {
        all:           'All Names',
        cancel:        'Cancel',
        caseTitle:     'Name Case Conversion',
        copyright:     'Visit Github',
        empty:         'No Objects Are Selected',
        enable:        'Enable',
        exportBtn:     'Export',
        exportTitle:   'Choose a folder to export TXT file...',
        exportHint:    'Export names from active tab\ninto a TXT file',
        exportSuccess: 'Your file @ has been saved successfully',
        find:          'Find:',
        findHint:      'Tip: Find Supports RegExp. Example: ^.*$ - Find Full Name',
        findTitle:     'Find and Replace',
        importBtn:     'Import',
        importTitle:   'Choose TXT file...',
        importHint:    'Import names to active tab\nfrom a TXT file. Start each name\non a new line',
        importSuccess: 'Your file * has been imported successfully into the active tab',
        nameAb:        'Artboard Names',
        nameLyr:       'Layer Names',
        namePath:      'Object Names',
        ok:            'OK',
        prefix:        'Prefix:',
        previewBtn:    'Preview',
        previewOn:     'PREVIEW ON',
        range:         'Range:',
        rangeEg:       'E.g. "1, 3-5, 9" > 1, 3, 4, 5, 9',
        replace:       'Replace With:',
        suffix:        'Suffix:',
        tabAb:         'ARTBOARDS',
        tabLyr:        'LAYERS',
        tabPath:       'OBJECTS',
      };

  var SETTINGS = {
        name:   SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  var abs = initObject(CFG.isFind, 'artboards'); // Artboards
  var lyrs = initObject(CFG.isFind, 'layers'); // Layers
  var paths = initObject(CFG.isFind, 'selection'); // Selected objects

  var absPH = initPlaceholders('artboards', PH); // Artboard placeholders
  var lyrsPH = initPlaceholders('layers', PH); // Layers placeholders
  var pathsPH = initPlaceholders('paths', PH); // Paths placeholders

  var rowItem = []; // List rows

  // Init prefix, index, original name and suffix
  abs.state = initData(doc.artboards);
  lyrs.state = initData(doc.layers);
  paths.state = initData(app.selection);

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.uiOpacity;

  // LEFT WRAPPER FOR MAIN CONTROLS
  var lWrapper = win.add('group');
      lWrapper.orientation = 'column';
      lWrapper.alignChildren = ['fill', 'top'];

  // TABS
  var tabPnl = lWrapper.add('tabbedpanel');
      tabPnl.alignChildren = ['fill', 'top'];

  var absTab = tabPnl.add('tab', undefined, MSG.tabAb); // Artboard
  var lyrsTab = tabPnl.add('tab', undefined, MSG.tabLyr); // Layer
  var pathsTab = tabPnl.add('tab', undefined, MSG.tabPath);  // Path

  absTab.margins = lyrsTab.margins = pathsTab.margins = [10, 20, 0, 5];
  tabPnl.selection = 0;

  // FILL TABS CONTENT
  var absTabData = addTabContent(absTab, abs, MSG, MSG.nameAb, PH_MAP);
  var lyrsTabData = addTabContent(lyrsTab, lyrs, MSG, MSG.nameLyr, PH_MAP);
  var pathsTabData = addTabContent(pathsTab, paths, MSG, MSG.namePath, PH_MAP);

  // RIGHT WRAPPER FOR BUTTONS AND INFO
  var rWrapper = win.add('group');
      rWrapper.orientation = 'column';
      rWrapper.spacing = 20;
      rWrapper.alignChildren = ['fill', 'fill'];

  var btns1 = rWrapper.add('group');
      btns1.orientation = 'column';
      btns1.alignment = ['fill', 'top'];

  var ok = btns1.add('button', undefined, MSG.ok, { name: 'ok' });
  var cancel = btns1.add('button', undefined, MSG.cancel, { name: 'cancel' });

  var btns2 = rWrapper.add('group');
      btns2.orientation = 'column';
      btns2.alignment = ['fill', 'top'];

  var previewBtn = btns2.add('button', undefined, MSG.previewBtn);
  var importBtn = btns2.add('button', undefined, MSG.importBtn);
      importBtn.helpTip = MSG.importHint;
  var exportBtn = btns2.add('button', undefined, MSG.exportBtn);
      exportBtn.helpTip = MSG.exportHint;

  var copyright = rWrapper.add('statictext', undefined, MSG.copyright);
      copyright.justify = 'center';
      copyright.alignment = ['fill', 'bottom'];

  // DIALOG EVENTS
  loadSettings(SETTINGS);

  cancel.onClick = win.close;
  ok.onClick = okClick;

  // DIALOG LOCAL FUNCTIONS
  win.onShow = function () {
    if (CFG.isShowIndex) {
      showArboardIndex(CFG.tmpLayer, CFG.indexColor);
    }
    adjustScrollMax(absTabData, 20);
    adjustScrollMax(lyrsTabData, 20);
    adjustScrollMax(pathsTabData, 20);
  }

  win.onClose = function () {
    try {
      if (CFG.isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  /**
   * Open a dialog to select a text file, parses its contents, and updates the selected objects
   */
  importBtn.onClick = function() {
    // Determine the file type filter based on the operating system
    var type = ($.os.match('Windows')) ? '*.txt;' : function(f) {
      return f instanceof Folder || (f instanceof File && f.name.match(/(.txt)$/));
    };

    var f = File.openDialog(MSG.importTitle, type, false); // Open a dialog to select a file
    var txtArr = parseFromText(f); // Parse the selected file into an array of text lines

    // Determine the object to update based on the current selection
    var obj = tabPnl.selection.text.match(MSG.tabAb) ? abs : (tabPnl.selection.text.match(MSG.tabLyr) ? lyrs : paths);
    var min = Math.min(txtArr.length, obj.names.length);

    // Iterate over the text array and updates the object names
    for (var i = 0; i < min; i++) {
      var str = txtArr[i];
      if (isEmpty(str)) continue;
      obj.names[i].text = str;
      obj.state[i].customName = str;
    }

    alert( MSG.importSuccess.replace(/\*/, decodeURIComponent(f.name)) );
  }

  /**
   * Prompts the user to select a folder, processes the selected items, and exports the result as a text file
   */
  exportBtn.onClick = function() {
    var path = Folder.selectDialog(MSG.exportTitle);
    if (path == null) return;

    var type = tabPnl.selection.text.replace(/\s+.+/g, '').toLowerCase();
    var f = new File(path + '/' + doc.name.replace(/\.[^\.]+$/, '') + '_' + type + '.txt');

    var txtArr = [];
    if (tabPnl.selection.text.match(MSG.tabAb)) {
      txtArr = generateNames(doc.artboards, CFG, PH, abs, absPH);
    } else if (tabPnl.selection.text.match(MSG.tabLyr)) {
      txtArr = generateNames(doc.layers, CFG, PH, lyrs, lyrsPH);
    } else {
      txtArr = generateNames(app.selection, CFG, PH, paths, pathsPH);
    }

    if (txtArr.length) {
      writeToText(txtArr.join('\n'), f);
      alert( MSG.exportSuccess.replace(/\@/, decodeURIComponent(f.name)) );
    }
  }

  /**
   * Update the preview title text and triggers preview names for artboards, layers, and selected items
   */
  previewBtn.onClick = function () {
    this.active = true;
    this.active = false;

    // Update the preview title text for different tabs
    absTabData.prvwTitle.text = lyrsTabData.prvwTitle.text = MSG.previewOn;
    // Check if paths tab has preview title and update it
    if (pathsTabData.hasOwnProperty('prvwTitle')) {
      pathsTabData.prvwTitle.text = MSG.previewOn;
    }

    // Trigger preview names for artboards, layers, and selected paths
    previewNames(doc.artboards, CFG, PH, abs, absPH);
    previewNames(doc.layers, CFG, PH, lyrs, lyrsPH);
    previewNames(app.selection, CFG, PH, paths, pathsPH);

    try {
      if (CFG.isUndo) {
        doc.swatches.add().remove();
        app.undo();
      }
      renameObjects(doc.artboards, CFG, PH, abs, absPH);
      renameObjects(doc.layers, CFG, PH, lyrs, lyrsPH);
      renameObjects(app.selection, CFG, PH, paths, pathsPH);
      var tempPath = doc.layers[0].pathItems.rectangle(0, 0, 1, 1);
      tempPath.stroked = false;
      tempPath.filled = false;
      tempPath.hidden = true;
      tempPath.hidden = false;
      app.redraw();
      CFG.isUndo = true;
    } catch (err) {}
  }

  /**
   * Add content to a specified tab in the UI
   * @param {Object} tab - The tab object to which content will be added
   * @param {Object} data - The data object containing state information
   * @param {Object} txt - The text object containing UI text elements
   * @param {string} name - The name of the tab
   * @param {Array} phMap - The placeholder map for dropdown lists
   * @returns {Object} An object containing references to UI elements
   */
  function addTabContent(tab, data, txt, name, phMap) {
    // Paths tab when nothing is selected
    if (tab.text === txt.tabPath && !selLength) {
      var pathList = tab.add('group');
          pathList.alignment = 'center';
      pathList.add('statictext', undefined, txt.empty);

      return {};
    }

    var tabList = tab.add('group');
        tabList.orientation = 'column';

    // TITLE
    var header = tabList.add('group');
        header.alignment = 'left';

    header.add('statictext', undefined, name);

    var prvwTitle = header.add('statictext', undefined, '');
        prvwTitle.preferredSize.width = 100;

    // ITEM ROWS
    var scrollWin = tabList.add('group');
        scrollWin.alignChildren = 'fill';
    var pageListPanel = scrollWin.add('panel');
        pageListPanel.alignChildren = 'left';

    // GENERATE LIST
    if (data.state.length <= CFG.rows) { // Without scroll
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        rowItem = pageListPanel.add('group');
        // rowItem.margins = [3, 0, 0, 0];
        addNewRow(tab, i, rowItem, data);
      }
    } else { // With scroll
      pageListPanel.maximumSize.height = CFG.listHeight;
      var smallList = pageListPanel.add('group');
          smallList.orientation = 'column';
          smallList.alignment = 'left';
          smallList.maximumSize.height = data.state.length * 200;

      var scroll = scrollWin.add('scrollbar');
          scroll.stepdelta = 30;
          scroll.preferredSize.width = 12;
          scroll.maximumSize.height = pageListPanel.maximumSize.height;
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        rowItem = smallList.add('group');
        addNewRow(tab, i, rowItem, data);
      }

      scroll.onChanging = function() {
        smallList.location.y = -1 * this.value;
      }
    }

    // PLACEHOLDER DROPDOWN
    var phDescrList = [];
    var phKeyList = [];
    for (var i = 0; i < phMap.length; i++) {
      if (tab.text === txt.tabLyr && !phMap[i].isAllTab) continue;
      phDescrList.push(phMap[i].description);
      phKeyList.push(phMap[i].placeholder);
    }

    // PREFIX AND SUFFIX
    var extra = tab.add('group');
        extra.orientation = 'column';
        extra.alignChildren = ['fill', 'top'];
        extra.margins = [5, 20, 5, 0];

    var preSuffGrp = extra.add('group');
        preSuffGrp.orientation = 'column';
        preSuffGrp.alignChildren = ['fill', 'top'];
        preSuffGrp.margins = [0, 0, 0, 10];

    var prefixGrp = preSuffGrp.add('group');
        prefixGrp.orientation = 'row';
        prefixGrp.alignChildren = ['fill', 'center'];

    prefixGrp.add('statictext', undefined, txt.prefix);
    var prefixInp = prefixGrp.add('edittext', undefined, '');
        prefixInp.preferredSize.width = 139;

    var prefixPhDdl = prefixGrp.add('dropdownlist', undefined, phDescrList);
        prefixPhDdl.maximumSize.width = 40;
        prefixPhDdl.selection = 0;

    prefixGrp.add('statictext', undefined, txt.range);
    var prefixRangeInp = prefixGrp.add('edittext', undefined, '1-' + data.state.length);
        prefixRangeInp.preferredSize.width = 90;
        prefixRangeInp.helpTip = txt.rangeEg;

    var suffixGrp = preSuffGrp.add('group');
        suffixGrp.orientation = 'row';
        suffixGrp.alignChildren = ['fill', 'center'];

    suffixGrp.add('statictext', undefined, txt.suffix);
    var suffixInp = suffixGrp.add('edittext', undefined, '');
        suffixInp.preferredSize.width = 140;

    var suffixPhDdl = suffixGrp.add('dropdownlist', undefined, phDescrList);
        suffixPhDdl.maximumSize.width = 40;
        suffixPhDdl.selection = 0;

    suffixGrp.add('statictext', undefined, txt.range);
    var suffixRangeInp = suffixGrp.add('edittext', undefined, '1-' + data.state.length);
        suffixRangeInp.preferredSize.width = 90;
        suffixRangeInp.helpTip = txt.rangeEg;

    // FIND AND REPLACE
    var findRplcPnl = extra.add('panel', undefined, txt.findTitle);
        findRplcPnl.alignChildren = ['fill', 'top'];
        findRplcPnl.margins = [10, 15, 10, 10];

    var isFindRplc = findRplcPnl.add('checkbox', undefined, txt.enable);
        isFindRplc.value = CFG.isFind;

    var findStrGrp = findRplcPnl.add('group');
        findStrGrp.orientation = 'row';
        findStrGrp.alignChildren = ['fill', 'top'];

    var findGrp = findStrGrp.add('group');
    findGrp.add('statictext', undefined, txt.find);
    var findInp = findGrp.add('edittext', undefined, '');
        findInp.preferredSize.width = 110;
        findInp.enabled = CFG.isFind;

    var rplcGrp = findStrGrp.add('group');
    rplcGrp.add('statictext', undefined, txt.replace);
    var replaceInp = rplcGrp.add('edittext', undefined, '');
        replaceInp.preferredSize.width = 110;
        replaceInp.enabled = CFG.isFind;

    var findHint = findRplcPnl.add('statictext', undefined, txt.findHint);
    findHint.addEventListener('mousedown', function () {
      if (!isFindRplc.value) return;
      findInp.active = true;
      findInp.textselection = findInp.text + '^.*$';
    });

    var rangeStrGrp = findRplcPnl.add('group');
        rangeStrGrp.margins = [0, 10, 0, 0];

    var rangeRadioGrp = rangeStrGrp.add('group');
        rangeRadioGrp.enabled = CFG.isFind;
    var findAllRange = rangeRadioGrp.add('radiobutton', undefined, txt.all);
        findAllRange.value = true;
    var findCstmRange = rangeRadioGrp.add('radiobutton', undefined, txt.range);

    var findRangeInp = rangeRadioGrp.add('edittext', undefined, '1-' + data.state.length);
        findRangeInp.preferredSize.width = 205;
        findRangeInp.helpTip = txt.rangeEg;
        findRangeInp.enabled = CFG.isFind;

    // CASE CONVERTER
    var casePnl = extra.add('panel', undefined, txt.caseTitle);
        casePnl.orientation = 'row';
        casePnl.alignChildren = ['fill', 'center'];
        casePnl.margins = [10, 15, 10, 10];

    var caseList = [
      'Original', 'lower case', 'UPPER CASE', 
      'Title Case', 'Sentence case', 'camelCase', 
      'PascalCase', 'snake_case', 'kebab-case', 'CONSTANT_CASE'];

    var caseDdl = casePnl.add('dropdownlist', undefined, caseList);
        caseDdl.preferredSize.width = 210;
        caseDdl.selection = 0;

    casePnl.add('statictext', undefined, txt.range);
    var caseRangeInp = casePnl.add('edittext', undefined, '1-' + data.state.length);
        caseRangeInp.preferredSize.width = 90;
        caseRangeInp.helpTip = txt.rangeEg;

    // DEFAULT DATA
    data.prefixRange = '1-' + data.state.length;
    data.suffixRange = '1-' + data.state.length;
    data.caseRange = '1-' + data.state.length;
    data.caseStyle = caseList[0];

    // TAB EVENTS
    isFindRplc.onClick = function () {
      changeTabName(tab);
      findInp.enabled = replaceInp.enabled = this.value;
      data.isFind = this.value;
      rangeRadioGrp.enabled = this.value;
      data.findRange = '1-' + data.state.length;
    }

    // Set prefix
    prefixInp.onChange = function() {
      data.prefix = this.text;
      changeTabName(tab);
    }

    prefixPhDdl.onChange = function () {
      this.active = true;
      if (this.children.length > 1 && this.selection === null) {
        this.selection = 0;
      }

      if (this.selection.index > 0) {
        prefixInp.active = true;
        prefixInp.textselection = prefixInp.text + phKeyList[this.selection.index];
        this.selection = 0;
        prefixInp.active = true;
      }
    }

    prefixRangeInp.onChange = function() {
      data.prefixRange = this.text;
      changeTabName(tab);
    }

    // Set suffix
    suffixInp.onChange = function() {
      data.suffix = suffixInp.text;
      changeTabName(tab);
    }

    suffixPhDdl.onChange = function () {
      this.active = true;
      if (this.children.length > 1 && this.selection === null) {
        this.selection = 0;
      }

      if (this.selection.index > 0) {
        suffixInp.active = true;
        suffixInp.textselection = suffixInp.text + phKeyList[this.selection.index];
        this.selection = 0;
        suffixInp.active = true;
      }
    }

    suffixRangeInp.onChange = function() {
      data.suffixRange = this.text;
      changeTabName(tab);
    }

    // Find and replace
    findInp.onChange = function() {
      data.find = this.text;
      changeTabName(tab);
    }

    replaceInp.onChange = function() {
      data.replace = this.text;
      changeTabName(tab);
    }

    findAllRange.onClick = function () {
      findRangeInp.enabled = false;
      data.findRange = '1-' + data.state.length;
    }

    findCstmRange.onClick = function () {
      findRangeInp.enabled = true;
      data.findRange = findRangeInp.text;
    }

    findRangeInp.onChange = function() {
      this.text = this.text.replace(/;/g, ',')
      data.findRange = this.text;
      changeTabName(tab);
    }

    // Change Case
    caseDdl.onChange = function () {
      this.active = true;
      if (this.children.length > 1 && this.selection === null) {
        this.selection = 0;
      }
      data.caseStyle = this.selection.text;
      changeTabName(tab);
    }

    caseRangeInp.onChange = function() {
      this.text = this.text.replace(/;/g, ',')
      data.caseRange = this.text;
      changeTabName(tab);
    }

    // Name inputs handler
    var parent = (data.state.length <= CFG.rows) ? pageListPanel : smallList;
    for (var i = 0, pcLen = parent.children.length; i < pcLen; i++) {
      // Use the keyboard to navigate between fields
      goToNextPrevName(data, i, prefixInp, scroll, parent);

      // Reset preview when activating name field [2]
      parent.children[i].children[1].onActivate = function() {
        if (!isEmpty(prvwTitle.text)) {
          for (var j = 0, nLen = data.names.length; j < nLen; j++) {
            data.names[j].text = data.state[j].customName; // Restore original name
          }
        }
        prvwTitle.text = '';
        // Restore original names in document
        if (CFG.isUndo) {
          app.undo();
          var tempPath = doc.layers[0].pathItems.rectangle(0, 0, 1, 1);
          tempPath.stroked = false;
          tempPath.filled = false;
          tempPath.hidden = true;
          tempPath.hidden = false;
          tempPath.remove();
          app.redraw();
          CFG.isUndo = false;
        }
      }
    }

    var obj = {
      prefix:         extra     ? prefixInp : undefined,
      prefixRange:    extra     ? prefixRangeInp : undefined,
      suffix:         extra     ? suffixInp : undefined,
      suffixRange:    extra     ? suffixRangeInp : undefined,
      find:           extra     ? findInp : undefined,
      replace:        extra     ? replaceInp : undefined,
      findRange:      extra     ? findRangeInp : undefined,
      caseRange:      extra     ? caseRangeInp : undefined,
      prvwTitle:      prvwTitle ? prvwTitle : undefined,
      scroll:         scroll    ? scroll : undefined,
      smallList:      scroll    ? smallList : undefined,
      pageListPanel:  scroll    ? pageListPanel : undefined,
    }

    return obj;
  }

  /**
   * Add a new row to the specified tab with object name
   * @param {Object} tab - The tab object to which the row will be added
   * @param {number} idx - The index of the row
   * @param {Object} row - The row object to be added
   * @param {Object} obj - The object containing state information
   */
  function addNewRow(tab, idx, row, obj) {
    var isMac = /mac/i.test($.os);

    // Add order number
    var order = row.add('statictext');
    order.text = padZero(idx + 1, Math.max(3, obj.state.length.toString().length));
    
    obj.names[idx] = row.add('edittext', [0, 0, isMac ? 310 : 320, 20]);
    obj.names[idx].text = obj.state[idx].origName;
    obj.names[idx].onChange = function () {
      if (isEmpty(this.text)) {
        this.text = obj.state[idx].origName;
      } else {
        obj.state[idx].customName = this.text;
      }
      changeTabName(tab);
    }
  }

  /**
   * Change the tab name to indicate changes
   * @param {Object} tab - The tab object whose name will be changed
   */
  function changeTabName(tab) {
    if (!/\*/g.test(tab.text)) tab.text += ' *';
  }

  /**
   * Set up event listeners for navigating through names using Up and Down arrow keys
   * @param {Object} obj - The object containing names and other related properties
   * @param {number} idx - The current index in the names array
   * @param {Object} prefix - The prefix object to focus on when navigating past the last name
   * @param {Object} scroll - The scrollbar object associated with the list
   * @param {Object} scrollList - The list object that is being scrolled
   */
  function goToNextPrevName(obj, idx, prefix, scroll, scrollList) {
    var length = obj.names.length;
    obj.names[idx].addEventListener('keydown', function (kd) {
      // Go to next name
      if (kd.keyName == 'Down' && (idx + 1) < length) {
        // Update the scrollbar position when the Down key is pressed
        if (idx !== 0 && scroll) {
          scroll.value = (idx + 1) * (scroll.maxvalue / length);
          scrollList.location.y += -1 * scroll.stepdelta;
        }
        obj.names[idx + 1].active = true;
        win.update();
        kd.preventDefault();
      }

      // Go to previous name
      if (kd.keyName == 'Up' && (idx - 1 >= 0)) {
        // Update the scrollbar position when the Up key is pressed
        if ((idx + 1 < length) && scroll && scrollList.location.y < 0) {
          scroll.value = (idx - 1) * (scroll.maxvalue / length);
          scrollList.location.y += 1 * scroll.stepdelta;
        }
        obj.names[idx - 1].active = true;
        win.update();
        kd.preventDefault();
      }

      // Go to prefix after last name
      if (kd.keyName == 'Down' && (idx + 1) == length) {
        prefix.active = true;
        win.update();
        kd.preventDefault();
      }
    });

    prefix.addEventListener('keydown', function (kd) {
      // Go to last name from prefix
      if (kd.keyName == 'Up') {
        obj.names[obj.names.length - 1].active = true;
        win.update();
        kd.preventDefault();
      }
    });
  }

  /**
   * Adjust the maximum scroll value for a given object's scrollbar
   * This function is used to fix the scrollbar size
   * @param {Object} obj - The object containing the scrollbar properties
   * @param {number} delta - The additional offset to adjust the scrollbar size
   */
  function adjustScrollMax(obj, delta) {
    if (obj.scroll !== undefined && obj.scroll.hasOwnProperty('maxvalue')) {
      obj.scroll.maxvalue = obj.smallList.size.height - obj.pageListPanel.size.height + delta;
    }
  }

  /**
   * Event listener for the copyright link click
   * Opens the GitHub URL when the copyright link is clicked
   */
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  /**
   * Save UI options to a file
   * @param {object} prefs - Object containing preferences
   */
  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(SETTINGS.folder + SETTINGS.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var absPrefs = setSettingsString(abs);
    var lyrsPrefs = setSettingsString(lyrs);
    var pathsPrefs = setSettingsString(paths);
    var activeTab = 0;

    if (tabPnl.selection.text.match(MSG.tabLyr)) activeTab = 1;
    if (tabPnl.selection.text.match(MSG.tabPath)) activeTab = 2;

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.abs = absPrefs;
    data.layers = lyrsPrefs;
    data.paths = pathsPrefs;
    data.tab = activeTab;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Convert an object's properties to a string
   * @param {Object} obj - The object containing settings
   * @returns {string} A string representation of the object's properties
   */
  function setSettingsString(obj) {
    return [
      obj.prefix,
      obj.prefixRange,
      obj.suffix,
      obj.suffixRange,
      obj.find,
      obj.replace,
      obj.findRange,
      obj.caseRange
    ].join(';');
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
        loadSettingsString(abs, absTabData, data.abs.split(';'));
        loadSettingsString(lyrs, lyrsTabData, data.layers.split(';'));
        loadSettingsString(paths, pathsTabData, data.paths.split(';'));
        tabPnl.selection = isNaN(data.tab) ? 0 : data.tab * 1;
      }
    } catch (err) {
      return;
    }
  }

  /**
   * Load settings from a string into an object and updates the UI
   * @param {Object} obj - The object to load settings into
   * @param {Object} tabData - The UI data object
   * @param {Array} arr - The array of settings to load
   */
  function loadSettingsString(obj, tabData, arr) {
    if (arr.length < 7) return; // Stop load for old script

    if (tabData.hasOwnProperty('prefix')) {
      if (arr[0]) obj.prefix  = tabData.prefix.text = arr[0];
      if (arr[1]) obj.prefixRange = tabData.prefixRange.text = arr[1];
      if (arr[2]) obj.suffix = tabData.suffix.text = arr[2];
      if (arr[3]) obj.suffixRange = tabData.suffixRange.text = arr[3];
      if (arr[4]) obj.find = tabData.find.text = arr[4];
      if (arr[5]) obj.replace = tabData.replace.text = arr[5];
      if (arr[6]) obj.findRange = tabData.findRange.text = arr[6];
      if (arr[7]) obj.caseRange = tabData.caseRange.text = arr[7];
    }
  }

  /**
   * Handle the OK button click event
   * Rename objects based on current settings and save them
   */
  function okClick() {
    if (CFG.isUndo) {
      app.undo();
      CFG.isUndo = false;
    }
    renameObjects(doc.artboards, CFG, PH, abs, absPH);
    renameObjects(doc.layers, CFG, PH, lyrs, lyrsPH);
    renameObjects(app.selection, CFG, PH, paths, pathsPH);
    saveSettings(SETTINGS);
    win.close();
  }

  win.show();
}

// GLOBAL FUNCTIONS

/**
 * Initialize an object to store data
 * @param {boolean} isFind - A flag indicating is enabled Find and Replace
 * @param {string} type - Adobe Illustrator document collection type
 * @returns {Object} An object containing properties for renaming
 */
function initObject(isFind, type) {
  return {
    isFind: isFind,
    find: '',
    replace: '',
    findRange: '',
    prefix: '',
    prefixRange: '',
    suffix: '',
    suffixRange: '',
    caseStyle: '',
    caseRange: '',
    names: [],
    state: [],
    type: type
  };
}

/**
 * Initialize placeholders for a specific type of element
 * @param {string} type - The type of element
 * @param {Object} ph - The placeholder object containing element properties
 * @returns {Object} An object containing the initialized placeholders
 */
function initPlaceholders(type, ph) {
  var obj = {
    numDown: ph.numDown,
    numUp: ph.numUp,
    color: ph.color,
    dateDMY: ph.dateDMY,
    dateMDY: ph.dateMDY,
    dateYMD: ph.dateYMD,
    time: ph.time,
    file: ph.file,
  };

  if (type === 'artboards' || type === 'paths') {
    obj.height = ph.height;
    obj.width = ph.width;
    obj.units = ph.units;
  }

  return obj;
}

/**
 * Initialize data by collecting prefix, object name, suffix, and index
 * @param {Array} coll - The collection of objects to process
 * @returns {Array} resultData - An array of arrays, each containing object name and index
 */
function initData(coll) {
  var resultData = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var name = getName(coll[i]);
    resultData.push({ origName: name, customName: name, index: i});
  }
  return resultData;
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
    return item.contents.replace(/\n|\r|\r\n/g,'');
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
 * Check if an item is considered a legacy text item
 * @param {Object} item - The item to check
 * @returns {boolean} Returns true if the item is a legacy text item, false otherwise
 */
function isLegacyText(item) {
  return item.typename === 'LegacyTextItem' || 
        (item.typename === 'TextFrame' && (!item.hasOwnProperty('contents') ||
        item.hasOwnProperty('converted')));
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
 * Display the index of each artboard in the active document
 * @param {string} name - The name of the temporary layer to create
 * @param {Array} color - The RGB color array for the text. Defaults to black if not provided
 */
function showArboardIndex(name, color) {
  if (arguments.length == 1 || color == undefined) {
    color = [0, 0, 0];
  }

  var doc = activeDocument;
  var rgbColor = setRGBColor(color);
  var tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(name);
  } catch (err) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = name;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i];
    var abWidth = currAb.artboardRect[2] - currAb.artboardRect[0];
    var abHeight = currAb.artboardRect[1] - currAb.artboardRect[3];
    var label = tmpLayer.textFrames.add();
    var labelSize = (abWidth >= abHeight) ? abHeight / 2 : abWidth / 2;

    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = rgbColor;
    label.position = [currAb.artboardRect[0], currAb.artboardRect[1]];
  }

  // Update screen
  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  } else {
    app.redraw();
  }

  tmpLayer.remove();
}

/**
 * Set the RGB color
 * @param {Array} color - The RGB color array
 * @returns {RGBColor} The RGB color object
 */
function setRGBColor(rgb) {
  var color = new RGBColor();
  color.red = rgb[0];
  color.green = rgb[1];
  color.blue = rgb[2];
  return color;
}

/**
 * Parse the contents of a text file into an array of lines
 * @param {Object} f - The file to parse
 * @returns {Array} An array of lines from the file
 */
function parseFromText(f) {
  f.open('r');
  var contents = f.read();
  var lines = contents.split(/\n|\r|\r\n/);
  f.close();
  return lines;
}

/**
 * Write a string to a text file
 * @param {string} str - The string to write to the file
 * @param {Object} f - The file object to write to
 */
function writeToText(str, f) {
  f.open('w');
  f.write(str);
  f.close();
}

/**
 * Preview names for a collection of objects by updating the text property of names in the provided object
 * @param {(Object|Array)} coll - Collection of objects to preview names for
 * @param {Object} cfg - Global configuration
 * @param {Array} allPlaceholders - Array of all placeholders to be used in name generation
 * @param {Object} obj - Object containing names array to be modified
 * @param {Array} objPlaceholders - Array of placeholders specific to the object
 */
function previewNames(coll, cfg, allPlaceholders, obj, objPlaceholders) {
  var namesArr = generateNames(coll, cfg, allPlaceholders, obj, objPlaceholders);
  for (var i = 0, len = obj.names.length; i < len; i++) {
    obj.names[i].text = namesArr[i];
  }
}

/**
 * Rename objects in the collection based on generated names
 * @param {(Object|Array)} coll - Collection of objects to rename
 * @param {Object} cfg - Global configuration object
 * @param {Array} allPlaceholders - Array of all placeholders to be used in name generation
 * @param {Object} obj - Object containing names array to be modified
 * @param {Array} objPlaceholders - Array of placeholders specific to the object
 */
function renameObjects(coll, cfg, allPlaceholders, obj, objPlaceholders) {
  if (!coll.length) return;
  var namesArr = generateNames(coll, cfg, allPlaceholders, obj, objPlaceholders);

  for (var i = 0, len = namesArr.length; i < len; i++) {
    var currItem = coll[i];
    var compound = getCompound(currItem);
    currItem = compound || currItem;
    var currName = obj.state[i].origName;
    var newName = namesArr[i];

    if (isEmpty(currItem.name) && currItem.contents === newName) continue;
    if (currName !== newName) currItem.name = newName; // Name is modified
  }
}

/**
 * Generate names for a collection of objects based on given configurations and placeholders
 * @param {(Object|Array)} coll - Collection of objects to generate names for
 * @param {Object} cfg - Global configuration object
 * @param {Array} allPlaceholders - Array of all placeholders to be used in name generation
 * @param {Object} obj - Object containing names array to be modified
 * @param {Array} objPlaceholders - Array of placeholders specific to the object
 * @returns {Array} ResultNames - An array of generated names
 */
function generateNames(coll, cfg, allPlaceholders, obj, objPlaceholders) {
  var resultNames = [];

  var prefixIndexes = parseAndFilterIndexes(obj.prefixRange, obj.state.length - 1);
  var suffixIndexes = parseAndFilterIndexes(obj.suffixRange, obj.state.length - 1);
  var findIndexes = parseAndFilterIndexes(obj.findRange, obj.state.length - 1);
  var caseIndexes = parseAndFilterIndexes(obj.caseRange, obj.state.length - 1);

  var counter = getStartNum(allPlaceholders, obj, objPlaceholders);
  var amountUp = Math.abs(counter.up) + coll.length;
  var amountDown = Math.abs(counter.down) + coll.length;

  var newName = '', isAddPrefix = false, isAddSuffix = false, isChangeCase = false;
  var counterUp = '', counterDown = '' , tmpPrefix = '', tmpSuffix = '';
  var isInRange = false;

  for (var i = 0, len = obj.state.length; i < len; i++) {
    isInRange = isInclude(findIndexes, i);
    newName = findAndReplace(obj, i, isInRange);

    isAddPrefix = isInclude(prefixIndexes, i);
    isAddSuffix = isInclude(suffixIndexes, i);
    isChangeCase = isInclude(caseIndexes, i);

    counterUp = padZero(counter.up, amountUp.toString().length);
    counterDown = padZero(counter.down, amountDown.toString().length);

    if (isAddPrefix) {
      tmpPrefix = replacePlaceholder(obj.state[i].index, counterUp, counterDown, obj.prefix, cfg, coll, objPlaceholders);
    }

    if (isAddSuffix) { 
      tmpSuffix = replacePlaceholder(obj.state[i].index, counterUp, counterDown, obj.suffix, cfg, coll, objPlaceholders);
    }

    counter.up = changeCounter(counter.up, obj.prefix, obj.suffix, objPlaceholders.numUp, isAddPrefix, isAddSuffix, true);
    counter.down = changeCounter(counter.down, obj.prefix, obj.suffix, objPlaceholders.numDown, isAddPrefix, isAddSuffix, false);

    newName = tmpPrefix + newName + tmpSuffix;

    if (isChangeCase) {
      newName = convertToCase(newName, obj.caseStyle);
    }

    resultNames.push(newName);
    counterUp = '', counterDown = '' , tmpPrefix = '', tmpSuffix = '';
  }

  return resultNames;
}

/**
 * Parse and filter indexes from a string
 * @param {string} str - The input string containing numbers and ranges
 * @param {number} total - The maximum allowed index value
 * @returns {Array} An array of filtered and parsed indexes
 */
function parseAndFilterIndexes(str, total) {
  var chunks = str.split(/[, ]+/);
  var length = chunks.length;
  var parsedNums = [];

  var chunk, range;
  for (var i = 0; i < length; i++) {
    chunk = chunks[i];
    range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsedNums.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) parsedNums.push(num);
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
 * Extract and parse numerical values from configuration and object placeholders
 * @param {Object} cfgPlaceholders - All placeholders object containing numUp and numDown strings
 * @param {Object} obj - Object containing prefix and suffix strings
 * @param {Object} objPlaceholders - Object placeholder to store parsed numUp and numDown values
 * @returns {Object} An object containing the parsed numerical values for 'up' and 'down'
 */
function getStartNum(cfgPlaceholders, obj, objPlaceholders) {
  var tmpNumUp = cfgPlaceholders.numUp.substr(0, 4); // Part of the placeholder before number
  var tmpNumDown = cfgPlaceholders.numDown.substr(0, 4);
  var tmpPreSuff = (obj.prefix + obj.suffix).toLocaleLowerCase();

  // Parse number up from string
  var startIdxNumUp = tmpPreSuff.indexOf(tmpNumUp) + tmpNumUp.length,
      endIdxNumUp = tmpPreSuff.indexOf('}', startIdxNumUp);
  var cntUp = 1 * tmpPreSuff.substring(startIdxNumUp, endIdxNumUp);
  if (isNaN(cntUp)) cntUp = 0;
  objPlaceholders.numUp = tmpNumUp + cntUp + '}';
  
  // Parse number down from string
  var startIdxNumDown = tmpPreSuff.indexOf(tmpNumDown) + tmpNumUp.length;
  var endIdxNumDown = tmpPreSuff.indexOf('}', startIdxNumDown);

  var cntDown = 1 * tmpPreSuff.substring(startIdxNumDown, endIdxNumDown);
  if (isNaN(cntDown)) cntDown = 0;
  objPlaceholders.numDown = tmpNumDown + cntDown + '}';

  return { 'up': cntUp, 'down': cntDown };
}

/**
 * Checks if an array includes a specific numeric value
 * @param {Array} arr - The array to search within
 * @param {number} value - The value to search for
 * @returns {boolean} Returns true if the value is found in the array, otherwise false
 */
function isInclude(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === value) return true;
  }
  return false;
}

/**
 * Find and replace text within a specified object based on given criteria
 * @param {Object} obj - The object containing state and find/replace details
 * @param {number} idx - The index of the item in the object's state array
 * @param {boolean} isInRange - Determines if the index is within the desired range for replacement
 * @returns {string} resultStr - The result after performing the find and replace operation, or the original string if conditions are not met
 */
function findAndReplace(obj, idx, isInRange) {
  var resultStr = obj.state[idx].customName;

  // Check if the object is set to find, if the index is in range, and if the find string is not empty
  if (obj.isFind && isInRange && (obj.find.length || !isEmpty(obj.find))) {
    var regex = new RegExp(obj.find, 'gi');
    resultStr = resultStr.replace(regex, obj.replace);
  }

  return resultStr;
}

/**
 * Pad a number with leading zeros to ensure it reaches a specified length
 * This function handles negative numbers by preserving the sign and padding the absolute value
 * @param {number} num - The number to pad with zeros Can be positive or negative
 * @param {number} length - The total length of the resulting string, including the sign for negative numbers
 * @returns {string} The padded number as a string with leading zeros
 */
function padZero(num, length) {
  var sign = num < 0 ? '-' : '';
  var str = '00000000000' + Math.abs(num);
  return sign + str.slice(-length);
}

/**
 * Replace placeholders in a string with specific values based on the document and configuration
 * @param {Array} index - The object index
 * @param {number} counterUp - The counter for upward numbering
 * @param {number} counterDown - The counter for downward numbering
 * @param {string} str - The string containing placeholders to be replaced
 * @param {Object} cfg - Global configuration object
 * @param {(Object|Array)} coll - Collection of objects to generate names for
 * @param {Array} objPlaceholders - Array of placeholders specific to the object
 * @returns {string} The string with placeholders replaced by actual values
 */
function replacePlaceholder(index, counterUp, counterDown, str, cfg, coll, objPlaceholders) {
  var name = activeDocument.name.replace(/\.[^\.]+$/, '');
  var units = getUnits();
  var width = height = 0;
  var color = /rgb/i.test(activeDocument.documentColorSpace) ? 'RGB' : 'CMYK';

  // Determine width and height based on the type of collection item
  switch (coll[0].typename) {
    case 'Artboard':
      var currAb = activeDocument.artboards[index];
      width = currAb.artboardRect[2] - currAb.artboardRect[0];
      height = currAb.artboardRect[1] - currAb.artboardRect[3];
      break;
    case 'Layer':
      break;
    default:
      var item = app.selection[index];
      if (item.typename === 'GroupItem' && item.clipped) {
        item = getMaskPath(item);
      }
      width = item.width;
      height = item.height;
      break;
  }
  
  // Convert and format width and height
  width = ( cfg.sf * convertUnits(width, 'px', units) ).toFixed(cfg.precision);
  height = ( cfg.sf * convertUnits(height, 'px', units) ).toFixed(cfg.precision);

  // Replace placeholders in the string
  for (var prop in objPlaceholders) {
    // Fix for LAScripts extension users
    if (/function/i.test(objPlaceholders[prop])) continue;

    var regex = new RegExp(objPlaceholders[prop], 'gi');
    if (str.match(regex)) {
      var val;
      switch (objPlaceholders[prop]) {
        case objPlaceholders.units:
          val = units;
          break;
        case objPlaceholders.file:
          val = name;
          break;
        case objPlaceholders.dateDMY:
          val = getCurrentDate(objPlaceholders.dateDMY);
          break;
        case objPlaceholders.dateMDY:
          val = getCurrentDate(objPlaceholders.dateMDY);
          break;
        case objPlaceholders.dateYMD:
          val = getCurrentDate(objPlaceholders.dateYMD);
          break;
        case objPlaceholders.time:
          val = getCurrentTime();
          break;
        case objPlaceholders.color:
          val = color;
          break;
        case objPlaceholders.numUp:
          val = counterUp;
          break;
        case objPlaceholders.numDown:
          val = counterDown;
          break;
        case objPlaceholders.height:
          val = height.replace('.', cfg.decimal);
          break;
        case objPlaceholders.width:
          val = width.replace('.', cfg.decimal);
          break;
      }

      str = str.replace(regex, val);
    }
  }

  return str;
}

/**
 * Adjust a counter based on prefix and suffix conditions
 * @param {number} num - The initial number to adjust
 * @param {string} prefix - The prefix to check
 * @param {string} suffix - The suffix to check
 * @param {string} placeholder - The placeholder to test against prefix and suffix
 * @param {boolean} isAddPrefix - Whether to consider the prefix
 * @param {boolean} isAddSuffix - Whether to consider the suffix
 * @param {boolean} isCounterUp - Whether to increment or decrement the number
 * @returns {number} The adjusted number
 */
function changeCounter(num, prefix, suffix, placeholder, isAddPrefix, isAddSuffix, isCounterUp) {
  var regex = new RegExp(placeholder, 'gi');
  if ((isAddPrefix && regex.test(prefix)) || (isAddSuffix && regex.test(suffix))) {
    num = isCounterUp ? num + 1 : num - 1;
  }
  return num;
}

/**
 * Return the current date formatted according to the specified format key
 * dmy > DD/MM/YYYY
 * mdy > MM/DD/YYYY
 * ymd > YYYY/MM/DD
 * @param {string} dateStyle - The target date style name
 * @returns {string} The formatted date string
 */
function getCurrentDate(dateStyle) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  
  // Add a leading zero for months and days < 10
  var mm = (month < 10) ? '0' + month : month;
  var dd = (day < 10) ? '0' + day : day;

  // Define the format based on the key
  switch(true) {
    case /ymd/i.test(dateStyle):
      return year + '/' + mm + '/' + dd;
    case /mdy/i.test(dateStyle):
      return mm + '/' + dd + '/' + year;
    case /dmy/i.test(dateStyle):
    default:
      return dd + '/' + mm + '/' + year;
  }
}

/**
 * Retrieve the current time in HH:MM format
 * @returns {string} The current time as a formatted string
 */
function getCurrentTime() {
  var date = new Date();
  var hh = date.getHours();
  var mm = date.getMinutes();

  return [(hh > 9 ? '' : '0') + hh, 
          (mm > 9 ? '' : '0') + mm].join(':');
}

/**
 * Retrieve the clipping mask path from a group of items
 * @param {Object} group - The group of items to search for a clipping mask
 * @returns {Object} The clipping path item if found, otherwise the original group
 */
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) return currItem;
  }

  // Return the original group if no clipping path is found
  return group;
}

/**
 * Check if an item is a clipping path
 * @param {Object} item - The item to check
 * @returns {boolean} True if the item is a clipping path, false otherwise
 */
function isClippingPath(item) {
  var clipText = (item.typename === 'TextFrame' &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (item.typename === 'CompoundPathItem' && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

/**
 * Get active document ruler units
 * @returns {string} Shortened units
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
* @returns {number} The converted value in the specified units
*/
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Convert a string to the specified case style
 * @param {string} str - The original string to convert
 * @param {string} caseStyle - The target case style name
 * @returns {string} The converted string
 */
function convertToCase(str, caseStyle) {
  if (/original/i.test(caseStyle)) {
    return str;
  }

  // Get words array
  try {
    var words = splitIntoWords(str);
  } catch (error) {
    // alert(error);
  }

  // Convert based on case style
  switch (true) {
    case /lower/i.test(caseStyle):
      return str.toLowerCase();
    case /upper/i.test(caseStyle):
      return str.toUpperCase();
    case /title/i.test(caseStyle):
      var titleResult = '';
      for (var i = 0; i < words.length; i++) {
          if (i > 0) titleResult += ' ';
          titleResult += capitalize(words[i]);
      }
      return titleResult;
    case /sentence/i.test(caseStyle):
      var sentenceResult = words.join(' ').toLowerCase();
      return sentenceResult.charAt(0).toUpperCase() + sentenceResult.slice(1);
    case /camel/i.test(caseStyle):
      if (words.length === 0) return str;
      var camelResult = words[0].toLowerCase();
      for (var i = 1; i < words.length; i++) {
        camelResult += capitalize(words[i]);
      }
      return camelResult;
    case /pascal/i.test(caseStyle):
      var pascalResult = '';
      for (var i = 0; i < words.length; i++) {
        pascalResult += capitalize(words[i]);
      }
      return pascalResult;
    case /snake/i.test(caseStyle):
      return words.join('_').toLowerCase();
    case /kebab/i.test(caseStyle):
      return words.join('-').toLowerCase();
    case /constant/i.test(caseStyle):
      return words.join('_').toUpperCase();
    default:
      return str;
  }
}

/**
 * Split a string into words
 * @param {string} str - The input string to split
 * @returns {Array} filteredWords - An array of words
 */
function splitIntoWords(str) {
  // Split by spaces, hyphens, underscores, and camelCase boundaries
  var processed = str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
  var splitWords = processed.split(/\s+/);

  var filteredWords = [];
  for (var i = 0; i < splitWords.length; i++) {
    if (splitWords[i].length > 0) filteredWords.push(splitWords[i]);
  }

  return filteredWords;
}

/**
 * Capitalize the first letter of a word
 * @param {string} word - The input word to capitalize
 * @returns {string} The word with the first letter capitalized
 */
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
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

try {
  main();
} catch (err) {}