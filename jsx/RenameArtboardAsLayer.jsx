/*
  RenameArtboardAsLayer.jsx for Adobe Illustrator
  Description: The script renames each Artboard by the custom name of Layer with the first visible unlocked item on it.
  Date: October, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = activeDocument;

  // INTERFACE
  var dialog = new Window('dialog', 'Rename Artboard As Layer');
  dialog.orientation = 'row';
  dialog.alignChild = ['fill', 'fill'];

  // Buttons
  var allBtn = dialog.add('button', undefined, 'All');
  var currBtn = dialog.add('button', undefined, 'Current', { name: 'ok' });
  currBtn.active = true;

  allBtn.onClick = function () {
    for (var i = 0, len = doc.artboards.length; i < len; i++) {
      doc.artboards.setActiveArtboardIndex(i);
      renameArtboard(doc.artboards[i]);
    }
    dialog.close();
  }

  currBtn.onClick = function () {
    var i = doc.artboards.getActiveArtboardIndex();
    renameArtboard(doc.artboards[i]);
    dialog.close();
  }

  dialog.center();
  dialog.show();
}

function renameArtboard(ab) {
  activeDocument.selectObjectsOnActiveArtboard(); // Get all items on current Artboard
  
  if (selection[0] == undefined) return;
  var item = selection[0];

  if (item.parent.name && ab.name !== item.parent.name) {
    ab.name = item.parent.name;
  }
  
  selection = null;
}

// Run script
try {
  main();
} catch (e) {}
