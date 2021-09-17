/*
  Rescale.jsx for Adobe Illustrator
  Description: Automatic scaling of objects to the desired size.
                If you draw a line on top with the length or height of the desired object,
                'Old Size' will be filled automatically
  Date: November, 2019
  Author: Nick Grabowski, @Grabovvski
  Co-author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added "Scale Strokes & Effects", "Scale Corners" option
  0.2.1 Minor improvements
  0.2.2 Fixed decimal separator bug
  0.2.3 Minor improvements
  0.2.4 Minor improvements

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main () {
  var SCRIPT = {
        name: 'Rescale',
        version: 'v.0.2.4'
      },
      CFG = {
        aiVers: parseInt(app.version),
        size: 1,
        scaleCorner: app.preferences.getIntegerPreference('policyForPreservingCorners'),
        scaleStrokes: app.preferences.getBooleanPreference('scaleLineWeight')
      };

  if (!documents.length) {
    alert('Please open a document and try again.');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Please select at least one object and try again');
    return;
  }

  var doc = activeDocument;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
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
      chkCorner.value = (CFG.scaleCorner == 1) ? true : false;
  var chkStroke = option.add('checkbox', undefined, 'Scale strokes & effects');
      chkStroke.value = CFG.scaleStrokes;
  var chkRmv = option.add('checkbox', undefined, 'Remove top open path');
      chkRmv.value = true;

  var buttons = dialog.add('group');
  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  oSizeTxt.onChange = function () {
    this.text = convertToNum(this.text, CFG.size)
  };
  nSizeTxt.onChange = function () {
    this.text = convertToNum(this.text, CFG.size)
  };

  var keyPath = selection[0];
  if (keyPath.typename === 'PathItem' && !keyPath.closed && keyPath.pathPoints.length == 2) {
    var keyPathLength = keyPath.length; // If you use a straight line to measure
    oSizeTxt.text = (convertUnits(keyPathLength, getDocUnit())).toFixed(3);
    nSizeTxt.active = true;
  } else {
    chkRmv.enabled = false;
    chkRmv.value = false;
  }

  dialog.center();
  dialog.show();

  function okClick() {
    try {
      var oldSize = convertUnits(oSizeTxt.text * 1 + getDocUnit(), 'px'),
          newSize = convertUnits(nSizeTxt.text * 1 + getDocUnit(), 'px'),
          ratio = (newSize / oldSize) * 100;
      // When old and new size are equal
      if (ratio == 100) {
        dialog.close();
      }

      if (CFG.aiVers > 16) {
        var _isCorner = chkCorner.value ? 1 : 2;
        app.preferences.setIntegerPreference('policyForPreservingCorners', _isCorner);
      }

      // Grouping for better performance. Thanks for help @moodyallen
      var items = selection;
          tmpArray = [],
          aLayer = doc.activeLayer,
          selGroup = aLayer.groupItems.add();
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
  } else if ((unit === 'cm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
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

// Convert any input data to a number
function convertToNum(str, def) {
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Open link in browser
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