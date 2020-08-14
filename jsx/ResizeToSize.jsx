/*
  ResizeToSize.jsx for Adobe Illustrator
  Description: Scales each selected objects to a given value
  Date: March, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ==========================================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Versions:
   0.1 Initial version
   0.2 Added menu for side selection
   0.3 Added additional settings 
   0.4 Correct resize Clipping Mask. Added access key shortcuts
   0.5 Added dimensions bounds.
   0.6 Added live preview (Shift+P).
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  Tested with Adobe Illustrator CC 2019 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

var SCRIPT_TITLE = "ResizeToSize";
var SCRIPT_VERSION = "v.0.6";

function main () {
  var doc = app.activeDocument;
  var isUndo = false;
  var scaleRatio, scaleX, scaleY; // Scale factor
  var side = '';
  var refPointNum = 9;
  var refPointArr = new Array(refPointNum); // Reference point array
  var refPointCurr = ''; // Reference point name
  // Default values for all state of Reference Point
  var refPointVal = [
        false, false, false,
        false, true, false,
        false, false, false ];
  var refPointHint = [ 
        'Top Left', 'Top', 'Top Right',
        'Left', 'Center', 'Right',
        'Bottom Left', 'Bottom', 'Bottom Right' ];

  // Create Main Window
  var dialog = new Window('dialog', SCRIPT_TITLE + ' ' + SCRIPT_VERSION);
      dialog.orientation = 'column';
   
  var sizeGr = dialog.add('group');
      sizeGr.orientation = 'row';
      sizeGr.add ('statictext', undefined, 'Required size, ' + getDocUnit() + ':');

  var sizeStr = sizeGr.add('edittext', undefined, '100');
      sizeStr.characters = 8;
      sizeStr.active = true;

  var bndsPnl = dialog.add('panel', undefined, 'Item dimensions bounds');
      bndsPnl.orientation = 'row';
      bndsPnl.alignChildren = 'left';
      bndsPnl.margins = [10,20,10,10];
  var vbRadio = bndsPnl.add('radiobutton', undefined, '\u0056\u0332isible'); // Unicode V̲
      vbRadio.value = true;
      vbRadio.helpTip = 'Object\u0027s bounding box, \nincluding any stroke widths.' +
                        '\nCheck Preferences > General >\nUse Preview Bounds,' +
                        '\nView > Show bounding box';
  var gbRadio = bndsPnl.add('radiobutton', undefined, '\u0047\u0332eometric'); // Unicode G̲
      gbRadio.helpTip = 'Object\u0027s bounding box, excluding \nstroke width. ' +
                        'Uncheck Preferences > \nGeneral > Use Preview Bounds.';

  var sides = dialog.add('group');
      sides.orientation = 'row';
      sides.alignChildren = 'left';
  var sidePnl = sides.add('panel', undefined, 'Scaling side');
      sidePnl.orientation = 'column';
      sidePnl.alignChildren = 'left';
      sidePnl.margins = [10,20,10,10];
  var lRadio = sidePnl.add('radiobutton', undefined, '\u004c\u0332arger side'); // Unicode L̲
      lRadio.value = true;
  var wRadio = sidePnl.add('radiobutton', undefined, '\u0057\u0332idth'); // Unicode W̲
  var hRadio = sidePnl.add('radiobutton', undefined, '\u0048\u0332eight'); // Unicode H̲

  var refPointPnl = sides.add('panel', undefined, 'Reference point');
      refPointPnl.orientation = 'row';
      refPointPnl.bounds = [0, 0 , 116, 116];

  // Create Reference point matrix 3x3
  var step = 30,
      x0 = 20,
      y0 = 20,
      idx = 0;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      refPointArr[idx] = addRadio(refPointPnl, x0 + step * j, y0 + step * i, refPointVal[idx], refPointHint[idx]);
      idx++;
    };
  };
    
  var settings = dialog.add('panel', undefined, 'Additional scale');
      settings.orientation = 'row';
      settings.alignChildren = ['left','top']; 
      settings.margins = [10,20,10,10];

  var gr1 = settings.add('group');
      gr1.orientation = 'column';
      gr1.alignChildren = ['left', 'center'];    
      gr1.margins = 0;
  var isUniform = gr1.add('checkbox', undefined, '\u0055\u0332niform'); // Unicode U̲
      isUniform.helpTip = 'Scale proportionally';
      isUniform.value = true;  
  if (!isOldAI()) {
    var isCorner = gr1.add('checkbox', undefined, '\u0043\u0332orners'); // Unicode C̲
        isCorner.helpTip = 'Only works with Live Shape';
        isCorner.value = true;
  }
  var isStroke = gr1.add('checkbox', undefined, '\u0053\u0332trokes \u0026 Effects'); // Unicode S̲
      isStroke.value = true;
  
  var gr2 = settings.add('group');
      gr2.orientation = 'column';
      gr2.alignChildren = ['left', 'center'];    
      gr2.margins = 0;       
  var isFill = gr2.add('checkbox', undefined, '\u0046\u0332ill Pattern'); // Unicode F̲
      isFill.value = true;
  var isStrokePatt = gr2.add('checkbox', undefined, 'Stroke Pa\u0074\u0332tern'); // Unicode t̲
      isStrokePatt.value = true;

  var hintAlt = dialog.add('statictext', undefined, 'Quick access with Alt + underlined key/digit');
      hintAlt.justify = 'center';
      hintAlt.enabled = false;  
    
  var buttons = dialog.add('group');
      buttons.alignChildren = ['fill', 'fill'];
  var cancel = buttons.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add('button', undefined, 'OK',  { name: 'ok' });

  var isPreview = dialog.add('checkbox', undefined, '\u0050\u0332review'); // Unicode P̲
  
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin, github.com/creold');
  copyright.justify = 'center';
  copyright.enabled = false;

  // Begin access key shortcut
  sizeStr.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      kd.preventDefault();
    };
  });

  dialog.addEventListener('keydown', function(kd) {
    if (kd.altKey) {
      var key = kd.keyName;
      if (key.match(/[1-9]/)) {
        refPointArr[(1 * key) - 1].notify();
      };
      if (key.match(/V/)) vbRadio.notify();
      if (key.match(/G/)) gbRadio.notify();
      if (key.match(/L/)) lRadio.notify();
      if (key.match(/W/)) wRadio.notify();
      if (key.match(/H/)) hRadio.notify();
      if (key.match(/U/)) isUniform.notify();
      if (!isOldAI() && key.match(/C/)) isCorner.notify();
      if (key.match(/F/)) isFill.notify();
      if (key.match(/T/)) isStrokePatt.notify();
      if (key.match(/S/)) isStroke.notify();
      if (key.match(/P/)) isPreview.notify();
    };
  });
  // End access key shortcut

  // Begin event listener for isPreview
  isPreview.onClick = function(e) {
    previewStart();
  }

  sizeStr.onChanging = function(e) {
    previewStart();
  }
  for (var i = 0; i < bndsPnl.children.length; i++) {
    bndsPnl.children[i].onClick = function(e) {
      previewStart();
    };
  }  
  for (var i = 0; i < refPointArr.length; i++) {
    refPointArr[i].onClick = function(e) {
      previewStart();
    };
  }

  for (var i = 0; i < sidePnl.children.length; i++) {
    sidePnl.children[i].onClick = function(e) {
      previewStart();
    };
  }

  for (var i = 0; i < settings.children.length; i++) {
    var tmp = settings.children[i];
    for (var j = 0; j < tmp.children.length; j++) {
      tmp.children[j].onClick = function(e) {
        previewStart();
      };
    }
  }
  // End event listener for isPreview
  
  cancel.onClick = function () {
    dialog.close();
  }
  
  ok.onClick = function (e) {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    dialog.close();
  };
    
  function previewStart() {
    if (isPreview.value) {
      if (isUndo) { 
        app.undo();
      } else {
        isUndo = true;
      }
      start();
      app.redraw();
    } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      } 
  }

  function start() {
    var _size = convertDecimalPoint(sizeStr.text);

    if (isNaN(1 * _size)) {
      alert('Please enter a numeric value.');
      return;
    }
    
    var newSize = convertUnits(_size + getDocUnit(), 'px');

    // Adobe Illustrator CS6 not support Live Shape and doScript
    if (!isOldAI()) {
      // Generate Action
      var actionSetName = 'Resize',
          actionName = 'Scale-Corners',
          actionPath = Folder.myDocuments;

      var actionStr = 
        ['/version 3',
        '/name [' + actionSetName.length + ' ' + ascii2Hex(actionSetName) + ']',
        '/actionCount 1',
        '/action-1 {',
        '/name [' + actionName.length + ' ' + ascii2Hex(actionName) + ']',
        '    /eventCount 1',
        '    /event-1 {',
        '        /internalName (ai_liveshapes)',
        '        /parameterCount 1',
        '        /parameter-1 {',
        '            /key 1933800046',
        '            /type (boolean)',
        '            /value ',
                      isCorner.value ? 1 : 0,
        '        }',
        '    }',
        '}'].join('');

      createAction(actionStr, actionSetName, actionPath);
      app.doScript(actionName, actionSetName);
      app.unloadAction(actionSetName, '');
    }

    // Set transformation side key
    for (var i = 0; i < sidePnl.children.length; i++) {
      if (sidePnl.children[i].value) side = sidePnl.children[i].text.slice(0, 1);
    }

    // Set scaleAbout value
    for (var j = 0; j < refPointPnl.children.length; j++) {
      if (refPointPnl.children[j].value == true) {
        refPointCurr = (refPointHint[j]).replace(/\s+/g, '').toUpperCase();
      }
    }

    for (var i = 0; i < selection.length; i++) {
      var obj = selection[i];
      var isWidth = getSize(obj, side, vbRadio.value).check;
      var count = 0;
      while (getSize(obj, side, vbRadio.value).val.toFixed(4) != newSize.toFixed(4)) {
        count++;
        scaleX = getRatio(obj, side, newSize, isWidth, vbRadio.value, isUniform.value).x;
        scaleY = getRatio(obj, side, newSize, isWidth, vbRadio.value, isUniform.value).y;
        scaleRatio = getRatio(obj, side, newSize, isWidth, vbRadio.value, isUniform.value).r;
        obj.resize(
          scaleX, // x
          scaleY, // y
          true, // changePositions  
          isFill.value, // changeFillPatterns
          true, // changeFillGradients
          isStrokePatt.value, // changeStrokePattern
          isStroke.value ? scaleRatio : 100, // changeLineWidths
          Transformation[refPointCurr] // scaleAbout
          );
        if (count == 20) break; // loop insurance
      }
    }
  }
  
  dialog.onClose = function () {
    if (isUndo) {
      app.undo();
      app.redraw();
      isUndo = false;
    }
    return true;
  }

  if (selection.length > 0) {
    dialog.show();
  } else {
    alert('Please select at least 1 object and try again.');
  }
}

// Radiobuttons 
function addRadio(place, x, y, val, info) {
  var theRadio = place.add('radiobutton', undefined, x);
  var d = 14;
  theRadio.bounds = [x, y, x+d, y+d];
  theRadio.value = val;
  theRadio.helpTip = info;
  return theRadio;
};

// Get scale ratio
function getRatio(item, side, size, isW, isBnds, uniform){
  var scaleX, scaleY;
  var ratio = 100 / (getSize(item, side, isBnds).val / size);
  if (!uniform) {
    switch (side) {
      case 'L':
        if (isW) {
          scaleX = ratio = 100 / (getSize(item, 'W', isBnds).val / size);
          scaleY = 100;
        } else {
          scaleX = 100;
          scaleY = ratio = 100 / (getSize(item, 'H', isBnds).val / size);
        }
        break;
      case 'W':
        scaleX = ratio;
        scaleY = 100;
        break;
      case 'H':
        scaleX = 100;
        scaleY = ratio;
        break;
    }
  } else {
    scaleX = scaleY = ratio;
  }
  return { 'x': scaleX, 'y': scaleY, 'r': ratio };
}

// Get current item size
function getSize(item, side, isBnds) {
  var itemB, itemBW, itemBH;
  var check = true; // width > heigth
  var currSize; 
  if ( item.typename == 'GroupItem' && item.clipped ) {
    for (var i = 0; i < item.pathItems.length; i++) {
      var clipItem = item.pathItems[i];
      if (clipItem.clipping) {
        isBnds ? itemB = clipItem.visibleBounds : itemB = clipItem.geometricBounds;
      }
    }
  } else {
    isBnds == true ? itemB = item.visibleBounds : itemB = item.geometricBounds;
  }
  itemBW = itemB[2] - itemB[0]; // width
  itemBH = itemB[1] - itemB[3]; // heigth
  if (itemBH >= itemBW) check = false;
  switch (side) {
    case 'L':
      currSize = itemBH > itemBW ? itemBH : itemBW;
      break;
    case 'W':
      currSize = itemBW;
      break;
    case 'H':
      currSize = itemBH;
      break;
  }
  // alert(check);
  return { 'val': currSize, 'check': check };
}

// Units conversion. Thanks for help Alexander Ladygin (https://github.com/alexander-ladygin)
function getDocUnit() {
  var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  if (unit === 'Centimeters') unit = 'cm';
  else if (unit === 'Millimeters') unit = 'mm';
  else if (unit === 'Inches') unit = 'in';
  else if (unit === 'Pixels') unit = 'px';
  else if (unit === 'Points') unit = 'pt';
  return unit;
}

function getUnits(value, def) {
  try {
    return 'px,pt,mm,cm,in,pc'.indexOf(value.slice(-2)) > -1 ? value.slice(-2) : def;
  } catch (e) {}
};

function convertUnits(value, newUnit) {
  if (value === undefined) return value;
  if (newUnit === undefined) newUnit = 'px';
  if (typeof value === 'number') value = value + 'px';
  if (typeof value === 'string') {
    var unit = getUnits(value),
        val = parseFloat(value);
    if (unit && !isNaN(val)) {
      value = val;
    } else if (!isNaN(val)) {
      value = val;
      unit = 'px';
    }
  }

  if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'mm')) {
      value = parseFloat(value) / 2.83464566929134;
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'cm')) {
      value = parseFloat(value) / (2.83464566929134 * 10);
  } else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'in')) {
      value = parseFloat(value) / 72;
  } else if ((unit === 'mm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134;
  } else if ((unit === 'mm') && (newUnit === 'cm')) {
      value = parseFloat(value) * 10;
  } else if ((unit === 'mm') && (newUnit === 'in')) {
      value = parseFloat(value) / 25.4;
  } else if ((unit === 'cm') && ((newUnit === 'px') || (bnewUnit === 'pt'))) {
      value = parseFloat(value) * 2.83464566929134 * 10;
  } else if ((unit === 'cm') && (newUnit === 'mm')) {
      value = parseFloat(value) / 10;
  } else if ((unit === 'cm') && (newUnit === 'in')) {
      value = parseFloat(value) * 2.54;
  } else if ((unit === 'in') && ((newUnit === 'px') || (newUnit === 'pt'))) {
      value = parseFloat(value) * 72;
  } else if ((unit === 'in') && (newUnit === 'mm')) {
      value = parseFloat(value) * 25.4;
  } else if ((unit === 'in') && (newUnit === 'cm')) {
      value = parseFloat(value) * 25.4;
  }
  return parseFloat(value);
}

// Set decimal separator symbol
function convertDecimalPoint(num) {
  return num.replace(',', '.');
}

function createAction (str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

function ascii2Hex(hex) {
  return hex.replace(/./g, function(a) {
    return a.charCodeAt(0).toString(16)
  });
}

// Check Adobe Illustrator version
function isOldAI(){
  var AIversion = app.version.slice(0,2);
  if (AIversion <= "16") {
    return true;
  }
  return false;
}


try {
  if (app.documents.length > 0) { main(); }
} catch (e) {}