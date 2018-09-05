// ConvertToGradient.jsx for Adobe Illustrator
// Description: Convert a flat process color into a matching gradient
// Date: August, 2018
// Author: Sergey Osokin, email: hi@sergosokin.ru
// Based on script by Saurabh Sharma (https://tutsplus.com/authors/saurabh-sharma), 2010
// What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. Processes compound paths and groups of items
// ==========================================================================================
// Installation:
// 1. Place script in:
//    Win (32 bit): C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\
//    Win (64 bit): C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts
// 2. Restart Illustrator
// 3. Choose File > Scripts > ConvertToGradient
// ============================================================================
// Donate (optional): If you find this script helpful and want to support me 
// by shouting me a cup of coffee, you can by via PayPal http://www.paypal.me/osokin/usd
// ==========================================================================================
// NOTICE:
// Tested with Adobe Illustrator CC 2017 (Mac), CS6 (Win).
// This script is provided "as is" without warranty of any kind.
// Free to use, not for sale.
// ==========================================================================================
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ==========================================================================================
// Check other author's scripts: https://github.com/creold

#target illustrator

// Global variables
var scriptName = 'Flat to gradient';
var doc = app.activeDocument,
    maxValue = 0,
    fillBad = 0,
    channel = new Array(),
    gShift, gShiftEnd, gAngle;

function main() {
    if (app.documents.length == 0) {
        alert('Error: \nOpen a document and try again.');
        return;
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

    // Enter value
    gShift = prompt('Enter a value for gradient shift (0-' + maxValue + ')', '0', 'Gradient Shift');
    if (isNaN(Number(gShift))) {
        alert('Error: \nPlease enter a numeric value.');
        return;
    } else if (gShift === null) {
        return;
    } else {
        gShift = Math.round(gShift);
        if (gShift <= 0) gShift = 0;
        if (gShift >= maxValue) gShift = maxValue;
        gShiftEnd = maxValue - gShift;
    }

    gAngle = prompt('Enter a value for gradient angle', '0.0', 'Gradient Angle');
    if (isNaN(Number(gAngle))) {
        alert('Error: \nPlease enter a numeric value.');
        return;
    } else if (gAngle === null) {
        return;
    } else {
        gAngle = Number(gAngle);
    }

    // Start conversion
    for (var i = 0; i < doc.selection.length; i++) {
        convertToGradient(doc.selection[i]);
    }

    if (fillBad > 0) alert('Fill an ' + fillBad + ' objects with flat color. \nAny objects containing gradients, patterns, spot colors or empty fills will be omitted.');
}

// Search items in selection
function convertToGradient(obj) {
    try {
        switch (obj.typename) {
            case 'GroupItem':
                for (var j = 0; j < obj.pageItems.length; j++) {
                    convertToGradient(obj.pageItems[j]);
                }
                break;
            case 'PathItem':
                if (obj.filled == true && chkFillType(obj) == true) {
                    applyGradient(obj);
                } else {
                    fillBad++;
                }
                break;
            case 'CompoundPathItem':
                if (obj.pathItems[0].filled == true && chkFillType(obj.pathItems[0]) == true) {
                    applyGradient(obj.pathItems[0]);
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
function applyGradient(obj) {
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
        if (grayColor < gShift) startColor.gray = 0;
        else startColor.gray = grayColor - gShift;

        if (grayColor > (100 - gShift)) endColor.gray = 100;
        else endColor.gray = grayColor + gShift;
    }

    //Set color for RGB || CMYK channels
    for (var j = 0; j < channel.length; j++) {
        var channelName = channel[j];
        var originColor = Math.round(currentColor[channelName]);
        if (originColor < gShift) startColor[channelName] = 0;
        else startColor[channelName] = originColor - gShift;

        if (originColor > gShiftEnd) endColor[channelName] = maxValue;
        else endColor[channelName] = originColor + gShift;
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
    obj.rotate(gAngle, false, false, true, false, Transformation.CENTER);
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