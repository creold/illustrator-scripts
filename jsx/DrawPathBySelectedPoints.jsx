/*
  DrawPathBySelectedPoints.jsx for Adobe Illustrator
  Description: Creates a new path (irregular polygon) by drawing a line between selected points
  Date: March, 2023
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

// Main function
function main() {
  var isClose = true; // Close new path

  if (!isCorrectEnv('selection')) return;

  var pts = getSelectedPoints(selection);
  if (pts.length < 2) return;

  var meanPt = calcPolygonMean(pts);
  pts.sort(function (a, b) {
    return polarSort(a, b, meanPt);
  });

  var uniquePts = rmvPointDuplicates(pts);
  var polygon = selection[0].layer.pathItems.add();
  polygon.setEntirePath(uniquePts);
  polygon.closed = isClose;

  selection = null;
  polygon.selected = true;
  redraw();
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} Continue or abort script
 */
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
          alert('Few objects are selected\nPlease, select two or more paths', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Extract the anchor points of any selected path points
 * @param {(Object|Array)} coll - The collection of objects to search through
 * @returns {boolean} An array of the [x, y] coordinates of a selected anchor point
 */
function getSelectedPoints(coll) {
  var coords = [];
  for (var i = 0; i < coll.length; i++) {
    if (!coll[i].pathPoints) continue;
    for (var j = 0; j < coll[i].pathPoints.length; j++) {
      var pt = coll[i].pathPoints[j];
      if (isSelected(pt)) coords.push(pt.anchor);
    }
  }
  return coords;
}

/**
 * Check whether a given point is selected or not
 * @param {Object} point - The point to check
 * @returns {boolean} True if the point is selected, false otherwise
 */
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

/**
 * Calculate the arithmetic mean of a polygon vertices
 * @param {Array} pts - An array of the polygon vertices
 * @returns {Array} The arithmetic mean of a polygon vertices
 */
function calcPolygonMean(pts) {
  var sumX = 0, sumY = 0, len = pts.length;
  for (var i = 0; i < len; i++) {
    var pt = pts[i];
    sumX += pt[0];
    sumY += pt[1];
  }
  var meanX = sumX / len;
  var meanY = sumY / len;
  return [meanX, meanY];
}

/**
 * Sort two points by polar angle and then by distance from the arithmetic mean of a polygon
 * @param {Array} a - The first point to compare
 * @param {Array} b - The second point to compare
 * @param {Array} m - The mean point
 * @returns {number}
 */
function polarSort(a, b, m) {
  var aAngle = Math.atan2(a[1] - m[1], a[0] - m[0]);
  var bAngle = Math.atan2(b[1] - m[1], b[0] - m[0]);
  if (aAngle < bAngle) {
    return -1;
  } else if (aAngle > bAngle) {
    return 1;
  } else {
    var aDist = Math.sqrt(Math.pow(a[0] - m[0], 2) + Math.pow(a[1] - m[1], 2));
    var bDist = Math.sqrt(Math.pow(b[0] - m[0], 2) + Math.pow(b[1] - m[1], 2));
    if (aDist < bDist) {
      return -1;
    } else if (aDist > bDist) {
      return 1;
    } else {
      return 0;
    }
  }
}

/**
 * Remove duplicate points from an array of [x,y] points.
 * @param {Array} pts - The array of points to remove duplicates from
 * @returns {Array} unique - The array of unique points
 */
function rmvPointDuplicates(pts) {
  var unique = [];
  for (var i = 0, len = pts.length; i < len; i++) {
    var pt = pts[i];
    var isDuplicate = false;
    for (var j = 0; j < unique.length; j++) {
      if (pt[0] == unique[j][0] && pt[1] == unique[j][1]) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) unique.push(pt);
  }
  return unique;
}

// Run script
try {
  main();
} catch (err) {}