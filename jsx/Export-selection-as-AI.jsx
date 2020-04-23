// Export-selection-as-AI.jsx for Adobe Illustrator
// Description: Exports all selected objects to AI files
// Date: February, 2019
// Author: Sergey Osokin, email: hi@sergosokin.ru
// Based on Layers to SVG 0.1 by Anton Ball
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > Export-selection-as-AI
// ============================================================================
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ==========================================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2018 (Mac/Win), CC 2019 (Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ==========================================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ==========================================================================================
// Check other author's scripts: https://github.com/creold

//@target illustrator

var SCRIPT_NAME = 'Export Selection As AI',
    SCRIPT_AUTHOR = '\u00A9 sergosokin.ru';

// Main function
function main() {
  // Default variables for dialog box
  var fileName = 'temp',
      fileExt = '.ai',
      separator = '-',
      outFolder = Folder.desktop;
      uiMargin = [10,15,10,10];

  var sel = app.activeDocument.selection;

  if (sel.length < 1) {
    alert('Please select a path or group.');
    return;
  }

  // Create dialog box
  var win = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_AUTHOR);
      win.alignChildren = 'center';

  var outPnl = win.add('panel', undefined, 'Output folder');
      outPnl.orientation = 'row';
      outPnl.margins = uiMargin;
  var btnOutFolder = outPnl.add('button', undefined, 'Select');
  var lblOutFolder = outPnl.add('edittext', undefined);
      lblOutFolder.text = decodeURI(outFolder);
      lblOutFolder.characters = 20;

  var fileNameGrp = win.add('group');
  var namePnl = fileNameGrp.add('panel', undefined, 'File name prefix');
      namePnl.orientation = 'row';
      namePnl.margins = uiMargin;
  var namePrefix = namePnl.add('edittext', undefined, fileName);
      namePrefix.characters = 20;
  var separatorPnl = fileNameGrp.add('panel', undefined, 'Separator');
      separatorPnl.margins = uiMargin;
  var symbol = separatorPnl.add('edittext', undefined, separator);
      symbol.characters = 4;
      symbol.enabled = false;
  
  var prgPnl = win.add('panel', undefined, 'Progress');
      prgPnl.margins = uiMargin;
  var progBar = prgPnl.add('progressbar', [20, 15, 276, 40], 0, 100);

  var optionPnl = win.add('group');
      optionPnl.orientation = 'column';
      optionPnl.alignChildren = 'left';
  var separateChk = optionPnl.add('checkbox', undefined, 'Save each object to a separate file');
  var fitBoardChk = optionPnl.add('checkbox', undefined, 'Fit artboard to selected art');
      separateChk.value = false;
      fitBoardChk.value = true;

  var btnGroup = win.add('group');
  var btnCancel = btnGroup.add('button', undefined, 'Cancel', { name: 'btnCancel' });
  var btnExport = btnGroup.add('button', undefined, 'Export', { name: 'ok' });

  // Click functions
  separateChk.onClick = function () {
    symbol.enabled = !symbol.enabled;
  }

  btnOutFolder.onClick = function () {
    var userFolder = Folder.selectDialog('Select a folder to export');
    if (userFolder != null) {
      lblOutFolder.text = decodeURI(userFolder);
      outFolder = userFolder;
    }
  }

  btnCancel.onClick = function () {
    win.close();
  }

  btnExport.onClick = function () {
    var colorSpace = app.activeDocument.documentColorSpace;

    if (!isEmpty(namePrefix.text)) {
      fileName = namePrefix.text.trim();
    } else {
      alert('Please enter file name prefix');
      return;
    }

    if (separateChk.value) {
      if (symbol.text != '') {
       separator = symbol.text;
      }
      fileName = fileName + separator;

      for (var i = 0; i < sel.length; i++) {
        progBar.value = i*(100.0/(sel.length-1)); // Change progress bar
        var element = sel[i];
        var myFile = File(outFolder + '/' + fileName + i + fileExt);
        saveSelection(element, myFile, colorSpace, fitBoardChk.value, separateChk.value);
      }
    } else {
      var myFile = File(outFolder + '/' + fileName + fileExt);
      saveSelection(sel, myFile, colorSpace, fitBoardChk.value, separateChk.value);
    }
    win.close();
  }

  win.center();
  win.show();
};

// Check empty string
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Remove whitespaces from start and end of string
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};


// Copy selection to a new document, and save it as an AI file
function saveSelection(objects, file, color, fitArtboard, separate) {
  var doc = app.documents.add(color);
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  copyObjectsTo(objects, doc, separate);

  // Resize the artboard to the object
  if (fitArtboard) {
    app.executeMenuCommand('selectall');
    doc.artboards[0].artboardRect = doc.visibleBounds;
  }

  // Save as AI
  try {
    doc.saveAs(file, IllustratorSaveOptions);
    doc.close();
  } catch (e) { }
}

// Duplicate objects and add them to a document
function copyObjectsTo(objects, doc, separate) {
  if (separate) {
    objects.duplicate(doc.activeLayer, ElementPlacement.PLACEATBEGINNING);
  } else {
    for (var i = 0; i < objects.length; i++) {
      objects[i].duplicate(doc.activeLayer, ElementPlacement.PLACEATBEGINNING);
    }
  }
}

try {
  if (app.documents.length > 0) {
    main();
  } else {
    alert('There are no documents open.');
  }
} catch (e) { }