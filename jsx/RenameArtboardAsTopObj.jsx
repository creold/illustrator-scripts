/*
  RenameArtboardAsTopObj.jsx for Adobe Illustrator
  Description: The script renames each Artboard by the custom name of the first visible unlocked item on it
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Use textFrame content for renaming
  0.2.1 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
      };

  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = activeDocument;
  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // INTERFACE
  var dialog = new Window('dialog', 'Rename Artboard As Top Obj');
  dialog.orientation = 'row';
  dialog.alignChild = ['fill', 'fill'];

  // Buttons
  var allBtn = dialog.add('button', undefined, 'All');
  var currBtn = dialog.add('button', undefined, 'Current', { name: 'ok' });
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 2);
  } else {
    currBtn.active = true;
  }

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

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center.
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

function renameArtboard(ab) {
  activeDocument.selectObjectsOnActiveArtboard(); // Get all items on current Artboard
  if (selection[0] == undefined) return;

  var item = selection[0],
      itemName = '';

  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    itemName = item.contents.slice(0, 100);
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    itemName = item.symbol.name;
  } else {
    itemName = item.name;
  }

  if (!isEmpty(itemName) && ab.name !== itemName) {
    ab.name = itemName;
  }
  
  selection = null;
}

function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Run script
try {
  main();
} catch (e) {}
