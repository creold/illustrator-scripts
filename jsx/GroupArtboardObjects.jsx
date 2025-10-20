/*
  GroupArtboardObjects.jsx for Adobe Illustrator
  Description: Group objects on document artboards. Skips locked or hidden objects
  Date: June, 2024
  Modification date: June, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.1 Added starting index by active artboard index. Minor improvements
  0.2.0 Added artboards range, sort groups in layers
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

function main() {
  var SCRIPT = {
        name: 'Group Artboard Objects',
        version: 'v0.2.1'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!isCorrectEnv('version:16')) return;

  var doc = app.activeDocument;
  var absLength = doc.artboards.length;
  var currAb = doc.artboards.getActiveArtboardIndex();

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];

  // RANGE
  var rangePnl = win.add('panel', undefined, 'Artboards Range');
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = ['fill', 'center'];
      rangePnl.margins = [10, 15, 10, 7];

  var radio = rangePnl.add('group');
      radio.alignChildren = ['left', 'center'];

  var isCurr = radio.add('radiobutton', undefined, 'Current #' + (currAb + 1));
  var isCstm = radio.add('radiobutton', undefined, 'Custom');
      isCstm.value = true;

  var idx = rangePnl.add('group');
      idx.alignChildren = ['fill', 'center'];
  
  var startGrp = idx.add('group');
      startGrp.alignChildren = ['left', 'center'];

  var startLbl = startGrp.add('statictext', undefined, 'Start:');
      startLbl.justify = 'left';

  var startInp = startGrp.add('edittext', undefined, (currAb + 1));
      startInp.characters = 6;
      startInp.enabled = isCstm.value;

  var endGrp = idx.add('group');
      endGrp.alignChildren = ['left', 'center'];

  var endLbl = endGrp.add('statictext', undefined, 'End:');
      endLbl.justify = 'left';

  var endInp = endGrp.add('edittext', undefined, absLength);
      endInp.characters = 6;
      endInp.enabled = isCstm.value;

  // SORT
  var sortPnl = win.add('panel', undefined, 'Move Groups in Layers');
      sortPnl.orientation = 'row';
      sortPnl.alignChildren = ['left', 'center'];
      sortPnl.margins = [10, 15, 10, 7];

  var isKeep = sortPnl.add('radiobutton', undefined, 'No');
      isKeep.value = true;
  var isToBtm = sortPnl.add('radiobutton', undefined, 'To Bottom');
  var isToTop = sortPnl.add('radiobutton', undefined, 'To Top');

  // OPTIONS
  var optPnl = win.add('panel', undefined, 'Options');
      optPnl.orientation = 'column';
      optPnl.alignChildren = ['left', 'center'];
      optPnl.margins = [10, 15, 10, 7];

  var isAddName = optPnl.add('checkbox', undefined, 'Rename Groups as Artboards');
      isAddName.value = true;

  var isGrpSingle = optPnl.add('checkbox', undefined, 'Group Single Objects');
      isGrpSingle.value = true;

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'fill'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
  copyright.justify = 'center';

  var prgGroup = win.add('group');
  var progBar = prgGroup.add('progressbar', [20, 5, 250, 10], 0, 100);

  loadSettings(SETTINGS);

  // EVENTS
  isCurr.onClick = function () {
    startInp.enabled = endInp.enabled = false;
  }

  isCstm.onClick = function () {
    startInp.enabled = endInp.enabled = true;
  }

  cancel.onClick = win.close;

  ok.onClick = function () {
    saveSettings(SETTINGS);

    var zOrder = isToTop.value ? 'top' : (isToBtm.value ? 'bottom' : '');

    if (isCurr.value) { // Current artboard
      groupArtboard(doc, currAb, isGrpSingle.value, zOrder, isAddName.value);
      progBar.value = 100;
    } else { // Custom range
      var startIdx = parseInt(startInp.text) - 1 || 0;
      var endIdx = parseInt(endInp.text) || absLength;

      if (isNaN(startIdx) || startIdx < 0 || startIdx >= absLength) {
        alert('Start index is invalid', 'Input error');
        return;
      }
    
      if (isNaN(endIdx) || endIdx < startIdx || endIdx > absLength) {
        alert('End index is invalid', 'Input error');
        return;
      }

      var rangeLength = endIdx - startIdx;
      for (var i = startIdx; i < endIdx; i++) {
        groupArtboard(doc, i, isGrpSingle.value, zOrder, isAddName.value);
        progBar.value = parseInt(100 * (i - startIdx + 1) / rangeLength);
        win.update();
      }
    }

    app.executeMenuCommand('deselectall');

    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  /**
   * Save UI options to a file
   * @param {object} prefs - Object containing preferences
   * @returns {void}
   */
  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.artboard = isCurr.value;
    data.move = isKeep.value ? 0 : (isToBtm.value ? 1 : 2);
    data.group = isGrpSingle.value;
    data.rename = isAddName.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {object} prefs - Object containing preferences
   * @returns {void}
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (!f.exists) return;

    try {
      f.encoding = 'UTF-8';
      f.open('r');
      var json = f.readln();
      try { var data = new Function('return (' + json + ')')(); }
      catch (err) { return; }
      f.close();

      if (typeof data != 'undefined') {
        win.location = [
          data.win_x ? parseInt(data.win_x) : 100,
          data.win_y ? parseInt(data.win_y) : 100
        ];
        isCurr.value = data.artboard === 'true';
        isCstm.value = !isCurr.value;
        startInp.enabled = endInp.enabled = isCstm.value;
        sortPnl.children[parseInt(data.move) || 0].value = true;
        isGrpSingle.value = data.group === 'true';
        isAddName.value = data.rename === 'true';
      }
    } catch (err) {
      return;
    }
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
 * Group all items on the specified artboard in the document
 * @param {Object} doc - The Adobe Illustrator document object
 * @param {number} i - The index of the artboard to group items on
 * @param {boolean} isGroup - Whether to group items if only one item is selected
 * @param {string} zOrder - The z-order position for the grouped items ('top' or 'bottom')
 * @param {boolean} isAddName - Whether to name the group after the artboard
 */
function groupArtboard(doc, i, isGroup, zOrder, isAddName) {
  app.executeMenuCommand('deselectall');

  doc.artboards.setActiveArtboardIndex(i);
  doc.selectObjectsOnActiveArtboard();

  var sel = app.selection;
  if (sel.length === 0) return;

  if (sel.length > 1 || (sel.length == 1 && sel[0].typename !== 'GroupItem' && isGroup)) {
    app.executeMenuCommand('group');
  }

  sel = app.selection; // Update selection

  // Adjust the z-order if specified
  if (zOrder === 'top') {
    sel[0].zOrder(ZOrderMethod.BRINGTOFRONT);
  } else if (zOrder === 'bottom') {
    sel[0].zOrder(ZOrderMethod.SENDTOBACK);
  }

  if (isAddName) {
    sel[0].name = doc.artboards[i].name;
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

/**
 * Serialize a JavaScript plain object into a JSON-like string
 * @param {Object} obj - The object to serialize
 * @returns {string} A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\t")
        .replace(/\r/g, "\r")
        .replace(/\n/g, "\n")
        .replace(/"/g, '\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

// Run script
try {
  main();
} catch (err) {}
