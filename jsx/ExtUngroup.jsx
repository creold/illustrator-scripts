// ExtUngroup.jsx for Adobe Illustrator
// Description: This script with UI is сan be easily custom ungrouping to all group items, releasing clipping masks in the document.
// Requirements: Adobe Illustrator CS/CC
// Author: Sergey Osokin (hi@sergosokin.ru), 2018
// Based on 'ungroupV1.js' script by Jiwoong Song (netbluew@nate.com), 2009 & modification by John Wundes (wundes.com), 2012
// ============================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > ExtUngroup
// ============================================================================
// THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, 
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY 
// AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
// THE FOUNDATION OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER 
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
// OF THE POSSIBILITY OF SUCH DAMAGE.
// ============================================================================
// Versions:
//  1.0 Initial version
//  1.1 Added option to delete / save mask objects. Fixed a performance issue.
// ============================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Global variables
var scriptName = 'ExtUngroup',
    scriptVersion = '1.1',
    scriptAuthor = '© Sergey Osokin, 2018',
    scriptDonate = 'Donate via PayPal';
if (app.documents.length > 0) {
    var doc = app.activeDocument;
}

if (app.documents.length > 0) {
    try {
        var currLayer = doc.activeLayer;
        var boardNum = doc.artboards.getActiveArtboardIndex() + 1;
        var clearArr = new Array();

        // Create Main Window
        var win = new Window('dialog', scriptName + ' ver.' + scriptVersion, undefined);
        win.orientation = 'column';
        win.alignChildren = ['fill', 'fill'];

        // Target radiobutton
        var slctTarget = win.add('panel', undefined, 'Target:');
        slctTarget.alignChildren = 'left';
        slctTarget.margins = 20;
        if (doc.selection.length > 0) {
            var currSelRadio = slctTarget.add('radiobutton', undefined, 'Selected objects');
            currSelRadio.value = true;
        }
        var currLayerRadio = slctTarget.add('radiobutton', undefined, 'Active Layer [' + currLayer.name + ']');
        var currBoardRadio = slctTarget.add('radiobutton', undefined, 'Artboard No.' + boardNum);
        var currDocRadio = slctTarget.add('radiobutton', undefined, 'All Document');
        if (doc.selection.length > 0) {
            currSelRadio.value = true;
        } else {
            currLayerRadio.value = true;
        }

        // Action checkbox
        var options = win.add('panel', undefined, 'Options:');
        options.alignChildren = 'left';
        options.margins = 20;
        var chkUnroup = options.add('checkbox', undefined, 'Ungroup All');
        chkUnroup.value = true;
        var chkClipping = options.add('checkbox', undefined, 'Release Clipping Masks');
        var rmvClip = options.add('group'),
            chkRmvClipping = rmvClip.add('checkbox', undefined, 'Remove Masks Shapes');
        rmvClip.maximumSize = [0, 0];
        chkRmvClipping.visible = false;

        // Show/hide checkbox 'Remove Masks Shapes'
        chkClipping.onClick = function () {
            rmvClip.maximumSize = (chkRmvClipping.visible ^= 1) ? [1000, 1000] : [0, 0];
            win.layout.layout(true);
            if (!this.value) {
                chkRmvClipping.value = false;
            }
        }

        // Buttons
        var btns = win.add('group');
        btns.alignChildren = ['fill', 'fill'];
        btns.margins = [0, 10, 0, 0];
        var cancel = btns.add('button', undefined, 'Cancel');
        cancel.helpTip = 'Press Esc to Close';
        var ok = btns.add('button', undefined, 'OK');
        ok.helpTip = 'Press Enter to Run';
        ok.active = true;
        cancel.onClick = function () { win.close(); }
        ok.onClick = okClick;

        // Copyright block
        var copyright = win.add('panel');
        copyright.orientation = 'column';
        copyright.alignChild = ['center', 'center'];
        copyright.alignment = 'fill';
        copyright.margins = 5;
        var lblCopyright = copyright.add('statictext');
        lblCopyright.text = scriptAuthor;
        var donate = copyright.add('button', undefined, scriptDonate);
        // Opening PayPal donate page
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

        if (doc.groupItems.length > 0) {
            win.center();
            win.show();
        } else { alert(scriptName + '\nDocument does not contain any groups.'); }

        function okClick() {
            // Ungroup selected objects
            if (typeof (currSelRadio) !== 'undefined' && currSelRadio.value == true) {
                ungroup(getSelection());
            }
            // Ungroup in active Layer if it contains groups
            if (currLayerRadio.value == true && currLayer.groupItems.length > 0) {
                if (currLayer.locked == true && currLayer.visible == false) {
                    alert(scriptName + '\nCurrent Layer not editable');
                    return;
                }
                ungroup(currLayer);
            }
            // Ungroup in active Artboard only visible & unlocked objects
            if (currBoardRadio.value == true) {
                doc.selection = null;
                app.redraw();
                doc.selectObjectsOnActiveArtboard();
                ungroup(getSelection());
                doc.selection = null;
            }
            // Ungroup all in the current Document
            if (currDocRadio.value == true) {
                for (var j = 0; j < doc.layers.length; j++) {
                    var targetLr = doc.layers[j];
                    // Run only for editable visible layers
                    if (targetLr.groupItems.length > 0 && targetLr.locked == false && targetLr.visible == true) {
                        ungroup(targetLr);
                    }
                }
            }
            // Remove empty clipping masks after ungroup
            if (chkRmvClipping.value == true) removeMasks();
            win.close();
        }
    } catch (e) {
        alert(e.message, 'Script Alert', true);
    }
} else {
    alert(scriptName + '\nPlease open a document before running this script.');
}

function getSelection() {
    var selArr = new Array();
    for (var j = 0; j < doc.selection.length; j++) {
        selArr.push(doc.selection[j]);
    }
    return selArr;
}

function getChildAll(obj) {
    var childsArr = new Array();
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        childsArr.push.apply(childsArr, obj);
    } else {
        for (var i = 0; i < obj.pageItems.length; i++) {
            childsArr.push(obj.pageItems[i]);
        }
    }
    if (obj.layers) {
        for (var l = 0; l < obj.layers.length; l++) {
            childsArr.push(obj.layers[l]);
        }
    }
    return childsArr;
}

// Ungroup array of target objects
function ungroup(obj) {
    if (chkClipping.value == false && obj.clipped == true) { return; }
    var elements = getChildAll(obj);
    if (elements.length < 1) {
        obj.remove();
        return;
    } else {
        for (var k = 0; k < elements.length; k++) {
            var target = elements[k];
            if (chkUnroup.value == false && target.clipping == false) { return; }
            try {
                if (target.parent.typename !== 'Layer') {
                    target.move(obj, ElementPlacement.PLACEBEFORE);
                    // Push Clipping Masks in Array 
                    if (chkRmvClipping.value == true) {
                        if ((target.typename === 'PathItem' && target.filled == false && target.stroked == false) ||
                            (target.typename === 'CompoundPathItem' && target.pathItems[0].filled == false && target.pathItems[0].stroked == false))
                            clearArr.push(target);
                    }
                }
                if (target.typename === 'GroupItem' || target.typename === 'Layer') {
                    ungroup(target);
                }
            } catch (e) {
                alert('Error: ' + e.message + '\rin line #' + e.line);
            }
        }
    }
    app.redraw();
}

// Remove empty clipping masks after ungroup
function removeMasks() {
    for (var i = 0; i < clearArr.length; i++) {
        clearArr[i].remove();
    }
}