/*
  InlineSVGToAI.jsx for Adobe Illustrator
  Description: The script inserts the svg code as an object from the clipboard into the Adobe Illustrator.
                Adobe Illustrator v.22.1 (March, 2018) can insert svg graphics without a script
  Date: 2018
  Requirements: Adobe Illustrator CC 2014+
  Author: Alexander Ladygin, email: i@ladygin.pro
  Code refactoring: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  How to use:
  1. Run script
  2. Paste your svg code in textarea
  3. Press button "Paste"

  NOTICE:
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

function main() {
  if (!documents.length) {
    alert("Error\nOpen a document and try again.");
    return;
  }
  uiDialog().show();
}

// Create dialog window
function uiDialog() {
  var win = new Window("dialog", "Inline SVG To AI", undefined),
    winPanel = win.add("panel");
    winPanel.alignChildren = ['fill', 'fill'];

  // Field for pasting the SVG code
  var winSVGCodeTitle = winPanel.add("statictext", [0, 0, 200, 15], "Please paste your svg code:"),
    SVGCode = winPanel.add("edittext", [0, 0, 200, 150], "", { multiline: true, scrolling: true }),
    insertOpen = winPanel.add("checkbox", undefined, 'Insert through "Open" (without crash AI)');
  insertOpen.value = false;
  SVGCode.active = true; // Set state

  // Buttons
  var winButtonsGroup = win.add("group"),
    pasteButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Paste"),
    closeButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Cancel");

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

  function importSVG(string) {
    var svgFileName = "inlineSVGtoAI.svg",
      svgFile = new File("" + Folder.myDocuments + "/" + svgFileName),
      backDoc = activeDocument;
  
    svgFile.open("w");
    svgFile.write(string);
    svgFile.close();
    if (!insertOpen.value && (activeDocument.importFile instanceof Function)) {
      activeDocument.importFile(svgFile, false, false, false);
    }
      else {
        app.open(svgFile);
        var l = activeDocument.layers,
        i = l.length;
        while (i--) { l[i].hasSelectedArtwork = true; }
        app.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        backDoc.activate();
        app.paste();
      }
    $.sleep(500);
    svgFile.remove();
  }

  return win;
}

// Run script
try {
  main();
} catch (e) {}