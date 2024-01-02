![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Path | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-25k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [DivideBottomPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#dividebottompath) `new, 22.02.2023`
* [PointsMoveRandom](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#pointsmoverandom) `upd, 19.05.2023`
* [SetPointsCoordinates](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#setpointscoordinates) `new, 31.07.2023`
* [SplitPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#splitpath) `upd, 07.06.2023`
* [SubtractTopPath](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#subtracttoppath) `new, 03.04.2022`
* [TrimOpenEnds](https://github.com/creold/illustrator-scripts/blob/master/md/Path.ru.md#trimopenends) `upd, 22.02.2023`

## DivideBottomPath
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DivideBottomPath.jsx-FF6900.svg)](https://rebrand.ly/divbottp) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Разрезает нижний контур в местах пересечений с верхними. Нижний и верхние объекты должны быть с обводкой. Заменяет Pathfinder → Outline, который сбрасывает цвет и оставляет части верхних объектов. Инструмент Scissors (Ножницы) требует точного попадания и занимает много времени при большом количестве точек.  

> **Note**   
> Если хотите оставить верхние линии, то поменяйте `var isRmvTop = true` на `false`. Для перекрашивания сегментов в разные цвета `isRndColor = true`.

![DivideBottomPath](https://i.ibb.co/LrKDtTz/Divide-Bottom-Path.gif)

## Points Move Random
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-PointsMoveRandom.jsx-FF6900.svg)](https://rebrand.ly/ptsmovrnd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Перемещает случайным образом выбранные точки фигуры по осям X, Y. Дистанция сдвига генерируется в пределах заданного диапазона. Настройки переключаются горячими клавишами <kbd>Q</kbd> + подчеркнутая буква. Вместо <kbd>Q</kbd> можно задать свою клавишу-модификатор в коде `modKey: 'Q'`.

<a href="https://youtu.be/9wVTDWUAEmE">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![PointsMoveRandom](https://i.ibb.co/qNpdKTr/Points-Move-Random.gif)

## SetPointsCoordinates
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SetPointsCoordinates.jsx-FF6900.svg)](https://rebrand.ly/setptscrds) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Устанавливает общие координаты X, Y для выбранных точек. В панели Transform в Иллюстраторе после ввода числа в поля X, Y перемещается фигура, а не выбранные точки. Скрипт работает с линейками артборда или глобальными, которые переключаются в меню `View → Rulers`. Для перемещения точек на дельту используйте двойные символы `--` или `++` перед числом. Если у точек общая координата, то поле ввода будет предзаполнено. У Иллюстратора бывают погрешности координат, поэтому в коде можно скрипта задать величину погрешности `CFG.tolerance`, чтобы в её пределах показать координаты точек одинаковыми в диалоге.

![SetPointsCoordinates](https://i.ibb.co/KmR2gSS/Set-Points-Coordinates.gif)

## SplitPath
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SplitPath.jsx-FF6900.svg)](https://rebrand.ly/splpath) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт для фигурного разрезания незамкнутых линий. Стандартная панель Pathfinder в Illustrator пока не умеет этого.   

<a href="https://youtu.be/1_vUUFkTwxk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![SplitPath](https://i.ibb.co/c6HNZwJ/Split-Path.gif)

## SubtractTopPath
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SubtractTopPath.jsx-FF6900.svg)](https://rebrand.ly/subtoppath) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Вырезает верхнюю выбранную фигуру из лежащих под ней. Стандартная панель Pathfinder в Illustrator пока не умеет этого. Поменяйте значение `isRmvTop` на `false`, чтобы после вырезания объект не удалился. `isUseFS: true` ускоряет обработку при большом количестве объектов. 

> **Warning**   
> Некорректно работает с обводками внутрь и наружу (Align Stroke to Inside /  Outside). К таким объектам примените `Object → Path → Outline Stroke` перед запуском скрипта.

![SubtractTopPath](https://i.ibb.co/B3QL4k2/Subtract-Top-Path.gif)

## TrimOpenEnds
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-TrimOpenEnds.jsx-FF6900.svg)](https://rebrand.ly/trimends) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Удаляет концы незамкнутых линий до точек их пересечений. Заменяет ручную обработку инструментом Shape Builder.  

![TrimOpenEnds](https://i.ibb.co/J3ct3KN/Trim-Open-Ends.gif)

## Поддержка
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] (иностр. карты), [Tinkoff], [ЮMoney], [Donatty], [DonatePay]. Спасибо.   

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

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.