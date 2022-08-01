/*
  FitArtboardsToArtwork.jsx for Adobe Illustrator
  Description: Resize each artboard by editable artwork size with paddings
  Date: June, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via Donatty https://donatty.com/sergosokin
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via PayPal (temporarily unavailable) http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
var SCRIPT = {
      name: 'Fit Artboards To Artwork',
      version: 'v.0.1'
    },
    CFG = {
      units: getUnits(), // Active document units
      paddings: 10,
      isEqual: true,
      dlgOpacity: .97 // UI window opacity. Range 0-1
    };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  // Dialog
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = CFG.dlgOpacity;

  // Paddings
  var padPnl = dialog.add('panel', undefined, 'Paddings, ' + CFG.units);
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
  var topInp = top.add('edittext', undefined, CFG.paddings);

  // Bottom
  var bottom = wrapper.add('group');
      bottom.preferredSize.width = 50;
      bottom.orientation = 'column';
      bottom.alignChildren = ['fill', 'center'];
      bottom.spacing = 5;

  bottom.add('statictext', undefined, 'Bottom');
  var bottomInp = bottom.add('edittext', undefined, CFG.paddings);

  // Left
  var left = wrapper.add('group');
      left.preferredSize.width = 50;
      left.orientation = 'column';
      left.alignChildren = ['fill', 'center'];
      left.spacing = 5;

  left.add('statictext', undefined, 'Left');
  var leftInp = left.add('edittext', undefined, CFG.paddings);

  // Right
  var right = wrapper.add('group');
      right.preferredSize.width = 50;
      right.orientation = 'column';
      right.alignChildren = ['fill', 'center'];
      right.spacing = 5;

  right.add('statictext', undefined, 'Right');
  var rightInp = right.add('edittext', undefined, CFG.paddings);

  var isEqual = wrapper.add('checkbox');
      isEqual.value = CFG.isEqual;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // Artboards
  var absPnl = dialog.add('panel', undefined, 'Source');
      absPnl.orientation = 'row';
      absPnl.alignChildren = ['fill', 'top'];
      absPnl.margins = [10, 15, 10, 10];

  var activeRb = absPnl.add('radiobutton', undefined, 'Active artboard');
      activeRb.value = true;
  var allRb = absPnl.add('radiobutton', undefined, 'All artboards');

  var btns = dialog.add('group');
      btns.alignChildren = ['center', 'top'];
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  isEqual.onClick = function () {
    bottomInp.enabled = !this.value;
    leftInp.enabled = !this.value;
    rightInp.enabled = !this.value;
  }

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  function okClick() {
    var doc = app.activeDocument,
        paddings = {};

    paddings.top = convertUnits( convertToAbsNum(topInp.text, CFG.paddings), CFG.units, 'px' );
    paddings.bottom = isEqual.value ? paddings.top : convertUnits( convertToAbsNum(bottomInp.text, CFG.paddings), CFG.units, 'px' );
    paddings.left = isEqual.value ? paddings.top : convertUnits( convertToAbsNum(leftInp.text, CFG.paddings), CFG.units, 'px' );
    paddings.right = isEqual.value ? paddings.top : convertUnits( convertToAbsNum(rightInp.text, CFG.paddings), CFG.units, 'px' );

    selection = null;
    redraw();

    if (allRb.value) {
      for (var i = 0, len = doc.artboards.length; i < len; i++) {
        doc.artboards.setActiveArtboardIndex(i);
        resizeArtboard(doc.artboards[i], i, paddings);
      }
    } else {
      var idx = doc.artboards.getActiveArtboardIndex();
      resizeArtboard(doc.artboards[idx], idx, paddings);
    }

    dialog.close();
  }

  dialog.center();
  dialog.show();
}

// Add paddings to artboard
function resizeArtboard(ab, idx, paddings) {
  activeDocument.selectObjectsOnActiveArtboard();
  if (!selection.length) return;

  activeDocument.fitArtboardToSelectedArt(idx);
  selection = null;

  var rect = ab.artboardRect,
      left = rect[0],
      top = rect[1],
      right = rect[2],
      bottom = rect[3];

  ab.artboardRect = [left - paddings.left, top + paddings.top, right + paddings.right, bottom - paddings.bottom];
}

// Get active document ruler units
function getUnits() {
  if (!documents.length) return '';
  switch (activeDocument.rulerUnits) {
    case RulerUnits.Pixels: return 'px';
    case RulerUnits.Points: return 'pt';
    case RulerUnits.Picas: return 'pc';
    case RulerUnits.Inches: return 'in';
    case RulerUnits.Millimeters: return 'mm';
    case RulerUnits.Centimeters: return 'cm';
    case RulerUnits.Unknown: // Parse new units only for the saved doc
      var xmp = activeDocument.XMPString;
      // Example: <stDim:unit>Yards</stDim:unit>
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'Yards') return 'yd';
      }
      break;
  }
  return 'px'; // Default
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Convert string to absolute number
function convertToAbsNum(str, def) {
  if (arguments.length == 1 || !def) def = 1;
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