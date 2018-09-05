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
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ==========================================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2017 (Mac).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ==========================================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ==========================================================================================
// Check other author's scripts: https://github.com/creold

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Main function
function main() {
  if (app.documents.length < 1) {
    alert('Open a document and try again.');
    return;
  }

  var doc = app.activeDocument;
  var docSelection = doc.selection;

  if (!(docSelection instanceof Array) || docSelection.length < 1) {
    alert('Please select points atleast one object.');
    return;
  }

  for (var i = 0; i < docSelection.length; i++) {
    var pointState = false; //
    if (docSelection[i].pathPoints.length > 1) {
      var points = docSelection[i].pathPoints;
      for (var j = 0; j < points.length; j++) {
        if (isSelected(points[j])) {
          pointState = true;
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