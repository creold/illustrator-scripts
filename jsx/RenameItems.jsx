/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options 
                or simple rename one selected item / active layer
  Date: December, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Release notes:
  1.0 Initial version.
  1.0 New option Find and replace string in all Layer names
  1.2 Recursive search in Sublayers names
  1.3 Renaming of the parent Symbol
  1.4 Renaming the parent layers of the selected items
  
  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

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
        version: 'v.1.4'
      },
      CFG = {
        aiVers: parseInt(app.version),
        counter: 1,
        enter: 'Enter name',
        rplc: 'Replace in name'
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
      aLayer = doc.activeLayer,
      uLayers = getUniqueLayers(selection),
      placeholder = getPlaceholder();

  // Dialog
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version, undefined);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];

  // Target
  if (selection.length && selection.typename !== 'TextRange') {
    var grpTarget = dialog.add('group'); 
        grpTarget.alignChildren = ['fill', 'center'];

    var selRb = grpTarget.add('radiobutton', undefined, 'Selection');
        selRb.value = true;
    var layerRb = grpTarget.add('radiobutton', undefined, 'Parent Layers');
  }

  // Name
  var grpName = dialog.add('group'); 
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column'; 

  var nameTitle = grpName.add('statictext', undefined, 'Enter name'); 
  var nameInp = grpName.add('edittext', [0, 0, 170, 30], placeholder); 
      nameInp.active = true;

  // Extra option for Symbol
  if (selection.length == 1 && isSymbol(selection[0])) {
    var isRplcSym = dialog.add('checkbox', undefined, 'Rename parent symbol');
  }

  //  Add more options for multiple selection or layers
  if (selection.length > 1 || (selection.length == 0 && hasMultiLayer())) {
    var isFindRplc = dialog.add('checkbox', undefined, 'Find and replace in all');
    isFindRplc.helpTip = 'Enter the part of the name you want to replace.\n' + 
                        'E.g.: if you enter MY, it will replace all\n' +
                        'the MY occurrences in the names.'; 
    
    // Replace
    var grpRplc = dialog.add('group'); 
        grpRplc.orientation = 'row';
        grpRplc.enabled = false;

    grpRplc.add('statictext', undefined, 'Search string'); 
    var rplcInp = grpRplc.add('edittext', undefined, ''); 
        rplcInp.characters = 16;

    // Toggle Find & Replace input
    isFindRplc.onClick = function () {
      grpRplc.enabled = this.value;
      nameTitle.text = this.value ? CFG.rplc : CFG.enter;
    }

    if (selection.length > 1) { 
      var isAutonum = dialog.add('checkbox', undefined, 'Ascending numbering'); 
          isAutonum.helpTip = 'Eg: name-1, name-2, name-3'; 
          isAutonum.value = true;

      var grpNum = dialog.add('group');
          grpNum.orientation = 'row';

      // Separator
      grpNum.add('statictext', undefined, 'Separator'); 
      var sprtInp = grpNum.add('edittext', undefined, '-'); 
          sprtInp.helpTip = 'E.g.: name-1, name-2, name-3'
          sprtInp.preferredSize.width = 40;

      // Numeration
      grpNum.add('statictext', undefined, 'Start from'); 
      var countInp = grpNum.add('edittext', undefined, CFG.counter); 
          countInp.preferredSize.width = 40;

      // Toggle Auto-increment naming inputs
      isAutonum.onClick = function () {
        grpNum.enabled = this.value;
      }

      countInp.onChange = function () { 
        this.text = convertToNum(countInp.text, 1);
      }

      shiftInputNumValue(countInp);
    }
  }
  
  // Buttons
  var btns = dialog.add('group'); 
      btns.alignChildren = ['fill','center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';
  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';
  
  // Copyright block
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';
  
  loadSettings();

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });
  
  if (selRb !== undefined && selection.length > 1 && uLayers.length < 2) {
    selRb.onClick = function () {
      isFindRplc.enabled = true;
      isAutonum.enabled = true;
      grpNum.enabled = isAutonum.value;
      grpRplc.enabled = isFindRplc.value;
    }
    layerRb.onClick = function () {
      isFindRplc.enabled = false;
      isAutonum.enabled = false;
      grpNum.enabled = false;
      grpRplc.enabled = false;
    }
  }

  cancel.onClick = dialog.close;

  ok.onClick = okClick;

  function okClick() {
    switch (selection.length) {
      case 0: // empty selection
        if (isFindRplc.value && rplcInp.text.length > 0) {
          renameLayers(doc.layers, rplcInp.text, nameInp.text);
        } else {
          aLayer.name = nameInp.text;
        }
        break;
      case 1: // one object was selected
        if (selRb.value) {
          selection[0].name = nameInp.text;
          if (isRplcSym !== undefined && isRplcSym.value) { 
            selection[0].symbol.name = nameInp.text;
          }
        } else {
          getTopLayer(selection[0]).name = nameInp.text;
        }
        break;
      default: // multiple objects were selected
        if (layerRb !== undefined && layerRb.value) {
          rename(uLayers);
        } else {
          rename(selection);
        }
        break;
    }

    if (CFG.aiVers <= 23) reloadLayers();

    saveSettings();
    dialog.close();
  }

  // Rename selection or parent layers
  function rename(target) {
    var counter = convertToNum(countInp.text, 1);
    for (var i = 0, len = target.length; i < len; i++) {
      var item = target[i];
      if (isFindRplc.enabled && isFindRplc.value && rplcInp.text.length > 0) {
        item.name = item.name.replaceAll(rplcInp.text, nameInp.text);
      } else {
        item.name = nameInp.text;
      }
      if (isAutonum.enabled && isAutonum.value) item.name += sprtInp.text + counter;
      if (item.typename === 'Layer' && !nameInp.text.length && !isFindRplc.value) item.name = counter;
      counter++;
    }
  }

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
    if (!isUndefined(isFindRplc)) pref.replace = isFindRplc.value;
    if (!isUndefined(rplcInp)) pref.mask = rplcInp.text;
    if (!isUndefined(isAutonum)) pref.autonum = isAutonum.value;
    if (!isUndefined(sprtInp)) pref.separator = sprtInp.text;
    if (!isUndefined(countInp)) pref.number = countInp.text;
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
          if (!isUndefined(isFindRplc) && !isUndefined(pref.replace))
            isFindRplc.value = pref.replace;
            grpRplc.enabled = pref.replace;
          if (!isUndefined(rplcInp) && !isUndefined(pref.mask))
            rplcInp.text = pref.mask;
          if (!isUndefined(isAutonum) && !isUndefined(pref.autonum))
            isAutonum.value = pref.autonum;
            grpNum.enabled = pref.autonum;
          if (!isUndefined(sprtInp) && !isUndefined(pref.separator))
            sprtInp.text = pref.separator;
          if (!isUndefined(countInp) && !isUndefined(pref.number))
            countInp.text = pref.number;
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
  var raw = [];
  raw.push(getTopLayer(collection[collection.length - 1]));
  for (var i = collection.length - 1; i >= 0; i--) {
    var iLayer = getTopLayer(collection[i]);
    if (iLayer !== raw[raw.length - 1]) {
      raw.push(iLayer);
    } 
  }
	return raw.reverse();
}

// Get topmost parent layer
function getTopLayer(item) {
  if (item.parent.typename === 'Document') {
    return item;
  } else {
    return getTopLayer(item.parent);
  }
}

// Get name placeholder
function getPlaceholder() {
  if (selection.typename === 'TextRange') return '';
  var str;
  switch (selection.length) {
    case 0: // Empty selection
      str = activeDocument.activeLayer.name;
      break;
    case 1: // One object
      if (isSymbol(selection[0]) && selection[0].name == '') {
        str = selection[0].symbol.name;
      } else {
        str = selection[0].name;
      }
      break;
    default: // Multiple objects
      str = '';
      break;
  }
  return str;
}

// The document has multiple layers or sublayers
function hasMultiLayer() {
  var _layers = activeDocument.layers;
  return _layers.length > 1 || _layers[0].layers.length > 0;
}

function renameLayers(_layers, mask, rplc) {
  for (var i = 0, lyrLen = _layers.length; i < lyrLen; i++) {
    var iLayer = _layers[i];
    if (iLayer.layers.length > 0) renameLayers(iLayer.layers, mask, rplc);
    var newName = iLayer.name.replaceAll(mask, rplc);
    if (newName !== iLayer.name) iLayer.name = newName;
  }
}

String.prototype.replaceAll = function(search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  // Remove duplicate Minus
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Check Symbol type
function isSymbol(item) {
  return item.typename === 'SymbolItem';
}

// Update Layers panel for CC 2019 and older
function reloadLayers() {
  app.executeMenuCommand('AdobeLayerPalette1');
  redraw();
  app.executeMenuCommand('AdobeLayerPalette1');
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
} catch (e) {}