![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Style | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-112k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#averagestrokeswidth) `v0.1 — 07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#changeopacity) `v0.2 — upd, 01.09.2025`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#grayscaletoopacity) `v0.1`
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#maketrappingstroke) `v0.1.1 — upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#opacitymaskclip) `v0.3 — upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#randomstrokewidth) `v0.1.2 — upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `v0.3 — upd, 23.07.2024`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.md#strokesweight) `v0.3 — upd, 23.07.2024`

## AverageStrokesWidth
[![Direct](https://img.shields.io/badge/Direct%20Link-AverageStrokesWidth.jsx-FF6900.svg)](https://link.aiscripts.ru/avgstrwd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Averages the stroke width of selected objects, skipping those without strokes. Supports paths, compound paths and text objects.

![AverageStrokesWidth](https://i.ibb.co/3shb651/Average-Strokes-Width.gif)

## ChangeOpacity
[![Direct](https://img.shields.io/badge/Direct%20Link-ChangeOpacity.jsx-FF6900.svg)](https://link.aiscripts.ru/chngopa) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Controls the opacity of selected objects.

* In the exact input mode, you can use numbers and math operators: +, -, *, /. For example, /2 — halves the opacity.
* Random opacity generation   
1) Random value within a specified range with a step.   
2) Modify the current value by ±X%.   
3) Gaussian (normal) distribution.

Apply to Objects Inside Groups — change the opacity of nested objects within groups.

![ChangeOpacity](https://i.ibb.co/B5bc2NnT/Change-Opacity.gif)

## GrayscaleToOpacity
[![Direct](https://img.shields.io/badge/Direct%20Link-GrayscaleToOpacity.jsx-FF6900.svg)](https://link.aiscripts.ru/graytoopa) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Convert selection colors to Grayscale and set identical Opacity value.

![GrayscaleToOpacity](https://i.ibb.co/qY1Cx68/Grayscale-To-Opacity.gif)

## MakeTrappingStroke
[![Direct](https://img.shields.io/badge/Direct%20Link-MakeTrappingStroke.jsx-FF6900.svg)](https://link.aiscripts.ru/mktrapstroke) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Sets the stroke color based on the fill of the object, with the Overprint Stroke attribute enabled, for prepress. 

> [!IMPORTANT]   
> In the Mac OS version of Adobe Illustrator strokes are not always added to multiple objects with the `Force add stroke` option. If you have a problem on Mac, manually add any stroke to objects and then run the script.

![MakeTrappingStroke](https://i.ibb.co/QQkJ451/Make-Trapping-Stroke.gif)

## OpacityMaskClip
[![Direct](https://img.shields.io/badge/Direct%20Link-OpacityMaskClip.jsx-FF6900.svg)](https://link.aiscripts.ru/opamclip) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

The script activates `Clip` checkbox in `Transparency > Opacity Mask`.

> [!WARNING]   
> Don't put this script in the action slot for a quick run. It will freeze Illustrator.

![OpacityMaskClip](https://i.ibb.co/Kbn4vqB/Opacity-Mask-Clip.gif)

## RandomStrokeWidth
[![Direct](https://img.shields.io/badge/Direct%20Link-RandomStrokeWidth.jsx-FF6900.svg)](https://link.aiscripts.ru/rndstrwd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Sets random stroke width of selected objects in a range with steps. The stroke unit is taken from `Preferences > Units > Stroke`. It has two modes: silent and dialog. Changing in `CFG.showUI`.   

Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![RandomStrokeWidth](https://i.ibb.co/PQN1qkV/Random-Stroke-Width.gif)

## StrokesWeight
[![Direct](https://img.shields.io/badge/Direct%20Link-StrokesWeightDown.jsx-FF6900.svg)](https://link.aiscripts.ru/strwtdn) [![Direct](https://img.shields.io/badge/Direct%20Link-StrokesWeightUp.jsx-FF6900.svg)](https://link.aiscripts.ru/strwtup) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

* StrokesWeightDown.jsx
* StrokesWeightUp.jsx

A set of two scripts that change the weight of the strokes of the selected paths relative to the current ones. To round weights, set the variable `isRound: true` otherwise `isRound: false`. To add strokes when the object has none, in StrokesWeightUp.jsx `isAddStroke: true`.   

* +/- 0.01 if weight <= 0.1
* +/- 0.2 if < 1
* +/- 0.5 if < 5
* +/- 1 if >= 5

Hold down <kbd>Alt</kbd> while running these scripts to open a dialog to adjust the strokes width by percentage or exactly > 0 or < 0.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/37981045-change-a-group-of-vector-s-stroke-size-relative-to) to add this feature to Illustrator.

![StrokesWeight](https://i.ibb.co/PwsgB7Q/Strokes-Weight.gif)

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