/*
  SelectBySwatches.jsx for Adobe Illustrator
  Description: Select objects if the stroke color matches the selected swatches
  Date: June, 2021
  Modification date: April, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  *************************************************************************************************
  * WARNING: Don't put this script in the action slot for a quick run. It will freeze Illustrator *
  *************************************************************************************************

  Release notes:
  0.3.2 Fixed bug on PC when top layer is hidden or locked
  0.3.1 Removed input activation on Windows OS below CC v26.4
  0.3 Added third option "Fill or Stroke"
  0.2.2 Fixed input activation in Windows OS
  0.2.1 Fixed "Illustrator quit unexpectedly" error
  0.2 Added a dialog for selecting fills or strokes
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
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'SelectBySwatches',
        version: 'v0.3.2'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        keyword: '%selswatch%',
        set: 'SelBySwatch',
        action: 'SelectByNote',
        path: Folder.myDocuments + '/Adobe Scripts/',
        dlgOpacity: 0.97 // UI window opacity. Range 0-1
      },
      LANG = {
        errVer: { en: 'Wrong app version\nSorry, script only works in Illustrator CS6 and later',
                  ru: 'Неподходящая версия\nСкрипт работает в Illustrator CS6 и выше' },
        errDoc: { en: 'Error\nOpen a document and try again', 
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSwatch: { en: 'Error\nPlease, select at least one swatch', 
                    ru: 'Ошибка\nВыберите хотя бы один образец цвета' },
        fill: { en: 'Fill Color', ru: 'Цвет заливки' },
        stroke: { en: 'Stroke Color', ru: 'Цвет контура' },
        any: { en: 'Fill or Stroke', ru: 'Заливка или контур' },
        hotkeyFill: { en: 'Press <1> for quick acess', ru: 'Нажмите <1> для выбора' },
        hotkeyStroke: { en: 'Press <2> for quick acess', ru: 'Нажмите <2> для выбора' },
        hotkeyAny: { en: 'Press <3> for quick acess', ru: 'Нажмите <3> для выбора' },
        empty: { en: 'No items found with selected swatches', ru: 'Объекты с указанными цветами не найдены' },
      };

  if (CFG.aiVers < 16) {
    alert(LANG.errVer);
    return;
  }

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  var doc = activeDocument,
      selSwatch = doc.swatches.getSelected();

  if (!selSwatch.length) {
    alert(LANG.errSwatch);
    return;
  }

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';
      win.spacing = 10;
      win.margins = 16;
      win.preferredSize.width = 190;
      win.opacity = CFG.dlgOpacity;

  var fillBtn = win.add('button', undefined, LANG.fill);
      fillBtn.helpTip = LANG.hotkeyFill;
  var strokeBtn = win.add('button', undefined, LANG.stroke);
      strokeBtn.helpTip = LANG.hotkeyStroke;
  var anyBtn = win.add('button', undefined, LANG.any);
      anyBtn.helpTip = LANG.hotkeyAny;

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    fillBtn.active = true;
  }

  var copyright = win.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  fillBtn.onClick = function () { process(1); };
  strokeBtn.onClick = function () { process(2); };
  anyBtn.onClick = function () { process(3); };

  // Begin access key shortcut. For Mac users only
  win.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (key.match(/1/)) fillBtn.notify();
    if (key.match(/2/)) strokeBtn.notify();
    if (key.match(/3/)) anyBtn.notify();
  });
  // End access key shortcut
  
  win.center();
  win.show();

  function process(code) {
    // Fix bug on PC when top layer is hidden or locked
    var tmpLay = doc.layers.add();

    var items = [];
    switch (selSwatch.length) {
      case 1:
        items = getItemsBySwatch(selSwatch[0], code);
        selectItems(items, code, CFG);
        break;
      default: // multiple swatches selected
        for (var i = 0, len = selSwatch.length; i < len; i++) {
          items = [].concat(items, getItemsBySwatch(selSwatch[i], code));
        }
        selectItems(items, 3, CFG);
        break;
    }

    if (!items.length) alert(LANG.empty);

    try {
      tmpLay.remove();
    } catch(err) {}
    win.close();
  }
}

/** 
* Find objects of the same color
* @param {Object} swatch - The swatch color
* @param {number} code - The code to determine which properties of the items to search
* 1: fill color only
* 2: stroke color only
* 3: both fill and stroke colors
* @returns {Array} - An array of selected items in the active document
*/
function getItemsBySwatch(swatch, code) {
  var doc = app.activeDocument;
  var total = [];
  if (code == 1 || code == 3) {
    selection = null;
    doc.defaultFillColor = swatch.color;
    app.executeMenuCommand('Find Fill Color menu item');
    if (selection.length) total.push.apply(total, selection);
  }
  if (code == 2 || code == 3) {
    selection = null;
    doc.defaultStrokeColor = swatch.color;
    app.executeMenuCommand('Find Stroke Color menu item');
    if (selection.length) total.push.apply(total, selection);
  }
  return total;
}

/** 
 * Selects items in a given array
 * @param {Array} arr - The array of items to select
 * @param {number} code - The code to select by fill and stroke colors
 * @param {Object} props - The script constant
 */
function selectItems(arr, code, props) {
  if (code !== 3 || !arr.length) return;
  addNote(arr, props.keyword);
  selectByNote(props.set, props.action, props.path, props.keyword);
  removeNote(arr, props.keyword);
}

/**
 * Put keyword into Note in Attributes panel
 * @param {Object} coll - Array of items
 * @param {string} key - Keyword for notes
 */
function addNote(coll, key) {
  for (var i = 0, len = coll.length; i < len; i++) {
    (coll[i].note == '') ? coll[i].note = key : coll[i].note += key;
  }
}

/**
 * Remove keyword from Note in Attributes panel
 * @param {Object} coll - Array of items
 * @param {string} key - Keyword for notes
 */
function removeNote(coll, key) {
  var regexp = new RegExp(key, 'gi');
  for (var i = 0; i < coll.length; i++) {
    coll[i].note = coll[i].note.replace(regexp, '');
  }
}

/**
 * Run a fast selection via the created action
 * @param {string} set - Name of the action set
 * @param {string} name - Action name
 * @param {string} path - Folder path for .aia file
 * @param {string} key - Keyword for notes
 */
function selectByNote(set, name, path, key) {
  if (!Folder(path).exists) Folder(path).create();
  // Generate Action
  var actionCode = '''/version 3
  /name [ ''' + set.length + '''
    ''' + ascii2Hex(set) + '''
  ]
  /isOpen 1
  /actionCount 1
  /action-1 {
    /name [ ''' + name.length + '''
      ''' + ascii2Hex(name) + '''
    ]
    /keyIndex 0
    /colorIndex 0
    /isOpen 1
    /eventCount 1
    /event-1 {
      /useRulersIn1stQuadrant 0
      /internalName (adobe_setSelection)
      /localizedName [ 13
        5365742053656c656374696f6e
      ]
      /isOpen 0
      /isOn 1
      /hasDialog 0
      /parameterCount 3
      /parameter-1 {
        /key 1952807028
        /showInPalette 4294967295
        /type (ustring)
        /value [ ''' + key.length + '''
          ''' + ascii2Hex(key) + '''
        ]
      }
      /parameter-2 {
        /key 2003792484
        /showInPalette 4294967295
        /type (boolean)
        /value 0
      }
      /parameter-3 {
        /key 1667330917
        /showInPalette 4294967295
        /type (boolean)
        /value 0
      }
    }
  }''';
  try {
    app.unloadAction(set, '');
  } catch (err) {}
  createAction(actionCode, set, path);
  app.doScript(name, set);
  app.redraw();
  app.unloadAction(set, '');
}

/**
 * Load Action to Adobe Illustrator
 * @param {string} str - The action code
 * @param {string} set - Name of the action set
 * @param {string} path - Folder path for the .aia file
 */
function createAction(str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

/**
 * Convert string to hex
 * @param {string} hex - Input string
 * @returns {string} hex - Value
 */
function ascii2Hex(hex) {
  return hex.replace(/./g, function(a) {
    return a.charCodeAt(0).toString(16);
  });
}

/**
 * Open link in browser
 * @param {string} url - Website adress
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (err) {}