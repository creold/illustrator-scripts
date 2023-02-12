![header](https://i.ibb.co/mF018gV/emblem.png)
# Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-25k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

*Instructions in other languages: [English](README.md), [Русский](README.ru.md)*

## Hi
This is a collection of JS scripts for Adobe Illustrator. All scripts created by me, sometimes using parts of other authors’ code.

The descriptions for each file can be found in the file’s header text. Test environment: Illustrator CS6, CC 2022, 2023 (Windows), CC 2018-2023 (Mac OS).   

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

![drag](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Variant 3 — Use extensions
I recommend the [Scripshon Trees] or [LAScripts] panel. In it you can specify which folder your script files are stored in.

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladygin.pro/products/lascripts/

> **Warning**   
> To run scripts via the F1-F15 hotkeys, users add them to the Actions panel. If another action is running inside the script, Illustrator will freeze. How do you check it? Open the script in a text editor, if you find `app.doScript()` in the code, it is using an action. This is in all versions from CS6 to CC 2023 on Mac and Windows.

## Donate
You can support my work on new scripts via [Buymeacoffee], [FanTalks], [Tinkoff], [ЮMoney], [Donatty], [DonatePay].   

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

## Categories
Click the category name to learn more about the scripts in the selected category.   

[![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

### [Artboard](md/Artboard.md)  

* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsfinder) `upd, 22.12.2022`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#batchrenamer) `upd, 13.02.2023`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#duplicateartboardslight) `upd, 22.12.2022`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#fitartboardstoartwork) `upd, 22.12.2022`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#moveartboards) `upd, 22.12.2022`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardaslayer) `(upd, 14.09.2022)`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardassize) `upd, 22.12.2022`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardastopobj) `(upd, 14.09.2022)`

### [Color](md/Color.md)  

* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `(new, 27.03.2022)`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `(new, 18.04.2022)`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `(upd, 14.09.2022)`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `(upd, 30.09.2022)`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops)
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#strokecolorfromfill) `upd, 14.10.2022`

### [Draw](md/Draw.md) 

* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#numeratespoints) `upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#randomscribble) `upd, 14.10.2022`

### [Export](md/Export.md)  

* [Export selection as AI](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#export-selection-as-ai) `(upd, 06.10.2022)`
* [ExportToDXF](https://github.com/creold/illustrator-scripts/blob/master/md/Export.md#exporttodxf) `(upd, 01.08.2022)`

### [Group | Mask](md/Group.md)  

* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#centerclipstoartboards)
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extungroup)
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#movetogroup) `(upd, 14.09.2022)`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#trimmasks)

### [Item](md/Item.md)  

* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#batchtrace) `(new, 15.08.2022)`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#duplicatetoartboards) `(upd, 14.09.2022)`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards) `upd, 22.12.2022`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#makeenvelopeswithtops)
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#mirrormove) `(upd, 01.08.2022)`
* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rememberselectionlayers) `(upd, 26.02.2022)`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#renameitems) `(upd, 06.10.2022)`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rescale) `upd, 22.12.2022`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizeonlargerside) `upd, 22.12.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizetosize) `upd, 22.12.2022`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#roundcoordinates) `upd, 22.12.2022`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#sortlayeritems) `(new, 29.08.2022)`

### [Path](md/Path.md)  

* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#points-move-random) `upd, 22.12.2022`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#splitpath) `(upd, 10.11.2022)`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#subtracttoppath) `(new, 03.04.2022)`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#trimopenends) `(new, 27.01.2023)`

### [Select](md/Select.md)  

* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#named-items-finder) `(upd, 14.09.2022)`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectbyswatches) `(upd, 14.09.2022)`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectpointsbytype) `(upd, 14.09.2022)`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectrotateditems) `(new, 22.06.2022)`

### [Style](md/Style.md)  

* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#averagestrokeswidth) `(new, 07.02.2023)`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#changeopacity) `(upd, 01.08.2022)`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#grayscaletoopacity)
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#maketrappingstroke) `(new, 14.12.2022)`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#opacitymaskclip)
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#randomstrokewidth) `upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `upd, 14.10.2022`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `upd, 14.10.2022`

### [Text](md/Text.md)  

* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#makenumberssequence) `(upd, 13.01.2023)`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#replaceformattedtext) `(new, 29.12.2022)`

### [Utility](md/Utility.md)  

* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#checkpixelperfect) `(new, 03.02.2022)`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#fileversioninformer)
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#objectscounter)
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#savealldocs)
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.md#syncglobalcolorsnames)

### [View](md/View.md)  

* [Zoom And Center](https://github.com/creold/illustrator-scripts/blob/master/md/View.md#zoom-and-center) `(upd, 14.09.2022)`

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
