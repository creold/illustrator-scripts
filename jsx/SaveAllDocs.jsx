/*
  SaveAllDocs.jsx for Adobe Illustrator
  Description: Simple script to save all opened docs
  Date: October, 2018
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

if (documents.length > 0) {
  var doc = app.activeDocument;
  try {
    for (var i = 0, docLen = documents.length; i < docLen; i++) {
      activeDocument = documents[i];
      if (!activeDocument.saved) activeDocument.save();
    }
  } catch (e) {}
  // Activate last used document
  activeDocument = doc;
}
