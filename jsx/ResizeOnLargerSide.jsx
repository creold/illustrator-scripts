/*
  ResizeOnLargerSide.jsx for Adobe Illustrator
  Description: resize of the selected objects to the specified amount on the larger side
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  
  Release notes:
  0.1 Initial version
  0.2 Fixed issues. Added support for clipping masks
  0.2.1 Added size correction in large canvas mode
  0.2.2 Added new units API for CC 2023 v27.1.1

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2023 (Mac), 2023 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php
  
  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main () {
  var CFG = {
        size: 10, // Default input
        units: getUnits(), // Active document units
        isBounds: app.preferences.getBooleanPreference('includeStrokeInBounds')
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var newSize = prompt('Enter the size on the larger side (' + CFG.units + ')', CFG.size);
  
  // Prepare value
  if (!newSize.length) return;
  newSize = strToAbsNum(newSize, CFG.size);
  if (newSize == 0) return;
  newSize = convertUnits(newSize, CFG.units, 'px') / CFG.sf;

  for (var i = 0, len = selection.length; i < len; i++) {
    var item = selection[i],
        bnds, width, height, largeSide, ratio;

    // Calc ratio
    if (isType(item, 'text')) {
      var txtClone = item.duplicate(),
          txtOutline = txtClone.createOutline();
      bnds = CFG.isBounds ? txtOutline.visibleBounds : txtOutline.geometricBounds;
      txtOutline.remove();
    } else if (isType(item, 'group') && item.clipped) {
      bnds = CFG.isBounds ? getMaskPath(item).visibleBounds : getMaskPath(item).geometricBounds;
    } else {
      bnds = CFG.isBounds ? item.visibleBounds : item.geometricBounds;
    }

    width = Math.abs(bnds[2] - bnds[0]);
    height = Math.abs(bnds[3] - bnds[1]);
    largeSide = Math.max(height, width);
    ratio = 100 / (largeSide / newSize);

    // X, Y, Positions, FillPatterns, FillGradients, StrokePattern, LineWidths
    item.resize(ratio, ratio, true, true, true, true, ratio);
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

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

// Get clipping path in group
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var item = group.pageItems[i];
    if (isClippingPath(item)) return item;
  }
}

// Check clipping property
function isClippingPath(item) {
  var clipText = (isType(item, 'text') &&
    item.textRange.characterAttributes.fillColor == '[NoColor]' &&
    item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (isType(item, 'compound') && item.pathItems[0].clipping) ||
    item.clipping || clipText;
}

try {
  main();
} catch (e) {}