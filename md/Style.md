![header](https://i.ibb.co/mF018gV/emblem.png)
# Style | Adobe Illustrator Scripts

[![Yotube](https://img.shields.io/badge/-YouTube%20Channel-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## 📜 Scripts
* ChangeOpacity
* GrayscaleToOpacity
* OpacityMaskClip
* StrokesWeightUp
* StrokesWeightDown

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## ChangeOpacity

Set the exact Opacity value of the selected objects. The plus or minus sign before a number will shift relative to the current value at each object. Inside Clipping Groups does not change the Opacity of the mask itself. But you can add masks if you change `inclMask: false` to `true` in the code. 

![ChangeOpacity](https://i.ibb.co/zP3Vkww/Change-Opacity.gif)

## GrayscaleToOpacity

Convert selection colors to Grayscale and set identical Opacity value.

![GrayscaleToOpacity](https://i.ibb.co/DVfGtkz/Grayscale-To-Opacity.gif)

## OpacityMaskClip

The script activates `Clip` checkbox in `Transparency > Opacity Mask`.

![OpacityMaskClip](https://i.ibb.co/k0CBJKq/Opacity-Mask-Clip.gif)

## RandomStrokeWidth

Sets random stroke width of selected objects in a range with steps. The stroke unit is taken from `Preferences > Units > Stroke`. It has two modes: silent and dialog. Changing in `CFG.showUI`.   

Modes change without editing the code if you hold down the <kbd>Alt</kbd> key when running the script:

* <kbd>Alt</kbd> + `CFG.showUI: false` the dialog will be shown
* <kbd>Alt</kbd> + `CFG.showUI: true` silent mode with the latest options

![RandomStrokeWidth](https://i.ibb.co/PQN1qkV/Random-Stroke-Width.gif) 

## StrokesWeight

* StrokesWeightDown.jsx
* StrokesWeightUp.jsx

A set of two scripts that change the weight of the strokes of the selected paths relative to the current ones. To round weights, set the variable `isRoundWeight = true` otherwise `isRoundWeight = false`.  

* +/- 0.01 if weight <= 0.1
* +/- 0.2 if < 1
* +/- 0.5 if < 5
* +/- 1 if >= 5

![StrokesWeight](https://i.ibb.co/kKXhnxN/Strokes-Weight.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## 💸 Donate
You can support my work on new scripts via [PayPal], [ЮMoney] or [Donatty].  

[PayPal]: https://paypal.me/osokin/3usd
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin

<a href="https://paypal.me/osokin/3usd">
  <img width="147" height="40" src="https://i.ibb.co/Z8Wd8Sn/paypal-badge.png" >
</a>

<a href="https://yoomoney.ru/to/410011149615582">
  <img width="147" height="40" src="https://i.ibb.co/448NHjM/yoomoney-badge.png" >
</a>

<a href="https://donatty.com/sergosokin">
  <img width="147" height="40" src="https://i.ibb.co/p2Qj9Fr/donatty-badge.png" >
</a>

## 🤝 Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

## ✉️ Contact
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.