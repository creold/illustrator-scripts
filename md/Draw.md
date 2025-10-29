![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Draw | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-135k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#drawpathbyselectedpoints) `v0.1 — 10.03.2023`
* [DrawRectanglesByArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#drawrectanglesbyartboards) `v0.3 — upd, 03.07.2025`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#numeratespoints) `v0.3.3 — upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#randomscribble) `v0.1.3 — upd, 09.02.2024`
* [TriangleMaker](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.md#trianglemaker) `v0.2 — new, 31.03.2025`

## DrawPathBySelectedPoints
[![Direct](https://img.shields.io/badge/Direct%20Link-DrawPathBySelectedPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/drawbyselpts) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Draws a polygon based on the selected points. To avoid self-intersections, the script sorts the selected points by polar coordinates from the geometric center of the shape with vertices in points. This is how the drawing direction of the polygon is formed.

The parameter in the `isClose' code is used to close the polygon (true) or keep the first and last point (false).

![DrawPathBySelectedPoints](https://i.ibb.co/3CqGhj7/Draw-Path-By-Selected-Points.gif)

## DrawRectanglesByArtboards
[![Direct](https://img.shields.io/badge/Direct%20Link-DrawRectanglesByArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/drawrectbyab) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Draws rectangles to the size of the artboards. In the Custom option, you can enter ranges of artboard numbers with commas and hyphens. If the document is saved with bleed settings, the bleed fields will default to this value.

Code parameters:

* `layer: 'Rectangles'` — the layer name for the New Layer option,
* `isLower: false` — draw below (true) or above (false) other objects

![DrawRectanglesByArtboards](https://i.ibb.co/yQ2sfQk/Draw-Rectangles-By-Artboard.gif)

## NumeratesPoints
[![Direct](https://img.shields.io/badge/Direct%20Link-NumeratesPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/numpts) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Numerates selected points and marks them with colored circles.

![NumeratesPoints](https://i.ibb.co/bdJ8tvV/Numerates-Points.gif)

## RandomScribble
[![Direct](https://img.shields.io/badge/Direct%20Link-RandomScribble.jsx-FF6900.svg)](https://link.aiscripts.ru/randscrib) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Creates random paths with a specified number of points. These can be random straight lines from 2 points or complex shapes that imitate scribbles. The points do not go beyond the bounds of the active artboard. If many shapes are first selected in the document, the script will generate individual paths with points into their bounding box.

![RandomScribble](https://i.ibb.co/b6FftPk/Random-Scribble.gif)

## TriangleMaker
[![Direct](https://img.shields.io/badge/Direct%20Link-TriangleMaker.jsx-FF6900.svg)](https://link.aiscripts.ru/trimkr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Creates a triangle of a given size by sides and angles at the center of the screen or from a selected anchor point. Calculates the length of the three sides and angles in degrees. Optionally, display triangle dimensions in text near the triangle — *Add Triangle Data As Text*.   

Code parameters:

* `rgb: [0, 0, 0]` — triangle fill color for RGB documents, 
* `cmyk: [0, 0, 0, 100]` — fill color for CMYK documents.

![TriangleMaker](https://i.ibb.co/ccx5RsW3/Triangle-Maker.jpg)

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