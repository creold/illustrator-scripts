/*
  ReplaceFormattedText.jsx for Adobe Illustrator
  Description: Paste text from the clipboard without formatting, preserving the paragraph styles of the original text
  Date: December, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
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
  if (!isCorrectEnv('selection')) return;
  polyfills();

  var tfs = getTextFrames(selection);

  if (!tfs.length) {
    alert('Text not selected\nPlease, select at least one TextFrame', 'Script error');
    return;
  }

  var clip = getClipboard();

  tfs.forEach(function (e) {
    replaceContent(e, clip);
  });
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

// Setup JavaScript Polyfills
function polyfills() {
  Array.prototype.forEach = function (callback, startPos, inc) {
    startPos = startPos || 0;
    inc = inc || 1;
    for (var i = startPos; i < this.length; i += inc)
      callback(this[i], i, this);
  };
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

// Get TextFrames array from collection
function getTextFrames(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    if (/text/i.test(coll[i].typename))
      out.push(coll[i]);
    else if (/group/i.test(coll[i].typename))
      out = out.concat( getTextFrames(coll[i].pageItems) );
  }
  return out;
}

// Get text content from clipboard
function getClipboard() {
  var sel = selection,
      clip = '';
  app.paste();
  clip = selection[0].contents;
  selection[0].remove();
  selection = sel;
  return clip;
}

function replaceContent(tf, clip) {
  var pa = get(tf.paragraphs),
      styles = [];

  try {
    pa.forEach(function (e) {
      if (e.contents.trim().length) {
        styles.push( copyProps(e.characters[0].characterAttributes) );
      }
    });
  } catch (err) {}

  tf.contents = clip; // Replace original text
  pa = get(tf.paragraphs);

  var style = null,
      idx = 0;

  pa.forEach(function (e) {
    if (e.contents.trim().length) {
      style = styles[idx] ? styles[idx] : styles[styles.length - 1];
      pasteProps(style, e.characterAttributes);
      idx++;
    }
  });
}

// Convert collection into standard Array
function get(coll) {
  var out = [];
  for (var i = 0, len = coll.length; i < len; i++) {
    out.push(coll[i]);
  }
  return out;
}

// Copy object properties
function copyProps(o) {
  var p = {};
  for (var k in o) {
    if (o.hasOwnProperty(k)) {
      try {
        p[k] = o[k];
      } catch (err) {} // Skip undefined properties
    }
  }
  return p;
}

// Paste object properties
function pasteProps(o1, o2) {
  for (var k in o1) {
    // Fix Illustrator bug with empty text color
    if (/weight/i.test(k) && /nocolor/i.test(o1.strokeColor))
      o2.strokeWeight = 0;
    else
      o2[k] = o1[k];
  }
}

// Run script
try {
  main();
} catch (err) {}