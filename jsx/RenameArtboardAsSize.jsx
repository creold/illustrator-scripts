/*
  RenameArtboardAsSize.jsx for Adobe Illustrator
  Description: The script Renames artboards according to their size in document units
  Date: September, 2018
  Modification date: January, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added more units (yards, meters, etc.) support if the document is saved
  0.2.1 Added size correction in large canvas mode
  0.2.2 Added new units API for CC 2023 v27.1.1
  0.3 Added user interface

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2024 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var CFG = {
        units: getUnits(), // Active document units
        isSaveName: true, // Set false to overwrite the full name
        isRound: true, // Set true to get a round number
        precision: 2,  // Size rounding precision
        isAddUnit: true,
        separator: '_'
      };

  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = activeDocument;
  var idx = doc.artboards.getActiveArtboardIndex();

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // INTERFACE
  var win = new Window('dialog', 'Rename Artboard As Size');
      win.alignChildren = ['fill', 'fill'];

  // Range
  var rangePnl = win.add('panel', undefined, 'Artboards range');
      rangePnl.alignChildren = ['fill', 'center'];
      rangePnl.margins = [10, 15, 10, 8];

  var isAll = rangePnl.add('radiobutton', undefined, 'All ' + doc.artboards.length + ' artboards');
      isAll.value = true;

  var isCurr = rangePnl.add('radiobutton', undefined, 'Active artboard #' + (idx + 1));

  // Range
  var optPnl = win.add('panel', undefined, 'Options');
      optPnl.alignChildren = ['fill', 'center'];
      optPnl.margins = [10, 15, 10, 8];

  var isSaveName = optPnl.add('checkbox', undefined, 'Add size as suffix');
      isSaveName.value = CFG.isSaveName;

  var isRound = optPnl.add('checkbox', undefined, 'Round to integer');
      isRound.value = CFG.isRound;

  var isAddUnit = optPnl.add('checkbox', undefined, 'Add units after size');
      isAddUnit.value = CFG.isAddUnit;

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  cancel.onClick = win.close;

  ok.onClick = function () {
    var range = isAll.value ? doc.artboards : [doc.artboards[idx]];
    CFG.isSaveName = isSaveName.value;
    CFG.isRound = isRound.value;
    CFG.isAddUnit = isAddUnit.value;
    for (var i = 0, len = range.length; i < len; i++) {
      renameArtboard(range[i], CFG);
    }
    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  win.center();
  win.show();
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

// Rename an artboard by its size
function renameArtboard(ab, prefs) {
  var abName = ab.name;
  var separator = /\s/.test(abName) ? ' ' : (/-/.test(abName) ? '-' : prefs.separator);

  var width = prefs.sf * convertUnits(ab.artboardRect[2] - ab.artboardRect[0], 'px', prefs.units);
  var height = prefs.sf * convertUnits(ab.artboardRect[1] - ab.artboardRect[3], 'px', prefs.units);

  width = prefs.isRound ? Math.round(width) : width.toFixed(prefs.precision);
  height = prefs.isRound ? Math.round(height) : height.toFixed(prefs.precision);

  var size = width + 'x' + height;
  if (prefs.isAddUnit) size += prefs.units;

  if (prefs.isSaveName) {
    ab.name += separator + size;
  } else {
    ab.name = size;
  }
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
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

try {
  main();
} catch (e) {}