/*
  PointsMoveRandom.jsx for Adobe Illustrator
  Description: Random movement of selected points in an user range.
  Requirements: Adobe Illustrator CS6 and above
  Date: May, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ============================================================================
  Versions:
  0.1 Initial version
  0.2 Added deselect some anchors, move handles
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  Tested with Adobe Illustrator CC 2018 (Win), 2019 (Mac).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

// Global variables
var SCRIPT_NAME = 'Points Move Random',
    SCRIPT_VERSION = 'v.0.2';

// Main function
function main() {
  if (app.documents.length < 1) return;
  if (!(selection instanceof Array) || selection.length < 1) return;

  var doc = app.activeDocument;
  var selPaths = [];
  var selPoints = [];

  getPaths(doc.selection, selPaths);

  for (var i = 0; i < selPaths.length; i++) {
    if (selPaths[i].pathPoints.length > 1) {
      var points = selPaths[i].pathPoints;
      for (var j = 0; j < points.length; j++) {
        if (isSelected(points[j])) selPoints.push(points[j]);
      }
    }
  }
  doc.selection = null;
  app.redraw();
  buildGUI(selPoints);
}

function getPaths(item, arr) {
  for (var i = 0; i < item.length; i++) {
    var currItem = item[i];
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

// Check current Point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

function buildGUI(points) {
  var undoCount = tmpChance = 0;
  var newPoints = tmpPoints = [];
  var isChanged = false;

  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION); 
      dialog.orientation = 'column'; 
      dialog.alignChildren = ['fill','center']; 

  // RANGE PANEL
  var rangePnl = dialog.add('panel', undefined, 'Random move range, ' + getDocUnit()); 
      rangePnl.orientation = 'column';
      rangePnl.margins = [10,20,10,5]; 

  // HORIZONTAL INPUT
  var hGroup = rangePnl.add('group'); 
      hGroup.orientation = 'row'; 
      hGroup.alignChildren = ['left','center']; 

  var hGroupTitle = hGroup.add('statictext', undefined, 'Horizontal'); 

  var hRangeGroup = hGroup.add('group'); 
      hRangeGroup.orientation = 'row'; 
      hRangeGroup.alignChildren = ['left','center']; 

  var hFromVal = hRangeGroup.add('edittext', undefined, '-10'); 
      hFromVal.characters = 5;
      hFromVal.active = true;

  var hGroupSubtitle = hRangeGroup.add('statictext', undefined, 'to'); 

  var hToVal = hRangeGroup.add('edittext', undefined, '10'); 
      hToVal.characters = 5;

  var isHFixed = hRangeGroup.add('checkbox', undefined, 'Fixed \u0048\u0332'); // Unicode underlined H
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

  var vFromVal = vRangeGroup.add('edittext', undefined, '-10');
      vFromVal.characters = 5;

  var vGroupSubtitle = vRangeGroup.add('statictext', undefined, 'to'); 

  var vToVal = vRangeGroup.add('edittext', undefined, '10'); 
      vToVal.characters = 5;
  
  var isVFixed = vRangeGroup.add('checkbox', undefined, 'Fixed \u0056\u0332'); // Unicode underlined V
      isVFixed.helpTip = 'Press Alt+V to enable';

  var isHandles = rangePnl.add('checkbox');
      isHandles.text = '\u004d\u0332ove only points handles'; // Unicode underlined M
      isHandles.helpTip = 'Press Alt+M to enable';

  // OPTIONS
  var options = dialog.add('group'); 
      options.orientation = 'row'; 
      options.alignChildren = ['center','center']; 

  var isRandomPoint = options.add('checkbox');
      isRandomPoint.text = '\u0053\u0332elect some of the points randomly'; // Unicode underlined S
      isRandomPoint.helpTip = 'Press Alt+S to enable';

  var chanceInp = options.add('edittext', undefined, '50'); 
      chanceInp.characters = 4;
      chanceInp.enabled = false;

  var percent = options.add('statictext', undefined, '%'); 

  isRandomPoint.onClick = function () {
    chanceInp.enabled = !chanceInp.enabled;
  }

  // BUTTONS
  var buttons = dialog.add('group'); 
      buttons.orientation = 'row'; 
      buttons.alignChildren = ['center','top']; 

  var close = buttons.add('button', undefined, 'Close');
      close.helpTip = 'Press Esc to Close';

  var revert = buttons.add('button', undefined, '\u0052\u0332evert'); // Unicode underlined R
      revert.helpTip = 'Press Alt+R to Revert';

  var apply = buttons.add('button', undefined, '\u0041\u0332pply'); // Unicode underlined A
      apply.helpTip = 'Press Alt+A to Apply';

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, github.com/creold');
      copyright.justify = 'center';
      copyright.enabled = false;

  isHFixed.onClick = function () {
    hFromVal.enabled = !hFromVal.enabled;
  }
  
  isVFixed.onClick = function () {
    vFromVal.enabled = !vFromVal.enabled;
  }

  close.onClick = function () {
    dialog.close();
  }
    
  // Restore original points state
  revert.onClick = function() {
    app.selection = null;
    if (undoCount) {
      while (undoCount--) app.undo();
      newPoints = tmpPoints = [];
      isChanged = false;
      undoCount = 0;
      app.redraw();
    }
  }

  // Begin Apply shortcut
  for (var i = 0; i < rangePnl.children.length; i++) {
    rangePnl.children[i].addEventListener('keydown', function(kd) {
      if (kd.altKey) kd.preventDefault();
    });
  }
  
  chanceInp.addEventListener('keydown', function(kd) {
    if (kd.altKey) kd.preventDefault();
  });
  
  dialog.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      if (kd.keyName.match(/A/)) apply.notify();
      if (kd.keyName.match(/H/)) isHFixed.notify();
      if (kd.keyName.match(/M/)) isHandles.notify();
      if (kd.keyName.match(/S/)) isRandomPoint.notify();
      if (kd.keyName.match(/R/)) revert.notify();
      if (kd.keyName.match(/V/)) isVFixed.notify();
    }
  });
  // End Apply shortcut
 
  apply.onClick = function () {
    var coord = [
        convertToNum(hFromVal.text),
        convertToNum(hToVal.text),
        convertToNum(vFromVal.text),
        convertToNum(vToVal.text)
    ]; 

    for (var i = 0; i < coord.length; i++) {
      if (isNaN(coord[i])) {
        alert('Please enter a numeric value.');
        return;
      }
    }
    
    var chanceVal = convertToNum(chanceInp.text);

    if (isNaN(chanceVal)) {
      alert('Please enter a numeric value.');
      return;
    } else if (chanceVal > 100) {
      chanceVal = 100;
      chanceInp.text = '100';
    } else if (chanceVal < 0) {
      chanceVal = 0;
      chanceInp.text = '0';
    }

    if (isRandomPoint.value && (!isChanged || (tmpChance !== chanceVal))) {
      newPoints = [];
      tmpPoints = shuffle(points);
      for (var j = 0; j < (tmpPoints.length * chanceVal / 100); j++) {
        newPoints.push(tmpPoints[j]);
      }
      app.redraw();
      isChanged = true;
      tmpChance = chanceVal;
    }

    undoCount++;

    startMove(isRandomPoint.value ? newPoints : points,
      coord[0],
      coord[1],
      coord[2],
      coord[3],
      isHFixed.value,
      isVFixed.value,
      isHandles.value
    );

    app.redraw();
  };
  
  dialog.show();
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

// Set decimal separator symbol and convert to number
function convertToNum(str) {
  return 1 * str.replace(',', '.');
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

// The maximum and minimum values  is inclusive
function getRandomInRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Move points
function startMove(items, x1, x2, y1, y2, isHFixed, isVFixed, isHandles) {
  var deltaX, deltaY;
  for (var i = 0; i < items.length; i++) {
    deltaX = isHFixed ? x2 : getRandomInRange(x1, x2);
    deltaY = isVFixed ? y2 : getRandomInRange(y1, y2);

    deltaX = convertUnits(deltaX + getDocUnit(), 'px');
    deltaY = convertUnits(deltaY + getDocUnit(), 'px');

    with(items[i]) {
      if (!isHandles) {
        anchor = [anchor[0] + deltaX, anchor[1] + deltaY];
        leftDirection = [leftDirection[0] + deltaX, leftDirection[1] + deltaY];
        rightDirection = [rightDirection[0] + deltaX, rightDirection[1] + deltaY];
      } else {
        leftDirection = [anchor[0] + (leftDirection[0] - anchor[0]) - deltaX,
                         anchor[1] + (leftDirection[1] - anchor[1]) - deltaY];
        rightDirection = [anchor[0] + (rightDirection[0] - anchor[0]) + deltaX,
                          anchor[1] + (rightDirection[1] - anchor[1]) + deltaY];
      }
    }
  }
}

// Run script
try {
  main();
} catch (e) {}