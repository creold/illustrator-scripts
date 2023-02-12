/*
  PointsMoveRandom.jsx for Adobe Illustrator
  Description: Random movement of selected points in an user range
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added deselect some anchors, move handles
  0.3 Added step, saving settings. Minor improvements
  0.3.1 Fixed 'Fixed H' and 'Fixed V' options and entering identical from / to range
  0.4 Fixed "Illustrator quit unexpectedly" error. Updated units conversion
  0.4.1 Fixed input activation in Windows OS
  0.4.2 Added size correction in large canvas mode
  0.4.3 Added new units API for CC 2023 v27.1.1

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

// Main function
function main() {
  var SCRIPT = {
        name: 'Points Move Random',
        version: 'v.0.4.2'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        move: 1,
        chance: 50,
        step: 1.0,
        units: getUnits(), // Active document units
        modKey: 'Q', // User modifier key for shortcuts
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      },
      MSG = {
        errDoc: 'Error\nOpen a document and try again',
        errSel: 'Error\nPlease select atleast one path with points',
        errStepZero: 'Error\nThe step must be greater than 0',
        errStepOut: 'Error\nThe step is out of range: '
      };

  if (!documents.length) {
    alert(MSG.errDoc);
    return;
  }

  var selPaths = getPaths(selection),
      selPoints = getPoints(selPaths);

  if (!selPoints.length) {
    alert(MSG.errSel);
    return;
  }

  selection = null;
  redraw();

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  showUI(selPoints, SCRIPT, CFG, SETTINGS, MSG);
}

function showUI(points, SCRIPT, CFG, SETTINGS, MSG) {
  var undoCounter = 0,
      newPoints = [],
      tmpChance = 0,
      isRandChanged = false;

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = 'fill';

  // RANGE PANEL
  var rangePnl = dialog.add('panel', undefined, 'Random move range, ' + CFG.units);
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = 'left';
      rangePnl.margins = [10, 20, 10, 5];

  // HORIZONTAL INPUT
  var hGroup = rangePnl.add('group');
      hGroup.alignChildren = 'left';

  var hGroupTitle = hGroup.add('statictext', undefined, 'Horizontal');

  var hRangeGroup = hGroup.add('group');
      hRangeGroup.alignChildren = 'left';

  var hFromVal = hRangeGroup.add('edittext', undefined, -1 * CFG.move);
      hFromVal.characters = 5;

  hRangeGroup.add('statictext', undefined, 'to');

  var hToVal = hRangeGroup.add('edittext', undefined, CFG.move);
      hToVal.characters = 5;
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 2);
  } else {
    hToVal.active = true;
  }

  var isHFixed = hRangeGroup.add('checkbox', undefined, 'Fixed H\u0332'); // Unicode underlined H
      isHFixed.helpTip = 'Press ' + CFG.modKey + '+H to enable';

  // VERTICAL INPUT
  var vGroup = rangePnl.add('group');
      vGroup.alignChildren = 'left';
      vGroup.spacing = 28;

  vGroup.add('statictext', undefined, 'Vertical');

  var vRangeGroup = vGroup.add('group');
      vRangeGroup.alignChildren = 'left';

  var vFromVal = vRangeGroup.add('edittext', undefined, -1 * CFG.move);
      vFromVal.characters = 5;

  vRangeGroup.add('statictext', undefined, 'to');

  var vToVal = vRangeGroup.add('edittext', undefined, CFG.move);
      vToVal.characters = 5;

  var isVFixed = vRangeGroup.add('checkbox', undefined, 'Fixed V\u0332'); // Unicode underlined V
      isVFixed.helpTip = 'Press ' + CFG.modKey + '+V to enable';

  // STEP INPUT
  var step = rangePnl.add('group');

  var stepTitle = step.add('statictext', [0, 0, 200, 30]);
      stepTitle.text = 'Step for random value, ' + CFG.units + ' (> 0)';

  var stepInp = step.add('edittext', undefined, CFG.step);
      stepInp.characters = 5;

  // OPTIONS
  var options = dialog.add('group');
      options.orientation = 'column';
      options.alignChildren = 'left';

  var randOption = options.add('group');
      randOption.alignChildren = 'center';

  var isRandPoint = randOption.add('checkbox');
      isRandPoint.text = 'S\u0332elect some of the points randomly'; // Unicode underlined S
      isRandPoint.helpTip = 'Press ' + CFG.modKey + '+S to enable';

  var chanceInp = randOption.add('edittext', undefined, CFG.chance);
      chanceInp.characters = 4;
      chanceInp.enabled = false;

  randOption.add('statictext', undefined, '%');

  var isHandles = options.add('checkbox');
      isHandles.text = 'M\u0332ove only points handles'; // Unicode underlined M
      isHandles.helpTip = 'Press ' + CFG.modKey + '+M to enable';

  isRandPoint.onClick = function () {
    chanceInp.enabled = !chanceInp.enabled;
  }

  var hint = dialog.add('statictext', undefined, 'Quick access with ' + CFG.modKey + ' + underlined key');
      hint.justify = 'center';
      hint.enabled = false;

  // BUTTONS
  var btns = dialog.add('group');
      btns.orientation = 'row';
      btns.alignment = 'center';

  var close = btns.add('button', undefined, 'C\u0332lose', {name: 'cancel'});
      close.helpTip = 'Press Esc to Close';

  var revert = btns.add('button', undefined, 'R\u0332evert'); // Unicode underlined R
      revert.helpTip = 'Press ' + CFG.modKey + '+R to Revert';
      revert.enabled = false;

  var apply = btns.add('button', undefined, 'A\u0332pply', {name: 'ok'}); // Unicode underlined A
      apply.helpTip = 'Press ' + CFG.modKey + '+A to Apply';

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  close.onClick = dialog.close;
  dialog.onClose = saveSettings;

  isHFixed.onClick = function () { hFromVal.enabled = !this.value; }
  isVFixed.onClick = function () { vFromVal.enabled = !this.value; }

  // Restore original points state
  revert.onClick = function() {
    selection = null;
    if (undoCounter) {
      while (undoCounter--) undo();
      newPoints = [];
      isRandChanged = false;
      undoCounter = 0;
      revert.enabled = false;
      redraw();
    }
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  shiftInputNumValue(hFromVal);
  shiftInputNumValue(hToVal);
  shiftInputNumValue(vFromVal);
  shiftInputNumValue(vToVal);
  shiftInputNumValue(chanceInp);

  // Shortcut listener
  var keysList = new RegExp('^[' + CFG.modKey + 'HVSMRA]$', 'i');
  var keys = {};
  for (var i = 0; i < rangePnl.children.length; i++) {
    blockInput(rangePnl.children[i]);
  }
  blockInput(chanceInp);
  blockInput(stepInp);

  dialog.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (!key) return; // non-English layout
    if (keysList.test(key)) keys[kd.keyName] = true;
    if (keys[CFG.modKey]) {
      for (var k in keys) {
        if (k == 'H') isHFixed.notify();
        if (k == 'V') isVFixed.notify();
        if (k == 'S') isRandPoint.notify();
        if (k == 'M') isHandles.notify();
        if (k == 'R') revert.notify();
        if (k == 'A') apply.notify();
      }
    }
  });

  dialog.addEventListener('keyup', function(kd) {
    var key = kd.keyName;
    if (key && keysList.test(key)) delete keys[kd.keyName];
  });

  apply.onClick = start;

  loadSettings();

  dialog.center();
  dialog.show();

  function blockInput(item) {
    item.addEventListener('keydown', function(kd) {
      if (kd.keyName && kd.keyName.match(CFG.modKey))
        keys[kd.keyName] = true;
      if (keys[CFG.modKey])
        kd.preventDefault(); 
    });
  }

  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;
      if (kd.keyName == 'Down') {
        this.text = Number(this.text) - step;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = Number(this.text) + step;
        kd.preventDefault();
      }
    });
  }

  function start() {
    if (strToNum(stepInp.text, 0) === 0) {
      alert(MSG.errStepZero);
      return;
    }

    var range = {},
        chanceVal,
        stepVal,
        tmpMinMax,
        errStepMsg = '';

    // Validation of numeric inputs
    range.x1 = hFromVal.text = strToNum(hFromVal.text, -1 * CFG.move);
    range.x2 = hToVal.text = strToNum(hToVal.text, CFG.move);
    range.y1 = vFromVal.text = strToNum(vFromVal.text, -1 * CFG.move);
    range.y2 = vToVal.text = strToNum(vToVal.text, CFG.move);
    chanceVal = chanceInp.text = strToNum(chanceInp.text, CFG.chance);
    stepVal = stepInp.text = strToNum(stepInp.text, CFG.step);

    // Swap values if the start are greater than the end
    if (range.x2 < range.x1) {
      tmpMinMax = range.x1;
      range.x1 = hFromVal.text = range.x2;
      range.x2 = hToVal.text = tmpMinMax;
    }
    if (range.y2 < range.y1) {
      tmpMinMax = range.y1;
      range.y1 = vFromVal.text = range.y2;
      range.y2 = vToVal.text = tmpMinMax;
    }

    if (chanceVal < 0) chanceVal = chanceInp.text = 0;
    if (chanceVal > 100) chanceVal = chanceInp.text = 100;

    if (stepVal < 0) stepVal = stepInp.text = CFG.step;
    // Check that the step don't out of the range
    if (range.x1 !== range.x2 && (stepVal + range.x1) > range.x2)
      errStepMsg += 'Horizontal, ';
    if (range.y1 !== range.y2 && (stepVal + range.y1) > range.y2)
      errStepMsg += 'Vertical, ';
    if (errStepMsg.length) {
      alert(MSG.errStepOut + errStepMsg.slice(0, -2));
      return;
    }

    // Get random points
    if (isRandPoint.value && (!isRandChanged || tmpChance !== chanceVal)) {
      newPoints = [];
      shuffle(points);
      var shuffledLength = Math.ceil(points.length * chanceVal / 100);
      for (var j = 0; j < shuffledLength; j++) {
        newPoints.push(points[j]);
      }
      isRandChanged = true;
      tmpChance = chanceVal;
      redraw();
    }

    revert.enabled = true;
    undoCounter++;

    // Start move
    movePoint(
      isRandPoint.value ? newPoints : points,
      range,
      isHFixed.value,
      isVFixed.value,
      isHandles.value,
      stepVal,
      CFG.units,
      CFG.sf
    );

    redraw();
  }

  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.horizFrom = hFromVal.text;
    pref.horizTo = hToVal.text;
    pref.isHorizFixed = isHFixed.value;
    pref.vertFrom = vFromVal.text;
    pref.vertTo = vToVal.text;
    pref.isVertFixed = isVFixed.value;
    pref.step = stepInp.text;
    pref.isHandles = isHandles.value;
    pref.isRandomPoint = isRandPoint.value;
    pref.chance = chanceInp.text;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  function loadSettings() {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          hFromVal.text = pref.horizFrom;
          hToVal.text = pref.horizTo;
          isHFixed.value = pref.isHorizFixed;
          hFromVal.enabled = !pref.isHorizFixed;
          vFromVal.text = pref.vertFrom;
          vToVal.text = pref.vertTo;
          isVFixed.value = pref.isVertFixed;
          vFromVal.enabled = !pref.isVertFixed;
          stepInp.text = pref.step;
          isHandles.value = pref.isHandles;
          isRandPoint.value = pref.isRandomPoint;
          chanceInp.enabled = pref.isRandomPoint;
          chanceInp.text = pref.chance;
        }
      } catch (e) {}
    }
  }
}

// Get single items from selection
function getPaths(collection) {
  var out = [];
  for (var i = 0; i < collection.length; i++) {
    var item = collection[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getPaths(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getPaths(item.pathItems));
    } else if (/pathitem/i.test(item.typename)) {
      out.push(item);
    } else {
      item.selected = false;
    }
  }
  return out;
}

// Get selected points on paths
function getPoints(collection) {
  var out = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    if (collection[i].pathPoints.length > 1) {
      var points = collection[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        if (isSelected(points[j])) out.push(points[j]);
      }
    }
  }
  return out;
}

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center.
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

// Check current Point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

// Convert string to number
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

// Shuffle array
function shuffle(arr) {
  var j, temp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

// The max and min values is included
function getRandomInRange(min, max, step) {
  var range = ((step % 1 == 0 ? 1 : 0) + max - min) / step,
      n = Math.random() * range;
  n = (step % 1 == 0) ? Math.floor(n) : Math.round(n);
  return n * step + min;
}

// Move points
function movePoint(points, range, isHFixed, isVFixed, isHandles, step, units, sf) {
  var deltaX, deltaY;

  for (var i = 0, pLen = points.length; i < pLen; i++) {
    deltaX = (isHFixed || range.x1 == range.x2) ? range.x2 : getRandomInRange(range.x1, range.x2, step);
    deltaY = (isVFixed || range.y1 == range.y2) ? range.y2 : getRandomInRange(range.y1, range.y2, step);

    deltaX = convertUnits(deltaX, units, 'px') / sf;
    deltaY = convertUnits(deltaY, units, 'px') / sf;

    with (points[i]) {
      if (!isHandles) { // Move the anchor and handles
        anchor = [anchor[0] + deltaX, anchor[1] + deltaY];
        leftDirection = [leftDirection[0] + deltaX, leftDirection[1] + deltaY];
        rightDirection = [rightDirection[0] + deltaX, rightDirection[1] + deltaY];
      } else { // Mirror move the handles
        leftDirection = [anchor[0] + (leftDirection[0] - anchor[0]) - deltaX,
                          anchor[1] + (leftDirection[1] - anchor[1]) - deltaY];
        rightDirection = [anchor[0] + (rightDirection[0] - anchor[0]) + deltaX,
                          anchor[1] + (rightDirection[1] - anchor[1]) + deltaY];
      }
    }
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

// Open link in browser
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
