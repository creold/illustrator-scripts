/*
  StrokesWeightUp.jsx for Adobe Illustrator
  Description: Increases the weight of the strokes of the selected paths relative to the current weight
  Date: October, 2022
  Modification date: July, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3 Added dialog for scaling by percentage or delta. Added support for editable text objects
  0.2.2 Added size correction in large canvas mode
  0.2.1 Minor improvements
  0.2 Gets the app preferences of the stroke units
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
  var CFG = {
        units : getPrefUnits(),
        isRound: true, // Round stroke width
        isAddStroke: false, // Add stroke if not exists
        defWidth: 0.1 // Default value for added stroke
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  if (!app.selection.length || selection.typename === 'TextRange') {
    alert('Few objects are selected\nPlease select one or more objects and try again', 'Script error');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var sel = app.selection;
  var items = getItems(app.selection);
  
  if (CFG.isAddStroke) app.selection = null;

  if (ScriptUI.environment.keyboardState.altKey) {
    invokeUI(items, CFG);
  } else {
    for (var i = 0, len = items.length; i < len; i++) {
      increaseStrokeWidth(items[i], CFG, undefined, undefined);
    }
  }

  if (CFG.isAddStroke) app.selection = sel;
}

/**
 * Get the stroke width units from Preferences > Units > Stroke
 * 
 * @returns {string} units - The units for stroke width
 */
function getPrefUnits() {
  var key = app.preferences.getIntegerPreference('strokeUnits');
  var units = 'pt';
  switch (key) {
    case 0:
      units = 'in';
      break;
    case 1:
      units = 'mm';
      break;
    case 2:
      units = 'pt';
      break;
    case 3:
      units = 'pc';
      break;
    case 4:
      units = 'cm';
      break;
    case 6:
      units = 'px';
      break;
  }
  return units;
}

/**
 * Get items from an Adobe Illustrator collection, including nested pageItems
 * Filter items based on type, excluding non-relevant items
 * 
 * @param {Object} coll - The Adobe Illustrator collection to retrieve items from
 * @returns {Array} result - Return a JavaScript Array containing relevant items from the given collection
 */
function getItems(coll) {
  var result = [];
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (isType(item, 'group') && item.pageItems.length) {
      result = [].concat(result, getItems(item.pageItems));
    } else if (isType(item, '^compound') && item.pathItems.length) {
      result.push(item.pathItems[0]);
    } else if (isType(item, 'path|text')) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Check the item typename by short name
 * 
 * @param {Object} item - Item to be checked
 * @param {string} type - The shortened type to check against. Case-insensitive
 * @returns {boolean} Returns true if the item's typename matches the specified type
 */
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
}

/**
 * Display a UI dialog for adjusting stroke width
 *
 * @param {Array} items - The paths and texts to be processed
 * @param {Object} CFG - Default settings
 */
function invokeUI(items, CFG) {
  var json = {
        name: 'Strokes_Weight_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };
  var isUndo = false;
  var max = 1000;
  var tmpPercent = 150, tmpDelta = 1.5;

  var win = new Window('dialog', 'Strokes Weight v0.3');
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = .96;

  var wrapper = win.add('group');
      wrapper.alignChildren = ['fill', 'center'];
      wrapper.orientation = 'column';

  // PERCENT OR DELTA
  var typePnl = wrapper.add('panel', undefined, 'Adjust Type');
      typePnl.orientation = 'row';
      typePnl.alignChildren = ['fill','top'];
      typePnl.margins = [10, 15, 10, 7];

  var isPercent = typePnl.add('radiobutton', undefined, 'By Percentage');
      isPercent.value = true;
      isPercent.helpTip = 'Scale stroke width percentage\ngreater or less than 100%';

  var isDelta = typePnl.add('radiobutton', undefined, 'By Numeric Delta');
      isDelta.helpTip = 'Adjust stroke width to delta value.\nCan enter a negative number';

  // INPUTS
  var inpPnl = wrapper.add('panel', undefined, 'Value');
      inpPnl.orientation = 'row';
      inpPnl.alignChildren = ['left', 'center'];
      inpPnl.margins = [10, 15, 10, 7];

  var slider = inpPnl.add('slider', undefined, 150, 0, 1000);
      slider.enabled = isPercent.value;
      slider.preferredSize.width = 140;

  var inp = inpPnl.add('edittext', undefined, isPercent.value ? tmpPercent : tmpDelta);
      inp.active = true;
      inp.preferredSize.width = 50;

  var inpUnits = inpPnl.add('statictext', undefined, isPercent.value ? '%' : CFG.units);
      inpUnits.preferredSize.width = 25;

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'row';
      btns.alignChildren = ['fill', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview',  { name: 'preview' });
      isPreview.alignment = 'left';

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok',  { name: 'ok' });

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  loadSettings(json);

  // CC 2020 v24.3 has the problem
  if (hasTextFrame(items) && parseInt(app.version) === 24) {
    isPreview.enabled = false;
    isPreview.active = false
    isPreview.helpTip = 'Preview disabled for CC 2020\ndue to critical bug'
  }

  shiftInputNumValue(inp, max);

  // EVENTS
  if (isPreview.value) preview();
  isPreview.onClick = preview;

  isPercent.onClick = function () {
    inp.text = tmpPercent;
    slider.enabled = true;
    inpUnits.text = '%';
    preview();
  }

  isDelta.onClick = function () {
    inp.text = tmpDelta;
    slider.enabled = false;
    inpUnits.text = CFG.units;
    preview();
  }

  slider.onChanging = function () {
    this.value = parseInt(this.value);
    inp.text = this.value;
    tmpPercent = this.value;
  }

  slider.onChange = preview;
  
  inp.onChange = function () {
    var value = strToNum(this.text, isPercent.value ? 100 : 1);

    if (isPercent.value) {
      value = Math.abs(value);
      if (value > max) value = max;
    }

    this.text = value;
    if (isPercent.value) {
      slider.value = parseFloat(this.text);
      tmpPercent = inp.text;
    } else {
      tmpDelta = inp.text;
    }

    preview();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  cancel.onClick = win.close;

  ok.onClick = function() {
    if (isPreview.value && isUndo) app.undo();
    process();
    isUndo = false;
    saveSettings(json);
    win.close();
  }

  win.onClose = function () {
    try {
      if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
    try {
      var tmpPath = app.activeDocument.pageItems.getByName('__TempPath');
      tmpPath.remove();
    } catch (err) {}
  }

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        process();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  function process() {
    var tmpPath = items[0].layer.pathItems.add();
    tmpPath.name = '__TempPath';
    tmpPath.hidden = true;
    tmpPath.hidden = false;

    var value = strToNum(inp.text, isPercent.value ? 100 : 1);
    if (isPercent.value) {
      value = Math.abs(value);
      if (value > max) value = max;
      inp.text = value;
    }

    for (var i = 0, len = items.length; i < len; i++) {
      increaseStrokeWidth(items[i], CFG, isPercent.value, value);
    }
  }

  /**
   * Handle keyboard input to shift numerical values
   *
   * @param {Object} item - The input element to which the event listener will be attached
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function shiftInputNumValue(item, max) {
    item.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = Number(this.text);
      var min = isPercent.value ? 0 : -max;

      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        if (num >= min + step) {
          this.text = num - step;
          kd.preventDefault();
        } else {
          this.text = min;
        }
        if (isPercent.value) slider.value = parseFloat(this.text);
        preview();
      }

      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        if (num <= max - step) {
          this.text = num + step;
          kd.preventDefault();
        } else {
          this.text = max;
        }
        if (isPercent.value) slider.value = parseFloat(this.text);
        preview();
      }
    });
  }

  /**
   * Save options to a file
   *
   * @param {Object} prefs - The preferences file
   */
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.type = isPercent.value;
    pref.percent = tmpPercent;
    pref.delta = tmpDelta;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  /**
   * Loads options from a file
   *
   * @param {Object} prefs - The preferences file
   */
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
          isPercent.value = pref.type;
          isDelta.value = !pref.type;
          tmpPercent = pref.percent;
          slider.value = parseInt(pref.percent);
          tmpDelta = pref.delta;
          if (isPercent.value) {
            inp.text = pref.percent;
            inpUnits.text = '%';
          } else {
            inp.text = pref.delta;
            slider.enabled = false;
            inpUnits.text = CFG.units
          }
        }
      } catch (err) {}
    }
  }

  win.center();
  win.show();
}

/**
 * Check if any item in the collection or its sub-collections is a TextFrame
 * 
 * @param {Array} coll - The collection of items to check
 * @returns {boolean} - Returns true if a TextFrame is found, otherwise false
 */
function hasTextFrame(coll) {
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (item.typename === 'TextFrame') {
      return true;
    } else if (item.pageItems && item.pageItems.length) {
      if (hasTextFrame(item.pageItems)) return true;
    }
  }
  return false;
}

/**
 * Convert a string to a number
 *
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
 * Increase the stroke width relative to the current stroke width of the item
 *
 * @param {Object} item - The item whose stroke width is to be increased
 * @param {Object} prefs - The preferences for stroke width adjustment
 * @param {number} [isPercent] - Whether to increase by a percentage or an delta value
 * @param {number} [value] - The value by which to adjust the stroke width
 */
function increaseStrokeWidth(item, prefs, isPercent, value) {
  if (!isHasStroke(item) && !prefs.isAddStroke) {
    return;
  } else if (!isHasStroke(item) && prefs.isAddStroke) {
    if (isPercent === false && value > 0) {
      setStrokeWidth(item, convertUnits(value , prefs.units, 'pt') / prefs.sf);
    } else {
      setStrokeWidth(item, convertUnits(prefs.defWidth, prefs.units, 'pt') / prefs.sf);
    }
  } else {
    var curWidth = getStrokeWidth(item);
    // Convert app units to script units
    curWidth = prefs.sf * convertUnits(curWidth, 'pt', prefs.units);

    var newWidth = 0;

    if (isPercent !== undefined && value !== undefined) {
      if (isPercent) {
        newWidth = curWidth * (value / 100);
      } else {
        newWidth = curWidth + value;
        if (newWidth < 0) newWidth = 0;
      }
    } else {
      if (roundNum(curWidth, 1) <= 0.1) {
        newWidth = (prefs.isRound ? roundNum(curWidth, 2) : curWidth) + 0.01;
      } else if (roundNum(curWidth, 1) <= 1.5) {
        newWidth = (prefs.isRound ? roundNum(curWidth, 1) : curWidth) + 0.2;
      } else if (curWidth < 5) {
        newWidth = (prefs.isRound ? roundNum(curWidth, 1) : curWidth) + 0.5;
      } else {
        newWidth = (prefs.isRound ? roundNum(curWidth, 0) : curWidth) + 1.0;
      }
    }
  
    // Convert script units to app units
    newWidth = convertUnits(newWidth, prefs.units, 'pt') / prefs.sf;
    setStrokeWidth(item, newWidth);
  }
}

/**
 * Check if an item has a stroke
 *
 * @param {Object} item - The item to check for a stroke
 * @returns {boolean} True if the item has a stroke, false otherwise
 */
function isHasStroke(item) {
  if (isType(item, 'text')) {
    var attr = item.textRange.characterAttributes;
    return !/nocolor/i.test(attr.strokeColor) && attr.strokeWeight > 0;
  }
  return item.stroked && item.strokeWidth > 0;
}

/**
 * Set the stroke width of an item
 *
 * @param {Object} item - The item whose stroke width is to be set
 * @param {number} val - The value (pt) to set the stroke width to
 */
function setStrokeWidth(item, val) {
  if (arguments.length == 1 || val == undefined || isNaN(val)) return;
  if (isType(item, 'text')) {
    var attr = item.textRange.characterAttributes;
    attr.strokeWeight = val;
  } else {
    if (val === 0) {
      item.stroked = false;
    } else {
      item.stroked = true;
      item.strokeWidth = val;
    }
  }
}

/**
 * Get the stroke width of an item
 *
 * @param {object} item - The item whose stroke width is to be retrieved
 * @returns {number} The stroke width of the item, or 0 if the item has no stroke
 */
function getStrokeWidth(item) {
  if (!isHasStroke(item)) {
    return 0;
  } else if (isType(item, 'text')) {
    return item.textRange.characterAttributes.strokeWeight;
  } else {
    return item.strokeWidth;
  }
}

/**
 * Convert a value from one unit of measurement to another
 *
 * @param {number} value - The value to convert
 * @param {string} currUnits - The current units of the value
 * @param {string} newUnits - The units to convert the value to
 * @returns {number} The converted value
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Round a number to a specified number of decimal places
 * 
 * @param {number} num - The number to be rounded
 * @param {number} decimals - The number of decimal places to round to
 * @returns {number} The rounded number
 */
function roundNum(num, decimals) {
  var pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
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

try {
  main();
} catch (err) {}