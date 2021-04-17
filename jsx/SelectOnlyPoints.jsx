/*
  SelectOnlyPoints.jsx for Adobe Illustrator
  Description: After using the Lasso tool or Direct Selection Tool, both Points and Path segments are selected. 
          The script leaves only Points selected.
  Date: September, 2018
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Versions:
  0.1 Initial version
  0.2 Fixed when selected unnecessary anchor handles (thanks for Oleg Krasnov, www.github.com/krasnovpro)
  0.3 Minor bug fixes and improvements
  0.3.2 Minor bug fixes
  
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
var LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.', 
                     ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_SELECT = { en: 'Error\nUse Lasso tool or Direct Selection Tool to select an area with points.', 
                        ru: 'Ошибка\nИспользуйте инструмент "Лассо или "Прямое выделения" для выбора области с точками.'};

// Main function
function main() {
  if (documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  }

  var selArray = [],
      selPoints = [];
  
  getPaths(selection, selArray);

  if (!(selArray instanceof Array) || selArray.length < 1) {
    alert(LANG_ERR_SELECT);
    return;
  }

  getPoints(selArray, selPoints);
  
  selection = null;

  for (var i = 0, pLen = selPoints.length; i < pLen; i++) {
    selPoints[i].selected = PathPointSelection.ANCHORPOINT;
  }
}

function getPaths(items, arr) {
  for (var i = 0, iLen = items.length; i < iLen; i++) {
    var currItem = items[i];
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

function getPoints(items, arr) {
  for (var i = 0, iLen = items.length; i < iLen; i++) {
    if (items[i].pathPoints.length > 1) {
      var points = items[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        if ( isSelected(points[j]) ) arr.push(points[j]);
      }
    }
  }
}

// Check current Point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

// For debugging
function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

// Run script
try {
  main();
} catch (e) {
  // showError(e);
}