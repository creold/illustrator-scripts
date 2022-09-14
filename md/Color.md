![header](https://i.ibb.co/mF018gV/emblem.png)
# Color | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-23k-27CF7D.svg) [![Yotube](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## 📜 Scripts
* AverageColors `(new, 27.03.2022)`
* ColorBlindSimulator `(new, 18.04.2022)`
* ConvertToGradient `(upd, 14.09.2022)`
* CycleColors `(upd, 01.08.2022)`
* CycleGradient
* DistributeGradientStops
* RemoveGradientStops
* ReverseGradientColor
* StrokeColorFromFill `(upd, 14.09.2022)`

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## AverageColors

Averages the colors of selected objects or separately inside groups or gradients. The script skips objects without color or with a pattern. If nothing is selected, the script process all groups in the document. It has two modes: silent and dialog. Changing in `CFG.showUI`.   

Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![AverageColors](https://i.ibb.co/6bjPmLh/average-colors.gif) 

## ColorBlindSimulator

Simulates color vision deficiency of 8 types. You can recolor objects or use only a preview. Adobe is limited to viewing two types in the `View > Proof Setup` menu and cannot apply colors. The script supports: paths, compound paths, text, fills and strokes. You can change the gamma correction in `CFG.gamma: 2.2` and activate the default preview `CFG.defPreview: true`. Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif) 

## ConvertToGradient

Convert a flat process color into a matching gradient.   
What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. Processes compound paths and groups of items.   
*Based on original script by [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*  

![ConvertToGradient](https://i.ibb.co/44tG9JP/demo-Convert-To-Gradient.gif) 

## CycleColors

Swaps the fill and stroke colors of the selected objects in order they have in the Layers panel. Preserves the weight of the strokes, but if an object has no stroke, the script copies one from another object. If your selected objects are in non-consecutive order, you may think that the `Forward` and `Backward` buttons move colors randomly. The `Revert` button doesn't return custom brushes and dash settings applied to strokes, but you You can use the native command `Undo` after closing the dialog box.

![CycleColors](https://i.ibb.co/3zk9Jgs/Cycle-Colors.gif)

## CycleGradient

* CycleGradient.jsx (UI version)
* CycleGradientBackward.jsx
* CycleGradientForward.jsx
* CycleGradientRandom.jsx   

A set of 4 scripts that change the color order of gradient stops. The position of the stops and opacity don't change. Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## DistributeGradientStops

Distributes uniform spacing between all the gradients stops without changing the position of the outermost stops. Unfortunately, the copied gradients are one swatch in the Illustrator. Manually break the link by changing the gradient twice with the `Reverse Gradient` button.  

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## RemoveGradientStops

Removes intermediate color stops of gradient fill and stroke for selected objects.

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor

Reverse the order of gradient colors and their opacity. Does not reverse the locations of color stops. If a gradient is copied from another object with the Eyedropper Tool (I), the Illustrator will think that they have the same gradient. Use the Reverse Gradient button in the Gradient panel instead then.   

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill

Setting the Stroke color of object based on an his solid or gradient fill. The option to automatically add an stroke is not available for Mac OS users with an Illustrator older than CC 2020.   

![SplitPath](https://i.ibb.co/8dtK1V3/demo-Stroke-Color-From-Fill.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## 💸 Donate
You can support my work on new scripts via [Tinkoff], [ЮMoney], [Donatty], [DonatePay]. [PayPal] is temporarily unavailable

[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405/
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin
[PayPal]: https://paypal.me/osokin/5usd

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