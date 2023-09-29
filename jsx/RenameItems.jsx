
/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options
                or simple rename one selected item / active layer / artboard
  Date: December, 2019
  Modification date: September, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  1.0 Initial version.
  1.0 New option Find and replace string in all Layer names
  1.2 Recursive search in Sublayers names
  1.3 Renaming of the parent Symbol
  1.4 Renaming the parent layers of the selected items
  1.5 Added placeholders. New UI
  1.6 Added renaming of the active artboard.
      Saving the name input field when switching options
  1.6.1 Fixed UI for Illustrator 26.4.1 on PC
  1.6.2 Fixed placeholder buttons, input activation in Windows OS
  1.6.3 Added erase object names by empty input
  1.6.4 Updated object name reloading
  1.6.5 Fixed placeholder insertion for CS6
  1.6.6 Added display of text frame content as name if it is empty
  1.6.7 Fixed text frame content as names for various options

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee https://www.buymeacoffee.com/osokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Rename Items',
        version: 'v.1.6.7'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false // Set to true if you work on PC and the Tab key is remapped
      },
      PH = {
        name: '{n}', // Put current name
        numUp: '{nu}', // Put ascending numeration
        numDown: '{nd}' // Put descending numeration
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again.');
    return;
  }

  var doc = activeDocument,
      actLayer = doc.activeLayer,
      actAb = doc.artboards[doc.artboards.getActiveArtboardIndex()],
      uniqLayers = getUniqueLayers(selection),
      isMultiSel = selection.length > 1;

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers >= 17;

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];

  // Target
  var grpTarget = win.add('group');

  if (selection.length && selection.typename !== 'TextRange') {
    var selRb = grpTarget.add('radiobutton', undefined, 'Selection');
        selRb.value = true;

    var layerRb = grpTarget.add('radiobutton', undefined, 'Parent layer(s)');
  } else if (!selection.length) {
    var layerRb = grpTarget.add('radiobutton', undefined, 'Layer');
        layerRb.value = true;

    var abRb = grpTarget.add('radiobutton', undefined, 'Active artboard');
  }

  // Name input
  var grpName = win.add('group');
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column';
      grpName.maximumSize.width = 200;

  var nameTitle = grpName.add('statictext', undefined, 'Rename ');
      nameTitle.text += isMultiSel ? selection.length + ' items to' : 'to';

  var nameInp = grpName.add('edittext', undefined, '');
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 3);
  } else {
    nameInp.active = true;
  }

  // Option for Symbol
  if (selection.length === 1 && selection[0].typename === 'SymbolItem') {
    var isReplcSym = win.add('checkbox', undefined, 'Rename parent symbol');
  }

  // Replace input
  if (isMultiSel || !selection.length) {
    var grpReplc = win.add('group');
        grpReplc.alignChildren = 'fill';
        grpReplc.orientation = 'column';

    grpReplc.add('statictext', undefined, 'Search for (optional)');

    var replcInp = grpReplc.add('edittext', undefined, '');
        replcInp.helpTip = 'Enter the part of the name\nyou want to replace';
  }

  // Global replace option
  if (!selection.length) {
    var isAll = win.add('checkbox', undefined, 'Replace in all ');
    isAll.text += abRb.value ? 'artboards' : 'doc layers'; 
  }

  // Placeholders
  if (isMultiSel) {
    win.add('statictext', undefined, 'Click to add placeholder');

    var grpPH = win.add('group');
        grpPH.alignChildren = ['fill', 'fill'];

    putPlaceholder('Name', [0, 0, 50, 20], grpPH, PH.name);
    putPlaceholder('Num \u2191', [0, 0, 50, 20], grpPH, PH.numUp);
    putPlaceholder('Num \u2193', [0, 0, 50, 20], grpPH, PH.numDown);
    
    // Numeration
    var grpNum = win.add('group');
    grpNum.add('statictext', undefined, 'Start number at');
    var countInp = grpNum.add('edittext', undefined, 1);
        countInp.preferredSize.width = 40;

    countInp.onChange = function () {
      this.text = convertToInt(countInp.text, 1);
    }

    shiftInputNumValue(countInp);
  }

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  // Copyright block
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // Load settings and fill name input field
  loadSettings();
  nameInp.text = getPlaceholder();
  if (!isUndefined(layerRb) && layerRb.value) {
    nameTitle.text = nameTitle.text.replace('items', 'layers');
  }

  // Сhange the amount of items and placeholder
  if (!isUndefined(selRb)) {
    var layerTmpInp = '',
        selTmpInp = ''
        isEditSel = selRb.value;

    if (layerRb.value) {
      nameTitle.text = nameTitle.text.replace(/\d+/g, uniqLayers.length);
    }

    selRb.onClick = function () {
      if (!isEditSel) layerTmpInp = nameInp.text;
      nameTitle.text = nameTitle.text.replace(/\d+/g, selection.length);
      nameTitle.text = nameTitle.text.replace('layers', 'items');
      nameInp.text = !isEmpty(selTmpInp) ? selTmpInp : getPlaceholder();
      isEditSel = true;
    }

    layerRb.onClick = function () {
      if (isEditSel) selTmpInp = nameInp.text;
      nameTitle.text = nameTitle.text.replace(/\d+/g, uniqLayers.length);
      nameTitle.text = nameTitle.text.replace('items', 'layers');
      if (!isUndefined(isReplcSym)) isReplcSym.value = false;
      nameInp.text = !isEmpty(layerTmpInp) ? layerTmpInp : getPlaceholder();
      isEditSel = false;
    }
  } else if (!isUndefined(abRb)) {
    var layerTmpInp = '',
        abTmpInp = ''
        isEditAb = abRb.value;

    layerRb.onClick = function () {
      if (isEditAb) abTmpInp = nameInp.text;
      isAll.text = isAll.text.replace('artboards', 'doc layers');
      nameInp.text = !isEmpty(layerTmpInp) ? layerTmpInp : getPlaceholder();
      isEditAb = false;
    }

    abRb.onClick = function () {
      if (!isEditAb) layerTmpInp = nameInp.text;
      isAll.text = isAll.text.replace('doc layers', 'artboards');
      nameInp.text = !isEmpty(abTmpInp) ? abTmpInp : getPlaceholder();
      isEditAb = true;
    }
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = win.close;

  ok.onClick = okClick;

  function okClick() {
    var name = nameInp.text,
        replc = !isUndefined(replcInp) ? replcInp.text : '';
  
    switch (selection.length) {
      case 0: // Empty selection
        if (isAll.value) {
          if (abRb.value) replaceInAll(doc.artboards, replc, name);
          else replaceInAll(doc.layers, replc, name);
        } else {
          if (!isEmpty(replc)) {
            if (abRb.value) actAb.name = actAb.name.replaceAll(replc, name);
            else actLayer.name = actLayer.name.replaceAll(replc, name);
          } else if (!isEmpty(name)) {
            if (abRb.value) actAb.name = name;
            else actLayer.name = name;
          }
        }
        break;
      case 1: // One item
        if (selRb.value) {
          if (!isUndefined(isReplcSym) && isReplcSym.value && !isEmpty(name)) {
            selection[0].symbol.name = name;
          }
          if (name !== getPlaceholder()) { // Input is modified
            selection[0].name = name;
          }
        } else if (!isEmpty(name)) {
          getTopLayer(selection[0]).name = name;
        }
        break;
      default: // Multiple items
        if (!isUndefined(selRb) && selRb.value) {
          rename(selection, name, replc, countInp.text, PH);
        } else if (!isEmpty(name)) {
          rename(uniqLayers, name, replc, countInp.text, PH);
        }
        break;
    }
  
    // AI doesn't update in realtime the Layers panel until CC 2020
    if (parseInt(app.version) <= 23 && selection.length && selRb.value) {
      try {
        var tmp = selection[0].layer.pathItems.add();
        tmp.remove();
      } catch (err) {}
    }
  
    saveSettings();
    win.close();
  }

  // Get name placeholder
  function getPlaceholder() {
    var str = '';
    
    if (selection.typename === 'TextRange') return str;

    switch (selection.length) {
      case 0: // Empty selection
        str = abRb.value ? actAb.name : actLayer.name;
        break;
      case 1: // One item
        var item = selection[0];
        if (layerRb.value) {
          str = getTopLayer(item).name;
        } else {
          str = getName(item);
        }
        break;
    }

    return str;
  }

  // Put placeholder symbols to input
  function putPlaceholder(name, size, parent, value) {
    var ph = parent.add('button', size, name);

    ph.onClick = function () {
      var str = nameInp.text;
      replcInp.active = true;
      str += value;
      nameInp.active = true;
      nameInp.textselection = str;
    }
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
      }
    });
  }

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    if (!isUndefined(selRb)) pref.selection = selRb.value;
    if (!isUndefined(abRb)) pref.artboard = abRb.value;
    if (!isUndefined(replcInp)) pref.pattern = replcInp.text;
    if (!isUndefined(countInp)) pref.number = countInp.text;
    if (!isUndefined(isAll)) pref.layers = isAll.value;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

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
          if (!isUndefined(selRb) && !isUndefined(pref.selection))
            pref.selection ? selRb.value = true : layerRb.value = true;
          if (!isUndefined(abRb) && !isUndefined(pref.artboard))
            pref.artboard ? abRb.value = true : layerRb.value = true;
          if (!isUndefined(replcInp) && !isUndefined(pref.pattern))
            replcInp.text = pref.pattern;
          if (!isUndefined(countInp) && !isUndefined(pref.number))
            countInp.text = pref.number;
          if (!isUndefined(isAll) && !isUndefined(pref.layers))
            isAll.value = pref.layers;
        }
      } catch (err) {}
    }
  }

  win.center();
  win.show();
}

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
}

// Get unique layers for selected items
function getUniqueLayers(collection) {
  if (!collection.length) return [];

  var raw = [getTopLayer(collection[collection.length - 1])];

  for (var i = collection.length - 1; i >= 0; i--) {
    var iLayer = getTopLayer(collection[i]);
    if (iLayer !== raw[raw.length - 1]) raw.push(iLayer);
  }

  return raw.reverse();
}

// Get top-level parent layer
function getTopLayer(item) {
  if (item.parent.typename === 'Document') return item;
  else return getTopLayer(item.parent);
}

// Find and replace in top-level layers and sublayers
function replaceInAll(collection, pattern, replc) {
  if (isEmpty(pattern)) return;

  for (var i = 0, len = collection.length; i < len; i++) {
    var item = collection[i];

    if (item.typename === 'Layer' && item.layers.length > 0) {
      replaceLayers(item.layers, pattern, replc);
    }

    var newName = getName(item).replaceAll(pattern, replc);
    item.name = newName;
  }
}

// Rename selection or parent layers
function rename(target, pattern, replc, counter, ph) {
  var min = counter * 1,
      max = target.length + min - 1;

  for (var i = 0, len = target.length; i < len; i++) {
    var newName = '',
        item = target[i];

    newName = pattern.replaceAll(ph.name, getName(item));
    newName = newName.replaceAll(ph.numUp, fillZero(min + i, max.toString().length));
    newName = newName.replaceAll(ph.numDown, fillZero(max - i, max.toString().length));

    if (!isEmpty(replc)) {
      item.name = getName(item).replaceAll(replc, newName);
    } else {
      item.name = newName;
    }
  }
}

// Convert a string to an integer
function convertToInt(str, def) {
  // Remove unnecessary characters
  str = str.replace(/[^\d]/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  return parseFloat(str);
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

// Replace all occurrences
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(pattern, replc) {
    return this.replace(new RegExp(pattern, 'g'), replc);
  };
}

// Check empty string
function isEmpty(str) {
  return !str || !str.length;
}

// Add zero before number
function fillZero(number, size) {
  var minus = (number < 0) ? '-' : '',
      str = '00000000000' + Math.abs(number);
  return minus + str.slice(str.length - size);
}

// Check for undefined
function isUndefined(el) {
  return typeof el == 'undefined';
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
} catch (err) {}