/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options 
               or simple rename one selected item / active layer.
  Date: December, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Versions:
  1.0 Initial version.
  1.0 Added option Find and replace string in all Layer names.
  1.2 Added recursive search in Sublayers names.
  1.3 Added renaming of the parent Symbol
  
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  
  NOTICE:
  Tested with Adobe Illustrator CC 2018/2019 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

var SCRIPT_NAME = 'Rename Items',
    SCRIPT_VERSION = 'v.1.3';

function main() {
  if (documents.length == 0) {
    alert('Error\nOpen a document and try again.');
    return;
  }

  var doc = app.activeDocument,
      aLayer = doc.activeLayer,
      texts = initTitle(),
      target = texts[0], 
      placeholder = texts[1],
      start = 1;

  var enterTitleStr = 'Enter ' + target + ' name',
      rplcTitleStr  = 'Replace ' + target + ' name';

  // Create Main Dialog
  var win = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION, undefined);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  // Name
  var grpName = win.add('group'); 
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column'; 

  var nameTitle = grpName.add('statictext'); 
      nameTitle.text = 'Enter ' + target + ' name';
  var nameInp = grpName.add('edittext', [0, 0, 170, 30], placeholder); 
      nameInp.active = true;

  //  Add more options for selected Symbol
  if (selection.length == 1 && isSymbol(selection[0])) {
    var isRplcParent = win.add('checkbox', undefined, 'Rename parent symbol');
  }

  //  Add more options for multiple selection or layers
  if (selection.length > 1 || (selection.length == 0 && hasMultiLayer())) {
    var chkFind = win.add('checkbox', undefined, 'Find and replace in all');
    chkFind.helpTip = 'Enter the part of the name you want to replace.\n' + 
                        'E.g.: if you enter MY, it will replace all\n' +
                        'the MY occurrences in the names.'; 
    
    // Replace
    var grpRplc = win.add('group'); 
        grpRplc.orientation = 'row';
        grpRplc.enabled = false;

    var rplcTitle = grpRplc.add('statictext', undefined, 'Search string'); 
    var rplcInp = grpRplc.add('edittext'); 
        rplcInp.characters = 16;

    // Toggle Find & Replace input
    chkFind.onClick = function () {
      grpRplc.enabled = !grpRplc.enabled;
      nameTitle.text = (chkFind.value) ? rplcTitleStr : enterTitleStr;
    }

    if (selection.length > 1) { 
      var chkAutoInc = win.add('checkbox', undefined, 'Auto-numbering up'); 
          chkAutoInc.helpTip = 'Eg: name-1, name-2, etc.'; 
          chkAutoInc.value = true;

      var extra = win.add('group');
          extra.orientation = 'row';

      // Numeration
      var countTitle = extra.add('statictext', undefined, 'Start from'); 
      var countInp = extra.add('edittext', undefined, start); 
          countInp.preferredSize.width = 40;

      // Separator
      var sprtTitle = extra.add('statictext', undefined, 'Separator'); 
      var sprtInp = extra.add('edittext', undefined, '-'); 
          sprtInp.helpTip = 'E.g.: name-1, name-2, etc.'
          sprtInp.preferredSize.width = 40;

      // Toggle Auto-increment naming inputs
      chkAutoInc.onClick = function () {
        countInp.enabled = !countInp.enabled;
        sprtInp.enabled = !sprtInp.enabled;
      }

      countInp.onChange = function () { this.text = convertToNum(countInp.text); }
      shiftInputNumValue(countInp);
    }
  }
  
  // Buttons
  var grpBtns = win.add('group'); 
      grpBtns.orientation = 'row';
      grpBtns.alignChildren = ['center','center'];

  var cancel = grpBtns.add('button', undefined, 'Cancel');
      cancel.helpTip = 'Press Esc to Close';
  var ok = grpBtns.add('button', undefined, 'OK');
      ok.helpTip = 'Press Enter to Run';
  
  // Copyright block
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin, sergosokin.ru');
      copyright.justify = 'center';
      copyright.enabled = false;

  cancel.onClick = function() {
    win.close();
  }

  ok.onClick = okClick;

  function okClick() {
    switch (selection.length) {
      case 0: // empty selection
        if (chkFind.value && rplcInp.text.length > 0) renameLayers(doc.layers);
        else aLayer.name = nameInp.text;
        break;
      case 1: // one object was selected
        selection[0].name = nameInp.text;
        if (isRplcParent !== undefined && isRplcParent.value) { 
          selection[0].symbol.name = nameInp.text;
        }
        break;
      default: // multiple objects were selected
        renameItems();
        break;
    }

    reopenPnl();
    win.close();
  }

  function renameLayers(_layers) {
    for (var i = 0; i < _layers.length; i++) {
      var iLayer = _layers[i];
      if (iLayer.layers.length > 0) renameLayers(iLayer.layers);
      
      var newName = iLayer.name.replaceAll(rplcInp.text, nameInp.text);
      if (newName != iLayer.name) {
        iLayer.name = newName;
      }
    }
  }

  function renameItems() {
    var count = convertToNum(countInp.text);
    for (var i = 0; i < selection.length; i++) {
      var item = selection[i];
      if (!chkFind.value) item.name = nameInp.text;
      if (chkAutoInc.value) item.name += sprtInp.text + count;
      if (chkFind.value && rplcInp.text.length > 0) {
        item.name = item.name.replaceAll(rplcInp.text, nameInp.text);
      }
      
      count++;
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
  
  win.show();
}

// Set title & placeholder for input
function initTitle() {
  var target, placeholder;
  switch (selection.length) {
    case 0: // empty selection
      target = 'layer';
      placeholder = activeDocument.activeLayer.name;
      break;
    case 1: // one object was selected
      target = isSymbol(selection[0]) ? 'symbol' : 'item';
      if (isSymbol(selection[0]) && selection[0].name == '') {
        placeholder = selection[0].symbol.name;
      } else {
        placeholder = selection[0].name;
      }
      break;
    default: // multiple objects were selected
      target = selection.length + ' items';
      placeholder = '';
      break;
  }
  return [target, placeholder];
}

function hasMultiLayer() {
  return activeDocument.layers.length > 1 || activeDocument.layers[0].layers.length > 0;
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

function isSymbol(item) {
  return item.typename === 'SymbolItem';
}

// Illustrator UI trick. Reopen layers panel for update names 
function reopenPnl() {
  app.executeMenuCommand('AdobeLayerPalette1'); // close
  app.executeMenuCommand('AdobeLayerPalette1'); // open
}

try {
  main();
} catch (e) {}