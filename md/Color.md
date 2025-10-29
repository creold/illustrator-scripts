![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Color | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-135k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#averagecolors) `v0.1 — 27.03.2022`
* [BeautifySwatchNames](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#beautifyswatchnames) `v0.1 — new, 31.10.2024`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorblindsimulator) `v0.1 — 18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorcorrector) `v0.1.2 — upd, 14.02.2025`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#colorgroupreplacer) `v0.1 — 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#contrastchecker) `v0.1.1 — upd, 23.07.2024`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#converttogradient) `v0.1.4 — upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclecolors) `v0.4.2 — upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#cyclegradient) `v0.1 — 10.2021`
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#distributegradientstops) `v0.1 — 08.2021`
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#matchcolors) `v0.2.1 — upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#removegradientstops) `v0.1 — 09.2021`
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#reversegradientcolor) `v0.1 — 08.2020`
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.md#strokecolorfromfill) `v0.4.1 — upd, 12.02.2024`

## AverageColors
[![Direct](https://img.shields.io/badge/Direct%20Link-AverageColors.jsx-FF6900.svg)](https://link.aiscripts.ru/avgcols) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Averages the colors of selected objects or separately inside groups or gradients. The script skips objects without color or with a pattern. If nothing is selected, the script process all groups in the document. It has two modes: silent and dialog. Changing in `CFG.showUI`.   

Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![AverageColors](https://i.ibb.co/6bjPmLh/average-colors.gif) 

## BeautifySwatchNames
[![Direct](https://img.shields.io/badge/Direct%20Link-BeautifySwatchNames.jsx-FF6900.svg)](https://link.aiscripts.ru/bswn) [![Direct2](https://img.shields.io/badge/Direct%20Link-BeautifySwatchNames%20Lite.jsx-48C794.svg)](https://link.aiscripts.ru/bswnlite) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Assigns unique names to selected colors in the Swatches panel. You can create associative palettes like those found in some corporate brandbooks. Using the script, you can get "Jasmine Green" instead of the default "R=122 G=201 B=67" or "Saffron Gold" instead of "C=0 M=50 Y=100 K=0".   

* BeautifySwatchNames — 30,241 colors. For those who want to describe colors in as many ways as possible. The names can be unconventional: Midnight in Saigon, Black Dragon's Caldron, Shawarma, Worcestershire Sauce.

* BeautifySwatchNames Lite — 4,506 colors. Works faster, but because of the reduced base, more similar colors get the same name.

The script's color library was imported from [Color Names](https://github.com/meodai/color-names)

[More about script](https://ais.sergosokin.ru/color/beautify-swatch-names/)

![BeautifySwatchNames](https://i.ibb.co/1KN1cfD/Beautify-Swatch-Names.gif)

## ColorBlindSimulator
[![Direct](https://img.shields.io/badge/Direct%20Link-ColorBlindSimulator.jsx-FF6900.svg)](https://link.aiscripts.ru/colblindsim) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Simulates color vision deficiency of 8 types. You can recolor objects or use only a preview. Adobe is limited to viewing two types in the `View > Proof Setup` menu and cannot apply colors. The script supports: paths, compound paths, text, fills and strokes. You can change the gamma correction in `CFG.gamma: 2.2` and activate the default preview `CFG.defPreview: true`. 

> [!WARNING]   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/40882126-simulate-color-blindness-for-accessibility) to add this feature to Illustrator.

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif)

## ColorCorrector
[![Direct](https://img.shields.io/badge/Direct%20Link-ColorCorrector.jsx-FF6900.svg)](https://link.aiscripts.ru/clrcrct) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

In Illustrator prior to CS4, you could set the same color channel values for multiple objects. As of CS5, this feature is no longer available. The script allows you to change the fill and stroke channel values as follows   

1. Set exact numeric values
2. Apply +, -, *, / mathematical operations
3. Calculate the value of one channel relative to another by its name

For RGB or CMYK document mode, the script changes the input field list.

<a href="https://youtu.be/2Vi9YPGTXEE">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>  

![ColorCorrector](https://i.ibb.co/Wyd976r/Color-Corrector.gif)

## ColorGroupReplacer
[![Direct](https://img.shields.io/badge/Direct%20Link-ColorGroupReplacer.jsx-FF6900.svg)](https://link.aiscripts.ru/clrgrprplc) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Replaces the values of spot colours in one colour group with spot colours from another group by matching swatch names or by order. In the example, the Default group is replaced. If a color in the target group has the name `Accent`, the script will look for swatches with a name that contains the name of the target color. You don't need to create palettes with semantic names, just arrange the colors within the groups in the desired order and select the `By swatches order` option.

![ColorGroupReplacer](https://i.ibb.co/FVYrty0/Color-Group-Replacer.gif)

## ContrastChecker
[![Direct](https://img.shields.io/badge/Direct%20Link-ContrastChecker.jsx-FF6900.svg)](https://link.aiscripts.ru/contchkr) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Helps select color combinations for text and backgrounds, icons and other interface elements, and diagrams by checking the contrast of color pairs for  [WCAG 2.1](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast) compliance. The auto-correct ratio is set in the script code in the `CFG.defRatio: 4.5` variable.

* body, subtext (17 pt / 23 px regular) — 4,5:1 and above;   
* large text, headers (18 pt / 24 px regular or 14 pt / 19 px bold) — 3:1;   
* for non-text content (icons and actionable graphics) — 3:1, because they don't need to be read.


> [!WARNING]   
> Remember that contrast can vary depending on your monitor, device, environmental conditions, typefaces, and many other details. Using common sense can be more helpful than mindlessly following a rule. [Read more](https://ais.sergosokin.ru/color/contrast-checker/)  

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657/suggestions/49525937) to add this feature to Illustrator.   

<a href="https://youtu.be/rlKrraKJ91U">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ContrastChecker](https://i.ibb.co/wwRPNVD/Contrast-Checker.gif)

## ConvertToGradient
[![Direct](https://img.shields.io/badge/Direct%20Link-ConvertToGradient.jsx-FF6900.svg)](https://link.aiscripts.ru/cnvttograd) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Convert a flat process color into a matching gradient.   
What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. Processes compound paths and groups of items.   
*Based on original script by [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*  

The Pro version with more options is available at [Buymeacoffee](https://buymeacoffee.com/aiscripts/e/410661)   

<a href="https://youtu.be/a0-FH_sAHyY/">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ConvertToGradient](https://i.ibb.co/44tG9JP/demo-Convert-To-Gradient.gif)

## CycleColors
[![Direct](https://img.shields.io/badge/Direct%20Link-CycleColors.jsx-FF6900.svg)](https://link.aiscripts.ru/cyclecol) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Swaps the fill and stroke colors of the selected objects in order they have in the Layers panel. Preserves the weight of the strokes, but if an object has no stroke, the script copies one from another object. If your selected objects are in non-consecutive order, you may think that the `Forward` and `Backward` buttons move colors randomly. The `Reset` button doesn't return custom brushes and dash settings applied to strokes, but you You can use the native command `Undo` after closing the dialog box.   

The script by default remembers the position of the dialog window on the screen, to make it open centered, replace `CFG.isResWinPos: true` with `false` in the code.

![CycleColors](https://i.ibb.co/qNXFHry/cycle-colors.gif)

## CycleGradient
[![Direct](https://img.shields.io/badge/Direct%20Link-CycleGradient.jsx-FF6900.svg)](https://link.aiscripts.ru/cyclegrad) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

* CycleGradient.jsx (UI version)
* CycleGradientBackward.jsx
* CycleGradientForward.jsx
* CycleGradientRandom.jsx   

A set of 4 scripts that change the color order of gradient stops. The position of the stops and opacity don't change. 

> [!WARNING]   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## MatchColors
[![Direct](https://img.shields.io/badge/Direct%20Link-MatchColors.jsx-FF6900.svg)](https://link.aiscripts.ru/matchclrs) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Matches two groups of objects (paths, texts) or text objects characters by fill color. Can recolor selected objects in selected color swatches in the Swatches panel. Colors are defined on paths, compound paths, or text. Other objects in groups are skipped.

> [!WARNING]   
> Scripts cannot copy/paste gradient angle and length properties. For this reason, only the gradient color is copied without its properties. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/47572073-control-the-angle-length-of-gradients-and-other) to fix this.   

![MatchColors](https://i.ibb.co/dPyHSgY/Match-Colors.gif)

## DistributeGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-DistributeGradientStops.jsx-FF6900.svg)](https://link.aiscripts.ru/distgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Distributes uniform spacing between all the gradients stops without changing the position of the outermost stops. 

> [!WARNING]   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## RemoveGradientStops
[![Direct](https://img.shields.io/badge/Direct%20Link-RemoveGradientStops.jsx-FF6900.svg)](https://link.aiscripts.ru/rmvgradstops) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Removes intermediate color stops of gradient fill and stroke for selected objects.

> [!WARNING]   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor
[![Direct](https://img.shields.io/badge/Direct%20Link-ReverseGradientColor.jsx-FF6900.svg)](https://link.aiscripts.ru/rvsgradcol) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Reverse the order of gradient colors and their opacity. Does not reverse the locations of color stops.

> [!WARNING]   
> Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button. Vote on [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) to fix this.   

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill
[![Direct](https://img.shields.io/badge/Direct%20Link-StrokeColorFromFill.jsx-FF6900.svg)](https://link.aiscripts.ru/strokefromfill) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Applies a color from its solid or gradient fill to the stroke of each selected path. If the fill is a gradient, the colors of all gradient stops are averaged for the stroke color.    

> [!WARNING]   
> Don't put this script in the action slot for a quick run. It will freeze Illustrator.

![StrokeColorFromFill](https://i.ibb.co/dkW64ZV/Stroke-Color-From-Fill.gif)

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