/*
  RenameArtboardAsSize.jsx for Adobe Illustrator
  Description: The script fills in the name of artboard its size
  Date: October, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added more units (yards, meters, etc.) support if the document is saved
  0.2.1 Added size correction in large canvas mode

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2022 (Win).
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
        isRound: false, // Set true to get a round number
        precision: 2,  // Size rounding precision
        isAddUnit: true,
        separator: '_'
      };

  if (!documents.length) {
    alert('Error: \nOpen a document and try again');
    return;
  }

  var doc = activeDocument,
      width, height,
      size = '';

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  for (var i = 0, len = doc.artboards.length; i < len; i++) {
    var currAb = doc.artboards[i];
    
    width = CFG.sf * convertUnits(currAb.artboardRect[2] - currAb.artboardRect[0], 'px', CFG.units);
    height = CFG.sf * convertUnits(currAb.artboardRect[1] - currAb.artboardRect[3], 'px', CFG.units);

    if (CFG.isRound) {
      width = Math.round(width);
      height = Math.round(height);
    } else {
      width = width.toFixed(CFG.precision);
      height = height.toFixed(CFG.precision);
    }

    size = width + 'x' + height;
    if (CFG.isAddUnit) size += CFG.units;

    if (CFG.isSaveName) {
      currAb.name += CFG.separator + size;
    } else {
      currAb.name = size;
    }

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

try {
  main();
} catch (e) {}