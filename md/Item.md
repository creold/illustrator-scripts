![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Item | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
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

## AlignToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-AlignToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/alitoabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script aligns selected objects to their parent artboards or aligns the contents of all artboards in the document. If the object is on multiple artboards, the script checks which artboard has the center of the object and aligns to it. If the center of the object is outside the artboards, it aligns to the first artboard.

> [!WARNING]   
> The script runs slower the more artboards you have with content and objects selected for alignment.

![AlignToArtboards](https://i.ibb.co/XFQSmvR/Align-To-Artboards.gif)

## BatchTrace
[![Direct](https://img.shields.io/badge/Direct%20Link-BatchTrace.jsx-FF6900.svg)](https://link.aiscripts.ru/bchtr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Batch tracing of selected placed and embedded images in a document or all images from a user-selected folder. The native menu `Object → Image Trace → Make` is available for one selected image. Recording the action will not help, because the trace preset are not saved in it. In Adobe Bridge, only the image folder can be traced: `Tools → Illustrator → Image Trace`. 

Tweaks in the script code:

* `CFG.extList` — a list of extensions to be processed from the folder. You can add your own or remove some to skip the script;
* `CFG.isReverse` — reverse the order of the presets list (true), the user presets will be at the top.

> [!IMPORTANT]   
> The speed of the script depends on the specifications of your PC, the tracing preset and the amount of images.   

> [!WARNING]   
Adobe scripts incorrectly apply the Colors value from custom presets, so the tracing result may not match the preset. The big difference is seen in CC 2023. Vote for a fix at [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/46741876-tracing-bugs-in-scripts).   

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657/suggestions/47385983) to add this feature to Illustrator.

![BatchTrace](https://i.ibb.co/YkMGpS9/Batch-Trace.gif)

## DuplicateToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-DuplicateToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/duptoabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Duplicates the objects selected on the active artboard to the same position on specific artboards. Artboard numbers are entered with a comma or hyphen. Empty input - objects are duplicated to all artboards except the original artboard. Enable `Preserve layers` if the selected objects are in different layers and should stay there.

The color of temporary artboard indexes changes in the code `CFG.color: [255, 0, 0]`.

[Feature Request on Illustrator Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/32146360--paste-on-selected-artboards)

![DuplicateToArtboards](https://i.ibb.co/mJqLzHr/Duplicate-To-Artboards.gif)

## FitSelectionToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-FitSelectionToArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/fittoabs) [![Direct2](https://img.shields.io/badge/Direct%20Link-FitSelectionToArtboards%20Lite.jsx-48C794.svg)](https://link.aiscripts.ru/fittoabs-lite) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Places selected objects in the center of artboards and optionally fit the largest side of each object to the size of the artboard. When scaling objects, you can set internal paddings from the artboard bounds. With the `Rename artboards...` option enabled, artboards get names from the objects placed on them.   

It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options   

The Lite version (FitSelectionToArtboards-Lite.jsx) in silent mode aligns and fit topmost selected object to the active artboard. If the `CFG.isContains:true` flag is changed in its code, then the selected object will be processed only if it was contained on the artboard.

![FitSelectionToArtboards](https://i.ibb.co/YT0qPWL/Fit-Selection-To-Artboards.gif)

## MakeEnvelopesWithTops
[![Direct](https://img.shields.io/badge/Direct%20Link-MakeEnvelopesWithTops.jsx-FF6900.svg)](https://link.aiscripts.ru/mkenvel) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Distorts the selected bottom object by the top selected objects separately. Similar to the multiple run of the command `Object > Envelope Distort > Make with Top Object`.

![MakeEnvelopesWithTops](https://i.ibb.co/N24Lmy7/Make-Envelopes-With-Tops.gif)

## MirrorMove
[![Direct](https://img.shields.io/badge/Direct%20Link-MirrorMove.jsx-FF6900.svg)](https://link.aiscripts.ru/mirrmov) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Mirror movement the object or points using the last values of the `Object > Transform > Move...` or last move with the mouse / keyboard. Extends the native `Object > Transform > Transform Again`. Axes: XY, X, Y. Movement ratio — the ratio of how much distance to move relative to the previous one (1 = the same). It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![MirrorMove](https://i.ibb.co/vDPYtQC/Mirror-Move.gif)

## PlaceSymbols
[![Direct](https://img.shields.io/badge/Direct%20Link-PlaceSymbols.jsx-FF6900.svg)](https://link.aiscripts.ru/plsymb) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Searches the document library for symbols by name and places the selected ones on the canvas. The script speeds up working with a large local symbol library. The Instances column counts all instances of the symbol in the document.

> [!NOTE]   
> Vote on [Uservoice](http://illustrator.uservoice.com/forums/333657/suggestions/37002922) to improve the Symbols panel in Illustrator.

![PlaceSymbols](https://i.ibb.co/y5ytbYp/Place-Symbols.gif)

## RenameItems
[![Direct](https://img.shields.io/badge/Direct%20Link-RenameItems.jsx-FF6900.svg)](https://link.aiscripts.ru/renitems) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Script to batch rename selected items or their parent layers with many options or simple rename one selected item / active layer / artboard. The find and replace function supports RegExp.      

![RenameItems](https://i.ibb.co/9T8TfQv/rename-items.gif)

## Rescale
[![Direct](https://img.shields.io/badge/Direct%20Link-Rescale.jsx-FF6900.svg)](https://link.aiscripts.ru/resc) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Automatic scaling of objects to the desired size. If you draw a line on top with the length or height of the desired object, 'Old Size' will be filled automatically. Units associated with "Document Setup".      

![Rescale](https://i.ibb.co/gDj142f/demo-Rescale.gif)

## ResizeOnLargerSide
[![Direct](https://img.shields.io/badge/Direct%20Link-ResizeOnLargerSide.jsx-FF6900.svg)](https://link.aiscripts.ru/reslrgsd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Resize of the selected objects to the specified amount on the larger side. Works with document units.   

![ResizeOnLargerSide](https://i.ibb.co/1bSj1kC/Resize-On-Larger-Side.gif)

## ResizeToSize
[![Direct](https://img.shields.io/badge/Direct%20Link-ResizeToSize.jsx-FF6900.svg)](https://link.aiscripts.ru/rsztsz) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Adobe Illustrator has a Transform panel, but you cannot use it to transform several selected objects to a specified value. It also has problems with the accuracy of the result. The script can transform selected objects with 100% accuracy, depending on the selected side: width, height or automatically the larger side. Units associated with "Document Setup". Quick access with <kbd>Q</kbd> + underlined key or digit. Instead of <kbd>Q</kbd> you can set your modifier key in the script file `modKey: 'Q'`.

> [!NOTE]   
> Vote on [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/33252640-an-ability-to-resize-all-selected-objects-to-a-spe), [Uservoice #2](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35740054-match-width-or-height-to-key-object) to add this feature to Illustrator.

<a href="https://youtu.be/PN3dAf6rac8">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ResizeToSize](https://i.ibb.co/q0Ktmfm/Resize-To-Size.gif)

## RoundCoordinates
[![Direct](https://img.shields.io/badge/Direct%20Link-RoundCoordinates.jsx-FF6900.svg)](https://link.aiscripts.ru/rndcoord) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script rounds the coordinates of each selected object. The reference point gets from the `Transform` panel. The script aligns to the stroke if `Preferences > Use Preview Bounds` is enabled. In the script file, you can change the coordinate rounding step in the CFG `step: 1`. If the step is 0, the script aligns to the document grid from `Preferences > Guides & Grid`.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-feature-requests/suggestions/34970752-make-anchor-points-pixel-perfect) to add this feature to Illustrator.

![RoundCoordinates](https://i.ibb.co/3y0WpzC/Round-Coordinates.gif)

## ShowObjectNames
[![Direct](https://img.shields.io/badge/Direct%20Link-ShowObjectNames.jsx-FF6900.svg)](https://link.aiscripts.ru/shwobjnms) [![Direct](https://img.shields.io/badge/Direct%20Link-ShowObjectNames%20FontPicker.jsx-FF6900.svg)](https://link.aiscripts.ru/shwObjNmsFont) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Adds file names of placed or embedded images (PNG, JPG, TIFF, PSD, PDF and others) and names of other selected objects. If the source image file is not found in the folder, the script adds "Missing Image". For objects without a name, the caption is "Unnamed Object". In version 0.4, captions are created with the selected character style.      

The ShowObjectNames-FontPicker modification includes font selection and font size. If you have thousands of fonts installed on your computer, this version of the script will be slower due to font processing.

Parameters in the code:

* `isAddStyle: true` — add new character style for captions
* `styleName` — name of new character style
* `fontSize: 14` — font size of the created character style;
* `Name: 'Object_Names'` — name of the new layer.

![ShowObjectNames](https://i.ibb.co/Tq4fLkNK/Show-Object-Names.jpg)

## SwapObjects
[![Direct](https://img.shields.io/badge/Direct%20Link-SwapObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/swapobjs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Swaps the coordinates of two selected objects by reference point and the order within the layer optionally.

> [!WARNING]   
> Don't put this script in the action slot for a quick run. It will freeze Illustrator.

![SwapObjects](https://i.ibb.co/L5SkN4W/Swap-Objects.gif)

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

## 🤝 Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

## ✉️ Contact
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.