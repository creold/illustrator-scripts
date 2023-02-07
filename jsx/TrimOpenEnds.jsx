/*
  TrimOpenEnds.jsx for Adobe Illustrator
  Description: Removes the ends of open paths up to their intersection points
  Date: January, 2023
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

function main() {
  if (!isCorrectEnv('version:16', 'selection')) return;

  var paths = getPaths(selection);
  if (!paths.length) return;

  addIntersectPoints();
  if (selection.length !== paths.length) {
    alert('The paths problem\n'
    + 'Due to the Illustrator error, resulting paths get split.\n'
    + 'Please undo and try to change or move the paths slightly before run script.', 'Script Error');
    return;
  }
  
  for (var i = selection.length - 1; i >= 0; i--) {
    var item = selection[i],
        arr = get(selection);
    arr.splice(i, 1);
    var otherPts = getPoints(arr);
    rmvPoints(item, otherPts);
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
          alert('Nothing selected\nPlease, select two or more paths', 'Script error');
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
    if (isType(item, 'group') && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (isType(item, '^path') && item.stroked && item.strokeWidth > 0) {
      item.filled = false;
      out.push(item);
    } else {
      item.selected = false;
    }
  }
  return out;
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

// Convert collection into standard Array
function get(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    out.push(coll[i]);
  }
  return out;
}

// Get path anchors
function getPoints(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (!isType(item, '^path')) continue;
    var pp = item.pathPoints;
    for (var j = 0, jlen = pp.length; j < jlen; j++) {
      out.push(pp[j].anchor);
    }
  }
  return out;
}

// Add intersection points to lines
function addIntersectPoints() {
  app.executeMenuCommand('group');
  app.executeMenuCommand('Make Planet X');
  selection[0].translate(0, 0); // Update view
  app.executeMenuCommand('Expand Planet X');
  try {
    app.executeMenuCommand('ungroup');
    app.executeMenuCommand('ungroup');
  } catch (err) {}
}

// Remove start and end points
function rmvPoints(item, pts) {
  if (!isType(item, '^path')) return;
  var len = item.pathPoints.length,
      newPP = [],
      i = 0;
  for (i = 0; i < len; i++) {
    var pt = item.pathPoints[i];
    if (pts.length && compareCoord(pt.anchor, pts)) {
      newPP.push(i); // Add new point index
    }
  }
  var nLen = newPP.length;
  if (!nLen) return;
  for (i = len - 1; i >= 0; i--) {
    // For two paths remove only points at the end
    if (i < newPP[0] || (nLen > 1 && i > newPP[nLen - 1])) {
      item.pathPoints[i].remove();
    }
  }
}

// Find coordinates match
function compareCoord(p, coord) {
  for (var i = 0, len = coord.length; i < len; i++) {
    if (p[0].toFixed(2) == coord[i][0].toFixed(2) 
        && p[1].toFixed(2) == coord[i][1].toFixed(2)) {
      coord.splice(i, 1);
      return true;
    }
  }
  return false;
}

// Run script
try {
  main();
} catch (err) {}