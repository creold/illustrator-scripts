![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Color | Adobe Illustrator Scripts

![Downloads](https://img.shields.io/badge/Скачивания-25k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Yotube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка».
2. Во вкладке откроется код скрипта.
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск.

## Scripts
* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#averagecolors) `new, 27.03.2022`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorblindsimulator) `new, 18.04.2022`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorgroupreplacer) `new, 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#contrastchecker) `new, 07.09.2023`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#converttogradient) `upd, 14.09.2022`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclecolors) `upd, 30.09.2022`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclegradient)
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#distributegradientstops)
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#matchcolors) `new, 22.12.2023`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#removegradientstops)
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#reversegradientcolor)
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#strokecolorfromfill) `upd, 14.10.2022`

## AverageColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-AverageColors.jsx-FF6900.svg)](https://rebrand.ly/avgcols) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Усредняет цвета выбранных объектов, отдельных групп или градиентов. Скрипт пропускает объекты без цвета или с паттерном. Если ничего не выбрано, скрипт предложит обработать все группы в документе. Существует два режима: тихий запуск и диалоговый. Меняется в `CFG.showUI`.   

Эти режимы меняются без правки кода, если удерживать клавишу Alt при запуске:

* <kbd>Alt</kbd> + `CFG.showUI: false` — появится диалог
* <kbd>Alt</kbd> + `CFG.showUI: true` — скрипт сработает с последними использованными опциями

![AverageColors](https://i.ibb.co/6bjPmLh/average-colors.gif)

## ColorBlindSimulator
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ColorBlindSimulator.jsx-FF6900.svg)](https://rebrand.ly/colblindsim) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Имитирует нарушение восприятия цветов 8 типов. Можно перекрасить объекты или ограничиться предпросмотром. Программы Adobe ограничены просмотром двух типов в меню `View > Proof Setup` и не могут применить цвета. Скрипт поддерживает: пути, составные пути, текст, заливки и обводки. Вы можете изменить гамма-коррекцию в расчётах `CFG.gamma: 2.2` и активировать предпросмотр по умолчанию `CFG.defPreview: true`.

> **Warning**   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif)

## ColorGroupReplacer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ColorGroupReplacer.jsx-FF6900.svg)](https://rebrand.ly/clrgrprplc) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Заменяет глобальные цвета из одной группы на другую группу по совпадению имён или по порядку расположения образцов в группах. В примере мы заменяем группу Default. Если в целевой группе у цвета имя `Accent`, то скрипт будет искать образцы, у которых имя содержит имя целевого цвета. Вы можете не создавать палитры с семантическими именами, а разложить цвета внутри групп в нужном порядке и выбирать опцию `By swatches order`.

![ColorGroupReplacer](https://i.ibb.co/FVYrty0/Color-Group-Replacer.gif)

## ContrastChecker
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ContrastChecker.jsx-FF6900.svg)](https://rebrand.ly/contchkr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Помогает подобрать различимые для людей сочетания цветов для текста и фонов, иконок и других элементов интерфейса, диаграмм, проверяя контрастность пар цветов на соответствие критериям [WCAG 2.1](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast). Коэффициент автокоррекции редактируется в коде скрипта в переменной `CFG.defRatio: 4.5`.

* основной текст (17 pt / 23 px regular) — 4,5:1 и выше;   
* больший текст, заголовки (18 pt / 24 px regular или 14 pt / 19 px bold) — 3:1;   
* для графических элементов коэффициент ниже — 3:1, так как они не требуют чтения.


> **Warning**   
> Учтите, что контрастность может варьироваться в зависимости от монитора, устройства, условий окружающей среды, рисунка шрифта и множества других деталей. Следование здравому смыслу может быть полезнее, чем бездумное выполнение какого-то правила. [Подробнее на сайте](https://ais.sergosokin.ru/color/contrast-checker/)

![ContrastChecker](https://i.ibb.co/YR2mvSY/Contrast-Checker.gif)

## ConvertToGradient
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ConvertToGradient.jsx-FF6900.svg)](https://rebrand.ly/cnvttograd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Преобразует одноцветную заливку в градиент на базец исходного цвета.   
Работает с документами в RGB и CMYK, Spot и Grayscale цветами. Распознает составные пути и группы.   
*Основано на скрипте автора [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*  

![ConvertToGradient](https://i.ibb.co/44tG9JP/demo-Convert-To-Gradient.gif)

## CycleColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CycleColors.jsx-FF6900.svg)](https://rebrand.ly/cyclecol) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Меняет местами цвета заливки и обводки выделенных объектов по порядку их расположения в панели Layers. Сохраняет толщину обводок, но если у объекта нет обводки, то копирует с другого объекта. Если ваши выделенные объекты хаотичны, то может показаться, что кнопки `Forward` и `Backward` переносят цвет случайным образом.  Кнопка `Reset` не возвращает кастомные кисти, пунктир, применённый к обводке. Вы можете использовать стандартную отмену истории после закрытия диалога.   

Скрипт по умолчанию запоминает позицию окна на экране, чтобы оно открывалось по центру замените в коде `CFG.isResWinPos: true` на `false`.

![CycleColors](https://i.ibb.co/qNXFHry/cycle-colors.gif)

## CycleGradient
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CycleGradient.jsx-FF6900.svg)](https://rebrand.ly/cyclegrad) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

* CycleGradient.jsx (UI версия)
* CycleGradientBackward.jsx
* CycleGradientForward.jsx
* CycleGradientRandom.jsx   

Набор из 4 скриптов, которые меняют порядок цветов точек на слайдере градиента (Color Stop). Не затрагивают положение точек на слайдере, прозрачность, положение градиента на объекте. 

> **Warning**   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`.  Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## MatchColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MatchColors.jsx-FF6900.svg)](https://rebrand.ly/matchclrs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переносит цвета заливок с одной группы объектов на другую или на символы текстовых объектов без группировки. Цвета определяются на путях, составных путях или текстах. Остальные объекты в группах будут пропущены.

> **Warning**   
> Скрипты не могут переносить угол поворота, длину градиента между объектами. Поэтому будет перенесён только градиентный цвет без его настроек. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/47572073-control-the-angle-length-of-gradients-and-other) за исправление этого.   

![MatchColors](https://i.ibb.co/dPyHSgY/Match-Colors.gif)

## DistributeGradientStops
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DistributeGradientStops.jsx-FF6900.svg)](https://rebrand.ly/distgradstops) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Распределяет равномерно расстояние между всеми точками на слайдере градиента, не меняя положения крайних. 

> **Warning**   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## RemoveGradientStops
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RemoveGradientStops.jsx-FF6900.svg)](https://rebrand.ly/rmvgradstops) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Удаляет промежуточные цветовые точки градиента в заливке и обводке выбранных объектов. Остаются крайние левая и правая точки.

> **Warning**   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ReverseGradientColor.jsx-FF6900.svg)](https://rebrand.ly/rvsgradcol) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Зеркально переворачивает цвета градиента: каждую точку (Color stop) вместе с прозрачностью. Само расположение точек сохраняется. 

> **Warning**   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-StrokeColorFromFill.jsx-FF6900.svg)](https://rebrand.ly/strokefromfill) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Присваивает обводке (Stroke) каждого выбранного объекта цвет из его сплошной или градиентной заливки. Опция автоматического добавления обводки объекту недоступна на Mac OS с Illustrator ниже CC 2020.  

![StrokeColorFromFill](https://i.ibb.co/8dtK1V3/demo-Stroke-Color-From-Fill.gif)

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