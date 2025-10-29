/*
  ArtboardsFinder.jsx for Adobe Illustrator
  Description: Search and navigate to artboards by name or size
  Date: December, 2022
  Modification date: October, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.2 Added export of artboard data (number, name, dimensions) to CSV/TXT. Minor improvements
  0.1.5 Removed input activation on Windows OS below CC v26.4
  0.1.4 Added new units API for CC 2023 v27.1.1
  0.1.3 Added size correction in large canvas mode
  0.1.2 Fixed input activation in Windows OS
  0.1.1 Minor improvements
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
$.localize = true; // Enabling automatic localization

function main() {
  var SCRIPT = {
        name: 'Artboards Finder',
        version: 'v0.2'
      };

  var CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        defZoom: 0.75, // Zoom ratio in document window
        minZoom: 0.1, // Minimal zoom ratio
        width: 280, // Units: px
        rows: 6, // Amount of rows in listbox
        units: getUnits(), // Active document units
        uiOpacity: .97 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
        folder: Folder.myDocuments + '/Adobe Scripts/'
      };

  var LANG = {
        errDoc: { en: 'Error\nOpen a document and try again',
                  ru: 'Ошибка\nОткройте документ и запустите скрипт' },
        method: { en: 'Search method', ru: 'Метод поиска'},
        byName: { en: 'By name', ru: 'По имени'},
        byWidth: { en: 'By width, ' + CFG.units, ru: 'По ширине, ' + CFG.units},
        byHeight: { en: 'By height, ' + CFG.units, ru: 'По высоте, ' + CFG.units},
        byName: { en: 'By name', ru: 'По имени'},
        landscape: { en: 'Landscape', ru: 'Альбомные'},
        portrait: { en: 'Portrait', ru: 'Портретные'},
        square: { en: 'Square', ru: 'Квадратные'},
        found: { en: 'Found', ru: 'Найдено'},
        isZoom: { en: 'Zoom To Artboard (Ratio: ' + CFG.minZoom + '-1)',
                  ru: 'Приблизить (масштаб: ' + CFG.minZoom + '-1)'},
        idx: { en: '#', ru: '№'},
        num: { en: 'Number', ru: 'Номер'},
        ab: { en: 'Name', ru: 'Имя'},
        width: { en: 'Width', ru: 'Ширина'},
        height: { en: 'Height', ru: 'Высота'},
        zoomTip: { en: 'Click item to zoom and center view',
                    ru: 'Выберите элемент для увеличения и центрирования'},
        exportTitle: { en: 'Export', ru: 'Сохранить'},
        closeTitle: { en: 'Close', ru: 'Закрыть'},
        columns:  { en: 'Columns', ru: 'Колонки'},
        exportErr: { en: 'Please select at least one column to export',
                    ru: 'Выберите хотя быть одну колонку для экспорта'},
      };

  if (!app.documents.length) {
    alert(LANG.errDoc);
    return;
  }

  var doc = app.activeDocument;
  var foundAbs = []; // Array of found artboards
  var selectedAbs = []; // Array of selected rows

  // Scale factor for Large Canvas mode
  CFG.sf = doc.scaleFactor ? doc.scaleFactor : 1;

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.opacity = CFG.uiOpacity;

  // FILTERS
  var filterPnl = win.add('panel', undefined, LANG.method);
      filterPnl.orientation = 'row';
      filterPnl.bounds = [0, 0 , CFG.width, 120];

  var isByName = addRadio(filterPnl, 0, 0, LANG.byName);
      isByName.value = true;
  var isByWidth = addRadio(filterPnl, 0, 1, LANG.byWidth);
  var isByHeight = addRadio(filterPnl, 0, 2, LANG.byHeight);
  var isLandscape = addRadio(filterPnl, 1, 0, LANG.landscape);
  var isPortrait = addRadio(filterPnl, 1, 1, LANG.portrait);
  var isSquare = addRadio(filterPnl, 1, 2, LANG.square);

  // SEARCH QUERY
  var queryGrp = win.add('group');
      queryGrp.alignment = ['fill', 'center'];

  var query = queryGrp.add('edittext', undefined, '');
      query.alignment = ['fill', 'center'];

  if (CFG.isMac || CFG.aiVers >= 26.4 || CFG.aiVers <= 17) {
    query.active = true;
  }

  var clearBtn = queryGrp.add('button', undefined, '\u2715');
      clearBtn.alignment = ['right', 'center'];
      clearBtn.preferredSize = [30, 22];

  // SEARCH RESULTS
  var listbox = win.add('listbox', [0, 0, CFG.width, 20 + 21 * CFG.rows], undefined,
      {
        numberOfColumns: 4,
        showHeaders: true,
        columnTitles: [
          LANG.idx,
          LANG.ab,
          LANG.width,
          LANG.height
        ],
        multiselect: true
      });
      listbox.helpTip = LANG.zoomTip;

  var foundLbl = win.add('statictext', undefined, LANG.found + ': 0');
      foundLbl.alignment = 'left';

  // ZOOM OPTION
  var zoomGroup = win.add('group');
      zoomGroup.alignment = ['fill', 'center'];

  var isZoom = zoomGroup.add('checkbox', undefined, LANG.isZoom);

  var zoomRatioInp = zoomGroup.add('edittext', undefined, CFG.defZoom);
      zoomRatioInp.characters = 6;

  // FOOTER
  var footer = win.add('group');
      footer.alignment = ['fill', 'fill'];

  var copyright = footer.add('statictext', undefined, 'Visit GitHub');
      copyright.alignment = ['left', 'center'];

  // BUTTONS
  var btns = footer.add('group');
      btns.alignment = ['right', 'center'];

  var exportBtn = btns.add('button', undefined, LANG.exportTitle, {name: 'export'});
  var closeBtn = btns.add('button', undefined, LANG.closeTitle, {name: 'cancel'});

  // EVENTS
  loadSettings(SETTINGS);
  outputResults();

  // Select search method
  for (var i = 0; i < filterPnl.children.length; i++) {
    filterPnl.children[i].onClick = function () {
      query.enabled = isByName.value || isByWidth.value || isByHeight.value;
      outputResults();
    }
  }

  query.onChanging = outputResults;

  clearBtn.onClick = function () {
    query.text = '';
    this.active = true;
    query.active = true;
    outputResults();
  }

  // Select matched item
  listbox.onChange = selectResults;

  isZoom.onClick = zoomRatioInp.onChange;

  // Changing the zoom ratio
  zoomRatioInp.onChange = function () {
    if (strToAbsNum(this.text, CFG.defZoom) > 1) this.text = 1;
    if (strToAbsNum(this.text, CFG.defZoom) < CFG.minZoom) this.text = CFG.minZoom;
    selectResults();
  }

  exportBtn.onClick = function () {
    exportData(selectedAbs.length ? selectedAbs : foundAbs);
  }

  closeBtn.onClick = win.close;

  setTextHandler(copyright, function () {
    openURL('https://github.com/creold')
  });

  /**
   * Set up a clickable text handler with hover effects and callback execution
   * @param {Object} text - The statictext object to attach handlers to
   * @param {Function} callback - The function to execute on click
   */
  function setTextHandler(text, callback) {
    var isDarkUI = app.preferences.getRealPreference('uiBrightness') <= 0.5;
    var gfx = text.graphics;
    var colNormal = gfx.newPen(gfx.PenType.SOLID_COLOR, isDarkUI ? [0.7, 0.7, 0.7] : [0.3, 0.3, 0.3], 1); // Black
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

  win.onClose = function () {
    saveSettings(SETTINGS);
  }

  /**
   * Output the search results to a listbox after performing a search operation
   */
  function outputResults() {
    selectedAbs = []; // Clear previous matches
    foundAbs = []; // Clear previous matches
    listbox.removeAll(); // Clear list before search

    var pre = CFG.aiVers >= 24 ? 4 : 2; // Rounding precision
    for (var i = 0; i < filterPnl.children.length; i++) {
      if (filterPnl.children[i].value) {
        foundAbs = getAbsByFilter(i, query.text, CFG.units, pre, CFG.sf);
        break;
      }
    }

    if (isByWidth.value || isLandscape.value || isSquare.value) {
      foundAbs.sort(function (a, b) {
        return a.width - b.width;
      }).reverse();
    }

    if (isByHeight.value || isPortrait.value) {
      foundAbs.sort(function (a, b) {
        return a.height - b.height;
      }).reverse();
    }

    // Create listbox rows from search results
    for (var i = 0, len = foundAbs.length; i < len; i++) {
      var newRow = listbox.add('item', foundAbs[i].idx + 1);
      newRow.subItems[0].text = foundAbs[i].name;
      newRow.subItems[1].text = foundAbs[i].width;
      newRow.subItems[2].text = foundAbs[i].height;
    }

    foundLbl.text = LANG.found + ': ' + foundAbs.length;
  }

  /**
   * Go to document artboards based on the selected items in the listBox
   */
  function selectResults() {
    selectedAbs = []; // Clear previous matches
    var abs = [], first;

    // Collect selected rows indexes
    for (var i = 0, len = listbox.children.length; i < len; i++) {
      if (listbox.children[i].selected) {
        abs.push(foundAbs[i].ab);
        selectedAbs.push(foundAbs[i]);
        if (isNaN(first)) first = foundAbs[i].idx;
      }
    }

    doc.artboards.setActiveArtboardIndex(first);

    var ratio = strToAbsNum(zoomRatioInp.text, CFG.defZoom);
    zoom(abs, ratio, isZoom.value);
  }

  function exportData(absData) {
    var expWin = new Window('dialog', 'Export Format');
        expWin.alignChildren = 'fill';

    var formatGrp = expWin.add('group');
        formatGrp.orientation = 'column';
        formatGrp.alignChildren = 'left';

    var isCSV = formatGrp.add('radiobutton', undefined, 'CSV (Excel/Sheets)');
        isCSV.value = true;
    var isTXT = formatGrp.add('radiobutton', undefined, 'TXT');

    var dataPnl = expWin.add('panel', undefined, LANG.columns);
        dataPnl.alignChildren = 'left';
        dataPnl.margins = [10, 15, 10, 8];

    var isNumber = dataPnl.add('checkbox', undefined, LANG.num);
    var isName = dataPnl.add('checkbox', undefined, LANG.ab);
    var isWidth = dataPnl.add('checkbox', undefined, LANG.width);
    var isHeight = dataPnl.add('checkbox', undefined, LANG.height);

    isNumber.value = true;
    isName.value = true;
    isWidth.value = true;
    isHeight.value = true;

    var btns = expWin.add('group');
        btns.orientation = 'column';
        btns.alignChildren = 'fill';

    var cancelBtn = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    var okBtn = btns.add('button', undefined, 'OK', { name: 'ok' });
    
    okBtn.onClick = function () {
      if (!isNumber.value && !isName.value && 
          !isWidth.value && !isHeight.value) {
          alert(LANG.exportErr);
          return;
      }

      var settings = {
            format: isCSV.value ? 'csv' : 'txt',
            number: isNumber.value,
            name: isName.value,
            width: isWidth.value,
            height: isHeight.value,
            units: CFG.units
          };

      saveFile(absData, settings);
      expWin.close();
    }

    expWin.center();
    expWin.show();
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
    for (var i = 0; i < filterPnl.children.length; i++) {
      if (filterPnl.children[i].value) data.filter = i;
    }
    data.query = query.text;
    data.isZoom = isZoom.value;
    data.ratio = zoomRatioInp.text;

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
        filterPnl.children[parseInt(data.filter) || 0].value = true;
        if (parseInt(data.filter) > 2) query.enabled = false;
        query.text = data.query;
        isZoom.value = data.isZoom === 'true';
        zoomRatioInp.text = data.ratio;
      }
    } catch (err) {
      return;
    }
  }

  win.show();
}

/**
 * Get active document ruler units
 * @returns {string} Shortened units
 */
function getUnits() {
  if (!documents.length) return '';
  var key = app.activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
  switch (key) {
    case 'Pixels': return 'px';
    case 'Points': return 'pt';
    case 'Picas': return 'pc';
    case 'Inches': return 'in';
    case 'Millimeters': return 'mm';
    case 'Centimeters': return 'cm';
    // Added in CC 2023 v27.1.1
    case 'Meters': return 'm';
    case 'Feet': return 'ft';
    case 'FeetInches': return 'ft';
    case 'Yards': return 'yd';
    // Parse new units in CC 2020-2023 if a document is saved
    case 'Unknown':
      var xmp = app.activeDocument.XMPString;
      if (/stDim:unit/i.test(xmp)) {
        var units = /<stDim:unit>(.*?)<\/stDim:unit>/g.exec(xmp)[1];
        if (units == 'Meters') return 'm';
        if (units == 'Feet') return 'ft';
        if (units == 'FeetInches') return 'ft';
        if (units == 'Yards') return 'yd';
        return 'px';
      }
      break;
    default: return 'px';
  }
}

/**
 * Convert a value from one set of units to another
 * @param {string} value - The numeric value to be converted
 * @param {string} currUnits - The current units of the value (e.g., 'in', 'mm', 'pt')
 * @param {string} newUnits - The desired units for the converted value (e.g., 'in', 'mm', 'pt')
 * @returns {number} The converted value in the specified units
 */
function convertUnits(value, currUnits, newUnits) {
  return UnitValue(value, currUnits).as(newUnits);
}

/**
 * Convert string to absolute number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Add radiobutton to the dialog
 * @param {Object} place - Button container
 * @param {number} x - Column
 * @param {number} y - Row
 * @param {string} label - Button caption
 * @returns {Object} rb - Radiobutton
 */
function addRadio(place, x, y, label) {
  var rb = place.add('radiobutton', undefined, label),
      stepX = 140,
      stepY = 30,
      x0 = 10,
      y0 = 20;

  x = x0 + stepX * x;
  y = y0 + stepY * y;
  rb.bounds = [x, y, x + 120, y + 20];

  return rb;
}

/**
 * Filter and retrieve artboard data based on specified criteria
 * @param {number} mode - Search mode
 * @param {string} query - Search query
 * @param {string} units - Document units
 * @param {string} precision - Decimal places for rounding
 * @param {number} scaleFactor - The document scale factor
 * @returns {Array} results - Array of matched artboard objects with their data
 */
function getAbsByFilter(mode, query, units, precision, scaleFactor) {
  var doc = app.activeDocument;
  var results = [];
  var ab, abWidth, abHeight;

  for (var i = 0, len = doc.artboards.length; i < len; i++) {
    ab = doc.artboards[i];
    abWidth = ab.artboardRect[2] - ab.artboardRect[0];
    abHeight = Math.abs(ab.artboardRect[1] - ab.artboardRect[3]);

    // Convert to target units
    abWidth = scaleFactor * convertUnits(abWidth, 'px', units);
    abHeight = scaleFactor * convertUnits(abHeight, 'px', units);

    // Apply search mode logic
    switch (mode) {
      case 0: // By name (case-insensitive regex)
      default: // Default to name search if mode is invalid
        var regexp = new RegExp(query, 'i');
        if (ab.name.match(regexp))
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
      case 1: // By width
        if (abWidth.toFixed(precision).match(query))
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
      case 2: // By height
        if (abHeight.toFixed(precision).match(query))
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
      case 3: // Landscape (width > height)
        if (abWidth > abHeight)
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
      case 4: // Portrait (width < height)
        if (abWidth < abHeight)
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
      case 5: // Square (width == height, high precision)
        if (abWidth.toFixed(4) === abHeight.toFixed(4))
          pushAbData(results, i, ab, abWidth, abHeight, precision);
        break;
    }
  }

  return results;
}

/**
 * Push formatted artboard data object into the specified array
 * @param {Array} target - The target array to push the data into
 * @param {number} i - The index or identifier for the data entry
 * @param {Object} ab - The artboard object
 * @param {number} width - The width value to be formatted
 * @param {number} height - The height value to be formatted
 * @param {number} precision - Decimal places for rounding
 */
function pushAbData(target, i, ab, width, height, precision) {
  target.push({
    'idx': i,
    'ab': ab,
    'name': ab.name,
    'width': 1 * width.toFixed(precision),
    'height': 1 * height.toFixed(precision)
  });
}

/**
 * Zooms the active document based on the specified ratio and zoom flag
 * Based on script 'Zoom and Center to Selection v2' by John Wundes (http://www.wundes.com)
 * @param {Array} abs - Selected artboards
 * @param {number} ratio - Scale ratio
 * @param {boolean} isZoom - Use scale ratio
 */
function zoom(abs, ratio, isZoom) {
  var doc = app.activeDocument;
  if (isZoom) doc.views[0].zoom = 1;

  var screenSize = doc.views[0].bounds;
  var screenWidth = screenSize[2] - screenSize[0];
  var screenHeight = screenSize[1] - screenSize[3];
  var screenProportion = screenHeight / screenWidth;

  // Determine position of artboards
  var bnds = calcBounds(abs);
  var centerPos = [bnds[0], bnds[1]];
  var width = bnds[2] - bnds[0];
  var height = bnds[1] - bnds[3];

  centerPos[0] = bnds[0] + width / 2;
  centerPos[1] = bnds[1] - height / 2;
  doc.views[0].centerPoint = centerPos;

  if (isZoom) {
    // Set zoom for height and width
    var zoomRatioW = screenWidth / width;
    var zoomRatioH = screenHeight / height;

    // Decide which proportion is larger
    var zR = (width * screenProportion >= height) ? zoomRatioW : zoomRatioH;
    // And scale to that proportion minus a little bit
    doc.views[0].zoom = zR * parseFloat(ratio);
  }

  app.redraw();
}

/**
 * Get visible bounds of selected artboards
 * @param {Array} abs - Selected artboards
 * @returns {Array} Summary artboards bounds
 */
function calcBounds(abs) {
  var initBnds = abs[0].artboardRect;
  var x0 = initBnds[0];
  var y0 = initBnds[1];
  var x1 = initBnds[2];
  var y1 = initBnds[3];

  for (var i = 1, len = abs.length; i < len; i++) {
    var abRect = abs[i].artboardRect;
    x0 = Math.min(abRect[0], x0);
    y0 = Math.max(abRect[1], y0);
    x1 = Math.max(abRect[2], x1);
    y1 = Math.min(abRect[3], y1);
  }

  return [x0, y0, x1, y1];
}

/**
 * Save data to a file in the specified format (CSV or TXT) based on user settings
 * @param {Array} data - Array of objects containing data to be saved
 * @param {Object} settings - Configuration object for file format and content
 * @returns {void}
 */
function saveFile(data, settings) {
  var doc = app.activeDocument;
  var folder = Folder.selectDialog('', Folder(doc.path));
  if (!folder) return; // Exit if no folder selected

  var name = doc.name.replace(/\.[^\.]+$/, '');
  var file = new File(folder.fullName + '/' + name + '.' + settings.format);
  file.encoding = 'UTF-8';
  file.open('w');

  if (/csv/.test(settings.format)) {
    writeCSV(file, data, settings);
  } else {
    writeTXT(file, data, settings);
  }

  file.close();
}

/**
 * Write data to a CSV file with headers and rows based on user settings
 * @param {Object} file - File object to write to
 * @param {Array} data - Array of objects containing data to be written
 * @param {Object} settings - Configuration object for CSV content
 * @returns {void}
 */
function writeCSV(file, data, settings) {
  var headers = [];
  if (settings.number) headers.push('Number');
  if (settings.name) headers.push('Name');
  if (settings.width) headers.push('Width (' + settings.units + ')');
  if (settings.height) headers.push('Height (' + settings.units + ')');

  file.writeln(headers.join(';'));

  for (var i = 0, len = data.length; i < len; i++) {
    var row = data[i];
    var values = [];

    if (settings.number) values.push(row.idx + 1);
    if (settings.name) {
      // Escape commas and quotes in names for CSV
      var name = row.name.indexOf(',') > -1 || row.name.indexOf('"') > -1 ?
        '"' + row.name.replace(/"/g, '""') + '"' :
        row.name;
      values.push(name);
    }
    if (settings.width) values.push(row.width);
    if (settings.height) values.push(row.height);

    file.writeln(values.join(';'));
  }
}

/**
 * Write data to a TXT file with headers and rows based on user settings
 * @param {Object} file - File object to write to
 * @param {Array} data - Array of objects containing data to be written
 * @param {Object} settings - Configuration object for TXT content
 * @returns {void}
 */
function writeTXT(file, data, settings) {
  var doc = app.activeDocument;

  file.writeln('# Document: ' + doc.name);
  file.writeln('# Date: ' + new Date().toLocaleDateString());
  file.writeln('# Units: ' + settings.units);
  file.writeln('');

  // Calculate max name length for alignment
  var maxNameLength = 1;
  if (settings.name) {
    for (var i = 0; i < data.length; i++) {
      maxNameLength = Math.max(maxNameLength, data[i].name.length);
    }
  }

  // Calculate max integer and decimal lengths for width/height
  var width = { integer: 0, decimal: 0 };
  var height = { integer: 0, decimal: 0 };

  if (settings.width || settings.height) {
    for (var j = 0; j < data.length; j++) {
      if (settings.width) {
        var wParts = splitNumber(data[j].width);
        width.integer = Math.max(width.integer, wParts.integer.length);
        width.decimal = Math.max(width.decimal, wParts.decimal.length);
      }
      if (settings.height) {
        var hParts = splitNumber(data[j].height);
        height.integer = Math.max(height.integer, hParts.integer.length);
        height.decimal = Math.max(height.decimal, hParts.decimal.length);
      }
    }
  }

  // Calculate column widths
  var wColLength = width.integer + (width.decimal > 0 ? 1 + width.decimal : 0);
  wColLength = Math.max(wColLength, 5);
  var hColLength = height.integer + (height.decimal > 0 ? 1 + height.decimal : 0);
  hColLength = Math.max(hColLength, 6);

  // Build header and separator
  var headerParts = [];
  var separatorParts = [];

  if (settings.number) {
    headerParts.push(padRight('No.', 4));
    separatorParts.push(repeat('-', 4));
  }
  if (settings.name) {
    headerParts.push(padRight('Name', maxNameLength));
    separatorParts.push(repeat('-', maxNameLength));
  }
  if (settings.width) {
    headerParts.push(padLeft('Width', wColLength));
    separatorParts.push(repeat('-', wColLength));
  }
  if (settings.height) {
    headerParts.push(padLeft('Height', hColLength));
    separatorParts.push(repeat('-', hColLength));
  }

  file.writeln(headerParts.join(' | '));
  file.writeln(separatorParts.join('-|-'));

  // Write data rows
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var values = [];

    if (settings.number) {
      values.push(padLeft((row.idx + 1).toString(), 4));
    }
    if (settings.name) {
      values.push(padRight(row.name, maxNameLength));
    }
    if (settings.width) {
      values.push(alignByDecimal(row.width, width.integer, width.decimal, wColLength));
    }
    if (settings.height) {
      values.push(alignByDecimal(row.height, height.integer, height.decimal, hColLength));
    }

    file.writeln(values.join(' | '));
  }
}

/**
 * Split a number into integer and decimal parts as strings
 * @param {(number|string)} num - The number to split
 * @returns {Object} An object with `integer` and `decimal` string properties
 */
function splitNumber(num) {
  var str = num.toString().replace(',', '.');
  var parts = str.split('.');
  return {
    integer: parts[0] || '0',
    decimal: parts[1] || ''
  };
}

/**
 * Align a number by its decimal point for consistent column formatting
 * @param {(number|string)} num - The number to align
 * @param {number} intLength - The maximum length of the integer part
 * @param {number} decLength - The maximum length of the decimal part
 * @param {number} minLength - The minimum total length of the result
 * @returns {string} The aligned number as a string
 */
function alignByDecimal(num, intLength, decLength, minLength) {
  var parts = splitNumber(num);
  var intAligned = padLeft(parts.integer, intLength);
  var result;

  if (decLength > 0) {
    if (parts.decimal.length > 0) {
      var decAligned = padRight(parts.decimal, decLength);
      result = intAligned + '.' + decAligned;
    } else {
      result = intAligned + repeat(' ', decLength + 1);
    }
  } else {
    result = intAligned;
  }

  return padLeft(result, minLength);
}

/**
 * Pad a string to the right with spaces to reach the specified length
 * @param {string} str - The string to pad
 * @param {number} length - The target length
 * @returns {string} The padded string
 */
function padRight(str, length) {
  while (str.length < length) str += ' ';
  return str;
}

/**
 * Pad a string to the left with spaces to reach the specified length
 * @param {string} str - The string to pad
 * @param {number} length - The target length
 * @returns {string} The padded string
 */
function padLeft(str, length) {
  while (str.length < length) str = ' ' + str;
  return str;
}

/**
 * Repeat a string a specified number of times
 * @param {string} str - The string to repeat
 * @param {number} count - The number of times to repeat
 * @returns {string} The repeated string
 */
function repeat(str, count) {
  var result = '';
  for (var i = 0; i < count; i++) result += str;
  return result;
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

try {
  main();
} catch (e) {}