/*
  OpacityMaskClip.jsx for Adobe Illustrator
  Description: Enable the Clip checkbox for selected objects with opacity masks in the Transparency panel
  Date: April, 2019
  Modification date: March, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  *************************************************************************************************
  * WARNING: Don't put this script in the action slot for a quick run. It will freeze Illustrator *
  *************************************************************************************************

  Release notes:
  0.3 Moves processing to a temporary layer for stability. Progress bar removed
  0.2.1 Minor improvements
  0.2 To improve performance, the script only works with selected objects. Progress bar added
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2025 (Mac/Win).
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
        name: 'OpacityMaskClip',
        version: 'v.0.3'
      },
      CFG = {
        aiVers: parseInt(app.version),
        actionSet: SCRIPT.name + SCRIPT.version,
        actionName: 'ActivateClip',
        actionPath: Folder.myDocuments + '/Adobe Scripts/',
        lay: 'Remove This Layer',
        limit: 10 // When the amount of selected items, full-screen mode is enabled
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again', 'Script error');
    return;
  }

  if (CFG.aiVers < 16) {
    alert('Wrong app version\nSorry, script only works in Illustrator CS6 and later', 'Script error');
    return;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert('Error\nPlease select at least 1 object with opacity mask and try again', 'Script error');
    return;
  }

  var isReady = confirm('This script requires you to select opacity masks only to enable the Clip. Have you selected them only?');
  if (!isReady) return;

  var doc = activeDocument,
      sel = get(app.selection),
      userScreen = doc.views[0].screenMode;
  
  app.selection = [];
  var tmpLay = doc.layers.add();
  tmpLay.name = CFG.lay;

  addClipAction(CFG.actionName, CFG.actionSet, CFG.actionPath);

  if (sel.length > CFG.limit) {
    doc.views[0].screenMode = ScreenMode.FULLSCREEN;
  }

  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
  try {
    enableClip(sel, tmpLay, CFG.actionName, CFG.actionSet);
  } catch (err) {}
  app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;

  app.selection = [];
  tmpLay.remove();
  try { 
    app.unloadAction(CFG.actionSet, '');
  } catch (err) {}
  doc.views[0].screenMode = userScreen;
}

// Convert collection into standard Array
function get(coll) {
  var result = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    result.push(coll[i]);
  }
  return result;
}

// Load action to enable clip checkbox for opacity masks
function addClipAction(name, set, path) {
  if (!Folder(path).exists) Folder(path).create();

  // Generate action
  var actionStr =  [
      '/version 3',
      '/name [' + set.length,
          ascii2Hex(set),
      ']',
      '/isOpen 1',
      '/actionCount 1',
      '/action-1 {',
          '/name [' + name.length,
              ascii2Hex(name),
          ']',
          '/keyIndex 0',
          '/colorIndex 0',
          '/isOpen 1',
          '/eventCount 1',
          '/event-1 {',
              '/useRulersIn1stQuadrant 0',
              '/internalName (ai_plugin_transparency)',
              '/localizedName [ 12',
              '    5472616e73706172656e6379',
              ']',
              '/isOpen 1',
              '/isOn 1',
              '/hasDialog 0',
              '/parameterCount 1',
              '/parameter-1 {',
                  '/key 1668049264',
                  '/showInPalette 4294967295',
                  '/type (boolean)',
                  '/value 1',
              '}',
          '}',
      '}'].join('\n');

  try { 
    app.unloadAction(set, '');
  } catch (err) {}
  createAction(actionStr, set, path);
}

// Create an Adobe Illustrator action from the given action code
function createAction (str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

// Convert ASCII characters to their corresponding hexadecimal representation
function ascii2Hex(hex) {
  return hex.replace(/./g, function(a) {
    return a.charCodeAt(0).toString(16)
  });
}

// Enable clip for opacity masks
function enableClip(arr, lay, name, set) {
  var i = arr.length - 1;
  var item, tmpItem;

  while (i > -1) {
    item = arr[i];

    tmpItem = item.layer.pathItems.add();
    tmpItem.move(item, ElementPlacement.PLACEBEFORE);
    app.selection = [];

    // Edit opacity mask in a temporary layer to avoid errors on PC
    item.move(lay, ElementPlacement.PLACEATBEGINNING);
    app.selection = [item];

    // Clip opacity mask
    try {
      app.doScript(name, set);
    } catch (err) {}

    app.selection[0].move(tmpItem, ElementPlacement.PLACEBEFORE);
    tmpItem.remove();
    app.selection = [];

    if (item.typename === 'GroupItem' && item.pageItems.length) {
      enableClip(item.pageItems, lay, name, set);
    }

    i--;
  }
}

// Run script
try {
  main();
} catch (err) {}
