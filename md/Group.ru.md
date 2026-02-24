![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Group & Mask | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-167k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#centerclipstoartboards) `v0.1 — 05.2021`
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extractfromgroup) `v0.1 — new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extungroup) `v1.2.1`
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#groupartboardobjects) `v0.2.1 — upd, 12.06.2025`
* [MaskArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#maskartboards) `v0.3 — upd, 19.02.2026`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#movetogroup) `v0.1.2 — upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#trimmasks) `v0.3`

## CenterClipsToArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CenterClipsToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/ctrcliptoabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выравнивает все обтравочные маски (clipping masks) и их содержимое по центру артбордов, на которых они лежат. Также можно выравнивать только выделенные маски по одному артборду. 

![CenterClipsToArtboards](https://i.ibb.co/ykHy3rM/Center-Clips-To-Artboards.gif)

## ExtractFromGroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ExtractFromGroup.jsx-FF6900.svg)](https://link.aiscripts.ru/extrgrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Извлекает выбранные элементы из групп. По умолчанию каждый элемент извлечётся перед самой верхней группой. Если зажата  клавиша <kbd>Alt / Option (⌥)</kbd>, то элемент переместится перед первой родительской группой.

![ExtractFromGroup](https://i.ibb.co/pK5yzqS/Extract-From-Group.gif)

## ExtUngroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ExtUngroup.jsx-FF6900.svg)](https://link.aiscripts.ru/extungrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт разгруппировывает объекты и удаляет обтравочные маски в документе.   
*Сделан на основе скрипта автора Jiwoong Song и модификации от [John Wundes](http://www.wundes.com/).*

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39484654-create-an-ungroup-all-feature-on-layer-s) за внедрение этой функции в Иллюстратор.

![ExtUngroup](https://i.ibb.co/QngnpZL/demo-Ext-Ungroup.gif)

## GroupArtboardObjects
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-GroupArtboardObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/grpabobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт группирует объекты на артбордах, при этом пропускает заблокированные или скрытые объекты. Опционально можно переименовать полученные группы и сортировать в слоях по порядку.

![GroupArtboardObjects](https://i.ibb.co/GTGDnCF/Group-Artboard-Objects.gif)

## MaskArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MaskArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/maskab) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Помещает видимые разблокированные объекты на артбордах в обтравочные маски по их размеру. В опции Custom можно вводить диапазоны номеров артбордов через запятую и дефис. Если в параметрах документа установлены выпуски за обрез и документ сохранен, то в полях Bleed по умолчанию будет это значение.

![MaskArtboards](https://i.ibb.co/Cw3Z0St/Mask-Artboards.gif)

## MoveToGroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MoveToGroup.jsx-FF6900.svg)](https://link.aiscripts.ru/movtogrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Если выделенные объекты содержат группу, то перемещает все объекты в нее. Порядок сохраняется: объекты выше группы помещаются внутри наверх, нижние — вниз группы. Если групп несколько, то выбирается в диалоге куда переместить: в верхнюю или нижюю.

![MoveToGroup](https://i.ibb.co/jkD5Zx4/Move-To-Group.gif)

## TrimMasks
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-TrimMasks.jsx-FF6900.svg)](https://link.aiscripts.ru/trimcm) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Автоматические обрезает объекты внутри Clipping Mask, применяя команду `Pathfinder > Crop`. Такая задача может возникнуть, когда при открытии PDF или SVG в Illustrator множество объектов помещаются внутри отдельных масок.  

> [!TIP]   
> Если у маски есть цвет и хотите сохранить её после обрезки содержимого, то откройте файл скрипта текстовым редактором и поменяйте значение `SAVE_FILLED_CLIPMASK = false;` на `true`.

> [!WARNING]   
> Не добавляйте этот скрипт в панель операций (Action) для быстрого запуска. Это приведёт к зависанию Иллюстратора.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35456389-flatten-expand-clipping-group-crop-each-object) за внедрение этой функции в Иллюстратор.

<a href="https://youtu.be/liui0ZUAN50">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![TrimMasks](https://i.ibb.co/prkQGyt/demo-Trim-Masks.gif)

## Поддержка
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] `USD`, [CloudTips] `RUB`, [ЮMoney] `RUB`, [Tinkoff] `RUB`, Donatty] `RUB`, [DonatePay] `RUB`. Спасибо.   

[Buymeacoffee]: https://www.buymeacoffee.com/aiscripts
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[CloudTips]: https://pay.cloudtips.ru/p/b81d370e
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/aiscripts">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
</a>

<a href="https://pay.cloudtips.ru/p/b81d370e">
  <img width="111" height="40" src="https://i.ibb.co/qLznXkNG/cloudtips-badge.png">
</a>

<a href="https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405">
  <img width="111" height="40" src="https://i.ibb.co/hRsbYnM/tinkoff-badge.png">
</a>

<a href="https://yoomoney.ru/to/410011149615582">
  <img width="111" height="40" src="https://i.ibb.co/wwrYWJ5/yoomoney-badge.png">
</a>

<a href="https://donatty.com/sergosokin">
  <img width="111" height="40" src="https://i.ibb.co/s61FGCn/donatty-badge.png">
</a>

<a href="https://new.donatepay.ru/@osokin">
  <img width="111" height="40" src="https://i.ibb.co/0KJ94ND/donatepay-badge.png">
</a>

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.