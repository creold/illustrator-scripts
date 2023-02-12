/*
  ConvertToGradient.jsx for Adobe Illustrator
  Description: Convert a flat process color into a matching gradient
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on script by Saurabh Sharma (https://tutsplus.com/authors/saurabh-sharma), 2010
  What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. 
              Processes compound paths and groups of items

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.1.1 Performance optimization
  0.1.2 Bug fixes
  0.1.3 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

var fillBad = 0;

function main() {
  var SCRIPT = {
        name: 'ConvertToGradient',
        version: 'v.0.1.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        uiOpacity: .97 // UI window opacity. Range 0-1
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }
  
  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select atleast one object');
    return;
  }

  var doc = app.activeDocument,
      maxValue = isRgbDoc() ? 255 : 100,
      shiftValue = 0,
      angleValue = 0,
      gShiftEnd = 0;

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // Main Window
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.preferredSize.width = 174;
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = CFG.uiOpacity;

  // Value fields
  var shiftPanel = dialog.add('panel', undefined, 'Gradient Shift');
      shiftPanel.alignChildren = ['fill', 'fill'];
  var gShift = shiftPanel.add('edittext', undefined, '10');
  if (winFlickerFix) {
    if (!CFG.isTabRemap) simulateKeyPress('TAB', 1);
  } else {
    gShift.active = true;
  }
  var anglePanel = dialog.add('panel', undefined, 'Gradient Angle');
      anglePanel.alignChildren = ['fill', 'fill'];
  var gAngle = anglePanel.add('edittext', undefined, '0');

  // Buttons
  var btns = dialog.add('group');
      btns.alignChildren = ['fill', 'fill'];
      btns.orientation = 'column';
  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';
  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  ok.onClick = function () {
    if (isNaN(Number(gShift.text))) {
      alert('Gradient Shift\nPlease enter a numeric value.');
      return;
    } else if (gShift.text === null) {
      return;
    } else {
      shiftValue = Math.round(Number(gShift.text));
      if (shiftValue <= 0) shiftValue = 0;
      if (shiftValue >= maxValue) shiftValue = maxValue;
      gShiftEnd = maxValue - shiftValue;
    }

    if (isNaN(Number(gAngle.text))) {
      alert('Gradient Angle: \nPlease enter a numeric value.');
      return;
    } else if (gAngle.text === null) {
      return;
    } else {
      angleValue = Number(gAngle.text);
    }

    var channel = isRgbDoc() ? ['red', 'green', 'blue'] : ['cyan', 'magenta', 'yellow', 'black'];

    // Start conversion
    for (var i = 0, selLen = selection.length; i < selLen; i++) {
      convertToGradient(selection[i], shiftValue, angleValue, channel, maxValue, gShiftEnd);
    }
    if (fillBad > 0) {
      alert('Fill an ' + fillBad + ' objects with flat color ' +
            '\nAny objects containing gradients, patterns, ' + 
            'global colors or empty fills will be omitted');
    }
    dialog.close();
  }

  cancel.onClick = function () { dialog.close(); }

  dialog.center();
  dialog.show();
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

// Search items in selection
function convertToGradient(obj, shift, angle, channel, max, shiftEnd) {
  try {
    switch (obj.typename) {
      case 'GroupItem':
        for (var j = 0, piLen = obj.pageItems.length; j < piLen; j++) {
          convertToGradient(obj.pageItems[j], shift, angle, max, shiftEnd);
        }
        break;
      case 'PathItem':
        if (obj.filled && chkFillType(obj)) {
          applyGradient(obj, shift, angle, max, shiftEnd, channel);
        } else {
          fillBad++;
        }
        break;
      case 'CompoundPathItem':
        if (obj.pathItems[0].filled && chkFillType(obj.pathItems[0])) {
          applyGradient(obj.pathItems[0], shift, angle, max, shiftEnd, channel);
        } else {
          fillBad++;
        }
        break;
      default:
        break;
    }
  } catch (e) {}
}

// Apply gradient to items
function applyGradient(obj, shift, angle, max, shiftEnd, channel) {
  var currentColor = (obj.fillColor.typename == 'SpotColor') ? obj.fillColor.spot.color : obj.fillColor;
  var startColor = isRgbDoc() ? new RGBColor() : new CMYKColor();
  var endColor = isRgbDoc() ? new RGBColor() : new CMYKColor();

  // For Grayscale mode color is set individually
  if (currentColor.typename == 'GrayColor') {
    var startColor = new GrayColor();
    var endColor = new GrayColor();
    var grayColor = Math.round(currentColor.gray);

    if (grayColor < shift) startColor.gray = 0;
    else startColor.gray = grayColor - shift;

    if (grayColor > (100 - shift)) endColor.gray = 100;
    else endColor.gray = grayColor + shift;
  }

  //Set color for RGB || CMYK channels
  for (var j = 0, len = channel.length; j < len; j++) {
    var channelName = channel[j];
    var originColor = Math.round(currentColor[channelName]);
    
    if (originColor < shift) startColor[channelName] = 0;
    else startColor[channelName] = originColor - shift;

    if (originColor > shiftEnd) endColor[channelName] = max;
    else endColor[channelName] = originColor + shift;
  }

  // Create a new gradient
  var newGradient = activeDocument.gradients.add();
  newGradient.type = GradientType.LINEAR;

  // Modify the first gradient stop
  newGradient.gradientStops[0].rampPoint = 0;
  newGradient.gradientStops[0].midPoint = 50;
  newGradient.gradientStops[0].color = startColor;

  // Modify the last gradient stop
  newGradient.gradientStops[1].rampPoint = 100;
  newGradient.gradientStops[1].color = endColor;

  // Construct an Illustrator.GradientColor object
  var colorOfGradient = new GradientColor();
  colorOfGradient.gradient = newGradient;

  // Apply new gradient to current path item
  obj.fillColor = colorOfGradient;
  obj.rotate(angle, false, false, true, false, Transformation.CENTER);
}

function isRgbDoc() {
  return activeDocument.documentColorSpace == DocumentColorSpace.RGB;
}

function chkFillType(obj) {
  if (obj.fillColor.typename == 'RGBColor' ||
      obj.fillColor.typename == 'CMYKColor' ||
      obj.fillColor.typename == 'GrayColor' ||
      obj.fillColor.typename == 'SpotColor')
      return true;
}

// Run script
try {
  main();
} catch (e) {}