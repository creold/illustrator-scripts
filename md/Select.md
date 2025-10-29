![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Select | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-135k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#cornersselector) `v0.1 — 21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#named-items-finder) `v0.3 — upd, 10.04.2025`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectartboardobjects) `v0.1.1 — upd, 13.01.2025`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectbyswatches) `v0.3.2 — upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectonlypoints) `v0.3.2`
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectpointsbytype) `v2.1.4 — upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectrotateditems) `v0.1 — 22.06.2022`

## CornersSelector
[![Direct](https://img.shields.io/badge/Direct%20Link-CornersSelector.jsx-FF6900.svg)](https://link.aiscripts.ru/corslctr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Selects points on objects that are inside or outside the shape of the object. For example, for the task, select all the rays of a star and round them.

![CornersSelector](https://i.ibb.co/Jy12pLW/Corners-Selector.gif)

## Named Items Finder
[![Direct](https://img.shields.io/badge/Direct%20Link-NamedItemsFinder.jsx-FF6900.svg)](https://link.aiscripts.ru/itemsfinder) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Search items in the document by name and zoom to them contents. Inspired by Photoshop CC 2020 features.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectAllLayersAbove.jsx-FF6900.svg)](https://link.aiscripts.ru/sellyrabv) [![Direct](https://img.shields.io/badge/Direct%20Link-SelectAllLayersBelow.jsx-FF6900.svg)](https://link.aiscripts.ru/sellyrblw) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The SelectAllLayersAbove script selects objects in all layers above the active layer. And the SelectAllLayersBelow script is in the layers below. If something is selected in the document, the parent layer of the selected object becomes active. Otherwise, the active layer is the layer that is selected in the Layers panel. Change `var isInclActive = false` in the code to `true` so that objects in the source layer are also selected.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectArtboardObjects
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectArtboardObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/selabobj) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Selects all objects that overlap the bounds of the active artboard with a tolerance, or objects outside the bounds. The problem with the native Select → All on Active Artboard function is that it selects entire groups if at least one object in them is on the artboard. The script checks each object individually.  

> [!TIP]   
> For complex documents, lock or hide unneeded objects and layers to speed up the script. Alternatively, switch Illustrator to full-screen mode (<kbd>F</kbd>) or hide the toolbars (<kbd>Tab</kbd>).

**How Artboard Tolerance Works**

All Indside Artboard:

* `> 0` - selects objects whose edge is outside the artboard bounds within the value or falls inside the artboard.
* `< 0` - selects objects whose edge is deeper inside the artboard than the specified distance.

All Outside Artboard:

* `> 0` - selects objects if their edge inside the artboard by the specified number.
* `< 0` - selects objects if their edge is further from the artboard bounds.

![SelectArtboardObjects](https://i.ibb.co/kHqQFtD/Select-Artboard-Objects.gif)

## SelectBySwatches
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectBySwatches.jsx-FF6900.svg)](https://link.aiscripts.ru/selbyswat) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The Magic Wand tool selects objects that match the color of the sample. Selecting samples with the <kbd>Shift</kbd> key will select items of different colors. The script will select items if a fill or stroke color matches the colors selected in the Swatches panel.

> [!TIP]   
> To select objects with a different spot color tint, first uncheck Illustrator: Preferences → General → Select Same Tint %.

> [!WARNING]   
> Don't put this script in the action slot for a quick run. It will freeze Illustrator.

![SelectBySwatches](https://i.ibb.co/JR5h4pq/Select-By-Swatches.gif)

## SelectOnlyPoints
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectOnlyPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/selonlypts) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

After using the Lasso tool <kbd>A</kbd> or Direct Selection Tool <kbd>Q</kbd>, both Points and Path segments are selected. 

> [!NOTE]   
> Vote on [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/40280419-direct-selection-tool-to-select-only-points), [Uservoice #2](https://illustrator.uservoice.com/forums/601447-illustrator-desktop-bugs/suggestions/35846947-clipping-mask-bug-direct-selection-tool-and-smar) to add this feature to Illustrator.

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectPointsByType.jsx-FF6900.svg)](https://link.aiscripts.ru/selptsbyty) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Selects points on the selected paths according to their type. Does the thing that even Astute Graphics plugins can't do :)   

> [!TIP]   
> Select `View → Hide Bounding Box` to see active points in real time.   

<a href="https://youtu.be/pjHmBDLIWbw">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

**Keyboard shortcuts:**   
Instead of <kbd>Q</kbd> you can set your modifier key in the script file `modKey: 'Q'`.
   
* Bezier <kbd>Q</kbd> + <kbd>1</kbd>
* Ortho <kbd>Q</kbd> + <kbd>2</kbd>
* Flush <kbd>Q</kbd> + <kbd>3</kbd>
* Corner <kbd>Q</kbd> + <kbd>4</kbd>
* Broken <kbd>Q</kbd> + <kbd>5</kbd>
* Flat <kbd>Q</kbd> + <kbd>6</kbd>

![SelectPointsType](https://i.ibb.co/1MTyHx8/Select-Points-By-Type.gif)

## SelectRotatedItems
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectRotatedItems.jsx-FF6900.svg)](https://link.aiscripts.ru/selrotdit) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Finds rotated objects in a selection or in a document. If `isSkipRight: true`, then objects rotated 90, 180, 270 degrees are ignored, if `false` value, then all objects with rotation angle different from 0 degrees are selected.

![SelectRotatedItems](https://i.ibb.co/7YpGm9M/Select-Rotated-Items.gif)

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