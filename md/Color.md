![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Color | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button.
2. The tab will open the script code.
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download.

## Scripts
* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `new, 27.03.2022`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `new, 18.04.2022`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorgroupreplacer) `new, 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#contrastchecker) `new, 07.09.2023`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `upd, 14.09.2022`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `upd, 30.09.2022`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops)
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#matchcolors) `new, 22.12.2023`
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
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif)

## ColorGroupReplacer
[![Direct](https://img.shields.io/badge/Direct%20Link-ColorGroupReplacer.jsx-FF6900.svg)](https://rebrand.ly/clrgrprplc) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Replaces the values of spot colours in one colour group with spot colours from another group by matching swatch names or by order. In the example, the Default group is replaced. If a color in the target group has the name `Accent`, the script will look for swatches with a name that contains the name of the target color. You don't need to create palettes with semantic names, just arrange the colors within the groups in the desired order and select the `By swatches order` option.

![ColorGroupReplacer](https://i.ibb.co/FVYrty0/Color-Group-Replacer.gif)

## ContrastChecker
[![Direct](https://img.shields.io/badge/Direct%20Link-ContrastChecker.jsx-FF6900.svg)](https://rebrand.ly/contchkr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Helps select color combinations for text and backgrounds, icons and other interface elements, and diagrams by checking the contrast of color pairs for  [WCAG 2.1](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast) compliance. The auto-correct ratio is set in the script code in the `CFG.defRatio: 4.5` variable.

* body, subtext (17 pt / 23 px regular) — 4,5:1 and above;   
* large text, headers (18 pt / 24 px regular or 14 pt / 19 px bold) — 3:1;   
* for non-text content (icons and actionable graphics) — 3:1, because they don't need to be read.


> **Warning**   
> Remember that contrast can vary depending on your monitor, device, environmental conditions, typefaces, and many other details. Using common sense can be more helpful than mindlessly following a rule. [Read more](https://ais.sergosokin.ru/color/contrast-checker/)

![ContrastChecker](https://i.ibb.co/YR2mvSY/Contrast-Checker.gif)

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
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## MatchColors
[![Direct](https://img.shields.io/badge/Direct%20Link-MatchColors.jsx-FF6900.svg)](https://rebrand.ly/matchclrs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Matches two groups of objects (paths, texts) or text objects characters by fill color. Colors are defined on paths, compound paths, or text. Other objects in groups are skipped.

> **Warning**   
> Scripts cannot copy/paste gradient angle and length properties. For this reason, only the gradient color is copied without its properties. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/47572073-control-the-angle-length-of-gradients-and-other)  to fix this.   

![MatchColors](https://i.ibb.co/dPyHSgY/Match-Colors.gif)

## DistributeGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-DistributeGradientStops.jsx-FF6900.svg)](https://rebrand.ly/distgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Distributes uniform spacing between all the gradients stops without changing the position of the outermost stops. 

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## RemoveGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-RemoveGradientStops.jsx-FF6900.svg)](https://rebrand.ly/rmvgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Removes intermediate color stops of gradient fill and stroke for selected objects.

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor
[![Direct](https://img.shields.io/badge/Direct%20Link-ReverseGradientColor.jsx-FF6900.svg)](https://rebrand.ly/rvsgradcol) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Reverse the order of gradient colors and their opacity. Does not reverse the locations of color stops.

> **Warning**   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill
[![Direct](https://img.shields.io/badge/Direct%20Link-StrokeColorFromFill.jsx-FF6900.svg)](https://rebrand.ly/strokefromfill) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Setting the Stroke color of object based on an his solid or gradient fill. The option to automatically add an stroke is not available for Mac OS users with an Illustrator older than CC 2020.   

![StrokeColorFromFill](https://i.ibb.co/8dtK1V3/demo-Stroke-Color-From-Fill.gif)

## Donate
Many scripts are free to download thanks to user support. Help me to develop new scripts and update existing ones by supporting my work with any amount via [Buymeacoffee], [Tinkoff], [ЮMoney], [Donatty], [DonatePay]. Thank you.

[Buymeacoffee]: https://www.buymeacoffee.com/osokin
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/osokin">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
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