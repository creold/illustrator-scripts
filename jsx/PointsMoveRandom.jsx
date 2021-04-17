/*
  PointsMoveRandom.jsx for Adobe Illustrator
  Description: Random movement of selected points in an user range.
  Requirements: Adobe Illustrator CS6 and above
  Date: May, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
  0.1 Initial version
  0.2 Added deselect some anchors, move handles
  0.3 Added step, saving settings. Minor improvements

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via PayPal http://www.paypal.me/osokin/usd
  - via QIWI https://qiwi.com/n/OSOKIN​
  - via YooMoney https://yoomoney.ru/to/410011149615582​

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization

// Global variables
var SCRIPT_NAME = 'Points Move Random',
    SCRIPT_VERSION = 'v.0.3',
    DEF_MOVE = 1,
    DEF_CHANCE = 50,
    DEF_STEP = 1.0,
    SETTINGS_FILE = {
      name: SCRIPT_NAME.replace(/\s/g, '_') + '_data.ini',
      folder: Folder.myDocuments + '/Adobe Scripts/'
    };

var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.',
                     ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_SELECT = { en: 'Error\nPlease, select one or more paths.',
                        ru: 'Ошибка\nВыделите 1 или более объектов.'},
    LANG_ERR_STEP_ZERO = { en: 'Error\nThe step must be greater than 0.',
                           ru: 'Ошибка\nШаг должен быть больше 0.'},
    LANG_ERR_STEP_MAX = { en: 'Error\nThe step is out of range: ',
                          ru: 'Ошибка\nШаг выходит за границы диапазона: '};

// Main function
function main() {
  if (!app.documents.length) {
    alert(LANG_ERR_DOC);
    return;
  }

  var doc = app.activeDocument,
      selPaths = [],
      selPoints = [];

  getPaths(doc.selection, selPaths);
  getPoints(selPaths, selPoints);
  
  if (selPaths.length === 0) {
    alert(LANG_ERR_SELECT);
    return;
  }

  doc.selection = null;
  app.redraw();

  buildGUI(selPoints);
}

function buildGUI(points) {
  var undoCount = 0,
      newPoints = tempPoints = [],
      isRandChanged = false;

  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION); 
      dialog.orientation = 'column'; 
      dialog.alignChildren = ['fill','center']; 

  // RANGE PANEL
  var rangePnl = dialog.add('panel', undefined, 'Random move range, ' + getDocUnit()); 
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = ['left','center'];
      rangePnl.margins = [10,20,10,5]; 

  // HORIZONTAL INPUT
  var hGroup = rangePnl.add('group'); 
      hGroup.orientation = 'row'; 
      hGroup.alignChildren = ['left','center']; 

  var hGroupTitle = hGroup.add('statictext', undefined, 'Horizontal'); 

  var hRangeGroup = hGroup.add('group'); 
      hRangeGroup.orientation = 'row'; 
      hRangeGroup.alignChildren = ['left','center']; 

  var hFromVal = hRangeGroup.add('edittext', undefined, -DEF_MOVE); 
      hFromVal.characters = 5;
      hFromVal.active = true;

  var hGroupSubtitle = hRangeGroup.add('statictext', undefined, 'to'); 

  var hToVal = hRangeGroup.add('edittext', undefined, DEF_MOVE); 
      hToVal.characters = 5;

  var isHFixed = hRangeGroup.add('checkbox', undefined, 'Fixed H\u0332'); // Unicode underlined H
      isHFixed.helpTip = 'Press Alt+H to enable';

  // VERTICAL INPUT
  var vGroup = rangePnl.add('group'); 
      vGroup.orientation = 'row'; 
      vGroup.alignChildren = ['left','center']; 
      vGroup.spacing = 28; 

  var vGroupTitle = vGroup.add('statictext', undefined, 'Vertical'); 

  var vRangeGroup = vGroup.add('group'); 
      vRangeGroup.orientation = 'row'; 
      vRangeGroup.alignChildren = ['left','center']; 

  var vFromVal = vRangeGroup.add('edittext', undefined, -DEF_MOVE);
      vFromVal.characters = 5;

  var vGroupSubtitle = vRangeGroup.add('statictext', undefined, 'to'); 

  var vToVal = vRangeGroup.add('edittext', undefined, DEF_MOVE); 
      vToVal.characters = 5;
  
  var isVFixed = vRangeGroup.add('checkbox', undefined, 'Fixed V\u0332'); // Unicode underlined V
      isVFixed.helpTip = 'Press Alt+V to enable';

  // STEP INPUT
  var step = rangePnl.add('group'); 
      step.orientation = 'row'; 

  var stepTitle = step.add('statictext', [0, 0, 200, 30]);
      stepTitle.text = 'Step for random value, ' + getDocUnit() + ' (> 0)';

  var stepInp = step.add('edittext', undefined, DEF_STEP);
      stepInp.characters = 5;

  // OPTIONS
  var options = dialog.add('group'); 
      options.orientation = 'column'; 
      options.alignChildren = ['left','center'];

  var randOption = options.add('group'); 
      randOption.orientation = 'row'; 
      randOption.alignChildren = ['center','center']; 

  var isRandPoint = randOption.add('checkbox');
      isRandPoint.text = 'S\u0332elect some of the points randomly'; // Unicode underlined S
      isRandPoint.helpTip = 'Press Alt+S to enable';

  var chanceInp = randOption.add('edittext', undefined, '50'); 
      chanceInp.characters = 4;
      chanceInp.enabled = false;

  var percent = randOption.add('statictext', undefined, '%');

  var isHandles = options.add('checkbox');
      isHandles.text = 'M\u0332ove only points handles'; // Unicode underlined M
      isHandles.helpTip = 'Press Alt+M to enable';

  isRandPoint.onClick = function () {
    chanceInp.enabled = !chanceInp.enabled;
  }

  // BUTTONS
  var buttons = dialog.add('group'); 
      buttons.orientation = 'row'; 
      buttons.alignChildren = ['center','top']; 

  var close = buttons.add('button', undefined, 'Close', {name: 'cancel'});
      close.helpTip = 'Press Esc to Close';

  var revert = buttons.add('button', undefined, 'R\u0332evert'); // Unicode underlined R
      revert.helpTip = 'Press Alt+R to Revert';
      revert.enabled = false;

  var apply = buttons.add('button', undefined, 'A\u0332pply', {name: 'ok'}); // Unicode underlined A
      apply.helpTip = 'Press Alt+A to Apply';

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  close.onClick = function () { dialog.close(); }
  dialog.onClose = function () { saveSettings(); }

  isHFixed.onClick = function () { hFromVal.enabled = !hFromVal.enabled; }
  isVFixed.onClick = function () { vFromVal.enabled = !vFromVal.enabled; }
   
  // Restore original points state
  revert.onClick = function() {
    app.selection = null;
    if (undoCount) {
      while (undoCount--) app.undo();
      newPoints = tempPoints = [];
      isRandChanged = false;
      undoCount = 0;
      revert.enabled = false;
      app.redraw();
    }
  }
  
  // Use Up / Down arrow keys (+ Shift) for change value
  shiftInputNumValue(hFromVal);
  shiftInputNumValue(hToVal);
  shiftInputNumValue(vFromVal);
  shiftInputNumValue(vToVal);
  shiftInputNumValue(chanceInp);
  
  // Begin Apply shortcut
  for (var i = 0; i < rangePnl.children.length; i++) {
    blockInput(rangePnl.children[i]);
  }
  blockInput(chanceInp);
  blockInput(stepInp);
 
  dialog.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      if (kd.keyName.match(/A/)) apply.notify();
      if (kd.keyName.match(/H/)) isHFixed.notify();
      if (kd.keyName.match(/M/)) isHandles.notify();
      if (kd.keyName.match(/S/)) isRandPoint.notify();
      if (kd.keyName.match(/R/)) revert.notify();
      if (kd.keyName.match(/V/)) isVFixed.notify();
    }
  });
  // End Apply shortcut
 
  apply.onClick = start;
  
  loadSettings();

  dialog.show();

  function blockInput(item) {
    item.addEventListener('keydown', function(kd) {
      if (kd.altKey) kd.preventDefault();
    });
  }

  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
      }
    });
  }

  function start() {
    if (convertToNum(stepInp.text, 0) == 0) {
      alert(LANG_ERR_STEP_ZERO);
      return;
    }

    var range = [],
        chanceVal,
        stepVal,
        tempMinMax,
        tempChance,
        errStepMsg = '';
    
    // Validation of numeric inputs 
    range[0] = hFromVal.text = convertToNum(hFromVal.text, -DEF_MOVE);
    range[1] = hToVal.text = convertToNum(hToVal.text, DEF_MOVE);
    range[2] = vFromVal.text = convertToNum(vFromVal.text, -DEF_MOVE);
    range[3] = vToVal.text = convertToNum(vToVal.text, DEF_MOVE);
    chanceVal = chanceInp.text = convertToNum(chanceInp.text, DEF_CHANCE);
    stepVal = stepInp.text = convertToNum(stepInp.text, DEF_STEP);
    
    // Swap values if the start are greater than the end
    if (range[1] < range[0]) {
      tempMinMax = range[0];
      range[0] = hFromVal.text = range[1];
      range[1] = hToVal.text = tempMinMax;
    }
    if (range[3] < range[2]) {
      tempMinMax = range[2];
      range[2] = vFromVal.text = range[3];
      range[3] = vToVal.text = tempMinMax;
    }

    if (chanceVal < 0) chanceVal = chanceInp.text = 0;
    if (chanceVal > 100) chanceVal = chanceInp.text = 100;

    if (stepVal < 0) stepVal = stepInp.text = DEF_STEP;
    // Check that the step don't out of the range
    if (stepVal + range[0] > range[1]) { errStepMsg += hGroupTitle.text + ', '; }
    if (stepVal + range[2] > range[3]) { errStepMsg += vGroupTitle.text + ', '; }
    if (errStepMsg.length !== 0) {
      alert(LANG_ERR_STEP_MAX + errStepMsg.slice(0, -2));
      return;
    }

    // Get random points
    if (isRandPoint.value && (!isRandChanged || tempChance !== chanceVal)) {
      newPoints = [];
      tempPoints = shuffle(points);
      var shuffledLength = tempPoints.length * chanceVal / 100;
      for (var j = 0; j < shuffledLength; j++) {
        newPoints.push(tempPoints[j]);
      }
      isRandChanged = true;
      tempChance = chanceVal;
      app.redraw();
    }
    
    revert.enabled = true;
    undoCount++;

    // Start move
    movePoint(isRandPoint.value ? newPoints : points,
      range[0],
      range[1],
      range[2],
      range[3],
      isHFixed.value,
      isVFixed.value,
      isHandles.value,
      stepVal
    );

    app.redraw();
  };

  function saveSettings() {
    if(!Folder(SETTINGS_FILE.folder).exists) Folder(SETTINGS_FILE.folder).create();
    var $file = new File(SETTINGS_FILE.folder + SETTINGS_FILE.name),
      data = [
        hFromVal.text,
        hToVal.text,
        isHFixed.value,
        vFromVal.text,
        vToVal.text,
        isVFixed.value,
        stepInp.text,
        isHandles.value,
        isRandPoint.value,
        chanceInp.text
      ].toString();
    $file.open('w');
    $file.write(data);
    $file.close();
  }
  
  function loadSettings() {
    var $file = File(SETTINGS_FILE.folder + SETTINGS_FILE.name);
    if ($file.exists) {
      try {
        $file.open('r');
        var data = $file.read().split('\n'),
            $main = data[0].split(',');
        hFromVal.text = $main[0];
        hToVal.text = $main[1];
        isHFixed.value = ($main[2] === 'true');
        if (isHFixed.value) hFromVal.enabled = false;
        vFromVal.text = $main[3]; 
        vToVal.text = $main[4];
        isVFixed.value = ($main[5] === 'true');
        if (isVFixed.value) vFromVal.enabled = false;
        stepInp.text = $main[6];
        isHandles.value = ($main[7] === 'true');
        isRandPoint.value = ($main[8] === 'true');
        if (isRandPoint.value) chanceInp.enabled = true;
        chanceInp.text = $main[9]; 
      } catch (e) {}
      $file.close();
    }
  }
}

function getPaths(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          arr.push(currItem);
          break;
        case 'CompoundPathItem':
          getPaths(currItem.pathItems, arr);
          break;
        default:
          currItem.selected = false;
          break;
      }
    } catch (e) {}
  }
}

function getPoints(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    if (collection[i].pathPoints.length > 1) {
      var points = collection[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        if (isSelected(points[j])) arr.push(points[j]);
      }
    }
  }
}

// Check current Point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  // Remove duplicate Minus
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Shuffle array
function shuffle(arr) {
  var j, temp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

// The max and min values is included
function getRandomInRange(min, max, step) {
  var range, randNum;
  range = ((max - min) / step);
  randNum = Math.round(Math.random() * range) * step + min;
  return randNum;
}

// Move points
function movePoint(points, x1, x2, y1, y2, isHFixed, isVFixed, isHandles, step) {
  var deltaX, deltaY;

  for (var i = 0, pLen = points.length; i < pLen; i++) {
    deltaX = isHFixed ? x2 : getRandomInRange(x1, x2, step);
    deltaY = isVFixed ? y2 : getRandomInRange(y1, y2, step);

    deltaX = convertUnits(deltaX + getDocUnit(), 'px');
    deltaY = convertUnits(deltaY + getDocUnit(), 'px');

    with (points[i]) {
      if (!isHandles) { // Move the anchor and handles
        anchor = [anchor[0] + deltaX, anchor[1] + deltaY];
        leftDirection = [leftDirection[0] + deltaX, leftDirection[1] + deltaY];
        rightDirection = [rightDirection[0] + deltaX, rightDirection[1] + deltaY];
      } else { // Mirror move the handles
        leftDirection = [anchor[0] + (leftDirection[0] - anchor[0]) - deltaX,
                         anchor[1] + (leftDirection[1] - anchor[1]) - deltaY];
        rightDirection = [anchor[0] + (rightDirection[0] - anchor[0]) + deltaX,
                          anchor[1] + (rightDirection[1] - anchor[1]) + deltaY];
      }
    }
  }
}

// Units conversion
function getDocUnit() {
  var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  if (unit === 'Centimeters') unit = 'cm';
  else if (unit === 'Millimeters') unit = 'mm';
  else if (unit === 'Inches') unit = 'in';
  else if (unit === 'Pixels') unit = 'px';
  else if (unit === 'Points') unit = 'pt';
  return unit;
}

function getUnits(value, def) {
  try {
    return 'px,pt,mm,cm,in,pc'.indexOf(value.slice(-2)) > -1 ? value.slice(-2) : def;
  } catch (e) {}
};

function convertUnits(value, newUnit) {
  if (value === undefined) return value;
  if (newUnit === undefined) newUnit = 'px';
  if (typeof value === 'number') value = value + 'px';
  if (typeof value === 'string') {
    var unit = getUnits(value),
        val = parseFloat(value);
    if (unit && !isNaN(val)) {
      value = val;
    } else if (!isNaN(val)) {
      value = val;
      unit = 'px';
    }
  }

  if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'mm')) {
      value = parseFloat(value) / 2.83464566929134;
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'cm')) {
      value = parseFloat(value) / (2.83464566929134 * 10);
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'in')) {
      value = parseFloat(value) / 72;
  } else if ((unit === 'mm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134;
  } else if ((unit === 'mm') && (newUnit === 'cm')) {
      value = parseFloat(value) * 10;
  } else if ((unit === 'mm') && (newUnit === 'in')) {
      value = parseFloat(value) / 25.4;
  } else if ((unit === 'cm') && ((newUnit === 'px') || (bnewUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134 * 10;
  } else if ((unit === 'cm') && (newUnit === 'mm')) {
      value = parseFloat(value) / 10;
  } else if ((unit === 'cm') && (newUnit === 'in')) {
      value = parseFloat(value) * 2.54;
  } else if ((unit === 'in') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 72;
  } else if ((unit === 'in') && (newUnit === 'mm')) {
      value = parseFloat(value) * 25.4;
  } else if ((unit === 'in') && (newUnit === 'cm')) {
      value = parseFloat(value) * 25.4;
  }
  return parseFloat(value);
}

// Run script
try {
  main();
} catch (e) {}
