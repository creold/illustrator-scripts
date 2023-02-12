/*
  GrayscaleToOpacity.jsx for Adobe Illustrator
  Description: Convert selection colors to Grayscale and set identical Opacity value
  Date: February, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru

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

// Main function
function main() {
  if (!documents.length) return;

  var doc = activeDocument,
      selArray = [];

  app.executeMenuCommand('Colors7');

  getPaths(selection, selArray);

  for (var i = 0, selLen = selArray.length; i < selLen; i++) {
    var value = selArray[i].fillColor.gray;
    selArray[i].opacity = value.toFixed(0);
  }

  // Get paths from selection
  function getPaths(item, arr) {
    for (var i = 0, iLen = item.length; i < iLen; i++) {
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
}

// Run script
try {
  main();
} catch (e) {}