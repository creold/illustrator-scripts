/*
  DivideBottomPath.jsx for Adobe Illustrator
  Description: Divide the bottom path by the intersection points with the top paths
  Date: February, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
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

function main() {
  var isRmvTop = true, // Remove top paths
      isRndColor = false; // Random stroke color

  if (!isCorrectEnv('version:16', 'selection')) return;
  var paths = getPaths(selection);
  if (!paths.length) return;

  addIntersectPoints();

  if (selection.length !== paths.length) {
    selection = null;
    app.redraw();
    alert('The paths problem\n'
    + 'Due to the Illustrator error, resulting paths get split.\n'
    + 'Please try to change or move the paths slightly before run script.', 'Script Error');
    app.undo();
    return;
  }
  
  var last = selection.length - 1, // Bottom shape index
      lastPath = selection[last],
      arr = get(selection),
      i = 0;

  arr.splice(last, 1);
  var otherPts = getPoints(arr);
  var newPts = getNewPoints(lastPath, otherPts);

  selectPoints(lastPath, newPts);
  divideShape(lastPath);

  // Recolor strokes
  if (isRndColor) {
    var isRGB = activeDocument.documentColorSpace == DocumentColorSpace.RGB;
    for (i = selection.length - 1; i >=0; i--) {
      if (selection[i].stroked) {
        selection[i].strokeColor = generateColor(isRGB);
      }
    }
  }

  // Remove top paths
  if (isRmvTop) {
    for (i = arr.length - 1; i >=0; i--) {
      arr[i].remove();
    }
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
    } else if (isType(item, '^path')) {
      if (!item.stroked) {
        item.stroked = true;
        item.strokeWidth = 1;
        item.strokeColor = generateColor();
      }
      if (item.stroked && item.strokeWidth > 0) {
        item.filled = false;
        out.push(item);
      } else {
        item.selected = false;
      }
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
function getNewPoints(item, pts) {
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
  return newPP;
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

function selectPoints(path, pts) {
  selection = [];
  var idx = 0;
  for (var i = 0, len = pts.length; i < len; i++) {
    idx = pts[i];
    path.pathPoints[idx].selected = PathPointSelection.ANCHORPOINT;
  }
}

// Cut At Selected Anchors
// Hiroyuki Sato, https://github.com/shspage
function divideShape(path) {
  if (path == undefined) return;

  var i = 0,
      j = 0,
      pp = path.pathPoints,
      firstAnchSel = isSelected(pp[0]),
      idxs = [[0]],
      ary,
      ancs;

  for (i = 1; i < pp.length; i++) {
    idxs[idxs.length - 1].push(i);
    if (isSelected(pp[i])) idxs.push([i]);
  }

  if (idxs.length < 2 && !(firstAnchSel && path.closed)) {
    return;
  }

  // Adjust the array (closed path)
  if (path.closed) {
    if (firstAnchSel) {
      idxs[idxs.length - 1].push(0);
    } else {
      ary = idxs.shift();
      idxs[idxs.length - 1] = idxs[idxs.length - 1].concat(ary);
    }
  }

  // Duplicate the path and apply the data of the array
  for (i = 0; i < idxs.length; i++) {
    ary = idxs[i];
    ancs = [];
    for (j = ary.length - 1; j >= 0; j--) {
      ancs.unshift(pp[ary[j]].anchor);
    }

    with(path.duplicate()) {
      closed = false;
      setEntirePath(ancs);
      for(j = pathPoints.length - 1; j >= 0; j--){
        with(pathPoints[j]) {
          rightDirection  = pp[ary[j]].rightDirection;
          leftDirection   = pp[ary[j]].leftDirection;
          pointType       = pp[ary[j]].pointType;
        }
      }
      selected = true;
    }
  }
  // Remove the original path
  path.remove();
}

// Check the point is selected
function isSelected(p) {
  return p.selected == PathPointSelection.ANCHORPOINT;
}

// Add new RGB or CMYK color
function generateColor(isRGB) {
  if (!arguments.length || !isRGB) isRGB = true;
  var c = isRGB ? new RGBColor() : new CMYKColor();
  if (isRGB) {
    c.red = Math.min(rndInt(0, 255, 8), 255);
    c.green = Math.min(rndInt(0, 255, 8), 255);
    c.blue = Math.min(rndInt(0, 255, 8), 255);
  } else {
    c.cyan = rndInt(0, 100, 5);
    c.magenta = rndInt(0, 100, 5);
    c.yellow = rndInt(0, 100, 5);
    c.black = 0;
  }
  return c;
}

// Get random integer number in range
function rndInt(min, max, step) {
  var rand = min - 0.5 + Math.random() * (max - min + 1)
  return Math.round(rand / step) * step;
}

// Run script
try {
  main();
} catch (err) {}