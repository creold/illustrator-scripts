
/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options
                or simple rename one selected item / active layer / artboard
  Date: July, 2022
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

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via PayPal (temporarily unavailable) http://www.paypal.me/osokin/usd

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
        version: 'v.1.6'
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

  // Dialog
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];

  // Target
  var grpTarget = dialog.add('group');

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
  var grpName = dialog.add('group');
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column';

  var nameTitle = grpName.add('statictext', undefined, 'Rename ');
      nameTitle.text += isMultiSel ? selection.length + ' items to' : 'to';

  var nameInp = grpName.add('edittext', undefined, '');
      nameInp.active = true;

  // Option for Symbol
  if (selection.length === 1 && isSymbol(selection[0])) {
    var isReplcSym = dialog.add('checkbox', undefined, 'Rename parent symbol');
  }

  // Replace input
  if (isMultiSel || !selection.length) {
    var grpReplc = dialog.add('group');
        grpReplc.alignChildren = 'fill';
        grpReplc.orientation = 'column';

    grpReplc.add('statictext', undefined, 'Search for (optional)');

    var replcInp = grpReplc.add('edittext', undefined, '');
        replcInp.helpTip = 'Enter the part of the name\nyou want to replace';
  }

  // Global replace option
  if (!selection.length) {
    var isAll = dialog.add('checkbox', undefined, 'Replace in all ');
    isAll.text += abRb.value ? 'artboards' : 'doc layers'; 
  }

  // Placeholders
  if (isMultiSel) {
    dialog.add('statictext', undefined, 'Click to add placeholder');

    var grpPH = dialog.add('group');
        grpPH.orientation = 'row';
        grpPH.spacing = 10;

    putPlaceholder('Name', [54, 20], grpPH, PH.name);
    putPlaceholder('Num \u2191', [54, 20], grpPH, PH.numUp);
    putPlaceholder('Num \u2193', [54, 20], grpPH, PH.numDown);
    
    // Numeration
    var grpNum = dialog.add('group');
    grpNum.add('statictext', undefined, 'Start number at');
    var countInp = grpNum.add('edittext', undefined, 1);
        countInp.preferredSize.width = 40;

    countInp.onChange = function () {
      this.text = convertToInt(countInp.text, 1);
    }

    shiftInputNumValue(countInp);
  }

  // Buttons
  var btns = dialog.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  // Copyright block
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
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

  cancel.onClick = dialog.close;

  ok.onClick = okClick;

  function okClick() {
    var name = nameInp.text,
        replc = !isUndefined(replcInp) ? replcInp.text : '';
  
    if (isEmpty(name) && isEmpty(replc)) {
      dialog.close();
      return;
    }

    switch (selection.length) {
      case 0: // Empty selection
        if (isAll.value) {
          if (abRb.value) replaceInAll(doc.artboards, replc, name);
          else replaceInAll(doc.layers, replc, name);
        } else {
          if (isEmpty(replc)) {
            if (abRb.value) actAb.name = name;
            else actLayer.name = name;
          } else {
            if (abRb.value) actAb.name = actAb.name.replaceAll(replc, name);
            else actLayer.name = actLayer.name.replaceAll(replc, name);
          }
        }
        break;
      case 1: // One item
        if (selRb.value) {
          if (!isUndefined(isReplcSym) && isReplcSym.value) {
            selection[0].symbol.name = name;
          } else {
            selection[0].name = name;
          }
        } else {
          getTopLayer(selection[0]).name = name;
        }
        break;
      default: // Multiple items
        if (!isUndefined(selRb) && selRb.value) {
          rename(selection, name, replc, countInp.text, PH);
        } else {
          rename(uniqLayers, name, replc, countInp.text, PH);
        }
        break;
    }
  
    // AI doesn't update in realtime the Layers panel until CC 2020
    if (parseInt(app.version) <= 23 && selection.length && selRb.value) {
      reloadLayers();
    }
  
    saveSettings();
    dialog.close();
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
        } else if (isSymbol(item) && item.name == '') {
          str = item.symbol.name;
        } else {
          str = item.name;
        }
        break;
    }

    return str;
  }

  // Put placeholder symbols to input
  function putPlaceholder(name, size, parent, value) {
    var uiTheme = preferences.getRealPreference('uiBrightness'),
        ph = parent.add('iconbutton', undefined, undefined);

    ph.text = name;
    ph.size = size;
    if (uiTheme <= .5) {
      ph.contour = ph.graphics.newPen(ph.graphics.PenType.SOLID_COLOR, [1, 1, 1, .4], 2);
      ph.textPen = ph.graphics.newPen(ph.graphics.PenType.SOLID_COLOR, [1, 1, 1, .7], 1);
    } else {
      ph.contour = ph.graphics.newPen(ph.graphics.PenType.SOLID_COLOR, [0, 0, 0, .4], 2);
      ph.textPen = ph.graphics.newPen(ph.graphics.PenType.SOLID_COLOR, [0, 0, 0, .6], 1);
    }
    ph.onDraw = drawBtn;

    ph.onClick = function () {
      replcInp.active = true;
      nameInp.text += value;
      nameInp.active = true;
      nameInp.textselection = nameInp.text;
    }
  }

  // Draw button
  function drawBtn() {
    with(this) {
      graphics.drawOSControl();
      graphics.rectPath(0, 0, size[0], size[1]);
      graphics.strokePath(contour);
      if (text) graphics.drawString(text, textPen, (size[0] - graphics.measureString(text, graphics.font, size[0])[0]) / 2, 3, graphics.font);
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
      } catch (e) {}
    }
  }

  dialog.center();
  dialog.show();
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

    var newName = item.name.replaceAll(pattern, replc);
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

    newName = pattern.replaceAll(ph.name, item.name);
    newName = newName.replaceAll(ph.numUp, fillZero(min + i, max.toString().length));
    newName = newName.replaceAll(ph.numDown, fillZero(max - i, max.toString().length));

    if (!isEmpty(replc)) {
      item.name = item.name.replaceAll(replc, newName);
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

// Check Symbol type
function isSymbol(item) {
  return item.typename === 'SymbolItem';
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

// Update Layers panel for CC 2019 and older
function reloadLayers() {
  app.executeMenuCommand('AdobeLayerPalette1');
  redraw();
  app.executeMenuCommand('AdobeLayerPalette1');
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