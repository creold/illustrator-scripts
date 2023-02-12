/*
  RoundCoordinates.jsx for Adobe Illustrator
  Description: The script rounds the coordinates of the center of the object
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2.0 Supports clipping groups, align to reference point
  0.2.1 Uses the document ruler mode to get coordinates
  0.3 Added rounding step
  0.4 Added more units (yards, meters, etc.) support if the document is saved
  0.4.1 Added size correction in large canvas mode
  0.4.2 Added new units API for CC 2023 v27.1.1

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
$.localize = true; // Enabling automatic localization

function main() {
  var pref = app.preferences,
      subdiv = pref.getIntegerPreference('Grid/Horizontal/Ticks'),
      grid = pref.getRealPreference('Grid/Horizontal/Spacing'),
      CFG = {
        step: 1, // Step of coordinates rounding. Set it to zero to read from Preferences > Grid
        units: getUnits(), // Active document units
        refPoint: pref.getIntegerPreference('plugin/Transform/AnchorPoint'),
        inclStroke: pref.getBooleanPreference('includeStrokeInBounds'),
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel: { en: 'Error\nPlease select atleast one object',
                  ru: 'Ошибка\nВыделите хотя бы 1 объект' },
        msg: { en: 'Use global (Y) or artboard (N) rulers?' + '\nArtboard rulers are set by default. ' +
                  'To toggle between rulers modes, choose View > Rulers > Change to...',
              ru: 'Использовать глобальные (Да) или линейки монтажной области (Нет)?' + '\nЛинейки монтажной области установлены по умолчанию. ' +
                  'Для переключения режимов линеек, выберите\nПросмотр > Линейки > Сменить...' }
      }

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var doc = activeDocument,
      defCoordSys = app.coordinateSystem,
      isConfirm = confirm(LANG.msg),
      bounds = []; // Bounds in document units

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  if (!isConfirm) {
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  } else {
    app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
  }

  for (var i = 0, selLen = selection.length; i < selLen; i++) {
    var currItem = selection[i],
        boundsPX = getVisibleBounds(currItem, CFG.inclStroke);

    for (var j = 0; j < boundsPX.length; j++) {
      bounds.push(convertUnits(boundsPX[j], 'px', CFG.units) * CFG.sf);
    }

    var step = (CFG.step == 0) ? convertUnits(grid, 'px', CFG.units) / subdiv : CFG.step,
        delta = calcDeltaByAxes(CFG.refPoint, bounds, step, CFG.units, CFG.sf);

    // If has been replaced by the clipping mask bounds
    boundsPX = currItem.geometricBounds;
    currItem.position = [boundsPX[0] + delta.x, boundsPX[1] + delta.y];

    bounds = []; // Reset array
  }

  app.coordinateSystem = defCoordSys;
}

// Get the bounds of the visible content
function getVisibleBounds(item, inclStroke) {
  var childs = [];

  if (item.typename === 'GroupItem' && !item.clipped) {
    getChilds(item.pageItems, childs);
  } else if (item.typename === 'GroupItem' && item.clipped) {
    childs.push(getClippingPath(item));
  } else {
    childs.push(item);
  }

  var bounds = inclStroke ? childs[0].visibleBounds : childs[0].geometricBounds;

  for (var i = 0, len = childs.length; i < len; i++) {
    var itemBnds = inclStroke ? childs[i].visibleBounds : childs[i].geometricBounds;
    bounds = compareBounds(itemBnds, bounds);
  }

  return bounds;
}

// Get inner items excluding the contents of the clipping groups
function getChilds(collection, arr) {
  for (var i = 0, iLen = collection.length; i < iLen; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          if (!currItem.clipped) {
            getChilds(currItem.pageItems, arr);
          } else {
            var mask = getClippingPath(currItem);
            arr.push(mask);
          }
          break;
        default:
          arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

// Get clipping path in group
function getClippingPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) {
      return currItem;
    }
  }
}

// Check clipping mask
function isClippingPath(item) {
  var clipText = (item.typename === 'TextFrame' &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (item.typename === 'CompoundPathItem' && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Comparison of array extrema
function compareBounds(itemBnds, currBnds) {
  return [Math.min(itemBnds[0], currBnds[0]),
    Math.max(itemBnds[1], currBnds[1]),
    Math.max(itemBnds[2], currBnds[2]),
    Math.min(itemBnds[3], currBnds[3])
  ];
}

// Calculate the delta of the X, Y coordinates for the move
function calcDeltaByAxes(point, bounds, step, units, sf) {
  var x = y = 0,
      centerX = bounds[0] + (bounds[2] - bounds[0]) / 2,
      centerY = bounds[1] + (bounds[3] - bounds[1]) / 2;

  switch (point) {
    case 0: // Left Top
      x = getDelta(bounds[0], step);
      y = getDelta(bounds[1], step);
      break;
    case 1: // Top Center
      x = getDelta(centerX, step);
      y = getDelta(bounds[1], step);
      break;
    case 2: // Top Right
      x = getDelta(bounds[2], step);
      y = getDelta(bounds[1], step);
      break;
    case 3: // Left Center
      x = getDelta(bounds[0], step);
      y = getDelta(centerY, step);
      break;
    case 4: // Center Center
      x = getDelta(centerX, step);
      y = getDelta(centerY, step);
      break;
    case 5: // Right Center
      x = getDelta(bounds[2], step);
      y = getDelta(centerY, step);
      break;
    case 6: // Left Bottom
      x = getDelta(bounds[0], step);
      y = getDelta(bounds[3], step);
      break;
    case 7: // Center Bottom
      x = getDelta(centerX, step);
      y = getDelta(bounds[3], step);
      break;
    case 8: // Bottom Right
      x = getDelta(bounds[2], step);
      y = getDelta(bounds[3], step);
      break;
  }

  x = convertUnits(x, units, 'px') / sf;
  y = convertUnits(y, units, 'px') / sf;

  return { 'x': x, 'y': y };
}

// Get the delta
function getDelta(n, step) {
  var f = Math.round(n) - n; // The fractional digits
  return f + (sign(n) * getClosestInt(Math.abs(n), step) - trunc(f + n));
}

// Get the closest integer
function getClosestInt(a, b) {
	var x = trunc(a / b);
	if (!(a % b)) return a;
	return (b * (x + 1) - a) < (a - b * x) ? b * (x + 1) : b * x;
}

// Return the integer part of a number
function trunc(n) {
	n = +n;
	return (n - n % 1) || (!isFinite(n) || n === 0 ? n : n < 0 ? -0 : 0);
}

// Return number sign
function sign(n) {
  return n ? (n < 0 ? -1 : 1) : 0;
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

try {
  main();
} catch (e) {}