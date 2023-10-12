/*
  ArtboardsRemapper.jsx for Adobe Illustrator
  Description: Writes artboard names to a text file or applies from it
  Date: April, 2023
  Modification date: October, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on code by Carlos Canto

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Fixed detection of line breaks in TXT on PC

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2023 (Mac/Win).
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
        version: 'v.0.1.1'
      },
      CFG = {
        start: 1,
        f: File(Folder.desktop + '/artboardsRemapper.txt'),
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
      };
  
  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return false;
  }

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return false;
  }

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers >= 17;
  var doc = app.activeDocument;

  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill','top'];

  var actionGrp = win.add('group');
      actionGrp.alignChildren = ['left', 'center'];
  var saveRb = actionGrp.add('radiobutton', undefined, 'Save to file');
      saveRb.value = true;
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    saveRb.active = true;
  }
  var applyRb = actionGrp.add('radiobutton', undefined, 'Apply from file');
  
  var idxGrp = win.add('group');
      idxGrp.alignChildren = ['left', 'center'];
  idxGrp.add('statictext', undefined, 'Start index as is panel:');
  var idxInp = idxGrp.add('edittext', undefined, CFG.start);
      idxInp.characters = 5;

  win.add('statictext', undefined, decodeURI(CFG.f));

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  cancel.onClick = win.close;

  ok.onClick = function () {
    var idx = parseInt(idxInp.text) - 1;
    if (isNaN(idx) || idx < 0) idx = 0;
    if (idx >= doc.artboards.length) {
      alert('Start index greater than number of document artboards', 'Input error');
      return;
    }

    var abNames = [];
    if (saveRb.value) { // Save to txt
      abNames = getArtboardNames(doc, idx);
      if (abNames.length) writeToText(abNames.join('\n'), CFG.f);
    } else { // Apply from txt
      if (!CFG.f.exists) {
        alert('Txt file not found', 'File error');
        return;
      }
      abNames = parseFromText(CFG.f);
      if (abNames.length) renameArtboards(doc, abNames, idx);
    }
    if (!abNames.length || (abNames.length == 1 && !abNames[0].length)) {
      alert('Name list is empty', 'Script error');
      return;
    }

    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  win.center();
  win.show();
}

// Extract artboard names
function getArtboardNames(doc, idx) {
  var out = [];
  for (var i = idx; i < doc.artboards.length; i++) {
    out.push(doc.artboards[i].name);
  }
  return out;
}

// Write text to a file
function writeToText(str, f) {
  f.open('w');
  f.write(str);
  f.close();
}

// Read text from a file
function parseFromText(f) {
  f.open('r');
  var contents = f.read();
  var lines = contents.split(/\n|\r|\r\n/);
  f.close();
  return lines;
}

// Rename artboards from the name array
function renameArtboards(doc, names, idx) {
  var str = '';
  for (var i = idx; i < doc.artboards.length; i++) {
    str = names[i - idx];
    if (!str) break;
    doc.artboards[i].name = str;
  }
}

// Simulate keyboard keys on Windows OS via VBScript
// 
// This function is in response to a known ScriptUI bug on Windows.
// Basically, on some Windows Ai versions, when a ScriptUI dialog is
// presented and the active attribute is set to true on a field, Windows
// will flash the Windows Explorer app quickly and then bring Ai back
// in focus with the dialog front and center.
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
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
} catch (err) {}