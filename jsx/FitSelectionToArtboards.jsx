/*
  FitSelectionToArtboards.jsx for Adobe Illustrator
  Description: Proportional resizing of objects to fit one in each artboard
  Date: December, 2022
  Modification date: April, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3.4 Fixed objects alignment with modified artboard rulers
  0.3.3 Fixed text object fitting
  0.3.2 Added new units API for CC 2023 v27.1.1
  0.3.1 Added size correction in large canvas mode
  0.3 Added silent mode when holding the Alt key
  0.2 Added more options
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
preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Fit Selection To Artboards',
        version: 'v.0.3.4'
      },
      CFG = {
        pads: 0,
        isAll: true, // Fit to all empty artboards
        isVisBnds: preferences.getBooleanPreference('includeStrokeInBounds'), // Visual bounds
        isFit: true, // Resize selection
        isRename: false, // Rename artboards as items
        aiVers: parseInt(app.version),
        isScaleStroke: preferences.getBooleanPreference('scaleLineWeight'),
        units: getUnits(), // Active document units
        showUI: true,    // Silent mode or dialog
        dlgMargins: [10, 15, 10, 8],
        dlgOpacity: .97 // UI window opacity. Range 0-1
      };

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later', 'Script error');
    return;
  }

  if (!documents.length) {
    alert('Error\nOpen a document and try again', 'Script error');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one or more items', 'Script error');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

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
      dlg.alignChildren = ['fill', 'top'];
      dlg.opacity = cfg.dlgOpacity;

  // Artboards
  var absPnl = dlg.add('panel', undefined, 'Move and fit items to artboards');
      absPnl.orientation = 'row';
      absPnl.margins = cfg.dlgMargins;

  var allRb = absPnl.add('radiobutton', undefined, 'To all empty');
  var activeRb = absPnl.add('radiobutton', undefined, 'To active');
  cfg.isAll ? allRb.value = true : activeRb.value = true;

  var wrapper = dlg.add('group');
      wrapper.alignChildren = ['fill', 'top'];

  // Resize
  var fitPnl = wrapper.add('panel', undefined, 'Resize items');
      fitPnl.alignChildren = ['fill', 'top'];
      fitPnl.margins = cfg.dlgMargins;

  var fitRb = fitPnl.add('radiobutton', undefined, 'Yes');
  var noFitRb = fitPnl.add('radiobutton', undefined, 'No');
  cfg.isFit ? fitRb.value = true : noFitRb.value = true;

  // Bounds
  var bndsPnl = wrapper.add('panel', undefined, 'Items bounds');
      bndsPnl.alignChildren = ['fill', 'top'];
      bndsPnl.margins = cfg.dlgMargins;

  var visRb = bndsPnl.add('radiobutton', undefined, 'Visible');
      visRb.helpTip = 'The visible bounds of the item\nincluding stroke width and effects';
  var geomRb = bndsPnl.add('radiobutton', undefined, 'Geometric');
      geomRb.helpTip = 'The bounds of the object\nexcluding stroke width and effects';
  cfg.isVisBnds ? visRb.value = true : geomRb.value = true;

  // Paddings
  var padGrp = dlg.add('group');
      padGrp.alignChildren = ['fill', 'center'];

  padGrp.add('statictext', undefined, 'Paddings, ' + cfg.units);
  var padInp = padGrp.add('edittext', undefined, cfg.pads);
      padInp.preferredSize.width = 80;

  var isRename = dlg.add('checkbox', undefined, 'Rename artboards as items');
      isRename.value = cfg.isRename;

  var btns = dlg.add('group');
      btns.alignChildren = ['fill', 'center'];
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
    cfg.pads = convertUnits( strToAbsNum(padInp.text, cfg.pads), cfg.units, 'px') / cfg.sf;
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
      coord = app.coordinateSystem,
      ruler = docAbs[abIdx].rulerOrigin;

  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  if (!cfg.isAll) {
    if (cfg.isFit) {
      fitToArtboard(item, abBnds, cfg.isVisBnds, cfg.isScaleStroke, cfg.pads);
    }
    docAbs[abIdx].rulerOrigin = [0, 0];
    centerToArtboard(item, abBnds);
    docAbs[abIdx].rulerOrigin = ruler;
    if (cfg.isRename) {
      renameArtboard(item, docAbs[abIdx]);
    }
  } else {
    var emptyAbs = getEmptyArtboards(doc),
        len = Math.min(emptyAbs.length, docSel.length);

    for (var i = len - 1; i >= 0; i--) {
      item = docSel[i];
      abIdx = emptyAbs[i];
      abBnds = docAbs[abIdx].artboardRect;
      docAbs.setActiveArtboardIndex(abIdx);
      if (cfg.isFit) {
        fitToArtboard(item, abBnds, cfg.isVisBnds, cfg.isScaleStroke, cfg.pads);
      }
      ruler = docAbs[abIdx].rulerOrigin;
      docAbs[abIdx].rulerOrigin = [0, 0];
      centerToArtboard(item, abBnds);
      docAbs[abIdx].rulerOrigin = ruler;
      if (cfg.isRename) {
        renameArtboard(item, docAbs[abIdx]);
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
function fitToArtboard(item, abBnds, isVisBnds, isStroke, pads) {
  var type = isVisBnds ? 'visibleBounds' : 'geometricBounds';
  var bnds = [];

  if (isType(item, 'group|text')) {
    var dup = item.duplicate();
    app.executeMenuCommand('deselectall');
    selection = dup;
    outlineText(dup.pageItems ? dup.pageItems : [dup]);
    dup = selection[0];
    bnds = getVisibleBounds(dup, type);
    app.executeMenuCommand('deselectall');
    dup.remove();
  } else {
    bnds = getVisibleBounds(item, type);
  }

  var itemW = Math.abs(bnds[2] - bnds[0]),
      itemH = Math.abs(bnds[1] - bnds[3]),
      abWidth = Math.abs(abBnds[2] - abBnds[0]),
      abHeight = Math.abs(abBnds[1] - abBnds[3]);
  
  var ratioW = 100 * (abWidth - 2 * pads) / itemW,
      ratioH = 100 * (abHeight - 2 * pads) / itemH,
      ratio = Math.min(ratioW, ratioH);

  // X, Y, Positions, FillPatterns, FillGradients, StrokePattern, LineWidths
  item.resize(ratio, ratio, true, true, true, true, (isVisBnds || isStroke) ? ratio : 100);
}

// Create outlines
function outlineText(coll) {
  for (var i = coll.length - 1; i >= 0; i--) {
    var item = coll[i];
    if (isType(item, 'text')) {
      item.createOutline();
    } else if (isType(item, 'group')) {
      outlineText(item.pageItems);
    }
  }
}

// Get the actual "visible" bounds
// https://github.com/joshbduncan/adobe-scripts/blob/main/DrawVisibleBounds.jsx
function getVisibleBounds(obj, type) {
  if (arguments.length == 1 || type == undefined) type = 'geometricBounds';
  var doc = app.activeDocument;
  var bnds, clippedItem, tmpItem, tmpLayer;
  var curItem;
  if (obj.typename === 'GroupItem') {
    if (obj.clipped) {
      // Check all sub objects to find the clipping path
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        if (curItem.clipping) {
          clippedItem = curItem;
          break;
        } else if (curItem.typename === 'CompoundPathItem') {
          if (!curItem.pathItems.length) {
            // Catch compound path items with no pathItems
            // via William Dowling @ github.com/wdjsdev
            tmpLayer = doc.layers.add();
            tmpItem = curItem.duplicate(tmpLayer);
            app.executeMenuCommand('deselectall');
            tmpItem.selected = true;
            app.executeMenuCommand('noCompoundPath');
            tmpLayer.hasSelectedArtwork = true;
            app.executeMenuCommand('group');
            clippedItem = selection[0];
            break;
          } else if (curItem.pathItems[0].clipping) {
            clippedItem = curItem;
            break;
          }
        }
      }
      if (!clippedItem) clippedItem = obj.pageItems[0];
      bnds = clippedItem[type];
      if (tmpLayer) {
        tmpLayer.remove();
        tmpLayer = undefined;
      }
    } else {
      // If the object is not clipped
      var subObjBnds;
      var allBoundPoints = [[], [], [], []];
      // Get the bounds of every object in the group
      for (var i = 0; i < obj.pageItems.length; i++) {
        curItem = obj.pageItems[i];
        subObjBnds = getVisibleBounds(curItem, type);
        allBoundPoints[0].push(subObjBnds[0]);
        allBoundPoints[1].push(subObjBnds[1]);
        allBoundPoints[2].push(subObjBnds[2]);
        allBoundPoints[3].push(subObjBnds[3]);
      }
      // Determine the groups bounds from it sub object bound points
      bnds = [
        Math.min.apply(Math, allBoundPoints[0]),
        Math.max.apply(Math, allBoundPoints[1]),
        Math.max.apply(Math, allBoundPoints[2]),
        Math.min.apply(Math, allBoundPoints[3]),
      ];
    }
  } else {
    bnds = obj[type];
  }
  return bnds;
}

// Place the item in the center of the artboard
function centerToArtboard(item, abBnds) {
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
    bnds = getVisibleBounds(item, 'geometricBounds');
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
  } else if (isType(item, 'group|text')) {
    var dup = item.duplicate();
    app.executeMenuCommand('deselectall');
    selection = dup;
    outlineText(dup.pageItems ? dup.pageItems : [dup]);
    dup = selection[0];
    bnds = getVisibleBounds(dup, 'geometricBounds');
    app.executeMenuCommand('deselectall');
    itemSize.inLeft = bnds[0];
    itemSize.inTop = bnds[1];
    itemSize.inRight = bnds[2];
    itemSize.inBottom = bnds[3];
    dup.remove();
  }

  abWidth = Math.abs(abBnds[2] - abBnds[0]);
  abHeight = Math.abs(abBnds[1] - abBnds[3]);
  itemSize.h = Math.abs(itemSize.inTop - itemSize.inBottom);
  itemSize.w = Math.abs(itemSize.inRight - itemSize.inLeft);

  var left = itemSize.left - itemSize.inLeft,
      top = itemSize.top - itemSize.inTop,
      centerX = left + (abWidth - itemSize.w) / 2,
      centerY = top + (itemSize.h - abHeight) / 2;

  item.position = [centerX, centerY];
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