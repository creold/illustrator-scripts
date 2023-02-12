![header](https://i.ibb.co/mF018gV/emblem.png)
# Select | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#named-items-finder) `(upd, 14.09.2022)`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectalllayersabove) `(new, 21.02.2022)`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectbyswatches) `(upd, 14.09.2022)`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectpointsbytype) `(upd, 14.09.2022)`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.md#selectrotateditems) `(new, 22.06.2022)`

## Named Items Finder
[![Direct](https://img.shields.io/badge/Direct%20Link-NamedItemsFinder.jsx-FF6900.svg)](https://rebrand.ly/itemsfinder) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Search items in the document by name and zoom to them contents. Inspired by Photoshop CC 2020 features.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectAllLayersAbove.jsx-FF6900.svg)](https://rebrand.ly/sellyrabv) [![Direct](https://img.shields.io/badge/Direct%20Link-SelectAllLayersBelow.jsx-FF6900.svg)](https://rebrand.ly/sellyrblw) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The SelectAllLayersAbove script selects objects in all layers above the active layer. And the SelectAllLayersBelow script is in the layers below. If something is selected in the document, the parent layer of the selected object becomes active. Otherwise, the active layer is the layer that is selected in the Layers panel. Change `var isInclActive = false` in the code to `true` so that objects in the source layer are also selected.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectBySwatches
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectBySwatches.jsx-FF6900.svg)](https://rebrand.ly/selbyswat) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The Magic Wand tool selects objects that match the color of the sample. Selecting samples with the <kbd>Shift</kbd> key will select items of different colors. The script will select items if a fill or stroke color matches the colors selected in the Swatches panel.

![SelectBySwatches](https://i.ibb.co/q70XMd6/Select-By-Swatches.gif)

## SelectOnlyPoints
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectOnlyPoints.jsx-FF6900.svg)](https://rebrand.ly/selonlypts) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

After using the Lasso tool <kbd>A</kbd> or Direct Selection Tool <kbd>Q</kbd>, both Points and Path segments are selected. 

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectPointsByType.jsx-FF6900.svg)](https://rebrand.ly/selptsbyty) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Selects points on the selected paths according to their type. Does the thing that even Astute Graphics plugins can't do :)   

> **Note**   
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
[![Direct](https://img.shields.io/badge/Direct%20Link-SelectRotatedItems.jsx-FF6900.svg)](https://rebrand.ly/selrotdit) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Finds rotated objects in a selection or in a document. If `isSkipRight: true`, then objects rotated 90, 180, 270 degrees are ignored, if `false` value, then all objects with rotation angle different from 0 degrees are selected.

![SelectRotatedItems](https://i.ibb.co/7YpGm9M/Select-Rotated-Items.gif)

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