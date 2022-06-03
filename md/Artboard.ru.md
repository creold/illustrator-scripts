![header](https://i.ibb.co/mF018gV/emblem.png)
# Artboard | Adobe Illustrator Scripts

[![Yotube](https://img.shields.io/badge/-YouTube%20Channel-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

## 📜 Scripts
* ArtboardsFinder `(new, 08.03.2022)`
* BatchRenamer `(upd, 13.05.2022)`
* DuplicateArtboardsLight
* FitArtboardsToArtwork `(new, 03.06.2022)`
* MoveArtboards
* RenameArtboardAsLayer
* RenameArtboardAsSize
* RenameArtboardAsTopObj

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/Wp39Brs/download-ru.png">
</a> 

## ArtboardsFinder

Ищет артборды в документе по имени или размерам и масштабирует выбранные по центру окна. Размеры отображаются в единицах документа. Альбомные, книжные, квадратные артборды выводятся по убыванию размера при поиске по ориентации.

![ArtboardsFinder](https://i.ibb.co/VJXKjWQ/artboards-finder.gif)

## BatchRenamer

Массово переименовывает в документе артборды, слои верхнего уровня и выбранные объекты. Добавляет общий префикс и суффикс к имени. Через Find & Replace заменяется строка в текущих именах.

**Плейсхолдеры** 

* {w} - ширина артборда или выбранного объекта в единицах документа
* {h} - высота артборда или выбранного объекта
* {u} - единицы измерения документа (Document Setup > Units) 
* {nu:0} - автоматическая нумерация от введённого числа и выше
* {nd:0} - нумерация от введённого числа и ниже
* {c} - цветовая модель документа (RGB или CMYK)
* {d} - текущая дата в формате ГГГГММДД
* {n} - текущее имя для замены в Find & Replace

Если хотите изменить количество строк в высоту, то откройте файл скрипта текстовым редактором и поменяйте CFG `rows: 5` на другое число и его же в `listHeight: 5 * 32`. В CFG `precision: 0` задаётся число десятичных знаков для высоты и ширины артбордов и объектов.

![BatchRenamer](https://i.ibb.co/p2VXbY9/Batch-Renamer.gif) 

## DuplicateArtboardsLight

Script for copying the selected Artboard with his artwork. The Pro version with more options is available at [Gumroad](https://gumroad.com/sergosokin)   

<a href="https://youtu.be/qDH1YRaYMYk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![DuplicateArtboardsLight](https://i.ibb.co/rF92HpV/demo-Duplicate-Artboards-Light.gif) 

## FitArtboardsToArtwork

Масштабирует артборды по размеру видимого незаблокированного контента с отступами.

![FitArtboardsToArtwork](https://i.ibb.co/SJJh5Hc/Fit-Artboards-To-Artwork.gif) 

## MoveArtboards

Перемещает все артборды из диапазона по номерам с содержимым по осям X и Y на точное расстояние.

![MoveArtboards](https://i.ibb.co/wrHTpTG/Move-Artboards.gif) 

## RenameArtboardAsLayer

Переименовывает каждый артборд по имени слоя, в котором есть элемент, лежащий на соответствующем артборде.

![RenameArtboardAsLayer](https://i.ibb.co/9nk8Lqn/Rename-Artboard-As-Layer.gif)

## RenameArtboardAsSize

Скрипт ставит в имя артборда его размер в пикселях. Если не хотите сохранять старое имя, а только менять на размер, то откройте файл скрипта текстовым редактором и поменяйте значение в строке `var SAVE_NAME = true;` на `false`. 

![RenameArtboardAsSize](https://i.ibb.co/54H4Jcm/Rename-Artboard-As-Size.gif)

## RenameArtboardAsTopObj

Переименовывает каждый артборд по имени верхнего незаблокированного объекта, лежащего в его пределах. Если верхний объект — текст, то его содержимое станет именем артборда. 

![RenameArtboardAsTopObj](https://i.ibb.co/WPmf14B/Rename-Artboard-As-Top-Obj.gif)

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/Wp39Brs/download-ru.png">
</a> 

## 💸 Поддержка
Вы можете поддержать мою работу над новыми скриптами и их распространение любой суммой через [ЮMoney], [Donatty] или [PayPal]

[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[PayPal]: https://paypal.me/osokin/5usd

<a href="https://yoomoney.ru/to/410011149615582">
  <img width="147" height="40" src="https://i.ibb.co/448NHjM/yoomoney-badge.png" >
</a>

<a href="https://donatty.com/sergosokin">
  <img width="147" height="40" src="https://i.ibb.co/p2Qj9Fr/donatty-badge.png" >
</a>

<a href="https://paypal.me/osokin/3usd">
  <img width="147" height="40" src="https://i.ibb.co/Z8Wd8Sn/paypal-badge.png" >
</a>

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.