/*
  StrokesWeightDown.jsx for Adobe Illustrator
  Description: Reduces the weight of the strokes of the selected paths relative to the current weight
  Date: September, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Gets the app preferences of the stroke units

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), CS6, CC 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var isRoundWeight = true; // Rounding the strokes weight values

  if (!documents.length) return;
  if (!selection.length || selection.typename == 'TextRange') return;

  var selPaths = [],
      strokeUnits = app.preferences.getIntegerPreference('strokeUnits');

  getPaths(selection, selPaths);

  for (var i = 0, len = selPaths.length; i < len; i++) {
    decreaseWeight(selPaths[i], strokeUnits, isRoundWeight);
  }
}

// Get paths from selection
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
          arr.push(currItem.pathItems[0]);
          break;
        default:
          break;
      }
    } catch (e) {}
  }
}

// Reduces the stroke weight relative to the current
function decreaseWeight(item, units, isRound) {
  if (!item.stroked) return;
  
  var weight = item.strokeWidth,
      unitsKey = '';

  switch (units) {
    case 0:
      unitsKey = 'in';
      break;
    case 1:
      unitsKey = 'mm';
      break;
    case 2:
      unitsKey = 'pt';
      break;
    case 3:
      unitsKey = 'pc';
      break;
    case 4:
      unitsKey = 'cm';
      break;
    case 6:
      unitsKey = 'px';
      break;
  }

  weight = convertUnits(weight + 'pt', unitsKey);
  var tWeight = 0;
  
  if (weight <= 0.01) {
    item.stroked = false;
  } else if (roundNum(weight, 1) <= 0.1) {
    tWeight = (isRound ? roundNum(weight, 2) : weight) - 0.01;
  } else if (roundNum(weight, 1) <= 1.5) {
    tWeight = (isRound ? roundNum(weight, 1) : weight) - (roundNum(weight, 1) > 0.2 ? 0.2 : 0.1);
  } else if (weight < 5) {
    tWeight = (isRound ? roundNum(weight, 1) : weight) - 0.5;
  } else {
    tWeight = (isRound ? roundNum(weight, 0) : weight) - 1.0;
  }

  item.strokeWidth = convertUnits(tWeight + unitsKey, 'pt');
}

// Units conversion. Thanks for help Alexander Ladygin (https://github.com/alexander-ladygin)
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

// Сonvert to the specified units of measurement
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
  } else if ((unit === 'cm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
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

// Get stroke weight to fixed point number
function roundNum(num, point) {
  return 1 * num.toFixed(point);
}

try {
  main();
} catch (e) {}