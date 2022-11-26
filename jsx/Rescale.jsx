/*
  Rescale.jsx for Adobe Illustrator
  Description: Automatic scaling of objects to the desired size.
                If you draw a line on top with the length or height of the desired object,
                'Old Size' will be filled automatically
  Date: October, 2022
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
  0.3 Added more units (yards, meters, etc.) support if the document is saved
  0.3.1 Fixed input activation in Windows OS
  0.3.2 Added size correction in large canvas mode

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN

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

function main () {
  var SCRIPT = {
        name: 'Rescale',
        version: 'v.0.3.2'
      },
      CFG = {
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
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
  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';

  var oldSizePnl = win.add('group {alignment: "center"}');
      oldSizePnl.orientation = 'row';
      oldSizePnl.add('statictext', undefined, 'Old size, ' + CFG.units + ':');

  var oSizeTxt = oldSizePnl.add ('edittext', undefined);
      oSizeTxt.characters = 6;
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    oSizeTxt.active = true;
  }

  var newSizePnl = win.add('group {alignment: "center"}');
      newSizePnl.orientation = 'row';
      newSizePnl.add('statictext', undefined, 'New size, ' + CFG.units + ':');

  var nSizeTxt = newSizePnl.add('edittext', undefined);
      nSizeTxt.characters = 6;

  var option = win.add('group {alignment: "center"}');
      option.orientation = 'column';
  var chkCorner = option.add('checkbox', undefined, 'Scale corners radius');
      chkCorner.helpTip = 'Only works with Live Shape';
      chkCorner.value = (CFG.scaleCorner == 1) ? true : false;
  var chkStroke = option.add('checkbox', undefined, 'Scale strokes & effects');
      chkStroke.value = CFG.scaleStrokes;
  var chkRmv = option.add('checkbox', undefined, 'Remove top open path');
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
    this.text = convertToAbsNum(this.text, CFG.size)
  };
  nSizeTxt.onChange = function () {
    this.text = convertToAbsNum(this.text, CFG.size)
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

      win.close();
    } catch (e) {}
  }
}

// Get active document ruler units
function getUnits() {
  if (!documents.length) return '';
  switch (activeDocument.rulerUnits) {
    case RulerUnits.Pixels: return 'px';
    case RulerUnits.Points: return 'pt';
    case RulerUnits.Picas: return 'pc';
    case RulerUnits.Inches: return 'in';
    case RulerUnits.Millimeters: return 'mm';
    case RulerUnits.Centimeters: return 'cm';
    case RulerUnits.Unknown: // Parse new units only for the saved doc
      var xmp = activeDocument.XMPString;
      // Example: <stDim:unit>Yards</stDim:unit>
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'Yards') return 'yd';
      }
      break;
  }
  return 'px'; // Default
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center.
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
}

// Convert string to absolute number
function convertToAbsNum(str, def) {
  if (arguments.length == 1 || !def) def = 1;
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