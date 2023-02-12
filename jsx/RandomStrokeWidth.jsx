/*
  RandomStrokeWidth.jsx for Adobe Illustrator
  Description: Sets random stroke width of selected objects in a range with steps
              Hold Alt on launch to show dialog if showUI: false
              or run in silent mode with the latest settings if showUI: true
  Date: October, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Minor improvements
  0.1.2 Added size correction in large canvas mode

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), 2022 (Win).
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
        name    : 'Random Stroke Width',
        version : 'v.0.1.2'
      },
      CFG = {
        units     : getPrefUnits(),
        minWidth  : 0.5,
        maxWidth  : 4,
        step      : 0.5,
        showUI    : true // Silent mode or dialog
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length && selection.typename === 'TextRange') return;

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var isAltPressed = false;

  if (ScriptUI.environment.keyboardState.altKey) {
    isAltPressed = true;
  }

  var paths = getPaths(selection);

  if ((CFG.showUI && !isAltPressed) || (!CFG.showUI && isAltPressed)) { // Show dialog
    invokeUI(SCRIPT, CFG, SETTINGS, paths);
  } else if (CFG.showUI && isAltPressed) { // Silent mode with the latest settings
    var params = loadSettings(SETTINGS);
    if (params.length) process(paths, params[0], params[1], params[2], params[3], CFG.units, CFG.sf);
  } else { // Silent mode with the default settings
    process(paths, CFG.minWidth, CFG.maxWidth, CFG.step, false, CFG.units, CFG.sf);
  }
}

/**
 * Get the stroke width units from Preferences > Units > Stroke
 * @return {string} units
 */
function getPrefUnits() {
  var code = app.preferences.getIntegerPreference('strokeUnits'),
      units = 'pt';
  switch (code) {
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
 * Show UI
 * @param {Object} title - The script name
 * @param {Object} cfg - Default settings
 * @param {Object} cfgFile - Settings file
 * @param {Array} paths - Selected paths
 */
function invokeUI(title, cfg, cfgFile, paths) {
  var autoVal = getAutoValues(paths, cfg.units),
      params = loadSettings(cfgFile);

  var dialog = new Window('dialog', title.name + ' ' + title.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = .98;

  var wrapper = dialog.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = ['fill', 'top'];
      wrapper.spacing = 10;

  var titles = wrapper.add('group');
      titles.orientation = 'column';
      titles.alignChildren = ['fill', 'center'];
      titles.spacing = 18;
      titles.margins = 4;

  titles.add('statictext', undefined, 'Min width, ' + cfg.units);
  titles.add('statictext', undefined, 'Max width, ' + cfg.units);
  titles.add('statictext', undefined, 'Step');

  var inputs = wrapper.add('group');
      inputs.preferredSize.width = 76;
      inputs.orientation = 'column';
      inputs.alignChildren = ['fill', 'top'];

  var minInp = inputs.add('edittext', undefined, params.length ? params[0] : cfg.minWidth);
  var maxInp = inputs.add('edittext', undefined, params.length ? params[1] : cfg.maxWidth);
  var stepInp = inputs.add('edittext', undefined, params.length ? params[2] : cfg.step);

  var isAutoVal = dialog.add('checkbox', undefined, 'Get values from selection');
      isAutoVal.value = params.length ? params[3] : false;

  minInp.enabled = !isAutoVal.value;
  maxInp.enabled = !isAutoVal.value;
  stepInp.enabled = !isAutoVal.value;

  var btns = dialog.add('group');
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok',  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  minInp.onChange = maxInp.onChange = stepInp.onChange = function() {
    this.text = strToAbsNum(this.text, 0);
  }

  isAutoVal.onClick = function() {
    minInp.text = strToAbsNum(autoVal.minW.toFixed(3), cfg.minWidth);
    maxInp.text = strToAbsNum(autoVal.maxW.toFixed(3), cfg.maxWidth);
    stepInp.text = strToAbsNum(autoVal.step.toFixed(3), cfg.step);
    minInp.enabled = !this.value;
    maxInp.enabled = !this.value;
    stepInp.enabled = !this.value;
  }

  cancel.onClick = dialog.close;

  ok.onClick = function() {
    var params = [
          strToAbsNum(minInp.text, cfg.minWidth),
          strToAbsNum(maxInp.text, cfg.maxWidth),
          strToAbsNum(stepInp.text, cfg.step),
          isAutoVal.value,
        ];

    saveSettings(cfgFile, params);
    var result = process(paths, params[0], params[1], params[2], params[3], cfg.units, cfg.sf);
    if (result) dialog.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  dialog.center();
  dialog.show();
}

/**
 * Save UI options to file
 * @param {Object} cfgFile - Settings file
 * @param {Array} params - Options status
 */
function saveSettings(cfgFile, params) {
  if(!Folder(cfgFile.folder).exists) Folder(cfgFile.folder).create();
  var $file = new File(cfgFile.folder + cfgFile.name);
  $file.encoding = 'UTF-8';
  $file.open('w');
  var pref = {};
  pref.minWidth = params[0];
  pref.maxWidth = params[1];
  pref.step = params[2];
  pref.isAuto = params[3];
  var data = pref.toSource();
  $file.write(data);
  $file.close();
}

/**
 * Load options from file
 * @param {Object} cfgFile - Settings file
 * @return {Array} out - Options status
 */
function loadSettings(cfgFile) {
  var out = [], $file = File(cfgFile.folder + cfgFile.name);
  if ($file.exists) {
    try {
      $file.encoding = 'UTF-8';
      $file.open('r');
      var json = $file.readln();
      var pref = new Function('return ' + json)();
      $file.close();
      if (typeof pref != 'undefined') {
        out[0] = pref.minWidth;
        out[1] = pref.maxWidth;
        out[2] = pref.step;
        out[3] = pref.isAuto;
      }
    } catch (e) {}
  }
  return out;
}

/**
 * Get values based on the selected paths
 * @param {Array} paths - Selected paths
 * @param {string} units - The stroke width units
 * @return {Object} Parsed values
 */
function getAutoValues(paths, units) {
  var arr = getStrokeWidth(paths),
      min = convertUnits( Math.min.apply(null, arr), 'pt', units );
      max = convertUnits( Math.max.apply(null, arr), 'pt', units );
  var delta = max - min;
  if (delta == 0) {
    step = 0;
  } else if (delta <= 0.1) {
    step = 0.01;
  } else if (delta <= 1) {
    step = 0.1;
  } else if (delta < 5) {
    step = 0.5;
  } else {
    step = 1.0;
  }

  return {'minW': min, 'maxW': max, 'step': step};
}

/**
 * Run processing
 * @param {Array} paths - Selected paths
 * @param {number} minW - Minimum stoke width
 * @param {number} maxW - Maximum stoke width
 * @param {number} step - Stroke width value step
 * @param {boolean} isAuto - Get min and max from selection
 * @param {number} sf - Scale factor
 * @return {boolean} Return the runtime error
 */
function process(paths, minW, maxW, step, isAuto, units, sf) {
  if (minW === 0) {
    alert('Error\nThe minimum value must be greater than 0');
    return false;
  }

  if (minW >= maxW) {
    alert('Error\nThe minimum width must be less than the maximum width');
    return false;
  }

  if (step === 0) {
    alert('Error\nThe step value must be greater than 0');
    return false;
  }

  if (!isAuto && (minW + step > maxW)) {
    alert('Error\nThe step cannot be greater than ' + (maxW - minW));
    return false;
  }

  var paths = getPaths(selection);

  // Convert values to system units
  minW = convertUnits(minW, units, 'pt') / sf;
  maxW = convertUnits(maxW, units, 'pt') / sf;
  step = convertUnits(step, units, 'pt') / sf;

  var defColor = {};
  if (activeDocument.documentColorSpace == DocumentColorSpace.RGB) {
    defColor = new RGBColor();
    defColor.red = 0;
    defColor.green = 0;
    defColor.blue = 0;
  } else {
    defColor = new CMYKColor();
    defColor.black = 100;
  }

  forEach(paths, function(e) {
    // The macOS version of Illustrator has a bug in adding the stroke
    if (!e.stroked && /win/i.test($.os)) { // OS Windows only
      e.stroked = true;
      e.strokeColor = defColor;
    }

    if (e.stroked)
      e.strokeWidth = getRandomWithStep(minW, maxW, step);
  });

  return true;
}

/**
 * Get single paths
 * @param {(Object|Array)} collection - PageItems set
 * @return {Array} out - Single paths
 */
function getPaths(collection) {
  var out = [];

  forEach(collection, function(e) {
    if (e.pageItems && e.pageItems.length) {
      out = [].concat(out, getPaths(e.pageItems));
    } else if (/compound/i.test(e.typename) && e.pathItems.length) {
      out = [].concat(out, getPaths(e.pathItems));
    } else if (/pathitem/i.test(e.typename)) {
      out.push(e);
    }
  });

  return out;
}

/**
 * Get all stroke widths
 * @param {Array} paths - Single paths
 * @return {Array} out - Values of the widths
 */
function getStrokeWidth(paths) {
  var out = [];

  forEach(paths, function(e) {
    if (e.stroked) out.push(e.strokeWidth);
  });

  return out;
}

/**
 * Get random value in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Value step
 * @return {number} random value >= min and <= max
 */
function getRandomWithStep(min, max, step) {
  var range = ((step % 1 == 0 ? 1 : 0) + max - min) / step,
      n = Math.random() * range;
  n = (step % 1 == 0) ? Math.floor(n) : Math.round(n);
  return n * step + min;
}

/**
 * Calls a provided callback function once for each element in an array
 * @param {Array} collection - Elements
 * @param {Function} fn - The callback function
 */
function forEach(collection, fn) {
  for (var i = 0, len = collection.length; i < len; i++) {
    fn(collection[i]);
  }
}

/**
 * Convert string to absolute number
 * @param {string} str - Input data
 * @param {number} def - Default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Convert units of measurement
 * @param {string} value - Numeric data
 * @param {string} curUnits - Document units 
 * @param {string} newUnits - Final units
 * @return {number} Converted value 
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Open link in browser
 * @param {string} url - Website adress
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
} catch (e) {}