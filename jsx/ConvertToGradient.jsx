/*
    ConvertToGradient.jsx for Adobe Illustrator
    Description: Convert a flat process color into a matching gradient
    Date: August, 2018
    Author: Sergey Osokin, email: hi@sergosokin.ru
    Based on script by Saurabh Sharma (https://tutsplus.com/authors/saurabh-sharma), 2010
    What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. 
                Processes compound paths and groups of items
    ==========================================================================================
    Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
    ==========================================================================================
    Donate (optional): If you find this script helpful, you can buy me a coffee
                       via PayPal http://www.paypal.me/osokin/usd
    ==========================================================================================
    NOTICE:
    Tested with Adobe Illustrator CC 2017, CC 2018 (Mac), CS6 (Win).
    This script is provided "as is" without warranty of any kind.
    Free to use, not for sale.
    ==========================================================================================
    Released under the MIT license.
    http://opensource.org/licenses/mit-license.php
    ==========================================================================================
    Check other author's scripts: https://github.com/creold
*/

//@target illustrator

// Global variables
var SCRIPT_NAME = 'ConvertToGradient',
    SCRIPT_AUTHOR = '\u00A9 www.sergosokin.ru';
var maxValue = 0,
    fillBad = 0,
    channel = new Array(),
    shiftValue, angleValue, gShiftEnd;

function main() {
    if (app.documents.length == 0) {
        alert('Error: \nOpen a document and try again.');
        return;
    } else {
        doc = app.activeDocument;
    }

    if (doc.selection.length == 0) {
        alert('Error: \nPlease select atleast one object.');
        return;
    }

    // Get initial data
    if (doc.documentColorSpace == DocumentColorSpace.RGB) {
        maxValue = 255;
        channel = ['red', 'green', 'blue'];
    } else {
        maxValue = 100;
        channel = ['cyan', 'magenta', 'yellow', 'black'];
    }

    // Main Window
    var win = new Window('dialog', SCRIPT_NAME + ' ' + SCRIPT_AUTHOR, undefined);
    win.orientation = 'row';
    win.alignChild = ['fill', 'fill'];

    // Value fields
    var shiftPanel = win.add('panel', undefined, 'Gradient Shift');
    gShift = shiftPanel.add('edittext', [0, 0, 80, 30], '10');
    gShift.active = true;
    var anglePanel = win.add('panel', undefined, 'Gradient Angle');
    gAngle = anglePanel.add('edittext', [0, 0, 80, 30], '0');

    // Buttons
    var btns = win.add('group');
    btns.alignChild = ['fill', 'fill'];
    btns.orientation = 'column';
    var ok = btns.add('button', undefined, 'OK', { name: 'ok' });
    ok.helpTip = 'Press Enter to Run';
    var cancel = btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    cancel.helpTip = 'Press Esc to Close';

    ok.onClick = function () {
        if (isNaN(Number(gShift.text))) {
            alert('Gradient Shift: \nPlease enter a numeric value.');
            return;
        } else if (gShift.text === null) {
            return;
        } else {
            shiftValue = Math.round(Number(gShift.text));
            if (shiftValue <= 0) shiftValue = 0;
            if (shiftValue >= maxValue) shiftValue = maxValue;
            gShiftEnd = maxValue - shiftValue;
        }

        if (isNaN(Number(gAngle.text))) {
            alert('Gradient Angle: \nPlease enter a numeric value.');
            return;
        } else if (gAngle.text === null) {
            return;
        } else {
            angleValue = Number(gAngle.text);
        }

        // Start conversion
        for (var i = 0; i < doc.selection.length; i++) {
            convertToGradient(doc.selection[i], shiftValue, angleValue);
        }
        if (fillBad > 0) {
            alert('Fill an ' + fillBad + ' objects with flat color. \nAny objects containing gradients, patterns, global colors or empty fills will be omitted.');
        }
        win.close();
    }

    cancel.onClick = function () {
        win.close();
    }

    win.center();
    win.show();
}

// Search items in selection
function convertToGradient(obj, shift, angle) {
    try {
        switch (obj.typename) {
            case 'GroupItem':
                for (var j = 0; j < obj.pageItems.length; j++) {
                    convertToGradient(obj.pageItems[j], shift, angle);
                }
                break;
            case 'PathItem':
                if (obj.filled == true && chkFillType(obj) == true) {
                    applyGradient(obj, shift, angle);
                } else {
                    fillBad++;
                }
                break;
            case 'CompoundPathItem':
                if (obj.pathItems[0].filled == true && chkFillType(obj.pathItems[0]) == true) {
                    applyGradient(obj.pathItems[0], shift, angle);
                } else {
                    fillBad++;
                }
                break;
            default:
                break;
        }
    } catch (e) { }
}

// Apply gradient to items
function applyGradient(obj, shift, angle) {
    if (obj.fillColor.typename == 'SpotColor') {
        var currentColor = obj.fillColor.spot.color;
    } else {
        var currentColor = obj.fillColor;
    }
    if (doc.documentColorSpace == DocumentColorSpace.RGB) {
        var startColor = new RGBColor();
        var endColor = new RGBColor();
    } else {
        var startColor = new CMYKColor();
        var endColor = new CMYKColor();
    }

    // For Grayscale mode color is set individually
    if (currentColor.typename == 'GrayColor') {
        var startColor = new GrayColor();
        var endColor = new GrayColor();
        var grayColor = Math.round(currentColor.gray);
        if (grayColor < shift) startColor.gray = 0;
        else startColor.gray = grayColor - shift;

        if (grayColor > (100 - shift)) endColor.gray = 100;
        else endColor.gray = grayColor + shift;
    }

    //Set color for RGB || CMYK channels
    for (var j = 0; j < channel.length; j++) {
        var channelName = channel[j];
        var originColor = Math.round(currentColor[channelName]);
        if (originColor < shift) startColor[channelName] = 0;
        else startColor[channelName] = originColor - shift;

        if (originColor > gShiftEnd) endColor[channelName] = maxValue;
        else endColor[channelName] = originColor + shift;
    }

    // Create a new gradient
    var newGradient = doc.gradients.add();
    newGradient.type = GradientType.LINEAR;

    // Modify the first gradient stop
    newGradient.gradientStops[0].rampPoint = 0;
    newGradient.gradientStops[0].midPoint = 50;
    newGradient.gradientStops[0].color = startColor;

    // Modify the last gradient stop
    newGradient.gradientStops[1].rampPoint = 100;
    newGradient.gradientStops[1].color = endColor;

    // Construct an Illustrator.GradientColor object
    var colorOfGradient = new GradientColor();
    colorOfGradient.gradient = newGradient;

    // Apply new gradient to current path item
    obj.fillColor = colorOfGradient;
    obj.rotate(angle, false, false, true, false, Transformation.CENTER);
}

function chkFillType(obj) {
    if (obj.fillColor.typename == 'RGBColor' ||
        obj.fillColor.typename == 'CMYKColor' ||
        obj.fillColor.typename == 'GrayColor' ||
        obj.fillColor.typename == 'SpotColor')
        return true;
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