![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-43k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Инструкция на других языках: [English](README.md), [Русский](README.ru.md)*

## 👨‍💻 Привет
Это коллекция авторских скриптов для Adobe Illustrator. Небольшие скрипты, не вошедшие в основную коллекцию, выкладываю на [Github Gist](https://gist.github.com/creold).

Описание каждого скрипта также находится внутри его файла. Тестировалось в Illustrator CS6, CC 2019-2024 (Windows), CC 2019-2024 (Mac OS). 

## Как скачать один скрипт
1. В описании скрипта нажмите кнопку ![Direct](https://img.shields.io/badge/Прямая%20ссылка-000000.svg).
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

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
> Чтобы запускать скрипты через горячие клавиши F1-F15, их добавляют в панель Actions (Операции). Если внутри скрипта выполняется другой экшен, то Иллюстратор зависнет. Как проверить? Откройте в текстовом редакторе скрипт, если в коде найдете `app.doScript()`, то он использует экшен. Это во всех версиях с CS6 по CC 2023 на Мак и Виндовс.

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
* [ExportSequence](https://www.buymeacoffee.com/aiscripts/e/230926) - переключает пронумерованные объекты в выбранных группах и экспортирует активный артборд в виде последовательных PNG или JPG файлов
* [ColorToner](https://www.buymeacoffee.com/aiscripts/e/231463) — скрипт для генерации светлых оттенков, теней и тонов исходных цветов
* [GradientBlender](https://www.buymeacoffee.com/aiscripts/e/231606) — скрипт для создания аккуратных переходов цветов в градиентах
* [Ai2Ae](https://www.buymeacoffee.com/aiscripts/e/231609) — скрипт раскладывает объекты по слоям для импорта в After Effects
* [ArtboardsFromCSV](https://www.buymeacoffee.com/aiscripts/e/231618) — скрипт пакетно создаёт именованные артборды с размерами, заданными в CSV таблице
* [Duplicate Artboards Pro](https://www.buymeacoffee.com/aiscripts/e/231621) — скрипт создаёт заданное количество копий артбордов
* [HighlightText](https://www.buymeacoffee.com/aiscripts/e/231626) — скрипт создаёт подчёркивание строк выбранных текстовых объектов
* [ImportImagesByName](https://www.buymeacoffee.com/aiscripts/e/231629) — скрипт импортирует в документ изображения из папки по имени, указанному в текстовых фреймах

## Категории
Нажмите на название категории, чтобы перейти к описанию и демонстрациям её скриптов.   

[![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.ru.md)  
Скрипты для создания и управления артбордами

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsfinder) `upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsremapper) `upd, 19.02.2024`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#batchrenamer) `upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#duplicateartboardslight) `upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#fitartboardstoartwork) `upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#moveartboards) `upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardaslayer) `upd, 09.02.2024`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardassize) `upd, 05.01.2024`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardastopobj) `upd, 09.02.2024`

### [Color](md/Color.ru.md)  
Скрипты для работы с цветом объектов

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#averagecolors) `27.03.2022`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorblindsimulator) `18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorcorrector) `new, 21.06.2024`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorgroupreplacer) `08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#contrastchecker) `07.09.2023`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#converttogradient) `upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclecolors) `upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#distributegradientstops)
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#matchcolors) `upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#strokecolorfromfill) `upd, 12.02.2024`

### [Draw](md/Draw.ru.md) 
Скрипты, которые что-либо рисуют

* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#drawpathbyselectedpoints) `10.03.2023`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#numeratespoints) `upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#randomscribble) `upd, 09.02.2024`

### [Export](md/Export.ru.md)  
Скрипты для экспорта документов

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#export-selection-as-ai) `upd, 06.10.2022`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#exporttodxf) `upd, 04.05.2023`

### [Group | Mask](md/Group.ru.md)  
Скрипты для создания и управления группами, обтравочными масками

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#centerclipstoartboards)
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extractfromgroup) `new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extungroup)
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#groupartboardobjects) `new, 11.06.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#movetogroup) `upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#trimmasks)

### [Item](md/Item.ru.md)  
Скрипты, управляющие выбранными объектами
 
* [AlignToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#aligntoartboards) `upd, 06.11.2023`
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#batchtrace) `upd, 07.06.2023`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#duplicatetoartboards) `upd, 09.02.2024`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#fitselectiontoartboards) `upd, 22.04.2024`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#makeenvelopeswithtops)
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#mirrormove) `upd, 01.08.2022`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#renameitems) `upd, 20.05.2024`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#rescale) `upd, 09.02.2024`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizeonlargerside) `upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizetosize) `upd, 09.02.2024`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#roundcoordinates) `upd, 22.12.2022`
* [SwapObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#swapobjects) `upd, 24.03.2024`

### [Layer](md/Layer.ru.md)  
Скрипты для работы со слоями

* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#rememberselectionlayers) `upd, 26.02.2022`
* [RenameLayerAsText](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#renamelayerastext) `upd, 09.02.2024`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.ru.md#sortlayeritems) `29.08.2022`

### [Path](md/Path.ru.md)  
Скрипты, изменяющие пути

* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#dividebottompath) `22.02.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#setpointscoordinates) `upd, 09.02.2024`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#points-move-random) `upd, 09.02.2024`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#splitpath) `upd, 09.02.2024`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#subtracttoppath) `03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#trimopenends) `upd, 22.02.2023`

### [Select](md/Select.ru.md)  
Скрипты для выбора объектов в документе

* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#cornersselector) `21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#named-items-finder) `upd, 09.02.2024`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `21.02.2022`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectbyswatches) `upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectpointsbytype) `upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectrotateditems) `22.06.2022`

### [Style](md/Style.ru.md)  
Скрипты, стилизующие объекты

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#averagestrokeswidth) `07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#changeopacity) `upd, 09.02.2024`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#grayscaletoopacity)
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#maketrappingstroke) `upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#opacitymaskclip) `upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#randomstrokewidth) `upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `upd, 23.07.2024`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `upd, 23.07.2024`

### [Text](md/Text.ru.md)  
Скрипты для работы с текстовыми объектами

* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#aligntextbaseline) `upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#makenumberssequence) `upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#multiedittext) `upd, 12.04.2024`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#replaceformattedtext) `29.12.2022`

### [Utility](md/Utility.ru.md)  
Вспомогательные скрипты

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#checkpixelperfect) `03.02.2022`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#fileversioninformer)
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#objectscounter)
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#savealldocs)
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#syncglobalcolorsnames)

### [View](md/View.ru.md)  
Скрипты для просмотра документа

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.ru.md#zoom-and-center) `upd, 09.02.2024`

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