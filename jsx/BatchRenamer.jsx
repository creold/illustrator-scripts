/*
  BatchRenamer.jsx for Adobe Illustrator
  Description: Script for batch renaming artboards, layers & selected items manually or by placeholders.
  Find & Replace supports regular expressions.
  Date: January, 2022
  Modification date: January, 2024

  Original idea by Qwertyfly:
  https://community.adobe.com/t5/illustrator-discussions/is-there-a-way-to-batch-rename-artboards-in-illustrator-cc/m-p/7243667#M153618

  Modification by Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Release notes:
  1.0 Fixed variables, scrollbar in original script by Qwertyfly
      Added tabs for batch rename Artboards, Layers, Paths
      Added 'Select all' checkboxes, 'Find and Replace' algorithm
      Addedd save and load user settings
      Added placeholders for batch rename 
  1.1 Minor improvements
  1.1.1 Fixed load user settings
  1.2 Added more units (yards, meters, etc.) support if the document is saved
  1.2.1 Added custom RGB color (idxColor) for artboard indexes
  1.2.2 Added size correction in large canvas mode
  1.2.3 Added new units API for CC 2023 v27.1.1
  1.2.4 Added {fn} placeholder to insert a filename
  1.2.4a Fixed problem launching through LAScripts extension
  1.3 Info about number of artboards, layers, selected document objects added to {nu}, {nd} placeholder text. Minor improvements
  1.3.1 Added display of text frame content as name if it is empty
  1.3.2 Fixed rename bug
  1.3.3 Added display symbol object names
  1.4 Added import names from txt and export names into txt from active tab
  1.5 Added custom range for Find and Replace. Minor improvements
  
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

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  var absLength = doc.artboards.length;
  var lyrsLength = doc.layers.length;
  var selLength = app.selection.length;

  var SCRIPT = {
        name:     'Batch Renamer',
        version:  'v.1.5'
      };
  var CFG = {
        listHeight: 6 * 32,
        rows:       6, // Amount of visible rows
        precision:  2, // Rounding the artboard or the path width and height to decimal places
        decimal:    ',', // Decimal separator point or comma for width and height
        defTab:     0, // Default tab. 0 - Artboard, 1 - Layer, 2 - Path
        idxColor:   [255, 0, 0], // Artboard index color
        isFind:     false, // Default Find and Replace state
        isMac:      /mac/i.test($.os),
        aiVers:     parseInt(app.version),
        sf:         activeDocument.scaleFactor ? activeDocument.scaleFactor : 1, // Scale factor for Large Canvas mode
        tmpLyr:     'ARTBOARD_INDEX',
        uiOpacity:  .97, // UI window opacity. Range 0-1
      };
  var PH = { // Placeholders
        color:    '{c}',
        date:     '{d}',
        fName:    '{fn}',
        height:   '{h}',
        name:     '{n}',
        numDown:  '{nd:0}',
        numUp:    '{nu:0}',
        units:    '{u}',
        width:    '{w}',
      };
  var MSG = {
        all:          'All elements',
        cancel:       'Cancel',
        copyright:    'Visit Github',
        empty:        'No paths are selected',
        enable:       'Enable',
        ex:           'Export',
        exDlg:        'Choose a folder to export TXT...',
        exHint:       'Export names from active tab\ninto a TXT file',
        exSuccess:    'Your file * has been created successfull',
        find:         'Find',
        findHint:     'Support regular expressions',
        findTitle:    'Find and Replace',
        im:           'Import',
        imDlg:        'Choose TXT file...',
        imHint:       'Import names to active tab\nfrom a TXT file. Start each name\non a new line',
        imSuccess:    'Your file * has been imported successfully into the active tab',
        nameAb:       'Artboard name',
        nameLyr:      'Layer name',
        namePath:     'Object name',
        ok:           'OK',
        ph:           'Placeholder: ' + PH.name + ' - current name',
        prefix:       'Prefix',
        prvw:         'Preview',
        prvwOn:       'PREVIEW ON',
        range:        'Range',
        rplc:         'Replace',
        suffix:       'Suffix',
        tabAb:        'ARTBOARDS',
        tabLyr:       'LAYERS',
        tabPath:      'OBJECTS',
        preSuffAb:    'Placeholders:\n' +
                      PH.width + ' - artboard width, ' +
                      PH.height + ' - artboard height, ' +
                      PH.units + ' - ruler units, ' +
                      PH.numUp.replace(/\d/g, absLength) + ' - auto-number up with start from, ' + // Ascending
                      PH.numDown.replace(/\d/g, absLength) + ' - number down, ' + // Descending
                      PH.color + ' - file color space, ' + 
                      PH.date + ' - current date as YYYYMMDD, ' +
                      PH.fName + ' - filename',
        preSuffLyr:   'Placeholders:\n' +
                      PH.numUp.replace(/\d/g, lyrsLength) + ' - auto-number up with start from, ' + // Ascending
                      PH.numDown.replace(/\d/g, lyrsLength) + ' - auto-number down with start from, ' + // Descending
                      PH.fName + ' - filename',
        preSuffPath:  'Placeholders:\n' +
                      PH.numUp.replace(/\d/g, selLength) + ' - auto-number up with start from, ' + // Ascending
                      PH.numDown.replace(/\d/g, selLength) + ' - number down, ' + // Descending
                      PH.width + ' - object width, ' +
                      PH.height + ' - object height, ' +
                      PH.units + ' - ruler units',
      };
  var SETTINGS = {
        name:   SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  var abs = initObject(CFG.isFind); // Artboards
  var lyrs = initObject(CFG.isFind); // Layers
  var paths = initObject(CFG.isFind); // Selected objects

  var absPH = initPlaceholders('artboards', PH); // Artboard placeholders
  var lyrsPH = initPlaceholders('layers', PH); // Layers placeholders
  var pathsPH = initPlaceholders('paths', PH); // Paths placeholders

  var rowItem = []; // List rows

  // Init prefix, index, name and suffix
  initData(doc.artboards, abs.state);
  initData(doc.layers, lyrs.state);
  initData(app.selection, paths.state);

  // SHOW DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');

  // Tabs and properties
  var tabPnl = wrapper.add('tabbedpanel');
      tabPnl.alignChildren = ['fill', 'top'];

  var absTab = tabPnl.add('tab', undefined, MSG.tabAb); // Artboard
  var lyrsTab = tabPnl.add('tab', undefined, MSG.tabLyr); // Layer
  var pathsTab = tabPnl.add('tab', undefined, MSG.tabPath);  // Path

  absTab.margins = lyrsTab.margins = pathsTab.margins = [10, 20, 0, 5];
  tabPnl.selection = CFG.defTab;

  var absTabData = addTabContent(absTab, abs, MSG, MSG.nameAb, MSG.preSuffAb);
  var lyrsTabData = addTabContent(lyrsTab, lyrs, MSG, MSG.nameLyr, MSG.preSuffLyr);
  var pathsTabData = addTabContent(pathsTab, paths, MSG, MSG.namePath, MSG.preSuffPath);
  
  var btns = win.add('group');
      btns.orientation = 'column';
      btns.spacing = 20;
      btns.alignment = 'top';

  var b1 = btns.add('group');
      b1.orientation = 'column';

  var ok = b1.add('button', undefined, MSG.ok, { name: 'ok' });
  var cancel = b1.add('button', undefined, MSG.cancel, { name: 'cancel' });

  var b2 = btns.add('group');
      b2.orientation = 'column';

  var preview = b2.add('button', undefined, MSG.prvw);
  var importBtn = b2.add('button', undefined, MSG.im);
      importBtn.helpTip = MSG.imHint;
  var exportBtn = b2.add('button', undefined, MSG.ex);
      exportBtn.helpTip = MSG.exHint;

  var copyright = btns.add('statictext', undefined, MSG.copyright);
      copyright.justify = 'center';

  loadSettings();

  cancel.onClick = win.close;
  ok.onClick = okClick;

  // DIALOG LOCAL FUNCTIONS

  win.onShow = function () {
    showAbIndex(CFG.tmpLyr, CFG.idxColor);
    var delta = 20;
    setScrollMax(absTabData, delta);
    setScrollMax(lyrsTabData, delta);
    setScrollMax(pathsTabData, delta);
  }

  // Import names from txt file
  importBtn.onClick = function() {
    var type = ($.os.match('Windows')) ? '*.txt;' : function(f) {
      return f instanceof Folder || (f instanceof File && f.name.match(/(.txt)$/));
    };
    var f = File.openDialog(MSG.imDlg, type, false);
    var txtArr = parseFromText(f);

    var obj = tabPnl.selection.text.match(MSG.tabAb) ? abs : (tabPnl.selection.text.match(MSG.tabLyr) ? lyrs : paths);
    var min = Math.min(txtArr.length, obj.names.length);
    for (var i = 0; i < min; i++) {
      var str = txtArr[i];
      if (isEmpty(str)) continue;
      obj.names[i].text = str;
      obj.state[i][1] = str;
    }

    alert( MSG.imSuccess.replace(/\*/, decodeURIComponent(f.name)) );
  }

  // Export names from txt file
  exportBtn.onClick = function() {
    var fol = Folder.selectDialog(MSG.exDlg);
    if (fol == null) return;
    var type = tabPnl.selection.text.replace(/\s+.+/g, '').toLowerCase();
    var f = new File(fol + '/' + doc.name.replace(/\.[^\.]+$/, '') + '_' + type + '.txt');

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
      alert( MSG.exSuccess.replace(/\*/, decodeURIComponent(f.name)) );
    }
  }

  // Preview new item names in the tabs
  preview.onClick = function () {
    absTabData.prvwTitle.text = lyrsTabData.prvwTitle.text = MSG.prvwOn;
    if (pathsTabData.hasOwnProperty('prvwTitle')) {
      pathsTabData.prvwTitle.text = MSG.prvwOn;
    }

    previewNames(doc.artboards, CFG, PH, abs, absPH);
    previewNames(doc.layers, CFG, PH, lyrs, lyrsPH);
    previewNames(app.selection, CFG, PH, paths, pathsPH);
  }

  // Add elements to tab
  function addTabContent(tab, data, txt, name, placeholder) {
    // Paths tab when nothing is selected
    if (tab.text === txt.tabPath && !selLength) {
      var pathList = tab.add('group');
          pathList.alignment = 'center';
      pathList.add('statictext', undefined, txt.empty);

      return {};
    }

    var tabList = tab.add('group');
        tabList.orientation = 'column';

    // Title
    var header = tabList.add('group');
        header.alignment = 'left';

    var preHeader = header.add('group');
        preHeader.margins = [(CFG.isMac || CFG.aiVers == 16) ? 12 : 12, 0, 0, 0];
    var p = preHeader.add('statictext', undefined, txt.prefix);

    var nameHeader = header.add('group');
        nameHeader.margins = [(CFG.isMac || CFG.aiVers == 16) ? 90 : 130, 0, 0, 0];
    var n = nameHeader.add('statictext', undefined, name);
        n.characters = 16;

    var suffHeader = header.add('group');
        suffHeader.margins = [CFG.isMac ? 22 : (CFG.aiVers == 16 ? 46 : 30), 0, 0, 0];
    var s = suffHeader.add('statictext', undefined, txt.suffix);

    var selector = tabList.add('group');
        selector.orientation = 'row';
        selector.alignment = 'left';
  
    var headerAllPre = selector.add('group');
        headerAllPre.margins = [(CFG.isMac || CFG.aiVers == 16) ? 20 : 20, 0, 0, -6];
    var chkAllPre = headerAllPre.add('checkbox');
    
    var headerPrvw = selector.add('group');
        headerPrvw.margins = [CFG.isMac ? 106 : (CFG.aiVers == 16 ? 100 : 140), 0, 0, 0];
    var prvwTitle = headerPrvw.add('statictext', undefined, '');
        prvwTitle.characters = 17;
  
    var headerAllSuff = selector.add('group');
        headerAllSuff.margins = [CFG.isMac ? 20 : (CFG.aiVers == 16 ? 44 : 28), 0, 0, -6];
    var chkAllSuff = headerAllSuff.add('checkbox');

    // Item rows
    var scrollWin = tabList.add('group');
        scrollWin.alignChildren = 'fill';
    var pageListPanel = scrollWin.add('panel');
        pageListPanel.alignChildren = 'left';

    // Generate list
    if (data.state.length <= CFG.rows) { // Without scroll
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        rowItem = pageListPanel.add('group');
        rowItem.margins = [3, 0, 0, 0];
        addNewRow(tab, i, rowItem, data, chkAllPre, chkAllSuff, CFG.isMac, CFG.aiVers);
      }
    } else { // With scroll
      pageListPanel.maximumSize.height = CFG.listHeight;
      var smallList = pageListPanel.add('group');
          smallList.orientation = 'column';
          smallList.alignment = 'left';
          smallList.maximumSize.height = data.state.length * 100;

      var scroll = scrollWin.add('scrollbar');
          scroll.stepdelta = 30;
          scroll.preferredSize.width = 16;
          scroll.maximumSize.height = pageListPanel.maximumSize.height;
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        rowItem = smallList.add('group');
        addNewRow(tab, i, rowItem, data, chkAllPre, chkAllSuff, CFG.isMac, CFG.aiVers);
      }

      scroll.onChanging = function() {
        smallList.location.y = -1 * this.value;
      }
    }

    var extra = tab.add('group');
        extra.orientation = 'column';
        extra.alignChildren = ['fill', 'top'];
        extra.margins = [0, 20, 0, 0];

    var extraInpSize = [0, 0, (CFG.isMac || CFG.aiVers == 16) ? 108 : 140, 20];

    var preSuffGrp = extra.add('group');
        preSuffGrp.orientation = 'column';
        preSuffGrp.alignChildren = ['fill', 'top'];
        preSuffGrp.margins = [0, 0, 0, 10];

    var preSuffInp = preSuffGrp.add('group');
        preSuffInp.orientation = 'row';
        preSuffInp.alignChildren = ['left', 'top'];

    var preTitle = preSuffInp.add('statictext', undefined, txt.prefix);
    var pre = preSuffInp.add('edittext', extraInpSize, '');

    var suffTitle = preSuffInp.add('statictext', undefined, txt.suffix);
    var suff = preSuffInp.add('edittext', extraInpSize, '');

    var preSuffNote = preSuffGrp.add('statictext', undefined, placeholder, { multiline: true });
        preSuffNote.characters = 40;
        preSuffNote.alignment = 'fill';

    // Add find and replace
    var findRplcPnl = extra.add('panel', undefined, txt.findTitle);
        findRplcPnl.alignChildren = ['fill', 'top'];
        findRplcPnl.margins = [10, 15, 10, 10];

    var findRplcOn = findRplcPnl.add('checkbox', undefined, txt.enable);
        findRplcOn.value = CFG.isFind;

    var rangeStrGrp = findRplcPnl.add('group');

    var rangeRadioGrp = rangeStrGrp.add('group');
        rangeRadioGrp.enabled = CFG.isFind;
    var allRange = rangeRadioGrp.add('radiobutton', undefined, txt.all);
        allRange.value = true;
    var cstmRange = rangeRadioGrp.add('radiobutton', undefined, txt.range);

    var range = rangeRadioGrp.add('edittext', extraInpSize, '1, 3-5, 7');
        range.enabled = CFG.isFind;

    var findStrGrp = findRplcPnl.add('group');

    var findGrp = findStrGrp.add('group');
    var findTitle = findGrp.add('statictext', undefined, txt.find);
    var find = findGrp.add('edittext', extraInpSize, '');
        find.helpTip = txt.findHint;
        find.enabled = CFG.isFind;

    var rplcGrp = findStrGrp.add('group');
    var rplcTitle = rplcGrp.add('statictext', undefined, txt.rplc);
    var rplc = rplcGrp.add('edittext', extraInpSize, '');
        rplc.enabled = CFG.isFind;

    var findRplcNote = findRplcPnl.add('statictext', undefined, txt.ph);

    // TAB EVENTS

    // Select all prefixes
    chkAllPre.onClick = function () {
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        data.isPre[i].value = this.value;
        data.state[i][0] = this.value;
      }
      changeTabName(tab);
    }

    // Select all suffixes
    chkAllSuff.onClick = function () {
      for (var i = 0, osLen = data.state.length; i < osLen; i++) {
        data.isSuff[i].value = this.value;
        data.state[i][2] = this.value;
      }
      changeTabName(tab);
    }

    findRplcOn.onClick = function () {
      changeTabName(tab);
      find.enabled = rplc.enabled = this.value;
      data.isFind = this.value;
      rangeRadioGrp.enabled = this.value;
      data.range = '1-' + data.state.length;
    }

    pre.onChange = function() {
      data.pre = this.text;
      changeTabName(tab);
    }

    suff.onChange = function() {
      data.suff = suff.text;
      changeTabName(tab);
    }

    find.onChange = function() {
      data.find = this.text;
      changeTabName(tab);
    }

    rplc.onChange = function() {
      data.rplc = this.text;
      changeTabName(tab);
    }

    allRange.onClick = function () {
      range.enabled = false;
      data.range = '1-' + data.state.length;
    }

    cstmRange.onClick = function () {
      range.enabled = true;
      data.range = range.text;
    }

    range.onChange = function() {
      this.text = this.text.replace(/;/g, ',')
      data.range = this.text;
      changeTabName(tab);
    }

    var parent = (data.state.length <= CFG.rows) ? pageListPanel : smallList;
    
    for (var i = 0, pcLen = parent.children.length; i < pcLen; i++) {
      goToNextPrevName(data, i, pre, scroll, parent);
      // Reset preview when activating name field [2]
      parent.children[i].children[2].onActivate = function() {
        if (!isEmpty(prvwTitle.text)) {
          for (var j = 0, nLen = data.names.length; j < nLen; j++) {
            data.names[j].text = data.state[j][1]; // Restore original name
          }
        }
        prvwTitle.text = '';
      }
    }

    var obj = {
      pre:            extra     ? pre : undefined,
      suff:           extra     ? suff : undefined,
      find:           extra     ? find : undefined,
      rplc:           extra     ? rplc : undefined,
      range:          extra     ? range : undefined,
      prvwTitle:      prvwTitle ? prvwTitle : undefined,
      scroll:         scroll    ? scroll : undefined,
      smallList:      scroll    ? smallList : undefined,
      pageListPanel:  scroll    ? pageListPanel : undefined,
    }

    return obj;
  }

  // Add row with prefix checkbox, name and suffix checkbox
  function addNewRow(tab, idx, row, obj, allPre, allSuff, isMac, aiVers) {
    var dummyPre = row.add('group');
        dummyPre.margins = [0, (!isMac && aiVers == 16) ? 0 : 5, 0, 0]; // Vertical align
    obj.isPre[idx] = dummyPre.add('checkbox');
    obj.isPre[idx].value = obj.state[idx][0];

    obj.isPre[idx].onClick = function() {
      obj.state[idx][0] = !obj.state[idx][0];
      if (!obj.isPre[idx].value) allPre.value = false;
      changeTabName(tab);
    }

    // Add order number
    var order = row.add('statictext');
    order.text = padZero(idx + 1, obj.state.length.toString().length);
    
    obj.names[idx] = row.add('edittext', [0, 0, isMac ? 244 : (aiVers > 16 ? 320 : 230), 20]);
    obj.names[idx].text = obj.state[idx][1];
    obj.names[idx].onChange = function () {
      if (isEmpty(this.text)) {
        this.text = obj.state[idx][1];
      } else {
        obj.state[idx][1] = this.text;
      }
      changeTabName(tab);
    }

    var dummySuff = row.add('group');
        dummySuff.margins = [0, (!isMac && aiVers == 16) ? 0 : 5, 0, 0]; // Vertical align
    obj.isSuff[idx] = dummySuff.add('checkbox');
    obj.isSuff[idx].value = obj.state[idx][2];

    obj.isSuff[idx].onClick = function() {
      obj.state[idx][2] = !obj.state[idx][2];
      if (!obj.isSuff[idx].value) allSuff.value = false;
      changeTabName(tab);
    }
  }

  // Change tab name after any action
  function changeTabName(tab) {
    if (!/\*/g.test(tab.text)) tab.text += ' *';
  }

  // Moves to the next and previous name using the Up and Down keys
  function goToNextPrevName(obj, idx, pre, scroll, scrollList) {
    var length = obj.names.length;
    obj.names[idx].addEventListener('keydown', function (kd) {
      // Go to next name
      if (kd.keyName == 'Down' && (idx + 1) < length) {
        // Update the scrollbar position when the Down key is pressed
        if (idx !== 0 && scroll) {
          scroll.value = (idx + 1) * (scroll.maxvalue / length);
          scrollList.location.y += -1 * scroll.stepdelta;
        }
        obj.isPre[idx].active = true;
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
        obj.isPre[idx].active.active = true;
        obj.names[idx - 1].active = true;
        win.update();
        kd.preventDefault();
      }

      // Go to prefix after last name
      if (kd.keyName == 'Down' && (idx + 1) == length) {
        obj.isPre[idx].active = true;
        pre.active = true;
        win.update();
        kd.preventDefault();
      }
    });

    pre.addEventListener('keydown', function (kd) {
      // Go to last name from prefix
      if (kd.keyName == 'Up') {
        obj.isPre[obj.names.length - 1].active = true;
        obj.names[obj.names.length - 1].active = true;
        win.update();
        kd.preventDefault();
      }
    });
  }

  // Fix scrollbar size for the dialog
  function setScrollMax(obj, delta) {
    if (obj.hasOwnProperty('scroll')) {
      obj.scroll.maxvalue = obj.smallList.size.height - obj.pageListPanel.size.height + delta;
    }
  }

  // Copyright link
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  // Save prefix, suffix, find and replace values
  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name),
        absPrefs = setSettingsString(abs),
        lyrsPrefs = setSettingsString(lyrs),
        pathsPrefs = setSettingsString(paths),
        activeTab = 0;

    if (tabPnl.selection.text.match(MSG.tabLyr)) activeTab = 1;
    if (tabPnl.selection.text.match(MSG.tabPath)) activeTab = 2;

    $file.encoding = 'UTF-8';
    $file.open('w');

    var pref = {};
    pref.abs = absPrefs;
    pref.layers = lyrsPrefs;
    pref.paths = pathsPrefs;
    pref.tab = activeTab;

    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  function setSettingsString(obj) {
    return [obj.pre, obj.suff, obj.find, obj.rplc, obj.range].join(';');
  }
  
  // Load prefix, suffix, find and replace values
  function loadSettings() {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          loadSettingsString(abs, absTabData, pref.abs.split(';'));
          loadSettingsString(lyrs, lyrsTabData, pref.layers.split(';'));
          loadSettingsString(paths, pathsTabData, pref.paths.split(';'));
          tabPnl.selection = isNaN(pref.tab) ? 0 : pref.tab * 1;
        }
      } catch (e) {}
    }
  }

  function loadSettingsString(obj, tabData, arr) {
    if (tabData.hasOwnProperty('pre')) {
      if (arr[0]) obj.pre  = tabData.pre.text  = arr[0];
      if (arr[1]) obj.suff = tabData.suff.text = arr[1];
      if (arr[2]) obj.find = tabData.find.text = arr[2];
      if (arr[3]) obj.rplc = tabData.rplc.text = arr[3];
      if (arr[4]) obj.range = tabData.range.text = arr[4];
    }
  }

  function okClick() {
    renameObjects(doc.artboards, CFG, PH, abs, absPH);
    renameObjects(doc.layers, CFG, PH, lyrs, lyrsPH);
    renameObjects(app.selection, CFG, PH, paths, pathsPH);
    saveSettings();
    win.close();
  }

  win.center();
  win.show();
}

// GLOBAL FUNCTIONS

// Initialize an object to store data
function initObject(isFind) {
  var obj = {
    find: '',
    isFind: isFind,
    isPre: [],
    isSuff: [],
    names: [],
    pre: '',
    range: '',
    rplc: '',
    state: [],
    suff: '',
  };

  return obj;
}

// Initialize an object to store placeholders
function initPlaceholders(type, ph) {
  var obj = {
    nd: ph.numDown,
    nu: ph.numUp,
  };

  if (type === 'artboards') {
    obj.c   = ph.color;
    obj.d   = ph.date;
    obj.fn  = ph.fName;
    obj.h   = ph.height;
    obj.u   = ph.units;
    obj.w   = ph.width;
  } else if (type === 'layers') {
    obj.fn  = ph.fName;
  } else if (type === 'paths') {
    obj.h   = ph.height;
    obj.u   = ph.units;
    obj.w   = ph.width;
  }

  return obj;
}

// Collect prefix, object name, suffix, and index
function initData(src, result) {
  for (var i = 0, len = src.length; i < len; i++) {
    var name = getName(src[i]);
    result.push([false, name, false, i]);
  }
}

// Get item name of different types
function getName(item) {
  var str = '';

  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    str = item.contents;
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    str = item.symbol.name;
  } else {
    str = item.name;
  }

  return str;
}

// Check empty string
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Output artboard indexes as text
function showAbIndex(layer, color) {
  if (arguments.length == 1 || color == undefined) color = [0, 0, 0];

  var doc = activeDocument,
      idxColor = setRGBColor(color),
      tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(layer);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = layer;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i],
        abWidth = currAb.artboardRect[2] - currAb.artboardRect[0],
        abHeight = currAb.artboardRect[1] - currAb.artboardRect[3],
        label = tmpLayer.textFrames.add(),
        labelSize = (abWidth >= abHeight) ? abHeight / 2 : abWidth / 2;
    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = idxColor;
    label.position = [currAb.artboardRect[0], currAb.artboardRect[1]];
  }

  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  } else {
    app.redraw();
  }

  tmpLayer.remove();
}

// Generate solid RGB color
function setRGBColor(rgb) {
  var color = new RGBColor();
  color.red = rgb[0];
  color.green = rgb[1];
  color.blue = rgb[2];

  return color;
}

// Read text from a file
function parseFromText(f) {
  f.open('r');
  var contents = f.read();
  var lines = contents.split(/\n|\r|\r\n/);
  f.close();

  return lines;
}

// Write text to a file
function writeToText(str, f) {
  f.open('w');
  f.write(str);
  f.close();
}

// Preview new name in input field
function previewNames(src, cfg, cfgPh, obj, objPh) {
  var nameArr = generateNames(src, cfg, cfgPh, obj, objPh);

  for (var i = 0, len = obj.names.length; i < len; i++) {
    obj.names[i].text = nameArr[i];
  }
}

// Rename objects in a collection
function renameObjects(target, cfg, cfgPh, obj, objPh) {
  if (!target.length) return;

  var nameArr = generateNames(target, cfg, cfgPh, obj, objPh);
  var currTarget, currName;

  for (var i = 0, len = nameArr.length; i < len; i++) {
    currTarget = target[i];
    currName = nameArr[i];
    if (isEmpty(currTarget.name) && currTarget.contents === currName) continue;
    currTarget.name = currName; // Name is modified
  }
}

// Generate new name
function generateNames(target, cfg, cfgPh, obj, objPh) {
  var result = [];
  var findList = parseAndFilterIndexes(obj.range, obj.state.length - 1);

  var cnt = getStartingNum(cfgPh, obj, objPh);
  var amountUp = Math.abs(cnt.up) + target.length;
  var amountDown = Math.abs(cnt.down) + target.length;

  var newName = '', isPre = false, isSuff = false;
  var cntUp = '', cntDown = '' , tmpPre = '', tmpSuff = '';
  var isInRange = false;

  for (var i = 0, len = obj.state.length; i < len; i++) {
    isInRange = isIncludeNum(findList, i);
    newName = findAndReplace(cfgPh, obj, i, isInRange);
    isPre = obj.state[i][0];
    isSuff = obj.state[i][2];
    cntUp = padZero(cnt.up, amountUp.toString().length);
    cntDown = padZero(cnt.down, amountDown.toString().length);
    
    if (isPre) {
      tmpPre = rplcPlaceholder(obj.state[i], cntUp, cntDown, obj.pre, cfg, target, objPh);
    }

    if (isSuff) { 
      tmpSuff = rplcPlaceholder(obj.state[i], cntUp, cntDown, obj.suff, cfg, target, objPh);
    }

    cnt.up = changeCounter(cnt.up, obj.pre, obj.suff, objPh.nu, isPre, isSuff, true);
    cnt.down = changeCounter(cnt.down, obj.pre, obj.suff, objPh.nd, isPre, isSuff, false);

    result.push(tmpPre + newName + tmpSuff);
    cntUp = '', cntDown = '' , tmpPre = '', tmpSuff = '';
  }

  return result;
}

// Get an array of item indexes from a range string
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

// Find first placeholder with number
function getStartingNum(cfgPh, obj, objPh) {
  var tmpNumUp = cfgPh.numUp.substr(0, 4), // Part of the placeholder before number
      tmpNumDown = cfgPh.numDown.substr(0, 4),
      tmpPreSuff = (obj.pre + obj.suff).toLocaleLowerCase();

  // Parse number up from string
  var startIdxNumUp = tmpPreSuff.indexOf(tmpNumUp) + tmpNumUp.length,
      endIdxNumUp = tmpPreSuff.indexOf('}', startIdxNumUp);
  var cntUp = 1 * tmpPreSuff.substring(startIdxNumUp, endIdxNumUp);
  if (isNaN(cntUp)) cntUp = 0;
  objPh.nu = tmpNumUp + cntUp + '}';
  
  // Parse number down from string
  var startIdxNumDown = tmpPreSuff.indexOf(tmpNumDown) + tmpNumUp.length,
      endIdxNumDown = tmpPreSuff.indexOf('}', startIdxNumDown);
  var cntDown = 1 * tmpPreSuff.substring(startIdxNumDown, endIdxNumDown);
  if (isNaN(cntDown)) cntDown = 0;
  objPh.nd = tmpNumDown + cntDown + '}';

  return { 'up': cntUp, 'down': cntDown };
}

// Check for value in array
function isIncludeNum(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      return true;
    }
  }

  return false;
}

// Find and replace in old name
function findAndReplace(cfgPh, obj, idx, isInRange) {
  var result = obj.state[idx][1];

  if (obj.isFind && isInRange && (obj.find.length || !isEmpty(obj.find))) {
    if (obj.find.match(cfgPh.name) != null) {
      result = obj.rplc;
    } else {
      var regex = new RegExp(obj.find, 'gi');
      result = result.replace(regex, obj.rplc);
    }
  }

  return result;
}

// Add leading zero to number
function padZero(number, size) {
  var minus = (number < 0) ? '-' : '',
      str = '00000000000' + Math.abs(number);

  return minus + str.slice(str.length - size);
}

// Replace placeholders in suffix or prefix with text
function rplcPlaceholder(row, cntUp, cntDown, str, cfg, target, ph) {
  var name = activeDocument.name.replace(/\.[^\.]+$/, ''),
      units = getUnits(),
      width = height = 0,
      color = /rgb/i.test(activeDocument.documentColorSpace) ? 'RGB' : 'CMYK';

  switch (target[0].typename) {
    case 'Artboard':
      var currAb = activeDocument.artboards[row[3]];
      width = currAb.artboardRect[2] - currAb.artboardRect[0];
      height = currAb.artboardRect[1] - currAb.artboardRect[3];
      break;
    case 'Layer':
      break;
    default:
      var item = app.selection[row[3]];
      if (item.typename === 'GroupItem' && item.clipped) {
        item = getMaskPath(item);
      }
      width = item.width;
      height = item.height;
      break;
  }
  
  width = ( cfg.sf * convertUnits(width, 'px', units) ).toFixed(cfg.precision);
  height = ( cfg.sf * convertUnits(height, 'px', units) ).toFixed(cfg.precision);

  for (var prop in ph) {
    // Fix for LAScripts extension users
    if (/function/i.test(ph[prop])) continue;

    var regex = new RegExp(ph[prop], 'gi');
    if (str.match(regex)) {
      var val;
      switch (ph[prop]) {
        case ph.u:
          val = units;
          break;
        case ph.fn:
          val = name;
          break;
        case ph.d:
          val = getTodayDate();
          break;
        case ph.c:
          val = color;
          break;
        case ph.nu:
          val = cntUp;
          break;
        case ph.nd:
          val = cntDown;
          break;
        case ph.h:
          val = height.replace('.', cfg.decimal);
          break;
        case ph.w:
          val = width.replace('.', cfg.decimal);
          break;
      }

      str = str.replace(regex, val);
    }
  }

  return str;
}

// Change counter for active prefix or suffix
function changeCounter(num, pre, suff, ph, isPre, isSuff, isUp) {
  var regex = new RegExp(ph, 'gi');

  if ((isPre && regex.test(pre)) || (isSuff && regex.test(suff))) {
    num = isUp ? num + 1 : num - 1;
  }

  return num;
}

// Get data as YYYYMMDD format
function getTodayDate() {
  var date = new Date(),
      mm = date.getMonth() + 1,
      dd = date.getDate();

  return [date.getFullYear(), (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd].join('');
}

// Get clipping mask
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];

    if (isClippingPath(currItem)) {
      return currItem;
    }
  }

  // Return if no clipping path is found
  return group;
}

// Check clipping mask
function isClippingPath(item) {
  var clipText = (item.typename === 'TextFrame' &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (item.typename === 'CompoundPathItem' && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Get active document ruler units
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

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Open link in browser
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
} catch (e) {}