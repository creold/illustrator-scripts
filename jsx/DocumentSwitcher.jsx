/*
  DocumentSwitcher.jsx for Adobe Illustrator
  Description: Displays a list of currently opened documents and allows you to activate any document with a single click
  Discussion: https://community.adobe.com/t5/illustrator-discussions/display-opened-windows-in-a-panel-as-a-buttons/td-p/14745128
  Date: August, 2024
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/aiscripts
  - via Donatty https://donatty.com/sergosokin
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2019-2025 (Mac/Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
    name: 'Document Switcher',
    version: 'v0.1'
  };

  var SETTINGS = {
    name: SCRIPT.name.replace(/\s/g, '_') + '_data.json',
    folder: Folder.myDocuments + '/Adobe Scripts/'
  };

  if (!/illustrator/i.test(app.name)) {
    alert('Wrong application\nRun script from Adobe Illustrator', 'Script error');
    return;
  }

  if (!app.documents.length) {
    alert('No opened documents', 'Script error');
    return;
  }

  // Save the current order because after activating doc all array reordered
  var docs = getDocsInfo();

  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version, undefined, {resizeable: true});
      win.opacity = 0.97;
      win.preferredSize.width = 240;
      win.alignChildren = ['fill', 'fill'];

  var queryGrp = win.add('group');
      queryGrp.alignChildren = ['fill', 'center'];
      queryGrp.alignment = ['fill', 'top'];

  var query = queryGrp.add('edittext', undefined, '');
      query.alignment = ['fill', 'center'];
      query.active = true;

  var btnClear = queryGrp.add('button', undefined, 'Clear');
      btnClear.preferredSize.width = 50;
      btnClear.alignment = ['right', 'center'];

  var docLbl = win.add('statictext', undefined, 'Active: ' + getActiveName());
      docLbl.alignment = ['fill', 'top'];

  var list = win.add('listbox', undefined, '',
    {
      numberOfColumns: 3,
      showHeaders: true,
      columnTitles: ['', 'Name', 'Folder'],
      columnWidths: [10, 40, 45]
    });

  var footer = win.add('group');
      footer.alignChildren = ['fill', 'center'];
      footer.alignment = ['fill', 'bottom'];

  var total = footer.add('statictext', undefined, 'Total: ' + docs.length);
      total.preferredSize.width = 60;
      total.alignment = ['left', 'center'];

  var btnClose = footer.add('button', undefined, 'Close');
      btnClose.alignment = ['right', 'center'];

  addList(docs);
  list.preferredSize.width = 240;

  query.onChanging = function () {
    var results = filterList(this.text, docs);
    addList(this.text.length ? results : docs);
  }

  btnClear.onClick = function () {
    query.text = '';
    this.active = true;
    query.active = true;
    addList(docs);
  }

  list.onChange = function () {
    selectListItem();
  }

  btnClose.onClick = function () {
    win.close();
  }

  win.onShow = function () {
    loadSettings(SETTINGS);
    var results = filterList(query.text, docs);
    addList(query.text.length ? results : docs);
    this.layout.resize();
  }

  win.onResizing = function () {
    this.layout.resize();
  }

  win.onClose = function () {
    saveSettings(SETTINGS);
  }

  /**
   * Update the list of opened documents
   * @param {(Object|Array)} arr - An array of document objects
   */
  function addList(arr) {
    var currDoc = getActiveName();

    list.removeAll();

    for (var i = 0; i < arr.length; i++) {
      addListItem(arr[i], currDoc);
    }

    if (query.text.length) {
      total.text = 'Found: ' + arr.length;
    } else {
      total.text = 'Total: ' + arr.length;
    }
  }

  /**
   * Add a list item for a document to the list
   * @param {Object} doc - The document object
   * @param {string} name - The name of the currently active document
   */
  function addListItem(doc, name) {
    var row = list.add('item', doc.saved ? '' : '\uFF0A');
    row.subItems[0].text = doc.name;
    row.subItems[1].text = doc.path;
    if (name === doc.name) row.selected = true;
  }

  // Activate the selected document from the list
  function selectListItem() {
    for (var i = 0; i < list.children.length; i++) {
      var item = list.children[i];
      if (item.selected) {
        docLbl.text = 'Active: ' + item.subItems[0].text;
        switchDoc(item.subItems[0].text, item.subItems[1].text);
      }
    }
  }

  /**
   * Save options to a file
   * @param {Object} prefs - The preferences file
   */
  function saveSettings(prefs) {
    if(!Folder(prefs.folder).exists) Folder(prefs.folder).create();
    var f = new File(prefs.folder + prefs.name);
    f.encoding = 'UTF-8';
    f.open('w');
    var pref = {};
    pref.win_x = win.location.x;
    pref.win_y = win.location.y;
    pref.win_w = win.size.width;
    pref.win_h = win.size.height;
    pref.query = query.text;
    var data = pref.toSource();
    f.write(data);
    f.close();
  }

  /**
   * Loads options from a file
   * @param {Object} prefs - The preferences file
   */
  function loadSettings(prefs) {
    var f = File(prefs.folder + prefs.name);
    if (f.exists) {
      try {
        f.encoding = 'UTF-8';
        f.open('r');
        var json = f.readln();
        var pref = new Function('return ' + json)();
        f.close();
        if (typeof pref != 'undefined') {
          win.location = [pref.win_x ? pref.win_x : 0, pref.win_y ? pref.win_y : 0];
          if (pref.win_w && pref.win_h) {
            win.size = [pref.win_w, pref.win_h];
          }
          query.text = pref.query;
          win.update();
        }
      } catch (err) {}
    }
  }

  win.show();

}

/**
 * Get information about all opened documents
 * @returns {Object} - An array of objects containing information about each document
 */
function getDocsInfo() {
  var arr = [];
  for (var i = 0; i < app.documents.length; i++) {
    var doc = app.documents[i];
    arr.push({
      name: decodeURI(doc.name),
      path: doc.name.indexOf('.') > -1 ? decodeURI(doc.path) : '',
      saved: doc.saved && doc.name.indexOf('.') > -1,
    });
  }
  return arr;
}

/**
 * Get the name of the currently active document
 * @returns {string} - The name of the active document
 */
function getActiveName() {
  return app.documents.length ? decodeURI(app.activeDocument.name) : '';
}

/**
* Filter array based on the search string
* @param {string} query - The search string used to filter array elements
* @param {(Object|Array)} arr - The array to filter
* @returns {Array} sortedResults - The filtered array that match the search criteria
*/
function filterList(query, arr) {
  var results = [];

  for (var i = 0; i < arr.length; i++) {
    var index = query.length > 0 ? arr[i].name.toLowerCase().indexOf(query.toLowerCase()) : 0;
    if (index !== -1) {
      var score = index === 0 ? 1 : index > 0 ? 0.5 : 0;
      results.push({
        obj: arr[i],
        name: arr[i].name,
        score: score,
        index: index
      });
    }
  }

  // Sort results based on score and index
  for (var j = 0; j < results.length; j++) {
    for (var k = j + 1; k < results.length; k++) {
      var a = results[j];
      var b = results[k];
      if (b.score > a.score || (b.score === a.score && (a.index > b.index || (a.index === b.index && a.name.localeCompare(b.name) > 0)))) {
        var temp = results[j];
        results[j] = results[k];
        results[k] = temp;
      }
    }
  }

  var sortedResults = [];
  for (var s = 0; s < results.length; s++) {
    sortedResults.push(results[s].obj);
  }

  return sortedResults;
}

/**
 * Switch to the specified document based on name and path
 * @param {string} docName - The name of the document to activate
 * @param {string} docPath - The path to the document to activate
 */
function switchDoc(docName, docPath) {
  for (var i = 0; i < app.documents.length; i++) {
    var doc = app.documents[i];
    if ((docName.toString() == decodeURI(doc.name).toString()) 
        && (docPath.toString() == decodeURI(doc.path).toString())) {
      doc.activate();
      break;
    }
  }
}

// Run script
try {
  main();
} catch (err) {}