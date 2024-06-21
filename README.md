![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-26k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Instructions in other languages: [English](README.md), [Русский](README.ru.md)*

## Hi
This is a collection of JS scripts for Adobe Illustrator. All scripts created by me, sometimes using parts of other authors’ code. The [Github Gist](https://gist.github.com/creold) contains the small scripts that are not included in the main collection.

The descriptions for each file can be found in the file’s header text. Test environment: Illustrator CS6, CC 2019-2024 (Windows), CC 2019-2024 (Mac OS).   

## How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## How to run scripts

#### Variant 1 — Install 

1. [Download archive] and unzip. All scripts are in the folder `jsx`
2. Place `<script_name>.jsx` in the Illustrator Scripts folder:
	- OS X: `/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts`
	- Windows (32 bit): `C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\`
	- Windows (64 bit): `C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\`
	- RU lang: `C:\Program Files\Adobe\Adobe Illustrator [версия]\Стили\ru_RU\Сценарии\`
3. Restart Illustrator

[Download archive]: https://bit.ly/2M0j95N

#### Variant 2 — Drag & Drop
Drag and drop the script file (JS or JSX) onto the tabs of Illustrator documents. If you drag it to the area of the open document, the script may not work correctly (Adobe bug).  

![Drag-n-drop to AI](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Variant 3 — Use extensions
I recommend the [Scripshon Trees] or [LAScripts] panel. In it you can specify which folder your script files are stored in.

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladyginpro.ru/products/lascripts/

> [!WARNING]   
> To run scripts via the F1-F15 hotkeys, users add them to the Actions panel. If another action is running inside the script, Illustrator will freeze. How do you check it? Open the script in a text editor, if you find `app.doScript()` in the code, it is using an action. This is in all versions from CS6 to CC 2023 on Mac and Windows.

## Donate
Many scripts are free to download thanks to user support. Help me to develop new scripts and update existing ones by supporting my work with any amount via [Buymeacoffee] `USD`, [Tinkoff] `RUB`, [ЮMoney] `RUB`, [Donatty] `RUB`, [DonatePay] `RUB`. Thank you.

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

## Paid scripts
* [ExportSequence](https://www.buymeacoffee.com/aiscripts/e/230926) — script for toggle visibility of numbered objects in selected groups and exports document as sequence to PNGs or JPGs.
* [ColorToner](https://www.buymeacoffee.com/aiscripts/e/231463) — script for generating tints, shades, and tones from base colors.
* [GradientBlender](https://www.buymeacoffee.com/aiscripts/e/231606) — script to make gradients more accurate, smooth.
* [Ai2Ae](https://www.buymeacoffee.com/aiscripts/e/231609) — script for prepare Adobe Illustrator Layers for import into Adobe After Effects.
* [ArtboardsFromCSV](https://www.buymeacoffee.com/aiscripts/e/231618) — script for batch creation of artboards with names and dimensions defined in a CSV table.
* [Duplicate Artboards Pro](https://www.buymeacoffee.com/aiscripts/e/231621) —script for copying the selected Artboard with or without his Artwork.
* [HighlightText](https://www.buymeacoffee.com/aiscripts/e/231626) — script for adding highlighting strokes based on text lines.
* [ImportImagesByName](https://www.buymeacoffee.com/aiscripts/e/231629) — script for imports images from the specified folder by names from the contents of the selected text objects.

## Categories
Click the category name to learn more about the scripts in the selected category.   

[![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.md)  

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsfinder) `upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsremapper) `upd, 19.02.2024`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#batchrenamer) `upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#duplicateartboardslight) `upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#fitartboardstoartwork) `upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#moveartboards) `upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardaslayer) `upd, 09.02.2024`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardassize) `upd, 05.01.2024`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardastopobj) `upd, 09.02.2024`

### [Color](md/Color.md)  

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `27.03.2022`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorcorrector) `new, 21.06.2024`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorgroupreplacer) `08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#contrastchecker) `07.09.2023`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops)
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#matchcolors) `upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#strokecolorfromfill) `upd, 12.02.2024`

### [Draw](md/Draw.md) 

* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#drawpathbyselectedpoints) `10.03.2023`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#numeratespoints) `upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#randomscribble) `upd, 09.02.2024`

### [Export](md/Export.md)  

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#export-selection-as-ai) `upd, 06.10.2022`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#exporttodxf) `upd, 04.05.2023`

### [Group | Mask](md/Group.md)  

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#centerclipstoartboards)
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extractfromgroup) `new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extungroup)
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#groupartboardobjects) `new, 11.06.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#movetogroup) `upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#trimmasks)

### [Item](md/Item.md)  

* [AlignToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#aligntoartboards) `upd, 06.11.2023`
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#batchtrace) `upd, 07.06.2023`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#duplicatetoartboards) `upd, 09.02.2024`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards) `upd, 22.04.2024`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#makeenvelopeswithtops)
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#mirrormove) `upd, 01.08.2022`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#renameitems) `upd, 20.05.2024`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rescale) `upd, 09.02.2024`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizeonlargerside) `upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizetosize) `upd, 09.02.2024`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#roundcoordinates) `upd, 22.12.2022`
* [SwapObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#swapobjects) `upd, 24.03.2024`

### [Layer](md/Layer.md)  

* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#rememberselectionlayers) `upd, 26.02.2022`
* [RenameLayerAsText](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#renamelayerastext) `upd, 09.02.2024`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#sortlayeritems) `29.08.2022`

### [Path](md/Path.md)  

* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#dividebottompath) `22.02.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#setpointscoordinates) `upd, 09.02.2024`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#points-move-random) `upd, 09.02.2024`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#splitpath) `upd, 09.02.2024`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#subtracttoppath) `03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#trimopenends) `upd, 22.02.2023`

### [Select](md/Select.md)  

* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#cornersselector) `21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#named-items-finder) `upd, 09.02.2024`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `21.02.2022`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectbyswatches) `upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectpointsbytype) `upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectrotateditems) `22.06.2022`

### [Style](md/Style.md)  

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#averagestrokeswidth) `07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#changeopacity) `upd, 09.02.2024`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#grayscaletoopacity)
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#maketrappingstroke) `upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#opacitymaskclip) `upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#randomstrokewidth) `upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `upd, 14.10.2022`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `upd, 14.10.2022`

### [Text](md/Text.md)  

* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#aligntextbaseline) `upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#makenumberssequence) `upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#multiedittext) `upd, 12.04.2024`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#replaceformattedtext) `29.12.2022`

### [Utility](md/Utility.md)  

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#checkpixelperfect) `03.02.2022`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#fileversioninformer)
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#objectscounter)
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#savealldocs)
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#syncglobalcolorsnames)

### [View](md/View.md)  

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.md#zoom-and-center) `upd, 09.02.2024`

## Testimonials
* *I am very thankful for such a nice and useful scripts.
It makes my life easy and more productive* - Rizwan Abuzar
* *You are a hero. Thank you for all your hard work improving illustrator so it saves countless hours for people worldwide via your scripts* - Nitcho
* *Sergey, these scripts of yours are great* — Terry Foxx   
* *Wow. I just installed and successfully tested. Outstanding work!!!* — Zak Lay
* *Tried your script to export selected objects to separate Ai, works smartly* — Dmitry
* *I looked at your post. Useful scripts!* — Askhat Gilyakhov
* *Thank you for such wonderful scripts* — Oleg Zybailov
* *Very powerful and user-friendly, cover a lot of gaps* — Egor Chistyakov
* *I'm a big fan of your scripts. Absolutely amazing work* — David Nightingale
* *You are the best ever script editor. All scripts are amazing and useful for designers and time saver. Thank you for your supporting* — Tuan Hijas Musaffer

Don't forget sharing link with a friend 🙂 

## Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

## Blog
Tips, tricks and scripts bugs for Adobe Illustrator: [English](https://aiscripts.medium.com), [Русский](https://ais.sergosokin.ru/blog/).

## Contact
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.
