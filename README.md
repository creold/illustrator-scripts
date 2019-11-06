![header](images/header.jpg)
![illustrator-scripts](images/cover.gif)

[![Behance](https://img.shields.io/badge/Behance-%40creold-0055FF.svg)](https://behance.net/creold) [![Dribbble](https://img.shields.io/badge/Dribbble-%40creold-DF3A7A.svg)](https://dribbble.com/creold) [![Instagram](https://img.shields.io/badge/Instagram-%40serg_osokin-8034B2.svg)](https://www.instagram.com/serg_osokin/)

# Hi everybody :)
This is a collection of JSX scripts for Adobe Illustrator. All scripts created by me, sometimes used part of the code of other authors.  

The descriptions for each file can be found in the file's header text. Test environment: Illustrator CS6 (Windows), CC 2017 (Mac OS).   

### Alphabetical list of scripts
* ArtboardsRotateWithObjects.jsx   
* ConvertToGradient.jsx   
* Export-selection-as-AI.jsx   
* ExtUngroup.jsx   
* FileVersionInformer.jsx   
* InlineSVGToAI.jsx   
* SelectOnlyPoints.jsx   
* SplitPath.jsx   
* Zoom-and-center.jsx 

### Installation 

1. [Download archive] and unzip. All scripts are in the folder `jsx`
2. Place `<script_name>.jsx` in the Illustrator Scripts folder:
	- OS X: `/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts`
	- Windows (32 bit): `C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\`
	- Windows (64 bit): `C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\`
3. Restart Illustrator

[Download archive]: http://bit.ly/2M0j95N 

### Donate (optional)
If you find this script helpful, consider shouting me coffee ☕️ via [PayPal] or [Yandex Money] 🙂  

[PayPal]: https://paypal.me/osokin/2usd
[Yandex Money]: https://money.yandex.ru/to/410011149615582
<a href="https://paypal.me/osokin/2usd">
  <img width="160" height="49" src="images/paypal-badge.png" >
</a>  

<a href="https://money.yandex.ru/to/410011149615582">
  <img width="160" height="49" src="images/yandex-badge.png" >
</a>

## ArtboardsRotateWithObjects 1.2

Script to rotate 90 degrees an document artboards with all the objects on it.   
*Author: [Alexander Ladygin](http://ladygin.pro/). UI: Sergey Osokin.*

### Usage

1. Open your file
2. Run script `File → Scripts → ArtboardsRotateWithObjects`
3. Select the options in the dialog box & click `Ok` button

![ArtboardsRotateWithObjects](images/demo-ArtboardsRotateWithObjects.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## ConvertToGradient

Convert a flat process color into a matching gradient.   
What's new: The script now works with the RGB and CMYK document profile, Spot & Gray colors. Processes compound paths and groups of items.   
*Based on original script by [Saurabh Sharma](https://tutsplus.com/authors/saurabh-sharma), 2010.*   

### Usage

1. Select objects
2. Run script `File → Scripts → ConvertToGradient`
3. Enter a numeric values in input fields

![ConvertToGradient](images/demo-ConvertToGradient.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 


## Export selection as AI
Exports all selected objects to AI files.    
*Based on Layers to SVG 0.1 by Anton Ball.*

### Usage

1. Select objects
2. Run script `File → Scripts → Export-selection-as-AI`
3. Select options in dialog box
 

![Export-selection-as-AI](images/demo-Export-selection-as-AI.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## ExtUngroup v.1.2
This script is сan be easily custom ungrouping to all group items & releasing clipping masks in the document.   
*Based on original script by Jiwoong Song & modification by [John Wundes](http://www.wundes.com/).*

### Usage

1. Select object(s) to ungroup or deselect all
2. Run script `File → Scripts → ExtUngroup`
3. Select options in dialog box
 

![Zoom-And-Center](images/demo-ExtUngroup.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## FileVersionInformer

Script for collecting information about the program version of .ai & .eps files in selected folder & subfolder.   
*Notice: on large files it works slowly, just wait.*

### Usage

1. Run script `File → Scripts → FileVersionInformer`
2. Choose folder with .ai or .eps files
3. Wait for the completion message
4. Look "FileVersionInformer.txt" in source folder
 

![FileVersionInformer](images/demo-FileVersionInformer.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## InlineSVGToAI

The script inserts the SVG code as an object from the clipboard into the Adobe Illustrator CC 2014+. Adobe Illustrator CC 2018 v.22.1 (march, 2018) can insert SVG graphics without a script.   
*Author: [Alexander Ladygin](http://ladygin.pro/). Code refactoring: Sergey Osokin.*

### Usage

1. Run script `File → Scripts → InlineSVGToAI`
2. Paste your svg code in textarea
3. Press button "Paste" 

![InlineSVGToAI](images/demo-InlineSVGToAI.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## Rescale

Automatic scaling of objects to the desired size. If you draw a line on top with the length or height of the desired object, 'Old Size' will be filled automatically. Units associated with "Document Setup".      

### Usage

1. Run script `File → Scripts → Rescale`
2. Enter numeric values
3. Press button "OK" 

![Rescale](images/demo-Rescale.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## SelectOnlyPoints

After using the Lasso tool or Direct Selection Tool, both Points and Path segments are selected. 

### Usage

1. Select points on paths with Direct Selection Tool `key: A` or Lasso tool `key: Q`
2. Run script `File → Scripts → SelectOnlyPoints`
 

![SelectOnlyPoints](images/demo-SelectOnlyPoints.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## SplitPath 1.0 (ex-PathSubtract)

Powerfull script for subtract shapes from paths. Pathfinder panel in Adobe Illustrator does not do it.   

### Usage

1. Place the closed filled shape top
2. Select shape and line
3. Run script `File → Scripts → SplitPath `
4. Select cut method in dialog box
 

![SplitPath](images/demo-SplitPath.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## Zoom and center

Zooms active view to selection or to all object(s) in a document.   
*Based on original script by [John Wundes](http://www.wundes.com/).*

### Usage

1. Select object(s) to zoom or deselect all
2. Run script `File → Scripts → Zoom-and-center`
3. If nothing is selected, you will see a dialog with options
 

![Zoom-And-Center](images/demo-Zoom-And-Center.gif) 

<a href="http://bit.ly/2M0j95N">
  <img width="160" height="49" src="images/download.png">
</a> 

## Testimonials
* Sergey, these scripts of yours are great. — Terry Foxx   
* Wow. I just installed and successfully tested. Outstanding work!!!. — Zak Lay
* Tried your script to export selected objects to separate Ai, works smartly. — Dmitry

#### Don't forget sharing link with a friend 🙂 


## Contribute

Found a bug? Please [submit a new issues](https://github.com/creold/illustrator-scripts/issues) on GitHub.

### Contact
Email <hi@sergosokin.ru>  

### License

All scripts is licensed under the MIT licence.  
See the included LICENSE file for more details.