/*
  SortLayerItems.jsx for Adobe Illustrator
  Description: Sort objects alphabetically inside of a layer
  Date: August, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru
  Based on sortLayers.jsx by Tom Scharstein (https://github.com/Inventsable)

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
  Tested with Adobe Illustrator CC 2019-2022 (Mac), 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

// Main function
function main() {
  var SCRIPT = {
        name: 'Sort Layer Items',
        version: 'v.0.1'
      },
      CFG = {
        isLowerFirst: true, // Set it to false if you want to place the layers with the first uppercase letter above
        isReverse: false, // Set it to true if you want to sort names in reverse order
        isInSublayers: false, // Enable sorting in sublayers
        uiOpacity: .98 // UI window opacity. Range 0-1
      };

  if (!isCorrectEnv) return;

  polyfills();

  var doc = activeDocument,
      aLayer = doc.activeLayer,
      shortName = aLayer.name.length <= 14 ? aLayer.name : aLayer.name.substr(0,14) + '...',
      docLayers = getVisibleLayers(doc, CFG.isInSublayers);

  // Dialog
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = 'fill';
      win.spacing = 10;
      win.opacity = CFG.uiOpacity;

  // Source layers 
  var layersPnl = win.add('panel', undefined, 'Layers');
      layersPnl.alignChildren = 'left';
      layersPnl.margins = [10, 15, 10, 10];

  var activeRb = layersPnl.add('radiobutton', undefined, 'Active <' + shortName + '>');
      activeRb.value = true;

  var allRb = layersPnl.add('radiobutton', undefined, docLayers.length + ' visible & unlocked layers');

  // Options
  var optGrp = win.add('group');
      optGrp.orientation = 'column';
      optGrp.alignChildren = 'left';
      optGrp.margins = [10, 0, 10, 0];

  var isInSublayers = optGrp.add('checkbox', undefined, 'Include all sublayers');
      isInSublayers.value = CFG.isInSublayers;

  var isReverse = optGrp.add('checkbox', undefined, 'Reverse alphabetical order');
      isReverse.value = CFG.isReverse;

  // Buttons
  var btns = win.add('group');
      btns.alignChildren = ['fill', 'fill'];
      btns.orientation = 'column';
      btns.margins = [10, 0, 10, 0];

  var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
      cancel.helpTip = 'Press Esc to Close';

  var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
      ok.helpTip = 'Press Enter to Run';

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  isInSublayers.onClick = function () {
    docLayers = getVisibleLayers(doc, isInSublayers.value);
    allRb.text = allRb.text.replace(/^\d+/g, docLayers.length);
  }

  cancel.onClick = win.close;

  ok.onClick = okClick;

  function okClick() {
    if (activeRb.value) {
      if (aLayer.locked) {
        alert('Active layer is locked');
        return;
      }
      if (!aLayer.visible) {
        alert('Active layer is hidden');
        return;
      }
      sortLayerItems(aLayer, CFG.isLowerFirst, isReverse.value);
    } else {
      for (var i = 0, len = docLayers.length; i < len; i++) {
        sortLayerItems(docLayers[i], CFG.isLowerFirst, isReverse.value);
      }
    }
    win.close();
  }

  win.center();
  win.show();
}

// Check the script environment
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    switch (args[i].toString().toLowerCase()) {
      case 'app':
        if (!/illustrator/i.test(app.name)) {
          alert('Error\nRun script from Adobe Illustrator');
          return false;
        }
        break;
      case 'version':
        if (parseInt(app.version) < 16) {
          alert('Error\nSorry, script only works in Illustrator CS6 and later');
          return false;
        }
        break;
      case 'document':
        if (!documents.length) {
          alert('Error\nOpen a document and try again');
          return false;
        }
        break;
      case 'selection':
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Error\nPlease, select at least one path');
          return false;
        }
        break;
    }
  }

  return true;
}

// Polyfill for Array.forEach
function polyfills() {
  Array.prototype.forEach = function (callback) {
    for (var i = 0; i < this.length; i++) callback(this[i], i, this);
  }
}

// Get all single layers
function getVisibleLayers(parent, isInSublayers) {
  if (arguments.length == 1 || isInSublayers == undefined) isInSublayers = false;
  var out = [];

  for (var i = 0, len = parent.layers.length; i < len; i++) {
    var currLayer = parent.layers[i];
    if (!currLayer.locked && currLayer.visible) {
      out.push(currLayer);
      if (isInSublayers) {
        out = [].concat(out, getVisibleLayers(currLayer, isInSublayers));
      }
    }
  }

  return out;
}

// Sort items alphabetically
function sortLayerItems(parent, isLowerFirst, isReverse) {
  if (arguments.length == 1 || isReverse == undefined) isReverse = false;

  get('pageItems', parent)
    .sort(function (a, b) {
      var aName = getName(a);
      var bName = getName(b);
      if (!isNaN(aName) && !isNaN(bName)) {
        return 1 * aName - 1 * bName;
      } else {
        return hasMixedCase(aName, bName) ?
          handleMixedCase(aName, bName, isLowerFirst) :
          aName.toLowerCase().localeCompare(bName.toLowerCase());
      }
    })
    .forEach(function (e) {
      e.zOrder(isReverse ? ZOrderMethod.BRINGTOFRONT : ZOrderMethod.SENDTOBACK);
    });
}

// Convert ILST collection into standard Array so we can use Array methods
function get(type, parent) {
  if (arguments.length == 1 || parent == undefined) parent = app.activeDocument;
  var result = [];
  if (!parent[type]) return result;
  for (var i = 0; i < parent[type].length; i++) result.push(parent[type][i]);
  return result;
}

// Get PageItem name
function getName(e) {
  if (e.typename === 'TextFrame' && isEmpty(e.name) && !isEmpty(e.contents)) {
    return e.contents;
  } else if (e.typename === 'SymbolItem' && isEmpty(e.name)) {
    return e.symbol.name;
  } else {
    return e.name;
  }
}

// Check string
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

function hasMixedCase(a, b) {
  if (a.charAt(0).toLowerCase() !== b.charAt(0).toLowerCase()) return false;
  return isUpperCase(a) && isLowerCase(b) ? true : isLowerCase(a) && isUpperCase(b);
}

function handleMixedCase(a, b, isLowerFirst) {
  var result = a === b ? 0 : isUpperCase(a) ? 1 : -1;
  return isLowerFirst ? result : result * -1;
}

function isUpperCase(text) {
  return /[A-Z]/.test(text.charAt(0));
}

function isLowerCase(text) {
  return /[a-z]/.test(text.charAt(0));
}

// Get items array
function getItems(collection) {
  var out = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    out.push(collection[i]);
  }
  return out;
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