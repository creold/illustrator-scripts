/*
  RenameItems.jsx for Adobe Illustrator
  Description: Script to batch rename selected items with many options 
               or simple rename one selected item / active layer.
  Date: December, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ============================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Versions:
  1.0 Initial version.
  1.0 Added option Find and replace string in all Layer names.
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  Tested with Adobe Illustrator CC 2018/2019 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

var SCRIPT_NAME = 'Rename Items',
    SCRIPT_VERSION = 'v.1.1';

function main() {
  if (app.documents.length == 0) {
    alert('Open a document and try again.');
    return;
  }

  var doc = app.activeDocument,
      aLayer = doc.activeLayer,
      title, placeholder = '';

  // Create Main Dialog
  var win = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION, undefined);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  // Set title & placeholder for input
  switch (selection.length) {
    case 0: // empty selection
      title = 'layer';
      placeholder = aLayer.name;
      break;
    case 1: // one object was selected
      title = 'item';
      placeholder = selection[0].name;
      break;
    default: // multiple objects were selected
      title = 'items';
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
  if (selection.length > 1) {
    var chkFind = win.add('checkbox', undefined, 'Find and replace'); 
    chkFind.helpTip = 'Enter the part of the name you want to replace.\n' + 
                        'E.g.: if you enter <rect>, it will replace all\n' +
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
        sprtInp.helpTip = 'E.g.: name-1, name-2, etc.'
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
      nameTitle.text = (chkFind.value) ? 'Replace ' + title + ' name' : 'Enter ' + title + ' name';
    }

    // Toggle Auto-increment naming inputs
    chkAutoInc.onClick = function () {
      grpSprt.enabled = !grpSprt.enabled;
      grpCount.enabled = !grpCount.enabled;
    }
  }
  
  //  Add more options for Layers rename
  if (selection.length == 0) {
    var chkFind = win.add('checkbox', undefined, 'Find and replace in all Layer'); 
    chkFind.helpTip = 'Enter the part of the name you want to replace.\n' + 
                        'E.g.: if you enter <Test>, it will replace all\n' +
                        'the <Test> occurrences in all Layer names.'; 
    
    // Replace
    var grpRplc = win.add('group', undefined); 
        grpRplc.orientation = 'row';
        grpRplc.enabled = false;

    var rplcTitle = grpRplc.add('statictext', undefined, 'Search string'); 
    var rplcInp = grpRplc.add('edittext', undefined, ''); 
        rplcInp.characters = 10;

    // Toggle Find & Replace input
    chkFind.onClick = function () {
      grpRplc.enabled = !grpRplc.enabled;
      nameTitle.text = (chkFind.value) ? 'Replace ' + title + ' name' : 'Enter ' + title + ' name';
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
  
  // Copyright block
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin, sergosokin.ru');
      copyright.justify = 'center';
      copyright.enabled = false;

  cancel.onClick = function() {
    win.close();
  }

  ok.onClick = function () {
    switch (selection.length) {
      case 0: // empty selection
        var layers = doc.layers;
        if (chkFind.value && rplcInp.text) {
          for (var i = 0; i < layers.length; i++) {
            var iLayer = layers[i];
            var newLayerName = iLayer.name.replaceAll(rplcInp.text, nameInp.text);
            if (newLayerName != iLayer.name) {
              iLayer.name = newLayerName;
            }
          }
        } else {
          aLayer.name = nameInp.text;
        }
        break;
      case 1: // one object was selected
        selection[0].name = nameInp.text;
        break;
      default: // multiple objects were selected
        var count = isNaN(parseInt(countInp.text)) ? 1 : parseInt(countInp.text);
        for (var i = 0; i < selection.length; i++) {
          var item = selection[i];
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
    reopenPnl();
    win.close();
  }
  
  win.show();
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