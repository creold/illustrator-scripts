/*
  MakeNumbersSequence.jsx for Adobe Illustrator
  Description: Fills a range of selected text objects with numbers incremented based on the input data
  Date: December, 2022
  Modification date: November, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Idea: Egor Chistyakov (@chegr)

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.0 Initial version
  0.1.1 Added Shuffle option
  0.2 Added sorting by position and placeholder replacement
  0.3 Added number replacement in a string
  0.4 Redesigned, added dynamic example to side panel

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
        version: 'v.0.4'
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

  var tfs = getTextFrames(selection).reverse();
  if (!tfs.length) {
    alert('Texts not found\nSelect texts and re-run script', 'Script error');
    return;
  }

  var inc = 0, start = 0, end = 0, strLen = 0;

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];
      win.opacity = .97;

  var wrapper = win.add('group');
      wrapper.orientation = 'column';
      wrapper.alignChildren = ['fill', 'top'];

  // Start number
  var numPnl = wrapper.add('panel', undefined, 'Numbers');
      numPnl.alignChildren = 'left';
      numPnl.spacing = 15;
      numPnl.margins = [10, 15, 10, 10];

  var inpWrapper = numPnl.add('group');
      inpWrapper.spacing = 15;

  var startGrp = inpWrapper.add('group');
  startGrp.add('statictext', undefined, 'Start:');
  var startInp = startGrp.add('edittext', undefined, 1);
      startInp.preferredSize.width = 48;
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    startInp.active = true;
  }

  // End number
  var endGrp = inpWrapper.add('group');
  endGrp.add('statictext', undefined, 'End:');
  var endInp = endGrp.add('edittext', undefined, 50);
      endInp.preferredSize.width = 48;

  // Increment
  var incGrp = inpWrapper.add('group');
  incGrp.add('statictext', undefined, 'Increment:');
  var incInp = incGrp.add('edittext', undefined, 5);
      incInp.preferredSize.width = 48;

  var numOptWrapper = numPnl.add('group');
      numOptWrapper.alignChildren = 'left';

  var numOpt_1 = numOptWrapper.add('group');
      numOpt_1.orientation = 'column';
      numOpt_1.alignChildren = 'left';

  var isUseAll = numOpt_1.add('checkbox', undefined, 'Number to last text');
  var isShuffle = numOpt_1.add('checkbox', undefined, 'Shuffle numbers order');

  var numOpt_2 = numOptWrapper.add('group');
      numOpt_2.orientation = 'column';
      numOpt_2.alignChildren = 'left';

  var isPadZero = numOpt_2.add('checkbox', undefined, 'Add zeros (e.g. 01, 02)');
  var isRmvTf = numOpt_2.add('checkbox', undefined, 'Remove unused texts');

  var optWrapper = wrapper.add('group');
      optWrapper.alignChildren = ['fill', 'top'];

  // Sort objects
  var sortPnl = optWrapper.add('panel', undefined, 'Sort before numbering');
      sortPnl.alignChildren = 'left';
      sortPnl.margins = [10, 15, 10, 10];

  var isOrder = sortPnl.add('radiobutton', undefined, 'By order in layers');
      isOrder.value = true;
  var isRows = sortPnl.add('radiobutton', undefined, 'By rows (like Z)');
  var isCols = sortPnl.add('radiobutton', undefined, 'By columns (like \u0418)');

  // Replace
  var rplcPnl = optWrapper.add('panel', undefined, 'Replace text to number');
      rplcPnl.alignChildren = 'left';
      rplcPnl.margins = [10, 15, 10, 10];

  var isFullRplc = rplcPnl.add('radiobutton', undefined, 'Full text content');
      isFullRplc.value = true;
  var isNumRplc = rplcPnl.add('radiobutton', undefined, 'Numbers in text');
  var isPhRplc = rplcPnl.add('radiobutton', undefined, 'Only {%n} placeholder');

  // Buttons
  var btns = win.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];
      btns.maximumSize.width = 80;

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

  btns.add('statictext', undefined, 'Preview');
  var prvwList = btns.add('statictext', undefined, '1\n2\n3\n4\n5\n6\n7\n8', {multiline: true});
  prvwList.preferredSize.height = 110;

  var copyright = btns.add('statictext', undefined, 'Visit Github');

  loadSettings(SETTINGS);
  preview();
  
  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  startInp.onChange = endInp.onChange = incInp.onChange = preview;
  isPadZero.onClick = isShuffle.onClick = preview;
  isFullRplc.onClick = isNumRplc.onClick = isPhRplc.onClick = preview;

  isUseAll.onClick = function () {
    endGrp.enabled = !this.value;
    isRmvTf.enabled = !this.value;
    preview();
  }
  
  cancel.onClick = win.close;
  ok.onClick = okClick;

  function okClick() {
    var tolerance = getTolerance(tfs[0]),
        isPad = isPadZero.value,
        isNum = isNumRplc.value,
        isPh = isPhRplc.value;

    if (isRows.value && !isShuffle.value) {
      sortByRows(tfs, tolerance);
    } else if (isCols.value && !isShuffle.value) {
      sortByColumns(tfs, tolerance);
    }

    if (isNum) {
      tfs = filterByString(tfs, '\\d');
    } else if (isPh) {
      tfs = filterByString(tfs, CFG.placeholder);
    }

    var nums = getNumbers(inc, start, end, tfs.length);
    if (isShuffle.value) shuffle(nums);

    var i = 0,
        curNum = 0,
        regex = new RegExp(isNum ? '(\\d+([.,]\\d+)*)' : CFG.placeholder, 'gi');

    while (i < nums.length) {
      curNum = isPad && nums[i] >= 0 ? padZero(nums[i], strLen) : nums[i];
      tfs[i].contents = (isPh || isNum) ? tfs[i].contents.replace(regex, curNum) : curNum;
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

  function preview() {
    var tmp = [].concat(tfs);

    inc = strToNum(incInp.text, 1);
    start = strToNum(startInp.text, 0);
    end = isUseAll.value ? start + (tmp.length - 1) * inc : strToNum(endInp.text, 10);
    strLen = getMaxNumLength(start, end);
    isPad = isPadZero.value;

    if (isNumRplc.value) {
      tmp = filterByString(tmp, '\\d');
    } else if (isPhRplc.value) {
      tmp = filterByString(tmp, CFG.placeholder);
    }

    var nums = getNumbers(inc, start, end, tmp.length);
    if (isShuffle.value) shuffle(nums);

    var i = 0, len = nums.length;
    while (i < len) {
      if (isPad && nums[i] >= 0) {
        nums[i] = padZero(nums[i], strLen);
      }
      i++;
    }

    prvwList.text = getShortArray(nums, 7, 2).join('\n');
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
    pref.ph = isFullRplc.value ? 0 : (isNumRplc.value ? 1 : 2);
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
          else if (pref.ph == 1) isNumRplc.value = true;
          else if (pref.ph == 2) isPhRplc.value = true;
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

// Filter text frames by string
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
function padZero(num, len) {
  num = num.toString();
  while (num.length < len) num = '0' + num;
  return num;
}

// Get first N elements from array and M last
function getShortArray(arr, amt, last) {
  if (arr.length <= amt) {
    return arr;
  } else {
    var first = arr.slice(0, amt - (last + 1));
    var next = '...';
    var last = arr.slice(-last);
    return first.concat(next, last);
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
} catch (e) { }