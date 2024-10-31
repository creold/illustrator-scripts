/*
  AlignTextBaseline.jsx for Adobe Illustrator
  Description: Allows point texts to be vertically aligned based on the baseline of its font, not its bounds
  Date: April, 2023
  Modification date: February, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.1 Removed input activation on Windows OS below CC v26.4
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
  var SCRIPT = {
    name: 'Align Text Baseline',
    version: 'v0.1.1'
  },
  CFG = {
    space: 10,
    dePreview: false,
    units: getUnits(),
    aiVers: parseFloat(app.version),
    isMac: /mac/i.test($.os),
    uiOpacity: .96 // UI window opacity. Range 0-1
  };

  var isUndo = false;
  var tfs = getTextFrames(selection);
  sortByPosition(tfs);
  
  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'top'];
      win.opacity = CFG.uiOpacity;

  // Input
  var wrapper = win.add('group');
      wrapper.alignChildren = ['fill', 'center'];

  wrapper.add('statictext', undefined, 'Vertical distribute space, ' + CFG.units);
  var spaceInp = wrapper.add('edittext', undefined, CFG.space);
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    spaceInp.active = true;
  }

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];
  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = CFG.dePreview;
  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok', { name: 'ok' });

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  shiftInputNumValue(spaceInp);

  if (isPreview.value) preview();
  spaceInp.onChange = isPreview.onClick = preview;

  cancel.onClick = win.close;
  ok.onClick = okClick;

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (e) {}
  }

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        distribute();
        redraw();
      } else if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (e) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    distribute();
    isUndo = false;
    win.close();
  }

  function distribute() {
    var space = strToNum(spaceInp.text, CFG.space) / CFG.sf;
    space = convertUnits(space, CFG.units, 'px');
    for (var i = 1, len = tfs.length; i < len; i++) {
      moveByBaseline(tfs[0], tfs[i], space * i);
    }
  }

  // Use Up / Down arrow keys (+ Shift) for change value
  function shiftInputNumValue(item) {
    item.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      if (kd.keyName == 'Down') {
        this.text = strToNum(this.text) - step;
        kd.preventDefault();
        preview();
      }
      if (kd.keyName == 'Up') {
        this.text = strToNum(this.text) + step;
        kd.preventDefault();
        preview();
      }
    });
  }

  win.center();
  win.show();
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

// Get TextFrames array from collection
function getTextFrames(coll) {
  var tfs = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename)) 
      tfs.push(coll[i]);
    else if (/group/i.test(coll[i].typename)) 
      tfs = tfs.concat(getTextFrames(coll[i].pageItems));
  }
  return tfs;
}

// Sort array by X and Y positions
// Reference by Hiroyuki Sato, shspage
function sortByPosition(coll) {
  var hs = [];
  var vs = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    hs.push(coll[i].left);
    vs.push(coll[i].top);
  }
  if (arrMax(hs) - arrMin(hs) > arrMax(vs) - arrMin(vs)) {
    coll.sort(function (a, b) {
      return comparePosition(a.left, b.left, b.top, a.top)
    });
  } else {
    coll.sort(function (a, b) {
      return comparePosition(b.top, a.top, a.left, b.left)
    });
  }
}

// Compare position of two objects
function comparePosition(a1, b1, a2, b2) {
  return a1 == b1 ? a2 - b2 : a1 - b1;
}

// Return maximum value in array
function arrMax(arr) {
  return Math.max.apply(null, arr);
}

// Return minimal value in array
function arrMin(arr) {
  return Math.min.apply(null, arr);
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

// Distribute two point texts by baseline
function moveByBaseline(a, b, space) {
  var dist = a.anchor[1] - b.anchor[1];
  var delta = space - dist;
  b.position = [b.position[0], b.position[1] - delta];
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

try {
  main();
} catch (e) {}