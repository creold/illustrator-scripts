/*
  TextBlock.jsx for Adobe Illustrator
  Description: Convert selected point text objects into a block of text
  Date: August, 2023
  Modification Date: May, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Original script by Carlos Canto

  Version for Adobe Photoshop:
  https://github.com/creold/photoshop-scripts/blob/master/README.md#textblock

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2.1 Fixed block alignment to artboard center. Text justification changes to center
  0.2 Added option to center text block and hide/remove original layers
  0.1.1 Keeped text editable, sort texts by Y position
  0.1 Initial version by Carlos Canto (12/04/2011)

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
    name: 'Text Block',
    version: 'v0.2.1'
  };

  var CFG = {
    width: '300', // Text Block width
    spacing: '10', // Text lines spacing
    aiVers: parseFloat(app.version),
    isMac: /mac/i.test($.os),
    mgns: [10, 15, 10, 7],
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + "/Adobe Scripts/"
  };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  var abIdx = doc.artboards.getActiveArtboardIndex();

  var texts = getTextFrames(app.selection);
  if (texts.length < 2) {
    alert('Texts not found\nPlease select at least two point texts and try again', 'Script error');
    return;
  }

  // Sort array by Y and X positions
  texts.sort(function (a, b) {
    return comparePosition(a.left, b.left, a.top, b.top);
  });

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.alignChildren = ['fill', 'top'];

  // INPUTS
  var settPnl = win.add('panel', undefined, 'Block Settings');
      settPnl.alignChildren = ['fill', 'top'];
      settPnl.margins = CFG.mgns;

  var wrapper1 = settPnl.add('group');
      wrapper1.alignChildren = ['left', 'center'];

  var wLbl = wrapper1.add('statictext', undefined, 'Width:');
      wLbl.preferredSize.width = 55;
      
  var wInp = wrapper1.add('edittext', undefined, CFG.width + ' pt');
      wInp.preferredSize.width = 80;
      wInp.helpTip = 'Supporterd units:\npx, pt, in, mm, cm, m, ft, yd';
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    wInp.active = true;
  }

  var wrapper2 = settPnl.add('group');
      wrapper2.alignChildren = ['left', 'center'];
  
  var spLbl = wrapper2.add('statictext', undefined, 'Spacing:');
      spLbl.preferredSize.width = 55;

  var spInp = wrapper2.add('edittext', undefined, CFG.spacing + ' pt');
      spInp.preferredSize.width = 80;
      spInp.helpTip = 'Supporterd units:\npx, pt, in, mm, cm, m, ft, yd';

  var isToCenter = settPnl.add('checkbox', undefined, 'Center To Artboard');

  // ORIGINAL LAYERS POST-PROCESS
  var origPnl = win.add('panel', undefined, 'Original Texts');
      origPnl.alignChildren = ['fill', 'top'];
      origPnl.margins = CFG.mgns;

  var isKeep = origPnl.add('radiobutton', undefined, 'Keep');
      isKeep.value = true;
  var isHide = origPnl.add('radiobutton', undefined, 'Hide');
  var isRemove = origPnl.add('radiobutton', undefined, 'Remove');

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'center'];
      btns.spacing = 10;

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

  var copyright = win.add('statictext', undefined, 'Click Here To Visit Github');
      copyright.justify = 'center';

  // EVENTS
  loadSettings(SETTINGS);

  wInp.onChange = spInp.onChange = function () {
    var units = parseUnits(this.text, 'pt');
    var num = strToNum(this.text, CFG.width);
    this.text = num + ' ' + units;
  }

  /**
   * Use Up / Down arrow keys (+ Shift) to change value
   */
  bindStepperKeys(wInp, 0.1, 100000);
  bindStepperKeys(spInp, 0, 100000);

  cancel.onClick = win.close;

  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  function okClick() {
    saveSettings(SETTINGS);

    app.selection = null;

    var wUnits = parseUnits(wInp.text, 'pt');
    var blockWidth = convertUnits( strToNum(wInp.text, CFG.width), wUnits, 'pt' );

    var spUnits = parseUnits(spInp.text, 'pt');
    var blockSpacing = convertUnits( strToNum(spInp.text, CFG.spacing), spUnits, 'pt' );

    // Add a group to final output
    var textGroup = texts[0].layer.groupItems.add();
    textGroup.name = "Text Block";

    var nextTop = 0;
    var posLeft = texts[0].geometricBounds[0];
    var posRight = texts[0].geometricBounds[2];
    var posTop = texts[0].geometricBounds[1];

    // Create text block
    for (var i = texts.length - 1; i >= 0; i--) {
      var currText = texts[i];
      var dupText = currText.duplicate(textGroup, ElementPlacement.PLACEATEND);
      dupText.selected = false;
      var dupCurve = dupText.createOutline(); // Outlined version

      // Calc scale factor
      var pct = blockWidth / dupCurve.width * 100;
      var scaleMatrix = app.getScaleMatrix(pct, pct);

      dupCurve.remove();
      dupText = currText.duplicate(textGroup, ElementPlacement.PLACEATEND);
      dupText.selected = false;
      dupText.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;
      dupText.transform(scaleMatrix);

      dupCurve = dupText.duplicate().createOutline();

      var deltaX = dupText.left - dupCurve.left;
      var deltaY = dupText.top - dupCurve.top;

      dupText.left = deltaX;
      dupText.top = nextTop + deltaY + dupCurve.height + blockSpacing;
      nextTop = dupText.top - deltaY;

      dupCurve.remove();
    }

    // Align text block
    if (isToCenter.value) {
      alignToCenter(doc.artboards[abIdx], textGroup);
    } else if (!isKeep.value) {
      textGroup.position = [posLeft, posTop];
    } else {
      textGroup.position = [posRight, posTop];
    }

    // Original layers
    for(var j = texts.length - 1; j >= 0; j--){
      if (isHide.value) {
        texts[j].hidden = true;
      } else if (isRemove.value) {
        texts[j].remove();
      }
    }

    textGroup.selected = true;

    win.close();
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {Object} input - The input element to which the event listener will be attached
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var units = parseUnits(this.text, 'pt');
      var num = parseFloat(this.text);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (min && (num - step) < min) ? min : num - step;
        this.text += ' ' + units;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (max && (num + step) > max) ? max : num + step;
        this.text += ' ' + units;
        kd.preventDefault();
      }
    });
  }

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
    data.width = wInp.text;
    data.spacing = spInp.text;
    data.isToCenter = isToCenter.value;
    data.original = isKeep.value ? 0 : (isHide.value ? 1 : 2);

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
        wInp.text = data.width;
        spInp.text = data.spacing;
        isToCenter.value = data.isToCenter === 'true';
        origPnl.children[parseInt(data.original)].value = true;
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get an array of TextFrames from a collection
 * @param {(Object|Array)} coll - The collection to search for TextFrames
 * @returns {Array} An array of TextFrame objects
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
 * Compare the positions of two items
 * @param {number} x1 - The x-coordinate of the first item
 * @param {number} x2 - The x-coordinate of the second item
 * @param {number} y1 - The y-coordinate of the first item
 * @param {number} y2 - The y-coordinate of the second item
 * @returns {number} - Returns the difference
 */
function comparePosition(x1, x2, y1, y2) {
  return y2 == y1 ? x1 - x2 : y2 - y1;
}

/**
 * Parse units from a mixed string
 * @param {string} str - The input string containing the numeric value and units (e.g., '10px').
 * @param {string} def - The default units to be returned if no units are found in the input string
 * @returns {string} - The parsed units or the default units if not found
 */
function parseUnits(str, def) {
  var match = str.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)\s*[^a-zA-Z]*$/);

  if (match) {
    var units = match[3].toLowerCase();
    var validUnits = ['px', 'pt', 'in', 'mm', 'cm', 'm', 'ft', 'yd'];

    for (var i = 0; i < validUnits.length; i++) {
      if (units === validUnits[i]) return units;
    }
  }

  return def;
}

/**
* Convert a value from one set of units to another
* @param {string} value - The numeric value to be converted
* @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
* @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
* @returns {number} - The converted value in the specified units
*/
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Convert string to absolute number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Center an item within the artboard
 * @param {Object} ab - The artboard
 * @param {Object} group - The group to be centered
 * @returns {void}
 */
function alignToCenter(ab, group) {
  var dupGroup = group.duplicate();

  var items = dupGroup.pageItems;
  for (var i = 0; i < items.length; i++) {
    if (/text/i.test(items[i].typename)) {
      items[i].createOutline();
    }
  }

  var groupBounds = group.geometricBounds;
  var dupBounds = dupGroup.geometricBounds;

  var deltaX = (dupBounds[0] - groupBounds[0]) + (dupBounds[2] - groupBounds[2]);
  var deltaY = (dupBounds[1] - groupBounds[1]) + (dupBounds[3] - groupBounds[3]);

  dupGroup.remove();

  var abBounds = ab.artboardRect;
  var abCenterX = (abBounds[2] - abBounds[0]) / 2;
  var abCenterY = (abBounds[3] - abBounds[1]) / 2;

  group.position = [
    abBounds[0] + abCenterX - (group.width + deltaX) / 2,
    abBounds[1] + abCenterY + (group.height - deltaY) / 2
  ];
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