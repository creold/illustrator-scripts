/*
  ExtractFromGroup.jsx for Adobe Illustrator
  Description: Extract selected items from parent groups
  If Alt key is pressed, move item before the first parent group
  If Alt key is not pressed, move item before the topmost level parent group
  Date: May, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2025 (Mac/Win).
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
  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('No objects selected\nPlease select object(s) and try again', 'Script error');
    return;
  }

  var isAltPressed = ScriptUI.environment.keyboardState.altKey;

  for (var i = 0, len = app.selection.length; i < len; i++) {
    var item = app.selection[i];
    if (item.parent.typename === 'CompoundPathItem') {
      item = item.parent;
    }
    var parent = getParentGroup(item, isAltPressed);

    if (parent.typename === 'GroupItem') {
      item.move(parent, ElementPlacement.PLACEBEFORE);
    }
  }
}

/**
 * Find the parent GroupItem of the specified item based on the Alt key status
 * @param {Object} item - The item for which to find the parent GroupItem
 * @param {boolean} isAltKey - A boolean flag indicating whether the Alt key is pressed or not
 * @returns {Object} - The parent GroupItem if found
 */
function getParentGroup(item, isAltKey) {
  if (isAltKey) {
    if (item.parent.typename === 'GroupItem') {
      return item.parent;
    } else {
      return getParentGroup(item.parent, isAltKey);
    }
  } else {
    var topParent = item;
    while (topParent.parent.typename === 'GroupItem') {
      topParent = topParent.parent;
    }
    return topParent;
  }
}

// Run script
try {
  main();
} catch (err) {}