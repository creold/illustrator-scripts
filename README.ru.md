![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Инструкция на других языках: [English](README.md), [Русский](README.ru.md)*

## 👨‍💻 Привет
Это коллекция авторских скриптов для Adobe Illustrator. Небольшие скрипты, не вошедшие в основную коллекцию, выкладываю на [Github Gist](https://gist.github.com/creold).

Описание каждого скрипта также находится внутри его файла. Тестировалось в Illustrator CS6, CC 2019-2025 (Windows), CC 2019-2025 (Mac OS). 

## Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Как запускать скрипты

#### Вариант 1 — Установка 

1. [Скачайте архив] и распакуйте. Все скрипты находятся в папке `jsx`
2. Поместите `<имя_скрипта>.jsx` в папку скриптов Adobe Illustrator:
	- OS X: `/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts`
	- Windows (32 bit): `C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\`
	- Windows (64 bit): `C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\`
	- Русскоязычная версия: `C:\Program Files\Adobe\Adobe Illustrator [версия]\Стили\ru_RU\Сценарии\`
3. Перезапустите программу
4. Скрипты станут доступны в меню File → Scripts

[Скачайте архив]: https://bit.ly/2M0j95N 

#### Вариант 2 — Drag & Drop
Перетащите файл скрипта на панель с вкладками открытых документов Иллюстратора. Если же перетащить в центр открытого документа, то скрипт может сработать с ошибками (баг Adobe).  

![Drag-n-drop to AI](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Вариант 3 — Расширения (Extension)
Если часто приходится запускать скрипты, то чтобы не открывать постоянно меню, можно установить бесплатные панели [Scripshon Trees] или [LAScripts].  

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladyginpro.ru/products/lascripts/

#### Вариант 4 — Утилиты
С их помощью можно запрограммировать макросы запуска скриптов по горячим клавишам.

1. [SPAi](https://tama-san.com/spai/) (Mac OS, бесплатно)
2. [Hammerspoon](https://www.hammerspoon.org/) (Mac OS, бесплатно)
3. [Keyboard Maestro](https://www.keyboardmaestro.com/main/) (Mac OS, платно)
4. [BetterTouchTool](https://folivora.ai/) (Mac OS, платно)
5. [AutoHotkey](https://www.autohotkey.com/) (Windows, бесплатно)

> [!WARNING]   
> Чтобы запускать скрипты через горячие клавиши F1-F15, их добавляют в панель Actions (Операции). Если внутри скрипта выполняется другой экшен, то Иллюстратор зависнет. Как проверить? Откройте в текстовом редакторе скрипт, если в коде найдете `app.doScript()`, то он использует экшен. Это во всех версиях с CS6 по CC 2025 на Мак и Виндовс.

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

## Платные скрипты
* [AddObjectGuides](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1668%3FcategoryId=5705) — генерирует направляющие для объектов: горизонтальные, вертикальные, диагональные, а также для центров объектов.
* [BentoGrid](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1667%3FcategoryId=5705) — генерирует случайные сетки в стиле Bento UI с ячейками разных пропорций.
* [RandomColors](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1666%3FcategoryId=5705) — генерирует случайные цвета для заливок и обводок выбранных объектов или текстов.
* [ExportSequence](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1665%3FcategoryId=5705) - переключает пронумерованные объекты в выбранных группах и экспортирует активный артборд в виде последовательных PNG или JPG файлов
* [ColorToner](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1653%3FcategoryId=5705) — скрипт для генерации светлых оттенков, теней и тонов исходных цветов
* [GradientBlender](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1661%3FcategoryId=5705) — скрипт для создания аккуратных переходов цветов в градиентах
* [Ai2Ae](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1659%3FcategoryId=5705) — скрипт раскладывает объекты по слоям для импорта в After Effects
* [ArtboardsFromCSV](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1662%3FcategoryId=5705) — скрипт пакетно создаёт именованные артборды с размерами, заданными в CSV таблице
* [Duplicate Artboards Pro](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1660%3FcategoryId=5705) — скрипт создаёт заданное количество копий артбордов
* [HighlightText](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1663%3FcategoryId=5705) — скрипт создаёт подчёркивание строк выбранных текстовых объектов
* [ImportImagesByName](https://aiscripts.robo.market/#modalProductsByCategories_2_5705_1664%3FcategoryId=5705) — скрипт импортирует в документ изображения из папки по имени, указанному в текстовых фреймах

## Категории
Нажмите на название категории, чтобы перейти к описанию и демонстрациям её скриптов.   

[![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.ru.md)  
Скрипты для создания и управления артбордами

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsfinder) `v0.1.5 — upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsremapper) `v0.2 — upd, 19.02.2024`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#batchrenamer) `v1.5 — upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#duplicateartboardslight) `v0.4.4 — upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#fitartboardstoartwork) `v0.2 — upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#moveartboards) `v0.2.6 — upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardaslayer) `v0.3 — upd, 18.04.2025`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardassize) `v0.5 — upd, 18.04.2025`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardastopobj) `v0.4 — upd, 18.04.2025`

### [Color](md/Color.ru.md)  
Скрипты для работы с цветом объектов

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#averagecolors) `v0.1 — 27.03.2022`
* [BeautifySwatchNames](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#beautifyswatchnames) `v0.1 — new, 31.10.2024`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorblindsimulator) `v0.1 — 18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorcorrector) `v0.1.2 — upd, 14.02.2025`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorgroupreplacer) `v0.1 — 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#contrastchecker) `v0.1.1 — upd, 23.07.2024`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#converttogradient) `v0.1.4 — upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclecolors) `v0.4.2 — upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclegradient) `v0.1 — 10.2021`
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#distributegradientstops) `v0.1 — 08.2021`
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#matchcolors) `v0.2.1 — upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#removegradientstops) `v0.1 — 09.2021`
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#reversegradientcolor) `v0.1 — 08.2020`
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#strokecolorfromfill) `v0.4.1 — upd, 12.02.2024`

### [Draw](md/Draw.ru.md) 
Скрипты, которые что-либо рисуют

* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#drawpathbyselectedpoints) `v0.1 — 10.03.2023`
* [DrawRectanglesByArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#drawrectanglesbyartboards) `v0.2 — new, 29.07.2024`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#numeratespoints) `v0.3.3 — upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#randomscribble) `v0.1.3 — upd, 09.02.2024`
* [TriangleMaker](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#trianglemaker) `v0.2 — new, 31.03.2025`

### [Export](md/Export.ru.md)  
Скрипты для экспорта документов

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#export-selection-as-ai) `v0.2 — 06.10.2022`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#exporttodxf) `v0.1.1 — upd, 04.05.2023`

### [Group | Mask](md/Group.ru.md)  
Скрипты для создания и управления группами, обтравочными масками

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#centerclipstoartboards)  `v0.1 — 05.2021`
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extractfromgroup) `v0.1 — new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extungroup) `v1.2.1`
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#groupartboardobjects) `v0.2 — new, 11.06.2024`
* [MaskArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#maskartboards) `v0.1 — new, 29.07.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#movetogroup) `v0.1.2 — upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#trimmasks) `v0.3`

### [Item](md/Item.ru.md)  
Скрипты, управляющие выбранными объектами
 
* [AlignToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#aligntoartboards) `v0.2 — upd, 06.11.2023`
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#batchtrace) `v0.3 — upd, 07.06.2023`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#duplicatetoartboards) `v0.1.3 — upd, 09.02.2024`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#fitselectiontoartboards) `v0.3.4 — upd, 22.04.2024`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#makeenvelopeswithtops) `v0.1 — 09.2021`
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#mirrormove) `v0.1.1 — upd, 07.08.2024`
* [PlaceSymbols](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#placesymbols) `v0.1 — new, 16.08.2024`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#renameitems) `v1.7 — upd, 20.05.2024`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#rescale) `v0.3.4 — upd, 09.02.2024`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizeonlargerside) `v0.2.2 — upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizetosize) `v0.9.1 — upd, 09.02.2024`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#roundcoordinates) `v0.4.2 — upd, 22.12.2022`
* [ShowObjectNames](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#showobjectnames) `v0.4 — upd, 20.03.2025`
* [SwapObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#swapobjects) `v0.2 — upd, 24.03.2024`

### [Layer](md/Layer.ru.md)  
Скрипты для работы со слоями

* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#rememberselectionlayers) `v0.3 — 26.02.2022`
* [RenameLayerAsText](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#renamelayerastext) `v0.1.1 — upd, 09.02.2024`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#sortlayeritems) `v0.1 — 29.08.2022`

### [Path](md/Path.ru.md)  
Скрипты, изменяющие пути

* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#dividebottompath) `v0.1 — 22.02.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#setpointscoordinates) `v0.1.1 — upd, 09.02.2024`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#points-move-random) `v0.4.5 — upd, 09.02.2024`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#splitpath) `v1.3.1 — upd, 09.02.2024`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#subtracttoppath) `v0.2 — 03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#trimopenends) `v0.1.1 — upd, 22.02.2023`

### [Select](md/Select.ru.md)  
Скрипты для выбора объектов в документе

* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#cornersselector) `v0.1 — 21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#named-items-finder) `v0.3 — upd, 10.04.2025`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectartboardobjects) `v0.1.1 — upd, 13.01.2025`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectbyswatches) `v0.3.2 — upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectonlypoints) `v0.3.2`
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectpointsbytype) `v2.1.4 — upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectrotateditems) `v0.1 — 22.06.2022`

### [Style](md/Style.ru.md)  
Скрипты, стилизующие объекты

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#averagestrokeswidth) `v0.1 — 07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#changeopacity) `v0.1.2 — upd, 09.02.2024`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#grayscaletoopacity) `v0.1`
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#maketrappingstroke) `v0.1.1 — upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#opacitymaskclip) `v0.3 — upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#randomstrokewidth) `v0.1.2 — upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `v0.3 — upd, 23.07.2024`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `v0.3 — upd, 23.07.2024`

### [Text](md/Text.ru.md)  
Скрипты для работы с текстовыми объектами

* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#aligntextbaseline) `v0.1.1 — upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#makenumberssequence) `v0.5 — upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#multiedittext) `v0.3 — upd, 14.02.2025`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#replaceformattedtext) `v0.1 — 29.12.2022`

### [Utility](md/Utility.ru.md)  
Вспомогательные скрипты

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#checkpixelperfect) `v0.1 — 03.02.2022`
* [DocumentSwitcher](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#documentswitcher) `v0.1 — new, 28.08.2024`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#fileversioninformer) `v0.1 — 12.2017`
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#objectscounter) `v0.1 — 08.2020`
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#savealldocs) `v0.1 — upd, 03.2023`
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#syncglobalcolorsnames) `v0.1 — 04.2021`

### [View](md/View.ru.md)  
Скрипты для просмотра документа

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.ru.md#zoom-and-center) `v1.3 — upd, 03.01.2025`

## Отзывы
* *I am very thankful for such a nice and useful scripts.
It makes my life easy and more productive* - Rizwan Abuzar
* *You are a hero. Thank you for all your hard work improving illustrator so it saves countless hours for people worldwide via your scripts.* - Nitcho
* *Sergey, these scripts of yours are great* — Terry Foxx   
* *Wow. I just installed and successfully tested. Outstanding work!!!* — Zak Lay
* *Попробовал ваш скрипт для экспорта выбранных объектов в отдельный Ai, работает замечательно* — Дмитрий
* *Я просмотрел вашу статью. Полезные скрипты!* — Асхат Гиляхов
* *Спасибо за такие замечательные скрипты* — Олег Зубаилов
* *Очень мощные и удобные в использовании, покрывают множество потребностей* — Егор Чистяков
* *I'm a big fan of your scripts. Absolutely amazing work* — David Nightingale
* *You are the best ever script editor. All scripts are amazing and useful for designers and time saver. Thank you for your supporting* — Tuan Hijas Musaffer

Не забывайте поделиться ссылкой со знакомыми дизайнерами 🙂 

## Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## Блог
Советы, трюки и баги при написании скриптов для Adobe Illustrator: [English](https://aiscripts.medium.com), [Русский](https://ais.sergosokin.ru/blog/).

## Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.