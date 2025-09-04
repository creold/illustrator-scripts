![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Style | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-112k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [AverageStrokesWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#averagestrokeswidth) `v0.1 — 07.02.2023`
* [ChangeOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#changeopacity) `v0.2 — upd, 01.09.2025`
* [GrayscaleToOpacity](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#grayscaletoopacity) `v0.1`
* [MakeTrappingStroke](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#maketrappingstroke) `v0.1.1 — upd, 09.02.2024`
* [OpacityMaskClip](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#opacitymaskclip) `v0.3 — upd, 05.03.2024`
* [RandomStrokeWidth](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#randomstrokewidth) `v0.1.2 — upd, 14.10.2022`
* [StrokesWeightUp](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `v0.3 — upd, 23.07.2024`
* [StrokesWeightDown](https://github.com/creold/illustrator-scripts/blob/master/md/Style.ru.md#strokesweight) `v0.3 — upd, 23.07.2024`

## AverageStrokesWidth
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-AverageStrokesWidth.jsx-FF6900.svg)](https://link.aiscripts.ru/avgstrwd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Усредняет толщину обводок выбранных объектов, пропуская те, что без обводки. Поддерживает пути, компаунды и текстовые объекты. 

![AverageStrokesWidth](https://i.ibb.co/3shb651/Average-Strokes-Width.gif)

## ChangeOpacity
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ChangeOpacity.jsx-FF6900.svg)](https://link.aiscripts.ru/chngopa) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Управляет прозрачностью выбранных объектов.

* В режиме точного ввода можно использовать числа и математические операции: +, -, *, /. Например, /2 — уменьшить прозрачность вдвое.
* Генерация случайной прозрачности.  
1) Случайное значение в заданном диапазоне с шагом   
2) Изменение текущего значения на ±X%   
3) Случайное распределение Гаусса

Apply to Objects Inside Groups — изменять прозрачность вложенных объектов в группах. 

![ChangeOpacity](https://i.ibb.co/B5bc2NnT/Change-Opacity.gif)

## GrayscaleToOpacity
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-GrayscaleToOpacity.jsx-FF6900.svg)](https://link.aiscripts.ru/graytoopa) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Преобразует цвет выбранных объектов в оттенки серого (Grayscale) и устанавливает прозрачность (Opacity) численно равную каналу серого цвета.

![GrayscaleToOpacity](https://i.ibb.co/qY1Cx68/Grayscale-To-Opacity.gif)

## MakeTrappingStroke
[![Direct](https://img.shields.io/badge/Direct%20Link-MakeTrappingStroke.jsx-FF6900.svg)](https://link.aiscripts.ru/mktrapstroke) [![Download](https://img.shields.io/badge/Download%20All-Zip%20archive-0088CC.svg)](https://bit.ly/2M0j95N)

Для препресса применяет к обводке цвет на основе заливки объекта при включенном атрибуте Overprint Stroke. 

> [!IMPORTANT]   
> В Мак ОС версии Иллюстратора обводки не всегда добавляются на несколько объектов с опцией `Force add stroke`. Если столкнулись с проблемой, то добавьте вручную любую обводку объектам и потом запустите скрипт.

![MakeTrappingStroke](https://i.ibb.co/QQkJ451/Make-Trapping-Stroke.gif)

## OpacityMaskClip
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-OpacityMaskClip.jsx-FF6900.svg)](https://link.aiscripts.ru/opamclip) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Активирует чекбокс `Clip` в панели `Transparency > Opacity Mask` для выделенных объектов с масками прозрачности.

> [!WARNING]   
> Не добавляйте этот скрипт в панель операций (Action) для быстрого запуска. Это приведёт к зависанию Иллюстратора.

![OpacityMaskClip](https://i.ibb.co/Kbn4vqB/Opacity-Mask-Clip.gif)

## RandomStrokeWidth
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RandomStrokeWidth.jsx-FF6900.svg)](https://link.aiscripts.ru/rndstrwd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Применяет случайное значение из диапазона с заданным шагом к толщине обводки выбранных объектов. Единицы измерения берет из `Preferences > Units > Stroke`. Существует два режима: тихий запуск и диалоговый. Меняется в `CFG.showUI`.   

Эти режимы меняются без правки кода, если удерживать клавишу Alt при запуске:

* <kbd>Alt</kbd> + `CFG.showUI: false` — появится диалог
* <kbd>Alt</kbd> + `CFG.showUI: true` — скрипт сработает с последними использованными опциями

![RandomStrokeWidth](https://i.ibb.co/PQN1qkV/Random-Stroke-Width.gif)

## StrokesWeight
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-StrokesWeightDown.jsx-FF6900.svg)](https://link.aiscripts.ru/strwtdn) [![Direct](https://img.shields.io/badge/Прямая%20ссылка-StrokesWeightUp.jsx-FF6900.svg)](https://link.aiscripts.ru/strwtup) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

* StrokesWeightDown.jsx
* StrokesWeightUp.jsx

Набор из двух отдельных скриптов, которые меняют толщину обводок относительно текущих у выбранных путей. Для округления толщин установите переменную `isRound: true` иначе `isRound: false`. Для добавления обводок, если их не было у объекта, в скрипте StrokesWeightUp.jsx `isAddStroke: true`

* +/- 0,01 единиц, если толщина < 0,1
* +/- 0.2, если < 1
* +/- 0.5, если < 5
* +/- 1, если >= 5

Удерживайте <kbd>Alt</kbd> при запуске этих скриптов, чтобы открылся диалог изменения толщин в процентах или на точную величину > 0 или < 0.

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/37981045-change-a-group-of-vector-s-stroke-size-relative-to) за внедрение этой функции в Иллюстратор.

![StrokesWeight](https://i.ibb.co/PwsgB7Q/Strokes-Weight.gif)

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