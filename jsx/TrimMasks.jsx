/*
  TrimMasks.jsx for Adobe Illustrator
  Description: Automatic trimming of all clipping groups in a document using Pathfinder > Trim. 
  Date: March, 2020
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ==========================================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Versions:
  0.1 Initial version.
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
var setName = 'Pathfinder',
    actionName = 'Trim-Mask',
    actionPath = Folder.myDocuments,
    itemProperties = [];

function main() {
  if (app.documents.length == 0) {
      alert('Error: \nOpen a document and try again.');
      return;
  }
  var doc = app.activeDocument;

  // Generate action Pathfinder > Trim
  var actionStr =   
    ['   /version 3',
    '/name [' + setName.length + ' ' + ascii2Hex(setName) + ']',
    '/actionCount 1',
    '/action-1 {',
    '/name [' + actionName.length + ' ' + ascii2Hex(actionName) + ']',
    '  /keyIndex 0',
    '  /colorIndex 0',
    '  /isOpen 1',
    '  /eventCount 1',
    '  /event-1 {',
    '    /useRulersIn1stQuadrant 0',
    '    /internalName (ai_plugin_pathfinder)',
    '    /localizedName [ 10',
    '      5061746866696e646572',
    '    ]',
    '   /isOpen 0',
    '    /isOn 1',
    '    /hasDialog 0',
    '    /parameterCount 1',
    '    /parameter-1 {',
    '      /key 1851878757',
    '      /showInPalette 4294967295',
    '      /type (enumerated)',
    '      /name [ 4',
    '        5472696d',
    '      ]',
    '      /value 7',
    '    }',
    '  }',
    '}'].join('');

  createAction(actionStr, setName, actionPath);

  if (doc.selection.length > 0) {
    trimThis(getGroups(doc.selection));
  } else {
    trimThis(getGroups(doc.pageItems));
  }

  app.unloadAction(setName, '');
  resetSelection();
}

function trimThis(obj) {
  var currItem;
  for (var i = 0; i < obj.length; i++) {
    resetSelection();
    currItem = obj[i];
    try {
      // Save <clip group> properties
      itemProperties[0] = currItem.opacity;
      itemProperties[1] = currItem.blendingMode;
      if (currItem.clipped) {
        currItem.selected = true;
        app.doScript(actionName, setName);
      } else if (currItem.typename === 'GroupItem') {
          // Save parent group properties if <clip group> inside
          if (currItem.pageItems.length == 1) {
            itemProperties[2] = currItem.opacity;
            itemProperties[3] = currItem.blendingMode;
          }
          trimThis(currItem.pageItems);
      }
      currItem = app.activeDocument.selection[0];
      // Restore <clip group> properties to child path
      if (typeof(itemProperties[2]) !== 'undefined' && itemProperties[2] != 100 && itemProperties[3] != 'BlendModes.NORMAL') {
        currItem.opacity = itemProperties[2];
        currItem.blendingMode = itemProperties[3];
      } else {
        currItem.opacity = itemProperties[0];
        currItem.blendingMode = itemProperties[1];
      }
      itemProperties = [];
    } catch (e) { }
  }
}

function createAction (str, set, path) {
  var f = new File('' + path + '/' + set + '.aia');
  f.open('w');
  f.write(str);
  f.close();
  app.loadAction(f);
  f.remove();
}

function ascii2Hex(hex) {
  return hex.replace(/./g, function (a) { return a.charCodeAt(0).toString(16) });
}

// Get only groups from selection or document
function getGroups(obj) {
  var childsArr = [],
      item;
  for (var i = 0; i < obj.length; i++) {
    item = obj[i];
    if (item.typename === 'GroupItem' && item.pageItems.length) childsArr.push(obj[i]);
  }
  return childsArr;
}

function resetSelection () {
  app.activeDocument.selection = null;
  app.redraw();
}

try {
    main();
} catch (e) { }