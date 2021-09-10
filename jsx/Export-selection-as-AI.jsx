/*
  Export-selection-as-AI.jsx for Adobe Illustrator
  Description: Exports all selected objects to AI files
  Date: February, 2019
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on Layers to SVG 0.1 by Anton Ball

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Minor improvements

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018/2019 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Export Selection As Ai',
        version: 'v.0.1.1'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  // Default variables for dialog box
  var doc = app.activeDocument,
      fileName = getDocName(doc),
      fileExt = '.ai',
      separator = '-',
      outFolder = (doc.path != '') ? doc.path : Folder.desktop,
      uiMargin = [10, 15, 10, 10];

  var sel = selection;

  if (!sel.length || sel.typename == 'TextRange') {
    alert('Please select a path or group');
    return;
  }

  // Create dialog box
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = 'center';

  var outPnl = dialog.add('panel', undefined, 'Output folder');
      outPnl.orientation = 'row';
      outPnl.margins = uiMargin;
  var btnOutFolder = outPnl.add('button', undefined, 'Select');
  var lblOutFolder = outPnl.add('edittext', undefined);
      lblOutFolder.text = decodeURI(outFolder);
      lblOutFolder.characters = 20;

  var fileNameGrp = dialog.add('group');
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

  var prgPnl = dialog.add('panel', undefined, 'Progress');
      prgPnl.margins = uiMargin;
  var progBar = prgPnl.add('progressbar', [20, 15, 276, 20], 0, 100);

  var optionPnl = dialog.add('group');
      optionPnl.orientation = 'column';
      optionPnl.alignChildren = 'left';
  var separateChk = optionPnl.add('checkbox', undefined, 'Save each object to a separate file');
  var fitBoardChk = optionPnl.add('checkbox', undefined, 'Fit artboard to selected art');
      separateChk.value = false;
      fitBoardChk.value = true;

  var btnGroup = dialog.add('group');
  var btnCancel = btnGroup.add('button', undefined, 'Cancel', { name: 'cancel' });
  var btnExport = btnGroup.add('button', undefined, 'Export', { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '© Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

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

  btnCancel.onClick = dialog.close;

  btnExport.onClick = start;

  function start() {
    var colorSpace = activeDocument.documentColorSpace;
    outFolder = decodeURI(lblOutFolder.text);

    if (isEmpty(outFolder.toString())) {
      lblOutFolder.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!Folder(outFolder).exists) {
      alert("This folder doesn't exist");
      lblOutFolder.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!isEmpty(namePrefix.text)) {
      fileName = namePrefix.text.trim();
    } else {
      alert('Please enter file name prefix');
      return;
    }

    if (separateChk.value) {
      if (symbol.text != '') separator = symbol.text;
      fileName = fileName + separator;

      for (var i = 0, len = sel.length; i < len; i++) {
        progBar.value = i * (100.0 / (len - 1)); // Change progress bar
        var element = sel[i];
        var myFile = File(outFolder + '/' + fileName + i + fileExt);
        saveSelection(element, myFile, colorSpace, fitBoardChk.value, separateChk.value);
      }
    } else {
      if (outFolder == doc.path) fileName += '_copy';
      var myFile = File(outFolder + '/' + fileName + fileExt);
      saveSelection(sel, myFile, colorSpace, fitBoardChk.value, separateChk.value);
    }
    dialog.close();
  }

  dialog.center();
  dialog.show();
}

// Get document name without extension
function getDocName(doc) {
  var name = decodeURI(doc.name);
  // Remove filename extension
  var lastDot = name.lastIndexOf('.');
  if (lastDot > -1) return name.slice(0, lastDot);
  return name;
}

// Check empty string
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Remove whitespaces from start and end of string
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
}

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
    for (var i = 0, objLen = objects.length; i < objLen; i++) {
      objects[i].duplicate(doc.activeLayer, ElementPlacement.PLACEATBEGINNING);
    }
  }
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