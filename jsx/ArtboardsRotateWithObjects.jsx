// Artboards_Rotate_With_Objects.jsx for Adobe Illustrator
// Description: Script to rotate 90 degrees an document artboards with all the objects on it.
// Requirements: Adobe Illustrator CS6 and above
// Date: July, 2018
// Authors: Alexander Ladygin, email: i@ladygin.pro
//          Sergey Osokin, email: hi@sergosokin.ru
// ============================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > Artboards_Rotate_With_Objects
// ============================================================================
// Versions:
// 0.1 Initial version. Do not rotate locked, hidden items
// 1.0 Added GUI: the choice of current artboard or all. Now script can rotate locked, hidden objects
// 1.1 Added rotate angle: 90 CW or 90 CCW.
// ============================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2017/2018 (Mac), CS6 (Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ============================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ============================================================================
// Check other author's scripts: https://github.com/creold

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var scriptName = 'ARWO',
    scriptVersion = '1.1',
    scriptAuthor = '© Alex Ladygin, Serg Osokin',
    scriptDonate = 'Donate via PayPal';

try {
    if (documents.length > 0) {
        var doc = app.activeDocument,
            currArt = doc.artboards[doc.artboards.getActiveArtboardIndex()],
            currArtNum = doc.artboards.getActiveArtboardIndex() + 1,
            lockedItems = new Array(),
            hiddenItems = new Array();

        // Create Main Window
        var dlg = new Window('dialog', scriptName + ' ver.' + scriptVersion, undefined);
        dlg.orientation = 'column';
        dlg.alignChildren = ['fill', 'fill'];

        // Target radiobutton
        var slctTarget = dlg.add('panel', undefined, 'What to rotate?');
        slctTarget.orientation = 'column';
        slctTarget.alignChildren = 'left';
        slctTarget.margins = 20;
        var currArtRadio = slctTarget.add('radiobutton', undefined, 'Active Artboard #' + currArtNum),
            allArtRadio = slctTarget.add('radiobutton', undefined, 'All ' + doc.artboards.length + ' Artboards');
        currArtRadio.value = true;

        // Angle radiobutton
        var slctAngle = dlg.add('panel', undefined, 'Rotation angle:');
        slctAngle.orientation = 'row';
        slctAngle.alignChildren = ['fill', 'fill'];
        slctAngle.margins = 20;
        var cwAngle = slctAngle.add('radiobutton', undefined, '90 CW'),
            ccwAngle = slctAngle.add('radiobutton', undefined, '90 CCW');
        cwAngle.value = true;

        // Buttons
        var btns = dlg.add('group');
        btns.alignChildren = ['fill', 'fill'];
        btns.margins = [0, 10, 0, 0];
        var cancel = btns.add('button', undefined, 'Cancel');
        cancel.helpTip = 'Press Esc to Close';
        var ok = btns.add('button', undefined, 'OK');
        ok.helpTip = 'Press Enter to Run';
        ok.active = true;
        cancel.onClick = function () { dlg.close(); }
        ok.onClick = okClick;

        // Copyright block
        var copyright = dlg.add('panel');
        copyright.orientation = 'column';
        copyright.alignChild = ['center', 'center'];
        copyright.alignment = 'fill';
        copyright.margins = 5;
        var lblCopyright = copyright.add('statictext');
        lblCopyright.text = scriptAuthor;
        var donate = copyright.add('button', undefined, scriptDonate);

        donate.addEventListener('click', (function () {
            var fname, shortcut;
            fname = '_aiscript_donate.url';
            shortcut = new File('' + Folder.temp + '/' + fname);
            shortcut.open('w');
            shortcut.writeln('[InternetShortcut]');
            shortcut.writeln('URL=http://www.paypal.me/osokin/usd');
            shortcut.writeln();
            shortcut.close();
            shortcut.execute();
            $.sleep(4000);
            return shortcut.remove();
        }), false);

        dlg.center();
        dlg.show();

        //Start
        function okClick() {
            // Saving information about locked & hidden pageItems
            saveItemsState();
            // Rotate active artboard or all artboards in document
            if (currArtRadio.value == true) {
                rotateArt(currArt);
            } else {
                for (var i = 0; i < doc.artboards.length; i++) {
                    doc.artboards.setActiveArtboardIndex(i);
                    rotateArt(doc.artboards[i]);
                }
            }
            // Restoring locked & hidden pageItems
            restoreItemsState();
            dlg.close();
        }
    } else {
        throw new Error(scriptName + '\nPlease open a document before running this script.');
    }
} catch (e) {
    alert(e.message, 'Script Alert', true);
}

// Save information about locked & hidden pageItems
function saveItemsState() {
    for (var i = 0; i < doc.pageItems.length; i++) {
        var currItem = doc.pageItems[i];
        if (currItem.locked == true) {
            lockedItems.push(i);
            currItem.locked = false;
        }
        if (currItem.hidden == true) {
            hiddenItems.push(i);
            currItem.hidden = false;
        }
    }
}

// Restoring locked & hidden pageItems
function restoreItemsState() {
    for (var i = 0; i < lockedItems.length; i++) {
        var index = lockedItems[i];
        doc.pageItems[index].locked = true;
    }
    for (var j = 0; j < hiddenItems.length; j++) {
        var index = hiddenItems[j];
        doc.pageItems[index].hidden = true;
    }
}

// Main function for rotate artboard
function rotateArt(board) {
    var artRect = board.artboardRect,
        artWidth = artRect[2] - artRect[0],
        artHeight = -(artRect[3] - artRect[1]);
    deselect();
    doc.selectObjectsOnActiveArtboard();

    // Rotate artboard
    var newArtRect = [
        artRect[0] + artWidth / 2 - (artHeight / 2),
        artRect[1] - artHeight / 2 + (artWidth / 2),
        artRect[2] - artWidth / 2 + (artHeight / 2),
        artRect[3] + artHeight / 2 - (artWidth / 2)
    ];
    board.artboardRect = newArtRect;

    // Rotate objects
    for (var k = 0; k < selection.length; k++) {
        var bnds = selection[k].geometricBounds,
            top = bnds[1] - artRect[1],
            right = bnds[2] - artRect[2],
            left = bnds[0] - artRect[0],
            bottom = bnds[3] - artRect[3];
        // selection[k].rotate(90);
        if (cwAngle.value == true) {
            // rotate 90 CW
            selection[k].rotate(-90);
            selection[k].left = newArtRect[0] + bottom;
            selection[k].top = newArtRect[1] - left;
        } else {
            // rotate 90 CCW
            selection[k].rotate(90);
            selection[k].left = newArtRect[0] - top;
            selection[k].top = newArtRect[1] + right;
        }
    }
    deselect();
}

function deselect() {
    activeDocument.selection = null;
}