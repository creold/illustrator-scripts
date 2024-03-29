/*
  FitArtboardsToArtwork.jsx for Adobe Illustrator
  Description: Resize each artboard by editable artwork size with paddings
  Date: December, 2022
  Modification date: September, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Added size correction in large canvas mode
  0.1.2 Added new units API for CC 2023 v27.1.1
  0.1.3 Fixed fitting by text object bounds

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
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

function main() {
var SCRIPT = {
      name: 'Fit Artboards To Artwork',
      version: 'v.0.1.3'
    },
    CFG = {
      aiVers: parseFloat(app.version),
      units: getUnits(), // Active document units
      pads: 10,
      isEqual: true,
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

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'fill'];
      win.opacity = CFG.dlgOpacity;

  // Paddings
  var padPnl = win.add('panel', undefined, 'Paddings, ' + CFG.units);
      padPnl.alignChildren = ['left', 'bottom'];
      padPnl.margins = 10;

  // Wrapper
  var wrapper = padPnl.add('group');
      wrapper.alignChildren = ['left', 'bottom'];
      wrapper.spacing = 10;

  // Top
  var top = wrapper.add('group');
      top.preferredSize.width = 50;
      top.orientation = 'column';
      top.alignChildren = ['fill', 'center'];
      top.spacing = 5;

  top.add('statictext', undefined, 'Top');
  var topInp = top.add('edittext', undefined, CFG.pads);

  // Bottom
  var bottom = wrapper.add('group');
      bottom.preferredSize.width = 50;
      bottom.orientation = 'column';
      bottom.alignChildren = ['fill', 'center'];
      bottom.spacing = 5;

  bottom.add('statictext', undefined, 'Bottom');
  var bottomInp = bottom.add('edittext', undefined, CFG.pads);

  // Left
  var left = wrapper.add('group');
      left.preferredSize.width = 50;
      left.orientation = 'column';
      left.alignChildren = ['fill', 'center'];
      left.spacing = 5;

  left.add('statictext', undefined, 'Left');
  var leftInp = left.add('edittext', undefined, CFG.pads);

  // Right
  var right = wrapper.add('group');
      right.preferredSize.width = 50;
      right.orientation = 'column';
      right.alignChildren = ['fill', 'center'];
      right.spacing = 5;

  right.add('statictext', undefined, 'Right');
  var rightInp = right.add('edittext', undefined, CFG.pads);

  var isEqual = wrapper.add('checkbox');
      isEqual.value = CFG.isEqual;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // Artboards
  var absPnl = win.add('panel', undefined, 'Source');
      absPnl.orientation = 'row';
      absPnl.alignChildren = ['fill', 'top'];
      absPnl.margins = [10, 15, 10, 10];

  var activeRb = absPnl.add('radiobutton', undefined, 'Active artboard');
      activeRb.value = true;
  var allRb = absPnl.add('radiobutton', undefined, 'All artboards');

  var btns = win.add('group');
      btns.alignChildren = ['center', 'top'];
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  isEqual.onClick = function () {
    bottomInp.enabled = !this.value;
    leftInp.enabled = !this.value;
    rightInp.enabled = !this.value;
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    var doc = app.activeDocument,
        pads = {};

    pads.top = convertUnits( strToAbsNum(topInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.bottom = isEqual.value ? pads.top : convertUnits( strToAbsNum(bottomInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.left = isEqual.value ? pads.top : convertUnits( strToAbsNum(leftInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;
    pads.right = isEqual.value ? pads.top : convertUnits( strToAbsNum(rightInp.text, CFG.pads), CFG.units, 'px' ) / CFG.sf;

    selection = null;
    redraw();

    if (allRb.value) {
      for (var i = 0, len = doc.artboards.length; i < len; i++) {
        doc.artboards.setActiveArtboardIndex(i);
        resizeArtboard(doc.artboards[i], i, pads);
      }
    } else {
      var idx = doc.artboards.getActiveArtboardIndex();
      resizeArtboard(doc.artboards[idx], idx, pads);
    }

    win.close();
  }

  win.center();
  win.show();
}

// Add paddings to artboard
function resizeArtboard(ab, idx, pads) {
  activeDocument.selectObjectsOnActiveArtboard();
  if (!selection.length) return;

  if (hasTextFrame(selection)) {
    var abSel = selection;
    var dupArr = getDuplicates(selection);
    selection = dupArr;
    app.executeMenuCommand('Live Outline Object');
    app.executeMenuCommand('expandStyle');
    dupArr = selection;
    activeDocument.fitArtboardToSelectedArt(idx);
    selection = abSel;
    rmvItems(dupArr);
  } else {
    activeDocument.fitArtboardToSelectedArt(idx);
  }

  selection = null;

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