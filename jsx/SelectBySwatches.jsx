/*
  SelectBySwatches.jsx for Adobe Illustrator
  Description: Select objects if the stroke color matches the selected swatches
  Date:  July, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added a dialog for selecting fills or strokes

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

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'SelectBySwatches',
        version: 'v.0.2'
      },
      CFG = {
        keyword: '%selswatch%',
        actionSet: 'SelBySwatch',
        actionName: 'SelectByNote',
        actionPath: Folder.myDocuments + '/Adobe Scripts/',
        dlgOpacity: 0.97 // UI window opacity. Range 0-1
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again', 
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSwatch: { en: 'Error\nPlease, select at least one swatch', 
                    ru: 'Ошибка\nВыберите хотя бы один образец цвета' },
        fill: { en: 'Fill Color', ru: 'Цвет заливки' },
        stroke: { en: 'Stroke Color', ru: 'Цвет контура' },
        hotkeyFill: { en: 'Press <1> for quick acess\n(Mac OS)', ru: 'Нажмите <1> для выбора\n(Mac OS)' },
        hotkeyStroke: { en: 'Press <2> for quick acess\n(Mac OS)', ru: 'Нажмите <2> для выбора\n(Mac OS)' }
      };

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
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.spacing = 10;
      dialog.margins = 16;
      dialog.opacity = CFG.dlgOpacity;

  var fillBtn = dialog.add('button', undefined, LANG.fill);
      fillBtn.active = true;
      fillBtn.helpTip = LANG.hotkeyFill;
  var strokeBtn = dialog.add('button', undefined, LANG.stroke);
      strokeBtn.helpTip = LANG.hotkeyStroke;

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  fillBtn.onClick = function () { process(true); };
  strokeBtn.onClick = function () { process(false); };

  // Begin access key shortcut. For Mac users only
  dialog.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (key.match(/1/)) fillBtn.notify();
    if (key.match(/2/)) strokeBtn.notify();
  });
  // End access key shortcut
  
  dialog.center();
  dialog.show();

  function process(isFill) {
    switch (selSwatch.length) {
      case 1:
        selection = null;
        if (isFill) {
          doc.defaultFillColor = selSwatch[0].color;
          app.executeMenuCommand('Find Fill Color menu item');
        } else {
          doc.defaultStrokeColor = selSwatch[0].color;
          app.executeMenuCommand('Find Stroke Color menu item');
        }
        break;
      default: // multiple swatches selected
        var totalSel = [];
        for (var i = 0, swatchLen = selSwatch.length; i < swatchLen; i++) {
          selection = null;
          if (isFill) {
            doc.defaultFillColor = selSwatch[i].color;
            app.executeMenuCommand('Find Fill Color menu item');
          } else {
            doc.defaultStrokeColor = selSwatch[i].color;
            app.executeMenuCommand('Find Stroke Color menu item');
          }
          totalSel.push.apply(totalSel, selection);
        }
        addNote(totalSel, CFG.keyword);
        selectByNote(CFG.actionSet, CFG.actionName, CFG.actionPath, CFG.keyword);
        removeNote(totalSel, CFG.keyword);
        break;
    }
    dialog.close();
  }
}

/**
 * Put keyword into Note in Attributes panel
 * @param {object} collection array of items
 * @param {string} key keyword for notes
 */
function addNote(collection, key) {
  for (var i = 0, len = collection.length; i < len; i++) {
    (collection[i].note == '') ? collection[i].note = key : collection[i].note += key;
  }
}

/**
 * Remove keyword from Note in Attributes panel
 * @param {object} collection array of items
 * @param {string} key keyword for notes
 */
function removeNote(collection, key) {
  var regexp = new RegExp(key, 'gi');
  for (var i = 0; i < collection.length; i++) {
    collection[i].note = collection[i].note.replace(regexp, '');
  }
}

/**
 * Run a fast selection via the created action
 * @param {string} set name of the action set
 * @param {string} name name of the action
 * @param {string} path folder path for .aia file
 * @param {string} key keyword for notes
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

  createAction(actionCode, set, path);
  app.doScript(name, set);
  app.redraw();
  app.unloadAction(set, '');
}

/**
 * Load Action to Adobe Illustrator
 * @param {*} str the action code
 * @param {*} set name of the action set
 * @param {*} path folder path for the .aia file
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
 * @param {string} hex input string
 * @return {string} hex value
 */
function ascii2Hex(hex) {
  return hex.replace(/./g, function(a) {
    return a.charCodeAt(0).toString(16);
  });
}

/**
 * Open link in browser
 * @param {string} url - website adress
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
} catch (e) {}