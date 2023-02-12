![header](https://i.ibb.co/mF018gV/emblem.png)
# Item | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [BatchTrace](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#batchtrace) `(new, 15.08.2022)`
* [DuplicateToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#duplicatetoartboards) `(upd, 14.09.2022)`
* [FitSelectionToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#fitselectiontoartboards) `upd, 22.12.2022`
* [MakeEnvelopesWithTops](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#makeenvelopeswithtops)
* [MirrorMove](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#mirrormove) `(upd, 01.08.2022)`
* [RememberSelectionLayers](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rememberselectionlayers) `(upd, 26.02.2022)`
* [RenameItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#renameitems) `(upd, 06.10.2022)`
* [Rescale](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#rescale) `upd, 22.12.2022`
* [ResizeOnLargerSide](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizeonlargerside) `upd, 14.10.2022`
* [ResizeToSize](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#resizetosize) `upd, 22.12.2022`
* [RoundCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#roundcoordinates) `upd, 22.12.2022`
* [SortLayerItems](https://github.com/creold/illustrator-scripts/blob/master/md/Item.md#sortlayeritems) `(new, 29.08.2022)`

## BatchTrace
[![Direct](https://img.shields.io/badge/Direct%20Link-BatchTrace.jsx-FF6900.svg)](https://rebrand.ly/bchtr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Batch tracing of selected placed and embedded images in a document or all images from a user-selected folder. The native menu `Object → Image Trace → Make` is available for one selected image. Recording the action will not help, because the trace preset are not saved in it. In Adobe Bridge, only the image folder can be traced: `Tools → Illustrator → Image Trace`. 

> **Note**   
> The speed of the script depends on the specifications of your PC, the tracing preset and the amount of images.

Tweaks in the script code:

* `CFG.extList` — a list of extensions to be processed from the folder. You can add your own or remove some to skip the script;
* `CFG.isInclSubdir` — search for images in all subfolders (true) or only the root folder (false);
* `CFG.isReverse` — reverse the order of the presets list (true), the user presets will be at the top.

![BatchTrace](https://i.ibb.co/YkMGpS9/Batch-Trace.gif)

## DuplicateToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-DuplicateToArtboards.jsx-FF6900.svg)](https://rebrand.ly/duptoabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Duplicates the objects selected on the active artboard to the same position on specific artboards. Artboard numbers are entered with a comma or hyphen. Empty input - objects are duplicated to all artboards except the original artboard. Enable `Preserve layers` if the selected objects are in different layers and should stay there.

The color of temporary artboard indexes changes in the code `CFG.color: [255, 0, 0]`.

[Feature Request on Illustrator Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/32146360--paste-on-selected-artboards)

![DuplicateToArtboards](https://i.ibb.co/mJqLzHr/Duplicate-To-Artboards.gif)

## FitSelectionToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-FitSelectionToArtboards.jsx-FF6900.svg)](https://rebrand.ly/fittoabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Places selected objects in the center of artboards and optionally fit the largest side of each object to the size of the artboard. When scaling objects, you can set internal paddings from the artboard bounds. With the `Rename artboards...` option enabled, artboards get names from the objects placed on them.   

It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options   

The Lite version (FitSelectionToArtboards-Lite.jsx) in silent mode aligns and fit topmost selected object to the active artboard. If the `CFG.isContains:true` flag is changed in its code, then the selected object will be processed only if it was contained on the artboard.

![FitSelectionToArtboards](https://i.ibb.co/YT0qPWL/Fit-Selection-To-Artboards.gif)

## MakeEnvelopesWithTops
[![Direct](https://img.shields.io/badge/Direct%20Link-MakeEnvelopesWithTops.jsx-FF6900.svg)](https://rebrand.ly/mkenvel) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Distorts the selected bottom object by the top selected objects separately. Similar to the multiple run of the command `Object > Envelope Distort > Make with Top Object`.

![MakeEnvelopesWithTops](https://i.ibb.co/N24Lmy7/Make-Envelopes-With-Tops.gif)

## MirrorMove
[![Direct](https://img.shields.io/badge/Direct%20Link-MirrorMove.jsx-FF6900.svg)](https://rebrand.ly/mirrmov) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Mirror movement the object or points using the last values of the `Object > Transform > Move...` or last move with the mouse / keyboard. Extends the native `Object > Transform > Transform Again`. Axes: XY, X, Y. Movement ratio — the ratio of how much distance to move relative to the previous one (1 = the same). It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![MirrorMove](https://i.ibb.co/vDPYtQC/Mirror-Move.gif) 

## RememberSelectionLayers
[![Direct](https://img.shields.io/badge/Direct%20Link-RememberSelectionLayers.jsx-FF6900.svg)](https://rebrand.ly/rmbsellyr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Moves objects to their original layers. The information must be saved. The objects are moved to the top of the layer.

![RememberSelectionLayers](https://i.ibb.co/SJq5rj9/Remember-Selection-Layers.gif)

## RenameItems
[![Direct](https://img.shields.io/badge/Direct%20Link-RenameItems.jsx-FF6900.svg)](https://rebrand.ly/renitems) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Script to batch rename selected items or their parent layers with many options or simple rename one selected item / active layer / artboard. The find and replace function supports RegExp.      

![RenameItems](https://i.ibb.co/9T8TfQv/rename-items.gif)

## Rescale
[![Direct](https://img.shields.io/badge/Direct%20Link-Rescale.jsx-FF6900.svg)](https://rebrand.ly/resc) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Automatic scaling of objects to the desired size. If you draw a line on top with the length or height of the desired object, 'Old Size' will be filled automatically. Units associated with "Document Setup".      

![Rescale](https://i.ibb.co/gDj142f/demo-Rescale.gif)

## ResizeOnLargerSide
[![Direct](https://img.shields.io/badge/Direct%20Link-ResizeOnLargerSide.jsx-FF6900.svg)](https://rebrand.ly/reslrgsd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Resize of the selected objects to the specified amount on the larger side. Works with document units.   

![ResizeOnLargerSide](https://i.ibb.co/1bSj1kC/Resize-On-Larger-Side.gif)

## ResizeToSize
[![Direct](https://img.shields.io/badge/Direct%20Link-ResizeToSize.jsx-FF6900.svg)](https://rebrand.ly/rsztsz) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Adobe Illustrator has a Transform panel, but you cannot use it to transform several selected objects to a specified value. It also has problems with the accuracy of the result. The script can transform selected objects with 100% accuracy, depending on the selected side: width, height or automatically the larger side. Units associated with "Document Setup". Quick access with <kbd>Q</kbd> + underlined key or digit. Instead of <kbd>Q</kbd> you can set your modifier key in the script file `modKey: 'Q'`.

<a href="https://youtu.be/PN3dAf6rac8">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ResizeToSize](https://i.ibb.co/q0Ktmfm/Resize-To-Size.gif)

## RoundCoordinates
[![Direct](https://img.shields.io/badge/Direct%20Link-RoundCoordinates.jsx-FF6900.svg)](https://rebrand.ly/rndcoord) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script rounds the coordinates of each selected object. The reference point gets from the `Transform` panel. The script aligns to the stroke if `Preferences > Use Preview Bounds` is enabled. In the script file, you can change the coordinate rounding step in the CFG `step: 1`. If the step is 0, the script aligns to the document grid from `Preferences > Guides & Grid`.

![RoundCoordinates](https://i.ibb.co/3y0WpzC/Round-Coordinates.gif)

## SortLayerItems
[![Direct](https://img.shields.io/badge/Direct%20Link-SortLayerItems.jsx-FF6900.svg)](https://rebrand.ly/sortlyrit) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Sorts objects alphabetically inside layers. The sublayers are sorted with the objects and when you select `Include all sublayers` their contents too. The layer count is automatically updated. Objects without a name (in pointy brackets `<Group>`, `<Ellipse>`, etc.) are placed top / bottom.

![SortLayerItems](https://i.ibb.co/R9wQS7t/Sort-Layer-Items.gif)

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

## 🤝 Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

## ✉️ Contact
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.