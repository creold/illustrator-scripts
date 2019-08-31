// SelectOnlyPoints.jsx for Adobe Illustrator
// Description: After using the Lasso tool or Direct Selection Tool, both Points and Path segments are selected. 
//				The script leaves only Points selected.
// Date: September, 2018
// Author: Sergey Osokin, email: hi@sergosokin.ru
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > SelectOnlyPoints
// ============================================================================
// Versions:
// 0.1 Initial version
// 0.2 Fixed when selected unnecessary anchor handles (thanks for Oleg Krasnov, www.github.com/krasnovpro)
// ============================================================================
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ==========================================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2017..2019 (Mac / Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ==========================================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ==========================================================================================
// Check other author's scripts: https://github.com/creold

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Global variables
var scriptName = 'SelectOnlyPoints 0.2';

// Main function
function main() {
  if (app.documents.length < 1) {
    alert('Open a document and try again.');
    return;
  }

  var doc = app.activeDocument;
  var docSelection = [];

  for (var i = 0; i < doc.selection.length; i++) { 
    var currItem = doc.selection[i];
    if (currItem.typename == 'GroupItem') {
      for (var j = 0; j < currItem.pageItems.length; j++) {
          docSelection.push(currItem.pageItems[j]);
      }
    } else {
      docSelection.push(currItem);
    }
  }

  if (!(docSelection instanceof Array) || docSelection.length < 1) {
    alert(scriptName + '\nUse Lasso tool or Direct Selection Tool for select points.');
    return;
  }

  for (var i = 0; i < docSelection.length; i++) {
    var pointState = false;
    if (docSelection[i].pathPoints.length > 1) {
      var points = docSelection[i].pathPoints;
      for (var j = 0; j < points.length; j++) {
        var currPoint = points[j];
        var nextIndex = (j + 1 < points.length) ? j + 1 : 0;
        if (isSelected(currPoint)) {
          pointState = true;
        } else {
          // Deselect orphan handles
          if (/right/i.test(currPoint.selected) && !(/anchor/i.test(points[nextIndex].selected))) {
            currPoint.selected = (PathPointSelection.NOSELECTION);
          }
        }
      }
    }
    // Deselect Path if no Point is selected
    if (pointState == false) {
      docSelection[i].selected = false;
    }
  }
  app.redraw();
}

// Check current Point is selected
function isSelected(point) {
  return point.selected == PathPointSelection.ANCHORPOINT;
}

function showError(err) {
  if (confirm(scriptName + ': an unknown error has occurred.\n' +
      'Would you like to see more information?', true, 'Unknown Error')) {
      alert(err + ': on line ' + err.line, 'Script Error', true);
  }
}

// Run script
try {
  main();
} catch (e) { 
  showError(e);
}