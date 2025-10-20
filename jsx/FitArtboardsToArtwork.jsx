/*
  FitArtboardsToArtwork.jsx for Adobe Illustrator
  Description: Resize each artboard by editable artwork size with margins
  Date: December, 2022
  Modification date: October, 2025
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.3 Added fitting to specific sides and setting margins in percentages. Minor improvements
  0.2 Added custom artboards range
  0.1.3 Fixed fitting by text object bounds
  0.1.2 Added new units API for CC 2023 v27.1.1
  0.1.1 Added size correction in large canvas mode
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

function main() {
  var SCRIPT = {
        name: 'Fit Artboards To Artwork',
        version: 'v0.3'
      };

  var CFG = {
        isShowIndex:  true, // Show (true) or not (false) temporary artboard indexes
        indexColor: [255, 0, 0], // Color for temporary artboard indexes
        tmpLayer: 'ARTBOARD_INDEX', // Layer for temporary artboard indexes
        aiVers: parseFloat(app.version),
        units: getUnits(), // Active document units
        mgns: [10, 15, 10, 10],
        isMac: /mac/i.test($.os),
        dlgOpacity: .97 // UI window opacity. Range 0-1
      };

  var SETTINGS = {
        name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
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

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later');
    return;
  }

  // Scale factor for Large Canvas mode
  CFG.sf = activeDocument.scaleFactor ? activeDocument.scaleFactor : 1;

  var doc = app.activeDocument;
  var docAbs = doc.artboards;
  var currAb = docAbs.getActiveArtboardIndex();
  var absLength = docAbs.length;
  var mgnInputs = [];
  var mgnCheckboxes = [];
  var tempValues = ['', '', '', ''];

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'row';
      win.alignChildren = ['fill', 'top'];
      win.opacity = CFG.dlgOpacity;

  var wrapper = win.add('group');
      wrapper.orientation = 'column';
      wrapper.alignChildren = ['fill', 'top'];

  // ARBOARDS RANGE
  var rangePnl = wrapper.add('panel', undefined, 'Artboards');
      rangePnl.orientation = 'column';
      rangePnl.alignChildren = ['fill', 'center'];
      rangePnl.margins = CFG.mgns;

  var isCurrAb = rangePnl.add('radiobutton', undefined, 'Active #' + (currAb + 1));
      isCurrAb.value = true;

  var radio = rangePnl.add('group');
      radio.alignChildren = ['left', 'bottom'];

  var isCstmAb = radio.add('radiobutton', undefined, 'Custom:');

  var rangeInp = radio.add('edittext', undefined, '1-' + absLength);
      rangeInp.helpTip = 'E.g. "1, 3-5" > 1, 3, 4, 5\n';
      rangeInp.helpTip += 'Active artboard: ' + (currAb + 1) + '\nDocument artboards: ' + absLength;
      rangeInp.characters = 8;
      rangeInp.enabled = isCstmAb.value;

  // MARGINS
  var mgnPnl = wrapper.add('panel', undefined, 'Margins');
      mgnPnl.orientation = 'column';
      mgnPnl.alignChildren = ['left', 'bottom'];
      mgnPnl.margins = CFG.mgns;
      mgnPnl.spacing = 15;

  var modeGrp = mgnPnl.add('group');
      modeGrp.orientation = 'column';
      modeGrp.alignChildren = ['left', 'bottom'];

  var isFixMargin = modeGrp.add('radiobutton', undefined, 'Absolute (' + CFG.units + ')');
      isFixMargin.helpTip = 'Set margins in absolute units\n(px, mm, etc.)';
      isFixMargin.value = true;

  var isRelMargin = modeGrp.add('radiobutton', undefined, 'Relative (%)');
      isRelMargin.helpTip = 'Set margins as a percentage\nof width and height';

  var mgnGrp = mgnPnl.add('group');
      mgnGrp.orientation = 'column';
      mgnGrp.alignChildren = ['fill', 'fill'];
      mgnGrp.spacing = 15;

  // TOP
  var top = mgnGrp.add('group');
      top.orientation = 'row';
      top.alignChildren = ['left', 'center'];

  var isTop = top.add('checkbox', undefined, 'Top:');
      isTop.preferredSize.width = 65;
  mgnCheckboxes.push(isTop);
  var topInp = top.add('edittext', undefined, 0);
      topInp.preferredSize.width = 40;
      topInp.enabled = isTop.value;
  mgnInputs.push(topInp);

  // BOTTOM
  var bottom = mgnGrp.add('group');
      bottom.orientation = 'row';
      bottom.alignChildren = ['left', 'center'];

  var isBottom = bottom.add('checkbox', undefined, 'Bottom:');
      isBottom.preferredSize.width = 65;
  mgnCheckboxes.push(isBottom);
  var bottomInp = bottom.add('edittext', undefined, 0);
      bottomInp.preferredSize.width = 40;
      bottomInp.enabled = isBottom.value;
  mgnInputs.push(bottomInp);

  // LEFT
  var left = mgnGrp.add('group');
      left.orientation = 'row';
      left.alignChildren = ['left', 'center'];

  var isLeft = left.add('checkbox', undefined, 'Left:');
      isLeft.preferredSize.width = 65;
  mgnCheckboxes.push(isLeft);
  var leftInp = left.add('edittext', undefined, 0);
      leftInp.preferredSize.width = 40;
      leftInp.enabled = isLeft.value;
  mgnInputs.push(leftInp);

  // RIGHT
  var right = mgnGrp.add('group');
      right.orientation = 'row';
      right.alignChildren = ['left', 'center'];

  var isRight = right.add('checkbox', undefined, 'Right:');
      isRight.preferredSize.width = 65;
  mgnCheckboxes.push(isRight);
  var rightInp = right.add('edittext', undefined, 0);
      rightInp.preferredSize.width = 40;
      rightInp.enabled = isRight.value;
  mgnInputs.push(rightInp);

  var isEqual = mgnGrp.add('checkbox', undefined, 'Make all the same');
      isEqual.value = true;

  bottomInp.enabled = !isEqual.value;
  leftInp.enabled = !isEqual.value;
  rightInp.enabled = !isEqual.value;

  // BUTTONS
  var btns = win.add('group');
      btns.orientation = 'column';
      btns.alignChildren = ['fill', 'top'];

  var cancel, ok;
  if (CFG.isMac) {
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
  } else {
    ok = btns.add('button', undefined, 'Ok', { name: 'ok' });
    cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
  }
  cancel.helpTip = 'Press Esc to Close';
  ok.helpTip = 'Press Enter to Run';

  var copyright = btns.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  // EVENTS
  loadSettings(SETTINGS);

  isCurrAb.onClick = function () {
    rangeInp.enabled = false;
    isCstmAb.value = false;
  }

  isCstmAb.onClick = function () {
    isCurrAb.value = false;
    rangeInp.enabled = true;
  }

  for (var i = 0; i < mgnInputs.length; i++) {
    bindStepperKeys(mgnInputs[i], i);
    mgnInputs[i].onChanging = inputHandler(i, mgnInputs, mgnCheckboxes);
  }

  for (var c = 0; c < mgnCheckboxes.length; c++) {
    mgnCheckboxes[c].onClick = function () {
      if (isEqual.value) syncInputs(mgnInputs, mgnCheckboxes);
      activateInputs(mgnInputs, mgnCheckboxes);
    }
  }

  isEqual.onClick = function () {
    syncInputs(mgnInputs, mgnCheckboxes);
  }

  cancel.onClick = win.close;
  ok.onClick = okClick;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  win.onShow = function () {
    if (CFG.isShowIndex) {
      showArboardIndex(CFG.tmpLayer, CFG.indexColor);
    }
  }

  /**
   * Handle the click event for the OK button
   */
  function okClick() {
    saveSettings(SETTINGS);

    var params = {};
    params.isFixed = isFixMargin.value;
    params.isTop = isTop.value;
    params.isBottom = isBottom.value;
    params.isLeft = isLeft.value;
    params.isRight = isRight.value;

    if (isFixMargin.value) {
      params.top = convertUnits( strToNum(topInp.text, 0), CFG.units, 'px' ) / CFG.sf;
      params.bottom = isEqual.value ? params.top : convertUnits( strToNum(bottomInp.text, 0), CFG.units, 'px' ) / CFG.sf;
      params.left = isEqual.value ? params.top : convertUnits( strToNum(leftInp.text, 0), CFG.units, 'px' ) / CFG.sf;
      params.right = isEqual.value ? params.top : convertUnits( strToNum(rightInp.text, 0), CFG.units, 'px' ) / CFG.sf;
    } else {
      params.top = strToNum(topInp.text, 100);
      params.bottom = isEqual.value ? params.top : strToNum(bottomInp.text, 100);
      params.left = isEqual.value ? params.top : strToNum(leftInp.text, 100);
      params.right = isEqual.value ? params.top : strToNum(rightInp.text, 100);
    }

    // Check relative margins
    if (isRelMargin.value) {
      var invalidVal = [];

      if (params.isTop && params.top <= -50) invalidVal.push('Top' );
      if (params.isBottom && params.bottom <= -50) invalidVal.push('Bottom');
      if (params.isLeft && params.left <= -50) invalidVal.push('Left');
      if (params.isRight && params.right <= -50) invalidVal.push('Right');
      
      if (invalidVal.length > 0) {
        alert('Invalid bleed\n' + invalidVal.join(', ') + 
              '\n\nPlease enter relative values greater than -50%');
        return;
      }
    }

    if (isCurrAb.value) { // Current artboard
      resizeArtboard(doc, currAb, params);
    } else { // Artboards range
      var range = parseAndFilterIndexes(rangeInp.text, absLength - 1);
      for (var i = 0; i < range.length; i++) {
        var idx = range[i];
        resizeArtboard(doc, idx, params);
      }
    }

    doc.artboards.setActiveArtboardIndex(currAb);
    app.executeMenuCommand('deselectall');

    win.close();
  }

  /**
   * Sync input values across all mgnInputs or restore previous values
   * @param {Object} isEqual - Checkbox for sync values
   * @param {Array} inputs - Array of input objects
   * @param {Array} checkboxes - Array of checkbox objects
   * @param {Array} tempValues - Array storing previous input values
   */
  function syncInputs(inputs, checkboxes) {
    if (isEqual.value) {
      var allIdx = getActiveInputs(checkboxes);
      var firstIdx = getFirstInput(checkboxes);
      if (firstIdx !== -1 && allIdx.length > 1) {
        var value = inputs[firstIdx].text;
        for (var i = 0; i < inputs.length; i++) {
          tempValues[i] = inputs[i].text;
          // Sync all other inputs to the first active input's value
          if (i !== firstIdx) inputs[i].text = value;
        }
      }
    } else {
      // Restore all inputs from tempValues
      for (var k = 0; k < inputs.length; k++) {
        inputs[k].text = tempValues[k];
      }
    }
  }

  /**
   * Return the index of the first active checkbox
   * @param  {Array} checkboxes - Array of checkbox objects
   * @return {number} Index of the first active checkbox, or -1 if none
   */
  function getFirstInput(checkboxes) {
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].value) return i;
    }
    return -1;
  }

  /**
   * Return an array of indices for all active checkboxes
   * @param  {Array} checkboxes - Array of checkbox objects
   * @return {number[]} Array of indices for active checkboxes
   */
  function getActiveInputs(checkboxes) {
    var results = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].value) results.push(i);
    }
    return results;
  }

  /**
   * Create an input handler for synchronizing values across linked input fields
   * @param {number} idx - Index of the current input field
   * @param {Array} inputs - Array of input objects
   * @param {Array} checkboxes - Array of checkbox objects
   * @return {Function} Event handler for input changes
   */
  function inputHandler(idx, inputs, checkboxes) {
    return function () {
      // Only proceed if equalization is enabled and the current checkbox is active
      if (isEqual.value && checkboxes[idx].value) {
        var allIdx = getActiveInputs(checkboxes);
        var firstIdx = getFirstInput(checkboxes);

        // If this is the "master" input, update all linked inputs
        if (idx === firstIdx) {
          var value = this.text;
          for (var i = 0; i < allIdx.length; i++) {
            if (allIdx[i] !== firstIdx) {
              inputs[allIdx[i]].text = value;
            }
          }
        } else {
          inputs[idx].text = tempValues[firstIdx];
        }
      }
      // Always update the temp value for this input
      tempValues[idx] = this.text;
    }
  }

  /**
   * Enable/disable inputs based on corresponding checkbox values
   * @param {Array} inputs - Array of input objects
   * @param {Array} checkboxes - Array of checkbox objects
   */
  function activateInputs(inputs, checkboxes) {
    for (var i = 0; i < checkboxes.length; i++) {
      inputs[i].enabled = checkboxes[i].value;
    }
  }

  /**
   * Handle keyboard input to shift numerical values
   * @param {Object} input - The input element to which the event listener will be attached
   * @param {number} idx - Index of the current input field
   * @param {number} min - The minimum allowed value for the numerical input
   * @param {number} max - The maximum allowed value for the numerical input
   * @returns {void}
   */
  function bindStepperKeys(input, idx, min, max) {
    input.addEventListener('keydown', function (kd) {
      var step = ScriptUI.environment.keyboardState['shiftKey'] ? 10 : 1;
      var num = parseFloat(this.text);
      if (kd.keyName == 'Down' || kd.keyName == 'LeftBracket') {
        this.text = (typeof min !== 'undefined' && (num - step) < min) ? min : num - step;
        input.onChanging();
        kd.preventDefault();
      }
      if (kd.keyName == 'Up' || kd.keyName == 'RightBracket') {
        this.text = (typeof max !== 'undefined' && (num + step) > max) ? max : num + step;
        input.onChanging();
        kd.preventDefault();
      }
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

    data.artboard = isCurrAb.value ? 0 : 1;
    data.range = rangeInp.text;

    data.isFixed = isFixMargin.value ? 0 : 1;
    
    data.isTop = isTop.value;
    data.top = topInp.text;
    data.isBottom = isBottom.value;
    data.bottom = bottomInp.text;
    data.isLeft = isLeft.value;
    data.left = leftInp.text;
    data.isRight = isRight.value;
    data.right = rightInp.text;

    data.equal = isEqual.value;

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
        isCurrAb.value = data.artboard === '0';
        isCurrAb.active = isCurrAb.value;
        isCstmAb.value = !isCurrAb.value;

        rangeInp.text = data.range ? data.range : '1-' + absLength;
        rangeInp.enabled = isCstmAb.value;
        rangeInp.active = isCstmAb.value;

        isFixMargin.value = data.isFixed === '0';
        isRelMargin.value = !isFixMargin.value;

        isTop.value = data.isTop === 'true';
        topInp.enabled = isTop.value;
        topInp.text = data.top;
        tempValues[0] = data.top;

        isBottom.value = data.isBottom === 'true';
        bottomInp.enabled = isBottom.value;
        bottomInp.text = data.bottom;
        tempValues[1] = data.bottom;

        isLeft.value = data.isLeft === 'true';
        leftInp.enabled = isLeft.value;
        leftInp.text = data.left;
        tempValues[2] = data.left;

        isRight.value = data.isRight === 'true';
        rightInp.enabled = isRight.value;
        rightInp.text = data.right;
        tempValues[3] = data.right;

        isEqual.value = data.equal === 'true';
        syncInputs(mgnInputs, mgnCheckboxes);
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
  var key = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
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
      var xmp = activeDocument.XMPString;
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
 * Display the index of each artboard in the active document
 * @param {string} name - The name of the temporary layer to create
 * @param {Array} color - The RGB color array for the text. Defaults to black if not provided
 */
function showArboardIndex(name, color) {
  if (arguments.length == 1 || color == undefined) {
    color = [0, 0, 0];
  }

  var doc = activeDocument;
  var rgbColor = setRGBColor(color);
  var tmpLayer;

  try {
    tmpLayer = doc.layers.getByName(name);
  } catch (err) {
    tmpLayer = doc.layers.add();
    tmpLayer.name = name;
  }

  for (var i = 0, len = doc.artboards.length; i < len; i++)  {
    doc.artboards.setActiveArtboardIndex(i);
    var currAb = doc.artboards[i];
    var abWidth = currAb.artboardRect[2] - currAb.artboardRect[0];
    var abHeight = currAb.artboardRect[1] - currAb.artboardRect[3];
    var label = tmpLayer.textFrames.add();
    var labelSize = (abWidth >= abHeight) ? abHeight / 2 : abWidth / 2;

    label.contents = i + 1;
    // 1296 pt limit for font size in Illustrator
    label.textRange.characterAttributes.size = (labelSize > 1296) ? 1296 : labelSize;
    label.textRange.characterAttributes.fillColor = rgbColor;
    label.position = [currAb.artboardRect[0], currAb.artboardRect[1]];
  }

  // Update screen
  if (parseInt(app.version) >= 16) {
    app.executeMenuCommand('artboard');
    app.executeMenuCommand('artboard');
  } else {
    app.redraw();
  }

  tmpLayer.remove();
}

/**
 * Set the RGB color
 * @param {Array} color - The RGB color array
 * @returns {RGBColor} The RGB color object
 */
function setRGBColor(rgb) {
  var color = new RGBColor();
  color.red = rgb[0];
  color.green = rgb[1];
  color.blue = rgb[2];
  return color;
}

/**
 * Parse a string representing a list of indexes and filters them based on a total count
 * @param {string} str - The input string containing the indexes
 * @param {number} total - The maximum allowed number (exclusive)
 * @returns {Array} - An array of valid indexes
 */
function parseAndFilterIndexes(str, givenNumber) {
  var parsedNums = [];
  var chunks = str.split(/[,; ]+/);
  var length = chunks.length;

  for (var i = 0; i < length; i++) {
    var chunk = chunks[i];
    var range = chunk.split('-');

    if (range.length === 2) {
      var start = parseInt(range[0], 10);
      var end = parseInt(range[1], 10);

      for (var j = start; j <= end; j++) {
        parsedNums.push(j);
      }
    } else {
      var num = parseInt(chunk, 10);
      if (!isNaN(num)) {
        parsedNums.push(num);
      }
    }
  }

  var filteredNums = [];
  length = parsedNums.length;

  for (var k = 0; k < length; k++) {
    var num = parsedNums[k] - 1;

    if (num >= 0 && num <= givenNumber) {
      filteredNums.push(num);
    }
  }

  // Remove duplicates and sort
  filteredNums = getUnique(filteredNums);
  filteredNums.sort(function (a, b) {
    return a - b;
  });

  return filteredNums;
}

/**
 * Remove duplicate elements from an array
 * @param {Array} arr - The input array
 * @returns {Array} An array with duplicate elements removed
 */
function getUnique(arr) {
  var obj = {};
  var i, l = arr.length;
  var unique = [];
  for (i = 0; i < l; i++) obj[arr[i]] = arr[i];
  for (i in obj) unique.push(obj[i]);
  return unique;
}

/**
 * Resize the specified artboard, adjusting its bounds
 * @param {Object} doc - The Illustrator document
 * @param {number} idx - Index of the artboard to resize
 * @param {Object} params - Margin parameters
 */
function resizeArtboard(doc, idx, params) {
  app.executeMenuCommand('deselectall');

  doc.artboards.setActiveArtboardIndex(idx);
  var artboard = doc.artboards[idx];
  var abData = getArtboardData(artboard);
  doc.selectObjectsOnActiveArtboard();

  if (!app.selection.length) return;

  // Handle text frames: outline, expand, fit, and clean up
  if (hasTextFrame(app.selection)) {
    var tmpLayer = doc.layers.add();
    tmpLayer.name = 'DELETE_ME'
    createOutlines(app.selection, tmpLayer);
    doc.fitArtboardToSelectedArt(idx);
    app.executeMenuCommand('deselectall');
    tmpLayer.remove();
  } else {
    doc.fitArtboardToSelectedArt(idx);
  }

  var tempAbData = getArtboardData(artboard);

  // Calculate and apply margins
  var mgnTop = params.isFixed ? params.top : tempAbData.height * params.top / 100;
  var mgnBottom = params.isFixed ? params.bottom : tempAbData.height * params.bottom / 100;
  var mgnLeft = params.isFixed ? params.left : tempAbData.width * params.left / 100;
  var mgnRight = params.isFixed ? params.right : tempAbData.width * params.right / 100;

  // Adjust artboard bounds
  abData.top = params.isTop ? tempAbData.top + mgnTop : abData.top;
  abData.bottom = params.isBottom ? tempAbData.bottom - mgnBottom : abData.bottom;
  abData.left = params.isLeft ? tempAbData.left - mgnLeft : abData.left;
  abData.right = params.isRight ? tempAbData.right + mgnRight : abData.right;
  artboard.artboardRect = [abData.left, abData.top, abData.right, abData.bottom];
}

/**
 * Get data for an artboard
 * @param {object} ab - The artboard object to retrieve data from
 * @returns {object} An object containing the artboard's boundaries and dimensions
 */
function getArtboardData(ab) {
  var abRect = ab.artboardRect;
  return {
    left: abRect[0],
    top: abRect[1],
    right: abRect[2],
    bottom: abRect[3],
    width: Math.abs(abRect[2] - abRect[0]),
    height: Math.abs(abRect[1] - abRect[3]),
  };
}

/**
 * Check if a collection contains a TextFrame or nested TextFrames
 * @param {Array} coll - Collection of items to check
 * @returns {boolean} True if a TextFrame is found
 */
function hasTextFrame(coll) {
  for (var i = 0; i < coll.length; i++) {
    var item = coll[i];
    if (item.typename === 'TextFrame') {
      return true;
    } else if (item.pageItems && item.pageItems.length && hasTextFrame(item.pageItems)) {
      return true;
    }
  }
  return false;
}

/**
 * Duplicate each item in a collection
 * @param {Array} coll - Collection of items to duplicate
 * @param {Object} layer - The target object containing copies
 * @returns {Array} Array of duplicated items
 */
function createOutlines(coll, layer) {
  for (var i = 0, len = coll.length; i < len; i++) {
    coll[i].duplicate(layer, ElementPlacement.PLACEATEND);
  }
  app.executeMenuCommand('deselectall');
  layer.hasSelectedArtwork = true;
  app.executeMenuCommand('Live Outline Object');
  app.executeMenuCommand('expandStyle');
}

/**
 * Convert selected artwork in a collection to outlines
 * @param {Array} coll - Array of artwork objects to convert to outlines
 * @param {Object} layer - Target layer for duplicated and outlined artwork
 */
function createOutlines(coll, layer) {
  if (!coll || !layer) return;

  for (var i = 0, len = coll.length; i < len; i++) {
    coll[i].duplicate(layer, ElementPlacement.PLACEATEND);
  }

  // Select the layer's artwork and apply outline commands
  app.executeMenuCommand('deselectall');
  layer.hasSelectedArtwork = true;
  app.executeMenuCommand('Live Outline Object');
  app.executeMenuCommand('expandStyle');
}


/**
 * Remove each item in a collection
 * @param {Array} coll - Collection of items to remove
 */
function removeItems(coll) {
  for (var i = 0, len = coll.length; i < len; i++) {
    try { coll[i].remove(); } catch (err) {}
  }
}

/**
 * Convert string to number
 * @param {string} str - The string to convert to a number
 * @param {number} def - The default value to return if the conversion fails
 * @returns {number} - The converted number
 */
function strToNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  str = str.substr(0, 1) + str.substr(1).replace(/-/g, '');
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
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
} catch (err) {}