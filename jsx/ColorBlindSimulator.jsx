/*
  ColorBlindSimulator.jsx for Adobe Illustrator
  Description: Simulates color vision deficiency of 8 types for paths and text.
  Adobe is limited to two settings in View > Proof Setup.
  You can use only the preview or recolor your artwork
  Date: April, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  
  ---
  The Color Blind Simulation function is
  copyright (c) 2000-2001 by Matthew Wickline and the
  Human-Computer Interaction Resource Network ( http://hcirn.com/ ).
  
  It is used with the permission of Matthew Wickline and HCIRN,
  and is freely available for non-commercial use. For commercial use, please
  contact the Human-Computer Interaction Resource Network ( http://hcirn.com/ )
  ---

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
        name: 'Color Blind Simulator',
        version: 'v.0.1'
      },
      CFG = {
        list: ['Protanomaly', 'Protanopia', 'Deuteranomaly', 'Deuteranopia', // Don't change names
                'Tritanomaly', 'Tritanopia', 'Achromatomaly', 'Achromatopsia'],
        gamma: 2.2, // Gamma correction
        defPreview: false,
        dlgOpacity: .96 // UI window opacity. Range 0-1
      },
      R_BLIND = {
        'protan': { 'cpu': 0.735, 'cpv': 0.265, 'am': 1.273463, 'ayi': -0.073894 },
        'deutan': { 'cpu': 1.14, 'cpv': -0.14, 'am': 0.968437, 'ayi': 0.003331 },
        'tritan': { 'cpu': 0.171, 'cpv': -0.003, 'am': 0.062921, 'ayi': 0.292119 },
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (selection.length == 0 || selection.typename == 'TextRange') {
    alert('Error\nPlease, select one or more paths');
    return;
  }

  var funcBlind = {
        'protanopia'    : function(e) { return blind(e, R_BLIND.protan, CFG.gamma); },
        'protanomaly'   : function(e) { return anomylize(e, blind(e, R_BLIND.protan, CFG.gamma)); },
        'deuteranopia'  : function(e) { return blind(e, R_BLIND.deutan, CFG.gamma); },
        'deuteranomaly' : function(e) { return anomylize(e, blind(e, R_BLIND.deutan, CFG.gamma)); },
        'tritanopia'    : function(e) { return blind(e, R_BLIND.tritan, CFG.gamma); },
        'tritanomaly'   : function(e) { return anomylize(e, blind(e, R_BLIND.tritan, CFG.gamma)); },
        'achromatopsia' : function(e) { return monochrome(e); },
        'achromatomaly' : function(e) { return anomylize(e, monochrome(e)); }
      };

  var items = getItems(selection),
      isUndo = false;

  // Dialog
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = CFG.dlgOpacity;

  // Dropdown
  dialog.add('statictext', undefined, 'Select the type of color vision for recolor');
  var blindType = dialog.add('dropdownlist', undefined, CFG.list);
      blindType.selection = 1; // CFG.list index

  var btns = dialog.add('group');
  var isPreview = btns.add('checkbox', undefined, 'Preview');
      isPreview.value = CFG.defPreview;
  
  // CC 2020 v24.3 has the problem of undoing text changes
  if (parseInt(app.version) == 24 && isContainsText(items)) {
    dialog.add('statictext', undefined, "Text color preview doesn't work in CC 2020");
    isPreview.enabled = false;
  }

  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  if (isPreview.value) preview();
  isPreview.onClick = preview;
  blindType.onChange = preview;

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  dialog.onClose = function () {
    try {
      if (isUndo) {
        undo();
        redraw();
        isUndo = false;
      }
    } catch (e) {}
  }

  function preview() {
    if (!isPreview.enabled) return;
    try {
      if (isPreview.value) {
        if (isUndo) undo();
        // else isUndo = true;
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
    if (isPreview.value && isUndo) undo();
    start();
    isUndo = false;
    dialog.close();
  }

  function start() {
    // Get the key for the function
    var type = blindType.selection.toString().toLowerCase();

    for (var i = 0, len = items.length; i < len; i++) {
      var currItem = items[i];

      if (!hasColor(currItem, 'fillColor') && !hasColor(currItem, 'strokeColor'))
        continue;

      if (isText(currItem))
        currItem = currItem.textRange;
      
      if (hasColor(currItem, 'fillColor'))
        recolor(currItem, 'fillColor', funcBlind[type]);

      if (hasColor(currItem, 'strokeColor'))
        recolor(currItem, 'strokeColor', funcBlind[type]);

      isUndo = true; // If at least one object has been changed
    }
  }

  dialog.center();
  dialog.show();
}

// Get simulated RGB
function blind(rgb, type, gamma) {
  if (gamma == undefined) gamma = 2.2;

  var wx = 0.312713,
      wy = 0.329016,
      wz = 0.358271;

  var c = {};
  c.r = Math.pow(rgb[0] / 255, gamma);
  c.g = Math.pow(rgb[1] / 255, gamma);
  c.b = Math.pow(rgb[2] / 255, gamma);

  rgb2xyz(c);

  var sum_xyz = c.x + c.y + c.z;
  c.u = 0;
  c.v = 0;

  if (sum_xyz != 0) {
    c.u = c.x / sum_xyz;
    c.v = c.y / sum_xyz;
  }

  // Calculate difference between sim color and neutral color
  var nx = wx * c.y / wy,
      nz = wz * c.y / wy,
      clm, s = {},
      d = {};
  d.y = 0;

  if (c.u < type.cpu) {
    clm = (type.cpv - c.v) / (type.cpu - c.u);
  } else {
    clm = (c.v - type.cpv) / (c.u - type.cpu);
  }

  var clyi = c.v - c.u * clm;
  d.u = (type.ayi - clyi) / (clm - type.am);
  d.v = (clm * d.u) + clyi;

  s.x = d.u * c.y / d.v;
  s.y = c.y;
  s.z = (1 - (d.u + d.v)) * c.y / d.v;
  xyz2rgb(s);

  d.x = nx - s.x;
  d.z = nz - s.z;
  xyz2rgb(d);

  var adj_r = d.r ? ((s.r < 0 ? 0 : 1) - s.r) / d.r : 0,
      adj_g = d.g ? ((s.g < 0 ? 0 : 1) - s.g) / d.g : 0,
      adj_b = d.b ? ((s.b < 0 ? 0 : 1) - s.b) / d.b : 0;

  var adjust = Math.max(((adj_r > 1 || adj_r < 0) ? 0 : adj_r), ((adj_g > 1 || adj_g < 0) ? 0 : adj_g), ((adj_b > 1 || adj_b < 0) ? 0 : adj_b));

  // Shift proportionally
  s.r = s.r + (adjust * d.r);
  s.g = s.g + (adjust * d.g);
  s.b = s.b + (adjust * d.b);

  // Apply gamma and clamp simulated color
  function z(e) {
    return 255 * (e <= 0 ? 0 : (e >= 1 ? 1 : Math.pow(e, 1 / gamma)));
  }

  return [Math.round(z(s.r)), Math.round(z(s.g)), Math.round(z(s.b))];
}

// Convert RGB to XYZ color space
function rgb2xyz(obj) {
  obj.x = (0.430574 * obj.r + 0.341550 * obj.g + 0.178325 * obj.b);
  obj.y = (0.222015 * obj.r + 0.706655 * obj.g + 0.071330 * obj.b);
  obj.z = (0.020183 * obj.r + 0.129553 * obj.g + 0.939180 * obj.b);

  return obj;
}

// Convert XYZ to RGB color space
function xyz2rgb(obj) {
  obj.r = (3.063218 * obj.x - 1.393325 * obj.y - 0.475802 * obj.z);
  obj.g = (-0.969243 * obj.x + 1.875966 * obj.y + 0.041555 * obj.z);
  obj.b = (0.067871 * obj.x - 0.228834 * obj.y + 1.069251 * obj.z);

  return obj;
}

// If long-wavelength cones (L-cones) is defective
function anomylize(a, b) {
  var v = 1.75,
      d = v * 1 + 1;

  return [(v * b[0] + a[0] * 1) / d, (v * b[1] + a[1] * 1) / d, (v * b[2] + a[2] * 1) / d];
}

// Convert to monochrome
function monochrome(rgb) {
  var z = Math.round(rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114);

  return [z, z, z];
}

// Get single items
function getItems(collection) {
  var out = [];

  for (var i = 0, len = collection.length; i < len; i++) {
    var item = collection[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems));
    } else if (/compound/i.test(item.typename) && item.pathItems.length) {
      out = [].concat(out, getItems(item.pathItems));
    } else if (/pathitem|text/i.test(item.typename)) {
      out.push(item);
    }
  }

  return out;
}

// Check if the object has color
function hasColor(item, attr) {
  if (!isText(item) && /fill/i.test(attr) && !item.filled )
    return false;
  if (!isText(item) && /stroke/i.test(attr) && !item.stroked)
    return false;

  if(isText(item)) item = item.characters[0].characterAttributes;
  
  var type = item[attr].typename;

  if (/rgb|cmyk|gray|spot|gradient/i.test(type))
    return true;

  return false;
}

// Does the array contain TextFrame
function isContainsText(collection) {
  for (var i = 0, len = collection.length; i < len; i++) {
    if (/text/i.test(collection[i].typename)) return true;
  }
  return false;
}

// Check the TextFrame
function isText(item) {
  return (/text/i.test(item.typename));
}

// Change the original color to the simulated color
function recolor(item, attr, func) {
  var isRgb = activeDocument.documentColorSpace == DocumentColorSpace.RGB,
      fill = item[attr],
      c = {}; // Color

  if (/gradient/i.test(fill)) { // Gradient color
    for (i = 0, len = fill.gradient.gradientStops.length; i < len; i++) {
      var gStop = fill.gradient.gradientStops[i];
      c = setBlindColor(gStop.color, func);
      gStop.color = c;
      c = {};
    }
  } else { // Solid color
    c = setBlindColor(fill, func);
    item[attr] = c;
  }

  // Calc
  function setBlindColor(src, func) {
    var c = getOriginalColor(src, isRgb),
        rgb = [], cmyk = [];

    if (isRgb) {
      rgb = func([c.red, c.green, c.blue]); // Simulate
    } else {
      rgb = cmyk2rgb([c.cyan, c.magenta, c.yellow, c.black]);
      rgb = func(rgb); // Simulate
      cmyk = rgb2cmyk(rgb);
    }
    return isRgb ? setRGBColor(rgb) : setCMYKColor(cmyk);
  }
}

// Get single color
function getOriginalColor(c, isRgb) {
  var nc = {}; // New color
  switch (c.typename) {
    case 'SpotColor':
      if (c.tint === 100) {
        return getOriginalColor(c.spot.color, isRgb);
      } else {
        var s = getOriginalColor(c.spot.color, isRgb);
        var raw = isRgb ? [s.red, s.green, s.blue] : cmyk2rgb([s.cyan, s.magenta, s.yellow, s.black]);
        raw = lerp(raw, [255, 255, 255], 1 - c.tint / 100);
        nc = isRgb ? setRGBColor(raw) : setCMYKColor(rgb2cmyk(raw));
        return nc;
      }
    case 'GrayColor':
      if (isRgb) {
        var raw = gray2rgb(c.gray);
        nc = setRGBColor(raw);
      } else {
        nc = setCMYKColor([0, 0, 0, c.gray]);
      }
      return nc;
    default:
      return c;
  }
}

// Linear interpolation
function lerp(from, to, value) {
  var out = [];
  for (var i = 0; i < from.length; i++) {
    out.push(from[i] + (to[i] - from[i]) * value);
  }
  return out;
}

// Convert CMYK to RGB color space
function cmyk2rgb(cmyk) {
  return convertColor('CMYK', 'RGB', cmyk);
}

// Convert RGB to CMYK color space
function rgb2cmyk(rgb) {
  return convertColor('RGB', 'CMYK', rgb);
}

// Convert GrayScale to RGB color space
function gray2rgb(gray) {
  return convertColor('GrayScale', 'RGB', [gray]);
}

// Convert color via native converter
function convertColor(src, dest, srcColor) {
  return app.convertSampleColor(ImageColorSpace[src], srcColor, ImageColorSpace[dest], ColorConvertPurpose.defaultpurpose);
}

// Generate solid RGB color
function setRGBColor(rgb) {
  var c = new RGBColor();
  c.red = rgb[0];
  c.green = rgb[1];
  c.blue = rgb[2];
  return c;
}

// Generate solid CMYK color
function setCMYKColor(cmyk) {
  var c = new CMYKColor();
  c.cyan = cmyk[0];
  c.magenta = cmyk[1];
  c.yellow = cmyk[2];
  c.black = cmyk[3];
  return c;
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