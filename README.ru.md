![header](https://i.ibb.co/mF018gV/emblem.png)
# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-25k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Инструкция на других языках: [English](README.md), [Русский](README.ru.md)*

## 👨‍💻 Привет
Это коллекция авторских скриптов для Adobe Illustrator.

Описание каждого скрипта также находится внутри его файла. Тестировалось в Illustrator CS6, CC 2022, 2023 (Windows), CC 2018-2023 (Mac OS). 

## Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
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

[Скачайте архив]: https://bit.ly/2M0j95N 

#### Вариант 2 — Drag & Drop
Перетащите файл скрипта на панель с вкладками открытых документов Иллюстратора. Если же перетащить в центр открытого документа, то скрипт может сработать с ошибками (баг Adobe).  

![drag](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Вариант 3 — Расширения (Extension)
Если часто приходится запускать скрипты, то чтобы не открывать постоянно меню, можно установить бесплатные панели [Scripshon Trees] или [LAScripts].  

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladygin.pro/products/lascripts/

> **Warning**   
> Чтобы запускать скрипты через горячие клавиши F1-F15, их добавляют в панель Actions (Операции). Если внутри скрипта выполняется другой экшен, то Иллюстратор зависнет. Как проверить? Откройте в текстовом редакторе скрипт, если в коде найдете `app.doScript()`, то он использует экшен. Это во всех версиях с CS6 по CC 2023 на Мак и Виндовс.

## Поддержка
Вы можете поддержать мою работу над новыми скриптами и их распространение любой суммой через [Buymeacoffee], [FanTalks] (иностр. карты), [Tinkoff], [ЮMoney], [Donatty], [DonatePay].   

[Buymeacoffee]: https://www.buymeacoffee.com/osokin
[FanTalks]: https://fantalks.io/r/sergey
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/osokin">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
</a>

<a href="https://fantalks.io/r/sergey">
  <img width="111" height="40" src="https://i.ibb.co/vcds3vF/fantalks-badge.png">
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

## Категории
Нажмите на название категории, чтобы перейти к описанию и демонстрациям её скриптов.   

[![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.ru.md)  
Скрипты для создания и управления артбордами

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#artboardsfinder) `upd, 22.12.2022`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#batchrenamer) `upd, 13.02.2023`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#duplicateartboardslight) `upd, 22.12.2022`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#fitartboardstoartwork) `upd, 22.12.2022`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#moveartboards) `upd, 22.12.2022`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardaslayer) `(upd, 14.09.2022)`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardassize) `upd, 22.12.2022`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.ru.md#renameartboardastopobj) `(upd, 14.09.2022)`

### [Color](md/Color.ru.md)  
Скрипты для работы с цветом объектов

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#averagecolors) `(new, 27.03.2022)`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorblindsimulator) `(new, 18.04.2022)`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#converttogradient) `(upd, 14.09.2022)`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclecolors) `(upd, 30.09.2022)`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#distributegradientstops)
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#strokecolorfromfill) `upd, 14.10.2022`

### [Draw](md/Draw.ru.md) 
Скрипты, которые что-либо рисуют

* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#numeratespoints) `upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#randomscribble) `upd, 14.10.2022`

### [Export](md/Export.ru.md)  
Скрипты для экспорта документов

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#export-selection-as-ai) `(upd, 06.10.2022)`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.ru.md#exporttodxf) `(upd, 01.08.2022)`

### [Group | Mask](md/Group.ru.md)  
Скрипты для создания и управления группами, обтравочными масками

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#centerclipstoartboards)
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#extungroup)
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#movetogroup) `(upd, 14.09.2022)`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.ru.md#trimmasks)

### [Item](md/Item.ru.md)  
Скрипты, управляющие выбранными объектами
 
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#batchtrace) `(new, 15.08.2022)`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#duplicatetoartboards) `(upd, 14.09.2022)`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#fitselectiontoartboards) `upd, 22.12.2022`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#makeenvelopeswithtops)
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#mirrormove) `(upd, 01.08.2022)`
* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#rememberselectionlayers) `(upd, 26.02.2022)`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#renameitems) `(upd, 06.10.2022)`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#rescale) `upd, 22.12.2022`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizeonlargerside) `upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#resizetosize) `upd, 22.12.2022`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#roundcoordinates) `upd, 22.12.2022`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.ru.md#sortlayeritems) `(new, 29.08.2022)`

### [Path](md/Path.ru.md)  
Скрипты, изменяющие пути

* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#points-move-random) `upd, 22.12.2022`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#splitpath) `(upd, 10.11.2022)`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#subtracttoppath) `(new, 03.04.2022)`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#trimopenends) `(new, 27.01.2023)`

### [Select](md/Select.ru.md)  
Скрипты для выбора объектов в документе

* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#named-items-finder) `(upd, 14.09.2022)`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectbyswatches) `(upd, 14.09.2022)`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectpointsbytype) `(upd, 14.09.2022)`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectrotateditems) `(new, 22.06.2022)`

### [Style](md/Style.ru.md)  
Скрипты, стилизующие объекты

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#averagestrokeswidth) `(new, 07.02.2023)`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#changeopacity) `(upd, 01.08.2022)`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#grayscaletoopacity)
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#maketrappingstroke) `(new, 14.12.2022)`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#opacitymaskclip)
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#randomstrokewidth) `upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `upd, 14.10.2022`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `upd, 14.10.2022`

### [Text](md/Text.ru.md)  
Скрипты для работы с текстовыми объектами

* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#makenumberssequence) `(upd, 13.01.2023)`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#replaceformattedtext) `(new, 29.12.2022)`

### [Utility](md/Utility.ru.md)  
Вспомогательные скрипты

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#checkpixelperfect) `(new, 03.02.2022)`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#fileversioninformer)
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#objectscounter)
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#savealldocs)
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#syncglobalcolorsnames)

### [View](md/View.ru.md)  
Скрипты для просмотра документа

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.ru.md#zoom-and-center) `(upd, 14.09.2022)`

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