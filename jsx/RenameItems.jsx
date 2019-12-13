// RenameItems.jsx for Adobe Illustrator
// Description: Script to batch rename selected items with many options 
//              or simple rename one selected item / active layer.
// Date: December, 2019
// Author: Sergey Osokin, email: hi@sergosokin.ru
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > RenameItems
// ============================================================================
// Versions:
// 1.0 Initial version.
// ============================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2018/2019 (Mac/Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ============================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ============================================================================
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ============================================================================
// Check other author's scripts: https://github.com/creold

#target Illustrator

function main() {
  if (app.documents.length == 0) {
    alert('Open a document and try again.');
    return;
  }

  var scriptName = 'Rename Items',
      doc = app.activeDocument,
      sel = doc.selection,
      aLayer = doc.activeLayer,
      title, placeholder = '';

  // Create Main Dialog
  var win = new Window('dialog', scriptName, undefined);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  // Set title & placeholder for input
  switch (sel.length) {
    case 0: // empty selection
      title = 'Layer';
      placeholder = aLayer.name;
      break;
    case 1: // one object was selected
      title = 'Path';
      placeholder = sel[0].name;
      break;
    default: // multiple objects were selected
      title = 'Paths';
      break;
  }

  // Name
  var grpName = win.add('group', undefined); 
      grpName.alignChildren = 'fill';
      grpName.orientation = 'column'; 

  var nameTitle = grpName.add('statictext', undefined, undefined); 
      nameTitle.text = 'Enter ' + title + ' name';
  var nameInp = grpName.add('edittext'); 
      nameInp.text = placeholder; 
      nameInp.active = true;

  //  Add more options for multiple selection
  if (sel.length > 1) {
    var chkFind = win.add('checkbox', undefined, 'Find and replace'); 
    chkFind.helpTip = 'Enter the part of the name you want to replace.\n' + 
                        'For example, if you enter <rect>, it will replace all\n' +
                        'the <rect> occurrences in the selected items name.'; 
    
    // Replace
    var grpRplc = win.add('group', undefined); 
        grpRplc.orientation = 'row';
        grpRplc.enabled = false;

    var rplcTitle = grpRplc.add('statictext', undefined, 'Search string'); 
    var rplcInp = grpRplc.add('edittext', undefined, ''); 
        rplcInp.characters = 10;

    var chkAutoInc = win.add('checkbox', undefined, 'Auto-increment naming'); 
        chkAutoInc.helpTip = 'Eg: name-1, name-2, etc.'; 
        chkAutoInc.value = true;

    // Separator group
    var grpSprt = win.add('group', undefined); 
        grpSprt.orientation = 'row'; 

    var sprtTitle = grpSprt.add('statictext', undefined, 'Name separator'); 
    var sprtInp = grpSprt.add('edittext', undefined, '-'); 
        sprtInp.helpTip = 'Eg: name-1, name-2, etc.'
        sprtInp.preferredSize.width = 45;

    // Counting
    var grpCount = win.add('group', undefined); 
        grpCount.orientation = 'row'; 

    var countTitle = grpCount.add('statictext', undefined, 'Start counting at'); 
    var countInp = grpCount.add('edittext', undefined, '1'); 
        countInp.preferredSize.width = 40;
    
    // Toggle Find & Replace input
    chkFind.onClick = function () {
      grpRplc.enabled = !grpRplc.enabled;
    }

    // Toggle Auto-increment naming inputs
    chkAutoInc.onClick = function () {
      grpSprt.enabled = !grpSprt.enabled;
      grpCount.enabled = !grpCount.enabled;
    }
  }

  // Buttons
  var grpBtns = win.add('group', undefined); 
      grpBtns.orientation = 'row';
      grpBtns.alignChildren = ['center','center'];

  var cancel = grpBtns.add('button', undefined, 'Cancel', {name: 'cancel'});
      cancel.helpTip = 'Press Esc to Close';
  var ok = grpBtns.add('button', undefined, 'OK', {name: 'ok'});
      ok.helpTip = 'Press Enter to Run';


  cancel.onClick = function() {
    win.close();
  }
  ok.onClick = okClick;

  win.show();

  function okClick() {
    switch (sel.length) {
      case 0: // empty selection
        if (!nameInp.text.isEmpty()) {
          aLayer.name = nameInp.text;
        }
        break;
      case 1: // one object was selected
        sel[0].name = nameInp.text;
        break;
      default: // multiple objects were selected
        var count = isNaN(parseInt(countInp.text)) ? 1 : parseInt(countInp.text);
        for (var i = 0; i < sel.length; i++) {
          var item = sel[i];
          var num = sprtInp.text + (i + count);
          if (chkFind.value && rplcInp.text) {
            item.name = item.name.replaceAll(rplcInp.text, nameInp.text);
            if (chkAutoInc.value) {
              item.name += num;
            }
          }
          if (!chkFind.value && chkAutoInc.value) {
            item.name = nameInp.text + num;
          }
          if (!chkFind.value && !chkAutoInc.value) {
            item.name = nameInp.text;
          }
        }
        break;
    }
    win.close();
  }

  reopenPnl();
}

String.prototype.isEmpty = function() {
  return (!this || this.length === 0 || /^\s*$/.test(this));
}

String.prototype.replaceAll = function(search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

// Illustrator UI trick. Reopen layers panel for update names 
function reopenPnl() {
  app.executeMenuCommand('AdobeLayerPalette1'); // close
  app.executeMenuCommand('AdobeLayerPalette1'); // open
}

try {
  main();
} catch (e) {}