/*
  ReverseGradientColor.jsx for Adobe Illustrator
  Description: Reverse of colors and their gradient transparency. Does not reverse the location of color stops
  Date: August, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  var doc = activeDocument,
      selPaths = [];

  getPaths(selection, selPaths);

  for (var i = 0, selLen = selPaths.length; i < selLen; i++) {
    reverseGradient(selPaths[i]);
  }
}

// Get only Paths from selection
function getPaths(item, arr) {
  for (var i = 0, iLen = item.length; i < iLen; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          if (currItem.filled && isGradientFill(currItem)) {
            arr.push(currItem);
          } else {
            badFillCount++;
          }
          break;
        case 'CompoundPathItem':
          if (currItem.pathItems[0].filled && isGradientFill(currItem.pathItems[0])) {
            arr.push(currItem.pathItems[0]);
          } else {
            badFillCount++;
          }
          break;
        default:
          break;
      }
    } catch (e) {}
  }
}

function isGradientFill(item) {
  if (item.fillColor.typename === 'GradientColor') { return true; }
  return false;
}

function reverseGradient(item) {
  var gItem = item.fillColor.gradient,
      tempStop = gItem.gradientStops,
      tempColor, tempOpacity;

  for (var i = 0, j = tempStop.length - 1; i < j; i++, j--) {
    var rStop = gItem.gradientStops[j],
        lStop = gItem.gradientStops[i];

    tempColor = rStop.color;
    tempOpacity = rStop.opacity;

    rStop.color = lStop.color;
    rStop.opacity = lStop.opacity;

    lStop.color = tempColor;
    lStop.opacity = tempOpacity;
  }
}

// Run script
try {
  main();
} catch (e) {}