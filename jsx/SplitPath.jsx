/*
  SplitPath.jsx for Adobe Illustrator
  Description: Script for subtract Shapes from Paths. Pathfinder in Illustrator does not do it =)
  Requirements: Adobe Illustrator CS6 and above
  Date: August, 2018
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version (old name 'pathSubtract'). Manual preparation document. 2 separate script files for run
  1.0 Two script files merged in one. Added GUI: choose 2 methods — analogues of the Pathfinder panel
  1.1 Minor improvements

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

function main() {
  var SCRIPT = {
        name: 'SplitPath',
        version: 'v.1.1'
      },
      CFG = {
        aiVers: parseInt(app.version),
      },
      LANG = { 
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel: { en: 'Error\nPlease, select two or more objects',
                  ru: 'Ошибка\nВыделите 2 или более объекта' },
        errVers: { en: 'Error\nSorry, script only works in Illustrator CS6 and later',
                  ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше' },
        errFill: { en: 'Error\nPlease, fill the mask object in any color',
                  ru: 'Ошибка\nДобавьте объекту для вырезания любую заливку цветом'},
        errOpen: { en: 'Error\nTo use Intersect add in selection atleast one opened path', 
                  ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 незамкнутую линию'},
        errClose: { en: 'Error\nTo use Intersect add in selection atleast one closed path',
                    ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 замкнутую линию'},
        minus: { en: 'Minus Front', ru: 'Минус верхний'},
        intersect: { en: 'Intersect', ru: 'Пересечение'},
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (CFG.aiVers < 16) {
    alert(LANG.errVers);
    return;
  }

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var info = {
        isFilled: false,
        isClosed: false,
        isOpened: false
      };
  checkFill(selection, info);

  // Create Main Window
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChild = ['fill', 'center'];

  // Split method
  var method = dialog.add('group');
      method.orientation = 'row';
      method.margins = [0, 10, 0, 10];
  var minusRadio = method.add('radiobutton', undefined, LANG.minus);
      minusRadio.active = true;
      minusRadio.value = true;
  var intersectRadio = method.add('radiobutton', undefined, LANG.intersect);

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'row';
  var cancel = btns.add('button', undefined, LANG.cancel, {name: 'cancel'});
  var ok = btns.add('button', undefined, LANG.ok, {name: 'ok'});

  var copyright = dialog.add('statictext', undefined, '© Sergey Osokin. Visit Github');
      copyright.justify = 'center';
  
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Begin access key shortcut
  dialog.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      var key = kd.keyName;
      if (key.match(/1/)) minusRadio.notify();
      if (key.match(/2/)) intersectRadio.notify();
    };
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

    try {
      if (minusRadio.value) { 
        minusFront();
      } else {
        intersect(SCRIPT.name);
      }
    } catch (e) {}

    dialog.close();
  }

  cancel.onClick = dialog.close;

  dialog.center();
  dialog.show();
}

// Minus Front method
function minusFront() {
  releaseGroups(selection);
  cutPaths();
}

// Intersect method
function intersect(name) {
  var saveSel = [],
      saveFill = [];

  releaseGroups(selection);
  saveState(saveSel, saveFill);
  addTopRectangle(name);

  selection = null;
  restore(saveFill);

  rectIntersect = activeDocument.pageItems.getByName(name);
  rectIntersect.selected = true;
  
  // Create a intersect mask
  app.executeMenuCommand('group');
  app.executeMenuCommand('Live Pathfinder Minus Back');
  app.executeMenuCommand('expandStyle');
  app.executeMenuCommand('ungroup');
  
  // Place the intersect mask over the lines
  app.executeMenuCommand('group');
  selection[0].move(saveSel[0], ElementPlacement.PLACEBEFORE);
  app.executeMenuCommand('ungroup');
  
  restore(saveSel);
  cutPaths();
}

// Searching unfilled objects
function checkFill(arr, attr) {
  for (var i = 0, aLen = arr.length; i < aLen; i++) {
    var currItem = arr[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          checkFill(currItem.pageItems);
          break;
        case 'PathItem':
          if (currItem.filled) attr.isFilled = true;
          if (currItem.closed) attr.isClosed = true;
          if (!currItem.closed) attr.isOpened = true;
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && currItem.pathItems[0].closed) attr.isFilled = true;
          if (currItem.pathItems[0].closed) attr.isClosed = true;
          if (!currItem.pathItems[0].closed) attr.isOpened = true;
          break;
        default:
          break;
      }
    } catch (e) { }
  }
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

// Ungroup array
function releaseGroups(arr) {
  var childArr = getChildAll(arr);

  if (childArr.length < 1) {
    arr.remove();
    return;
  }

  for (var i = 0, cLen = childArr.length; i < cLen; i++) {
    var currItem = childArr[i];
    try {
      if (currItem.parent.typename !== 'Layer') {
        currItem.move(arr, ElementPlacement.PLACEBEFORE);
      }
      if (currItem.typename === 'GroupItem' || currItem.typename === 'Layer') {
        releaseGroups(currItem);
      }
    } catch (e) { }
  }
  app.redraw();
}

function saveState(sel, fills) {
  for (var i = 0, selLen = selection.length; i < selLen; i++) {
    var currItem = selection[i];
    try {
      switch (currItem.typename) {
        case 'PathItem':
          if (currItem.filled && currItem.closed) fills.push(currItem);
          if (!currItem.closed) sel.push(currItem);
          break;
        case 'CompoundPathItem':
          var zeroItem = currItem.pathItems[0];
          if (zeroItem.filled && zeroItem.closed) fills.push(currItem);
          if (!zeroItem.closed) sel.push(currItem);
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
  app.executeMenuCommand('Expand Planet X');
  selection[0].groupItems[selection[0].groupItems.length - 1].remove();
  app.executeMenuCommand('ungroup');
}

function addTopRectangle(name) {
  if (selection instanceof Array) {
    // Used code from FitArtboardToArt.jsx by Darryl Zurn
    var initBounds = selection[0].visibleBounds;
    for (var i = 1, selLen = selection.length; i < selLen; i++) {
      var groupBounds = selection[i].visibleBounds;
      if (groupBounds[0] < initBounds[0]) {
        initBounds[0] = groupBounds[0];
      }
      if (groupBounds[1] > initBounds[1]) {
        initBounds[1] = groupBounds[1];
      }
      if (groupBounds[2] > initBounds[2]) {
        initBounds[2] = groupBounds[2];
      }
      if (groupBounds[3] < initBounds[3]) {
        initBounds[3] = groupBounds[3];
      }
    }
  }

  var top = initBounds[1] + 1,
      left = initBounds[0] - 1,
      width = initBounds[2] - initBounds[0] + 2,
      height = initBounds[1] - initBounds[3] + 2;

  var rect = activeDocument.activeLayer.pathItems.rectangle(top, left, width, height);
  rect.name = name;
  rect.filled = true;
  rect.strokeColor = new NoColor();
}

function restore(arr) {
  for (var i = 0, aLen = arr.length; i < aLen; i++) {
    arr[i].selected = true;
  }
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