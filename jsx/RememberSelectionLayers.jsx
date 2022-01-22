/*
  RememberLayers.jsx for Adobe Illustrator
  Description:
  Saving and restoring selected items to their original layers.
  The order within the layers is not restored
  Date: January, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Works with matching layer names

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2021 (Win).
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
        name: 'Remember Selection Layers',
        version: 'v.0.2'
      },
      CFG = {
        keyLyr: 'layer=',
        keyIdx: 'idx=',
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  if (!documents.length) return;
  if (selection.length == 0 || selection.typename == 'TextRange') return;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.preferredSize.width = 210;
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = CFG.uiOpacity;

  var saveBtn = dialog.add('button', undefined, 'Save Layers Data');
  var restoreBtn = dialog.add('button', undefined, 'Restore To Original');
  var clearBtn = dialog.add('button', undefined, 'Clear Data');
  var cancel = dialog.add('button', undefined, 'Cancel', {name: 'cancel'});

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  saveBtn.onClick = save;
  restoreBtn.onClick = restore;
  clearBtn.onClick = clear;
  cancel.onClick = dialog.close;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  function save() {
    for (var i = selection.length - 1; i >= 0; i--) {
      var currItem = selection[i],
          itemLayer = (currItem.layer.parent.typename === 'Layer') ? currItem.layer.parent : currItem.layer,
          layerIdx = 0,
          same = getSameLayers(itemLayer.name);
      
      removeNote(currItem, CFG.keyLyr);

      for (var j = same.length - 1; j >= 0; j--) {
        if (same[j] === itemLayer) {
          layerIdx = j;
          break;
        }
      }

      currItem.note += CFG.keyLyr + itemLayer.name + ';' + CFG.keyIdx + layerIdx + ';';
    }

    dialog.close();
  }

  function restore() {
    var reLayer = new RegExp(CFG.keyLyr + '(.+)', 'g'),
        reIdx = new RegExp(CFG.keyIdx + '(.+)', 'g');

    for (var i = selection.length - 1; i >= 0; i--) {
      var currItem = selection[i];
      if (currItem.note.match(CFG.keyLyr) !== null) {
        var layerName = currItem.note.split(';')[0].replace(reLayer, '$1'),
            layerIdx = currItem.note.split(';')[1].replace(reIdx, '$1');
        moveToLayer(currItem, layerName, parseInt(layerIdx));
      }
      removeNote(currItem, CFG.keyLyr);
    }

    dialog.close();
  }

  function clear() {
    var regexp = new RegExp(CFG.keyLyr + '(.+)', 'g');

    for (var i = selection.length - 1; i >= 0; i--) {
      var currItem = selection[i];
      removeNote(currItem, CFG.keyLyr);
    }

    dialog.close();
  }

  dialog.center();
  dialog.show();
}

// Remove keyword from Note in Attributes panel
function removeNote(item, key) {
  var regexp = new RegExp(key + '(.+);', 'g');
  item.note = item.note.replace(regexp, '');
}

// Move selected item to original Layer by name
function moveToLayer(item, name, idx) {
  var same = getSameLayers(name);
  if (item.layer == same[idx]) return;
  try {
    var state = [same[idx].visible, same[idx].locked];
    same[idx].visible = true;
    same[idx].locked = false;
    item.move(same[idx], ElementPlacement.PLACEATBEGINNING);
    same[idx].visible = state[0];
    same[idx].locked = state[1];
  } catch (e) {}
}

// Get all top-level layers with this name
function getSameLayers(name) {
  var out = [];

  for (var i = activeDocument.layers.length - 1; i >= 0; i--) {
    if (activeDocument.layers[i].name === name) {
      out.unshift(activeDocument.layers[i]);
    }
  }

  return out;
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
  main()
} catch (e) {}