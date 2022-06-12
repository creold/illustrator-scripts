![header](https://i.ibb.co/mF018gV/emblem.png)
# Select | Adobe Illustrator Scripts

[![Yotube](https://img.shields.io/badge/-YouTube%20Channel-FF0000.svg)](https://www.youtube.com/c/SergOsokinArt/videos)

[На главную](../README.ru.md)

## 📜 Scripts
* NamedItemsFinder `(upd, 07.03.2022)`
* SelectAllLayersAbove `(new, 21.02.2022)`
* SelectAllLayersBelow `(new, 21.02.2022)`
* SelectBySwatches `(upd, 12.06.2022)`
* SelectOnlyPoints
* SelectPointsByType `(upd, 12.06.2022)`

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/Wp39Brs/download-ru.png">
</a> 

## Named Items Finder

Ищет объекты в документе по имени и масштабирует их по центру окна. Также можно искать текстовые фреймы в документе по словам. Вдохновлено функционалом Photoshop CC 2020.   

<a href="https://youtu.be/30AwGPf_2Wk">
  <img width="122" height="47" src="https://i.ibb.co/02CqYYR/youtube-badge-ru.png">
</a>

![NamedItemsFinder](https://i.ibb.co/QDVtnXP/demo-Named-Items-Finder.gif)

## SelectAllLayersAbove

Скрипт SelectAllLayersAbove выбирает объекты во всех слоях выше активного. SelectAllLayersBelow - в слоях ниже. Если в документе что-то выбрано, активным будет считаться родительский слой выбранного объекта. В ином случае - слой, который подсвечен в панели Layers. Поменяйте значение `var isInclActive = false` в коде на `true`, чтобы выделились объекты и в исходном слое.

![SelectAllLayersAbove](https://i.ibb.co/t3f2Mvr/Select-All-Layers-Above.gif)

## SelectBySwatches

Инструмент Magic Wand выделяет объекты, совпадающие по цвету с образцом. Выбирая образцы с  зажатой клавишей <kbd>Shift</kbd>, выделяются объекты разных цветов. Скрипт же выделит объекты, заливка или контур которых совпадает с цветами, выбранными в панели Swatches.

![SelectBySwatches](https://i.ibb.co/q70XMd6/Select-By-Swatches.gif)

## SelectOnlyPoints

При использовании инструментов Lasso Tool <kbd>A</kbd> или Direct Selection Tool <kbd>Q</kbd> захватываются не только точки, но и сегменты путей. Скрипт оставляет активными только сами точки.

![SelectOnlyPoints](https://i.ibb.co/NF7bbpQ/demo-Select-Only-Points.gif)

## SelectPointsByType

Выделяет точки на выбранных объектах в соответствии с типом. Возможностей выбора пока больше, чем в плагинах у Astute Graphics :).  
*Перед запуском скрипта скройте рамку `View → Hide Bounding Box`, чтобы видеть выделяемые точки.*   

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

<a href="https://bit.ly/2M0j95N">
  <img width="140" height="43" src="https://i.ibb.co/Wp39Brs/download-ru.png">
</a> 

## 💸 Поддержка
Вы можете поддержать мою работу над новыми скриптами и их распространение любой суммой через [ЮMoney], [Donatty], [DonatePay]. [PayPal] временно недоступен

[ЮMoney]: https://yoomoney.ru/to/410011149615582
[Donatty]: https://donatty.com/sergosokin
[DonatePay]: https://new.donatepay.ru/@osokin
[PayPal]: https://paypal.me/osokin/5usd

<a href="https://yoomoney.ru/to/410011149615582">
  <img width="147" height="40" src="https://i.ibb.co/448NHjM/yoomoney-badge.png" >
</a>

<a href="https://donatty.com/sergosokin">
  <img width="147" height="40" src="https://i.ibb.co/p2Qj9Fr/donatty-badge.png" >
</a>

<a href="https://new.donatepay.ru/@osokin">
  <img width="147" height="40" src="https://i.ibb.co/x1Yrn3K/donatepay-badge.png" >
</a>

## 🤝 Развитие

Нашли ошибку? [Создайте запрос](https://github.com/creold/illustrator-scripts/issues) на Github или напишите мне на почту.

## ✉️ Контакты
Email <hi@sergosokin.ru>  
Telegram [@sergosokin](https://t.me/sergosokin)

### 📝 Лицензия

Скрипты распространяются по лицензии MIT.   
Больше деталей во вложенном файле LICENSE.