/*
  MoveToGroup.jsx for Adobe Illustrator
  Description: Move the selected items to the first upper or lower group
  Date: May, 2021
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via YooMoney https://yoomoney.ru/to/410011149615582
  - via QIWI https://qiwi.com/n/OSOKIN
  - via Donatty https://donatty.com/sergosokin
  - via PayPal http://www.paypal.me/osokin/usd

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided 'as is' without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check other author's scripts: https://github.com/creold
*/

//@target illustrator
$.localize = true; // Enabling automatic localization
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

var SCRIPT = {
      name: 'Move To Group',
      version: 'v.0.1'
    },
    LANG = {
      errDoc: { en: 'Error\nOpen a document and try again',
                ru: 'Ошибка\nОткройте документ и запустите скрипт' },
      errSel: { en: 'Error\nPlease, select multiple items with group',
                ru: 'Ошибка\nВыделите несколько объектов с группой' },
      errGroup: { en: 'Error\nThe selection does not have a group',
                ru: 'Ошибка\nСреди выделенных объектов нет группы' },
      pnlTitle: { en: 'Target', ru: 'Назначение' },
      top: { en: 'Top group', ru: 'Верхняя группа' },
      bottom: { en: 'Bottom group', ru: 'Нижняя группа' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      ok: { en: 'Ok', ru: 'Готово' }
    };

// Main function
function main() {
  if (!documents.length) {
    alert(LANG.errDoc);
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert(LANG.errSel);
    return;
  }

  var groupCount = countGroups();

  try {
    switch (groupCount) {
      case 0: // No group
        alert(LANG.errGroup);
        return;
      case 1: // The selection has one group
        moveItems();
        break;
      case 2: // The selection has many group
        // INTERFACE
        var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
            dialog.orientation = 'column';
            dialog.alignChildren = ['fill', 'fill'];
            dialog.opacity = .97;

        var pnlTarget = dialog.add('panel', undefined, LANG.pnlTitle);
            pnlTarget.orientation = 'column';
            pnlTarget.alignChildren = ['left', 'top'];
            pnlTarget.margins = [10, 20, 10, 10];

        var rbTop = pnlTarget.add('radiobutton', undefined, LANG.top);
        var rbBottom = pnlTarget.add('radiobutton', undefined, LANG.bottom);
            if ($.os.toLowerCase().indexOf('mac') >= 0) { // For Mac OS user
              rbBottom.active = true;
            }
            rbBottom.value = true;

        var btns = dialog.add('group');
            btns.orientation = 'column';
            btns.alignChildren = ['fill', 'center'];

        var cancel = btns.add('button', undefined, LANG.cancel, { name: 'cancel' });
        var ok = btns.add('button', undefined, LANG.ok, { name: 'ok' });

        var copyright = dialog.add('statictext', undefined, 'Visit Github');
            copyright.justify = 'center';

        copyright.addEventListener('mousedown', function () {
          openURL('https://github.com/creold');
        });

        cancel.onClick = dialog.close;
        ok.onClick = okClick;

        dialog.center();
        dialog.show();
        break;
    }
  } catch (e) {}

  function okClick() {
    moveItems(rbTop.value);
    dialog.close();
  }
}

/**
 * Search for groups in the selection
 * @return {number} number of groups
 */
function countGroups() {
  var count = 0;

  for (var i = 0, len = selection.length; i < len; i++) {
    if (count == 2) return count; // Enough to display the dialog
    if (selection[i].typename === 'GroupItem') count++;
  }

  return count;
}

/**
 * Move items to a group in their order
 * @param {boolean} isTop - move to the top group or bottom group
 */
function moveItems(isTop) {
  if (!arguments.length) isTop = true;
  var data = isTop ? collectForTop() : collectForBottom();

  for (var i = data.before.length - 1; i >= 0; i--) {
    data.before[i].move(data.target, ElementPlacement.PLACEATBEGINNING);
  }

  for (var j = data.after.length - 1; j >= 0; j--) {
    data.after[j].move(data.target, ElementPlacement.PLACEATEND);
  }
}

/**
 * Search for a top target group and collect items before and after it
 * @return {object} top group and items arrays
 */
function collectForTop() {
  var arrAfter = [],
      arrBefore = [];

  for (var i = 0, len = selection.length; i < len; i++) {
    if (selection[i].typename === 'GroupItem') {
      var target = selection[i];
      groupIdx = i;
      break;
    } else {
      // Get the items above the group
      arrBefore.push(selection[i]);
    }
  }
  // Get items under a group
  for (var j = selection.length - 1; j > groupIdx; j--) arrAfter.push(selection[j]);

  return { 'target': target, 'before': arrBefore, 'after': arrAfter };
}

/**
 * Search for a bottom target group and collect items before and after it
 * @return {object} bottom group and items arrays
 */
function collectForBottom() {
  var arrAfter = [],
      arrBefore = [];

  for (var i = selection.length - 1; i >= 0; i--) {
    if (selection[i].typename === 'GroupItem') {
      var target = selection[i];
      groupIdx = i;
      break;
    } else {
      // Get items under a group
      arrAfter.push(selection[i]);
    }
  }
  // Get the items above the group
  for (var j = 0; j < groupIdx; j++) arrBefore.push(selection[j]);

  return { 'target': target, 'before': arrBefore, 'after': arrAfter };
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
