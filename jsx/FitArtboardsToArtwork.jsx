/*
  FitArtboardsToArtwork.jsx for Adobe Illustrator
  Description: Resize each artboard by editable artwork size with paddings
  Date: December, 2022
  Modification date: June, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added custom artboards range
  0.1.3 Fixed fitting by text object bounds
  0.1.2 Added new units API for CC 2023 v27.1.1
  0.1.1 Added size correction in large canvas mode
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
      name: 'Fit Artboards To Artwork',
      version: 'v0.2'
    },
    CFG = {
      aiVers: parseFloat(app.version),
      units: getUnits(), // Active document units
      pads: 10,
      isEqual: true,
      isMac: /mac/i.test($.os),
      dlgOpacity: .97 // UI window opacity. Range 0-1
    };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var doc = app.activeDocument;
  var currAb = doc.artboards.getActiveArtboardIndex();
  var absLength = doc.artboards.length;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.dlgOpacity;

  var wrapper = win.add('group');
      wrapper.orientation = 'column';

  // PADDINGS
  var padPnl = wrapper.add('panel', undefined, 'Paddings, ' + CFG.units);
      padPnl.alignChildren = ['left', 'bottom'];
      padPnl.margins = 10;

  var padInp = padPnl.add('group');
      padInp.alignChildren = ['left', 'bottom'];
      padInp.spacing = 10;

  // TOP
  var top = padInp.add('group');
      top.preferredSize.width = 45;
      top.orientation = 'column';
      top.alignChildren = ['fill', 'center'];
      top.spacing = 5;

  top.add('statictext', undefined, 'Top');
  var topInp = top.add('edittext', undefined, CFG.pads);

  // BOTTOM
  var bottom = padInp.add('group');
      bottom.preferredSize.width = 45;
      bottom.orientation = 'column';
      bottom.alignChildren = ['fill', 'center'];
      bottom.spacing = 5;

  bottom.add('statictext', undefined, 'Bottom');
  var bottomInp = bottom.add('edittext', undefined, CFG.pads);

  // LEFT
  var left = padInp.add('group');
      left.preferredSize.width = 45;
      left.orientation = 'column';
      left.alignChildren = ['fill', 'center'];
      left.spacing = 5;

  left.add('statictext', undefined, 'Left');
  var leftInp = left.add('edittext', undefined, CFG.pads);

  // RIGHT
  var right = padInp.add('group');
      right.preferredSize.width = 45;
      right.orientation = 'column';
      right.alignChildren = ['fill', 'center'];
      right.spacing = 5;

  right.add('statictext', undefined, 'Right');
  var rightInp = right.add('edittext', undefined, CFG.pads);

  var isEqual = padInp.add('checkbox');
      isEqual.helpTip = 'Equal paddings';
      isEqual.value = CFG.isEqual;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // ARBOARDS RANGE
  var rangePnl = wrapper.add('panel', undefined, 'Artboards Range');
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = ['fill', 'center'];
      rangePnl.margins = [10, 15, 10, 7];

  var radio = rangePnl.add('group');
      radio.alignChildren = ['left', 'bottom'];

  var isCstmAb = radio.add('radiobutton', undefined, 'Custom');
      isCstmAb.value = true;

  var idx = radio.add('group');
      idx.alignChildren = ['fill', 'center'];
  
  var startGrp = idx.add('group');
      startGrp.alignChildren = ['left', 'center'];

  var startLbl = startGrp.add('statictext', undefined, 'Start:');
      startLbl.justify = 'left';

  var startInp = startGrp.add('edittext', undefined, '1');
      startInp.characters = 4;
      startInp.enabled = isCstmAb.value;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    startInp.active = true;
  }

  var endGrp = idx.add('group');
      endGrp.alignChildren = ['left', 'center'];

  var endLbl = endGrp.add('statictext', undefined, 'End:');
      endLbl.justify = 'left';

  var endInp = endGrp.add('edittext', undefined, absLength);
      endInp.characters = 4;
      endInp.enabled = isCstmAb.value;

  var isCurrAb = rangePnl.add('radiobutton', undefined, 'Current: ' + doc.artboards[currAb].name.substr(0, 28));

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  var copyright = btns.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  // EVENTS
  isEqual.onClick = function () {
    bottomInp.enabled = !this.value;
    leftInp.enabled = !this.value;
    rightInp.enabled = !this.value;
  }

  isCstmAb.onClick = function () {
    startInp.enabled = endInp.enabled = true;
    isCurrAb.value = false;
  }

  isCurrAb.onClick = function () {
    startInp.enabled = endInp.enabled = false;
    isCstmAb.value = false;
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  function okClick() {
    var pads = {};
    pads.top = convertUnits( strToAbsNum(topInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.bottom = isEqual.value ? pads.top : convertUnits( strToAbsNum(bottomInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.left = isEqual.value ? pads.top : convertUnits( strToAbsNum(leftInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.right = isEqual.value ? pads.top : convertUnits( strToAbsNum(rightInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;

    app.executeMenuCommand('deselectall');

    if (isCstmAb.value) {
      var startIdx = parseInt(startInp.text) - 1 || 0;
      var endIdx = parseInt(endInp.text) || absLength;

      if (isNaN(startIdx) || startIdx < 0 || startIdx >= absLength) {
        alert('Start index is invalid', 'Input error');
        return;
      }
    
      if (isNaN(endIdx) || endIdx < startIdx || endIdx > absLength) {
        alert('End index is invalid', 'Input error');
        return;
      }

      for (var i = startIdx; i < endIdx; i++) {
        resizeArtboard(doc, i, pads);
      }
    } else {
      resizeArtboard(doc, currAb, pads);
    }

    win.close();
  }

  win.center();
  win.show();
}

// Add paddings to artboard
function resizeArtboard(doc, idx, pads) {
  doc.artboards.setActiveArtboardIndex(idx);
  var ab = doc.artboards[idx];
  doc.selectObjectsOnActiveArtboard();
  if (!app.selection.length) return;

  if (hasTextFrame(app.selection)) {
    var abSel = app.selection;
    var dupArr = getDuplicates(app.selection);
    app.selection = dupArr;
    app.executeMenuCommand('Live Outline Object');
    app.executeMenuCommand('expandStyle');
    dupArr = app.selection;
    activeDocument.fitArtboardToSelectedArt(idx);
    app.selection = abSel;
    rmvItems(dupArr);
  } else {
    activeDocument.fitArtboardToSelectedArt(idx);
  }

  app.executeMenuCommand('deselectall');

  var rect = ab.artboardRect,
      left = rect[0],
      top = rect[1],
      right = rect[2],
      bottom = rect[3];

  ab.artboardRect = [left - pads.left, top + pads.top, right + pads.right, bottom - pads.bottom];
}

// Check editable text frame in array
function hasTextFrame(coll) {
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (item.typename === 'TextFrame') {
      return true;
    } else if (item.pageItems && item.pageItems.length) {
      if (hasTextFrame(item.pageItems)) return true;
    }
  }
  return false;
}

// Duplicate items
function getDuplicates(coll) {
  var arr = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    arr.push(coll[i].duplicate());
  }
  return arr;
}

// Remove items
function rmvItems(coll) {
  for (var i = 0, len = coll.length; i < len; i++) {
    coll[i].remove();
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

// Convert string to absolute number
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
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