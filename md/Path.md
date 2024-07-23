![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Path | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-43k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#dividebottompath) `22.02.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#setpointscoordinates) `upd, 09.02.2024`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#points-move-random) `upd, 09.02.2024`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#splitpath) `upd, 09.02.2024`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#subtracttoppath) `03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.md#trimopenends) `upd, 22.02.2023`

## DivideBottomPath
[![Direct](https://img.shields.io/badge/Direct%20Link-DivideBottomPath.jsx-FF6900.svg)](https://rebrand.ly/divbottp) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Divides the bottom path at the intersections with the top paths. The paths must have a stroke. This script replaces Pathfinder → Outline, which resets the color and doesn't remove the top paths segments. Scissors tool requires precise clicking and takes time with many points. 

> [!TIP]   
> If you want to keep the top paths, change `var isRmvTop = true` to `false`. To recolor the segments in random colors, set `isRndColor = true`.

![DivideBottomPath](https://i.ibb.co/LrKDtTz/Divide-Bottom-Path.gif)

## Points Move Random
[![Direct](https://img.shields.io/badge/Direct%20Link-PointsMoveRandom.jsx-FF6900.svg)](https://rebrand.ly/ptsmovrnd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script moves randomly in numeric ranges horizontally and vertically selected points or all points on objects. Quick access with <kbd>Q</kbd> + underlined key. Instead of <kbd>Q</kbd> you can set your modifier key in the script file `modKey: 'Q'`.

<a href="https://youtu.be/9wVTDWUAEmE">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![PointsMoveRandom](https://i.ibb.co/qNpdKTr/Points-Move-Random.gif)

## SetPointsCoordinates
[![Direct](https://img.shields.io/badge/Direct%20Link-SetPointsCoordinates.jsx-FF6900.svg)](https://rebrand.ly/setptscrds) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Sets the same X, Y coordinates for the selected points. In the native Transform panel, after you type X, Y, the shape moves, not the selected points. The script works with artboard rulers or global rulers toggled in the `View → Rulers` menu. To move points by a delta, use the double signs `--` or `++` in front of the number. If the points have a common coordinate, it is displayed in the input. Illustrator has coordinate inaccuracies, so you can set the `CFG.tolerance' in the script code to make the coordinates of the points appear the same in the dialog box.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39140836-move-selected-anchors-by-coordinates) to add this feature to Illustrator.

![SetPointsCoordinates](https://i.ibb.co/KmR2gSS/Set-Points-Coordinates.gif)

## SplitPath
[![Direct](https://img.shields.io/badge/Direct%20Link-SplitPath.jsx-FF6900.svg)](https://rebrand.ly/splpath) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Powerfull script for subtract shapes from paths. Pathfinder panel in Adobe Illustrator does not do it.   

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/39843490-cut-trim-or-divide-open-paths-lines) to add this feature to Illustrator.

<a href="https://youtu.be/1_vUUFkTwxk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![SplitPath](https://i.ibb.co/c6HNZwJ/Split-Path.gif)

## SubtractTopPath
[![Direct](https://img.shields.io/badge/Direct%20Link-SubtractTopPath.jsx-FF6900.svg)](https://rebrand.ly/subtoppath) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Subtracts the top selected shape from all the shapes below it. Pathfinder panel in Adobe Illustrator does not do it. Change the value of `isRmvTop` to `false` to keep the original shape. The `isUseFS: true` speeds up processing with a large number of objects. 

> [!WARNING]   
> Align Stroke to Inside / Outside doesn't work correctly. Apply `Object > Path > Outline Stroke` before running the script.

![SubtractTopPath](https://i.ibb.co/B3QL4k2/Subtract-Top-Path.gif)

## TrimOpenEnds
[![Direct](https://img.shields.io/badge/Direct%20Link-TrimOpenEnds.jsx-FF6900.svg)](https://rebrand.ly/trimends) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Removes the ends of open paths up to their intersection points. It's an alternative to the Shape Builder tool.

![TrimOpenEnds](https://i.ibb.co/J3ct3KN/Trim-Open-Ends.gif)

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