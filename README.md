![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Instructions in other languages: [English](README.md), [Русский](README.ru.md)*

## Hi
This is a collection of JS scripts for Adobe Illustrator. All scripts created by me, sometimes using parts of other authors’ code. The [Github Gist](https://gist.github.com/creold) contains the small scripts that are not included in the main collection.

The descriptions for each file can be found in the file’s header text. Test environment: Illustrator CS6, CC 2019-2025 (Windows), CC 2019-2025 (Mac OS).   

## How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## How to run scripts

#### Variant 1 — Install 

1. [Download archive] and unzip. All scripts are in the folder `jsx`
2. Place `<script_name>.jsx` in the Illustrator Scripts folder:
	- OS X: `/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts`
	- Windows (32 bit): `C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\`
	- Windows (64 bit): `C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\`
	- RU lang: `C:\Program Files\Adobe\Adobe Illustrator [версия]\Стили\ru_RU\Сценарии\`
3. Restart Illustrator
4. Scripts will be available in File → Scripts.

[Download archive]: https://bit.ly/2M0j95N

#### Variant 2 — Drag & Drop
Drag and drop the script file (JS or JSX) onto the tabs of Illustrator documents. If you drag it to the area of the open document, the script may not work correctly (Adobe bug).  

![Drag-n-drop to AI](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Variant 3 — Use extensions
I recommend the [Scripshon Trees] or [LAScripts] panel. In it you can specify which folder your script files are stored in.

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladyginpro.ru/products/lascripts/

#### Variant 4 — Utilities
You can use them to create macros to run scripts with hotkeys.

1. [SPAi](https://tama-san.com/spai/) (Mac OS, free)
2. [Hammerspoon](https://www.hammerspoon.org/) (Mac OS, free)
3. [Keyboard Maestro](https://www.keyboardmaestro.com/main/) (Mac OS, paid)
4. [BetterTouchTool](https://folivora.ai/) (Mac OS, paid)
5. [AutoHotkey](https://www.autohotkey.com/) (Windows, free)

> [!WARNING]   
> To run scripts via the F1-F15 hotkeys, users add them to the Actions panel. If another action is running inside the script, Illustrator will freeze. How do you check it? Open the script in a text editor, if you find `app.doScript()` in the code, it is using an action. This is in all versions from CS6 to CC 2025 on Mac and Windows.

## Donate
Many scripts are free to download thanks to user support. Help me to develop new scripts and update existing ones by supporting my work with any amount via [Buymeacoffee] `USD`, [ЮMoney] `RUB`, [Tinkoff] `RUB`, [Donatty] `RUB`, [DonatePay] `RUB`. Thank you.

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

## Paid scripts
* [AddObjectGuides](https://buymeacoffee.com/aiscripts/e/384446) — script draws guidelines around selected objects with custom length.
* [BentoGrid](https://www.buymeacoffee.com/aiscripts/e/341609) — script generates random bento grids with different cell proportions.
* [RandomColors](https://www.buymeacoffee.com/aiscripts/e/332147) — script generates random fill and stroke colors for selected objects and editable text.
* [ExportSequence](https://www.buymeacoffee.com/aiscripts/e/230926) — script for toggle visibility of numbered objects in selected groups and exports document as sequence to PNGs or JPGs.
* [ColorToner](https://www.buymeacoffee.com/aiscripts/e/231463) — script for generating tints, shades, and tones from base colors.
* [GradientBlender](https://www.buymeacoffee.com/aiscripts/e/231606) — script to make gradients more accurate, smooth.
* [Ai2Ae](https://www.buymeacoffee.com/aiscripts/e/231609) — script for prepare Adobe Illustrator Layers for import into Adobe After Effects.
* [ArtboardsFromCSV](https://www.buymeacoffee.com/aiscripts/e/231618) — script for batch creation of artboards with names and dimensions defined in a CSV table.
* [Duplicate Artboards Pro](https://www.buymeacoffee.com/aiscripts/e/231621) — script for copying the selected Artboard with or without his Artwork.
* [HighlightText](https://www.buymeacoffee.com/aiscripts/e/231626) — script for adding highlighting strokes based on text lines.
* [ImportImagesByName](https://www.buymeacoffee.com/aiscripts/e/231629) — script for imports images from the specified folder by names from the contents of the selected text objects.

## Categories
Click the category name to learn more about the scripts in the selected category.   

[![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.md)  

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsfinder) `v0.1.5 — upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsremapper) `v0.2 — upd, 19.02.2024`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#batchrenamer) `v1.5 — upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#duplicateartboardslight) `v0.4.4 — upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#fitartboardstoartwork) `v0.2 — upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#moveartboards) `v0.2.6 — upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardaslayer) `v0.2 — upd, 12.09.2024`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardassize) `v0.4 — upd, 12.09.2024`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardastopobj) `v0.3 — upd, 12.09.2024`

### [Color](md/Color.md)  

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `v0.1 — 27.03.2022`
* [BeautifySwatchNames](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#beautifyswatchnames) `v0.1 — new, 31.10.2024`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `v0.1 — 18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorcorrector) `v0.1.2 — upd, 14.02.2025`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorgroupreplacer) `v0.1 — 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#contrastchecker) `v0.1.1 — upd,23.07.2024`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `v0.1.4 — upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `v0.4.2 — upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient) `v0.1 — 10.2021`
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops) `v0.1 — 08.2021`
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#matchcolors) `v0.2.1 — upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#removegradientstops) `v0.1 — 09.2021`
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#reversegradientcolor) `v0.1 — 08.2020`
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#strokecolorfromfill) `v0.4.1 — upd, 12.02.2024`

### [Draw](md/Draw.md) 

* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#drawpathbyselectedpoints) `v0.1 — 10.03.2023`
* [DrawRectanglesByArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#drawrectanglesbyartboards) `v0.2 — new, 29.07.2024`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#numeratespoints) `v0.3.3 — upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#randomscribble) `v0.1.3 — upd, 09.02.2024`
* [TriangleMaker](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#trianglemaker) `v0.2 — new, 31.03.2025`

### [Export](md/Export.md)  

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#export-selection-as-ai) `v0.2 — 06.10.2022`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#exporttodxf) `v0.1.1 — upd, 04.05.2023`

### [Group | Mask](md/Group.md)  

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#centerclipstoartboards) `v0.1 — 05.2021`
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extractfromgroup) `v0.1 — new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extungroup) `v1.2.1`
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#groupartboardobjects) `v0.2 — new, 11.06.2024`
* [MaskArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#maskartboards) `v0.1 — new, 29.07.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#movetogroup) `v0.1.2 — upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#trimmasks) `v0.3`

### [Item](md/Item.md)  

* [AlignToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#aligntoartboards) `v0.2 — upd, 06.11.2023`
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#batchtrace) `v0.3 — upd, 07.06.2023`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#duplicatetoartboards) `v0.1.3 — upd, 09.02.2024`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards) `v0.3.4 — upd, 22.04.2024`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#makeenvelopeswithtops) `v0.1 — 09.2021`
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#mirrormove) `v0.1.1 — upd, 07.08.2024`
* [PlaceSymbols](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#placesymbols) `v0.1 — new, 16.08.2024`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#renameitems) `v1.7 — upd, 20.05.2024`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rescale) `v0.3.4 — upd, 09.02.2024`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizeonlargerside) `v0.2.2 — upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizetosize) `v0.9.1 — upd, 09.02.2024`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#roundcoordinates) `v0.4.2 — upd, 22.12.2022`
* [ShowObjectNames](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#showobjectnames) `v0.4 — upd, 20.03.2025`
* [SwapObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#swapobjects) `v0.2 — upd, 24.03.2024`

### [Layer](md/Layer.md)  

* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#rememberselectionlayers) `v0.3 — 26.02.2022`
* [RenameLayerAsText](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#renamelayerastext) `v0.1.1 — upd, 09.02.2024`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Layer.md#sortlayeritems) `v0.1 — 29.08.2022`

### [Path](md/Path.md)  

* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#dividebottompath) `v0.1 — 22.02.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#setpointscoordinates) `v0.1.1 — upd, 09.02.2024`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#points-move-random) `v0.4.5 — upd, 09.02.2024`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#splitpath) `v1.3.1 — upd, 09.02.2024`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#subtracttoppath) `v0.2 — 03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#trimopenends) `v0.1.1 — upd, 22.02.2023`

### [Select](md/Select.md)  

* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#cornersselector) `v0.1 — 21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#named-items-finder) `v0.2.3 — upd, 09.02.2024`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectartboardobjects) `v0.1.1 — upd, 13.01.2025`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectbyswatches) `v0.3.2 — upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectonlypoints) `v0.3.2`
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectpointsbytype) `v2.1.4 — upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectrotateditems) `v0.1 — 22.06.2022`

### [Style](md/Style.md)  

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#averagestrokeswidth) `v0.1 — 07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#changeopacity) `v0.1.2 — upd, 09.02.2024`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#grayscaletoopacity) `v0.1`
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#maketrappingstroke) `v0.1.1 — upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#opacitymaskclip) `v0.3 — upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#randomstrokewidth) `v0.1.2 — upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `v0.3 — upd, 23.07.2024`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `v0.3 — upd, 23.07.2024`

### [Text](md/Text.md)  

* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#aligntextbaseline) `v0.1.1 — upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#makenumberssequence) `v0.5 — upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#multiedittext) `v0.3 — upd, 14.02.2025`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#replaceformattedtext) `v0.1 — 29.12.2022`

### [Utility](md/Utility.md)  

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#checkpixelperfect) `v0.1 — 03.02.2022`
* [DocumentSwitcher](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#documentswitcher) `v0.1 — new, 28.08.2024`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#fileversioninformer) `v0.1 — 12.2017`
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#objectscounter) `v0.1 — 08.2020`
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#savealldocs) `v0.1 — upd, 03.2023`
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#syncglobalcolorsnames) `v0.1 — 04.2021`

### [View](md/View.md)  

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.md#zoom-and-center) `v1.3 — upd, 03.01.2025`

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
