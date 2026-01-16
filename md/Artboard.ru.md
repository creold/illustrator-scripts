![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Artboard | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-167k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsfinder) `v0.2 — upd, 26.10.2025`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsremapper) `v0.2.1 — upd, 12.06.2025`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#batchrenamer) `v1.6 — upd, 17.09.2025`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#duplicateartboardslight) `v0.4.4 — upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#fitartboardstoartwork) `v0.3 — upd, 18.10.2025`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#moveartboards) `v0.2.6 — upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardaslayer) `v0.3 — upd, 18.04.2025`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardassize) `v0.5 — upd, 18.04.2025`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardastopobj) `v0.4 — 18.04.2025`

## ArtboardsFinder
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ArtboardsFinder.jsx-FF6900.svg)](https://link.aiscripts.ru/abfinder) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Ищет артборды в документе по имени или размерам и масштабирует выбранные по центру окна. Размеры отображаются в единицах документа. Альбомные, книжные, квадратные артборды выводятся по убыванию размера при поиске по ориентации.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/32321188-artboard-search-function) за внедрение этой функции в Иллюстратор.

![ArtboardsFinder](https://i.ibb.co/5gcW55Hd/Artboards-Finder.gif)

## ArtboardsRemapper
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ArtboardsRemapper.jsx-FF6900.svg)](https://link.aiscripts.ru/abremap) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Сохраняет имена артбордов в текстовый файл либо переименовывает их из него. Операции с именами происходят в диапазоне указанных индексов, соответствующих номерам из панели Artboards.

![ArtboardsRemapper](https://i.ibb.co/xG8sSNr/Artboards-Remapper.gif)

## BatchRenamer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-BatchRenamer.jsx-FF6900.svg)](https://link.aiscripts.ru/batchren) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Массово переименовывает в документе артборды, слои верхнего уровня и выбранные объекты. Добавляет общий префикс и суффикс к имени. Через Find & Replace заменяется строка в текущих именах. Приводит имена к единому регистру на выбор из девяти вариантов в выпадающем списке.

**Плейсхолдеры** 

* {w} — ширина артборда или выбранного объекта в единицах документа
* {h} — высота артборда или выбранного объекта
* {u} — единицы измерения документа (Document Setup > Units)
* {nu:1} — Автоматическая нумерация, отсчет ведется от введенного вами числа (например, 1, 2, 3...)
* {nd:5} — Автоматическая нумерация, обратный отсчет от введенного вами числа (например, 5, 4, 3...)
* {с} — цветовая модель документа RGB или CMYK
* {dmy} — текущая дата в формате ДД/ММ/ГГГГ
* {mdy} — дата в формате ММ/ДД/ГГГГ
* {ymd} — дата в формате ГГГГ/ММ/ДД
* {t} — время в формате ЧЧ:ММ
* {f} — имя файла без расширения

Поле замены поддерживает [символы регулярных выражений](https://proglib.io/p/shpargalka-po-regulyarnym-vyrazheniyam-v-javascript-2022-07-17). Пример: чтобы удалить числа в именах, введите в поле Find `\d` без кавычек, а Replace оставьте пустым. Для замены пробелов на другой символ: в Find введите `\s+`, а в Replace нужный вам символ.

> [!TIP]   
> Если хотите изменить количество строк в высоту, то откройте файл скрипта текстовым редактором и поменяйте CFG `rows: 5` на другое число. `precision: 0` — число десятичных знаков для высоты и ширины. `decimal: ','` — символ-разделитель в дробных числах высоты и ширины. `isShowIndex: true` — показывать (true) или нет (false) временные индексы артбордов в документе при запуске скрипта.   

[Подробнее о скрипте](https://ais.sergosokin.ru/artboard/batch-renamer/)   

> [!NOTE]   
> Проголосуйте на [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/43575576-bulk-re-naming-of-layers), [Uservoice #2](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39925396-find-and-replace-text-in-object-name-in-the-layers), [Uservoice #3](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35567803-advanced-rename-tools-for-artboards-with-find-re) за внедрение этой функции в Иллюстратор.

![BatchRenamer](https://i.ibb.co/DP7YDGmK/Batch-Renamer.gif)

## DuplicateArtboardsLight
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DuplicateArtboardsLight.jsx-FF6900.svg)](https://link.aiscripts.ru/dupabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Дублирует заданное количество раз выбранный артборд с его содержимым. Платная Pro версия с большим количеством опций доступна на [Robomarket](https://aiscripts.robo.market/)   

<a href="https://youtu.be/qDH1YRaYMYk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![DuplicateArtboardsLight](https://i.ibb.co/rF92HpV/demo-Duplicate-Artboards-Light.gif)

## FitArtboardsToArtwork
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-FitArtboardsToArtwork.jsx-FF6900.svg)](https://link.aiscripts.ru/fitabstoart) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Масштабирует артборды по размеру видимого незаблокированного контента с отступами.

![FitArtboardsToArtwork](https://i.ibb.co/RGC6cRsh/Fit-Artboards-To-Artwork.gif)

## MoveArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MoveArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/moveabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Перемещает все артборды из диапазона по номерам с содержимым по осям X и Y на точное расстояние.

![MoveArtboards](https://i.ibb.co/wrHTpTG/Move-Artboards.gif)

## RenameArtboardAsLayer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsLayer.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsaslyr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переименовывает каждый артборд по имени слоя, в котором есть элемент, лежащий на соответствующем артборде.

![RenameArtboardAsLayer](https://i.ibb.co/fV7rHhVK/Rename-Artboard-As-Layer.gif) 

## RenameArtboardAsSize
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsSize.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsassize) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Добавляет к имени артборда его размеры в единицах измерения документа.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/41686762-artboard-auto-naming-preferences-one-click-artboa) за внедрение этой функции в Иллюстратор.

![RenameArtboardAsSize](https://i.ibb.co/My4pLYFB/Rename-Artboard-As-Size.gif)

## RenameArtboardAsTopObj
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsTopObj.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsasobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переименовывает каждый артборд по имени верхнего незаблокированного объекта, лежащего в его пределах. Если верхний объект — текст, то его содержимое станет именем артборда. 

![RenameArtboardAsTopObj](https://i.ibb.co/3mfd4bFV/Rename-Artboard-As-Top-Obj.gif)

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