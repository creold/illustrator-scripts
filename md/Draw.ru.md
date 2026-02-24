![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Draw | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-167k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [DrawPathBySelectedPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#drawpathbyselectedpoints) `v0.1 — 10.03.2023`
* [DrawRectanglesByArtboards](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#drawrectanglesbyartboards) `v0.4 — upd, 19.02.2026`
* [NumeratesPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#numeratespoints) `v0.3.3 — upd, 22.12.2022`
* [RandomScribble](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#randomscribble) `v0.1.3 — upd, 09.02.2024`
* [TriangleMaker](https://github.com/creold/illustrator-scripts/blob/master/md/Draw.ru.md#trianglemaker) `v0.2 — new, 31.03.2025`

## DrawPathBySelectedPoints
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DrawPathBySelectedPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/drawbyselpts) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Рисует многоугольник по выбранным точкам фигур. Чтобы не было самопересечений скрипт сортирует выбранные точки по полярным координатам от геометрического центра фигуры с вершинами в точках. Так формируется направление рисования многоугольника.

Параметр в коде `isClose` — замыкать многоугольник (true) или оставлять первую и последнюю точку (false).

![DrawPathBySelectedPoints](https://i.ibb.co/3CqGhj7/Draw-Path-By-Selected-Points.gif)

## DrawRectanglesByArtboards
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DrawRectanglesByArtboards.jsx-FF6900.svg)](https://link.aiscripts.ru/drawrectbyab) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Рисует прямоугольники по размеру артбордов. В опции Custom можно вводить диапазоны номеров артбордов через запятую и дефис. Если в параметрах документа установлены выпуски за обрез и документ сохранен, то в полях Bleed по умолчанию будет это значение.

Параметры в коде:

* `layer: 'Rectangles'` — имя слоя с прямоугольниками для опции New Layer, 
* `isLower: false` — рисовать ниже остальных объектов (true) или выше (false).

![DrawRectanglesByArtboards](https://i.ibb.co/yQ2sfQk/Draw-Rectangles-By-Artboard.gif)

## NumeratesPoints
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-NumeratesPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/numpts) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Нумерует выделенные точки и помечает их круглыми маркерами. Пригодится, например, для создания рисунков в стиле «Соедини по точкам (цифрам)».

![NumeratesPoints](https://i.ibb.co/bdJ8tvV/Numerates-Points.gif)

## RandomScribble
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RandomScribble.jsx-FF6900.svg)](https://link.aiscripts.ru/randscrib) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Создаёт случайные пути с заданным количеством точек. Это могут быть случайные отрезки из 2 точек или сложные фигуры, имитирующие каракули. Точки не выходят за границы активного артборда. Если в документе сначала выделили несколько фигур, то скрипт сгенерирует отдельные пути с точками, лежащими в пределах их границ (bounding box).

![RandomScribble](https://i.ibb.co/b6FftPk/Random-Scribble.gif)

## TriangleMaker
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-TriangleMaker.jsx-FF6900.svg)](https://link.aiscripts.ru/trimkr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Создаёт треугольник заданного размера по сторонам, углам по центру экрана или от выбранной точки. Подсчитывает длину трех сторон и углы в градусах. Опционально можно вывести размеры треугольника текстом рядом — *Add Triangle Data As Text*.   

Параметры в коде:

* `rgb: [0, 0, 0]` — цвет заливки треугольника для RGB документов, 
* `cmyk: [0, 0, 0, 100]` — цвет для CMYK документов.

![TriangleMaker](https://i.ibb.co/ccx5RsW3/Triangle-Maker.jpg)

## Поддержка
Многие скрипты бесплатны для скачивания благодаря поддержке пользователей. Помогите продолжать разработку новых и обновление текущих скриптов, поддержав мою работу любой суммой через [Buymeacoffee] `USD`, [CloudTips] `RUB`, [ЮMoney] `RUB`, [Tinkoff] `RUB`, Donatty] `RUB`, [DonatePay] `RUB`. Спасибо.   

[Buymeacoffee]: https://www.buymeacoffee.com/aiscripts
[ЮMoney]: https://yoomoney.ru/to/410011149615582
[CloudTips]: https://pay.cloudtips.ru/p/b81d370e
[Tinkoff]: https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin

<a href="https://www.buymeacoffee.com/aiscripts">
  <img width="111" height="40" src="https://i.ibb.co/0ssTJQ1/bmc-badge.png">
</a>

<a href="https://pay.cloudtips.ru/p/b81d370e">
  <img width="111" height="40" src="https://i.ibb.co/qLznXkNG/cloudtips-badge.png">
</a>

<a href="https://www.tinkoff.ru/rm/osokin.sergey127/SN67U9405">
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