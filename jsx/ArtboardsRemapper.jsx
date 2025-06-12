/*
  ArtboardsRemapper.jsx for Adobe Illustrator
  Description: Writes artboard names to a text file or applies from it
  Date: April, 2023
  Modification date: June, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on code by Carlos Canto

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.1 Added starting index by active artboard index. Minor improvements
  0.2.0 Added end index to handle names in range
  0.1.2 Removed input activation on Windows OS below CC v26.4
  0.1.1 Fixed detection of line breaks in TXT on PC
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
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Artboards Remapper',
        version: 'v0.2.1'
      };

  var CFG = {
        start: 1,
        end: 1,
        file: File(Folder.desktop + '/artboardsRemapper.txt'),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };

  if (!isCorrectEnv()) return;

  var doc = app.activeDocument;
  var absLength = doc.artboards.length;
  var currAb = doc.artboards.getActiveArtboardIndex();

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill','top'];

  // MODE
  var actionGrp = win.add('group');
      actionGrp.alignChildren = ['left', 'center'];

  var saveRb = actionGrp.add('radiobutton', undefined, 'Save To File');
      saveRb.value = true;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    saveRb.active = true;
  }

  var applyRb = actionGrp.add('radiobutton', undefined, 'Apply From File');

  // RANGE
  var idxPnl = win.add('panel', undefined, 'Indexes As In Panel');
      idxPnl.orientation = 'row';
      idxPnl.alignChildren = ['fill', 'center'];
      idxPnl.margins = [10, 15, 10, 7];
  
  var startGrp = idxPnl.add('group');
      startGrp.alignChildren = ['left', 'center'];

  var startLbl = startGrp.add('statictext', undefined, 'Start:');
      startLbl.justify = 'left';

  var startIdxInp = startGrp.add('edittext', undefined, (currAb + 1));
      startIdxInp.characters = 4;

  var endGrp = idxPnl.add('group');
      endGrp.alignChildren = ['left', 'center'];

  var endLbl = endGrp.add('statictext', undefined, 'End:');
      endLbl.justify = 'left';

  var endIdxInp = endGrp.add('edittext', undefined, absLength);
      endIdxInp.characters = 4;

  // OUTPUT FILE
  var fileLbl = win.add('statictext', undefined, decodeURIComponent(CFG.file));
      fileLbl.helpTip = 'Reveal artboard names file:\n' + decodeURIComponent(CFG.file);

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  // EVENTS
  cancel.onClick = win.close;
  ok.onClick = okClick;

  // Open parent folder
  fileLbl.addEventListener('mousedown', function () {
    if (Folder(CFG.file.path).exists) {
      Folder(CFG.file.path).execute();
    }
  });

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    var startIdx = parseInt(startIdxInp.text) - 1 || 0;
    var endIdx = parseInt(endIdxInp.text) || absLength;

    if (isNaN(startIdx) || startIdx < 0 || startIdx >= absLength) {
      alert('Start index is invalid', 'Input error');
      return;
    }
  
    if (isNaN(endIdx) || endIdx < startIdx || endIdx > absLength) {
      alert('End index is invalid', 'Input error');
      return;
    }

    var abNames = [];

    if (saveRb.value) { // Save to txt
      abNames = getArtboardNames(doc.artboards, startIdx, endIdx);
      if (abNames.length) {
        writeToText(abNames.join('\n'), CFG.file);
      }
    } else { // Apply from txt
      if (!CFG.file.exists) {
        // Select another file if the default file is not found
        var type = (CFG.isMac) ? function(f) {
          return f instanceof Folder || (f instanceof File && f.name.match(/(.txt)$/));
        } : '*.txt;';
        CFG.file = File.openDialog('Choose TXT file...', type, false);
      }
      abNames = parseFromText(CFG.file);
      if (abNames.length) {
        renameArtboards(doc.artboards, abNames, startIdx, endIdx);
      }
    }

    if (!abNames.length || (abNames.length == 1 && !abNames[0].length)) {
      alert('Name list is empty', 'Script error');
      return;
    }

    win.close();
  }

  win.center();
  win.show();
}

/**
 * Check if the environment is correct for running the script
 * @param {...string} args - Variable number of arguments to check
 * @returns {boolean} - Return true if the environment is correct, false otherwise
 */
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
        if (!app.documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        var rqdLen = parseFloat(arg.split(':')[1]);
        if (app.selection.length < rqdLen || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select ' + rqdLen + ' path(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Extract artboard names from a specified range
 * @param {(Object|Array)} abs - The collection of artboards
 * @param {number} start - The starting index of the range
 * @param {number} end - The ending index of the range
 * @returns {Array} names - An array containing artboard names within the specified range
 */
function getArtboardNames(abs, start, end) {
  var names = [];
  for (var i = start; i < end; i++) {
    names.push(abs[i].name);
  }
  return names;
}

/**
 * Write a string to a specified file
 * @param {string} str - The string to be written to the file
 * @param {File} f - The File object representing the destination file
 */
function writeToText(str, f) {
  f.open('w');
  f.write(str);
  f.close();
}

/**
 * Read text from a specified file and returns an array of lines
 * @param {File} f - The File object representing the source file
 * @returns {Array} An array of lines read from the file
 */
function parseFromText(f) {
  f.open('r');
  var contents = f.read();
  var lines = contents.split(/\n|\r|\r\n/);
  f.close();
  return lines;
}

/**
 * Rename artboards using an array of names within a specified range
 * @param {(Object|Array)} abs - The collection of artboards
 * @param {string[]} names - An array of names to be assigned to the artboards
 * @param {number} start - The starting index of the range
 * @param {number} end - The ending index of the range
 */
function renameArtboards(abs, names, start, end) {
  var length = Math.min(end, abs.length - 1);
  for (var i = start, j = 0; i <= length; i++, j++) {
    if (!names[j]) break;
    abs[i].name = names[j];
  }
}

/**
 * Open a URL in the default web browser
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
*/
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
} catch (err) {}