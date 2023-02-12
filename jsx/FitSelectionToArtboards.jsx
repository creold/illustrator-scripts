/*
  FitSelectionToArtboards.jsx for Adobe Illustrator
  Description: Proportional resizing of objects to fit one in each artboard
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added more options
  0.3 Added silent mode when holding the Alt key
  0.3.1 Added size correction in large canvas mode
  0.3.2 Added new units API for CC 2023 v27.1.1

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
preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Fit Selection To Artboards',
        version: 'v.0.3.2'
      },
      CFG = {
        paddings: 0,
        isAll: true, // Fit to all empty artboards
        isVisBnds: preferences.getBooleanPreference('includeStrokeInBounds'), // Visual bounds
        isFit: true, // Resize selection
        isRename: false, // Rename artboards as items
        isScaleStroke: preferences.getBooleanPreference('scaleLineWeight'),
        units: getUnits(), // Active document units
        showUI : true,    // Silent mode or dialog
        dlgMargins: [10, 15, 10, 8],
        dlgOpacity: .97 // UI window opacity. Range 0-1
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one or more items');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var isRulerTopLeft = preferences.getBooleanPreference('isRulerOriginTopLeft'),
      isRulerInFourthQuad = preferences.getBooleanPreference('isRulerIn4thQuad');
  CFG.isFlipY = (isRulerTopLeft && isRulerInFourthQuad) ? true : false;

  var isAltPressed = false;
  if (ScriptUI.environment.keyboardState.altKey) isAltPressed = true;

  if ((CFG.showUI && !isAltPressed) || (!CFG.showUI && isAltPressed)) { // Show dialog
    invokeUI(SCRIPT, CFG);
  } else { // Silent mode with the default settings
    process(CFG);
  }
}

// Show UI
function invokeUI(title, cfg) {
  var dlg = new Window('dialog', title.name + ' ' + title.version);
      dlg.alignChildren = ['fill', 'fill'];
      dlg.opacity = cfg.dlgOpacity;

  // Artboards
  var absPnl = dlg.add('panel', undefined, 'Artboard');
      absPnl.orientation = 'row';
      absPnl.margins = cfg.dlgMargins;

  var allRb = absPnl.add('radiobutton', undefined, 'All empty');
  var activeRb = absPnl.add('radiobutton', undefined, 'Active');
  cfg.isAll ? allRb.value = true : activeRb.value = true;

  // Resize
  var fitPnl = dlg.add('panel', undefined, 'Resize selection');
      fitPnl.orientation = 'row';
      fitPnl.spacing = 45;
      fitPnl.margins = cfg.dlgMargins;

  var fitRb = fitPnl.add('radiobutton', undefined, 'Yes');
  var noFitRb = fitPnl.add('radiobutton', undefined, 'No');
  cfg.isFit ? fitRb.value = true : noFitRb.value = true;

  // Bounds
  var bndsPnl = dlg.add('panel', undefined, 'Selection bounds');
      bndsPnl.orientation = 'row';
      bndsPnl.margins = cfg.dlgMargins;
      bndsPnl.spacing = 25;

  var visRb = bndsPnl.add('radiobutton', undefined, 'Visible');
  var geomRb = bndsPnl.add('radiobutton', undefined, 'Geometric');
  cfg.isVisBnds ? visRb.value = true : geomRb.value = true;

  // Paddings
  var padGrp = dlg.add('group');
      padGrp.alignChildren = ['fill', 'center'];

  padGrp.add('statictext', undefined, 'Paddings, ' + cfg.units);
  var padInp = padGrp.add('edittext', undefined, cfg.paddings);
      padInp.preferredSize.width = 80;

  var isRename = dlg.add('checkbox', undefined, 'Rename artboards as items');
      isRename.value = cfg.isRename;

  var btns = dlg.add('group');
      btns.alignChildren = 'fill';
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});

  var copyright = dlg.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = dlg.close;
  ok.onClick = okClick;

  function okClick() {
    cfg.paddings = convertUnits( strToAbsNum(padInp.text, cfg.paddings), cfg.units, 'px') / cfg.sf;
    cfg.isAll = allRb.value;
    cfg.isFit = fitRb.value;
    cfg.isVisBnds = visRb.value;
    cfg.isRename = isRename.value;
    process(cfg);
    dlg.close();
  }

  dlg.center();
  dlg.show();
}

// Run processing
function process(cfg) {
  var doc = app.activeDocument,
      docAbs = doc.artboards,
      abIdx = docAbs.getActiveArtboardIndex(),
      abBnds = docAbs[abIdx].artboardRect,
      docSel = selection,
      item = docSel[0],
      coord = app.coordinateSystem;

  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  if (!cfg.isAll) {
    if (cfg.isFit) {
      fitToArtboard(item, abBnds, cfg.isVisBnds, cfg.isScaleStroke, cfg.paddings);
    }
    centerToArtboard(item, abBnds, cfg.isFlipY);
    if (cfg.isRename) {
      renameArtboard(item, docAbs[abIdx]);
    }
  } else {
    var emptyAbs = getEmptyArtboards(doc),
        len = Math.min(emptyAbs.length, docSel.length);

    for (var i = 0; i < len; i++) {
      item = docSel[i];
      abBnds = docAbs[emptyAbs[i]].artboardRect;
      docAbs.setActiveArtboardIndex(emptyAbs[i]);
      if (cfg.isFit) {
        fitToArtboard(item, abBnds, cfg.isVisBnds, cfg.isScaleStroke, cfg.paddings);
      }
      centerToArtboard(item, abBnds, cfg.isFlipY);
      if (cfg.isRename) {
        renameArtboard(item, docAbs[emptyAbs[i]]);
      }
    }
  }

  app.coordinateSystem = coord;
  selection = docSel;
}

// Get the ruler units of the active document
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

// Units conversion
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

// Fit the item to the size of the artboard
function fitToArtboard(item, abBnds, isVisBnds, isStroke, paddings) {
  var orig = item;
  if (isType(item, 'group') && item.clipped) {
    item = getMaskPath(item);
  }

  var bnds = isVisBnds ? item.visibleBounds : item.geometricBounds,
      itemWidth = Math.abs(bnds[2] - bnds[0]),
      itemHeight = Math.abs(bnds[1] - bnds[3]),
      abWidth = Math.abs(abBnds[2] - abBnds[0]),
      abHeight = Math.abs(abBnds[1] - abBnds[3]);
  
  var ratioW = 100 * (abWidth - 2 * paddings) / itemWidth,
      ratioH = 100 * (abHeight - 2 * paddings) / itemHeight,
      ratio = Math.min(ratioW, ratioH);

  // X, Y, Positions, FillPatterns, FillGradients, StrokePattern, LineWidths
  orig.resize(ratio, ratio, true, true, true, true, (isVisBnds || isStroke) ? ratio : 100);
}

// Place the item in the center of the artboard
function centerToArtboard(item, abBnds, isFlipY) {
  var bnds = item.geometricBounds,
      itemSize = {
        left: bnds[0],
        top: bnds[1],
        inLeft: bnds[0],
        inTop: bnds[1],
        inRight: bnds[2],
        inBottom: bnds[3],
        h: 0,
        w: 0
      };

  if (isType(item, 'group') && item.clipped) {
    var mask = getMaskPath(item);
    bnds = mask.geometricBounds,
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
  }

  abWidth = Math.abs(abBnds[2] - abBnds[0]);
  abHeight = Math.abs(abBnds[1] - abBnds[3]);
  itemSize.h = Math.abs(itemSize.inTop - itemSize.inBottom);
  itemSize.w = Math.abs(itemSize.inRight - itemSize.inLeft);

  var left = itemSize.left - itemSize.inLeft,
      top = itemSize.top - itemSize.inTop,
      centerX = left + (abWidth - itemSize.w) / 2,
      centerY = top + (itemSize.h + (isFlipY ? -1 : 1) * abHeight) / 2;

  item.position = [centerX, centerY];
}

// Get the clipping mask
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) {
      return currItem;
    }
  }
}

// Check the clipping mask
function isClippingPath(item) {
  var clipText = (isType(item, 'text') &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (isType(item, 'compound') && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Rename the artboard as an item
function renameArtboard(item, ab) {
  var name = '';

  if (isType(item, 'text') && isEmpty(item.name) && !isEmpty(item.contents)) {
    name = item.contents.slice(0, 100);
  } else if (isType(item, 'symbol') && isEmpty(item.name)) {
    name = item.symbol.name;
  } else {
    name = item.name;
  }

  if (!isEmpty(name) && ab.name !== name) ab.name = name;
}

// Get empty artboards of the document
function getEmptyArtboards(doc) {
  var out = [];
  for (var i = 0, len = doc.artboards.length; i < len; i++) {
    selection = null;
    doc.artboards.setActiveArtboardIndex(i);
    doc.selectObjectsOnActiveArtboard();
    if (!selection.length) out.push(i);
  }
  return out;
}

// Check an empty string
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
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