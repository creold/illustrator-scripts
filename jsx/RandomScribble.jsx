/*
  RandomScribble.jsx for Adobe Illustrator
  Description: Create random path (scribble) with a given number of points
  Date: September, 2022
  Original Idea: @femkeblanco https://community.adobe.com/t5/illustrator/any-easy-way-to-make-a-random-lines-like-this-one/td-p/12169984
  Modification: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Fixed "Illustrator quit unexpectedly" error
  0.1.2 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), CS6, 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

// Main function
function main() {
  var SCRIPT = {
        name: 'Random Scribble',
        version: 'v.0.1.2'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        points: 4, // Default amount of the path points
        stroke: 1, // Default stroke width
        isClosed: true, // Default closed state of the path
        tension: 0.5, // Default curve tension
        minTension: 0, // Minimum curve tension
        maxTension: 1, // Maximum curve tension
        modKey: 'Q', // User modifier key for shortcuts
        dlgOpacity: 0.97 // UI window opacity. Range 0-1
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again', ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        amount: { en: 'Amount of points', ru: 'Количество точек' },
        tension: { en: 'Curve tension', ru: 'Натяжение кривой' },
        close: { en: 'C\u0332lose path', ru: 'Замкнуть линию' },
        random: { en: 'R\u0332andomize', ru: 'Сгенерировать' },
        hint: { en: 'Quick access with ', ru: 'Быстрый доступ ' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (!documents.length) {
    alert(LANG.errDoc)
    return;
  }

  var doc = app.activeDocument,
      activeAB = doc.artboards[doc.artboards.getActiveArtboardIndex()],
      currTension = CFG.tension,
      lines = [],
      container = [];

  // Get rectangle container for new path
  if (selection.length > 0 && selection.typename != 'TextRange') {
    var selPaths = [];
    getItems(selection, selPaths);
    for (var i = 0; i < selPaths.length; i++) {
      container.push(selPaths[i].geometricBounds);
    }
    selection = null;
  } else {
    container.push(activeAB.artboardRect);
  }

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = 'fill';
      dialog.spacing = 10;
      dialog.margins = 16;
      dialog.opacity = CFG.dlgOpacity;

  var pointsTitle = dialog.add('statictext', undefined, LANG.amount);
  var pointsLbl = dialog.add('edittext', undefined, CFG.points);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    pointsLbl.active = true;
  }
  
  var tensionTitle = dialog.add('statictext', undefined, LANG.tension);
  var tensionGrp = dialog.add('group');
      tensionGrp.orientation = 'row';
  var tensionSlider = tensionGrp.add('slider', undefined, CFG.tension, CFG.minTension, CFG.maxTension);
  var tensionLbl = tensionGrp.add('edittext', undefined, CFG.tension);
      tensionLbl.characters = 4;
  
  var isClosed = dialog.add('checkbox', undefined, LANG.close);
      isClosed.value = CFG.isClosed ? true : false;

  var randomize = dialog.add('button', undefined, LANG.random);
  var ok = dialog.add('button', undefined, LANG.ok, {name: 'ok'});
  var cancel = dialog.add('button', undefined, LANG.cancel, {name: 'cancel'});

  var hint = dialog.add('statictext', undefined, LANG.hint + CFG.modKey + ' + R');
      hint.justify = 'center';
      hint.enabled = false;

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  dialog.onShow = function () {
    process(container, lines, pointsLbl.text, isClosed.value, CFG.stroke, currTension);
  }

  pointsLbl.onChange = randomize.onClick = function () { 
    removeLines(lines);
    process(container, lines, pointsLbl.text, isClosed.value, CFG.stroke, currTension);
  }

  tensionSlider.onChange = function () {
    currTension = mapRange(this.value.toFixed(1), CFG.minTension, CFG.maxTension, 1);

    for (var i = 0; i < lines.length; i++) {
      smoothing(lines[i], currTension);
    }

    tensionLbl.text = this.value.toFixed(1);
    redraw();
  }

  tensionLbl.onChange = function () {
    currTension = strToAbsNum(this.text, CFG.tension);
    if (currTension > CFG.maxTension) {
      currTension = CFG.maxTension;
      this.text = CFG.maxTension;
    }

    tensionSlider.value = currTension;
    currTension = mapRange(currTension.toFixed(1), CFG.minTension, CFG.maxTension, 1);
    
    for (var i = 0; i < lines.length; i++) {
      smoothing(lines[i], currTension);
    }
    
    redraw();
  }

  isClosed.onClick = function () {
    for (var i = 0; i < lines.length; i++) {
      lines[i].closed = this.value ? true : false;
      // Remove handles from first and last point in opened path
      if (!this.value) {
        var fp = lines[i].pathPoints[0];
        fp.pointType = PointType.CORNER;
        fp.rightDirection = fp.anchor;
        fp.leftDirection = fp.anchor;
        
        var lp = lines[i].pathPoints[lines[i].pathPoints.length - 1];
        lp.pointType = PointType.CORNER;
        lp.rightDirection = lp.anchor;
        lp.leftDirection = lp.anchor;
      }
      if (this.value) smoothing(lines[i], currTension);
    }
    redraw();
  }

  // Shortcut listener
  var keysList = new RegExp('^[' + CFG.modKey + 'RC]$', 'i');
  var keys = {};

  // Block size input
  blockInput(pointsLbl);
  blockInput(tensionLbl);

  dialog.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (!key) return; // non-English layout
    if (keysList.test(key)) keys[kd.keyName] = true;   
    if (keys[CFG.modKey]) {
      for (var k in keys) {
        if (k == 'R') randomize.notify();
        if (k == 'C') isClosed.notify();
      }
    }
  });

  dialog.addEventListener('keyup', function(kd) {
    var key = kd.keyName;
    if (key && keysList.test(key)) delete keys[kd.keyName];
  });

  cancel.onClick = function () { 
    removeLines(lines);
    dialog.close();
  }

  ok.onClick = dialog.close;

  function blockInput(item) {
    item.addEventListener('keydown', function(kd) {
      if (kd.keyName && kd.keyName.match(CFG.modKey))
        keys[kd.keyName] = true;
      if (keys[CFG.modKey])
        kd.preventDefault(); 
    });
  }

  dialog.center();
  dialog.show();
}

function mapRange(value, min, max, ratio){
  if (value == min) return min;
  if (value == max) return ratio * 0.05;
  return max - (value * ratio);
}

/**
 * Get particular items
 * @param {object} collection - collection of groups and items
 * @param {array} arr - output array of single items
 */
function getItems(collection, arr) {
  for (var i = 0, len = collection.length; i < len; i++) {
    var currItem = collection[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getItems(currItem.pageItems, arr);
          break;
        default:
          arr.push(currItem);
          break;
      }
    } catch (e) {}
  }
}

/**
 * Simulate keyboard keys on Windows OS via VBScript
 * 
 * This function is in response to a known ScriptUI bug on Windows.
 * Basically, on some Windows Ai versions, when a ScriptUI dialog is
 * presented and the active attribute is set to true on a field, Windows
 * will flash the Windows Explorer app quickly and then bring Ai back
 * in focus with the dialog front and center.
 *
 * @param {String} k - Key to simulate
 * @param {Number} n - Number of times to simulate the keypress
 */
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
}

/**
 * Processing dialog parameters
 * @param {array} container - bounding box for all points
 * @param {array} arr - collection of new paths
 * @param {number} points - the amount of points on the path
 * @param {boolean} isClosed - closing the path
 * @param {number} tension - tension of the point handles
 */
function process(container, arr, points, isClosed, stroke, tension) {
  points = parseInt( strToAbsNum(points, 2) );
  if (points < 2) points = 2;
  for (var i = 0; i < container.length; i++) {
    var line = new Line(container[i], isClosed, stroke, tension);
    line.drawLine(points);
    arr.push(line.pItem);
    line.pItem.selected = true;
  }
  redraw();
}

/**
 * Draw a path with the parameters 
 * @param {array} container - bounding box for all points
 * @param {boolean} isClosed - closing the path
 * @param {number} tension - tension of the point handles
 */
function Line(container, isClosed, stroke, tension) {
  this.pItem = app.activeDocument.pathItems.add();
  if (this.pItem.filled && !this.pItem.stroked) {
    this.pItem.strokeColor = this.pItem.fillColor;
  }
  this.pItem.stroked = true;
  this.pItem.strokeWidth = stroke;
  this.pItem.filled = false;

  this.drawLine = function (points) {
    for (var i = 0; i < points; i++) {
      this.getPoints();
    }
    if (isClosed) this.pItem.closed = true;
    smoothing(this.pItem, tension);
  };

  this.getPoints = function () {
    var p = this.pItem.pathPoints.add();
    p.anchor = this.getPoint();
    return p;
  };

  this.getPoint = function () {
    var x = Math.floor(random(container[0], container[2]));
    var y = Math.floor(random(container[3], container[1]));
    return [x, y];
  };
}

/**
 * Get random value in range
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {number} random value >= min and <= max
 */
function random(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Apply smoothing to pathPoints of path
 * Author Hiroyuki Sato https://github.com/shspage
 * @param {object} path - target path
 * @param {number} tension - catmull-rom spline parameter
 */
function smoothing(path, tension) {
  var pt = path.pathPoints,
      lastIdx = pt.length - 1,
      beforeLastIdx = lastIdx - 1,
      idx0, idx1, idx2, idx3, // Index of pathPoints
      rl = [];  // (x,y) for rightDirection and (x,y) for leftDirection
  
  for (var i = 0; i <= lastIdx; i++) {
    if (path.closed) {
      idx0 = (i == 0) ? lastIdx : i - 1;
      idx1 = i;
      idx2 = (i == lastIdx) ? 0 : i + 1;
      if (i == lastIdx) {
        idx3 = 1;
      } else {
        idx3 = (i == beforeLastIdx) ? 0 : i + 2;
      }
    } else {
      if (i == lastIdx) break;
      idx0 = (i == 0) ? 0 : i - 1;
      idx1 = i;
      idx2 = i + 1;
      idx3 = (i == beforeLastIdx) ? i + 1 : i + 2;
    }

    rl = catmullRomToBezier(pt[idx0], pt[idx1], pt[idx2], pt[idx3], tension);

    pt[idx1].rightDirection = rl[0];
    pt[idx2].leftDirection = rl[1];
  }

  if (tension > 0) {
    changePointType(path, PointType.SMOOTH);
  } else {
    changePointType(path, PointType.CORNER);
  }
}

/**
 * converts Catmull-Rom to Bezier
 * reference: https://pomax.github.io/bezierinfo/#catmullconv
 * @param  {array} pt0 - pathPoint.anchor
 * @param  {array} pt1 - pathPoint.anchor
 * @param  {array} pt2 - pathPoint.anchor
 * @param  {array} pt3 - pathPoint.anchor
 * @param  {number} tension - parameter
 * @return {array} coordinates for pt1.rightDirection and pt2.leftDirection
*/
function catmullRomToBezier(pt0, pt1, pt2, pt3, tension){
  var rlx = catmullRomToBezier_sub(
      pt0.anchor[0],
      pt1.anchor[0],
      pt2.anchor[0],
      pt3.anchor[0], tension);

  var rly = catmullRomToBezier_sub(
      pt0.anchor[1],
      pt1.anchor[1],
      pt2.anchor[1],
      pt3.anchor[1], tension);
  
  return [[rlx[0], rly[0]], [rlx[1], rly[1]]];
}

/**
 * Calcs a pair of X or Y coordinate for bezier control points
 * @param  {number} p0 - anchor[0] or [1]
 * @param  {number} p1 - anchor[0] or [1]
 * @param  {number} p2 - anchor[0] or [1]
 * @param  {number} p3 - anchor[0] or [1]
 * @param  {number} tension - parameter
 * @return {array} a pair of X or Y ([X,X] or [Y, Y]) for bezier control points
*/
function catmullRomToBezier_sub(p0, p1, p2, p3, tension) {
  if (tension == 0) return [p1, p2];
  return [p1 + (p2 - p0) / (6 * tension),
    p2 - (p3 - p1) / (6 * tension)
  ];
}
/**
 * Change the type of path point
 * @param {object} path - target path
 * @param {string} type - either a curve or a corner
 */
function changePointType(path, type) {
  for (var i = 0; i < path.pathPoints.length; i++) {
    path.pathPoints[i].pointType = type;
  }
}

/**
 * Remove paths
 * @param {array} arr - array of created paths
 */
function removeLines(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    try {
      arr[i].remove();
    } catch (e) {}
    arr.splice(i, 1);
  }
}

/**
 * Convert string to absolute number
 * @param {string} str - input data
 * @param {number} def - default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Open link in browser
 * @param {string} url - website adress
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}