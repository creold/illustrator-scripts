/* 
  FileVersionInformer.jsx for Adobe Illustrator
  Description: Script for collecting information about the version of .ai & .eps files 
               in selected folder & subfolder
  Date: December, 2017
  Author: Sergey Osokin, email: hi@sergosokin.ru
  ============================================================================
  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts
  ============================================================================
  Donate (optional): If you find this script helpful, you can buy me a coffee
                     via PayPal http://www.paypal.me/osokin/usd
  ============================================================================
  NOTICE:
  Tested with Adobe Illustrator CS6 (Win), CC 2017 (Mac).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale.
  ============================================================================
  Released under the MIT license.
  http://opensource.org/licenses/mit-license.php
  ============================================================================
  Check other author's scripts: https://github.com/creold
*/

//@target illustrator

var sourceFolder;

function main() {
	// Progress bar
	var win = new Window("palette", "FileVersionInformer \u00A9 sergosokin.ru", [150, 150, 600, 260]);
	win.pnl = win.add("panel", [10, 10, 440, 100], undefined);
	win.pnl.progBar = win.pnl.add("progressbar", [20, 35, 410, 60], 0, 100);
	win.pnl.progBarLabel = win.pnl.add("statictext", [20, 20, 320, 35], "0%");
	var progCount = 1;
	var files = [];
	var sourceFolder = Folder.selectDialog('Select the folder with Illustrator .ai, .eps files');

	if (sourceFolder != null) {
		var resultFile = new File(sourceFolder.path + '/' + sourceFolder.name + '/FileVersionInformer.txt');
		resultFile.encoding = "UTF8";
		if (resultFile != null) {
			resultFile.remove();
		}

		files = GetSubfolderFiles(sourceFolder);

		// If folder not empty
		if (files.length > 0) {
			//Show Progress bar
			win.show();
			resultFile.open('a+');
			resultFile.writeln('List of .ai, .eps files in Folder & Subolders');
			resultFile.writeln("------------------");
			for (var i = 0; i < files.length; i++) {
				// Change Progress bar
				win.pnl.progBar.value = progCount * (100 / files.length);
				win.pnl.progBarLabel.text = win.pnl.progBar.value.toFixed(0) + "%";
				win.update();
				// Writing current file name and Illustrator version
				resultFile.writeln("File '" + decodeURI(files[i].name) + "' saved as " + savedAsVersion(files[i]));
				progCount++;
			}
			resultFile.writeln();
			resultFile.close();
			alert('Script is done.\nLook "FileVersionInformer.txt" in source folder');
		} else {
			alert('No matching files found.');
		}
	}
}

function GetSubfolderFiles(folder) {
	var filelist = folder.getFiles();
	var files = [];

	for (var j = 0; j < filelist.length; j++) {
		if (filelist[j] instanceof Folder) {
			files = files.concat(GetSubfolderFiles(filelist[j]));
		} else if (filelist[j] instanceof File) {
			if (filelist[j].name.indexOf(".ai") > -1 || filelist[j].name.indexOf(".eps") > -1) {
				files.push(filelist[j]);
			}
		}
	}
	return files;
}

// Finding in file information about version
function savedAsVersion(targetFile) {
	if (targetFile.open() == false) return null;

	var lineVersion = '';
	var outVersion = '';
	var getVers = 0;
	var counter = 0;

	while (!targetFile.eof) {
		lineVersion = targetFile.readln();
		//Search version info
		if (/^%%Creator:/.test(lineVersion)) {
			getVers = Math.floor(lineVersion.substr(32));
			// Convert version number
			outVersion = String(getVers).replace(/22/gi, 'CC').replace(/21/gi, 'CC').replace(/20/gi, 'CC').replace(/19/gi, 'CC').replace(/18/gi, 'CC').replace(/17/gi, 'CC').replace(/16/gi, 'CS6').replace(/15/gi, 'CS5').replace(/14/gi, 'CS4').replace(/13/gi, 'CS3').replace(/12/gi, 'CS2').replace(/11/gi, 'CS');
			counter++;
			// For .eps files search second 'Creator' string
			if (counter > 1) {
				break;
			}
		}
	}
	targetFile.close();
	return outVersion;
}

main();