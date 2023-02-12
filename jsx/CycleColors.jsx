/*
  CycleColors.jsx for Adobe Illustrator
  Description: Swap the colors of the selected objects
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  0.1 Initial version
  0.2 Transfer stroke width, minor improvements
  0.3 Added shift steps, reset button
  0.4 Added flip button, text changed to icons

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2022 (Mac), CS6, CC 2022 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
//@targetengine 'cycleColors'
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

function main() {
  var SCRIPT = {
        name: 'Cycle Colors',
        version: 'v.0.4'
      },
      CFG = {
        steps: 1,
        isResWinPos: true, // Restore dialog window position
        aiVers: parseInt(app.version),
        isMac: /mac/i.test($.os),
        isDarkUI: preferences.getRealPreference('uiBrightness') <= .5,
      },
      icoBkwd = {
        l: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%00%C2%9DIDATH%C2%89%C3%AD%C2%94%C3%81%0D%C3%830%0C%03%C3%99%C3%8Ed%C3%BD%C2%B3I3Z3I%C3%BB%C3%97%02Y!S80%C3%A0G%13%C2%BAN%603%C2%BF%10%C3%90%C3%87%20x%C2%B0%24%C3%A8%11c%C3%84%C2%95z%5E%C2%9A~%03d%003%1B%C3%A8Q%050%C2%B37%C2%80O%2B%C2%A4%0A%C3%88%C3%A1%2F%00%C2%93%C2%BB%7F%C3%89%C3%90%03%C3%98%C2%85%C2%8Fd%C3%A8%01%C2%A8%C3%82%C2%8B%00ex%C3%92%C3%A6T%C3%BC%C2%84%2F%00fr%1F%C3%88%C3%9Di%11%C3%A8%07j%C3%91%C2%B1S%C2%B7%C2%88~%C2%90C%C2%A7%04%C3%890-%40%0D)%02%C2%94%C2%90%C2%BF%C2%80%02%C2%A4m%1Ei%C3%88G%15B%18%C3%8F%C3%B8JE%5B%C2%A4V%C2%B5E%0A%C3%9D%C2%80%C2%BA%00%C2%AC%02z%C2%88%C2%B2%15%C3%9B%C3%84%C3%9C%00%00%00%00IEND%C2%AEB%60%C2%82",
        d: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%00%C2%9BIDATH%C2%89%C3%AD%C2%95%C3%81%0D%C3%830%08E%7F%C2%B3%0A%C2%8Bd%C2%93f%C2%B4d%C2%92f%C2%8C%1E%60%C2%80NAd)%C2%87%C2%A4%20%C3%8BuA%C2%B9%04%09Y%02%C3%B4%C2%9F%04%C3%86~%C2%A8*2mHU%C2%BF%01a%00%11%19M0%0A%20%223%C2%80W%2F%C2%A4%0A%C3%98%C3%85%C2%9F%00%16%22ZMA%C2%8B%C2%95%3D%C3%B0%C2%9C%C2%99gf%C3%96rz%C3%B9Vw%0B%C2%A3%C3%84%5D%40%C2%A4x%C3%B1%C3%93Sq%C3%A8%C3%B9%07%C3%80%C3%BB%C3%97v%13%C2%91%C2%B9%08%C3%95!%C2%87Xv%C2%8BL%20%7D%C3%88%C3%91%10%13%C2%88%C2%86%C2%98%40%052y%C3%B9%C2%BF%01%3B%C2%A4K%5C%C2%BF%C3%B7%20%C3%83%C3%AE%2F%C3%B3b%00%C2%80%0D%C2%90%1E%C2%AB%C2%843%C2%BB%C2%BCE%00%00%00%00IEND%C2%AEB%60%C2%82"
      },
      icoFwd = {
        l: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%00%C2%9DIDATH%C2%89%C3%AD%C2%95%C3%8B%0D%C3%83%20%10D'i%C3%82-%C2%A4%00%C3%A6N'viq%25%C3%B6%7D%C2%8B%22%C2%B2%C2%85O%C3%AB%C3%88%03%C2%84K%C3%A4%C2%91%C2%B8%C3%B0%C2%99%C3%87%C3%AE%C2%A2%C3%A5%C2%91RBO%3D%C2%BB%C2%BA%C3%9F%C2%80n%00%C2%92%C3%91M~Q1%20%C2%9B%2F%24%C3%9Fn%C3%B1D%C3%85%003%5B%01%C3%8C%00F%05R%C2%95%223%C2%9BTHu%C2%91UH%C3%93%2BR%20%C2%AEU%C2%90%5C%C3%9D%C2%AEk%C2%BD%00%0C%1B%2CC%7F%13%C2%81%22%17A%C2%A9rj%C3%86%C2%B3%C3%9B7Gpe%C3%9E%04P%C3%8C%C2%AB%01%C2%AA9jjp%C2%B4%0A%C3%85%7C%C3%97%06(%1D!%C2%84%C2%A8%C2%9E%C2%B9%C2%BF%C3%8C%7F%07%00%C3%B8%00%17%C2%87%C2%8A%C3%8Eg%C3%96%C3%9B%C2%A3%00%00%00%00IEND%C2%AEB%60%C2%82",
        d: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%00%C2%A1IDATH%C2%89%C3%AD%C2%95%C3%A1%09%C3%84%20%0C%C2%85%C3%9Fu%C2%89%0E%C2%90%3F%1D%C2%A3%C2%9B%C3%9C%C2%8D%C3%A6M%C3%92%0E%C2%927%C2%8B%C2%87p%C2%85%C2%83%C3%A4Z-%0D%C2%94%C3%92%07Axj%3E%C3%94%C2%A8%C2%8F%C2%9C3%22%C3%95%C2%85f%C2%BF%01a%00%C2%92%C2%A31%C3%BF%C2%A8%19%C3%B0M%3E%C2%91L%C2%A6%C3%93Q3%40Df%00o%00%C3%8F*H%C2%B9%07%7BBU%C2%93%C2%AA%C3%A6%C3%92%C2%AE%C3%8D7FK%C3%94%40%C2%8Cq4%C3%84%3C%15%24g%C2%B3%C2%8F%C3%9B%1A%00%C3%B4%C3%A5lD%C3%A4%C3%B5%3B%3A%C3%BC%1E%C2%98%25%1D%C2%BDE%C3%868%C3%8D!%C2%87%C2%96imr%C2%B7%C2%8A%C2%B6%C2%B4%3C%15%5E%C3%85%C2%B8%C3%B2%C2%A8%15%2B%18%3D%C3%9F%C2%8B%C3%BB%C3%8B%C2%BC%3A%00%C3%80%07n%C2%AEi%C3%A6%C2%B8%17%C2%8F%0D%00%00%00%00IEND%C2%AEB%60%C2%82"
      },
      icoFlip = {
        l: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%01%25IDATH%C2%89%C3%95U%C3%8Bm%C3%830%0C%7D%0D2%407%C3%A8%08%C3%B6%C2%81%C2%BCw%C2%84l%C3%A0%C2%8E%C3%A2n%C2%92l%C3%90%11r%C3%A7%C3%85%C3%9E%C2%A0%C3%99%20%1B%C2%B8%60A%03%C2%8EH)%C2%8A%C3%93%14%C3%88%03%C2%84%00%0A%3F%C2%8F%7C%C2%A4%C3%BC2M%13%1E%C2%89%C3%8DC%C2%A3%C3%BFG%C2%82%C2%AD%C2%BB%C2%A9%043%C2%BF%028%02%18D%C3%A4%23%C3%A7%C2%B5%C2%BA%02%119kp%00%1D3%C3%AF%C2%9D%C3%81%C2%BD%09%2C%C2%892%3F%C2%94%C2%92%C2%84S%C3%84%C3%8C%3D%00u~s%7F%C2%96qH%C3%9B%C3%A54%60f-%C2%BB%010%02%08Y%05%C3%98%C2%99%C2%8F%C3%83E%02c%C2%AE%C2%86%C2%9F%22%C3%92%3B%C3%AB%00%C3%96%C2%9A%26b%C3%BF%0Bm%C3%91%7C%C2%88%C3%A8%C2%9B%C2%88%C2%86%C3%A5%5D%C3%A9%10%C3%91%C2%9E%C2%88%26%C3%BD%C3%8D%C3%99%C2%A5%22k%C3%8F%C2%BF%1C%C2%8B%006%C2%A6m%C2%96%C2%B9%C3%81iP%0B%1B%C3%93%C3%B6%C2%AAyT%C3%96%C2%9ACD%C2%BD%C2%B6%2B%C3%B5%C3%8DV%60%C3%A2)%C3%83wc%C2%BB%0A%C3%A1%C2%A2Y%C3%B0%C3%8E%C2%9E%C2%81%C3%9A%C3%A0%3A%C2%AA%C2%A7%C3%B4%C3%92%25X%04%2F%C2%8A%C2%97%C3%B8%C3%8C%C3%A3%C3%AD%C3%B6%C3%A6b%C2%93%17%C3%81%C3%87%C3%9AiZ%2C%C3%99(%22N%C3%B4%C2%9C%06Mn3%03%C2%9CJ%C2%8B%C3%A9%C3%9E%C2%A25-*%C3%81iP%C3%B3B%C3%9E%02WAR%C3%89%C3%9Dc%C2%9AM%C3%B0Wx%C3%B2%C2%8F%3E%C2%80%1F%C2%97%C2%A1%C3%AE5%3F7%C3%BF%C2%9F%00%00%00%00IEND%C2%AEB%60%C2%82",
        d: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%01%1CIDATH%C2%89%C3%95U%C3%9Bm%C3%830%0C%C2%BC%14%1D%20%1B%C3%A4%C2%83%03%24%23d%C2%84l%C2%90%C2%8C%C2%A2n%C3%A2n%C3%90%11%3AB%C3%BCO%02%C3%A9%06%C3%9D%C3%80%05%01%06%C2%90E%C3%8AV%5D%C2%A7%40%0E%20%0CH%C3%94Q%C3%87%C2%87%C2%BC%19%C2%86%01%C2%8F%C3%84%C3%8BC%C3%99%C3%BF%23%C3%80%C2%AB%5Bi%C2%84%C2%88l%01%7C%02%C2%B8%12%C3%91%C2%A5vj%C2%B1%02%22%C3%BAVr%00g%11%C3%A9%C2%9C%C3%83%1DZ%C3%A4%C2%BF%183w%C3%8C%3C%C3%A87%C3%A2%09%C2%BBHD%12%00%C2%95%C2%BDs%C2%9B%C3%93x%2F%C3%93%C3%A5j%20%22*%7B%0F%C2%A0%07P%C2%97%3E%C3%86%C3%89%C3%8Ex%C3%A4r%C2%989%C2%99%C3%9C%14%C3%89%C2%8Dl.Ee%C2%80%1B3_%23%C3%87%C3%88%C3%A6%C3%88%C3%95%C3%8A.%C3%92%C2%9C%7F8%C2%99%01%C2%ACM%0FQ%C3%9E'k%C3%90%0Ak%C3%93%C3%83%C2%AC%7B%24k%C2%89%C3%9D%C3%ABW%C2%9E%C2%AD*%C2%B0%C3%A1%C3%91%1B%1E%C3%AD%C2%B6%C2%8B%10N%C2%B2%C2%91%C2%9F%C3%AD%19h%25%C3%97V%C3%BD*%17%5D%C2%80%C2%8C%7C%C2%B2x%C3%85%C2%99ds%C3%A0%C3%A6f4%C3%89%19y%C3%9F%C3%9AM%C3%99%C2%90%C3%B5D%C3%A4%C2%8A%5E%C2%AB%C3%81%C2%BE%3A%C2%99%1E%C2%9A%C2%967%22Jn%07A%17%C2%B5%0C%C3%8Fo%2Ct%5E3H%C3%B8%C2%9Ab%C3%856%C2%AD%06X%0BO%C3%BE%C3%93%07%C3%B0%03po%04I%C2%81%038%C2%8E%00%00%00%00IEND%C2%AEB%60%C2%82"
      },
      icoRnd = {
        l: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%01TIDATH%C2%89%C3%AD%C2%95%C3%91M%C3%83P%0CE%0F%C2%88%01X%001%02%C3%B9%C2%88%C3%BF%C2%BB%01e%00%C3%940A%C2%BB%01e%C2%83v%02%C3%9A%09%C2%9AN%40%C3%BE%C3%BDA%C2%90X%00%C2%B1%407%08%C2%B2p%20J%5E%C2%92%C2%96%C2%B6BHXzJ%C2%9E%C3%AD%C3%9C%C3%BB%C2%9C%C3%B8%3A'EQpL%3B%3D*%C3%BA%C2%9F!%10%C2%91%C2%A8%C3%A1%3C%14%C2%81%C2%88%0C%C2%80g%11Y4%C2%82%C2%87%20P%C3%95%0CX%02%C2%A3%10%C3%89W%17%C2%89H%C2%B5%C2%9D%5E%C2%80%C2%A9%C2%AA%C2%A6%0D%C3%84%C3%8F%C3%9C%C2%A1%C3%85%C2%81%C2%ABF%10%C2%96%C2%AA%C2%9A%C2%94%C2%9B%C2%B3J%C3%A0%C3%81%C2%AF%C3%A7%C2%80%01%C2%ACDd%C2%AE%C2%AA%C2%93%1A%C3%B8%0C%18%03o%C3%80%1C%C3%98xh%18%22%0C%C3%AA%40D%C2%8C%C3%84%C3%8A%C2%BD%06n%C3%8AJ%C3%BC%C3%A4%2B%60%0D%24%C2%AA%C2%BAq%C2%BF%C3%A5%C2%8E%C3%AA%C2%A7o%25%C2%A8%C2%90%C3%A4%5E%C3%91%C3%80%C3%9D%C2%99%C2%9F8%C2%AA%C2%80%5B%C3%AC)%04%C3%9EI%C3%80w%C3%BB%19%C3%A8%C2%BB%C2%BB.%C2%8CLU%C3%B3z%5E%C3%9D%C2%B7%15%C2%81%3Fl%C2%A7z%C3%B4%C3%AD%C2%9D%C2%AA6%3A%C2%A5%C3%8B~wT%C3%B8%2B%C2%B2%C2%AEy%C3%B55%0B%C2%A96%C3%A4%C3%AB%25%C3%B0%C2%8F%5C%C3%AA%C3%A0%C3%96%C2%97Y%C3%AA%C2%B12ow%25W%C3%9A%C3%B4%C3%92%C3%9B1%C3%B7%C2%8F%C2%98%C2%B8oQ%C2%92%C3%AC%C2%A2%C3%A4%C2%A9%C3%BBJ%C2%A1%19P%C2%9F%C3%90%C3%92%C2%80%C3%90Z%C2%95%7C_%C2%B9%C2%B7Q1%09%C2%8D%0A%23%14%C2%91%C3%8CG%C3%85%C2%B8Q~%5B%05%C3%BB%C3%98%C2%8F%C2%94%C2%BC%C2%AD%C3%B5)%19%23%C3%98w%C3%85q%1C%C2%B5a%C3%BC%C3%BF%C3%B4%C2%BB%0D%C3%B8%00%C3%88W%C3%A8%C2%A6%25o%5Ey%00%00%00%00IEND%C2%AEB%60%C2%82",
        d: "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%18%00%00%00%18%08%06%00%00%00%C3%A0w%3D%C3%B8%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%C3%92%C3%9D~%C3%BC%00%00%01%5CIDATH%C2%89%C3%95%C2%95%C3%91M%C3%83%40%10D%1F%C2%88%02h%00%C3%B1%C2%B1%05%C3%A0%12%C3%92%01%C2%A1%00%14SA%C3%92%01%C2%A1%C2%83%C2%A4%02%C2%9C%0A%12*%C2%88%3B%C3%80H%7C%C3%9E~%20%1AH%07F%2B%C3%96%60%C3%99%C2%97%C2%98(%C2%8EPV%3A%C3%99%C2%9E%3D%C3%8F%C3%9C%C3%9A%3BwgeYr%C3%8C8%3F*%C3%BB%C3%89%08%C2%A8j%C3%92%02%C3%BB%12P%C3%95%01%C3%B0%C2%AA%C2%AAY%2B%C3%99%C2%87%C2%80%C2%88%C3%A4%C3%80%02%18%C3%85D~%C2%BAHU%C3%AB%C3%AD%C3%B4%06LEd%C3%95b%C3%BC%C2%9E%3B%C2%B4%3Cp%C3%93J%C3%82BD%C3%92%C3%AA%C3%A1%C2%A2%C2%96x%C3%B2%C3%AB%25%60%04KU%C2%9D%C2%8B%C3%88%C2%A4A%3E%03%C3%86%C3%80%070%076%C2%9E%1A%C3%86%04%C2%A3%3EPU%13%C2%B1ro%C2%81%C2%BB%C2%AA%12_%C3%B9%12x%01R%11%C3%998nsG%C3%8D%C3%95o%15%C2%A8%C2%89%14%5E%C3%91%C3%80%C3%A1%C3%9CW%C2%9C%C3%94%C3%88-%C2%B7%C2%8E%C2%91%C3%AF%14%C3%A0%C2%B7%C3%BD%C2%8C%C3%B4%C3%93%C2%A1%2B%13%13%C2%91%C2%A29%C2%AF%C2%89%C3%BDI%C3%80_%C2%B6U%3D%C3%BB%C3%A3%C2%83%C2%88%C2%B4%3AeW%C3%BC%C3%AFV%C3%A1%C2%9F%C3%88%C2%BA%C3%A6%C3%9D%C3%87%2C%C3%A6%C3%9A%18%C3%96)%C3%A0%3F%C2%B9%C3%B2%C3%81%C2%BD%0F%C2%8B%C2%95%C3%A7%C2%AAy%C3%BB%3B%C2%B9%C3%96%C2%A6%C3%97%C3%9E%C2%8E%C2%85%C3%BF%C3%84%C3%94%C2%B1%C2%AC%12%C3%99%C3%87%C3%89S%C3%87*%C2%A3%19Q%C2%97%C3%91V%11%C2%A3mu%C3%B2c%C3%AD%C3%9E%C2%B6%C2%8AIl%C2%AB0AU%C3%8D%7D%C2%AB%18%C2%B7%C3%8Ao%C2%86Up%C3%A8%08!d!%C2%84%C3%92%C2%AEM%C2%AE%C2%83%C2%8F%C3%8C.'%C3%B7UA%12%C3%83%7B%C2%A9%C2%A0%2BN%C3%BC%C3%90%07%C2%BE%00%C3%9C%C3%AD%3F%1B%C3%8CM%12%C2%98%00%00%00%00IEND%C2%AEB%60%C2%82"
      };

  if (!isCorrectEnv('selection')) return;

  var selItems = [],
      origColors = [],
      tmp = []; // Array of temp paths for fix compound paths

  selItems = getItems(selection, tmp);
  origColors = getColors(selItems);

  // DIALOG
  var win = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      win.orientation = 'column';
      win.alignChildren = ['fill', 'center'];

  if (CFG.isResWinPos && typeof (UIPos) != 'undefined') win.location = [UIPos[0], UIPos[1]];

  // STEPS
  var stepsGrp = win.add('group');
      stepsGrp.orientation = 'row';
      stepsGrp.alignChildren = ['left', 'center'];

  stepsGrp.add('statictext', undefined, 'Shift steps (max ' + (selItems.length - 1) + ')');
  var stepsInp = stepsGrp.add('edittext', undefined, CFG.steps);
      stepsInp.alignment = ['fill','top'];
      stepsInp.characters = 4;

  // OPTIONS
  var opt = win.add('group');
      opt.alignChildren = ['fill', 'top'];

  opt.add('statictext', undefined, 'Appearance');
  var isFill = opt.add('checkbox', undefined, 'Fill');
      isFill.value = true;
  var isStroke = opt.add('checkbox', undefined, 'Stroke');
  // AI older 2020 on Mac OS has bug with add stroke
  if (CFG.isMac && CFG.aiVers <= 23) {
    isStroke.helpTip = "Stroke property in older CC\non Mac OS doesn't work\ncorrectly";
  }

  // ACTION BUTTONS
  var icoGrp = win.add('group');
  var icoSize = [40, 32];

  var bkwdBtn = icoGrp.add('iconbutton', undefined, ScriptUI.newImage(File.decode(CFG.isDarkUI ? icoBkwd.d : icoBkwd.l)));
      bkwdBtn.helpTip = 'Backward';
      bkwdBtn.preferredSize = icoSize;

  var fwdBtn = icoGrp.add('iconbutton', undefined, ScriptUI.newImage(File.decode(CFG.isDarkUI ? icoFwd.d : icoFwd.l)));
      fwdBtn.helpTip = 'Forward';
      fwdBtn.preferredSize = icoSize;

  var flipBtn = icoGrp.add('iconbutton', undefined, ScriptUI.newImage(File.decode(CFG.isDarkUI ? icoFlip.d : icoFlip.l)));
      flipBtn.helpTip = 'Flip colors';
      flipBtn.preferredSize = icoSize;

  var rndBtn = icoGrp.add('iconbutton', undefined, ScriptUI.newImage(File.decode(CFG.isDarkUI ? icoRnd.d : icoRnd.l)));
      rndBtn.helpTip = 'Randomize colors';
      rndBtn.preferredSize = icoSize;

  // BUTTONS
  var txtBtns = win.add('group');
      txtBtns.alignChildren = ['fill', 'center'];

  var reset = txtBtns.add('button', undefined, 'Reset');
  var ok = txtBtns.add('button', undefined, 'Close', { name: 'ok' });

  // AI older 2020 on Mac OS has bug with add stroke
  if (CFG.isMac && CFG.aiVers <= 23) {
    var wrng = win.add('statictext', undefined, undefined, { multiline: true });
    wrng.text = "Stroke property in older CC on\nMac OS doesn't work correctly";
    wrng.enabled = false;
  }

  var copyright = win.add('statictext', undefined, '\u00A9 Sergey Osokin. Visit Github');
      copyright.justify = 'center';

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold');
  });

  stepsInp.onChange = function () {
    var amt = strToAbsNum(this.text, 1);
    if (amt > selItems.length - 1) {
      this.text = selItems.length - 1;
    } else {
      this.text = (amt == 0) ? 1 : amt;
    }
  }

  fwdBtn.onClick = function () {
    swapColors(selItems, stepsInp.text, 'forward', isStroke.value, isFill.value);
    resetBtn();
  }

  bkwdBtn.onClick = function () {
    swapColors(selItems, stepsInp.text, 'backward', isStroke.value, isFill.value);
    resetBtn();
  }

  flipBtn.onClick = function () {
    swapColors(selItems, stepsInp.text, 'flip', isStroke.value, isFill.value);
    resetBtn();
  }

  rndBtn.onClick = function () {
    swapColors(selItems, stepsInp.text, 'randomize', isStroke.value, isFill.value);
    resetBtn();
  }

  reset.onClick = function () {
    restoreColors(selItems, origColors);
    resetBtn();
  }

  ok.onClick = function () {
    // Clear changes in compound paths
    for (var i = 0, len = tmp.length; i < len; i++) {
      tmp[i].remove();
    }
    win.close();
  }

  win.onClose = function () {
    UIPos = [this.location[0], this.location[1]];
    return true;
  };

  win.show();

  // Reset button highlight after click
  function resetBtn() {
    var tmpUI = win.add('checkbox', undefined, 'checkbox');
    tmpUI.active = true;
    tmpUI.remove();
  }
}

/**
 * Check the script environment
 * @param {string} List of initial data for verification
 * @return {boolean} Continue or abort script
 */
function isCorrectEnv() {
  var args = ['app', 'document'];
  args.push.apply(args, arguments);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i].toString().toLowerCase();
    switch (true) {
      case /app/g.test(arg):
        if (!/illustrator/i.test(app.name)) {
          alert('Error\nRun script from Adobe Illustrator');
          return false;
        }
        break;
      case /version/g.test(arg):
        var rqdVers = parseFloat(arg.split(':')[1]);
        if (parseFloat(app.version) < rqdVers) {
          alert('Error\nSorry, script only works in Illustrator v.' + rqdVers + ' and later');
          return false;
        }
        break;
      case /document/g.test(arg):
        if (!documents.length) {
          alert('Error\nOpen a document and try again');
          return false;
        }
        break;
      case /selection/g.test(arg):
        if (!selection.length || selection.typename === 'TextRange') {
          alert('Error\nPlease, select at least two objects');
          return false;
        }
        break;
    }
  }

  return true;
}

/**
 * Get items from selection
 * @param {(Object|Array)} coll - Collection of items
 * @return {Array} tmp - Temporary paths in compounds
 * @return {Array} out - Output array of single items
 */
function getItems(coll, tmp) {
  var out = [];

  for (var i = 0, len = coll.length; i < len; i++) {
    var item = coll[i];
    if (item.pageItems && item.pageItems.length) {
      out = [].concat(out, getItems(item.pageItems));
    } else if (isType(item, 'compound')) {
      // Fix compound path created from groups
      if (!item.pathItems.length) {
        tmp.push(item.pathItems.add());
      }
      out.push(item.pathItems[0]);
    } else if (isType(item, 'path|text')) {
      out.push(item);
    }
  }

  return out;
}

/**
 * Get color property from selection
 * @param {Array} items - Array of items
 * @return {Array} out - Output array of color objects
 */
function getColors(items) {
  var out = [],
      noColor = new NoColor();

  for (var i = 0, len = items.length; i < len; i++) {
    var currItem = items[i],
        props = {}; // f - Fill, s - Stroke, w - Stroke width
    if (isType(currItem, 'text')) {
      var charAttr = currItem.textRange.characters[0].characterAttributes;
      props.f = charAttr.fillColor;
      props.s = charAttr.strokeColor;
      props.w = (isType(props.s, 'nocolor')) ? 0 : charAttr.strokeWeight;
    } else {
      props.f = currItem.filled ? currItem.fillColor : noColor;
      props.s = currItem.stroked ? currItem.strokeColor : noColor;
      props.w = currItem.stroked ? currItem.strokeWidth : 0;
    }
    out.push(props);
  }

  return out;
}

/**
 * Swap colors between items
 * @param {Array} items - Array of items
 * @param {string} steps - Amount of color shift steps
 * @param {string} dir - Color shift direction
 * @param {boolean} isStroke - Change the color of the strokes
 * @param {boolean} isFill - Change the color of the fills
 */
function swapColors(items, steps, dir, isStroke, isFill) {
  var shiftItems = [].concat(items),
      colors = getColors(items);

  try {
    switch (dir) {
      case 'forward':
        shiftArrBackward(shiftItems, parseInt(steps));
        break;
      case 'backward':
        shiftArrForward(shiftItems, parseInt(steps));
        break;
      case 'flip':
        shiftItems.reverse();
        break;
      case 'randomize':
        shuffle(shiftItems);
        break;
    }
  } catch (e) {}

  for (var i = 0, len = shiftItems.length; i < len; i++) {
    var currItem = isType(shiftItems[i], 'text') ? shiftItems[i].textRange.characterAttributes : shiftItems[i];
    if (isStroke) applyStroke(currItem, colors[i].w, colors[i].s);
    if (isFill) currItem.fillColor = colors[i].f;
  }

  redraw();
}

/**
 * Shift array elements to the right
 * @param {Array} arr - Input array
 * @param {number} steps - Amount of shift steps
 * @return {Array} Shifted array
 */
function shiftArrForward(arr, steps) {
  for (var i = 0; i < steps; i++) {
    arr.unshift(arr.pop());
  }
}

/**
 * Shift array elements to the left
 * @param {Array} arr - Input array
 * @param {number} steps - Amount of shift steps
 * @return {Array} Shifted array
 */
function shiftArrBackward(arr, steps) {
  for (var i = 0; i < steps; i++) {
    arr.push(arr.shift());
  }
}

/**
 * Shuffle array
 * @param {Array} arr - Input array
 */
function shuffle(arr) {
  var j, tmp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
  return arr;
}

/**
 * Apply weight and color property
 * @param {Object} item - Selected item
 * @param {number} width - Stroke width
 * @param {Object} color - Stroke color
 */
function applyStroke(item, width, color) {
  var noColor = new NoColor();
  if (isType(item, 'character')) {
    if (width > 0) {
      if (isType(item.strokeColor, 'nocolor')) {
        item.strokeWeight = width;
      }
      item.strokeColor = color;
    } else {
      item.strokeColor = noColor;
    }
  } else {
    if (width > 0) {
      if (!item.stroked) {
        item.stroked = true;
        item.strokeWidth = width;
      }
      item.strokeColor = color;
    } else {
      item.stroked = false;
    }
  }
  redraw();
}

/**
 * Restore colors in the selection
 * @param {Array} items - Array of items
 * @param {Array} colors - Array of original colors
 */
function restoreColors(items, colors) {
  for (var i = 0, len = items.length; i < len; i++) {
    var currItem = isType(items[i], 'text') ? items[i].textRange.characterAttributes : items[i];
    applyStroke(currItem,  colors[i].w, colors[i].s);
    currItem.fillColor = colors[i].f;
  }
  redraw();
}

/**
 * Convert string to absolute number
 * @param {string} str - Input data
 * @param {number} def - Default value if the string don't contain digits
 * @return {number}
 */
function strToAbsNum(str, def) {
  if (arguments.length == 1 || def == undefined) def = 1;
  str = str.replace(/,/g, '.').replace(/[^\d.]/g, '');
  str = str.split('.');
  str = str[0] ? str[0] + '.' + str.slice(1).join('') : '';
  if (isNaN(str) || !str.length) return parseFloat(def);
  else return parseFloat(str);
}

/**
 * Check the item typename by short name
 * @param {Object} item - PageItem
 * @param {string} type - Short typename
 * @return {boolean}
 */
function isType(item, type) {
  var re = new RegExp(type, 'i');
  return re.test(item.typename);
}

/**
 * Open link in browser
 * @param {string} url - Website adress
 */
function openURL(url) {
  var html = new File(Folder.temp.absoluteURI + '/aisLink.html');
  html.open('w');
  var htmlBody = '<html><head><META HTTP-EQUIV=Refresh CONTENT="0; URL=' + url + '"></head><body> <p></body></html>';
  html.write(htmlBody);
  html.close();
  html.execute();
}

// Run script
try {
  main();
} catch (e) {}