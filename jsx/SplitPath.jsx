/*
  SplitPath.jsx for Adobe Illustrator
  Description: Script for subtract Shapes from Paths. Pathfinder in Illustrator does not do it =)
  Requirements: Adobe Illustrator CS6 and above
  Date: August, 2018
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ============================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Versions:
  0.1 Initial version (old name 'pathSubtract'). Manual preparation document. 2 separate script files for run.
  1.0 Two script files merged in one. Added GUI: choose 2 methods — analogues of the Pathfinder panel.
  1.1 Minor improvements.
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization

// Global variables
var SCRIPT_NAME = 'SplitPath',
    SCRIPT_VERSION = 'v.1.1';
    AI_VER = parseInt(app.version);

// EN-RU localized messages
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.',
                     ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_SELECT = { en: 'Error\nPlease, select two or more objects.',
                        ru: 'Ошибка\nВыделите 2 или более объекта.'},
    LANG_ERR_VER = { en: 'Error\nSorry, script only works in Illustrator CS6 and above.',
                     ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше.'},
    LANG_ERR_FILL = { en: 'Error\nPlease, fill the mask object in any color.',
                      ru: 'Ошибка\nДобавьте объекту для вырезания любую заливку цветом.'},
    LANG_ERR_INTERSECT_O = { en: 'Error\nTo use Intersect add in selection atleast one opened path.', 
                             ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 незамкнутую линию.'},
    LANG_ERR_INTERSECT_C = { en: 'Error\nTo use Intersect add in selection atleast one closed path.',
                             ru: 'Ошибка\nДля использования метода Пересечение добавьте хотя бы 1 замкнутую линию.'},
    LANG_MINUS = { en: 'Minus Front', ru: 'Минус верхний'},
    LANG_INTERSECT = { en: 'Intersect', ru: 'Пересечение'},
    LANG_OK = { en: 'Ok', ru: 'Готово'},
    LANG_CANCEL = { en: 'Cancel', ru: 'Отмена'};

var isFilled = isOpened = isClosed = false;

function main() {
  if (documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  }

  if (selection.length == 0) {
    alert(LANG_ERR_SELECT);
    return;
  }

  if (AI_VER < 16) {
    alert(LANG_ERR_VER);
    return;
  }

  checkFill(selection);
  
  // Create Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION, undefined);
  dialog.orientation = 'column';
  dialog.alignChild = ['fill', 'center'];

  // Split method
  var method = dialog.add('group');
  method.orientation = 'row';
  method.alignChild = 'fill';
  method.margins = [0, 10, 0, 10];
  var minusRadio = method.add('radiobutton', undefined, LANG_MINUS);
  var intersectRadio = method.add('radiobutton', undefined, LANG_INTERSECT);
  minusRadio.value = true;

  // Buttons
  var btns = dialog.add('group');
  btns.alignChild = 'fill';
  btns.orientation = 'row';
  var cancel = btns.add('button', undefined, LANG_CANCEL, {name: 'cancel'});
  var ok = btns.add('button', undefined, LANG_OK, {name: 'ok'});
  ok.active = true;

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, sergosokin.ru');
  copyright.justify = 'center';
  copyright.enabled = false;

  ok.onClick = okClick;
  
  function okClick() {
    if (!isFilled) {
      alert(LANG_ERR_FILL);
      return;
    }

    if (intersectRadio.value && !isOpened) {
      alert(LANG_ERR_INTERSECT_O);
      return;
    }

    if (intersectRadio.value && !isClosed) {
      alert(LANG_ERR_INTERSECT_C);
      return;
    }

    try {
      if (minusRadio.value) { minusFront(); }
      else { intersect(); }
    } catch (e) {
      // showError(e);
    }

    dialog.close();
  }

  cancel.onClick = function () {
    dialog.close();
  }

  dialog.center();
  dialog.show();
}

// Minus Front method
function minusFront() {
  releaseGroups(selection);
  cutPaths();
}

// Intersect method
function intersect() {
  var saveSel = [],
      saveFill = [];

  releaseGroups(selection);
  saveState(saveSel, saveFill);
  addTopRectangle();

  selection = null;
  restore(saveFill);

  rectIntersect = activeDocument.pageItems.getByName(SCRIPT_NAME);
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
function checkFill(arr) {
  for (var i = 0; i < arr.length; i++) {
    var currItem = arr[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          checkFill(currItem.pageItems);
          break;
        case 'PathItem':
          if (currItem.filled) { isFilled = true; }
          if (currItem.closed) { isClosed = true; }
          if (!currItem.closed) { isOpened = true; }
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && currItem.pathItems[0].closed) { isFilled = true; }
          if (currItem.pathItems[0].closed) { isClosed = true; }
          if (!currItem.pathItems[0].closed) { isOpened = true; }
          break;
        default:
          break;
      }
    } catch (e) { }
  }

  return [isFilled, isClosed, isOpened];
}

function getChildAll(arr) {
  var childsArr = [];
  if (Object.prototype.toString.call(arr) === '[object Array]') {
    childsArr.push.apply(childsArr, arr);
  } else {
    for (var i = 0; i < arr.pageItems.length; i++) {
      childsArr.push(arr.pageItems[i]);
    }
  }
  if (arr.layers) {
    for (var l = 0; l < arr.layers.length; l++) {
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

  for (var i = 0; i < childArr.length; i++) {
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
  for (var i = 0; i < selection.length; i++) {
    var currItem = selection[i];
    try {
      switch (currItem.typename) {
        case 'PathItem':
          if (currItem.filled && currItem.closed) { fills.push(currItem); }
          if (!currItem.closed) { sel.push(currItem); }
          break;
        case 'CompoundPathItem':
          var zeroItem = currItem.pathItems[0];
          if (zeroItem.filled && zeroItem.closed) { fills.push(currItem); }
          if (!zeroItem.closed) { sel.push(currItem); }
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

function addTopRectangle() {
  if (selection instanceof Array) {
    // Used code from FitArtboardToArt.jsx by Darryl Zurn
    var initBounds = selection[0].visibleBounds;
    for (var i = 1; i < selection.length; i++) {
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
  rect.name = SCRIPT_NAME;
  rect.filled = true;
  rect.strokeColor = new NoColor();
}

function restore(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i].selected = true;
  }
}

function showError(e) {
  if (confirm(scriptName + ': an unknown error has occurred.\n' +
    'Would you like to see more information?', true, 'Unknown Error')) {
    alert(e + ': on line ' + e.line, 'Script Error', true);
  }
}

try {
  main();
} catch (e) {
  // showError(e);
}