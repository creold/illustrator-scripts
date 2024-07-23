![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Group & Mask | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-43k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#centerclipstoartboards)
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extractfromgroup) `new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extungroup)
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#groupartboardobjects) `new, 11.06.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#movetogroup) `upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#trimmasks)

## CenterClipsToArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CenterClipsToArtboards.jsx-FF6900.svg)](https://rebrand.ly/ctrcliptoabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выравнивает все обтравочные маски (clipping masks) и их содержимое по центру артбордов, на которых они лежат. Также можно выравнивать только выделенные маски по одному артборду. 

![CenterClipsToArtboards](https://i.ibb.co/ykHy3rM/Center-Clips-To-Artboards.gif)

## ExtractFromGroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ExtractFromGroup.jsx-FF6900.svg)](https://rebrand.ly/extrgrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Извлекает выбранные элементы из групп. По умолчанию каждый элемент извлечётся перед самой верхней группой. Если зажата  клавиша <kbd>Alt / Option (⌥)</kbd>, то элемент переместится перед первой родительской группой.

![ExtractFromGroup](https://i.ibb.co/pK5yzqS/Extract-From-Group.gif)

## ExtUngroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ExtUngroup.jsx-FF6900.svg)](https://rebrand.ly/extungrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт разгруппировывает объекты и удаляет обтравочные маски в документе.   
*Сделан на основе скрипта автора Jiwoong Song и модификации от [John Wundes](http://www.wundes.com/).*

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39484654-create-an-ungroup-all-feature-on-layer-s) за внедрение этой функции в Иллюстратор.

![ExtUngroup](https://i.ibb.co/QngnpZL/demo-Ext-Ungroup.gif)

## GroupArtboardObjects
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-GroupArtboardObjects.jsx-FF6900.svg)](https://rebrand.ly/grpabobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт группирует объекты на артбордах, при этом пропускает заблокированные или скрытые объекты. Опционально можно переименовать полученные группы и сортировать в слоях по порядку.

![GroupArtboardObjects](https://i.ibb.co/GTGDnCF/Group-Artboard-Objects.gif)

## MoveToGroup
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MoveToGroup.jsx-FF6900.svg)](https://rebrand.ly/movtogrp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Если выделенные объекты содержат группу, то перемещает все объекты в нее. Порядок сохраняется: объекты выше группы помещаются внутри наверх, нижние — вниз группы. Если групп несколько, то выбирается в диалоге куда переместить: в верхнюю или нижюю.

![MoveToGroup](https://i.ibb.co/jkD5Zx4/Move-To-Group.gif)

## TrimMasks
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-TrimMasks.jsx-FF6900.svg)](https://rebrand.ly/trimcm) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

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
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] `USD`, [ЮMoney] `RUB`, [Tinkoff] `RUB`, Donatty] `RUB`, [DonatePay] `RUB`. Спасибо.   

[Buymeacoffee]: https://www.buymeacoffee.com/aiscripts
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/aiscripts">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
</a>

<a href="https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/">
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