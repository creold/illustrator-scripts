/*
  CenterClipsToArtboards.jsx for Adobe Illustrator
  Description: Align the clip groups and their contents to the center of the parent artboards
  Date: May, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This SCRIPT is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'Center Clips To Artboards',
        version: 'v.0.1'
      };

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  var doc = activeDocument,
      abIdx = doc.artboards.getActiveArtboardIndex();

  if (!doc.groupItems.length) return;

  // Collect artboards names for dropdown menu
  var absList = ['All artboards'];
  for (var i = 0; i < doc.artboards.length; i++) {
    absList.push(doc.artboards[i].name);
  }

  // INTERFACE
  var dialog = new Window('dialog', SCRIPT.name);
      dialog.orientation = 'column';
      dialog.preferredSize.width = 166;
      dialog.alignChildren = ['fill','center'];
      dialog.opacity = .97;

  var selAbIdx = dialog.add('dropdownlist', undefined, absList);
      selAbIdx.selection = abIdx + 1;

  var inPnl = dialog.add('panel', undefined, 'Mode');
      inPnl.orientation = 'column';
      inPnl.alignChildren = ['left','top'];
      inPnl.margins = [10, 20, 0, 10];

  var isTotal = inPnl.add('radiobutton', undefined, 'Total content');
      isTotal.value = true;
  var isSep = inPnl.add('radiobutton', undefined, 'Each element');

  var isIncMask = dialog.add('checkbox', undefined, 'Include mask path');

  var cancel = dialog.add('button', undefined, 'Cancel', { name: 'cancel' });
  var ok = dialog.add('button', undefined, 'Ok', { name: 'ok' });

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  dialog.center();
  dialog.show();

  function okClick() {
    var userSel = selection,
        userCoord = app.coordinateSystem;

    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    if (getClippingGroups(selection).length) { // Align only selected clipping groups
      if (selAbIdx.selection.index == 0) {
        selAbIdx.selection = 1;
      }
      var abRect = doc.artboards[selAbIdx.selection.index - 1].artboardRect,
          clipGroups = getClippingGroups(selection);
      doc.artboards.setActiveArtboardIndex(selAbIdx.selection.index - 1);
      alignToAbCenter(clipGroups, abRect, isIncMask.value, isTotal.value);
    } else { // Align all clipping groups
      selection = null;
      redraw();
      if (selAbIdx.selection.index == 0) {
        for (var i = 0, abLen = doc.artboards.length; i < abLen; i++) {
          processing(i, isIncMask.value, isTotal.value);
        }
      } else {
        processing(selAbIdx.selection.index - 1, isIncMask.value, isTotal.value);
      }
    }

    doc.artboards.setActiveArtboardIndex(abIdx);
    selection = userSel;
    app.coordinateSystem = userCoord;
    redraw();
    dialog.close();
  }
}

// Processing clipping groups for each artboard
function processing(idx, isAlignMask, isTotal) {
  selection = null;
  redraw();
  activeDocument.artboards.setActiveArtboardIndex(idx);
  activeDocument.selectObjectsOnActiveArtboard();

  var abRect = activeDocument.artboards[idx].artboardRect,
      clipGroups = getClippingGroups(selection);

  alignToAbCenter(clipGroups, abRect, isAlignMask, isTotal);
}

// Get all clipping groups in the artboard area
function getClippingGroups(collection) {
  var arr = [];
  for (var i = 0, len = collection.length; i < len; i++) {
    if (collection[i].typename === 'GroupItem' && collection[i].clipped &&
        collection[i].pageItems.length > 1) {
      arr.push(collection[i]);
    }
  }
  return arr;
}

// Align to the center of the artboard
function alignToAbCenter(clipGroups, abRect, isAlignMask, isTotal) {
  for (var i = 0, cLen = clipGroups.length; i < cLen; i++) {
    if (isTotal) { // Total content
      var content = getContent(clipGroups[i], false);
      // Grouping for better performance
      var tmpArray = [];
      var tmpGroup = clipGroups[i].groupItems.add();
      for (var j = 0, len = content.length; j < len; j++) {
        var tmpItem;
        tmpItem = clipGroups[i].pathItems.add();
        tmpItem.move(content[j], ElementPlacement.PLACEBEFORE);
        tmpArray.push(tmpItem);
        content[j].move(tmpGroup, ElementPlacement.PLACEATEND);
      }
      // Move group to artboard center
      tmpGroup.position = [
        (abRect[2] - abRect[0]) / 2 - tmpGroup.width / 2,
        (abRect[3] - abRect[1]) / 2 + tmpGroup.height / 2
        ];
      // Return objects to places
      for (var t = 0, tmpLen = tmpGroup.pageItems.length; t < tmpLen; t++) {
        tmpGroup.pageItems[t].move(tmpArray[t], ElementPlacement.PLACEBEFORE);
        tmpArray[t].move(tmpGroup, ElementPlacement.PLACEATBEGINNING);
      }
      tmpGroup.remove();
      if (isAlignMask) {
        var maskPath = getMaskPath(clipGroups[i]);
        maskPath.position = [
          (abRect[2] - abRect[0]) / 2 - maskPath.width / 2,
          (abRect[3] - abRect[1]) / 2 + maskPath.height / 2
          ];
      }
    } else { // Each element
      var content = getContent(clipGroups[i], isAlignMask);
      for (var k = 0, contLen = content.length; k < contLen; k++) {
        var currItem = content[k];
        currItem.position = [
          (abRect[2] - abRect[0]) / 2 - currItem.width / 2,
          (abRect[3] - abRect[1]) / 2 + currItem.height / 2
          ];
      }
    }
  }
}

// Get clipping group inner content
function getContent(collection, isAlignMask) {
  var arr = [];
  if (isAlignMask) {
    arr.push.apply(arr, collection.pageItems);
  } else {
    for (var i = 0, len = collection.pageItems.length; i < len; i++) {
      if (!isClippingPath(collection.pageItems[i])) arr.push(collection.pageItems[i]);
    }
  }
  return arr;
}

// Get clipping mask
function getMaskPath(group) {
  for (var i = 0, len = group.pageItems.length; i < len; i++) {
    var currItem = group.pageItems[i];
    if (isClippingPath(currItem)) {
      return currItem;
    }
  }
}

// Check clipping mask
function isClippingPath(item) {
  var clipText = (item.typename === 'TextFrame' &&
                  item.textRange.characterAttributes.fillColor == '[NoColor]' &&
                  item.textRange.characterAttributes.strokeColor == '[NoColor]');
  return (item.typename === 'CompoundPathItem' && item.pathItems[0].clipping) ||
          item.clipping || clipText;
}

// Open link in browser
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}
