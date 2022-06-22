![header](https://i.ibb.co/mF018gV/emblem.png)
# Select | Adobe Illustrator Scripts

[![Yotube](https://img.shields.io/badge/-YouTube%20Channel-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

## 📜 Scripts
* NamedItemsFinder `(upd, 07.03.2022)`
* SelectAllLayersAbove `(new, 21.02.2022)`
* SelectAllLayersBelow `(new, 21.02.2022)`
* SelectBySwatches `(upd, 12.06.2022)`
* SelectOnlyPoints
* SelectPointsByType `(upd, 12.06.2022)`
* SelectRotatedItems `(new, 22.06.2022)`

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## Named Items Finder

Search items in the document by name and zoom to them contents. Inspired by Photoshop CC 2020 features.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove

The SelectAllLayersAbove script selects objects in all layers above the active layer. And the SelectAllLayersBelow script is in the layers below. If something is selected in the document, the parent layer of the selected object becomes active. Otherwise, the active layer is the layer that is selected in the Layers panel. Change `var isInclActive = false` in the code to `true` so that objects in the source layer are also selected.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectBySwatches

The Magic Wand tool selects objects that match the color of the sample. Selecting samples with the <kbd>Shift</kbd> key will select items of different colors. The script will select items if a fill or stroke color matches the colors selected in the Swatches panel.

![SelectBySwatches](https://i.ibb.co/q70XMd6/Select-By-Swatches.gif)

## SelectOnlyPoints

After using the Lasso tool <kbd>A</kbd> or Direct Selection Tool <kbd>Q</kbd>, both Points and Path segments are selected. 

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType

Selects points on the selected paths according to their type. Does the thing that even Astute Graphics plugins can't do :)   
Select `View → Hide Bounding Box` to see active points in real time.   

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

Finds rotated objects in a selection or in a document. If `isSkipRight: true`, then objects rotated 90, 180, 270 degrees are ignored, if `false` value, then all objects with rotation angle different from 0 degrees are selected.

![SelectRotatedItems](https://i.ibb.co/7YpGm9M/Select-Rotated-Items.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/kg4KLJh/download-en.png">
</a> 

## 💸 Donate
You can support my work on new scripts via [ЮMoney], [Donatty], [DonatePay]. [PayPal] is temporarily unavailable

[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin
[PayPal]: https://paypal.me/osokin/5usd

<a href="https://yoomoney.ru/to/410011149615582">
  <img width="147" height="40" src="https://i.ibb.co/448NHjM/yoomoney-badge.png" >
</a>

<a href="https://donatty.com/sergosokin">
  <img width="147" height="40" src="https://i.ibb.co/p2Qj9Fr/donatty-badge.png" >
</a>

<a href="https://new.donatepay.ru/@osokin">
  <img width="147" height="40" src="https://i.ibb.co/x1Yrn3K/donatepay-badge.png" >
</a>

## 🤝 Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

## ✉️ Contact
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.