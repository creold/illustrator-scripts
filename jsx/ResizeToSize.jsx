// ResizeToSize.jsx for Adobe Illustrator
// Description: Scales each selected objects to a given value
// Date: March, 2020
// Author: Sergey Osokin, email: hi@sergosokin.ru
// ==========================================================================================
// Installation:
// 1. Place script file in:
//  Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//  Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//  Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// ============================================================================
// Versions:
//  0.1 Initial version
//  0.2 Added menu for side selection
// ============================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2019 (Mac/Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ============================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ============================================================================
// Check other author's scripts: https://github.com/creold

#target illustrator

function main () {
  var doc = app.activeDocument;
  var mySel = selection;
  var ratio;

  // Create Main Window
  var dialog = new Window('dialog', 'ResizeToSize 0.2');
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'fill'];
    
  var sizePnl = dialog.add('group');
      sizePnl.orientation = 'row';
      sizePnl.add ('statictext', undefined, 'Required size, ' + getDocUnit() + ':');  

  var sizeTxt = sizePnl.add ('edittext', undefined, '100');
      sizeTxt.characters = 8;
      sizeTxt.active = true;

  dialog.add ('statictext', undefined, 'Scaling side');  
  var sideOption = dialog.add('group');
      sideOption.orientation = 'row';
  var lSideRadio = sideOption.add('radiobutton', undefined, 'Larger side');
      lSideRadio.value = true;
  var wSideRadio = sideOption.add('radiobutton', undefined, 'Width');
  var hSideRadio = sideOption.add('radiobutton', undefined, 'Height');
    
  var option = dialog.add('group');
      option.orientation = 'column';
      option.alignChildren = 'left';
  var chkCorner = option.add('checkbox', undefined, 'Scale Live Corners');
      chkCorner.helpTip = 'Only works with Live Shape';
      chkCorner.value = true;
  var chkStroke = option.add('checkbox', undefined, 'Scale Strokes & Effects');
      chkStroke.value = true;
    
  var buttons = dialog.add ('group');
      buttons.alignChildren = ['fill', 'fill'];
  var cancel = buttons.add ('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = buttons.add ('button', undefined, 'OK',  { name: 'ok' });
  
  cancel.onClick = function () {
    dialog.close();
  }
  
  ok.onClick = okClick;

  if (mySel.length > 0) { 
    dialog.show(); 
  } else {
    alert('Please select at least 1 object and try again.');
  }

  function okClick() {
    var nSize = parseLocalNum(sizeTxt.text);

    if (isNaN(Number(nSize))) {
      alert('Please enter a numeric value.');
      return;
    }
    
    var newSize = convertUnits(nSize + getDocUnit(), 'px');

    // Generate Action
    var setName = 'Resize',
        actionName = 'Scale-Corners',
        actionPath = Folder.temp;

    var actionStr = 
      ['/version 3',
      '/name [' + setName.length + ' ' + ascii2Hex(setName) + ']',
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
                    chkCorner.value ? 1 : 0,
      '        }',
      '    }',
      '}'].join('');

    createAction(actionStr, setName, actionPath);
    app.doScript(actionName, setName);
    app.unloadAction(setName, '');

    var _size = '';
    if (lSideRadio.value) {
      _size = 'large';
    } else if (wSideRadio.value) {
      _size = 'width';
    } else {
      _size = 'height';
    }

    for (var i = 0; i < mySel.length; i++) {
      var obj = mySel[i];
      var count = 0;
      while (getSize(obj, _size).toFixed(4) != newSize.toFixed(4)) {
        count++;
        ratio = 100 / (getSize(obj, _size) / newSize);
        obj.resize(ratio, ratio, true, true, true, true, chkStroke.value ? ratio : 100);
        if (count == 20) break; // loop insurance
      }
    }
    dialog.close();
  }
}

function getSize(item, option) {
  var itemB = item.visibleBounds,
      itemBW = itemB[2] - itemB[0], // width
      itemBH = itemB[1] - itemB[3]; // heigth
  var currSize = itemBH > itemBW ? itemBH : itemBW; 
  switch (option) {
    case 'large':
      break;
    case 'width':
      currSize = itemBW;
      break;
    case 'height':
      currSize = itemBH;
      break;
  }
  return currSize;
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
function parseLocalNum(num) {
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
  return hex.replace(/./g, function (a) { return a.charCodeAt(0).toString(16) });
}

try {
  if (app.documents.length > 0) { main(); }
} catch (e) {}