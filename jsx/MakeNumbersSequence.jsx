/*
  MakeNumbersSequence.jsx for Adobe Illustrator
  Description: Fills a range of selected text objects with numbers incremented based on the input data
  Date: December, 2022
  Modification date: July, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Idea: Egor Chistyakov (@chegr)

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.0 Initial version
  0.1.1 Added Shuffle option
  0.2 Added sorting by position and placeholder replacement

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
        name: 'Make Numbers Sequence',
        version: 'v.0.2'
      },
      CFG = {
        placeholder: '{%n}',
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };
  
  if (!isCorrectEnv('selection')) return;

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4 && CFG.aiVers > 16;

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';
      win.opacity = .97;

  // Star number
  var numPnl = win.add('panel', undefined, 'Numbers');
      numPnl.alignChildren = 'left';
      numPnl.margins = [10, 15, 10, 10];

  var startGrp = numPnl.add('group');
  var startLbl = startGrp.add('statictext', undefined, 'Start value');
      startLbl.preferredSize.width = 65;
  var startInp = startGrp.add('edittext', undefined, '1');
      startInp.preferredSize.width = 74;
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    startInp.active = true;
  }

  // End number
  var endGrp = numPnl.add('group');
  var endLbl = endGrp.add('statictext', undefined, 'End value');
      endLbl.preferredSize.width = 65;
  var endInp = endGrp.add('edittext', undefined, '50');
      endInp.preferredSize.width = 74;

  // Increment
  var incGrp = numPnl.add('group');
  var incLbl = incGrp.add('statictext', undefined, 'Increment');
      incLbl.preferredSize.width = 65;
  var incInp = incGrp.add('edittext', undefined, '5');
      incInp.preferredSize.width = 74;

  var isUseAll = numPnl.add('checkbox', undefined, 'Number to last text');
  var isShuffle = numPnl.add('checkbox', undefined, 'Shuffle numbers order');
  var isPadZero = numPnl.add('checkbox', undefined, 'Add zeros (e.g. 01, 02)');
  var isRmvTf = numPnl.add('checkbox', undefined, 'Remove unused texts');

  // Sort objects
  var sortPnl = win.add('panel', undefined, 'Sort before numbering');
      sortPnl.alignChildren = 'left';
      sortPnl.margins = [10, 15, 10, 10];

  var isOrder = sortPnl.add('radiobutton', undefined, 'By order in layers');
      isOrder.value = true;
  var isRows = sortPnl.add('radiobutton', undefined, 'By rows (like Z)');
  var isCols = sortPnl.add('radiobutton', undefined, 'By columns (like \u0418)');

  // Replace
  var rplcPnl = win.add('panel', undefined, 'Replace text to number');
      rplcPnl.alignChildren = 'left';
      rplcPnl.margins = [10, 15, 10, 10];

  var isFullRplc = rplcPnl.add('radiobutton', undefined, 'Full text content');
      isFullRplc.value = true;
  var isPhRplc = rplcPnl.add('radiobutton', undefined, 'Only {%n} placeholder');

  // Buttons
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

  loadSettings(SETTINGS);

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  isUseAll.onClick = function () {
    endGrp.enabled = !this.value;
    isRmvTf.enabled = !this.value;
  }
  
  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    var tfs = getTextFrames(selection).reverse();
    if (!tfs.length) {
      alert('Texts not found\nSelect texts and re-run script', 'Script error');
      win.close();
      return;
    }

    var tolerance = getTolerance(tfs[0]),
        inc = strToNum(incInp.text, 1),
        start = strToNum(startInp.text, 0),
        end = isUseAll.value ? start + (tfs.length - 1) * inc : strToNum(endInp.text, 10),
        strLen = getMaxNumLength(start, end),
        isPad = isPadZero.value,
        isRplc = isPhRplc.value;

    if (isRows.value && !isShuffle.value) {
      sortByRows(tfs, tolerance);
    } else if (isCols.value && !isShuffle.value) {
      sortByColumns(tfs, tolerance);
    }

    if (isRplc) tfs = filterByString(tfs, CFG.placeholder);

    var nums = getNumbers(inc, start, end, tfs.length);
    if (isShuffle.value) shuffle(nums);

    var i = 0,
        curNum = 0,
        regex = new RegExp(CFG.placeholder, 'gi');

    while (i < nums.length) {
      curNum = isPad && nums[i] >= 0 ? zeroPad(nums[i], strLen) : nums[i];
      tfs[i].contents = isRplc ? tfs[i].contents.replace(regex, curNum): curNum;
      i++;
    }

    if (isRmvTf.enabled && isRmvTf.value && i < tfs.length) {
      while (i < tfs.length) {
        tfs[i].remove();
        i++;
      }
    }

    saveSettings(SETTINGS);
    win.close();
  }

  // Save UI options to file
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.start = startInp.text;
    pref.end = endInp.text;
    pref.inc = incInp.text;
    pref.sort = isOrder.value ? 0 : (isRows.value ? 1 : 2);
    pref.ph = isFullRplc.value ? 0 : 1;
    pref.all = isUseAll.value;
    pref.rndm = isShuffle.value;
    pref.zero = isPadZero.value;
    pref.rmv = isRmvTf.value;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  // Load options from file
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var pref = new Function('return ' + json)();
        f.close();
        if (typeof pref != 'undefined') {
          startInp.text = pref.start;
          endInp.text = pref.end;
          incInp.text = pref.inc;
          if (pref.sort == 0) isOrder.value = true;
          else if (pref.sort == 1) isRows.value = true;
          else if (pref.sort == 2) isCols.value = true;
          if (pref.ph == 0) isFullRplc.value = true;
          else if (pref.ph == 1) isPhRplc.value = true;
          isUseAll.value = pref.all;
          isShuffle.value = pref.rndm;
          isPadZero.value = pref.zero;
          isRmvTf.value = pref.rmv;
        }
      } catch (e) {}
    }
    endGrp.enabled = !isUseAll.value;
    isRmvTf.enabled = !isUseAll.value;
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
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Nothing selected\nPlease, select at least one TextFrame', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

// Get TextFrames array from collection
function getTextFrames(coll) {
  var tfs = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename)) tfs.push(coll[i]);
    else if (/group/i.test(coll[i].typename)) tfs = tfs.concat(getTextFrames(coll[i].pageItems));
  }
  return tfs;
}

// Get tolerance of letter size for sorting
function getTolerance(tf) {
  var val = 0;
  if (/text/i.test(tf.typename)) {
    var str = tf.contents;
    tf.contents = '0';
    val = tf.height;
    tf.contents = str;
  }
  return val;
}

// Get maximum number length
function getMaxNumLength(a, b) {
  var strA = ('' + Math.abs(a)).length,
      strB = ('' + Math.abs(b)).length;
  return Math.max(strA, strB);
}

// Sort objects coords from left to right by rows
function sortByRows(arr, tolerance) {
  arr.sort(function(a, b) {
    if (Math.abs(b.top - a.top) <= tolerance) {
      return a.left - b.left;
    }
    return b.top - a.top;
  });
}

// Sort objects coords from top to bottom by columns
function sortByColumns(arr, tolerance) {
  arr.sort(function(a, b) {
    if (Math.abs(a.left - b.left) <= tolerance) {
      return b.top - a.top;
    }
    return a.left - b.left;
  });
}

function filterByString(tfs, str) {
  var out = [],
      regex = new RegExp(str, 'gi');
  for (var i = 0, len = tfs.length; i < len; i++) {
    if (regex.test(tfs[i].contents)) out.push(tfs[i]);
  }
  return out;
}


// Get numbers from range
function getNumbers(inc, start, end, amt) {
  var out = [],
      curNum = start,
      i = 0;

  if (start <= end && inc > 0) {
    while ((curNum + inc <= end) && (i < amt)) {
      curNum = start + i * inc;
      out.push(curNum);
      i++;
    }
  } else if (inc < 0) {
    while ((curNum + inc >= end) && (i < amt)) {
      curNum = start + i * inc;
      out.push(curNum);
      i++;
    }
  }

  return out;
}

// Convert string to number
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

// Shuffle array
function shuffle(arr) {
  var j, tmp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
  return arr;
}

// Add leading zero to number
function zeroPad(num, len) {
  var str = '' + num;
  for (var i = 0; i <= len; i++) {
    if (i > str.length) {
      str = '0' + str;
    }
  }
  return str;
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
} catch (e) { }