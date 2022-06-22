/*
  ResizeToSize.jsx for Adobe Illustrator
  Description: Resize each selected object to the entered size
  Date: June, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added menu for side selection
  0.3 Added additional settings
  0.4 Correct resize Clipping Mask. Added access key shortcuts
  0.5 Added dimensions bounds
  0.6 Added live preview (Shift+P)
  0.7 Fixed live preview bug. Minor improvements
  0.7.1 Code refactoring
  0.8 Added relative resize option. Minor improvements

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
preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main () {
  var SCRIPT = {
        name: 'Resize To Size',
        version: 'v.0.8'
      },
      CFG = {
        size: 100, // Default size value
        modKey: 'Q', // User modifier key for shortcuts
        maxSize: 16383, // Illustrator canvas, px
        units: getUnits(),
        isAiCC: parseInt(version) > 16,
        isInclStroke: preferences.getBooleanPreference('includeStrokeInBounds'),
        isScaleCorner: preferences.getIntegerPreference('policyForPreservingCorners'),
        isScaleStroke: preferences.getBooleanPreference('scaleLineWeight'),
        isScalePattern: preferences.getBooleanPreference('transformPatterns'),
        refActive: preferences.getIntegerPreference('plugin/Transform/AnchorPoint'),
        refPointsHint: ['Top Left', 'Top', 'Top Right',
                        'Left', 'Center', 'Right',
                        'Bottom Left', 'Bottom', 'Bottom Right'
                      ],
        uiMargins: [10, 20, 10, 10]
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  var refPointArr = new Array(9), // Reference point array
      refPointVal = '', // Reference point name
      ratio = 0, // Resize ratio
      tmpPath,
      isUndo = false;

  // DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';

  // Size
  var sizeGrp = dialog.add('group');
      sizeGrp.alignChildren = 'fill';
      sizeGrp.add('statictext', undefined, 'Size, ' + CFG.units + ':');

  var sizeInp = sizeGrp.add('edittext', [0, 0, 70, 25], CFG.size);
      sizeInp.active = true;

  var relGrp = sizeGrp.add('group');

  var exacRb = relGrp.add('radiobutton', undefined, 'E\u0332xactly');
      exacRb.alignment = 'bottom';
      exacRb.value = true;
  var deltaRb = relGrp.add('radiobutton', undefined, 'D\u0332elta');
      deltaRb.alignment = 'bottom';

  // Item bounds
  var bndsPnl = dialog.add('panel', undefined, 'Item dimensions');
      bndsPnl.orientation = 'row';
      bndsPnl.margins = CFG.uiMargins;

  var vbRb = bndsPnl.add('radiobutton', undefined, 'V\u0332isible bounds'); // Unicode V̲
      vbRb.helpTip = 'Object\u0027s bounding box, \nincluding any stroke widths.' +
                        '\nCheck Preferences > General >\nUse Preview Bounds,' +
                        '\nView > Show bounding box';
  var gbRb = bndsPnl.add('radiobutton', undefined, 'G\u0332eometric bounds'); // Unicode G̲
      gbRb.helpTip = 'Object\u0027s bounding box, excluding \nstroke width. ' +
                        'Uncheck Preferences > \nGeneral > Use Preview Bounds.';

  CFG.isInclStroke ? vbRb.value = true : gbRb.value = true;

  // Side and reference point
  var sideGrp = dialog.add('group');
      sideGrp.spacing = 38;

  var sidePnl = sideGrp.add('panel', undefined, 'Scaling side');
      sidePnl.alignChildren = 'left';
      sidePnl.margins = CFG.uiMargins;

  var wRb = sidePnl.add('radiobutton', undefined, 'W\u0332idth'); // Unicode W̲
      wRb.value = true;
  var hRb = sidePnl.add('radiobutton', undefined, 'H\u0332eight'); // Unicode H̲
  var largeRb = sidePnl.add('radiobutton', undefined, 'L\u0332arger'); // Unicode L̲

  var refPointPnl = sideGrp.add('panel', undefined, 'Reference point');
      refPointPnl.orientation = 'row';
      refPointPnl.bounds = [0, 0 , 116, 116];

  // Create Reference point matrix 3x3
  var idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(refPointPnl, j, i, CFG.refPointsHint[idx]);
      idx++;
    };
  };
  refPointArr[CFG.refActive].value = true; // Get value from Transform panel

  // Extra options
  var prefs = dialog.add('panel', undefined, 'Extra scaling options');
      prefs.orientation = 'row';
      prefs.alignChildren = 'left';
      prefs.margins = CFG.uiMargins;
      prefs.spacing = 20;

  var prefsColOne = prefs.add('group');
      prefsColOne.orientation = 'column';
      prefsColOne.alignChildren = 'left';
      prefsColOne.alignment = 'top';

  var isUniform = prefsColOne.add('checkbox', undefined, 'U\u0332niform'); // Unicode U̲
      isUniform.helpTip = 'Scale proportionally';
      isUniform.value = true;

  if (CFG.isAiCC) { // Illustrator CS6 not support Live Shape
    var isCorner = prefsColOne.add('checkbox', undefined, 'C\u0332orners'); // Unicode C̲
        isCorner.helpTip = 'Only works with Live Shape';
        isCorner.value = (CFG.isScaleCorner == 1) ? true : false;
  }

  var isStroke = prefsColOne.add('checkbox', undefined, 'S\u0332trokes \u0026 Effects'); // Unicode S̲
      isStroke.value = CFG.isScaleStroke;

  var prefsColTwo = prefs.add('group');
      prefsColTwo.orientation = 'column';
      prefsColTwo.alignChildren = 'left';
      prefsColTwo.alignment = 'top';

  var isFillPatt = prefsColTwo.add('checkbox', undefined, 'F\u0332ill Pattern'); // Unicode F̲
      isFillPatt.value = CFG.isScalePattern;
  var isStrokePatt = prefsColTwo.add('checkbox', undefined, 'Stroke Pat\u0332tern'); // Unicode t̲
      isStrokePatt.value = CFG.isScalePattern;

  var hint = dialog.add('statictext', undefined, 'Quick access with ' + CFG.modKey + ' + underlined key/digit');
      hint.justify = 'center';
      hint.enabled = false;

  // Buttons
  var btns = dialog.add('group');
      btns.alignChildren = 'fill';

  var isPreview = btns.add('checkbox', undefined, 'P\u0332review'); // Unicode P̲
      isPreview.alignment = 'center';
      isPreview.value = false;

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'OK',  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  loadSettings();

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Shortcut listener
  var keysList = new RegExp('^[' + CFG.modKey + 'EDVGLWHUCFTSP1-9]$', 'i');
  var keys = {};

  // Block size input
  sizeInp.addEventListener('keydown', function(kd) {
    if (kd.keyName && kd.keyName.match(CFG.modKey))
      keys[kd.keyName] = true;
    if (keys[CFG.modKey])
      kd.preventDefault(); 
  });

  dialog.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (!key) return; // non-English layout
    if (keysList.test(key)) keys[kd.keyName] = true;
    
    if (keys[CFG.modKey]) {
      for (var k in keys) {
        if (k == 'E') exacRb.notify();
        if (k == 'D') deltaRb.notify();
        if (k == 'V') vbRb.notify();
        if (k.match(/[1-9]/)) refPointArr[k * 1 - 1].notify();
        if (k == 'V') vbRb.notify();
        if (k == 'G') gbRb.notify();
        if (k == 'W') wRb.notify();
        if (k == 'H') hRb.notify();
        if (k == 'L') largeRb.notify();
        if (k == 'U') isUniform.notify();
        if (k == 'C' && isCorner) isCorner.notify();
        if (k == 'F') isFillPatt.notify();
        if (k == 'T') isStrokePatt.notify();
        if (k == 'S') isStroke.notify();
        if (k == 'P') isPreview.notify();
      }
    }
  });

  dialog.addEventListener('keyup', function(kd) {
    var key = kd.keyName;
    if (key && keysList.test(key)) delete keys[kd.keyName];
  });

  // Preview
  if (isPreview.value) preview();
  sizeInp.onChanging = preview;
  isPreview.onClick = preview;

  // Change relative size
  getItems(relGrp.children).forEach(function (e) {
    e.onClick = preview;
  });

  // Change item bounds
  getItems(bndsPnl.children).forEach(function (e) {
    e.onClick = preview;
  });

  // Change reference point
  getItems(refPointArr).forEach(function (e) {
    e.onClick = preview;
  });

  // Change scaling side
  getItems(sidePnl.children).forEach(function (e) {
    e.onClick = preview;
  });

  // Change extra options
  getItems(prefs.children[0].children).forEach(function (e) {
    e.onClick = preview;
  });

  getItems(prefs.children[1].children).forEach(function (e) {
    e.onClick = preview;
  });
  // End preview

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  dialog.onClose = function () {
    try {  
      if (isUndo) {
        undo();
        redraw();
      }
      tmpPath.remove();
    } catch (e) {}
    // Restore Scale Corners pref
    preferences.setIntegerPreference('policyForPreservingCorners', CFG.isScaleCorner);
    saveSettings();
  }

  // Resize preview
  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) undo();
        else isUndo = true;
        start();
        redraw();
      } else if (isUndo) {
          undo();
          redraw();
          isUndo = false;
        }
    } catch (e) {}
  }

  // Resize selection
  function start() {
    var items = getItems(selection),
        val = convertToNum(sizeInp.text, CFG.size),
        side = 'W',
        failItems = [];

    if (val == 0) val = CFG.size;
    sizeInp.text = val;

    // Check size limit
    var pxVal = convertUnits(val, CFG.units, 'px');
    if (pxVal > CFG.maxSize) {
      pxVal = CFG.maxSize;
      sizeInp.text = convertUnits(CFG.maxSize, 'px', CFG.units);
    }

    // Set transformation side key
    getItems(sidePnl.children).forEach(function (e) {
      if (e.value) {
        side = e.text.slice(0, 1);
        return;
      }
    });

    // Set the point to use as anchor, to transform about
    getItems(refPointPnl.children).forEach(function (e, i) {
      if (e.value) {
        refPointVal = CFG.refPointsHint[i].replace(/\s+/g, '').toUpperCase();
        return;
      }
    });

    if (CFG.isAiCC) {
      preferences.setIntegerPreference('policyForPreservingCorners', isCorner.value ? 1 : 2);
    }

    tmpPath = selection[0].layer.pathItems.add();
    tmpPath.name = 'ToRemove';

    items.forEach(function (e, i) {
      try {
        var orig = getSize(e, side, vbRb.value),
            isWidth = orig.isW,
            stop = 0;

        while ( getSize(e, side, vbRb.value).val.toFixed(4) !== (pxVal + (exacRb.value ? 0 : orig.val)).toFixed(4) ) {
          stop++;
          ratio = getRatio(e, pxVal, side, isWidth, exacRb.value, vbRb.value, isUniform.value);
          e.resize(
            ratio.x, // x
            ratio.y, // y
            true, // changePositions
            isFillPatt.value, // changeFillPatterns
            true, // changeFillGradients
            isStrokePatt.value, // changeStrokePattern
            isStroke.value ? ratio.r : 100, // changeLineWidths
            Transformation[refPointVal] // scaleAbout
            );
          if (stop == 10) break; // Fix infinity looping
        }
      } catch (err) {
        failItems.push(e);
      }
    });

    return failItems;
  }

  function okClick() {
    if (isPreview.value && isUndo) undo();
    var result = start();
    if (result.length) {
      var isShowFail = confirm('Warning\nSome objects could not be resized. Select them?');
      if (isShowFail) selection = result;
    }
    isUndo = false;
    dialog.close();
  }

  // Save input data to file
  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.size = sizeInp.text;
    pref.exac = relGrp.children[0].value ? 0 : 1;
    pref.bounds = bndsPnl.children[0].value ? 0 : 1;
    getItems(sidePnl.children).forEach(function (e, i) {
      if (e.value) pref.side = i;
    });
    getItems(refPointPnl.children).forEach(function (e, i) {
      if (e.value) pref.point = i;
    });
    pref.uniform = isUniform.value;
    pref.corner = isCorner.value;
    pref.fill = isFillPatt.value;
    pref.stroke = isStrokePatt.value;
    pref.width = isStroke.value;
    pref.preview = isPreview.value;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  // Load input data from file
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
          sizeInp.text = pref.size;
          relGrp.children[pref.exac].value = true;
          bndsPnl.children[pref.bounds].value = true;
          sidePnl.children[pref.side].value = true;
          refPointPnl.children[pref.point].value = true;
          isUniform.value = pref.uniform;
          isCorner.value = pref.corner;
          isFillPatt.value = pref.fill;
          isStrokePatt.value = pref.stroke;
          isStroke.value = pref.width;
          isPreview.value = pref.preview;
        }
      } catch (e) {}
    }
  }

  dialog.center();
  dialog.show();
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

// Generate radiobutton
function addRadio(place, x, y, info) {
  var rb = place.add('radiobutton', undefined, x),
      step = 30,
      x0 = y0 = 20,
      d = 14; // Padding

  x = x0 + step * x;
  y = y0 + step * y;
  rb.bounds = [x, y, x + d, y + d];
  rb.helpTip = info;

  return rb;
}

// Get items array
function getItems(collection) {
  var out = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    out.push(collection[i]);
  }
  return out;
}

// Polyfill forEach() for Array
Array.prototype.forEach = function (callback) {
  for (var i = 0; i < this.length; i++) callback(this[i], i, this);
}

// Convert any input data to a number
function convertToNum(str, def) {
  if (arguments.length == 1 || !def) def = 1;
  // Remove unnecessary characters
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  // Remove duplicate Point
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  // Remove duplicate Minus
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || str.length == 0) return parseFloat(def);
  return parseFloat(str);
}

// Convert units of measurement
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

// Get current item size
function getSize(item, side, isVB) {
  var itemB = itemBW = itemBH = 0,
      isW = true, // width > heigth
      size;

  if (isType(item, 'group') && item.clipped) {
    item = getMaskPath(item);
  }

  itemB = isVB ? item.visibleBounds : item.geometricBounds;
  itemBW = itemB[2] - itemB[0]; // width
  itemBH = itemB[1] - itemB[3]; // heigth
  if (itemBH >= itemBW) isW = false;

  switch (side) {
    case 'L':
      size = itemBH > itemBW ? itemBH : itemBW;
      break;
    case 'W':
      size = itemBW;
      break;
    case 'H':
      size = itemBH;
      break;
  }

  return { 'val': size, 'isW': isW };
}

// Get clipping mask
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) {
      return currItem;
    }
  }
}

// Check clipping mask
function isClippingPath(item) {
  var clipText = (isType(item, 'text') &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (isType(item, 'compound') && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

// Get resize ratio
function getRatio(item, newSize, side, isW, isExac, isVB, isUni) {
  var ratio = {},
      wSize = getSize(item, 'W', isVB).val,
      hSize = getSize(item, 'H', isVB).val,
      size = getSize(item, side, isVB).val;

  ratio.x = 100 * (newSize + (isExac ? 0 : wSize)) / wSize;
  ratio.y = 100 * (newSize + (isExac ? 0 : hSize)) / hSize;
  ratio.r = 100 * (newSize + (isExac ? 0 : size)) / size;

  if (!isUni) {
    switch (side) {
      case 'L':
        if (isW) {
          ratio.y = 100;
          ratio.r = ratio.x;
        } else {
          ratio.x = 100;
          ratio.r = ratio.y;
        }
        break;
      case 'W':
        ratio.x = ratio.r;
        ratio.y = 100;
        break;
      case 'H':
        ratio.x = 100;
        ratio.y = ratio.r;
        break;
    }
  } else {
    ratio.x = ratio.r;
    ratio.y = ratio.r;
  }

  return ratio;
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