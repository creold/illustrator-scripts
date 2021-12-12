/*
  ChangeOpacity.jsx for Adobe Illustrator
  Description: Set or shift the Opacity value relative to the current for the selected objects
  Date: December, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582​
  - via QIWI https://qiwi.com/n/OSOKIN​
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

function main () {
  var SCRIPT = {
        name: 'Change Opacity',
        version: 'v.0.1'
      },
      CFG = {
        opacity: '-10',
        inclContent: false,
        inclMask: false,
        uiOpacity: .96 // UI window opacity. Range 0-1
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = ['fill', 'top'];
      dialog.opacity = CFG.uiOpacity;

  // Input
  var input = dialog.add('panel', undefined, 'Enter opacity value');;
      input.margins = [5, 15, 5, 5];
      input.alignChildren = ['fill', 'center'];

  var group = input.add('group');
  var shiftInp = group.add('edittext', undefined, selection.length == 1 ? selection[0].opacity : CFG.opacity);
      shiftInp.preferredSize.width = 120;
  group.add('statictext', undefined, '%');
  var helptip = input.add('statictext', undefined, 'Use + or - sign for shift');

  var isContent = dialog.add('checkbox', undefined, 'Change group content');
      isContent.value = CFG.inclContent;

  // Buttons
  var btns = dialog.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'center'];
  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok', { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  shiftInputNumValue(shiftInp, -100, 100);

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  dialog.center();
  dialog.show();

  /**
  * Use Up / Down arrow keys (+ Shift) for change value
  * @param {object} item - input text field
  * @param {number} min - minimal input value
  */
  function shiftInputNumValue(item, min, max) {
    item.addEventListener('keydown', function (kd) {
      var sign = this.text.substr(0, 1) == '+' ? '+' : '',
          step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      if (kd.keyName == 'Down') {
        this.text = convertToNum(this.text, min) - step;
        if (this.text * 1 < min) this.text = min;
        if (this.text * 1 > 0) this.text = sign + this.text;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = convertToNum(this.text, min) + step;
        if (this.text * 1 <= max) {
          kd.preventDefault();
        } else {
          this.text = max;
        }
        this.text = sign + this.text;
      }
    });
  }

  function okClick() {
    var sign = shiftInp.text.substr(0, 1);
    if (sign !== '-' && sign !== '+') sign = '';
    var opValue = convertToNum(shiftInp.text, 100);

    if (!isContent.value) {
      changeOpacity(selection, sign, opValue);
    } else {
      var selItems = [];
      getItems(selection, selItems, CFG.inclMask);
      changeOpacity(selItems, sign, opValue);
    }

    dialog.close();
  }
}

/**
 * Convert any input data to a number
 * @param {string} str - input data
 * @param {number} def - default value if the input data don't contain numbers
 * @return {number} 
 */
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

/**
 * Get items from selection
 * @param {object} collection - collection of items
 * @return {array} arr - output array of single items
 */
function getItems(collection, arr, inclMask) {
  for (var i = 0, iLen = collection.length; i < iLen; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getItems(currItem.pageItems, arr, inclMask);
          break;
        default:
          if (inclMask || (!inclMask && !isClippingPath(currItem))) arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Check clipping mask
 * @param {object} item - item inside clipping group
 * @return {boolean} item is clipping mask
 */
function isClippingPath(item) {
  var clipText = (item.typename === 'TextFrame' &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (item.typename === 'CompoundPathItem' && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

/**
 * Set opacity value
 * @param {array} items - array of items
 * @param {string} sign - plus or minus sign
 * @param {number} value - opacity value
 */
function changeOpacity(items, sign, value) {
  var zeroOpacity = [];
  
  for (var i = 0, len = items.length; i < len; i++) {
    var currItem = items[i];
    try {
      if (sign == '') {
        currItem.opacity = value;
      } else {
        if (currItem.opacity + value > 100) currItem.opacity = 100;
        if (currItem.opacity + value < 0) {
          currItem.opacity = 0;
          zeroOpacity.push(currItem);
        }
        currItem.opacity += value;
      }
    } catch (e) {}
  }

  // Select items with now zero opacity
  if (zeroOpacity.length > 0) {
    redraw();
    var isConfirm = confirm(zeroOpacity.length + ' items now have zero opacity. Select them?');
    if (isConfirm) {
      selection = null;
      for (var j = 0, zLen = zeroOpacity.length; j < zLen; j++) zeroOpacity[j].selected = true;
    }
  }
}

/**
 * Open link in browser
 * @param {string} url - website adress
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

try {
  main();
} catch (e) {}