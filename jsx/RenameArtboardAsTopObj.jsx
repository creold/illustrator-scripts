/*
  RenameArtboardAsTopObj.jsx for Adobe Illustrator
  Description: The script renames each Artboard by the custom name of the first visible unlocked item on it
  Date: September, 2018
  Modification date: September, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3 Added artboard range and name length
  0.2.2 Removed input activation on Windows OS below CC v26.4
  0.2.1 Fixed input activation in Windows OS
  0.2 Use textFrame content for renaming
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

function main() {
  var SCRIPT = {
    name: 'Rename Artboards As Top Object',
    version: 'v0.3'
  };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        mgns: [10, 15, 10, 7],
      };

  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = app.activeDocument;
  var docAbs = doc.artboards;
  var currIdx = docAbs.getActiveArtboardIndex();

  // INTERFACE
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'fill'];

  // LENGTH
  var lenPnl = win.add('panel', undefined, 'Artboard Names');
      lenPnl.orientation = 'row';
      lenPnl.alignChildren = ['left', 'center'];
      lenPnl.margins = CFG.mgns;

  lenPnl.add('statictext', undefined, 'Maximum symbols: ');
  var lenInp = lenPnl.add('edittext', undefined, 100);
      lenInp.characters = 8;

  // RANGE
  var srcPnl = win.add('panel', undefined, 'Artboards Range');
      srcPnl.orientation = 'column';
      srcPnl.alignChildren = ['left', 'bottom'];
      srcPnl.margins = CFG.mgns;

  var isCurrAb = srcPnl.add('radiobutton', undefined, 'Active #' + (currIdx + 1) + ': \u0022' + truncate(docAbs[currIdx].name, 16) + '\u0022');
      isCurrAb.value = true;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    isCurrAb.active = true;
  }

  var wrapper = srcPnl.add('group');
      wrapper.alignChildren = ['left', 'center'];

  var isCstmAb = wrapper.add('radiobutton', undefined, 'Custom:');
      isCstmAb.helpTip = 'Total arboards: ' + docAbs.length;

  var rangeInp = wrapper.add('edittext', undefined, '1-' + docAbs.length);
      rangeInp.helpTip = 'E.g. "1, 3-5" to export 1, 3, 4, 5';
      rangeInp.characters = 14;
      rangeInp.enabled = isCstmAb.value;

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  // EVENTS
  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
    isCstmAb.value = false;
  }

  isCstmAb.onClick = function () {
    rangeInp.enabled = true;
    isCurrAb.value = false;
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  function okClick() {
    app.selection = null;
    var nLength = parseInt(lenInp.text);

    if (isCurrAb.value) {
      renameArtboard(doc, currIdx, nLength);
    } else {
      var range = parseAndFilterIndexes(rangeInp.text, docAbs.length);
      for (i = 0; i < range.length; i++) {
        renameArtboard(doc, range[i], nLength);
      }
    }

    win.close();
  }

  win.center();
  win.show();
}

/**
 * Truncate a string to a specific length and add an ellipsis ('...') if it exceeds that length
 *
 * @param {string} str - The string to truncate
 * @param {number} n - The maximum length of the truncated string including the ellipsis
 * @returns {string} - The truncated string with an ellipsis if it was truncated, otherwise the original string
 */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

/**
 * Parse a string representing a list of indexes and filters them based on a total count
 *
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} - An array of valid indexes
 */
function parseAndFilterIndexes(str, total) {
  var parsedNums = [];
  var chunks = str.split(/[,; ]+/);
  var length = chunks.length;

  for (var i = 0; i < length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsedNums.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) {
        parsedNums.push(num);
      }
    }
  }

  var filteredNums = [];
  length = parsedNums.length;

  for (var k = 0; k < length; k++) {
    var num = parsedNums[k] - 1;

    if (num >= 0 && num <= total) {
      filteredNums.push(num);
    }
  }

  return filteredNums;
}

/**
 * Rename an artboard based on the name of the first selected item on it
 *
 * @param {Object} doc - The document object containing the artboard to rename
 * @param {number} idx - The index of the artboard to rename (0-based)
 * @param {number} length - The maximum length for the new artboard name
 * @returns {void}
 */
function renameArtboard(doc, idx, length) {
  if (length == undefined || isNaN(length)) length = 100;

  doc.artboards.setActiveArtboardIndex(idx);
  doc.selectObjectsOnActiveArtboard(); // Get all items on current Artboard

  if (app.selection[0] == undefined) return;

  var ab = doc.artboards[idx];
  var itemName = getName(app.selection[0]);

  if (!isEmpty(itemName) && ab.name !== itemName) {
    ab.name = itemName.slice(0, length);
  }
  
  app.selection = null;
}

/**
* Get the name of an item, considering its type
*
* @param {Object} item - The item for which to get the name
* @returns {string} - The name of the item
*/
function getName(item) {
  var str = '';
  if (item.typename === 'TextFrame' && isEmpty(item.name) && !isEmpty(item.contents)) {
    str = item.contents;
  } else if (item.typename === 'SymbolItem' && isEmpty(item.name)) {
    str = item.symbol.name;
  } else {
    str = item.name;
  }
  return str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 *
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} - True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Open a URL in the default web browser
 *
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
*/
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
