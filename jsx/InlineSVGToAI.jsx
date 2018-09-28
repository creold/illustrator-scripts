// InlineSVGToAI.jsx for Adobe Illustrator
// Description: The script inserts the svg code as an object from the clipboard into the Adobe Illustrator.
//              Adobe Illustrator v.22.1 (March, 2018) can insert svg graphics without a script.
// Date: 2018
// Requirements: Adobe Illustrator CC 2014+
// Author: Alexander Ladygin, email: i@ladygin.pro
// Code refactoring: Sergey Osokin, email: hi@sergosokin.ru
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > InlineSVGToAI
// ============================================================================
// How to use:
// 1. Run script
// 2. Paste your svg code in textarea
// 3. Press button "Paste"
// ==========================================================================================
// NOTICE:
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ==========================================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ==========================================================================================

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

function main() {
  if (app.documents.length == 0) {
    alert("Error: \nOpen a document and try again.");
    return;
  }
  uiDialog().show();
}

// Create dialog window
function uiDialog() {
  var win = new Window("dialog", "Inline SVG To AI", undefined);
  var winPanel = win.add("panel");

  // Field for pasting the SVG code
  var winSVGCodeTitle = winPanel.add("statictext", [0, 0, 200, 15], "Please paste your svg code:");
  var SVGCode = winPanel.add("edittext", [0, 0, 200, 150], "", { multiline: true, scrolling: true });
  SVGCode.active = true; // Set state

  // Buttons
  var winButtonsGroup = win.add("group");
  var pasteButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Paste");
  var closeButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Cancel");

  // Paste button action
  pasteButton.onClick = function () {
    var code = SVGCode.text;
    if (code) {
      importSVG(code);
      win.close();
    } else {
      alert("You didn't insert the SVG code.");
    }
  };

  // Close window
  closeButton.onClick = function () {
    win.close();
  };

  return win;
}

function importSVG(string) {
  var svgFileName = "inlineSVGtoAI.svg";
  var svgFile = new File("" + Folder.temp + "/" + svgFileName);
  svgFile.open("w");
  svgFile.write(string);
  svgFile.close();
  app.activeDocument.importFile(svgFile, false);
  $.sleep(500);
  svgFile.remove();
}

function showError(err) {
  if (confirm(scriptName + ": an unknown error has occurred.\n" +
    "Would you like to see more information?", true, "Unknown Error")) {
    alert(err + ": on line " + err.line, "Script Error", true);
  }
}

try {
  main();
} catch (e) {
  showError(e);
}