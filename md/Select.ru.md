![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Select | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-25k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [CornersSelector](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#cornersselector) `new, 21.04.2023`
* [NamedItemsFinder](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#named-items-finder) `upd, 14.09.2022`
* [SelectAllLayersAbove](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `new, 21.02.2022`
* [SelectAllLayersBelow](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectalllayersabove) `new, 21.02.2022`
* [SelectBySwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectbyswatches) `upd, 11.05.2023`
* [SelectOnlyPoints](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectonlypoints)
* [SelectPointsByType](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectpointsbytype) `upd, 14.09.2022`
* [SelectRotatedItems](https://github.com/creold/illustrator-scripts/blob/master/md/Select.ru.md#selectrotateditems) `new, 22.06.2022`

## CornersSelector
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CornersSelector.jsx-FF6900.svg)](https://rebrand.ly/corslctr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выделяет на объектах точки направленные внутрь либо наружу объекта. Например, для задачи выделить все лучи звезды и скруглить.    

![CornersSelector](https://i.ibb.co/Jy12pLW/Corners-Selector.gif)

## Named Items Finder
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-NamedItemsFinder.jsx-FF6900.svg)](https://rebrand.ly/itemsfinder) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Ищет объекты в документе по имени и масштабирует их по центру окна. Также можно искать текстовые фреймы в документе по словам. Вдохновлено функционалом Photoshop CC 2020.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectAllLayersAbove.jsx-FF6900.svg)](https://rebrand.ly/sellyrabv) [![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectAllLayersBelow.jsx-FF6900.svg)](https://rebrand.ly/sellyrblw) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт SelectAllLayersAbove выбирает объекты во всех слоях выше активного. SelectAllLayersBelow - в слоях ниже. Если в документе что-то выбрано, активным будет считаться родительский слой выбранного объекта. В ином случае - слой, который подсвечен в панели Layers. Поменяйте значение `var isInclActive = false` в коде на `true`, чтобы выделились объекты и в исходном слое.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectBySwatches
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectBySwatches.jsx-FF6900.svg)](https://rebrand.ly/selbyswat) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Инструмент Magic Wand выделяет объекты, совпадающие по цвету с образцом. Выбирая образцы с  зажатой клавишей <kbd>Shift</kbd>, выделяются объекты разных цветов. Скрипт же выделит объекты, заливка или контур которых совпадает с цветами, выбранными в панели Swatches.

> **Note**   
> Для выбора объектов с разным оттенком (tint) плашечного цвета сначала отключите настройку Иллюстратора Preferences → General → Select Same Tint %.

> **Warning**   
> Не помещайте скрипт внутрь Action, чтобы запускать горячими клавишами. Запуск SelectBySwatches через экшен может привести к зависанию Иллюстратора.

![SelectBySwatches](https://i.ibb.co/JR5h4pq/Select-By-Swatches.gif)

## SelectOnlyPoints
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectOnlyPoints.jsx-FF6900.svg)](https://rebrand.ly/selonlypts) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

При использовании инструментов Lasso Tool <kbd>A</kbd> или Direct Selection Tool <kbd>Q</kbd> захватываются не только точки, но и сегменты путей. Скрипт оставляет активными только сами точки.

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectPointsByType.jsx-FF6900.svg)](https://rebrand.ly/selptsbyty) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Выделяет точки на выбранных объектах в соответствии с типом. Возможностей выбора пока больше, чем в плагинах у Astute Graphics :).  

> **Note**   
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
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SelectRotatedItems.jsx-FF6900.svg)](https://rebrand.ly/selrotdit) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Находит среди выбранных объектов или во всём документе те, что повёрнуты. Если в коде `isSkipRight: true`, то объекты повёрнутые на 90, 180, 270 градусов не учитываются, если значение `false`, то выбираются все объекты с углом поворота отличным от 0 градусов.

![SelectRotatedItems](https://i.ibb.co/7YpGm9M/Select-Rotated-Items.gif)

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