/*
  MakeNumbersSequence.jsx for Adobe Illustrator
  Description: Fills a range of selected text objects with numbers incremented based on the input data
  Date: December, 2022
  Modification date: May, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Idea: Egor Chistyakov (@chegr)

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.5.1 Minor improvements. Arrow keys now control number inputs.
  0.5.0 Added input of a fixed number of digits to control leading zeros
  0.4.2 Removed input activation on Windows OS below CC v26.4
  0.4.1 Fixed array of numbers with zero increment
  0.4.0 Redesigned, added dynamic example to side panel
  0.3.0 Added number replacement in a string
  0.2.0 Added sorting by position and placeholder replacement
  0.1.1 Added Shuffle option
  0.1.0 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via CloudTips: https://pay.cloudtips.ru/p/b81d370e
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2026 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// ==========================================
// MAIN FUNCTION
// ==========================================
function main() {
  var SCRIPT = {
        name: 'Make Numbers Sequence',
        version: 'v0.5.1'
      };

  var CFG = {
        placeholder: '{%n}',
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os)
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };
  
  if (!isCorrectEnv('selection:1')) return;

  // INIT DATA
  var tfs = getTextFrames(app.selection).reverse();

  if (!tfs.length) {
    alert('Texts not found\nSelect texts and re-run script', 'Script error');
    return;
  }

  var inc = 0, start = 0, end = 0, strLen = 0;

  // ==========================================
  // DIALOG
  // ==========================================
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'fill'];
      win.opacity = .97;

  var lWrapper = win.add('group');
      lWrapper.orientation = 'column';
      lWrapper.alignChildren = ['fill', 'fill'];

  // ==========================================
  // NUMBERS
  // ==========================================
  var numPnl = lWrapper.add('panel', undefined, 'Numbers');
      numPnl.alignChildren = 'left';
      numPnl.spacing = 15;
      numPnl.margins = [10, 15, 10, 10];

  var inpWrapper = numPnl.add('group');
      inpWrapper.spacing = 15;

  // START NUMBER
  var startGrp = inpWrapper.add('group');

  startGrp.add('statictext', undefined, 'Start:');
  var startInp = startGrp.add('edittext', undefined, 1);
      startInp.preferredSize.width = 48;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    startInp.active = true;
  }

  // END NUMBER
  var endGrp = inpWrapper.add('group');

  endGrp.add('statictext', undefined, 'End:');
  var endInp = endGrp.add('edittext', undefined, 50);
      endInp.preferredSize.width = 48;

  // INCREMENT
  var incGrp = inpWrapper.add('group');

  incGrp.add('statictext', undefined, 'Increment:');
  var incInp = incGrp.add('edittext', undefined, 5);
      incInp.preferredSize.width = 48;

  var numOptWrapper = numPnl.add('group');
      numOptWrapper.alignChildren = ['left', 'top'];

  // OPTIONS. COLUMN #1
  var numOpt_1 = numOptWrapper.add('group');
      numOpt_1.orientation = 'column';
      numOpt_1.alignChildren = 'left';

  var isUseAll = numOpt_1.add('checkbox', undefined, 'Number to Last Text');
  var isShuffle = numOpt_1.add('checkbox', undefined, 'Shuffle Numbers Order');
  var isRmvTf = numOpt_1.add('checkbox', undefined, 'Remove Unused Texts');

  // Divider
  var div = numOptWrapper.add('panel', undefined, undefined);
      div.alignment = 'fill';

  // OPTIONS. COLUMN #2
  var numOpt_2 = numOptWrapper.add('group');
      numOpt_2.orientation = 'column';
      numOpt_2.alignChildren = 'left';

  var isPadZero = numOpt_2.add('checkbox', undefined, 'Add Leading Zeros');
      isPadZero.helpTip = 'E.g. 01, 02, 006, 00005';
      isPadZero.value = true;
  var isAutoZero = numOpt_2.add('radiobutton', undefined, 'Auto Number of Digits');
      isAutoZero.value = true;

  var zeroOpt = numOpt_2.add('group');
  var isCstmZero = zeroOpt.add('radiobutton', undefined, 'Fixed, No Less Than:');
  var zeroInp = zeroOpt.add('edittext', undefined, 3);
      zeroInp.characters = 3;

  var optWrapper = lWrapper.add('group');
      optWrapper.alignChildren = ['fill', 'top'];

  // ==========================================
  // SORT OBJECTS
  // ==========================================
  var sortPnl = optWrapper.add('panel', undefined, 'Sort Items Before Numbering');
      sortPnl.alignChildren = 'left';
      sortPnl.margins = [10, 15, 10, 10];

  var isOrder = sortPnl.add('radiobutton', undefined, 'By Order in Layers');
      isOrder.value = true;
  var isRows = sortPnl.add('radiobutton', undefined, 'By Rows (Z-Pattern)');
  var isCols = sortPnl.add('radiobutton', undefined, 'By Columns (\u0418-Pattern)');

  // ==========================================
  // REPLACE OPTIONS
  // ==========================================
  var rplcPnl = optWrapper.add('panel', undefined, 'Replace Text to Number');
      rplcPnl.alignChildren = 'left';
      rplcPnl.margins = [10, 15, 10, 10];

  var isFullRplc = rplcPnl.add('radiobutton', undefined, 'Full Text Content');
      isFullRplc.value = true;
  var isNumRplc = rplcPnl.add('radiobutton', undefined, 'Numbers in Text');
  var isPhRplc = rplcPnl.add('radiobutton', undefined, 'Only {%n} Placeholder');

  var rWrapper = win.add('group');
      rWrapper.orientation = 'column';
      rWrapper.alignChildren = ['fill', 'fill'];

  // ==========================================
  // BUTTONS
  // ==========================================
  var btns = rWrapper.add('group');
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

  // NUMBER PREVIEW
  btns.add('statictext', undefined, 'Preview');
  var prvwList = btns.add('statictext', undefined, '1\n2\n3\n4\n5\n6\n7\n8', {multiline: true});
      prvwList.preferredSize.height = 140;

  var about = btns.add('button', undefined, '?');
      about.alignment = ['right', 'bottom'];
      about.preferredSize = [25, 25];
      about.helpTip = 'About';

  // ==========================================
  // EVENTS
  // ==========================================
  loadSettings(SETTINGS);
  updatePreviewList();

  startInp.onChange = endInp.onChange = incInp.onChange = updatePreviewList;
  isFullRplc.onClick = isNumRplc.onClick = isPhRplc.onClick = updatePreviewList;
  zeroInp.onChange = isShuffle.onClick = updatePreviewList;

  bindStepperKeys(startInp, -Infinity, Infinity);
  bindStepperKeys(endInp, -Infinity, Infinity);
  bindStepperKeys(incInp, -Infinity, Infinity);

  isPadZero.onClick = function () {
    isAutoZero.enabled = this.value;
    zeroOpt.enabled = this.value;
    updatePreviewList();
  };

  isAutoZero.onClick = function () {
    isCstmZero.value = false;
    zeroInp.enabled = false;
    updatePreviewList();
  };
  
  isCstmZero.onClick = function () {
    isAutoZero.value = false;
    zeroInp.enabled = true;
    updatePreviewList();
  };

  isUseAll.onClick = function () {
    endGrp.enabled = !this.value;
    isRmvTf.enabled = !this.value;
    updatePreviewList();
  };

  about.onClick = function () {
    var helpWin = new Window('dialog', 'About');
        helpWin.alignChildren = ['fill', 'top'];
    
    // Overview section
    var overviewPnl = helpWin.add('panel', undefined, 'Script Overview');
        overviewPnl.alignChildren = ['fill', 'fill'];
        overviewPnl.margins = [10, 15, 10, 8];
      
    var overviewText = overviewPnl.add('statictext', undefined,
        SCRIPT.name + ' ' + SCRIPT.version + '\n\n' + 
        'Fills a range of selected text objects with numbers incremented based on the input data. ' + 
        '\n\nSupports custom sorting patterns, leading zeros, shuffling, and placeholder text replacement.', 
        { multiline: true });
    overviewText.preferredSize.width = 280;
    overviewText.preferredSize.height = 130;

    // Credit
    var authorPnl = helpWin.add('panel', undefined, 'Author');
        authorPnl.alignChildren = ['fill', 'top'];
        authorPnl.spacing = 15;
        authorPnl.margins = [10, 15, 10, 8];

    var authorWrapper = authorPnl.add('group');
        authorWrapper.orientation = 'column';
        authorWrapper.alignChildren = ['fill', 'top'];
        authorWrapper.spacing = 5;

    authorWrapper.add('statictext', undefined, '\u00A9 Sergey Osokin, 2026');

    var mailWrapper = authorWrapper.add('group');
        mailWrapper.spacing = 5;
    mailWrapper.add('statictext', undefined, 'Contact:');
    var mailText = mailWrapper.add('statictext', undefined, 'hi@sergosokin.ru');

    var paidWrapper = authorPnl.add('group');
        paidWrapper.orientation = 'column';
        paidWrapper.alignChildren = ['fill', 'top'];
        paidWrapper.spacing = 5;

    paidWrapper.add('statictext', undefined, 'Paid scripts:');

    var bmcWrapper = paidWrapper.add('group');
        bmcWrapper.spacing = 5;
    bmcWrapper.add('statictext', undefined, '\u2022');
    var bmcText = bmcWrapper.add('statictext', undefined, 'buymeacoffee.com/aiscripts/extras');
    bmcWrapper.add('statictext', undefined, '(USD)');

    var roboWrapper = paidWrapper.add('group');
        roboWrapper.spacing = 5;
    roboWrapper.add('statictext', undefined, '\u2022');
    var roboText = roboWrapper.add('statictext', undefined, 'aiscripts.robo.market');
    roboWrapper.add('statictext', undefined, '(RUB)');

    var freeWrapper = authorPnl.add('group');
        freeWrapper.orientation = 'column';
        freeWrapper.alignChildren = ['fill', 'top'];
        freeWrapper.spacing = 5;

    freeWrapper.add('statictext', undefined, 'Free scripts:');

    var gitText = freeWrapper.add('statictext', undefined, 'github.com/creold');

    var helpBtns = helpWin.add('group');
        helpBtns.alignment = 'right';
    var helpOk = helpBtns.add('button', undefined, 'OK', { name: 'ok' });
    helpOk.onClick = helpWin.close;

    setTextHandler(mailText, function () {
      openURL('mailto:hi@sergosokin.ru')
    });

    setTextHandler(bmcText, function () {
      openURL('https://buymeacoffee.com/aiscripts/extras')
    });

    setTextHandler(roboText, function () {
      openURL('https://aiscripts.robo.market')
    });

    setTextHandler(gitText, function () {
      openURL('https://github.com/creold')
    });

    helpWin.center();
    helpWin.show();
  };

  cancel.onClick = win.close;
  ok.onClick = okClick;

  /**
   * Generate a preview of numbered sequences for text frames based on user inputs
   */
  function updatePreviewList() {
    var tmpTFs = [].concat(tfs);
    var isPad = isPadZero.value;
    var tmpZero = Math.max(1, strToNum(zeroInp.text, 0)); // Total number length

    // Calculate number range and string length for padding
    inc = strToNum(incInp.text, 1);
    start = strToNum(startInp.text, 0);
    end = isUseAll.value ? start + (tmpTFs.length - 1) * inc : strToNum(endInp.text, 10);

    if (start <= end && inc < 0) incInp.text = -inc;
    if (start > end && inc > 0) incInp.text = -inc;

    // Determine max string length for padding (custom or default)
    strLen = getMaxNumLength(start, end, (isPad && isCstmZero.value ? Math.pow(10, tmpZero - 1) : 1));

    // Filter text frames: numeric or placeholder-based
    if (isNumRplc.value) {
      tmpTFs = filterByString(tmpTFs, /\d/);
    } else if (isPhRplc.value) {
      tmpTFs = filterByString(tmpTFs, CFG.placeholder);
    }

    // Generate numbers and apply shuffling if enabled
    var nums = calcNumbers(inc, start, end, tmpTFs.length);
    if (isShuffle.value) shuffle(nums);

    // Apply zero-padding to non-negative numbers
    var i = 0, len = nums.length;
    while (i < len) {
      if (isPad && nums[i] >= 0) {
        nums[i] = padZero(nums[i], strLen);
      }
      i++;
    }

    // Update preview list with a truncated array (7 items, 2 ellipsis)
    prvwList.text = getShortArray(nums, 6, 2).join('\n');
  }

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);

    var isPad = isPadZero.value; // Add zeros
    var isNum = isNumRplc.value; // Numbers in text
    var isPh = isPhRplc.value; // Only placeholder

    // Sorting
    if (isRows.value && !isShuffle.value) {
      tfs = sortByPattern(tfs, { pattern: 'rows', useCenter: true });
    } else if (isCols.value && !isShuffle.value) {
      tfs = sortByPattern(tfs, { pattern: 'columns', useCenter: true });
    }

    // Filter text frames: numeric or placeholder-based
    if (isNum) {
      tfs = filterByString(tfs, /\d/);
    } else if (isPh) {
      tfs = filterByString(tfs, CFG.placeholder);
    }

    // Generate numbers and apply shuffling if enabled
    var nums = calcNumbers(inc, start, end, tfs.length);
    if (isShuffle.value) shuffle(nums);

    // Replacement
    var regex = new RegExp(isNum ? '(\\d+([.,]\\d+)*)' : CFG.placeholder, 'gi');
    var i = 0;
    var curNum = 0;

    while (i < nums.length) {
      curNum = isPad && nums[i] >= 0 ? padZero(nums[i], strLen) : nums[i];
      tfs[i].contents = (isPh || isNum) ? tfs[i].contents.replace(regex, curNum) : curNum;
      i++;
    }

    // Cleanup
    if (isRmvTf.enabled && isRmvTf.value && i < tfs.length) {
      while (i < tfs.length) {
        tfs[i].remove();
        i++;
      }
    }

    win.close();
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {EditText} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text) || 0;
      var isChanged = false;

      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        isChanged = true;
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        isChanged = true;
      }

      if (isChanged) {
        kd.preventDefault();
        if (typeof input.onChange === 'function') input.onChange();
      }
    });
  }

  /**
   * Set up a clickable text handler with hover effects and callback execution
   * @param {StaticText} text - The statictext object to attach handlers to
   * @param {Function} callback - The function to execute on click
   */
  function setTextHandler(text, callback) {
    var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
    var gfx = text.graphics;
    var colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.8, 0.8, 0.8] : [0.3, 0.3, 0.3], 1); // Black
    var colHover = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.27, 0.62, 0.96] : [0.08, 0.45, 0.9], 1); // Blue

    gfx.foregroundColor = colNormal;

    // Hover effect: change color on mouseover
    text.addEventListener('mouseover', function () {
      gfx.foregroundColor = colHover;
      text.notify('onDraw');
    });

    // Revert color to normal
    text.addEventListener('mouseout', function () {
      gfx.foregroundColor = colNormal;
      text.notify('onDraw');
    });

    // Execute callback on click if provided
    text.addEventListener('mousedown', function () {
      if (typeof callback === 'function') callback(text);
    });
  }

  /**
   * Save UI options to a file
   * @param {Object} prefs - Object containing preferences
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
    data.start = startInp.text;
    data.end = endInp.text;
    data.inc = incInp.text;
    data.all = isUseAll.value;
    data.rndm = isShuffle.value;
    data.rmv = isRmvTf.value;
    data.zero = isPadZero.value;
    data.auto = isAutoZero.value;
    data.total = zeroInp.text;
    data.sort = isOrder.value ? 0 : (isRows.value ? 1 : 2);
    data.ph = isFullRplc.value ? 0 : (isNumRplc.value ? 1 : 2);

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   * @param {Object} prefs - Object containing preferences
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
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];

        startInp.text = data.start;
        endInp.text = data.end;
        incInp.text = data.inc;

        isUseAll.value = data.all === 'true';
        isShuffle.value = data.rndm === 'true';
        isRmvTf.value = data.rmv === 'true';

        isPadZero.value = data.zero === 'true';
        isAutoZero.value = data.auto === 'true';
        isAutoZero.enabled = isPadZero.value;
        isCstmZero.value = !isAutoZero.value;
        zeroInp.text = parseInt(data.total) || 0;
        zeroOpt.enabled = isPadZero.value && isCstmZero.value;
        isCstmZero.enabled = isPadZero.value && isCstmZero.value;
        zeroInp.enabled = isPadZero.value && isCstmZero.value;

        sortPnl.children[parseInt(data.sort) || 0].value = true;
        rplcPnl.children[parseInt(data.ph) || 0].value = true;
      }

      endGrp.enabled = !isUseAll.value;
      isRmvTf.enabled = !isUseAll.value;
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @returns {boolean} Continue or abort script
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
          alert('Few objects are selected\nPlease select at least ' + rqdLen + ' text(s) and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get an array of TextFrames from a collection
 * @param {Object|Array} coll - The collection to search for TextFrames
 * @returns {Array} tfs - An array of TextFrame objects
 */
function getTextFrames(coll) {
  var tfs = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename)) {
      tfs.push(coll[i]);
    } else if (/group/i.test(coll[i].typename)) {
      tfs = tfs.concat(getTextFrames(coll[i].pageItems));
    }
  }

  return tfs;
}

/**
 * Converts a string to a number, handling commas and non-numeric characters
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} Returns the numeric value of the string or the default value if the conversion fails
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Get maximum length of numbers among the provided arguments
 * @param {...number} arguments - The numbers to compare
 * @returns {number} max - The maximum length of numbers among the provided arguments
 */
function getMaxNumLength() {
  var max = 0;

  for (var i = 0, len = arguments.length; i < len; i++) {
    var arg = arguments[i];
    if (typeof arg === 'number' && !isNaN(arg)) {
      var intPart = Math.floor(Math.abs(arg));
      var numLength = intPart.toString().length;
      if (numLength > max) max = numLength;
    }
  }

  return max;
}

/**
 * Filter an array of Text Frames by a given string
 * @param {Array} tfs - An array of TextFrame objects to filter
 * @param {string|RegExp} pattern - The string or RegExp to filter Text Frames by
 * @returns {Array} res - An array of TextFrame objects that match the filtering string
 */
function filterByString(tfs, pattern) {
  var res = [];
  var regex;

  if (pattern instanceof RegExp) {
    regex = pattern;
  } else {
    var escapedStr = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    regex = new RegExp(escapedStr, 'i');
  }

  for (var i = 0, len = tfs.length; i < len; i++) {
    if (tfs[i].contents.length && regex.test(tfs[i].contents)) {
      res.push(tfs[i]);
    }
  }

  return res;
}

/**
 * Calculate numbers within a specified range with a given increment
 * @param {number} inc - The increment between each calculated number
 * @param {number} start - The starting number of the range
 * @param {number} end - The ending number of the range
 * @param {number} amt - The maximum amount of numbers to calculate
 * @returns {Array} res - An array of numbers calculated from the specified range and increment
 */
function calcNumbers(inc, start, end, amt) {
  var res = [];

  if (inc === 0) {
    for (var i = 0; i < amt; i++) res.push(start);
    return res;
  }

  var isIncreasing = start <= end;

  if (isIncreasing && inc < 0) inc = -inc;
  if (!isIncreasing && inc > 0) inc = -inc;

  var curNum = start;
  var count = 0;

  while (count < amt) {
    if (isIncreasing && curNum > end) break;
    if (!isIncreasing && curNum < end) break;

    res.push(curNum);

    count++;
    curNum = start + count * inc;
  }

  return res;
}

/**
 * Shuffle the elements of an array randomly
 * @param {Array} arr - The array to shuffle
 * @returns {Array} arr - The shuffled array
 */
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

/**
 * Add leading zeros to a number to make it of a specified length
 * @param {number} num - The number to pad with leading zeros
 * @param {number} len - The desired length of the resulting padded number
 * @returns {string} num - The number with leading zeros
 */
function padZero(num, len) {
  var parts = num.toString().split('.');
  var intPart = parts[0];
  var decPart = parts[1];

  while (intPart.length < len) {
    intPart = '0' + intPart;
  }

  if (decPart !== undefined) return intPart + '.' + decPart;

  return intPart;
}

/**
 * Retrieve a shortened version of an array, including the first N elements and the last M elements, with ellipsis in between
 * @param {Array} arr - The array to shorten
 * @param {number} amt - The number of elements to include from the beginning of the array
 * @param {number} last - The number of elements to include from the end of the array
 * @returns {Array} A shortened version of the array with ellipsis separating the elements
 */
function getShortArray(arr, amt, last) {
  if (arr.length <= (amt + last)) {
    return arr.slice();
  }

  var firstPart = arr.slice(0, amt);
  var lastPart = last > 0 ? arr.slice(-last) : [];
  var ellipsis = '...';
  return firstPart.concat(ellipsis, lastPart);
}

/**
 * Sort an array of items by their geometric bounds in rows or columns
 * @param {Array} items - Array of items to sort
 * @param {Object} [options] - Sorting options
 * @returns {Array} res - Sorted array of PageItem objects
 */
function sortByPattern(items, options) {
  options = options || {};
  var pattern = options.pattern || 'rows';
  var tolerance = options.tolerance || autoTolerance(items, pattern === 'rows' ? 'y' : 'x');
  var useCenter = options.useCenter !== false;

  var arr = [];
  for (var i = 0; i < items.length; i++) {
    var gb = items[i].geometricBounds;
    arr.push({
      item: items[i],
      x: useCenter ? (gb[0] + gb[2]) / 2 : gb[0], // Left or center X
      y: useCenter ? (gb[1] + gb[3]) / 2 : gb[1] // Top or center Y
    });
  }

  // Rows: Y > X
  if (pattern === 'rows') {
    arr.sort(function (a, b) {
      if (Math.abs(b.y - a.y) <= tolerance) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });
  }
  // Columns: X > Y
  else {
    arr.sort(function (a, b) {
      if (Math.abs(a.x - b.x) <= tolerance) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });
  }

  var res = [];
  for (var i = 0; i < arr.length; i++) res.push(arr[i].item);
  return res;
}

/**
 * Calculate an automatic tolerance for sorting based on the median size of items
 * @param {Array} items - Array of items
 * @param {string} axis - Axis to calculate tolerance for ('x' or 'y')
 * @returns {number} Half the median width/height of the items
 */
function autoTolerance(items, axis) {
  if (items.length < 2) return 0;

  var res = [];

  for (var i = 0; i < items.length; i++) {
    var bnds = items[i].geometricBounds;
    res.push(axis === 'x'
      ? Math.abs(bnds[2] - bnds[0]) // Width
      : Math.abs(bnds[1] - bnds[3]) // Height
    );
  }

  res.sort(function (a, b) {
    return a - b;
  });

  return res[Math.floor(res.length / 2)] / 2;
}

/**
 * Open a URL in the default web browser
 * @param {string} url - The URL to open in the web browser
 * @returns {void}
 */
function openURL(url) {
  var path = Folder.myDocuments + '/Adobe Scripts/';
  if (!Folder(path).exists) Folder(path).create();
  var html = new File(path + '/aisLink.html');
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
} catch (e) { }