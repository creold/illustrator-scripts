/*
  SyncGlobalColorsNames.jsx for Adobe Illustrator
  Description: Syncs the names of the same global colors between open documents
  Date: April, 2021
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
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Global variables
var SCRIPT = {
      name: 'Sync Global Colors Names',
      version: 'v.0.1'
    },
    LANG = {
      errDoc: { en: 'Error\nOpen a document and try again',
                ru: 'Ошибка\nОткройте документ и запустите скрипт' },
      done: { en: 'Syncing of Global colors names is complete\nDocuments saved',
              ru: 'Синхронизация имен глобальных цветов завершена\nДокументы сохранены' },
      source: { en: 'Source for sync', ru: 'Источник для синхронизации' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      ok: { en: 'Ok', ru: 'Готово' }
    };

// Main function
function main() {
  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  var doc = activeDocument;
  var newNames = [];

  // Collect documents names for dropdown menu
  var docList = [];
  for (var i = 0; i < documents.length; i++) {
    docList.push(documents[i].name); 
  }

  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = ['fill', 'fill'];
  
  var panel = dialog.add('panel', undefined, LANG.source);
  var docs = panel.add('dropdownlist', [0, 0, 180, 30], docList);
      docs.selection = 0;
  
  var btns = dialog.add('group');
      btns.alignChildren = ['center', 'fill'];
  
  var cancel = btns.add('button', undefined, LANG.cancel, {name: 'cancel'});
  var ok = btns.add('button', [0, 0, 100, 30], LANG.ok, {name: 'ok'});
  
  var copyright = dialog.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  cancel.onClick = dialog.close;
  ok.onClick = okClick;

  dialog.center();
  dialog.show();

  function okClick() {
    var idx = docs.selection.index;
    // Collect names from active document
    collectSpotsNames(documents[idx], newNames);

    for (var i = 0; i < documents.length; i++) {
      if (documents[i] !== documents[idx]) {
        // Move names to other documents
        replaceSpotsNames(documents[i], newNames);
        try {
          app.activeDocument = documents[i];
          if (documents[i].path !== '') app.activeDocument.save();
        } catch (e) {}
      }
    }

    activeDocument = doc;
    dialog.close();
    alert(LANG.done);
  }
}

/**
 * Collect data about global colors for synchronization
 * @param {object} doc source document
 * @param {array} obj output array of global colors data
 */
function collectSpotsNames(doc, obj) {
  for (var i = 0; i < doc.spots.length; i++) {
    var iSpot = doc.spots[i];
    if (iSpot.name !== '[Registration]') {
      obj.push( { 
        name: iSpot.name,
        red: iSpot.color.red,
        green: iSpot.color.green,
        blue: iSpot.color.blue
        } );
    }
  }
}

/**
 * Replace matching global color names in the document
 * @param {object} doc target document
 * @param {array} obj array of global colors data
 */
function replaceSpotsNames(doc, obj) {
  for (var i = 0; i < obj.length; i++) {
    for (var j = 0; j < doc.spots.length; j++) {
      var iSpot = doc.spots[j];
      if ((obj[i].red === iSpot.color.red) && 
          (obj[i].green === iSpot.color.green) && 
          (obj[i].blue === iSpot.color.blue) &&
          (iSpot.name !== '[Registration]')) {
        iSpot.name = obj[i].name;
      }
    }
  }
}

/**
 * Open link in browser
 * @param {string} url - website adress
 */
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