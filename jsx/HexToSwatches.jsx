/*
  HexToSwatches.jsx for Adobe Illustrator
  Description: Create a swatch group from various HEX input formats
  Supported formats:
    - Comma-separated: "fb8b24, e36414, 0f4c5c"
    - Semicolon-separated: "fb8b24; e36414; 0f4c5c"
    - Space-separated: "fb8b24 e36414 0f4c5c"
    - Hyphen-separated: "fb8b24-e36414-0f4c5c"
    - Short HEX: "ebd", "f52", "12fc", "0"
    - Coolors URL: "https://coolors.co/27187e-758bfd-aeb8fe-f1f2f6-ff8600"
    - Poolors URL: "https://poolors.com/f78fe2-898415-2e3741"
    - Copy HEX from https://colorhunt.co/, https://colordesigner.io, learnui.design/tools/data-color-picker.html
    - Multi-line: Each HEX on a new line

  Date: January, 2026
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

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

// Main function
function main() {
  var SCRIPT = {
        name: 'Hex To Swatches',
        version: 'v0.1'
      };

  var CFG = {
        hexHeight: 160,
        placeholder: 'https://coolors.co/3d348b-7678ed-f7b801-f18701-f35b04', // Default hex input
        prefix: '#', // Default swatch names prefix
        groupName: 'My Palette', // Default swatch group name
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os)
      };

  var SETTINGS = {
    name:   SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
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
  var isUndo = false;
  var isSuccess = false;
  CFG.isRgb = /rgb/i.test(doc.documentColorSpace);

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'fill'];
      win.opacity = 0.98;
      win.spacing = 15;

  // HEX INPUT
  var hexGrp = win.add('group');
      hexGrp.orientation = 'column';
      hexGrp.alignChildren = ['fill', 'fill'];
      hexGrp.spacing = 7;

  hexGrp.add('statictext', undefined, 'Paste HEX list:');

  var hexInp = hexGrp.add('edittext', undefined, CFG.placeholder, { multiline: true, scrolling: true, wantReturn: true });
      hexInp.preferredSize.height = CFG.hexHeight;

  // Focus input field on compatible versions
  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    hexInp.active = true;
  }

  var hexInfoGrp = hexGrp.add('group');
      hexInfoGrp.orientation = 'row';
      hexInfoGrp.alignChildren = ['fill', 'fill'];

  var foundTitle = hexInfoGrp.add('statictext', undefined, 'Unique Colors Found: 0');
      foundTitle.justify = 'left';
  var info = hexInfoGrp.add('statictext', undefined, '\u24D8');
      info.justify = 'right';
      info.helpTip = 'Supported formats:\n' +
        '\u2022 Comma-separated: "fb8b24, e36414, 0f4c5c"\n' + 
        '\u2022 Semicolon-separated: "fb8b24; e36414; 0f4c5c"\n' + 
        '\u2022 Space-separated: "fb8b24 e36414 0f4c5c"\n' +
        '\u2022 Hyphen-separated: "fb8b24-e36414-0f4c5c"\n' + 
        '\u2022 Short HEX: "ebd", "f52", "12fc", "0"\n' + 
        '\u2022 Coolors URL: "https://coolors.co/27187e-758bfd-aeb8fe-f1f2f6-ff8600"\n' +
        '\u2022 Poolors URL: "https://poolors.com/f78fe2-898415-2e3741"\n' +
        '\u2022 Other generator: https://colorhunt.co/, https://colordesigner.io,\nlearnui.design/tools/data-color-picker.html\n' +
        '\u2022 Multi-line: Each HEX on a new line';

  // SWATCH GROUP NAME
  var swNameGrp = win.add('group');
      swNameGrp.orientation = 'row';
      swNameGrp.alignChildren = ['left', 'center'];
      swNameGrp.spacing = 10;

  var nameLbl = swNameGrp.add('statictext', undefined, 'Group Name:');
      nameLbl.preferredSize.width = 80;

  var swNameInp = swNameGrp.add('edittext', undefined, CFG.groupName);
      swNameInp.preferredSize.width = 155;

  // SWATCH GROUP NAME
  var swTypeGrp = win.add('group');
      swTypeGrp.orientation = 'row';
      swTypeGrp.alignChildren = ['left', 'top'];
      swTypeGrp.spacing = 10;

  var typeLbl = swTypeGrp.add('statictext', undefined, 'Color Type:');
      typeLbl.preferredSize.width = 80;

  var rbGrp = swTypeGrp.add('group');
      rbGrp.spacing = 15;

  var isStandart = rbGrp.add('radiobutton', undefined, 'Standart');
  var isGlobal = rbGrp.add('radiobutton', undefined, 'Global');
      isStandart.value = true;

  // BUTTONS
  var btns = win.add('group');
      btns.alignChildren = ['center', 'center'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');

  // Platform-specific button order
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

  var copyright = win.add('group');
      copyright.orientation = 'row';
      copyright.alignChildren = ['fill', 'center'];

  var author = copyright.add('statictext', undefined, '\u00A9 Sergey Osokin');
      author.justify = 'left';

  var link = copyright.add('statictext', undefined, 'Visit GitHub');
      link.justify = 'right';

  // EVENTS
  loadSettings(SETTINGS);

  hexInp.onChange = function () {
    foundTitle.text = foundTitle.text.replace(/\d+/g, parseHex(hexInp.text).length);
    preview();
  }

  isStandart.onClick = isGlobal.onClick = swNameInp.onChange = isPreview.onClick = preview;

  cancel.onClick = win.close;
  ok.onClick = okClick;

  setTextHandler(info, function () {
    openURL('https://ais.sergosokin.ru/');
  });

  setTextHandler(link, function () {
    openURL('https://github.com/creold');
  });

  win.onShow = function () {
    foundTitle.text = foundTitle.text.replace(/\d+/g, parseHex(hexInp.text).length);
  }

  win.onClose = function () {
    try {
      if (isUndo) app.undo();
    } catch (err) {}
    isUndo = false;
  }

  /**
   * Handle the preview functionality with undo support
   */
  function preview() {
  try {
    if (isPreview.value) {
      if (isUndo) {
        doc.swatches.add().remove();
        app.undo();
      }
      importHex();
      if (isSuccess) {
        doc.swatches.add().remove();
        app.redraw();
        isUndo = true;
      } else {
        isUndo = false;
      }
    } else if (isUndo) {
      app.undo();
      app.redraw();
      isUndo = false;
    }
  } catch (err) {}
  }

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);
    if (isPreview.value && isUndo && isSuccess) {
      app.undo();
    }
    var swatches = importHex();

    if (swatches.length) {
      var swGroupName = swNameInp.text;
      if (!swGroupName.replace(/\s/g, '').length) {
        alert('Empty name of the swatch group\nEnter a name and try again', 'Script error');
        isSuccess = false;
        isUndo = false;
        return;
      }

      var isMakeSpot = isGlobal.value;

      // NOTE: Swatch group creation is deferred until OK to prevent a crash Adobe
      // that occurs in preview mode if the switches Swatches panel is in List View
      // The root cause of the crash in List View is unknown
      var swGroup = doc.swatchGroups.add();
      swGroup.name = swGroupName;

      // Transfer HEX swatches to group
      for (var i = 0, len = swatches.length; i < len; i++) {
        isMakeSpot ? swGroup.addSpot(swatches[i]) : swGroup.addSwatch(swatches[i]);
      }

      isSuccess = true;
    }

    isUndo = false;
    if (isSuccess) win.close();
  }

  /**
   * Import HEX colors as swatches into the active Illustrator document
   * @param {string} hexInp.text - Input string containing HEX color values
   * @param {boolean} isSpot.value - If true, creates spot colors
   * @param {Object} CFG - Configuration object with `prefix` and `isRgb` properties
   * @param {Object} doc - The target Illustrator document
   * @returns {Array} Array of created swatches or undefined if no valid HEX colors found
   */
  function importHex() {
    var hexList = parseHex(hexInp.text);
    if (!hexList.length) { 
      alert('No HEX colors found\nEnter at least one HEX value and try again', 'Script error');
      isSuccess = false;
      return;
    }

    var isMakeSpot = isGlobal.value;

    var swatches = [];
    for (var i = 0, len = hexList.length; i < len; i++) {
      var hexName = CFG.prefix + hexList[i].toUpperCase();
      var rgbColor = hexToRgb(hexList[i]);
      try {
        var newColor = makeColor(doc, rgbColor, hexName, isMakeSpot, CFG.isRgb);
        swatches.push(newColor);
      } catch (err) {}
    }

    isSuccess = true;
    return swatches;
  }

  /**
   * Set up a clickable text handler with hover effects and callback execution
   * @param {Object} text - The statictext object to attach handlers to
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
    data.win_x = win.location.x;
    data.win_y = win.location.y;
    data.hex = hexInp.text.replace(/\n/g, ' ');
    data.group = swNameInp.text;
    data.type = isStandart.value;

    f.write( stringify(data) );
    f.close();
  }

  /**
   * Load options from a file
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
        win.location = [
          data.win_x && !isNaN(parseInt(data.win_x)) ? parseInt(data.win_x) : 300,
          data.win_y && !isNaN(parseInt(data.win_y)) ? parseInt(data.win_y) : 300
        ];
        hexInp.text = data.hex;
        swNameInp.text = data.group;
        isStandart.value = data.type === 'true';
        isGlobal.value = !isStandart.value;

      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Extract and normalizes unique hex colors from a string
 * Support separators: space, comma, semicolon, hyphen, newline
 * @param {string} str - Input string containing hex colors
 * @returns {Array} hexList - Array of unique, normalized 6-digit hex colors
 */
function parseHex(str) {
  // Remove URL-like prefixes
  var cleanedStr = str.replace(/.*\//g, '');
  // Split by common separators and filter empty strings
  var rawHexes = cleanedStr.split(/[\s,;\-]+/);
  var seenColors = {};
  var results = [];
  
  for (var i = 0; i < rawHexes.length; i++) {
    var h = rawHexes[i].replace(/[^0-9a-fA-F]/g, '');
    if (!h.length) continue;
    
    var normHex = normalizeHex(h);
    if (normHex && !seenColors[normHex]) {
      seenColors[normHex] = true;
      results.push(normHex);
    }
  }
  
  return results;
}

/**
 * Normalize a hex string to 6-digit format
 * Handles shorthand (e.g., "#f", "#f0", "#f01") and invalid lengths
 * @param {string} str - Hex string to normalize
 * @returns {string|null} Normalized 6-digit hex or null if invalid
 */
function normalizeHex(str) {
  str = '' + str.toLowerCase();
  var len = str.length;

  // Handle shorthand and incomplete hex codes
  switch (len) {
    case 1: return str + str + str + str + str + str; // "#f" -> "#ffffff"
    case 2: return str + str + str; // "#f0" -> "#f0f0f0"
    case 3: return str[0] + str[0] + str[1] + str[1] + str[2] + str[2]; // "#f01" -> "#ff0011"
    case 4: return str + '00'; // "#ffff" -> "#ffff00"
    case 5: return str + '0'; // "#fffff" -> "#fffff0"
    case 6: return str; // "#ffffff" -> "#ffffff"
    default: return null; // Invalid length
  }
}

/**
 * Convert a HEX color code to an RGB color object
 * @param {string} hex - The HEX color code (with or without the '#' symbol)
 * @returns {Object} An object representing the RGB values {red, green, blue}
 */
function hexToRgb(hex) {
  hex = (hex || '').replace(/[^0-9A-F]/gi, '').toUpperCase();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length && hex.length < 6) {
    hex = ('000000' + hex).slice(-6);
  }
  return {
    red: parseInt(hex.substr(0, 2), 16) || 0,
    green: parseInt(hex.substr(2, 2), 16) || 0,
    blue: parseInt(hex.substr(4, 2), 16) || 0
  };
}

/**
 * Create or update a color swatch
 * @param {Object} doc - The target Illustrator document
 * @param {Object} rgb - RGB color object with `red`, `green`, `blue` (0-255)
 * @param {string} name - Name for the new swatch
 * @param {boolean} isSpot - If true, creates a spot color
 * @param {boolean} isRgbDoc - If true, forces RGB color space
 * @returns {Object} swatch - The created or updated swatch
 */
function makeColor(doc, rgb, name, isSpot, isRgbDoc) {
  var newColor;

  if (isRgbDoc) {
    newColor = new RGBColor();
    newColor.red = rgb.red;
    newColor.green = rgb.green;
    newColor.blue = rgb.blue;
  } else {
    // Convert RGB to CMYK for non-RGB documents
    var cmyk = app.convertSampleColor(
      ImageColorSpace.RGB,
      [rgb.red, rgb.green, rgb.blue],
      ImageColorSpace.CMYK,
      ColorConvertPurpose.defaultpurpose
    );
    newColor = new CMYKColor();
    newColor.cyan = cmyk[0];
    newColor.magenta = cmyk[1];
    newColor.yellow = cmyk[2];
    newColor.black = cmyk[3];
  }

  // Add or update swatch
  var swatch = null;
  if (isSpot) {
    try {
      swatch = doc.spots.getByName(name);
      swatch.color = newColor;
    } catch (err) {
      swatch = doc.spots.add();
      swatch.name = name;
      swatch.colorType = ColorModel.PROCESS; // or ColorModel.PROCESS
      swatch.color = newColor;
    }
  } else {
    swatch = doc.swatches.add();
    swatch.name = name;
    swatch.color = newColor;
  }

  return swatch;
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
 * @returns {string} - A JSON-like string representation of the object
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