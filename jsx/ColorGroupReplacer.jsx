/*
  ColorGroupReplacer.jsx for Adobe Illustrator
  Description: Replaces the values of spot colors in one color group with spot colors 
  from another group by matching swatch names or by order

  Date: October, 2023
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
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

// Main function
function main() {
  var SCRIPT = {
        name: 'Color Group Replacer',
        version: 'v.0.1'
      },
      CFG = {
        isMac: /mac/i.test($.os),
        uiMgns: [10, 15, 10, 10],
        dlgOpacity: .98 // UI window opacity. Range 0-1
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!documents.length) {
    alert('No documents\nOpen a document and try again', 'Script error');
    return;
  }

  var doc = app.activeDocument;
  var swGroups = getColorGroups(doc);

  if (swGroups.length < 2) {
    alert('At least two color groups are required', 'Script Error');
    return;
  }

  var isUndo = false;
  var toName = swGroups[0];
  var fromName = swGroups[1];
  var lastIdx = swGroups.length - 1;

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'top'];
      win.opacity = 0.98;

  // Source
  var fromPnl = win.add('panel', undefined, 'Pick from color group');
      fromPnl.alignChildren = 'fill';
      fromPnl.margins = CFG.uiMgns;

  var fromList = fromPnl.add('dropdownlist', undefined, swGroups);
      fromList.selection = 1;

  // Destination
  var toPnl = win.add('panel', undefined, 'Apply to color group');
      toPnl.alignChildren = 'fill';
      toPnl.margins = CFG.uiMgns;

  var toList = toPnl.add('dropdownlist', undefined, swGroups);
      toList.selection = 0;

  // Replace mode
  var modePnl = win.add('panel', undefined, 'Mode');
      modePnl.orientation = 'row';
      modePnl.alignChildren = 'left';
      modePnl.margins = CFG.uiMgns;

  var isByName = modePnl.add('radiobutton', undefined, 'By matching names');
      isByName.value = true;
  var isByOrder = modePnl.add('radiobutton', undefined, 'By swatches order');

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'bottom'];

  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = false;

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Apply', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Apply', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  // Events
  if (isPreview.value) preview();

  toList.onChange = fromList.onChange = function () {
    toName = toList.selection.text;
    fromName = fromList.selection.text;
    preview();
  }

  isByName.onClick = isByOrder.onClick = isPreview.onClick = preview;

  function preview() {
    try {
      if (isPreview.value) {
        if (isUndo) app.undo();
        else isUndo = true;
        validateAndReplace(true);
        var aLayer = doc.activeLayer;
        var tmpLayer = doc.layers.add();
        doc.activeLayer = aLayer;
        tmpLayer.remove();
        app.redraw();
      } else if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
      }
    } catch (e) {}
  }

  ok.onClick = function() {
    if (isUndo) app.undo();
    validateAndReplace(false);
    isUndo = false;
  };

  cancel.onClick = function () {
    if (isUndo) app.undo();
    win.close();
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Compare selected color group names and replace colors
  function validateAndReplace(fromPreview) {
    var destIdx = toList.selection.index;

    if (fromName === toName) {
      alert('Select a group other than destination');
      isUndo = false;
      fromList.selection = destIdx == lastIdx ? 0 : Math.min(destIdx + 1, lastIdx);
      return;
    }
  
    replaceSpotColors(toName, fromName, isByOrder.value);

    if (!fromPreview) win.close();
  }

  win.center();
  win.show();
}

// Get document color group names
function getColorGroups(doc) {
  var out = [];

  for (var i = 0, len = doc.swatchGroups.length; i < len; i++) {
    var group = doc.swatchGroups[i];
    if (group.name !== '') out.push(group.name);
  }

  return out;
}

// Replace spot color values
function replaceSpotColors(toStr, fromStr, isByOrder) {
  var doc = app.activeDocument;

  try {
    var toGroup = doc.swatchGroups.getByName(toStr);
  } catch (e) {
    alert('Group ' + toGroup + ' not found');
    return;
  }

  try {
    var fromGroup = doc.swatchGroups.getByName(fromStr);
  } catch (e) {
    alert('Group ' + fromStr + ' not found');
    return;
  }

  var toColors = toGroup.getAllSwatches();
  var fromColors = fromGroup.getAllSwatches();

  for (var j = 0, toLen = toColors.length; j < toLen; j++) {
    var toSw = toColors[j];
    var name = toSw.name.toLowerCase();
    if (isNotSpot(toSw)) continue;

    if (isByOrder) {
      if (fromColors[j] && !isNotSpot(fromColors[j])) {
        replaceColorValues(toSw, fromColors[j]);
      }
    } else {
      for (var k = 0, fromLen = fromColors.length; k < fromLen; k++) {
        var fromSw = fromColors[k];
        if (isNotSpot(fromSw)) continue;
        if (fromSw.name.toLowerCase().indexOf(name) !== -1) {
          replaceColorValues(toSw, fromSw);
        }
      }
    }
  }
}

// Check swatch is Spot
function isNotSpot(sw) {
  return sw.color.typename !== 'SpotColor';
}

// Replace color values for RGB or CMYK
function replaceColorValues(sw1, sw2) {
  var c1 = sw1.color.spot.color;
  var c2 = sw2.color.spot.color;
  for (var key in c1) {
    if (typeof c1[key] === 'number' && c2.hasOwnProperty(key)) {
      c1[key] = c2[key];
    }
  }
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