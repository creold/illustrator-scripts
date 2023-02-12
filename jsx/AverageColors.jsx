/*
  AverageColors.jsx for Adobe Illustrator
  Description: Averages the colors of selected objects or separately inside groups or gradients
              Hold Alt on launch to show dialog if showUI: false
              or run in silent mode with the latest settings if showUI: true
  Date: March, 2022
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
        name    : 'Average Colors',
        version : 'v.0.1'
      },
      CFG = {
        isIsolateGrp  : false,   // Process groups separately
        isGradient    : false,  // Process only gradients to solid colors
        isFill        : true,   // Averaging fills
        isStroke      : true,   // Averaging strokes
        showUI        : true    // Silent mode or dialog
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (selection.typename === 'TextRange') return;

  var isAltPressed = false;

  if (ScriptUI.environment.keyboardState.altKey) {
    isAltPressed = true;
  }

  if ((CFG.showUI && !isAltPressed) || (!CFG.showUI && isAltPressed)) { // Show dialog
    invokeUI(SCRIPT, CFG, SETTINGS);
  } else if (CFG.showUI && isAltPressed) { // Silent mode with the latest settings
    var params = loadSettings(SETTINGS);
    if (params.length) process(params[0], params[1], params[2], params[3]);
  } else { // Silent mode with the default settings
    process(CFG.isIsolateGrp, CFG.isGradient, CFG.isFill, CFG.isStroke);
  }
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
  pref.isIsolateGrp = params[0];
  pref.isGradient = params[1];
  pref.isFill = params[2];
  pref.isStroke = params[3];
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
        out[0] = pref.isIsolateGrp;
        out[1] = pref.isGradient;
        out[2] = pref.isFill;
        out[3] = pref.isStroke;
      }
    } catch (e) {}
  }
  return out;
}

/**
 * Show UI
 * @param {Object} title - The script name
 * @param {Object} cfg - Default settings
 * @param {Object} cfgFile - Settings file
 */
function invokeUI(title, cfg, cfgFile) {
  var params = loadSettings(cfgFile);

  var dialog = new Window('dialog', title.name + ' ' + title.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.opacity = .96;

  var wrapper = dialog.add('panel');
      wrapper.orientation = 'column';
      wrapper.alignChildren = ['fill','top'];
      wrapper.margins = 10;

  var isIsolateGrp = wrapper.add('checkbox', undefined, 'Isolate Groups');
      isIsolateGrp.value = params.length ? params[0] : cfg.isIsolateGrp;

  var isGradient = wrapper.add('checkbox', undefined, 'Gradients Only');
      isGradient.value = params.length ? params[1] : (cfg.isIsolateGrp ? false : cfg.isGradient);

  var isFill = wrapper.add('checkbox', undefined, 'Fill Colors');
      isFill.value = params.length ? params[2] : cfg.isFill;

  var isStroke = wrapper.add('checkbox', undefined, 'Stroke Colors');
      isStroke.value = params.length ? params[3] : cfg.isStroke;

  var btns = dialog.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'center'];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = btns.add('button', undefined, 'Ok',  { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  isIsolateGrp.onClick = function() {
    if (this.value) isGradient.value = false;
  }

  isGradient.onClick = function() {
    if (this.value) isIsolateGrp.value = false;
  }

  cancel.onClick = dialog.close;

  ok.onClick = function() {
    var params = [isIsolateGrp.value, isGradient.value, isFill.value, isStroke.value];
    saveSettings(cfgFile, params);
    process(params[0], params[1], params[2], params[3]);
    dialog.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  dialog.center();
  dialog.show();
}

/**
 * Run processing 
 * @param {boolean} isIsolateGrp - Groups separately
 * @param {boolean} isGradient - Only gradients to solid colors
 * @param {boolean} isFill - Averaging fills
 * @param {boolean} isStroke - Averaging strokes
 */
function process(isIsolateGrp, isGradient, isFill, isStroke) {
  var groups;

  if (!selection.length) {
    var isConfirm = confirm('Selection is empty\n' +
                    'Process all visible unlocked groups\n' +
                    'in the document?');
    
    if (isConfirm) {
      app.executeMenuCommand('selectall');
      groups = getGroups(selection);
      app.executeMenuCommand('deselectall');
    } else {
      return; // Exit
    }
  } else {
    var paths = getPaths(selection, isIsolateGrp);

    if (paths.length) {
      if (isFill) {
        if (isGradient) recolorGradients(paths, 'fillColor');
        else recolor(paths, 'fillColor');
      }
  
      if (isStroke) {
        if (isGradient) recolorGradients(paths, 'strokeColor');
        else recolor(paths, 'strokeColor');
      }
    }

    if (!isIsolateGrp) return; // Exit

    groups = getGroups(selection);
  }

  // Process groups separately
  forEach(groups, function(e) {
    var grpPaths = getPaths(e.pageItems, false);

    if (isFill) recolor(grpPaths, 'fillColor');
    if (isStroke) recolor(grpPaths, 'strokeColor');
  });
}

/**
 * Get top-level groups
 * @param {(Object|Array)} collection - PageItems set
 * @return {Array} out - Top-Level groups
 */
function getGroups(collection) {
  var out = [];

  forEach(collection, function(e) {
    if (/group/i.test(e.typename)) out.push(e);
  });

  return out;
}

/**
 * Get paths in group
 * @param {(Object|Array)} collection - PageItems set
 * @param {boolean} isIsolateGrp - Include group content
 * @return {Array} out - Single paths
 */
function getPaths(collection, isIsolateGrp) {
  var out = [];

  forEach(collection, function(e) {
    if (e.pageItems && e.pageItems.length && !isIsolateGrp) {
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
 * Recolor objects
 * @param {Array} collection - Paths
 * @param {string} type - Color property for the path
 */
function recolor(collection, type) {
  var colors = getColors(collection, type),
      avgColor = averageColors(colors);

  forEach(collection, function(e) {
    if ((/fill/i.test(type) && e.filled) ||
        (/stroke/i.test(type) && e.stroked)) {
      e[type] = avgColor;
    }
  });
}

/**
 * Recolor only gradients separately
 * @param {Array} collection - Paths
 * @param {string} type - Color property for the path
 */
function recolorGradients(collection, type) {
  forEach(collection, function(e) {
    if ((/fill/i.test(type) && e.filled && /gradient/i.test(e[type])) ||
        (/stroke/i.test(type) && e.stroked && /gradient/i.test(e[type]))) {
      var colors = getColors([e], type),
      avgColor = averageColors(colors);
      e[type] = avgColor;
    }
  });
}

/**
 * Get solid colors
 * @param {Array} collection - Paths
 * @param {string} type - Color property for the path
 * @return {Array} out - Colors 
 */
function getColors(collection, type) {
  var out = [];

  forEach(collection, function(e) {
    var hasFill = /fill/i.test(type) && e.filled && !/pattern/i.test(e[type].typename),
        hasStroke = /stroke/i.test(type) && e.stroked && !/pattern/i.test(e[type].typename);

    if (!hasFill && !hasStroke) return;

    if (/gradient/i.test(e[type].typename)) {
      var gColor = e[type].gradient,
          gLen = gColor.gradientStops.length;
      for (var i = 0; i < gLen; i++) {
        out.push(gColor.gradientStops[i].color);
      }
    } else {
      out.push(e[type]);
    }
  });

  return out;
}

/**
 * Average solid colors
 * @param {Array} colors - All paths colors
 * @return {object} avgColor - Average color
 */
function averageColors(colors) {
  var isRgb = activeDocument.documentColorSpace === DocumentColorSpace.RGB,
      len = colors.length,
      cSum = {}; // Sum of color channels

  forEach(colors, function(e) {
    if (/spot/i.test(e.typename)) e = getSpotTint(e);
    if (/gray/i.test(e.typename)) e.red = e.green = e.blue = e.black = e.gray;
    for (var key in e) {
      if (typeof e[key] === 'number') {
        if (cSum[key]) cSum[key] += e[key];
        else cSum[key] = e[key];
      }
    }
  });

  var avgColor = isRgb ? new RGBColor() : new CMYKColor();
  for (var key in cSum) {
    avgColor[key] = Math.floor(cSum[key] / len);
  }

  return avgColor;
}

/**
 * Get true solid color from Spot
 * @param {Object} color - Spot color
 * @return {Object} Solid color
 */
function getSpotTint(color) {
var isRgb = activeDocument.documentColorSpace === DocumentColorSpace.RGB,
    white, tintVal = [];

  if (isRgb) {
    white = new RGBColor();
    white.red = 255;
    white.green = 255;
    white.blue = 255;
  } else {
    white = new CMYKColor();
  }

  var t = color.tint / 100,
      spot = color.spot.color;

  for (var key in spot) {
    if (typeof spot[key] === 'number') {
      tintVal.push(lerp(white[key], spot[key], t));
    }
  }

  return setColor(tintVal, isRgb);
}

/**
 * Calc linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Percentage (value from 0.0 to 1.0)
 * @return {number} New value
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Create color from array of values
 * @param {Array} arr - Channels values
 * @param {boolean} isRgb - Is the RGB document mode
 * @return {Object} color
 */
function setColor(arr, isRgb) {
  var color;

  if (isRgb) {
    color = new RGBColor();
    color.red = arr[0];
    color.green = arr[1];
    color.blue = arr[2];
  } else {
    color = new CMYKColor();
    color.cyan = arr[0];
    color.magenta = arr[1];
    color.yellow = arr[2];
    color.black = arr[3];
  }

  return color;
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