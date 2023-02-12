/*
  exportToDXF.jsx for Adobe Illustrator
  Description: Export all artboards or selection to separately DXF
  Date: May, 2021
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
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Export To DXF',
        version: 'v.0.1'
      },
      CFG = {
        defRadio: 1, // Default export: 1 - Artboards, 2 - Selection, 3 - Each selection
        abs: '1, 2-4',
        allAbs: '%all',
        uiMargins: [10, 15, 10, 10],
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        errFolder: { en: "Error\nThis folder doesn't exist",
                  ru: 'Ошибка\nТакой папки не существует' },
        errPrefix: { en: 'Error\nPlease enter file name prefix',
                  ru: 'Ошибка\nВведите префикс имени' },
        folder: { en: 'Output folder', ru: 'Папка назначения' },
        select: { en: 'Select', ru: 'Выбрать' },
        selectTitle: { en: 'Select a folder to export',
                        ru: 'Выберите папку для экспорта' },
        prefix: { en: 'File name prefix', ru: 'Префикс имен файлов' },
        separator: { en: 'Separator', ru: 'Разделитель' },
        placeholder: { en: 'all artboards', ru: 'все артборды' },
        abs: { en: 'Artboards', ru: 'Артборды' },
        totalSel: { en: 'Selection', ru: 'Все выделение' },
        eachSel: { en: 'Each selection', ru: 'По отдельности' },
        absRange: { en: 'Artboards range', ru: 'Диапазон артбордов' },
        wait: { en: 'Waiting...', ru: 'Ожидайте...' },
        cancel: { en: 'Cancel', ru: 'Отмена' },
        ok: { en: 'Export', ru: 'Экспортировать' }
      };

  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  // Default variables for dialog box
  var doc = activeDocument,
      fileName = doc.name.replace(/\.[^\.]+$/, ''),
      exportOptions = getOptions(),
      separator = '-',
      outFolder = (doc.path != '') ? doc.path : Folder.desktop;

  // INTERFACE
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.alignChildren = ['fill', 'fill'];
      dialog.opacity = CFG.uiOpacity;

  var outPnl = dialog.add('panel', undefined, LANG.folder);
      outPnl.orientation = 'row';
      outPnl.margins = CFG.uiMargins;
  var outFolderBtn = outPnl.add('button', undefined, LANG.select);
  var outFolderLbl = outPnl.add('edittext', undefined);
      outFolderLbl.text = decodeURI(outFolder);
      outFolderLbl.characters = 22;

  var fileNameGrp = dialog.add('group');
  var namePnl = fileNameGrp.add('panel', undefined, LANG.prefix);
      namePnl.orientation = 'row';
      namePnl.margins = CFG.uiMargins;
  var namePrefix = namePnl.add('edittext', undefined, fileName);
      namePrefix.characters = 22;
  var separatorPnl = fileNameGrp.add('panel', undefined, LANG.separator);
      separatorPnl.margins = CFG.uiMargins;
  var separatorInp = separatorPnl.add('edittext', undefined, separator);
      separatorInp.characters = 4;

  var optionPnl = dialog.add('group');
      optionPnl.orientation = 'row';
  var rbAbs = optionPnl.add('radiobutton', undefined, LANG.abs);
  var rbSel = optionPnl.add('radiobutton', undefined, LANG.totalSel);
  var rbSelSep = optionPnl.add('radiobutton', undefined, LANG.eachSel);
  switch (CFG.defRadio) {
    case 1:
    default:
      rbAbs.value = true;
      break;
    case 2:
      rbSel.value = true;
      break;
    case 3:
      rbSelSep.value = true;
      break;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    rbSel.enabled = rbSelSep.enabled = false;
    rbSel.value = rbSelSep.value = false;
    rbAbs.value = true;
  }

  var abPanel = dialog.add('panel', undefined, LANG.absRange);
      abPanel.orientation = 'column';
      abPanel.alignChildren = ['fill','fill'];
      abPanel.margins = CFG.uiMargins;
  var absInput = abPanel.add('edittext', undefined, CFG.abs);
  var absDescr = abPanel.add('statictext', undefined, CFG.allAbs + ' - ' + LANG.placeholder);
      absDescr.justify = 'left';

  rbSel.onClick = rbSelSep.onClick = function () {
    abPanel.enabled = false;
  }
  rbAbs.onClick = function () {
    abPanel.enabled = true;
  }

  var btns = dialog.add('group');
      btns.alignChildren = ['center', 'center'];
  var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
  var ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  outFolderBtn.onClick = function () {
    var userFolder = Folder.selectDialog(LANG.selectTitle);
    if (userFolder !== null) {
      outFolderLbl.text = decodeURI(userFolder);
      outFolder = userFolder;
    }
  }

  absDescr.addEventListener('mousedown', function () {
    rbAbs.active = true;
    dialog.update();
    absInput.text = CFG.allAbs;
    absInput.active = true;
    absInput.textselection = absInput.text;
  });

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  function okClick() {
    outFolder = decodeURI(outFolderLbl.text);

    if (isEmpty(outFolder.toString())) {
      outFolderLbl.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!Folder(outFolder).exists) {
      alert(LANG.errFolder);
      outFolderLbl.text = (doc.path != '') ? doc.path : Folder.desktop;
      return;
    }

    if (!isEmpty(namePrefix.text)) {
      fileName = namePrefix.text.trim();
    } else {
      alert(LANG.errPrefix);
      return;
    }

    ok.text = LANG.wait;
    dialog.update();

    var docSel = selection,
        tmpRange = absInput.text,
        absRange = []; // Range of artboards indexes

    // Prepare
    tmpRange = tmpRange.replace(/\s/g, ''); // Remove whitespaces
    tmpRange = tmpRange.split(','); // Split string to array
    absRange = getArtboardsRange(tmpRange, CFG.allAbs);

    if (!isEmpty(separatorInp.text)) separator = separatorInp.text;
    var rootDest = outFolder + '/' + fileName + separator;

    if (rbAbs.value) {
      selection = null;
      redraw();
      for (var i = 0, abLen = absRange.length; i < abLen; i++) {
        var idx = absRange[i];
        var abName = doc.artboards[idx].name.replace(/\s/g, separator);
        doc.artboards.setActiveArtboardIndex(idx);
        doc.selectObjectsOnActiveArtboard();
        exportDXF(rootDest + abName, exportOptions);
        selection = null;
        redraw();
      }
      doc.artboards.setActiveArtboardIndex(currBoardIdx);
    }

    if (rbSel.value) {
      exportDXF(rootDest.slice(0, -1 * separator.length), exportOptions);
    }

    if (rbSelSep.value) {
      selection = null;
      for (var i = 0, sLen = docSel.length; i < sLen; i++) {
        docSel[i].selected = true;
        exportDXF(rootDest + (i + 1), exportOptions);
        selection = null;
      }
    }

    selection = docSel;
    dialog.close();
  }

  dialog.center();
  dialog.show();
};

/**
 * Check empty string
 * @param {string} str - input string
 * @return {boolean} answer
 */
function isEmpty(str) {
  return str.replace(/\s/g, '').length == 0;
}

// Remove whitespaces from start and end of string
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

/**
 * Get document artboards from user input
 * @param {array} arr - raw array of artboards
 * @param {string} placeholder - keyword for get all artboards
 * @return {array} array of artboard indexes
 */
function getArtboardsRange(arr, placeholder) {
  var parsedStr = [];
  forEach(arr, function (e) {
    if (e.match(placeholder) != null) {
      for (var i = 0, absLen = activeDocument.artboards.length; i <= absLen; i++) {
        parsedStr.push(i);
      }
      return;
    };
    if (e.match('-') == null) {
      parsedStr.push(e * 1);
      return;
    };
    var extremeVal = e.split('-'); // Min & max value in range
    for (var j = (extremeVal[0] * 1); j <= extremeVal[1]; j++) {
      parsedStr.push(j);
    }
  });
  return intersect(activeDocument.artboards, parsedStr);
}

/**
 * Calls a provided callback function once for each element in an array
 * @param {array} collection
 * @param {function} fn - the callback function
 */
function forEach(collection, fn) {
  for (var i = 0; i < collection.length; i++) {
    fn(collection[i]);
  }
}

/**
 * Search for common elements in arrays
 * @param {array} arr1
 * @param {array} arr2
 * @return {array} array of common elements
 */
function intersect(arr1, arr2) {
  var tmp = [];
  for (var i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(i + 1) !== -1) tmp.push(i);
  }
  return tmp;
}

// Polyfill indexOf() for Array
Array.prototype.indexOf = function (item) {
  for (var i = 0 ; i < this.length; i++ ) {
    if ( this[i] === item ) return i;
  }
  return -1;
}

/**
 * Get AutoCAD options for export to DXF
 * @return {object} options
 */
function getOptions() {
  var options = new ExportOptionsAutoCAD();
  options.exportFileFormat = AutoCADExportFileFormat.DXF;
  // exportOptions.exportOption = AutoCADExportOption.PreserveAppearance;
  options.exportOption = AutoCADExportOption.MaximumEditability;
  // AutoCADCompatibility.AutoCADRelease13
  // AutoCADCompatibility.AutoCADRelease14
  // AutoCADCompatibility.AutoCADRelease15
  // AutoCADCompatibility.AutoCADRelease18
  // AutoCADCompatibility.AutoCADRelease21
  // AutoCADCompatibility.AutoCADRelease24
  options.version = AutoCADCompatibility.AutoCADRelease14;
  options.unit = AutoCADUnit.Millimeters;
  options.scaleLineweights = false;
  options.exportSelectedArtOnly = true;
  options.convertTextToOutlines = false;
  options.generateThumbnails = false;
  return options;
}

/**
 * Export to file
 * @param {string} dest - folder path
 * @param {object} options - AutoCAD export options
 */
function exportDXF(dest, options) {
  var file = new File(dest + '.dxf');
  activeDocument.exportFile(file, ExportType.AUTOCAD, options);
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

// Run script
try {
  main();
} catch (e) {}