/*
  MakeTrappingStroke.jsx for Adobe Illustrator
  Description: Sets the stroke color based on the fill of the object, with the Overprint Stroke attribute enabled, for prepress
  Based on StrokeColorFromFill.jsx
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

function main() {
  if (!isCorrectEnv('selection')) return;

  var SCRIPT = {
        name: 'Make Trapping Stroke',
        version: 'v.0.1'
      },
      CFG = {
        width: 1, // Default stroke width
        isAddStroke: false, // Force add stroke
        isRndCap: true, // Force round stroke cap
        isRndCorner: true, // Force round stroke corner
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        isRgb: (activeDocument.documentColorSpace === DocumentColorSpace.RGB) ? true : false,
        uiOpacity: .98, // UI window opacity. Range 0-1
        preview: false,
      };

  // Setup initial data
  var doc = activeDocument,
      paths = [], //  Selected paths
      isUndo = false,
      tmpPath; // For fix Preview bug

  var badFills = getPaths(selection, paths),
      hasStroke = checkStroke(paths);

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.opacity = CFG.uiOpacity;

  var wrapper = win.add('group');
      wrapper.orientation = 'row';
      wrapper.alignChildren = 'fill';
      wrapper.spacing = 15;

  // Options
  var opts = wrapper.add('group');
      opts.orientation = 'column';
      opts.alignChildren = ['fill', 'top'];
      opts.spacing = 16;

  var widthGrp = opts.add('group');
      widthGrp.alignChildren = ['fill', 'center'];
  widthGrp.add('statictext', undefined, 'Weight:');
  var widthInp = widthGrp.add('edittext', [0, 0, 70, 25], CFG.width);
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    widthInp.active = true;
  }

  var unitsGrp = opts.add('group');
      unitsGrp.alignChildren = 'center';
  unitsGrp.add('statictext', undefined, 'Units:');
  var isPx = unitsGrp.add('radiobutton', undefined, 'pt');
      isPx.bounds = [0, 0, 35, 16];
  var isMm = unitsGrp.add('radiobutton', undefined, 'mm');
      isMm.bounds = [0, 0, 45, 16];
      isMm.value = true;

  var isAddStroke = opts.add('checkbox', undefined, 'Force add stroke');
      isAddStroke.value = CFG.isAddStroke;

  // Separator
  var separator = wrapper.add('panel');
  separator.minimumSize.width = separator.maximumSize.width = 2;

  // Buttons
  var btns = wrapper.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];
  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});
  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = CFG.preview;

  // Adobe Illustrator Mac OS has bug with add stroke
  if (CFG.isMac) win.add('statictext', [0, 0, 240, 30], "The 'Force add stroke' option on Mac OS \nmay not work correctly", {multiline: true});
  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  // Run preview
  if (isPreview.value) preview();
  widthInp.onChanging = isPx.onClick = isMm.onClick = preview;
  isPreview.onClick = preview;
  isAddStroke.onClick = preview;

  // Use Up / Down arrow keys (+ Shift)
  shiftInputNumValue(widthInp, 0.001, 1000);

  ok.onClick = okClick;

  function preview() {
    try {
      if (isPreview.value && (hasStroke || isAddStroke.value)) {
        if (isUndo) app.undo();
        else isUndo = true;
        start();
        redraw();
      } else if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (e) {}
  }

  function okClick() {
    if (isPreview.value && isUndo) app.undo();
    start();
    isUndo = false;
    win.close();
  }

  // Start conversion
  function start() {
    tmpPath = doc.activeLayer.pathItems.add();
    tmpPath.name = '__TempPath';
    var widthVal = strToNum(widthInp.text, 1);
    if (isMm.value) widthVal = convertUnits(widthVal, 'mm', 'pt');
    for (var i = 0, len = paths.length; i < len; i++) {
      var item = paths[i];
      if (isAddStroke.value && !item.stroked) {
        item.stroked = true;
      }
      if (item.stroked) {
        item.strokeWidth = widthVal;
        if (CFG.isRndCap) item.strokeCap = StrokeCap.ROUNDENDCAP;
        if (CFG.isRndCorner) item.strokeJoin = StrokeJoin.ROUNDENDJOIN;
        item.strokeOverprint = true;
        setColor(item, CFG.isRgb);
      }
    }
  }

  cancel.onClick = win.close;

  win.onClose = function () {
    try {
      if (isUndo) {
        undo();
        isUndo = false;
      }
    } catch (e) {}
    tmpPath.remove();
    redraw();
    var msg = 'Attention\nThe script skips Paths & Compound Paths ';
    msg += 'with patterns or empty fills. Such objects: ';
    if (badFills) alert(msg + badFills, SCRIPT.name);
  }

  function shiftInputNumValue(item, min, max) {
    item.addEventListener('keydown', function (kd) {
      var sign = this.text.substr(0, 1) == '+' ? '+' : '',
          step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      if (kd.keyName == 'Down') {
        this.text = strToNum(this.text, min) - step;
        if (this.text * 1 < min) this.text = min;
        if (this.text * 1 > 0) this.text = sign + this.text;
        kd.preventDefault();
      }
      if (kd.keyName == 'Up') {
        this.text = strToNum(this.text, min) + step;
        if (this.text * 1 <= max) {
          kd.preventDefault();
        } else {
          this.text = max;
        }
        this.text = sign + this.text;
      }
      preview();
    });
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
          alert('Few objects are selected\nPlease, select at least one path', 'Script error');
          return false;
        }
        break;
    }
  }

  return true;
}

// Get paths from collection
function getPaths(coll, out) {
  var item = null, noColor = 0;
  for (var i = 0, len = coll.length; i < len; i++) {
    item = coll[i];
    if (isType(item, 'group') && item.pageItems.length) {
      noColor += getPaths(item.pageItems, out);
    } else if (isType(item, 'compound')) {
      if (item.pathItems.length && hasColorFill(item.pathItems[0])) {
        noColor += getPaths(item.pathItems, out);
      } else { 
        noColor++;
      }
    } else if (isType(item, 'path')) {
      if (hasColorFill(item)) {
        out.push(item);
      } else {
        noColor++;
      }
    }
  }
  return noColor;
}

// Has a fill not a pattern
function hasColorFill(obj) {
  if (obj.filled && isType(obj.fillColor, 'rgb|cmyk|gray|spot|gradient')) {
    return true;
  } else {
    return false;
  }
}

// Check if the objects have a stroke
function checkStroke(arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i].stroked) return true;
  }
  return false;
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

// Apply color to stroke
function setColor(obj, isRgb) {
  var fColor = obj.fillColor;
  var sColor = fColor;
  if (isType(fColor, 'gradient')) {
    sColor = interpolateColor(fColor.gradient, isRgb);
  }
  obj.strokeColor = sColor;
}

// Color interpolation by moody allen (moodyallen7@gmail.com)
function interpolateColor(grad, isRgb) {
  var amt = grad.gradientStops.length,
      cSum = {}; // Sum of color channels
  for (var i = 0; i < amt; i++) {
    var c = grad.gradientStops[i].color;
    if (isType(c, 'spot')) c = c.spot.color;
    if (isType(c, 'gray')) c.red = c.green = c.blue = c.black = c.gray;
    for (var key in c) {
      if (typeof c[key] === 'number') {
        if (cSum[key]) cSum[key] += c[key];
        else cSum[key] = c[key];
      }
    }
  }
  var mix = isRgb ? new RGBColor() : new CMYKColor();
  for (var key in cSum) mix[key] = cSum[key] / amt;
  return mix;
}

// Check the item typename by short name
function isType(item, type) {
  var regexp = new RegExp(type, 'i');
  return regexp.test(item.typename);
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

// Convert units of measurement
function convertUnits(val, curUnits, newUnits) {
  return UnitValue(val, curUnits).as(newUnits);
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
} catch (e) {}