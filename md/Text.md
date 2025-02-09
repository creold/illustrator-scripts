![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Text | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Downloads-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram%20Channel-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[Back to homepage](../README.md)

### How to download one script 
1. In the script description, click the "Direct Link" button
2. The tab will open the script code
3. Press <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd> for download
4. If you see ".jsx.txt" in the name when saving, delete ".txt"

## Scripts
* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#aligntextbaseline) `v0.1.1 — upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#makenumberssequence) `v0.5 — upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#multiedittext) `v0.2.2 — upd, 12.04.2024`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.md#replaceformattedtext) `v0.1 — 29.12.2022`

## AlignTextBaseline
[![Direct](https://img.shields.io/badge/Direct%20Link-AlignTextBaseline.jsx-FF6900.svg)](https://rebrand.ly/algntxtbl) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Allows point texts to be vertically aligned based on the baseline of its font, not its bounds. The native Align panel is tied either to the bounding box of the point text or to the curves via Align to Glyph Bounds, which does not give a consistent result for mixed fonts and sizes.

> [!NOTE]   
> Vote on [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/43970070-align-text-elements-on-their-baseline) to add this feature to Illustrator.

![AlignTextBaseline](https://i.ibb.co/SVbx89c/Align-Text-Baseline.gif)

## MakeNumbersSequence
[![Direct](https://img.shields.io/badge/Direct%20Link-MakeNumbersSequence.jsx-FF6900.svg)](https://rebrand.ly/mknumseq) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Fills a range of selected text items with numbers incremented based on the input data. Can only replace numbers or `{%N}` placeholder within the selected text objects.

<a href="https://youtu.be/02SLTH26sMQ">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![MakeNumbersSequence](https://i.ibb.co/VgqTcKw/Make-Numbers-Sequence.gif)

## MultiEditText
[![Direct](https://img.shields.io/badge/Direct%20Link-MultiEditText.jsx-FF6900.svg)](https://rebrand.ly/metxt) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Multi-editing of selected text frames. The script allows you to enter the same text, replace the current text frame content or add the entered text to the current one.

* Keep Para Format - keep the appearance of paragraphs. The amount of text affects performance. Preview will be disabled
* Edit Separately - edit contents of frames separately, contents are separated by `@@@@` symbols.
* List by XY - sort the order of texts by their position, otherwise they will be displayed in order in layers
* Reverse Apply - replace contents in reverse order

> [!TIP]   
> If you want to change the size of the text area, open the script file with a text editor and change the CFG `width: 300` and `height: 210` to another value. The key to displaying different content is `ph: '<text>'` and the text divider `divider: '\n@@@@@\n'`, where `\n` is a line break. `softBreak: '@#'` — soft line break char.   
> For a line break (new paragraph), use <kbd>Ctrl</kbd> + <kbd>Enter</kbd> on a PC or <kbd>Enter</kbd> on Mac OS. To insert a soft line break chat (no paragraph indent), press <kbd>Shift</kbd> + <kbd>Enter</kbd>.

<a href="https://youtu.be/PcyT0KmuepI">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

See also [Adobe Photoshop version](https://github.com/creold/photoshop-scripts)   

![MultiTextEdit](https://i.ibb.co/58HHRFK/Multi-Edit-Text.gif)

## ReplaceFormattedText
[![Direct](https://img.shields.io/badge/Direct%20Link-ReplaceFormattedText.jsx-FF6900.svg)](https://rebrand.ly/rplcfmtdtxt) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Pasting text from the clipboard without formatting, preserving the paragraph styles of the original text. The style is saved from the first character of each paragraph.

![ReplaceFormattedText](https://i.ibb.co/LQGmg1W/Replace-Formatted-Text.gif)

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