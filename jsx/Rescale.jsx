// Rescale.jsx for Adobe Illustrator
// Description: Automatic scaling of objects to the desired size. 
//              If you draw a line on top with the length or height of the desired object, 
//              'Old Size' will be filled automatically.
// Date: November, 2019
// Author: Nick Grabowski, @Grabovvski
// Co-author: Sergey Osokin, email: hi@sergosokin.ru
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > Rescale
// ============================================================================

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Global variables
var scriptName = 'Rescale 0.1';

function main () {
  if (app.documents.length < 1) {
    alert('Please open a document and try again.');
    return;
  }

  var doc = app.activeDocument;
  
  // Create Main Window
  var dialog = new Window('dialog', scriptName);
  dialog.orientation = 'column', 'alignChildren: "right"';

  var oldSizePnl = dialog.add('group {alignment: "right"}');
  oldSizePnl.orientation = 'row';
  oldSizePnl.add ('statictext', undefined, 'Old size, ' + getDocUnit() + ':');    

  var oSizeTxt = oldSizePnl.add ('edittext', undefined);
  oSizeTxt.characters = 6;
  oSizeTxt.active = true;
      
  var newSizePnl = dialog.add('group {alignment: "right"}');
  newSizePnl.orientation = 'row';
  newSizePnl.add ('statictext', undefined, 'New size, ' + getDocUnit() + ':');    

  var nSizeTxt = newSizePnl.add ('edittext', undefined);
  nSizeTxt.characters = 6;

  var chkRmv = dialog.add('checkbox', undefined, 'Remove top path');
      
  var buttons = dialog.add ('group');
  var ok = buttons.add ('button', undefined, 'OK',  { name: 'ok' });
  var cancel = buttons.add ('button', undefined, 'Cancel', { name: 'cancel' });

  ok.onClick = okClick;

  cancel.onClick = function () {
    dialog.close();
  }

  if (doc.selection.length == 0) {
    alert('Please select at least 1 object and try again.');
    return;
  } else {
    var keyPath = doc.selection[0];
    if (keyPath.typename === 'PathItem' && !keyPath.closed) {
      var keyPathLength = keyPath.length; // If you use a straight line to measure
      oSizeTxt.text = (convertUnits(keyPathLength, getDocUnit())).toFixed(3);
    } else {
      chkRmv.enabled = false;
      chkRmv.value = false;
    }
    dialog.show();
  }

  // Main function
  function okClick() {
    try {
      if (isNaN(Number(oSizeTxt.text)) || isNaN(Number(nSizeTxt.text))) {
        alert('Please enter a numeric value.');
        return;
      }

      var oldSize = convertUnits(parseFloat(oSizeTxt.text), 'px');
      var newSize = convertUnits(parseFloat(nSizeTxt.text), 'px');
      var ratio = (newSize / oldSize)*100;
      // When old and new size are equal
      if (ratio == 100) {
        dialog.close();
        return;
      }

      // Grouping for better performance. Thanks for help @moodyallen
      var items = doc.selection;
      var tmpArray = [];
      var aLayer = doc.activeLayer;
      var selGroup = aLayer.groupItems.add();
      for (var i = 0, tmpItem; i < items.length; i++) {
          tmpItem = aLayer.pathItems.add();
          tmpItem.move(items[i], ElementPlacement.PLACEBEFORE);
          tmpArray.push(tmpItem);
          items[i].move(selGroup, ElementPlacement.PLACEATEND);
      }
      
      selGroup.resize(ratio, ratio);

      // Return objects to places
      items = selGroup.pageItems;
      for (var i = 0; i < items.length; i++) {
          items[i].move(tmpArray[i], ElementPlacement.PLACEBEFORE);
          tmpArray[i].move(selGroup, ElementPlacement.PLACEATBEGINNING);
      }
      selGroup.remove();
      selGroup = null;      
      
      if (chkRmv.enabled && chkRmv.value) {
        keyPath.remove();
      }
      dialog.close();
    } catch (e) {}
  }

  // Units conversion. Thanks for help Alexander Ladygin (https://github.com/alexander-ladygin)
  function getDocUnit() {
      var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
      switch (unit) {
          case 'Points':
              ;
          case 'Pixels':
              unit = 'px';
              break;
          case 'Millimeters':
              unit = 'mm';
              break;
          case 'Centimeters':
              unit = 'cm';
              break;
          case 'Inches':
              unit = 'in';
              break;
      }
      return unit;
  }

  function getUnits(value, def) {
      try {
          return 'px,pt,mm,cm,in,pc'.indexOf(value.slice(-2)) > -1 ? value.slice(-2) : def;
      }
      catch (e) {}
  };

  function convertUnits(value, newUnit) {
      if (value === undefined) {
        return value;
      }
      if (newUnit === undefined) {
        newUnit = 'px';
      }
      if (typeof value === 'number') {
        value = value + 'px';
      }
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
} 

// Run script
try {
  main();
} catch (e) {}