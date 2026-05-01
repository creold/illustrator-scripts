![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Item | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-197k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [AlignToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#aligntoartboards) `v0.2 — upd, 06.11.2023`
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#batchtrace) `v0.3 — upd, 07.06.2023`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#duplicatetoartboards) `v0.2 — upd, 20.09.2025`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#fitselectiontoartboards) `v0.3.4 — upd, 22.04.2024`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#makeenvelopeswithtops) `v0.1 — 09.2021`
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#mirrormove) `v0.1.1 — upd, 07.08.2024`
* [OffsetObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#offsetobjects) `v0.1.4 — upd, 08.09.2025`
* [PlaceSymbols](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#placesymbols) `v0.1 — new, 16.08.2024`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#renameitems) `v2.0 — upd, 30.04.2026`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#rescale) `v0.3.4 — upd, 09.02.2024`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizeonlargerside) `v0.2.2 — upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizetosize) `v0.9.1 — upd, 09.02.2024`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#roundcoordinates) `v0.4.2 — upd, 22.12.2022`
* [ShowObjectNames](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#showobjectnames) `v0.5 — upd, 14.11.2025`
* [SwapObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#swapobjects) `v0.2 — upd, 24.03.2024`

## AlignToArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-AlignToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/alitoabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт выравнивает выбранные объекты по их родительским артбордам или содержимое всех артбордов документа. Если объект лежит на нескольких артбордах, скрипт проверит, в какой артборд попадает центр объекта — по нему и выровняет. Если же центр объекта вне артбордов — то выровняет по первому.

> [!WARNING]   
> Чем больше у вас артбордов с содержимым и выбранных для выравнивания объектов, тем скрипт медленнее будет работать.

![AlignToArtboards](https://i.ibb.co/XFQSmvR/Align-To-Artboards.gif)

## BatchTrace
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-BatchTrace.jsx-FF6900.svg)](https://link.aiscripts.ru/bchtr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Пакетно трассирует выбранные пользователем линкованные и внедрённые изображения в документе или все изображения из папки. Штатное меню `Object → Image Trace → Make` доступно для одного выбранного изображения. Запись экшена не поможет, так как в нём не сохраняются настройки трассировки. В Adobe Bridge возможна трассировка только папки с изображениями: `Tools → Illustrator → Image Trace`. 

Тонкие настройки в коде скрипта:

* `CFG.extList` — список обрабатываемых форматов из папки. Можно добавить свои или удалить некоторые для пропуска скриптом;
* `CFG.isReverse` — развернуть список пресетов (true), пользовательские будут наверху.

> [!IMPORTANT]   
> Скорость работы скрипта зависит от характеристик вашего компьютера, пресета и количества изображений.   

> [!WARNING]   
> Скрипты Adobe некорректно применяют значение Colors из пользовательских пресетов, поэтому результат трассировки может не совпасть с пресетом. Сильно заметно в CC 2023. Проголосовать за исправление на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/46741876-tracing-bugs-in-scripts).   

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657/suggestions/47385983) за внедрение этой функции в Иллюстратор.   

![BatchTrace](https://i.ibb.co/YkMGpS9/Batch-Trace.gif)

## DuplicateToArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DuplicateToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/duptoabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Дублирует выбранные на активном артборде объекты на ту же позицию в указанные артборды. Номера артбордов перечисляются через запятую или дефис. Пустая строка — объекты продублируются на все артборды, кроме исходного. Выберите `Preserve layers`, если объекты в разных слоях и должны там остаться.

Цвет временных индексов артбордов меняется в коде `CFG.color: [255, 0, 0]`.

![DuplicateToArtboards](https://i.ibb.co/HLVktqHh/Duplicate-To-Artboards.gif)

## FitSelectionToArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-FitSelectionToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/fittoabs) [![Direct2](https://img.shields.io/badge/Прямая%20ссылка-FitSelectionToArtboards%20Lite.jsx-48C794.svg)](https://link.aiscripts.ru/fittoabs-lite) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Раскладывает выбранные объекты по центру артбордов и опционально подгоняет размеры каждого по наибольшей стороне к размеру артборда. При масштабировании объектов можно задать внутренние отступы от границ артбордов. С включённой опцией `Rename artboards...` артборды получат пользовательские имена помещенных на них объектов.   

Версия Lite (FitSelectionToArtboards-Lite.jsx) в тихом режиме выравнивает и масштабирует верхний выбранный объект по активному артборду. Если в её коде поменять флаг `CFG.isContains:true`, то выбранный объект обработается, только если он был целиком или частично в пределах артборда.

Существует два режима: тихий запуск и диалоговый. Меняется в `CFG.showUI`. Эти режимы меняются без правки кода, если удерживать клавишу Alt при запуске:

* <kbd>Alt</kbd> + `CFG.showUI: false` — появится диалог
* <kbd>Alt</kbd> + `CFG.showUI: true` — выполнится без диалога с опциями по умолчанию

![FitSelectionToArtboards](https://i.ibb.co/YT0qPWL/Fit-Selection-To-Artboards.gif)

## MakeEnvelopesWithTops
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MakeEnvelopesWithTops.jsx-FF6900.svg)](https://link.aiscripts.ru/mkenvel) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Искажает выбранный нижний объект по форме верхних по отдельности. Аналогичен множественному выполнению команды `Object → Envelope Distort → Make with Top Object`.

![MakeEnvelopesWithTops](https://i.ibb.co/N24Lmy7/Make-Envelopes-With-Tops.gif)

## MirrorMove
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MirrorMove.jsx-FF6900.svg)](https://link.aiscripts.ru/mirrmov) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Перемещает выбранные объекты или точки зеркально последней операции `Object → Transform → Move...` или сдвига мышью / клавиатурой. Расширяет стандартную команду `Object → Transform → Transform Again`. Возможные оси: XY, X, Y. Movement ratio — коэффициент на какую дистанцию переместить относительно предыдущей (1 = ту же самую). Существует два режима: тихий запуск и диалоговый. Меняется в `CFG.showUI`. Эти режимы меняются без правки кода, если удерживать клавишу Alt при запуске:

* <kbd>Alt</kbd> + `CFG.showUI: false` — появится диалог
* <kbd>Alt</kbd> + `CFG.showUI: true` — скрипт сработает с последними использованными опциями

![MirrorMove](https://i.ibb.co/vDPYtQC/Mirror-Move.gif)

## OffsetObjects
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-OffsetObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/offobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Создаёт параллельные контуры для любого объекта (текста, изображений,символов, кистей) — в отличие от встроенной функции Offset Path. Использует графический стиль (zip-архив включает файл стиля).   

В коде настраивается:   

* `isUseSwatch: false` — использовать образец цвета из панели Swatches или залить контур временным цветом
* `swatchName: 'Cut'` — имя образца цвета для покраски контура. Если скрипт не найдёт его, то создаст сам
* `swatchValue: [0, 100, 0, 0]` — значения CMYK цвета, который применится для заливки и обводки
* `layerName: 'Contour'` — имя отдельного слоя для контуров, когда выбрана опция Move to New Layer

[Подробнее о скрипте](https://ais.sergosokin.ru/item/offset-objects/)

> [!WARNING]   
> Поместите файл OffsetObjects_Style.ai в одну папку со скриптом, иначе скрипт не запустится.

![OffsetObjects](https://i.ibb.co/WNW5GCGS/Offset-Objects.gif)

## PlaceSymbols
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-PlaceSymbols.jsx-FF6900.svg)](https://link.aiscripts.ru/plsymb) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Ищет символы по имени в библиотеке документа и размещает выбранные на холсте. Скрипт ускоряет работу с большой локальной библиотекой символов. В колонке Instances подсчитаны все экземпляры символа в документе.

> [!NOTE]   
> Проголосуйте на [Uservoice](http://illustrator.uservoice.com/forums/333657/suggestions/37002922) за улучшение панели символов в Иллюстратор.

![PlaceSymbols](https://i.ibb.co/y5ytbYp/Place-Symbols.gif)

## RenameItems
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameItems.jsx-FF6900.svg)](https://link.aiscripts.ru/renitems) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Массово переименовывает выбранные объекты или их родительские слои. Если объекты не выбраны, то скрипт переименовывает активный слой или артборд. Функция поиска и замены поддерживает RegExp.   

[Подробнее о скрипте](https://ais.sergosokin.ru/item/renameitems/)

![RenameItems](https://i.ibb.co/xtHdXQ3m/Rename-Items-v2-0.gif)

## Rescale
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-Rescale.jsx-FF6900.svg)](https://link.aiscripts.ru/resc) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Трансформирует выбранные объекты вместе до заданного размера. Также можно использовать скрипт для трансформирования по коэффициенту. Если перед запуском скрипта нарисовать линию размером объекта, то размер подставится в поле `Old size`. Единицы измерения в окне скрипта, как в настройках документа.      

![Rescale](https://i.ibb.co/gDj142f/demo-Rescale.gif)

## ResizeOnLargerSide
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ResizeOnLargerSide.jsx-FF6900.svg)](https://link.aiscripts.ru/reslrgsd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Трансформирует выбранные объекты пропорционально до заданной величины бОльшей стороны. Её скрипт определяет автоматически. Учитывает единицы измерения документа.  

![ResizeOnLargerSide](https://i.ibb.co/1bSj1kC/Resize-On-Larger-Side.gif)

## ResizeToSize
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ResizeToSize.jsx-FF6900.svg)](https://link.aiscripts.ru/rsztsz) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

В Illustrator есть панель `Transform`, но в ней нельзя трансформировать каждый выделенный объект до заданной величины. При стандартном способе периодически появляются дробные значения в размере. Скрипт трансформирует выделенные объекты со 100% точностью, в зависимости от стороны: ширины, высоты или бОльшей стороны. Все настройки переключаются горячими клавишами <kbd>Q</kbd> + подчеркнутая буква или цифра. Вместо <kbd>Q</kbd> можно задать свою клавишу-модификатор в коде `modKey: 'Q'`.

> [!NOTE]   
> Проголосуйте на [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/33252640-an-ability-to-resize-all-selected-objects-to-a-spe), [Uservoice #2](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35740054-match-width-or-height-to-key-object) за внедрение этой функции в Иллюстратор.

<a href="https://youtu.be/PN3dAf6rac8">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![ResizeToSize](https://i.ibb.co/q0Ktmfm/Resize-To-Size.gif)

## RoundCoordinates
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RoundCoordinates.jsx-FF6900.svg)](https://link.aiscripts.ru/rndcoord) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Округляет координаты каждого выделенного объекта. Ориентиром для выравнивания будет выбранная контрольная точка из панели `Transform`. Скрипт учитывает единицы измерения документа и толщину обводки, если включено `Preferences → Use Preview Bounds`. В файле скрипта можно изменить шаг округления координат CFG `step: 1`. Если шаг 0, то скрипт выровняет по сетке документа из `Preferences → Guides & Grid`.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-feature-requests/suggestions/34970752-make-anchor-points-pixel-perfect) за внедрение этой функции в Иллюстратор.

![RoundCoordinates](https://i.ibb.co/3y0WpzC/Round-Coordinates.gif)

## ShowObjectNames
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ShowObjectNames.jsx-FF6900.svg)](https://link.aiscripts.ru/shwobjnms) [![Direct](https://img.shields.io/badge/Прямая%20ссылка-ShowObjectNames%20FontPicker.jsx-FF6900.svg)](https://link.aiscripts.ru/shwObjNmsFont) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выводит имена файлов помещённых или внедрённых изображений (PNG, JPG, TIFF, PSD, PDF и других) и имена прочих выбранных объектов, а также артбордов. Если исходный файл изображения не обнаружен в папке, то скрипт выведет «Missing Image». Для объектов без имени — подпись «Unnamed Object». В версии 0.4 подписи создаются выбранным стилем символов.   

Модификация ShowObjectNames-FontPicker содержит выбор шрифта и его размера. Если у вас на компьютере установлены тысячи шрифтов, то эта версия скрипта будет работать медленней из-за их обработки.

В коде настраивается:   

* `isAddStyle: true` — добавлять новый стиль символов для подписей
* `styleName` — имя нового стиля символов
* `fontSize: 14` — размер шрифта для стиля
* `name: 'Object_Names'` — имя нового слоя

![ShowObjectNames](https://i.ibb.co/PvQk8PTq/Show-Object-Names.gif)

## SwapObjects
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SwapObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/swapobjs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Меняет местами два выбранных объекта по опорной точке (Reference Point). Опционально можно поменять только X или Y координату, место объектов в слоях.

> [!WARNING]   
> Не добавляйте этот скрипт в панель операций (Action) для быстрого запуска. Это приведёт к зависанию Иллюстратора.

![SwapObjects](https://i.ibb.co/L5SkN4W/Swap-Objects.gif)

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