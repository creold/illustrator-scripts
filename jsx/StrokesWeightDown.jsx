/*
  StrokesWeightDown.jsx for Adobe Illustrator
  Description: Reduces the weight of the strokes of the selected paths relative to the current weight
  Date: October, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Gets the app preferences of the stroke units
  0.2.1 Minor improvements
  0.2.2 Added size correction in large canvas mode

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), CS6, CC 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var isRoundWeight = true; // Rounding the strokes weight values

  if (!documents.length) return;
  if (!selection.length || selection.typename == 'TextRange') return;

  // Scale factor for Large Canvas mode
  sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var selPaths = [],
      strokeUnits = app.preferences.getIntegerPreference('strokeUnits');

  getPaths(selection, selPaths);

  for (var i = 0, len = selPaths.length; i < len; i++) {
    decreaseWeight(selPaths[i], strokeUnits, isRoundWeight, sf);
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
function decreaseWeight(item, units, isRound, sf) {
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

  weight = sf * convertUnits(weight, 'pt', unitsKey);

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

  item.strokeWidth = convertUnits(tWeight, unitsKey, 'pt') / sf;
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Get stroke weight to fixed point number
function roundNum(num, point) {
  return 1 * num.toFixed(point);
}

try {
  main();
} catch (e) {}