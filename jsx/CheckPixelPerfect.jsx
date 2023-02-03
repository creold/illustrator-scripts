/*
  CheckPixelPerfect.jsx for Adobe Illustrator
  Description: Checks snapping of path points to pixel grid in 0.5 or 1.0 px increments
  Date: February, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2023 (Mac/Win).
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
        rgb: [255, 0, 0], // Marker RGB color
        d: 6, // Marker diameter
        opa: 50, // Marker group opacity 0-100
        name: 'nonSnapping', // Marker group name
      };

  if (!isCorrectEnv('selection')) return;

  var paths = getPaths(selection);
  if (!paths.length) return;

  var col = setRGBColor(CFG.rgb),
      grp = paths[0].layer.groupItems.add();
  grp.name = CFG.name;
  grp.opacity = CFG.opa;
  
  selection = null;
  for (var i = 0, len = paths.length; i < len; i++) {
    try {
      checkPoints(paths[i], CFG.d, col, grp);
    } catch (err) {}
  }

  if (!grp.pageItems.length) {
    grp.remove();
    alert('Everything is ok\nAll points are aligned to the pixel grid.', 'CheckPixelPerfect');
  } else {
    alert('Problem points are found\nTotal amount: ' + grp.pageItems.length, 'CheckPixelPerfect');
  }
}

// Check the script environment
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);
  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Wrong app version\nSorry, script only works in Illustrator v.' + rqdVers + ' and later', 'Script error');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Nothing selected\nPlease, select at least one object', 'Script error');
          return false;
        }
        break;
    }
  }
  return true;
}

// Get paths from selection
function getPaths(coll) {
  var out = [];
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (/group/i.test(item.typename) && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getPaths(item.pathItems));
    } else if (/path/i.test(item.typename)) {
      out.push(item);
    }
  }
  return out;
}

// Generate solid RGB color
function setRGBColor(rgb) {
  var c = new RGBColor();
  c.red = rgb[0];
  c.green = rgb[1];
  c.blue = rgb[2];
  return c;
}

// Check path points
function checkPoints(path, d, col, ctr) {
  var pts = path.pathPoints;
  var isEdit = isEditable(path);
  for (var i = 0, len = pts.length; i < len; i++) {
    try {
      var p = pts[i];
      if (!isGridSnap(p.anchor[0]) || !isGridSnap(p.anchor[1])) {
        drawMarker(p, d, col, ctr);
        if (isEdit) selectPoint(p);
      }
    } catch (err) {}
  }
}

// Check snap to pixel grid
function isGridSnap(n) {
  var cut = 1 * n.toFixed(2);
  var dec = Math.abs(cut % 1);
  return (cut == Math.round(n)) || (dec >= .5 && dec <= .51);
}

// Draw an ellipse at a point
function drawMarker(p, d, c, ctr) {
  var dot = activeDocument.pathItems.ellipse(
      p.anchor[1] + d * 0.5, // Top
      p.anchor[0] - d * 0.5, // Left
      d, // Width
      d, // Height
      false, // Reversed
      true); // Inscribed
  dot.stroked = false;
  dot.fillColor = c;
  dot.move(ctr, ElementPlacement.PLACEATBEGINNING);
}

// Check item for locking and visibility
function isEditable(item) {
  var prnt = item.parent;
  var state = true;
  switch (prnt.typename) {
    case 'GroupItem':
      if (!prnt.editable) return false;
      else state = isEditable(prnt);
      break;
    case 'Layer':
      if (prnt.locked || !prnt.visible) return false;
      else state = isEditable(prnt);
      break;
  }
  return state;
}

// Select the point
function selectPoint(p) {
  p.selected = PathPointSelection.ANCHORPOINT;
}

// Run script
try {
  main();
} catch (err) {}