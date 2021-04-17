/*
  Rescale.jsx for Adobe Illustrator
  Description: Automatic scaling of objects to the desired size. 
               If you draw a line on top with the length or height of the desired object, 
               'Old Size' will be filled automatically.
  Date: November, 2019
  Author: Nick Grabowski, @Grabovvski
  Co-author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Versions:
  0.1 Initial version.
  0.2 Added "Scale Strokes & Effects", "Scale Corners" option.
  0.2.1 Minor improvements
  0.2.2 Fixed decimal separator bug
  0.2.3 Minor improvements
  0.2.4 Minor improvements

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

// Global variables
var SCRIPT_NAME = 'Rescale',
    SCRIPT_VERSION = 'v.0.2.4',
    DEF_VAL = 1,
    DEF_CORNER = app.preferences.getIntegerPreference('policyForPreservingCorners'),
    DEF_STROKE = app.preferences.getBooleanPreference('scaleLineWeight');

function main () {
  if (!app.documents.length) {
    alert('Please open a document and try again.');
    return;
  }

  var doc = app.activeDocument;

  // Create Main Window
  var dialog = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_VERSION);
      dialog.orientation = 'column';

  var oldSizePnl = dialog.add('group {alignment: "center"}');
      oldSizePnl.orientation = 'row';
      oldSizePnl.add('statictext', undefined, 'Old size, ' + getDocUnit() + ':');    

  var oSizeTxt = oldSizePnl.add ('edittext', undefined);
      oSizeTxt.characters = 6;
      oSizeTxt.active = true;
      
  var newSizePnl = dialog.add('group {alignment: "center"}');
      newSizePnl.orientation = 'row';
      newSizePnl.add('statictext', undefined, 'New size, ' + getDocUnit() + ':');    

  var nSizeTxt = newSizePnl.add('edittext', undefined);
      nSizeTxt.characters = 6;

  var option = dialog.add('group {alignment: "center"}');
      option.orientation = 'column';
  var chkCorner = option.add('checkbox', undefined, 'Scale corners radius');
      chkCorner.helpTip = 'Only works with Live Shape';
      chkCorner.value = (DEF_CORNER == 1) ? true : false;
  var chkStroke = option.add('checkbox', undefined, 'Scale strokes & effects');
      chkStroke.value = DEF_STROKE;
  var chkRmv = option.add('checkbox', undefined, 'Remove top open path');
      chkRmv.value = true;
      
  var buttons = dialog.add('group');
  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  // Copyright block
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, sergosokin.ru');
      copyright.justify = 'center';
      copyright.enabled = false;
  
  ok.onClick = okClick;

  cancel.onClick = function () {
    dialog.close();
  }

  oSizeTxt.onChange = function () { this.text = convertToNum(this.text, DEF_VAL) };
  nSizeTxt.onChange = function () { this.text = convertToNum(this.text, DEF_VAL) };

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Please select at least 1 object and try again');
    return;
  } else {
    var keyPath = selection[0];
    if (keyPath.typename === 'PathItem' && !keyPath.closed) {
      var keyPathLength = keyPath.length; // If you use a straight line to measure
      oSizeTxt.text = (convertUnits(keyPathLength, getDocUnit())).toFixed(3);
      nSizeTxt.active = true;
    } else {
      chkRmv.enabled = false;
      chkRmv.value = false;
    }
    dialog.show();
  }
  
  // Main function
  function okClick() {
    try {
      var oldSize = convertUnits(oSizeTxt.text * 1 + getDocUnit(), 'px');
      var newSize = convertUnits(nSizeTxt.text * 1 + getDocUnit(), 'px');
      var ratio = (newSize / oldSize) * 100;
      // When old and new size are equal
      if (ratio == 100) {
        dialog.close();
        return;
      }

      if (isAiCC()) {
        var _isCorner = chkCorner.value ? 1 : 2;
        app.preferences.setIntegerPreference('policyForPreservingCorners', _isCorner);
      }

      // Grouping for better performance. Thanks for help @moodyallen
      var items = selection;
      var tmpArray = [];
      var aLayer = doc.activeLayer;
      var selGroup = aLayer.groupItems.add();
      for (var i = 0, iLen = items.length; i < iLen; i++) {
        var tmpItem;
        tmpItem = aLayer.pathItems.add();
        tmpItem.move(items[i], ElementPlacement.PLACEBEFORE);
        tmpArray.push(tmpItem);
        items[i].move(selGroup, ElementPlacement.PLACEATEND);
      }
      
      selGroup.resize(
        ratio, // X
        ratio, // Y
        true, // changePositions
        true, // changeFillPatterns
        true, // changeFillGradients
        true, // changeStrokePattern
        chkStroke.value ? ratio : 100,
      );

      // Return objects to places
      items = selGroup.pageItems;
      for (var i = 0, iLen = items.length; i < iLen; i++) {
        items[i].move(tmpArray[i], ElementPlacement.PLACEBEFORE);
        tmpArray[i].move(selGroup, ElementPlacement.PLACEATBEGINNING);
      }
      selGroup.remove();
      selGroup = null;      
      
      if (chkRmv.enabled && chkRmv.value) keyPath.remove();

      dialog.close();
    } catch (e) {}
  }
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
  } else if ((unit === 'cm') && ((newUnit === 'px') || (bnewUnit === 'pt'))) {
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

function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Check Adobe Illustrator version
function isAiCC() {
  if (parseInt(app.version) <= 16) { return false; }
  return true;
}

// Run script
try {
  main();
} catch (e) {}