![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Artboard | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-112k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [ArtboardsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsfinder) `v0.1.5 — upd, 09.02.2024`
* [ArtboardsRemapper](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#artboardsremapper) `v0.2.1 — upd, 12.06.2025`
* [BatchRenamer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#batchrenamer) `v1.5 — upd, 21.01.2024`
* [DuplicateArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#duplicateartboardslight) `v0.4.4 — upd, 09.02.2024`
* [FitArtboardsToArtwork](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#fitartboardstoartwork) `v0.2 — upd, 18.09.2023`
* [MoveArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#moveartboards) `v0.2.6 — upd, 09.02.2024`
* [RenameArtboardAsLayer](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardaslayer) `v0.3 — upd, 18.04.2025`
* [RenameArtboardAsSize](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardassize) `v0.5 — upd, 18.04.2025`
* [RenameArtboardAsTopObj](https://github.com/creold/illustrator-scripts/blob/master/md/Artboard.md#renameartboardastopobj) `v0.4 — upd, 18.04.2025`

## ArtboardsFinder
[![Direct](https://img.shields.io/badge/Direct%20Link-ArtboardsFinder.jsx-FF6900.svg)](https://link.aiscripts.ru/abfinder) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Search for artboards by name or size and shows the selected artboards in the center of the window. Width and height in document units. Landscape, portrait, square artboards are displayed in descending order of size when searching by orientation.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/32321188-artboard-search-function) to add this feature to Illustrator.

![ArtboardsFinder](https://i.ibb.co/VJXKjWQ/artboards-finder.gif)

## ArtboardsRemapper
[![Direct](https://img.shields.io/badge/Direct%20Link-ArtboardsRemapper.jsx-FF6900.svg)](https://link.aiscripts.ru/abremap) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Writes artboard names to a text file or applies from it. Actions occur in the range of specified indexes corresponding to numbers in the Artboards panel.

![ArtboardsRemapper](https://i.ibb.co/xG8sSNr/Artboards-Remapper.gif)

## BatchRenamer
[![Direct](https://img.shields.io/badge/Direct%20Link-BatchRenamer.jsx-FF6900.svg)](https://link.aiscripts.ru/batchren) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Batch renames Artboards, top-level Layers and selected objects in the document. Adds a common prefix and suffix to names. "Find & Replace" replaces matching strings in current names.

**Placeholders** 

* {w} - the width of the artboard or selected object in units of the document
* {h} - the height of the artboard or selected object
* {u} - document units (Document Setup > Units) 
* {nu:0} - ascending auto-numbering from the entered value
* {nd:0} - descending auto-numbering from the entered value
* {c} - document color model (RGB or CMYK)
* {d} - current date (YYYYMMDD)
* {fn} - filename without extension
* {n} - the current name to be replaced in "Find & Replace"

The Find & Replace supports [regular expression symbols](https://cheatography.com/davechild/cheat-sheets/regular-expressions/). Example: to remove numbers in names, enter `\d` in Find and keep Replace blank. To replace spaces with another character: enter `\s+` in Find and the your symbol in Replace.

> [!TIP]   
> If you want to change the number of rows, change the CFG `rows: 5` in the script file and the same value in `listHeight: 5 * 32`. In `precision: 0` sets the number of decimal places for height and width of artboards and objects.   

> [!NOTE]   
> Vote on [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/43575576-bulk-re-naming-of-layers), [Uservoice #2](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39925396-find-and-replace-text-in-object-name-in-the-layers), [Uservoice #3](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35567803-advanced-rename-tools-for-artboards-with-find-re) to add this feature to Illustrator.

![BatchRenamer](https://i.ibb.co/p2VXbY9/Batch-Renamer.gif)

## DuplicateArtboardsLight
[![Direct](https://img.shields.io/badge/Direct%20Link-DuplicateArtboardsLight.jsx-FF6900.svg)](https://link.aiscripts.ru/dupabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Script for copying the selected Artboard with his artwork. The Pro version with more options is available at [Buymeacoffee](https://www.buymeacoffee.com/aiscripts/e/231621)   

<a href="https://youtu.be/qDH1YRaYMYk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![DuplicateArtboardsLight](https://i.ibb.co/rF92HpV/demo-Duplicate-Artboards-Light.gif)

## FitArtboardsToArtwork
[![Direct](https://img.shields.io/badge/Direct%20Link-FitArtboardsToArtwork.jsx-FF6900.svg)](https://link.aiscripts.ru/fitabstoart) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Fit artboards by the visible unlocked content with custom margins.

![FitArtboardsToArtwork](https://i.ibb.co/SJJh5Hc/Fit-Artboards-To-Artwork.gif)

## MoveArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-MoveArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/moveabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Script for moving artboards range with artwork along the X and Y axis.

![MoveArtboards](https://i.ibb.co/wrHTpTG/Move-Artboards.gif)

## RenameArtboardAsLayer
[![Direct](https://img.shields.io/badge/Direct%20Link-RenameArtboardAsLayer.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsaslyr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script renames each Artboard by the custom name of Layer with the first visible unlocked item on it.

![RenameArtboardAsLayer](https://i.ibb.co/fV7rHhVK/Rename-Artboard-As-Layer.gif)

## RenameArtboardAsSize
[![Direct](https://img.shields.io/badge/Direct%20Link-RenameArtboardAsSize.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsassize) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Renames artboards according to their size in document units.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/41686762-artboard-auto-naming-preferences-one-click-artboa) to add this feature to Illustrator.

![RenameArtboardAsSize](https://i.ibb.co/My4pLYFB/Rename-Artboard-As-Size.gif)

## RenameArtboardAsTopObj
[![Direct](https://img.shields.io/badge/Direct%20Link-RenameArtboardAsTopObj.jsx-FF6900.svg)](https://link.aiscripts.ru/renabsasobj) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script renames each Artboard by the custom name of the first visible unlocked item on it. If the top object is text, its contents will be the name of Artboard. 

![RenameArtboardAsTopObj](https://i.ibb.co/3mfd4bFV/Rename-Artboard-As-Top-Obj.gif)

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