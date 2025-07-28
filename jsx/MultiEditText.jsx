/*
  MultiEditText.jsx for Adobe Illustrator
  Description: Bulk editing of text frame contents. Replaces content separately or with the same text
  Date: March, 2024
  Modification date: July, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  *******************************************************************************************
  * WARNING: The script does not support the mixed appearance of characters in a text frame *
  *******************************************************************************************

  Release notes:
  0.3.1 Added Japanese localization
  0.3 Added button to reset texts, saving entered texts when switching options
  0.2.2 Fixed paragraph formatting with soft line breaks
  0.2.1 Added Shift+Enter shortcut to insert soft line break
  0.2 Added option to keep paragraph formatting (experimental)
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
$.localize = true; // Automatic UI localization

// Main function
function main() {
  var SCRIPT = {
        name: { ja: '複数テキスト一括編集', en: 'Multi-edit Text' },
        version: 'v0.3.1'
      };

  var CFG = {
        width: 300, // Text area width, px
        height: 280, // Text area height, px
        ph: '<text>', // Content display placeholder
        divider: '\n@@@\n', // Symbol for separating multiple text frames
        softBreak: '@#', // Soft line break char
        coordTolerance: 10, // Object alignment tolerance for sorting
        aiVers: parseFloat(app.version),
        is2020: parseInt(app.version) == 24, // Current AI is CC 2020
        isMac: /mac/i.test($.os)
      };

  var LANG = {
    error: { ja: 'スクリプトエラー', en: 'Script error' },
    alertApp: { ja: 'アプリケーションが違います\nAdobe Illustratorで実行してください', 
                en: 'Wrong application\nRun script from Adobe Illustrator' },
    alertDoc: { ja: 'ドキュメントが開かれていません。\nドキュメントを開いて再実行してください',
                en: 'No documents\nOpen a document and try again' },
    alertSelection: { ja: 'テキストが見つかりません\n1つ以上のテキストオブジェクトを選択して再実行してください',
                      en: 'Texts not found\nPlease select at least 1 text object and try again' },
    alertPreview: { ja: 'CC 2020では重大なバグのためプレビューは無効です',
                    en: 'Preview disabled for CC 2020\ndue to critical bug' },
    keepFormat: { ja: '書式を保持', en: 'Keep Para Format' },
    editSeparately: { ja: '個別に編集', en: 'Edit Separately' },
    listByXY: { ja: '座標で並び替え', en: 'List by XY' },
    reverseApply: { ja: '逆順に適用', en: 'Reverse Apply' },
    preview: { ja: 'プレビュー', en: 'Preview' },
    cancel: { ja: 'キャンセル', en: 'Cancel' },
    ok: { ja: 'OK', en: 'OK' },
    wait: { ja: '待って...', en: 'Wait...' },
    reset: { ja: 'リセット', en: 'Reset' },
    github: { ja: 'Githubを開く', en: 'Visit Github' },
    helpInput: {
      ja: '新しい行で' + CFG.divider.replace(/\n/g, '') + 'を挿入してテキストオブジェクトを区切ります\nShift+Enterでソフト改行を挿入',
      en: 'Insert ' + CFG.divider.replace(/\n/g, '') + ' on a new line\nto separate text objects\n\nUse Shift+Enter to insert soft\nline break special char'
    },
    helpCancel: { ja: 'Escキーで閉じる', en: 'Press Esc to Close' },
    helpReset: { ja: '元のテキストに戻す', en: 'Reset to original texts' },
    helpOk: { ja: 'Enterキーで実行', en: 'Press Enter to Run' },
    helpFormat: { ja: '書式を保持します。\n文字量が多いと処理が遅くなります',
                  en: 'Keep paragraphs formatting.\nText length affects script\nperformance' },
    helpSeparate: { ja: 'テキストを個別に編集', en: 'Edit each text frame\nindividually' },
    helpSort: { ja: '上→下、左→右にテキストを並べます', en: 'List text frames\nsorted by position' },
    helpReverse: { ja: 'テキストの内容を逆順に置換します', en: 'Replace the contents\nof text frames in\nreverse order' },
  };

  var SETTINGS = {
    name: SCRIPT.name.en.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!/illustrator/i.test(app.name)) {
    alert(LANG.alertApp, LANG.error);
    return;
  }

  if (!app.documents.length) {
    alert(LANG.alertDoc, LANG.error);
    return;
  }

  // INIT DATA
  var tfs = getTextFrames(app.selection);
  if (!tfs.length) {
    alert(LANG.alertSelection, LANG.error);
    return;
  }

  var isUndo = false;

  var sortedTfs = [].concat(tfs);
  sortByPosition(sortedTfs, CFG.coordTolerance);

  var tfContents = extractContents(tfs, CFG.softBreak);
  var sortedTfContents = extractContents(sortedTfs, CFG.softBreak);

  var placeholder = isEqualContents(tfs, CFG.softBreak) ? tfs[0].contents.replace(/\x03/g, CFG.softBreak) : CFG.ph;
  var tmpText = {
    union: '',
    separate: ''
  };

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];

  // INPUT
  var input = win.add('edittext', [0, 0, CFG.width, CFG.height], placeholder, {multiline: true, scrolling: true });
      input.helpTip = LANG.helpInput;
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    input.active = true;
  }

  // OPTIONS AND BUTTONS
  var opt = win.add('group');
      opt.orientation = 'column';
      opt.alignChildren = ['fill', 'center'];

  var isFormat = opt.add('checkbox', undefined, LANG.keepFormat);
      isFormat.helpTip = LANG.helpFormat;
  var isSeparate = opt.add('checkbox', undefined, LANG.editSeparately);
      isSeparate.helpTip = LANG.helpSeparate;
  var isSort = opt.add('checkbox', undefined, LANG.listByXY);
      isSort.helpTip = LANG.helpSort;
      isSort.enabled = isSeparate.value;
  var isReverse = opt.add('checkbox', undefined, LANG.reverseApply);
      isReverse.helpTip = LANG.helpReverse;
      isReverse.enabled = isSeparate.value;

  var cancel, ok;
  if (CFG.isMac) {
    cancel = opt.add('button', undefined, LANG.cancel, { name: 'cancel' });
    reset = opt.add('button', undefined, LANG.reset, { name: 'reset' });
    ok = opt.add('button', undefined, LANG.ok, { name: 'ok' });
  } else {
    ok = opt.add('button', undefined, LANG.ok, { name: 'ok' });
    reset = opt.add('button', undefined, LANG.reset, { name: 'reset' });
    cancel = opt.add('button', undefined, LANG.cancel, { name: 'cancel' });
  }

  cancel.helpTip = LANG.helpCancel;
  reset.helpTip = LANG.helpReset;
  ok.helpTip = LANG.helpOk;

  var isPreview = opt.add('checkbox', undefined, LANG.preview);

  var copyright = opt.add('statictext', undefined, LANG.github);
  copyright.justify = 'center';

  // EVENTS
  loadSettings(SETTINGS);

  // CC 2020 v24.3 crashes when undoing text frame changes
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = LANG.alertPreview;
  }

  isFormat.onClick = function () {
    isPreview.enabled = !this.value;
    preview();
  };

  isSeparate.onClick = function () {
    isSort.enabled = this.value;
    isReverse.enabled = this.value;
    input.text = getInputText(placeholder);
    win.update();
    preview();
  };

  isSort.onClick = function () {
    preview();
  }

  isReverse.onClick = function () {
    input.text = reverseText(input.text, CFG.divider);
    win.update();
    preview();
  }

  input.onChange = input.onChanging = function () {
    if (isSeparate.value) tmpText.separate = this.text;
    else tmpText.union = this.text;
    preview();
  }

  isPreview.onClick = preview;

  // Insert soft line break char
  input.addEventListener('keydown', function (kd) {
    var isShift = ScriptUI.environment.keyboardState['shiftKey'];
    if (isShift && kd.keyName === 'Enter') {
      this.textselection = CFG.softBreak;
      kd.preventDefault();
      preview();
    }
  });

  reset.onClick = function () {
    tmpText.separate = '';
    tmpText.union = '';
    input.text = getInputText(placeholder);

    preview();

    this.active = true;
    this.active = false;

    input.active = true;
    win.update();
  }

  cancel.onClick = win.close;

  ok.onClick = function () {
    if (isPreview.value && isUndo) app.undo();
    ok.text = LANG.wait;
    win.update();
    changeTexts();
    isUndo = false;
    saveSettings(SETTINGS);
    win.close();
  }

  /**
   * Retrieve the text based on the configuration settings and temporary text storage
   *
   * @param {string} def - The default text to return if no valid text is found
   * @returns {string} - The processed text
   */
  function getInputText(def) {
    var str = (isSort.value ? sortedTfContents : tfContents).join(CFG.divider);
    if (isSeparate.value) {
      return !isEmpty(tmpText.separate) ? tmpText.separate : (isReverse.value ? reverseText(str, CFG.divider) : str);
    } else {
      return !isEmpty(tmpText.union) ? tmpText.union : def;
    }
  }

  /**
   * Toggles the preview mode for text changes
   */
  function preview() {
    if (CFG.is2020) return;
    try {
      if (isPreview.enabled && isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        changeTexts();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  /**
   * Change the text content of selected text frames based on the provided input text
   */
  function changeTexts() {
    var tmpPath = app.selection[0].layer.pathItems.add();
    tmpPath.name = 'Remove_Path';

    if (isEmpty(input.text)) return;

    // Create a regular expression for soft breaks
    var regex = new RegExp(CFG.softBreak, 'gmi');

    // Handle separate text replacement mode
    if (isSeparate.value) {
      var srcTfs = [].concat(isSort.value ? sortedTfs : tfs);
      // Split the input text using the configured divider
      var texts = input.text.replace(regex, '\x03').split(CFG.divider);
      // Determine the minimum length to avoid out-of-bounds errors
      var min = Math.min(srcTfs.length, texts.length);

      for (var i = 0; i < min; i++) {
        var tf = srcTfs[i];
        if (tf.contents !== texts[i]) {
          replaceContent(tf, texts[i], isFormat.value);
        }
      }
    } else {
      // Handle combined text replacement mode
      for (var i = 0, len = tfs.length; i < len; i++) {
        var tf = tfs[i];
        // Replace placeholders in the input text with the original content of the text frame
        var str = input.text.replace(/<text>/gi, tfContents[i]).replace(regex, '\x03');
        if (tf.contents !== str) {
          replaceContent(tf, str, isFormat.value);
        }
      }
    }
  }

  win.onClose = function () {
    $.locale = null;
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    try {
      var tmpPath = app.activeDocument.pathItems.getByName('Remove_Path');
      tmpPath.remove();
    } catch (err) {}
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  /**
   * Save UI options to a file
   *
   * @param {object} prefs - Object containing preferences
   */
  function saveSettings(prefs) {
    if (!Folder(prefs.folder).exists) {
      Folder(prefs.folder).create();
    }

    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');

    var data = {};
    data.formatting = isFormat.value;
    data.separated = isSeparate.value;
    data.sorted = isSort.value;
    data.reversed = isReverse.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
   *
   * @param {object} prefs - Object containing preferences
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
        isFormat.value = data.formatting === 'true';
        isSeparate.value = data.separated  === 'true';
        isSort.value = data.sorted  === 'true';
        isSort.enabled = isSeparate.value;
        isReverse.value = data.reversed === 'true';;
        isReverse.enabled = isSeparate.value;
        isPreview.enabled = !isFormat.value;
        input.text = getInputText(placeholder);
      }
    } catch (err) {
      return;
    }
  }

  win.center();
  win.show();
}

/**
 * Get an array of TextFrames from a given collection
 * 
 * @param {Array} coll - The collection to search for TextFrames
 * @returns {Array} tfs - An array containing TextFrames found in the collection
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
 * Sort items based on their position
 * 
 * @param {(Object|Array)} coll - Collection to be sorted
 * @param {number} tolerance - The tolerance within which objects are considered to have the same top position
 */
function sortByPosition(coll, tolerance) {
  if (arguments.length == 1 || tolerance == undefined) {
    tolerance = 10;
  }

  coll.sort(function(a, b) {
    if (Math.abs(b.top - a.top) <= tolerance) {
      return a.left - b.left;
    }
    return b.top - a.top;
  });
}

/**
 * Extract the contents of TextFrames from a given collection
 * 
 * @param {Array} coll - The collection of TextFrames
 * @param {string} softBreak - The soft line break special char
 * @returns {Array} result - An array containing the contents of TextFrames
 */
function extractContents(coll, softBreak) {
  var result = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    // Replace End of Text (ETX) to line break
    result.push(coll[i].contents.replace(/\x03/g, softBreak));
  }

  return result;
}

/**
 * Check if the contents of all TextFrames in the collection are equal
 * 
 * @param {Array} coll - The collection of TextFrames to compare
 * @param {string} softBreak - The soft line break special char
 * @returns {boolean} - Return true if all TextFrames have equal contents, otherwise false
 */
function isEqualContents(coll, softBreak) {
  var str = coll[0].contents.replace(/\x03/g, softBreak);

  for (var i = 1, len = coll.length; i < len; i++) {
    if (coll[i].contents.replace(/\x03/g, softBreak) !== str) return false;
  }

  return true;
}

/**
 * Reverse the order of texts within a string separated by a specified divider
 * @param {string} str - The delimited string to reverse
 * @param {string} divider - The divider used to split
 * @returns {string} str - A reversed string
 */
function reverseText(str, divider) {
  var tmp = str.split(divider);

  tmp.reverse();
  var str = tmp.join(divider);

  return str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 *
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} - True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Replace the content of a text frame and optionally retains the original paragrah appearance
 *
 * @param {Object} tf - The text frame to replace the content
 * @param {string} str - The new content to replace the original text with
 * @param {boolean} isKeepStyle - Determines whether to keep the original paragrah appearance
 */
function replaceContent(tf, str, isKeepStyle) {
  if (!/text/i.test(tf.typename)) return;

  if (!isKeepStyle) {
    tf.contents = str;
    return;
  }

  var paras = getParagraphs(tf);
  var styles = [];
  // Whitelist of paragraph attributes (short keys)
  var paraKeys = [
    'attributes', 'font', 'color', 'size', 'scale', 'leading', 'tracking', 'baseline', 'rotation', 
    'kerning', 'capitalization', 'italics', 'language', 'alignment', 'overprint', 'stroke', 'underline',
    'strikeThrough', 'justification', 'indent', 'space', 'tab', 'romanHanging', 'direction', 'composer'
    ];

  try {
    for (var i = 0; i < paras.length; i++) {
      if (!trim(paras[i].contents).length) continue;
      styles.push( getProps(paras[i], paraKeys) );
    }
  } catch (err) {}


  // Replace original text
  tf.contents = str;
  paras = getParagraphs(tf);

  var style = null;
  var idx = 0;

  for (var j = 0; j < paras.length; j++) {
    if (!trim(paras[j].contents).length) continue;
    style = styles[idx] ? styles[idx] : styles[styles.length - 1];
    pasteProps(style, paras[j]);
    idx++;
  }
}

/**
 * Remove leading and trailing whitespace from a string
 *
 * @param {string} str - The string to trim
 * @returns {string} str - The trimmed string
 */
function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Collect specified properties from an object
 *
 * @param {Object} obj - The object to get properties from
 * @param {Array} whiteList - An array of property names to collect
 * @returns {Object} props - An object containing the copied properties
 */
function getProps(obj, whiteList) {
  var props = {};
  var regex = new RegExp(whiteList.join('|'), 'i');

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    if (!regex.test(key)) continue;
    try {
      props[key] = obj[key];
    } catch (err) {
      // Skip undefined properties
    }
  }

  return props;
}

/**
 * Paste properties from one object to another
 *
 * @param {Object} props - The object containing properties to paste
 * @param {Object} obj - The object to paste properties into
 */
function pasteProps(props, obj) {
  for (var key in props) {
    // Fix Illustrator bug with empty text color
    if (/weight/i.test(key) && /nocolor/i.test(props.strokeColor)) {
      obj.strokeWeight = 0;
    } else {
      obj[key] = props[key];
    }
  }
}

/**
 * Get valid paragraphs from a text frame without soft line breaks
 * Based on https://community.adobe.com/t5/illustrator-discussions/issue-while-using-force-line-break/td-p/12990331 by m1b
 *
 * @param {Object} obj - The object containing the story
 * @returns {Array} paras - An array of objects representing paragraphs
 */
function getParagraphs(obj) {
  if (!obj.hasOwnProperty('story')) return;
  // Return native paragraphs
  // because AI older than CC 2018 does not have 'start', 'end' keys in textRanges
  if (parseInt(app.version) < 22) return obj.paragraphs;

  var story = obj.story;
  var txt = story.textRange.contents;
  var regex = /\u000D/g; // Carriage returns
  var lastStart = 0;
  var paras = [];
  var para;

  // Add paragraphs between carriage returns
  regex.lastIndex = 0;
  while ((regex.exec(txt)) !== null) {
    para = story.textRange.textRanges[lastStart];
    para.start = lastStart;
    para.end = regex.lastIndex - 1;
    paras.push(para);
    lastStart = regex.lastIndex;
  }

  // Add last paragraph
  if (regex.lastIndex > 0 && regex.lastIndex <= txt.length - 1) {
    para = story.textRange.textRanges[lastStart];
    para.start = regex.lastIndex;
    para.end = txt.length;
    paras.push(para);
  }

  return paras;
}

/**
 * Open a URL in the default web browser
 * 
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
 *
 * @param {Object} obj - The object to serialize
 * @returns {string} - A JSON-like string representation of the object
 */
function stringify(obj) {
  var json = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key].toString();
      value = value
        .replace(/\t/g, "\\t")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"');
      json.push('"' + key + '":"' + value + '"');
    }
  }
  return "{" + json.join(",") + "}";
}

// Run script
try {
  main();
} catch (err) {}