/*
  SubtractTopPath.jsx for Adobe Illustrator
  Description: Subtracts the top path from all those below it
  Date: April, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added subtraction from stroked paths

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

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

// Main function
function main() {
  var CFG = {
        isRmvTop: true, // Remove the top item when finished
        isUseFS: false // Switch to full screen. Set it to true if script is slow
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename === 'TextRange') {
    alert('Error\nPlease, select two or more paths');
    return;
  }

  var doc = activeDocument,
      docView = doc.views[0].screenMode,
      cutter = selection[0];

  cutter.selected = false;

  var paths = getPaths(selection);

  if (CFG.isUseFS && paths.length > 10)
    doc.views[0].screenMode = ScreenMode.FULLSCREEN;
  
  for (var i = paths.length - 1; i >= 0; i--) {
    process(cutter, paths[i]);
  }

  if (CFG.isRmvTop) cutter.remove();
  selection = null;
  redraw();
  doc.views[0].screenMode = docView;
}

/**
 * Get single paths
 * @param {(Object|Array)} collection - Set of items
 * @return {Array} out - Single paths
 */
function getPaths(collection) {
  var out = [];

  for (var i = 0; i < collection.length; i++) {
    var item = collection[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems && !item.pathItems[0].clipping) {
      out.push(item);
    } else if (/pathitem/i.test(item.typename) && !item.clipping) {
      out.push(item);
    }
  }

  return out;
}

/**
 * Process the bottom item
 * @param {Object} a - top item
 * @param {Object} b - bottom item
 */
function process(a, b) {
  var tmp = (/compound/i.test(b.typename)) ? b.pathItems[0] : b;

  if (tmp.filled && tmp.stroked && !tmp.closed)
    return; // Not work with filled open paths

  selection = null;

  var cutter = a.duplicate();
  cutter.move(b, ElementPlacement.PLACEBEFORE);
  b.selected = true;
  cutter.selected = true;
  redraw();

  if (tmp.stroked && !tmp.closed) {
    if (isOverlap(cutter, b)) subtractLine();
    else cutter.remove();
  } else {
    subtractShape();
    removeContained(selection);
  }
}

/**
 * Test the overlapping with the line
 * @param {Object} a - Top item
 * @param {Object} b - Bottom item
 * @return {boolean}
 */
function isOverlap(a, b) {
  var dupA = a.duplicate(),
      dupB = b.duplicate();

  selection = null;
  dupA.selected = true;
  dupB.selected = true;

  app.executeMenuCommand('group');
  app.executeMenuCommand('Live Pathfinder Divide');
  app.executeMenuCommand('expandStyle');
  app.executeMenuCommand('ungroup');

  var len = selection.length;

  for (var i = selection.length - 1; i >= 0; i--) {
    selection[i].remove();
  }

  a.selected = true;
  b.selected = true;

  return len > 1;
}

// Subtract the top selected shape from the open path
function subtractLine() {
  app.executeMenuCommand('Make Planet X');
  app.executeMenuCommand('Expand Planet X');
  if (selection[0].pageItems.length === 1) app.executeMenuCommand('ungroup');
  selection[0].groupItems[selection[0].groupItems.length - 1].remove();
  app.executeMenuCommand('ungroup');
}

// Subtract the top selected shape from the bottom shape
function subtractShape() {
  app.executeMenuCommand('group');
  app.executeMenuCommand('Live Pathfinder Subtract');
  app.executeMenuCommand('expandStyle');
  app.executeMenuCommand('ungroup');
}

/**
 * Remove item overlapped by the top item
 * @param {(Object|Array)} collection - Set of items
 */
function removeContained(collection) {
  if (collection.length === 1) return;

  var path0 = collection[0],
      path1 = collection[1],
      type0 = path0.typename,
      type1 = path1.typename;

  if (/compound/i.test(type0)) path0 = path0.pathItems[0];
  if (/compound/i.test(type1)) path1 = path1.pathItems[0];

  try {
    if (/group/i.test(type0) || /group/i.test(type1) || 
        !isEqualColor(path0.fillColor, path1.fillColor)) {
      for (var i = collection.length - 1; i >= 0; i--) {
        collection[i].remove();
      }
    }
  } catch (e) {}
}

/**
 * Compare the colors of two items
 * @param {Object} a - Color of the top item
 * @param {Object} b - Color of the bottom item
 * @return {boolean}
 */
function isEqualColor(a, b) {
  if (a.typename !== b.typename) return false;
  if (a == '[NoColor]' && b == '[NoColor]') return true;

  var colArrA = (a.typename == 'PatternColor') ? [a.pattern] : getColorValues(a);
  var colArrB = (b.typename == 'PatternColor') ? [b.pattern] : getColorValues(b);

  if (isEqualArr(colArrA, colArrB)) return true;

  return false;
}

/**
 * Get an array of all color values
 * @param {Object} color
 * @return {Array} out - Array of color channel values
 */
function getColorValues(color) {
  var out = [];

  if (color.typename) {
    switch (color.typename) {
      case 'CMYKColor':
        out.push(color.cyan, color.magenta, color.yellow, color.black);
        break;
      case 'RGBColor':
        out.push(color.red, color.green, color.blue);
        break;
      case 'GrayColor':
        out.push(color.gray, color.gray, color.gray);
        break;
      case 'LabColor':
        out.push(color.a, color.b, color.l);
        break;
      case 'SpotColor':
        out = [].concat(out, getColorValues(color.spot.color));
        break;
      case 'GradientColor':
        for (var i = 0; i < color.gradient.gradientStops.length; i++) {
          out = [].concat(out, getColorValues(color.gradient.gradientStops[i].color));
        } 
        break;
    }
  }

  return out;
}

/**
 * Compare arrays
 * @param {Array} a
 * @param {Array} b
 * @return {boolean} 
 */
function isEqualArr(a, b) {
  if (a.length !== 0 && a.length === b.length) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  return false;
}

// Run script
try {
  main();
} catch (e) {}