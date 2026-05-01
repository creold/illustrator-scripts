![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Color | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-197k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [AverageColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#averagecolors) `v0.1 — 27.03.2022`
* [BeautifySwatchNames](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#beautifyswatchnames) `v0.1.1 — upd, 16.01.2026`
* [ColorBlindSimulator](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorblindsimulator) `v0.1 — 18.04.2022`
* [ColorCorrector](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorcorrector) `v0.1.2 — upd, 14.02.2025`
* [ColorGroupReplacer](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#colorgroupreplacer) `v0.1 — 08.10.2023`
* [ContrastChecker](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#contrastchecker) `v0.1.1 — upd, 23.07.2024`
* [ConvertToGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#converttogradient) `v0.1.4 — upd, 09.02.2024`
* [CycleColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclecolors) `v0.4.2 — upd, 09.02.2024`
* [CycleGradient](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#cyclegradient) `v0.1 — 10.2021`
* [DistributeGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#distributegradientstops) `v0.1 — 08.2021`
* [HexToSwatches](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#hextoswatches) `v0.1 — new, 23.01.2026`
* [MatchColors](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#matchcolors) `v0.2.1 — upd, 20.05.2024`
* [RemoveGradientStops](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#removegradientstops) `v0.1 — 09.2021`
* [ReverseGradientColor](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#reversegradientcolor) `v0.1 — 08.2020`
* [StrokeColorFromFill](https://github.com/creold/illustrator-scripts/blob/master/md/Color.ru.md#strokecolorfromfill) `v0.5 — upd, 08.02.2026`

## AverageColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-AverageColors.jsx-FF6900.svg)](https://link.aiscripts.ru/avgcols) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Усредняет цвета выбранных объектов, отдельных групп или градиентов. Скрипт пропускает объекты без цвета или с паттерном. Если ничего не выбрано, скрипт предложит обработать все группы в документе. Существует два режима: тихий запуск и диалоговый. Меняется в `CFG.showUI`.   

Эти режимы меняются без правки кода, если удерживать клавишу Alt при запуске:

* <kbd>Alt</kbd> + `CFG.showUI: false` — появится диалог
* <kbd>Alt</kbd> + `CFG.showUI: true` — скрипт сработает с последними использованными опциями

![AverageColors](https://i.ibb.co/6bjPmLh/average-colors.gif)

## BeautifySwatchNames
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-BeautifySwatchNames.jsx-FF6900.svg)](https://link.aiscripts.ru/bswn) [![Direct2](https://img.shields.io/badge/Прямая%20ссылка-BeautifySwatchNames%20Lite.jsx-48C794.svg)](https://link.aiscripts.ru/bswnlite) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Подбирает уникальные, звучные названия для выбранных цветов в панели Swatches. Можно создавать ассоциативные палитры, как в брендбуках некоторых компаний. С помощью скрипта получим «Jasmine Green» вместо стандартных «R=122 G=201 B=67» или «Saffron Gold», а не «C=0 M=50 Y=100 K=0».   

* BeautifySwatchNames — с базой из 31879 цветов. Для тех, кто ищет максимально разнообразное описание цветов. Названия могут быть неординарными: Midnight in Saigon, Black Dragon’s Caldron, Shawarma, Worcestershire Sauce.

* BeautifySwatchNames Lite — сокращённая версия из 4877 отобранных лучших имен. Работает быстрее, но из-за сокращённой базы больше схожих цветов получат одинаковые имена.

Базы цветов обоих версий взяты из проекта [Color Names](https://github.com/meodai/color-names)

[Подробнее о скрипте](https://ais.sergosokin.ru/color/beautify-swatch-names/)

![BeautifySwatchNames](https://i.ibb.co/1KN1cfD/Beautify-Swatch-Names.gif)

## ColorBlindSimulator
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ColorBlindSimulator.jsx-FF6900.svg)](https://link.aiscripts.ru/colblindsim) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Имитирует нарушение восприятия цветов 8 типов. Можно перекрасить объекты или ограничиться предпросмотром. Программы Adobe ограничены просмотром двух типов в меню `View > Proof Setup` и не могут применить цвета. Скрипт поддерживает: пути, составные пути, текст, заливки и обводки. Вы можете изменить гамма-коррекцию в расчётах `CFG.gamma: 2.2` и активировать предпросмотр по умолчанию `CFG.defPreview: true`.

> [!WARNING]   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657-illustrator-desktop-feature-requests/suggestions/40882126-simulate-color-blindness-for-accessibility) за внедрение этой функции в Иллюстратор.

![ColorBlindSimulator](https://i.ibb.co/ccps1mg/Color-Blind-Simulator.gif)

## ColorCorrector
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ColorCorrector.jsx-FF6900.svg)](https://link.aiscripts.ru/clrcrct) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

До Иллюстратор CS4 можно было массово устанавливать значения цветовых каналов нескольких объектов. С версии CS5 эта возможность пропала. Скрипт позволяет менять значения каналов заливок и обводок следующим образом:   

1. Устанавливать точные числовые значения
2. Применять математические операции +, -, *, /
3. Вычислять значение канала относительно другого по его имени

В зависимости от режима документа появятся поля RGB или CMYK.

<a href="https://youtu.be/2Vi9YPGTXEE">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ColorCorrector](https://i.ibb.co/Wyd976r/Color-Corrector.gif)

## ColorGroupReplacer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ColorGroupReplacer.jsx-FF6900.svg)](https://link.aiscripts.ru/clrgrprplc) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Заменяет глобальные цвета из одной группы на другую группу по совпадению имён или по порядку расположения образцов в группах. В примере мы заменяем группу Default. Если в целевой группе у цвета имя `Accent`, то скрипт будет искать образцы, у которых имя содержит имя целевого цвета. Вы можете не создавать палитры с семантическими именами, а разложить цвета внутри групп в нужном порядке и выбирать опцию `By swatches order`.

![ColorGroupReplacer](https://i.ibb.co/FVYrty0/Color-Group-Replacer.gif)

## ContrastChecker
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ContrastChecker.jsx-FF6900.svg)](https://link.aiscripts.ru/contchkr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Помогает подобрать различимые для людей сочетания цветов для текста и фонов, иконок и других элементов интерфейса, диаграмм, проверяя контрастность пар цветов на соответствие критериям [WCAG 2.1](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast). Коэффициент автокоррекции редактируется в коде скрипта в переменной `CFG.defRatio: 4.5`.

* основной текст (17 pt / 23 px regular) — 4,5:1 и выше;   
* больший текст, заголовки (18 pt / 24 px regular или 14 pt / 19 px bold) — 3:1;   
* для графических элементов коэффициент ниже — 3:1, так как они не требуют чтения.


> [!WARNING]   
> Учтите, что контрастность может варьироваться в зависимости от монитора, устройства, условий окружающей среды, рисунка шрифта и множества других деталей. Следование здравому смыслу может быть полезнее, чем бездумное выполнение какого-то правила. [Подробнее на сайте](https://ais.sergosokin.ru/color/contrast-checker/)  
 
> [!NOTE]   
> Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/333657/suggestions/49525937) за внедрение этой функции в Иллюстратор.   

<a href="https://youtu.be/rlKrraKJ91U">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ContrastChecker](https://i.ibb.co/wwRPNVD/Contrast-Checker.gif)

## ConvertToGradient
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ConvertToGradient.jsx-FF6900.svg)](https://link.aiscripts.ru/cnvttograd) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Преобразует одноцветную заливку в градиент на базец исходного цвета.   
Работает с документами в RGB и CMYK, Spot и Grayscale цветами. Распознает составные пути и группы.   
*Основано на скрипте автора [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*  

Платная Pro версия с большим количеством опций доступна на [Robomarket](https://aiscripts.robo.market/)   

<a href="https://rutube.ru/video/06df919f82d0923b0cfff6e366caf832/">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![ConvertToGradient](https://i.ibb.co/44tG9JP/demo-Convert-To-Gradient.gif)

## CycleColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CycleColors.jsx-FF6900.svg)](https://link.aiscripts.ru/cyclecol) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Меняет местами цвета заливки и обводки выделенных объектов по порядку их расположения в панели Layers. Сохраняет толщину обводок, но если у объекта нет обводки, то копирует с другого объекта. Если ваши выделенные объекты хаотичны, то может показаться, что кнопки `Forward` и `Backward` переносят цвет случайным образом.  Кнопка `Reset` не возвращает кастомные кисти, пунктир, применённый к обводке. Вы можете использовать стандартную отмену истории после закрытия диалога.   

Скрипт по умолчанию запоминает позицию окна на экране, чтобы оно открывалось по центру замените в коде `CFG.isResWinPos: true` на `false`.

![CycleColors](https://i.ibb.co/qNXFHry/cycle-colors.gif)

## CycleGradient
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CycleGradient.jsx-FF6900.svg)](https://link.aiscripts.ru/cyclegrad) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

* CycleGradient.jsx (UI версия)
* CycleGradientBackward.jsx
* CycleGradientForward.jsx
* CycleGradientRandom.jsx   

Набор из 4 скриптов, которые меняют порядок цветов точек на слайдере градиента (Color Stop). Не затрагивают положение точек на слайдере, прозрачность, положение градиента на объекте. 

> [!WARNING]   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`.  Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![CycleGradient](https://i.ibb.co/84GsCBK/cycle-Gradient.gif)

## DistributeGradientStops
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DistributeGradientStops.jsx-FF6900.svg)](https://link.aiscripts.ru/distgradstops) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Распределяет равномерно расстояние между всеми точками на слайдере градиента, не меняя положения крайних. 

> [!WARNING]   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![DistributeGradientStops](https://i.ibb.co/6XNkFqS/Distribute-Gradient-Stops.gif)

## HexToSwatches
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-HexToSwatches.jsx-FF6900.svg)](https://link.aiscripts.ru/hex2sw) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Работает как «умный буфер обмена»: вы вставляете в поле все HEX-коды или ссылку на сайты-генераторы (например, [Coolors](https://coolors.co/)), а он создаёт готовую палитру в Иллюстраторе. Скрипт распознаёт различные способы ввода со знаком # или без:

* через запятую: fb8b24, e36414, 0f4c5c;
* через точку с запятой: fb8b24; e36414; 0f4c5c;
* через пробел: fb8b24 e36414 0f4c5c;
* через дефис: fb8b24-e36414-0f4c5c;
* сокращённые HEX: ebd, f52, 12fc, 0;
* HEX-коды в несколько строк;
* ссылки онлайн-генераторов Coolors: coolors.co/27187e-758bfd-aeb8fe-f1f2f6-ff8600;
* Poolors URL: poolors.com/f78fe2-898415-2e3741;
* HEX-коды, которые можно скопировать текстом с colorhunt.co, colordesigner.io, learnui.design;

<a href="https://youtu.be/iUnUU0yJSTA">
  <img width="122" height="47" src="https://i.ibb.co/fqdwXL6/youtube-badge.png">
</a>

![HexToSwatches](https://i.ibb.co/ZpHhyX92/Hex-To-Swatches.gif)

## MatchColors
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-MatchColors.jsx-FF6900.svg)](https://link.aiscripts.ru/matchclrs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Переносит цвета заливок с одной группы объектов на другую или на символы текстовых объектов без группировки. Может перекрасить выбранные объекты в выбранные образцы цветов в панели Swatches. Цвета определяются на путях, составных путях или текстах. Остальные объекты в группах будут пропущены.

> [!WARNING]   
> Скрипты не могут переносить угол поворота, длину градиента между объектами. Поэтому будет перенесён только градиентный цвет без его настроек. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/47572073-control-the-angle-length-of-gradients-and-other) за исправление этого.   

![MatchColors](https://i.ibb.co/dPyHSgY/Match-Colors.gif)

## RemoveGradientStops
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-RemoveGradientStops.jsx-FF6900.svg)](https://link.aiscripts.ru/rmvgradstops) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Удаляет промежуточные цветовые точки градиента в заливке и обводке выбранных объектов. Остаются крайние левая и правая точки.

> [!WARNING]   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![RemoveGradientStops](https://i.ibb.co/cv6wgPq/remove-Gradient-Stops.gif)

## ReverseGradientColor
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ReverseGradientColor.jsx-FF6900.svg)](https://link.aiscripts.ru/rvsgradcol) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Зеркально переворачивает цвета градиента: каждую точку (Color stop) вместе с прозрачностью. Само расположение точек сохраняется. 

> [!WARNING]   
> К сожалению, скопированные градиенты связаны друг с другом в Иллюстраторе. Вручную удалите связь, развернув градиент дважды кнопкой `Reverse Gradient`. Проголосуйте на [Uservoice](https://illustrator.uservoice.com/forums/908050-illustrator-desktop-sdk-scripting-issues/suggestions/44461230-adjusting-one-gradient-causes-changes-to-unrelated) за исправление этого.   

![ReverseGradient](https://i.ibb.co/Fg8nnHZ/Reverse-Gradient-Color.gif)

## StrokeColorFromFill
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-StrokeColorFromFill.jsx-FF6900.svg)](https://link.aiscripts.ru/strokefromfill) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Применяет к обводке (Stroke) каждого выбранного объекта цвет из его сплошной или градиентной заливки. Если заливка градиентная, то цвета всех стопов градиента усредняются для цвета обводки.   

![StrokeColorFromFill](https://i.ibb.co/SwBF5d8x/Stroke-Color-From-Fill.gif)

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