![header](https://i.ibb.co/mF018gV/emblem.png)
# Item | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Yotube](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## 📜 Scripts
* BatchTrace `(new, 15.08.2022)`
* FitSelectionToArtboards `(upd, 01.08.2022)`
* MakeEnvelopesWithTops
* MirrorMove `(upd, 01.08.2022)`
* RememberSelectionLayers `(upd, 26.02.2022)`
* RenameItems `(upd, 26.07.2022)`
* Rescale `(upd, 01.08.2022)`
* ResizeOnLargerSide `(upd, 01.08.2022)`
* ResizeToSize `(upd, 01.08.2022)`
* RoundCoordinates `(upd, 01.08.2022)`
* SortLayerItems `(new, 29.08.2022)`

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## BatchTrace
Batch tracing of selected placed and embedded images in a document or all images from a user-selected folder. The native menu `Object → Image Trace → Make` is available for one selected image. Recording the action will not help, because the trace preset are not saved in it. In Adobe Bridge, only the image folder can be traced: `Tools → Illustrator → Image Trace`. The speed of the script depends on the specifications of your PC, the tracing preset and the amount of images.

Tweaks in the script code:

* `CFG.extList` — a list of extensions to be processed from the folder. You can add your own or remove some to skip the script;
* `CFG.isInclSubdir` — search for images in all subfolders (true) or only the root folder (false);
* `CFG.isReverse` — reverse the order of the presets list (true), the user presets will be at the top.

![BatchTrace](https://i.ibb.co/YkMGpS9/Batch-Trace.gif)

## FitSelectionToArtboards

Places selected objects in the center of artboards and optionally fit the largest side of each object to the size of the artboard. When scaling objects, you can set internal paddings from the artboard bounds. With the `Rename artboards...` option enabled, artboards get names from the objects placed on them.   

It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options   

The Lite version (FitSelectionToArtboards-Lite.jsx) in silent mode aligns and fit topmost selected object to the active artboard. If the `CFG.isContains:true` flag is changed in its code, then the selected object will be processed only if it was contained on the artboard.

![FitSelectionToArtboards](https://i.ibb.co/YT0qPWL/Fit-Selection-To-Artboards.gif)

## MakeEnvelopesWithTops

Distorts the selected bottom object by the top selected objects separately. Similar to the multiple run of the command `Object > Envelope Distort > Make with Top Object`.

![MakeEnvelopesWithTops](https://i.ibb.co/N24Lmy7/Make-Envelopes-With-Tops.gif)

## MirrorMove

Mirror movement the object or points using the last values of the `Object > Transform > Move...` or last move with the mouse / keyboard. Extends the native `Object > Transform > Transform Again`. Axes: XY, X, Y. Movement ratio — the ratio of how much distance to move relative to the previous one (1 = the same). It has two modes: silent and dialog. Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![MirrorMove](https://i.ibb.co/vDPYtQC/Mirror-Move.gif) 

## RememberSelectionLayers

Moves objects to their original layers. The information must be saved. The objects are moved to the top of the layer.

![RememberSelectionLayers](https://i.ibb.co/SJq5rj9/Remember-Selection-Layers.gif)

## RenameItems

Script to batch rename selected items or their parent layers with many options or simple rename one selected item / active layer / artboard. The find and replace function supports RegExp.      

![RenameItems](https://i.ibb.co/9T8TfQv/rename-items.gif)

## Rescale

Automatic scaling of objects to the desired size. If you draw a line on top with the length or height of the desired object, 'Old Size' will be filled automatically. Units associated with "Document Setup".      

![Rescale](https://i.ibb.co/gDj142f/demo-Rescale.gif)

## ResizeOnLargerSide

Resize of the selected objects to the specified amount on the larger side. Works with document units.   

![ResizeOnLargerSide](https://i.ibb.co/1bSj1kC/Resize-On-Larger-Side.gif)

## ResizeToSize

Adobe Illustrator has a Transform panel, but you cannot use it to transform several selected objects to a specified value. It also has problems with the accuracy of the result. The script can transform selected objects with 100% accuracy, depending on the selected side: width, height or automatically the larger side. Units associated with "Document Setup". Quick access with <kbd>Q</kbd> + underlined key or digit. Instead of <kbd>Q</kbd> you can set your modifier key in the script file `modKey: 'Q'`.

<a href="https://youtu.be/PN3dAf6rac8">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ResizeToSize](https://i.ibb.co/q0Ktmfm/Resize-To-Size.gif)

## RoundCoordinates

The script rounds the coordinates of each selected object. The reference point gets from the `Transform` panel. The script aligns to the stroke if `Preferences > Use Preview Bounds` is enabled. In the script file, you can change the coordinate rounding step in the CFG `step: 1`. If the step is 0, the script aligns to the document grid from `Preferences > Guides & Grid`.

![RoundCoordinates](https://i.ibb.co/3y0WpzC/Round-Coordinates.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## SortLayerItems
Sorts objects alphabetically inside layers. The sublayers are sorted with the objects and when you select `Include all sublayers` their contents too. The layer count is automatically updated. Objects without a name (in pointy brackets `<Group>`, `<Ellipse>`, etc.) are placed top / bottom.

![SortLayerItems](https://i.ibb.co/R9wQS7t/Sort-Layer-Items.gif)

## 💸 Donate
You can support my work on new scripts via [Tinkoff], [ЮMoney], [Donatty], [DonatePay]. [PayPal] is temporarily unavailable

[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin
[PayPal]: https://paypal.me/osokin/5usd

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