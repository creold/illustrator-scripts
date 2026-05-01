![Logo](https://i.ibb.co/mF018gV/emblem.png)

# Utility | Adobe Illustrator Scripts

[![GitHub stars](https://img.shields.io/github/stars/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts) [![GitHub forks](https://img.shields.io/github/forks/creold/illustrator-scripts.svg)](https://github.com/creold/illustrator-scripts/forks) ![Downloads](https://img.shields.io/badge/Скачивания-197k-27CF7D.svg) [![Telegram](https://img.shields.io/badge/Telegram--канал-%40aiscripts-0088CC.svg)](https://t.me/aiscripts) [![Сайт](https://img.shields.io/badge/Сайт-ais.sergosoikn.ru-FF7548.svg)](https://ais.sergosokin.ru) [![Youtube](https://img.shields.io/badge/Youtube-%40SergOsokinArt-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

### Как скачать один скрипт
1. В описании скрипта нажмите кнопку «Прямая ссылка»
2. Во вкладке откроется код скрипта
3. Нажмите <kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd>, чтобы сохранить файл на диск
4. Если при сохранении видите в имени «.jsx.txt», удалите последнюю часть «.txt»

## Scripts
* [CheckPixelPerfect](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#checkpixelperfect) `v0.1 — 03.02.2022`
* [DocumentSwitcher](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#documentswitcher) `v0.1 — new, 28.08.2024`
* [FileVersionInformer](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#fileversioninformer) `v0.1 — 12.2017`
* [ObjectsCounter](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#objectscounter) `v0.1 — 08.2020`
* [SaveAllDocs](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#savealldocs) `v0.1 — upd, 03.2023`
* [SyncGlobalColorsNames](https://github.com/creold/illustrator-scripts/blob/master/md/Utility.ru.md#syncglobalcolorsnames) `v0.1 — 04.2021`

## CheckPixelPerfect
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-CheckPixelPerfect.jsx-FF6900.svg)](https://link.aiscripts.ru/ckpxperf) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Проверяет привязку точек выбранных линий к пиксельной сетке с шагом координат 0,5 или 1,0 px. Скрипт выделит точки с дробными координатами. Подойдет для проверки основных точек формы, так как точки на изгибах линий сложно подогнать к сетке.

> [!TIP]   
> В переменной `CFG`: `rgb`, `d`, `opa` настраиваются RGB цвет маркеров, диаметр, непрозрачность группы маркеров.

![CheckPixelPerfect](https://i.ibb.co/Ps2WNqp/Check-Pixel-Perfect.gif)

## DocumentSwitcher
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-DocumentSwitcher.jsx-FF6900.svg)](https://link.aiscripts.ru/docswt) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Отображает список открытых документов и позволяет активировать документ кликом на соответствующюю строку в списке. Список можно фильтровать, вводя часть имени. В первом столбце списка выводится символ звёздочки `*`, если документ изменён и не сохранён. Дополнительно показано имя активного документа и общее количество открытых или отфильтрованных файлов.

![DocumentSwitcher](https://i.ibb.co/qxb2Rnh/Document-Switcher.gif)

## FileVersionInformer
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-FileVersionInformer.jsx-FF6900.svg)](https://link.aiscripts.ru/fverinfo) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Скрипт собирает в текстовый файл информацию о том в какой версии Adobe Illustrator были созданы файлы .ai или .eps из папки.   

> [!WARNING]   
> Предупреждение: на больших файлах скрипт может работать медленно.

![FileVersionInformer](https://i.ibb.co/mz94Tn0/demo-File-Version-Informer.gif)

## ObjectsCounter
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-ObjectsCounter.jsx-FF6900.svg)](https://link.aiscripts.ru/objcntr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Подсчитывает количество выделенных объектов. Группы не учитываются, как отдельный объект, только вложенные в них элементы.

![ObjectsCounter](https://i.ibb.co/cbmYfNV/Objects-Counter.gif)

## SaveAllDocs
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SaveAllDocs.jsx-FF6900.svg)](https://link.aiscripts.ru/savealldocs) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Сохраняет все открытые документы.

## SyncGlobalColorsNames
[![Direct](https://img.shields.io/badge/Прямая%20ссылка-SyncGlobalColorsNames.jsx-FF6900.svg)](https://link.aiscripts.ru/syncglblclr) [![Download](https://img.shields.io/badge/Скачать%20все-Zip--архив-0088CC.svg)](https://bit.ly/2M0j95N)

Синхронизирует имена совпадающих глобальных цветов между всеми открытыми документами. После синронизации сохраняет изменения.

![SyncGlobalColorsNames](https://i.ibb.co/G9NRF7J/Sync-Global-Colors-Names.gif)

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