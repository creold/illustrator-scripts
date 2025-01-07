![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Group & Mask | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [CenterClipsToArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#centerclipstoartboards) `v0.1 — 05.2021`
* [ExtractFromGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extractfromgroup) `v0.1 — new, 05.05.2024`
* [ExtUngroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#extungroup) `v1.2.1`
* [GroupArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#groupartboardobjects) `v0.2 — new, 11.06.2024`
* [MaskArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#maskartboards) `v0.1 — new, 29.07.2024`
* [MoveToGroup](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#movetogroup) `v0.1.2 — upd, 09.02.2024`
* [TrimMasks](https://github.com/creold/illustrator-scripts/blob/master/md/Group.md#trimmasks) `v0.3`

## CenterClipsToArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-CenterClipsToArtboards.jsx-FF6900.svg)](https://rebrand.ly/ctrcliptoabs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Aligns selected clip groups and their contents to the center of the parent artboards. You can also align all selected clip groups on a single artboard. 

![CenterClipsToArtboards](https://i.ibb.co/ykHy3rM/Center-Clips-To-Artboards.gif)

## ExtractFromGroup
[![Direct](https://img.shields.io/badge/Direct%20Link-ExtractFromGroup.jsx-FF6900.svg)](https://rebrand.ly/extrgrp) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Extracts the selected items from parent groups. By default, each item is moved before the top parent group. If <kbd>Alt / Option (⌥)</kbd> key is pressed, move item before the first parent group.

![ExtractFromGroup](https://i.ibb.co/pK5yzqS/Extract-From-Group.gif)

## ExtUngroup
[![Direct](https://img.shields.io/badge/Direct%20Link-ExtUngroup.jsx-FF6900.svg)](https://rebrand.ly/extungrp) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Ungroups groups & releases clipping masks, for selected items only or all artwork in the document.   
*Based on original script by Jiwoong Song & modification by [John Wundes](http://www.wundes.com/).*

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39484654-create-an-ungroup-all-feature-on-layer-s) to add this feature to Illustrator.

![ExtUngroup](https://i.ibb.co/QngnpZL/demo-Ext-Ungroup.gif)

## GroupArtboardObjects
[![Direct](https://img.shields.io/badge/Direct%20Link-GroupArtboardObjects.jsx-FF6900.svg)](https://rebrand.ly/grpabobj) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script groups objects on the artboards. It will skip locked or hidden objects. Optionally, you can rename and sort the resulting groups into layers.

![GroupArtboardObjects](https://i.ibb.co/GTGDnCF/Group-Artboard-Objects.gif)

## MaskArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-MaskArtboards.jsx-FF6900.svg)](https://rebrand.ly/maskab) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Adds visible unlocked objects on artboards to clipping masks by artboard size. In the Custom option, you can enter ranges of artboard numbers with commas and hyphens. If the document is saved with bleed settings, the bleed fields will default to this value.

![MaskArtboards](https://i.ibb.co/Cw3Z0St/Mask-Artboards.gif)

## MoveToGroup
[![Direct](https://img.shields.io/badge/Direct%20Link-MoveToGroup.jsx-FF6900.svg)](https://rebrand.ly/movtogrp) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Moves all objects in a selection into a group selected. The order is preserved: the objects above the group are placed inside at the top, the lower ones go at the bottom of the group. If there are several groups in a selection, the dialog allows you to pick between topmost or bottommost groups to be the target.

![MoveToGroup](https://i.ibb.co/jkD5Zx4/Move-To-Group.gif)

## TrimMasks
[![Direct](https://img.shields.io/badge/Direct%20Link-TrimMasks.jsx-FF6900.svg)](https://rebrand.ly/trimcm) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Automatically trims all clip groups in a selection or a document using `Pathfinder > Crop`.

> [!TIP]   
> If you want to save the fill of the mask mask after trimming, open the script file in a text editor and change `SAVE_FILLED_CLIPMASK = false;` value to `true`.

> [!WARNING]   
> Don't put this script in the action slot for a quick run. It will freeze Illustrator.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/35456389-flatten-expand-clipping-group-crop-each-object) to add this feature to Illustrator.

<a href="https://youtu.be/liui0ZUAN50">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![TrimMasks](https://i.ibb.co/prkQGyt/demo-Trim-Masks.gif)

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
