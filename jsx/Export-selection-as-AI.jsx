/*
  Export-selection-as-AI.jsx for Adobe Illustrator
  Description: Exports all selected objects to AI files
  Date: October, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on Layers to SVG 0.1 by Anton Ball

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Minor improvements
  0.2 Minor improvements

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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Export Selection As Ai',
        version: 'v.0.2'
      },
      CFG = {
        isMac: /mac/i.test($.os),
        sep: '-', // Separator symbol
        isSep: true, // Default save each object
        isFit: true, // Default fit artboard to artwork
        ext: '.ai', // File extension
        uiMargin: [10, 15, 10, 10],
      };

  if (!isCorrectEnv('version:16', 'selection')) return;

  var doc = app.activeDocument,
      fName = getFileName(doc),
      outFol = (doc.path != '') ? doc.path : Folder.desktop,
      sel = selection;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = 'center';

  var folPnl = win.add('panel', undefined, 'Output folder');
      folPnl.orientation = 'row';
      folPnl.margins = CFG.uiMargin;
  var folBtn = folPnl.add('button', undefined, 'Select');
  var folInp = folPnl.add('edittext', undefined);
      folInp.text = decodeURI(outFol);
      folInp.characters = 20;

  var fNameGrp = win.add('group');
  var namePnl = fNameGrp.add('panel', undefined, 'File name prefix');
      namePnl.orientation = 'row';
      namePnl.margins = CFG.uiMargin;
  var namePre = namePnl.add('edittext', undefined, fName);
      namePre.characters = 20;
  var sepPnl = fNameGrp.add('panel', undefined, 'Separator');
      sepPnl.margins = CFG.uiMargin;
  var sym = sepPnl.add('edittext', undefined, CFG.sep);
      sym.characters = 4;
      sym.enabled = CFG.isSep;

  var prgPnl = win.add('panel', undefined, 'Progress');
      prgPnl.margins = CFG.uiMargin;
  var progBar = prgPnl.add('progressbar', [20, 15, 276, 20], 0, 100);

  var optPnl = win.add('group');
      optPnl.orientation = 'column';
      optPnl.alignChildren = 'left';
  var isSeparate = optPnl.add('checkbox', undefined, 'Save each object to a separate file');
      isSeparate.value = CFG.isSep;
  var isFitAb = optPnl.add('checkbox', undefined, 'Fit artboard to selected art');
      isFitAb.value = CFG.isFit;

  var btns = win.add('group');
  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Export', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Export', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Click functions
  isSeparate.onClick = function () {
    sym.enabled = this.value;
  }

  folBtn.onClick = function () {
    var fol = Folder.selectDialog('Select a folder to export');
    if (fol != null) {
      folInp.text = decodeURI(fol);
      outFol = fol;
    }
  }

  cancel.onClick = win.close;

  ok.onClick = start;

  function start() {
    var colMode = doc.documentColorSpace;
    outFol = decodeURI(folInp.text);

    if (isEmpty(outFol.toString())) {
      folInp.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!Folder(outFol).exists) {
      alert("This folder doesn't exist");
      folInp.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!isEmpty(namePre.text)) {
      fName = namePre.text.trim();
    } else {
      alert('Please enter file name prefix');
      return;
    }

    if (isSeparate.value) {
      if (!isEmpty(sym.text)) CFG.sep = sym.text;
      fName = fName + CFG.sep;
      var outFile;

      for (var i = 0, len = sel.length; i < len; i++) {
        progBar.value = i * (100.0 / (len - 1)); // Change progress bar
        var item = sel[i];
        outFile = File(outFol + '/' + fName + (i + 1) + CFG.ext);
        saveToDoc(item, outFile, colMode, isFitAb.value, isSeparate.value);
      }
    } else {
      if ((outFol == doc.path) && (fName == getFileName(doc))) fName += '_copy';
      outFile = File(outFol + '/' + fName + CFG.ext);
      saveToDoc(sel, outFile, colMode, isFitAb.value, isSeparate.value);
    }
    win.close();
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
          alert('Error\nRun script from Adobe Illustrator');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Error\nSorry, script only works in Illustrator v.' + rqdVers + ' and later');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('Error\nOpen a document and try again');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Error\nPlease, select at least one object');
          return false;
        }
        break;
    }
  }

  return true;
}

// Get document name without extension
function getFileName(f) {
  return decodeURI(f.name.replace(/\.[^\.]+$/, ''));
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
function saveToDoc(items, f, col, isFit, isSep) {
  var doc = app.documents.add(col);
  app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

  copyObjectsTo(items, doc);

  // Resize the artboard to the object
  if (isFit) app.executeMenuCommand('Fit Artboard to artwork bounds');

  try {
    doc.saveAs(f, IllustratorSaveOptions);
    doc.close();
  } catch (e) { }
}

// Duplicate objects and add them to a document
function copyObjectsTo(items, doc) {
  if (items instanceof Array) {
    for (var i = 0, len = items.length; i < len; i++) {
      items[i].duplicate(doc.activeLayer, ElementPlacement.PLACEATEND);
    }
  } else {
    items.duplicate(doc.activeLayer, ElementPlacement.PLACEATBEGINNING);
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