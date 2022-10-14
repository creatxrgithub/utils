'use strict'

/**
 * npm install fontkit svgpath svg-path-bounds
 *
 * 請自行修改需要的參數，比如：字體名、輸入文件名、輸入的字體文件名及要更改字符與方法等
 *
 * 生成 svg 文件後使用 fontforge 命令行
 * fontforge -lang=ff -c 'Open($1); Generate($2)' "$1" "$2"
 * 或用 fontforge 打開 .svg 文件生成 .ttf 字體就行了
 *
 * 等寬字體都是居中顯示，可以在 fontforge 中作一次性調整
 *
 * 有時不知什麼原因（比如這次添加音樂符號）會造成行間距變得極大
 * 這樣，打開 fontforge 在 menu -> element -> font info -> os/2 -> metrics -> really use typo metrics
 * 勾選後生成字體就可以了
 */

let isATest = false;

const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');
const pathUtil = require('svgpath');
const svgPathBounds = require('svg-path-bounds');


const util = require('util');
let isDebugOn = true;
console.blink = function() { this._stdout.write('\x1b[5m' + util.format.apply(this, arguments) + '\x1b[0m\n'); }; //blink
console.debug = function() { this._stdout.write('\x1b[35m' + util.format.apply(this, arguments) + '\x1b[0m\n'); }; //magenta
console.info = function() { this._stdout.write('\x1b[36m' + util.format.apply(this, arguments) + '\x1b[0m\n'); }; //cyan
console.warn = function() { this._stderr.write('\x1b[33m' + util.format.apply(this, arguments) + '\x1b[0m\n'); }; //yellow
console.error = function() { this._stderr.write('\x1b[31m' + util.format.apply(this, arguments) + '\x1b[0m\n'); }; //red



/* configration area begin */
let outputDir = '/home/creatxr/Documents';

let unitsPerEmBase = 2048;
let isMonoFont = true;
//let unitsPerEmBaseHalf = isMonoFont ? unitsPerEmBase/2 : 0;  //漢字寬的一半 1024 或 自適應 0
//'CREATXR_MING_MONO_思文明體等寬' : 'CREATXR_MING_思文明體'
/**
 * @defFontName: a ASCII string without whitespace characters and less than 64 chars
 */
let defFontName = isMonoFont ? 'CREATXR_MING_MONO_COMUSIC' : 'CREATXR_MING'  ;
let defFontVersion = '800';  //i.ming + tlwg mono
let maxGlyphNum = 65533;  //字形總數不能超過 65535 需減去自行增加的字形數
//maxGlyphNum = 65000;

let svgString='';
let missingUnicode = [];  //暫存基準字體中缺失的字符，隨後在其他字體中提取
/**
 * define unicode ranges
 */
let ranges = [
//	{start:0x0300, end:0x036F},  //Combining Diacritical Marks (Range: 0300—036F Quantity of characters: 112)
//	{start:32, end:255},  // 32 = 0x20 是空格，應佔半個字符 unitsPerEmBase/2
	{start:33, end:255},
	{start:0x2F00, end:0x2FD5},  //康熙部首
	{start:0x2E80, end:0x2EF3},  //部首擴展
	{start:0xF900, end:0xFAD9},  //兼容漢字
	{start:0x2F800, end:0x2FA1D},  //兼容擴展
	{start:0xE815, end:0xE86F},  //PUA(GBK)部件
	{start:0xE400, end:0xE5E8},  //部件擴展
	{start:0xE600, end:0xE6CF},  //PUA增補
	{start:0x31C0, end:0x31E3},  //漢字筆畫
	{start:0x2FF0, end:0x2FFB},  //漢字结构
	{start:0x3105, end:0x312F},  //漢語注音
	{start:0x31A0, end:0x31BA},  //注音擴展
	{start:0x3007, end:0x3007},  //〇
	{start:0x4E00, end:0x9FA5},  //基本漢字
	{start:0x9FA6, end:0x9FEF},  //基本漢字補充
	{start:0x3400, end:0x4DB5},  //擴展A
	{start:0x20000, end:0x2A6D6},  //擴展B
	{start:0x2A700, end:0x2B734},  //擴展C
	{start:0x2B740, end:0x2B81D},  //擴展D
	{start:0x2B820, end:0x2CEA1},  //擴展E
	{start:0x2CEB0, end:0x2EBE0},  //擴展F

];

if (isATest) ranges = [ {start:0x3007, end:0x3007} ];  //only for test use



/**
 * config your fonts here
 */
let fontCreatxrOldMono = '/media/creatxr/DATAL/SOFTS/fonts/CREATXR_MING_MONO_701_LeagueMono-CondensedLight.ttf';
let fontCreatxrOldRegular = '/media/creatxr/DATAL/SOFTS/fonts/CREATXR_MING_701_segoeuil.ttf';
let fontCreatxrOld = isMonoFont ? fontCreatxrOldMono : fontCreatxrOldRegular;
let fontMing = '/media/creatxr/DATAL/SOFTS/fonts/I.MingCP-8.00.ttf';
let fontHanaMinA = '/media/creatxr/DATAL/SOFTS/fonts/HanaMinA.ttf';
let fontHanaMinB = '/media/creatxr/DATAL/SOFTS/fonts/HanaMinB.ttf';
let fontKaiXinSong = '/media/creatxr/DATAL/SOFTS/fonts/KaiXinSong.ttf';
let fontNumAlphabet = '/media/creatxr/WORK/DEV/webapp.bak/fonts/segoeuil.ttf';  //for min space
/** 這個較好 https://www.theleagueofmoveabletype.com/league-mono 等寬的字體要粗些，否則顯得太疏。*/
/** 通過放縮得來的數字及字母效果不好，所以選了個不用放縮的字體。 */
let fontMono = '/media/creatxr/DATAL/SOFTS/fonts/LeagueMono-2.220/static/TTF/LeagueMono-CondensedUltraLight.ttf';
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/LeagueMono-2.220/static/TTF/LeagueMono-CondensedThin.ttf';
//再更改則基於這個版本，已作過居中調整的
fontMono = fontCreatxrOldMono;
//Combining Diacritical Marks (Range: 0300—036F Quantity of characters: 112)
let fontCombiningMarks = '/usr/share/fonts/truetype/freefont/FreeMono.ttf';
fontCombiningMarks = fontMing;



/**
 * {
 *   base: string, base font for 1:1 copy glyph.
 *   ext: [string], ext fonts for 1:1 copy glyph.
 *   adjustive: transform glyph from other font, then replace or add to the same unicode's glyph.
 *   [
 *     {
 *       fontName: string,
 *       get horizAdvX () => {return val} : null or undefined or property of integer , e.g. 2048/2 for ascii number
 *       chars: property or value of a string or char's array, e.g. get chars() { return string }
 *     }
 *   ],
 *   alternative: transform other unicode's glyph to replace or add to specifyed unicode's glyph.
 *   [
 *     {
 *       fontName: string,
 *       charsFrom: '﹨', property or value of a string or char's array
 *       charsTo: '／', property or value of a string or char's array which's length equal "charsFrom"
 *       rotate: integer angle between 0~360,
 *       mirrorX: boolean,
 *       mirrorY: boolean
 *     }
 *   ]
 * }
 */
/**
 * @typedef {Object} fonts
 * @property {String} fonts.base
 * @property {Array Of String} fonts.ext
 * @property {Array Of Object} fonts.adjustive
 * @property {Array Of Object} fonts.alternative
 */
let fonts = {
	/**
	 * @param base: font_name_string
	 */
	base: fontMing,  //1:1 copy
	/**
	 * @param ext: array_font_name_string
	 */
	ext: [  //choose ext's font's unitsPerEm == base's font's unitsPerEm for 1:1 copy 一比一復制
		fontHanaMinA,
		fontHanaMinB,
		fontKaiXinSong,
		//fontCombiningMarks
	],  ///maybe require large heap size: node --max-old-space-size=8192 fontCustomize.js
	/**
	 * adjustive: array_of_chars_to_change_glyph
	 */
	adjustive: [  //will scale the glyph
		/**
		 * replace or add glyph after transform
		 * @fontName: font's name string
		 * @chars: iterable collection of chars: string, array of chars, readable propery of strings or array
		 * @horizAdvX:
		 *     >0: set rounded up integer multiphles of mono width of glyph; 向上取整數倍的半角寬度 Math.ceil()
		 *         property to dynamic calcute width
		 *     <0: auto set real width of glyph;
		 *     =0: set glyph's width 0
		 */
		{
			//fontName: '../fonts/HanaMinA.ttf',
			fontName: fontCreatxrOld,
			//chars: '☉「」『』'
			chars: '☉'
		},

		{
			//fontName: '../fonts/HanaMinA.ttf',
			fontName: fontCreatxrOld,
			//由於一點明體有1-10與11-50的大小不一，所以更改。
			//黑底白字的未改❶❷❸❹❺❻❼❽❾❿➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
			//白底黑字的將➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴字體大小統一，小號的不改
			chars: '➀➁➂➃➄➅➆➇➈➉⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿'
		},

//* 舊自用的版本已有，選用正確的 fontCreatxrOld
		{
			//改用等寬字體
			//fontName: fontMono,
			fontName: fontCreatxrOld,
			//horizAdvX: isMonoFont ? unitsPerEmBaseHalf : -1,  //set a value of <0 to auto calculate glyph's width
			get horizAdvX() {
				return isMonoFont ? unitsPerEmBase/2 : -1
			},
			//半角字符源自某種纖細的黑體
			//空格也要改
			//chars: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƒǺǻǼǽǾǿȘșȚțˆˇˉ˘˙˚˛˜˝;΄΅Ά·ΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћќѝўџѲѳҐґẀẁẂẃẄẅỲỳ‐‑–—―‗‘’‚‛“”„†‡•…‰′″‹›‼‾⁄ⁿ₣₤₧€℅ℓ№™Ω℮⅛⅜⅝⅞←↑→↓↔↕↨∂∆∏∑−∕∙√∞∟∩∫≈≠≡≤≥⌂⌐⌠⌡─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬▀▄█▌▐░▒▓■□▪▫▬▲►▼◄◊○●◘◙◦☺☻☼♀♂♠♣♥♦♪♫♬ﬁﬂ',
			chars: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'
		},
//*/
		{
			fontName: fontCreatxrOld,
			//源自開心宋體
			chars: '﹐﹑﹔﹕﹖﹗﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫'
		},

		{
			fontName: fontCreatxrOld,
			chars: '。，、。；：？！（）｛｝〔〕＃＆＊＋－＜＞＝＼＄％＠《》〈〉／［］「」『』‘’“”气磙碌'
		},

		{
			fontName: fontCreatxrOld,
			chars: '◯☯⚊⚋⚌⚍⚎⚏☰☱☲☳☴☵☶☷䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿𝌀𝌁𝌂𝌃𝌄𝌅𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑𝌒𝌓𝌔𝌕𝌖𝌗𝌘𝌙𝌚𝌛𝌜𝌝𝌞𝌟𝌠𝌡𝌢𝌣𝌤𝌥𝌦𝌧𝌨𝌩𝌪𝌫𝌬𝌭𝌮𝌯𝌰𝌱𝌲𝌳𝌴𝌵𝌶𝌷𝌸𝌹𝌺𝌻𝌼𝌽𝌾𝌿𝍀𝍁𝍂𝍃𝍄𝍅𝍆𝍇𝍈𝍉𝍊𝍋𝍌𝍍𝍎𝍏𝍐𝍑𝍒𝍓𝍔𝍕𝍖○ㄨ礻㗰𠳝'
			//'◯☯⚊⚋⚌⚍⚎⚏☰☱☲☳☴☵☶☷䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿𝌀𝌁𝌂𝌃𝌄𝌅𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑𝌒𝌓𝌔𝌕𝌖𝌗𝌘𝌙𝌚𝌛𝌜𝌝𝌞𝌟𝌠𝌡𝌢𝌣𝌤𝌥𝌦𝌧𝌨𝌩𝌪𝌫𝌬𝌭𝌮𝌯𝌰𝌱𝌲𝌳𝌴𝌵𝌶𝌷𝌸𝌹𝌺𝌻𝌼𝌽𝌾𝌿𝍀𝍁𝍂𝍃𝍄𝍅𝍆𝍇𝍈𝍉𝍊𝍋𝍌𝍍𝍎𝍏𝍐𝍑𝍒𝍓𝍔𝍕𝍖○ㄨ
		},
/*
		{
			fontName: '../fonts/HanaMinB.ttf',
			chars: '𣲖'
		},
*/

		//*
		{
			// Combining Diacritical Marks (Range: 0300—036F Quantity of characters: 112)
			fontName: fontCombiningMarks,
			horizAdvX: 0,  //附加符號的字寬是 0
			//屏蔽差異以便外部以同樣的形式調用，從而達到封裝的目的，以下兩種方法：
			//chars: () => { return 'value'; }  //failed
			///chars: (()=>{ let ret = []; for (let i=0x0300; i<=0x036F; i++) ret.push(String.fromCodePoint(i)); return ret; })()  //success：(()=>{/**function body*/ return 'value'; })()
			//或
			get chars() {  //success and clear
				let ret = []; for (let i=0x0300; i<=0x036F; i++) ret.push(String.fromCodePoint(i));
				return ret;
				}
		},
		//*/

		{
			//Musical Symbols'range 0x1D000~0x1D1FF
			//fontName: '/media/creatxr/DATAL/SOFTS/fonts/NotoMusic-Regular.ttf',
			fontName: '/home/creatxr/Documents/CREATXR_MING_MONO_COMUSIC.ttf',
			//horizAdvX: unitsPerEmBaseHalf,  //1024
			//由於在後邊 unitsPerEmBase 有重新賦値，可能導致 unitsPerEmBaseHalf 在配置中的值不適當應當動態計算
			get horizAdvX() {
				return unitsPerEmBase/2;
			},
			get chars() {
				let ret = ''
				ret += String.fromCodePoint(0x25CC);  //dotted circle
				for (let i=0x2669; i<=0x266F; i++) ret += String.fromCodePoint(i);
				for (let i=0x1D000; i<=0x1D1FF; i++) ret += String.fromCodePoint(i);
				return ret;
			}
		},

		//*
		{
			fontName: fontCreatxrOld,
			//chars: '旣卽' // 源自開心宋體
			chars: ''  //「」字，在 ctext.org 中檢測爲自定義字符，當用「䥇」
		}
		//*/
	],

	alternative: [  //will transformer the glyph: scale, rotate, etc.
		{
			//fontName: '/media/creatxr/DATAL/SOFTS/fonts/KaiXinSong.ttf',
			fontName: fontKaiXinSong,
			charsFrom: '﹨',
			charsTo: '／',
			rotate: 0,
			mirrorX: false,
			mirrorY: true,
		}  /*,

		{
			fontName: fontKaiXinSong,
			charsFrom: '﹤﹥',
			charsTo: '＜＞',
			rotate: 0,
			mirrorX: false,
			mirrorY: false,
		},
		*/
	]
};


/* configration area end */



/* common function area begin */

function isNullOrUndefined(obj) {
	if (obj == null) return true;
	if (obj == undefined) return true;
	return false;
}

function matrixMirrorX(d) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).translate(0,-bottom-top).scale(1,-1).rel().round(3).toString();
}

function matrixMirrorY(d) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).translate(-right-left,0).scale(-1,1).rel().round(3).toString();
}

//二半角等於一全角，卽可對齊中文與字母，直接設一個屬性 horiz-adv-x
//效果在 LibreOffice 中正常，但在 Geany 中不行，已向作者報吿，等待最新版更改。
function matrixScaleWidth(d, percent) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).scale(percent,1).rel().round(3).toString();  ///TODO:
}

/* common function area end */


/* process code area begin */


/*這樣保證總字形不多于 65535*/
//*
for (let o of fonts.adjustive) {
	maxGlyphNum -= o.chars.length;
}
for (let o of fonts.alternative) {
	maxGlyphNum -= o.charsFrom.length;
}
//console.log(Object.entries(fonts.adjustive).length);





let fontSet = new Set();
fontSet.add(fonts.base);
for (let iFont of fonts.ext) {
	fontSet.add(iFont);
}
for (let iFont of fonts.adjustive) {
	fontSet.add(iFont.fontName);
}
for (let iFont of fonts.alternative) {
	fontSet.add(iFont.fontName);
}
let copyright = '';
for (let iFont of fontSet) {
	let font = fontkit.openSync(iFont);
	copyright += `\n\n${font.copyright}`;
	console.log(iFont);
	console.log(font.copyright);
}

console.log(fontSet);
console.log(copyright);
//process.exit(0);


if (fonts.base!=null) {

	let font = fontkit.openSync(fonts.base);
	unitsPerEmBase = font.unitsPerEm;
	//font-family 的值不能有空格
	let fontFace = `
		<font-face
			font-family="${defFontName}_${defFontVersion}"
			font-weight="400"
			font-stretch="normal"
			units-per-em="${font.unitsPerEm}"
			panose-1="2 2 4 0 0 0 0 0 0 0"
			ascent="${font.ascent}"
			descent="${font.descent}"
			x-height="${font.xHeight}"
			cap-height="${font.capHeight}"
			bbox="${font.bbox.minX} ${font.bbox.minY} ${font.bbox.maxX} ${font.bbox.maxY}"
			underline-thickness="${font.underlineThickness}"
			underline-position="${font.underlinePosition}"
			unicode-range="U+000D-U+2EBE0"
		  />
	`;  //更名可以加在 font-family 不能有空格


	console.log(fontFace);
	console.log(font.numGlyphs);
	console.log(font.familyName);
	console.log(font.postscriptName);


	let curTime = new Date();

	svgString = `<?xml version="1.0" standalone="no"?>
	<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	<metadata>
	${copyright}
	Created by nodejs + fontkit at ${curTime.getFullYear()}-${curTime.getMonth()}-${curTime.getDate()} ${curTime.getHours()}:${curTime.getMinutes()}:${curTime.getSeconds()}
	By CREATXR,,,
	</metadata>
	<defs>
	<font id="${defFontName}" horiz-adv-x="${unitsPerEmBase}" >
		${fontFace}
	<missing-glyph
	d="M1843 -205h-1638v1966h1638v-1966zM1669 1655h-1288l645 -793zM1737 -16v1585l-643 -793zM957 776l-646 797v-1591zM1667 -98l-641 790l-643 -790h1284z" />
	<glyph glyph-name="&#x20;" unicode="&#x20;" d="" horiz-adv-x="${unitsPerEmBase/2}"/>
	`;

	for (let range of ranges) {
		if (maxGlyphNum==0) break;
		for (let unicode=range.start; unicode<=range.end; unicode++) {
			if (maxGlyphNum==0) break;
			if (font.hasGlyphForCodePoint(unicode)) {
				let glyph = font.glyphForCodePoint(unicode);
				let unicodeStr = unicode.toString(16).toUpperCase();
				if (font.unitsPerEm===glyph.advanceWidth) {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" />\n`);
				} else {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" horiz-adv-x="${glyph.advanceWidth}"/>\n`);
				}
				maxGlyphNum--;
			} else {
				missingUnicode.push(unicode);
			}
		}
	}

} else {
	console.log('base font is not specified.');
	process.exit(0);
}


console.log('ext fonts begin ......');

if (fonts.ext.length>0 && missingUnicode.length>0) {
	for (let i=0; i<fonts.ext.length; i++) {
		if (maxGlyphNum==0) break;
		let extFont = fontkit.openSync(fonts.ext[i]);
		let scaleMultiple = unitsPerEmBase/extFont.unitsPerEm;
		for (let i=0; i<missingUnicode.length; i++) {
			if (maxGlyphNum==0) break;
			if (missingUnicode[i]==null) continue;
			let unicodeStr = missingUnicode[i].toString(16).toUpperCase();
			if (extFont.hasGlyphForCodePoint(missingUnicode[i])) {
				let glyph = extFont.glyphForCodePoint(missingUnicode[i]);
				let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
				if (extFont.unitsPerEm===glyph.advanceWidth) {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`);
				} else {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`);
				}
				missingUnicode[i] = null;
				maxGlyphNum--;
			}
		}
	}
}


console.log('adjustive begin ......');

for (let i=0; i<fonts.adjustive.length; i++) {
	let adjustFont = fontkit.openSync(fonts.adjustive[i].fontName);
	//目標字體默認寬度/源字體默認寬度
	let scaleMultiple = unitsPerEmBase / adjustFont.unitsPerEm;
	console.log(fonts.adjustive[i].chars);
	for (let o of fonts.adjustive[i].chars) {
		let unicode = o.codePointAt(0);
		let unicodeStr = unicode.toString(16).toUpperCase();
		console.info(' ' + o + `0x${unicodeStr};`);
		if (!adjustFont.hasGlyphForCodePoint(unicode)) continue;
		let glyph = adjustFont.glyphForCodePoint(unicode);
		if(isDebugOn) console.debug(glyph.path.toSVG());
		if (glyph.path.toSVG().trim() === '') continue;  //空白字串會引發異常，有些字符有佔位但無字形
		/*
		pseudocode 僞碼:
			新字形的輪廓 = 源字形的輪廓根據比例縮放
			if 目標字體是等寬字體 then
				目標字形的佔用寬度 = 源字體佔寬的默認值 adjustFont.unitsPerEm * 縮放比
				//目標字形的佔用寬度 = 目標字體佔寬的默認值 unitsPerEmBase
				if 配置中有指定寬度 then
					目標字形的佔用寬度 = 配置中指定的寬度 fonts.adjustive[i].horizAdvX
				//if 目標字體佔寬的默認值 unitsPerEmBase != 源字體佔寬的默認值  //因字形有縮放，重新計算字寬
					//目標字形的佔用寬度 = 向上取整(源字形實際寬度/(源字體基準寬度/2))*半角寬度
				if 計算向上取整(源字形實際寬度/(源字體基準寬度/2))*半角寬度 > 目標字形的佔用寬度 then
					目標字形的佔用寬度 = 計算而得的目標字形的佔用寬度
				新字形 = <glyph glyph-name="unicode" unicode="unicode" d="新字形的輪廓" horiz-adv-x="目標字形的佔用寬度" />
			else
				if 配置中沒有預設的寬度，卽 fonts.adjustive[i].horizAdvX 爲空、未定義、非數值、小於零 then
					目標字形的佔用寬度 = 自適應，根據字形實際佔用的寬度得來
					新字形 = 同上
				else if 配置中預設的寬度爲零 then
					新字形 = <glyph glyph-name="unicode" unicode="unicode" d="新字形的輪廓" horiz-adv-x="0" />
				else 配置中預設的寬度大於零 then
					新字形 = <glyph glyph-name="unicode" unicode="unicode" d="新字形的輪廓" horiz-adv-x="配置中的寬度" />
		 */
		let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple, scaleMultiple);
		//字母數字轉半角寬度的變換的效果不理想，最好找合適的，比如 LeagueMono-CondensedThin.ttf 可以直接復製過去
		let newSvg = '';
		 if (isMonoFont) {
			//console.blink(scaleMultiple);
			let horizAdvXAdjusted = adjustFont.unitsPerEm * scaleMultiple;
			//let horizAdvXAdjusted = unitsPerEmBase;
			//半角字符要在配置中明確設置基本寬度
			if (!isNullOrUndefined(fonts.adjustive[i].horizAdvX) && !Number.isNaN(fonts.adjustive[i].horizAdvX)) {
				horizAdvXAdjusted = fonts.adjustive[i].horizAdvX;
			}
			/*
			if (horizAdvXAdjusted != adjustFont.unitsPerEm) {
				let [left, top, right, bottom] = svgPathBounds(glyph.path.toSVG());
				horizAdvXAdjusted = (unitsPerEmBase/2) * Math.ceil((right-left)/(adjustFont.unitsPerEm/2));
			}
			*/
			let [left, top, right, bottom] = svgPathBounds(glyph.path.toSVG());
			let  horizAdvXRecommaned = (unitsPerEmBase/2) * Math.ceil((right-left)/(adjustFont.unitsPerEm/2));
			if (horizAdvXRecommaned > horizAdvXAdjusted) {
				horizAdvXAdjusted = horizAdvXRecommaned;
			}
			newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${horizAdvXAdjusted}"/>\n`;
		 } else {
			if (isNullOrUndefined(fonts.adjustive[i].horizAdvX) || Number.isNaN(fonts.adjustive[i].horizAdvX) || fonts.adjustive[i].horizAdvX<0) {
				let [left, top, right, bottom] = svgPathBounds(adjusted.toString());
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${right-left+200}"/>\n`;
			} else if (fonts.adjustive[i].horizAdvX===0) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="0"/>\n`;
			} else {  //fonts.adjustive[i].horizAdvX>0
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}
		 }
		let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
		let regexp = new RegExp(pattern, 'g');
		if (svgString.match(regexp)!=null) {
			svgString = svgString.replace(regexp, newSvg);
		} else {
			svgString = svgString.concat(newSvg);
			maxGlyphNum--;
		}
	}
}

console.log('alternative begin ......');

for (let i=0; i<fonts.alternative.length; i++) {
	let ooFrom = [];
	let ooTo = [];
	for (let o of fonts.alternative[i].charsFrom) ooFrom.push(o);
	for (let o of fonts.alternative[i].charsTo) ooTo.push(o);
	if (ooFrom.length!=ooTo.length) {
		continue;
	}
	let adjustFont = fontkit.openSync(fonts.alternative[i].fontName);
	let scaleMultiple = unitsPerEmBase / adjustFont.unitsPerEm;
	for (let j=0; j<ooFrom.length; j++) {
		let unicode = ooFrom[j].codePointAt(0);
		let unicodeStr = ooTo[j].codePointAt(0).toString(16).toUpperCase();
		if (adjustFont.hasGlyphForCodePoint(unicode)) {
			let glyph = adjustFont.glyphForCodePoint(unicode);
			if (glyph.path.toSVG().trim() === '') continue;
			//some glyphs have a zero length string, will cause error in next step. eg. scale
			let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
			if (!Number.isNaN(fonts.alternative[i]?.rotate) && fonts.alternative[i]?.rotate!=0) adjusted = pathUtil(adjusted).rotate(fonts.alternative[i].rotate);
			if (fonts.alternative[i]?.mirrorX==true) adjusted = matrixMirrorX(adjusted.toString());
			if (fonts.alternative[i]?.mirrorY==true) adjusted = matrixMirrorY(adjusted.toString());
			let newSvg = '';
			if (adjustFont.unitsPerEm===glyph.advanceWidth) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`;
			} else {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}

			let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
			let regexp = new RegExp(pattern, 'g');
			if (svgString.match(regexp)!=null) {
				svgString = svgString.replace(regexp, newSvg);
			} else {
				svgString = svgString.concat(newSvg);
				maxGlyphNum--;
			}
		}
	}
}


svgString = svgString.concat(`</font></defs></svg>`);

console.log(maxGlyphNum);



let outputFileName = path.join(outputDir, `${defFontName}_${defFontVersion}.svg`);
fs.writeFileSync(outputFileName,'');
console.log(outputFileName);
let wstream = fs.createWriteStream(outputFileName, {flags:'as+'});
wstream.write(svgString);
wstream.end();

/* process code area end */
