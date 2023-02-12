![header](https://i.ibb.co/mF018gV/emblem.png)
# Path | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-23k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#pointsmoverandom) `upd, 22.12.2022`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#splitpath) `(upd, 10.11.2022)`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#subtracttoppath) `(new, 03.04.2022)`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#trimopenends) `(new, 27.01.2023)`

## Points Move Random
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-PointsMoveRandom.jsx-FF6900.svg)](https://rebrand.ly/ptsmovrnd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Перемещает случайным образом выбранные точки фигуры по осям X, Y. Дистанция сдвига генерируется в пределах заданного диапазона. Настройки переключаются горячими клавишами <kbd>Q</kbd> + подчеркнутая буква. Вместо <kbd>Q</kbd> можно задать свою клавишу-модификатор в коде `modKey: 'Q'`.

<a href="https://youtu.be/9wVTDWUAEmE">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![PointsMoveRandom](https://i.ibb.co/9ZsRQJk/demo-Points-Move-Random.gif)

## SplitPath
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SplitPath.jsx-FF6900.svg)](https://rebrand.ly/splpath) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт для фигурного разрезания незамкнутых линий. Стандартная панель Pathfinder в Illustrator пока не умеет этого.   

<a href="https://youtu.be/1_vUUFkTwxk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![SplitPath](https://i.ibb.co/55fmqgY/demo-Split-Path.gif)

## SubtractTopPath
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SubtractTopPath.jsx-FF6900.svg)](https://rebrand.ly/subtoppath) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Вырезает верхнюю выбранную фигуру из лежащих под ней. Стандартная панель Pathfinder в Illustrator пока не умеет этого. Поменяйте значение `isRmvTop` на `false`, чтобы после вырезания объект не удалился. `isUseFS: true` ускоряет обработку при большом количестве объектов. 

> **Warning**   
> Некорректно работает с обводками внутрь и наружу (Align Stroke to Inside /  Outside). К таким объектам примените `Object > Path > Outline Stroke` перед запуском скрипта.

![SubtractTopPath](https://i.ibb.co/B3QL4k2/Subtract-Top-Path.gif)

## TrimOpenEnds
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-TrimOpenEnds.jsx-FF6900.svg)](https://rebrand.ly/trimends) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Удаляет концы незамкнутых линий до точек их пересечений. Заменяет ручную обработку инструментом Shape Builder.  

![TrimOpenEnds](https://i.ibb.co/J3ct3KN/Trim-Open-Ends.gif)

## Поддержка
Вы можете поддержать мою работу над новыми скриптами и их распространение любой суммой через [Buymeacoffee], [FanTalks] (иностр. карты), [Tinkoff], [ЮMoney], [Donatty], [DonatePay].   

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

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.