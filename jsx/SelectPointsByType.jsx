/*
  SelectPointsByType.jsx for Adobe Illustrator
  Description: Selects points on the selected paths according to their type
  Date: September, 2022
  Author: Sergey Osokin, email: hi@sergosokin.ru

  Installation: https://github.com/creold/illustrator-scripts#how-to-run-scripts

  Release notes:
  1.0 Initial version. Tolerance for broken points handles 0..180 degrees
  1.1 Changed points type algorithm. Broken points 0..15 degrees. Corner points > 15 degrees
  2.0 Added more points type. Minor improvements
  2.1.0 Added Ortho points. Minor improvements
  2.1.1 UI improvements
  2.1.2 Fixed "Illustrator quit unexpectedly" error
  2.1.3 Fixed input activation in Windows OS

  Donate (optional):
  If you find this script helpful, you can buy me a coffee
  - via Buymeacoffee: https://www.buymeacoffee.com/osokin
  - via FanTalks https://fantalks.io/r/sergey
  - via DonatePay https://new.donatepay.ru/en/@osokin
  - via YooMoney https://yoomoney.ru/to/410011149615582

  NOTICE:
  Tested with Adobe Illustrator CC 2018-2021 (Mac), 2021 (Win).
  This script is provided "as is" without warranty of any kind.
  Free to use, not for sale

  Released under the MIT license
  http://opensource.org/licenses/mit-license.php

  Check my other scripts: https://github.com/creold
*/

//@target illustrator
app.preferences.setBooleanPreference('ShowExternalJSXWarning', false); // Fix drag and drop a .jsx file

// Main function
function main() {
  var SCRIPT = {
        name: 'SelectPointsByType',
        version: 'v.2.1.3'
      },
      CFG = {
        aiVers: parseFloat(app.version),
        isMac: /mac/i.test($.os),
        isTabRemap: false, // Set to true if you work on PC and the Tab key is remapped
        minAngle: 0, // Degrees range for the Tolerance
        maxAngle: 180, // Degrees range for the Tolerance
        cosTolerance: -0.999999, // Correction of coordinate inaccuracy
        btnHeight: 40, // Height of buttons with icons
        modKey: 'Q', // User modifier key for shortcuts
        uiOpacity: .97 // UI window opacity. Range 0-1
      },
      ICNS = { // Binary icons data
        bezierNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02\x0BIDATx\u00DA\u00ECV\u00BDR\u00C2@\x10^\x18g\u00A4\u00D2he\u00C7\u00D9h\x1B\u009F\x00\x1C{\u00C4'@\u009E@}\x01DZ\x0B\u00C0\x07P\x18\x1F\x00\u00B0\u00B4!tZ\x11;\u00C7\u00C6X\u00D2H\u00AC(\u00E3n\u00B2@\u0092\u00E1\u009F\u00CBU\u00EC\u00CC\u00CE\u00E5\u0092K\u00EE\u00CB\u00EE\u00B7\u00DF-\u00C0\u00C66\x16\u00B4\u00D82\u008B\u009D\x12\x14qH\u00F1\u00B4\x1E+@M)Z\x04PvZ\u0097\u008E3\u00E8{N\u00D7%\u00B8V\x0B\u00E2A8\x01# \u00F7\u00FB\u00DF2\u00BE\x1D_x\u00E5\u00AE\b\u00CE\x13\x1A\u00C0\u00F6\u008EP\x0B\u00E2\u00C70\u00A0g\u008E\u00E7\x1FH\x07\u00DB\u0092\u00C2\u0089\u00AD%\u00D6\u00DE\u00C0\u00F3Y\x03\u008E2\u0082A\u0098\u00EE=\u00D5\u00D5\u00C1\x04\u00D5q  WX\x1D\u00A7\u0091\u0082\u00C0\u00CD\u00D2\u00BC\x19\u00B9\u008DN\x7Fn\u00E2\u00C66?o\u00E0p\u0087sS*\b\u00DE\u00B8\u008C\u00AE\u00CFx\u00A7\u0089^\u00E5\u00EB\x1C\u0082\u00C8\u00CB&\u00A6\u0098\x03\u0080,\u008B\u00DE\u00A6t\u00D05\x02\u00D7dG\u0082>\u00D8\u00E7\u00A9\u00C5\u00DEAO2\u00B8I\x00+\u00E8-Z\u008BQ\u00B1\u00A4p\x02\u0081d9\u00F7\u00D6\x14\u009E\u00DC\u00A2\u00A7G7\u008Fq\u00F9\x01b\u00FB\u00C4,\u00F5\u00CC\u00BC2)'\u00B9Fw\u009CN1\u00A8\u00A2\u00F54I\u00B9\u0088N\u00AC\u00FC\u00E1+\u00B8)\u00A8@2\x15b\u0094\x1B ]\t\b\u00B6?T\u00CC\u00E0\x1Do\u009E[\u0096\u00AC\u00B15R\" \u00B1\u00D7\u0085\u00CC\u00A3\x06\u00C9\u00B4'\u00E3\u00AF#\x01\u00B5\u00B9\u008CkS\u00B8E\u00D1\u00D2\u00F0\u0099\u00B1\x16\u0088\x11\x10\u00AFTu\u009F\u00B0\u0085mXeC\x1B\u0092\u009A\u00C8\x7F\u00B26\u00880Yq8g@\u008B\u00A6\u00E3\u0090\"\x15\u0097X45\u008E\u00C4!:\u00A9\u00A81c\u00AD\u00CD\u00CA\x0BR#\u00C1\u00D1x\"\u00E1\u00C2\u00BFk\u0086\u00B4%\u0090\u009EUEm\u00E1\x13\u0096\x0F6PR\x1DS@\x10\x17\u00BA>\"V\u00FDQQ\u00A5\u00A4m\u00E7\u00AD<\u00EEA=\x05\u00CD\u00AA\x04 \u00DCM\u00C3\u00CDp\u00C9=q#S\u00CC\u00B0i\u00A0Mh\u0086#\u0096\u00ED\u00F0yb\u00C2\u00D7\u008B\x15h\u0086\u00DF\u00E9\u0088q[\x01i\u008D\u00EE|\x1B\u00FC^\u008C\u009Aa:G\u00A8C\u00F7\u00FA\r\u00F5\u00C6\u00A5*`c\x1B[\u00D1\u00FE\x05\x18\x00<F\u00EDJ\\\u00EF\u00C5\x17\x00\x00\x00\x00IEND\u00AEB`\u0082",
        bezierDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\x19tEXtSoftware\x00Adobe ImageReadyq\u00C9e<\x00\x00\x02\x17IDATx\u00DA\u00ECV!o\u00C2P\x10~,\x18\u00C0\u0090\u0080%\u00AB\u00C2\u00AES\x045\x16~\u00C0\u00C0`a\x06;\u0090\x04\x12&\u00C0A\u00C8$\u0098\u0082\u00C5l\x0B\x16\x02(\u00E4\u00AAQ$\x04IV\x03H\u00F6]\u00F3JX\u00D9\u00B2n{\u00BCM\u00F0%\u0097k\u008F\u00D7\u00F6\u00E3\u00EE\u00BE{\u008F\u00B1\x13N\u00F8\u0087p9Y\u0094\u00CDf\u00FDp\u008D`0\u0098\u00D8l6\u00C6j\u00B5\u00EA\u00B4Z\u00AD{\u00A9LAb\u00D8\u00EF\u00F7\u00B7\x164M\u00DB\"&\u008C\u00C4\u0099\u0093E\u00A1P(\x16\u008F\u00C7w\u00F7\u0099L\u0086\u00DC\u008DT\x12\x1E\u008F\u00E7 \u00E6\u00F3\u00F9\u00FCRIL\u00A7\u00D3\x11lw?\x18\f\x18\u00FA\u00E2I\x14\t\u00B7\u00C3u\u00C9z\u00BD\u00FE\x18\x0E\u0087chL6\u009F\u00CF\r\u00C4\x1E\u00FETRh\u00CA\x1C\u00ACq\x14\u0089\u00E2\u00C5\n\u00F5\u009Dm\u00CD\bf@\u0092\u00BAm\u00ED\x0B\\\x1E\u00F1\u0091\u00E8r\x10\u0089\u00B2-V\u00E6\x1F%G}0\u0086\u00B5a\u00B70\rv):\x131\u00B8\u00A1\u00C3g\u0089\b)d\x06{\u00E61\x1D\u00991D\u0097\u00E3\u009CgG\u00E5\x1F<\u0080\u00D7\u00EBe\u00D1h\u00D4\u00BC\u009EL&\u00C6z\u00BD\u00BE\u00B6\u0097N\u00C8\u00D8\u00E6\x04\u0089\be\u00EA\u008E\x133Q*\u0095h\u0098\u0099\u00D7P\r\u00ABT*#\u0090\u00B8\u0096\u00A1\u008E\x18\u008D\u00F2Z\u00AD\u00B6\u00B5\u0083bG\u00D9\u00C0>C.\u0097{\u00ADV\u00AB~*\t\x01\u00A5`\u00C5b\u0091\u00BC\u00CE\u00E7\beevT\x124/TUm\u00A4R)\u00F3\u00BE\u00DB\u00ED2]?h\x07jT+8\u00DE\u00FF\u00C1\u00DA\u0089]\x02J\u0093\u0080K\u00EFI\\u\u00FA,H\u00B8\u0084\u0090\u00F8@]$\u00F1\x0E\u00EC\u008A7\u00F2\u0097$\u00DC\"IP\u00FDA\u0084z\u00E1\u00DCR\bW\u0095\u009FgI\u0091\u00B9\u00B7\u00BC\u00F0\u008F\x1F_\x1D_\u00CC\x14\u008DOS\u00C232\u00D3\u00FE\u00EDV\u00FE](\x18`j:\u009DVI\u00BE\u00BD^\u008F\u009A\u00F7\x02D\u00F2R\u00CB\u0081C\u00CF\u00BB!V(\x14\u00B6\u00BF:Y}\x17\u00F8\u00F7\u008A5\u00C0,\x04\x02\x01&\u0095\x04&\u00E6\u00BB\u00E3\u00E0r\u00B9d\u008B\u00C5b&\u00BB'\u00F2\u00CDfS\u0089D\"fO\u00E0LJ\u00BBkR\u00AA:l\u00E7\u0093\x1F\u009F3N8\u00E1O\u00F1&\u00C0\x00\u00E6:\u00F1%\u00AC+\u00E1\u0098\x00\x00\x00\x00IEND\u00AEB`\u0082",
        orthoNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x02\u00AEIDATX\u0085\u00ED\u0097_HSQ\x1C\u00C7?\u00B7?lT\u008CY\u009A\t\u0091\u00B9^4\x04\u0087E\x1A\x14\u00CC\u0097\u00E8\x1F\x14\x04\u00BD\u00F8\u00E0 \u00B0\u0082J\t_/\u0099#\u00E8)*\u0082,\u00C8\u00F4\u00C1\u00A7\x10\f\u00B2\u00A4\u0097\u0084z\u00A8\u0088\u00B5Q\u00E0C`3\u00A4U&MM\u009B\u0096\u009D8\u00D7\u00DDy\u00B6\u00DD9k\x0F\u00F6p\u00BFp\u00E1\u009C\u00DF\u00FD\u009D\u00EF\u00F9\u00EC\u00FC\u00BD\u00D3\u0084\x10,\u00B7V,;\u0081\r\u00A1\u00C8\u00860eC\u0098\u00B2!L\u00FD\x17\x10\u00AB,\u00A3\x01m+ \u009F\x18\u00BA\b-\u00EA\x10\u00D0\u00DC\u00807Q\x0B\u00A1\u008BX\u008E|\u0099+\u00DBD\u00D0ED\u00862\u00EF\u008E\u009B\x15\u00ED8\x0B\x1A\u00F0\u00ECs\x12}\u00F5\u0093\u0089\u0091\u00974\u0086\u00F6X\x1A\u00DE\u00A9\u00D9Kl\u00E8!\u0095\u00F5\u00EB\u008C\u00FA\u00DB\u00EE\u00EF\u00B8=\x079\u00F1\u00E2\u00A9e\u00FEm\u00EF3\\\u009BwQ\u00B2s5C\u008F\u00E3\u00C4\u00BFuqz\u00F0\x14\x12\"\u00F9\u00B4\u00E1\x15\x1D\u00BB\x7F\bU\u00FDMB\u00B4W\u00B6\u00A4\u00E5\u00B9E\x1B~q\u00BDl\\D_/$\u00CB\u00B2\u008C\u00C9w2Gm#=\u00A4\u0097*\u00D9W\x1B\u00DE\u00D4\u00E9(\u00A9\u00AE\u00A7\u00BA\u00D1\u0099\x12+?\n\u00EF\x1E\u00B4\x10\u00D0\x0E\x03\u00CE\u00C44\x15\x1B\u00EF\x1C.\u00D8\u00E4]\u00C8\u0095e\u0087\u00CB\x05\u00DC5\u009E\u0080\u00F6\u00D9\x18v\u0088S\u00B0\u00AD\u00DC\u00F0R\u00B5\u00FD\u00B8\u0093\u00B9\u0099\u00FA\u00D4\u0085\x19\r\u00F6\u00F1)m\t\u00C4\"\u00E0t\u00F7\x03\u00BD@M\x12@jb\x04\u00E2\u00CA\x12\u0090\u00E5\u00C9\u008Fj\u00EB\u00E2D\u009B^\u00C3#\x16\u00C9\u00F4\u009E\x1E\x0Be\u00AE\u0089k[F\u00A9=_H\u0095\x1F\u0086\x07\u00A0\u00EF\u00E44S_\x1E\x01\u00C7\u00D2fx\x18\u00B7g\u008C\u00A2\u008A*\u00F6\u00DFXiD\u00FA\u00CF\u00CC1:\x18&6\u00B4\x01(M\u00CB\u00EFa\u00ED\u00C6\x03\x1C\u00BA\u00B5\u0086R\x1F\u0084;\u00E1\u00F9\u0095\u00AF4}(\u00CA\u0084\u0090\u00AB\u00BDd\u00C7Uf\u00C6}8\\o\u0088\x06g\u00D2\x00\u0086\u0081Vt\u00D1i\u00D4:j\x1B\u0099\u009D<k\u0094g\u00A7.s.\u00D2\u009D\u00F0\u00F1\x1By\u00A90=\x14\u0096\u00AF\u00E7\u00F7/\x0F\x0E\u00D7=\u00A2\u00C1Kr7-\u00FEe\x15\u00D0\u00A4\u00C9\x05%r\x1F\u00F0\u00E7\u00DC\u0086\u00EA\x0F\x02\t{D\u0089^D\x17\u00ADjZv\u0088\u00F9\u00B3\u00E2\u00BD\x12\u00E9B\x17\u00FE%u\u009E\u00E9%A\x1A\u0094H\u0099yF\u0090\u00E3\u00C4Ti\u00E5\x144\u00FF\x13\u00C0\u00BC\u009A\x13\x1EV\u00DEYF\"s\x14\u00EA\u00D0\u00C5@\x1E\x10\u00D2\u00D3\x07<Q\"\u00C9\u00D1\u00C86\x12\u00EA\u0086\x0E\u00E7\r 5\u00EF\x11\u00B6\u00EA#\x1B\u0084O)\u00F7\u00E6\r`\u00ED\u0095\u00EC#\x1B\u0084[)\u00E7?\n\u00D6^\u00C9>\u00B2A(g1K\u00DB\u008EK\u0093\u00EA\u0095\u00EC\u00C3\u00FA*W\u00D7D\u00AE\u00AB\u00FCo$\u00BD\x02Z]z\x0B\u00FBo\u00A0)\x1B\u00C2\u0094\ra\u00CA\u00860\u00B5\u00FC\x10\u00C0\x1F\u00C1c-8\u00DA\x1D\u00C2\u00CF\x00\x00\x00\x00IEND\u00AEB`\u0082",
        orthoDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x03\x00IDATX\u0085\u00ED\u00971L\x13Q\x18\u00C7\u00FFEI^\x1As\x11SJ\x17(\u0096E\u0098:\x10\x1B\x13\u009B\u00C0f\u008CD\x12\x13\x16b`\u00F2u\u00D0\u0088\t\u00860\u0090\u00B6!\u00D2\x12\x1Dt\u00EB\u009B\u00944\x0E`Lp\u00D0\u00B8iPbp*\x18`\u00C1J\x0F\x16\u00C9\x11Z#w\u00B5\"\u0098g\u00EE.\u00AFpW\u00D0\x0E8\u00DC?\u00B9\u00E4\u00DD\u00D7\u00F7\u00FE\u00DF\u00EF\u00BE\u00F7\u00DDk\u00EB\u00DA\u00DB\u00DB\u00C3q\u00AB\u00E6\u00D8\t\x1C\bA\x0E\u0084!\x07\u00C2\u0090\x03a\u00E8\u00BF\u00808i\x15\u00A4\u00946\x03\u00E0W\u009E1\u0096\u00A9d@)=\r \u00A8\u00DFf\x18c\u00F9C\u00E6\u00F3\u00B9|\u00CD*cl\u0095\u00C7\x0E|wD\u00A3\u00D1\u0094\u00DB\u00ED\u00EEkkk#\u00B9\\\u00EE\u00E7\u00D6\u00D6\u00D6\u00C7\u0091\u0091\u0091\u008BV\u0086\u0089D\"\u00AC(\u00CA\u00ABP(t\u008A\u00DF\u00CF\u00CD\u00CD}\u00F7x<\u0097\u0087\u0087\u0087\u00DFY\u00CD\x1F\x1D\x1D}_WWw\u00DE\u00EF\u00F7\u00D7.--\x15UU\u009D\u0088\u00C7\u00E3\u00912\bN\x19\b\x04>\f\r\r\x11#655\u0085\u00E5\u00E5\u00E5\u00BB\u00D1h\u00F4\u00C1\u00BE\u00A7\u00EF\u00F6x<\u008F\"\u0091\u0088\u00D4\u00D8\u00D8\u00F8'\u00BE\u00B6\u00B6\u0086T*\u00F5MQ\u0094\u00DB\x00\u00A6\u00C5\u00AA\u00C4\u00E3\u00F1\u00C1\u00D6\u00D6\u00D6\u00FB===f\u00BE\u00F1\u00F1\u00F1b6\u009B\u00BDP\u00B6\x1DMMM\u00BD\u00E1p\u0098\u0088\u00B1`0\u0088\u0085\u0085\u0085AJ\u00E9\x15\x00D\u00DF\u00A6\x06\u00FE\x19!\x04\x06\x00\x17\x1F\x13B$\x00\u008F\u00F9E)\u00FD\u00CA\u00CB\x0E\u00A0X__\x7F\u008E{\u0089joo';;;\u00BDe\u008D)\u00CB\u00F2\u00CB\u00F5\u00F5\u00F5\u00B2\u0089\u008A\u00A2\u00C0\u00EDv\u00BF\u00E6O\x06 d\x00p\u00E5\u00F3y\u00A8\u00AAj\u00CE\u00E5\u00E3B\u00A1 .o\u00D0\u00D7Ls\x0F\u00EE%jss\x13\u00DB\u00DB\u00DB\u0099\x13\u00B1X\u00CC\fwuu\u00AD\u00A6\u00D3\u00E9\u009B.\u0097\u00CB\u00ED\u00F3\u00F9\u00B0\u00B8\u00B8\u0088\u00C9\u00C9IuccC\x06pg\u00DF\x16\u00E7$I\u00CA\u00AE\u00AC\u00ACx[ZZj4MC:\u009D\u00FE\u00A5iZFU\u00D5\u0092\u00DE|\u0086.\x15\n\u0085\u00CF\u00D9l\u00B6\u00D9\u00EB\u00F5\u00D6J\u0092\u0084\u0099\u0099\x19\u00CC\u00CE\u00CE*\u0089D\u00E2\u00FA\u0081\u00C6\u00E4\u00FB\u00ED\u00F7\u00FB\x1Fj\u009A\u00D6A\b\u00F9$\u00CB\u00F2\x0F\x00\u00D7\u00C4\u00E4\x00b\u008C\u00B1'\u00FC&\u0099L\u00DE(\x16\u008B\u00B7\u00F8\u00B8T*%\u00C7\u00C6\u00C6\u009E\u00EA>\u00FD|\x1E\x00\u00BF\u00B0\u00F6\u00B9\u00CF\u00E7;\u00B3\u00BB\u00BB\x1B \u0084<\u0093e\u00F9\x1E\u00EF\u009B\u008A\u00BF\u00AC(\u00A5\u00DC$*\u0084^\x00\u00E8?\u00EC5\x14\x1F\b\x00\u0087\u00BD*\u0084\u00E3\u008C\u00B1\u00988\u00CF\x16B?+\u00BE\b\u00A1\t\u00C6X\u00FFQ\u0092[xq\u0090>!t\u00D68#p\u00C8\u0089)\u00D2\u00F2-\x18\u00F8\x17\x00]\x03\u00BA\u0087\u0095\u00B7u%,\u00AA\u00D0\u00C9\x18{[\x05\x04\u00F7\u00EC\x00\u00F0F\b\u0099\u00D5\u00B0\u00ABD\u00B70\u009E\u00AF\x16\u0080K\u00F7\u0098\u00B7\u00CAa\x07\u00D1!\u008C\u00A7\u00AB\x05\u00B0\u00F12s\u00D8A\u0088\u00EFx\u00D5U\u00B0\u00F12s\u00D8A\u0088\u00E7\u00EB\u0091^\u00C7#J\u00F42sT\u00EA\u0089N\u00BD!+~\u0095\u00FF\u008Dt\u00AFN\u00FD2{\u00C2\u00F9\x1Bh\u00C8\u00810\u00E4@\x18r \f\x1D?\x04\u0080\u00DF\u00D6\x06/t\u00D4\x0BO\u00DA\x00\x00\x00\x00IEND\u00AEB`\u0082",
        flushNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x01\u008FIDATX\u0085\u00ED\u0097O(DA\x1C\u0080\u00BF\u00DD\u00A5$\u00B2\"R\u008Ap\u00E0\u00A0=qS{P('\u00E5\u00BC+G\u00C2a\u0085\u00C3+\u00DA\u0083\u00DC6))\u00EA\u00DD\u00DC\u00B4\u00C7=#\u00B5\u00EDe\u00DD(j\u00DDV)\u00C4\u00C1\u00E6\u00CF\u00D3zf\u009B5\u00FB\u00C7\u00C6\u00EE^\u00E6;\u00CD\u00FB\u00CD\u00BCy\u00DF\u00F4\u00FB\u00BD\u0099\u00C6aY\x16\u00D5\u00C6Yu\x03-!\u00A1%\x04ZB\u00A0%\x04ZBP\u00A3DJ!\u00E8p\u00D3\u00DA\x7F\u00C4\u00C7\u00FB\u00D0\u00D7[NW\u008C\u00BB\u008B)\f\u00EB!\u00E7,{\u0083\x01ROk\u00D4\u00B78yN\u00A6h\u00EC\u009Cf6z\u0092\u00FF\x00\x0B:\u00BC\u0080W\u0089\u00CB4\u00F7\u00F8\x181\u00BA\u00F1\u00F8\u00ED\u00E0\u00B9\t\u00A7\u009B1\u00E6.\u0087\u0095\u00B1\u00BB\x03\u00938k\u00C3\u00F8\u008E]\u00D4\u00B9!\x19\u0087\u00C3\u0089\x17\u009E\u0093\x1D\u0085$B\u00C0\u00A2\x12\u00CF\u0092\u00E8\u0085\u00F9\u00AB\u00EC\u00D8N\x1F\u00DC_\u00DF\x02&\x10\u00C9\u00C4\u00DB\x06W\x19\u00DF\x1E\u00A3KZW4\x04\u00F1\u0083\u00E5r\u00D5D;\u00B0\x02\u00A4\x17\u00D2\u00A0\u00F4\u00FE\u00A0PM\u0084\u0081\u00DC\u00B9\u00CD`\u00F987\u00B3\u00D3\u00F1\u00F1\u00FA&\u00CD\u00EB\x01\x02\x18\u0096\u0097\u00DD\u0081\x06\"\x0B\u00A3Y\u00E98\u00DBJ\u00A7c?\x7F:~C\u00EE\u00C2\u009C\x016\x00\u009F4\u00C3\x06\u0086\u00B5^za\u00FE\u0095\u00A0\u00C3\u0094D\x1E\u0081\u00EE|\x7FM9\u00F7\u0089\u00A5\u00EF\u008F\u00A7i\x02\u00FC\u00CA\u0088\u00B2K\u00D8\u00AB\x0EI\u0091*H\u00D8\u0098R\u00DB\u00A3\u00F4VD\u00C2\u00B0\x12\u00C0M\u00E6\u00D9\u00DE\x00\x15*qv$\u00A4\u00B6[\u00E9-\u00B2O\u00FC\x17\u00E1b\x12\u00FA\u00F2#\u00D0\x12\x02-!\u00D0\x12\x02-!\u00A8\u00BE\x04\u00F0\t3\u00E3|\u00ABJ\u0092\x0EH\x00\x00\x00\x00IEND\u00AEB`\u0082",
        flushDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x01\u009BIDATX\u0085\u00ED\u00971k\u00C2@\x18\u0086\u00DF&\x1D\u008A\n\u00CD\"\u00B5\u0088\u00E0?p\u00B2\u0083\u0093C\x07\u0091\x0E\u00A5Pp\u00B3\u0085\u00C2-\u0085v\b\u0094Li\u00FC\x05\u00E2v\u00D0\u00C1\u00D1\u00A98\u00C9\u00ED\u0095,\u00FE\t\u008BKF\u009B\u00A9\u0081\u00AA%\u0092\u0083\u00ABg\u00B4\u00D2\u00AA\u00CB=\u00D3\u00E5\u00BE\u00CB\u00E5\u00C9}_\u00EE\u00C8\u00C1l6\u00C3\u00BE\u00D1\u00F6n\u00A0$\x04\u0094\x04GIp\u0094\x04GIp\x0E\u00A5\u009E\r \u0084\x18\u0099L\u00E6u:\u009D\x16\u00C3\u00BB4M\x1Bx\u009EwE)\x1D/\u009B\u00C5q\x1C3\b\x02+\u0099Lj\u00BE\u00EF\x07\u0086a\\[\u0096\u00F5\x16{\u0080\x11B\u00CA\x00\u00CAR@ \u009DN\u00D7\u00AB\u00D5j\u00BET*\u00CD;]\u00D7\x05cl\u00D0h4\u00CE\x16\u00C7\u00DA\u00B6}\u00A1\u00EBz\u00D74M=\u0091H`4\x1A\u00A1\u00D5j}\u00FA\u00BE\x7F\u00BAj%.\x01<H\u00BD\x0Bp\x01D\u00ED^\u00AFW$\u0084x\x00\u00DA\x00\x18\u008Fe\u00B3\u00D9\u00FBZ\u00AD6\x17\b\u00C9\u00E5r\u00A8T*G\u00FD~\u00FFn[5q\x02\u00E0\t@\x13@J\u008A.\u00B0j%\u00BA\x00\u0096\u00E6V\u00A0\u00EE\u00BA\u00EE\u008FtL&\u0093/a\u00DE\x02\x00\u0093RZ\u00B6m;\u00D5\u00E9t\u00CE\u00C5t0\u00C6\u00C2t\u00BC\u00C4\u00D6\u00C4o\u0088)\u00CC\u00DB\u00B0\x06CAa\n\u0087R\u00FA\u00BCqa\u00FE\x15BH[\x10\u00F9\x00\u0090\u008F\u00FBj\u00B6\u00B9O<F\x0F\x0F9\x06p#\u008D\u00D8\u00B6D\u00F4\u00D6M\u00A1k\u00F7\x12\x11m\u00A1]\u0090\u00A2\u00BB\u0090\u00A0\u0094\x0E\x01\u00BC\u00F3\u00EBh\x03\u0094\u00D8\u00C5\u00D91\x14\u00DA\u0086\x14]\u00B3O\u00FC\x17\u00DDu\x12\u00EA\u00E7\u0087\u00A3$8J\u0082\u00A3$8J\u0082\u00B3\x7F\t\x00\u00DF\x14\f\u0095\u00EE?\u00B8\u00F1\\\x00\x00\x00\x00IEND\u00AEB`\u0082",
        cornerNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x01NIDATX\u0085\u00ED\u00D71J\x03Q\x10\u00C6\u00F1\u00FF\u0086\x146\u0092\u0090J\u00B0\x16\u00C1*\u00E4\x04\u00A2\x17\u00F0\b\x1B\x0B\x1B\u00CF\u0090f-\x15;A\x10\u008CG\u00C8\r\u00B4\u00B3\x12\u0082\u0085\u008D\u00856\x166\u0091`a#\x19\u0099\u00CD>\u00DC\u0085\u0098\u009D\u00DD'\u00A4y\x1F\u00840\u0093\u00DD\u00C9\u008F0\u00C9#\u0091\u0088\u00B0\u00EA4V.\b\u0088\\\x02\u00C2% \\\x02\u00C2\u00A5\u00F9/SN\u00A2.\u009D\u00ADk\u0090\x0ED\x13&\u00CF\u0087\fdl\u00BE_\x7F\u00B6\u00BD\x1E\tm9\u00DF\u00F8\u0092\u00D7[I\u00A3\u00CFZk\u00DF8\u00DB\x1Fq\u00D5;\u0095\u00F1P\n\u00D1Z\u00FB\u00C6\x19\u00FE;1\u00FB\u00DEf\u00AD]\u00ECi\u00AD}c\u00FC\x10\u00BA\x0B\u00EF\u008F{\u00DC\u009F\x15\u00FBZ\x7F\u00BC\u00EC\u00A7\u00AF\x1BR\u00FF(\u009F\u00BF\u00C1\x1D\u00D0b}\x13d\x06\u00BD#x\u00B8\u0084F\x13>\u00DF\u00F4\u00AA)\u00B0[\u00B6\u00A4\u00F5\x10y\u00C0o\u008E\u0081'`\x07\u00B8\u00C8\u00F5K!\u00D5\x11\u008B\x01}\x06r\u0093\u00BB&\x06\u0086VH\u00B5\u009D\u00B0\x004\u00F3\u00BA\u009F\u00EB\u00B4\u00D2\u00FB\u00FE\u00D8\x11;\u00C2\n\u00A8\x01\u00B1!\u00AA\x02*B\u00CA\x11u\x01\x15 \u00CB\x11\u00BE\x00#\u00A4\u00EC\u0093\x18y\x03\u0096CF\x16\u00C4A\u00F6\u00F5\u00F2\x03,\u0086L\u00B3\u00F9\u0086\x03,\u00A1+\t\u00B1\u00F7AW\u009C\x19\u00A7s\u00B3:\u00FC\x03s\t\b\u0097\u0080p\t\b\u0097\u0080H\x03\u00FC\x00l\t\u0098\u00FF\x1D\u00DA\u008E\u00B1\x00\x00\x00\x00IEND\u00AEB`\u0082",
        cornerDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x01bIDATX\u0085\u00ED\u00D7\u00B1j\u0083@\x18\x07\u00F0\x7F\u00A5Cq\u00B0\u00D2A\u00E8\u00E2h\u00A1S^@(\u00ED\x0B\u00D47H\n\u009EC\x1F\u00A1\u00CF\u0091\u00E1\x10\u00DA>Bv\u0097\u00E0\x13t\u00EA\u00E0,\x14\x14\u008Aq\u00EA\u00A4\u00E5\x13\x0F\u00CC\u0090xz\u00A5Y\u00EE\x0F\x12\u00EE\u00CB\u00F9\u00F9\u00C3|\x11<k\u00DB\x16\u00A7\u008Eqr\u0081F\f\u00A2\x11\"\x1A!\u00A2\x11\"\u00E7\x7F\u00D1$\u008A\u00A2\u0085\u00E38\u00AF\x00\u00AE\x00|\x17E\u00F1\u00C49\u00FF\u0090=_\u00F9\u00B1\x1DE\u0091mY\u00D6W\x18\u0086\x17\u009E\u00E7!\u00CB2\u00C4q\u00FCS\u00D7\u00F55\u00E7\u00BC\u0092\u00E9\u00A1\u00FCs\u00B8\u00AE\u00FB\x12\x04A\x07\u00A0\u00D0'\u00AD\u00A9.\u00DBC\x19\u00D14\u00CD\u008Di\u009A{5ZS\u00FD_\x104\x0By\u009E\u00DF'I\u00B2W\u00A7uY\u0096\x0F\u00F4\u00BDL\u009F\u00D93\u00D1_`\x0B\u00E0\u00D2\u00B6mP\x1F\u00DF\u00F7\u0091\u00A6)\f\u00C3@Uu\u00E3\u00B0\x03p76\u00A4\u00B3\x10C\u00C0\u00A0\u00FC\f\u00E0\x13\u00C0-\u0080\u00F5\u00A0>\n\u0099\u008C8\x00Xq\u00CE\u00DF\x07{\u0096\x00\u00DEd!\u0093fB\x06@\u00E9\u00D7\u00ABA\u0089\u00F6o\x0F\u00CD\u00884B\x160\x07\"\u0085\u0098\n\u0098\n\x19E\u00CC\x05L\u0081\x1CE\u00A8\x02d!cwb\u00A3\n\x18\u0081ld\x10\u008F\u00FD\u00DFK\tp\x00\u00B2\u00EB\u00FB\u00A3{\u00D2\x1D;\x18c\x0B\u00C6\u00D8rl\u00DF\u0094\u0083\u00FAQ_q\u008E~\x03\x13\u00D1\b\x11\u008D\x10\u00D1\b\x11\u008D\u00E8\x02\u00E0\x17\u00C3'\x02!\u00E0\x11\u00BBV\x00\x00\x00\x00IEND\u00AEB`\u0082",
        brokenNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x02IIDATX\u0085\u00EDW\u00BFO\x14A\x18}sR\x001\u00E1\x14-\u00AC8b\x026\u00863\u00C6J\x12\u008E\u00F8\x07@hi\u00AE\u00B1UCE\u00B3\u00F1p\x1A+sj\u00AC,\u00BC\u0086\x16\u00AE\u00B23z\u0089\u009D1@GB\u00C1u\x14p\b\u00CD\x1E\u0089rc\u00BE\u0099\u009B\u00BDqng\x7F\x1C\u00C5Y\u00ECK6\u0099\u00F9\u00BEo\u00DE\u00BE\u00F9\u00E6\u00ED\u00DE\x1E\x13B`\u00D8\u00C8\r]A&\u00C2@&B\u00E3\u00BF\x101\x12\u0099\u00E5\u00AC\u0080;\x0F+r|\u00F4\u00B3\x02O4\x07\u00BAK\x1C\x0F\u00BD'B\u00AF\u00B7S\u00AB\u00E2\u00C3\u00AC/\u00F6\u00B7\u0085\u00BChL1W\u00FD\x15x\u00A2\x16\u00B7D\u00FB\u0097\b@c\u008A\u00A5\x17\x11\u00CB\u00E3\u00F6\u00C4\u00F8d\x0E\u00A3\u00F9\u00DE\u009C\u00C6\x14K\u008B\x04<nR\u00BF\u00D5\u00C1\u00C5YoNc\u00FF\u00E4:8+\u00A5\u00F0BI\u00AE\u00E9\u00E3iu\u00CC2\u00F7o\u00C7\u00BB\u00C2*FF?\u00E2\u00C9\u00EB19\u00FF\u00B2\u00DEF\u00FB\u00F4\r\u00FC\u00E3\u00F9n\x05\x19m\x17\u00B7\u00EEm\u00A1s\u00F9Hm\u00E9\u00DA\x0F\u009C\u00EC\u00AF\x00(v\u00F3\u00C0\u00F8\u00ED\u00EF\x18\u00BB\u00B9\u00F6\x0F\u00CF\u009F\u008B\u00A7x\u00D6\u00DC\u008C\x17\u0081\bW\u00ABnT0Q\u0098\u00C3\u00C2\u00CB<\u00E6\u00CA\u00AA~\u00AF\x0646\u00CEp\u00DE\u00DC\u0093yO|\u008B\u00E4\u00D1Hm4}\u00BDBI\u00BC\u00BF{)lP\u008Cr)\u00B8\u00D2\x1B\u008D\u00B3\"8\u00A3\x1D~ux*'s\u009C\u00D5e\x07\x12 \u00B9\b\u00CE\u00F2\u00E0\u00AC\n`\x07\u00C0\u0082\u008Cu~\u00AB#\u00D0\u00A01\u00C5\x14\u0096\x00\x1C\u0082\u00B3J\x1Cu\u00B2\u008F\x1A\u00DA=P\x070ee>cr\u00E6\x06\u0084\u00B8\u00DF\u009D\x1F\u00E0\u00F4\u00C0\x07\u00F0\u00D8\u00AA#\u008F\u0094\u00E1\u0089\u00DD\u00C1DpF\u00AE\u00FB\x14B\u00FA\"0^\u00FF\x1A2n\u00CD\x12}\x0E`9lM\u00DC\u00D3\u00B1\f`\u00DB\u008An\u00C0\x13\u00B1-\u0096\u00C7\u00A7\x1E\u00D3\u00E7V\u00E6\u0081\u00DD\x11\u00B7\be**\u009E0vRr\u00B54f#5\u008B\u00A7h>\u00A6Q\u00C6\u00B4\x17\u00A6\x17@\u00F0D]\u00AEU\x1C\u00E8rV\u00CD\u0092\u00F0N(#\u00EE\x18\u0091E\u00E7\u00F9'E\u00FF\u00D1N\u00EBn\u00B8:Q6\u00C6\u008D+\x0B@\u00D0\u0091F\u00D8=\\\"\u008A\u00C6\u00B8\u00EA\u00A8\x19\x04&W\u00F0C\u00E8\x12a\u00BE\u00E9\u00D2\u00FB\u00C0\r\u0093+\u00B8\u0087\u00EB\u00F3\u00AEw\x1C\u0083~\u00D2\u0085\u0081\u00B88[\u00B43\u00D9\u00DF@\u008DL\u0084F&B#\x13\u00A11|\x11\x00\u00FE\x02\u00BBf\u00F1\u00FER\\>\u008B\x00\x00\x00\x00IEND\u00AEB`\u0082",
        brokenDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x02MIDATX\u0085\u00EDW\u00BF\u008F\x12A\x18}\x12\x1A\x17\u0089g(\u00A0\u00E3\u00FC\x03\u008CX\u00D8\u00A0\u0089\u00D0\u0093x\u00A1\u00B5\u00A1\u0091\u00AF\u00F4b\x074\u00D8P\x1A\u00DA\u0089\u0085\u00D7\u00D8\u00A2&\u00C4V/\u00B9\u00D0X\u00DCY[(\x1D!!\u00D1\u00C0\u00AE\r\u00B0\u00E6#3\u00EBd\u00B3\u00B3?\u00B8\x02\u008B}\u00C9&\u00DF\u00CC|\u00F3\u00E6\u00ED7of\u00E1\u0086\u00EB\u00BA842\x07W\u0090\u008A\u00D0\u0090\u008AP\u00F8/Dd\u00C3\x06\u0089\u00E8\u00B8\\.\u00F79\u009EN\u00A7}!\u00C4\u00CF}\x16\u0089\u00E21\u00DE\x13\u00DDn\u00F7Y6\u009B}\u00D3l6or{4\x1A\u00FDY\u00AF\u00D7\u00CF\x07\u0083\u00C1\u00BB$\x02b\u00F1\u00B0\u0088\u00A0\u00A7\u00D3\u00E9,l\u00DBv\x158\u00E6>S\u00FEux\u008C\u009E\u00C8\u00E5r\x19\u00CB\u00B2\u00BC6\u00C7\u00DC\u0097\u00A4\nqy\u008C\u00A4\u00B6mo\x1D\u00C7\u00F1\u00DA\x1C\u00AFV\u00AB[DT\u008B+\u0080sy\u008E\u009F\u0087\u00B9\u00F5\u00BCD\u009Ep\x1C\u00E7\u00F5r\u00B9|,S\u00D8hW\u00A5Ri\u00B4\u00DDn\x1F\u00EE\u00DE(\u0093\u00F9:\u009B\u00CD\u009A\x00*r\x1C\u00F9|\u00FE\u00C2\u00B2\u00AC\u0097a\u009E\b\u00FD\u0080\u0099\\-\u00AB\u00D1/\x14\n\u00F7\x1B\u008D\u00C6Q\u00B5Z\u00DD\u00E5O&\x13\u008C\u00C7\u00E3_\u008B\u00C5\u00E2\x1B\u008F\x0B!\u00BE\u0084\u00F1xHj4\u00F5\u00B4\u00DB\u00EDZ\u00AF\u00D7\u00DB\u00B8>p\x1F\u008F%\u00E1\n\u00BD'\f\u00D5\u00E1R\x0F\x01<1\u00A4\u00B0\u00CF>\x13\u00D1G\x00\u00A7q\u00EE\u0096\u00D8n'\u00A2#\"\u00E2\u00C5/\u0095\u0080\u00CDf\u00B3\u00DB\x02\x05\u008E\u00B9O\u00E2)\u0080\x1FD\u00D4\u008F\u00E2\u008E\u00F5\u00A3F\u00BE\u00FD\x07\x00e\u00DF\u00D0\u00A7b\u00B1x\u00C7u\u00DD{\u00B2\u00FD}>\u009F\u00F3Qx\u00E4\u00CBc\u008F\u00B4\u0084\x10W{\u0089 \u00A2\x16\u0080\u00B7\x01\u00A4\u00A7\u00CAx\x01s\u00D8\u00B8g>\u00D1\u00BF\x01\u009C\x04\u00CD\u0089:\x1D'\x00\u00DE\u00FB\u00BA_\t!\"K\u00CC\u00DB'\u008F\u00E9\x0B\u00DF\u00D0\x03\x7FE\u008C\"\u00F8X\u00F1=\x00\u00E0\u00B6\u00F6&5SI#^\u00E4\u00CC\u00C7S\u00D1\r\x1BfL\u00FF\u00C4\u00C4\x02\x18B\b\u00F6RMr@r\x0E\u00F5\u009C\u00C0JH#^j]u\u00D3\u00FE\u00C7E\u00C0\u00D6\u00DEU\u00D50U\u00A2\u00A5\u00C5\u00E7\u00D7\x15\u0080\x7F\x159\x0FZ\u00C3$\u00A2\u00A2\u00C5CC\u00CE>\u00D0\u00B9\u00BC\x0F\u00A1I\u00C4\u00B1\x16'\u00F6A\bt.o\u008D\u00B0\u00ED\u00A8K/\u00EC\u00F5\u0093.\b\u0092\u00AB.\x1Fo;\u00D2\u00BF\u0081\n\u00A9\b\u0085T\u0084B*B\u00E1\u00F0\"\x00\u00FC\x05\u00C3y\u00DE9\u0083\u00DD$\u00D7\x00\x00\x00\x00IEND\u00AEB`\u0082",
        flatNormal: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x00\u00D2IDATX\u0085\u00ED\u00D61\n\u0082`\x18\u00C6\u00F1\u00E7\u00B3\x0EP\u00D0\x01\u00A4\u00A9\u00AD\u00A91\u00F0\f]\u00C0.\"\rv\x10\u00BB@g\x10\x1C\u009B\u00DC\u009A\u00C2\x03\x04u\u0081zC\u00E3\x15\u00E5C\u00D4\u00A1tx~\u0093\u00BC\u00A8\u00FC\u00F5\u00FB\x10\u008D\u0088`h\u00CE\u00E0\x05\u008C\u00A8`\u0084b\u0084b\u0084b\u0084b\u0084\x1AE\u00C4\u00D4\u009A\u00F4\x11\u009A\x19\x16\u00AB3\u00DE\u00AFMq\u00953\u00B9\u00E0~\u00DD!\u0090g\u009F\u00DB4\u00FFO\u0084\u00C6\x03\u00E0Y\u00F3\u00AA\u00F9\u00D2\u00C76p\u00B1\u00DE\x7F\u0087i\x04$a\u0086\u00C7\u00EDd\u009D[\x17#\u0090\u00B8\u00CB\u009B\u00C8\x03\x0E\u00D6\u00B4\u00FE\f(\x03r\u00F9qrt\u00DB\u00AF+\u0094\x11\u00A3\u00DF\x13\u00B15\u00B1\u0088\u008F4\u00AA/\x07$\x03\u00D0\u00BE\x1C\x15\u00CD{\u00A2\u008B\u009Fo\u00CC?\u00E2\u00C7J1B1B1B1B1B1\u00A2\x00\u00E0\x03\u009B\u00C37\u00B2\x01}r6\x00\x00\x00\x00IEND\u00AEB`\u0082",
        flatDisabled: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00!\x00\x00\x00$\b\x06\x00\x00\x00\x07)S\u00DC\x00\x00\x00\tpHYs\x00\x00\x10\u009B\x00\x00\x10\u009B\x01t\u0089\u009CK\x00\x00\x00\u00D3IDATX\u0085\u00ED\u00D6/\x0E\u00830\x1C\u0086\u00E1o\u00CD\x0E0C\u0082\u00E4\x123(t\u00E5.\u0080\u00EC1v\u008E\u00CA]`\u00B2\u00BA\u00AAf\u0097@\u0092`v\x02X \u00FB%\u00B0\u0086\f\u00C4\x06\u00E2{T)\x7F\u00F2\u00866\u0084C\u00D7u\u00D8\u009A\u00DA\u00BC\u0080\x11#\u008C\x10\u008C\x10\u008C\x10\u008C\x10\u008C\x10\u00BB\u00888F3+\x18cNi\u009A\u00DE\u00DB\u00B6=\u00F7w)\u00A5\x1Eu]_\u00AC\u00B5\u00CF5\u00CF\u0099\u00FD\u009F0\u00C6\x14\x00\u008A\u00E8\u00C4H\u0092$\u00A5\u00D6:\u00CB\u00F3|\u0098\f!\u00C09W5Ms\u008B.\u009E\u00F2\u00D6Z\u00BF\u00E4M\u00F4\x01\u00D7h\u00F6\u0083\x04\u00E0=v\u00CEeK\u00EE\u00EBCd\u00B0\u00FB=\u00E1\u00A3\u0099X\x19B\u0098,\x07\u0080\n\u00C0\u00D7\u00E5\x18\x1F\u00CC\u00EE\u0089%~\u00BE1\u00FF\u0089\x1F+\u00C1\b\u00C1\b\u00C1\b\u00C1\b\u00C1\b\u00C1\u0088\x01\u0080\x17\u0086\tB\u00AD7\u00CDR\x16\x00\x00\x00\x00IEND\u00AEB`\u0082"
      };

  if (CFG.aiVers < 16) {
    alert('Error\nSorry, script only works in Illustrator CS6 and later');
    return;
  }

  if (!documents.length) {
    alert('Error\nOpen a document and try again');
    return;
  }

  if (!selection.length || selection.typename == 'TextRange') {
    alert('Error\nPlease select at least one object and try again');
    return;
  }

  var selPaths = [];

  getPaths(selection, selPaths);

  // Disable Windows Screen Flicker Bug Fix on newer versions
  var winFlickerFix = !CFG.isMac && CFG.aiVers < 26.4;

  // START DIALOG
  var dialog = new Window('dialog', SCRIPT.name + ' ' + SCRIPT.version);
      dialog.orientation = 'column';
      dialog.alignChildren = 'fill';
      dialog.opacity = CFG.uiOpacity;

  var icoBezier = ScriptUI.newImage(ICNS.bezierNormal, ICNS.bezierDisabled, ICNS.bezierNormal, ICNS.bezierNormal),
      icoOrtho = ScriptUI.newImage(ICNS.orthoNormal, ICNS.orthoDisabled, ICNS.orthoNormal, ICNS.orthoNormal),
      icoFlush = ScriptUI.newImage(ICNS.flushNormal, ICNS.flushDisabled, ICNS.flushNormal, ICNS.flushNormal),
      icoCorner = ScriptUI.newImage(ICNS.cornerNormal, ICNS.cornerDisabled, ICNS.cornerNormal, ICNS.cornerNormal),
      icoBroken = ScriptUI.newImage(ICNS.brokenNormal, ICNS.brokenDisabled, ICNS.brokenNormal, ICNS.brokenNormal),
      icoFlat = ScriptUI.newImage(ICNS.flatNormal, ICNS.flatDisabled, ICNS.flatNormal, ICNS.flatNormal);

  var btns = dialog.add('group');
      btns.orientation = 'column';
      btns.alignChildren = 'fill';

  var bezierBtn = btns.add('iconbutton', undefined, icoBezier, {style:'button', toggle:true});
      bezierBtn.preferredSize.height = CFG.btnHeight;
      bezierBtn.text = 'Bezier  ';
      bezierBtn.helpTip = 'Select Bezier (Smooth) \npoints (with handles).\nShortcut Alt + 1';

  var orthoBtn = btns.add('iconbutton', undefined, icoOrtho, {style:'button', toggle:true});
      orthoBtn.preferredSize.height = CFG.btnHeight;
      orthoBtn.text = 'Ortho   ';
      orthoBtn.helpTip = 'Select Ortho (Smooth) \npoints (with handles along axis).\nShortcut Alt + 2';

  var flushBtn = btns.add('iconbutton', undefined, icoFlush, {style:'button', toggle:true});
      flushBtn.preferredSize.height = CFG.btnHeight;
      flushBtn.text = 'Flush   ';
      flushBtn.helpTip = 'Select Flush points\n(with 1 handle along the straight \nsegment). Shorcut Alt + 3';

  var cornerBtn = btns.add ('iconbutton', undefined, icoCorner, {style:'button', toggle:true});
      cornerBtn.preferredSize.height = CFG.btnHeight;
      cornerBtn.text = 'Corner ';
      cornerBtn.helpTip = 'Select Corner points (without\none or both handles or with\nhandles at the angle).\nShortcut Alt + 4';

  var brokenBtn = btns.add ('iconbutton', undefined, icoBroken, {style:'button', toggle:true});
      brokenBtn.preferredSize.height = CFG.btnHeight;
      brokenBtn.text = 'Broken ';
      brokenBtn.helpTip = 'Select Broken (Pseudo-Smooth) points\n(with handles at the angle).\nShorcut Alt + 5';

  var flatBtn = btns.add('iconbutton', undefined, icoFlat, {style:'button', toggle:true});
      flatBtn.preferredSize.height = CFG.btnHeight;
      flatBtn.text = 'Flat      ';
      flatBtn.helpTip = 'Select Flat points on straight paths\n(without handles).\nShorcut Alt + 6';

  // TOLERANCE
  var tolerance = dialog.add('group');
      tolerance.orientation = 'row';
      tolerance.alignChildren = 'left';

  var tolTitle = tolerance.add('statictext', undefined, 'Angle Tolerance, \u00b0');

  var tolValue = tolerance.add('edittext', undefined, '180');
      tolValue.characters = 4;
      tolValue.helpTip = 'Tolerance angle in degrees\nbetween handles\nfor Corner & Broken points';
      if (winFlickerFix) {
        if (!CFG.isTabRemap) simulateKeyPress('TAB', 7);
      } else {
        tolValue.active = true;
      }

  var isShowBox = dialog.add('checkbox', undefined, 'Hide Bounding Box');
      isShowBox.value = !app.preferences.getBooleanPreference('showBoundingBox');
      isShowBox.helpTip = 'Hide Bounding Box to see\nthe selected points';

  var selPoints = dialog.add('statictext', undefined);
      selPoints.text = 'Selected Points: ' + calcSelectedPoints(selPaths);
      selPoints.justify = 'center';

  var closeBtn = dialog.add('button', undefined, 'Close', { name: 'cancel' });


  var hint = dialog.add('statictext', undefined, 'Quick access with ' + CFG.modKey + ' + 1-6');
      hint.justify = 'center';
      hint.enabled = false;

  var copyright = dialog.add('statictext', undefined, 'Visit Github');
      copyright.justify = 'center';

  // Shortcut listener
  var keysList = new RegExp('^[' + CFG.modKey + '1-6]$', 'i');
  var keys = {};

  // Block size input
  tolValue.addEventListener('keydown', function(kd) {
    if (kd.keyName && kd.keyName.match(CFG.modKey))
      keys[kd.keyName] = true;
    if (keys[CFG.modKey])
      kd.preventDefault(); 
  });

  dialog.addEventListener('keydown', function(kd) {
    var key = kd.keyName;
    if (!key) return; // non-English layout
    if (keysList.test(key)) keys[kd.keyName] = true;
    
    if (keys[CFG.modKey]) {
      for (var k in keys) {
        if (k == 1)  bezierBtn.notify();
        if (k == 2)  orthoBtn.notify();
        if (k == 3)  flushBtn.notify();
        if (k == 4)  cornerBtn.notify();
        if (k == 5)  brokenBtn.notify();
        if (k == 6)  flatBtn.notify();
      }
    }
  });

  dialog.addEventListener('keyup', function(kd) {
    var key = kd.keyName;
    if (key && keysList.test(key)) delete keys[kd.keyName];
  });

  for (var i = 0; i < btns.children.length; i++) {
    btns.children[i].onClick = function () {
      run();
      // Reset button highlight
      var temp = dialog.add('checkbox', undefined, 'checkbox');
      temp.active = true;
      dialog.update();
      temp.remove();
      dialog.update();
    }
  }

  // Update selection after change tolerance angle
  tolValue.onChange = function() {
    this.text = strToAbsNum(this.text, CFG.maxAngle);
    if (this.text * 1 > CFG.maxAngle) this.text = CFG.maxAngle;
    if (brokenBtn.value || cornerBtn.value) run();
  }

  shiftInputNumValue(tolValue, CFG.minAngle, CFG.maxAngle);

  isShowBox.onClick = function () {
    app.executeMenuCommand('AI Bounding Box Toggle');
  }

  closeBtn.onClick = dialog.close;

  copyright.addEventListener('mousedown', function () {
    openURL('https://github.com/creold/');
  });

  // Apply selection at event
  function run() {
    var btnsState = [];
    selection = null;

    for (var i = 0; i < btns.children.length; i++) {
      btnsState.push(btns.children[i].value);
    }

    processPoints(btnsState, selPaths, tolValue.text * 1, CFG.cosTolerance);

    selPoints.text = 'Selected Points: ' + calcSelectedPoints(selPaths);
  }

  /**
  * Use Up / Down arrow keys (+ Shift) for change value
  * @param {object} item - input text field
  * @param {number} min - minimal input value
  * @param {number} min - maximum input value
  */
  function shiftInputNumValue(item, min, max) {
    item.addEventListener('keydown', function (e) {
      var step;
      ScriptUI.environment.keyboardState['shiftKey'] ? step = 10 : step = 1;

      if (e.keyName == 'Down') {
        if (Number(this.text) >= step) {
          this.text = Number(this.text) - step;
          e.preventDefault();
        } else {
          this.text = min;
        }
      }

      if (e.keyName == 'Up') {
        if (Number(this.text) <= max - step) {
          this.text = Number(this.text) + step;
          e.preventDefault();
        } else {
          this.text = max;
        }
      }
    });
  }

  dialog.show();
}

/**
 * Get single items from selection
 * @param {object} collection - set of items
 * @param {array} arr - output array
 */
function getPaths(item, arr) {
  for (var i = 0, iLen = item.length; i < iLen; i++) {
    var currItem = item[i];
    try {
      switch (currItem.typename) {
        case 'GroupItem':
          getPaths(currItem.pageItems, arr);
          break;
        case 'PathItem':
          arr.push(currItem);
          break;
        case 'CompoundPathItem':
          getPaths(currItem.pathItems, arr);
          break;
        default:
          currItem.selected = false;
          break;
      }
    } catch (e) {}
  }
}

/**
 * Calculate the number of selected points
 * @param {array} paths - array of selected paths
 * @return {number} the number of selected points
 */
function calcSelectedPoints(paths) {
  var count = 0;
  for (var i = 0, iLen = paths.length; i < iLen; i++) {
    if (paths[i].pathPoints.length > 1) {
      var points = paths[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        if (points[j].selected == PathPointSelection.ANCHORPOINT) count++;
      }
    }
  }
  return count;
}

/**
 * Simulate keyboard keys on Windows OS via VBScript
 * 
 * This function is in response to a known ScriptUI bug on Windows.
 * Basically, on some Windows Ai versions, when a ScriptUI dialog is
 * presented and the active attribute is set to true on a field, Windows
 * will flash the Windows Explorer app quickly and then bring Ai back
 * in focus with the dialog front and center.
 *
 * @param {String} k - Key to simulate
 * @param {Number} n - Number of times to simulate the keypress
 */
function simulateKeyPress(k, n) {
  if (!/win/i.test($.os)) return false;
  if (!n) n = 1;
  try {
    var f = new File(Folder.temp + '/' + 'SimulateKeyPress.vbs');
    var s = 'Set WshShell = WScript.CreateObject("WScript.Shell")\n';
    while (n--) {
      s += 'WshShell.SendKeys "{' + k.toUpperCase() + '}"\n';
    }
    f.open('w');
    f.write(s);
    f.close();
    f.execute();
  } catch(e) {}
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
 * Get the type of point by her anchor and handles
 * @param {object} point - point on the path
 * @param {number} tolerance - angle tolerance between handles
 * @return {string} point type conditional name
 */
function getPointType(point, tolerance, types) {
  var xArr = [],
      yArr = [];

  with(point) {
    xArr.push(leftDirection[0]);  // left handle
    xArr.push(anchor[0]);         // point
    xArr.push(rightDirection[0]); // right handle
    yArr.push(leftDirection[1]);  // left handle
    yArr.push(anchor[1]);         // point
    yArr.push(rightDirection[1]); // right handle
  }

  var isZeroLHandle = (xArr[0] == xArr[1]) && (yArr[0] == yArr[1]),
      isZeroRHandle = (xArr[1] == xArr[2]) && (yArr[1] == yArr[2]),
      isHorizHandle = (xArr[0] == xArr[1]) && (yArr[0] != yArr[1]),
      isVertHandle = (xArr[0] != xArr[1]) && (yArr[0] == yArr[1]);

  var handlesCos = calcAngleCos(xArr, yArr);

  // Convert Degrees to Radians
  var radians = tolerance * (Math.PI / 180);

  // If cos of angle is -1, then angle is 180 degrees
  if (isZeroLHandle && isZeroRHandle) return types.flat;
  if (isZeroLHandle) return types.lZero;
  if (isZeroRHandle) return types.rZero;
  if (point.pointType === PointType.SMOOTH && Math.round(handlesCos) == -1 && (isHorizHandle || isVertHandle)) return types.ortho;
  if (point.pointType === PointType.SMOOTH && Math.round(handlesCos) == -1) return types.bezier;
  if (handlesCos > Math.cos(radians)) return types.corner;
  if (point.pointType === PointType.CORNER && handlesCos <= Math.cos(radians)) return types.broken;
}

/**
 * Calculate Cos of angle between vectors
 * @param {array} xArr - X-axis coordinates
 * @param {array} yArr - Y-axis coordinates
 * @return {number} the cosine of the angle between the points
 */
function calcAngleCos(xArr, yArr) {
  var leftEdge = Math.sqrt(Math.pow((xArr[0] - xArr[1]), 2) + Math.pow((yArr[0] - yArr[1]), 2)),
      rightEdge = Math.sqrt(Math.pow((xArr[2] - xArr[1]), 2) + Math.pow((yArr[2] - yArr[1]), 2)),
      farEdge = Math.sqrt(Math.pow((xArr[0] - xArr[2]), 2) + Math.pow((yArr[0] - yArr[2]), 2)),
      angleCos = (Math.pow(leftEdge, 2) + Math.pow(rightEdge, 2) - Math.pow(farEdge, 2)) / (2 * leftEdge * rightEdge);
  return angleCos;
}

/**
 * Get coordinates anchor & handles
 * @param {object} p1 - point to the left of the current
 * @param {object} p2 - current point
 * @param {object} p3 - point to the right of the current
 * @param {string} answer - current point type
 * @param {object} types - point type names
 * @return {object} X & Y-axis coordinates
 */
function getCoordinates(p1, p2, p3, answer, types) {
  var xArr = [],
      yArr = [];

  if (answer == types.flat) {
    xArr.push(p1.anchor[0]);
    xArr.push(p2.anchor[0]);
    xArr.push(p3.anchor[0]);

    yArr.push(p1.anchor[1]);
    yArr.push(p2.anchor[1]);
    yArr.push(p3.anchor[1]);
  }

  if (answer == types.lZero) {
    xArr.push(p3.anchor[0]);
    xArr.push(p2.anchor[0]);
    xArr.push(p2.rightDirection[0]);

    yArr.push(p3.anchor[1]);
    yArr.push(p2.anchor[1]);
    yArr.push(p2.rightDirection[1]);
  }

  if (answer == types.rZero) {
    xArr.push(p2.leftDirection[0]);
    xArr.push(p2.anchor[0]);
    xArr.push(p1.anchor[0]);

    yArr.push(p2.leftDirection[1]);
    yArr.push(p2.anchor[1]);
    yArr.push(p1.anchor[1]);
  }
  return { 'x': xArr, 'y': yArr };
}

/**
 * Point types detection and selection
 * @param {boolean} btns - button status
 * @param {array} paths - array of selected paths
 * @param {number} tolerance - angle tolerance
 * @param {number} cosTolerance - cosine angle tolerance
 */
function processPoints(btns, paths, tolerance, cosTolerance) {
  var pTypes = {
    bezier: 'bezier',
    ortho: 'ortho',
    lZero: 'left_zero',
    rZero: 'right_zero',
    corner: 'corner',
    broken: 'broken',
    flat: 'flat'
  };

  for (var i = 0, iLen = paths.length; i < iLen; i++) {
    if (paths[i].pathPoints.length > 1) {
      var points = paths[i].pathPoints;
      for (var j = 0, pLen = points.length; j < pLen; j++) {
        var currPoint = points[j],
            answer = getPointType(currPoint, tolerance, pTypes),
            pointCos = 0,
            pointCosRound = 0,
            coordArr = {},
            xArr = [],
            yArr = [];

        if (paths[i].closed) {
          if (j == 0) {
            coordArr = getCoordinates(points[1], currPoint, points[points.length - 1], answer, pTypes);
            xArr = coordArr.x;
            yArr = coordArr.y;
          }
          if (j == points.length - 1) {
            coordArr = getCoordinates(points[0], currPoint, points[points.length - 2], answer, pTypes);
            xArr = coordArr.x;
            yArr = coordArr.y;
          }
        }

        if (j > 0 && j < points.length - 1) {
          coordArr = getCoordinates(points[j + 1], currPoint, points[j - 1], answer, pTypes);
          xArr = coordArr.x;
          yArr = coordArr.y;
        };

        pointCos = calcAngleCos(xArr, yArr);
        pointCosRound = Math.ceil(pointCos);

        // Bezier Points
        if (btns[0] && (answer == pTypes.bezier || answer == pTypes.ortho)) {
          selectPoint(currPoint);
        }
        // Ortho Points
        if (btns[1] && answer == pTypes.ortho) {
          selectPoint(currPoint);
        }
        // Flush Points
        if (btns[2] && (answer == pTypes.lZero || answer == pTypes.rZero) && (pointCosRound == -1 || pointCos < cosTolerance)) {
          selectPoint(currPoint);
        }
        // Corner Points
        if (btns[3] && (answer == pTypes.flat || answer == pTypes.rZero || answer == pTypes.lZero || answer == pTypes.corner) &&
            pointCosRound !== -1 && (isNaN(pointCos) || pointCos > cosTolerance)) {
          selectPoint(currPoint);
        }
        // Broken Points
        if (btns[4] && answer == pTypes.broken) {
          selectPoint(currPoint);
        }
        // Flat Points
        if (btns[5] && answer == pTypes.flat && (pointCosRound == -1 || pointCos < cosTolerance)) {
          selectPoint(currPoint);
        }
      }
    }
  }

  redraw();
};

/**
 * Select the point
 * @param {object} point - point on the path
 */
function selectPoint(point) {
  point.selected = PathPointSelection.ANCHORPOINT;
}

/**
 * Open link in browser
 * @param {string} url - website adress
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