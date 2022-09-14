![header](https://i.ibb.co/mF018gV/emblem.png)
# Artboard | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Yotube](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## 📜 Scripts
* ArtboardsFinder `(upd, 14.09.2022)`
* BatchRenamer `(upd, 14.09.2022)`
* DuplicateArtboards `(upd, 14.09.2022)`
* FitArtboardsToArtwork `(upd, 01.08.2022)`
* MoveArtboards `(upd, 14.09.2022)`
* RenameArtboardAsLayer `(upd, 14.09.2022)`
* RenameArtboardAsSize `(upd, 01.08.2022)`
* RenameArtboardAsTopObj `(upd, 14.09.2022)`

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## ArtboardsFinder

Search for artboards by name or size and shows the selected artboards in the center of the window. Width and height in document units. Landscape, portrait, square artboards are displayed in descending order of size when searching by orientation.

![ArtboardsFinder](https://i.ibb.co/VJXKjWQ/artboards-finder.gif)

## BatchRenamer

Batch renames Artboards, top-level Layers and selected objects in the document. Adds a common prefix and suffix to names. "Find & Replace" replaces matching strings in current names.

**Placeholders** 

* {w} - the width of the artboard or selected object in units of the document
* {h} - the height of the artboard or selected object
* {u} - document units (Document Setup > Units) 
* {nu:0} - ascending auto-numbering from the entered value
* {nd:0} - descending auto-numbering from the entered value
* {c} - document color model (RGB or CMYK)
* {d} - current date (YYYYMMDD)
* {n} - the current name to be replaced in "Find & Replace"

If you want to change the number of rows, change the CFG `rows: 5` in the script file and the same value in `listHeight: 5 * 32`. In `precision: 0` sets the number of decimal places for height and width of artboards and objects.

![BatchRenamer](https://i.ibb.co/p2VXbY9/Batch-Renamer.gif)

## DuplicateArtboardsLight

Script for copying the selected Artboard with his artwork. The Pro version with more options is available at [Gumroad](https://gumroad.com/sergosokin)   

<a href="https://youtu.be/qDH1YRaYMYk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![DuplicateArtboardsLight](https://i.ibb.co/rF92HpV/demo-Duplicate-Artboards-Light.gif) 

## FitArtboardsToArtwork

Fit artboards by the visible unlocked content with custom margins.

![FitArtboardsToArtwork](https://i.ibb.co/SJJh5Hc/Fit-Artboards-To-Artwork.gif) 

## MoveArtboards

Script for moving artboards range with artwork along the X and Y axis.

![MoveArtboards](https://i.ibb.co/wrHTpTG/Move-Artboards.gif) 

## RenameArtboardAsLayer

The script renames each Artboard by the custom name of Layer with the first visible unlocked item on it.

![RenameArtboardAsLayer](https://i.ibb.co/9nk8Lqn/Rename-Artboard-As-Layer.gif)

## RenameArtboardAsSize

The script names the artboard by its size in pixels. If you don't want save Artboard name, but replace with his size, change `var SAVE_NAME = true;` in the script file to `false`.

![RenameArtboardAsSize](https://i.ibb.co/54H4Jcm/Rename-Artboard-As-Size.gif)

## RenameArtboardAsTopObj

The script renames each Artboard by the custom name of the first visible unlocked item on it. If the top object is text, its contents will be the name of Artboard. 

![RenameArtboardAsTopObj](https://i.ibb.co/WPmf14B/Rename-Artboard-As-Top-Obj.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

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