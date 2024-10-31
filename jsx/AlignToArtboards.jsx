/*
  AlignToArtboards.jsx for Adobe Illustrator
  Description: Positions objects on document's artboards
  Date: June, 2023
  Modification date: September, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Fixed text object align

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
        name: 'Align To Artboards',
        version: 'v.0.2'
      },
      CFG = {
        note: '{artboard}',
        refHint: ['Top Left', 'Top', 'Top Right', 'Left', 'Center', 'Right', 'Bottom Left', 'Bottom', 'Bottom Right'],
        isMac: /mac/i.test($.os),
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!isCorrectEnv('version:16')) return;

  var isSelExists = selection.length && selection.typename !== 'TextRange';

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');

  // Target
  var tgtPnl = wrapper.add('panel', undefined, 'Target');
      tgtPnl.orientation = 'column';
      tgtPnl.alignChildren = 'left';
      tgtPnl.margins = [10, 15, 10, 10];

  var selToPrntRb = tgtPnl.add('radiobutton', undefined, 'Selected objects to parent artboards');
      selToPrntRb.value = isSelExists;
      selToPrntRb.enabled = isSelExists;
  var selToActRb = tgtPnl.add('radiobutton', undefined, 'Selected objects to active artboard');
      selToActRb.enabled = isSelExists;
  var toAllRb = tgtPnl.add('radiobutton', undefined, 'Objects as group to parent artboards');
      toAllRb.value = !isSelExists;

  // Reference point
  var refPnl = wrapper.add('panel', undefined, 'Align Point');
      refPnl.orientation = 'row';
      refPnl.bounds = [0, 0, 100, 112];

  // Create reference point matrix 3x3
  var refArr = [], // Reference point array
      refName = '', // Reference point name
      idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refArr[idx] = addRadiobutton(refPnl, j, i, CFG.refHint[idx]);
      idx++;
    }
  }
  refArr[4].value = true; // 4 - center. Range 0-8

  // Bounds
  var bndsPnl = win.add('panel', undefined, 'Object dimensions');
      bndsPnl.orientation = 'row';
      bndsPnl.alignment = 'fill';
      bndsPnl.margins = [10, 15, 10, 10];

  var geoRb = bndsPnl.add('radiobutton', undefined, 'Geometric bounds');
      geoRb.helpTip = 'The bounds of the object\nexcluding stroke width and effects';
      geoRb.value = true;
  var visRb = bndsPnl.add('radiobutton', undefined, 'Visible bounds (stroke & effects)');
      visRb.helpTip = 'The visible bounds of the item\nincluding stroke width and effects';

  // Buttons
  var footer = win.add('group');
      footer.alignment = 'fill';

  var copyright = footer.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github'),
      cancel, ok;

  if (CFG.isMac) {
    cancel = footer.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = footer.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = footer.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = footer.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  loadSettings(SETTINGS);

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    deselectGuides(app.selection);

    var doc = app.activeDocument,
        docSel = get(app.selection)
        tmpSel = [];

    CFG.isSel = selToPrntRb.value || selToActRb.value;
    CFG.isGBnds = geoRb.value;
    CFG.refName = getPointName();

    if (selToPrntRb.value) {
      tmpSel = processItems(doc, CFG);
    } else if (selToActRb.value) {
      tmpSel = docSel;
    }

    if (tmpSel.length || toAllRb.value) {
      var counter = tmpSel.length;

      removeNote(tmpSel, CFG.note); // Clear after previous run
      addNote(tmpSel, CFG.note);
    
      try {
        if (selToActRb.value) {
          var actIdx = doc.artboards.getActiveArtboardIndex();
          processAb(doc, actIdx, false, CFG);
        } else {
          for (var i = 0, len = doc.artboards.length; i < len; i++) {
            if (CFG.isSel && counter == 0) break; // Selection has been processed
            counter -= processAb(doc, i, true, CFG);
          }
        }
      } catch (err) {
        alert(err + ': on line ' + err.line, 'Script Error', true);
      }
    
      removeNote(tmpSel, CFG.note);
    }

    app.selection = docSel;
    saveSettings(SETTINGS);

    win.close();
  }

  // Get reference point name by index of active radiobutton
  function getPointName() {
    var str = CFG.refHint[4];
    for (var j = 0; j < refPnl.children.length; j++) {
      if (refPnl.children[j].value) {
        str = CFG.refHint[j];
        break;
      }
    }
    return str.replace(/\s+/g, '').toUpperCase();
  }

  // Save UI options to file
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.target = selToPrntRb.value ? 0 : (selToActRb.value ? 1 : 2);
    for (var i = 0, len = refPnl.children.length; i < len; i++) {
      if (refPnl.children[i].value) {
        pref.point = i;
        break;
      }
      pref.point = 4;
    }
    pref.bounds = geoRb.value ? 0 : 1;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  // Load options from file
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var pref = new Function('return ' + json)();
        f.close();
        if (typeof pref != 'undefined') {
          tgtPnl.children[pref.target].value = true;
          if (!isSelExists) toAllRb.value = true;
          bndsPnl.children[pref.bounds].value = true;
          refPnl.children[pref.point].value = true;
        }
      } catch (e) {}
    }
  }

  win.center();
  win.show();
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
          alert('Few objects are selected\nPlease, select at least one object and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

// Generate radiobutton
function addRadiobutton(place, x, y, info) {
  var rb = place.add('radiobutton', undefined, x),
      step = 30, x0 = 10, y0 = 15, d = 14;
  x = x0 + step * x;
  y = y0 + step * y;
  rb.bounds = [x, y, x + d, y + d];
  rb.helpTip = info;
  return rb;
}

// Convert collection into standard Array
function get(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    out.push(coll[i]);
  }
  return out;
}

// Get paths from selection
function deselectGuides(arr) {
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) {
      deselectGuides(item.pageItems);
    } else if ((item.hasOwnProperty('guides') && item.guides)
      || (item.typename === 'CompoundPathItem' && item.pathItems.length && item.pathItems[0].guides)) {
      item.selected = false;
    }
  }
}

// Process objects by their center coordinates
function processItems(doc, params) {
  var sel = get(app.selection);

  for (var i = 0; i < sel.length; i++) {
    var vBnds = getVisibleBounds(sel[i], 'visibleBounds'),
        center = [(vBnds[2] + vBnds[0]) / 2,
                  (vBnds[3] + vBnds[1]) / 2];

    for (var j = 0; j < doc.artboards.length; j++) {
      doc.artboards.setActiveArtboardIndex(j);
      var abBnds = doc.artboards[j].artboardRect;
      if (isInsideRect(center, abBnds)) {
        alignToArtboard(sel[i], abBnds, params.refName, params.isGBnds);
        sel.splice(i, 1);
        i--;
        break;
      }
    }
  }

  return sel;
}

// Add custom note to objects
function addNote(arr, key) {
  for (var i = 0, len = arr.length; i < len; i++) {
    arr[i].note += key;
  }
}

// Remove custom note from objects
function removeNote(arr, key) {
  var regex = new RegExp(key, 'gi');
  for (var i = 0, len = arr.length; i < len; i++) {
    try {
      arr[i].note = arr[i].note.replace(regex, '');
    } catch (err) {
      alert(err + ': on line ' + err.line, 'Script Error', true);
    }
  }
}

// Process artboard contents
function processAb(doc, idx, toAllRb, params) {
  var regex = new RegExp(params.note, 'gi'),
      abBnds = doc.artboards[idx].artboardRect,
      counter = 0;

  if (toAllRb) {
    app.executeMenuCommand('deselectall');
    doc.artboards.setActiveArtboardIndex(idx);
    doc.selectObjectsOnActiveArtboard();
  }
  if (!app.selection.length) return;

  var selItems = app.selection;
  if (params.isSel) {
    for (var j = selItems.length - 1; j >= 0; j--) {
      var item = selItems[j];
      if (regex.test(item.note)) {
        alignToArtboard(item, abBnds, params.refName, params.isGBnds);
        counter++;
      }
    }
  } else {
    alignAllContent(abBnds, params.refName, params.isGBnds);
  }

  return counter;
}

// Align all content as a group on the artboard
function alignAllContent(abBnds, ref, isGBnds) {
  var arr = [],
      sel = get(app.selection),
      lay = sel[0].layer;

  // Grouping for better performance
  var grp = sel[0].layer.groupItems.add();
  for (var i = sel.length - 1; i >= 0; i--) {
    var path = lay.pathItems.add();
    path.move(sel[i], ElementPlacement.PLACEBEFORE);
    arr.push(path);
    sel[i].move(grp, ElementPlacement.PLACEATEND);
  }

  alignToArtboard(grp, abBnds, ref, isGBnds);

  // Return objects to places
  for (var j = 0, len = grp.pageItems.length; j < len; j++) {
    grp.pageItems[j].move(arr[j], ElementPlacement.PLACEBEFORE);
    arr[j].move(grp, ElementPlacement.PLACEATBEGINNING);
  }

  grp.remove();
}

// Align object to artboard reference point
function alignToArtboard(item, abBnds, ref, isGBnds) {
  var data = getMoveData(item, abBnds, isGBnds),
      delta = [];

  switch (ref) {
    case 'TOPLEFT':
      delta = [data.left, data.top];
      break;
    case 'TOP':
      delta = [data.centerX, data.top];
      break;
    case 'TOPRIGHT':
      delta = [data.right, data.top];
      break;
    case 'LEFT':
      delta = [data.left, data.centerY];
      break;
    case 'CENTER':
      delta = [data.centerX, data.centerY];
      break;
    case 'RIGHT':
      delta = [data.right, data.centerY];
      break;
    case 'BOTTOMLEFT':
      delta = [data.left, data.bottom];
      break;
    case 'BOTTOM':
      delta = [data.centerX, data.bottom];
      break;
    case 'BOTTOMRIGHT':
      delta = [data.right, data.bottom];
      break;
    default:
      break;
  }

  item.translate(delta[0], delta[1]);
}

// Get a position relative to the artboard
function getMoveData(item, abBnds, isGBnds) {
  var abW = Math.abs(abBnds[2] - abBnds[0]),
      abH = Math.abs(abBnds[1] - abBnds[3]),
      type = isGBnds ? 'geometricBounds' : 'visibleBounds',
      vBnds, w, h, l, r, t, b, cx, cy;

  if (item.typename === 'GroupItem' || item.typename === 'TextFrame') {
    var dup = item.duplicate();
    app.executeMenuCommand('deselectall');
    app.selection = dup;
    outlineText(dup.pageItems ? dup.pageItems : [dup]);
    dup = app.selection[0];
    vBnds = getVisibleBounds(dup, type);
    app.executeMenuCommand('deselectall');
    dup.remove();
  } else {
    vBnds = getVisibleBounds(item, type);
  }

  w = Math.abs(vBnds[2] - vBnds[0]);
  h = Math.abs(vBnds[3] - vBnds[1]);
  l = abBnds[0] - vBnds[0];
  r = l + abW - w;
  t = abBnds[1] - vBnds[1];
  b = t - abH + h;
  cx = l + (abW - w) / 2;
  cy = t + (h - abH) / 2;

  return {
    left: l,
    top: t,
    right: r,
    bottom: b,
    centerX: cx,
    centerY: cy,
  };
}

// Create outlines
function outlineText(coll) {
  for (var i = coll.length - 1; i >= 0; i--) {
    var item = coll[i];
    if (item.typename === 'TextFrame') {
      item.createOutline();
    } else if (item.typename === 'GroupItem') {
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

// Check if point is inside rectangle
function isInsideRect(p, rect) {
  return p[0] > rect[0] && p[0] < rect[2] && p[1] < rect[1] && p[1] > rect[3];
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
} catch (err) {}