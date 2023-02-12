/*
  ObjectsCounter.jsx for Adobe Illustrator
  Description: Counts the number of selected objects
  Date: August, 2020
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
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var counter = getPaths(selection),
      msg = { en: 'Selected ' + counter + ' objects', ru: 'Выделено ' + counter + ' объектов'};
  alert(msg);
}

function getPaths(collection, count) {
  var count = 0;
  for (var i = 0, len = collection.length; i < len; i++) {
    try {
      switch (collection[i].typename) {
        case 'GroupItem':
          count += getPaths(collection[i].pageItems);
          break;
        default:
          count++;
          break;
      }
    } catch (e) {}
  }
  return count;
}

// Run script
try {
  main();
} catch (e) {}