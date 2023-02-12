/*
  BatchRenamer.jsx for Adobe Illustrator
  Description: Script for batch renaming artboards, layers & selected items manually or by placeholders
  Date: February, 2023

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
  
  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2023 (Mac/Win).
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
  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  var SCRIPT = {
        name:     'Batch Renamer',
        version:  'v.1.2.4'
      },
      CFG = {
        decimal:    ',', // Decimal separator point or comma for width and height
        defTab:     0, // Default tab. 0 - Artboard, 1 - Layer, 2 - Path
        idxColor:   [255, 0, 0], // Artboard index color
        isFind:     false, // Default Find and Replace state
        isMac:      /mac/i.test($.os),
        listHeight: 5 * 32,
        precision:  2, // Rounding the artboard or the path width and height to decimal places
        rows:       5, // Amount of visible rows
        sf:         activeDocument.scaleFactor ? activeDocument.scaleFactor : 1, // Scale factor for Large Canvas mode
        tmpLyr:     'ARTBOARD_INDEX',
        uiOpacity:  .97, // UI window opacity. Range 0-1
      },
      PH = { // Placeholders
        color:    '{c}',
        date:     '{d}',
        fName:    '{fn}',
        height:   '{h}',
        name:     '{n}',
        numDown:  '{nd:0}',
        numUp:    '{nu:0}',
        units:    '{u}',
        width:    '{w}',
      },
      SETTINGS = {
        name:   SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      MSG = {
        cancel:       'Cancel',
        copyright:    '\u00A9 Sergey Osokin. Visit Github',
        empty:        'No paths are selected',
        enable:       'Enable',
        find:         'Find',
        nameAb:       'Artboard name',
        nameLyr:      'Layer name',
        namePath:     'Path name',
        ok:           'Ok',
        ph:           'Placeholder: ' + PH.name + ' - current artboard name',
        prefix:       'Prefix',
        prvw:         'Preview',
        prvwOn:       'PREVIEW ON',
        rplc:         'Replace',
        suffix:       'Suffix',
        tabAb:        'ARTBOARD',
        tabLyr:       'LAYER',
        tabPath:      'PATH',
        preSuffAb:    'Placeholders:\n' +
                      PH.width + ' - artboard width, ' +
                      PH.height + ' - artboard height, ' +
                      PH.units + ' - ruler units, ' +
                      PH.numUp + ' - auto-number \u2191 with start from, ' + // ascending
                      PH.numDown + ' - number \u2193,\n' + // descending
                      PH.color + ' - file color space, ' + 
                      PH.date + ' - current date as YYYYMMDD,\n' +
                      PH.fName + ' - file name',
        preSuffLyr:   'Placeholders:\n' +
                      PH.numUp + ' - auto-number \u2191 with start from,\n' + // ascending
                      PH.numDown + ' - auto-number \u2193 with start from, ' + // descending
                      PH.fName + ' - file name',
        preSuffPath:  'Placeholders:\n' +
                      PH.numUp + ' - auto-number \u2191 with start from, ' + // ascending
                      PH.numDown + ' - number \u2193,\n' + // descending
                      PH.width + ' - object width, ' +
                      PH.height + ' - object height, ' +
                      PH.units + ' - ruler units',
      };

  var doc = app.activeDocument,
      abs = { // Artboards
        find:   '',
        isFind: CFG.isFind,
        isPre:  [],
        isSuff: [],
        names:  [],
        pre:    '',
        rplc:   '',
        state:  [],
        suff:   '',
      },
      lyrs = {  // Layers
        find:   '',
        isFind: CFG.isFind,
        isPre:  [],
        isSuff: [],
        names:  [],
        pre:    '',
        rplc:   '',
        state:  [],
        suff:   '',
      },
      paths = { // Selected paths
        find:   '',
        isFind: CFG.isFind,
        isPre:  [],
        isSuff: [],
        names:  [],
        pre:    '',
        rplc:   '',
        state:  [],
        suff:   '',
      },
      absPlaceholder = {
        c:  PH.color,
        d:  PH.date,
        fn: PH.fName,
        h:  PH.height,
        nd: PH.numDown,
        nu: PH.numUp,
        u:  PH.units,
        w:  PH.width,
      },
      lyrsPlaceholder = {
        fn: PH.fName,
        nd: PH.numDown,
        nu: PH.numUp,
      },
      pathsPlaceholder = {
        h:  PH.height,
        nd: PH.numDown,
        nu: PH.numUp,
        u:  PH.units,
        w:  PH.width,
      },
      rowItem = []; // List rows

  // Init prefix, index, name and suffix
  initData(doc.artboards, abs.state);
  initData(doc.layers, lyrs.state);
  initData(selection, paths.state);

  // Create UI
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.opacity = CFG.uiOpacity;

  // Tabs and properties
  var tabPnl = dialog.add('tabbedpanel'); 
      tabPnl.alignChildren = 'fill'; 

  var absTab = tabPnl.add('tab', undefined, MSG.tabAb); // Artboard
  var lyrsTab = tabPnl.add('tab', undefined, MSG.tabLyr); // Layer
  var pathsTab = tabPnl.add('tab', undefined, MSG.tabPath);  // Path

  absTab.margins = lyrsTab.margins = pathsTab.margins = [10, 20, 0, 5];
  tabPnl.selection = CFG.defTab;

  var absTabData = addTabContent(absTab, abs, CFG, MSG, MSG.nameAb, MSG.preSuffAb);
  var lyrsTabData = addTabContent(lyrsTab, lyrs, CFG, MSG, MSG.nameLyr, MSG.preSuffLyr);
  var pathsTabData = addTabContent(pathsTab, paths, CFG, MSG, MSG.namePath, MSG.preSuffPath);
  
  var btns = dialog.add('group');
      btns.margins = [0, 10, 0, 0];
      btns.alignment = 'center';

  var preview = btns.add('button', undefined, MSG.prvw);
  var cancel = btns.add('button', undefined, MSG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, MSG.ok, { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, MSG.copyright);
      copyright.justify = 'center';

  loadSettings();

  dialog.onShow = function () {
    showAbIndex(CFG.tmpLyr, CFG.idxColor);
    var delta = 20;
    setScrollMax(absTabData, delta);
    setScrollMax(lyrsTabData, delta);
    setScrollMax(pathsTabData, delta);
  }

  // Preview new item names in the tabs
  preview.onClick = function () {
    absTabData.prvwTitle.text = lyrsTabData.prvwTitle.text = MSG.prvwOn;
    if (typeof pathsTabData.prvwTitle !== 'undefined') {
      pathsTabData.prvwTitle.text = MSG.prvwOn;
    }

    applyPrvwName(doc.artboards, CFG, PH, abs, absPlaceholder);
    applyPrvwName(doc.layers, CFG, PH, lyrs, lyrsPlaceholder);
    applyPrvwName(selection, CFG, PH, paths, pathsPlaceholder);
  }

  cancel.onClick = function () {
    removeAbIndex(CFG.tmpLyr);
    dialog.close();
  }

  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  dialog.center();
  dialog.show();

  // DIALOG LOCAL FUNCTIONS

  function okClick() {
    removeAbIndex(CFG.tmpLyr);
    rename(doc.artboards, CFG, PH, abs, absPlaceholder);
    rename(doc.layers, CFG, PH, lyrs, lyrsPlaceholder);
    rename(selection, CFG, PH, paths, pathsPlaceholder);
    saveSettings();
    dialog.close();
  }

  function addTabContent(tab, obj, cfg, txt, name, placeholder) {
    // Path tab content
    if (tab.text === txt.tabPath && !selection.length) {
      var pathList = tab.add('group');
          pathList.alignment = 'center';
      pathList.add('statictext', undefined, txt.empty);
    } else {
      var tabList = tab.add('group');
          tabList.orientation = 'column';
      
      var header = tabList.add('group');
          header.alignment = 'left';
    
      var preHeader = header.add('group');
          preHeader.margins = [12, 0, 0, 0];
      var p = preHeader.add('statictext', undefined, txt.prefix);

      var nameHeader = header.add('group');
          nameHeader.margins = [90, 0, 0, 0];
      var n = nameHeader.add('statictext', undefined, name);
          n.characters = 16;

      var suffHeader = header.add('group');
      if (cfg.isMac) suffHeader.margins = [22, 0, 0, 0];
      else suffHeader.margins = [-2, 0, 0, 0];
      var s = suffHeader.add('statictext', undefined, txt.suffix);
    
      var selector = tabList.add('group');
          selector.orientation = 'row';
          selector.alignment = 'left';
    
      var headerAllPre = selector.add('group');
          headerAllPre.margins = [20, 0, 0, -6];
      var chkAllPre = headerAllPre.add('checkbox');
      
      var headerPrvw = selector.add('group');
      if (cfg.isMac) headerPrvw.margins = [106, 0, 0, 0];
      else headerPrvw.margins = [102, 0, 0, 0];
      var prvwTitle = headerPrvw.add('statictext', undefined, '');
          prvwTitle.characters = 17;
    
      var headerAllSuff = selector.add('group');
      if (cfg.isMac) headerAllSuff.margins = [20, 0, 0, -6];
      else headerAllSuff.margins = [-16, 0, 0, -6];
      var chkAllSuff = headerAllSuff.add('checkbox');

      var scrollWin = tabList.add('group');
          scrollWin.alignChildren = 'fill';
      var pageListPanel = scrollWin.add('panel');
          pageListPanel.alignChildren = 'left';
    
      if (obj.state.length <= cfg.rows) { // Generate list without scroll
        for (var i = 0, osLen = obj.state.length; i < osLen; i++) {
          rowItem = pageListPanel.add('group');
          rowItem.margins = [3, 0, 0, 0];
          addNewRow(tab, i, rowItem, obj, chkAllPre, chkAllSuff);
        }
      } else { // Generate list with scroll
        pageListPanel.maximumSize.height = cfg.listHeight;
        var smallList = pageListPanel.add('group');
            smallList.orientation = 'column';
            smallList.alignment = 'left';
            smallList.maximumSize.height = obj.state.length * 100;
        
        var scroll = scrollWin.add('scrollbar');
            scroll.stepdelta = 30;
            scroll.preferredSize.width = 16;
            scroll.maximumSize.height = pageListPanel.maximumSize.height;
        for (var i = 0, osLen = obj.state.length; i < osLen; i++) {
          rowItem = smallList.add('group');
          addNewRow(tab, i, rowItem, obj, chkAllPre, chkAllSuff);
        }
      
        scroll.onChanging = function() {
          smallList.location.y = -1 * this.value;
        }
      }

      var extra = tab.add('group');
          extra.orientation = 'column';
          extra.margins = [0, 20, 0, 0];

      var extraInpSize = (obj.state.length <= cfg.rows) ? [0, 0, 128, 20] : [0, 0, 142, 20];

      var preSuffGrp = extra.add('group');
          preSuffGrp.orientation = 'row';

      var preTitle = preSuffGrp.add('statictext', undefined, txt.prefix);
      var pre = preSuffGrp.add('edittext', extraInpSize, '');

      var suffTitle = preSuffGrp.add('statictext', undefined, txt.suffix);
      var suff = preSuffGrp.add('edittext', extraInpSize, '');

      var preSuffNote = extra.add('statictext', [0, 0, 350, 75], placeholder, {multiline: true});

      // Simulate a dividing line
      var border = extra.add('panel');
          border.alignment = ['fill', 'fill'];
          border.minimumSize.height = border.maximumSize.height = 2;

      // Add find and replace
      var findRplcGrp = extra.add('group');
          findRplcGrp.orientation = 'row';
          findRplcGrp.margins = [0, 20, 0, 0];

      var findTitle = findRplcGrp.add('statictext', undefined, txt.find);
      var find = findRplcGrp.add('edittext', extraInpSize, '');
          find.enabled = cfg.isFind;
          
      var rplcTitle = findRplcGrp.add('statictext', undefined, txt.rplc);
      var rplc = findRplcGrp.add('edittext', extraInpSize, '');
          rplc.enabled = cfg.isFind;

      var findRplcNote = extra.add('statictext', undefined, txt.ph);
      var findRplcOn = extra.add('checkbox', undefined, txt.enable);
          findRplcOn.value = cfg.isFind;
      
      // TAB EVENTS

      // Select all prefixes
      chkAllPre.onClick = function () {
        for (var i = 0, osLen = obj.state.length; i < osLen; i++) {
          obj.isPre[i].value = this.value;
          obj.state[i][0] = this.value;
        }
        changeTabName(tab);
      }

      // Select all suffixes
      chkAllSuff.onClick = function () {
        for (var i = 0, osLen = obj.state.length; i < osLen; i++) {
          obj.isSuff[i].value = this.value;
          obj.state[i][2] = this.value;
        }
        changeTabName(tab);
      }

      findRplcOn.onClick = function () {
        changeTabName(tab);
        find.enabled = rplc.enabled = !find.enabled;
        obj.isFind = !obj.isFind;
      }

      pre.onChange = function() {
        obj.pre = pre.text;
        changeTabName(tab);
      }

      suff.onChange = function() {
        obj.suff = suff.text;
        changeTabName(tab);
      }

      find.onChange = function() {
        obj.find = find.text;
        changeTabName(tab);
      }

      rplc.onChange = function() {
        obj.rplc = rplc.text;
        changeTabName(tab);
      }

      var parent = (obj.state.length <= cfg.rows) ? pageListPanel : smallList;
      
      for (var i = 0, pcLen = parent.children.length; i < pcLen; i++) {
        goToNextPrevName(obj, i, pre, scroll, parent);
        // Reset preview
        parent.children[i].children[2].onActivate = function() { // Name input
          if (!isEmpty(prvwTitle.text)) {
            for (var j = 0, nLen = obj.names.length; j < nLen; j++) {
              obj.names[j].text = obj.state[j][1]; // Restore original name
            }
          }
          prvwTitle.text = '';
        }
      }
    }

    var out = {
      pre:            (extra == undefined)      ? undefined : pre,
      suff:           (extra == undefined)      ? undefined : suff,
      find:           (extra == undefined)      ? undefined : find,
      rplc:           (extra == undefined)      ? undefined : rplc,
      prvwTitle:      (prvwTitle == undefined)  ? undefined : prvwTitle,
      scroll:         (scroll == undefined)     ? undefined : scroll,
      smallList:      (scroll == undefined)     ? undefined : smallList,
      pageListPanel:  (scroll == undefined)     ? undefined : pageListPanel,
    }

    return out;
  }

  // Add row with prefix checkbox, name and suffix checkbox
  function addNewRow(tab, idx, row, obj, allPre, allSuff) {
    obj.isPre[idx] = row.add('checkbox');
    obj.isPre[idx].value = obj.state[idx][0];

    obj.isPre[idx].onClick = function() {
      obj.state[idx][0] = !obj.state[idx][0];
      if (!obj.isPre[idx].value) allPre.value = false; 
      changeTabName(tab);
    }

    // Add order number
    var order = row.add('statictext');
    order.text = fillZero(idx + 1, obj.state.length.toString().length);
    
    obj.names[idx] = row.add('edittext', [0, 0, 240, 20]);
    obj.names[idx].characters = 50;
    obj.names[idx].text = obj.state[idx][1];
    obj.names[idx].onChange = function () {
      if (isEmpty(this.text)) {
        this.text = obj.state[idx][1];
      } else {
        obj.state[idx][1] = this.text;
      }
      changeTabName(tab);
    }

    obj.isSuff[idx] = row.add('checkbox');
    obj.isSuff[idx].value = obj.state[idx][2];
    obj.isSuff[idx].onClick = function() {
      obj.state[idx][2] = !obj.state[idx][2];
      if (!obj.isSuff[idx].value) allSuff.value = false;
      changeTabName(tab);
    }
  }

  // Change tab name after action
  function changeTabName(tab) {
    var marker = '\\*';
    var reg = new RegExp (marker, 'g');
    if (tab.text.match(reg) == null) {
      tab.text += ' ' + marker.slice(-1);
    }
  }

  // Moves to the next and previous name using the Up and Down keys
  function goToNextPrevName(obj, idx, pre, scroll, scrollList) {
    obj.names[idx].addEventListener('keydown', function (kd) {
      // Go to next name
      if (kd.keyName == 'Down' && (idx + 1) < obj.names.length) {
        // Update the scrollbar position when the Down key is pressed
        if (idx != 0 && typeof scroll !== 'undefined') {
          scroll.value = (idx + 1) * (scroll.maxvalue / obj.names.length);
          scrollList.location.y += -1 * scroll.stepdelta;
        }
        obj.isPre[idx].active = true;
        obj.names[idx + 1].active = true;
        dialog.update();
        kd.preventDefault();
      }

      // Go to previous name
      if (kd.keyName == 'Up' && (idx - 1 >= 0)) {
        // Update the scrollbar position when the Up key is pressed
        if ((idx + 1 < obj.names.length) && typeof scroll !== 'undefined') {
          scroll.value = (idx - 1) * (scroll.maxvalue / obj.names.length);
          scrollList.location.y += 1 * scroll.stepdelta;
        }
        obj.isPre[idx].active.active = true;
        obj.names[idx - 1].active = true;
        dialog.update();
        kd.preventDefault();
      }

      // Go to prefix after last name
      if (kd.keyName == 'Down' && (idx + 1) == obj.names.length) {
        obj.isPre[idx].active = true;
        pre.active = true;
        dialog.update();
        kd.preventDefault();
      }
    });

    pre.addEventListener('keydown', function (kd) {
      // Go to last name from prefix
      if (kd.keyName == 'Up') {
        obj.isPre[obj.names.length - 1].active = true;
        obj.names[obj.names.length - 1].active = true;
        dialog.update();
        kd.preventDefault();
      }
    });
  }

  // Fix scrollbar size for the dialog
  function setScrollMax(obj, delta) {
    if (typeof obj.scroll !== 'undefined') {
      obj.scroll.maxvalue = obj.smallList.size.height - obj.pageListPanel.size.height + delta;
    }
  }

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
    return [obj.pre, obj.suff, obj.find, obj.rplc].join(';');
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
    if (typeof tabData.pre !== 'undefined') {
      obj.pre  = tabData.pre.text  = arr[0];
      obj.suff = tabData.suff.text = arr[1];
      obj.find = tabData.find.text = arr[2];
      obj.rplc = tabData.rplc.text = arr[3];
    }
  }
}

// GLOBAL FUNCTIONS

// Init prefix, index, name and suffix
function initData(src, out) {
  for (var i = 0, len = src.length; i < len; i++) {
    out.push([false, src[i].name, false, i]);
  }
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
    app.executeMenuCommand('preview');
    app.executeMenuCommand('preview');
  } else {
    redraw();
  }
}

// Generate solid RGB color
function setRGBColor(rgb) {
  var c = new RGBColor();
  c.red = rgb[0];
  c.green = rgb[1];
  c.blue = rgb[2];
  return c;
}

// Remove temp layer with artboard indexes
function removeAbIndex(layer) {
  try {
    var layerToRm = activeDocument.layers.getByName(layer);
    layerToRm.remove();
  } catch (e) {}
}

// Preview the new name in the input field
function applyPrvwName(src, cfg, cfgPh, obj, objPh) {
  var nameArr = generateName(src, cfg, cfgPh, obj, objPh);
  for (var i = 0, len = obj.names.length; i < len; i++) {
    obj.names[i].text = nameArr[i];
  }
}

function rename(target, cfg, cfgPh, obj, objPh) {
  if (!target.length) return;
  var nameArr = generateName(target, cfg, cfgPh, obj, objPh);
  for (var i = 0, len = nameArr.length; i < len; i++) {
    target[i].name = nameArr[i];
  }
}

// Generate new name
function generateName(target, cfg, cfgPh, obj, objPh) {
  var out = [],
      cnt = getStartingNum(cfgPh, obj, objPh),
      amountUp = Math.abs(cnt.up) + target.length,
      amountDown = Math.abs(cnt.down) + target.length;

  for (var i = 0, len = obj.state.length; i < len; i++) {
    var newName = findAndReplace(cfgPh, obj, i),
        isPre = obj.state[i][0],
        isSuff = obj.state[i][2],
        cntUp = fillZero(cnt.up, amountUp.toString().length),
        cntDown = fillZero(cnt.down, amountDown.toString().length); 
    
    var tmpPre = '';
    if (isPre) {
      tmpPre = rplcPlaceholder(obj.state[i], cntUp, cntDown, obj.pre, cfg, target, objPh);
    }

    var tmpSuff = '';
    if (isSuff) { 
      tmpSuff = rplcPlaceholder(obj.state[i], cntUp, cntDown, obj.suff, cfg, target, objPh);
    }

    cnt.up = changeCounter(cnt.up, obj.pre, obj.suff, objPh.nu, isPre, isSuff, true);
    cnt.down = changeCounter(cnt.down, obj.pre, obj.suff, objPh.nd, isPre, isSuff, false);

    out.push(tmpPre + newName + tmpSuff);
  }

  return out;
}

// Search for the first placeholder with the number
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

// Find and replace in old name
function findAndReplace(cfgPh, obj, idx) {
  var outName = obj.state[idx][1];
  if (obj.isFind && (obj.find.length || obj.find !== '')) {
    if (obj.find.match(cfgPh.name) != null) {
      outName = obj.rplc;
    } else {
      var regName = new RegExp(obj.find, 'gi');
      outName = outName.replace(regName, obj.rplc);
    }
  }

  return outName;
}

// Replace the placeholders in the suffix or prefix with text
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
      var item = selection[row[3]];
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
    var reg = new RegExp(ph[prop], 'gi');
    if (str.match(reg)) {
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

      str = str.replace(reg, val);
    }
  }

  return str;
}

// Change counter for active prefix or suffix
function changeCounter(cnt, pre, suff, ph, isPre, isSuff, isUp) {
  var regUp = new RegExp(ph, 'gi');
  if ((isPre && pre.match(regUp) != null) ||
      (isSuff && suff.match(regUp) != null)) {
    if (isUp) cnt++;
    else cnt--;
  }

  return cnt;
}

// Add zero to the file name before the indexes are less then size
function fillZero(number, size) {
  var minus = (number < 0) ? '-' : '',
      str = '00000000000' + Math.abs(number);

  return minus + str.slice(str.length - size);
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