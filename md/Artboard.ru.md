![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Artboard | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsfinder) `v0.1.5 — upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsremapper) `v0.2 — upd, 19.02.2024`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#batchrenamer) `v1.5 — upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#duplicateartboardslight) `v0.4.4 — upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#fitartboardstoartwork) `v0.2 — upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#moveartboards) `v0.2.6 — upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardaslayer) `v0.2 — upd, 12.09.2024`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardassize) `v0.4 — upd, 12.09.2024`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardastopobj) `v0.3 — upd, 12.09.2024`

## ArtboardsFinder
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ArtboardsFinder.jsx-FF6900.svg)](https://link.aiscripts.ru/abfinder) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Ищет артборды в документе по имени или размерам и масштабирует выбранные по центру окна. Размеры отображаются в единицах документа. Альбомные, книжные, квадратные артборды выводятся по убыванию размера при поиске по ориентации.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/32321188-artboard-search-function) за внедрение этой функции в Иллюстратор.

![ArtboardsFinder](https://i.ibb.co/VJXKjWQ/artboards-finder.gif)

## ArtboardsRemapper
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ArtboardsRemapper.jsx-FF6900.svg)](https://link.aiscripts.ru/abremap) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Сохраняет имена артбордов в текстовый файл либо переименовывает их из него. Операции с именами происходят в диапазоне указанных индексов, соответствующих номерам из панели Artboards.

![ArtboardsRemapper](https://i.ibb.co/xG8sSNr/Artboards-Remapper.gif)

## BatchRenamer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-BatchRenamer.jsx-FF6900.svg)](https://link.aiscripts.ru/batchren) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Массово переименовывает в документе артборды, слои верхнего уровня и выбранные объекты. Добавляет общий префикс и суффикс к имени. Через Find & Replace заменяется строка в текущих именах.

**Плейсхолдеры** 

* {w} - ширина артборда или выбранного объекта в единицах документа
* {h} - высота артборда или выбранного объекта
* {u} - единицы измерения документа (Document Setup > Units) 
* {nu:0} - автоматическая нумерация от введённого числа и выше
* {nd:0} - нумерация от введённого числа и ниже
* {c} - цветовая модель документа (RGB или CMYK)
* {d} - текущая дата в формате ГГГГММДД
* {fn} - имя файла без расширения
* {n} - текущее имя для замены в Find & Replace

Поле замены поддерживает [символы регулярных выражений](https://proglib.io/p/shpargalka-po-regulyarnym-vyrazheniyam-v-javascript-2022-07-17). Пример: чтобы удалить числа в именах, введите в поле Find `\d` без кавычек, а Replace оставьте пустым. Для замены пробелов на другой символ: в Find введите `\s+`, а в Replace нужный вам символ.

> [!TIP]   
> Если хотите изменить количество строк в высоту, то откройте файл скрипта текстовым редактором и поменяйте CFG `rows: 5` на другое число и его же в `listHeight: 5 * 32`. В CFG `precision: 0` задаётся число десятичных знаков для высоты и ширины артбордов и объектов.   

> [!NOTE]   
> Проголосуйте на [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/43575576-bulk-re-naming-of-layers), [Uservoice #2](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39925396-find-and-replace-text-in-object-name-in-the-layers), [Uservoice #3](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35567803-advanced-rename-tools-for-artboards-with-find-re) за внедрение этой функции в Иллюстратор.

![BatchRenamer](https://i.ibb.co/p2VXbY9/Batch-Renamer.gif)

## DuplicateArtboardsLight
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DuplicateArtboardsLight.jsx-FF6900.svg)](https://link.aiscripts.ru/dupabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Дублирует заданное количество раз выбранный артборд с его содержимым. Платная Pro версия с большим количеством опций доступна на [Buymeacoffee](https://buymeacoffee.com/aiscripts/extras)   

<a href="https://youtu.be/qDH1YRaYMYk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![DuplicateArtboardsLight](https://i.ibb.co/rF92HpV/demo-Duplicate-Artboards-Light.gif)

## FitArtboardsToArtwork
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-FitArtboardsToArtwork.jsx-FF6900.svg)](https://link.aiscripts.ru/fitabstoart) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Масштабирует артборды по размеру видимого незаблокированного контента с отступами.

![FitArtboardsToArtwork](https://i.ibb.co/SJJh5Hc/Fit-Artboards-To-Artwork.gif)

## MoveArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MoveArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/moveabs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Перемещает все артборды из диапазона по номерам с содержимым по осям X и Y на точное расстояние.

![MoveArtboards](https://i.ibb.co/wrHTpTG/Move-Artboards.gif)

## RenameArtboardAsLayer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsLayer.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsaslyr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переименовывает каждый артборд по имени слоя, в котором есть элемент, лежащий на соответствующем артборде.

![RenameArtboardAsLayer](https://i.ibb.co/nQ92khj/Rename-Artboard-As-Layer.gif) 

## RenameArtboardAsSize
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsSize.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsassize) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Добавляет к имени артборда его размеры в единицах измерения документа.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/41686762-artboard-auto-naming-preferences-one-click-artboa) за внедрение этой функции в Иллюстратор.

![RenameArtboardAsSize](https://i.ibb.co/GR488JH/Rename-Artboard-As-Size.gif)

## RenameArtboardAsTopObj
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RenameArtboardAsTopObj.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsasobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переименовывает каждый артборд по имени верхнего незаблокированного объекта, лежащего в его пределах. Если верхний объект — текст, то его содержимое станет именем артборда. 

![RenameArtboardAsTopObj](https://i.ibb.co/WPmf14B/Rename-Artboard-As-Top-Obj.gif)

## Поддержка
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] `USD`, [Tinkoff] `RUB`, [ЮMoney] `RUB`, [Donatty] `RUB`, [DonatePay] `RUB`. Спасибо.   

[Buymeacoffee]: https://www.buymeacoffee.com/aiscripts
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/aiscripts">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
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