/*
  PointsMoveRandom.jsx for Adobe Illustrator
  Description: Random movement of selected points in an user range
  Requirements: Adobe Illustrator CS6 and above
  Date: May, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added deselect some anchors, move handles
  0.3 Added step, saving settings. Minor improvements

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

// Main function
function main() {
  var SCRIPT = {
        name: 'Points Move Random',
        version: 'v.0.3'
      },
      CFG = {
        move: 1,
        chance: 50,
        step: 1.0
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      MSG = {
        errDoc: 'Error\nOpen a document and try again',
        errSel: 'Error\nPlease select atleast one object',
        errStepZero: 'Error\nThe step must be greater than 0',
        errStepOut: 'Error\nThe step is out of range: '
      };

  if (!documents.length) {
    alert(MSG.errDoc);
    return;
  }

  var doc = app.activeDocument,
      selPaths = [],
      selPoints = [];

  getPaths(selection, selPaths);
  getPoints(selPaths, selPoints);

  if (!selPaths.length) {
    alert(MSG.errSel);
    return;
  }

  selection = null;
  redraw();

  buildGUI(selPoints, SCRIPT, CFG, SETTINGS, MSG);
}

function buildGUI(points, SCRIPT, CFG, SETTINGS, MSG) {
  var undoCounter = 0,
      newPoints = [],
      tempPoints = [],
      isRandChanged = false;

  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];

  // RANGE PANEL
  var rangePnl = dialog.add('panel', undefined, 'Random move range, ' + getDocUnit());
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = ['left', 'center'];
      rangePnl.margins = [10, 20, 10, 5];

  // HORIZONTAL INPUT
  var hGroup = rangePnl.add('group');
      hGroup.orientation = 'row';
      hGroup.alignChildren = ['left','center'];

  var hGroupTitle = hGroup.add('statictext', undefined, 'Horizontal');

  var hRangeGroup = hGroup.add('group');
      hRangeGroup.orientation = 'row';
      hRangeGroup.alignChildren = ['left','center'];

  var hFromVal = hRangeGroup.add('edittext', undefined, -1 * CFG.move);
      hFromVal.characters = 5;
      hFromVal.active = true;

  var hGroupSubtitle = hRangeGroup.add('statictext', undefined, 'to');

  var hToVal = hRangeGroup.add('edittext', undefined, CFG.move);
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

  var vFromVal = vRangeGroup.add('edittext', undefined, -1 * CFG.move);
      vFromVal.characters = 5;

  var vGroupSubtitle = vRangeGroup.add('statictext', undefined, 'to');

  var vToVal = vRangeGroup.add('edittext', undefined, CFG.move);
      vToVal.characters = 5;

  var isVFixed = vRangeGroup.add('checkbox', undefined, 'Fixed V\u0332'); // Unicode underlined V
      isVFixed.helpTip = 'Press Alt+V to enable';

  // STEP INPUT
  var step = rangePnl.add('group');
      step.orientation = 'row';

  var stepTitle = step.add('statictext', [0, 0, 200, 30]);
      stepTitle.text = 'Step for random value, ' + getDocUnit() + ' (> 0)';

  var stepInp = step.add('edittext', undefined, CFG.step);
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

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  close.onClick = dialog.close;
  dialog.onClose = saveSettings;

  isHFixed.onClick = function () { hFromVal.enabled = !hFromVal.enabled; }
  isVFixed.onClick = function () { vFromVal.enabled = !vFromVal.enabled; }

  // Restore original points state
  revert.onClick = function() {
    selection = null;
    if (undoCounter) {
      while (undoCounter--) undo();
      newPoints = tempPoints = [];
      isRandChanged = false;
      undoCounter = 0;
      revert.enabled = false;
      redraw();
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

  dialog.center();
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
      alert(MSG.errStepZero);
      return;
    }

    var range = [],
        chanceVal,
        stepVal,
        tempMinMax,
        tempChance,
        errStepMsg = '';

    // Validation of numeric inputs
    range[0] = hFromVal.text = convertToNum(hFromVal.text, -1 * CFG.move);
    range[1] = hToVal.text = convertToNum(hToVal.text, CFG.move);
    range[2] = vFromVal.text = convertToNum(vFromVal.text, -1 * CFG.move);
    range[3] = vToVal.text = convertToNum(vToVal.text, CFG.move);
    chanceVal = chanceInp.text = convertToNum(chanceInp.text, CFG.chance);
    stepVal = stepInp.text = convertToNum(stepInp.text, CFG.step);

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

    if (stepVal < 0) stepVal = stepInp.text = CFG.step;
    // Check that the step don't out of the range
    if (stepVal + range[0] > range[1]) { errStepMsg += hGroupTitle.text + ', '; }
    if (stepVal + range[2] > range[3]) { errStepMsg += vGroupTitle.text + ', '; }
    if (errStepMsg.length !== 0) {
      alert(MSG.errStepOut + errStepMsg.slice(0, -2));
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
      redraw();
    }

    revert.enabled = true;
    undoCounter++;

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

    redraw();
  };

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.horizFrom = hFromVal.text;
    pref.horizTo = hToVal.text;
    pref.isHorizFixed = isHFixed.value;
    pref.vertFrom = vFromVal.text;
    pref.vertTo = vToVal.text;
    pref.isVertFixed = isVFixed.value;
    pref.step = stepInp.text;
    pref.isHandles = isHandles.value;
    pref.isRandomPoint = isRandPoint.value;
    pref.chance = chanceInp.text;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  function loadSettings() {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          hFromVal.text = pref.horizFrom;
          hToVal.text = pref.horizTo;
          isHFixed.value = (pref.isHorizFixed == true);
          vFromVal.text = pref.vertFrom;
          vToVal.text = pref.vertTo;
          isVFixed.value = (pref.isVertFixed == true);
          stepInp.text = pref.step;
          isHandles.value = (pref.isHandles == true);
          isRandPoint.value = (pref.isRandomPoint == true);
          chanceInp.text = pref.chance;
        }
      } catch (e) {}
    }
  }
}

// Get single items from selection
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

// Get selected points on paths
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

// Convert any input data to a number
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

// Open link in browser
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
