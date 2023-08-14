/*
  RenameLayerAsText.jsx for Adobe Illustrator
  Description: The script renames the layers using the content of the TextFrame or its custom name
  Date: June, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

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

function main() {
  var CFG = {
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

  var doc = activeDocument;
  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers >= 17;

  // UI
  var win = new Window('dialog', 'Rename Layer As Text');
      win.alignChildren = ['fill', 'center'];

  var opts = win.add('group');
      opts.alignChildren = ['fill', 'center'];
  var isFirstRb = opts.add('radiobutton', undefined, 'Use first text');
      isFirstRb.value = true;
  var isLastRb = opts.add('radiobutton', undefined, 'Last text');

  // Buttons
  var btns = win.add('group');
  var currBtn = btns.add('button', undefined, 'Active Layer', { name: 'ok' });
  var allBtn = btns.add('button', undefined, 'All');

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 3);
  } else {
    currBtn.active = true;
  }

  allBtn.onClick = function () {
    var _layers = app.activeDocument.layers;
    for (var i = 0, len = _layers.length; i < len; i++) {
      renameLayer(_layers[i], isFirstRb.value);
    }
    win.close();
  }

  currBtn.onClick = function () {
    renameLayer(app.activeDocument.activeLayer, isFirstRb.value);
    win.close();
  }

  win.center();
  win.show();
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

// Change layer name
function renameLayer(lay, isFirst) {
  var tfs = getTextFrames(lay.pageItems);
  if (!tfs.length) return;
  var tf = isFirst? tfs[0] : tfs[tfs.length - 1];
  if (tf.name != '') lay.name = tf.name;
  else lay.name = tf.contents.slice(0, 100);
}

// Get TextFrames array from collection
function getTextFrames(coll) {
  var tfs = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename)) {
      tfs.push(coll[i]);
    } else if (/group/i.test(coll[i].typename)) {
      tfs = tfs.concat( getTextFrames(coll[i].pageItems) );
    }
  }
  return tfs;
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