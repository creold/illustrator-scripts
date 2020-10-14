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
  0.2 Added "SAVE_FILLED_CLIPMASK" boolean flag for save the filled mask path, fixed the live text masks.
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
$.localize = true; // Enabling automatic localization
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

// Global variables
var AI_VER = parseInt(app.version),
    ACTION_SET = 'Pathfinder',
    ACTION_NAME = 'Trim-Mask',
    ACTION_PATH = Folder.myDocuments + '/Adobe Scripts/',
    LANG_ERR_DOC = { en: 'Error\nOpen a document and try again.',
                     ru: 'Ошибка\nОткройте документ и запустите скрипт.'},
    LANG_ERR_VER = { en: 'Error\nSorry, script only works in Illustrator CS6 and later.',
                     ru: 'Ошибка\nСкрипт работает в Illustrator CS6 и выше.'},
    SAVE_FILLED_CLIPMASK = false, // true — save the filled mask path when trimming, false - not save
    OVER_GROUPS = 10; // When the number of clip groups >, full-screen mode is enabled
    clipCounter = 0;
    itemAttr = { mOpacity: 100, mBlending: BlendModes.NORMAL };
    

if (!Folder(ACTION_PATH).exists) { Folder(ACTION_PATH).create(); }

function main() {
  if (app.documents.length == 0) {
    alert(LANG_ERR_DOC);
    return;
  }

  if (AI_VER < 16) {
    alert(LANG_ERR_VER);
    return;
  }

  var doc = app.activeDocument,
      userScreen = doc.views[0].screenMode;

  // Generate action Pathfinder > Crop
  var actionStr =   
    ['   /version 3',
    '/name [' + ACTION_SET.length + ' ' + ascii2Hex(ACTION_SET) + ']',
    '/actionCount 1',
    '/action-1 {',
    '/name [' + ACTION_NAME.length + ' ' + ascii2Hex(ACTION_NAME) + ']',
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
    '        43726f70',
    '      ]',
    '      /value 9',
    '    }',
    '  }',
    '}'].join('');

  createAction(actionStr, ACTION_SET, ACTION_PATH);
  
  if (selection.length == 0) {
    app.executeMenuCommand('selectall');
  }
  var groups = getGroups(selection);
  clipCount(groups);
  // When the number of clip groups >, full-screen mode is enabled
  if (clipCounter > OVER_GROUPS) {
    doc.views[0].screenMode = ScreenMode.FULLSCREEN;
  }

  try {
    processing(groups);
  } catch (e) {
    // showError(e);
  }
  
  app.unloadAction(ACTION_SET, '');
  resetSelection();
  doc.views[0].screenMode = userScreen;
  app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
}

function processing(items) {
  var currItem;
  for (var i = 0; i < items.length; i++) {
    resetSelection();
    currItem = items[i];
    if (currItem.typename === 'GroupItem' && currItem.clipped) {
      trim(currItem);
    }
    if (currItem.typename === 'GroupItem' && !currItem.clipped) {
      if (currItem.pageItems.length == 1 && currItem.pageItems[0].typename === 'GroupItem') {
        var singleItem = currItem.pageItems[0];
        singleItem.moveBefore(currItem);
        trim(singleItem);
      } else {
        processing(currItem.pageItems);
      }
    }
  }
}

function trim(item) {
  // Save opacity & blendingMode properties
  if (item.opacity < 100) { itemAttr.mOpacity = item.opacity; }
  if (item.blendingMode != BlendModes.NORMAL) { itemAttr.mBlending = item.blendingMode; }
  
  // If <clip group> contains live text
  outlineText(item);
  
  // Trick for Compound path created from groups of paths
  item.selected = true;
  compoundPathsNormalize(selection);
  
  if (SAVE_FILLED_CLIPMASK) { 
    duplicateFilledMask(item, itemAttr.mOpacity, itemAttr.mBlending);
  }
  
  item.selected = true;
  if (SAVE_FILLED_CLIPMASK) {
    // Because the duplicate mask is select behind
    selection = selection[0];
  }
  app.doScript(ACTION_NAME, ACTION_SET);

  if (selection.length > 0) {
    // Restore opacity to child path
    if (itemAttr.mOpacity < 100) { selection[0].opacity = itemAttr.mOpacity; }
    // Restore blendingMode to child path
    if (itemAttr.mBlending != BlendModes.NORMAL) { selection[0].blendingMode = itemAttr.mBlending; }
  }

  itemAttr = { mOpacity: 100, mBlending: BlendModes.NORMAL };
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
function getGroups(items) {
  var childsArr = [],
      currItem;
  for (var i = 0; i < items.length; i++) {
    currItem = items[i];
    if (currItem.typename === 'GroupItem') { 
      childsArr.push(currItem);
    }
  }
  return childsArr;
}

function outlineText(group) {
  try {
    for (var i = 0; i < group.pageItems.length; i++) {
      var currItem = group.pageItems[i],
          itemType = currItem.typename;
      if (itemType === 'TextFrame') { 
        var textColor = currItem.textRange.fillColor;
        currItem.selected = true;
        app.executeMenuCommand('outline');
        for (var j = 0; j < selection.length; j++) {
          if (selection[j].typename  === 'PathItem') selection[j].fillColor = textColor;
          if (selection[j].typename  === 'CompoundPathItem') {
            // Trick for Compound path created from groups of paths
            if (selection[j].pathItems.length == 0) {
              var tempPath = selection[j].pathItems.add();
            }
            selection[j].pathItems[0].fillColor = textColor;
            tempPath.remove();
          }
        }
        resetSelection();
      }
      if (itemType === 'GroupItem') {
        outlineText(currItem);
      }
    }
  } catch (e) {
    // showError(e);
  }
}

function ungroup(items) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].typename === 'GroupItem') {
      var j = items[i].pageItems.length;
      while (j--) {
        items[i].pageItems[0].locked = items[i].pageItems[0].hidden = false;
        items[i].pageItems[0].moveBefore(items[i]);
      }
      items[i].remove();
    }
  }
}

// Trick for Compound path created from groups of paths
function compoundPathFix(item) {
  selection = [item];
  app.executeMenuCommand('noCompoundPath');
  ungroup(selection);
  app.executeMenuCommand('compoundPath');
  resetSelection();
}

// From compoundFix.jsx by Alexander Ladygin https://github.com/alexander-ladygin
function compoundPathsNormalize(items) {
  var i = items.length;
  while (i--) {
    if (items[i].typename === 'GroupItem') {
      compoundPathsNormalize(items[i].pageItems);
    } else if (items[i].typename === 'CompoundPathItem') {
      compoundPathFix(items[i]);
    }
  }
}

function duplicateFilledMask(group, opacity, blending) {
  try {
    for (var i = 0; i < group.pageItems.length; i++) {
      var currItem = group.pageItems[i],
          itemType = currItem.typename,
          zeroPath = (itemType === 'CompoundPathItem') ? currItem.pathItems[0] : currItem;

      if ((itemType === 'PathItem' || itemType === 'CompoundPathItem') && zeroPath.clipping && zeroPath.filled) {
        var maskClone = currItem.duplicate(group, ElementPlacement.PLACEAFTER);
            // Restore opacity to child path
            if (opacity < 100) { maskClone.opacity = opacity; }
            // Restore blendingMode to child path
            if (blending != BlendModes.NORMAL) { maskClone.blendingMode = blending; }
      }
    }
    app.redraw();
  } catch (e) {
    // showError(e);
  }
}

function clipCount(items) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].typename === 'GroupItem' && items[i].clipped) {
      clipCounter++;
    }
    if (items[i].typename === 'GroupItem' && !items[i].clipped) {
      clipCount(items[i].pageItems);
    }
  }
}

function resetSelection() {
  selection = null;
  app.redraw();
}

function showError(err) {
  alert(err + ': on line ' + err.line, 'Script Error', true);
}

try {
  main();
} catch (e) {
  // showError(e);
}