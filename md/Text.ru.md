![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Text | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-88k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [AlignTextBaseline](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#aligntextbaseline) `v0.1.1 — upd, 09.02.2024`
* [MakeNumbersSequence](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#makenumberssequence) `v0.5 — upd, 26.03.2024`
* [MultiEditText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#multiedittext) `v0.2.2 — upd, 12.04.2024`
* [ReplaceFormattedText](https://github.com/creold/illustrator-scripts/blob/master/md/Text.ru.md#replaceformattedtext) `v0.1 — 29.12.2022`

## AlignTextBaseline
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-AlignTextBaseline.jsx-FF6900.svg)](https://rebrand.ly/algntxtbl) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выравнивает текстовые слои по вертикали по базовым линиям. Распределение через стандартную панель Align привязано либо к габаритным рамкам строчных текстов, либо к выносным элементам через Align to Glyph Bounds, что не даёт ровного результата на смешанных шрифтах.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/43970070-align-text-elements-on-their-baseline) за внедрение этой функции в Иллюстратор.

![AlignTextBaseline](https://i.ibb.co/SVbx89c/Align-Text-Baseline.gif)

## MakeNumbersSequence
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MakeNumbersSequence.jsx-FF6900.svg)](https://rebrand.ly/mknumseq) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Заменяет выделенные текстовые объекты диапазоном чисел с шагом, заданным в диалоговом окне. Может заменять внутри выбранных текстовых объектов только числа или плейсхолдер `{%N}`.

<a href="https://youtu.be/02SLTH26sMQ">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![MakeNumbersSequence](https://i.ibb.co/VgqTcKw/Make-Numbers-Sequence.gif)

## MultiEditText
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MultiEditText.jsx-FF6900.svg)](https://rebrand.ly/metxt) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Мультиредактирование выбранных текстовых объектов. Скрипт позволяет вводить одинаковый текст, заменяя текущее содержимое текстового фрейма или добавляя введенный текст к текущему.

* Keep Para Format - сохранить оформление абзацев. Количество текста влияет на производительность. Предпросмотр будет отключен
* Edit Separately - редактировать содержимое фреймов раздельно, контент разделяется символами `@@@`
* List by XY - сортировать порядок текстов по их позиции, иначе выводится по порядку в слоях
* Reverse Apply - заменить контент в обратном порядке

> [!TIP]   
> Если хотите изменить размер текстовой области, то откройте файл скрипта текстовым редактором и поменяйте CFG `width: 300` и `height: 210` на другое число. Ключ для отображения разного контента `ph: '<text>'` и разделитель текстов `divider: '\n@@@\n'`, где `\n` — перенос строки.`softBreak: '@#'` — символ мягкого переноса.   
> Для переноса строки (новый абзац) используйте <kbd>Ctrl</kbd> + <kbd>Enter</kbd> на ПК или <kbd>Enter</kbd> на Mac OS. Для вставки специального символа мягкого переноса (без абзацного отступа) нажмите <kbd>Shift</kbd> + <kbd>Enter</kbd>.

<a href="https://youtu.be/PcyT0KmuepI">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

Смотрите также [версию для Adobe Photoshop](https://github.com/creold/photoshop-scripts)   

![MultiTextEdit](https://i.ibb.co/58HHRFK/Multi-Edit-Text.gif)

## ReplaceFormattedText
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ReplaceFormattedText.jsx-FF6900.svg)](https://rebrand.ly/rplcfmtdtxt) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Вставляет текст из буфера обмена без форматирования, сохраняя стили исходных абзацев выбранного текстового объекта. Стили сохраняются по первым символам каждого абзаца.

![ReplaceFormattedText](https://i.ibb.co/LQGmg1W/Replace-Formatted-Text.gif)

## Поддержка
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] `USD`, [ЮMoney] `RUB`, [Tinkoff] `RUB`, Donatty] `RUB`, [DonatePay] `RUB`. Спасибо.   

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

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.