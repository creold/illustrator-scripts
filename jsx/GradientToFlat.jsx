/*
  GradientToFlat.jsx for Adobe Illustrator
  Description: Convert a gradient to an interpolated solid color
  Date: April, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
$.localize = true; // Enabling automatic localization

// Main function
function main() {
  var SCRIPT = {
        name: 'Gradient To Flat',
        version: 'v.0.1'
      },
      CFG = {
        isFill: true, // Convert fill color
        isStroke: true, // Convert stroke color
        uiOpacity: 0.96 // UI window opacity. Range 0-1
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errSel: { en: 'Error\nPlease, select one or more paths',
                  ru: 'Ошибка\nВыделите 1 или более объектов' },
        fill: { en: 'F\u0332ill', ru: 'Заливка' },
        stroke: { en: 'S\u0332troke', ru: 'Обводка' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Ok', ru: 'Готово' }
      };

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var doc = activeDocument,
      isRgbProfile = (doc.documentColorSpace == DocumentColorSpace.RGB) ? true : false,
      selPaths = [],
      tmp = []; // Array of temp paths for fix compound paths

  getPaths(selection, selPaths, tmp);

  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'center'];
      dialog.margins = 20;
      dialog.opacity = CFG.uiOpacity;

  var options = dialog.add('group');
      options.orientation = isCyrillicUi() ? 'column' : 'row';
      options.alignChildren = ['left', 'center'];
      options.spacing = 20;

  var isFill = options.add('checkbox', undefined, LANG.fill);
      isFill.value = CFG.isFill;
      isFill.active = true;
  var isStroke = options.add('checkbox', undefined, LANG.stroke);
      isStroke.value = CFG.isStroke;

  var btnCancel = dialog.add('button', undefined, LANG.cancel, {name: 'cancel'});
  var btnConvert = dialog.add('button', undefined, LANG.ok, {name: 'ok'});

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  // Shortcut for options
  dialog.addEventListener('keydown', function(kd) {
    if (kd.keyName.match(/F/)) isFill.notify();
    if (kd.keyName.match(/S/)) isStroke.notify();
  });

  btnCancel.onClick = dialog.close;
  btnConvert.onClick = start;

  function start() {
    // Processing
    for (var i = 0, selLen = selPaths.length; i < selLen; i++) {
      var currItem = selPaths[i];

      // Convert fill color
      if (isFill.value && currItem.filled && isGradient(currItem.fillColor)) {
        var fColor = currItem.fillColor.gradient;
        currItem.fillColor = interpolateColor(fColor, isRgbProfile);
      }

      // Convert stroke color
      if (isStroke.value && currItem.stroked && isGradient(currItem.strokeColor)) {
        var sColor = currItem.strokeColor.gradient;
        currItem.strokeColor = interpolateColor(sColor, isRgbProfile);
      }
    }

    // Clear changes in compound paths
    for (var j = 0, tmpLen = tmp.length; j < tmpLen; j++) { tmp[j].remove(); }

    dialog.close();
  }

  dialog.center();
  dialog.show();
}

/**
 * Get paths from selection
 * @param {object} item collection of items
 * @param {array} arr output array of single paths
 * @param {array} tmp output array of temporary paths in compounds
 */
function getPaths(item, arr, tmp) {
  for (var i = 0, iLen = item.length; i < iLen; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          arr.push(currItem);
          break;
        case 'CompoundPathItem':
          // Fix compound path created from groups
          if (!currItem.pathItems.length) {
            tmp.push(currItem.pathItems.add());
          }
          arr.push(currItem.pathItems[0]);
          break;
        default:
          break;
      }
    } catch (e) {}
  }
}

/**
 * Color interpolation by moody allen (moodyallen7@gmail.com)
 * @param {object} color current gradient color
 * @param {boolean} isRgb document profile
 * @return {object} solid color
 */
function interpolateColor(color, isRgb) {
  var gStopsLength = color.gradientStops.length,
      cSum = {}; // Sum of color channels
  for (var j = 0; j < gStopsLength; j++) {
    var c = color.gradientStops[j].color;
    if (c.typename === 'SpotColor') c = c.spot.color;
    if (c.typename === 'GrayColor') c.red = c.green = c.blue = c.black = c.gray;
    for (var key in c) {
      if (typeof c[key] === 'number') {
        if (cSum[key]) cSum[key] += c[key];
        else cSum[key] = c[key];
      }
    }
  }
  var iColor = isRgb ? new RGBColor() : new CMYKColor();
  for (var key in cSum) { iColor[key] = cSum[key] / gStopsLength; }
  return iColor;
}

/**
 * Check the Illustrator interface language
 * @return {boolean} is Russian or Ukrainian language
 */
function isCyrillicUi() {
  return $.locale.match(/ru|ua/gi) !== null;
}

/**
 * Check gradient color
 * @param {object} color current item color
 * @return {boolean} is Gradient color or not
 */
function isGradient(color) {
  return color.typename === 'GradientColor';
}

/**
 * Open link in browser
 * @param {string} url - website adress
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