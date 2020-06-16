/*
  SelectOnlyPoints.jsx for Adobe Illustrator
  Description: After using the Lasso tool or Direct Selection Tool, both Points and Path segments are selected. 
          The script leaves only Points selected.
  Date: September, 2018
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ==========================================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Versions:
  0.1 Initial version
  0.2 Fixed when selected unnecessary anchor handles (thanks for Oleg Krasnov, www.github.com/krasnovpro)
  0.3 Minor bug fixes and improvements
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  Tested with Adobe Illustrator CC 2018/2019 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

// Global variables
var SCRIPT_NAME = 'SelectOnlyPoints',
    SCRIPT_VERSION = 'v.0.3';

// Main function
function main() {
  if (app.documents.length < 1) {
    alert('Open a document and try again.');
    return;
  }

  var doc = app.activeDocument;
  var selArray = [];
  
  getPaths(doc.selection, selArray);

  if (!(selArray instanceof Array) || selArray.length < 1) {
    alert(SCRIPT_NAME + ' ' + SCRIPT_VERSION + '\nUse Lasso tool or Direct Selection Tool for select points.');
    return;
  }

  for (var i = 0; i < selArray.length; i++) {
    var pointState = false;
    if (selArray[i].pathPoints.length > 1) {
      var points = selArray[i].pathPoints;
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
    if (!pointState) {
      selArray[i].selected = false;
    }
  }
  app.redraw();
}

function getPaths(item, arr) {
  for (var i = 0; i < item.length; i++) {
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
          getPaths(currItem.pathItems, arr);
          break;
        default:
          currItem.selected = false;
          break;
        }
      } catch (e) {}
    }
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
  // showError(e);
}