/*
  ColorCorrector.jsx for Adobe Illustrator
  Description: Adjust color channels for selected objects by setting exact values or calculating relative changes
  Date: June, 2024
  Modification Date: February, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1.2 Fixed adjustment of gradient duplicates in selection
  0.1.1 Fixed typo for correct work with gradients
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
    name: 'Color Corrector',
    version: 'v0.1.2'
  };

  var CFG = {
    faq: '1) Exact value setting\n2) Arithmetic operations: +, -, *, / \n2) Calculations relative to other channels',
    aiVers: parseFloat(app.version),
    is2020: parseInt(app.version) === 24,
    isMac: /mac/i.test($.os)
  };

  if (!isCorrectEnv('version:16', 'selection')) return;

  // Array of temporary paths for fixing compound paths
  var tmpPaths = [];
  var items = getItems(app.selection, tmpPaths);
  var isRgb = /rgb/i.test(activeDocument.documentColorSpace);
  var channels = isRgb ? ['red', 'green', 'blue'] : ['cyan', 'magenta', 'yellow', 'black'];
  var isUndo = false;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];
      win.opacity = 0.98;

  var leftCol = win.add('group');
      leftCol.orientation = 'column';
      leftCol.alignChildren = ['fill', 'center'];

  // CHANNELS
  var chnlPnl = leftCol.add('panel', undefined, 'Channels');
      chnlPnl.orientation = 'column';
      chnlPnl.margins = [10, 15, 10, 8];
      chnlPnl.alignChildren = ['fill', 'top'];

  if (isRgb) {
    // Add text input fields for R, G, B channels
    var r = addInput(chnlPnl, 'R', CFG.faq);
    var g = addInput(chnlPnl, 'G', CFG.faq);
    var b = addInput(chnlPnl, 'B', CFG.faq);
  } else {
    // Add text input fields for C, M, Y, K channels
    var c = addInput(chnlPnl, 'C', CFG.faq);
    var m = addInput(chnlPnl, 'M', CFG.faq);
    var y = addInput(chnlPnl, 'Y', CFG.faq);
    var k = addInput(chnlPnl, 'K', CFG.faq);
  }

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    if (r) r.active = true;
    if (c) c.active = true;
  }

  // APPEARANCE
  var appear = leftCol.add('panel', undefined, 'Appearance');
      appear.orientation = 'row';
      appear.margins = [10, 15, 10, 8];
      appear.alignChildren = ['fill', 'top'];

  var isFill = appear.add('checkbox', undefined, 'Fill');
      isFill.value = true;
  var isStroke = appear.add('checkbox', undefined, 'Stroke');

  // GLOBAL SWATCHES
  var appear = leftCol.add('panel', undefined, 'Global Colors');
      appear.orientation = 'row';
      appear.margins = [10, 15, 10, 8];
      appear.alignChildren = ['fill', 'top'];

  var isSkipGlobal = appear.add('radiobutton', undefined, 'Skip');
      isSkipGlobal.value = true;
  var isEditGlobal = appear.add('radiobutton', undefined, 'Edit');

  var rightCol = win.add('group');
      rightCol.orientation = 'column';
      rightCol.alignChildren = ['fill', 'center'];

  // BUTTONS
  var btns = rightCol.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['left', 'center'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    reset = btns.add('button', undefined, 'Reset', { name: 'reset' });
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    reset = btns.add('button', undefined, 'Reset', { name: 'reset' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var isPreview = rightCol.add('checkbox', undefined, 'Preview');
  // CC 2020 v24.3 has the problem
  if (CFG.is2020) {
    isPreview.enabled = false;
    isPreview.helpTip = 'Preview disabled for CC 2020\ndue to critical bug'
  }

  var copyright = rightCol.add('statictext', undefined, 'Visit Github');
  copyright.justify = 'center';

  // EVENTS
  isFill.onClick = isStroke.onClick = preview;
  isSkipGlobal.onClick = isEditGlobal.onClick = preview;

  if (isRgb) {
    r.onChange = preview;
    g.onChange = preview;
    b.onChange = preview;
  } else {
    c.onChange = preview;
    m.onChange = preview;
    y.onChange = preview;
    k.onChange = preview;
  }

  if (isPreview.value) preview();
  isPreview.onClick = preview;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  reset.onClick = function () {
    if (isRgb) {
      r.text = '1 * R';
      g.text = '1 * G';
      b.text = '1 * B';
    } else {
      c.text = '1 *  C';
      m.text = '1 *  M';
      y.text = '1 *  Y';
      k.text = '1 *  K';
    }
    reset.active = true;
    reset.active = false;
    preview();
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        start();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (err) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    win.close();
  }

  /**
   * Starts the color adjustment process for selected items
   * It applies color modifications based on user-defined values,
   * skipping duplicate gradient names
   */
  function start() {
    // Fix preview
    tmpPaths.push( selection[0].layer.pathItems.add() );

    // Set default text values based on color mode
    if (isRgb) {
      setDefaultText(r, 'R');
      setDefaultText(g, 'G');
      setDefaultText(b, 'B');
    } else {
      setDefaultText(c, 'C');
      setDefaultText(m, 'M');
      setDefaultText(y, 'Y');
      setDefaultText(k, 'K');
    }

    var values = isRgb ? [r.text, g.text, b.text] : [c.text, m.text, y.text, k.text];
    var props = ['fillColor', 'strokeColor'];
    var appear = [isFill, isStroke]; // Appearance checkboxes
    var uniqueGradients = {}; // Store gradients to avoid duplicate adjustments

    for (var i = 0, len = items.length; i < len; i++) {
      // If the item is Text Frame, use its textRange, otherwise use the item itself
      var item = /text/i.test(items[i].typename) ? items[i].textRange : items[i];

      for (var j = 0; j < 2; j++) {
        // Skip processing if the corresponding checkbox is not enabled
        if (!appear[j].value) continue;

        var color = item[props[j]];

        if (/gradient/i.test(color)) {
          var gradName = color.gradient.name.replace(/\s/g, '_');
          if (uniqueGradients[gradName]) continue; // Skip if already handled
          uniqueGradients[gradName] = true; // Mark as processed
        }

        adjustColors(item, props[j], values, channels, isEditGlobal.value, isRgb);
      }
    }
  }

  win.onClose = function () {
    try {
      if (isUndo) {
        app.redraw();
        app.undo();
      }
    } catch (err) {}
    // Clear changes in compound paths
    for (var i = tmpPaths.length - 1; i >= 0; i--) {
      if (tmpPaths[i]) tmpPaths[i].remove();
    }
  }

  win.center();
  win.show();
}

/**
 * Check the script environment
 * 
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
        if (!documents.length) {
          alert('No documents\nOpen a document and try again', 'Script error');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Few objects are selected\nPlease select at least one object and try again', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get items from an Adobe Illustrator collection, including nested pageItems.
 * Filter items based on type, excluding non-relevant items
 * 
 * @param {Object} coll - The Adobe Illustrator collection to retrieve items from
 * @param {Array} [tmp] - Temporary array for internal use (optional)
 * @returns {Array} result - Return a JavaScript Array containing relevant items from the given collection
 */
function getItems(coll, tmp) {
  var result = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      result = [].concat(result, getItems(item.pageItems, tmp));
    } else if (/compound/i.test(item.typename)) {
      // Fix compound path created from groups
      if (!item.pathItems.length) {
        tmp.push(item.pathItems.add());
      }
      result.push(item.pathItems[0]);
    } else if (/path|text/i.test(item.typename)) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Add an input field with a label to the specified UI object
 * 
 * @param {Object} obj - The UI object to which the input field will be added
 * @param {string} label - The label for the input field
 * @param {string} tip - The help tips
 * @returns {Object} input - The created input field
 */
function addInput(obj, label, tip)  {
  var group = obj.add('group');
      group.alignChildren = ['left', 'center'];

  var title = group.add('statictext', undefined, label + ':');
  title.preferredSize.width = 15;

  var input = group.add('edittext', undefined, '1 * ' + label);
  input.preferredSize.width = 75;
  input.helpTip = tip;

  return input;
}

/**
 * Set the default text of the input field if it is empty
 * 
 * @param {Object} input - The input field to set the default text for
 * @param {string} str - The default text to set
 */
function setDefaultText(input, str) {
  if (isEmpty(input.text)) input.text = str;
}

/**
 * Check if a string is empty or contains only whitespace characters
 *
 * @param {string} str - The string to check for emptiness
 * @returns {boolean} True if the string is empty, false otherwise
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

/**
 * Adjust the colors of the specified item
 * 
 * @param {Object} item - The item whose colors will be adjusted
 * @param {string} type - The type of color to adjust
 * @param {Array} values - The values to use for adjusting the colors
 * @param {Array} channels - The color channels to adjust
 * @param {boolean} isGlobal - Indicates whether to change global colors
 * @param {boolean} isRgb - Indicates if the colors are in RGB mode
 */
function adjustColors(item, type, values, channels, isGlobal, isRgb) {
  if (/fill/i.test(type) && !/text/i.test(item) && !item.filled) return;
  if (!/rgb|cmyk|gray|spot|gradient/i.test(item[type])) return;
  if (/stroke/i.test(type) && (item.strokeWidth === 0 || item.strokeWeight === 0)) return;

  if (/gray/i.test(item[type])) {
    item[type] = isRgb ? setRGBColor( gray2rgb(item[type].gray) ) : setCMYKColor([0, 0, 0, item[type].gray]);
  }

  if (isGlobal && /spot/i.test(item[type])) {
    item[type] = item[type].spot.color;
  }

  if (/gradient/i.test(item[type])) {
    for (var i = 0; i < item[type].gradient.gradientStops.length; i++) {
      var gradStop = item[type].gradient.gradientStops[i];
      adjustColors(gradStop, 'color', values, channels, isGlobal, isRgb);
    }
  } else {
    for (var j = 0; j < channels.length; j++) {
      var channel = channels[j];
      item[type][channel] = evalChannelValue(item[type][channel], item[type], values[j], isRgb);
    }
  }
}

/**
 * Convert a Grayscale color to RGB
 * 
 * @param {number} value - The grayscale value to convert
 * @returns {Array} The RGB color representation of the grayscale value
 */
function gray2rgb(value) {
  return app.convertSampleColor(ImageColorSpace.GrayScale, [value], ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose);
}

/**
 * Generate a solid RGB color based on the given RGB values
 * 
 * @param {Array} rgb - An array of RGB values [red, green, blue]
 * @returns {Object} color - The RGB color object
 */
function setRGBColor(rgb) {
  var color = new RGBColor();
  color.red = rgb[0];
  color.green = rgb[1];
  color.blue = rgb[2];
  return color;
}

/**
 * Generate a solid CMYK color based on the given CMYK values
 * 
 * @param {Array} cmyk - An array of CMYK values [cyan, magenta, yellow, black]
 * @returns {Object} color - The CMYK color object
 */
function setCMYKColor(cmyk) {
  var color = new CMYKColor();
  color.cyan = cmyk[0];
  color.magenta = cmyk[1];
  color.yellow = cmyk[2];
  color.black = cmyk[3];
  return color;
}

/**
 * Evaluate the new channel value based on the provided arithmetic string
 * 
 * @param {number} value - The current value of the color channel
 * @param {Object} color - The color object containing channel values
 * @param {string} str - The arithmetic string to evaluate
 * @param {boolean} isRgb - Indicates if the colors are in RGB mode
 * @returns {number} newValue - The evaluated channel value
 */
function evalChannelValue(value, color, str, isRgb) {
  if (isEmpty(str)) str = '0';
  var newValue = 0;

  try {
    // Replace decimal symbol
    str = str.replace(/,/gi, '.');

    // Replace relative channel references
    if (isRgb) {
      str = str.replace(/R/gi, roundNum(color.red, 2))
                .replace(/G/gi, roundNum(color.green, 2))
                .replace(/B/gi, roundNum(color.blue, 2));
    } else {
      str = str.replace(/C/gi, roundNum(color.cyan, 2))
                .replace(/M/gi, roundNum(color.magenta, 2))
                .replace(/Y/gi, roundNum(color.yellow, 2))
                .replace(/K/gi, roundNum(color.black, 2));
    }

    // If the first character is a valid operation, perform the relative operation
    // Evaluate the expression or the absolute value
    newValue = /^[\+\-\*\/]/.test(str) ? eval(value + str) : eval(str);
  } catch (err) {
    return value;
  }

  newValue = isRgb ? Math.min(255, newValue) : Math.min(100, newValue);
  newValue = Math.max(0, newValue);

  return newValue;
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

// Run script
try {
  main();
} catch (err) {}