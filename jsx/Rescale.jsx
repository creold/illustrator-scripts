/*
  Rescale.jsx for Adobe Illustrator
  Description: Automatic scaling of objects to the desired size.
                If you draw a line on top with the length or height of the desired object,
                'Old Size' will be filled automatically
  Date: November, 2019
  Modification date: February, 2024
  Author: Nick Grabowski, @Grabovvski
  Co-author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3.4 Removed input activation on Windows OS below CC v26.4
  0.3.3 Added new units API for CC 2023 v27.1.1
  0.3.2 Added size correction in large canvas mode
  0.3.1 Fixed input activation in Windows OS
  0.3 Added more units (yards, meters, etc.) support if the document is saved
  0.2.4 Minor improvements
  0.2.3 Minor improvements
  0.2.2 Fixed decimal separator bug
  0.2.1 Minor improvements
  0.2 Added "Scale Strokes & Effects", "Scale Corners" option
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

function main () {
  var SCRIPT = {
        name: 'Rescale',
        version: 'v0.3.4'
      },
      CFG = {
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os),
        units: getUnits(), // Active document units
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
  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';

  var oldSizePnl = win.add('group');
      oldSizePnl.alignChildren = 'fill';
      oldSizePnl.add('statictext', undefined, 'Old size:').preferredSize.width = 60;

  var oSizeTxt = oldSizePnl.add ('edittext', undefined);
      oSizeTxt.characters = 7;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    oSizeTxt.active = true;
  }

  oldSizePnl.add('statictext', undefined, CFG.units);

  var newSizePnl = win.add('group');
      newSizePnl.alignChildren = 'fill';
  
  newSizePnl.add('statictext', undefined, 'New size:').preferredSize.width = 60;
  var nSizeTxt = newSizePnl.add('edittext', undefined);
      nSizeTxt.characters = 7;

  newSizePnl.add('statictext', undefined, CFG.units);

  var opts = win.add('group');
      opts.orientation = 'column';
      opts.alignChildren = 'fill';

  var chkCorner = opts.add('checkbox', undefined, 'Scale corners radius');
      chkCorner.helpTip = 'Only works with Live Shape';
      chkCorner.value = (CFG.scaleCorner == 1) ? true : false;
  var chkStroke = opts.add('checkbox', undefined, 'Scale strokes & effects');
      chkStroke.value = CFG.scaleStrokes;
  var chkRmv = opts.add('checkbox', undefined, 'Remove top open path');
      chkRmv.value = true;

  var buttons = win.add('group');
  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = win.close;
  ok.onClick = okClick;

  oSizeTxt.onChange = function () {
    this.text = strToAbsNum(this.text, CFG.size)
  };
  nSizeTxt.onChange = function () {
    this.text = strToAbsNum(this.text, CFG.size)
  };

  var keyPath = selection[0];
  if (keyPath.typename === 'PathItem' && !keyPath.closed && keyPath.pathPoints.length == 2) {
    var keyPathLength = keyPath.length; // If you use a straight line to measure
    oSizeTxt.text = (CFG.sf * convertUnits(keyPathLength, 'px', CFG.units)).toFixed(4);
    if (CFG.isMac) nSizeTxt.active = true;
  } else {
    chkRmv.enabled = false;
    chkRmv.value = false;
  }

  win.center();
  win.show();

  function okClick() {
    try {
      var oldSize = convertUnits(oSizeTxt.text * 1, CFG.units, 'px'),
          newSize = convertUnits(nSizeTxt.text * 1, CFG.units, 'px'),
          ratio = (newSize / oldSize) * 100;
      // When old and new size are equal
      if (ratio == 100) {
        win.close();
      }

      if (CFG.aiVers > 16) {
        var _isCorner = chkCorner.value ? 1 : 2;
        app.preferences.setIntegerPreference('policyForPreservingCorners', _isCorner);
      }

      // Grouping for better performance. Thanks for help @moodyallen
      var items = selection,
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

      win.close();
    } catch (e) {}
  }
}

// Get active document ruler units
function getUnits() {
  if (!documents.length) return '';
  var key = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  switch (key) {
    case 'Pixels': return 'px';
    case 'Points': return 'pt';
    case 'Picas': return 'pc';
    case 'Inches': return 'in';
    case 'Millimeters': return 'mm';
    case 'Centimeters': return 'cm';
    // Added in CC 2023 v27.1.1
    case 'Meters': return 'm';
    case 'Feet': return 'ft';
    case 'FeetInches': return 'ft';
    case 'Yards': return 'yd';
    // Parse new units in CC 2020-2023 if a document is saved
    case 'Unknown':
      var xmp = activeDocument.XMPString;
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'FeetInches') return 'ft';
        if (units == 'Yards') return 'yd';
        return 'px';
      }
      break;
    default: return 'px';
  }
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Convert string to absolute number
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
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