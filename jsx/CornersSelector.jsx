/*
  CornersSelector.jsx for Adobe Illustrator
  Description: The script will select all anchor points facing in or out
  Date: April, 2023
  Authors:
  Vitaliy Polyakov, https://mai-tools.com/
  Sergey Osokin, email: hi@sergosokin.ru

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false);

// Main function
function main() {
  if (!isCorrectEnv('selection')) return;

  var paths = getPaths(selection);
  if (!paths.length) {
    alert('Few objects are selected\nPlease, select one or more paths', 'Script error');
    return;
  }
  var points = getInOutPoints(paths);

  var isNeedInner = confirm('Select ' + points[0].length + ' inner corners of the paths (Yes)\nor ' + points[1].length + ' outer corners (No)?');
  selectPoints(isNeedInner ? points[0] : points[1]);
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
          alert('Few objects are selected\nPlease, select one or more paths', 'Script error');
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
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getPaths(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      out.push(item);
    }
  }
  return out;
}

// Get separate arrays of inner points and outer points
function getInOutPoints(paths) {
  var inner = [];
  var outer = [];
  var path, points, polarity;

  for (var i = 0, len = paths.length; i < len; i++) {
    path = paths[i];
    points = path.pathPoints;
    polarity = /positive/i.test(path.polarity);

    for (var j = 0, amt = points.length; j < amt; j++) {
      var k = j + 1;
      var m = j + 2;
      if (k >= points.length) k -= points.length;
      if (m >= points.length) m -= points.length;
  
      var p0 = points[j];
      var p1 = points[k];
      var p2 = points[m];
  
      var isPointInner = isInnerPoint(p0, p1, p2, polarity);
      if (isPointInner) inner.push(p1);
      else outer.push(p1);
    }
  }
  return [inner, outer];
}

// Get radial angle of vector
function getAngle(a, b) {
  var dx = b.anchor[0] - a.anchor[0];
  var dy = b.anchor[1] - a.anchor[1];
  var angle;
  if (dx >= 0 && dy >= 0) {
    angle = Math.atan(dy / dx);
  } else if (dx < 0 && dy >= 0) {
    angle = Math.atan(-dx / dy) + Math.PI / 2;
  } else if (dx < 0 && dy < 0) {
    angle = Math.atan(dy / dx) + Math.PI;
  } else {
    angle = Math.atan(-dx / dy) + Math.PI * 1.5;
  }
  return angle;
}

// Check point location
function isInnerPoint(a, b, c, polarity) {
  var angle1 = getAngle(b, a);
  var angle2 = getAngle(b, c);
  if (angle2 < angle1) angle2 += Math.PI * 2;
  var deltaAngle = angle2 - angle1;
  return deltaAngle >= Math.PI ? polarity : !polarity;
}

// Select point array
function selectPoints(points) {
  selection = null;
  for (var i = 0, len = points.length; i < len; i++) {
    points[i].selected = PathPointSelection.ANCHORPOINT;
  }
}

// Run script
try {
  main();
} catch (err) {}