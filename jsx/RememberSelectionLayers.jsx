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
  0.3 Tags used for data

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Remember Selection Layers',
        version: 'v.0.3'
      },
      CFG = {
        keyLyr: 'lyrParent',
        keyIdx: 'lyrIdx',
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one or more items');
    return;
  }

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

  saveBtn.onClick = function () {
    save(CFG.keyLyr, CFG.keyIdx);
    dialog.close();
  }

  restoreBtn.onClick = function () {
    restore(CFG.keyLyr, CFG.keyIdx);
    dialog.close();
  }
  
  clearBtn.onClick = function () {
    clear(CFG.keyLyr, CFG.keyIdx);
    dialog.close();
  }

  cancel.onClick = dialog.close;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  dialog.center();
  dialog.show();
}

// Save layer data to tags
function save(keyLyr, keyIdx) {
  for (var i = selection.length - 1; i >= 0; i--) {
    var currItem = selection[i],
        itemLyr = getParentLayer(currItem),
        same = getSameLayers(itemLyr.name),
        lyrIdx = same.length - 1;

    while (itemLyr !== same[lyrIdx]) {
      lyrIdx--;
    }

    addTag(currItem, keyLyr, itemLyr.name);
    addTag(currItem, keyIdx, lyrIdx);
  }
}

// Get the parent layer for item
function getParentLayer(item) {
  if (item.parent.typename === 'Document') return item;
  else return getParentLayer(item.parent);
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

// Add custom tag to item
function addTag(item, key, value) {
  var tag = item.tags.add();
  tag.name = key;
  tag.value = value;
}

// Restore items to their original layers
function restore(keyLyr, keyIdx) {
  var docSel = selection;

  for (var i = docSel.length - 1; i >= 0; i--) {
    var currItem = docSel[i],
        lyrName = getTagValue(currItem, keyLyr),
        lyrIdx = getTagValue(currItem, keyIdx);

    if (lyrName.length && lyrIdx.length) {
      moveToLayer(currItem, lyrName, parseInt(lyrIdx));
      removeTag(currItem, keyLyr);
      removeTag(currItem, keyIdx);
    }
  }
}

// Get the key value
function getTagValue(item, key) {
  try {
    var tag = item.tags.getByName(key);
    return tag.value;
  } catch (e) {
    return '';
  }
}

// Delete tags with layer data
function clear(keyLyr, keyIdx) {
  for (var i = selection.length - 1; i >= 0; i--) {
    var currItem = selection[i];
    removeTag(currItem, keyLyr);
    removeTag(currItem, keyIdx);
  }
}

// Remove item tag
function removeTag(item, key) {
  try {
    var tag = item.tags.getByName(key);
    tag.remove();
  } catch (e) {}
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