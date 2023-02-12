/*
  BatchTrace.jsx for Adobe Illustrator
  Description: Batch tracing of placed and embedded raster images
  Date: August, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Added processing of files from user selected folder

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
        name: 'Batch Trace',
        version: 'v.0.2'
      },
      CFG = {
        extList: ['bmp', 'gif', 'giff', 'jpeg', 'jpg', 'psd', 'png', 'tif', 'tiff'], // Set supported file formats
        isInclSubdir: true, // Include subfolder files
        isReverse: true,  // Make user presets first in the list
        isExpand: true, // Expand traced image
        uiMargins: [10, 15, 10, 10],
        dlgOpacity: .97 // UI window opacity. Range 0-1
      },
      SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  if (!/illustrator/i.test(app.name)) {
    alert('Error\nRun script from Adobe Illustrator');
    return;
  }

  var images = getRasters(selection);

  var tpList = tracingPresetsList,
      imgDir = decodeURI(Folder.desktop);

  if (CFG.isReverse) tpList.reverse();

  var dlg = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dlg.orientation = 'column';
      dlg.alignChildren = 'fill';
      dlg.spacing = 10;
      dlg.preferredSize.width = 210;
      dlg.opacity = CFG.dlgOpacity;
  
  // Area
  var area = dlg.add('group');
      area.alignChildren = 'fill';

  var selRb = area.add('radiobutton', undefined, 'Selection (' + images.length + ')');
      selRb.value = true;
  var dirRb = area.add('radiobutton', undefined, 'Folder');

  // Custom folder
  var src = dlg.add('panel', undefined, 'Images source folder');
      src.orientation = 'column';
      src.alignChildren = 'fill';
      src.margins = CFG.uiMargins;

  var srcBtn = src.add('button', undefined, 'Choose');
  var srcLbl = src.add('edittext', undefined, imgDir, {readonly: true});
      srcLbl.characters = 10;

  // Options for folder
  var isOneDoc = src.add('checkbox', undefined, 'Vectorize in single .ai');
      isOneDoc.value = false;

  var prof = src.add('group');
      prof.alignChildren = ['fill', 'top'];
  prof.add('statictext', undefined, 'Color');

  var rgbRb = prof.add('radiobutton', undefined, 'RGB');
      rgbRb.value = true;
  var cmykRb = prof.add('radiobutton', undefined, 'CMYK');

  // Tracing presets
  var tpPnl = dlg.add('panel', undefined, 'Tracing preset');
      tpPnl.margins = CFG.uiMargins;
      tpPnl.alignChildren = 'fill';

  var presets = tpPnl.add('dropdownlist', undefined, tpList);
      presets.preferredSize.width = 100;
      presets.selection = 0;

  var isExpand = dlg.add('checkbox', undefined, 'Expand traced image');
      isExpand.value = CFG.isExpand;

  var btns = dlg.add('group');
      btns.orientation = 'column';
      btns.alignChildren = 'fill';

  var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
  var ok = btns.add('button', undefined, 'Ok', {name: 'ok'});

  var copyright = dlg.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  var prgGroup = dlg.add('group');
  var progBar = prgGroup.add('progressbar', [20, 5, 200, 10], 0, 100);

  loadSettings();

  if (!images.length) {
    selRb.enabled = false;
    dirRb.value = true;
  }
  
  if (selRb.value) {
    src.visible = !selRb.value;
    src.maximumSize = [0, 0];
    dlg.spacing /= 2;
  }

  selRb.onClick = function () {
    src.visible = false;
    dlg.spacing /= 2;
    src.maximumSize = [0, 0];
    dlg.layout.layout(true);
  }

  dirRb.onClick = function () {
    src.visible = true;
    dlg.spacing *= 2;
    src.maximumSize = [1000, 1000];
    dlg.layout.layout(true);
  }

  srcBtn.onClick = function () {
    var dir = Folder.selectDialog('Select the source folder...');
    if (dir !== null) {
      srcLbl.text = decodeURI(dir);
      imgDir = dir;
    }
  }

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = dlg.close;
  ok.onClick = okClick;

  function okClick() {
    ok.text = 'Wait...';

    var colorProf = rgbRb.value ? DocumentColorSpace.RGB : DocumentColorSpace.CMYK,
        doc, pImg;

    if (dirRb.value) {
      images = getAllFiles(imgDir, CFG.extList, CFG.isInclSubdir);
    }

    if (dirRb.value && isOneDoc.value) {
      doc = documents.add(colorProf);
    }

    var amount = images.length,
        idx = CFG.isReverse ? presets.items.length - 1 - presets.selection.index : presets.selection.index;

    images.forEach(function (e, i) {
      if (selRb.value) {
        traceRaster(e, idx, isExpand.value);
      } else {
        var imgName = e.name.replace(/\.[^\.]+$/, '');
        if (!isOneDoc.value) doc = documents.add(colorProf);

        pImg = doc.placedItems.add();
        pImg.file = new File(e);
        pImg.name = imgName;
        traceRaster(pImg, idx, isExpand.value);

        if (!isOneDoc.value) {
          saveFile(imgName + '_traced' + '.ai', imgDir + '/traced');
        }

      }
      progBar.value = parseInt(100 * (i + 1) / amount);
    });

    if (dirRb.value && isOneDoc.value) {
      saveFile('traced_images' + '.ai', imgDir);
      alert('Result have been exported to ' + '\n' + decodeURI(imgDir + '/traced_images.ai'));
    }

    saveSettings();
    dlg.close();
  }

  // Save UI options to file
  function saveSettings() {
    if(!Folder(SETTINGS.folder).exists) Folder(SETTINGS.folder).create();
    var $file = new File(SETTINGS.folder + SETTINGS.name);
    $file.encoding = 'UTF-8';
    $file.open('w');
    var pref = {};
    pref.selection = selRb.value;
    pref.dir = srcLbl.text;
    pref.single = isOneDoc.value;
    pref.rgb = rgbRb.value;
    pref.expand = isExpand.value;
    pref.preset = presets.selection.index;
    var data = pref.toSource();
    $file.write(data);
    $file.close();
  }

  // Load options from file
  function loadSettings() {
    var $file = File(SETTINGS.folder + SETTINGS.name);
    if ($file.exists) {
      try {
        $file.encoding = 'UTF-8';
        $file.open('r');
        var json = $file.readln();
        var pref = new Function('return ' + json)();
        $file.close();
        if (typeof pref != 'undefined') {
          pref.selection ? selRb.value = true : dirRb.value = true;
          srcLbl.text = pref.dir;
          isOneDoc.value = pref.single;
          pref.rgb ? rgbRb.value = true : cmykRb.value = true;
          isExpand.value = pref.expand;
          presets.selection = pref.preset;
        }
      } catch (e) {}
    }
  }

  dlg.center();
  dlg.show();
}

// Get all placed and raster images
function getRasters(collection) {
  var out = [];
  
  getItems(collection).forEach(function (e) {
    if (e.pageItems && e.pageItems.length) {
      out = [].concat(out, getRasters(e.pageItems));
    } else if (/raster|placed/i.test(e.typename)) {
      out.push(e);
    } else {
      e.selected = false;
    }
  });

  return out;
}

// Get all files with custom extensions in source folder and subfolders
function getAllFiles(dir, ext, isInclSubdir) {
  var fList = dir.getFiles(),
      regexp = new RegExp(ext.join('|')),
      out = [];

  fList.forEach(function (f) {
    if (isInclSubdir && f instanceof Folder) {
      out = out.concat(getAllFiles(f, ext, isInclSubdir));
    } else if (f instanceof File) {
      if (regexp.test(/\.[^\.]+$/g.exec(f.name)[0])) out.push(f);
    }
  });

  return out;
}

// Trace placed or raster image
function traceRaster(img, pIdx, isExpand) {
  var tImg = img.trace(),
      preset = tracingPresetsList[pIdx];
  tImg.tracing.tracingOptions.loadFromPreset(preset);
  tImg.name = img.name;
  redraw();
  if (isExpand) tImg.tracing.expandTracing().selected = true;
}

// Export traced image to file
function saveFile(name, dir) {
  if (!Folder(dir).exists) {
    Folder(dir).create();
  }
  var outFile = new File(dir + '/' + name);
  activeDocument.saveAs(outFile);
  activeDocument.close();
}

// Get items array
function getItems(collection) {
  var out = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    out.push(collection[i]);
  }
  return out;
}

// Polyfill forEach() for Array
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback) {
    for (var i = 0; i < this.length; i++) callback(this[i], i, this);
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