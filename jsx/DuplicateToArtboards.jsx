/*
  DuplicateToArtboards.jsx for Adobe Illustrator
  Description: Copy and paste selected artboard objects to the same position on specific artboards
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2022 (Mac), 2022 (Win).
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
        name: 'Duplicate To Artboards',
        version: 'v.0.1.1'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        isPreserve: app.preferences.getBooleanPreference('layers/pastePreserve'), // Default Paste Remembers Layers
        color: [255, 0, 0], // RGB artboard index color
        tmpLyr: 'ARTBOARD_INDEX',
        uiOpacity: .98 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!isCorrectEnv('version:16', 'selection')) return;
  polyfills();

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');
      wrapper.alignChildren = ['fill', 'fill'];

  // Artboards  
  var absPnl = wrapper.add('panel', undefined, 'Artboards range');
      absPnl.orientation = 'column';
      absPnl.alignChildren = 'fill';
      absPnl.margins = [10, 15, 10, 10];

  var absInp = absPnl.add('edittext', undefined, 1);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    absInp.active = true;
  }

  var absDescr = absPnl.add('statictext', undefined, '(e.g. "1, 3-5" to export 1, 3, 4, 5)\nor enter nothing to use all', { multiline: true });
      absDescr.justify = 'left';

  // Separator
  wrapper.separator = wrapper.add('panel');
  wrapper.separator.minimumSize.width = wrapper.separator.maximumSize.width = 2;

  // Options
  var optsGrp = wrapper.add('group');
      optsGrp.orientation = 'column';
      optsGrp.alignChildren = 'fill';

  var pasteGrp = optsGrp.add('group');
      pasteGrp.orientation = 'column';
      pasteGrp.alignChildren = 'fill';
      pasteGrp.spacing = 3;

  var isFront = pasteGrp.add('radiobutton', undefined, 'Paste in front');
      isFront.helpTip = 'Similar to the Edit menu function';
      isFront.value = true;
  var isBack = pasteGrp.add('radiobutton', undefined, 'Paste in back');
      isBack.helpTip = 'Similar to the Edit menu function';

  var isPreserve = optsGrp.add('checkbox', undefined, 'Preserve layers');
      isPreserve.helpTip = 'Similar to the Layer option\nPaste Remembers Layers';
      isPreserve.value = CFG.isPreserve;

  var isSelAfter = optsGrp.add('checkbox', undefined, 'Select pasted');
      isSelAfter.value = true;

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'fill'];

  var copyright = btns.add('statictext', undefined, 'Visit Github');

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }

  loadSettings();

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  win.onShow = function () {
    showAbIndex(CFG.tmpLyr, CFG.color);
  }

  win.onClose = function () {
    removeAbIndex(CFG.tmpLyr);
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    var doc = app.activeDocument,
        actIdx = doc.artboards.getActiveArtboardIndex(),
        docSel = selection,
        cmdName = isFront.value ? 'pasteFront' : 'pasteBack',
        absRange = getArtboardsRange(absInp.text, actIdx),
        dupItems = [];

    // Activate Paste Remembers Layers
    app.preferences.setBooleanPreference('layers/pastePreserve', isPreserve.value);
    app.executeMenuCommand('copy');
    app.executeMenuCommand('deselectall');

    for (var i = 0; i < absRange.length; i++) {
      pasteToArtboard(cmdName, absRange[i]);
      dupItems.push.apply(dupItems, selection);
    }
  
    selection = isSelAfter.value ? dupItems : docSel;
    doc.artboards.setActiveArtboardIndex(actIdx);
    app.preferences.setBooleanPreference('layers/pastePreserve', CFG.isPreserve);
    saveSettings();
    win.close();
  }

  // Save UI options to file
  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.range = absInp.text;
    pref.isFront = isFront.value;
    pref.isSelAfter = isSelAfter.value;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  // Load options from file
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
          pref.isFront ? isFront.value = true : isBack.value = true;
          absInp.text = pref.range;
          isSelAfter.value = pref.isSelAfter;
        }
      } catch (e) {}
    }
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
          alert('Error\nPlease, select at least one object on the artboard');
          return false;
        }
        break;
    }
  }

  return true;
}

// Setup JavaScript Polyfills
function polyfills() {
  Array.prototype.forEach = function (callback) {
    for (var i = 0; i < this.length; i++) callback(this[i], i, this);
  };

  Array.prototype.includes = function (search) {
    return this.indexOf(search) !== -1;
  };

  Array.prototype.indexOf = function (obj, start) {
    for (var i = start || 0, j = this.length; i < j; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  };

  Array.prototype.filter = function (callback, context) {
    arr = [];
    for (var i = 0; i < this.length; i++) {
      if (callback.call(context, this[i], i, this))
        arr.push(this[i]);
    }
    return arr;
  };
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

// Output artboard indexes as text
function showAbIndex(layer, color) {
  if (arguments.length == 1 || color == undefined) color = [0, 0, 0];

  var doc = activeDocument,
      actIdx = doc.artboards.getActiveArtboardIndex(),
      tmpLayer;

  var idxColor = new RGBColor();
  idxColor.red = color[0];
  idxColor.green = color[1];
  idxColor.blue = color[2];

  try {
    tmpLayer = doc.layers.getByName(layer);
  } catch (e) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = layer;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i],
        abWidth = currAb.artboardRect[2] - currAb.artboardRect[0],
        abHeight = currAb.artboardRect[1] - currAb.artboardRect[3],
        label = tmpLayer.textFrames.add(),
        labelSize = (abWidth >= abHeight) ? abHeight / 3 : abWidth / 3;
    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = idxColor;
    label.position = [currAb.artboardRect[0], currAb.artboardRect[1]];
  }

  doc.artboards.setActiveArtboardIndex(actIdx);
  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('preview');
    app.executeMenuCommand('preview');
  } else {
    redraw();
  }
}

// Remove temp layer with artboard indexes
function removeAbIndex(layer) {
  try {
    var layerToRm = activeDocument.layers.getByName(layer);
    layerToRm.remove();
  } catch (e) {}
}

// Get artboard indexes from string
function getArtboardsRange(str, actIdx) {
  var userAbs = [],
      docAbs = [];

  for (var i = 0; i < activeDocument.artboards.length; i++) {
    docAbs.push(i);
  }

  if (!str.replace(/\s/g, '').length) {
    var rmvIdx = docAbs.indexOf(actIdx);
    if (rmvIdx !== -1) docAbs.splice(rmvIdx, 1);
    return docAbs;
  }

  str = str.replace(/\s/g, '').replace(/\./g, ',');
  var tmp = str.split(',');

  tmp.forEach(function (e) {
    if (e.match('-') == null) {
      userAbs.push(e - 1);
      return;
    };
    var extreme = e.split('-'); // Min & max value in range
    for (var j = (extreme[0] - 1); j <= extreme[1] - 1; j++) {
      userAbs.push(j);
    }
  });

  return docAbs.filter(function (e) {
    return userAbs.includes(e);
  });
}

// Paste from clipboard
function pasteToArtboard(cmdName, idx) {
  if (arguments.length <= 1) {
    cmdName = 'pasteInAllArtboard';
  } else {
    activeDocument.artboards.setActiveArtboardIndex(idx);
  }

  switch(cmdName) {
    case 'pasteFront':
    case 'pasteBack':
    case 'pasteInPlace':
    case 'pasteInAllArtboard':
      app.executeMenuCommand(cmdName);
      break;
    case 'paste':
    default:
      app.paste();
      break ;
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