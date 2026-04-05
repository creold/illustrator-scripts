![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Select | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-190k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#cornersselector) `v0.1 — 21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#named-items-finder) `v0.3 — upd, 10.04.2025`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `v0.1 — 21.02.2022`
* [SelectArtboardObjects](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectartboardobjects) `v0.1.1 — upd, 13.01.2025`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectbyswatches) `v0.3.2 — upd, 22.04.2024`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectonlypoints) `v0.3.2`
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectpointsbytype) `v2.1.4 — upd, 09.02.2024`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectrotateditems) `v0.1 — 22.06.2022`

## CornersSelector
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CornersSelector.jsx-FF6900.svg)](https://link.aiscripts.ru/corslctr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выделяет на объектах точки направленные внутрь либо наружу объекта. Например, для задачи выделить все лучи звезды и скруглить.    

![CornersSelector](https://i.ibb.co/Jy12pLW/Corners-Selector.gif)

## Named Items Finder
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-NamedItemsFinder.jsx-FF6900.svg)](https://link.aiscripts.ru/itemsfinder) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Ищет объекты в документе по имени и масштабирует их по центру окна. Также можно искать текстовые фреймы в документе по словам. Вдохновлено функционалом Photoshop CC 2020.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectAllLayersAbove.jsx-FF6900.svg)](https://link.aiscripts.ru/sellyrabv) [![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectAllLayersBelow.jsx-FF6900.svg)](https://link.aiscripts.ru/sellyrblw) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт SelectAllLayersAbove выбирает объекты во всех слоях выше активного. SelectAllLayersBelow - в слоях ниже. Если в документе что-то выбрано, активным будет считаться родительский слой выбранного объекта. В ином случае - слой, который подсвечен в панели Layers. Поменяйте значение `var isInclActive = false` в коде на `true`, чтобы выделились объекты и в исходном слое.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectArtboardObjects
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectArtboardObjects.jsx-FF6900.svg)](https://link.aiscripts.ru/selabobj) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выбирает все объекты, которые пересекают границы активного артборда с числовым допуском или наоборот за его границами. Проблема функции Select → All on Active Artboard в том, что она выбирает целиком группы, если в них хотя бы один объект попадает на артборд. Скрипт проверяет все объекты индивидуально.

> [!TIP]   
> На сложных документах для ускорения скрипта заблокируйте или скройте объекты и слои, которые точно не нужны. Другой вариант: переведите Иллюстратор в полноэкранный режим (<kbd>F</kbd>) или скройте панели инструментов (<kbd>Tab</kbd>).

**Как работает Artboard Tolerance**

All Indside Artboard:

* `> 0` — выбирает объекты, край которых снаружи от границ артборда в пределах значения или попадает внутрь артборда;
* `< 0` — объекты, внешний край которых внутри артборда глубже заданной дистанции.

Для опции All Outside Artboard наоборот:

* `> 0` — выбирает объекты, если их край попадает внутрь артборда на заданное число;
* `< 0` — выбирает объекты, если их край дальше от границ артборда.

![SelectArtboardObjects](https://i.ibb.co/kHqQFtD/Select-Artboard-Objects.gif)

## SelectBySwatches
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectBySwatches.jsx-FF6900.svg)](https://link.aiscripts.ru/selbyswat) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Инструмент Magic Wand выделяет объекты, совпадающие по цвету с образцом. Выбирая образцы с  зажатой клавишей <kbd>Shift</kbd>, выделяются объекты разных цветов. Скрипт же выделит объекты, заливка или контур которых совпадает с цветами, выбранными в панели Swatches.

> [!TIP]   
> Для выбора объектов с разным оттенком (tint) плашечного цвета сначала отключите настройку Иллюстратора Preferences → General → Select Same Tint %.

> [!WARNING]   
> Не добавляйте этот скрипт в панель операций (Action) для быстрого запуска. Это приведёт к зависанию Иллюстратора.

![SelectBySwatches](https://i.ibb.co/JR5h4pq/Select-By-Swatches.gif)

## SelectOnlyPoints
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectOnlyPoints.jsx-FF6900.svg)](https://link.aiscripts.ru/selonlypts) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

При использовании инструментов Lasso Tool <kbd>A</kbd> или Direct Selection Tool <kbd>Q</kbd> захватываются не только точки, но и сегменты путей. Скрипт оставляет активными только сами точки.

> [!NOTE]   
> Проголосуйте на [Uservoice #1](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/40280419-direct-selection-tool-to-select-only-points), [Uservoice #2](https://illustrator.uservoice.com/forums/601447-illustrator-desktop-bugs/suggestions/35846947-clipping-mask-bug-direct-selection-tool-and-smar) за внедрение этой функции в Иллюстратор.   

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectPointsByType.jsx-FF6900.svg)](https://link.aiscripts.ru/selptsbyty) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выделяет точки на выбранных объектах в соответствии с типом. Возможностей выбора пока больше, чем в плагинах у Astute Graphics :).  

> [!TIP]   
Перед запуском скрипта скройте рамку `View → Hide Bounding Box`, чтобы видеть выделяемые точки.   

<a href="https://youtu.be/pjHmBDLIWbw">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

**Горячие клавиши:**   
Вместо <kbd>Q</kbd> можно задать свою клавишу-модификатор в коде `modKey: 'Q'`.
   
* Bezier <kbd>Q</kbd> + <kbd>1</kbd>
* Ortho <kbd>Q</kbd> + <kbd>2</kbd>
* Flush <kbd>Q</kbd> + <kbd>3</kbd>
* Corner <kbd>Q</kbd> + <kbd>4</kbd>
* Broken <kbd>Q</kbd> + <kbd>5</kbd>
* Flat <kbd>Q</kbd> + <kbd>6</kbd>

![SelectPointsType](https://i.ibb.co/1MTyHx8/Select-Points-By-Type.gif)

## SelectRotatedItems
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectRotatedItems.jsx-FF6900.svg)](https://link.aiscripts.ru/selrotdit) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Находит среди выбранных объектов или во всём документе те, что повёрнуты. Если в коде `isSkipRight: true`, то объекты повёрнутые на 90, 180, 270 градусов не учитываются, если значение `false`, то выбираются все объекты с углом поворота отличным от 0 градусов.

![SelectRotatedItems](https://i.ibb.co/7YpGm9M/Select-Rotated-Items.gif)

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