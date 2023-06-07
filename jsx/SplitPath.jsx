/*
  SplitPath.jsx for Adobe Illustrator
  Description: Script for subtract Shapes from Paths. Pathfinder in Illustrator does not do it =)
  Requirements: Adobe Illustrator CS6 and above
  Date: November, 2022
  Modification date: June, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version (old name 'pathSubtract'). Manual preparation document. 2 separate script files for run
  1.0 Two script files merged in one. Added GUI: choose 2 methods — analogues of the Pathfinder panel
  1.1 Minor improvements
  1.1.1 Fixed "Illustrator quit unexpectedly" error
  1.1.2 Fixed input activation in Windows OS
  1.2 Added option to save the original filled path
  1.3 Fixed expand command when script is launched via Action

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

function main() {
  var SCRIPT = {
        name: 'SplitPath',
        version: 'v.1.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
      },
      LANG = { 
        errFill: { en: 'Error\nPlease, fill the mask path in any color or ungroup it',
                  ru: 'Ошибка\nДобавьте фигуре для вырезания любую заливку цветом или разгруппируйте ее'},
        errOpen: { en: 'Error\nTo use Intersect add in selection atleast one opened path', 
                  ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 незамкнутую линию'},
        errClose: { en: 'Error\nTo use Intersect add in selection atleast one closed path',
                    ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 замкнутую линию'},
        minus: { en: 'Minus Front', ru: 'Минус верхний'},
        intersect: { en: 'Intersect', ru: 'Пересечение'},
        keep: { en: 'Keep original filled path', ru: 'Оставить путь с заливкой'},
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (!isCorrectEnv('version:16', 'selection')) return;

  var info = {
        isFilled: false,
        isClosed: false,
        isOpened: false
      };
  checkFill(selection, info);

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers > 16;

  // Create Main Window
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  // Split method
  var method = win.add('group');
      method.orientation = 'row';
  var minusRadio = method.add('radiobutton', undefined, LANG.minus);
      minusRadio.value = true;
  var intersectRadio = method.add('radiobutton', undefined, LANG.intersect);

  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    minusRadio.active = true;
  }
  
  var isKeepPath = win.add('checkbox', undefined, LANG.keep);

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignment = 'center';
  var cancel = btns.add('button', undefined, LANG.cancel, {name: 'cancel'});
  var ok = btns.add('button', undefined, LANG.ok, {name: 'ok'});

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';
  
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Begin access key shortcut
  win.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (key.match(/1/)) minusRadio.notify();
    if (key.match(/2/)) intersectRadio.notify();
  });
  // End access key shortcut

  ok.onClick = okClick;
  
  function okClick() {
    if (!info.isFilled) {
      alert(LANG.errFill);
      return;
    }

    if (intersectRadio.value && !info.isOpened) {
      alert(LANG.errOpen);
      return;
    }

    if (intersectRadio.value && !info.isClosed) {
      alert(LANG.errClose);
      return;
    }

    releaseGroups(selection);
    if (isKeepPath.value) keepFilledPaths();
    if (minusRadio.value) { 
      cutPaths();
    } else {
      intersect();
    }

    win.close();
  }

  cancel.onClick = win.close;

  win.center();
  win.show();
}

// Check the script environment
function isCorrectEnv() {
  var lang = {
        errApp: { en: 'Error\nRun script from Adobe Illustrator',
                  ru: 'Ошибка\nЗапустите скрипт в Adobe Illustrator' },
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel: { en: 'Error\nPlease, select stroked paths and filled shape',
                  ru: 'Ошибка\nВыделите контурные линии и фигуру с заливкой' },
        errVers: { en: 'Error\nSorry, script only works in Adobe Illustrator above v.',
                  ru: 'Ошибка\nСкрипт работает в Adobe Illustrator выше v.' },
      },
      args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert(lang.errApp);
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert(lang.errVers + rqdVers);
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert(lang.errDoc);
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert(lang.errSel);
          return false;
        }
        break;
    }
  }

  return true;
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

// Intersect method
function intersect() {
  var doc = app.activeDocument,
      saveSel = [],
      saveFill = [];

  saveState(saveSel, saveFill);
  var rectIntersect = addTopRectangle();
  var tmpGroup = selection[0].layer.groupItems.add();

  for (var i = saveFill.length - 1; i >= 0; i--) {
    saveFill[i].move(tmpGroup, ElementPlacement.PLACEATBEGINNING);
  }
  rectIntersect.move(tmpGroup, ElementPlacement.PLACEATBEGINNING);

  selection = tmpGroup;
  updateDoc(tmpGroup.layer);

  // Create a intersect mask
  app.executeMenuCommand('Live Pathfinder Minus Back');
  app.executeMenuCommand('expandStyle');
  releaseGroups(selection);
  
  for (var j = 0, len = saveSel.length; j < len; j++) {
    saveSel[j].selected = true;
  }

  updateDoc(selection[0].layer);
  cutPaths();
}

// Searching unfilled objects
function checkFill(arr, attr) {
  var item = null;
  for (var i = 0, len = arr.length; i < len; i++) {
    item = arr[i];
    try {
      switch (item.typename) {
        case 'GroupItem':
          checkFill(item.pageItems, attr);
          break;
        case 'PathItem':
          if (item.filled) attr.isFilled = true;
          if (item.closed) attr.isClosed = true;
          if (!item.closed) attr.isOpened = true;
          break;
        case 'CompoundPathItem':
          if (item.pathItems.length) {
            var zero = item.pathItems[0];
            if (zero.filled && zero.closed) attr.isFilled = true;
            if (zero.closed) attr.isClosed = true;
            if (!zero.closed) attr.isOpened = true;
          }
          break;
        default:
          break;
      }
    } catch (e) { }
  }
}

// Ungroup array
function releaseGroups(arr) {
  var childArr = getChildAll(arr);

  if (childArr.length < 1) {
    arr.remove();
    return;
  }

  var item = null;
  for (var i = 0, cLen = childArr.length; i < cLen; i++) {
    item = childArr[i];
    try {
      if (item.parent.typename !== 'Layer') {
        item.move(arr, ElementPlacement.PLACEBEFORE);
      }
      if (item.typename === 'GroupItem' || item.typename === 'Layer') {
        releaseGroups(item);
      }
    } catch (e) { }
  }
  updateDoc(selection[0].layer);
}

function getChildAll(arr) {
  var childsArr = [];
  if (Object.prototype.toString.call(arr) === '[object Array]') {
    childsArr.push.apply(childsArr, arr);
  } else {
    for (var i = 0, piLen = arr.pageItems.length; i < piLen; i++) {
      childsArr.push(arr.pageItems[i]);
    }
  }
  if (arr.layers) {
    for (var l = 0, lyrLen = arr.layers.length; l < lyrLen; l++) {
      childsArr.push(arr.layers[l]);
    }
  }
  return childsArr;
}

function keepFilledPaths() {
  var item = null,
      dup = null;
  for (var i = 0, len = selection.length; i < len; i++) {
    item = selection[i];
    if ((item.typename === 'PathItem' && item.filled) ||
        (item.typename === 'CompoundPathItem' && item.pathItems[0].filled)) {
      dup = selection[i].duplicate();
      dup.selected = false;
    }
  }
}

function saveState(sel, fills) {
  var item = null;
  for (var i = 0, selLen = selection.length; i < selLen; i++) {
    item = selection[i];
    try {
      switch (item.typename) {
        case 'PathItem':
          if (item.filled && item.closed) fills.push(item);
          if (!item.closed || !item.filled) sel.push(item);
          break;
        case 'CompoundPathItem':
          if (item.pathItems.length) {
            var zero = item.pathItems[0];
            if (zero.filled && zero.closed) fills.push(item);
            if (!zero.closed || !zero.filled) sel.push(item);
          }
          break;
        default:
          break;
      }
    } catch (e) { }
  }

  return [sel, fills];
}

function cutPaths() {
  app.executeMenuCommand('Make Planet X');
  updateDoc(selection[0].layer);
  app.executeMenuCommand('Expand Planet X');
  selection[0].groupItems[selection[0].groupItems.length - 1].remove();
  releaseGroups(selection);
}

function addTopRectangle() {
  if (selection instanceof Array) {
    // Used code from FitArtboardToArt.jsx by Darryl Zurn
    var bnds = selection[0].visibleBounds;
    for (var i = 1, selLen = selection.length; i < selLen; i++) {
      var grpBnds = selection[i].visibleBounds;
      if (grpBnds[0] < bnds[0]) bnds[0] = grpBnds[0];
      if (grpBnds[1] > bnds[1]) bnds[1] = grpBnds[1];
      if (grpBnds[2] > bnds[2]) bnds[2] = grpBnds[2];
      if (grpBnds[3] < bnds[3]) bnds[3] = grpBnds[3];
    }
  }

  var top = bnds[1] + 1,
      left = bnds[0] - 1,
      width = bnds[2] - bnds[0] + 2,
      height = bnds[1] - bnds[3] + 2;

  var color = new RGBColor();
  color.red = 0; color.green = 0; color.black = 0;
  var rect = selection[0].layer.pathItems.rectangle(top, left, width, height);
  rect.filled = true;
  rect.fillColor = color;
  rect.strokeColor = new NoColor();

  return rect;
}

// Update document trick without recording in history
// Replace app.redraw()
function updateDoc(layer) {
  var tmpPath = layer.pathItems.add();
  tmpPath.translate(10, 10);
  tmpPath.remove();
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
  main();
} catch (e) {}