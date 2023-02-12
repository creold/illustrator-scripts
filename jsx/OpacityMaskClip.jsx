/*
  OpacityMaskClip.jsx for Adobe Illustrator
  Description: The script activates the 'Clip' checkbox in Transparency > Opacity Mask
  Date: April, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 To improve performance, the script only works with selected objects;
      Added progress bar
  0.2.1 Minor improvements

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
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'OpacityMaskClip',
        version: 'v.0.2.1'
      },
      CFG = {
        aiVers: parseInt(app.version),
        actionSet: SCRIPT.name + SCRIPT.version,
        actionName: 'ActivateClip',
        actionPath: Folder.myDocuments + '/Adobe Scripts/',
        percent: '%',
        limit: 10 // When the amount of selected items, full-screen mode is enabled
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errVers: { en: 'Error\nSorry, script only works in Illustrator CS6 and later',
                  ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше' },
        errSel: { en: 'Error\nPlease select at least 1 object and try again',
                  ru: 'Ошибка\nВыберите хотя бы один объект и запустите скрипт' },
        status: { en: 'Preparing objects', ru: 'Подготовка объектов' }
      };

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (CFG.aiVers < 16) {
    alert(LANG.errVers);
    return;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var doc = activeDocument,
      userScreen = doc.views[0].screenMode,
      selItems = [];

  if (!Folder(CFG.actionPath).exists) Folder(CFG.actionPath).create();

  // Generate action
  var actionStr =  [
      '/version 3',
      '/name [' + CFG.actionSet.length,
          ascii2Hex(CFG.actionSet),
      ']',
      '/isOpen 1',
      '/actionCount 1',
      '/action-1 {',
          '/name [' + CFG.actionName.length,
              ascii2Hex(CFG.actionName),
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

  createAction(actionStr, CFG.actionSet, CFG.actionPath);

  getItems(selection, selItems);

  selection = null;

  if (selItems.length > CFG.limit) {
    doc.views[0].screenMode = ScreenMode.FULLSCREEN;
  }

  // Create progress bar
  var minValue = 0,
      maxValue = 100;
  var win = new Window('palette', SCRIPT.name + ' ' + SCRIPT.version);
      win.opacity = .95;
  var progPnl = win.add('panel', undefined, LANG.status);
      progPnl.margins = [10, 20, 10, 10];
      win.alignChildren = ['fill','center'];
  var progBar = progPnl.add('progressbar', [20, 15, 300, 25], minValue, maxValue);
  var progLabel = progPnl.add('statictext', undefined, minValue + CFG.percent);
      progLabel.preferredSize.width = 35;

  win.center();
  win.show();

  for (var i = 0, sLen = selItems.length; i < sLen; i++) {
    activateClip(selItems[i], CFG.actionName, CFG.actionSet);

    // Update Progress bar
    progBar.value = parseInt((i / sLen) * 100);
    progLabel.text = progBar.value + CFG.percent;
    win.update();
  }

  app.unloadAction(CFG.actionSet, '');
  doc.views[0].screenMode = userScreen;

  // The final progress bar value
  progBar.value = maxValue;
  progLabel.text = progBar.value + CFG.percent;
  win.update();
  win.close();
}

// Load Action to Adobe Illustrator
function createAction(str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

function ascii2Hex(hex) {
  return hex.replace(/./g, function (a) { return a.charCodeAt(0).toString(16) });
}

function getItems(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          arr.push(currItem);
          getItems(currItem.pageItems, arr);
          break;
        default:
          arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

function activateClip(item, name, set) {
  try {
    item.selected = true;
    app.doScript(name, set);
    selection = null;
    redraw();
  } catch (e) {}
}

// Run script
try {
  main();
} catch (e) {}
