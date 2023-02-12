![header](https://i.ibb.co/mF018gV/emblem.png)
# Color | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `(new, 27.03.2022)`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `(new, 18.04.2022)`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `(upd, 14.09.2022)`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `(upd, 30.09.2022)`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops)
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#strokecolorfromfill) `upd, 14.10.2022`

## AverageColors
[![Direct](https://img.shields.io/badge/Direct%20Link-AverageColors.jsx-FF6900.svg)](https://rebrand.ly/avgcols) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Averages the colors of selected objects or separately inside groups or gradients. The script skips objects without color or with a pattern. If nothing is selected, the script process all groups in the document. It has two modes: silent and dialog. Changing in `CFG.showUI`.   

Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![AverageColors](https://i.ibb.co/6bjPmLh/average-colors.gif) 

## ColorBlindSimulator
[![Direct](https://img.shields.io/badge/Direct%20Link-ColorBlindSimulator.jsx-FF6900.svg)](https://rebrand.ly/colblindsim) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Simulates color vision deficiency of 8 types. You can recolor objects or use only a preview. Adobe is limited to viewing two types in the `View > Proof Setup` menu and cannot apply colors. The script supports: paths, compound paths, text, fills and strokes. You can change the gamma correction in `CFG.gamma: 2.2` and activate the default preview `CFG.defPreview: true`. 

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif) 

## ConvertToGradient
[![Direct](https://img.shields.io/badge/Direct%20Link-ConvertToGradient.jsx-FF6900.svg)](https://rebrand.ly/cnvttograd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Convert a flat process color into a matching gradient.   
What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. Processes compound paths and groups of items.   
*Based on original script by [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*  

![ConvertToGradient](https://i.ibb.co/44tG9JP/demo-Convert-To-Gradient.gif) 

## CycleColors
[![Direct](https://img.shields.io/badge/Direct%20Link-CycleColors.jsx-FF6900.svg)](https://rebrand.ly/cyclecol) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Swaps the fill and stroke colors of the selected objects in order they have in the Layers panel. Preserves the weight of the strokes, but if an object has no stroke, the script copies one from another object. If your selected objects are in non-consecutive order, you may think that the `Forward` and `Backward` buttons move colors randomly. The `Reset` button doesn't return custom brushes and dash settings applied to strokes, but you You can use the native command `Undo` after closing the dialog box.   

The script by default remembers the position of the dialog window on the screen, to make it open centered, replace `CFG.isResWinPos: true` with `false` in the code.

![CycleColors](https://i.ibb.co/qNXFHry/cycle-colors.gif)

## CycleGradient
[![Direct](https://img.shields.io/badge/Direct%20Link-CycleGradient.jsx-FF6900.svg)](https://rebrand.ly/cyclegrad) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

* CycleGradient.jsx (UI version)
* CycleGradientBackward.jsx
* CycleGradientForward.jsx
* CycleGradientRandom.jsx   

A set of 4 scripts that change the color order of gradient stops. The position of the stops and opacity don't change. 

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## DistributeGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-DistributeGradientStops.jsx-FF6900.svg)](https://rebrand.ly/distgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Distributes uniform spacing between all the gradients stops without changing the position of the outermost stops. 

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.  

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## RemoveGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-RemoveGradientStops.jsx-FF6900.svg)](https://rebrand.ly/rmvgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Removes intermediate color stops of gradient fill and stroke for selected objects.

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.  

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor
[![Direct](https://img.shields.io/badge/Direct%20Link-ReverseGradientColor.jsx-FF6900.svg)](https://rebrand.ly/rvsgradcol) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Reverse the order of gradient colors and their opacity. Does not reverse the locations of color stops.

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.  

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill
[![Direct](https://img.shields.io/badge/Direct%20Link-StrokeColorFromFill.jsx-FF6900.svg)](https://rebrand.ly/strokefromfill) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Setting the Stroke color of object based on an his solid or gradient fill. The option to automatically add an stroke is not available for Mac OS users with an Illustrator older than CC 2020.   

![StrokeColorFromFill](https://i.ibb.co/8dtK1V3/demo-Stroke-Color-From-Fill.gif)

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